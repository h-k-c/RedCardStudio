<template>
  <component
    :is="activeRenderer"
    :data="data"
    :author="author"
    :page="page"
    :header-text="headerText"
    :code-theme="codeTheme"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CardData } from '@/types/card'
import type { CardStyle } from '@/types/styles'
import { rendererMap } from './renderers'

const props = defineProps<{
  cardStyle: CardStyle
  data: CardData
  author: string
  page: string
  headerText?: string
  codeTheme?: string
}>()

const activeRenderer = computed(() => rendererMap[props.cardStyle])
</script>
