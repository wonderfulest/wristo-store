<template>
  <div class="contact-faq">
    <Logo />
    <h2 class="title">Product Support & Contact</h2>
    <p class="desc">Have questions about <span class="product-name">{{ productName }}</span>? We are here to help:</p>
    <div class="faq-list">
      <div class="faq-item" v-for="(item, idx) in faqs" :key="idx">
        <h3 class="faq-q">{{ item.q }}</h3>
        <div class="faq-a" v-html="item.a"></div>
      </div>
    </div>
    <div class="contact-block">
      <h3>Need more help?</h3>
      <p>Please contact us via the following methods:</p>
      <ul>
        <li>Email: <a :href="`mailto:support@wristo.io?subject=Product Inquiry: ${productName}`">support@wristo.io</a></li>
        <li>Or leave a message below, we will reply as soon as possible.</li>
      </ul>
      <textarea placeholder="Please enter your question or feedback..." v-model="message"></textarea>
      <button class="send-btn" @click="sendMessage">Send</button>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Footer from '@/components/Footer.vue'
import Logo from '@/components/Logo.vue'

const route = useRoute()
const productId = computed(() => route.params.productId)
// 实际项目可根据 productId 获取产品名，这里演示用
const productName = computed(() => `Product #${productId.value}`)

const faqs = [
  {
    q: 'I have already purchased, why am I being charged again?',
    a: 'In some cases, the system may not recognize your previous purchase (such as after reinstalling the app/watch face). You can unlock for free via <a href="https://kzl.io/unlock" target="_blank">this page</a>.',
  },
  {
    q: 'How do I get my purchase code?',
    a: 'No special purchase code is needed. Just install the watch face/app on your device and follow the instructions. If you need to unlock again, visit <a href="https://kzl.io/unlock" target="_blank">this page</a>.',
  },
  {
    q: 'Is this a one-time payment or a subscription?',
    a: 'All watch faces/apps are one-time payments for lifetime use.',
  },
  {
    q: 'How can I find my past purchases?',
    a: 'You can view all your purchase records on the <a href="https://kiezelpay.com/lookup" target="_blank">purchase history lookup</a> page.',
  },
  {
    q: 'I bought a bundle, how do I install other watch faces/apps?',
    a: 'After purchase, you will receive an email with download links for all items, or you can check via <a href="https://kiezelpay.com/lookup" target="_blank">this page</a>.',
  },
  {
    q: 'What if I cannot unlock or cannot find my purchase record?',
    a: 'Please make sure your email is correct, or contact us using the information at the bottom of the page.',
  },
]

const message = ref('')
function sendMessage() {
  if (!message.value.trim()) {
    alert('Please enter your question or feedback')
    return
  }
  // 这里可集成实际的消息发送逻辑
  alert('Received! We will reply as soon as possible!')
  message.value = ''
}
</script>

<style scoped>
.contact-faq {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 16px 0 16px;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  color: #fff;
  background: #111;
  min-height: 100vh;
}
.logo {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #fff;
}
.logo span {
  color: #6fcf97;
}
.title {
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
  color: #fff;
}
.desc {
  color: #bbb;
  margin-bottom: 2rem;
}
.product-name {
  color: #6fcf97;
  font-weight: bold;
}
.faq-list {
  margin-bottom: 2.5rem;
}
.faq-item {
  margin-bottom: 1.8rem;
  background: #181818;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 12px #0002;
}
.faq-q {
  font-size: 1.1rem;
  color: #6fcf97;
  margin-bottom: 8px;
}
.faq-a {
  color: #eee;
  font-size: 1rem;
}
.contact-block {
  background: #181818;
  border-radius: 12px;
  padding: 20px 20px 24px 20px;
  margin-bottom: 2.5rem;
  box-shadow: 0 2px 12px #0002;
}
.contact-block h3 {
  color: #6fcf97;
  margin-bottom: 8px;
}
.contact-block ul {
  margin: 0 0 10px 0;
  padding-left: 18px;
  color: #eee;
}
.contact-block textarea {
  width: 100%;
  min-height: 70px;
  border-radius: 8px;
  border: 1px solid #333;
  padding: 10px;
  margin: 10px 0 12px 0;
  font-size: 1rem;
  background: #222;
  color: #fff;
  resize: vertical;
}
.send-btn {
  background: #2d6a4f;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.send-btn:hover {
  background: #40916c;
}
a {
  color: #6fcf97;
  text-decoration: underline;
}
</style> 