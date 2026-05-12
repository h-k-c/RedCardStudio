import { chromium } from 'playwright'
import { createServer } from 'http'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, extname } from 'path'

const DIST_DIR = '/Users/openorange/IdeaProjects/redCardTemplate/dist'
const OUTPUT_DIR = '/Users/openorange/Documents/redbook_md/cards'
const IMG_DIR = '/tmp/redcard_imgs'

mkdirSync(OUTPUT_DIR, { recursive: true })

const MIME_MAP = {
  '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf'
}

function toDataUrl(filename, mime) {
  const buf = readFileSync(`${IMG_DIR}/${filename}`)
  return `data:${mime};base64,${buf.toString('base64')}`
}

function startServer(port) {
  return new Promise((resolve_) => {
    const srv = createServer((req, res) => {
      const url = (req.url || '/') === '/' ? '/index.html' : req.url
      const fp = resolve(DIST_DIR, '.' + decodeURIComponent(url))
      if (!fp.startsWith(DIST_DIR) || !existsSync(fp)) { res.writeHead(404); res.end(); return }
      res.writeHead(200, { 'Content-Type': MIME_MAP[extname(fp)] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' })
      res.end(readFileSync(fp))
    })
    srv.listen(port, '127.0.0.1', () => resolve_(srv))
  })
}

// 图片转 base64
const headerImg = toDataUrl('header.jpg', 'image/jpeg')
const mimoImg = toDataUrl('mimo-release.png', 'image/png')
const ccSwitchImg = toDataUrl('cc-switch-setup.png', 'image/png')

const PAGES = [
  // 卡片1：封面
  `# Claude Code × MiMo-V2.5-Pro

## 用更低的成本打造顶级 AI 编程助手

![封面](${headerImg})

> Agentic 能力榜开源第一 · 成本仅为 Opus 的 40% · 支持百万级上下文`,

  // 卡片2：优势
  `## 为什么值得一试？

![MiMo 发布](${mimoImg})

- 💰 **价格便宜 60%**：7 / 21 元每百万 token，远低于 Claude Opus
- ⚡ **响应极快**：上线初期并发少，实测延迟极低
- 🧠 **编程能力强**：工具调用稳定，实际表现接近 Opus 水平
- 📏 **百万上下文**：支持最高 100 万 token，与 GPT-5.5 同级`,

  // 卡片3：准备工作
  `## 准备工作

你需要以下三样东西：

- **Claude Code**：已安装并能正常运行
- **cc-switch**：Claude Code 的第三方模型切换工具
- **小米开放平台账号**：用于申请 MiMo API Key

预计配置时间：**约 10 分钟**`,

  // 卡片4：第一步
  `## 第一步：申请 API Key

前往小米开放平台，注册账号并开通 MiMo-V2.5-Pro API 权限。

| 上下文范围 | 输入价格 | 输出价格 |
|---|---|---|
| 0 – 256K | 7 元 / 百万 token | 21 元 / 百万 token |
| 256K – 1M | 14 元 / 百万 token | 42 元 / 百万 token |

> 💡 经常用超长上下文？开通 Token Plan，不区分范围统一定价更划算`,

  // 卡片5：第二步
  `## 第二步：在 cc-switch 中添加 MiMo

1. 双击打开 cc-switch
2. 切换到 **Claude** 标签页
3. 点击右上角 **「+」** 新增模型配置
4. 供应商选择 **Xiaomi MiMo**
5. 填入你申请的 API Key
6. 模型名称填写 \`mimo-v2.5-pro\`，保存

![cc-switch 配置](${ccSwitchImg})`,

  // 卡片6：第三步+实测
  `## 第三步：启用并开始使用

回到 cc-switch 首页，将 MiMo-V2.5-Pro **切换为启用状态**，打开 Claude Code 即可使用。

**实测案例**

某团队用此组合在一次连续会话中完成了完整的公众号数据分析平台——涵盖前后端开发、飞书多维表格对接、服务器部署，工具调用流畅，部署一次性通过。`,

  // 卡片7：FAQ
  `## 常见问题

**MiMo-V2.5 和 V2.5-Pro 有何区别？**
Pro 版参数更多、能力更强，适合复杂编程任务；普通版适合轻量场景，成本更低。

**API 延迟稳定吗？**
上线初期延迟极低，随用户增长后续可能变化，建议趁窗口期体验。

**支持哪些编程语言？**
主流语言均支持，Web 开发（HTML / CSS / JS / React）方向表现尤为突出。`
]

async function main() {
  const srv = await startServer(13580)
  const serverUrl = 'http://127.0.0.1:13580'
  console.log('静态服务器启动:', serverUrl)

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1200, height: 1600 })
  await page.goto(`${serverUrl}/#/render`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => typeof window.__renderCard__ === 'function', { timeout: 10000 })

  for (let i = 0; i < PAGES.length; i++) {
    console.log(`渲染第 ${i + 1}/${PAGES.length} 张...`)
    await page.evaluate(() => { document.body.dataset.rendered = 'false' })
    await page.evaluate((cfg) => { window.__renderCard__(cfg) }, {
      markdown: PAGES[i],
      style: 'minimal',
      fontScale: 175,
      titleFont: '"SimSun", "宋体", serif',
      bodyFont: '"SimSun", "宋体", serif',
      headerText: 'Claude Code 教程',
      footerSlogan: 'toolin.ai'
    })
    await page.waitForFunction(() => document.body.dataset.rendered === 'true', { timeout: 15000 })
    const cardEl = await page.$('.card')
    if (!cardEl) throw new Error(`第 ${i+1} 张未找到卡片元素`)
    const buf = await cardEl.screenshot({ type: 'png' })
    const filename = `card-0${i + 1}.png`
    writeFileSync(`${OUTPUT_DIR}/${filename}`, buf)
    console.log(`✓ 已保存: ${filename}`)
  }

  await browser.close()
  srv.close()
  console.log(`\n全部完成！图片保存在: ${OUTPUT_DIR}`)
}

main().catch(e => { console.error('错误:', e.message); process.exit(1) })
