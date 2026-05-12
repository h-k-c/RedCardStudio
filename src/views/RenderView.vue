<template>
  <div class="render-view">
    <CardCanvas
      v-if="pageData"
      :card-style="config.style || 'magazine'"
      :scale="1"
      :extra-style="fontOverrideStyle"
    >
      <CardRenderer
        :card-style="config.style || 'magazine'"
        :data="pageData"
        :author="config.author || 'RedCard'"
        :page="pageLabel"
        :header-text="config.headerText"
        :footer-slogan="config.footerSlogan"
      />
    </CardCanvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { CardStyle } from '@/types/styles'
import type { CardData } from '@/types/card'
import { useMarkdownParser } from '@/composables/useMarkdownParser'
import CardCanvas from '@/components/card/CardCanvas.vue'
import CardRenderer from '@/components/card/CardRenderer.vue'

interface RenderConfig {
  markdown: string
  style?: CardStyle
  author?: string
  fontScale?: number
  titleFont?: string
  bodyFont?: string
  headerText?: string
  footerSlogan?: string
  pageIndex?: number
  hidePage?: boolean
}

const { parseMultiPage } = useMarkdownParser()

const config = ref<RenderConfig>({
  markdown: '',
  style: 'magazine'
})

const multiPageResult = computed(() => {
  if (!config.value.markdown) return null
  return parseMultiPage(config.value.markdown, 0)
})

const pageData = computed<CardData | null>(() => {
  const result = multiPageResult.value
  if (!result) return null
  const idx = config.value.pageIndex ?? 0
  return result.pages[idx] || result.pages[0] || null
})

const pageLabel = computed(() => {
  if (config.value.hidePage) return ''
  const result = multiPageResult.value
  if (!result) return '01 / 01'
  const idx = config.value.pageIndex ?? 0
  const total = result.totalPages
  return `${String(idx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
})

const fontOverrideStyle = computed(() => {
  const s: Record<string, string> = {}
  if (config.value.titleFont) s['--card-title-font'] = config.value.titleFont
  if (config.value.bodyFont) s['--card-body-font'] = config.value.bodyFont
  if (config.value.fontScale && config.value.fontScale !== 100) {
    s['--card-font-scale'] = String(config.value.fontScale / 100)
  }
  return s
})

// 暴露全局函数给 Playwright / MCP Server 调用
declare global {
  interface Window {
    __renderCard__?: (cfg: RenderConfig) => Promise<void>
  }
}

window.__renderCard__ = async (cfg: RenderConfig) => {
  document.body.dataset.rendered = 'false'
  config.value = { ...config.value, ...cfg }
  await nextTick()
  // 等待字体和样式稳定
  await new Promise(r => setTimeout(r, 800))
  document.body.dataset.rendered = 'true'
}
</script>

<style scoped>
.render-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F0EFEC;
}
</style>
