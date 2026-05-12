import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CardStyle } from '@/types/styles'
import type { CardData } from '@/types/card'
import { useMarkdownParser } from '@/composables/useMarkdownParser'
import { STYLE_REGISTRY } from '@/data/styleRegistry'
import { useImageStore } from './imageStore'

export const useCardStore = defineStore('card', () => {
  const { parseMultiPage } = useMarkdownParser()
  const imageStore = useImageStore()

  const pageSources = ref<string[]>([
    `# 手机摄影构图 5个核心法则

> 从入门到进阶，拍出杂志感大片

#摄影 #构图 #教程

## 三分法则
将画面分成 3×3 的九宫格，把主体放在 **交叉点** 上。这是最基础也最有效的构图方式。

> 💡 打开手机相机的 \`网格线\` 辅助对齐

## 引导线构图
利用道路、栏杆、建筑线条等元素，将视线引向画面主体，营造 *纵深感*。

> 💡 街道、楼梯、河流都是天然的引导线

## 框架构图
通过门窗、拱门、树枝等自然框架聚焦视线，增加画面层次和故事感。`,
    `# 手机摄影构图 5个核心法则

> 进阶篇

#摄影 #进阶

## 对称与平衡
利用水面倒影、建筑对称轴，创造视觉 **稳定感**。适合表现庄重、宁静的氛围。

## 留白艺术
大胆留出空白区域，让主体呼吸。*少即是多*，空间本身就是设计的一部分。

> 💡 留白比例建议占画面 \`40%-60%\`

---
Photography · Tutorial`
  ])

  const markdownContent = computed(() => pageSources.value.join('\n\n===\n\n'))

  // Replace img-xxx placeholders with actual blob URLs before parsing
  const resolvedMarkdown = computed(() => {
    return markdownContent.value.replace(
      /!\[([^\]]*)\]\((img-\d+)\)/g,
      (_: string, alt: string, id: string) => {
        const url = imageStore.getUrl(id)
        return url ? `![${alt}](${url})` : `![${alt}]()`
      }
    )
  })

  const currentStyle = ref<CardStyle>('white')
  const author = ref('你的账号名')
  const currentPageIndex = ref(0)
  const autoSplitMax = ref(4)
  const previewScale = ref(0.38)

  const titleFont = ref('"Noto Serif SC", serif')
  const bodyFont = ref('"Noto Serif SC", serif')
  const fontScale = ref(160)
  const fontWeight = ref(500)

  const headerText = ref('')
  const footerSlogan = ref('')

  const multiPageData = computed(() => parseMultiPage(resolvedMarkdown.value, autoSplitMax.value))

  const pages = computed<CardData[]>(() => multiPageData.value.pages)
  const totalPages = computed(() => multiPageData.value.totalPages)

  const currentPageData = computed<CardData>(() => pages.value[currentPageIndex.value] || pages.value[0])

  const parsedData = computed<CardData>(() => currentPageData.value)

  const currentPageSource = computed({
    get: () => pageSources.value[currentPageIndex.value] || '',
    set: (val: string) => {
      const cleaned = val.replace(/^===+$/gm, '---')
      if (currentPageIndex.value >= 0 && currentPageIndex.value < pageSources.value.length) {
        pageSources.value[currentPageIndex.value] = cleaned
        
        // 如果当前页内容被清空且有多页，重置为单页
        if (cleaned.trim() === '' && pageSources.value.length > 1) {
          pageSources.value = ['']
          currentPageIndex.value = 0
        }
      }
    }
  })

  const defaultCategory = computed(() => {
    const meta = STYLE_REGISTRY.find(s => s.key === currentStyle.value)
    return meta?.defaultCategory || 'Guide'
  })

  function setStyle(style: CardStyle) {
    currentStyle.value = style
  }

  function goToPage(index: number) {
    if (index >= 0 && index < totalPages.value) {
      currentPageIndex.value = index
    }
  }

  function nextPage() {
    goToPage(currentPageIndex.value + 1)
  }

  function prevPage() {
    goToPage(currentPageIndex.value - 1)
  }

  function addPage() {
    const template = `# 新页面\n\n> 副标题\n\n## 步骤一\n在这里输入内容...\n`
    pageSources.value.splice(currentPageIndex.value + 1, 0, template)
    currentPageIndex.value++
  }

  function deletePage() {
    if (pageSources.value.length <= 1) return
    pageSources.value.splice(currentPageIndex.value, 1)
    if (currentPageIndex.value >= pageSources.value.length) {
      currentPageIndex.value = pageSources.value.length - 1
    }
  }

  function reset() {
    pageSources.value = ['']
    currentPageIndex.value = 0
  }

  return {
    markdownContent,
    resolvedMarkdown,
    pageSources,
    currentPageSource,
    currentStyle,
    author,
    currentPageIndex,
    autoSplitMax,
    previewScale,
    titleFont,
    bodyFont,
    fontScale,
    fontWeight,
    headerText,
    footerSlogan,
    pages,
    totalPages,
    currentPageData,
    parsedData,
    defaultCategory,
    setStyle,
    goToPage,
    nextPage,
    prevPage,
    addPage,
    deletePage,
    reset,
  }
})
