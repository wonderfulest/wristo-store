<template>
  <section class="series-section">
    <div class="series-container">
      <div class="series-header">
        <div class="series-header-icon">
          <el-icon class="series-header-icon-inner"><Collection /></el-icon>
        </div>
        <h2 class="series-title">Browse by Series</h2>
      </div>
      <div class="series-grid">
        <div 
          v-for="series in seriesList" 
          :key="series.id" 
          class="series-item" 
          @click="$emit('series-click', series)"
        >
          <div class="series-img-wrap">
            <img :src="series.image || ''" :alt="series.name" class="series-img" />
          </div>
          <div class="series-name-row">
            <span class="series-name">{{ series.name }}</span>
            <span class="series-arrow">&rarr;</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Collection } from '@element-plus/icons-vue';
import type { Series } from '@/types';

defineProps<{
  seriesList: Series[];
}>();

defineEmits(['series-click']);
</script>

<style scoped>
.series-section {
  padding: 64px 16px;
  background: #fff;
  box-sizing: border-box;
}

.series-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

.series-header {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  justify-content: center;
}

.series-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ede9fe;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.series-header-icon-inner {
  color: #a78bfa;
  font-size: 24px;
}

.series-title {
  font-size: 2rem;
  font-weight: bold;
  color: #222;
  margin: 0;
}

.series-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px 16px;
  justify-items: center;
  align-items: start;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

.series-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 240px;
  cursor: pointer;
  transition: transform 0.3s ease;
  justify-self: center;
}

.series-item:hover {
  transform: translateY(-5px);
}

.series-img-wrap {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  overflow: hidden;
  background: #f7f8fa;
  box-shadow: 0 4px 24px 0 rgba(80, 110, 255, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin: 0 auto;
}

.series-item:hover .series-img-wrap {
  transform: scale(1.05);
  box-shadow: 0 8px 32px 0 rgba(80, 110, 255, 0.15);
}

.series-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  transition: transform 0.5s ease;
}

.series-item:hover .series-img {
  transform: scale(1.1);
}

.series-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
  gap: 8px;
}

.series-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: #222;
  transition: color 0.3s ease;
}

.series-item:hover .series-name {
  color: #4a3aff;
}

.series-arrow {
  font-size: 1.3rem;
  color: #b0b7c3;
  margin-left: 2px;
  font-weight: 400;
  transition: transform 0.3s ease, color 0.3s ease;
}

.series-item:hover .series-arrow {
  transform: translateX(5px);
  color: #4a3aff;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .series-section {
    padding: 48px 12px;
  }

  .series-container {
    padding: 0 8px;
  }

  .series-header {
    margin-bottom: 32px;
    flex-direction: column;
    gap: 12px;
  }

  .series-header-icon {
    margin-right: 0;
  }

  .series-title {
    font-size: 1.8rem;
    text-align: center;
  }

  .series-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 20px 12px;
    justify-content: center;
    padding: 0 8px;
  }

  .series-item {
    max-width: 180px;
  }

  .series-img-wrap {
    width: 160px;
    height: 160px;
  }

  .series-name {
    font-size: 1.05rem;
  }
}

@media (max-width: 480px) {
  .series-section {
    padding: 40px 8px;
  }

  .series-container {
    padding: 0 4px;
  }

  .series-title {
    font-size: 1.6rem;
  }

  .series-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 8px;
    padding: 0 4px;
    justify-items: center;
  }

  .series-item {
    max-width: 150px;
    width: 100%;
  }

  .series-img-wrap {
    width: 140px;
    height: 140px;
  }

  .series-name {
    font-size: 0.95rem;
  }

  .series-arrow {
    font-size: 1.1rem;
  }
}
</style>
