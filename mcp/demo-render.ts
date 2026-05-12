import { chromium } from 'playwright'
import { resolve as pathResolve, extname } from 'path'
import { createServer } from 'http'
import { existsSync, readFileSync } from 'fs'

const DIST_DIR = pathResolve(process.cwd(), 'dist')

const MIME_MAP: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
}

function findFreePort(start = 4100): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer()
    srv.listen(start, '127.0.0.1', () => { const p = (srv.address() as any).port; srv.close(() => resolve(p)) })
    srv.on('error', () => findFreePort(start + 1).then(resolve, reject))
  })
}

function startStaticServer(port: number): Promise<{ close: () => void }> {
  return new Promise((resolve, reject) => {
    const srv = createServer((req, res) => {
      const reqUrl = req.url || '/'
      const url = reqUrl === '/' ? '/index.html' : reqUrl
      const filePath = pathResolve(DIST_DIR, '.' + decodeURIComponent(url))
      if (!filePath.startsWith(DIST_DIR) || !existsSync(filePath)) {
        res.writeHead(404); res.end('Not found'); return
      }
      const content = readFileSync(filePath)
      res.writeHead(200, {
        'Content-Type': MIME_MAP[extname(filePath)] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      })
      res.end(content)
    })
    srv.listen(port, '127.0.0.1', () => resolve({ close: () => srv.close() }))
    srv.on('error', reject)
  })
}

async function render() {
  const port = await findFreePort()
  const { close } = await startStaticServer(port)

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1200, height: 1600 })

  page.on('console', msg => console.log('[PAGE]', msg.type(), msg.text()))
  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message))

  await page.goto(`http://127.0.0.1:${port}/#/render`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => typeof (window as any).__renderCard__ === 'function', { timeout: 10000 })

  await page.evaluate(() => { document.body.dataset.rendered = 'false' })
  await page.evaluate((cfg) => {
    if (window.__renderCard__) window.__renderCard__(cfg)
  }, {
    markdown: `# 构建高性能 Web 应用

> 现代前端架构的核心原则与实战技巧

## 1. 响应式设计

使用 CSS Grid 和 Flexbox 构建自适应布局，确保在不同设备上都有良好的体验。优先移动端，逐步增强。

## 2. 性能优化

- **代码分割**: 按需加载模块，减少首屏体积
- **图片懒加载**: 仅加载可视区域内的资源
- **缓存策略**: 合理使用 Service Worker

> 💡 Lighthouse 跑分不代表真实体验，关注 Core Web Vitals

## 3. 状态管理

选择合适的状态管理方案：
- 小型项目 → \`useState\` / \`ref\`
- 中型项目 → \`Pinia\` / \`Zustand\`
- 大型项目 → 分层架构 + 事件驱动

## 4. 构建工具链

\`Vite\` 已成为主流选择。HMR 毫秒级热更新，Rollup 生产打包，插件生态完善。告别 Webpack 的漫长等待。

## 5. 类型安全

TypeScript 不是可选项，是必选项。严格模式 + ESLint 规则，从源头杜绝低级错误，让重构不再恐惧。

## 6. 监控与可观测性

部署不是终点。接入 \`Sentry\` 捕获异常，用 \`Web Vitals\` 采集性能指标，建立告警机制。线上问题发现越早，修复成本越低。

## 7. 持续交付

自动化是团队效率的底线。CI 跑测试 + 类型检查，CD 自动部署到预发环境，合并即上线，回滚一键完成。

> 💡 过早优化是万恶之源，但完全不优化是懒惰之罪

#前端 #性能优化 #TypeScript #Vite #工程化`,
    style: 'minimal',
    fontScale: 118,
    author: '数字生命卡兹克',
    headerText: 'Web Engineering',
    footerSlogan: 'Less is more.'
  })
  await page.waitForFunction(() => document.body.dataset.rendered === 'true', { timeout: 15000 })

  const cardEl = await page.$('.card')
  if (cardEl) {
    const outputPath = pathResolve(process.cwd(), 'mcp/demo-tech-output.png')
    await cardEl.screenshot({ path: outputPath })
    console.log(`✅ 渲染成功: ${outputPath}`)
  } else {
    console.error('❌ 未找到 .card 元素')
  }

  await browser.close()
  close()
}

render().catch(err => { console.error('❌', err.message); process.exit(1) })
