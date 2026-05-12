import html2canvas from 'html2canvas'

export function useCardExport() {
  async function exportElement(el: HTMLElement, filename?: string): Promise<void> {
    // 临时移除 zoom 以确保 html2canvas 以原始 1080×1440 尺寸渲染
    const originalZoom = el.style.zoom
    const parent = el.parentElement
    const originalOverflow = parent?.style.overflow || ''
    const originalParentWidth = parent?.style.width || ''
    const originalParentHeight = parent?.style.height || ''

    el.style.zoom = '1'
    if (parent) {
      parent.style.overflow = 'visible'
      parent.style.width = 'auto'
      parent.style.height = 'auto'
    }

    try {
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
      el.style.zoom = originalZoom
      if (parent) {
        parent.style.overflow = originalOverflow
        parent.style.width = originalParentWidth
        parent.style.height = originalParentHeight
      }
    }
  }

  return { exportElement }
}
