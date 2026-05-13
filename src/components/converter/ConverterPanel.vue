<template>
  <aside class="converter-panel">
    <!-- 卡片元数据设置 - 最顶部 -->
    <div class="converter-panel__section converter-panel__section--highlight">
      <div class="converter-panel__section-title">📝 卡片信息</div>
      <div class="converter-panel__row">
        <div class="converter-panel__field">
          <label>标题 <span class="converter-panel__required">*</span></label>
          <input v-model="store.cardTitle" type="text" placeholder="卡片主标题" />
        </div>
      </div>
      <div class="converter-panel__row">
        <div class="converter-panel__field">
          <label>副标题</label>
          <input v-model="store.cardSubtitle" type="text" placeholder="卡片副标题（可选）" />
        </div>
      </div>
      <div class="converter-panel__row">
        <div class="converter-panel__field">
          <label>分类</label>
          <input v-model="store.cardCategory" type="text" placeholder="如：Tutorial" />
        </div>
        <div class="converter-panel__field">
          <label>标签</label>
          <input v-model="store.cardTags" type="text" placeholder="空格或逗号分隔" />
        </div>
      </div>
    </div>

    <div class="converter-panel__section">
      <div class="converter-panel__editor-header">
        <label class="markdown-editor__label">Markdown 内容</label>
        <span class="converter-panel__page-label" v-if="store.pageSources.length > 1">
          第 {{ store.currentPageIndex + 1 }} / {{ store.pageSources.length }} 页
        </span>
      </div>
      <MarkdownEditor v-model="store.currentPageSource" />
      <div class="converter-panel__hint">
        切换右侧预览页，左侧自动跟随编辑对应页内容
      </div>
    </div>

    <div class="converter-panel__section">
      <StyleSelector v-model="store.currentStyle" />
    </div>

    <!-- 样式设置 -->
    <div class="converter-panel__section">
      <div class="converter-panel__section-title">🎨 样式配置</div>
      <FontSelector
        :title-font="store.titleFont"
        :body-font="store.bodyFont"
        :font-scale="store.fontScale"
        :font-weight="store.fontWeight"
        :header-text="store.headerText"
        :author="store.author"
        @update:title-font="store.titleFont = $event"
        @update:body-font="store.bodyFont = $event"
        @update:font-scale="store.fontScale = $event"
        @update:font-weight="store.fontWeight = $event"
        @update:header-text="store.headerText = $event"
        @update:author="store.author = $event"
      />
    </div>

    <div class="converter-panel__section">
      <CodeThemeSelector v-model="store.codeTheme" />
    </div>

    <div class="converter-panel__section converter-panel__row">
      <div class="converter-panel__field">
        <label>作者</label>
        <input v-model="store.author" type="text" placeholder="你的昵称" />
      </div>
      <div class="converter-panel__field">
        <label>每页步骤数</label>
        <input v-model.number="store.autoSplitMax" type="number" min="0" max="10" placeholder="0=不分" />
      </div>
    </div>

    <div class="converter-panel__section converter-panel__row">
      <div class="converter-panel__field">
        <label>页眉</label>
        <input v-model="store.headerText" type="text" placeholder="品牌/专栏名（可选）" />
      </div>
      <div class="converter-panel__field">
        <label>页脚标语</label>
        <input v-model="store.footerSlogan" type="text" placeholder="如：关注获取更多" />
      </div>
    </div>

    <div class="converter-panel__page-info">
      <span>共 {{ store.pageSources.length }} 页</span>
      <div class="converter-panel__page-nav">
        <button :disabled="store.currentPageIndex <= 0" @click="store.prevPage()">←</button>
        <span>{{ store.currentPageIndex + 1 }}</span>
        <button :disabled="store.currentPageIndex >= store.pageSources.length - 1" @click="store.nextPage()">→</button>
      </div>
    </div>
    <div class="converter-panel__page-actions">
      <button class="converter-panel__page-btn" @click="store.addPage()">＋ 新增页</button>
      <button
        class="converter-panel__page-btn converter-panel__page-btn--danger"
        :disabled="store.pageSources.length <= 1"
        @click="store.deletePage()"
      >
        删除当前页
      </button>
    </div>

    <div class="converter-panel__actions">
      <button class="converter-panel__btn converter-panel__btn--secondary" @click="$emit('export')">
        导出当前页
      </button>
      <button
        v-if="store.totalPages > 1"
        class="converter-panel__btn converter-panel__btn--export"
        @click="$emit('exportAll')"
      >
        导出全部 ({{ store.totalPages }} 页)
      </button>
      <button
        v-else
        class="converter-panel__btn converter-panel__btn--export"
        @click="$emit('export')"
      >
        导出 PNG
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useCardStore } from '@/stores/cardStore'
import MarkdownEditor from './MarkdownEditor.vue'
import StyleSelector from './StyleSelector.vue'
import FontSelector from './FontSelector.vue'
import CodeThemeSelector from './CodeThemeSelector.vue'

const store = useCardStore()

defineEmits<{ export: []; exportAll: [] }>()
</script>

<style scoped>
.converter-panel {
  width: 360px;
  min-width: 360px;
  height: 100%;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-right: 1px solid #EBEBEB;
  background: #FAFAFA;
}
.converter-panel__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.converter-panel__section--highlight {
  background: #FFF;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid #6C5CE7;
  box-shadow: 0 2px 8px rgba(108, 92, 231, 0.1);
}
.converter-panel__section-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #EEE;
}
.converter-panel__required {
  color: #E74C3C;
  font-weight: bold;
}
.converter-panel__hint {
  font-size: 11px;
  color: #AAA;
  line-height: 1.4;
}
.converter-panel__hint code {
  background: #EFEFEF;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 11px;
}
.converter-panel__row {
  display: flex;
  flex-direction: row;
  gap: 12px;
}
.converter-panel__field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.converter-panel__field label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
}
.converter-panel__field input {
  padding: 10px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 13px;
  background: #FFF;
  color: #333;
  transition: border-color 0.2s;
}
.converter-panel__field input:focus {
  outline: none;
  border-color: #999;
}
.converter-panel__page-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #F0F0F0;
  border-radius: 8px;
  font-size: 13px;
  color: #555;
}
.converter-panel__page-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}
.converter-panel__page-nav button {
  width: 28px;
  height: 28px;
  border: 1px solid #DDD;
  border-radius: 6px;
  background: #FFF;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.converter-panel__page-nav button:hover:not(:disabled) {
  border-color: #999;
  background: #F5F5F5;
}
.converter-panel__page-nav button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.converter-panel__page-nav span {
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}
.converter-panel__editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.converter-panel__editor-header label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
}
.converter-panel__page-label {
  font-size: 12px;
  color: #888;
  background: #EFEFEF;
  padding: 2px 10px;
  border-radius: 12px;
}
.converter-panel__page-actions {
  display: flex;
  gap: 10px;
}
.converter-panel__page-btn {
  flex: 1;
  padding: 8px 0;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  background: #FFF;
  font-size: 12px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}
.converter-panel__page-btn:hover:not(:disabled) {
  border-color: #999;
  background: #F8F8F8;
}
.converter-panel__page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.converter-panel__page-btn--danger {
  color: #C44;
  border-color: #ECC;
}
.converter-panel__page-btn--danger:hover:not(:disabled) {
  background: #FEE;
  border-color: #C44;
}
.converter-panel__actions {
  margin-top: auto;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.converter-panel__btn {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.converter-panel__btn--export {
  background: #222;
  color: #FFF;
}
.converter-panel__btn--export:hover {
  background: #000;
}
.converter-panel__btn--secondary {
  background: #F0F0F0;
  color: #444;
}
.converter-panel__btn--secondary:hover {
  background: #E8E8E8;
}
</style>
