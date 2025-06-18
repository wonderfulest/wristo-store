<template>
  <header class="header-bar">
    <div class="header-inner">
      <div class="logo-area">
        <router-link to="/" class="logo-text">WRISTO</router-link>
      </div>
      <nav class="nav-area">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/sale" class="nav-link">Sale</router-link>
        <router-link to="/categories" class="nav-link">Categories</router-link>
        <router-link to="/faq" class="nav-link">FAQ</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
.header-bar {
  width: 100%;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.04);
  position: sticky;
  top: 0;
  z-index: 20;
}
.header-inner {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 32px;
}
.logo-area .logo-text {
  font-size: 2rem;
  font-weight: bold;
  color: #347cff;
  letter-spacing: 2px;
  text-decoration: none;
}
.nav-area {
  display: flex;
  gap: 32px;
}
.nav-link {
  color: #222;
  font-size: 1.1rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.nav-link:hover {
  color: #347cff;
}
</style> 