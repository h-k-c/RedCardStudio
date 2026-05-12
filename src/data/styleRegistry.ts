import type { StyleMeta } from '@/types/styles'

export const styleRegistry: StyleMeta[] = [
  { key: 'magazine', label: '杂志经典', dotColor: '#C4A265', defaultCategory: 'Tutorial · Guide' },
  { key: 'vibrant', label: '活力元气', dotColor: '#FF6B6B', defaultCategory: 'Life Hack' },
  { key: 'dark', label: '暗黑高级', dotColor: '#333333', defaultCategory: 'Premium · Guide' },
  { key: 'japanese', label: '日系简约', dotColor: '#CCCCCC', defaultCategory: 'Minimal Life' },
  { key: 'literary', label: '文艺清新', dotColor: '#8BA888', defaultCategory: 'a gentle guide' },
  { key: 'minimal', label: '极简黑白', dotColor: '#111111', defaultCategory: 'Minimal' },
  { key: 'white', label: '奶白衬线', dotColor: '#C8B89A', defaultCategory: 'Essay · Story' },
  { key: 'purewhite', label: '纯奶牛白', dotColor: '#E8E4DF', defaultCategory: 'Clean · Pure' },
]

export const STYLE_REGISTRY = styleRegistry
