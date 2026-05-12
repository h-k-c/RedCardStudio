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
import { computed } from 'vue'
import type { CardData } from '@/types/card'
import { formatJapaneseTitle } from '@/utils/titleFormatters'

const props = defineProps<{
  data: CardData
  author: string
  page: string
  headerText?: string
  footerSlogan?: string
}>()

const formattedTitle = computed(() => formatJapaneseTitle(props.data.title))
</script>
