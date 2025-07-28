<template>
  <div class="uninstall-guide">
    <div class="container">
      <h1 class="title">How to Uninstall Watch Face</h1>
      
      <div class="content">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Open the Connect IQ App on your phone</h3>
            <p>Locate and open the Garmin Connect IQ app on your mobile device.</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Go to My Device</h3>
            <p>In the Connect IQ app, tap on "My Device" to view your installed apps and watch faces.</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Select "Installed apps"</h3>
            <p>Find and tap on the "Installed apps" option to see all installed watch faces and apps.</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3>Find and uninstall the watch face</h3>
            <p>Locate the watch face you want to remove (e.g., "Dark Meadow") and tap on the uninstall/trash icon next to it.</p>
          </div>
        </div>

        <div class="note">
          <h4>Need more help?</h4>
          <p>If you need further assistance with uninstalling the watch face or have questions about your purchase, please contact Garmin Support directly as all payments and billing are handled by the Garmin platform.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No script logic needed for this static page
</script>

<style scoped>
.uninstall-guide {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: #333;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a2a3a;
  margin-bottom: 2rem;
  text-align: center;
}

.content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.step {
  display: flex;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.step-number {
  background-color: #0070f3;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  margin-right: 1rem;
  margin-top: 0.25rem;
}

.step-content h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #1a2a3a;
}

.step-content p {
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

.note {
  background-color: #f7fafc;
  border-left: 4px solid #4299e1;
  padding: 1rem 1.5rem;
  margin-top: 2.5rem;
  border-radius: 0 4px 4px 0;
}

.note h4 {
  color: #2b6cb0;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.note p {
  margin: 0;
  color: #4a5568;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .uninstall-guide {
    padding: 1rem 0.5rem;
  }
  
  .title {
    font-size: 1.75rem;
  }
  
  .content {
    padding: 1.5rem 1rem;
  }
  
  .step {
    flex-direction: column;
    margin-bottom: 1.5rem;
  }
  
  .step-number {
    margin-bottom: 0.5rem;
  }
}
</style>
