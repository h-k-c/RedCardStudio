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

    <label class="font-selector__label">卡片设置</label>
    <div class="font-selector__field">
      <span class="font-selector__sub">标题 *</span>
      <input
        type="text"
        :value="cardTitle"
        @input="$emit('update:cardTitle', ($event.target as HTMLInputElement).value)"
        placeholder="卡片主标题"
        class="font-selector__input"
      />
    </div>
    <div class="font-selector__field">
      <span class="font-selector__sub">副标题</span>
      <input
        type="text"
        :value="cardSubtitle"
        @input="$emit('update:cardSubtitle', ($event.target as HTMLInputElement).value)"
        placeholder="卡片副标题（可选）"
        class="font-selector__input"
      />
    </div>
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
  cardTitle: string
  cardSubtitle: string
}>()

defineEmits<{ 
  'update:titleFont': [value: string]
  'update:bodyFont': [value: string]
  'update:fontScale': [value: number]
  'update:fontWeight': [value: number]
  'update:headerText': [value: string]
  'update:author': [value: string]
  'update:cardTitle': [value: string]
  'update:cardSubtitle': [value: string]
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
  // 中文字体 - 无衬线
  { label: '思源黑体', value: '"Noto Sans SC", sans-serif' },
  { label: '苹方', value: '"PingFang SC", sans-serif' },
  { label: '微软雅黑', value: '"Microsoft YaHei", sans-serif' },
  
  // 中文字体 - 衬线/宋体
  { label: '思源宋体', value: '"Noto Serif SC", serif' },
  { label: '方正书宋', value: '"FZShuSong", serif' },
  { label: '华文宋体', value: '"STSong", serif' },
  { label: '标楷体', value: '"KaiTi", serif' },
  
  // 英文字体 - 衬线（优雅风格）
  { label: 'Playfair Display（优雅衬线）', value: '"Playfair Display", serif' },
  { label: 'Lora（文艺衬线）', value: '"Lora", serif' },
  { label: 'Cormorant（高端衬线）', value: '"Cormorant Garamond", serif' },
  
  // 英文字体 - 无衬线（现代风格）
  { label: 'Inter（现代简洁）', value: '"Inter", sans-serif' },
  { label: 'Fredoka（圆润可爱）', value: '"Fredoka", sans-serif' },
  
  // 手写体
  { label: 'Dancing Script（优雅手写）', value: '"Dancing Script", cursive' },
  { label: 'Caveat（随性手写）', value: '"Caveat", cursive' },
  
  // 等宽字体
  { label: '等宽代码体', value: '"JetBrains Mono", monospace' }
]
</script>

<style scoped>
.font-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.font-selector__label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.font-selector__row {
  display: flex;
  gap: 10px;
  width: 100%;
}
.font-selector__field {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.font-selector__sub {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}
.font-selector__field select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 12px;
  background: #fafafa;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}
.font-selector__field select:hover {
  border-color: #bbb;
  background: #fff;
}
.font-selector__field select:focus {
  outline: none;
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}
.font-selector__size {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.font-selector__slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.font-selector__slider-label {
  font-size: 11px;
  color: #666;
  user-select: none;
  font-weight: 500;
  flex-shrink: 0;
}
.font-selector__slider-label--lg {
  font-size: 14px;
  font-weight: 600;
}
.font-selector__slider {
  flex: 1;
  min-width: 0;
  height: 5px;
  -webkit-appearance: none;
  appearance: none;
  background: #e0e0e0;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}
.font-selector__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
  transition: all 0.2s;
}
.font-selector__slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
}
.font-selector__weight {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.font-selector__weight select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 12px;
  background: #fafafa;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}
.font-selector__weight select:hover {
  border-color: #bbb;
  background: #fff;
}
.font-selector__weight select:focus {
  outline: none;
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}
.font-selector__divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
  margin: 6px 0;
}
.font-selector__input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 12px;
  background: #fafafa;
  color: #333;
  transition: all 0.2s;
  box-sizing: border-box;
}
.font-selector__input:hover {
  border-color: #bbb;
  background: #fff;
}
.font-selector__input:focus {
  outline: none;
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}
.font-selector__input::placeholder {
  color: #aaa;
}
</style>
