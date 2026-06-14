# OpenResume

纯前端、Markdown 驱动的在线简历编辑器（Vue3 + Vite）。左侧写 Markdown，右侧实时渲染成 A4 简历，所见即所得，支持多份简历、多套模板与多格式导入导出。**所有数据保存在浏览器本地，不上传服务器。**

## 运行

```bash
npm install   # 安装依赖
npm run dev   # 启动开发服务器（默认 http://localhost:5173）
npm run build # 打包到 dist/
npm run preview # 本地预览打包产物
```

## 功能一览

### 编辑与预览
- **实时预览（A4 分页）**：左侧 CodeMirror（Markdown 高亮 / 行号 / 自动换行），右侧按 A4 自动分页、多页堆叠，渲染防抖更流畅；底部状态栏显示**页数与字数**。
- **插入工具栏**：编辑器顶部一排按钮——加粗 / 标题 / 列表 / 链接 / 右对齐日期 / 技能标签 / 分页，以及「插入区块」（教育、工作、项目、技能、自我评价、分栏头部骨架）；「语法 ?」打开语法速查面板。
- **图标选择器**（工具栏「图标」）：可搜索的 Tabler 图标面板，点击在光标处插入 `icon:名称`。

### 多份简历
- 工具栏左侧「简历名 ▾」切换器：**切换 / 新建 / 复制 / 重命名 / 删除**多份简历；每份简历有**独立的内容与样式设置**，互不影响（至少保留一份）。

### 模板与样式（工具栏「设置」/「主题色」）
- **模板**：经典黑白 / 蓝色商务 / 紧凑（省空间），实时切换并重新分页。
- **主题色**：独立的取色面板（明度/饱和度 + 色相 + Hex + 预设色块），默认仅作用于区块标题，可开关「扩展到姓名/圆点/图标/链接」。
- **字体**：内置常用中文字体切换（含打包的苹方风格「思源黑体 / Noto Sans SC」）。
- **行距**、**页边距**（上下 / 左右分别可调）。
- **链接下划线** 开关。
- **自定义 CSS**：直接写选择器，自动限定在简历预览内（如 `h2 { color:#c00 }`）。

### 证件照
- 上传后弹出**裁剪窗口**（固定比例取景、拖动定位、高分辨率输出）。
- 形状/比例：**3:4 / 2:3 / 1:1 / 圆形**，可设**描边**（宽度 + 颜色）。
- 在右侧预览中**点击选中**后才能**拖动移动、拖四角等比缩放**（8 手柄）；导出时一并贴上、且不带选中框。

### 导入 / 导出
- **导入**：`.md` / `.json`（JSON 取 `markdown` 字段）。
- **导出**（工具栏「导出 ▾」，文件名自动用当前简历名）：
  - **PDF / PNG**：基于 `html2canvas` 逐页截图（每页一张 A4，与预览一致；位图、不可选中）。
  - **HTML**：自包含单文件，文字为真实 HTML（清晰、可选中、链接可点、体积小），可直接浏览器打开 / 发邮件。
  - **Markdown / JSON**：源文件备份。
- **手动分页**：用工具栏「分页」按钮插入分页标记，导出时从该处另起一页。

### 持久化
- 内容与设置自动存入 `localStorage`（防抖保存），刷新不丢失；`Ctrl/Cmd + S` 或「保存」立即落盘。

## 自定义 Markdown 语法

在标准 Markdown 之上扩展了简历排版语法（编辑器「语法 ?」面板内也有速查）：

| 语法 | 作用 |
|---|---|
| `# 姓名` / `## 区块标题` / `### 小标题` | 标题层级（区块标题带底部分隔线，随主题色） |
| `**重点**` | 加粗（公司 / 学校 / 项目名） |
| `` `Spring Boot` `` | 反引号 → 技能胶囊标签 |
| `[文字](网址)` | 链接（纯网址 / 邮箱也会自动识别） |
| `icon:phone` / `icon:brand-github` | 行内图标（Tabler）；`phone/email/github/location…` 有别名，也可直接写任意 Tabler 名 |
| `@r{2022.09 - 2026.06}` | 行内右对齐（条目日期、地点等） |
| `## 标题 {.center}`、`文字{style="color:red"}` | 给元素加 class / 样式；内置工具类 `.center` `.right` `.muted` |
| `:::left … :::` / `:::right … :::` | 左右分栏（常用于「左姓名+联系方式 / 右照片」头部） |
| `<div class="page-break"></div>` | 强制分页（建议用工具栏「分页」按钮插入） |

> 证件照不在 Markdown 里：在「设置」上传后，于右侧预览点击选中再拖动 / 缩放。

## 目录结构

```
public/         favicon 与 logo（静态资源）
src/
  components/   Toolbar（工具栏）/ ResumeSwitcher（多简历切换）
                EditorPane + EditorToolbar + SyntaxHelp（编辑器与插入/语法）
                PreviewPane（A4 预览/分页/证件照交互）
                SettingsPanel（样式设置）/ ThemeColorPicker（取色面板）
                IconPicker（图标选择）/ AvatarCropper（证件照裁剪）/ Toast
  composables/  useResume.js（多份简历/内容/设置/持久化）、useToast.js、sample.js
  markdown/     index.js（markdown-it 装配）+ plugins/（icon 图标 / right 右对齐）
  utils/        exporters.js（PDF/PNG 截图导出）/ exportHtml.js（HTML 导出）
                importers.js（导入）/ paginate.js（A4 自动分页）/ avatar.js（证件照形状预设）
  styles/       main.css（全局）/ theme-default.css（简历主题 + 模板修饰类，CSS 变量驱动）
```

## 技术栈

Vue 3 + Vite；markdown-it（+ attrs / container 插件）；CodeMirror 6；html2canvas + jsPDF（截图导出）；Tabler Icons（图标）；@ckpack/vue-color（取色面板）；@fontsource/noto-sans-sc（内置中文字体）。

## 主题扩展

主题样式集中在 `src/styles/theme-default.css`，颜色/间距抽成 CSS 变量（`--rt-*`）。新增模板时无需复制整套：在基础类 `.resume-theme-default` 之上加一个修饰类（如 `.resume-theme-default.tpl-xxx`）仅覆盖变量与少量规则，再到「设置 → 模板」里注册即可（参见现有 `tpl-blue` / `tpl-compact`）。
