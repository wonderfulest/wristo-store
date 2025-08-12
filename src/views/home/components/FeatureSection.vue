<template>
  <section class="feature-section">
    <div class="feature-bg">
      <!-- Background circle decorations -->
      <div class="feature-circle feature-circle-1"></div>
      <div class="feature-circle feature-circle-2"></div>
      <div class="feature-circle feature-circle-3"></div>
      <div class="feature-circle feature-circle-4"></div>
      <div class="feature-circle feature-circle-5"></div>
      <div class="feature-circle feature-circle-6"></div>
      
      <div class="feature-badge">ELEVATE YOUR GARMIN EXPERIENCE</div>
      <h2 class="feature-title">Transform Your Watch Into A Masterpiece</h2>
      <div class="feature-desc">
        Discover our curated collection of premium watch faces designed exclusively for Garmin devices. 
        Each design balances stunning aesthetics with practical functionality, giving you:
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
</script>

<style scoped>
.feature-section {
  width: 100%;
  background: linear-gradient(135deg, #eaf1ff 0%, #f6f7fb 100%);
  padding: 20px 16px;
  margin: 0;
  box-sizing: border-box;
}

.feature-bg {
  max-width: 1200px;
  margin: 48px auto;
  border-radius: 36px;
  background: rgba(255,255,255,0.55);
  box-shadow: 0 8px 32px 0 rgba(80, 110, 255, 0.08);
  padding: 64px 24px 56px 24px;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.feature-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.25;
  z-index: 1;
  pointer-events: none;
}

.feature-circle-1 {
  width: 160px;
  height: 160px;
  left: -60px;
  top: -60px;
  background: #bcdcff;
}

.feature-circle-2 {
  width: 100px;
  height: 100px;
  right: -40px;
  top: 40px;
  background: #e6edfd;
}

.feature-circle-3 {
  width: 80px;
  height: 80px;
  left: 60px;
  bottom: -30px;
  background: #e6f9ed;
}

.feature-circle-4 {
  width: 120px;
  height: 120px;
  right: 80px;
  bottom: -50px;
  background: #f3eafd;
}

.feature-circle-5 {
  width: 70px;
  height: 70px;
  left: 32%;
  top: 58%;
  background: #e6edfd;
}

.feature-circle-6 {
  width: 90px;
  height: 90px;
  right: 28%;
  top: 38%;
  background: #f3eafd;
}

.feature-badge {
  display: inline-block;
  background: #e6edfd;
  color: #4a6cf7;
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
  font-size: 2.8rem;
  font-weight: 800;
  color: #4a3aff;
  text-align: center;
  margin-bottom: 28px;
  letter-spacing: 1px;
}

.feature-desc {
  font-size: 1.25rem;
  color: #444;
  text-align: center;
  max-width: 700px;
  margin: 0 auto 44px auto;
  line-height: 1.7;
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
  border-radius: 20px;
  box-shadow: 0 4px 24px 0 rgba(80, 110, 255, 0.10);
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
  box-shadow: 0 8px 32px 0 rgba(80, 110, 255, 0.15);
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
  background: #e6edfd;
  color: #4a6cf7;
}

.feature-icon-green {
  background: #e6f9ed;
  color: #34c759;
}

.feature-icon-purple {
  background: #f3eafd;
  color: #a259ff;
}

.feature-card-title {
  font-size: 1.18rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 8px;
}

.feature-card-desc {
  font-size: 1.05rem;
  color: #666;
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
  
  /* 调整背景圆圈在移动端的位置 */
  .feature-circle-1 {
    width: 120px;
    height: 120px;
    left: -40px;
    top: -40px;
  }
  
  .feature-circle-2 {
    width: 80px;
    height: 80px;
    right: -30px;
    top: 30px;
  }
  
  .feature-circle-4 {
    width: 100px;
    height: 100px;
    right: 60px;
    bottom: -40px;
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
