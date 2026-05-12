import type { CardStyle } from '@/types/styles'

export function formatVibrantTitle(title: string): string {
  return title.replace(/(\d+\s*[个件步条种分]+[^\s]*)/g, '<em>$1</em>')
}

export function formatDarkTitle(title: string): string {
  return title.replace(/(「[^」]+」|『[^』]+』|\d+[^\s]*)/g, '<em>$1</em>')
}

export function formatJapaneseTitle(title: string): string {
  return title.replace(/([^\s]{2,4}(?=的|之|与|和))/g, '<em>$1</em>')
}

export function formatTitle(title: string, style: CardStyle): string {
  switch (style) {
    case 'vibrant': return formatVibrantTitle(title)
    case 'dark': return formatDarkTitle(title)
    case 'japanese': return formatJapaneseTitle(title)
    default: return title
  }
}
