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

// ---- 自动分页逻辑 ----

/** 是否需要对这张卡片做自动分页 */
function needsAutoSplit(md: string, maxSteps: number): boolean {
  // 统计 ## 标题数量
  const headingCount = (md.match(/^#{2,3}\s/gm) || []).length
  if (headingCount > maxSteps) return true
    
  // 估算内容高度（简化版：按行数）
  const lines = md.split('\n').length
  const estimatedHeight = lines * 30 // 每行约 30px
  return estimatedHeight > 1440 // 卡片高度 1440px
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
