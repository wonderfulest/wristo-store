<template>
  <div class="contact-page">
    <div class="contact-container">
      <div class="contact-header">
        <h1 class="contact-title">Contact Us</h1>
        <p class="contact-subtitle">
          Have questions or need support? We're here to help you get the most out of your experience.
        </p>
      </div>
      
      <div class="contact-content">
        <div class="contact-info">
          <div class="info-card">
            <div class="info-header">
              <div class="info-icon">📧</div>
              <h3>Email Support</h3>
            </div>
            <p>Get in touch with our support team for technical assistance and general inquiries.</p>
            <a href="mailto:support@wristo.io" class="info-link">support@wristo.io</a>
          </div>
          
          <div class="info-card">
            <div class="info-header">
              <div class="info-icon">⏰</div>
              <h3>Response Time</h3>
            </div>
            <p>We typically respond within 24 hours during business days. For urgent issues, please include "URGENT" in your subject line.</p>
          </div>
          
          <div class="info-card">
            <div class="info-header">
              <div class="info-icon">📋</div>
              <h3>Before Contacting</h3>
            </div>
            <p>Check our <router-link to="/faq" class="info-link">FAQ page</router-link> for quick answers to common questions. You might find the solution you need right away!</p>
          </div>
        </div>
        
        <div class="contact-form-section">
          <ContactForm @send="handleContactSend" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContactForm from '@/components/ContactForm.vue'

function handleContactSend(message: string, email?: string) {
  // 这里可集成实际的消息发送逻辑
  console.log('Contact form submitted:', { message, email })
}
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px 0;
}

.contact-container {
  max-width: 1200px;
  margin: 0 auto;
}

.contact-header {
  text-align: center;
  margin-bottom: 60px;
}

.contact-title {
  font-size: 3rem;
  font-weight: 800;
  color: #1d1d1f;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.contact-subtitle {
  font-size: 1.2rem;
  color: #86868b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.contact-content {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 60px;
  align-items: start;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.info-icon {
  font-size: 1.6rem;
  display: block;
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-content h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
  letter-spacing: -0.5px;
}

.info-content p {
  color: #86868b;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 8px;
}

.info-link {
  color: #007aff;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.info-link:hover {
  color: #0056b3;
}

.contact-form-section {
  position: sticky;
  top: 40px;
}

@media (max-width: 1024px) {
  .contact-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .contact-form-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .contact-page {
    padding: 20px 16px;
  }
  
  .contact-title {
    font-size: 2rem;
  }
  
  .contact-subtitle {
    font-size: 1.1rem;
  }
  
  .info-card {
    padding: 16px;
  }
  
  .info-icon {
    font-size: 1.4rem;
  }
  
  .info-content h3 {
    font-size: 1rem;
  }
  
  .info-content p {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .contact-header {
    margin-bottom: 40px;
  }
  
  .contact-title {
    font-size: 1.8rem;
  }
  
  .contact-subtitle {
    font-size: 1rem;
  }
  
  .contact-content {
    gap: 32px;
  }
  
  .info-card {
    padding: 14px;
  }
  
  .info-icon {
    font-size: 1.2rem;
  }
  
  .info-content h3 {
    font-size: 0.95rem;
  }
  
  .info-content p {
    font-size: 0.8rem;
  }
}
</style>
