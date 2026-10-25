<template>
  <main v-if="collection" class="collection-page">
    <nav aria-label="Breadcrumb"><RouterLink to="/">Wristo</RouterLink><span aria-hidden="true"> / </span><span>{{ collection.title }}</span></nav>
    <header class="collection-hero">
      <div><p class="eyebrow">THE WRISTO EDIT · {{ collection.products.length }} SELECTED FACES</p><h1>{{ collection.title }}</h1><p class="headline">{{ collection.headline }}</p><p class="intro">{{ collection.description }}</p><a class="primary-link" href="#selected-faces">Explore the selection <span aria-hidden="true">↓</span></a></div>
      <img :src="collection.products[0].image" :alt="`${collection.products[0].name} watch face preview`" width="360" height="360" fetchpriority="high" />
    </header>
    <section class="selection-note"><h2>How to choose</h2><p>{{ collection.guide }}</p><p>Selected from Wristo's public catalogue. This is an editorial selection, not a ranking or a battery-life benchmark.</p></section>
    <section id="selected-faces" class="face-grid" aria-label="Selected watch faces">
      <article v-for="(product, index) in collection.products" :key="product.appId">
        <RouterLink :to="`/app/${product.appId}`" class="face-image" @click="track(product.appId)"><span class="index">{{ String(index + 1).padStart(2, '0') }}</span><img :src="product.image" :alt="`${product.name} Garmin watch face`" width="280" height="280" loading="lazy" /></RouterLink>
        <div class="face-copy"><h2>{{ product.name }}</h2><p>{{ product.reason }}</p><RouterLink :to="`/app/${product.appId}`" @click="track(product.appId)">View details & compatibility <span aria-hidden="true">↗</span></RouterLink></div>
      </article>
    </section>
    <section class="before-install"><h2>Before you install</h2><div><h3>Does it work on my Garmin?</h3><p>Open the product details and check your exact model. Device support and available settings vary by watch face.</p><h3>Where do I check the price?</h3><p>The product page shows current purchase options. Follow its Connect IQ installation link, then use the activation instructions if an unlock is required.</p><RouterLink to="/support">Installation & activation help →</RouterLink></div></section>
    <nav class="other-edits" aria-label="More collections"><RouterLink v-for="other in otherCollections" :key="other.slug" :to="`/collections/${other.slug}`">{{ other.title }} →</RouterLink></nav>
  </main>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import collections from '@/content/collections.json'
import { applySeo } from '@/seo'
const route = useRoute()
const collection = computed(() => collections.find(item => item.slug === route.params.slug))
const otherCollections = computed(() => collections.filter(item => item.slug !== collection.value?.slug))
watch(collection, value => {
  if (!value) return
  const url = `https://www.wristo.io/collections/${value.slug}`
  applySeo({title: `${value.title} | Wristo`, description: value.description, path: url, image: value.products[0].image, jsonLd: [
    {'@context':'https://schema.org','@type':'CollectionPage',name:value.title,description:value.description,url,mainEntity:{'@type':'ItemList',itemListElement:value.products.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:`https://www.wristo.io/app/${p.appId}`}))}}
  ]})
}, {immediate:true})
function track(appId: number) {
  const gtag = (window as Window & {gtag?: (...args: unknown[]) => void}).gtag
  gtag?.('event', 'select_curated_product', {collection_slug:collection.value?.slug,app_id:String(appId)})
}
</script>
<style scoped>
.collection-page{background:#f7f8f5;color:#19352c;padding:28px max(24px,calc((100vw - 1120px)/2)) 70px;min-height:100vh}.collection-page>nav:first-child{font-size:13px;color:#5b695f}.collection-page a{color:inherit}.collection-page a:focus-visible{outline:3px solid #658348;outline-offset:5px}.collection-hero{display:grid;grid-template-columns:1.3fr 1fr;gap:40px;align-items:center;padding:52px 0 44px}.eyebrow{font-size:11px;letter-spacing:.16em;font-weight:700}.collection-hero h1{font-size:15px;font-weight:500;margin:24px 0 10px}.headline{font:clamp(40px,5.4vw,66px)/1.08 Georgia,serif;letter-spacing:-.035em;margin:12px 0 24px;max-width:620px}.intro{font-size:17px;line-height:1.7;color:#526257;max-width:560px}.collection-hero>img{width:100%;max-width:360px;height:auto;object-fit:contain;justify-self:center}.primary-link{display:inline-flex;gap:32px;background:#243f2f;color:#fff!important;padding:15px 22px;border-radius:6px;text-decoration:none;margin-top:18px}.selection-note{display:grid;grid-template-columns:180px 1fr;gap:0 30px;padding:30px 0;border-top:1px solid #d4ddce;border-bottom:1px solid #d4ddce;margin-bottom:36px}.selection-note h2{font-size:19px;margin:0}.selection-note p{font-size:15px;line-height:1.7;margin:0 0 8px;color:#536352}.selection-note p:last-child{grid-column:2;font-size:13px}.face-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.face-grid article{border:1px solid #dae0d5;background:#fff;border-radius:14px;overflow:hidden}.face-image{position:relative;display:flex;background:#edf0e9;justify-content:center;padding:28px 20px}.face-image img{width:100%;max-width:250px;height:auto;aspect-ratio:1;object-fit:contain}.index{position:absolute;top:14px;left:16px;font-size:12px;color:#5a6b55}.face-copy{padding:22px}.face-copy h2{font:27px Georgia,serif;margin:0 0 12px}.face-copy p{font-size:15px;line-height:1.65;color:#5a675d;min-height:74px}.face-copy a{font-size:14px;font-weight:600;text-underline-offset:5px}.before-install{display:grid;grid-template-columns:1fr 2fr;gap:40px;margin:52px 0;padding:32px 0;border-top:1px solid #d4ddce}.before-install h2{font:30px Georgia,serif}.before-install h3{font-size:17px}.before-install p{color:#536352;line-height:1.7}.other-edits{display:flex;gap:24px;flex-wrap:wrap;font-size:15px}@media(max-width:800px){.face-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.collection-hero{gap:24px}.collection-page{padding-inline:20px}}@media(max-width:560px){.collection-hero{grid-template-columns:1fr;padding-top:30px}.collection-hero>img{max-width:250px}.face-grid{grid-template-columns:1fr}.selection-note,.before-install{grid-template-columns:1fr;gap:14px}.selection-note p:last-child{grid-column:1}.face-copy p{min-height:0}.collection-page{padding-inline:16px}.headline{font-size:44px}}
</style>
