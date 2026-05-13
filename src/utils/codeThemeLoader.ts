/**
 * 动态加载 highlight.js 主题
 */

const themeMap: Record<string, string> = {
  github: 'github',
  dark: 'atom-one-dark',
  solarized: 'solarized-light',
  monokai: 'monokai'
}

let currentTheme = 'github'

/**
 * 加载代码高亮主题
 */
export function loadCodeTheme(theme: string = 'github') {
  const themeName = themeMap[theme] || themeMap.github
  
  // 如果主题没有变化，不重新加载
  if (themeName === currentTheme) return
  
  // 移除旧主题
  const oldStyle = document.getElementById('hljs-theme')
  if (oldStyle) {
    oldStyle.remove()
  }
  
  // 加载新主题
  const link = document.createElement('link')
  link.id = 'hljs-theme'
  link.rel = 'stylesheet'
  link.href = `https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/${themeName}.css`
  
  link.onload = () => {
    console.log(`[CodeTheme] Loaded theme: ${themeName}`)
  }
  
  link.onerror = () => {
    console.warn(`[CodeTheme] Failed to load theme: ${themeName}, using default`)
  }
  
  document.head.appendChild(link)
  currentTheme = themeName
}
