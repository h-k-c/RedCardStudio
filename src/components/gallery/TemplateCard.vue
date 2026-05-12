<template>
  <div class="template-card" @click="$emit('select', template)">
    <div class="template-card__preview">
      <iframe :src="template.file" frameborder="0" tabindex="-1"></iframe>
    </div>
    <div class="template-card__info">
      <span class="template-card__name">{{ template.name }}</span>
      <span class="template-card__desc">{{ template.desc }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TemplateInfo } from '@/data/templateCatalog'

defineProps<{ template: TemplateInfo }>()
defineEmits<{ select: [template: TemplateInfo] }>()
</script>

<style scoped>
.template-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #EBEBEB;
  background: #FFF;
  cursor: pointer;
  transition: all 0.2s;
}
.template-card:hover {
  border-color: #CCC;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transform: translateY(-2px);
}
.template-card__preview {
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  position: relative;
  background: #F5F5F5;
}
.template-card__preview iframe {
  width: 1080px;
  height: 1440px;
  transform: scale(0.18);
  transform-origin: top left;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
}
.template-card__info {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.template-card__name {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}
.template-card__desc {
  font-size: 12px;
  color: #999;
}
</style>
