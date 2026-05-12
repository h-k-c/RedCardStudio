import type { CardStyle } from '@/types/styles'

export interface TemplateInfo {
  id: string
  name: string
  desc: string
  category: CardStyle
  file: string
}

export const TEMPLATE_CATALOG: TemplateInfo[] = []
