import { chromium } from 'playwright'
import { resolve as pathResolve, extname } from 'path'
import { createServer } from 'http'
import { existsSync, readFileSync } from 'fs'

const DIST_DIR = pathResolve(process.cwd(), 'dist')
const INDEX_PATH = pathResolve(DIST_DIR, 'index.html')

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

function findFreePort(start = 3457): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer()
    srv.listen(start, '127.0.0.1', () => {
      const port = (srv.address() as any).port
      srv.close(() => resolve(port))
    })
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

async function test() {
  if (!existsSync(INDEX_PATH)) {
    console.error('❌ 构建产物不存在，请先运行 npm run build')
    process.exit(1)
  }

  const port = await findFreePort()
  const { close } = await startStaticServer(port)
  console.log(`静态服务器已启动: http://127.0.0.1:${port}`)

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1200, height: 1600 })

  page.on('console', msg => console.log('[PAGE]', msg.type(), msg.text()))
  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message))

  const url = `http://127.0.0.1:${port}/#/render`
  console.log('Opening:', url)
  await page.goto(url, { waitUntil: 'networkidle' })

  const hasFn = await page.evaluate(() => typeof (window as any).__renderCard__ === 'function')
  console.log('Has __renderCard__:', hasFn)

  if (!hasFn) {
    console.error('❌ __renderCard__ 函数未找到，渲染视图可能未正确加载')
    await browser.close()
    close()
    process.exit(1)
  }

  // 测试渲染
  await page.evaluate(() => { document.body.dataset.rendered = 'false' })
  await page.evaluate((cfg) => {
    if (window.__renderCard__) window.__renderCard__(cfg)
  }, {
    markdown: `# MCP 渲染测试\n\n> 验证 Markdown 转 PNG 功能\n\n## 第一步\n这是第一步的内容。\n\n## 第二步\n验证多步骤渲染。\n\n---\n测试完成`,
    style: 'dark',
    author: 'MCP-Test'
  })
  await page.waitForFunction(() => document.body.dataset.rendered === 'true', { timeout: 15000 })

  const cardEl = await page.$('.card')
  if (cardEl) {
    await cardEl.screenshot({ path: pathResolve(process.cwd(), 'mcp/test-output.png') })
    console.log('✅ 渲染成功，已保存到 mcp/test-output.png')
  } else {
    console.error('❌ 未找到 .card 元素')
  }

  await browser.close()
  close()
}

test().catch((err) => {
  console.error('❌ 测试失败:', err.message)
  process.exit(1)
})
