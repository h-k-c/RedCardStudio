<template>
  <div class="code-theme-selector">
    <label class="code-theme-selector__label">代码主题</label>
    <div class="code-theme-selector__grid">
      <button
        v-for="theme in themes"
        :key="theme.key"
        :class="['code-theme-selector__card', { active: modelValue === theme.key }]"
        @click="$emit('update:modelValue', theme.key)"
      >
        <span 
          class="code-theme-selector__card-preview" 
          :style="{ background: theme.previewBg, color: theme.previewColor }"
        >
          <span class="code-theme-selector__code-icon">&lt;/&gt;</span>
        </span>
        <span class="code-theme-selector__card-label">{{ theme.label }}</span>
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
  gap: 12px;
}
.code-theme-selector__label {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.01em;
}
.code-theme-selector__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.code-theme-selector__card {
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
.code-theme-selector__card::before {
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
.code-theme-selector__card:hover {
  border-color: #667eea;
  transform: translateY(-3px);
  box-shadow: 
    0 8px 16px rgba(102, 126, 234, 0.15),
    0 4px 8px rgba(0, 0, 0, 0.08);
}
.code-theme-selector__card:hover::before {
  opacity: 1;
}
.code-theme-selector__card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
  box-shadow: 
    0 0 0 3px rgba(102, 126, 234, 0.2),
    0 4px 12px rgba(102, 126, 234, 0.25);
}
.code-theme-selector__card.active::before {
  opacity: 1;
}
.code-theme-selector__card-preview {
  position: relative;
  width: 100%;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.25s;
}
.code-theme-selector__card:hover .code-theme-selector__card-preview {
  transform: scale(1.02);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}
.code-theme-selector__code-icon {
  position: relative;
  font-size: 12px;
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', monospace;
  letter-spacing: 0.02em;
}
.code-theme-selector__card-label {
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
.code-theme-selector__card:hover .code-theme-selector__card-label {
  color: #667eea;
  font-weight: 600;
}
.code-theme-selector__card.active .code-theme-selector__card-label {
  color: #667eea;
  font-weight: 600;
}
</style>
