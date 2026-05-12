export type CardStyle = 'magazine' | 'vibrant' | 'dark' | 'japanese' | 'literary' | 'minimal' | 'white' | 'purewhite'

export interface StyleMeta {
  key: CardStyle
  label: string
  dotColor: string
  defaultCategory: string
}
