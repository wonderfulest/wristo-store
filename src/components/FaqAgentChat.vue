<template>
  <Teleport to="body">
    <section class="faq-agent" :class="{ open: isOpen }" aria-live="polite">
      <button
        v-if="!isOpen"
        class="agent-launcher"
        type="button"
        :aria-label="t('agent.open')"
        :title="t('agent.open')"
        @click="openAgent"
      >
        <Icon icon="solar:chat-round-dots-line-duotone" width="24" height="24" aria-hidden="true" />
      </button>

      <div v-else class="agent-panel" role="dialog" :aria-label="t('agent.title')">
        <header class="agent-header">
          <div>
            <div class="agent-title">{{ t('agent.title') }}</div>
            <div class="agent-subtitle">{{ t('agent.subtitle') }}</div>
          </div>
          <button class="icon-button" type="button" :aria-label="t('agent.close')" @click="isOpen = false">
            <Icon icon="solar:close-circle-line-duotone" width="22" height="22" aria-hidden="true" />
          </button>
        </header>

        <div ref="messagesEl" class="agent-messages">
          <div class="message assistant">
            <div class="bubble">{{ t('agent.greeting') }}</div>
          </div>

          <template v-for="message in messages" :key="message.id">
            <div class="message user">
              <div class="bubble">{{ message.query }}</div>
            </div>
            <div class="message assistant">
              <div class="bubble result-bubble">
                <template v-if="message.results.length">
                  <div class="result-count">{{ t('agent.found') }}</div>
                  <article v-for="result in message.results" :key="result.id" class="result-card">
                    <div class="result-meta">{{ result.category || resultLabel(result.type) }}</div>
                    <h3>{{ result.title }}</h3>
                    <p>{{ result.answer }}</p>
                    <RouterLink v-if="result.url" class="source-link" :to="localizedResultPath(result.url)">
                      {{ t('agent.viewSource') }}
                      <Icon icon="solar:arrow-right-up-line-duotone" width="15" height="15" aria-hidden="true" />
                    </RouterLink>
                  </article>
                </template>
                <template v-else>
                  <div class="result-count">{{ t('agent.noAnswerTitle') }}</div>
                  <p>{{ t('agent.noAnswerBody') }}</p>
                  <RouterLink class="source-link" :to="localizedResultPath('/faq/support')">
                    {{ t('agent.contactSupport') }}
                    <Icon icon="solar:arrow-right-up-line-duotone" width="15" height="15" aria-hidden="true" />
                  </RouterLink>
                </template>
              </div>
            </div>
          </template>
        </div>

        <form class="agent-form" @submit.prevent="submitQuery">
          <input
            v-model="query"
            class="agent-input"
            type="search"
            :placeholder="t('agent.placeholder')"
            :aria-label="t('agent.inputLabel')"
            autocomplete="off"
          />
          <button class="send-button" type="submit" :disabled="!canSubmit" :aria-label="t('agent.send')">
            <Icon icon="solar:plain-2-line-duotone" width="20" height="20" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useI18n } from '@/i18n'
import { addLocaleToPath, DEFAULT_LOCALE, stripLocaleFromPath, useLocaleStore } from '@/store/locale'
import { searchFaqAgent, type FaqAgentResult, type FaqAgentSourceType } from '@/utils/faqAgentSearch'

interface AgentMessage {
  id: number
  query: string
  results: FaqAgentResult[]
}

const { t } = useI18n()
const localeStore = useLocaleStore()
const isOpen = ref(false)
const query = ref('')
const messages = ref<AgentMessage[]>([])
const messagesEl = ref<HTMLElement | null>(null)
let nextMessageId = 1

const canSubmit = computed(() => query.value.trim().length >= 2)

function openAgent() {
  isOpen.value = true
  nextTick(scrollToBottom)
}

function submitQuery() {
  const text = query.value.trim()
  if (text.length < 2) return

  messages.value.push({
    id: nextMessageId++,
    query: text,
    results: searchFaqAgent(text, localeStore.currentLocale),
  })
  query.value = ''
  nextTick(scrollToBottom)
}

function resultLabel(type: FaqAgentSourceType): string {
  return type === 'guide' ? t('agent.guide') : t('agent.supportFaq')
}

function localizedResultPath(path: string): string {
  if (path === '/faq/support') return path
  const normalizedPath = stripLocaleFromPath(path)
  if (localeStore.currentLocale === DEFAULT_LOCALE) return normalizedPath
  return addLocaleToPath(normalizedPath, localeStore.currentLocale)
}

function scrollToBottom() {
  if (!messagesEl.value) return
  messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}
</script>

<style scoped>
.faq-agent {
  position: fixed;
  right: 16px;
  bottom: 112px;
  z-index: 10000;
  pointer-events: none;
}

.faq-agent.open {
  right: 16px;
  bottom: 24px;
}

.agent-launcher,
.icon-button,
.send-button {
  border: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.agent-launcher {
  pointer-events: auto;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  color: #fff;
  background: var(--color-brand);
  box-shadow: 0 18px 38px rgba(15, 107, 104, 0.26), 0 8px 18px rgba(17, 24, 39, 0.16);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.agent-launcher:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 46px rgba(15, 107, 104, 0.3), 0 12px 24px rgba(17, 24, 39, 0.18);
}

.agent-panel {
  pointer-events: auto;
  width: min(380px, calc(100vw - 32px));
  height: min(620px, calc(100vh - 48px));
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  border: 1px solid rgba(15, 107, 104, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.98);
  color: var(--color-text-primary);
  box-shadow: 0 24px 70px rgba(17, 24, 39, 0.18), 0 12px 28px rgba(15, 107, 104, 0.16);
}

.agent-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid rgba(15, 107, 104, 0.12);
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.96), rgba(255, 255, 255, 0.98));
}

.agent-title {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.25;
}

.agent-subtitle {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.35;
  color: var(--color-text-secondary);
}

.icon-button {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  color: var(--color-text-secondary);
  background: rgba(255, 255, 255, 0.74);
}

.icon-button:hover {
  color: var(--color-brand-strong);
  background: rgba(15, 107, 104, 0.08);
}

.agent-messages {
  overflow-y: auto;
  padding: 16px;
  background: #f8faf9;
}

.message {
  display: flex;
  margin-bottom: 12px;
}

.message.user {
  justify-content: flex-end;
}

.bubble {
  max-width: 88%;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.message.user .bubble {
  color: #fff;
  background: var(--color-brand);
  border-color: transparent;
}

.result-bubble {
  width: 100%;
  max-width: 100%;
}

.result-count {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-brand-strong);
}

.result-card {
  padding: 10px 0;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
}

.result-card:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.result-meta {
  margin-bottom: 4px;
  font-size: 11px;
  line-height: 1.3;
  color: var(--color-text-secondary);
}

.result-card h3 {
  margin: 0;
  font-size: 13px;
  line-height: 1.35;
  font-weight: 800;
  letter-spacing: 0;
}

.result-card p,
.result-bubble p {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--color-text-secondary);
}

.source-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-brand-strong);
  text-decoration: none;
}

.source-link:hover {
  text-decoration: underline;
}

.agent-form {
  display: grid;
  grid-template-columns: 1fr 42px;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid rgba(15, 107, 104, 0.12);
  background: #fff;
}

.agent-input {
  min-width: 0;
  width: 100%;
  height: 42px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--color-text-primary);
  outline: none;
}

.agent-input:focus {
  border-color: rgba(15, 107, 104, 0.48);
  box-shadow: 0 0 0 3px rgba(15, 107, 104, 0.12);
}

.send-button {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  color: #fff;
  background: var(--color-brand);
}

.send-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (min-width: 768px) {
  .faq-agent {
    right: 24px;
    bottom: 112px;
  }

  .faq-agent.open {
    right: 24px;
    bottom: 32px;
  }
}

@media (max-width: 520px) {
  .faq-agent.open {
    right: 8px;
    bottom: 8px;
  }

  .agent-panel {
    width: calc(100vw - 16px);
    height: min(560px, calc(100vh - 16px));
  }
}
</style>
