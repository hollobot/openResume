# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.



## 约束

用于减少常见 LLM 编码错误的行为准则。可按需与项目专用说明合并使用。

**权衡：** 这些准则更偏向谨慎而非速度。对于很简单的任务，可以自行判断。

### 0. 默认沟通与项目工作流

- 除非用户明确要求使用其他语言，否则对话使用中文。
- 进行开发项目时，除非用户明确要求，或当前说明明确要求，否则不要执行测试、构建或编译命令。
- 只格式化自己改动过的部分。除非用户明确要求，否则不要对未触碰的文件或整个项目运行大范围格式化工具。

### 1. 编码前先思考

**不要假设。不要掩盖困惑。主动说明取舍。**

实现之前：

- 明确说明你的假设。如果不确定，就询问。
- 如果存在多种理解，说明它们，不要默默选择其中一种。
- 如果有更简单的做法，要说出来。必要时提出反对意见。
- 如果有不清楚的地方，停下来。说明哪里不清楚，并提问。

### 2. 简单优先

**用能解决问题的最少代码。不要做推测性扩展。**

- 不添加用户没有要求的功能。
- 不为一次性代码创建抽象。
- 不添加未被要求的“灵活性”或“可配置性”。
- 不为不可能发生的场景添加错误处理。
- 如果你写了 200 行，而其实 50 行就能完成，就重写得更简单。

问问自己：“一位资深工程师会不会认为这过度复杂？”如果答案是会，就简化。

### 3. 精准修改

**只改必须改的地方。只清理自己造成的问题。**

编辑现有代码时：

- 不要“顺手改进”相邻代码、注释或格式。
- 不要重构没有坏掉的东西。
- 匹配现有风格，即使你个人会用不同写法。
- 如果发现无关的废弃代码，提出来，不要直接删除。

当你的改动产生孤立内容时：

- 移除由你的改动造成的未使用 import、变量或函数。
- 除非用户要求，否则不要移除原本就存在的废弃代码。

检验标准：每一行改动都应该能直接追溯到用户的请求。

### 4. 目标驱动执行

**定义成功标准，并用最轻量的合适方式验证。**

把任务转化为可验证的目标，但不要默认需要测试或构建：

- “添加校验” -> “明确无效输入，并更新校验逻辑”
- “修复 bug” -> “复现或推理出失败原因，然后修复根因”
- “重构 X” -> “在只改变被要求结构的同时保持行为不变”

对于多步骤任务，给出简短计划：

```text
1. [步骤] -> 验证：[检查方式]
2. [步骤] -> 验证：[检查方式]
3. [步骤] -> 验证：[检查方式]
```

清晰的成功标准能让你独立推进。模糊标准，比如“让它能用”，需要持续澄清。

---

**这些准则生效的表现是：** diff 中不必要的改动更少，因为过度复杂导致的返工更少，并且澄清问题发生在实现之前，而不是犯错之后。



## 开发命令

```bash
npm run dev      # 启动开发服务器（http://localhost:5173）
npm run build    # 构建生产包（输出到 dist/）
npm run preview  # 预览生产构建
```

无测试框架，无 lint 配置。

## 项目架构

在线简历编辑器，纯前端静态应用。双栏布局：左侧 CodeMirror 编辑器，右侧实时渲染预览。

### 数据流

```
用户输入 (CodeMirror)
  → markdownContent (App.vue ref)
  → parseResume() (useResumeParser.js)
      ├─ parseFrontmatter()  → meta 对象（个人信息、主题色）
      ├─ renderHeader(meta)  → 头部 HTML
      └─ renderBody(markdown) → 正文 HTML（marked.js 自定义渲染器）
  → ResumePreview.vue (v-html 渲染)
```

内容通过 `localStorage` 自动保存（800ms 防抖）。

### 核心模块

**`src/composables/useResumeParser.js`** — Markdown 解析核心
- `parseFrontmatter(raw)`: 提取 YAML frontmatter，降级容错
- `renderBody(markdown)`: 自定义 marked.js Renderer，`inline code` → `.skill-tag`，`##` → `.resume-section-title`，`###` → `.resume-entry-title`
- `renderHeader(meta)`: 将 frontmatter meta 渲染为简历头部 HTML
- `parseResume(raw)`: 对外统一入口，返回 `{ header, body, meta }`

**`src/composables/useExport.js`** — 导出功能
- `exportMarkdown()`: Blob 下载
- `exportPDF()`: `window.print()` + Print CSS，高质量
- `exportJPG(el)`: html2canvas 2x 截图，需要传入 `.resume-page` DOM 元素

**`src/styles/resume.css`** — 简历渲染样式（唯一模板）
- 使用 CSS 变量 `--accent-color` 驱动主题色，由 frontmatter `color` 字段注入
- A4 尺寸（`210mm × 297mm`）
- 包含 `@media print` 规则：打印时隐藏其他元素，只显示 `.resume-print-area`

### Markdown 语法约定

```markdown
---
name: 姓名
title: 职位
email: xxx@email.com
phone: 138-0000-0000
location: 城市
github: github.com/xxx
website: xxx.dev
photo: URL或base64
color: "#4a90d9"   # 主题色
---

## 区块标题        # → 带左侧色条的 section 标题
### 条目标题       # → 加粗条目标题（公司/学校名）
*斜体文本*         # → 灰色辅助信息（时间、地点）
`技能名称`         # → 彩色技能标签（inline code）
**粗体**           # → 强调文字
- 列表项           # → 工作职责等
```

### 技术栈

- **Vue 3** + Vite 8（`<script setup>` 语法）
- **CodeMirror 6**：编辑器（`@codemirror/view`, `state`, `lang-markdown`, `theme-one-dark`）
- **marked.js**：Markdown 渲染（自定义 Renderer）
- **js-yaml**：frontmatter 解析
- **html2canvas**：JPG 导出
- **Tailwind CSS v4**（`@tailwindcss/vite` 插件方式接入）

### 注意事项

- `ResumePreview.vue` 通过 `defineExpose({ pageRef })` 暴露 DOM 给父组件，JPG 导出依赖这个引用
- 拖动分隔条宽度限制在 `20%–75%` 之间（`App.vue` 中 `splitPercent`）
- `marked.setOptions({ renderer })` 是全局调用，多次调用会覆盖，当前无并发问题
- 打印 CSS 依赖 `.resume-print-area` 类名定位打印区域，重命名时需同步修改 `resume.css`
