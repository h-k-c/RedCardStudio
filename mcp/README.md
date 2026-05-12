# RedCard MCP Server

将 Markdown 文本渲染为精美 PNG 卡片图片的 MCP (Model Context Protocol) 服务器。

## 🎯 功能特性

- ✨ **8 种精美风格**：杂志经典、活力元气、暗黑高级、日系简约、文艺清新、极简黑白、奶白衬线、纯奶牛白
- 🎨 **高度可定制**：支持字体、缩放、页眉页脚等参数
- 📄 **多页支持**：自动分割长内容，按需渲染指定页面
- 🖼️ **高质量输出**：1080 x 1440 px PNG 格式，适合社交媒体分享
- 🔌 **即插即用**：兼容所有支持 MCP 的 AI 应用（Claude Desktop、Cursor 等）

## 📦 安装

### 前置要求

- Node.js >= 18
- npm 或 pnpm
- Playwright（会自动安装浏览器）

### 构建前端项目

```bash
# 1. 安装依赖
npm install

# 2. 构建前端项目（MCP Server 需要 dist 目录）
npm run build
```

### 配置 MCP Client

在你的 MCP 客户端配置中添加（例如 Claude Desktop 的 `claude_desktop_config.json`）：

```json
{
  "mcpServers": {
    "redcard": {
      "command": "npx",
      "args": ["tsx", "/path/to/redCardTemplate/mcp/server.ts"],
      "cwd": "/path/to/redCardTemplate"
    }
  }
}
```

或者如果你已经构建了项目：

```json
{
  "mcpServers": {
    "redcard": {
      "command": "node",
      "args": ["dist/mcp/server.js"],
      "cwd": "/path/to/redCardTemplate"
    }
  }
}
```

## 🚀 使用方式

### 在 AI 对话中使用

配置完成后，AI 助手会自动发现 `render_markdown` 工具。你可以直接说：

```
帮我把以下内容渲染成卡片：
# 如何学习 TypeScript

## 1. 基础语法
掌握类型系统、接口、泛型...

## 2. 实战项目
通过实际项目巩固知识...

风格用 dark，作者写"张三"
```

### 工具参数说明

#### 必需参数

- **markdown** (string): 要渲染的 Markdown 内容
  - 使用 `#` 表示主标题
  - 使用 `##` 表示步骤/章节标题
  - 使用 `>` 表示引用/提示
  - 使用 `---` 或 `===` 分隔多页内容

#### 可选参数

- **style** (string): 卡片视觉风格，默认 `magazine`
  - `magazine` - 杂志经典（教程、指南）
  - `vibrant` - 活力元气（生活技巧）
  - `dark` - 暗黑高级（技术内容）
  - `japanese` - 日系简约（极简生活）
  - `literary` - 文艺清新（故事、随笔）
  - `minimal` - 极简黑白（极简主义）
  - `white` - 奶白衬线（散文、故事）
  - `purewhite` - 纯奶牛白（纯净简洁）

- **author** (string): 作者名称，显示在页眉
  - 示例：`"数字生命卡兹克"`、`"@username"`

- **fontScale** (number): 字体缩放比例，50-300，默认 100
  - 50-80：适合内容极多的长文
  - 80-120：标准阅读体验
  - 120-150：适合重点突出
  - 150-300：适合标题卡片

- **titleFont** (string): 标题字体 CSS 值
  - 示例：`"Georgia, serif"`、`"PingFang SC, sans-serif"`

- **bodyFont** (string): 正文字体 CSS 值
  - 示例：`"system-ui, sans-serif"`、`"Noto Serif SC, serif"`

- **headerText** (string): 自定义页眉文字
  - 示例：`"Web Engineering"`、`"Daily Tips"`

- **footerSlogan** (string): 页脚标语
  - 示例：`"Less is more."`、`"每天进步一点点"`

- **pageIndex** (number): 多页时渲染第几页（从 0 开始）
  - 示例：`0` 第一页，`1` 第二页

## 📝 使用示例

### 示例 1：基础教程卡片

```markdown
markdown: |
  # 构建高性能 Web 应用
  
  > 现代前端架构的核心原则
  
  ## 1. 响应式设计
  使用 CSS Grid 和 Flexbox 构建自适应布局。
  
  ## 2. 性能优化
  - 代码分割：按需加载模块
  - 图片懒加载：仅加载可视区域
  - 缓存策略：使用 Service Worker
  
  ## 3. 类型安全
  TypeScript 不是可选项，是必选项。

style: magazine
author: 前端专家
headerText: Web Engineering
footerSlogan: Code with passion.
```

### 示例 2：多页内容

```markdown
markdown: |
  # Python 入门教程（上）
  
  ## 变量与数据类型
  Python 支持多种数据类型...
  
  ---
  
  # Python 入门教程（下）
  
  ## 函数与模块
  函数是组织好的代码块...

pageIndex: 0  # 渲染第一页
# pageIndex: 1  # 渲染第二页
```

### 示例 3：自定义字体

```markdown
markdown: |
  # 诗词欣赏
  
  ## 静夜思
  床前明月光，疑是地上霜。
  举头望明月，低头思故乡。

style: literary
fontScale: 120
titleFont: "STKaiti, Kaiti SC, serif"
bodyFont: "STSong, SimSun, serif"
author: 李白
```

## 🛠️ 开发

### 本地测试

```bash
# 1. 安装依赖
npm install

# 2. 构建前端
npm run build

# 3. 测试渲染功能
npx tsx mcp/test-render.ts

# 4. 查看输出
ls mcp/test-output.png
```

### 演示示例

```bash
# 运行演示脚本（生成 mcp/demo-tech-output.png）
npx tsx mcp/demo-render.ts
```

### 手动启动 MCP Server

```bash
# 开发模式（需要 tsx）
npx tsx mcp/server.ts

# 生产模式（需要先构建）
node dist/mcp/server.js
```

## 📊 技术架构

```
┌─────────────────────────────────────────┐
│         AI Client (Claude/Cursor)       │
│                                         │
│  用户请求: "帮我渲染一张卡片"            │
└────────────────┬────────────────────────┘
                 │ MCP Protocol (JSON-RPC)
                 ▼
┌─────────────────────────────────────────┐
│         RedCard MCP Server              │
│                                         │
│  1. 接收 render_markdown 调用           │
│  2. 启动静态服务器 (dist/)              │
│  3. 启动 Playwright 浏览器              │
│  4. 导航到 #/render 路由                │
│  5. 调用 window.__renderCard__(config)  │
│  6. 等待渲染完成                        │
│  7. 截图 .card 元素                     │
│  8. 返回 PNG Base64                     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Vue 3 Frontend                  │
│                                         │
│  - RenderView.vue (渲染视图)             │
│  - CardRenderer.vue (卡片组件)           │
│  - 8 种风格渲染器                        │
│  - Markdown 解析器                       │
└─────────────────────────────────────────┘
```

## 🔧 故障排除

### 问题 1：MCP Server 启动失败

**错误信息**：`构建产物不存在: /path/to/dist/index.html`

**解决方案**：
```bash
npm run build
```

### 问题 2：渲染超时

**可能原因**：
- 浏览器未正确安装
- 端口被占用
- 前端构建产物损坏

**解决方案**：
```bash
# 重新安装 Playwright 浏览器
npx playwright install chromium

# 清理并重新构建
rm -rf dist
npm run build
```

### 问题 3：风格参数错误

**错误信息**：`渲染失败 - 风格名称不在枚举中`

**解决方案**：
确保使用正确的风格名称（8 种之一）：
```
magazine, vibrant, dark, japanese, literary, minimal, white, purewhite
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

- 项目地址：https://github.com/redCardTemplate
- 问题反馈：提交 GitHub Issue
