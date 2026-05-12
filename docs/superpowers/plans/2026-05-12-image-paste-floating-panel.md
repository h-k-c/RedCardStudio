# Image Paste + Floating Style Panel + Creamy White Style — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add image paste/drop support to the Markdown editor, move style controls to a floating right-side panel, and add a creamy-white serif card style.

**Architecture:** Images are stored as blob URLs in a new `imageStore` (session-only). `cardStore` resolves `img-xxx` placeholder references to real blob URLs before parsing. A new `FloatingStylePanel` component replaces the left-side `ConverterPanel`, and `ConverterView` is restructured to a left-editor / right-preview+float layout.

**Tech Stack:** Vue 3 + Pinia + TypeScript + Vite. No test framework — verification via `npm run typecheck` and dev server.

---

### Task 1: Extend Types (`card.ts`, `styles.ts`)

**Files:**
- Modify: `src/types/card.ts`
- Modify: `src/types/styles.ts`

- [ ] **Step 1: Add `coverImage` to `CardData`**

Replace the contents of `src/types/card.ts` with:

```ts
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
```

- [ ] **Step 2: Add `'white'` to `CardStyle`**

Replace the contents of `src/types/styles.ts` with:

```ts
export type CardStyle = 'magazine' | 'tech' | 'vibrant' | 'dark' | 'japanese' | 'literary' | 'terminal' | 'purple' | 'minimal' | 'timeline' | 'white'

export interface StyleMeta {
  key: CardStyle
  label: string
  dotColor: string
  defaultCategory: string
}
```

- [ ] **Step 3: Verify types compile**

Run: `npm run typecheck`

Expected: errors about `rendererMap` missing `white` key — that is expected and will be fixed in Task 4. Any other errors are real and must be fixed now.

- [ ] **Step 4: Commit**

```bash
git add src/types/card.ts src/types/styles.ts
git commit -m "feat: add coverImage to CardData and white to CardStyle"
```

---

### Task 2: Image Store (`imageStore.ts`)

**Files:**
- Create: `src/stores/imageStore.ts`

- [ ] **Step 1: Create imageStore**

Create `src/stores/imageStore.ts`:

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImageStore = defineStore('image', () => {
  const images = ref(new Map<string, string>())
  let counter = 0

  function addImage(file: File): string {
    const id = `img-${String(++counter).padStart(3, '0')}`
    const url = URL.createObjectURL(file)
    images.value.set(id, url)
    return id
  }

  function getUrl(id: string): string | undefined {
    return images.value.get(id)
  }

  function cleanup() {
    images.value.forEach(url => URL.revokeObjectURL(url))
    images.value.clear()
  }

  return { images, addImage, getUrl, cleanup }
})
```

- [ ] **Step 2: Register cleanup in app entry**

Open `src/main.ts`. Add cleanup on `beforeunload`:

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/app.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')

window.addEventListener('beforeunload', () => {
  const { useImageStore } = require('./stores/imageStore')
  useImageStore().cleanup()
})
```

Wait — `require` won't work in ESM. Use this pattern instead:

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useImageStore } from './stores/imageStore'
import './styles/app.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')

window.addEventListener('beforeunload', () => {
  useImageStore().cleanup()
})
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/stores/imageStore.ts src/main.ts
git commit -m "feat: add imageStore for session-scoped blob URL management"
```

---

### Task 3: Creamy White Renderer — CSS + Component

**Files:**
- Modify: `src/styles/card-renderers.css`
- Create: `src/components/card/renderers/WhiteRenderer.vue`

- [ ] **Step 1: Add `--card-font-weight` variable and `.card--white` CSS**

Open `src/styles/card-renderers.css`.

After the `.card` block (line ~12), add font-weight support to the shared body-text selectors. Find the block:

```css
.card .card__subtitle,
.card .card__step-desc,
.card .card__step-tip,
.card .card__footer {
  font-family: var(--card-body-font, inherit) !important;
}
```

Change it to:

```css
.card .card__subtitle,
.card .card__step-desc,
.card .card__step-tip,
.card .card__footer {
  font-family: var(--card-body-font, inherit) !important;
  font-weight: var(--card-font-weight, 400);
}
```

- [ ] **Step 2: Add `.card__cover-img` shared style**

After the `.card__header` block (around line ~139), add:

```css
.card__cover-img {
  width: 100%;
  max-height: 360px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 24px;
  display: block;
}
```

- [ ] **Step 3: Add `.card--white` styles at end of `card-renderers.css`**

Append at the very end of `src/styles/card-renderers.css`:

```css
/* === 奶白衬线 · 清雅书卷 === */
.card--white {
  background: #FDFCF7;
  font-family: "Noto Serif SC", "Source Han Serif", "SimSun", serif;
  color: #1A1A1A;
  padding: 64px;
  display: flex;
  flex-direction: column;
}
.card--white .card__header { color: #A89070; font-size: calc(11px * var(--card-font-scale, 1)); letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 16px; }
.card--white .card__category { font-size: calc(12px * var(--card-font-scale, 1)); letter-spacing: 0.2em; color: #B0A090; text-transform: uppercase; margin-bottom: 20px; }
.card--white .card__title { font-size: calc(42px * var(--card-font-scale, 1)); font-weight: 600; line-height: 1.25; letter-spacing: 0.01em; margin-bottom: 16px; color: #1A1A1A; }
.card--white .card__subtitle { font-size: calc(16px * var(--card-font-scale, 1)); color: #6A5A4A; margin-bottom: 24px; line-height: 1.7; font-style: italic; }
.card--white .card__divider { width: 48px; height: 1px; background: #C8B89A; margin-bottom: 36px; }
.card--white .card__steps { flex: 1; display: flex; flex-direction: column; gap: 28px; }
.card--white .card__step { display: grid; grid-template-columns: 48px 1fr; gap: 16px; padding-bottom: 24px; border-bottom: 1px solid #EDE8E0; }
.card--white .card__step:last-child { border-bottom: none; }
.card--white .card__step-num { font-size: calc(13px * var(--card-font-scale, 1)); color: #C8B89A; letter-spacing: 0.1em; line-height: 1.6; padding-top: 3px; text-align: right; }
.card--white .card__step-title { font-size: calc(20px * var(--card-font-scale, 1)); font-weight: 600; margin-bottom: 6px; color: #1A1A1A; letter-spacing: 0.01em; }
.card--white .card__step-desc { font-size: calc(15px * var(--card-font-scale, 1)); color: #5A4A3A; line-height: 1.85; }
.card--white .card__step-tip { margin-top: 10px; padding: 10px 16px; background: #F5F0E8; border-left: 2px solid #C8B89A; font-size: calc(13px * var(--card-font-scale, 1)); color: #7A6A5A; font-style: italic; }
.card--white .card__tags { margin-top: 12px; }
.card--white .card__tag { background: rgba(200,184,154,0.12); color: #9A8A7A; border: 1px solid rgba(200,184,154,0.3); border-radius: 4px; }
.card--white .card__footer { margin-top: auto; padding-top: 24px; border-top: 1px solid #EDE8E0; display: flex; justify-content: space-between; font-size: calc(12px * var(--card-font-scale, 1)); color: #B0A090; letter-spacing: 0.05em; }
```

- [ ] **Step 4: Create `WhiteRenderer.vue`**

Create `src/components/card/renderers/WhiteRenderer.vue`:

```vue
<template>
  <div v-if="headerText" class="card__header">{{ headerText }}</div>
  <img v-if="data.coverImage" class="card__cover-img" :src="data.coverImage" alt="" />
  <div class="card__category">{{ data.category }}</div>
  <h1 class="card__title">{{ data.title }}</h1>
  <p v-if="data.subtitle" class="card__subtitle" v-html="data.subtitle"></p>
  <div class="card__divider"></div>
  <div class="card__steps">
    <div v-for="(step, idx) in data.steps" :key="idx" class="card__step">
      <span class="card__step-num">{{ romanNumeral(idx + 1) }}</span>
      <div>
        <div class="card__step-title">{{ step.title }}</div>
        <div class="card__step-desc" v-html="step.desc"></div>
        <div v-if="step.tip" class="card__step-tip" v-html="step.tip"></div>
      </div>
    </div>
  </div>
  <div v-if="data.tags.length" class="card__tags">
    <span v-for="tag in data.tags" :key="tag" class="card__tag">#{{ tag }}</span>
  </div>
  <div class="card__footer">
    <span>@{{ author }}</span>
    <span v-if="footerSlogan">{{ footerSlogan }}</span>
    <span>{{ page }}</span>
  </div>
</template>

<script setup lang="ts">
import type { CardData } from '@/types/card'

defineProps<{
  data: CardData
  author: string
  page: string
  headerText?: string
  footerSlogan?: string
}>()

const ROMAN = ['i','ii','iii','iv','v','vi','vii','viii','ix','x']
function romanNumeral(n: number): string {
  return ROMAN[n - 1] ?? String(n)
}
</script>
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck`
Expected: errors about `rendererMap` missing `white` — still OK, fixed in Task 4.

- [ ] **Step 6: Commit**

```bash
git add src/styles/card-renderers.css src/components/card/renderers/WhiteRenderer.vue
git commit -m "feat: add WhiteRenderer and --card-font-weight CSS variable"
```

---

### Task 4: Register White Style

**Files:**
- Modify: `src/components/card/renderers/index.ts`
- Modify: `src/data/styleRegistry.ts`

- [ ] **Step 1: Register WhiteRenderer in rendererMap**

Replace `src/components/card/renderers/index.ts` with:

```ts
import type { Component } from 'vue'
import type { CardStyle } from '@/types/styles'
import MagazineRenderer from './MagazineRenderer.vue'
import TechRenderer from './TechRenderer.vue'
import VibrantRenderer from './VibrantRenderer.vue'
import DarkRenderer from './DarkRenderer.vue'
import JapaneseRenderer from './JapaneseRenderer.vue'
import LiteraryRenderer from './LiteraryRenderer.vue'
import TerminalRenderer from './TerminalRenderer.vue'
import PurpleRenderer from './PurpleRenderer.vue'
import MinimalRenderer from './MinimalRenderer.vue'
import TimelineRenderer from './TimelineRenderer.vue'
import WhiteRenderer from './WhiteRenderer.vue'

export const rendererMap: Record<CardStyle, Component> = {
  magazine: MagazineRenderer,
  tech: TechRenderer,
  vibrant: VibrantRenderer,
  dark: DarkRenderer,
  japanese: JapaneseRenderer,
  literary: LiteraryRenderer,
  terminal: TerminalRenderer,
  purple: PurpleRenderer,
  minimal: MinimalRenderer,
  timeline: TimelineRenderer,
  white: WhiteRenderer,
}
```

- [ ] **Step 2: Add white to styleRegistry**

Replace `src/data/styleRegistry.ts` with:

```ts
import type { StyleMeta } from '@/types/styles'

export const styleRegistry: StyleMeta[] = [
  { key: 'magazine', label: '杂志经典', dotColor: '#C4A265', defaultCategory: 'Tutorial · Guide' },
  { key: 'tech', label: '科技干练', dotColor: '#00D4AA', defaultCategory: '// Dev Tips' },
  { key: 'vibrant', label: '活力元气', dotColor: '#FF6B6B', defaultCategory: 'Life Hack' },
  { key: 'dark', label: '暗黑高级', dotColor: '#333333', defaultCategory: 'Premium · Guide' },
  { key: 'japanese', label: '日系简约', dotColor: '#CCCCCC', defaultCategory: 'Minimal Life' },
  { key: 'literary', label: '文艺清新', dotColor: '#8BA888', defaultCategory: 'a gentle guide' },
  { key: 'terminal', label: '终端黑', dotColor: '#33FF33', defaultCategory: 'Shell · Code' },
  { key: 'purple', label: '电紫色', dotColor: '#8B5CF6', defaultCategory: 'Deep Dive' },
  { key: 'minimal', label: '极简黑白', dotColor: '#111111', defaultCategory: 'Minimal' },
  { key: 'timeline', label: '琥珀时间轴', dotColor: '#D4A056', defaultCategory: 'Story' },
  { key: 'white', label: '奶白衬线', dotColor: '#C8B89A', defaultCategory: 'Essay · Story' },
]

export const STYLE_REGISTRY = styleRegistry
```

- [ ] **Step 3: Verify typecheck passes cleanly**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/card/renderers/index.ts src/data/styleRegistry.ts
git commit -m "feat: register white style in renderer map and style registry"
```

---

### Task 5: Parser — Extract coverImage

**Files:**
- Modify: `src/composables/useMarkdownParser.ts`

- [ ] **Step 1: Update `parseSinglePage` to detect cover image**

In `src/composables/useMarkdownParser.ts`, find the `parseSinglePage` function. Add cover image detection in the regular text processing section.

The approach: after `marked.parse` processes an inline image with alt `"cover"`, we detect the resulting `<img ... alt="cover">` tag in the rendered output and hoist it to `result.coverImage`. We do this inside `renderInline` — actually we do it by detecting `![cover](...)` syntax directly in the raw markdown lines before any other processing.

Replace the entire `parseSinglePage` function with this version that adds cover image detection:

```ts
function parseSinglePage(md: string): CardData {
  const lines = md.trim().split('\n')
  const result: CardData = {
    title: '',
    subtitle: '',
    category: '',
    steps: [],
    tags: [],
    coverImage: undefined,
  }

  let currentStep: { title: string; desc: string; tip: string } | null = null
  let inCodeBlock = false
  let codeBlockContent = ''
  let codeBlockLang = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // 代码块处理
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeBlockLang = trimmed.slice(3).trim()
        codeBlockContent = ''
      } else {
        inCodeBlock = false
        if (currentStep) {
          const langLabel = codeBlockLang ? `<span class="card__code-lang">${codeBlockLang}</span>` : ''
          currentStep.desc += `<pre class="card__code-block">${langLabel}<code>${escapeHtml(codeBlockContent)}</code></pre>`
        }
        codeBlockLang = ''
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent += (codeBlockContent ? '\n' : '') + line
      continue
    }

    // 封面图 ![cover](url)
    const coverMatch = trimmed.match(/^!\[cover\]\((.+)\)$/)
    if (coverMatch && !result.coverImage) {
      result.coverImage = coverMatch[1]
      continue
    }

    // 主标题
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ') && !result.title) {
      result.title = trimmed.slice(2).trim()
      continue
    }

    // 副标题 (> 紧跟主标题后，且不是 tip)
    if (trimmed.startsWith('> ') && result.title && result.steps.length === 0 && !trimmed.startsWith('> 💡')) {
      result.subtitle = renderInline(trimmed.slice(2).trim())
      continue
    }

    // 分割线后是分类
    if (trimmed === '---') {
      if (i + 1 < lines.length) {
        result.category = lines[i + 1].trim()
        i++
      }
      continue
    }

    // 标签行 (独立一行全是 #tag 格式)
    if (/^(#[^\s#]+\s*)+$/.test(trimmed) && !currentStep) {
      const tagMatches = trimmed.match(/#([^\s#]+)/g)
      if (tagMatches) {
        result.tags.push(...tagMatches.map(t => t.slice(1)))
      }
      continue
    }

    // 步骤标题
    if (trimmed.startsWith('## ')) {
      if (currentStep) {
        currentStep.desc = finalizeDesc(currentStep.desc)
        result.steps.push(currentStep)
      }
      currentStep = { title: trimmed.slice(3).trim(), desc: '', tip: '' }
      continue
    }

    // 提示 (在步骤内的 > )
    if (trimmed.startsWith('> ') && currentStep) {
      const tipText = trimmed.slice(2).replace(/^💡\s*/, '').replace(/^[Tt]ip:\s*/, '').trim()
      currentStep.tip = renderInline(tipText)
      continue
    }

    // 普通文本 → 步骤描述（收集原始 markdown）
    if (currentStep) {
      currentStep.desc += (currentStep.desc ? '\n' : '') + line
    }
  }

  if (currentStep) {
    currentStep.desc = finalizeDesc(currentStep.desc)
    result.steps.push(currentStep)
  }

  return result
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/composables/useMarkdownParser.ts
git commit -m "feat: parser extracts ![cover](url) into CardData.coverImage"
```

---

### Task 6: cardStore — resolvedMarkdown + fontWeight

**Files:**
- Modify: `src/stores/cardStore.ts`

- [ ] **Step 1: Add fontWeight and resolvedMarkdown to cardStore**

Replace the entire `src/stores/cardStore.ts` with:

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CardStyle } from '@/types/styles'
import type { CardData } from '@/types/card'
import { useMarkdownParser } from '@/composables/useMarkdownParser'
import { STYLE_REGISTRY } from '@/data/styleRegistry'
import { useImageStore } from './imageStore'

export const useCardStore = defineStore('card', () => {
  const { parseMultiPage } = useMarkdownParser()
  const imageStore = useImageStore()

  const pageSources = ref<string[]>([
    `# 手机摄影构图 5个核心法则

> 从入门到进阶，拍出杂志感大片

#摄影 #构图 #教程

## 三分法则
将画面分成 3×3 的九宫格，把主体放在 **交叉点** 上。这是最基础也最有效的构图方式。

> 💡 打开手机相机的 \`网格线\` 辅助对齐

## 引导线构图
利用道路、栏杆、建筑线条等元素，将视线引向画面主体，营造 *纵深感*。

> 💡 街道、楼梯、河流都是天然的引导线

## 框架构图
通过门窗、拱门、树枝等自然框架聚焦视线，增加画面层次和故事感。`,
    `# 手机摄影构图 5个核心法则

> 进阶篇

#摄影 #进阶

## 对称与平衡
利用水面倒影、建筑对称轴，创造视觉 **稳定感**。适合表现庄重、宁静的氛围。

## 留白艺术
大胆留出空白区域，让主体呼吸。*少即是多*，空间本身就是设计的一部分。

> 💡 留白比例建议占画面 \`40%-60%\`

---
Photography · Tutorial`
  ])

  const markdownContent = computed(() => pageSources.value.join('\n\n===\n\n'))

  // Replace img-xxx placeholders with actual blob URLs before parsing
  const resolvedMarkdown = computed(() => {
    return markdownContent.value.replace(
      /!\[([^\]]*)\]\((img-\d+)\)/g,
      (_, alt: string, id: string) => {
        const url = imageStore.getUrl(id)
        return url ? `![${alt}](${url})` : `![${alt}]()`
      }
    )
  })

  const currentStyle = ref<CardStyle>('white')
  const author = ref('你的账号名')
  const currentPageIndex = ref(0)
  const autoSplitMax = ref(4)
  const previewScale = ref(0.38)

  const titleFont = ref('')
  const bodyFont = ref('')
  const fontScale = ref(100)
  const fontWeight = ref(400)

  const headerText = ref('')
  const footerSlogan = ref('')

  const multiPageData = computed(() => parseMultiPage(resolvedMarkdown.value, autoSplitMax.value))

  const pages = computed<CardData[]>(() => multiPageData.value.pages)
  const totalPages = computed(() => multiPageData.value.totalPages)

  const currentPageData = computed<CardData>(() => pages.value[currentPageIndex.value] || pages.value[0])

  const parsedData = computed<CardData>(() => currentPageData.value)

  const currentPageSource = computed({
    get: () => pageSources.value[currentPageIndex.value] || '',
    set: (val: string) => {
      const cleaned = val.replace(/^===+$/gm, '---')
      if (currentPageIndex.value >= 0 && currentPageIndex.value < pageSources.value.length) {
        pageSources.value[currentPageIndex.value] = cleaned
      }
    }
  })

  const defaultCategory = computed(() => {
    const meta = STYLE_REGISTRY.find(s => s.key === currentStyle.value)
    return meta?.defaultCategory || 'Guide'
  })

  function setStyle(style: CardStyle) {
    currentStyle.value = style
  }

  function goToPage(index: number) {
    if (index >= 0 && index < totalPages.value) {
      currentPageIndex.value = index
    }
  }

  function nextPage() {
    goToPage(currentPageIndex.value + 1)
  }

  function prevPage() {
    goToPage(currentPageIndex.value - 1)
  }

  function addPage() {
    const template = `# 新页面\n\n> 副标题\n\n## 步骤一\n在这里输入内容...\n`
    pageSources.value.splice(currentPageIndex.value + 1, 0, template)
    currentPageIndex.value++
  }

  function deletePage() {
    if (pageSources.value.length <= 1) return
    pageSources.value.splice(currentPageIndex.value, 1)
    if (currentPageIndex.value >= pageSources.value.length) {
      currentPageIndex.value = pageSources.value.length - 1
    }
  }

  function reset() {
    pageSources.value = ['']
    currentPageIndex.value = 0
  }

  return {
    markdownContent,
    resolvedMarkdown,
    pageSources,
    currentPageSource,
    currentStyle,
    author,
    currentPageIndex,
    autoSplitMax,
    previewScale,
    titleFont,
    bodyFont,
    fontScale,
    fontWeight,
    headerText,
    footerSlogan,
    pages,
    totalPages,
    currentPageData,
    parsedData,
    defaultCategory,
    setStyle,
    goToPage,
    nextPage,
    prevPage,
    addPage,
    deletePage,
    reset,
  }
})
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/stores/cardStore.ts
git commit -m "feat: cardStore adds resolvedMarkdown (img-xxx resolution) and fontWeight"
```

---

### Task 7: MarkdownEditor — Image Paste & Drop

**Files:**
- Modify: `src/components/converter/MarkdownEditor.vue`

- [ ] **Step 1: Rewrite MarkdownEditor with paste/drop support**

Replace `src/components/converter/MarkdownEditor.vue` with:

```vue
<template>
  <div
    class="markdown-editor"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <textarea
      ref="textareaRef"
      class="markdown-editor__textarea"
      :class="{ 'markdown-editor__textarea--drag': isDragging }"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @paste="handlePaste"
      placeholder="# 标题&#10;> 副标题&#10;&#10;#标签1 #标签2&#10;&#10;## 步骤一&#10;支持 **加粗** *斜体* `代码`&#10;> 💡 小提示&#10;&#10;粘贴图片: Ctrl+V&#10;封面图: ![cover](img-001)&#10;&#10;===&#10;&#10;# 第二页标题"
      spellcheck="false"
    ></textarea>
    <div v-if="isDragging" class="markdown-editor__drop-overlay">拖入图片</div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useImageStore } from '@/stores/imageStore'

defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const imageStore = useImageStore()
const textareaRef = ref<HTMLTextAreaElement>()
const isDragging = ref(false)

function insertAtCursor(text: string) {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const newValue = el.value.substring(0, start) + text + el.value.substring(end)
  emit('update:modelValue', newValue)
  nextTick(() => {
    el.selectionStart = el.selectionEnd = start + text.length
    el.focus()
  })
}

function handleImageFile(file: File) {
  const id = imageStore.addImage(file)
  insertAtCursor(`![](${id})`)
}

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of Array.from(items)) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (file) handleImageFile(file)
      return
    }
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (!files) return
  for (const file of Array.from(files)) {
    if (file.type.startsWith('image/')) {
      handleImageFile(file)
      return
    }
  }
}
</script>

<style scoped>
.markdown-editor {
  position: relative;
  display: flex;
  flex-direction: column;
}
.markdown-editor__textarea {
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 16px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  background: #FAFAFA;
  color: #333;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.markdown-editor__textarea:focus {
  outline: none;
  border-color: #999;
  background: #FFF;
}
.markdown-editor__textarea--drag {
  border-color: #888;
  background: #F5F5F5;
}
.markdown-editor__textarea::placeholder {
  color: #BBB;
}
.markdown-editor__drop-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.85);
  border: 2px dashed #999;
  border-radius: 8px;
  font-size: 16px;
  color: #666;
  pointer-events: none;
}
</style>
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/converter/MarkdownEditor.vue
git commit -m "feat: MarkdownEditor supports image paste and drag-and-drop"
```

---

### Task 8: FloatingStylePanel Component

**Files:**
- Create: `src/components/FloatingStylePanel.vue`

- [ ] **Step 1: Create FloatingStylePanel**

Create `src/components/FloatingStylePanel.vue`:

```vue
<template>
  <div class="fsp" :class="{ 'fsp--collapsed': collapsed }">
    <button class="fsp__toggle" @click="collapsed = !collapsed" :title="collapsed ? '展开设置' : '收起设置'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>

    <div v-show="!collapsed" class="fsp__body">
      <!-- Style -->
      <div class="fsp__section">
        <div class="fsp__label">风格</div>
        <div class="fsp__style-grid">
          <button
            v-for="s in styleRegistry"
            :key="s.key"
            class="fsp__style-btn"
            :class="{ active: store.currentStyle === s.key }"
            @click="store.setStyle(s.key)"
          >
            <span class="fsp__style-dot" :style="{ background: s.dotColor }"></span>
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Font family -->
      <div class="fsp__section">
        <div class="fsp__label">字体</div>
        <div class="fsp__row">
          <div class="fsp__field">
            <label>标题</label>
            <input v-model="store.titleFont" type="text" placeholder="留空=默认" />
          </div>
          <div class="fsp__field">
            <label>正文</label>
            <input v-model="store.bodyFont" type="text" placeholder="留空=默认" />
          </div>
        </div>
      </div>

      <!-- Font weight + scale -->
      <div class="fsp__section">
        <div class="fsp__row">
          <div class="fsp__field">
            <label>字重</label>
            <select v-model.number="store.fontWeight">
              <option :value="300">细 300</option>
              <option :value="400">常规 400</option>
              <option :value="500">中 500</option>
              <option :value="600">半粗 600</option>
              <option :value="700">粗 700</option>
            </select>
          </div>
          <div class="fsp__field">
            <label>字号 {{ store.fontScale }}%</label>
            <input v-model.number="store.fontScale" type="range" min="50" max="200" step="5" />
          </div>
        </div>
      </div>

      <!-- Meta -->
      <div class="fsp__section">
        <div class="fsp__row">
          <div class="fsp__field">
            <label>作者</label>
            <input v-model="store.author" type="text" placeholder="昵称" />
          </div>
          <div class="fsp__field">
            <label>每页步骤数</label>
            <input v-model.number="store.autoSplitMax" type="number" min="0" max="10" />
          </div>
        </div>
        <div class="fsp__row">
          <div class="fsp__field">
            <label>页眉</label>
            <input v-model="store.headerText" type="text" placeholder="品牌名（可选）" />
          </div>
          <div class="fsp__field">
            <label>页脚</label>
            <input v-model="store.footerSlogan" type="text" placeholder="标语（可选）" />
          </div>
        </div>
      </div>

      <!-- Page management -->
      <div class="fsp__section fsp__page-bar">
        <span class="fsp__page-info">第 {{ store.currentPageIndex + 1 }} / {{ store.pageSources.length }} 页</span>
        <div class="fsp__page-btns">
          <button @click="store.addPage()">＋ 新页</button>
          <button
            :disabled="store.pageSources.length <= 1"
            class="danger"
            @click="store.deletePage()"
          >删页</button>
        </div>
      </div>

      <!-- Export -->
      <div class="fsp__section fsp__exports">
        <button class="fsp__export-btn" @click="$emit('export')">导出当前页</button>
        <button
          v-if="store.totalPages > 1"
          class="fsp__export-btn fsp__export-btn--primary"
          @click="$emit('export-all')"
        >导出全部 ({{ store.totalPages }})</button>
        <button
          v-else
          class="fsp__export-btn fsp__export-btn--primary"
          @click="$emit('export')"
        >导出 PNG</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { styleRegistry } from '@/data/styleRegistry'

defineEmits<{ export: []; 'export-all': [] }>()

const store = useCardStore()
const collapsed = ref(false)
</script>

<style scoped>
.fsp {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 20;
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  gap: 0;
}
.fsp__toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #DDD;
  background: rgba(255,255,255,0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #555;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  flex-shrink: 0;
  transition: all 0.15s;
}
.fsp__toggle:hover {
  border-color: #999;
  background: #FFF;
}
.fsp__body {
  width: 272px;
  margin-right: 8px;
  background: rgba(255,255,255,0.97);
  border: 1px solid #E8E8E8;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}
.fsp__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.fsp__label {
  font-size: 11px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.fsp__style-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.fsp__style-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border: 1px solid #E8E8E8;
  border-radius: 6px;
  background: #FFF;
  font-size: 12px;
  color: #444;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.fsp__style-btn:hover {
  border-color: #CCC;
  background: #F8F8F8;
}
.fsp__style-btn.active {
  border-color: #333;
  background: #333;
  color: #FFF;
}
.fsp__style-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.fsp__style-btn.active .fsp__style-dot {
  opacity: 0.8;
}
.fsp__row {
  display: flex;
  gap: 8px;
}
.fsp__field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.fsp__field label {
  font-size: 11px;
  color: #777;
  font-weight: 600;
}
.fsp__field input[type="text"],
.fsp__field input[type="number"],
.fsp__field select {
  padding: 7px 10px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 12px;
  background: #FFF;
  color: #333;
}
.fsp__field input[type="text"]:focus,
.fsp__field input[type="number"]:focus,
.fsp__field select:focus {
  outline: none;
  border-color: #999;
}
.fsp__field input[type="range"] {
  width: 100%;
  margin-top: 4px;
}
.fsp__page-bar {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #F5F5F5;
  border-radius: 8px;
}
.fsp__page-info {
  font-size: 12px;
  color: #666;
}
.fsp__page-btns {
  display: flex;
  gap: 6px;
}
.fsp__page-btns button {
  padding: 5px 10px;
  border: 1px solid #DDD;
  border-radius: 5px;
  background: #FFF;
  font-size: 11px;
  color: #444;
  cursor: pointer;
}
.fsp__page-btns button:hover:not(:disabled) {
  border-color: #999;
}
.fsp__page-btns button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.fsp__page-btns button.danger {
  color: #C44;
  border-color: #ECC;
}
.fsp__page-btns button.danger:hover:not(:disabled) {
  background: #FEE;
}
.fsp__exports {
  gap: 6px;
}
.fsp__export-btn {
  width: 100%;
  padding: 9px 0;
  border: 1px solid #DDD;
  border-radius: 7px;
  background: #F8F8F8;
  font-size: 13px;
  font-weight: 500;
  color: #444;
  cursor: pointer;
  transition: all 0.15s;
}
.fsp__export-btn:hover {
  border-color: #999;
  background: #F0F0F0;
}
.fsp__export-btn--primary {
  background: #222;
  color: #FFF;
  border-color: #222;
}
.fsp__export-btn--primary:hover {
  background: #000;
  border-color: #000;
}
</style>
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/FloatingStylePanel.vue
git commit -m "feat: FloatingStylePanel with all controls, font weight, page management"
```

---

### Task 9: ConverterView — New Layout

**Files:**
- Modify: `src/views/ConverterView.vue`

- [ ] **Step 1: Rewrite ConverterView with new left-editor / right-preview+float layout**

Replace `src/views/ConverterView.vue` with:

```vue
<template>
  <div class="converter-view">
    <!-- Left: editor panel -->
    <aside class="converter-view__editor">
      <div class="converter-view__editor-toolbar">
        <span class="converter-view__page-label">
          第 {{ store.currentPageIndex + 1 }} / {{ store.pageSources.length }} 页
        </span>
        <div class="converter-view__toolbar-btns">
          <button :disabled="store.currentPageIndex <= 0" @click="store.prevPage()">←</button>
          <button :disabled="store.currentPageIndex >= store.pageSources.length - 1" @click="store.nextPage()">→</button>
          <button @click="store.addPage()">＋</button>
          <button
            :disabled="store.pageSources.length <= 1"
            class="danger"
            @click="store.deletePage()"
          >✕</button>
        </div>
      </div>
      <MarkdownEditor v-model="store.currentPageSource" class="converter-view__md-editor" />
    </aside>

    <!-- Right: preview + floating panel -->
    <main class="converter-view__preview">
      <button
        v-if="store.totalPages > 1"
        class="converter-view__arrow converter-view__arrow--left"
        :disabled="store.currentPageIndex <= 0"
        @click="store.prevPage()"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div class="converter-view__card-area">
        <CardCanvas
          v-for="(pageData, idx) in store.pages"
          v-show="idx === store.currentPageIndex"
          :key="idx"
          :ref="(el: any) => setCanvasRef(el, idx)"
          :card-style="store.currentStyle"
          :scale="previewScale"
          :extra-style="fontOverrideStyle"
        >
          <CardRenderer
            :card-style="store.currentStyle"
            :data="pageData"
            :author="store.author"
            :page="`${String(idx + 1).padStart(2, '0')} / ${String(store.totalPages).padStart(2, '0')}`"
            :header-text="store.headerText"
            :footer-slogan="store.footerSlogan"
          />
        </CardCanvas>
      </div>

      <button
        v-if="store.totalPages > 1"
        class="converter-view__arrow converter-view__arrow--right"
        :disabled="store.currentPageIndex >= store.totalPages - 1"
        @click="store.nextPage()"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div class="converter-view__pagination" v-if="store.totalPages > 1">
        <span
          v-for="idx in store.totalPages"
          :key="idx"
          :class="['converter-view__dot', { active: idx - 1 === store.currentPageIndex }]"
          @click="store.goToPage(idx - 1)"
        ></span>
      </div>

      <FloatingStylePanel
        @export="handleExportCurrent"
        @export-all="handleExportAll"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { useCardExport } from '@/composables/useCardExport'
import MarkdownEditor from '@/components/converter/MarkdownEditor.vue'
import CardCanvas from '@/components/card/CardCanvas.vue'
import CardRenderer from '@/components/card/CardRenderer.vue'
import FloatingStylePanel from '@/components/FloatingStylePanel.vue'

const store = useCardStore()
const { exportElement } = useCardExport()

const previewScale = computed(() => 0.5)

const fontOverrideStyle = computed(() => {
  const s: Record<string, string> = {}
  if (store.titleFont) s['--card-title-font'] = store.titleFont
  if (store.bodyFont) s['--card-body-font'] = store.bodyFont
  if (store.fontScale !== 100) s['--card-font-scale'] = String(store.fontScale / 100)
  if (store.fontWeight !== 400) s['--card-font-weight'] = String(store.fontWeight)
  return s
})

const canvasRefs = ref<Map<number, InstanceType<typeof CardCanvas>>>(new Map())

function setCanvasRef(el: any, idx: number) {
  if (el) canvasRefs.value.set(idx, el)
}

async function handleExportCurrent() {
  const canvas = canvasRefs.value.get(store.currentPageIndex)
  const el = canvas?.cardRef
  if (el) {
    await exportElement(el, `redcard-${store.currentStyle}-p${store.currentPageIndex + 1}-${Date.now()}.png`)
  }
}

async function handleExportAll() {
  for (let i = 0; i < store.totalPages; i++) {
    const canvas = canvasRefs.value.get(i)
    const el = canvas?.cardRef
    if (el) {
      await exportElement(el, `redcard-${store.currentStyle}-p${i + 1}.png`)
      if (i < store.totalPages - 1) await new Promise(r => setTimeout(r, 300))
    }
  }
}
</script>

<style scoped>
.converter-view {
  display: flex;
  height: 100%;
  overflow: hidden;
}
.converter-view__editor {
  width: 400px;
  min-width: 400px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #EBEBEB;
  background: #FAFAFA;
  padding: 16px;
  gap: 12px;
  box-sizing: border-box;
}
.converter-view__editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.converter-view__page-label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}
.converter-view__toolbar-btns {
  display: flex;
  gap: 6px;
}
.converter-view__toolbar-btns button {
  width: 30px;
  height: 30px;
  border: 1px solid #DDD;
  border-radius: 6px;
  background: #FFF;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  color: #444;
}
.converter-view__toolbar-btns button:hover:not(:disabled) {
  border-color: #999;
  background: #F5F5F5;
}
.converter-view__toolbar-btns button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.converter-view__toolbar-btns button.danger {
  color: #C44;
  border-color: #ECC;
}
.converter-view__toolbar-btns button.danger:hover:not(:disabled) {
  background: #FEE;
  border-color: #C44;
}
.converter-view__md-editor {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.converter-view__preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #F0EFEC;
  overflow: hidden;
}
.converter-view__card-area {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px 60px;
}
.converter-view__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #DDD;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.converter-view__arrow:hover:not(:disabled) {
  background: #FFF;
  border-color: #999;
}
.converter-view__arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.converter-view__arrow--left { left: 16px; }
.converter-view__arrow--right { right: 16px; }
.converter-view__pagination {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}
.converter-view__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #CCC;
  cursor: pointer;
  transition: all 0.2s;
}
.converter-view__dot:hover { background: #999; }
.converter-view__dot.active { background: #333; transform: scale(1.3); }
</style>
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 3: Start dev server and verify manually**

Run: `npm run dev`

Check:
1. Left panel shows Markdown editor, page nav toolbar (← → ＋ ✕ buttons)
2. Right panel shows card preview with floating gear button top-right
3. Clicking gear toggles the floating panel open/closed
4. White style visible in style grid and renders correctly
5. Paste an image (screenshot or copied image) into the textarea — `![](img-001)` appears in editor, image renders in card
6. Drag an image file onto the textarea — same behavior
7. Font weight selector changes text weight on card
8. Add/delete page buttons work from both toolbar and floating panel
9. Export buttons work

- [ ] **Step 4: Commit**

```bash
git add src/views/ConverterView.vue
git commit -m "feat: restructure layout - left editor panel, right preview with floating style panel"
```

---

### Task 10: Cleanup

**Files:**
- No deletion yet — ConverterPanel.vue is unreferenced but harmless

- [ ] **Step 1: Final typecheck**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: successful build, no warnings about missing types.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: verify build passes for image paste + floating panel feature"
```
