# RedCard MCP 快速参考

## 🚀 一行命令启动

```bash
# 配置到 Claude Desktop
# 编辑: ~/Library/Application Support/Claude/claude_desktop_config.json

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

## 📋 可用工具

### render_markdown
将 Markdown 渲染为 PNG 卡片

**必需参数：**
- `markdown` (string): Markdown 内容

**可选参数：**
- `style` (string): 8 种风格之一（默认 magazine）
- `author` (string): 作者名称
- `fontScale` (number): 50-300（默认 100）
- `titleFont` (string): 标题字体
- `bodyFont` (string): 正文字体
- `headerText` (string): 页眉文字
- `footerSlogan` (string): 页脚标语
- `pageIndex` (number): 第几页（从 0 开始）

## 🎨 8 种风格速查

| 风格名 | 中文名 | 适合内容 |
|-------|-------|---------|
| `magazine` | 杂志经典 | 教程、指南 |
| `vibrant` | 活力元气 | 生活技巧 |
| `dark` | 暗黑高级 | 技术文章 |
| `japanese` | 日系简约 | 极简生活 |
| `literary` | 文艺清新 | 随笔故事 |
| `minimal` | 极简黑白 | 名人名言 |
| `white` | 奶白衬线 | 散文 |
| `purewhite` | 纯奶牛白 | 纯净内容 |

## 💬 对话示例

### 基础用法
```
用户：帮我渲染这张卡片
## 第一步
安装 Node.js

## 第二步
npm install

风格用 dark，作者写"开发者"
```

### 多页内容
```
用户：我有长内容，帮我渲染第一页
[Markdown 内容用 --- 分隔]
pageIndex: 0
```

### 自定义字体
```
用户：渲染一首诗
titleFont: "STKaiti, serif"
bodyFont: "STSong, serif"
fontScale: 120
```

## ⚠️ 常见问题

**Q: MCP Server 启动失败？**
```bash
npm run build  # 先构建前端
```

**Q: 渲染超时？**
```bash
npx playwright install chromium  # 安装浏览器
```

**Q: 风格不存在？**
使用 8 种有效风格之一，不要用 tech/terminal/purple/timeline

## 📦 项目结构

```
mcp/
├── server.ts              # MCP 服务器主文件
├── test-render.ts         # 测试脚本
├── demo-render.ts         # 演示脚本
├── tsconfig.json          # TypeScript 配置
├── README.md              # 完整文档
├── USAGE_EXAMPLES.md      # 使用示例
├── QUICK_REFERENCE.md     # 快速参考（本文件）
└── claude_desktop_config.example.json  # 配置示例
```

## 🔗 相关链接

- [完整文档](./README.md)
- [使用示例](./USAGE_EXAMPLES.md)
- [项目根目录](../README.md)
