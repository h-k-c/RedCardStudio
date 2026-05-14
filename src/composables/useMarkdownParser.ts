import { marked } from 'marked'
import hljs from 'highlight.js'
import type { CardData } from '@/types/card'

export interface MultiPageResult {
  pages: CardData[]
  totalPages: number
}

// 配置 marked：开启 GFM、换行、自定义代码块渲染
const renderer = new marked.Renderer()

// 自定义代码块渲染：应用语法高亮并添加终端外壳
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  let highlighted = text
  
  // 应用语法高亮
  if (lang && hljs.getLanguage(lang)) {
    try {
      highlighted = hljs.highlight(text, { language: lang }).value
    } catch (err) {
      console.warn('Failed to highlight code:', err)
    }
  } else {
    // 自动检测语言或无高亮
    try {
      const result = hljs.highlightAuto(text)
      highlighted = result.value
    } catch (err) {
      // 如果高亮失败，转义 HTML
      highlighted = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    }
  }
  
  const language = lang || 'text'
  
  // 生成终端样式的代码块
  return `
<div class="card__code-terminal">
  <div class="card__code-terminal-header">
    <div class="card__code-terminal-buttons">
      <span class="card__code-terminal-btn card__code-terminal-btn--close"></span>
      <span class="card__code-terminal-btn card__code-terminal-btn--minimize"></span>
      <span class="card__code-terminal-btn card__code-terminal-btn--maximize"></span>
    </div>
    <div class="card__code-terminal-title">${language}</div>
  </div>
  <pre class="card__code-block"><code class="language-${language}">${highlighted}</code></pre>
</div>`
}

marked.setOptions({
  gfm: true,
  breaks: true,
  renderer: renderer
})

// ---- 内容高度估算（基于行数统计） ----
// 卡片 canvas 固定 1080×1440

const CARD_HEIGHT = 1440
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

/** 是否需要对这张卡片做自动分页 */
function needsAutoSplit(md: string, maxSteps: number): boolean {
  // 统计 ## 标题数量
  const headingCount = (md.match(/^#{2,3}\s/gm) || []).length
  if (headingCount > maxSteps) return true
    
  // 估算内容高度（简化版：按行数）
  const lines = md.split('\n').length
  const estimatedHeight = lines * 30 // 每行约 30px
  return estimatedHeight > CARD_HEIGHT
}

/** 按内容高度估算进行智能分页 */
function autoSplitByHeight(md: string, maxSteps: number, parseFn: (md: string) => CardData): MultiPageResult {
  const lines = md.split('\n')
  const chunks: string[] = []
  let currentChunk = ''
  let currentChunkLines = 0
  const MAX_LINES_PER_PAGE = 40 // 每页最多约 40 行（1440px / 30px ≈ 48 行，留余量）

  for (const line of lines) {
    const trimmed = line.trim()
    
    // 检查是否是 ## 或 ### 标题（分页点）
    if (trimmed.match(/^#{2,3}\s/)) {
      // 如果当前块已经超过限制，保存并开始新块
      if (currentChunkLines > MAX_LINES_PER_PAGE && currentChunk.trim()) {
        chunks.push(currentChunk.trim())
        currentChunk = ''
        currentChunkLines = 0
      }
    }
    
    currentChunk += line + '\n'
    currentChunkLines++
  }

  // 添加最后一块
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  // 按 maxSteps 分组（合并小块）
  const pages: CardData[] = []
  for (let i = 0; i < chunks.length; i += maxSteps) {
    const group = chunks.slice(i, i + maxSteps).join('\n\n')
    pages.push(parseFn(group))
  }

  return { pages, totalPages: pages.length }
}



export function useMarkdownParser() {
  /** 按 ## 标题进行简单分页 */
  function autoSplitByHeadings(md: string, maxSteps: number): MultiPageResult {
    return autoSplitByHeight(md, maxSteps, parseSinglePage)
  }
  function parse(md: string): CardData {
    return parseSinglePage(md)
  }

  function parseMultiPage(md: string, autoSplitMax?: number): MultiPageResult {
    const rawPages = md.split(/^===+$/m).map(s => s.trim()).filter(Boolean)

    if (rawPages.length > 1) {
      const pages = rawPages.map(page => parseSinglePage(page))
      return { pages, totalPages: pages.length }
    }

    if (autoSplitMax && autoSplitMax > 0 && needsAutoSplit(md, autoSplitMax)) {
      return autoSplitByHeadings(md, autoSplitMax)
    }

    const singleResult = parseSinglePage(md)
    return { pages: [singleResult], totalPages: 1 }
  }

  function parseSinglePage(md: string): CardData {
    // 直接将整个 Markdown 转为 HTML，不做任何特殊解析
    const html = marked.parse(md, { async: false }) as string
    
    return {
      title: '',
      subtitle: '',
      category: '',
      steps: [],
      tags: [],
      coverImage: undefined,
      fullHtml: html  // 完整的 HTML 内容
    }
  }

  return { parse, parseMultiPage, parseSinglePage }
}
