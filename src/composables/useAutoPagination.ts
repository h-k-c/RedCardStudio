import { ref, nextTick } from 'vue'

// 卡片总高度 1440px
// 固定区域占用：页眉(40) + 标题(80) + 副标题(40) + 分割线(20) + 标签(60) + 页脚(50) + 上下padding(160) ≈ 450px
// 内容区域最大高度 = 1440 - 450 = 990px
// 现在设置为 750px，让每页内容更少，分页更密集
const MAX_CONTENT_HEIGHT = 750

/**
 * 自动检测卡片内容高度，如果超过限制则自动分页
 */
export function useAutoPagination() {
  const isChecking = ref(false)

  /**
   * 检测卡片内容是否溢出
   */
  async function checkOverflow(cardElement: HTMLElement): Promise<boolean> {
    if (isChecking.value) return false
    
    isChecking.value = true
    
    await nextTick()
    
    // 获取 Markdown 内容区域
    const contentEl = cardElement.querySelector('.card__markdown-content')
    if (!contentEl) {
      isChecking.value = false
      return false
    }

    // 检查是否溢出
    const isOverflowing = contentEl.scrollHeight > contentEl.clientHeight
    
    isChecking.value = false
    return isOverflowing
  }

  /**
   * 基于高度检测，智能分割 Markdown 内容
   * 逐段添加内容，当超过高度限制时在合适位置分割
   * 不依赖##标题，而是基于实际段落边界
   * 支持手动分页标记：=== 或 ---page---
   */
  function splitContentByHeight(
    fullMd: string,
    createElement: (md: string) => HTMLElement
  ): { firstPage: string; secondPage: string } | null {
    const lines = fullMd.split('\n')
    
    console.log('[AutoPagination] 开始分割，总行数:', lines.length)
    
    // 先检查是否有手动分页标记
    let manualSplitIndex = -1
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim()
      // 支持的分页标记：=== 或 ---page--- 或 <!-- page -->
      if (trimmed === '===' || trimmed === '---page---' || trimmed === '<!-- page -->') {
        manualSplitIndex = i
        console.log('[AutoPagination] 找到手动分页标记，位置:', i, '标记:', trimmed)
        break
      }
    }
    
    // 如果有手动分页标记，直接使用
    if (manualSplitIndex > 0) {
      const firstPage = lines.slice(0, manualSplitIndex).join('\n').trim()
      const secondPage = lines.slice(manualSplitIndex + 1).join('\n').trim() // +1 跳过分页标记本身
      
      console.log('[AutoPagination] ✅ 使用手动分页标记')
      console.log('[AutoPagination] 第一页行数:', firstPage.split('\n').length)
      console.log('[AutoPagination] 第二页行数:', secondPage.split('\n').length)
      
      return { firstPage, secondPage }
    }
    
    // 没有手动标记，使用自动高度检测
    console.log('[AutoPagination] 未找到手动分页标记，使用自动高度检测')
    
    // 逐行累加，检测何时超过高度限制
    let firstPageLines: string[] = []
    let splitIndex = -1
    
    for (let i = 0; i < lines.length; i++) {
      // 添加当前行
      firstPageLines.push(lines[i])
      
      // 每5行检测一次高度（更精确）
      if (i % 5 === 0 || i === lines.length - 1) {
        const testMd = firstPageLines.join('\n')
        const testEl = createElement(testMd)
        document.body.appendChild(testEl)
        
        const height = testEl.scrollHeight
        document.body.removeChild(testEl)
        
        console.log(`[AutoPagination] 第${i}行，高度: ${height}px，限制: ${MAX_CONTENT_HEIGHT}px`)
        
        if (height > MAX_CONTENT_HEIGHT) {
          // 超过限制，回退到上一个检测点
          splitIndex = Math.max(0, i - 4)
          console.log('[AutoPagination] 超过限制，分割位置:', splitIndex)
          break
        }
      }
    }
    
    // 如果没有超过限制，不需要分割
    if (splitIndex === -1) {
      console.log('[AutoPagination] 内容未超过限制，不需要分割')
      return null
    }
    
    // 尝试找到更合理的分割点（段落边界、空行等）
    let bestSplit = splitIndex
    for (let i = splitIndex; i >= Math.max(0, splitIndex - 20); i--) {
      const line = lines[i].trim()
      // 优先在空行、任何标题、列表项后分割
      if (line === '' || line.match(/^#{1,6}\s/) || line.match(/^[-*]\s/) || line.match(/^\d+\.\s/)) {
        bestSplit = i + 1
        console.log('[AutoPagination] 找到更好的分割点:', bestSplit, '（在', line || '空行', '之后）')
        break
      }
    }
    
    // 分割内容
    const firstPage = lines.slice(0, bestSplit).join('\n').trim()
    const secondPage = lines.slice(bestSplit).join('\n').trim()
    
    console.log('[AutoPagination] ✅ 分割完成')
    console.log('[AutoPagination] 第一页行数:', firstPage.split('\n').length)
    console.log('[AutoPagination] 第二页行数:', secondPage.split('\n').length)
    
    return { firstPage, secondPage }
  }

  return {
    isChecking,
    checkOverflow,
    splitContentByHeight
  }
}
