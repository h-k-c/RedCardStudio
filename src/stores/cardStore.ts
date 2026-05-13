import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CardStyle } from '@/types/styles'
import type { CardData, CardPageStyle } from '@/types/card'
import { useMarkdownParser } from '@/composables/useMarkdownParser'
import { STYLE_REGISTRY } from '@/data/styleRegistry'
import { useImageStore } from './imageStore'

export const useCardStore = defineStore('card', () => {
  const { parseSinglePage } = useMarkdownParser()
  const imageStore = useImageStore()

  const pageSources = ref<string[]>([''])
  // 存储每页的独立样式
  const pageStyles = ref<Array<CardPageStyle | null>>([null])

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

  // 为每一页解析 Markdown 数据
  const pages = computed<CardData[]>(() => {
    return pageSources.value.map((source, index) => {
      // 替换图片占位符
      const resolved = source.replace(
        /!\[([^\]]*)\]\((img-\d+)\)/g,
        (_: string, alt: string, id: string) => {
          const url = imageStore.getUrl(id)
          return url ? `![${alt}](${url})` : `![${alt}]()`
        }
      )
      const pageData = parseSinglePage(resolved)
      
      // 优先使用页面锁定的元数据，否则使用全局设置
      const pageStyle = pageStyles.value[index]
      pageData.title = pageStyle?.cardTitle || cardTitle.value || '标题'
      pageData.subtitle = pageStyle?.cardSubtitle || cardSubtitle.value
      pageData.category = pageStyle?.cardCategory || cardCategory.value || defaultCategory.value
      pageData.tags = pageStyle?.cardTags 
        ? pageStyle.cardTags.split(/[,，\s]+/).filter(Boolean)
        : (cardTags.value ? cardTags.value.split(/[,，\s]+/).filter(Boolean) : [])
      
      // 附加页面独立样式
      pageData.pageStyle = pageStyle || null
      return pageData
    })
  })

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
    pageStyles.value.splice(currentPageIndex.value + 1, 0, null)
    currentPageIndex.value++
  }

  function deletePage() {
    if (pageSources.value.length <= 1) return
    pageSources.value.splice(currentPageIndex.value, 1)
    pageStyles.value.splice(currentPageIndex.value, 1)
    if (currentPageIndex.value >= pageSources.value.length) {
      currentPageIndex.value = pageSources.value.length - 1
    }
  }

  /**
   * 锁定当前页：保存当前样式快照，不再受全局样式影响
   */
  function lockPage() {
    const pageIndex = currentPageIndex.value
    if (pageIndex >= 0 && pageIndex < pageSources.value.length) {
      // 保存当前全局样式到页面
      pageStyles.value[pageIndex] = {
        style: currentStyle.value,
        titleFont: titleFont.value,
        bodyFont: bodyFont.value,
        fontScale: fontScale.value,
        fontWeight: fontWeight.value,
        headerText: headerText.value,
        author: author.value,
        codeTheme: codeTheme.value,
        cardTitle: cardTitle.value,
        cardSubtitle: cardSubtitle.value,
        cardCategory: cardCategory.value,
        cardTags: cardTags.value
      }
    }
  }

  /**
   * 解锁当前页：清除样式快照，恢复使用全局样式
   */
  function unlockPage() {
    const pageIndex = currentPageIndex.value
    if (pageIndex >= 0 && pageIndex < pageSources.value.length) {
      pageStyles.value[pageIndex] = null
    }
  }

  /**
   * 检查当前页是否已锁定
   */
  function isPageLocked(): boolean {
    const pageIndex = currentPageIndex.value
    if (pageIndex >= 0 && pageIndex < pageSources.value.length) {
      return !!pageStyles.value[pageIndex]
    }
    return false
  }

  /**
   * 获取当前页应使用的样式（优先使用页面独立样式）
   */
  function getCurrentPageStyle() {
    const pageIndex = currentPageIndex.value
    if (pageIndex >= 0 && pageIndex < pages.value.length) {
      const page = pages.value[pageIndex]
      if (page.pageStyle) {
        return page.pageStyle
      }
    }
    // 返回全局样式
    return {
      style: currentStyle.value,
      titleFont: titleFont.value,
      bodyFont: bodyFont.value,
      fontScale: fontScale.value,
      fontWeight: fontWeight.value,
      headerText: headerText.value,
      author: author.value,
      codeTheme: codeTheme.value
    }
  }

  function reset() {
    pageSources.value = ['']
    pageStyles.value = [null]
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
    lockPage,
    unlockPage,
    isPageLocked,
    getCurrentPageStyle,
    reset,
  }
})
