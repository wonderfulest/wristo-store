<template>
  <div class="merchant-detail-page">
    <div class="page-header">
      <button class="back-btn" type="button" @click="goBack" aria-label="Back to brands">
        <span class="back-icon" aria-hidden="true">‹</span>
        <span>Back</span>
      </button>
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
              <div class="stat-value">{{ formatDisplayAppCount(appsTotal) }}</div>
              <div class="stat-label">Apps</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ formatDisplayDownloadCount(merchant.totalDownloads) }}</div>
              <div class="stat-label">Downloads</div>
            </div>
          </div>
        </div>

        <div class="hero-right">
          <div class="hero-kicker">Designer Brand</div>
          <h1 class="hero-name">{{ displayName }}</h1>
          <div v-if="merchant.slogan" class="hero-slogan">{{ merchant.slogan }}</div>
          <div v-if="hasAnySocial" class="social-row">
            <a v-if="merchant.instagramUrl" class="social-link" :href="merchant.instagramUrl" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg class="social-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Z" stroke="currentColor" stroke-width="1.8" />
                <path d="M12 16.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" stroke="currentColor" stroke-width="1.8" />
                <path d="M17.5 6.7h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
              </svg>
              <span>Instagram</span>
            </a>
            <a v-if="merchant.facebookUrl" class="social-link" :href="merchant.facebookUrl" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg class="social-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14 8.6V7.2c0-1 .8-1.8 1.8-1.8H18V3h-2.8A4.2 4.2 0 0 0 11 7.2v1.4H8.5V11H11v10h3V11h3l.8-2.4H14Z" fill="currentColor" />
              </svg>
              <span>Facebook</span>
            </a>
            <a v-if="merchant.xUrl" class="social-link" :href="merchant.xUrl" target="_blank" rel="noopener noreferrer" aria-label="X">
              <svg class="social-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18.5 3H21l-6.6 7.6L22 21h-6.2l-4.9-6.3L5.5 21H3l7.1-8.2L2 3h6.3l4.4 5.8L18.5 3Z" fill="currentColor" />
              </svg>
              <span>X</span>
            </a>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-card apps-card">
          <div class="apps-toolbar">
            <div class="apps-heading">
              <h2 class="section-title">Watch faces</h2>
              <div class="section-subtitle">{{ formatDisplayAppCount(appsTotal) }} designs from {{ displayName }}</div>
            </div>
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
import { useCountDisplay } from "@/composables/useCountDisplay";
import type { PublicMerchantVO } from "@/types/merchant";
import type { ProductBaseVO, PageResult } from "@/types";

import ProductCard from "@/components/ProductCard.vue";

const router = useRouter();
const route = useRoute();
const { formatDisplayAppCount, formatDisplayDownloadCount } = useCountDisplay();

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
  background:
    radial-gradient(circle at 16% 0%, rgba(15, 107, 104, 0.1), transparent 28rem),
    linear-gradient(180deg, #fbfdfc 0%, #f3f7f6 52%, #ffffff 100%);
  padding: 18px 0 64px;
}

.page-header,
.content,
.loading-state {
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 20px;
  padding-right: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-btn {
  min-height: 44px;
  padding: 0 16px 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(15, 107, 104, 0.14);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  font-size: 13px;
  color: var(--color-brand-strong);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(17, 24, 39, 0.1);
}

.back-icon {
  font-size: 24px;
  line-height: 1;
  margin-top: -2px;
}

.loading-state {
  margin-top: 24px;
  font-size: 14px;
  color: var(--color-muted);
}

.empty-state {
  width: calc(100% - 32px);
  max-width: 520px;
  margin: 48px auto 0;
  padding: 22px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(15, 107, 104, 0.1);
  box-shadow: var(--shadow-md);
  text-align: center;
}

.empty-title {
  font-weight: 800;
  font-size: 17px;
  color: var(--color-ink);
}

.empty-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-muted);
}

.content {
  margin-top: 20px;
}

.hero {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid rgba(15, 107, 104, 0.1);
  box-shadow: var(--shadow-lg);
  display: grid;
  grid-template-columns: minmax(184px, 220px) 1fr;
  grid-template-rows: 300px auto;
}

.hero::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 300px;
  bottom: 0;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.94)),
    radial-gradient(circle at 18% 0%, rgba(15, 107, 104, 0.12), transparent 22rem);
  pointer-events: none;
}

.hero-banner {
  position: relative;
  width: 100%;
  height: 300px;
  background:
    radial-gradient(circle at 20% 20%, rgba(245, 158, 11, 0.18), transparent 16rem),
    linear-gradient(135deg, #dff5f1 0%, #f7fbfa 52%, #eef5f3 100%);
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
  background:
    linear-gradient(180deg, rgba(4, 78, 75, 0.02) 0%, rgba(4, 78, 75, 0.16) 56%, rgba(255, 255, 255, 0.96) 100%),
    linear-gradient(90deg, rgba(0, 0, 0, 0.08), transparent 42%);
}

.hero-left {
  position: relative;
  z-index: 1;
  grid-column: 1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: -46px;
  padding: 0 18px 16px;
}

.hero-right {
  position: relative;
  z-index: 1;
  grid-column: 2;
  grid-row: 2;
  min-width: 0;
  padding: 14px 24px 18px 0;
  text-align: left;
}

.hero-avatar {
  width: 104px;
  height: 104px;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.94);
  border: 4px solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 24px 55px rgba(17, 24, 39, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
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
  font-size: 26px;
  font-weight: 800;
  color: var(--color-brand-strong);
  letter-spacing: 0;
}

.hero-kicker {
  width: fit-content;
  margin-bottom: 8px;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-name {
  margin: 0;
  max-width: 760px;
  font-size: clamp(1.8rem, 3.2vw, 3.6rem);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.02;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-slogan {
  max-width: 680px;
  margin-top: 8px;
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-muted);
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-stats {
  width: 100%;
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  gap: 8px;
}

.stat {
  min-height: 56px;
  text-align: left;
  padding: 9px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(15, 107, 104, 0.1);
  box-shadow: var(--shadow-sm);
}

.stat-label {
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.stat-value {
  margin-top: 3px;
  font-weight: 900;
  font-size: 20px;
  color: var(--color-brand-strong);
  letter-spacing: 0;
}

.social-row {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-start;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
  font-size: 13px;
  color: var(--color-brand-strong);
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(15, 107, 104, 0.13);
  box-shadow: var(--shadow-sm);
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
}

.social-link:hover {
  transform: translateY(-1px);
  border-color: rgba(15, 107, 104, 0.26);
  box-shadow: 0 14px 30px rgba(17, 24, 39, 0.1);
}

.social-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

.section {
  margin-top: 18px;
  border: none;
}

.section-card {
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(15, 107, 104, 0.08);
  box-shadow: 0 20px 54px rgba(17, 24, 39, 0.08);
}

.apps-card {
  padding: 18px;
}

.apps-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 0 0 18px;
}

.apps-heading {
  min-width: 0;
}

.section-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--color-ink);
}

.section-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-muted);
}

.apps-search {
  width: 300px;
  max-width: 100%;
  flex: 0 0 auto;
}

.apps-search-input {
  margin-top: 0;
  width: 100%;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(15, 107, 104, 0.13);
  background: rgba(255, 255, 255, 0.92);
  font-size: 14px;
  color: var(--color-ink);
  outline: none;
  box-shadow: var(--shadow-sm);
}

.apps-search-input:focus {
  border-color: rgba(15, 107, 104, 0.45);
  box-shadow: 0 0 0 4px rgba(15, 107, 104, 0.12);
}

.apps-loading,
.apps-empty,
.apps-error {
  padding: 24px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-muted);
  text-align: center;
}

.apps-error {
  color: #b42318;
  background: rgba(254, 243, 242, 0.9);
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
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
  border: 2px solid rgba(15, 107, 104, 0.12);
  border-top-color: var(--color-brand);
  animation: apps-spin 0.8s linear infinite;
}

.apps-loadmore-text,
.apps-no-more-text {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-muted);
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
  .hero {
    grid-template-columns: 188px 1fr;
  }

  .apps-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .merchant-detail-page {
    padding-top: 12px;
  }

  .page-header,
  .content,
  .loading-state {
    padding-left: 14px;
    padding-right: 14px;
  }

  .hero-banner {
    height: 220px;
  }

  .hero {
    border-radius: 22px;
    grid-template-columns: 1fr;
    grid-template-rows: 220px auto auto;
  }

  .hero::after {
    top: 220px;
  }

  .hero-avatar {
    width: 78px;
    height: 78px;
    border-radius: 20px;
  }

  .hero-left {
    grid-column: 1;
    grid-row: 2;
    align-items: center;
    margin-top: -36px;
    padding: 0 16px 10px;
  }

  .hero-right {
    grid-column: 1;
    grid-row: 3;
    padding: 0 18px 16px;
    text-align: center;
  }

  .hero-kicker {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-name {
    white-space: normal;
    font-size: 30px;
  }

  .hero-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    justify-content: center;
  }

  .stat {
    min-height: 54px;
    text-align: center;
  }

  .stat-value {
    font-size: 19px;
  }

  .social-row {
    justify-content: center;
  }

  .apps-card {
    padding: 14px;
    border-radius: 20px;
  }

  .apps-toolbar {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
  }

  .apps-search {
    width: 100%;
  }

  .apps-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}

@media (max-width: 420px) {
  .page-header,
  .content,
  .loading-state {
    padding-left: 10px;
    padding-right: 10px;
  }

  .hero-banner {
    height: 200px;
  }

  .hero {
    grid-template-rows: 200px auto auto;
  }

  .hero::after {
    top: 200px;
  }

  .hero-name {
    font-size: 27px;
  }

  .hero-slogan {
    font-size: 15px;
  }

  .social-link {
    flex: 1 1 auto;
    min-width: 0;
    padding: 0 12px;
  }

  .apps-card {
    padding: 10px;
  }

  .apps-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}
</style>
