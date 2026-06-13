# OpenResume

纯前端、Markdown 驱动的在线简历编辑器（Vue3 + Vite）。左侧写 Markdown，右侧实时渲染简历，支持导入导出。

## 运行

```bash
npm install   # 安装依赖
npm run dev   # 启动开发服务器（默认 http://localhost:5173）
npm run build # 打包到 dist/
```

## 功能

- **实时预览（PDF 模式）**：左侧 CodeMirror 编辑器（Markdown 高亮 / 行号 / 自动换行）；右侧按 **A4 自动分页**，多页带页边距上下堆叠，所见即导出（渲染防抖，输入更流畅）。
- **本地草稿**：内容自动存入 `localStorage`，刷新不丢失。
- **保存**：`Ctrl/Cmd + S` 或工具栏「保存」立即落盘，右上角 Toast 轻提示。
- **样式设置**（工具栏「设置」→ 右侧面板）：
  - 证件照：本地上传后**直接在右侧预览自由拖动**到任意固定位置（绝对定位，不写进 Markdown、不受流式布局影响）；导出 PNG / PDF 会按当前位置一并贴上。可一键「重置位置」。
  - 字体：内置常用中文字体切换。
  - 行距：滑块调节（1.2 ~ 2.4）。
  - 自定义 CSS：直接写选择器即可，会自动限定在简历预览内，例如 `h2 { color:#c00 }`。
  - 以上设置同样持久化到 `localStorage`。
- **导入**：`.md` / `.json` 文件（JSON 取 `markdown` 字段）。
- **导出**：PDF、PNG、Markdown、JSON。
  - PDF / PNG 基于 `html2canvas` **逐页截图**：每页对应一张 A4，与预览分页一致；PNG 为多页纵向拼接。纯前端方案所见即所得，但文字为位图（不可选中）。
  - 证件照上传时按比例裁剪存储，导出不变形。

## 自定义 Markdown 语法

在标准 Markdown 之上扩展了简历排版语法：

| 语法 | 作用 |
|---|---|
| `# 姓名` | 简历标题（左对齐大字，放在 `:::left` 内） |
| `## 教育经历` | 区块标题（左侧色条 + 整行分隔线） |
| `icon:phone 手机号` | 行内图标，基于 lucide：常用名 `phone/email/blog/location/web/info...` 有别名，也可直接写任意 lucide 名（如 `icon:graduation-cap`）；`github/wechat` 为内置品牌图标 |
| `@r{2022.09 - 2026.06}` | 行内右对齐（条目日期、地点等） |
| `## 标题 {.center}`、`文字{style="color:red"}` | 给元素加 class / 样式（markdown-it-attrs）。内置工具类：`.center` `.right` `.muted` |
| `:::left … :::` | 左分栏（浮动靠左） |
| `:::right … :::` | 右分栏（浮动靠右） |

> 证件照不在 Markdown 里：在「设置」面板上传后，直接在右侧预览拖动到任意位置即可。

示例见首次打开时的默认简历。

## 目录结构

```
src/
  components/   Toolbar / EditorPane / PreviewPane / SettingsPanel / Toast
  composables/  useResume.js（草稿+设置状态/持久化/保存）、useToast.js（提示）、sample.js（示例简历）
  markdown/     index.js（markdown-it 装配）+ plugins/（icon 图标 / right 右对齐）
  utils/        exporters.js（逐页导出）/ importers.js（导入）/ paginate.js（A4 自动分页）
  styles/       main.css（全局）/ theme-default.css（简历主题，CSS 变量驱动）
```

## 主题扩展

主题样式集中在 `src/styles/theme-default.css`，颜色/间距已抽成 CSS 变量（`--rt-*`）。
新增主题时复制一份、改类名与变量，再在预览节点上切换类名即可。
