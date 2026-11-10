<template>
  <div class="health-page">
    <main class="health-main" :aria-busy="loading">
      <section class="intro">
        <div>
          <div class="eyebrow">
            {{ t("A LITTLE MORE IN TUNE WITH YOU", "更了解自己一点") }}
          </div>
          <h1>
            {{ t("Your health", "你的健康")
            }}<span v-if="name">, {{ name }}</span
            >.
          </h1>
          <p>
            {{
              t(
                "Your health, in perspective. One day at a time.",
                "看见身体的变化，找到自己的节奏。",
              )
            }}
          </p>
        </div>
        <div class="connection">
          <strong
            ><span class="dot"></span
            >{{
              connected
                ? t("Garmin connected", "Garmin 已连接")
                : t("Garmin not connected", "Garmin 未连接")
            }}</strong
          >
          <p v-if="loadedAt">
            {{ t("Records read", "记录读取于") }} · {{ loadedAt }}
          </p>
          <button
            @click="showConnection = !showConnection"
            :aria-expanded="showConnection"
          >
            {{ t("Manage connection", "管理连接") }}
          </button>
        </div>
      </section>
      <div v-show="showConnection" class="manage">
        <GarminConnectionCard hide-data-link @status="onStatus" />
      </div>
      <div v-if="!connected" class="status-banner" role="status">
        {{
          t(
            "Connect Garmin to see your activity, sleep and daily health here.",
            "连接 Garmin，在这里查看运动、睡眠和每日健康数据。",
          )
        }}
        <button @click="showConnection = true">
          {{ t("Manage connection →", "管理连接 →") }}
        </button>
      </div>
      <div v-if="failed.length" class="status-banner" role="alert">
        {{ t("Some data could not be loaded:", "部分数据读取失败：") }}
        {{ failed.join(" · ") }}
        <button @click="loadRecords" :disabled="loading">
          {{ t("Retry", "重试") }}
        </button>
      </div>
      <div
        v-if="connected"
        class="status-banner"
        role="status"
      >
        {{
          t(
            "If no data appears after connecting, open the Garmin Connect app on your phone and sync your watch. Once syncing is complete, return here and refresh. Data may take a little time to appear.",
            "绑定成功后，如果这里暂无数据，请打开手机上的 Garmin Connect App，同步手表数据。同步完成后返回本页刷新，数据可能需要稍等片刻才会显示。",
          )
        }}
      </div>
      <div class="toolbar">
        <div class="section-title">
          {{ t("Your day", "每日概览")
          }}<small>{{ t("A moment for yourself", "给自己一点时间") }}</small>
        </div>
        <div class="date-controls">
          <button
            @click="changeDay(-1)"
            :aria-label="t('Previous day', '前一天')"
          >
            ‹</button
          ><input
            type="date"
            v-model="selectedDay"
            :max="today"
            :aria-label="t('Selected date', '选择日期')"
            @change="validateDay"
          /><button
            @click="changeDay(1)"
            :disabled="selectedDay >= today"
            :aria-label="t('Next day', '后一天')"
          >
            ›</button
          ><button @click="selectedDay = today">{{ t("Today", "今天") }}</button
          ><button
            @click="loadRecords"
            :disabled="loading || !connected"
            :aria-label="t('Refresh saved records', '刷新已保存记录')"
          >
            ↻
          </button>
        </div>
      </div>
      <p v-if="loading" role="status">
        {{ t("Loading your health records…", "正在读取健康数据…") }}
      </p>
      <section class="top-grid" :aria-label="t('Daily overview', '每日概览')">
        <article class="card activity">
          <div class="activity-copy">
            <div class="card-title">
              <span class="symbol">↗</span
              >{{ t("Daily movement", "每日活动") }}
            </div>
            <div class="number">
              {{ format(metrics.steps)
              }}<span class="unit">{{ t("steps", "步") }}</span>
            </div>
            <p class="target">
              {{
                metrics.goal
                  ? t(
                      `of your ${format(metrics.goal)} step goal`,
                      `目标 ${format(metrics.goal)} 步`,
                    )
                  : t("Daily steps", "当日步数")
              }}
            </p>
            <div class="metrics">
              <div>
                <strong>{{
                  format(
                    metrics.distance === null ? null : metrics.distance / 1000,
                    1,
                  )
                }}</strong
                ><span class="unit">km</span
                ><small>{{ t("Distance", "距离") }}</small>
              </div>
              <div>
                <strong>{{ format(metrics.calories) }}</strong
                ><span class="unit">kcal</span
                ><small>{{ t("Active energy", "活动热量") }}</small>
              </div>
            </div>
          </div>
          <div class="ring">
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r="81" stroke="#edf1e7" />
              <circle
                cx="100"
                cy="100"
                r="81"
                stroke="#729458"
                :stroke-dasharray="`${Math.min(progress ?? 0, 100) * 5.09} 509`"
              />
            </svg>
            <div class="ring-label">
              <span class="leaf">↗</span
              ><strong>{{
                progress === null ? "—" : `${Math.round(progress)}%`
              }}</strong
              ><small>{{ t("of daily goal", "每日目标进度") }}</small>
            </div>
          </div>
        </article>
        <article class="card battery">
          <div class="card-title">
            <span class="symbol">ϟ</span>{{ t("Body Battery", "身体电量") }}
          </div>
          <div class="number">
            {{ format(battery[battery.length - 1]?.value ?? null)
            }}<small> / 100</small>
          </div>
          <span class="tag">{{ t("Latest reading", "最近读数") }}</span>
          <p style="font-size: 11px">
            {{ t("Your energy throughout the day", "一天中的身体电量变化") }}
          </p>
          <svg
            v-if="battery.length > 1"
            viewBox="0 0 430 75"
            preserveAspectRatio="none"
            role="img"
            :aria-label="
              t('Body Battery readings over time', '身体电量时间曲线')
            "
          >
            <polyline
              :points="batteryPath"
              fill="none"
              stroke="#cce8a2"
              stroke-width="2"
            />
          </svg>
          <div v-else class="empty-chart">
            {{ t("No time series available", "暂无变化曲线") }}
          </div>
          <div v-if="battery.length" class="axis">
            <span>{{ batteryTime(battery[0].time) }}</span
            ><span>{{ batteryTime(battery[battery.length - 1].time) }}</span>
          </div>
        </article>
      </section>
      <section class="mini-grid">
        <article class="card mini sleep">
          <div class="card-title">
            <span class="symbol">☾</span>{{ t("Sleep", "睡眠") }}
          </div>
          <div class="number">{{ sleepLabel }}</div>
          <p>{{ t("Total sleep time", "总睡眠时长") }}</p>
          <div v-if="stageTotal" class="sleep-bar">
            <i
              v-for="(stage, i) in metrics.stages"
              :key="i"
              :style="{
                flex: stage ?? 0,
                display: stage ? '' : 'none',
                background: stageColors[i],
              }"
              :title="`${stageNames[i]}: ${format((stage ?? 0) / 60)} min`"
            ></i>
          </div>
          <div class="foot">
            <span>{{
              stageTotal
                ? stageNames.join(" · ")
                : t("No sleep stages available", "暂无睡眠分期")
            }}</span>
          </div>
        </article>
        <article
          v-for="item in metricCards"
          :key="item.key"
          class="card mini"
          :class="item.key"
        >
          <div class="card-title">
            <span class="symbol">{{ item.key === "heart" ? "♡" : "∿" }}</span
            >{{ item.title }}
          </div>
          <div class="number">
            {{ format(metrics[item.key])
            }}<span class="unit" style="font-size: 12px">{{ item.unit }}</span>
          </div>
          <p>{{ item.subtitle }}</p>
          <svg
            v-if="sparkline(item.key)"
            class="spark"
            viewBox="0 0 105 37"
            role="img"
            :aria-label="item.title"
          >
            <path
              :d="sparkline(item.key)"
              fill="none"
              :stroke="item.key === 'heart' ? '#c38c78' : '#a28eaf'"
              stroke-width="2"
            />
          </svg>
          <div class="foot">
            <span
              >{{ t("7-day average", "7 日均值") }} ·
              {{ format(metricAverage(item.key)) }} {{ item.unit }}</span
            >
          </div>
        </article>
      </section>
      <section class="lower">
        <div>
          <div class="section-head">
            <h2 class="section-title">
              {{ t("The bigger picture", "看见长期变化") }}
            </h2>
            <div class="segment">
              <button
                v-for="count in [7, 30]"
                :key="count"
                :class="{ selected: days === count }"
                :aria-pressed="days === count"
                @click="days = count"
              >
                {{ count }} {{ t("days", "天") }}
              </button>
            </div>
          </div>
          <article class="card trend">
            <div class="tabs">
              <button
                v-for="item in trendOptions"
                :key="item.key"
                :class="{ selected: metric === item.key }"
                :aria-pressed="metric === item.key"
                @click="metric = item.key"
              >
                {{ item.label }}
              </button>
            </div>
            <div class="trend-summary">
              <div>
                <strong>{{
                  format(trendAverage, metric === "sleep" ? 1 : 0)
                }}</strong
                ><small>{{ metricUnit }}</small>
              </div>
              <span class="trend-label"
                >{{ points.filter((p) => p.value !== null).length }}/{{ days }}
                {{ t("days recorded", "天有记录") }}</span
              >
            </div>
            <div v-if="trendAverage !== null" class="plot">
              <div class="gridlines">
                <div v-for="tick in [chartMax, chartMax / 2, 0]" :key="tick">
                  {{ format(tick) }}
                </div>
              </div>
              <div class="bars" :style="{ gap: days === 30 ? '3px' : '' }">
                <div
                  v-for="(point, i) in points"
                  :key="point.day"
                  class="bar-item"
                >
                  <button
                    class="bar"
                    :class="{ 'missing-bar': point.value === null }"
                    :style="{
                      height: `${point.value === null ? 3 : Math.max(2, (point.value / chartMax) * 143)}px`,
                    }"
                    :data-value="`${point.day}: ${format(point.value, metric === 'sleep' ? 1 : 0)} ${metricUnit}`"
                    :aria-label="`${point.day}: ${format(point.value, metric === 'sleep' ? 1 : 0)} ${metricUnit}`"
                  ></button
                  ><span>{{
                    days === 7 || i % 5 === 0 ? shortDate(point.day) : ""
                  }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-chart">
              {{ t("No records for this period", "此时间段暂无记录") }}
            </div>
            <p class="plot-caption">
              {{
                t(
                  "Missing days are excluded from averages. Hover or focus to explore.",
                  "缺失日期不计入均值，悬停或聚焦查看每日读数。",
                )
              }}
            </p>
          </article>
        </div>
        <div class="recent">
          <div class="section-head">
            <h2 class="section-title">
              {{ t("A little time outside", "每一次运动都值得记录") }}
            </h2>
            <span style="font-size: 10px">{{
              t("Selected day", "所选日期")
            }}</span>
          </div>
          <article class="card">
            <div class="run-map">
              <svg
                v-if="route"
                viewBox="0 0 440 160"
                role="img"
                :aria-label="t('Recorded GPS route', '实际 GPS 轨迹')"
              >
                <polyline
                  :points="route"
                  fill="none"
                  stroke="#668351"
                  stroke-width="3"
                />
              </svg>
              <div v-else class="empty-chart">
                {{ t("No GPS route available", "暂无 GPS 轨迹") }}
              </div>
              <span v-if="route" class="map-label">{{
                t("RECORDED ROUTE · SCHEMATIC", "实际轨迹 · 示意投影")
              }}</span>
            </div>
            <div v-if="activity" class="run-detail">
              <div class="run-heading">
                <div>
                  <strong>{{
                    activity.activityName ||
                    activity.activityType ||
                    t("Activity", "运动")
                  }}</strong
                  ><small>{{ recordDate(activity) }}</small>
                </div>
                <span class="symbol">↗</span>
              </div>
              <div class="run-stats">
                <div>
                  <strong
                    >{{ format(activityDistance, 2)
                    }}<span class="unit">km</span></strong
                  ><small>{{ t("Distance", "距离") }}</small>
                </div>
                <div>
                  <strong>{{ duration(activity.durationInSeconds) }}</strong
                  ><small>{{ t("Duration", "时长") }}</small>
                </div>
                <div>
                  <strong>{{
                    format(numeric(activity.averageHeartRateInBeatsPerMinute))
                  }}</strong
                  ><small>{{ t("Avg. HR · bpm", "平均心率 · bpm") }}</small>
                </div>
              </div>
            </div>
            <div v-else class="run-detail">
              <p>
                {{
                  t(
                    "No activities recorded for this day.",
                    "这一天暂无运动记录。",
                  )
                }}
              </p>
            </div>
            <div v-if="activities.length > 1" class="activity-list">
              <button
                v-for="(item, i) in activities"
                :key="i"
                @click="activityIndex = i"
                :class="{ selected: activityIndex === i }"
                :aria-pressed="activityIndex === i"
              >
                {{
                  item.activityName ||
                  item.activityType ||
                  `${t("Activity", "运动")} ${i + 1}`
                }}
              </button>
            </div>
          </article>
        </div>
      </section>
      <section class="wellbeing">
        <div class="section-head">
          <h2 class="section-title">
            {{ t("Small things, every day", "每天的小习惯") }}
          </h2>
          <span style="font-size: 10px">{{
            t("Daily essentials", "日常记录")
          }}</span>
        </div>
        <div class="wellbeing-grid">
          <article class="card">
            <span class="symbol">♧</span>
            <div>
              <div class="caption">{{ t("Hydration", "饮水量") }}</div>
              <strong
                >{{
                  format(
                    metrics.water === null ? null : metrics.water / 1000,
                    1,
                  )
                }}<span class="unit">L</span></strong
              >
            </div>
            <div class="trailing">
              {{
                metrics.waterGoal
                  ? t(
                      `Goal · ${format(metrics.waterGoal / 1000, 1)} L`,
                      `目标 · ${format(metrics.waterGoal / 1000, 1)} L`,
                    )
                  : t("No goal available", "暂无目标")
              }}
            </div>
          </article>
          <article class="card">
            <span class="symbol">⚖</span>
            <div>
              <div class="caption">{{ t("Weight", "体重") }}</div>
              <strong
                >{{ format(metrics.weight, 1)
                }}<span class="unit">kg</span></strong
              >
            </div>
            <div class="trailing">{{ selectedDay }}</div>
          </article>
        </div>
      </section>
      <footer>
        <span class="footer-brand"
          >wristo. &nbsp;
          {{
            t("A healthier rhythm, your way.", "找到属于你的健康节奏。")
          }}</span
        ><span>{{
          t(
            "Based on up to 100 saved records per type. Refresh reads Wristo records; it does not request Garmin history.",
            "每类最多读取最近 100 条已保存记录。刷新只读取 Wristo 数据，不会向 Garmin 请求历史数据。",
          )
        }}</span>
      </footer>
    </main>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import GarminConnectionCard from "@/components/GarminConnectionCard.vue";
import { getGarminSummaries, type GarminStatus } from "@/api/garmin";
import { useLocaleStore } from "@/store/locale";
import { useUserStore } from "@/store/user";
import {
  average,
  batterySeries,
  dateKey,
  dayMetrics,
  emptyHealthRecords,
  healthTypes,
  numeric,
  recordDate,
  routePoints,
  shiftDate,
  trend,
  type HealthType,
  type Metric,
} from "@/utils/garminHealth";
const locale = useLocaleStore(),
  user = useUserStore();
const zh = computed(() => locale.currentLocale === "zh");
const t = (en: string, cn: string) => (zh.value ? cn : en);
const name = computed(
  () => user.userInfo?.nickname || user.userInfo?.username || "",
);
const connection = ref<GarminStatus | null>(null),
  showConnection = ref(false);
const connected = computed(
  () => connection.value?.connected && !connection.value.revocationPending,
);
const records = ref(emptyHealthRecords()),
  loading = ref(false),
  failed = ref<HealthType[]>([]),
  loadedAt = ref("");
const today = dateKey(new Date()),
  selectedDay = ref(today),
  days = ref(7),
  metric = ref<Metric>("steps"),
  activityIndex = ref(0);
let requestVersion = 0;
const metrics = computed(() => dayMetrics(records.value, selectedDay.value));
const progress = computed(() =>
  metrics.value.steps !== null && metrics.value.goal
    ? (metrics.value.steps / metrics.value.goal) * 100
    : null,
);
function format(value: number | null, digits = 0) {
  return value === null
    ? "—"
    : value.toLocaleString(zh.value ? "zh-CN" : "en-US", {
        maximumFractionDigits: digits,
      });
}
function duration(value: unknown) {
  const seconds = numeric(value);
  if (seconds === null) return "—";
  const minutes = Math.floor(seconds / 60);
  return `${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)}:` : ""}${String(minutes % 60).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
const sleepLabel = computed(() => {
  if (metrics.value.sleep === null) return "—";
  const minutes = Math.round(metrics.value.sleep * 60);
  return `${Math.floor(minutes / 60)}${t("h", "时")} ${minutes % 60}${t("m", "分")}`;
});
const stageTotal = computed(() =>
  metrics.value.stages.reduce<number>((sum, value) => sum + (value ?? 0), 0),
);
const stageColors = ["#6a83ac", "#b4bfd7", "#9384ac", "#e5e9f3"];
const stageNames = computed(() => [
  t("Deep", "深睡"),
  t("Light", "浅睡"),
  "REM",
  t("Awake", "清醒"),
]);
const metricCards = computed(() => [
  {
    key: "heart" as const,
    title: t("Resting heart rate", "静息心率"),
    unit: "bpm",
    subtitle: t("Your daily resting average", "每日静息心率"),
  },
  {
    key: "hrv" as const,
    title: t("Overnight HRV", "夜间 HRV"),
    unit: "ms",
    subtitle: t("Average during sleep", "睡眠期间平均值"),
  },
]);
function metricAverage(key: Metric) {
  return average(
    trend(records.value, selectedDay.value, 7, key).map((p) => p.value),
  );
}
function sparkline(key: Metric) {
  const values = trend(records.value, selectedDay.value, 7, key).map(
    (p) => p.value,
  );
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length < 2) return "";
  const min = Math.min(...valid),
    range = Math.max(...valid) - min || 1;
  return values
    .map((v, i) =>
      v === null
        ? ""
        : `${i === 0 || values[i - 1] === null ? "M" : "L"}${i * 17.5} ${32 - ((v - min) / range) * 25}`,
    )
    .join(" ");
}
const trendOptions = computed(() => [
  { key: "steps" as const, label: t("Steps", "步数") },
  { key: "sleep" as const, label: t("Sleep", "睡眠") },
  { key: "heart" as const, label: t("Resting HR", "静息心率") },
  { key: "hrv" as const, label: "HRV" },
]);
const points = computed(() =>
  trend(records.value, selectedDay.value, days.value, metric.value),
);
const trendAverage = computed(() => average(points.value.map((p) => p.value)));
const chartMax = computed(() =>
  Math.ceil(Math.max(1, ...points.value.map((p) => p.value ?? 0)) * 1.15),
);
const metricUnit = computed(
  () =>
    ({
      steps: t("steps / day", "步 / 天"),
      sleep: t("hours / night", "小时 / 晚"),
      heart: "bpm",
      hrv: "ms",
    })[metric.value],
);
const shortDate = (key: string) =>
  new Date(`${key}T12:00:00`).toLocaleDateString(
    zh.value ? "zh-CN" : "en-US",
    days.value === 7 ? { weekday: "short" } : { day: "numeric" },
  );
const battery = computed(() =>
  batterySeries(records.value.stressDetails, selectedDay.value),
);
const batteryPath = computed(() => {
  const data = battery.value;
  if (data.length < 2) return "";
  const start = data[0].time,
    span = data[data.length - 1].time - start || 1;
  return data
    .map((p) => `${((p.time - start) / span) * 430},${70 - p.value * 0.6}`)
    .join(" ");
});
const batteryTime = (time: number) =>
  new Date(time * 1000).toLocaleTimeString(zh.value ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
const activities = computed(() =>
  records.value.activities.filter(
    (item) => recordDate(item) === selectedDay.value,
  ),
);
const activity = computed(() => activities.value[activityIndex.value] ?? null);
const activityDistance = computed(() => {
  const distance = numeric(activity.value?.distanceInMeters);
  return distance === null ? null : distance / 1000;
});
const route = computed(() => {
  const id = activity.value?.activityId;
  if (id === undefined || id === null) return null;
  const detail = records.value.activityDetails.find(
    (item) => String(item.activityId) === String(id),
  );
  return detail ? routePoints(detail) : null;
});
function validateDay() {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(selectedDay.value) ||
    selectedDay.value > today
  )
    selectedDay.value = today;
}
function changeDay(offset: number) {
  selectedDay.value = shiftDate(selectedDay.value, offset);
}
watch(selectedDay, () => {
  activityIndex.value = 0;
});
function onStatus(value: GarminStatus | null) {
  connection.value = value;
  showConnection.value ||= !value?.connected;
  void loadRecords();
}
async function loadRecords() {
  const version = ++requestVersion;
  records.value = emptyHealthRecords();
  failed.value = [];
  loadedAt.value = "";
  activityIndex.value = 0;
  loading.value = false;
  if (!connected.value) return;
  loading.value = true;
  const results = await Promise.allSettled(
    healthTypes.map((type) => getGarminSummaries(type, 100)),
  );
  if (version !== requestVersion) return;
  const next = emptyHealthRecords();
  results.forEach((result, i) => {
    const type = healthTypes[i];
    if (result.status === "fulfilled" && Array.isArray(result.value))
      next[type] = result.value;
    else failed.value.push(type);
  });
  records.value = next;
  loadedAt.value = new Date().toLocaleTimeString(zh.value ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  loading.value = false;
}
onBeforeUnmount(() => {
  requestVersion++;
});
</script>
<style scoped src="@/components/health/health-dashboard.css"></style>
<style scoped>
h2 {
  margin: 0;
}
input[type="date"] {
  width: 133px;
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 5px 6px;
  background: white;
  color: var(--ink);
  font: inherit;
}
@media (max-width: 720px) {
  .date-controls {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .toolbar {
    gap: 12px;
  }
  .toolbar .section-title {
    white-space: nowrap;
  }
  input[type="date"] {
    width: 114px;
  }
  .health-main {
    padding: 28px 16px;
  }
}
</style>
