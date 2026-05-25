<template>
  <section class="feature-section">
    <div class="feature-bg">
      <div class="feature-badge">ELEVATE YOUR GARMIN EXPERIENCE</div>
      <h2 class="feature-title">Transform Your Watch Into A Masterpiece</h2>
      <div class="feature-desc">
        Discover our curated collection of premium watch faces designed exclusively for Garmin devices. 
        Each design balances stunning aesthetics with practical functionality, giving you:
      </div>

      <div class="feature-actions">
        <button class="feature-cta" @click="goToPurchaseOptions">Download & Unlock</button>
      </div>
      
      <div class="feature-cards">
        <div class="feature-card">
          <div class="feature-icon feature-icon-blue">
            <el-icon><Plus /></el-icon>
          </div>
          <div class="feature-card-title">Unique Style</div>
          <div class="feature-card-desc">Express your personality with designs you won't find anywhere else</div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon feature-icon-green">
            <el-icon><Check /></el-icon>
          </div>
          <div class="feature-card-title">Health Tracking</div>
          <div class="feature-card-desc">Monitor your vitals with beautiful, easy-to-read displays</div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon feature-icon-purple">
            <el-icon><Lightning /></el-icon>
          </div>
          <div class="feature-card-title">Battery Efficient</div>
          <div class="feature-card-desc">Optimized designs that won't drain your watch battery</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus, Check, Lightning } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router'

const router = useRouter()

const goToPurchaseOptions = () => {
  router.push({ name: 'PurchaseOptions' })
}
</script>

<style scoped>
.feature-section {
  width: 100%;
  background: linear-gradient(180deg, #f8fbfa 0%, #eef5f3 100%);
  padding: 20px 16px;
  margin: 0;
  box-sizing: border-box;
}

.feature-bg {
  max-width: var(--container);
  margin: 48px auto;
  border-radius: var(--radius-lg);
  background: rgba(255,255,255,0.78);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-line);
  padding: 64px 24px 56px 24px;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.feature-badge {
  display: inline-block;
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
  font-size: 1rem;
  font-weight: 600;
  border-radius: 999px;
  padding: 6px 22px;
  margin: 0 auto 24px auto;
  letter-spacing: 1px;
  text-align: center;
  max-width: fit-content;
}

.feature-title {
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 800;
  color: var(--color-ink);
  text-align: center;
  margin-bottom: 28px;
  letter-spacing: 1px;
}

.feature-desc {
  font-size: 1.25rem;
  color: var(--color-muted);
  text-align: center;
  max-width: 700px;
  margin: 0 auto 44px auto;
  line-height: 1.7;
}

.feature-actions {
  display: flex;
  justify-content: center;
  margin: 0 auto 36px;
}

.feature-cta {
  border: none;
  border-radius: 999px;
  padding: 14px 26px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: #fff;
  background: linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-strong) 100%);
  box-shadow: 0 10px 30px rgba(15, 107, 104, 0.18);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}

.feature-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 36px rgba(15, 107, 104, 0.22);
  filter: saturate(1.05);
}

.feature-cta:active {
  transform: translateY(0px) scale(0.99);
}

.feature-cards {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 36px;
  margin-top: 0;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  box-sizing: border-box;
}

.feature-card {
  background: #fff;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-line);
  padding: 24px 20px 32px 20px;
  min-width: 180px;
  max-width: 220px;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin-bottom: 18px;
}

.feature-icon-blue {
  background: var(--color-brand-soft);
  color: var(--color-brand);
}

.feature-icon-green {
  background: #ecfdf3;
  color: #34c759;
}

.feature-icon-purple {
  background: #fff7ed;
  color: var(--color-accent);
}

.feature-card-title {
  font-size: 1.18rem;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 8px;
}

.feature-card-desc {
  font-size: 1.05rem;
  color: var(--color-muted);
  line-height: 1.6;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .feature-section {
    padding: 20px 12px;
  }
  
  .feature-bg {
    padding: 40px 20px 48px 20px;
    margin: 24px auto;
    border-radius: 24px;
    width: 100%;
  }

  .feature-badge {
    font-size: 0.9rem;
    padding: 5px 18px;
    margin-bottom: 20px;
  }

  .feature-title {
    font-size: 2rem;
    margin-bottom: 18px;
    line-height: 1.2;
    padding: 0 8px;
  }

  .feature-desc {
    font-size: 1rem;
    margin-bottom: 32px;
    padding: 0 8px;
    line-height: 1.6;
  }

  .feature-cards {
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 0 8px;
  }

  .feature-card {
    max-width: 100%;
    width: 100%;
    padding: 20px 16px 24px 16px;
  }
  
}

@media (max-width: 480px) {
  .feature-section {
    padding: 16px 8px;
  }
  
  .feature-bg {
    padding: 32px 16px 40px 16px;
    margin: 16px auto;
    border-radius: 20px;
  }
  
  .feature-title {
    font-size: 1.8rem;
    padding: 0 4px;
  }
  
  .feature-desc {
    font-size: 0.95rem;
    padding: 0 4px;
  }
  
  .feature-cards {
    padding: 0 4px;
    gap: 16px;
  }
  
  .feature-card {
    padding: 18px 14px 20px 14px;
  }
  
  .feature-card-title {
    font-size: 1.1rem;
  }
  
  .feature-card-desc {
    font-size: 1rem;
  }
}
</style>
