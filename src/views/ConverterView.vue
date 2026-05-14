<template>
  <div class="converter-view">
    <!-- Left: editor panel -->
    <aside class="converter-view__editor">
      <div class="converter-view__editor-header">
        <span class="converter-view__page-label">
          第 {{ store.currentPageIndex + 1 }} / {{ store.pageSources.length }} 页
        </span>
        <span class="converter-view__shortcut-hint">
          💡 输入 === 自动分页
        </span>
        <div class="converter-view__toolbar-btns">
          <button :disabled="store.currentPageIndex <= 0" @click="store.prevPage()">←</button>
          <button :disabled="store.currentPageIndex >= store.pageSources.length - 1" @click="store.nextPage()">→</button>
          <button @click="store.addPage()">＋</button>
          <button
            :disabled="store.pageSources.length <= 1"
            class="danger"
            @click="store.deletePage()"
          >✕</button>
        </div>
      </div>
      <MarkdownEditor 
        v-model="store.currentPageSource" 
        @page-break="handlePageBreak"
        @clear-all="store.clearAllPages"
      />
    </aside>

    <!-- Center: preview with card -->
    <main class="converter-view__preview">
      <div class="converter-view__card-area">
        <!-- 左箭头 -->
        <button 
          class="converter-view__arrow converter-view__arrow--left"
          :disabled="store.currentPageIndex <= 0"
          @click="store.prevPage()"
        >
          ←
        </button>

        <div class="converter-view__card-wrapper">
          <!-- 正文卡片 -->
          <CardCanvas
            v-for="(pageData, idx) in store.pages"
            v-show="idx === store.currentPageIndex"
            :key="idx"
            :ref="(el: any) => setCanvasRef(el, idx)"
            :card-style="store.currentStyle"
            :scale="previewScale"
            :extra-style="fontOverrideStyle"
          >
            <CardRenderer
              :card-style="store.currentStyle"
              :data="pageData"
              :author="store.author"
              :page="`${String(idx + 1).padStart(2, '0')} / ${String(store.totalPages).padStart(2, '0')}`"
              :title="store.cardTitle"
              :subtitle="store.cardSubtitle"
              :header-text="store.headerText"
              :footer-slogan="store.footerSlogan"
              :code-theme="store.codeTheme"
            />
          </CardCanvas>
        </div>

        <!-- 右箭头 -->
        <button 
          class="converter-view__arrow converter-view__arrow--right"
          :disabled="store.currentPageIndex >= store.totalPages - 1"
          @click="store.nextPage()"
        >
          →
        </button>
      </div>

      <!-- 圆点分页指示器 -->
      <div class="converter-view__pagination" v-if="store.totalPages > 1">
        <span
          v-for="idx in store.totalPages"
          :key="idx"
          :class="['converter-view__dot', { active: idx - 1 === store.currentPageIndex }]"
          @click="store.goToPage(idx - 1)"
        ></span>
      </div>

    </main>

    <!-- Right: fixed style panel -->
    <aside class="converter-view__settings">
      <StyleSelector v-model="store.currentStyle" />
      <CodeThemeSelector v-model="store.codeTheme" />
      <FontSelector
        v-model:title-font="store.titleFont"
        v-model:body-font="store.bodyFont"
        v-model:font-scale="store.fontScale"
        v-model:font-weight="store.fontWeight"
        v-model:header-text="store.headerText"
        v-model:author="store.author"
        v-model:card-title="store.cardTitle"
        v-model:card-subtitle="store.cardSubtitle"
      />
      <div class="converter-view__export-btns">
        <button class="converter-view__export-btn" @click="handleExportCurrent">导出当前页</button>
        <button class="converter-view__export-btn converter-view__export-btn--primary" @click="handleExportAll" v-if="store.totalPages > 1">导出全部</button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { useCardExport } from '@/composables/useCardExport'
import MarkdownEditor from '@/components/converter/MarkdownEditor.vue'
import CardCanvas from '@/components/card/CardCanvas.vue'
import CardRenderer from '@/components/card/CardRenderer.vue'
import StyleSelector from '@/components/converter/StyleSelector.vue'
import CodeThemeSelector from '@/components/converter/CodeThemeSelector.vue'
import FontSelector from '@/components/converter/FontSelector.vue'
import { loadCodeTheme } from '@/utils/codeThemeLoader'

const store = useCardStore()
const { exportElement } = useCardExport()

const previewScale = computed(() => 0.5)

/**
 * 处理分页：将光标后的内容创建为新页面
 */
function handlePageBreak(beforeContent: string, afterContent: string) {
  if (!afterContent.trim()) {
    store.currentPageSource = beforeContent
    return
  }
  
  if (!beforeContent.trim()) {
    store.currentPageSource = afterContent
    return
  }
  
  // 更新当前页为前半部分
  store.currentPageSource = beforeContent
  
  // 在当前页后面插入新页面
  store.pageSources.splice(store.currentPageIndex + 1, 0, afterContent)
  
  // 跳转到新页面
  store.goToPage(store.currentPageIndex + 1)
}


const fontOverrideStyle = computed(() => {
  const s: Record<string, string> = {}
  
  if (store.titleFont) {
    s['--card-title-font'] = store.titleFont
  }
  
  if (store.bodyFont) {
    s['--card-body-font'] = store.bodyFont
  }
  
  if (store.fontScale !== 100) {
    s['--card-font-scale'] = String(store.fontScale / 100)
  }
  
  if (store.fontWeight !== 400) {
    s['--card-font-weight'] = String(store.fontWeight)
  }
  
  return s
})

const canvasRefs = ref<Map<number, InstanceType<typeof CardCanvas>>>(new Map())

function setCanvasRef(el: any, idx: number) {
  if (el) canvasRefs.value.set(idx, el)
}

onMounted(() => {
  // 初始化加载代码主题
  loadCodeTheme(store.codeTheme)
})

// 监听代码主题变化
watch(() => store.codeTheme, (newTheme) => {
  loadCodeTheme(newTheme)
})

async function handleExportCurrent() {
  const canvas = canvasRefs.value.get(store.currentPageIndex)
  const el = canvas?.cardRef
  if (el) {
    await exportElement(el, `redcard-${store.currentStyle}-p${store.currentPageIndex + 1}-${Date.now()}.png`)
  }
}

async function handleExportAll() {
  // 逐页导出，需要临时显示每一页
  const originalIndex = store.currentPageIndex
  
  for (let i = 0; i < store.totalPages; i++) {
    // 临时切换到第 i 页
    store.currentPageIndex = i
    
    // 等待 DOM 更新
    await new Promise(r => setTimeout(r, 100))
    
    const canvas = canvasRefs.value.get(i)
    const el = canvas?.cardRef
    
    if (el) {
      // exportElement 会自动隐藏元素并恢复
      await exportElement(el, `redcard-${store.currentStyle}-p${i + 1}-${Date.now()}.png`)
      
      // 延迟一下再导出下一页
      if (i < store.totalPages - 1) {
        await new Promise(r => setTimeout(r, 300))
      }
    }
  }
  
  // 恢复到原来的页面
  store.currentPageIndex = originalIndex
}

// 监听分页标记，自动分页

watch(
  () => store.currentPageSource,
  (newContent, oldContent) => {
    if (!newContent) return
    
    // 只有当内容增加时才检测（说明是用户新输入）
    if (oldContent && newContent.length <= oldContent.length) {
      return // 内容没有增加，可能是删除或修改，不触发分页
    }
    
    const lines = newContent.split('\n')
    let pageIndex = -1
    let pageMarker = ''
    
    // 查找分页标记（只检测最后一行，说明是刚输入的）
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim()
      if (trimmed === '===' || trimmed === '---page---' || trimmed === '<!-- page -->') {
        pageIndex = i
        pageMarker = trimmed
      }
    }
    
    // 找到分页标记，立即触发分页
    if (pageIndex >= 0) {
      const beforeContent = lines.slice(0, pageIndex).join('\n').trim()
      const afterContent = lines.slice(pageIndex + 1).join('\n').trim()
      
      console.log('[AutoPage] 检测到新输入的分页标记:', pageMarker, '位置:', pageIndex)
      console.log('[AutoPage] 分页前内容长度:', beforeContent.length)
      console.log('[AutoPage] 分页后内容长度:', afterContent.length)
      
      // 更新当前页（删除分页标记）
      store.pageSources[store.currentPageIndex] = beforeContent
      
      // 插入新页面
      if (store.pageSources.length <= store.currentPageIndex + 1) {
        // 没有下一页，创建新页面
        store.pageSources.splice(store.currentPageIndex + 1, 0, afterContent)
        console.log('[AutoPage] ✅ 创建了新页面')
      } else {
        // 已有下一页，追加内容
        store.pageSources[store.currentPageIndex + 1] = 
          afterContent + '\n\n' + store.pageSources[store.currentPageIndex + 1]
        console.log('[AutoPage] ✅ 追加到下一页')
      }
      
      console.log('[AutoPage] 总页数:', store.pageSources.length)
    }
  },
  { deep: true }
)
</script>

<style scoped>
.converter-view {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #FFFFFF;
  position: relative;
}

/* 左侧编辑器 */
.converter-view__editor {
  position: absolute;
  left: 24px;
  top: 24px;
  bottom: 24px;
  width: 480px;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
  overflow: hidden;
  backdrop-filter: blur(10px);
}
.converter-view__editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: 8px;
  padding: 16px 20px;
  background: #FFFFFF;
  border-bottom: 1px solid #f0f0f0;
}
.converter-view__page-label {
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}
.converter-view__shortcut-hint {
  font-size: 12px;
  color: #667eea;
  font-weight: 500;
  white-space: nowrap;
  margin-left: 8px;
}
.converter-view__toolbar-btns {
  display: flex;
  gap: 6px;
}
.converter-view__toolbar-btns button {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f8f9fa;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #495057;
}
.converter-view__toolbar-btns button:hover:not(:disabled) {
  background: #e9ecef;
  transform: translateY(-1px);
}
.converter-view__toolbar-btns button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.converter-view__toolbar-btns button.danger {
  color: #dc3545;
  background: #fff5f5;
}
.converter-view__toolbar-btns button.danger:hover:not(:disabled) {
  background: #fee;
}

/* 中间预览区 */
.converter-view__preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 40px 80px;
  overflow: hidden;
  gap: 24px;
  /* 呼吸感：微噪点背景 */
  background: 
    radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(118, 75, 162, 0.03) 0%, transparent 50%),
    linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
}
.converter-view__preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.015;
  pointer-events: none;
}
.converter-view__card-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;
  z-index: 1;
}
.converter-view__card-wrapper {
  position: relative;
  border-radius: 24px;
  /* 层次感：大范围、低透明度柔和阴影 */
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  padding: 3px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  /* 样机外壳效果 */
  border: 1px solid rgba(255, 255, 255, 0.8);
}
.converter-view__card-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.8) 50%, 
    transparent 100%);
}
.converter-view__card-wrapper:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 
    0 28px 80px rgba(0, 0, 0, 0.15),
    0 12px 32px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.06);
}

/* 导航箭头 - 贴在卡片两侧 */
.converter-view__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #495057;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
}
.converter-view__arrow:hover:not(:disabled) {
  background: #FFFFFF;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);
}
.converter-view__arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.converter-view__arrow--left { 
  left: calc(50% - 260px - 72px);
}
.converter-view__arrow--right { 
  right: calc(50% - 260px - 72px);
}

/* 分页指示器 */
.converter-view__pagination {
  display: flex;
  gap: 12px;
  padding: 14px 24px;
  /* 柔和化：毛玻璃效果 */
  background: rgba(255, 255, 255, 0.85);
  border-radius: 28px;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 1px 4px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  position: relative;
  z-index: 1;
}
.converter-view__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c8cdd3;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.converter-view__dot::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.15);
  transition: transform 0.3s;
}
.converter-view__dot:hover {
  background: #667eea;
  transform: scale(1.3);
}
.converter-view__dot:hover::before {
  transform: translate(-50%, -50%) scale(1);
}
.converter-view__dot.active {
  background: #667eea !important;
  transform: scale(1.3);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}
.converter-view__dot.active::before {
  transform: translate(-50%, -50%) scale(1);
}

/* 右侧设置面板 */
.converter-view__settings {
  position: fixed;
  right: 24px;
  top: 24px;
  bottom: 24px;
  width: 400px;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  z-index: 100;
}

/* 卡片信息高亮区域 */
.converter-view__settings-section--highlight {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  padding: 16px;
  border-radius: 12px;
  border: 2px solid #6C5CE7;
  box-shadow: 0 2px 8px rgba(108, 92, 231, 0.1);
}
.converter-view__settings-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(108, 92, 231, 0.2);
}
.converter-view__field {
  margin-bottom: 10px;
}
.converter-view__field label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 4px;
}
.converter-view__field input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s;
  background: white;
}
.converter-view__field input:focus {
  outline: none;
  border-color: #6C5CE7;
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
}
.converter-view__field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.converter-view__required {
  color: #E74C3C;
  font-weight: bold;
}
.converter-view__export-btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
}
.converter-view__export-btn {
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #f8f9fa;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}
.converter-view__export-btn:hover {
  background: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}
.converter-view__export-btn--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #FFFFFF;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
}
.converter-view__export-btn--primary:hover {
  background: linear-gradient(135deg, #5568d3 0%, #65408b 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
}

/* 滚动条美化 */
.converter-view__settings::-webkit-scrollbar {
  width: 6px;
}
.converter-view__settings::-webkit-scrollbar-track {
  background: transparent;
}
.converter-view__settings::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 3px;
}
.converter-view__settings::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}

/* 响应式布局 */
@media (max-width: 1400px) {
  .converter-view__editor {
    width: 420px;
  }
  .converter-view__preview {
    padding: 40px 60px;
  }
}

@media (max-width: 1200px) {
  .converter-view__editor {
    width: 380px;
  }
  .converter-view__settings {
    width: 260px;
  }
  .converter-view__preview {
    padding: 40px 40px;
  }
}

@media (max-width: 1024px) {
  .converter-view__editor {
    width: 340px;
    left: 16px;
    top: 16px;
    bottom: 16px;
  }
  .converter-view__settings {
    width: 240px;
    right: 16px;
    top: 16px;
    bottom: 16px;
    padding: 16px;
  }
  .converter-view__preview {
    padding: 40px 20px;
  }
}

@media (max-width: 768px) {
  .converter-view__editor {
    width: calc(100% - 32px);
    left: 16px;
    right: 16px;
    top: auto;
    bottom: 16px;
    height: 50vh;
  }
  .converter-view__settings {
    display: none;
  }
  .converter-view__preview {
    padding: 20px 16px 60vh;
  }
  .converter-view__arrow {
    display: none;
  }
}
</style>