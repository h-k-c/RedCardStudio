<template>
  <div class="gallery-view">
    <header class="gallery-view__header">
      <h1 class="gallery-view__title">模板库</h1>
      <p class="gallery-view__subtitle">精选小红书图文模板，点击预览后在转换器中使用</p>
    </header>

    <div class="gallery-view__content">
      <CategorySection
        v-for="group in groupedTemplates"
        :key="group.key"
        :title="group.label"
        :dot-color="group.dotColor"
        :templates="group.items"
        @select="handleSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { STYLE_REGISTRY } from '@/data/styleRegistry'
import { TEMPLATE_CATALOG, type TemplateInfo } from '@/data/templateCatalog'
import { useCardStore } from '@/stores/cardStore'
import CategorySection from '@/components/gallery/CategorySection.vue'

const router = useRouter()
const cardStore = useCardStore()

const groupedTemplates = computed(() => {
  return STYLE_REGISTRY.map(style => ({
    key: style.key,
    label: style.label,
    dotColor: style.dotColor,
    items: TEMPLATE_CATALOG.filter(t => t.category === style.key)
  })).filter(g => g.items.length > 0)
})

function handleSelect(template: TemplateInfo) {
  cardStore.setStyle(template.category)
  router.push('/converter')
}
</script>

<style scoped>
.gallery-view {
  padding: 40px 48px;
  max-width: 1200px;
  margin: 0 auto;
  overflow-y: auto;
  height: 100%;
}
.gallery-view__header {
  margin-bottom: 36px;
}
.gallery-view__title {
  font-size: 28px;
  font-weight: 800;
  color: #111;
  margin: 0 0 8px 0;
}
.gallery-view__subtitle {
  font-size: 14px;
  color: #888;
  margin: 0;
}
</style>
