<template>
  <footer
    class="footer"
    :class="{ expanded: isExpanded }"
    tabindex="0"
    @click="toggle"
    @blur="collapse"
  >
    <div v-if="!isExpanded" class="footer-main">
      © 2025 WuKong OÜ |
      <a href="/terms-and-conditions">Terms of Use</a> |
      <a href="/privacy-policy">Privacy Policy</a> |
      <a href="/contact">Contact</a> |
      <a href="/faq">FAQ</a>
    </div>
    <transition name="footer-expand">
      <div v-if="isExpanded" class="footer-detail">
        <div class="footer-detail-title">© 2025 WuKong OÜ. All Rights Reserved</div>
        <div class="footer-detail-block">
          <strong>Address:</strong><br>
          Harju maakond, Tallinn, Kesklinna linnaosa, Ahtri tn 12, 15551, Estonia
        </div>
        <div class="footer-detail-block">
          <strong>Email:</strong>
          <a href="mailto:support@wristo.io">support@wristo.io</a>
        </div>
        <div class="footer-detail-block">
          <strong>Privacy Policy:</strong>
          <a href="/privacy-policy" target="_blank">View Details</a>
        </div>
        <div class="footer-detail-block">
          <strong>Contact us on SLACK:</strong>
          <a href="https://join.slack.com/t/wristo/shared_invite/zt-37oujfc82-w6vpl_hzGNYYmsmN5vNOzg" target="_blank">Join Slack Channel</a>
        </div>
        <div class="footer-detail-links">
          <a href="/terms-and-conditions">Terms of Use</a> |
          <a href="/privacy-policy">Privacy Policy</a> |
          <a href="/contact">Contact</a> |
          <a href="/faq">FAQ</a>
        </div>
      </div>
    </transition>
    <slot />
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const isExpanded = ref(false)
function toggle() {
  isExpanded.value = !isExpanded.value
}
function collapse() {
  isExpanded.value = false
}
</script>

<style scoped>
.footer {
  color: #888;
  font-size: 1rem;
  background: #000;
  padding: 16px 0 16px 0;
  text-align: center;
  cursor: pointer;
  outline: none;
  transition: background 0.2s;
  position: relative;
}
.footer-main {
  color: #ccc;
  font-size: 1.08rem;
  letter-spacing: 0.5px;
}
.footer a {
  color: #a5b4fc;
  text-decoration: underline;
  margin: 0 4px;
  transition: color 0.2s;
}
.footer a:hover {
  color: #fff;
}
.footer-detail {
  margin-top: 0;
  color: #eee;
  font-size: 1.05rem;
  line-height: 1.7;
  animation: fadeIn 0.3s;
  padding-bottom: 8px;
}
.footer-detail-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #fff;
}
.footer-detail-links {
  margin-top: 18px;
  color: #a5b4fc;
  font-size: 1.08rem;
}
.footer-detail-links a {
  color: #a5b4fc;
  margin: 0 4px;
}
.footer-expand-enter-active,
.footer-expand-leave-active {
  transition: max-height 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s;
}
.footer-expand-enter-from,
.footer-expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.footer-expand-enter-to,
.footer-expand-leave-from {
  max-height: 300px;
  opacity: 1;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 