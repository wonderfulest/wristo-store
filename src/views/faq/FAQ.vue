<template>
  <div class="faq-container">
    <h1 class="faq-title">How can we help you?</h1>
    <div class="faq-searchbar">
      <span class="faq-search-icon">🔍</span>
      <input
        type="text"
        placeholder="Search for questions, keywords, topics..."
        v-model="search"
      />
    </div>
    <div class="faq-cards">
      <button
        v-for="(item) in cardQuestions"
        :key="item.key"
        class="faq-card"
        @click="onCardClick(item)"
        type="button"
      >
        <span class="faq-card-icon" v-html="item.icon" />
        <div class="faq-card-title">{{ item.title }}</div>
        <div class="faq-card-desc">{{ item.desc }}</div>
      </button>
    </div>
    <div class="faq-list">
      <div v-for="([cat, qs]) in filteredQuestionsByCategory" :key="cat" class="faq-category-block">
        <h2 class="faq-category-header">{{ cat }}</h2>
        <div v-for="(item, _) in (showMoreMap[cat] ? qs : qs.slice(0, 3))" :key="item.q" class="faq-item" :ref="el => setQuestionRef(globalIndex(cat, item), el as HTMLElement)">
          <button
            class="faq-question"
            :class="{ open: isOpen(globalIndex(cat, item)) }"
            @click="toggleOpen(globalIndex(cat, item))"
            :aria-expanded="isOpen(globalIndex(cat, item))"
            :aria-controls="'faq-answer-' + globalIndex(cat, item)"
          >
            <span class="q-icon">{{ isOpen(globalIndex(cat, item)) ? '−' : '+' }}</span>
            <span v-html="item.q" />
          </button>
          <div
            class="faq-answer"
            :class="{ show: isOpen(globalIndex(cat, item)) }"
            :id="'faq-answer-' + globalIndex(cat, item)"
            v-show="isOpen(globalIndex(cat, item))"
          >
            <div class="faq-answer-inner" v-html="item.a" />
          </div>
        </div>
        <button v-if="qs.length > 3" class="show-more-btn" @click="showMoreMap[cat] = !showMoreMap[cat]">
          {{ showMoreMap[cat] ? 'Show less' : 'Show more' }}
        </button>
      </div>
    </div>
    <ContactForm />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { cardQuestions, questionsByCategory } from '@/config/faq-data'
import ContactForm from '@/components/ContactForm.vue'

const allQuestions = computed(() => {
  return Object.entries(questionsByCategory).flatMap(([category, qs]) =>
    qs.map(q => ({ ...q, category }))
  )
})

const search = ref('')
const openIndex = ref<number[]>([])
const questionRefs = ref<Record<number, HTMLElement | null>>({})
const showMoreMap = ref<Record<string, boolean>>({})

const filteredQuestionsByCategory = computed(() => {
  if (!search.value.trim()) return Object.entries(questionsByCategory)
  const result: [string, any[]][] = []
  for (const [cat, qs] of Object.entries(questionsByCategory)) {
    const filtered = qs.filter(
      (item: any) =>
        item.q.toLowerCase().includes(search.value.toLowerCase()) ||
        (typeof item.a === 'string' ? item.a.toLowerCase().includes(search.value.toLowerCase()) : false)
    )
    if (filtered.length) result.push([cat, filtered])
  }
  return result
})

function globalIndex(cat: string, item: any) {
  return allQuestions.value.findIndex(q => q.q === item.q && q.category === cat)
}
function setQuestionRef(index: number, el: HTMLElement | null) {
  if (el) {
    questionRefs.value[index] = el
  }
}

onMounted(() => {
  // 每个分类下第一个问题默认展开
  const indices: number[] = []
  const allQ = allQuestions.value
  let catIdx = 0
  for (const [cat, qs] of Object.entries(questionsByCategory)) {
    if (qs.length > 0) {
      const idx = allQ.findIndex(q => q.q === qs[0].q && q.category === cat)
      if (idx !== -1) indices.push(idx)
    }
    catIdx++
  }
  openIndex.value = indices
})

function isOpen(index: number) {
  return openIndex.value.includes(index)
}

function toggleOpen(index: number) {
  if (isOpen(index)) {
    openIndex.value = openIndex.value.filter(i => i !== index)
  } else {
    openIndex.value = [...openIndex.value, index]
  }
}
const router = useRouter()
function onCardClick(item: any) {
  if (item.key === 'activate-trial') {
    router.push({ name: 'CheckoutHelp' })
    return
  }
  search.value = item.q
  // find the question in questionsByCategory
  const flatQuestions = Object.values(questionsByCategory).flat()
  const question = flatQuestions.find(q => q.q === item.q)
  if (question) {
    const cat = Object.keys(questionsByCategory).find(c => questionsByCategory[c].includes(question))!
    const index = globalIndex(cat, question)
    openIndex.value = [index] // 点击卡片时只展开当前问题
    nextTick(() => {
      const el = questionRefs.value[index]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }
}
</script>

<style scoped>
/* 参考 React 代码中的 style jsx，完整还原 FAQ 视觉风格 */
.faq-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 0 64px 0;
}
.faq-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #111;
  margin-bottom: 28px;
  text-align: left;
}
.faq-searchbar {
  display: flex;
  align-items: center;
  background: #fff;
  border: 3px solid #bbb;
  border-radius: 10px;
  padding: 0 18px;
  height: 56px;
  margin-bottom: 36px;
}
.faq-search-icon {
  font-size: 1.5em;
  margin-right: 10px;
  color: #888;
}
.faq-searchbar input {
  border: none;
  outline: none;
  font-size: 1.15rem;
  width: 100%;
  background: transparent;
  color: #222;
}
.faq-cards {
  display: flex;
  gap: 28px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.faq-card {
  flex: 1 1 200px;
  min-width: 200px;
  max-width: 300px;
  background: #f7f8fa;
  border-radius: 18px;
  border: none;
  box-shadow: 0 2px 8px #0001;
  padding: 32px 18px 28px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: box-shadow 0.2s, background 0.2s;
}
.faq-card:hover {
  background: #eaf6ef;
  box-shadow: 0 4px 16px #0002;
}
.faq-card-icon {
  margin-bottom: 18px;
}
.faq-card-title {
  font-size: 1.18rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 8px;
}
.faq-card-desc {
  color: #444;
  font-size: 1.02rem;
  text-align: center;
}
.faq-list {
  margin-bottom: 40px;
}
.faq-category-block {
  margin-bottom: 36px;
}
.faq-category-header {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1a2a3a;
  margin-bottom: 18px;
  margin-top: 18px;
}
.faq-item {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  margin-bottom: 18px;
  overflow: hidden;
}
.faq-question {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  outline: none;
  font-size: 1.13rem;
  font-weight: 600;
  color: #1a2a3a;
  padding: 20px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.2s;
}
.faq-question.open,
.faq-question:hover {
  background: #f5f7fa;
}
.q-icon {
  display: inline-block;
  width: 24px;
  font-size: 1.5em;
  color: #0070f3;
  margin-right: 10px;
  font-weight: bold;
}
.faq-answer {
  padding: 0 24px 18px 58px;
  color: #222;
  font-size: 1.05rem;
  line-height: 1.7;
}
.faq-answer-inner a {
  color: #0056b3;
  text-decoration: underline;
}

.show-more-btn {
  display: block;
  margin: 0 auto 18px auto;
  background: #eaf6ef;
  color: #1db954;
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.show-more-btn:hover {
  background: #d2f5d6;
}
@media (max-width: 900px) {
  .faq-cards {
    gap: 14px;
  }
}
@media (max-width: 600px) {
  .faq-container {
    padding: 24px 0 32px 0;
  }
  .faq-title {
    font-size: 1.5rem;
  }
  .faq-searchbar {
    height: 44px;
    padding: 0 8px;
  }
  .faq-cards {
    flex-direction: column;
    gap: 12px;
  }
  .faq-card {
    min-width: unset;
    max-width: unset;
    padding: 18px 8px 16px 8px;
  }
  .faq-category-header {
    font-size: 1.1rem;
    margin-bottom: 10px;
    margin-top: 10px;
  }
  .faq-question {
    padding: 16px 12px;
    font-size: 1rem;
  }
  .faq-answer {
    padding: 0 12px 14px 38px;
    font-size: 0.98rem;
  }
}
.faq-list,
.faq-category-block,
.faq-category-header,
.faq-category-block h2,
.faq-item,
.faq-question,
.faq-answer,
.faq-answer-inner {
  text-align: left !important;
}
</style> 