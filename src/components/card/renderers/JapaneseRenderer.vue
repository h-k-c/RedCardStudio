<template>
  <!-- 固定区域：页眉 -->
  <div v-if="headerText" class="card__header">{{ headerText }}</div>
  
  <!-- 固定区域：标题 -->
  <h1 v-if="title" class="card__title" v-html="formattedTitle"></h1>
  
  <div class="card__divider"></div>
  
  <!-- 动态内容区域：Markdown HTML -->
  <div class="card__markdown-content" v-html="data.fullHtml"></div>
  
  <!-- 固定区域：页脚 -->
  <div class="card__footer">
    <span>@{{ author }}</span>
    <span v-if="footerSlogan">{{ footerSlogan }}</span>
    <span>{{ page }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, nextTick } from 'vue'
import type { CardData } from '@/types/card'
import { formatJapaneseTitle } from '@/utils/titleFormatters'

const props = defineProps<{
  data: CardData
  author: string
  page: string
  title?: string
  subtitle?: string
  headerText?: string
  footerSlogan?: string
  codeTheme?: string
}>()

const formattedTitle = computed(() => formatJapaneseTitle(props.title || ''))

// 为代码块添加 data-theme 属性
function applyCodeTheme() {
  if (!props.codeTheme) return
  nextTick(() => {
    const codeBlocks = document.querySelectorAll('pre code')
    codeBlocks.forEach(block => {
      const pre = block.parentElement
      if (pre) {
        pre.setAttribute('data-theme', props.codeTheme || 'github')
      }
    })
  })
}

// 监听数据变化和组件挂载时应用主题
watch(() => [props.data, props.codeTheme], applyCodeTheme, { deep: true })
onMounted(applyCodeTheme)
</script>
