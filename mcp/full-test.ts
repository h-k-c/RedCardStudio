/**
 * Full MCP feature coverage test
 * Tests all 8 styles + font scale, custom fonts, headerText, footerSlogan, multi-page
 */
import { chromium, type Browser, type Page } from 'playwright'
import { resolve as pathResolve, extname } from 'path'
import { createServer } from 'http'
import { existsSync, readFileSync, mkdirSync } from 'fs'

const DIST_DIR = pathResolve(process.cwd(), 'dist')
const OUT_DIR = pathResolve(process.cwd(), 'mcp/test-full-output')

const MIME_MAP: Record<string, string> = {
  '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf'
}

function findFreePort(start = 4000): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer()
    srv.listen(start, '127.0.0.1', () => { const p = (srv.address() as any).port; srv.close(() => resolve(p)) })
    srv.on('error', () => findFreePort(start + 1).then(resolve, reject))
  })
}

function startServer(port: number): Promise<() => void> {
  return new Promise((resolve, reject) => {
    const srv = createServer((req, res) => {
      const url = (req.url || '/') === '/' ? '/index.html' : req.url!
      const fp = pathResolve(DIST_DIR, '.' + decodeURIComponent(url))
      if (!fp.startsWith(DIST_DIR) || !existsSync(fp)) { res.writeHead(404); res.end(); return }
      res.writeHead(200, { 'Content-Type': MIME_MAP[extname(fp)] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' })
      res.end(readFileSync(fp))
    })
    srv.listen(port, '127.0.0.1', () => resolve(() => srv.close()))
    srv.on('error', reject)
  })
}

async function renderCard(page: Page, cfg: Record<string, any>, outFile: string) {
  await page.evaluate(() => { document.body.dataset.rendered = 'false' })
  await page.evaluate((c) => { if ((window as any).__renderCard__) (window as any).__renderCard__(c) }, cfg)
  await page.waitForFunction(() => document.body.dataset.rendered === 'true', { timeout: 15000 })
  const el = await page.$('.card')
  if (!el) throw new Error('未找到 .card 元素')
  await el.screenshot({ path: outFile })
  console.log(`  ✅ ${outFile.replace(OUT_DIR + '/', '')}`)
}

async function renderAutoPages(page: Page, cfg: Record<string, any>, outPrefix: string): Promise<number> {
  const firstCfg = { ...cfg, pageIndex: 0, autoSplitMax: cfg.stepsPerPage, hidePage: true }
  await page.evaluate(() => { document.body.dataset.rendered = 'false' })
  await page.evaluate((c) => { if ((window as any).__renderCard__) (window as any).__renderCard__(c) }, firstCfg)
  await page.waitForFunction(() => document.body.dataset.rendered === 'true', { timeout: 15000 })
  const total: number = await page.evaluate(() => (window as any).__totalPages__ ?? 1)
  const el = await page.$('.card')
  if (!el) throw new Error('未找到 .card 元素')
  await el.screenshot({ path: `${outPrefix}-p1.png` })
  console.log(`  ✅ ${outPrefix.replace(OUT_DIR + '/', '')}-p1.png`)
  for (let i = 1; i < total; i++) {
    const nextCfg = { ...cfg, pageIndex: i, autoSplitMax: cfg.stepsPerPage, hidePage: true }
    await page.evaluate(() => { document.body.dataset.rendered = 'false' })
    await page.evaluate((c) => { if ((window as any).__renderCard__) (window as any).__renderCard__(c) }, nextCfg)
    await page.waitForFunction(() => document.body.dataset.rendered === 'true', { timeout: 15000 })
    const el2 = await page.$('.card')
    if (el2) {
      await el2.screenshot({ path: `${outPrefix}-p${i + 1}.png` })
      console.log(`  ✅ ${outPrefix.replace(OUT_DIR + '/', '')}-p${i + 1}.png`)
    }
  }
  return total
}

const SAMPLE_MD = `# 手机摄影构图 5 个核心法则

> 从入门到进阶，拍出杂志感大片

## 三分法则

将画面分成 3×3 的九宫格，把主体放在交叉点上，这是最基础也最有效的构图方式。

## 引导线构图

利用道路、栏杆、建筑线条等元素，将视线引向画面主体。营造 ✦ 深度感。

## 框架构图

通过门窗、树枝、河流都是天然的引导线。`

const MULTI_PAGE_MD = `# JavaScript 异步编程（上）

> 从回调地狱到 async/await

## 回调函数时代

最早的异步方案，层层嵌套，可读性差，错误处理困难。

## Promise 的出现

链式调用解决了嵌套问题，但长链依然难以阅读。

===

# JavaScript 异步编程（下）

> 现代异步最佳实践

## async / await

让异步代码看起来像同步，可读性大幅提升。

## 错误处理

try/catch 统一捕获，配合 Promise.allSettled 处理并发。`

async function main() {
  if (!existsSync(pathResolve(DIST_DIR, 'index.html'))) {
    console.error('❌ 请先 npm run build'); process.exit(1)
  }
  mkdirSync(OUT_DIR, { recursive: true })

  const port = await findFreePort()
  const stopServer = await startServer(port)
  const browser: Browser = await chromium.launch({ headless: true })
  const page: Page = await browser.newPage()
  await page.setViewportSize({ width: 1200, height: 1600 })
  await page.goto(`http://127.0.0.1:${port}/#/render`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => typeof (window as any).__renderCard__ === 'function', { timeout: 10000 })

  const cases: Array<{ label: string; cfg: Record<string, any> }> = [
    // ── 全部 8 种风格 ──
    { label: '01-magazine', cfg: { markdown: SAMPLE_MD, style: 'magazine', author: '摄影师' } },
    { label: '02-vibrant',  cfg: { markdown: SAMPLE_MD, style: 'vibrant',  author: '摄影师' } },
    { label: '03-dark',     cfg: { markdown: SAMPLE_MD, style: 'dark',     author: '摄影师' } },
    { label: '04-japanese', cfg: { markdown: SAMPLE_MD, style: 'japanese', author: '摄影师' } },
    { label: '05-literary', cfg: { markdown: SAMPLE_MD, style: 'literary', author: '摄影师' } },
    { label: '06-minimal',  cfg: { markdown: SAMPLE_MD, style: 'minimal',  author: '摄影师' } },
    { label: '07-white',    cfg: { markdown: SAMPLE_MD, style: 'white',    author: '摄影师' } },
    { label: '08-purewhite',cfg: { markdown: SAMPLE_MD, style: 'purewhite',author: '摄影师' } },
    // ── fontScale 放大 ──
    { label: '09-fontscale-140', cfg: { markdown: SAMPLE_MD, style: 'magazine', fontScale: 140, author: '摄影师' } },
    { label: '10-fontscale-80',  cfg: { markdown: SAMPLE_MD, style: 'dark',     fontScale: 80,  author: '摄影师' } },
    // ── 自定义字体 ──
    { label: '11-custom-font-serif', cfg: {
        markdown: SAMPLE_MD, style: 'literary',
        titleFont: 'Georgia, serif', bodyFont: 'Palatino, serif',
        fontScale: 110, author: '文艺青年'
    }},
    // ── headerText + footerSlogan ──
    { label: '12-header-footer', cfg: {
        markdown: SAMPLE_MD, style: 'minimal',
        headerText: 'Photography Guide', footerSlogan: 'See the world differently.',
        author: '卡兹克'
    }},
    // ── 多页：pageIndex 0 ──
    { label: '13-multipage-p0', cfg: { markdown: MULTI_PAGE_MD, style: 'magazine', pageIndex: 0, author: 'JS 大师' } },
    // ── 多页：pageIndex 1 ──
    { label: '14-multipage-p1', cfg: { markdown: MULTI_PAGE_MD, style: 'magazine', pageIndex: 1, author: 'JS 大师' } },
    // ── 全参数组合 ──
    { label: '15-all-params', cfg: {
        markdown: SAMPLE_MD, style: 'dark',
        author: '数字生命卡兹克', fontScale: 120,
        titleFont: 'Courier New, monospace', bodyFont: 'system-ui, sans-serif',
        headerText: 'Premium Guide', footerSlogan: 'Code with passion.',
    }},
  ]

  const AUTO_PAGE_MD = `# 学习 React 的完整路径

> 从零到上手，系统化攻略

## 第一步：理解组件思维
React 的核心是组件化。把 UI 拆分为独立、可复用的组件，每个组件管理自己的状态。

## 第二步：掌握 JSX
JSX 是 JavaScript 的语法扩展，让你在 JS 中写看起来像 HTML 的代码。用 {} 插入变量。

## 第三步：学习 Hooks
useState 管理状态，useEffect 处理副作用，useRef 引用 DOM。先掌握这三个，够用了。

## 第四步：状态管理
小型应用用 useState，中型用 Context，大型用 Pinia / Zustand。不要过度设计。

## 第五步：路由
React Router 是标准方案。掌握 BrowserRouter、Route、Link、useNavigate 四个概念。

## 第六步：数据请求
用 fetch 或 axios，配合 useEffect 请求数据。SWR / React Query 是进阶选项。`

  console.log(`\n🚀 开始全量测试，共 ${cases.length} 个用例 + 1 个自动分页用例\n`)
  let passed = 0, failed = 0
  for (const { label, cfg } of cases) {
    try {
      await renderCard(page, cfg, pathResolve(OUT_DIR, `${label}.png`))
      passed++
    } catch (e: any) {
      console.error(`  ❌ ${label}: ${e.message}`)
      failed++
    }
  }

  // 自动分页测试（每页 3 个步骤，共 6 步骤应分 2 页）
  console.log('\n  📄 自动分页测试（stepsPerPage=3，共6步骤）')
  try {
    const total = await renderAutoPages(page, {
      markdown: AUTO_PAGE_MD, style: 'magazine', author: '卡兹克', stepsPerPage: 3
    }, pathResolve(OUT_DIR, '16-autopages'))
    console.log(`     → 共渲染 ${total} 页`)
    passed++
  } catch (e: any) {
    console.error(`  ❌ 16-autopages: ${e.message}`)
    failed++
  }

  await browser.close()
  stopServer()
  console.log(`\n结果：${passed} 通过，${failed} 失败`)
  console.log(`输出目录：${OUT_DIR}`)
  if (failed > 0) process.exit(1)
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
