# design.md — archive（档案柜 / 索引卡）

> 本文件 = 该套的**实施简报**（隐喻 / 版式 / 配色 / 字体 / 动效 / 分区映射）。
> 另一个同名文件 `src/designs/archive/DESIGN.md` 是交付物（设计系统令牌），需按本简报 + 实际值撰写。

## 设计简报：archive — 档案柜 / 索引卡

**世界**：图书馆卡片目录（card catalog）。页面是深胡桃木桌面上的一只拉开抽屉，里面立着 7 张马尼拉纸索引卡：一张卡是卡片头（姓名/副标题/所在地），其余每张卡是一个分区。卡片有「类目标签」凸出顶部，卡面有索引卡横线、底部打孔、右上角铅笔记号。

**版式（桌面）**：居中抽屉列 `min(44rem, 100%)`；卡片纵向叠放，相邻卡片交替 ±0.25deg 微旋，hover/focus 时转正并轻微抬起；每张卡 = 顶部凸出标签（类目名 + 编号）+ 卡面内容；卡与卡之间露出抽屉内的阴影缝隙。
**版式（移动）**：单列、旋转取消、标签变卡片顶部条。

**配色（写进 DESIGN.md 并全部使用）**
- 桌面 back: `#2b211a`（深胡桃木），抽屉内影 back-deep: `#1a120d`
- 卡纸 paper: `#eee4cf`，paper-2: `#e6dbc2`
- 墨 ink: `#2b241a`，淡墨 dim: `#6b5e4a`，索引线 line: `#cfc3a9`
- 唯一彩色：印章/类目标记 `#8a3a2f`（仅图章与标签序号用）

**字体**
- 标题/卡头：Sorts Mill Goudy（`--font-sorts-mill-goudy`），可含斜体
- 正文/条目：Courier Prime（`--font-courier-prime`）——打字记录感
- 中文：Zhuque Fangsong（`--font-zhuque`）作为两条字体链的 CJK 尾部

**分区映射**：卡头（name / headline / location / 印章「已归档」）→ 备注（bio）→ 明细（links，每条 = 编号 + 标签 + 点引导 + URL）→ 订单（projects）→ 纪录（experience）→ 技能（skills）→ 结账（contact + 合计 links.length）→ 页脚（致谢 + 「DRAWER 03 · ARCHIVE」+ 样例声明）。
**细节**：卡面横线用 `repeating-linear-gradient`（卡纸印刷横线，属世界材质）；卡底打孔用 radial-gradient 小圆；类目标签为左对齐凸片，带小号大写类目词；页脚可有一枚「借阅日期」虚线戳。
**动效（一个作者时刻）**：卡片按 60ms 步进从抽屉里升起（translateY + opacity，steps 或短 ease-out），图章最后落下；reduced-motion 时全部静态。
**注意**：不要做成「卡片网格」列表页——它是一叠被拉开的卡片流，顺序即层级。

## 分区清单（h2 层级，按序）

1. 卡头（姓名/副标题/地点）
2. 备注（bio）
3. 明细（links）
4. 订单（projects）
5. 纪录（experience）
6. 技能（skills）
7. 结账（contact+合计）
8. 页脚

## 交付物

- `src/designs/archive/design.json`（参考 receipt/design.json：id / displayName / description / source: { type: 'self-produced' }）
- `src/designs/archive/DESIGN.md`（隐喻、配色/字体令牌、Named Rules、Layout、动效、六项字体记录 — 参考 receipt/DESIGN.md 结构）
- `src/designs/archive/Page.astro`（完整 `<html>` 文档；HeadMeta / Font / Reveal / ContextMenu）
- `src/designs/archive/style.css`（`@import "tailwindcss" source(none); @source "./";` + 全部样式，类前缀 `ar-`）
- `src/designs/archive/messages.ts`（三语；参考 receipt/messages.ts 的键设计）
