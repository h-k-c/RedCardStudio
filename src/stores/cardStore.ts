import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { CardStyle } from '@/types/styles'
import type { CardData } from '@/types/card'
import { useMarkdownParser } from '@/composables/useMarkdownParser'
import { STYLE_REGISTRY } from '@/data/styleRegistry'

export const useCardStore = defineStore('card', () => {
  const { parseMultiPage } = useMarkdownParser()

  const pageSources = ref<string[]>([''])

  const currentStyle = ref<CardStyle>('white')
  const author = ref('AI_小蚂蚁')
  const currentPageIndex = ref(0)
  const autoSplitMax = ref(3)
  const previewScale = ref(0.38)

  const titleFont = ref('"Noto Serif SC", serif')
  const bodyFont = ref('"Noto Serif SC", serif')
  const fontScale = ref(160)
  const fontWeight = ref(500)

  const headerText = ref('')
  const footerSlogan = ref('')
  const cardTitle = ref('')
  const cardSubtitle = ref('')
  const cardCategory = ref('')
  const cardTags = ref('')
  
  // 代码主题配置
  const codeTheme = ref<'github' | 'dark' | 'solarized' | 'monokai'>('github')

  // 为每一页解析 Markdown 数据（支持自动分页和手动分页）
  const pages = computed<CardData[]>(() => {
    // 将所有 pageSources 合并成完整 Markdown
    const fullMarkdown = pageSources.value.join('\n\n===\n\n')
    
    // 使用 parseMultiPage 进行分页（自动+手动）
    const multiPageResult = parseMultiPage(fullMarkdown, autoSplitMax.value)
    
    return multiPageResult.pages.map((pageData, _index) => {
      pageData.title = cardTitle.value
      pageData.subtitle = cardSubtitle.value
      pageData.category = cardCategory.value || defaultCategory.value
      pageData.tags = cardTags.value ? cardTags.value.split(/[,，\s]+/).filter(Boolean) : []
      
      return pageData
    })
  })

  // 监听页面切换，确保 pageSources 同步
  watch(
    () => currentPageIndex.value,
    (newIndex) => {
      // 如果当前页超出了 pageSources 的范围，扩展它
      while (pageSources.value.length <= newIndex) {
        pageSources.value.push('')
      }
    }
  )

  const totalPages = computed(() => pages.value.length)

  const currentPageData = computed<CardData>(() => pages.value[currentPageIndex.value] || pages.value[0])

  const parsedData = computed<CardData>(() => currentPageData.value)

  // 编辑器显示当前页的内容
  const currentPageSource = computed({
    get: () => {
      return pageSources.value[currentPageIndex.value] || ''
    },
    set: (val: string) => {
      // 直接更新当前页
      if (currentPageIndex.value >= 0 && currentPageIndex.value < pageSources.value.length) {
        pageSources.value[currentPageIndex.value] = val
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
    const template = `## 步骤一\n在这里输入内容...\n`
    pageSources.value.splice(currentPageIndex.value + 1, 0, template)
    currentPageIndex.value++
  }

  function deletePage() {
    if (pageSources.value.length <= 1) return
    
    const deletedIndex = currentPageIndex.value
    const deletedContent = pageSources.value[deletedIndex]
    
    // 先合并内容，再删除页面
    if (deletedIndex > 0 && deletedContent) {
      // 有上一页，先追加内容
      const prevIndex = deletedIndex - 1
      pageSources.value[prevIndex] = pageSources.value[prevIndex] + '\n\n' + deletedContent
      console.log('[DeletePage] 已将被删页面内容追加到上一页')
    }
    
    // 再删除当前页
    pageSources.value.splice(deletedIndex, 1)
    
    // 调整当前页索引
    if (deletedIndex > 0) {
      // 删除的不是第一页，跳转到上一页
      currentPageIndex.value = deletedIndex - 1
    } else {
      // 删除的是第一页，停留在新的第一页
      currentPageIndex.value = 0
    }
    
    console.log('[DeletePage] 总页数:', pageSources.value.length)
  }

  function clearAllPages() {
    pageSources.value = ['']
    currentPageIndex.value = 0
    console.log('[ClearAll] 已清空所有内容')
  }

  function reset() {
    pageSources.value = ['']
    currentPageIndex.value = 0
  }

  return {
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
    cardTitle,
    cardSubtitle,
    cardCategory,
    cardTags,
    codeTheme,
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
    clearAllPages,
    reset,
  }
})
