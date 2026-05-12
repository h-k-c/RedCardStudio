<template>
  <div class="style-selector">
    <label class="style-selector__label">卡片风格</label>
    <div class="style-selector__grid">
      <button
        v-for="s in styles"
        :key="s.key"
        :class="['style-selector__item', { active: modelValue === s.key }]"
        @click="$emit('update:modelValue', s.key)"
      >
        <span class="style-selector__dot" :style="{ background: s.dotColor }"></span>
        <span class="style-selector__name">{{ s.label }}</span>
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
  gap: 8px;
}
.style-selector__label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
}
.style-selector__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.style-selector__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  background: #FFF;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #555;
}
.style-selector__item:hover {
  border-color: #CCC;
  background: #FAFAFA;
}
.style-selector__item.active {
  border-color: #333;
  background: #F5F5F5;
  font-weight: 600;
  color: #222;
}
.style-selector__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.style-selector__name {
  white-space: nowrap;
}
</style>
