# verification — lexicon

> **2026-11-01 韩语覆盖（C3）**：新增 `/ko/lexicon/` 与韩语文案；375×812 / 1280×800 冒烟通过（`lang=ko`、韩语字体加载、无横向溢出、0 console）；文案 AI 起草，待人工审校。

> 本文件是该主题**当前**的验证状态；重复验证时更新本文件，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill；本套属「八方向拟物主题」批次（父任务 `10-17-skeuo-theme-queue`），2026-10-17 由编排方统一验证。

## 设计摘要

- **隐喻**：三语辞典跨页：书眉（词条范围）、≥900px 双栏（column-rule）、词条头（中文 + 拉丁小大写 + 词性）、参照项、页边索引签。
- **字体**：Zhuque Fangsong（中文/正文）· Sorts Mill Goudy（拉丁/展示/斜体）
- **页面**：`/zh-cn/lexicon/`、`/ja/lexicon/`、`/en/lexicon/`

## 构建与产物

- `npm run build` 绿：**73 页**（3 语言 × 16 设计 + 基础设施页）；`astro check` **0 错误 / 0 警告 / 0 提示**（56 文件）。
- 本套三语言页面均已生成：`dist/{zh-cn,ja,en}/lexicon/index.html`。
- CSS 隔离：本页仅链接自身 1 条 CSS；该文件不被其他设计页引用（7 套批量核对通过）。
- 字体经 local provider 进入产物；构建期零网络；`dist` 无 ttf/otf/ttc、无 `.local-fonts` / `F:\Fonts` 路径泄漏、无第三方域名请求。
- 本套实测加载字体（逐字体 document.fonts.check() 判定，滚动后）：Zhuque Fangsong、Sorts Mill Goudy。

## 探针（CDP，2026-10-17）

| 口径 | 桌面 1440 | 移动 375 | 日文 1440 |
|---|---|---|---|
| console 错误/警告 | 0 | 0 | 0 |
| 外部请求 | 0 | 0 | 0 |
| 横向溢出 | 无 | 无 | 无 |
| h1 / h2 | 1 / 6 | 1 / 6 | 1 / 6 |
| 视口内隐藏（加载时） | 0 | 0 | 0 |
| 视口内隐藏（滚底后） | 0 | 0 | 0 |
| 共享 Reveal 门控 | ready（6 个目标） | ready | ready |

- 图片 0、空可访问名链接 0；分区均有 `aria-labelledby`。
- 截图：`.local-fonts/dev/preview/skeuo/lexicon-desktop.png`（1440 全页）、`lexicon-mobile.png`（375×2x）。

## 检测器

- `impeccable detect --json src/designs/lexicon` → **0 条**（DESIGN.md 已登记 CSS 字面量）。

## 切换页预览碎片（`Preview.astro`，2026-10-19）

- **视觉签名**：辞书书眉、双栏词条、页边索引签与牛血红词头；预览保留跨页辞典结构，不是通用卡片。
- **令牌抽取**：纸、墨、灰、线与牛血红抽入 `tokens.css`，作用域 `:is(.lx, .lx-pv)`；正式页只改声明位置。
- **字体**：导出 Sorts Mill Goudy / Zhuque Fangsong，切换页按族去重；CJK 子集按需下载，不 preload。
- **隔离与等价**：预览不 import 正式页 `style.css`，无 `:root`、无可聚焦元素；正式页产物与 HEAD 基线 sha256 相等。
- **检测器**：预览缩略字号已登记进 `DESIGN.md` 的 `preview-*` 档位，目录扫描零发现。

## 设计要点与已知偏差

- 书眉是 header（唯一 h1）；六个词条各一枚具名 h2；索引签为装饰（aria-hidden）。
- 动效：词条细规线 scaleX 生长（一次性）；reduced-motion 全静态。
- 正文 0.9375–1rem / 行高 1.85；无卡片、无背景噪声。

## 待用户实机复核

- 用户将在本机对每套主题做视觉复核与逐项调整（版式微调、文案、动效手感）；调整按新任务处理。
