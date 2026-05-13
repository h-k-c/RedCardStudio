export interface CardStep {
  title: string
  desc: string
  tip: string
}

export interface CardData {
  title: string
  subtitle: string
  category: string
  steps: CardStep[]
  tags: string[]
  coverImage?: string
  // 完整的 Markdown HTML 内容（直接渲染）
  fullHtml?: string
}
