import { marked } from 'marked'
import type { CardData } from '@/types/card'

export interface MultiPageResult {
  pages: CardData[]
  totalPages: number
}

// 配置 marked：开启 GFM、换行
marked.setOptions({
  gfm: true,
  breaks: true
})

/**
 * 将 Markdown 文本渲染为 HTML（用于步骤描述等富文本区域）
 * 去掉最外层 <p> 标签以便行内展示
 */
function renderInline(md: string): string {
  if (!md) return ''
  
  // marked 可以直接处理 base64 URL 图片
  const html = marked.parse(md, { async: false }) as string
  // 去掉单行时外层 <p></p> 包裹
  return html.replace(/^<p>([\s\S]*)<\/p>\s*$/, '$1').trim()
}

// ---- 内容高度估算（基于行数统计） ----
// 卡片 canvas 固定 1080×1440

const CARD_HEIGHT = 1440
/** 无封面时的固定开销：标题(90) + 副标题/分类(60) + 标签(50) + 页脚(50) + 内边距(80) + 分割线(30) */
const FIXED_OVERHEAD = 360
/** 有封面时的固定开销 */
const FIXED_OVERHEAD_WITH_COVER = 760
/** 基础行高（16px 字体） */
const BASE_LINE_HEIGHT = 28
/** 代码行高 */
const CODE_LINE_HEIGHT = 22
/** 步骤标题+编号行高 */
const STEP_TITLE_HEIGHT = 45
/** 步骤 tip 行高 */
const STEP_TIP_HEIGHT = 36
/** 步骤底部间距 */
const STEP_BOTTOM_MARGIN = 16
/** 列表项额外间距 */
const LIST_ITEM_MARGIN = 4
/** 段落间距 */
const PARAGRAPH_MARGIN = 10
/** 代码块上下间距 */
const CODE_BLOCK_MARGIN = 20

/** 计算文本行数（考虑中英文宽度差异） */
function calculateTextLines(text: string, charsPerLine: number = 45): number {
  if (!text) return 0
  
  // 去除 Markdown 语法和 HTML 标签
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '')  // 代码块
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')  // 图片
    .replace(/[#*`>\[\]()-]/g, '')  // Markdown 符号
    .replace(/<[^>]*>/g, '')  // HTML 标签
    .replace(/&[a-z]+;/g, ' ')
  
  // 按换行符分割
  const lines = cleanText.split('\n')
  let totalLines = 0
  
  for (const line of lines) {
    if (!line.trim()) {
      totalLines += 1
      continue
    }
    
    // 计算有效字符数（中文占 2 个英文字符宽度）
    let effectiveLength = 0
    for (const char of line) {
      // 中文字符（CJK）宽度约为英文的 2 倍
      if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
        effectiveLength += 2
      } else {
        effectiveLength += 1
      }
    }
    
    totalLines += Math.max(1, Math.ceil(effectiveLength / charsPerLine))
  }
  
  return totalLines
}

/** 估算一段 Markdown 描述文本的渲染高度（精确计算） */
function estimateDescHeight(desc: string, fontScale: number = 1): number {
  if (!desc) return 0
  let h = 0
  
  const scale = fontScale / 100
  const lineHeight = BASE_LINE_HEIGHT * scale
  const codeLineHeight = CODE_LINE_HEIGHT * scale

  // 处理代码块（Markdown 语法）
  const codeBlockRegex = /```[\s\S]*?```/g
  const codeBlocks = desc.match(codeBlockRegex)
  if (codeBlocks) {
    for (const block of codeBlocks) {
      // 提取代码内容（去掉 ``` 标记）
      const code = block
        .replace(/^```.*\n/, '')
        .replace(/```$/, '')
      
      // 计算所有行数（包括空行）
      const lines = code.split('\n').length
      h += Math.max(1, lines) * codeLineHeight
      h += CODE_BLOCK_MARGIN * scale
    }
  }

  // 纯文本（去掉代码块、图片、HTML 标签）
  let text = desc
    .replace(codeBlockRegex, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/g, ' ')
    .trim()

  if (text) {
    // 计算段落数
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim())
    
    for (const para of paragraphs) {
      // 检查是否是列表
      const listItems = para.match(/^[\s]*[-*]\s+/gm)
      if (listItems) {
        // 列表项
        const lines = calculateTextLines(para, 42) // 列表缩进，每行少 3 个字符
        h += lines * lineHeight
        h += listItems.length * LIST_ITEM_MARGIN * scale
      } else {
        // 普通段落
        const lines = calculateTextLines(para)
        h += lines * lineHeight
        h += PARAGRAPH_MARGIN * scale
      }
    }
  }

  return h
}

/** 估算单个步骤的渲染总高度 */
function estimateStepHeight(step: { title: string; desc: string; tip: string }, fontScale: number = 100): number {
  const scale = fontScale / 100
  let h = STEP_TITLE_HEIGHT * scale + estimateDescHeight(step.desc, fontScale)
  if (step.tip) h += STEP_TIP_HEIGHT * scale
  h += STEP_BOTTOM_MARGIN * scale
  return h
}

/** 估算整页卡片的渲染总高度 */
function estimateTotalHeight(data: CardData, fontScale: number = 100): number {
  const scale = fontScale / 100
  const overhead = data.coverImage ? FIXED_OVERHEAD_WITH_COVER * scale : FIXED_OVERHEAD * scale
  const stepsH = data.steps.reduce((sum, s) => sum + estimateStepHeight(s, fontScale), 0)
  return overhead + stepsH
}

/** 是否需要对这张卡片做自动分页 */
function needsAutoSplit(data: CardData, maxSteps: number): boolean {
  if (data.steps.length > maxSteps) return true
  return estimateTotalHeight(data) > CARD_HEIGHT
}

/** 按 ## 标题进行简单分页 */
function autoSplitByHeadings(data: CardData, maxSteps: number): MultiPageResult {
  const pages: CardData[] = []
  let chunk: typeof data.steps = []

  for (const step of data.steps) {
    chunk.push(step)

    // 每 maxSteps 个步骤分一页
    if (chunk.length >= maxSteps) {
      pages.push(buildPage(data, chunk, pages.length + 1))
      chunk = []
    }
  }

  // 最后一页
  if (chunk.length > 0) {
    pages.push(buildPage(data, chunk, pages.length + 1))
  }

  return { pages, totalPages: pages.length }
}

function buildPage(data: CardData, steps: typeof data.steps, pageIndex: number): CardData {
  return {
    title: data.title,
    subtitle: pageIndex === 1 ? data.subtitle : '',
    category: data.category,
    steps,
    tags: pageIndex === 1 ? data.tags : [],
    coverImage: pageIndex === 1 ? data.coverImage : undefined,
  }
}

export function useMarkdownParser() {
  function parse(md: string): CardData {
    return parseSinglePage(md)
  }

  function parseMultiPage(md: string, autoSplitMax?: number): MultiPageResult {
    const rawPages = md.split(/^===+$/m).map(s => s.trim()).filter(Boolean)

    if (rawPages.length > 1) {
      const pages = rawPages.map(page => parseSinglePage(page))
      return { pages, totalPages: pages.length }
    }

    const singleResult = parseSinglePage(md)
    if (autoSplitMax && autoSplitMax > 0 && needsAutoSplit(singleResult, autoSplitMax)) {
      return autoSplitByHeadings(singleResult, autoSplitMax)
    }

    return { pages: [singleResult], totalPages: 1 }
  }

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

      // 主标题 #
      if (trimmed.startsWith('# ') && !trimmed.startsWith('## ') && !result.title) {
        result.title = trimmed.slice(2).trim()
        continue
      }

      // 副标题 > (紧跟主标题后，且不是 tip)
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

      // 步骤标题（支持 ## 和 ###）
      if ((trimmed.startsWith('## ') || trimmed.startsWith('### ')) && !trimmed.startsWith('#### ')) {
        if (currentStep) {
          currentStep.desc = finalizeDesc(currentStep.desc)
          result.steps.push(currentStep)
        }
        // 去掉 ## 或 ### 前缀
        const titleText = trimmed.startsWith('### ') ? trimmed.slice(4) : trimmed.slice(3)
        currentStep = { title: titleText.trim(), desc: '', tip: '' }
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

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function finalizeDesc(raw: string): string {
    if (!raw) return ''
    
    // 如果含有代码块 HTML（已处理过），保留并渲染其余部分
    if (raw.includes('<pre class="card__code-block">')) {
      const parts = raw.split(/(<pre class="card__code-block">[\s\S]*?<\/pre>)/)
      return parts.map(part => {
        if (part.startsWith('<pre class="card__code-block">')) return part
        return part.trim() ? renderInline(part.trim()) : ''
      }).filter(Boolean).join('')
    }
    return renderInline(raw.trim())
  }

  return { parse, parseMultiPage, parseSinglePage }
}
