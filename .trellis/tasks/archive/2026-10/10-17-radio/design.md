# design.md — radio（短波收音机 / 工业仪表）

> 本文件 = 该套的**实施简报**（隐喻 / 版式 / 配色 / 字体 / 动效 / 分区映射）。
> 另一个同名文件 `src/designs/radio/DESIGN.md` 是交付物（设计系统令牌），需按本简报 + 实际值撰写。

## 设计简报：radio — 短波收音机 / 工业仪表

**世界**：一台 1970s 短波收信机的正面板。整页是一块机面板：顶部品牌压印条 + 大刻度盘（名字就是「当前频率」），中部是仪表模块阵列（分区），右侧/下方有 VU 表与琥珀色指示灯。四角有螺钉，面板有细刻线。

**版式（桌面）**：面板 `min(56rem, 100%)` 居中，厚度感来自 1px 高光 + 内阴影；顶部：品牌行（SENRENBANKA · SW RECEIVER）+ 状态灯；刻度盘：横向刻度尺（每 10 格标数字，DSEG14 数字）+ 一根固定指针 + 名字（h1，大号）+ headline；主体：模块 2 列栅格（每个模块 = 面板色块 + 角螺钉 + 标签牌 + 内容）；模块编号用 DSEG14。
**版式（移动）**：单列，刻度尺缩短为装饰条，模块堆叠。

**配色**
- 机身 back: `#171a17`，面板 panel: `#232724`，深槽 panel-deep: `#1b1f1b`
- 面板丝印 cream: `#e9e3d2`
- 琥珀 amber: `#e0a13f`（刻度、指针、指示灯——唯一暖色）
- 红 needle: `#c14b32`（仅指针端与警示灯）
- 暗字 dim: `#a9ad98`

**字体**
- 标签/正文：Share Tech Mono（`--font-share-tech-mono`）
- 数字/编号/频率：DSEG14 Classic（`--font-dseg14`）
- 面板小字：Format 1452（`--font-format-1452`）用于大写短标签
- 中文：Ark Pixel 12px（`--font-ark-pixel`）——作为「点阵屏/丝印」中文声部

**分区映射**：面板头（name / headline / location / 频率式编号）→ 备注（bio）→ 明细（links）→ 订单（projects）→ 纪录（experience）→ 技能（skills）→ 结账（contact + 合计）→ 页脚（「BAND: 41m · SW」+ 样例声明）。
**细节**：螺钉 = 小圆形径向高光；VU 表 = 竖条栅格（装饰，aria-hidden）；指示灯 = 3 个小圆点（其中一枚 amber 亮）；分隔用刻度短线而非卡片边框；所有模块不用圆角（工业面板是直角）。
**动效（一个作者时刻）**：上电——指针从左侧扫到固定刻度（~700ms，一次性），指示灯按 2 步点亮；不做持续闪烁。
**注意**：不要把「技术感」做成满屏等宽字——数字归 DSEG14、标签归 Share Tech Mono、正文留呼吸。

## 分区清单（h2 层级，按序）

1. 面板头（姓名/副标题/地点）
2. 备注（bio）
3. 明细（links）
4. 订单（projects）
5. 纪录（experience）
6. 技能（skills）
7. 结账（contact+合计）
8. 页脚

## 交付物

- `src/designs/radio/design.json`（参考 receipt/design.json：id / displayName / description / source: { type: 'self-produced' }）
- `src/designs/radio/DESIGN.md`（隐喻、配色/字体令牌、Named Rules、Layout、动效、六项字体记录 — 参考 receipt/DESIGN.md 结构）
- `src/designs/radio/Page.astro`（完整 `<html>` 文档；HeadMeta / Font / Reveal / ContextMenu）
- `src/designs/radio/style.css`（`@import "tailwindcss" source(none); @source "./";` + 全部样式，类前缀 `ra-`）
- `src/designs/radio/messages.ts`（三语；参考 receipt/messages.ts 的键设计）
