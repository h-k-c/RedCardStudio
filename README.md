# RedCard Studio

将 Markdown 一键转换为小红书风格卡片，支持多种主题、自定义字体，导出高清 PNG。

## 功能

- **Markdown 编辑器** — 实时预览，所见即所得
- **8 种卡片风格**

  | 风格 | 特点 |
  |------|------|
  | 杂志经典 | 暖棕配色，适合教程 / 攻略 |
  | 活力元气 | 高饱和撞色，适合生活技巧 |
  | 暗黑高级 | 深色高级感，适合干货分享 |
  | 日系简约 | 低饱和留白，适合轻生活 |
  | 文艺清新 | 莫兰迪绿，适合文字类内容 |
  | 极简黑白 | 纯黑白，适合排版控 |
  | 奶白衬线 | 米白衬线字，适合故事 / 随笔 |
  | 纯奶牛白 | 纯净奶白，适合极简风 |

- **多页管理** — 支持添加 / 删除 / 切换页面，自动分页检测
- **字体 & 排版自定义** — 标题 / 正文字体、字号、字重独立调节
- **一键导出** — 导出当前页或全部页为高清 PNG
- **MCP Server** — 支持通过 Claude Code 等 AI 工具调用，批量渲染卡片

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## MCP Server 使用

项目内置 MCP Server，可在 Claude Code 中调用来批量生成卡片：

```bash
# 启动 MCP Server
npm run mcp
```

在 Claude Code 的 MCP 配置中添加：

```json
{
  "mcpServers": {
    "redcard": {
      "command": "npx",
      "args": ["tsx", "/path/to/redCardTemplate/mcp/server.ts"]
    }
  }
}
```

## Markdown 格式

卡片内容通过 Markdown 编写，推荐结构：

```markdown
# 卡片标题

> 副标题或引言

## 步骤一

步骤内容...

## 步骤二

步骤内容...
```

## 技术栈

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/) 状态管理
- [html2canvas](https://html2canvas.hertzen.com/) 图片导出
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) 工具集成

## License

MIT
