<template>
  <div class="faq-page">
    <Logo />
    <h1 class="faq-title">Frequently Asked Questions</h1>
    <div class="faq-section">
      <h2>Paid but asked to pay again?</h2>
      <p>In some cases, the system may not recognize your previous purchase (such as after reinstalling the app/watch face). You can unlock for free via <a href="https://wristo.io/unlock" target="_blank">this page</a>. Just enter the code shown on your device and your original purchase email.</p>
    </div>
    <div class="faq-section">
      <h2>Why do I see a payment prompt? How to remove it?</h2>
      <p>These prompts appear because you are using a paid app or watch face and the trial period has ended. If you do not wish to pay, you can uninstall the app/watch face or switch to a free watch face, and the prompt will disappear automatically.</p>
    </div>
    <div class="faq-section">
      <h2>Is this a one-time payment or a subscription?</h2>
      <p>All watch faces/apps are one-time payments for lifetime use. However, if the system cannot recognize your purchase after reinstallation, you may be asked to pay again. In this case, you can unlock for free via <a href="https://wristo.io/unlock" target="_blank">this page</a>.</p>
    </div>
    <div class="faq-section">
      <h2>"Unknown or already used" code error?</h2>
      <p>Each code is only valid for 1 hour. If expired, please restart the watch face/app to get a new code. For Fitbit, swipe to the today screen and return; for Garmin, restart your watch.</p>
    </div>
    <div class="faq-section">
      <h2>How to find my purchased items?</h2>
      <p>You can view all your purchase records on the <a href="https://wristo.io/lookup" target="_blank">purchase history lookup</a> page.</p>
    </div>
    <div class="faq-section">
      <h2>Bought a bundle, how to install other watch faces/apps?</h2>
      <p>After purchase, you will receive an email containing all items, or you can check via <a href="https://wristo.io/lookup" target="_blank">this page</a>. Please download on a phone/tablet with the Fitbit/Garmin/Pebble app installed.</p>
    </div>
    <div class="faq-section">
      <h2>What payment methods are supported?</h2>
      <p>We support PayPal and credit/debit cards. There is a $0.30 fee for credit card payments, so PayPal is recommended.</p>
    </div>
    <div class="faq-section">
      <h2>How to request a refund?</h2>
      <p>We offer a 14 days no reason refund. Please contact customer service via the contact information at the bottom of the page and provide your order details.</p>
    </div>
    <div class="faq-section">
      <h2>Didn't receive a code?</h2>
      <p>After installing the watch face/app, the code will be displayed automatically when the trial ends. If not shown, no action is needed and functionality is not affected.</p>
    </div>
    <div class="faq-section">
      <h2>Unlock prompt says not purchased?</h2>
      <p>Please make sure the email you entered at purchase is correct, and that the watch face/app name matches the one in your purchase email. If you still have issues, please contact customer service and provide your PayPal transaction ID or the first 6 and last 4 digits of your credit card.</p>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Logo from '@/components/Logo.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
.faq-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 16px 0 16px;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  color: #222;
  background: #fff;
  min-height: 100vh;
}
.faq-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
}
.faq-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 22px 24px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px #0001;
}
.faq-section h2 {
  font-size: 1.15rem;
  color: #2d6a4f;
  margin-bottom: 8px;
}
.faq-section p {
  color: #333;
  font-size: 1rem;
  line-height: 1.7;
}
a {
  color: #2d6a4f;
  text-decoration: underline;
}
</style> 