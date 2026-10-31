# design.md — tape（磁带 / 录音设备）

> 本文件 = 该套的**实施简报**（隐喻 / 版式 / 配色 / 字体 / 动效 / 分区映射）。
> 另一个同名文件 `src/designs/tape/DESIGN.md` 是交付物（设计系统令牌），需按本简报 + 实际值撰写。

## 设计简报：tape — 磁带 / 录音设备

**世界**：一盘卡式磁带（cassette）与它的 J 卡内页摊在桌面上。左边是磁带本体（塑料壳、两个卷轴窗、标签贴纸），右边是 J 卡：手写标题、A 面曲目单（每个分区 = 一首曲目）、底部 C-60 / TYPE II 标记。

**版式（桌面）**：两栏（约 5:7），整体 `min(52rem, 100%)` 居中；左栏磁带壳 sticky（滚动时轻微跟随）；右栏 J 卡，曲目行 = 编号（A1…）+ 标题 + 点引导 + 计数；分区之间用细线。
**版式（移动）**：磁带壳在上（缩小），J 卡在下单列。

**配色**
- 桌面 back: `#241f1b`，back-deep: `#17120f`
- 标签纸 label: `#efe6d0`，label-2: `#e6dabf`
- 墨 ink: `#2c241b`，淡墨 dim: `#6d5c45`
- 壳体 shell: `#1d1c1a`，卷轴窗 window: `#3a3228`
- 唯一彩色：橙 `#c2642d`（标签边条 / 播放键形状）；REC 红点 `#a63b2f` 仅一处

**字体**
- 手写（姓名/大标题/手写批注）：UglyTypist（`--font-uglytypist`）
- 曲目编号/技术标记：League Mono（`--font-league-mono`，400/700）
- 中文：Zhuque Fangsong（`--font-zhuque`）——中文「手写」不可得，用仿宋做批注体，字号缩小 + 轻度斜置

**分区映射**：J 卡头（name 手写 / headline / location）→ 备注（bio，作「SIDE A NOTES」）→ 明细（links，曲目 01…）→ 订单（projects）→ 纪录（experience）→ 技能（skills）→ 结账（contact + 合计 = 曲目数）→ 页脚（C-60 · TYPE II · NR ON + 样例声明）。
**细节**：磁带壳用 CSS 几何（圆角矩形 + 圆窗 + 卷轴齿 + 螺钉）；卷轴只在 hover/focus-within 时缓慢旋转（60s linear），reduced-motion 时静止；标签贴纸有轻微歪斜与胶带角。
**动效（一个作者时刻）**：磁带落桌——整体轻微下沉 + 标签展开（一次性）；不要持续转动。
**注意**：手写字体只用于标题/短标签，**正文绝不用 UglyTypist**（可读性），正文用 League Mono/Zhuque。

## 分区清单（h2 层级，按序）

1. J 卡头（姓名/副标题/地点）
2. 备注（bio）
3. 明细（links）
4. 订单（projects）
5. 纪录（experience）
6. 技能（skills）
7. 结账（contact+合计）
8. 页脚

## 交付物

- `src/designs/tape/design.json`（参考 receipt/design.json：id / displayName / description / source: { type: 'self-produced' }）
- `src/designs/tape/DESIGN.md`（隐喻、配色/字体令牌、Named Rules、Layout、动效、六项字体记录 — 参考 receipt/DESIGN.md 结构）
- `src/designs/tape/Page.astro`（完整 `<html>` 文档；HeadMeta / Font / Reveal / ContextMenu）
- `src/designs/tape/style.css`（`@import "tailwindcss" source(none); @source "./";` + 全部样式，类前缀 `ta-`）
- `src/designs/tape/messages.ts`（三语；参考 receipt/messages.ts 的键设计）
