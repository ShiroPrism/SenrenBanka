# verification — receipt（自产：热敏小票机）

> 本文件是该主题**当前**的完整验证状态；重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）；记录归属见 `docs/README.md`。
> 首次全流程验证：2026-10-17（八方向新主题 · 样板页）；同日三联布局修订（桌面宽屏三语并排 + 窗口横向滚动、移动端不变）后**全节复测**，数据为该修订后的当前状态；同日复修（移除三联语言标签、修复台面背景变量）后针对相关小节复测。

## 构建与产物

- `npm run build` 绿：45 页（3 语言 × 9 设计 + 切换页 / 旧路径 / 404 / 根页）；`astro check` 0 错误 / 0 警告 / 0 提示；注册表校验通过。
- CSS 隔离成立：本页恰 1 条自身样式链接（`Page.CtoelhIr.css`，10.7KB）；该文件仅被三语言 receipt 页引用；未混入其他设计的选择器（`ed-` / `ox-` 的粗筛命中实为 `reduced-motion` / `box-sizing` 误匹配，逐条核对通过）；dist CSS 文件总数 = 设计数（每套恰 1 个）。
- 核心字段全部渲染：`name` / `headline` / `bio` / `links` + `location`；扩展区块四个全渲染（experience → 纪录、projects → 订单、skills → 技能、contact → 结账台）。
- 字体以 local provider 进入产物：`Cutive Mono-*`、`Ark Pixel 12px-*`、`DSEG7 Classic-*`；**字形级验证**——实际渲染堆栈的 CJK 像素指纹与 Ark 字面完全一致（canvas 指纹 1666165054 == arkFace，≠ monospace 719983133）；`document.fonts` 中三族对应面均为 `loaded`；无第三方域名请求。
- **三联（2026-10-17 修订，≥1024px）**：`main` 横向轨道，3 × `.rc-paper` 各 480px；1440 视口 `scrollWidth` 1624 → 窗口横向滚动成立（滚到最右收边实测通过）；每联分区 id 带语言后缀（`rc-memo-title-zh-cn/ja/en`）、`is-primary` 恰 1 个；无语言标签（复修：按反馈移除三联语言标签，DOM 计数 0）。台面背景（径向渐变）恢复原样式并经像素采样实测：左缘 `rgb(44,40,36)` 与改动前逐像素一致、顶部光晕 `rgb(51,46,40)`、最右滚动位 `rgb(45,42,37)`——无白底、无接缝。
- 探针证据（本机 `.local-fonts/dev/receipt-probe-fix.json`，2026-10-17 复修后；首轮为 `receipt-probe-trio.json`）：console **0 错误 0 警告**；背景实测——`background-color` = `rgb(30,27,23)`、`background-image` = `radial-gradient(...)` 均正确解析。

## 结构、内容与 a11y

- 标题层级：**h1×3**（三联各一份完整副本的文档标题，各自以 `lang` 标注）→ h2×18（每联 6 枚、全部可见、带语言后缀 id），无跳级；18/18 分区均有可访问名称（可见 h2）。
- 每联 `article` 以 `aria-label`（`<语言自称> <该语言票头词>`，如「日本語 レシート」）具名。
- 装饰一律 `aria-hidden`：序号、URL、点引导线、条码、图章、`#` 前缀、方括号（伪元素）。
- 链接可访问名干净（niconico / BB素材库 / 下北沢通信 / 王道征途… / 邮箱，无装饰符前缀）。
- 本页自身**零 SVG**：撕边为构建期 polygon、条码 / 引导线 / 虚线为 CSS、图章为文字 + 边框。

## 对比度（2026-10-17 实测，node 精算）

| 组合 | 比值 | 结论 |
|---|---|---|
| ink `#2b2620` / paper `#f6f2e8` | 13.41 | ✓ |
| ink / paper-2 `#eee8da` | 12.27 | ✓ |
| dim `#6d6354` / paper | 5.27 | ✓ |
| dim / paper-2 | 4.82 | ✓（≥4.5 硬底线） |
| red `#b3372c` / paper（图章，大字） | 5.37 | ✓ |
| faint `#b3a894` / paper | 2.10 | 装饰线条，非文本（声明） |

- 每次新增 / 调整色值必须实测并更新本表。

## 动效（Motion language「票据机印刷」）

- 首屏：整行离散步进出现（45ms/行、80ms 起；姓名 ≤0.13s；整屏 ≤0.4s 落定）；图章 0.32s 落章（220ms 缩放回正）。三联三份用同一套计时**同时印刷**。
- 滚动显现：18 个 `[data-reveal]` 区块（三联 × 6）；**二维判定口径**——「视口内隐藏」= opacity≠1 且同时在水平与垂直视口内；加载时、滚到底、跳转兜底（新加载直接跳到底）、横向平移（滚回顶部 → 滚到最右）四种场景**视口内隐藏均为 0**；1440 视口滚到底后 `[data-reveal-in]` = 18/18、总隐藏 0。
- 降级四情形：reduced-motion（不写门控、`animationName: none`、隐藏 0）；无 IntersectionObserver（不写门控、隐藏 0）；无 JS / 脚本异常按共享机制契约（`Reveal.astro` 不写门控，内容伪默认可见）——前两项实测、后两项由共享机制既有验证覆盖。
- 持续动效：**无**（论证见 DESIGN.md：小票是印刷品，印完即静止）。

## 触控与移动端（375×812 + 触控仿真）与断点

- **断点边界实测**：1000px → 单联（visible tickets = 1、标签隐藏、无横向滚动）；1024px → 三联（visible = 3、标签 3、`scrollWidth` 1587 > 1024 可滚动）；两档之间不得出现第三种联数（Triplicate Rule）。
- 移动端：`pointer: coarse` 生效；零横向溢出（`scrollWidth 375 == innerWidth 375`）；只显示当前语言一联（visible = 1、标签隐藏）——与既有单联行为一致。
- 共享操作菜单集成（ADR 0007）：悬浮球 52×52 可见、有可访问名；**点击图标本身**可打开底部面板；面板贴视口底（bottom gap = 0）；动作项 `copy / share / random / switch`；语言项 3 个平铺；✕ 与取消条均在；打开时 `html` `overflow: hidden`（背景滚动锁定）；点击 ✕ 后面板关闭。
- 触控命中：链接行高 45px（≥44）。
- ≤560px：URL 隐藏（行仅序号 + 标签）、纸内边距收紧、图章缩小、无横向溢出；撕边与条码随宽度自适应。

## 检测器（impeccable）

- 最近状态：**零发现**。
- 过程：首轮 10 条 `design-system-*` advisory（字面色 / 字号未登记进 DESIGN.md 量程）→ 按检测器指引将实际量程如实补入 `DESIGN.md` frontmatter（新增 `back-rise` / `paper-print` 两色与 `note` / `meta` / `micro` / `display-compact` 字阶）→ 归零。

## 切换页预览碎片（`Preview.astro`，2026-10-19）

- **视觉签名**：票据机口、长票、齿孔边、虚线分栏、点引导条目、红章、段码合计与条码；预览只取单联骨架，不复制正式页三语并排。
- **令牌抽取**：票据纸、墨、灰、线与红抽入 `tokens.css`，作用域 `:is(.rc, .rc-pv)`；正式页只改声明位置。
- **字体**：导出 Cutive Mono / Ark Pixel / DSEG7 三个变量，切换页按族去重；CJK 子集按需下载。
- **隔离与等价**：预览不 import 正式页 `style.css`，无 `:root`、无可聚焦元素；正式页产物与 HEAD 基线 sha256 相等。
- **检测器**：预览缩略字号与圆角已登记进 `DESIGN.md` 的 `preview-*` 档位，目录扫描零发现。

## 多语言（契约 + 新指令）

- 三语言页面齐备；`<html lang>` = `zh-CN` / `ja` / `en`（随路径）；robots `noindex, follow`（非默认设计）；canonical 带 locale 前缀；**`<link rel="alternate">` = 0**（非默认设计正确）。
- 菜单语言项（共享 chrome）：两份 DOM 共 6 个 `.cm-lang`、目标保持 receipt id、`aria-current` 恰好每份 1 个、带 `hreflang` / `lang`。
- 本设计文案全部来自 `messages.ts`（zh 备注/明细/订单/纪录/技能/结账台；ja ご案内/明細/ご注文/記録/スキル/お会計；en MEMO/ITEMS/ORDERS/LOG/SKILLS/CHECKOUT）；ja 版页面目检通过。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎、横屏、200% 缩放未实测；触控与降级基于 Chromium 仿真。
- base 前缀（`/demo`）全链路批检与「旧路径跳转 / 配置开关」项并入八方向收口批次统一执行。
- 截图归档（本机路径，不随仓库分发）：`.local-fonts/dev/preview/` 下三联版 `trio-1440.png`（首屏）/ `trio-full-1800.png`（三张完整）/ `trio-1280.png` / `trio-panned-right.png`（滚到最右）/ `trio-mobile.png`；单联版留存 `receipt-closeup2.png` / `receipt-zoom-head.png`。
