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
        v-for="(item, idx) in cardQuestions"
        :key="item.key"
        class="faq-card"
        @click="onCardClick(idx, item)"
        type="button"
      >
        <span class="faq-card-icon" v-html="item.icon" />
        <div class="faq-card-title">{{ item.title }}</div>
        <div class="faq-card-desc">{{ item.desc }}</div>
      </button>
    </div>
    <div class="faq-list">
      <div v-for="([cat, qs], catIdx) in filteredQuestionsByCategory" :key="cat" class="faq-category-block">
        <h2 class="faq-category-header">{{ cat }}</h2>
        <div v-for="(item, idx) in qs" :key="item.q" class="faq-item" :ref="el => setQuestionRef(globalIndex(cat, item), el)">
          <button
            class="faq-question"
            :class="{ open: openIndex === globalIndex(cat, item) }"
            @click="toggleOpen(globalIndex(cat, item))"
            :aria-expanded="openIndex === globalIndex(cat, item)"
            :aria-controls="'faq-answer-' + globalIndex(cat, item)"
          >
            <span class="q-icon">{{ openIndex === globalIndex(cat, item) ? '−' : '+' }}</span>
            <span v-html="item.q" />
          </button>
          <div
            class="faq-answer"
            :class="{ show: openIndex === globalIndex(cat, item) }"
            :id="'faq-answer-' + globalIndex(cat, item)"
            v-show="openIndex === globalIndex(cat, item)"
          >
            <div class="faq-answer-inner" v-html="item.a" />
          </div>
        </div>
      </div>
    </div>
    <div class="faq-contact">
      <h2>Still need help?</h2>
      <p>
        Our customer support is here to help. Please contact us at
        <a href="mailto:support@wristo.io">support@wristo.io</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const cardQuestions = [
  {
    key: 'already-paid',
    icon: `<svg width="40" height="40" fill="none" stroke="#1db954" stroke-width="2.5" viewBox="0 0 40 40"><text x="10" y="30" font-size="28" font-weight="bold">$</text></svg>`,
    title: 'Already Paid?',
    desc: 'Is it asking you to pay when you already did?',
    q: 'I already paid! Why am I charged a second time?',
    category: 'Installation & Purchase',
  },
  {
    key: 'not-getting-code',
    icon: `<svg width="40" height="40" fill="none" stroke="#1db954" stroke-width="2.5" viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" stroke="#1db954" stroke-width="2.5" fill="none"/><rect x="16" y="10" width="8" height="12" rx="4" fill="none"/><line x1="20" y1="20" x2="20" y2="14" stroke="#1db954" stroke-width="2.5"/><circle cx="20" cy="26" r="1.5" fill="#1db954"/></svg>`,
    title: 'Not Getting Code?',
    desc: 'Is your smart watch not showing a code?',
    q: 'How do I input the Code to unlock the trial?',
    category: 'Installation & Purchase',
  },
  {
    key: 'need-refund',
    icon: `<svg width="40" height="40" fill="none" stroke="#1db954" stroke-width="2.5" viewBox="0 0 40 40"><path d="M30 20a10 10 0 1 1-10-10" stroke="#1db954" stroke-width="2.5" fill="none"/><polyline points="30,20 30,10 20,10" stroke="#1db954" stroke-width="2.5" fill="none"/></svg>`,
    title: 'Need Refund?',
    desc: "Not satisfied? Let's start your refund right now.",
    q: 'How can I request a refund?',
    category: 'Installation & Purchase',
  },
  {
    key: 'purchase-history',
    icon: `<svg width="40" height="40" fill="none" stroke="#1db954" stroke-width="2.5" viewBox="0 0 40 40"><rect x="10" y="12" width="20" height="6" rx="2" stroke="#1db954" stroke-width="2.5" fill="none"/><rect x="10" y="22" width="20" height="6" rx="2" stroke="#1db954" stroke-width="2.5" fill="none"/></svg>`,
    title: 'Purchase History?',
    desc: 'Let us help you find your past purchases.',
    q: 'How can I find my purchase history?',
    category: 'Installation & Purchase',
  },
]

// 合并 a.js 的 questionsByCategory
const questionsByCategory = {
	"Installation & Purchase": [
		{
			q: "How do I install and try out the watch face I like?",
			a:
				'Select your favorite watch face on the garminface.com website, enter its details page, click the <strong>"Download"</strong> button. ' +
				"You will be redirected to the Connect IQ Store app page. After clicking download, " +
				"the watch face will be synchronized to your device through Garmin Express or the CONNECT APP, completing the installation.",
		},
		{
			q: "How do I input the Code to unlock the trial?",
			a:
				'Open the link <a href="https://wristo.io/code"><strong><u>https://wristo.io/code</u></strong></a>, enter the six-digit number on the watch face, complete the payment as guided, ' +
				"and the watch face will automatically refresh to a usable state. The refresh time is generally within five minutes (pay attention to the progress bar at the edge of the watch face)." +
				" If the watch face does not appear for a long time, try synchronizing with the Connect APP or switching networks.",
		},
		{
			q: "I do not want to purchase this app/clockface. How do I stop these messages?",
			a:
				"These messages are shown because you are using a paid app or clockface of which the trial has expired. " +
				"If you do not want to pay for the app or clockface, remove the app, or install another clockface from the appstore, and the messages will automatically stop.",
		},
		{
			q: "Is this a one-time or recurring payment?",
			a:
				"All the apps and clockfaces sold with Wristo are one time payments for a lifetime license. " +
				"However, if you remove and reinstall an app or clockface, it might ask for payment again. You can unlock it again for free by going to <a href=\"https://wristo.io/unlock\" target=\"_blank\" rel=\"noopener noreferrer\"><strong><u>https://wristo.io/unlock</u></strong></a>.",
		},
		{
			q: "How can I request a refund?",
			a:
				'We offer a 14-day no-questions-asked refund period from the date of purchase for all digital products. To request a refund, contact us at <a href="mailto:support@wristo.io"><strong><u>support@wristo.io</u></strong></a> within fourteen (14) calendar days of the original purchase date, including valid proof of purchase.',
		},
		{
			q: "How can I find my purchase history?",
			a:
				"You can look up your complete purchase history at <a href=\"https://wristo.io/lookup\" target=\"_blank\" rel=\"noopener noreferrer\"><strong><u>https://wristo.io/lookup</u></strong></a>.",
		},
		{
			q: "I already paid! Why am I charged a second time?",
			a:
				"If you remove and reinstall an app or clockface, our system may not always recognize you and may ask you to pay again. You can unlock your clockface again for free at <a href=\"https://wristo.io/unlock\" target=\"_blank\" rel=\"noopener noreferrer\"><strong><u>https://wristo.io/unlock</u></strong></a> using the code shown on your watch and the email you used for the original purchase.",
		},
		{
			q: "How do I contact support?",
			a:
				"If you have any questions or need further assistance, please contact us at <a href=\"mailto:support@wristo.io\"><strong><u>support@wristo.io</u></strong></a>.",
		},
	],
	"Time & Date Settings": [
		{
			q: "How do I switch between 12-hour and 24-hour formats on my watch?",
			a:
				"You can change the time format on your watch by navigating to: Clocks => Time => Time Format. " +
				"Select 12-hour format to use AM/PM notation. " +
				"Select 24-hour format to display time in the 00:00 ~ 23:59 format."
		},
		{
			q: "How can I hide the leading zero in the 12-hour format?",
			a:
				"On your Connect App, you can choose whether to display a leading zero for the hour: " +
				"<br>Leading Zero Enabled: 08:30 AM " +
				"<br>Leading Zero Disabled: 8:30 AM " +
				"<br>You can find this option in the watch face settings within the Connect App."
		},
		{
			q: "How do I enable AM/PM in the 12-hour format?",
			a:
				"When using the 12-hour format, the watch typically displays AM (morning) / PM (afternoon) to distinguish between different times of the day, for example: " +
				"<br>8:30 AM " +
				"<br>2:45 PM " +
				"<br>If AM/PM is not displayed on your watch face, check the watch face settings and enable the AM/PM option if available."
		},
		{
			q: "How is the 24-hour format displayed?",
			a:
				"When the 24-hour format is enabled, the time will be displayed in the 00:00 - 23:59 format without AM/PM notation. For example: " +
				"<br>08:30 (morning) " +
				"<br>14:45 (afternoon)"
		},
		{
			q: "Can I display AM/PM above the seconds?",
			a:
				"This depends on the specific watch face design. Some watch faces allow custom positioning of AM/PM, so you may be able to place it above the seconds. You can try the following: " +
				"<br>1. Check the watch face settings for an AM/PM display option and adjust its position. " +
				"<br>2. Use a custom watch face or third-party app to modify the AM/PM display."
		},
		{
			q: "What does the \"24H\" label mean?",
			a:
				"Some watches or apps may display a \"24H\" indicator to show that the watch is currently using the 24-hour format instead of the 12-hour AM/PM format."
		},
		{
			q: "How to change the date format?",
			a:
				"You can choose your preferred display style based on the hints in the Date Format settings; for example, if you want to display 'Mon, Feb 19', you need to fill in the input box according to the hint with '%w, %m %d'; similarly, if you fill in '%y/%m/%d', the date area will display a string in the format '2024/02/19'."
		},
	],
	"Data & Units": [
		{
			q: "How to modify the icon color settings?",
			a:
				'I recommend selecting the Default setting, where we will use default colors based on different data fields, and some icons may also have a flashing effect. Of course, if you want to customize the colors of the icons, you can also make your selection.'
		},
		{
			q: "When will the metric data display units?",
			a:
				'The metric data will display units when the "ShowUnit" setting is enabled, and the combined length of the data item and it\'s unit is less than or equal to "MaxFieldLength". ' +
				"<br>" +
				"If these conditions are met, the unit will be shown; otherwise, only the numeric value will be displayed. Make sure to correctly configure the parameters to ensure the desired unit display.",
		},
		{
			q: "How to set temperature Celsius or Fahrenheit?",
			a: "You can select on your device or in the Connect app, the location is at: Settings -> Format -> Units -> Temperature.",
		},
		{
			q: "How to change the temperature unit?",
			a: "When the switch is turned off, no unit is displayed; when turned on, Celsius is represented by 'C,' and Fahrenheit is represented by 'F.'",
		},
		{
			q: "What different between temperature type?",
			a:
				"Weather Forecast(outdoor): Currently, only Garmin's built-in weather API is supported. If displayed as '--,' it indicates that the current device is not supported. \n" +
				"Sensor temperature(indoor): Display the measured values of the Garmin device's temperature sensor. If displayed as '--,' it indicates that the current device is not supported.",
		},
	],
	"IQ Error Troubleshooting": [
		{
			q: "What should I do if I encounter an IQ error?",
			a:
				"If you experience an IQ error on your Garmin device, please follow these steps:<br>" +
				"1. Connect your Garmin device to a computer.<br>" +
				"2. Navigate to the directory <code>/Garmin/Apps/Logs/</code>.<br>" +
				"3. Locate the log file <code>CIQ_LOG.bak</code>.<br>" +
				"4. Send the log file to <a href=\"mailto:support@wristo.io\"><strong><u>support@wristo.io</u></strong></a>, along with a brief description of the issue."
		},
		{
			q: "How long will it take to get a response after sending the log file?",
			a:
				"We typically review log files and provide solutions or further guidance within <strong>1-3 business days</strong>."
		},
		{
			q: "What if I can't find the `CIQ_LOG.bak` file?",
			a:
				"Please ensure your Garmin device is properly connected to your computer and that the directory exists. If the file is still missing, try restarting your device and check the directory again after running the app."
		},
		{
			q: "Are there alternative ways to retrieve the log file?",
			a:
				"Some devices may store log files differently. If <code>CIQ_LOG.bak</code> is missing, check the <code>/Garmin/Apps/Logs/</code> directory for other files with <code>.bak</code> or <code>.log</code> extensions and send them to us as well."
		},
		{
			q: "What additional information should I provide when sending the log file?",
			a:
				"To help us diagnose the issue faster, please include the following details in your email:<br>" +
				"- Your Garmin device model (e.g., Fenix 7, Forerunner 955, etc.).<br>" +
				"- The name of the watch face or app installed (if applicable).<br>" +
				"- A brief description of the issue (e.g., when it occurred, any specific actions that triggered it)."
		},
		{
			q: "How can I prevent IQ errors from occurring?",
			a:
				"While not all IQ errors can be prevented, you can minimize their occurrence by:<br>" +
				"1. Keeping your Garmin device firmware updated to the latest version.<br>" +
				"2. Ensuring your Connect IQ apps and watch faces are updated.<br>" +
				"3. Avoiding installing too many Connect IQ apps simultaneously, as this can strain device memory.<br>" +
				"4. Restarting your device periodically to clear temporary data."
		},
	],
};


const allQuestions = computed(() => {
  return Object.entries(questionsByCategory).flatMap(([category, qs]) =>
    qs.map(q => ({ ...q, category }))
  )
})

const search = ref('')
const openIndex = ref<number|null>(null)
const questionRefs = ref<HTMLElement[]>([])

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
function setQuestionRef(idx: number, el: HTMLElement | null) {
  if (el) questionRefs.value[idx] = el
}
function toggleOpen(idx: number) {
  openIndex.value = openIndex.value === idx ? null : idx
}
function onCardClick(cardIdx: number, item: any) {
  if (item.key === 'need-refund') {
    window.open('/refund', '_blank')
  } else {
    const qIdx = allQuestions.value.findIndex(q => q.q === item.q && q.category === item.category)
    openIndex.value = qIdx
    nextTick(() => {
      const el = questionRefs.value[qIdx]
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
.faq-contact {
  margin-top: 48px;
  text-align: center;
  background: #f5f7fa;
  border-radius: 10px;
  padding: 32px 16px;
}
.faq-contact h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a2a3a;
  margin-bottom: 10px;
}
.faq-contact a {
  color: #0056b3;
  text-decoration: underline;
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