# Design: Image Paste + Floating Style Panel + Creamy White Style

Date: 2026-05-12

## Overview

Restructure the editor layout, add image paste/drop support, add a floating style panel, and introduce a creamy-white serif card style.

---

## 1. Layout Restructure

**Before:** Left sidebar (editor + all controls) | Right preview

**After:** Left (pure Markdown editor) | Right (card preview + floating style panel overlay)

```
┌─────────────────┬──────────────────────────────────┐
│  Markdown 编辑器 │  卡片预览区                        │
│  (400px)        │                                  │
│                 │              [卡片]               │
│  工具栏:         │                     ┌──────────┐  │
│  + 新页  删页    │                     │ 悬浮面板  │  │
│                 │  ← → 翻页  · · 页码  └──────────┘  │
└─────────────────┴──────────────────────────────────┘
```

- Left panel: `MarkdownEditor` only, with a minimal toolbar above (add page, delete page, page indicator)
- Right area: `ConverterView` preview + `FloatingStylePanel` absolutely positioned over the preview
- `ConverterPanel` component is retired; its controls move into `FloatingStylePanel`

---

## 2. Image Support

### Entry points
- **Paste** (`paste` event on MarkdownEditor textarea): detect `image/*` in `clipboardData.items`
- **Drag & drop** (`drop` event on MarkdownEditor): detect `image/*` in `dataTransfer.files`
- File picker button in MarkdownEditor toolbar as fallback

### Storage: `imageStore` (new Pinia store)
```
imageStore
  images: Map<string, string>   // id → objectURL
  addImage(file: File): string  // generates "img-001", "img-002", etc., calls URL.createObjectURL
  getUrl(id: string): string | undefined
  cleanup(): void               // revoke all object URLs (called on app unmount)
```

IDs are sequential: `img-001`, `img-002`, etc. Session-only — lost on page refresh (acceptable for edit-then-export workflow).

### Markdown syntax
- Inline image in step: `![alt text](img-001)` — renders as `<img>` inside step description
- Cover image: `![cover](img-001)` — special alt text `cover` signals parser to extract as `CardData.coverImage`

### Resolution in cardStore
`cardStore` computes `resolvedMarkdown`: replaces all `(img-xxx)` references with actual blob URLs before passing to the parser. This keeps markdown source clean.

```ts
const resolvedMarkdown = computed(() => {
  return markdownContent.value.replace(
    /!\[([^\]]*)\]\((img-\d+)\)/g,
    (_, alt, id) => {
      const url = imageStore.getUrl(id)
      return url ? `![${alt}](${url})` : `![${alt}]()`
    }
  )
})
```

### Parser changes (`useMarkdownParser.ts`)
- Detect `<img ... alt="cover" ...>` in rendered HTML → extract `src`, set `CardData.coverImage`, remove from content flow
- All other `<img>` tags pass through into step `desc` HTML as-is (marked already handles `![alt](url)` → `<img>`)

### Type changes (`card.ts`)
```ts
export interface CardData {
  title: string
  subtitle: string
  category: string
  steps: CardStep[]
  tags: string[]
  coverImage?: string   // NEW: blob URL of cover image if present
}
```

---

## 3. FloatingStylePanel (new component)

Location: `src/components/FloatingStylePanel.vue`

Positioned absolute, top-right of the preview area. Toggle button (gear icon) shows/hides. Default: expanded.

Contains all controls currently in `ConverterPanel`:
- Style selector (10 + new white style)
- Title font family
- Body font family
- **Font weight** (new): select 300 / 400 / 500 / 600 / 700, maps to CSS var `--card-font-weight`
- Font scale (50–300%)
- Author
- Header text
- Footer slogan
- Auto-split max steps
- Add page / Delete page buttons
- Export current page / Export all buttons

Panel width: ~280px. Scrollable if content overflows.

---

## 4. Creamy White Style (`white`)

New renderer: `src/components/card/renderers/WhiteRenderer.vue`

Visual spec:
- Background: `#FDFCF7` (warm off-white)
- Primary text: `#1A1A1A`
- Default font: `"Noto Serif SC", "Source Han Serif", "SimSun", serif`
- Accent: thin `#D4C4A8` borders, no heavy color blocks
- Cover image: displayed at top of card, full width, max-height ~35% of card
- Step numbers: small roman numerals or minimal dots
- Dot color: `#C8B89A`

Registration:
- `styleRegistry.ts`: `{ key: 'white', label: '奶白衬线', dotColor: '#C8B89A', defaultCategory: 'Essay · Story' }`
- `types/styles.ts`: add `'white'` to `CardStyle` union
- `renderers/index.ts`: add `white: WhiteRenderer`

---

## 5. Font Weight Control

New CSS variable `--card-font-weight` applied at the `.card` root level. Default `400`. All renderers inherit via `font-weight: var(--card-font-weight)` on body text elements.

`fontWeight` added to `cardStore` (default `400`), exposed in `FloatingStylePanel` as a `<select>`.

`fontOverrideStyle` in `ConverterView` adds `--card-font-weight` alongside existing font vars.

---

## 6. Files Changed

| File | Change |
|------|--------|
| `src/stores/imageStore.ts` | NEW |
| `src/stores/cardStore.ts` | add resolvedMarkdown, fontWeight, inject imageStore |
| `src/types/card.ts` | add coverImage field |
| `src/types/styles.ts` | add 'white' |
| `src/composables/useMarkdownParser.ts` | extract coverImage from parsed HTML |
| `src/components/converter/MarkdownEditor.vue` | paste/drop handlers, toolbar |
| `src/components/FloatingStylePanel.vue` | NEW |
| `src/components/card/renderers/WhiteRenderer.vue` | NEW |
| `src/components/card/renderers/index.ts` | register white |
| `src/data/styleRegistry.ts` | add white entry |
| `src/views/ConverterView.vue` | new layout, FloatingStylePanel, remove ConverterPanel |
| `src/components/converter/ConverterPanel.vue` | retired (delete or keep as dead code) |

---

## 7. Out of Scope

- Cross-session image persistence (IndexedDB)
- Dedicated full-bleed cover image renderer (WhiteRenderer + coverImage field is sufficient)
- Inline WYSIWYG editing directly on card elements
