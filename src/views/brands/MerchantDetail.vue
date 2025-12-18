<template>
  <div class="merchant-detail-page">
    <div class="page-header">
      <button class="back-btn" type="button" @click="goBack">Back</button>
    </div>

    <div v-if="loading" class="loading-state">Loading...</div>

    <div v-else-if="!merchant" class="empty-state">
      <div class="empty-title">Brand not found</div>
      <div class="empty-subtitle">Please try again later.</div>
    </div>

    <div v-else class="content">
      <div class="hero">
        <div class="hero-banner">
          <img
            v-if="bannerUrl"
            class="hero-banner-img"
            :src="bannerUrl"
            :alt="displayName"
            loading="lazy"
          />
          <div class="hero-banner-overlay" />
        </div>

        <div class="hero-left">
          <div class="hero-avatar">
            <img
              v-if="merchant.avatar"
              class="hero-avatar-img"
              :src="merchant.avatar"
              :alt="displayName"
              loading="lazy"
            />
            <div v-else class="hero-avatar-fallback">BR</div>
          </div>

          <div class="hero-stats">
            <div class="stat">
              <div class="stat-value">{{ formatNumber(appsTotal) }}</div>
              <div class="stat-label">Apps</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ formatNumber(merchant.totalDownloads) }}</div>
              <div class="stat-label">Downloads</div>
            </div>
          </div>
        </div>

        <div class="hero-right">
          <div class="hero-name">{{ displayName }}</div>
          <div v-if="merchant.slogan" class="hero-slogan">{{ merchant.slogan }}</div>
          <div v-if="hasAnySocial" class="social-row">
            <a v-if="merchant.instagramUrl" class="social-link" :href="merchant.instagramUrl" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a v-if="merchant.facebookUrl" class="social-link" :href="merchant.facebookUrl" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a v-if="merchant.xUrl" class="social-link" :href="merchant.xUrl" target="_blank" rel="noopener noreferrer">X</a>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-card apps-card">
          <div class="apps-toolbar">
            <div class="apps-search">
              <input
                v-model="appsQuery"
                class="apps-search-input"
                type="text"
                placeholder="Search"
                inputmode="search"
                autocomplete="off"
              />
            </div>
          </div>

          <div v-if="appsLoading && apps.length === 0" class="apps-loading">Loading...</div>
          <div v-else-if="appsError" class="apps-error">{{ appsError }}</div>
          <div v-else-if="apps.length === 0" class="apps-empty">No results</div>

          <div v-else class="apps-grid">
            <ProductCard v-for="p in apps" :key="p.appId" :product="p" />
          </div>

          <div v-if="appsLoading && apps.length > 0" class="apps-loadmore">
            <div class="apps-loadmore-spinner" />
            <div class="apps-loadmore-text">Loading more apps...</div>
          </div>

          <div v-if="!appsHasMore && apps.length > 0" class="apps-no-more">
            <div class="apps-no-more-text">You've reached the end!</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getMerchantAppsPage, getMerchantDetail } from "@/api/merchant";
import type { PublicMerchantVO } from "@/types/merchant";
import type { ProductBaseVO, PageResult } from "@/types";

import ProductCard from "@/components/ProductCard.vue";

const router = useRouter();
const route = useRoute();

const merchant = ref<PublicMerchantVO | null>(null);
const loading = ref(true);

const apps = ref<ProductBaseVO[]>([]);
const appsLoading = ref(false);
const appsError = ref("");
const appsPageNum = ref(1);
const appsPageSize = ref(12);
const appsTotal = ref(0);
const appsTotalPages = ref(1);
const appsQuery = ref("");
let appsQueryTimer: number | null = null;

const appsHasMore = ref(true);
let scrollTimeout: number | null = null;
let scrollCheckInterval: number | null = null;

const userId = computed(() => {
  const raw = route.params.userId;
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v ? String(v) : "";
});

onMounted(async () => {
  try {
    if (!userId.value) {
      merchant.value = null;
      return;
    }
    const detail = await getMerchantDetail(userId.value);
    merchant.value = detail || null;
  } catch (e) {
    merchant.value = null;
  } finally {
    loading.value = false;
  }
});

const fetchApps = async (reset = true) => {
  if (!userId.value) {
    apps.value = [];
    appsTotal.value = 0;
    appsTotalPages.value = 1;
    appsHasMore.value = false;
    return;
  }

  if (reset) {
    apps.value = [];
    appsPageNum.value = 1;
    appsHasMore.value = true;
  }

  appsLoading.value = true;
  appsError.value = "";

  try {
    const res: PageResult<ProductBaseVO> = await getMerchantAppsPage({
      userId: Number(userId.value),
      name: appsQuery.value.trim() || undefined,
      pageNum: appsPageNum.value,
      pageSize: appsPageSize.value,
    });

    const next = res.list || [];
    apps.value = reset ? next : [...apps.value, ...next];
    appsTotal.value = Number(res.total || 0);
    appsTotalPages.value = Number(res.pages || 1);

    appsHasMore.value = next.length === appsPageSize.value;
  } catch (e: any) {
    if (reset) {
      apps.value = [];
      appsTotal.value = 0;
      appsTotalPages.value = 1;
    }
    appsHasMore.value = false;
    appsError.value = "Failed to load apps. Please try again later.";
  } finally {
    appsLoading.value = false;
  }
};

const loadMore = async () => {
  if (appsLoading.value || !appsHasMore.value) return;
  appsPageNum.value += 1;
  await fetchApps(false);
};

const handleScroll = () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }

  scrollTimeout = window.setTimeout(() => {
    if (appsLoading.value || !appsHasMore.value) return;

    const scrollTop = Math.max(
      window.pageYOffset,
      document.documentElement.scrollTop,
      document.body.scrollTop
    );
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const documentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.scrollHeight,
      document.body.offsetHeight
    );

    const scrollProgress = (scrollTop + windowHeight) / documentHeight;
    const remainingHeight = documentHeight - (scrollTop + windowHeight);

    const shouldLoad = scrollProgress >= 0.6 || remainingHeight <= 400;
    if (shouldLoad) {
      loadMore();
    }
  }, 100);
};

watch(
  () => userId.value,
  () => {
    fetchApps(true);
  },
  { immediate: true }
);

watch(
  () => appsQuery.value,
  () => {
    if (appsQueryTimer) window.clearTimeout(appsQueryTimer);
    appsQueryTimer = window.setTimeout(() => {
      fetchApps(true);
    }, 350);
  }
);

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("touchmove", handleScroll, { passive: true });

  scrollCheckInterval = window.setInterval(() => {
    if (appsLoading.value || !appsHasMore.value) return;
    handleScroll();
  }, 2000);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
  document.removeEventListener("scroll", handleScroll);
  window.removeEventListener("touchmove", handleScroll);

  if (appsQueryTimer) {
    window.clearTimeout(appsQueryTimer);
    appsQueryTimer = null;
  }

  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
    scrollTimeout = null;
  }

  if (scrollCheckInterval) {
    clearInterval(scrollCheckInterval);
    scrollCheckInterval = null;
  }
});

const displayName = computed(() => {
  const m = merchant.value;
  if (!m) return "";
  return (m.nickname || m.username || `User ${String(m.userId)}`).trim();
});

const bannerUrl = computed(() => {
  const m = merchant.value;
  const img = m?.bannerImage;
  if (!img) return "";
  const formats = img.formats || {};
  const preferred = ["large", "medium", "small", "thumbnail"];
  for (const k of preferred) {
    const u = formats[k]?.url;
    if (u) return u;
  }
  return img.url || "";
});

const hasAnySocial = computed(() => {
  const m = merchant.value;
  return Boolean(
    (m?.instagramUrl || "").trim() ||
      (m?.facebookUrl || "").trim() ||
      (m?.xUrl || "").trim()
  );
});

const formatNumber = (value?: number) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push("/brands");
};
</script>

<style scoped>
.merchant-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f6f8fb 60%, #ffffff 100%);
  padding: 16px 0 56px;
}

.page-header {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-weight: 700;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.75);
  cursor: pointer;
}

.back-btn:hover {
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
}

.loading-state {
  width: 100%;
  max-width: 1100px;
  margin: 24px auto 0;
  padding: 0 16px;
  font-size: 14px;
  color: rgba(15, 23, 42, 0.65);
}

.empty-state {
  width: 100%;
  max-width: 520px;
  margin: 48px auto 0;
  padding: 18px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.empty-title {
  font-weight: 800;
  font-size: 16px;
  color: #0f172a;
}

.empty-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.65);
}

.content {
  width: 100%;
  max-width: 1100px;
  margin: 18px auto 0;
  padding: 0 16px;
}

.hero {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background: transparent;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: 260px auto;
}

.hero::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 260px;
  bottom: 0;
  background: rgba(255, 255, 255, 0.96);
  pointer-events: none;
}

.hero-banner {
  position: relative;
  width: 100%;
  height: 260px;
  background: linear-gradient(135deg, #f2f6ff 0%, #eef2f7 100%);
  grid-column: 1 / -1;
  grid-row: 1;
}

.hero-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1.01);
}

.hero-banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.06) 0%,
    rgba(0, 0, 0, 0.28) 62%,
    rgba(255, 255, 255, 0.92) 100%
  );
}

.hero-left {
  position: relative;
  z-index: 1;
  grid-column: 1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: -34px;
  padding: 0 18px 16px;
}

.hero-right {
  position: relative;
  z-index: 1;
  grid-column: 2;
  grid-row: 2;
  padding: 12px 18px 16px 28px;
  text-align: left;
}

.hero-card {
  position: relative;
  margin-top: 0;
  padding: 18px 18px 16px;
  background: #ffffff;
  box-shadow: 0 -1px 0 rgba(15, 23, 42, 0.06) inset;
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: auto auto;
  column-gap: 30px;
  row-gap: 14px;
  align-items: start;
}

.hero-top {
  display: contents;
}

.hero-avatar {
  width: 160px;
  height: 160px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  margin-top: -54px;
}

.hero-avatar img {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  display: block;
  object-fit: cover;
  object-position: center;
}

.hero-avatar-fallback {
  font-size: 12px;
  font-weight: 800;
  color: rgba(17, 24, 39, 0.55);
  letter-spacing: 0.12em;
}

.hero-text {
  min-width: 0;
  padding-left: 0;
  text-align: left;
  grid-column: 2;
  grid-row: 1;
  padding-top: 10px;
}

.hero-name {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-slogan {
  margin-top: 6px;
  font-size: 18px;
  line-height: 1.5;
  color: rgba(15, 23, 42, 0.72);
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-stats {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.stat {
  text-align: center;
  padding: 0;
  background: transparent;
  border: none;
  min-width: 84px;
}

.stat-label {
  margin-top: 6px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.52);
}

.stat-value {
  margin-top: 0;
  font-weight: 900;
  font-size: 24px;
  color: rgba(15, 23, 42, 0.72);
  letter-spacing: -0.01em;
}

.social-row {
  margin-top: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-start;
  margin-top: 12px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.78);
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(15, 23, 42, 0.1);
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.social-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

.section {
  margin-top: 18px;
  border: none;
}

.apps-card {
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.apps-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  padding: 0 0 10px;
}

.apps-search {
  width: 260px;
  max-width: 100%;
}

.apps-search-input {
  margin-top: 0;
  width: 100%;
  height: 34px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-size: 13px;
  color: rgba(15, 23, 42, 0.86);
  outline: none;
}

.apps-search-input:focus {
  border-color: rgba(0, 122, 255, 0.55);
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.12);
}

.apps-loading,
.apps-empty,
.apps-error {
  padding: 8px 0 6px;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.66);
}

.apps-error {
  color: rgba(220, 38, 38, 0.8);
}

.apps-grid {
  padding-top: 6px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.apps-loadmore,
.apps-no-more {
  margin-top: 14px;
  padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.apps-loadmore-spinner {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid rgba(15, 23, 42, 0.12);
  border-top-color: rgba(0, 122, 255, 0.7);
  animation: apps-spin 0.8s linear infinite;
}

.apps-loadmore-text,
.apps-no-more-text {
  font-size: 12px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.62);
}

@keyframes apps-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .apps-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .apps-toolbar {
    justify-content: flex-end;
  }

  .apps-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .apps-grid {
    grid-template-columns: 1fr;
  }
}

.section-title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: rgba(15, 23, 42, 0.78);
  margin: 0 0 10px;
}

.section-card {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.08);
  padding: 14px 14px;
}

.about-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 14px;
}

.about-row + .about-row {
  margin-top: 6px;
}

.about-label {
  font-size: 12px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.6);
}

.about-value {
  font-size: 12px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.85);
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .hero-banner {
    height: 210px;
  }

  .hero {
    grid-template-columns: 1fr;
    grid-template-rows: 210px auto auto;
  }

  .hero::after {
    top: 210px;
  }

  .hero-avatar {
    width: 86px;
    height: 86px;
    border-radius: 999px;
    margin-top: -48px;
    align-self: center;
  }

  .hero-left {
    grid-column: 1;
    grid-row: 2;
    align-items: center;
    margin-top: -14px;
    padding: 0 16px 0;
  }

  .hero-right {
    grid-column: 1;
    grid-row: 3;
    padding: 12px 16px 16px;
    text-align: left;
  }

  .hero-stats {
    gap: 22px;
    justify-content: center;
  }

  .stat-value {
    font-size: 24px;
  }

  .social-row {
    justify-content: center;
    margin-top: 8px;
  }

  .hero-name {
    font-size: 26px;
  }
}
</style>
