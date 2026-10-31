# design.md — poster（海报 / 实验艺术）

> 本文件 = 该套的**实施简报**（隐喻 / 版式 / 配色 / 字体 / 动效 / 分区映射）。
> 另一个同名文件 `src/designs/poster/DESIGN.md` 是交付物（设计系统令牌），需按本简报 + 实际值撰写。

## 设计简报：poster — 海报 / 实验艺术

**世界**：一张丝网印刷的实验海报贴在看片灯上。巨幅窄体标题（League Gothic）、镂空 stencil 段落字（Blackout 2AM）、印刷套准标记（圆形 + 十字）、裁切角线、粗重分隔线；信息以「海报栏目」排布。

**版式（桌面）**：海报 `min(60rem, 100%)`，四周留出「纸边」；顶部报头：超大字（name，clamp 到 6rem 上限，字距 -0.03em，可换行）+ headline 作副标；其下 12 栏网格：分区为不等宽栏（例如 备注 7 栏 + 明细 5 栏，交替），栏间粗规线；分区标题用 Blackout 2AM 大写；正文用 Prociono。
**版式（移动）**：单栏，报头字降级到 ~2.6rem，套准标记缩小保留 2 个。

**配色**
- 纸 paper: `#f1ebdc`，纸暗 paper-2: `#e7dfcc`
- 墨 ink: `#111110`
- 唯一彩色：荧光橙 flare: `#ff4d1f`（套印圆、强调线、下划线）
- 次要灰 muted: `#5f5a4d`（≥4.5:1）

**字体**
- 展示：League Gothic（`--font-league-gothic`，wdth 可变，可用 font-stretch 75%–100%）
- 分区标题：Blackout 2AM（`--font-blackout`）——只用于短标题/编号
- 正文：Prociono（`--font-prociono`）
- 中文：Zhuque Fangsong（`--font-zhuque`）

**分区映射**：报头（name / headline / location / 套准标记）→ 备注（bio）→ 明细（links）→ 订单（projects）→ 纪录（experience）→ 技能（skills）→ 结账（contact + 合计）→ 页脚（「SENRENBANKA · PRINTED MATTER」+ 样例声明）。
**细节**：套准标记 = 细线圆 + 十字（CSS）；半调点用 radial-gradient 点阵（印刷世界材质，仅一小块）；粗规线 6–10px；标题允许被裁切（负边距）但不能溢出视口；链接 hover = 橙色粗下划线。
**动效（一个作者时刻）**：标题像油墨辊压过——clip-path 从左到右展开一次；分区规线随滚动画出（scaleX）。
**注意**：海报是「大声」的世界，但正文保持 Prociono 可读（1rem/1.65）；不要把每个分区都做成黑底白字——留出纸面呼吸。

## 分区清单（h2 层级，按序）

1. 报头（姓名/副标题/地点）
2. 备注（bio）
3. 明细（links）
4. 订单（projects）
5. 纪录（experience）
6. 技能（skills）
7. 结账（contact+合计）
8. 页脚

## 交付物

- `src/designs/poster/design.json`（参考 receipt/design.json：id / displayName / description / source: { type: 'self-produced' }）
- `src/designs/poster/DESIGN.md`（隐喻、配色/字体令牌、Named Rules、Layout、动效、六项字体记录 — 参考 receipt/DESIGN.md 结构）
- `src/designs/poster/Page.astro`（完整 `<html>` 文档；HeadMeta / Font / Reveal / ContextMenu）
- `src/designs/poster/style.css`（`@import "tailwindcss" source(none); @source "./";` + 全部样式，类前缀 `po-`）
- `src/designs/poster/messages.ts`（三语；参考 receipt/messages.ts 的键设计）
