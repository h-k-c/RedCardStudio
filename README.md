# RedCard Studio

将 Markdown 一键转换为小红书风格卡片，支持 8 种主题、自定义字体，导出高清 PNG。内置 MCP Server，可在 Claude Desktop / Claude Code 等 AI 工具中直接调用。

## 预览

| 文艺清新 | 纯奶牛白 | 极简黑白 |
|---------|---------|---------|
| ![文艺清新](image/Snipaste_2026-05-12_16-46-23.png) | ![纯奶牛白](image/Snipaste_2026-05-12_16-46-38.png) | ![极简黑白](image/Snipaste_2026-05-12_16-46-48.png) |

## 功能

- **Markdown 编辑器** — 实时预览，所见即所得，支持多页管理
- **8 种卡片风格**

  | 风格 key | 名称 | 适合内容 |
  |---------|------|---------|
  | `magazine` | 杂志经典 | 教程 / 攻略 |
  | `vibrant` | 活力元气 | 生活技巧 |
  | `dark` | 暗黑高级 | 技术干货 / 付费内容 |
  | `japanese` | 日系简约 | 极简生活 |
  | `literary` | 文艺清新 | 故事 / 随笔 |
  | `minimal` | 极简黑白 | 名人名言 |
  | `white` | 奶白衬线 | 散文 / 故事 |
  | `purewhite` | 纯奶牛白 | 极简纯净 |

- **字体 & 排版** — 标题 / 正文字体、字号、字重独立调节
- **一键导出** — 导出当前页或全部页为 1080×1440 高清 PNG
- **MCP Server** — 让 AI 直接调用，批量生成卡片

## 快速开始

```bash
git clone https://github.com/h-k-c/RedCardStudio.git
cd RedCardStudio
npm install
npm run dev
```

浏览器打开 `http://localhost:5173` 即可使用。

## MCP Server

### 前置步骤

```bash
# 构建前端（MCP Server 依赖 dist/ 目录）
npm run build
```

### 配置到 Claude Desktop

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "redcard": {
      "command": "npx",
      "args": ["tsx", "/path/to/RedCardStudio/mcp/server.ts"],
      "cwd": "/path/to/RedCardStudio"
    }
  }
}
```

> 配置示例见 [mcp/claude_desktop_config.example.json](mcp/claude_desktop_config.example.json)

### 使用方式

配置完成后，在 AI 对话中直接说：

```
帮我把下面内容渲染成 dark 风格的卡片，作者写「开发者」：

# 学习 TypeScript 的 3 个阶段

## 第一阶段：基础类型
掌握 string、number、interface、泛型

## 第二阶段：工程实践
配置 tsconfig，理解模块系统

## 第三阶段：类型体操
条件类型、映射类型、infer
```

### 工具参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `markdown` | string | ✅ | Markdown 内容 |
| `style` | string | — | 8 种风格之一，默认 `magazine` |
| `author` | string | — | 作者名，显示在页眉 |
| `fontScale` | number | — | 字体缩放 50–300，默认 100 |
| `titleFont` | string | — | 标题字体 CSS 值 |
| `bodyFont` | string | — | 正文字体 CSS 值 |
| `headerText` | string | — | 自定义页眉文字 |
| `footerSlogan` | string | — | 页脚标语 |
| `pageIndex` | number | — | 多页时指定渲染第几页（从 0 开始） |

多页内容用 `---` 分隔，配合 `pageIndex` 逐页渲染。

详细示例见 [mcp/README.md](mcp/README.md) 和 [mcp/USAGE_EXAMPLES.md](mcp/USAGE_EXAMPLES.md)。

### 本地测试

```bash
npx tsx mcp/test-render.ts
# 输出：mcp/test-output.png
```

## 技术栈

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/) 状态管理
- [html2canvas](https://html2canvas.hertzen.com/) 图片导出
- [Playwright](https://playwright.dev/) MCP Server 截图渲染
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) AI 工具集成

## License

MIT
