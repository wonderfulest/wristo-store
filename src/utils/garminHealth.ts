import type { GarminSummary } from "../api/garmin";

export const healthTypes = [
  "dailies",
  "sleeps",
  "hrv",
  "stressDetails",
  "activities",
  "bodyComps",
  "hydration",
  "activityDetails",
] as const;
export type HealthType = (typeof healthTypes)[number];
export type HealthRecords = Record<HealthType, GarminSummary[]>;
export type Metric = "steps" | "sleep" | "heart" | "hrv";
export const emptyHealthRecords = (): HealthRecords => ({
  dailies: [],
  sleeps: [],
  hrv: [],
  stressDetails: [],
  activities: [],
  bodyComps: [],
  hydration: [],
  activityDetails: [],
});

// Do not coerce null, empty strings or booleans to valid zero measurements.
export function numeric(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function shiftDate(key: string, offset: number): string {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return dateKey(date);
}
export function recordDate(record: GarminSummary): string | null {
  if (
    typeof record.calendarDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.calendarDate)
  )
    return record.calendarDate;
  const start =
    numeric(record.startTimeInSeconds) ??
    numeric(record.measurementTimeInSeconds);
  if (start === null) return null;
  const offset =
    typeof record.startTimeOffsetInSeconds === "number" &&
    Number.isFinite(record.startTimeOffsetInSeconds)
      ? record.startTimeOffsetInSeconds
      : 0;
  const date = new Date((start + offset) * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}
export function latestForDay(
  records: GarminSummary[],
  day: string,
): GarminSummary {
  // Daily summaries are snapshots; adding them together double-counts a day's totals.
  return (
    records
      .filter((record) => recordDate(record) === day)
      .sort(
        (a, b) =>
          (numeric(b.startTimeInSeconds) ?? 0) +
          (numeric(b.durationInSeconds) ?? 0) -
          ((numeric(a.startTimeInSeconds) ?? 0) +
            (numeric(a.durationInSeconds) ?? 0)),
      )[0] ?? {}
  );
}
export function dayMetrics(records: HealthRecords, day: string) {
  const daily = latestForDay(records.dailies, day);
  const sleep = latestForDay(records.sleeps, day);
  const hrv = latestForDay(records.hrv, day);
  const body = latestForDay(records.bodyComps, day);
  const water = latestForDay(records.hydration, day);
  const seconds = numeric(sleep.durationInSeconds); // Garmin sleep summary duration, never inferred from time in bed.
  return {
    steps: numeric(daily.steps),
    goal: numeric(daily.stepsGoal),
    distance: numeric(daily.distanceInMeters),
    calories: numeric(daily.activeKilocalories),
    heart: numeric(daily.restingHeartRateInBeatsPerMinute),
    sleep: seconds === null ? null : seconds / 3600,
    hrv: numeric(hrv.lastNightAvg),
    stages: [
      numeric(sleep.deepSleepDurationInSeconds),
      numeric(sleep.lightSleepDurationInSeconds),
      numeric(sleep.remSleepInSeconds),
      numeric(sleep.awakeDurationInSeconds),
    ],
    weight:
      numeric(body.weightInGrams) === null
        ? null
        : (body.weightInGrams as number) / 1000,
    water: numeric(water.totalFluidIntakeInMilliliters),
    waterGoal: numeric(water.goalInMilliliters),
  };
}
export function trend(
  records: HealthRecords,
  end: string,
  days: number,
  metric: Metric,
) {
  return Array.from({ length: days }, (_, i) => {
    const day = shiftDate(end, i - days + 1);
    return { day, value: dayMetrics(records, day)[metric] };
  });
}
export function average(values: (number | null)[]): number | null {
  const valid = values.filter((value): value is number => value !== null);
  return valid.length
    ? valid.reduce((sum, value) => sum + value, 0) / valid.length
    : null;
}
export function batterySeries(records: GarminSummary[], day: string) {
  const points = new Map<number, number>();
  for (const record of [...records].reverse()) {
    if (recordDate(record) !== day) continue;
    const values = record.timeOffsetBodyBatteryValues;
    const start = numeric(record.startTimeInSeconds);
    if (
      !values ||
      typeof values !== "object" ||
      Array.isArray(values) ||
      start === null
    )
      continue;
    for (const [offset, value] of Object.entries(values)) {
      const n = numeric(value);
      if (n !== null && n <= 100 && /^\d+$/.test(offset))
        points.set(start + Number(offset), n);
    }
  }
  return [...points]
    .sort(([a], [b]) => a - b)
    .map(([time, value]) => ({ time, value }));
}
export function routePoints(detail: GarminSummary): string | null {
  if (!Array.isArray(detail.samples)) return null;
  const coordinates = detail.samples
    .map((sample) => {
      if (!sample || typeof sample !== "object") return null;
      const { latitudeInDegree: lat, longitudeInDegree: lon } = sample;
      return typeof lat === "number" &&
        typeof lon === "number" &&
        Number.isFinite(lat) &&
        Number.isFinite(lon) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lon) <= 180
        ? [lon, lat]
        : null;
    })
    .filter((point): point is number[] => point !== null);
  if (coordinates.length < 2) return null;
  const xs = coordinates.map((p) => p[0]),
    ys = coordinates.map((p) => p[1]);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const cos = Math.max(0.01, Math.cos((((minY + maxY) / 2) * Math.PI) / 180));
  const width = (maxX - minX) * cos,
    height = maxY - minY;
  if (width === 0 && height === 0) return null;
  const scale = Math.min(350 / (width || 0.00001), 110 / (height || 0.00001));
  return coordinates
    .map(
      ([x, y]) =>
        `${(220 + ((x - minX) * cos - width / 2) * scale).toFixed(2)},${(80 - (y - minY - height / 2) * scale).toFixed(2)}`,
    )
    .join(" ");
}
