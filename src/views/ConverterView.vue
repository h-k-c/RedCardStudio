<template>
  <div class="converter-view">
    <!-- Left: editor panel -->
    <aside class="converter-view__editor">
      <div class="converter-view__editor-header">
        <span class="converter-view__page-label">
          第 {{ store.currentPageIndex + 1 }} / {{ store.pageSources.length }} 页
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
      <MarkdownEditor v-model="store.currentPageSource" />
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
      <FontSelector
        v-model:title-font="store.titleFont"
        v-model:body-font="store.bodyFont"
        v-model:font-scale="store.fontScale"
        v-model:font-weight="store.fontWeight"
        v-model:header-text="store.headerText"
        v-model:author="store.author"
      />
      <div class="converter-view__export-btns">
        <button class="converter-view__export-btn" @click="handleExportCurrent">导出当前页</button>
        <button class="converter-view__export-btn converter-view__export-btn--primary" @click="handleExportAll" v-if="store.totalPages > 1">导出全部</button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { useCardExport } from '@/composables/useCardExport'
import MarkdownEditor from '@/components/converter/MarkdownEditor.vue'
import CardCanvas from '@/components/card/CardCanvas.vue'
import CardRenderer from '@/components/card/CardRenderer.vue'
import StyleSelector from '@/components/converter/StyleSelector.vue'
import FontSelector from '@/components/converter/FontSelector.vue'

const store = useCardStore()
const { exportElement } = useCardExport()

const previewScale = computed(() => 0.5)

const fontOverrideStyle = computed(() => {
  const s: Record<string, string> = {}
  if (store.titleFont) s['--card-title-font'] = store.titleFont
  if (store.bodyFont) s['--card-body-font'] = store.bodyFont
  if (store.fontScale !== 100) s['--card-font-scale'] = String(store.fontScale / 100)
  if (store.fontWeight !== 400) s['--card-font-weight'] = String(store.fontWeight)
  return s
})

const canvasRefs = ref<Map<number, InstanceType<typeof CardCanvas>>>(new Map())

function setCanvasRef(el: any, idx: number) {
  if (el) canvasRefs.value.set(idx, el)
}

/**
 * 检测卡片内容是否溢出
 */
function checkOverflow(): boolean {
  const canvas = canvasRefs.value.get(store.currentPageIndex)
  const cardEl = canvas?.cardRef
  if (!cardEl) return false

  // 卡片实际高度 1440px
  const cardHeight = 1440
  const contentHeight = cardEl.scrollHeight
  
  return contentHeight > cardHeight
}

/**
 * 自动分页：检测溢出并分割内容
 */
async function autoPaginate() {
  await nextTick()
  
  if (!checkOverflow()) return
  
  // 获取当前页的步骤数
  const currentPageData = store.pages[store.currentPageIndex]
  if (!currentPageData || currentPageData.steps.length <= 1) return
  
  // 将最后一个步骤移到下一页
  const lastStep = currentPageData.steps[currentPageData.steps.length - 1]
  const currentSource = store.pageSources[store.currentPageIndex]
  
  // 从原始 Markdown 中提取最后一个步骤的完整内容
  const lines = currentSource.split('\n')
  const stepStartIndex = lines.findIndex((line, idx) => {
    if (!line.startsWith('## ')) return false
    // 检查是否是最后一个步骤
    const stepTitle = line.substring(3).trim()
    return stepTitle === lastStep.title || line.includes(lastStep.title)
  })
  
  if (stepStartIndex === -1) return
  
  // 找到步骤结束位置（下一个 ## 或文件末尾）
  let stepEndIndex = lines.findIndex((line, idx) => 
    idx > stepStartIndex && line.startsWith('## ')
  )
  if (stepEndIndex === -1) stepEndIndex = lines.length
  
  // 提取步骤的 Markdown
  const stepMarkdown = lines.slice(stepStartIndex, stepEndIndex).join('\n')
  
  // 创建或更新下一页
  if (store.pageSources.length <= store.currentPageIndex + 1) {
    // 没有下一页，创建新页
    const newPageMd = `# ${currentPageData.title}\n\n${currentPageData.subtitle ? '> ' + currentPageData.subtitle + '\n\n' : ''}${stepMarkdown}\n`
    store.pageSources.splice(store.currentPageIndex + 1, 0, newPageMd)
  } else {
    // 有下一页，插入到下一页开头
    const nextPageSource = store.pageSources[store.currentPageIndex + 1]
    // 移除下一页的标题部分，保留其他内容
    const lines = nextPageSource.split('\n')
    let contentStartIndex = 0
    for (let i = 0; i < lines.length; i++) {
      if (i === 0 && lines[i].startsWith('#')) continue
      if (lines[i].startsWith('>')) continue
      if (lines[i].trim() === '') continue
      contentStartIndex = i
      break
    }
    const nextContent = lines.slice(contentStartIndex).join('\n')
    const newNextPage = `# ${currentPageData.title}\n\n${currentPageData.subtitle ? '> ' + currentPageData.subtitle + '\n\n' : ''}${stepMarkdown}\n\n${nextContent}`
    store.pageSources[store.currentPageIndex + 1] = newNextPage
  }
  
  // 从当前页移除该步骤
  lines.splice(stepStartIndex, stepEndIndex - stepStartIndex)
  store.pageSources[store.currentPageIndex] = lines.join('\n').trim()
}

// 监听内容变化，自动检测溢出
watch(
  () => [store.currentPageSource, store.fontScale, store.fontWeight],
  () => {
    // 延迟检测，等待渲染完成
    setTimeout(() => autoPaginate(), 500)
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => autoPaginate())
})

async function handleExportCurrent() {
  const canvas = canvasRefs.value.get(store.currentPageIndex)
  const el = canvas?.cardRef
  if (el) {
    await exportElement(el, `redcard-${store.currentStyle}-p${store.currentPageIndex + 1}-${Date.now()}.png`)
  }
}

async function handleExportAll() {
  // 保存当前页索引
  const originalPageIndex = store.currentPageIndex
  
  // 逐页导出
  for (let i = 0; i < store.totalPages; i++) {
    // 切换到该页
    store.goToPage(i)
    
    // 等待渲染完成
    await nextTick()
    await new Promise(r => setTimeout(r, 500))
    
    // 获取卡片元素
    const canvas = canvasRefs.value.get(i)
    const el = canvas?.cardRef
    
    if (el) {
      // 导出
      await exportElement(el, `redcard-${store.currentStyle}-p${i + 1}.png`)
      
      // 延迟一下再切下一页
      if (i < store.totalPages - 1) {
        await new Promise(r => setTimeout(r, 300))
      }
    }
  }
  
  // 恢复到原来的页面
  store.goToPage(originalPageIndex)
}
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
  padding: 24px 80px;
  overflow: hidden;
  gap: 20px;
}
.converter-view__card-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.converter-view__card-wrapper {
  position: relative;
  border-radius: 20px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: #FFFFFF;
  padding: 2px;
  transition: transform 0.3s ease;
}
.converter-view__card-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 56px rgba(0, 0, 0, 0.18), 0 6px 16px rgba(0, 0, 0, 0.12);
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
  gap: 10px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}
.converter-view__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #dee2e6;
  cursor: pointer;
  transition: all 0.2s;
}
.converter-view__dot:hover {
  background: #adb5bd;
  transform: scale(1.2);
}
.converter-view__dot.active {
  background: #667eea !important;
  transform: scale(1.3);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* 右侧设置面板 */
.converter-view__settings {
  position: fixed;
  right: 24px;
  top: 24px;
  bottom: 24px;
  width: 300px;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px 20px;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  z-index: 100;
}
.converter-view__export-btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
  padding-bottom: 8px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.converter-view__export-btn {
  width: 100%;
  padding: 12px 18px;
  border: none;
  border-radius: 10px;
  background: #f8f9fa;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}
.converter-view__export-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}
.converter-view__export-btn--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
.converter-view__export-btn--primary:hover {
  background: linear-gradient(135deg, #5568d3 0%, #65408b 100%);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
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
</style>