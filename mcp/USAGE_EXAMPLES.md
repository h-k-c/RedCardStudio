# RedCard MCP 使用示例

## 示例 1：技术教程卡片

**用户输入：**
```
帮我生成一张技术教程卡片，内容是关于如何学习 React：

# 学习 React 的 5 个步骤

## 1. 理解组件思维
React 的核心是组件化。把 UI 拆分为独立、可复用的组件，每个组件管理自己的状态。

## 2. 掌握 JSX
JSX 是 JavaScript 的语法扩展，让你在 JS 中写 HTML 看起来的代码。
- 使用 `{}` 插入变量
- 条件渲染用 `&&` 或三元运算符
- 列表渲染用 `.map()`

## 3. 学习 Hooks
- `useState` - 管理组件状态
- `useEffect` - 处理副作用
- `useContext` - 跨组件共享数据
- `useRef` - 引用 DOM 元素

> 💡 提示：先用好 useState 和 useEffect，再学其他 Hook

## 4. 状态管理
- 小型应用：Props + useState
- 中型应用：Context API + useReducer
- 大型应用：Zustand / Redux / Jotai

## 5. 实战项目
理论结合实践，从零构建一个完整应用：
1. Todo List（入门）
2. 博客系统（进阶）
3. 电商前台（实战）

> 🎯 目标：2 周内完成第一个项目

#React #前端 #教程
```

**参数设置：**
```json
{
  "style": "magazine",
  "author": "前端大师",
  "headerText": "React Learning Path",
  "footerSlogan": "Build once, use everywhere.",
  "fontScale": 100
}
```

---

## 示例 2：生活技巧卡片

**用户输入：**
```
生成一张活力风格的生活技巧卡片：

# 10 个提升幸福感的小习惯

> 幸福不是目标，而是路上的风景

## 🌅 晨间仪式
- 起床后喝一杯温水
- 5 分钟冥想，清空思绪
- 写下 3 件感恩的事

## 💪 日间充能
- 每工作 90 分钟，起身活动 5 分钟
- 午餐后散步 10 分钟
- 深呼吸 3 次，缓解压力

## 🌙 夜间放松
- 睡前 1 小时放下手机
- 阅读纸质书 20 分钟
- 泡脚或泡个热水澡

## ✨ 心态调整
- 接受不完美，专注进步
- 每天对自己说"你做得很好"
- 学会拒绝，保护能量

> 💖 记住：照顾自己不是奢侈，而是必需
```

**参数设置：**
```json
{
  "style": "vibrant",
  "author": "生活家",
  "fontScale": 105
}
```

---

## 示例 3：暗黑风格的技术深度文章

**用户输入：**
```
用暗黑风格渲染这篇技术深度内容：

# 深入理解 TypeScript 泛型

## 为什么需要泛型？

泛型让你能够编写"通用"的代码，同时保持类型安全。

```typescript
// ❌ 不好：失去类型信息
function identity(value: any): any {
  return value
}

// ✅ 好：保留类型信息
function identity<T>(value: T): T {
  return value
}
```

## 泛型约束

使用 `extends` 关键字限制泛型类型：

```typescript
interface HasLength {
  length: number
}

function logLength<T extends HasLength>(value: T): T {
  console.log(value.length)
  return value
}

logLength("hello") // ✅ 5
logLength([1, 2, 3]) // ✅ 3
logLength(42) // ❌ 编译错误
```

## 实用类型模式

### 1. 条件类型
```typescript
type IsString<T> = T extends string ? true : false
```

### 2. 映射类型
```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
```

### 3. 模板字面量类型
```typescript
type EventName<T extends string> = `on${Capitalize<T>}`
type ClickEvent = EventName<"click"> // "onClick"
```

> 🎯 掌握泛型，你的 TypeScript 水平将提升一个台阶
```

**参数设置：**
```json
{
  "style": "dark",
  "author": "TypeScript 专家",
  "headerText": "Advanced TypeScript",
  "footerSlogan": "Type safe, life safe.",
  "fontScale": 95,
  "titleFont": "Courier New, monospace",
  "bodyFont": "system-ui, sans-serif"
}
```

---

## 示例 4：日系简约风格的诗词卡片

**用户输入：**
```
用日系简约风格渲染一首诗：

# 俳句三首

> 松尾芭蕉

## 古池塘

古池塘啊  
青蛙跳入  
水的声音

---

## 夏草

夏草啊  
将士们  
做梦的痕迹

---

## 秋风

秋风啊  
和落叶一起  
飞舞吧
```

**参数设置：**
```json
{
  "style": "japanese",
  "author": "松尾芭蕉",
  "fontScale": 115,
  "titleFont": "STKaiti, Kaiti SC, serif",
  "bodyFont": "STSong, SimSun, serif"
}
```

---

## 示例 5：多页内容分页渲染

**用户输入：**
```
我有一份很长的内容，帮我分别渲染成多张卡片：

# JavaScript 完整指南（上）

## 基础概念
JavaScript 是一门动态类型的解释型语言...

## 变量声明
- var：函数作用域
- let：块级作用域
- const：常量声明

## 数据类型
1. 原始类型
   - string
   - number
   - boolean
   - null
   - undefined
   - symbol
   - bigint

2. 引用类型
   - Object
   - Array
   - Function

===

# JavaScript 完整指南（下）

## 异步编程
JavaScript 的异步模型经历了三个发展阶段...

## Promise
```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve("完成!"), 1000)
})

promise.then(result => console.log(result))
```

## async/await
现代 JavaScript 推荐使用 async/await 语法...
```

**第一次渲染（第一页）：**
```json
{
  "markdown": "...上面完整的内容...",
  "style": "magazine",
  "author": "JS 大师",
  "pageIndex": 0,
  "headerText": "JavaScript Guide Part 1"
}
```

**第二次渲染（第二页）：**
```json
{
  "markdown": "...上面完整的内容...",
  "style": "magazine",
  "author": "JS 大师",
  "pageIndex": 1,
  "headerText": "JavaScript Guide Part 2"
}
```

---

## 示例 6：极简风格的引用卡片

**用户输入：**
```
用极简风格生成一张名人名言卡片：

# 乔布斯的 5 句经典名言

> 你的时间有限，不要浪费在重复别人的生活上。

## 1. 关于创新
"创新区分了领导者和追随者。"

## 2. 关于设计
"设计不仅仅是外观和感觉，设计是关于它如何工作。"

## 3. 关于时间
"记住你即将死去，这是我知道的避免陷入恐惧的最重要工具。"

## 4. 关于专注
"专注就是说要对一百个好主意说不。"

## 5. 关于人生
"你的工作将占据生活的大部分，唯一真正满意的方法就是做你认为是伟大的工作。"

> Stay Hungry, Stay Foolish.
```

**参数设置：**
```json
{
  "style": "minimal",
  "author": "Steve Jobs",
  "fontScale": 110,
  "footerSlogan": "Stay Hungry, Stay Foolish."
}
```

---

## 💡 使用技巧

### 1. 内容长度控制
- **单页最佳**：500-800 字的 Markdown 内容
- **自动分页**：超过 1000 字建议用 `===` 分隔（独占一行）
- **标题层级**：使用 `##` 作为主要分段，视觉效果最佳

### 2. 风格选择建议
| 内容类型 | 推荐风格 | 说明 |
|---------|---------|------|
| 技术教程 | magazine, dark | 专业、清晰 |
| 生活技巧 | vibrant, japanese | 轻松、舒适 |
| 名人名言 | minimal, literary | 简洁、文艺 |
| 散文随笔 | white, purewhite | 纯净、优雅 |
| 付费内容 | dark | 高级感 |

### 3. 字体搭配
```json
// 技术类
{
  "titleFont": "Courier New, monospace",
  "bodyFont": "system-ui, -apple-system, sans-serif"
}

// 文艺类
{
  "titleFont": "Georgia, 'Times New Roman', serif",
  "bodyFont": "Palatino, 'Palatino Linotype', serif"
}

// 中文类
{
  "titleFont": "PingFang SC, Microsoft YaHei, sans-serif",
  "bodyFont": "PingFang SC, Source Han Sans SC, sans-serif"
}
```

### 4. 批量生成
如果你有大量内容需要渲染，可以：
1. 先将内容分成多个 Markdown 文件
2. 编写脚本循环调用 MCP 工具
3. 自动生成全套卡片

---

## 🎨 风格对比

| 风格 | 主色调 | 适合场景 | 视觉特点 |
|-----|-------|---------|---------|
| magazine | 金色+白色 | 教程、指南 | 经典优雅 |
| vibrant | 红色+白色 | 生活技巧 | 活力满满 |
| dark | 黑色+灰色 | 技术深度 | 高级质感 |
| japanese | 米色+灰色 | 极简生活 | 侘寂美学 |
| literary | 绿色+米色 | 文艺随笔 | 清新自然 |
| minimal | 黑色+白色 | 名人名言 | 极致简洁 |
| white | 奶白+棕色 | 散文故事 | 温暖衬线 |
| purewhite | 纯白+浅灰 | 纯净内容 | 极简纯粹 |
