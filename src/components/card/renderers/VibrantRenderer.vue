<template>
  <div class="card__deco card__deco--1"></div>
  <div class="card__deco card__deco--2"></div>
  <div v-if="headerText" class="card__header">{{ headerText }}</div>
  <div class="card__category">✨</div>
  <h1 class="card__title" v-html="formattedTitle"></h1>
  <p v-if="data.subtitle" class="card__subtitle" v-html="data.subtitle"></p>
  <div class="card__steps">
    <div v-for="(step, idx) in data.steps" :key="idx" class="card__step">
      <span class="card__step-num">{{ idx + 1 }}</span>
      <div>
        <div class="card__step-title">{{ step.title }}</div>
        <div class="card__step-desc" v-html="step.desc"></div>
        <div v-if="step.tip" class="card__step-tip" v-html="'✦ ' + step.tip"></div>
      </div>
    </div>
  </div>
  <div v-if="data.tags.length" class="card__tags">
    <span v-for="tag in data.tags" :key="tag" class="card__tag">#{{ tag }}</span>
  </div>
  <div class="card__footer" v-if="author">
    <span>@{{ author }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CardData } from '@/types/card'
import { formatVibrantTitle } from '@/utils/titleFormatters'

const props = defineProps<{
  data: CardData
  author: string
  page: string
  headerText?: string
  footerSlogan?: string
}>()

const formattedTitle = computed(() => formatVibrantTitle(props.data.title))
</script>
