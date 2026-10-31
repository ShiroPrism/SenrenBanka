# design.md — fax（复古办公室 / 传真机）

> 本文件 = 该套的**实施简报**（隐喻 / 版式 / 配色 / 字体 / 动效 / 分区映射）。
> 另一个同名文件 `src/designs/fax/DESIGN.md` 是交付物（设计系统令牌），需按本简报 + 实际值撰写。

## 设计简报：fax — 复古办公室 / 传真机

**世界**：一张刚从传真机里吐出来的传输纸，摊在暗色办公桌上。纸是 A4 宽幅（比 receipt 宽得多），顶上是 FAX TRANSMISSION 表头（TO / FROM / DATE / PAGES），两侧有走纸打孔列，正文是磨损的打字机字面（TT2020 Style D 的复写纸质感），段末有页码。

**版式（桌面）**：纸张 `min(48rem, 100%)` 居中；表头 = 4 行两列表格（标签 + 点引导线 + 值）；正文分区用 `----` 虚线与小号标签；页脚 `END OF TRANSMISSION · P.01`；纸张外是桌面与轻微纸影。
**版式（移动）**：走纸孔列隐藏，表头折行，纸张满宽。

**配色**
- 桌面 back: `#242220`，back-deep: `#191715`
- 纸 paper: `#f2eee4`，paper-2: `#eae4d6`
- 墨 ink: `#322e26`，淡墨 dim: `#6f6656`，虚线 line: `#c9c1af`
- 唯一彩色：磨损红章 `#9c3b31`（「RECEIVED」章）

**字体**
- 表头/标签：Courier Prime（`--font-courier-prime`）
- 正文：TT2020 Style D（`--font-tt2020-styled`）——**磨损感是这套的主角**
- 中文：Zhuque Fangsong（`--font-zhuque`）

**分区映射**：表头（name / headline / location / 传输元数据）→ 备注（bio）→ 明细（links）→ 订单（projects）→ 纪录（experience）→ 技能（skills）→ 结账（contact + 合计）→ 页脚（END OF TRANSMISSION + 样例声明）。
**细节**：走纸孔 = 两侧小圆点列的边界；打字机字面不要加额外字距（TT2020 自带不稳定基线，保持原样）；红章「已收 / RECEIVED」微微歪斜压在表头右上；页码用 DSEG? 不——用 Courier Prime 数字，保持打字机统一。
**动效（一个作者时刻）**：纸张从上方「走纸」进入（clip-path 展开 + 轻微下移，一次性）；红章落下。
**注意**：与 receipt 的区别必须一眼可辨——更宽的纸、表头表格、走纸孔、磨损字面；不要复用 receipt 的点引导线/撕边/三联语言排列。

## 分区清单（h2 层级，按序）

1. 传输表头（姓名/副标题/地点）
2. 备注（bio）
3. 明细（links）
4. 订单（projects）
5. 纪录（experience）
6. 技能（skills）
7. 结账（contact+合计）
8. 页脚

## 交付物

- `src/designs/fax/design.json`（参考 receipt/design.json：id / displayName / description / source: { type: 'self-produced' }）
- `src/designs/fax/DESIGN.md`（隐喻、配色/字体令牌、Named Rules、Layout、动效、六项字体记录 — 参考 receipt/DESIGN.md 结构）
- `src/designs/fax/Page.astro`（完整 `<html>` 文档；HeadMeta / Font / Reveal / ContextMenu）
- `src/designs/fax/style.css`（`@import "tailwindcss" source(none); @source "./";` + 全部样式，类前缀 `fa-`）
- `src/designs/fax/messages.ts`（三语；参考 receipt/messages.ts 的键设计）
