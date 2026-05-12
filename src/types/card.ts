export interface CardStep {
  title: string
  desc: string
  tip: string
}

export interface CardPageStyle {
  style?: string
  titleFont?: string
  bodyFont?: string
  fontScale?: number
  fontWeight?: number
  headerText?: string
  author?: string
  codeTheme?: string
}

export interface CardData {
  title: string
  subtitle: string
  category: string
  steps: CardStep[]
  tags: string[]
  coverImage?: string
  // 页面独立样式（锁定后使用）
  pageStyle?: CardPageStyle | null
}
