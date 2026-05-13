<template>
  <div class="card__gold-line"></div>
  <div class="card__inner">
    <!-- 固定区域：页眉 -->
    <div v-if="headerText" class="card__header">{{ headerText }}</div>
    
    <!-- 固定区域：标题 -->
    <h1 v-if="title" class="card__title" v-html="formattedTitle"></h1>
    
    <!-- 固定区域：副标题 -->
    <p v-if="subtitle" class="card__subtitle">{{ subtitle }}</p>
    
    <div class="card__divider"></div>
    
    <!-- 动态内容区域：Markdown HTML -->
    <div class="card__markdown-content" v-html="data.fullHtml"></div>
    
    <!-- 固定区域：页脚 -->
    <div class="card__footer" v-if="author || page">
      <span v-if="author">@{{ author }}</span>
      <span v-if="page">{{ page }}</span>
    </div>
  </div>
  <div class="card__gold-line"></div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, nextTick } from 'vue'
import type { CardData } from '@/types/card'
import { formatDarkTitle } from '@/utils/titleFormatters'

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

const formattedTitle = computed(() => formatDarkTitle(props.title || ''))

// 为代码块添加 data-theme 属性
function applyCodeTheme() {
  if (!props.codeTheme) return
  nextTick(() => {
    const codeTerminals = document.querySelectorAll('.card__code-terminal')
    codeTerminals.forEach(terminal => {
      terminal.setAttribute('data-theme', props.codeTheme || 'github')
      const codeBlock = terminal.querySelector('.card__code-block')
      if (codeBlock) {
        codeBlock.setAttribute('data-theme', props.codeTheme || 'github')
      }
    })
  })
}

// 监听数据变化和组件挂载时应用主题
watch(() => [props.data, props.codeTheme], applyCodeTheme, { deep: true })
onMounted(applyCodeTheme)
</script>
