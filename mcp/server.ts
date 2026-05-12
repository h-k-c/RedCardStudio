#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { chromium, type Browser, type Page } from 'playwright'
import { fileURLToPath } from 'url'
import { dirname, resolve as pathResolve, extname } from 'path'
import { existsSync, readFileSync } from 'fs'
import { createServer } from 'http'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = pathResolve(__dirname, '..')
const DIST_DIR = pathResolve(PROJECT_ROOT, 'dist')
const INDEX_PATH = pathResolve(DIST_DIR, 'index.html')

const RenderSchema = z.object({
  markdown: z.string().min(1).describe('要渲染的 Markdown 内容'),
  style: z.enum(['magazine', 'tech', 'vibrant', 'dark', 'japanese', 'literary', 'terminal', 'purple', 'minimal', 'timeline'])
    .optional().default('magazine').describe('卡片风格'),
  author: z.string().optional().describe('作者名称'),
  fontScale: z.number().min(50).max(300).optional().describe('字体缩放比例 50-300'),
  titleFont: z.string().optional().describe('标题字体 CSS 值'),
  bodyFont: z.string().optional().describe('正文字体 CSS 值'),
  headerText: z.string().optional().describe('页眉文字'),
  footerSlogan: z.string().optional().describe('页脚标语'),
  pageIndex: z.number().min(0).optional().describe('多页时渲染第几页（从0开始）')
})

type RenderArgs = z.infer<typeof RenderSchema>

let browser: Browser | null = null
let page: Page | null = null
let staticSrv: ReturnType<typeof createServer> | null = null
let serverUrl = ''

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

function startStaticServer(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    staticSrv = createServer((req, res) => {
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
    staticSrv.listen(port, '127.0.0.1', () => resolve())
    staticSrv.on('error', reject)
  })
}

function findFreePort(start = 3456, maxAttempts = 20): Promise<number> {
  return new Promise((resolve, reject) => {
    if (maxAttempts <= 0) return reject(new Error('无法找到可用端口'))
    const srv = createServer()
    srv.listen(start, '127.0.0.1', () => {
      const port = (srv.address() as any).port
      srv.close(() => resolve(port))
    })
    srv.on('error', () => findFreePort(start + 1, maxAttempts - 1).then(resolve, reject))
  })
}

async function ensureBuilt(): Promise<void> {
  if (!existsSync(INDEX_PATH)) {
    throw new Error(`构建产物不存在: ${INDEX_PATH}\n请先运行 npm run build 构建前端项目，再启动 MCP Server。`)
  }
}

async function getBrowser(): Promise<Browser> {
  if (!browser) browser = await chromium.launch({ headless: true })
  return browser
}

async function getPage(): Promise<Page> {
  if (!page) {
    const b = await getBrowser()
    page = await b.newPage()
    await page.setViewportSize({ width: 1200, height: 1600 })
    await page.goto(`${serverUrl}/#/render`, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => typeof window.__renderCard__ === 'function', { timeout: 10000 })
  }
  return page
}

async function renderToPng(args: RenderArgs): Promise<Buffer> {
  const p = await getPage()
  await p.evaluate(() => { document.body.dataset.rendered = 'false' })
  await p.evaluate((cfg) => { if (window.__renderCard__) window.__renderCard__(cfg) }, args)
  await p.waitForFunction(() => document.body.dataset.rendered === 'true', { timeout: 15000 })
  const cardEl = await p.$('.card')
  if (!cardEl) throw new Error('未找到卡片元素，渲染可能失败')
  return await cardEl.screenshot({ type: 'png' })
}

async function main() {
  await ensureBuilt()
  const port = await findFreePort()
  await startStaticServer(port)
  serverUrl = `http://127.0.0.1:${port}`
  console.error(`[RedCard MCP] 静态服务器已启动: ${serverUrl}`)

  const server = new Server(
    { name: 'redcard-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [{
      name: 'render_markdown',
      description: '将 Markdown 文本渲染为 PNG 卡片图片。支持 10 种风格，可调整字体、页眉页脚等。',
      inputSchema: {
        type: 'object',
        properties: {
          markdown: { type: 'string', description: '要渲染的 Markdown 内容。用 ## 表示步骤标题，用 > 表示提示，用 === 分隔多页。' },
          style: { type: 'string', enum: ['magazine','tech','vibrant','dark','japanese','literary','terminal','purple','minimal','timeline'], description: '卡片视觉风格，默认 magazine' },
          author: { type: 'string', description: '作者名称' },
          fontScale: { type: 'number', description: '字体缩放比例 50-300' },
          titleFont: { type: 'string', description: '标题字体 CSS 值' },
          bodyFont: { type: 'string', description: '正文字体 CSS 值' },
          headerText: { type: 'string', description: '页眉文字' },
          footerSlogan: { type: 'string', description: '页脚标语' },
          pageIndex: { type: 'number', description: '多页时渲染第几页，从 0 开始' }
        },
        required: ['markdown']
      }
    }]
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === 'render_markdown') {
      try {
        const args = RenderSchema.parse(request.params.arguments)
        const pngBuffer = await renderToPng(args)
        const base64 = pngBuffer.toString('base64')
        return {
          content: [
            { type: 'image', mimeType: 'image/png', data: base64 } as any,
            { type: 'text', text: `Markdown 已成功渲染为 PNG 卡片。\n风格: ${args.style}\n尺寸: 1080 x 1440 px` }
          ]
        }
      } catch (err: any) {
        return { content: [{ type: 'text', text: `渲染失败: ${err.message}` }], isError: true }
      }
    }
    return { content: [{ type: 'text', text: `未知工具: ${request.params.name}` }], isError: true }
  })

  const transport = new StdioServerTransport()
  await server.connect(transport)

  async function cleanup() {
    if (page) { await page.close().catch(() => {}); page = null }
    if (browser) { await browser.close().catch(() => {}); browser = null }
    if (staticSrv) { staticSrv.close(); staticSrv = null }
  }
  process.on('SIGINT', async () => { await cleanup(); process.exit(0) })
  process.on('SIGTERM', async () => { await cleanup(); process.exit(0) })
  process.on('exit', () => {
    // synchronous best-effort: browser.close() is async, but SIGINT/SIGTERM handle the real cleanup
  })
}

main().catch((err) => { console.error('MCP Server 启动失败:', err.message); process.exit(1) })
