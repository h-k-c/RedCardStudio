<template>
  <section class="category-section">
    <div class="category-section__header">
      <span class="category-section__dot" :style="{ background: dotColor }"></span>
      <h2 class="category-section__title">{{ title }}</h2>
      <span class="category-section__count">{{ templates.length }} 个模板</span>
    </div>
    <div class="category-section__grid">
      <TemplateCard
        v-for="t in templates"
        :key="t.id"
        :template="t"
        @select="$emit('select', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TemplateInfo } from '@/data/templateCatalog'
import TemplateCard from './TemplateCard.vue'

defineProps<{
  title: string
  dotColor: string
  templates: TemplateInfo[]
}>()
defineEmits<{ select: [template: TemplateInfo] }>()
</script>

<style scoped>
.category-section {
  margin-bottom: 40px;
}
.category-section__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.category-section__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.category-section__title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin: 0;
}
.category-section__count {
  font-size: 12px;
  color: #AAA;
}
.category-section__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
</style>
