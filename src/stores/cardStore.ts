import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CardStyle } from '@/types/styles'
import type { CardData } from '@/types/card'
import { useMarkdownParser } from '@/composables/useMarkdownParser'
import { STYLE_REGISTRY } from '@/data/styleRegistry'
import { useImageStore } from './imageStore'

export const useCardStore = defineStore('card', () => {
  const { parseSinglePage } = useMarkdownParser()
  const imageStore = useImageStore()

  const pageSources = ref<string[]>([''])

  const currentStyle = ref<CardStyle>('white')
  const author = ref('你的账号名')
  const currentPageIndex = ref(0)
  const autoSplitMax = ref(3)
  const previewScale = ref(0.38)

  const titleFont = ref('"Noto Serif SC", serif')
  const bodyFont = ref('"Noto Serif SC", serif')
  const fontScale = ref(160)
  const fontWeight = ref(500)

  const headerText = ref('')
  const footerSlogan = ref('')
  
  // 代码主题配置
  const codeTheme = ref<'github' | 'dark' | 'solarized' | 'monokai'>('github')

  // 为每一页解析 Markdown 数据
  const pages = computed<CardData[]>(() => {
    return pageSources.value.map(source => {
      // 替换图片占位符
      const resolved = source.replace(
        /!\[([^\]]*)\]\((img-\d+)\)/g,
        (_: string, alt: string, id: string) => {
          const url = imageStore.getUrl(id)
          return url ? `![${alt}](${url})` : `![${alt}]()`
        }
      )
      return parseSinglePage(resolved)
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
    reset,
  }
})
