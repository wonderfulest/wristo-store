import test from "node:test";
import assert from "node:assert/strict";
import {
  average,
  batterySeries,
  dayMetrics,
  emptyHealthRecords,
  numeric,
  recordDate,
  routePoints,
  shiftDate,
  trend,
} from "../../src/utils/garminHealth.ts";
test("missing measurements never become zero; real zero counts in averages", () => {
  for (const value of [null, undefined, "", "0", false, NaN, Infinity, -1])
    assert.equal(numeric(value), null);
  assert.equal(numeric(0), 0);
  assert.equal(average([null, 0, 10]), 5);
  assert.equal(average([null]), null);
});
test("dates use calendar date or Garmin UTC offset, including negative offsets", () => {
  assert.equal(
    recordDate({ calendarDate: "2026-11-10", startTimeInSeconds: 0 }),
    "2026-11-10",
  );
  assert.equal(
    recordDate({
      startTimeInSeconds: Date.parse("2026-11-10T02:00:00Z") / 1000,
      startTimeOffsetInSeconds: -18000,
    }),
    "2026-11-09",
  );
  assert.equal(recordDate({}), null);
  assert.equal(shiftDate("2026-03-01", -1), "2026-02-28");
});
test("daily snapshots are not added; trends retain missing days", () => {
  const records = emptyHealthRecords();
  records.dailies = [
    {
      calendarDate: "2026-11-10",
      startTimeInSeconds: 1,
      durationInSeconds: 100,
      steps: 100,
    },
    {
      calendarDate: "2026-11-10",
      startTimeInSeconds: 1,
      durationInSeconds: 200,
      steps: 240,
      stepsGoal: 500,
    },
    { calendarDate: "2026-11-08", steps: 0 },
  ];
  assert.equal(dayMetrics(records, "2026-11-10").steps, 240);
  assert.equal(dayMetrics(records, "2026-11-10").goal, 500);
  assert.deepEqual(
    trend(records, "2026-11-10", 3, "steps").map((p) => p.value),
    [0, null, 240],
  );
  assert.equal(dayMetrics(records, "2026-11-10").sleep, null);
});
test("sleep, HRV and weight use their own summaries and units", () => {
  const records = emptyHealthRecords();
  records.sleeps = [
    {
      calendarDate: "2026-11-10",
      durationInSeconds: 27720,
      deepSleepDurationInSeconds: 3600,
    },
  ];
  records.hrv = [{ calendarDate: "2026-11-10", lastNightAvg: 48 }];
  records.bodyComps = [{ calendarDate: "2026-11-10", weightInGrams: 68400 }];
  const day = dayMetrics(records, "2026-11-10");
  assert.equal(day.sleep, 7.7);
  assert.equal(day.hrv, 48);
  assert.equal(day.weight, 68.4);
});
test("battery filters invalid readings and orders timestamps, without treating charged amount as level", () => {
  const values = batterySeries(
    [
      {
        calendarDate: "2026-11-10",
        startTimeInSeconds: 100,
        timeOffsetBodyBatteryValues: {
          60: 50,
          0: 0,
          120: -1,
          180: 101,
          240: null,
        },
      },
    ],
    "2026-11-10",
  );
  assert.deepEqual(values, [
    { time: 100, value: 0 },
    { time: 160, value: 50 },
  ]);
  assert.deepEqual(
    batterySeries(
      [{ calendarDate: "2026-11-10", bodyBatteryChargedValue: 50 }],
      "2026-11-10",
    ),
    [],
  );
});
test("GPS requires real valid coordinates and handles western/southern hemispheres", () => {
  assert.equal(
    routePoints({
      samples: [{ latitudeInDegree: null, longitudeInDegree: 0 }],
    }),
    null,
  );
  assert.equal(routePoints({}), null);
  assert.match(
    routePoints({
      samples: [
        { latitudeInDegree: -33, longitudeInDegree: -70 },
        { latitudeInDegree: -33.01, longitudeInDegree: -70.01 },
      ],
    }),
    /^\d/,
  );
});
