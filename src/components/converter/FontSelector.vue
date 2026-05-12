<template>
  <div class="font-selector">
    <label class="font-selector__label">字体设置</label>
    <div class="font-selector__row">
      <div class="font-selector__field">
        <span class="font-selector__sub">标题</span>
        <select :value="titleFont" @change="$emit('update:titleFont', ($event.target as HTMLSelectElement).value)">
          <option value="">跟随风格</option>
          <option v-for="f in fonts" :key="f.value" :value="f.value" :style="{ fontFamily: f.value }">{{ f.label }}</option>
        </select>
      </div>
      <div class="font-selector__field">
        <span class="font-selector__sub">正文</span>
        <select :value="bodyFont" @change="$emit('update:bodyFont', ($event.target as HTMLSelectElement).value)">
          <option value="">跟随风格</option>
          <option v-for="f in fonts" :key="f.value" :value="f.value" :style="{ fontFamily: f.value }">{{ f.label }}</option>
        </select>
      </div>
    </div>
    <div class="font-selector__size">
      <span class="font-selector__sub">字号 {{ fontScale }}%</span>
      <div class="font-selector__slider-row">
        <span class="font-selector__slider-label">A</span>
        <input
          type="range"
          class="font-selector__slider"
          min="50"
          max="300"
          step="5"
          :value="fontScale"
          @input="$emit('update:fontScale', Number(($event.target as HTMLInputElement).value))"
        />
        <span class="font-selector__slider-label font-selector__slider-label--lg">A</span>
      </div>
    </div>
    <div class="font-selector__weight">
      <span class="font-selector__sub">字重 {{ fontWeightLabel }}</span>
      <select :value="fontWeight" @change="$emit('update:fontWeight', Number(($event.target as HTMLSelectElement).value))">
        <option value="300">细体 (Light)</option>
        <option value="400">常规 (Regular)</option>
        <option value="500">中等 (Medium)</option>
        <option value="600">半粗 (SemiBold)</option>
        <option value="700">粗体 (Bold)</option>
        <option value="900">特粗 (Black)</option>
      </select>
    </div>

    <div class="font-selector__divider"></div>

    <label class="font-selector__label">卡片信息</label>
    <div class="font-selector__field">
      <span class="font-selector__sub">左上角标语</span>
      <input
        type="text"
        :value="headerText"
        @input="$emit('update:headerText', ($event.target as HTMLInputElement).value)"
        placeholder="例如：RED CARD · GUIDE"
        class="font-selector__input"
      />
    </div>
    <div class="font-selector__field">
      <span class="font-selector__sub">作者名</span>
      <input
        type="text"
        :value="author"
        @input="$emit('update:author', ($event.target as HTMLInputElement).value)"
        placeholder="例如：YourName"
        class="font-selector__input"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ 
  titleFont: string
  bodyFont: string
  fontScale: number
  fontWeight: number
  headerText: string
  author: string
}>()

defineEmits<{ 
  'update:titleFont': [value: string]
  'update:bodyFont': [value: string]
  'update:fontScale': [value: number]
  'update:fontWeight': [value: number]
  'update:headerText': [value: string]
  'update:author': [value: string]
}>()

const fontWeightLabel = computed(() => {
  const labels: Record<number, string> = {
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'SemiBold',
    700: 'Bold',
    900: 'Black'
  }
  return labels[props.fontWeight] || 'Regular'
})

const fonts = [
  { label: '思源黑体', value: '"Noto Sans SC", sans-serif' },
  { label: '思源宋体', value: '"Noto Serif SC", serif' },
  { label: 'Inter', value: '"Inter", sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { label: 'Fredoka', value: '"Fredoka", sans-serif' },
  { label: 'Lora', value: '"Lora", serif' },
  { label: 'Cormorant', value: '"Cormorant Garamond", serif' }
]
</script>

<style scoped>
.font-selector {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.font-selector__label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
}
.font-selector__row {
  display: flex;
  gap: 10px;
}
.font-selector__field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.font-selector__sub {
  font-size: 11px;
  color: #999;
}
.font-selector__field select {
  padding: 8px 10px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 12px;
  background: #FFF;
  color: #333;
  cursor: pointer;
  transition: border-color 0.2s;
}
.font-selector__field select:focus {
  outline: none;
  border-color: #999;
}
.font-selector__size {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}
.font-selector__slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.font-selector__slider-label {
  font-size: 11px;
  color: #999;
  user-select: none;
}
.font-selector__slider-label--lg {
  font-size: 16px;
  font-weight: 600;
}
.font-selector__slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #E0E0E0;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.font-selector__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #333;
  cursor: pointer;
  border: 2px solid #FFF;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.font-selector__weight {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}
.font-selector__weight select {
  padding: 8px 10px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 12px;
  background: #FFF;
  color: #333;
  cursor: pointer;
  transition: border-color 0.2s;
}
.font-selector__weight select:focus {
  outline: none;
  border-color: #999;
}
.font-selector__divider {
  height: 1px;
  background: #E8E8E8;
  margin: 8px 0;
}
.font-selector__input {
  padding: 8px 10px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 12px;
  background: #FFF;
  color: #333;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.font-selector__input:focus {
  outline: none;
  border-color: #999;
}
.font-selector__input::placeholder {
  color: #BBB;
}

/* FontSelector 滚动条 */
.font-selector::-webkit-scrollbar {
  width: 4px;
}
.font-selector::-webkit-scrollbar-track {
  background: transparent;
}
.font-selector::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 2px;
}
.font-selector::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}
</style>
