# verification — tape

> 本文件是该主题**当前**的验证状态；重复验证时更新本文件，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill；本套属「八方向拟物主题」批次（父任务 `10-17-skeuo-theme-queue`），2026-10-17 由编排方统一验证。

## 设计摘要

- **隐喻**：磁带与 J 卡：左侧 CSS 磁带壳（卷轴窗/螺钉/贴标），右侧 J 卡（手写姓名 + A1–A6 曲目单 + C-60 标记）。
- **字体**：UglyTypist（手写标题/贴标）· League Mono（正文/编号）· Zhuque Fangsong（中文）
- **页面**：`/zh-cn/tape/`、`/ja/tape/`、`/en/tape/`

## 构建与产物

- `npm run build` 绿：**73 页**（3 语言 × 16 设计 + 基础设施页）；`astro check` **0 错误 / 0 警告 / 0 提示**（56 文件）。
- 本套三语言页面均已生成：`dist/{zh-cn,ja,en}/tape/index.html`。
- CSS 隔离：本页仅链接自身 1 条 CSS；该文件不被其他设计页引用（7 套批量核对通过）。
- 字体经 local provider 进入产物；构建期零网络；`dist` 无 ttf/otf/ttc、无 `.local-fonts` / `F:\Fonts` 路径泄漏、无第三方域名请求。
- 本套实测加载字体（逐字体 document.fonts.check() 判定，滚动后）：UglyTypist、League Mono、Zhuque Fangsong。

## 探针（CDP，2026-10-17）

| 口径 | 桌面 1440 | 移动 375 | 日文 1440 |
|---|---|---|---|
| console 错误/警告 | 0 | 0 | 0 |
| 外部请求 | 0 | 0 | 0 |
| 横向溢出 | 无 | 无 | 无 |
| h1 / h2 | 1 / 6 | 1 / 6 | 1 / 6 |
| 视口内隐藏（加载时） | 0 | 0 | 0 |
| 视口内隐藏（滚底后） | 0 | 0 | 0 |
| 共享 Reveal 门控 | ready（7 个目标） | ready | ready |

- 图片 0、空可访问名链接 0；分区均有 `aria-labelledby`。
- 截图：`.local-fonts/dev/preview/skeuo/tape-desktop.png`（1440 全页）、`tape-mobile.png`（375×2x）。

## 检测器

- `impeccable detect --json src/designs/tape` → **0 条**（DESIGN.md 已登记 CSS 字面量）。

## 切换页预览碎片（`Preview.astro`，2026-10-19）

- **视觉签名**：磁带壳、J 卡、双卷轴窗、四角螺钉、手写贴标与曲目栏；预览保留磁带与卡纸的双物件结构，不是通用卡片。
- **令牌抽取**：壳体、窗口、标签、纸、墨、橙与阴影参数抽入 `tokens.css`，作用域 `:is(.tp, .tp-pv)`；正式页只改声明位置。
- **字体**：导出 UglyTypist / League Mono / Zhuque Fangsong 三个变量，切换页按族去重。
- **隔离与等价**：预览不 import 正式页 `style.css`，无 `:root`、无可聚焦元素；正式页产物与 HEAD 基线 sha256 相等。
- **检测器**：预览缩略字号与圆角已登记进 `DESIGN.md` 的 `preview-*` 档位，目录扫描零发现。

## 设计要点与已知偏差

- 正文零 UglyTypist；曲目编号与计数走 tabular-nums；合计 = links.length。
- 卷轴仅 hover/focus-within 时 60s 旋转；reduced-motion 静止。
- 动效：磁带落桌 + 标签展开（一次性）。

## 待用户实机复核

- 用户将在本机对每套主题做视觉复核与逐项调整（版式微调、文案、动效手感）；调整按新任务处理。
