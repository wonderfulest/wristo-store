<script setup lang="ts">
import { computed } from 'vue'
import { ElConfigProvider } from 'element-plus'
import cs from 'element-plus/dist/locale/cs.mjs'
import da from 'element-plus/dist/locale/da.mjs'
import de from 'element-plus/dist/locale/de.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import es from 'element-plus/dist/locale/es.mjs'
import fr from 'element-plus/dist/locale/fr.mjs'
import it from 'element-plus/dist/locale/it.mjs'
import ja from 'element-plus/dist/locale/ja.mjs'
import ko from 'element-plus/dist/locale/ko.mjs'
import nl from 'element-plus/dist/locale/nl.mjs'
import pl from 'element-plus/dist/locale/pl.mjs'
import ptBr from 'element-plus/dist/locale/pt-br.mjs'
import sv from 'element-plus/dist/locale/sv.mjs'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import Layout from './components/Layout.vue'
import { useLocaleStore, type SupportedLocale } from './store/locale'

const localeStore = useLocaleStore()
const elementLocales = {
  cs,
  da,
  de,
  en,
  es,
  fr,
  it,
  ja,
  ko,
  nl,
  pl,
  'pt-br': ptBr,
  sv,
  zh: zhCn,
} satisfies Record<SupportedLocale, typeof en>
const elementLocale = computed(() => elementLocales[localeStore.currentLocale] || en)
</script>

<template>
  <el-config-provider :locale="elementLocale">
    <Layout>
      <router-view />
    </Layout>
  </el-config-provider>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

<style>
@import 'element-plus/dist/index.css';
</style>
