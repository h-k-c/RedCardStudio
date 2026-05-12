<template>
  <div class="card__watermark">{{ String(data.steps.length || 1).padStart(2, '0') }}</div>
  <div v-if="headerText" class="card__header">{{ headerText }}</div>
  <div class="card__category">{{ data.category }}</div>
  <h1 class="card__title">{{ data.title }}</h1>
  <p v-if="data.subtitle" class="card__subtitle" v-html="data.subtitle"></p>
  <div class="card__divider"></div>
  <div class="card__steps">
    <div v-for="(step, idx) in data.steps" :key="idx" class="card__step">
      <span class="card__step-num">{{ idx + 1 }}</span>
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
  <div class="card__footer">
    <span>@{{ author }}</span>
    <span v-if="footerSlogan">{{ footerSlogan }}</span>
    <span>{{ page }}</span>
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
</script>
