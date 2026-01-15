<template>
  <div class="creators-page">
    <div class="creators-hero">
      <div class="creators-hero-content">
        <p class="creators-badge">For Garmin Watch Face Designers</p>
        <h1 class="creators-title">
          <span>Become a</span>
          <span class="highlight">Wristo Creator</span>
        </h1>
        <p class="creators-subtitle">
          Free to start. Let your work speak. Unlock data. Build long-term
          revenue.
        </p>
        <div class="creators-cta-group">
          <button class="btn-primary" @click="handleStart">
            Start for Free
          </button>
          <button class="btn-secondary" @click="handleViewPath">
            View Creator Growth Path
          </button>
        </div>
      </div>
    </div>

    <main class="creators-main">
      <section
        v-if="showGrowthPath"
        class="creators-section stages"
        id="creator-growth-roadmap"
      >
        <h2 class="section-title">🎯 Creator Growth Roadmap</h2>

        <div class="path-header">
          <p class="path-label">Four clear stages to grow as a creator</p>
          <div class="path-steps">
            <span
              v-for="n in 4"
              :key="n"
              class="path-step"
              :class="{ active: n === activeStage }"
              @click="goStage(n)"
            />
          </div>
          <!-- <p class="path-caption">Stage {{ activeStage }} of 4</p> -->
        </div>
        <div class="stage-slider">
          <div
            class="stage-track"
            :style="{ transform: `translateX(-${(activeStage - 1) * 25}%)` }"
          >
            <article class="stage-card">
              <h3 class="stage-title">🌱 Stage 1 · Free Creator</h3>
              <p class="stage-subtitle">You just joined Wristo.</p>
              <p class="section-text">You can:</p>
              <ul class="bullet-list">
                <li>✅ Use the full design toolset</li>
                <li>✅ Publish <strong>free watch faces</strong></li>
                <li>✅ No limits on quantity or updates</li>
                <li>✅ Get platform exposure and real user downloads</li>
              </ul>
              <p class="section-text">What this stage means:</p>
              <ul class="bullet-list">
                <li>Validate your design style</li>
                <li>Get real user feedback</li>
                <li>Accumulate downloads and reputation</li>
              </ul>
              <p class="note">
                Free stage has <strong>no time limit</strong>. We will not
                remove you just because you are "slow".
              </p>
            </article>

            <article class="stage-card">
              <h3 class="stage-title">🚀 Stage 2 · User Validation</h3>
              <p class="stage-subtitle">
                When your work starts to be recognized.
              </p>
              <p class="section-text">We only look at three things:</p>
              <ul class="bullet-list">
                <li>📥 Downloads</li>
                <li>⭐ User feedback</li>
                <li>🔁 Whether you keep updating</li>
              </ul>
              <p class="section-text">When you meet any of these:</p>
              <ul class="bullet-list">
                <li>
                  Any single work reaches ≥ <strong>1,000</strong> downloads
                </li>
                <li>
                  Or all works together reach ≥
                  <strong>10,000</strong> downloads
                </li>
              </ul>
              <p class="highlight-card">
                🎉 You automatically unlock
                <strong>paid publishing rights</strong>.
                <br />
                No application, no manual review.
              </p>
            </article>

            <article class="stage-card">
              <h3 class="stage-title">💰 Stage 3 · Pro Creator</h3>
              <p class="stage-subtitle">
                You now have monetization capability.
              </p>
              <p class="section-text">You can:</p>
              <ul class="bullet-list">
                <li>💵 Publish paid watch faces</li>
                <li>🔓 Freely mix free and paid works</li>
                <li>📊 View download and revenue data</li>
                <li>💳 Join platform revenue settlement</li>
              </ul>
              <p class="note">
                Whether to charge is <strong>entirely up to you</strong>. Free
                works can still be published long term. The platform will
                <strong>never force you to monetize</strong>.
              </p>
            </article>

            <article class="stage-card">
              <h3 class="stage-title">🔄 Stage 4 · Sustainable Creator</h3>
              <p class="stage-subtitle">This is where we hope you stay.</p>
              <ul class="bullet-list">
                <li>✅ Account kept permanently as long as you create</li>
                <li>✅ Free publishing rights stay valid</li>
                <li>✅ Historical works remain visible</li>
              </ul>
              <p class="note">
                If you only ship paid works for <strong>3–6 months</strong>, with
                monthly revenue &lt; <strong>$100</strong> and no new updates, the
                platform may temporarily pause your ability to add new paid
                works.
              </p>
              <p class="note">We will:</p>
              <ul class="bullet-list">
                <li>❌ Not ban your account</li>
                <li>❌ Not remove your free works</li>
                <li>✅ Let you unlock again with new creations</li>
              </ul>
            </article>
          </div>
        </div>

        <div class="path-controls">
          <div class="path-controls-left">
            <button
              v-if="activeStage > 1"
              class="btn-secondary prev-step-btn"
              @click="handlePrevStage"
            >
              Previous
            </button>
          </div>
          <div class="path-controls-right">
            <button
              v-if="activeStage < 4"
              class="btn-primary next-step-btn"
              @click="handleNextStage"
            >
              Next Step
            </button>
            <p
              v-else
              class="path-complete-text"
            >
              You've explored all 4 stages. Keep creating — this path is
              designed to grow with you.
            </p>
          </div>
        </div>
      </section>

      <section class="creators-section why">
        <h2 class="section-title">Why Wristo?</h2>
        <ul class="bullet-list">
          <li>
            🎨 A creation platform built specifically for Garmin watch face
            designers
          </li>
          <li>🛠️ Complete, mature, and continuously evolving design tools</li>
          <li>📈 Real user data defines your growth path</li>
          <li>🤝 Transparent rules, no manual favor, no relationship games</li>
        </ul>
        <blockquote class="quote">
          We believe:
          <br />
          <strong>Good design deserves to be seen and respected.</strong>
        </blockquote>
      </section>

      <section class="creators-section rules">
        <h2 class="section-title">🛡️ What We Won't Do</h2>
        <ul class="bullet-list">
          <li>❌ Ban you because sales are low</li>
          <li>❌ Restrict you based on subjective judgment</li>
          <li>❌ Change or blur rules temporarily</li>
        </ul>
        <p class="section-text">
          All rules will be public in advance and stay effective long term.
        </p>
      </section>

      <section class="creators-section promise">
        <h2 class="section-title">🤝 Wristo's Promise</h2>
        <ul class="bullet-list">
          <li>📜 All rules are open and transparent</li>
          <li>📊 All permissions are based on real data</li>
          <li>🧭 All growth paths are predictable and repeatable</li>
        </ul>
        <p class="section-text">
          We are not "judges". We are the <strong>amplifier</strong>.
        </p>
      </section>

      <section class="creators-section summary">
        <h2 class="section-title">✨ In One Sentence</h2>
        <blockquote class="quote">
          You design.
          <br />
          Users choose.
          <br />
          Wristo amplifies the value.
        </blockquote>
        <p class="section-text">
          If you are already creating, Wristo has prepared the stage for you.
        </p>
        <div class="creators-cta-inline">
          <button class="btn-primary" @click="handleStart">
            Start Now · Join for Free
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Growth path state
const showGrowthPath = ref(false);
const activeStage = ref(0);

// CTA handlers are placeholders for future integration
const handleStart = () => {
  window.open("https://studio.wristo.io/", "_blank");
};

const revealFirstStage = () => {
  showGrowthPath.value = true;
  if (activeStage.value === 0) {
    activeStage.value = 1;
  }
};

const handleViewPath = () => {
  revealFirstStage();
  // Smooth scroll to the growth path section
  const el = document.getElementById("creator-growth-roadmap");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const handleNextStage = () => {
  if (activeStage.value < 4) {
    activeStage.value += 1;
  }
};

const handlePrevStage = () => {
  if (activeStage.value > 1) {
    activeStage.value -= 1;
  }
};

const goStage = (stage: number) => {
  if (stage >= 1 && stage <= 4) {
    showGrowthPath.value = true;
    activeStage.value = stage;
  }
};
</script>

<style scoped>
.creators-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fafbff 0%, #ffffff 50%, #f8f9ff 100%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI",
    sans-serif;
}

.creators-hero {
  padding: 96px 24px 64px;
  display: flex;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.03) 0%,
    rgba(236, 72, 153, 0.02) 100%
  );
}

.creators-hero-content {
  max-width: 880px;
  width: 100%;
  text-align: center;
}

.creators-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(99, 102, 241, 0.12);
}

.creators-title {
  margin-top: 24px;
  margin-bottom: 16px;
  font-size: 3.5rem;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: #1d1d1f;
}

.creators-title span {
  display: block;
}

.creators-title .highlight {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 800;
}

.creators-subtitle {
  margin-top: 12px;
  font-size: 1.25rem;
  line-height: 1.5;
  color: #6e6e73;
  font-weight: 400;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}

.creators-cta-group {
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  align-items: center;
}

.btn-primary {
  border: none;
  border-radius: 980px;
  padding: 14px 32px;
  font-size: 1.0625rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.24),
    0 8px 32px rgba(79, 70, 229, 0.12);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.01em;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.28),
    0 12px 40px rgba(79, 70, 229, 0.16);
  background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  border-radius: 980px;
  padding: 14px 32px;
  font-size: 1.0625rem;
  font-weight: 600;
  color: #1d1d1f;
  background: rgba(255, 255, 255, 0.9);
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  letter-spacing: -0.01em;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.btn-secondary:active {
  transform: translateY(0);
}

.btn-link {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  color: #4f46e5;
  cursor: pointer;
  transition: color 0.2s ease;
  letter-spacing: -0.01em;
}

.btn-link:hover {
  color: #4338ca;
}

.creators-main {
  max-width: 980px;
  width: 100%;
  margin: 0 auto 80px;
  padding: 0 24px 64px;
}

.creators-section {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 40px 36px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 12px 40px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.creators-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06), 0 16px 48px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #6e6e73;
  margin-bottom: 12px;
  font-weight: 500;
}

.section-text {
  font-size: 1.0625rem;
  color: #515154;
  line-height: 1.7;
  margin-bottom: 12px;
  font-weight: 400;
}

.section-text.strong {
  margin-top: 12px;
  font-size: 1.125rem;
  line-height: 1.8;
}

.section-text.strong strong {
  color: #1d1d1f;
  font-weight: 600;
}

.bullet-list {
  list-style: none;
  padding-left: 0;
  margin: 16px 0;
  color: #515154;
  font-size: 1.0625rem;
  line-height: 1.8;
}

.bullet-list li + li {
  margin-top: 8px;
}

.bullet-list li strong {
  color: #1d1d1f;
  font-weight: 600;
}

.path-header {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  text-align: center;
}

.path-label {
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #6e6e73;
}

.path-steps {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.path-step {
  width: 32px;
  height: 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.3);
  transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
}

.path-step.active {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  transform: translateY(-1px);
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.4);
}

.path-caption {
  font-size: 0.95rem;
  color: #6e6e73;
}

.path-controls {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prev-step-btn,
.next-step-btn {
  min-width: 120px;
}

.path-controls-left,
.path-controls-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.path-controls-left {
  justify-content: flex-start;
}

.path-controls-right {
  justify-content: flex-end;
}

.path-complete-text {
  font-size: 0.98rem;
  color: #515154;
}

.quote {
  margin-top: 20px;
  padding: 20px 24px;
  border-left: 4px solid #6366f1;
  background: linear-gradient(
    135deg,
    rgba(249, 250, 251, 0.9),
    rgba(243, 244, 246, 0.9)
  );
  border-radius: 16px;
  font-size: 1.125rem;
  color: #1d1d1f;
  line-height: 1.7;
  backdrop-filter: blur(10px);
}

.quote strong {
  font-weight: 600;
}

.stage-card {
  margin-top: 12px;
  padding: 20px 18px;
  border-radius: 24px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95),
    rgba(249, 250, 251, 0.95)
  );
  border: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stage-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.stage-slider {
  overflow: hidden;
  margin-top: 8px;
}

.stage-track {
  display: flex;
  width: 400%;
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.stage-slider .stage-card {
  flex: 0 0 25%;
  max-width: 25%;
  margin-top: 0;
  padding-inline: 24px;
  box-sizing: border-box;
}

.stage-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.stage-subtitle {
  font-size: 1rem;
  color: #6e6e73;
  margin-bottom: 10px;
  font-weight: 500;
}

.note {
  margin-top: 12px;
  font-size: 1rem;
  color: #6e6e73;
  line-height: 1.6;
}

.note strong {
  color: #1d1d1f;
  font-weight: 600;
}

.highlight-card {
  margin-top: 16px;
  padding: 16px 20px;
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    rgba(238, 242, 255, 0.9),
    rgba(254, 242, 242, 0.9)
  );
  color: #1d1d1f;
  font-size: 1.0625rem;
  line-height: 1.7;
  border: 1px solid rgba(99, 102, 241, 0.12);
  backdrop-filter: blur(10px);
}

.highlight-card strong {
  font-weight: 600;
}

.creators-cta-inline {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.summary .creators-cta-inline {
  justify-content: center;
}

@media (max-width: 768px) {
  .creators-hero {
    padding: 72px 20px 48px;
  }

  .creators-title {
    font-size: 2.5rem;
  }

  .creators-subtitle {
    font-size: 1.125rem;
  }

  .creators-section {
    border-radius: 24px;
    padding: 28px 24px;
  }

  .creators-main {
    padding: 0 20px 48px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 12px 28px;
    font-size: 1rem;
  }
}

@media (max-width: 640px) {
  .creators-hero {
    padding: 64px 16px 40px;
  }

  .creators-title {
    font-size: 2rem;
  }

  .creators-subtitle {
    font-size: 1rem;
  }

  .creators-section {
    border-radius: 20px;
    padding: 24px 20px;
  }

  .creators-main {
    padding: 0 16px 40px;
  }

  .section-title {
    font-size: 1.375rem;
  }

  .stage-card {
    padding: 20px 18px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .creators-cta-group {
    flex-direction: column;
    width: 100%;
  }
}
</style>
