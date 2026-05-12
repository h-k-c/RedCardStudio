<template>
  <div class="fsp" :class="{ 'fsp--collapsed': collapsed }">
    <button class="fsp__toggle" @click="collapsed = !collapsed" :title="collapsed ? '展开设置' : '收起设置'">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>

    <div v-show="!collapsed" class="fsp__body">
      <!-- Style -->
      <div class="fsp__section">
        <div class="fsp__label">风格</div>
        <div class="fsp__style-grid">
          <button
            v-for="s in styleRegistry"
            :key="s.key"
            class="fsp__style-btn"
            :class="{ active: store.currentStyle === s.key }"
            @click="store.setStyle(s.key)"
          >
            <span class="fsp__style-dot" :style="{ background: s.dotColor }"></span>
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Font family -->
      <div class="fsp__section">
        <div class="fsp__label">字体</div>
        <div class="fsp__row">
          <div class="fsp__field">
            <label>标题</label>
            <input v-model="store.titleFont" type="text" placeholder="留空=默认" />
          </div>
          <div class="fsp__field">
            <label>正文</label>
            <input v-model="store.bodyFont" type="text" placeholder="留空=默认" />
          </div>
        </div>
      </div>

      <!-- Font weight + scale -->
      <div class="fsp__section">
        <div class="fsp__row">
          <div class="fsp__field">
            <label>字重</label>
            <select v-model.number="store.fontWeight">
              <option :value="300">细 300</option>
              <option :value="400">常规 400</option>
              <option :value="500">中 500</option>
              <option :value="600">半粗 600</option>
              <option :value="700">粗 700</option>
            </select>
          </div>
          <div class="fsp__field">
            <label>字号 {{ store.fontScale }}%</label>
            <input v-model.number="store.fontScale" type="range" min="50" max="200" step="5" />
          </div>
        </div>
      </div>

      <!-- Meta -->
      <div class="fsp__section">
        <div class="fsp__row">
          <div class="fsp__field">
            <label>作者</label>
            <input v-model="store.author" type="text" placeholder="昵称" />
          </div>
          <div class="fsp__field">
            <label>每页步骤数</label>
            <input v-model.number="store.autoSplitMax" type="number" min="0" max="10" />
          </div>
        </div>
        <div class="fsp__row">
          <div class="fsp__field">
            <label>页眉</label>
            <input v-model="store.headerText" type="text" placeholder="品牌名（可选）" />
          </div>
          <div class="fsp__field">
            <label>页脚</label>
            <input v-model="store.footerSlogan" type="text" placeholder="标语（可选）" />
          </div>
        </div>
      </div>

      <!-- Page management -->
      <div class="fsp__section fsp__page-bar">
        <span class="fsp__page-info">第 {{ store.currentPageIndex + 1 }} / {{ store.pageSources.length }} 页</span>
        <div class="fsp__page-btns">
          <button @click="store.addPage()">＋ 新页</button>
          <button
            :disabled="store.pageSources.length <= 1"
            class="danger"
            @click="store.deletePage()"
          >删页</button>
        </div>
      </div>

      <!-- Export -->
      <div class="fsp__section fsp__exports">
        <button class="fsp__export-btn" @click="$emit('export')">导出当前页</button>
        <button
          v-if="store.totalPages > 1"
          class="fsp__export-btn fsp__export-btn--primary"
          @click="$emit('export-all')"
        >导出全部 ({{ store.totalPages }})</button>
        <button
          v-else
          class="fsp__export-btn fsp__export-btn--primary"
          @click="$emit('export')"
        >导出 PNG</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { styleRegistry } from '@/data/styleRegistry'

defineEmits<{ export: []; 'export-all': [] }>()

const store = useCardStore()
const collapsed = ref(false)
</script>

<style scoped>
.fsp {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 20;
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  gap: 0;
}
.fsp__toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #DDD;
  background: rgba(255,255,255,0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #555;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  flex-shrink: 0;
  transition: all 0.15s;
}
.fsp__toggle:hover {
  border-color: #999;
  background: #FFF;
}
.fsp__body {
  width: 272px;
  margin-right: 8px;
  background: rgba(255,255,255,0.97);
  border: 1px solid #E8E8E8;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}
.fsp__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.fsp__label {
  font-size: 11px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.fsp__style-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.fsp__style-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border: 1px solid #E8E8E8;
  border-radius: 6px;
  background: #FFF;
  font-size: 12px;
  color: #444;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.fsp__style-btn:hover {
  border-color: #CCC;
  background: #F8F8F8;
}
.fsp__style-btn.active {
  border-color: #333;
  background: #333;
  color: #FFF;
}
.fsp__style-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.fsp__style-btn.active .fsp__style-dot {
  opacity: 0.8;
}
.fsp__row {
  display: flex;
  gap: 8px;
}
.fsp__field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.fsp__field label {
  font-size: 11px;
  color: #777;
  font-weight: 600;
}
.fsp__field input[type="text"],
.fsp__field input[type="number"],
.fsp__field select {
  padding: 7px 10px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 12px;
  background: #FFF;
  color: #333;
  box-sizing: border-box;
  width: 100%;
}
.fsp__field input[type="text"]:focus,
.fsp__field input[type="number"]:focus,
.fsp__field select:focus {
  outline: none;
  border-color: #999;
}
.fsp__field input[type="range"] {
  width: 100%;
  margin-top: 6px;
}
.fsp__page-bar {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #F5F5F5;
  border-radius: 8px;
}
.fsp__page-info {
  font-size: 12px;
  color: #666;
}
.fsp__page-btns {
  display: flex;
  gap: 6px;
}
.fsp__page-btns button {
  padding: 5px 10px;
  border: 1px solid #DDD;
  border-radius: 5px;
  background: #FFF;
  font-size: 11px;
  color: #444;
  cursor: pointer;
  transition: all 0.15s;
}
.fsp__page-btns button:hover:not(:disabled) {
  border-color: #999;
}
.fsp__page-btns button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.fsp__page-btns button.danger {
  color: #C44;
  border-color: #ECC;
}
.fsp__page-btns button.danger:hover:not(:disabled) {
  background: #FEE;
}
.fsp__exports {
  gap: 6px;
}
.fsp__export-btn {
  width: 100%;
  padding: 9px 0;
  border: 1px solid #DDD;
  border-radius: 7px;
  background: #F8F8F8;
  font-size: 13px;
  font-weight: 500;
  color: #444;
  cursor: pointer;
  transition: all 0.15s;
}
.fsp__export-btn:hover {
  border-color: #999;
  background: #F0F0F0;
}
.fsp__export-btn--primary {
  background: #222;
  color: #FFF;
  border-color: #222;
}
.fsp__export-btn--primary:hover {
  background: #000;
  border-color: #000;
}
</style>
