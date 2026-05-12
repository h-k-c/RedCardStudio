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
}
