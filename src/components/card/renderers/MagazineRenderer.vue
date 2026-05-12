<template>
  <div class="card__corner card__corner--tl"></div>
  <div class="card__corner card__corner--br"></div>
  
  <!-- 正文卡片：只显示步骤内容 -->
  <div class="card__steps" v-if="data.steps && data.steps.length > 0">
    <div v-for="(step, idx) in data.steps" :key="idx" class="card__step">
      <span class="card__step-num">{{ padNumber(idx + 1) }}</span>
      <div>
        <div class="card__step-title">{{ step.title }}</div>
        <div class="card__step-desc" v-html="step.desc"></div>
        <div v-if="step.tip" class="card__step-tip" v-html="'💡 ' + step.tip"></div>
      </div>
    </div>
  </div>
  <div v-else class="card__empty-hint">
    <p>在左侧编辑器中输入 Markdown 内容</p>
  </div>
  
  <div v-if="data.tags && data.tags.length" class="card__tags">
    <span v-for="tag in data.tags" :key="tag" class="card__tag">#{{ tag }}</span>
  </div>
  <div class="card__footer" v-if="author || page">
    <span v-if="author" class="card__footer--left">@{{ author }}</span>
    <span v-if="page" class="card__footer--right">{{ page }}</span>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, nextTick } from 'vue'
import type { CardData } from '@/types/card'
import { padNumber } from '@/utils/helpers'

const props = defineProps<{
  data: CardData
  author: string
  page: string
  codeTheme?: string
}>()

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
