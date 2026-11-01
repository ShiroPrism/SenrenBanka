# verification — pager

> **2026-11-01 韩语覆盖（C3）**：新增 `/ko/pager/` 与韩语文案；375×812 / 1280×800 冒烟通过（`lang=ko`、韩语字体加载、无横向溢出、0 console）；文案已人工审校（用户确认 2026-11-01）。

> 本文件是该主题**当前**的验证状态；重复验证时更新本文件，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill；本套属「八方向拟物主题」批次（父任务 `10-17-skeuo-theme-queue`），2026-10-17 由编排方统一验证。

## 设计摘要

- **隐喻**：寻呼机：深灰机壳、橄榄绿单色 LCD、状态栏（信号/电池/MSG=links.length）、消息列表、按键行。
- **字体**：Silkscreen（标签）· Handjet（可变像素，编号/大数字）· Ark Pixel（中文）
- **页面**：`/zh-cn/pager/`、`/ja/pager/`、`/en/pager/`

## 构建与产物

- `npm run build` 绿：**73 页**（3 语言 × 16 设计 + 基础设施页）；`astro check` **0 错误 / 0 警告 / 0 提示**（56 文件）。
- 本套三语言页面均已生成：`dist/{zh-cn,ja,en}/pager/index.html`。
- CSS 隔离：本页仅链接自身 1 条 CSS；该文件不被其他设计页引用（7 套批量核对通过）。
- 字体经 local provider 进入产物；构建期零网络；`dist` 无 ttf/otf/ttc、无 `.local-fonts` / `F:\Fonts` 路径泄漏、无第三方域名请求。
- 本套实测加载字体（逐字体 document.fonts.check() 判定，滚动后）：Silkscreen、Handjet Variable、Ark Pixel 12px。

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
- 截图：`.local-fonts/dev/preview/skeuo/pager-desktop.png`（1440 全页）、`pager-mobile.png`（375×2x）。

## 检测器

- `impeccable detect --json src/designs/pager` → **0 条**（DESIGN.md 已登记 CSS 字面量）。

## 切换页预览碎片（`Preview.astro`，2026-10-19）

- **视觉签名**：塑料机身、单色 LCD、信号 / 电池 / MSG 状态栏与消息行；预览保留寻呼机外壳与绿屏，不是通用卡片。
- **令牌抽取**：原 `:root` 中的 18 个设计令牌迁入 `tokens.css`，作用域改为 `:is(.pg, .pg-pv)`；`html` 侧改用同值字面量，避免祖先读取后代变量。
- **字体**：导出 Silkscreen / Handjet / Ark Pixel 三个变量，切换页按族去重；CJK 子集按需下载。
- **隔离与等价**：`:root` 设计令牌为 0；预览不 import 正式页 `style.css`、无可聚焦元素；正式页产物与 HEAD 基线 sha256 相等。
- **检测器**：缩略字号与圆角已登记进 `DESIGN.md` 的 `preview-*` 档位，目录扫描零发现。

## 设计要点与已知偏差

- LCD 像素感来自字体 + 1px 点线，无扫描线动画；正文 14–15px / 行高 1.7。
- 动效：开机两段亮度跳变 + 消息 2 步出现；reduced-motion 全静态。
- 该套子代理回执因平台频率限制丢失（429），交付物由编排方统一构建 / 探针 / 检测器 / 截图验证通过。

## 待用户实机复核

- 用户将在本机对每套主题做视觉复核与逐项调整（版式微调、文案、动效手感）；调整按新任务处理。
