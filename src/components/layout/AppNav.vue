<template>
  <nav class="nav">
    <span class="nav__brand">RedCard Studio</span>
  </nav>
</template>

<script setup lang="ts">
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(247,246,243,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #E8E6E1;
  padding: 14px 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav__brand { font-size: 15px; font-weight: 700; letter-spacing: -0.02em; }
.nav__links { display: flex; gap: 6px; }
.nav__link {
  padding: 7px 16px; font-size: 13px; font-weight: 500;
  color: #555; text-decoration: none; border-radius: 6px; transition: all 0.15s;
}
.nav__link:hover { background: #EDE9E3; color: #1A1A1A; }
.nav__link--active { background: #1A1A1A; color: #FFF !important; }
.nav__link--active:hover { background: #333; }
</style>
