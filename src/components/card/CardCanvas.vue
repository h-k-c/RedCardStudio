<template>
  <div
    class="card-canvas"
    :style="{
      width: `${1080 * (scale ?? 1)}px`,
      height: `${1440 * (scale ?? 1)}px`
    }"
  >
    <div
      ref="cardRef"
      :class="['card', `card--${cardStyle}`]"
      :style="{ zoom: scale ?? 1, ...extraStyle }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CardStyle } from '@/types/styles'

defineProps<{
  cardStyle: CardStyle
  scale?: number
  extraStyle?: Record<string, string>
}>()
const cardRef = ref<HTMLElement>()

defineExpose({ cardRef })
</script>

<style scoped>
.card-canvas {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}
</style>
