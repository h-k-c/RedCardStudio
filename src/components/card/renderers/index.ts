import type { Component } from 'vue'
import type { CardStyle } from '@/types/styles'
import MagazineRenderer from './MagazineRenderer.vue'
import VibrantRenderer from './VibrantRenderer.vue'
import DarkRenderer from './DarkRenderer.vue'
import JapaneseRenderer from './JapaneseRenderer.vue'
import LiteraryRenderer from './LiteraryRenderer.vue'
import MinimalRenderer from './MinimalRenderer.vue'
import WhiteRenderer from './WhiteRenderer.vue'
import PureWhiteRenderer from './PureWhiteRenderer.vue'

export const rendererMap: Record<CardStyle, Component> = {
  magazine: MagazineRenderer,
  vibrant: VibrantRenderer,
  dark: DarkRenderer,
  japanese: JapaneseRenderer,
  literary: LiteraryRenderer,
  minimal: MinimalRenderer,
  white: WhiteRenderer,
  purewhite: PureWhiteRenderer,
}
