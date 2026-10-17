# verification — archive

> 本文件是该主题**当前**的验证状态；重复验证时更新本文件，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill；本套属「八方向拟物主题」批次（父任务 `10-17-skeuo-theme-queue`），2026-10-17 由编排方统一验证。

## 设计摘要

- **隐喻**：图书馆卡片目录：一只拉开的胡桃木抽屉，7 张马尼拉索引卡（卡头 + 六个分区）叠放，类目签凸出，红章「已归档」。
- **字体**：Sorts Mill Goudy（卡头/合计）· Courier Prime（打字条目）· Zhuque Fangsong（中文）
- **页面**：`/zh-cn/archive/`、`/ja/archive/`、`/en/archive/`

## 构建与产物

- `npm run build` 绿：**73 页**（3 语言 × 16 设计 + 基础设施页）；`astro check` **0 错误 / 0 警告 / 0 提示**（56 文件）。
- 本套三语言页面均已生成：`dist/{zh-cn,ja,en}/archive/index.html`。
- CSS 隔离：本页仅链接自身 1 条 CSS；该文件不被其他设计页引用（7 套批量核对通过）。
- 字体经 local provider 进入产物；构建期零网络；`dist` 无 ttf/otf/ttc、无 `.local-fonts` / `F:\Fonts` 路径泄漏、无第三方域名请求。
- 本套实测加载字体（逐字体 document.fonts.check() 判定，滚动后）：Sorts Mill Goudy、Courier Prime、Zhuque Fangsong。

## 探针（CDP，2026-10-17）

| 口径 | 桌面 1440 | 移动 375 | 日文 1440 |
|---|---|---|---|
| console 错误/警告 | 0 | 0 | 0 |
| 外部请求 | 0 | 0 | 0 |
| 横向溢出 | 无 | 无 | 无 |
| h1 / h2 | 1 / 7 | 1 / 7 | 1 / 7 |
| 视口内隐藏（加载时） | 0 | 0 | 0 |
| 视口内隐藏（滚底后） | 0 | 0 | 0 |
| 共享 Reveal 门控 | ready（8 个目标） | ready | ready |

- 图片 0、空可访问名链接 0；分区均有 `aria-labelledby`。
- 截图：`.local-fonts/dev/preview/skeuo/archive-desktop.png`（1440 全页）、`archive-mobile.png`（375×2x）。

## 检测器

- `impeccable detect --json src/designs/archive` → **0 条**（DESIGN.md 已登记 CSS 字面量）。

## 设计要点与已知偏差

- 卡片叠放 + 类目签 h2；页脚为抽屉前沿著录签（可见 h2「著录」）。
- 动效：卡片 60ms 步进升起 + 图章落下；reduced-motion 全静态。
- `design.json` 无 id 字段（registry 由目录名派生，schema 为 strict）；类目签小号大写词归 Courier 声部。

## 待用户实机复核

- 用户将在本机对每套主题做视觉复核与逐项调整（版式微调、文案、动效手感）；调整按新任务处理。
