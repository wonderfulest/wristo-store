<template>
  <section class="curated-entrances" aria-labelledby="curated-title">
    <div class="curated-heading"><p>THE WRISTO EDIT</p><h2 id="curated-title">Find your everyday face.</h2><span>Three small collections. A clearer place to start.</span></div>
    <div class="curated-links">
      <RouterLink v-for="(collection, index) in collections" :key="collection.slug" :to="`/collections/${collection.slug}`">
        <span class="collection-number">0{{ index + 1 }}</span>
        <img :src="collection.products[0].image" :alt="collection.products[0].name" loading="lazy" width="120" height="120" />
        <h3>{{ collection.title.replace(' Garmin watch faces', '') }}</h3>
        <span>{{ collection.products.length }} selected faces <span aria-hidden="true">↗</span></span>
      </RouterLink>
    </div>
  </section>
</template>
<script setup lang="ts">
import collections from '@/content/collections.json'
</script>
<style scoped>
.curated-entrances{max-width:1200px;margin:32px auto 48px;padding:0 24px;color:#18342b}.curated-heading p{font-size:11px;letter-spacing:.2em;font-weight:700}.curated-heading h2{font-family:Georgia,serif;font-size:clamp(28px,4vw,40px);font-weight:400;margin:10px 0}.curated-heading>span{color:#5c695e}.curated-links{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px}.curated-links>a{position:relative;display:grid;grid-template-columns:1fr 120px;align-items:center;padding:24px;border:1px solid #d7dfd2;border-radius:16px;background:#eef1e8;color:inherit;text-decoration:none;transition:background .2s}.curated-links>a:hover{background:#e4eada}.curated-links>a:focus-visible{outline:3px solid #567438;outline-offset:4px}.collection-number{font-size:12px;letter-spacing:.1em}.curated-links img{grid-column:2;grid-row:1/4;object-fit:contain}.curated-links h3{font-size:20px;font-weight:500;margin:16px 0 10px}.curated-links a>span:last-child{font-size:13px;color:#4d624a}@media(max-width:760px){.curated-links{grid-template-columns:1fr}.curated-links>a{padding:18px 24px}.curated-entrances{padding:0 16px}.curated-links h3{margin:8px 0}}
</style>
