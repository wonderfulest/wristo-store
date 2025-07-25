<template>
  <div class="checkout-help">
    <div class="help-card">
      <div class="help-header">
        <span class="help-icon">🛒</span>
        <h2 class="title">Activate trial / Checkout Help</h2>
      </div>
      <div class="section">
        <ol class="help-steps">
          <ul v-for="(step, idx) in steps" :key="idx" class="step-item">
            <div class="step-row">
              <span class="step-index">Step {{ idx + 1 }}.</span>
              <span class="step-text">{{ step.text }}</span>
              <button class="toggle-btn" @click="toggleImg(idx)" v-if="step.img !== null">
                <span v-if="showImg[idx]">Hide Image</span>
                <span v-else>Show Image</span>
              </button>
            </div>
            <transition name="fade">
              <img v-if="showImg[idx] && step.img !== null" class="step-img" :src="step.img" :alt="`Step ${idx+1}`" />
            </transition>
          </ul>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import step1 from '@/assets/checkout/checkout_01.jpg'
import step2 from '@/assets/checkout/checkout_02.jpg'
import step3 from '@/assets/checkout/checkout_03.jpg'
import step4 from '@/assets/checkout/checkout_04.jpg'
import step5 from '@/assets/checkout/checkout_05.jpg'
import { ref } from 'vue'
const steps = [
  { text: 'Install the Connect IQ Store app on your watch and trial until the code appears.', img: step1 },
  { text: 'Open the link https://www.wristo.io/code and enter the code on the watch face.', img: step2 },
  { text: 'Choose your product or bundle and click Proceed to Checkout. ', img: step3 },
  { text: 'Enter your email address for the receipt. ', img: step4 },
  { text: 'Select your payment method and complete the payment via Paddle.', img: step5 },
  { text: 'After payment, you will receive a confirmation email with your order details.', img: null },
]
const showImg = ref([false, false, false, false, false, false])
function toggleImg(idx: number) {
  showImg.value[idx] = !showImg.value[idx] && steps[idx].img !== null
}
</script>

<style scoped>
.checkout-help {
  min-height: 100vh;
  background: linear-gradient(120deg, #f7f8fa 60%, #eaf6ef 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 0 64px 0;
}
.help-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px #0001, 0 1.5px 6px #1db95422;
  max-width: 700px;
  width: 100%;
  padding: 40px 32px 32px 32px;
  margin: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.help-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}
.help-icon {
  font-size: 2.2rem;
  background: #eaf6ef;
  border-radius: 50%;
  padding: 12px;
  color: #1db954;
  box-shadow: 0 2px 8px #1db95422;
}
.title {
  font-size: 2rem;
  font-weight: 800;
  color: #1db954;
  margin: 0;
}
.section {
  margin-bottom: 32px;
}
.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a2a3a;
  margin-bottom: 16px;
  text-align: left;
}
.help-steps {
  margin-left: 0;
  margin-bottom: 18px;
  color: #222;
  font-size: 1.08rem;
  padding: 0;
}
.step-item {
  margin-bottom: 18px;
  text-align: left;
}
.step-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.step-index {
  color: #1db954;
  font-weight: 700;
  margin-right: 4px;
}
.step-text {
  flex: 1;
  text-align: left;
}
.toggle-btn {
  background: #eaf6ef;
  color: #1db954;
  border: none;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 0.98rem;
  cursor: pointer;
  transition: background 0.18s;
}
.toggle-btn:hover {
  background: #d2f5d6;
}
.step-img {
  display: block;
  margin: 12px 0 0 36px;
  width: 220px;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  background: #f7f8fa;
  border: 1.5px solid #eaf6ef;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.divider {
  height: 1.5px;
  background: linear-gradient(90deg, #eaf6ef 0%, #1db95433 100%);
  margin: 32px 0 24px 0;
  border-radius: 2px;
}
.faq-list {
  margin-left: 24px;
  color: #222;
  font-size: 1.08rem;
}
.faq-list li {
  margin-bottom: 16px;
  line-height: 1.7;
  text-align: left;
}
.answer {
  color: #1db954;
  font-weight: 500;
}
@media (max-width: 700px) {
  .help-card {
    padding: 18px 4vw 18px 4vw;
  }
  .checkout-help {
    padding: 24px 0 32px 0;
  }
  .title {
    font-size: 1.3rem;
  }
  .step-img {
    width: 98vw;
    max-width: 320px;
    margin-left: 0;
  }
}
</style> 