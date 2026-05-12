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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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
    if (autoSplitMax && autoSplitMax > 0 && singleResult.steps.length > autoSplitMax) {
      return autoSplit(singleResult, autoSplitMax)
    }

    return { pages: [singleResult], totalPages: 1 }
  }

  function autoSplit(data: CardData, maxSteps: number): MultiPageResult {
    const pages: CardData[] = []
    const totalSteps = data.steps.length
    let offset = 0

    while (offset < totalSteps) {
      const chunk = data.steps.slice(offset, offset + maxSteps)
      const pageIndex = pages.length + 1

      pages.push({
        title: data.title,
        subtitle: pageIndex === 1 ? data.subtitle : '',
        category: data.category,
        steps: chunk,
        tags: pageIndex === 1 ? data.tags : []
      })

      offset += maxSteps
    }

    return { pages, totalPages: pages.length }
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

  return { parse, parseMultiPage }
}
