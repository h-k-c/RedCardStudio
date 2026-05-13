import html2canvas from 'html2canvas'

export function useCardExport() {
  async function exportElement(el: HTMLElement, filename?: string): Promise<void> {
    // 临时移除 zoom 以确保 html2canvas 以原始 1080×1440 尺寸渲染
    const originalZoom = el.style.zoom
    const originalTransform = el.style.transform
    const originalTransition = el.style.transition
    const parent = el.parentElement
    const originalOverflow = parent?.style.overflow || ''
    const originalParentWidth = parent?.style.width || ''
    const originalParentHeight = parent?.style.height || ''

    // 设置为正常渲染状态
    el.style.zoom = '1'
    el.style.transform = 'scale(1)'
    el.style.transition = 'none'
    
    if (parent) {
      parent.style.overflow = 'visible'
      parent.style.width = '1080px'
      parent.style.height = '1440px'
    }

    try {
      // 等待一帧让样式生效
      await new Promise(resolve => requestAnimationFrame(resolve))
      
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: 1080,
        height: 1440
      })
      const link = document.createElement('a')
      link.download = filename || `redcard-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      // 恢复所有样式
      el.style.zoom = originalZoom
      el.style.transform = originalTransform
      el.style.transition = originalTransition
      
      if (parent) {
        parent.style.overflow = originalOverflow
        parent.style.width = originalParentWidth
        parent.style.height = originalParentHeight
      }
    }
  }

  return { exportElement }
}
