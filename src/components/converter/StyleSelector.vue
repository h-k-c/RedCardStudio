<template>
  <div class="style-selector">
    <label class="style-selector__label">卡片风格</label>
    <div class="style-selector__grid">
      <button
        v-for="s in styles"
        :key="s.key"
        :class="['style-selector__card', { active: modelValue === s.key }]"
        @click="$emit('update:modelValue', s.key)"
      >
        <span class="style-selector__card-preview" :style="{ background: s.dotColor }"></span>
        <span class="style-selector__card-label">{{ s.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CardStyle } from '@/types/styles'
import { styleRegistry } from '@/data/styleRegistry'

defineProps<{ modelValue: CardStyle }>()
defineEmits<{ 'update:modelValue': [value: CardStyle] }>()

const styles = styleRegistry
</script>

<style scoped>
.style-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.style-selector__label {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.01em;
}
.style-selector__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.style-selector__card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.style-selector__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  opacity: 0;
  transition: opacity 0.25s;
}
.style-selector__card:hover {
  border-color: #667eea;
  transform: translateY(-3px);
  box-shadow: 
    0 8px 16px rgba(102, 126, 234, 0.15),
    0 4px 8px rgba(0, 0, 0, 0.08);
}
.style-selector__card:hover::before {
  opacity: 1;
}
.style-selector__card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
  box-shadow: 
    0 0 0 3px rgba(102, 126, 234, 0.2),
    0 4px 12px rgba(102, 126, 234, 0.25);
}
.style-selector__card.active::before {
  opacity: 1;
}
.style-selector__card-preview {
  position: relative;
  width: 100%;
  height: 36px;
  border-radius: 6px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.25s;
}
.style-selector__card:hover .style-selector__card-preview {
  transform: scale(1.02);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}
.style-selector__card.active .style-selector__card-preview {
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}
.style-selector__card-label {
  position: relative;
  font-size: 12px;
  color: #555;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  transition: all 0.25s;
  letter-spacing: 0.01em;
}
.style-selector__card:hover .style-selector__card-label {
  color: #667eea;
  font-weight: 600;
}
.style-selector__card.active .style-selector__card-label {
  color: #667eea;
  font-weight: 600;
}
</style>
