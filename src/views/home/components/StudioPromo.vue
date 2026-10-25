<template>
  <section v-if="isDesktop" id="create-your-watchface" class="studio-promo" aria-labelledby="studio-promo-title">
    <div class="studio-promo__body">
      <div class="studio-promo__copy">
        <p class="studio-promo__eyebrow"><span></span> WRISTO STUDIO</p>
        <h2 id="studio-promo-title">{{ t('studioPromo.titleFirst') }}<br><em>{{ t('studioPromo.titleSecond') }}</em></h2>
        <p class="studio-promo__description">{{ t('studioPromo.description') }}</p>
        <a :href="createUrl" class="studio-promo__cta" @click.prevent="openStudioGuide">
          {{ t('studioPromo.cta') }} <span aria-hidden="true">→</span>
        </a>
        <p class="studio-promo__note">{{ t('studioPromo.note') }}</p>
      </div>
      <div class="studio-promo__art">
        <svg viewBox="0 0 620 430" role="img" :aria-label="t('studioPromo.imageAlt')">
          <defs>
            <linearGradient id="studio-promo-sky" x1="0" y1="0" x2="0" y2="1">
              <stop stop-color="#e9c8a1"/><stop offset="1" stop-color="#f6dfb2"/>
            </linearGradient>
            <clipPath id="studio-promo-face"><circle cx="425" cy="221" r="109"/></clipPath>
            <clipPath id="studio-promo-photo"><rect x="62" y="110" width="179" height="223" rx="5"/></clipPath>
            <g id="studio-promo-landscape">
              <rect width="240" height="250" fill="url(#studio-promo-sky)"/>
              <circle cx="170" cy="74" r="29" fill="#fff4cf"/>
              <path d="M0 168 69 78 127 148 186 114 240 166V250H0Z" fill="#aa9b85"/>
              <path d="m30 250 59-106 65 54 53-31 33 31v52Z" fill="#647d72"/>
              <path d="M0 194 76 167 128 224 199 192 240 215v35H0Z" fill="#334f49"/>
            </g>
          </defs>
          <!-- A layout illustration, not an interactive editor or a product screenshot. -->
          <circle cx="432" cy="221" r="172" fill="#dce5d8"/>
          <path d="M37 377H575" stroke="#b6c4b3" stroke-dasharray="3 7"/>
          <g transform="rotate(-7 151 217)">
            <rect x="47" y="68" width="209" height="292" rx="12" fill="#fffef7" stroke="#dddccf"/>
            <circle cx="66" cy="89" r="4" fill="#b8c8b3"/>
            <text x="79" y="93" fill="#677262" font-size="10" font-family="sans-serif" letter-spacing="1.5">{{ t('studioPromo.editorLabel') }}</text>
            <rect x="62" y="110" width="179" height="223" rx="5" fill="#eef1e8"/>
            <circle cx="151" cy="209" r="76" fill="#294c3b"/>
            <text x="151" y="216" text-anchor="middle" fill="#fff4cf" font-size="32" font-weight="700" font-family="sans-serif">10:08</text>
            <rect x="88" y="184" width="126" height="43" fill="none" stroke="#c7e7a3" stroke-dasharray="4 3"/>
            <path d="M83 294h136m-136 12h88" stroke="#bbc8b0" stroke-width="6" stroke-linecap="round"/>
            <text x="63" y="348" fill="#52634d" font-size="10" font-family="sans-serif">{{ t('studioPromo.designLabel') }}</text>
          </g>
          <path d="M234 203C276 176 281 174 306 189" stroke="#677c60" stroke-width="2" fill="none" stroke-dasharray="5 6"/>
          <path d="m297 178 10 12-15 3" stroke="#677c60" stroke-width="2" fill="none"/>
          <rect x="378" y="18" width="94" height="112" rx="24" fill="#3a453a"/>
          <rect x="378" y="310" width="94" height="109" rx="24" fill="#3a453a"/>
          <path d="M395 31v67m14-67v67m15-67v67m15-67v67m15-67v67M395 346v59m14-59v59m15-59v59m15-59v59m15-59v59" stroke="#53604e" stroke-width="2"/>
          <rect x="548" y="182" width="9" height="26" rx="3" fill="#a4aa99"/>
          <rect x="548" y="238" width="9" height="26" rx="3" fill="#a4aa99"/>
          <circle cx="425" cy="221" r="129" fill="#28372f"/>
          <circle cx="425" cy="221" r="123" fill="#bbc0ac"/>
          <circle cx="425" cy="221" r="117" fill="#1b2a25"/>
          <g clip-path="url(#studio-promo-face)"><use href="#studio-promo-landscape" transform="translate(310 110)"/></g>
          <text x="425" y="165" text-anchor="middle" fill="#263e36" font-size="15" font-weight="600" font-family="sans-serif">MON 24</text>
          <text x="425" y="218" text-anchor="middle" fill="#233c34" font-size="47" font-weight="700" font-family="sans-serif" letter-spacing="-2">10:08</text>
          <rect x="342" y="174" width="167" height="55" rx="2" stroke="#efffc6" stroke-width="1.5" fill="none"/>
          <g fill="#f6ffdf" stroke="#60794e"><rect x="339" y="171" width="6" height="6"/><rect x="506" y="171" width="6" height="6"/><rect x="339" y="226" width="6" height="6"/><rect x="506" y="226" width="6" height="6"/></g>
          <text x="425" y="287" text-anchor="middle" fill="#fcf6de" font-size="17" font-weight="600" font-family="sans-serif">8,240</text>
          <text x="425" y="304" text-anchor="middle" fill="#e1e9cf" font-size="10" font-family="sans-serif" letter-spacing="2">STEPS</text>
          <path d="m499 225 4 27 7-7 9 13 6-4-9-13 10-3Z" fill="#fffef7" stroke="#354b3d" stroke-width="1.5"/>
          <rect x="264" y="332" width="174" height="38" rx="19" fill="#fdfdf4" stroke="#ccd5c3"/>
          <circle cx="286" cy="351" r="8" fill="#dceac9"/>
          <path d="m282 351 3 3 5-6" fill="none" stroke="#506442" stroke-width="1.8"/>
          <text x="304" y="355" fill="#42563a" font-size="12" font-family="sans-serif">{{ t('studioPromo.previewLabel') }}</text>
        </svg>
        <span class="studio-promo__art-label">{{ t('studioPromo.illustration') }}</span>
      </div>
    </div>
    <ol class="studio-promo__steps">
      <li v-for="(step, index) in steps" :key="step.title">
        <span class="studio-promo__number">0{{ index + 1 }}</span>
        <div><h3>{{ t(step.title) }}</h3><p>{{ t(step.description) }}</p></div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'
import { onMounted, ref } from 'vue'
import { getStudioGuideUrl, openStudioGuide, isMobileStudioClient } from '@/utils/studio'
const { t } = useI18n()
const createUrl = ref('')
const isDesktop = ref(false)
onMounted(() => {
  isDesktop.value = !isMobileStudioClient()
  createUrl.value = getStudioGuideUrl()
})
const steps = [
  { title: 'studioPromo.uploadTitle', description: 'studioPromo.uploadDescription' },
  { title: 'studioPromo.arrangeTitle', description: 'studioPromo.arrangeDescription' },
  { title: 'studioPromo.previewTitle', description: 'studioPromo.previewDescription' },
]
</script>

<style scoped>
.studio-promo { width: min(1200px, calc(100% - 48px)); margin: 28px auto 24px; overflow: hidden; border: 1px solid #dce3d4; border-radius: 24px; background: #eef1e8; color: #243b30; }
.studio-promo__body { display: grid; grid-template-columns: 1fr 1.1fr; align-items: center; }
.studio-promo__copy { padding: 44px 0 38px 48px; position: relative; z-index: 1; }
.studio-promo__eyebrow { display: flex; align-items: center; gap: 9px; margin: 0 0 22px; font-size: 11px; font-weight: 700; letter-spacing: .16em; }
.studio-promo__eyebrow span { width: 7px; height: 7px; border-radius: 50%; background: #6f8752; }
h2 { margin: 0; font-size: clamp(32px, 3.6vw, 50px); line-height: 1.1; letter-spacing: -.045em; font-weight: 650; }
h2 em { font-family: Georgia, 'Times New Roman', serif; font-weight: 400; color: #5f7650; }
.studio-promo__description { max-width: 360px; margin: 22px 0 26px; font-size: 16px; line-height: 1.7; color: #5a685c; }
.studio-promo__cta { display: inline-flex; align-items: center; gap: 30px; min-height: 48px; padding: 0 22px; border-radius: 8px; background: #294c3b; color: #fff; text-decoration: none; font-size: 15px; font-weight: 650; transition: background .2s; }
.studio-promo__cta:hover { background: #183a28; }
.studio-promo__cta:focus-visible { outline: 3px solid #7f995d; outline-offset: 4px; }
.studio-promo__cta span { font-size: 22px; font-weight: 400; }
.studio-promo__note { margin: 12px 0 0; font-size: 12px; color: #677360; }
.studio-promo__art { min-width: 0; position: relative; padding: 8px 20px 8px 0; }
.studio-promo__art svg { display: block; width: 100%; height: auto; }
.studio-promo__art-label { position: absolute; right: 26px; bottom: 15px; font-size: 10px; color: #73816a; }
.studio-promo__steps { list-style: none; margin: 0; padding: 24px 48px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; border-top: 1px solid #d7dfcf; background: #f5f6ef; }
.studio-promo__steps li { display: flex; gap: 14px; align-items: baseline; }
.studio-promo__number { flex: none; color: #7c8d6f; font-size: 12px; font-variant-numeric: tabular-nums; }
h3 { margin: 0 0 5px; font-size: 14px; font-weight: 650; }
.studio-promo__steps p { margin: 0; font-size: 12px; line-height: 1.6; color: #6b7565; }
@media (max-width: 1023px), (hover: none) and (pointer: coarse) {
  .studio-promo { display: none; }
}
</style>
