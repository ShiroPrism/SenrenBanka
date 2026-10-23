# verification — fax

> 本文件是该主题**当前**的验证状态；重复验证时更新本文件，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill；本套属「八方向拟物主题」批次（父任务 `10-17-skeuo-theme-queue`），2026-10-17 由编排方统一验证。

## 设计摘要

- **隐喻**：传真传输纸：FAX TRANSMISSION 表头（TO/FROM/DATE/PAGES）、两侧走纸孔、磨损打字机正文、红章「已收」。
- **字体**：Courier Prime（表头/标签）· TT2020 Style D（正文磨损）· Zhuque Fangsong（中文）
- **页面**：`/zh-cn/fax/`、`/ja/fax/`、`/en/fax/`

## 构建与产物

- `npm run build` 绿：**73 页**（3 语言 × 16 设计 + 基础设施页）；`astro check` **0 错误 / 0 警告 / 0 提示**（56 文件）。
- 本套三语言页面均已生成：`dist/{zh-cn,ja,en}/fax/index.html`。
- CSS 隔离：本页仅链接自身 1 条 CSS；该文件不被其他设计页引用（7 套批量核对通过）。
- 字体经 local provider 进入产物；构建期零网络；`dist` 无 ttf/otf/ttc、无 `.local-fonts` / `F:\Fonts` 路径泄漏、无第三方域名请求。
- 本套实测加载字体（逐字体 document.fonts.check() 判定，滚动后）：Courier Prime、TT2020 Style D、Zhuque Fangsong。

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
- 截图：`.local-fonts/dev/preview/skeuo/fax-desktop.png`（1440 全页）、`fax-mobile.png`（375×2x）。

## 检测器

- `impeccable detect --json src/designs/fax` → **0 条**（DESIGN.md 已登记 CSS 字面量）。

## 切换页预览碎片（`Preview.astro`，2026-10-19）

- **视觉签名**：传真纸、两侧走纸孔、`FAX TRANSMISSION` 字段表头、磨损打字机字面与红章；预览是单页传输，不借用切换页卡片语言。
- **令牌抽取**：纸张、墨、暗、线、红与台面色抽入 `tokens.css`，作用域 `:is(.fx, .fx-pv)`；正式页只改声明位置。
- **字体**：导出 Courier Prime / TT2020 Style D / Zhuque Fangsong 三个变量，由切换页按族去重；CJK 子集按需下载，不 preload。
- **隔离与等价**：预览独立组件样式，无 `:root`、无可聚焦元素；正式页产物与 HEAD 基线 sha256 相等。
- **检测器**：预览缩略字号已登记进 `DESIGN.md` 的 `preview-*` 档位，目录扫描零发现。

## 设计要点与已知偏差

- 与 receipt 明确区分：宽幅纸、传输表头、走纸孔、磨损字面；未复用撕边 / 点引导线 / 多语言并排。
- DATE = 构建日（真实），PAGES = 实际渲染分区数（真实）；无数据分区不渲染。
- Zhuque 子集对约 20 个 UI 词缺字（细/订/纪/账/计 等）→ 回退 Songti SC / SimSun；与 receipt 同一处境，已记入 DESIGN.md。
- 动效：走纸进入 + 红章落下；reduced-motion 全静态。

## 待用户实机复核

- 用户将在本机对每套主题做视觉复核与逐项调整（版式微调、文案、动效手感）；调整按新任务处理。
