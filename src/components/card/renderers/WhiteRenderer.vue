<template>
  <div v-if="headerText" class="card__header">{{ headerText }}</div>
  <img v-if="data.coverImage" class="card__cover-img" :src="data.coverImage" alt="" />
  <div class="card__category">{{ data.category }}</div>
  <h1 class="card__title">{{ data.title }}</h1>
  <p v-if="data.subtitle" class="card__subtitle" v-html="data.subtitle"></p>
  <div class="card__divider"></div>
  <div class="card__steps">
    <div v-for="(step, idx) in data.steps" :key="idx" class="card__step">
      <span class="card__step-num">{{ romanNumeral(idx + 1) }}</span>
      <div>
        <div class="card__step-title">{{ step.title }}</div>
        <div class="card__step-desc" v-html="step.desc"></div>
        <div v-if="step.tip" class="card__step-tip" v-html="step.tip"></div>
      </div>
    </div>
  </div>
  <div v-if="data.tags.length" class="card__tags">
    <span v-for="tag in data.tags" :key="tag" class="card__tag">#{{ tag }}</span>
  </div>
  <div class="card__footer" v-if="author || page">
    <span v-if="author">@{{ author }}</span>
    <span v-if="page">{{ page }}</span>
  </div>
</template>

<script setup lang="ts">
import type { CardData } from '@/types/card'

defineProps<{
  data: CardData
  author: string
  page: string
  headerText?: string
  footerSlogan?: string
}>()

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x']
function romanNumeral(n: number): string {
  return ROMAN[n - 1] ?? String(n)
}
</script>
