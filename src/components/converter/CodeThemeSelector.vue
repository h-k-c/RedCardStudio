<template>
  <div class="code-theme-selector">
    <label class="code-theme-selector__label">代码主题</label>
    <div class="code-theme-selector__grid">
      <button
        v-for="theme in themes"
        :key="theme.key"
        :class="['code-theme-selector__item', { active: modelValue === theme.key }]"
        @click="$emit('update:modelValue', theme.key)"
      >
        <span 
          class="code-theme-selector__preview" 
          :style="{ background: theme.previewBg, color: theme.previewColor }"
        >
          Aa
        </span>
        <span class="code-theme-selector__name">{{ theme.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()

const themes = [
  { 
    key: 'github', 
    label: 'GitHub', 
    previewBg: '#f6f8fa', 
    previewColor: '#24292e' 
  },
  { 
    key: 'dark', 
    label: '暗黑', 
    previewBg: '#1a1a2e', 
    previewColor: '#a9b7c6' 
  },
  { 
    key: 'solarized', 
    label: 'Solarized', 
    previewBg: '#fdf6e3', 
    previewColor: '#657b83' 
  },
  { 
    key: 'monokai', 
    label: 'Monokai', 
    previewBg: '#272822', 
    previewColor: '#f8f8f2' 
  }
]
</script>

<style scoped>
.code-theme-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.code-theme-selector__label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
}
.code-theme-selector__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.code-theme-selector__item {
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
.code-theme-selector__item:hover {
  border-color: #CCC;
  background: #FAFAFA;
}
.code-theme-selector__item.active {
  border-color: #333;
  background: #F5F5F5;
  font-weight: 600;
  color: #222;
}
.code-theme-selector__preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  font-family: "JetBrains Mono", monospace;
  flex-shrink: 0;
  border: 1px solid rgba(0,0,0,0.1);
}
.code-theme-selector__name {
  white-space: nowrap;
}
</style>
