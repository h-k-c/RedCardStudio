<template>
  <div v-if="headerText" class="card__header">{{ headerText }}</div>
  <div class="card__category">{{ data.category }}</div>
  <h1 class="card__title" v-html="formattedTitle"></h1>
  <div class="card__divider"></div>
  <div class="card__steps">
    <div v-for="(step, idx) in data.steps" :key="idx" class="card__step">
      <div class="card__step-title">{{ step.title }}</div>
      <div class="card__step-desc" v-html="step.desc"></div>
      <div v-if="step.tip" class="card__step-tip" v-html="step.tip"></div>
    </div>
  </div>
  <div v-if="data.tags.length" class="card__tags">
    <span v-for="tag in data.tags" :key="tag" class="card__tag">#{{ tag }}</span>
  </div>
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
  headerText?: string
  footerSlogan?: string
  codeTheme?: string
}>()

const formattedTitle = computed(() => formatJapaneseTitle(props.data.title))

// 为代码块添加 data-theme 属性
function applyCodeTheme() {
  if (!props.codeTheme) return
  nextTick(() => {
    const codeBlocks = document.querySelectorAll('.card__code-block')
    codeBlocks.forEach(block => {
      block.setAttribute('data-theme', props.codeTheme || 'github')
    })
  })
}

// 监听数据变化和组件挂载时应用主题
watch(() => [props.data, props.codeTheme], applyCodeTheme, { deep: true })
onMounted(applyCodeTheme)
</script>
