---
name: Receipt — The Thermal Receipt
description: 一张从热敏票据机里吐出的长票：等宽打字机字、段码数字、点引导线、虚线分栏与一枚红章。
colors:
  back: "#2a2723"
  back-rise: "#36312a"
  back-deep: "#1e1b17"
  preview-machine: "#4a443b"
  preview-machine-shadow: "rgba(0, 0, 0, 0.55)"
  paper: "#f6f2e8"
  paper-dim: "#eee8da"
  paper-print: "#ffffff"
  ink: "#2b2620"
  dim: "#6d6354"
  faint: "#b3a894"
  line: "#cfc6b4"
  stamp: "#b3372c"
typography:
  display:
    fontFamily: "'Cutive Mono', 'Courier New', Courier, 'Ark Pixel 12px', 'Songti SC', 'SimSun', monospace"
    fontSize: "clamp(1.7rem, 7vw, 2.1rem)"
    fontWeight: 400
    lineHeight: 1.3
  display-compact:
    fontFamily: "同 display"
    fontSize: "clamp(1.5rem, 8vw, 1.8rem)"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: "同 display"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.8
  note:
    fontFamily: "同 display"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.7
  meta:
    fontFamily: "同 display"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "同 display"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.6
  micro:
    fontFamily: "同 display"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.6
  digits:
    fontFamily: "'DSEG7 Classic', 'Cutive Mono', 'Ark Pixel 12px', monospace"
    fontSize: "1.9rem"
    fontWeight: 400
  # 切换页预览层（`Preview.astro`）的缩略档位；不并入正式页阶梯（2026-10-19）。
  preview-body:
    fontFamily: "同 display"
    fontSize: "0.5625rem"
    fontWeight: 400
    lineHeight: 1.55
  preview-display:
    fontFamily: "同 display"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.25
  preview-label:
    fontFamily: "同 display"
    fontSize: "0.5rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.16em"
  preview-micro:
    fontFamily: "同 display"
    fontSize: "0.46rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.12em"
  preview-note:
    fontFamily: "同 display"
    fontSize: "0.45rem"
    fontWeight: 400
    lineHeight: 1.5
  preview-digits:
    fontFamily: "'DSEG7 Classic', 'Cutive Mono', monospace"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1
rounded:
  paper: "0（撕边由锯齿剪出）"
  stamp: "4px"
  # 缩略票机出纸口按卡宽等比收敛（2026-10-19）。
  preview-machine: "3px"
spacing:
  step: "45ms（印刷步进）"
  block: "1.7rem"
  line: "1.8"
components:
  link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  link-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  dim:
    textColor: "{colors.dim}"
    typography: "{typography.body}"
  leader:
    borderColor: "{colors.faint}"
  section-label:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  stamp:
    textColor: "{colors.stamp}"
    borderColor: "{colors.stamp}"
  preview-machine:
    textColor: "{colors.ink}"
    backgroundColor: "#4a443b"
    shadow: "rgba(0, 0, 0, 0.55)"
---

# Design System: Receipt — The Thermal Receipt

## Overview

**Creative North Star: "The Thermal Receipt（热敏小票）"**

主页是一张刚从下北沢小票机里吐出来的长票：一联纸悬在深色台面上，从上到下按印刷顺序分成
备注、明细、订单、纪录、技能、结账——每栏由两翼虚线夹一枚标签，行与行之间用点引导线拉平。
信息不是"排"出来的，是"印"出来的：整行离散步进出现，最后"啪"地落下一枚红章。

宽屏下它仍是**一张票**：票据在台面上摊宽，纸内沿一道折痕把正文分作左右两栏；
票头、简介与页脚横跨整张纸。窄屏（<1024px）折痕收拢，恢复单栏阅读。

材质是一卷热敏纸：暖白纸面、哑光黑墨、脆薄的虚线分割、撕口朝上的锯齿边。
整个页面只有一个彩色——章泥红；它不与任何元素共享，连焦点环都用墨色而不是红色。
数字是票据机的第二声部：日期与合计走七段数码管（DSEG7），中文与拉丁一并落在等宽打字机声部里。

**Key Characteristics:**
- 一张纸、一条阅读流；没有卡片、没有面板、没有投影层级（纸外唯一阴影是把纸从台面托起的 drop-shadow）。
- **折叠双栏**：宽屏纸内两栏、窄屏单栏；不是两张票，也不是重复语言副本。
- 墨只有三档明度（ink / dim / faint）；红只有一枚章。
- 所有分隔都是"印"的：虚线（1px dashed）、点引导线（2px dotted）、段码数字，不是 UI 分隔符。
- 动效是票据机的印刷过程：整行离散步进 + 落章，印完即静止。

## Colors

纸、墨、章泥，三样材料，加一层台面。

### Primary
- **Ink（墨）**: 正文、标题、链接的基准色；纸上的唯一"黑"。
- **Stamp Red（章泥红）**: 全页唯一彩色。图章一枚、选区底色一处（`::selection`），别无他用。

### Neutral
- **Paper（纸）**: 暖白纸面；自上而下极缓的明度衰减（`#f6f2e8 → #eee8da`）模拟纸卷的受光。
- **Dim（淡墨）**: 次级信息（序号、URL、注释、地址行）——纸面对比度 ≥4.7:1（两档纸色都实测）。
- **Faint（影墨）**: 点引导线与装饰元素；**非文本**，不承载信息。
- **Line（虚线）**: 分栏虚线与页脚分割线。
- **Back / Back-Rise / Back-Deep（台面）**: 深暖灰径向渐变的场景底色（顶部受光档为 Back-Rise），把纸托起来。
- **Paper-Print（打印底）**: 仅 `@media print` 使用的纯白底，不进屏幕呈现。

### Named Rules
**The One Red Rule.** 红只属于章（与文本选区）。任何新元素不得用红表达"强调"。
**The Two-Weight Ink Rule.** 墨分基准 / 淡两档（faint 不做文本）；层级先由明度表达，再考虑排版。
**The Folded Sheet Rule.** 全站只渲染当前语言的一张票。≥1024px 在纸内折成两栏，
<1024px 收成单栏；两档之间不得出现第三档半折叠布局。

## Typography

**Display / Body / Label Font:** Cutive Mono（打字机等宽；回退 Courier New / Courier）
**CJK Font:** Ark Pixel 12px（12px 网格像素黑体；作为回退链中的中文声部）
**Digits Font:** DSEG7 Classic（七段数码管；日期与合计）

**Character:** 热敏打印机的字面是"小而倔"的等宽字母加网格点阵汉字——
拉丁落在 Cutive Mono 的打字机字面里，汉字落在 12px 网格的方点阵里，数字则切成七段。
中文在 12px 网格上并非整数倍时会有轻微软边——那正是热敏输出的质感，不做修正。

### 字体选型记录（六项，依据 docs/fonts/selection-guide.md 流程）
1. **隐喻与特征**: 热敏小票机 → 需要"新鲜打印、干净利落"的等宽打字机声部、
   段码数字声部、以及能与拉丁共处的中文像素声部；磨损感**不**属于这里（那是传真机的）。
2. **角色分配**: 拉丁正文 / 标签 = Cutive Mono；中文 = Ark Pixel 12px；数字（日期、合计）= DSEG7 Classic。
3. **为什么是它而非其他**: TT2020 的高保真磨损打字机留给 fax（磨损是那套语言的主角）、
   Special Elite 同为磨损单字重、同样偏传真；Cutive Mono 是三者中字面最"现代打印机"、体积最小的一组。
   DSEG7 而非 DSEG14：7 段是小票/计算器的日常读数，14 段的仪表气留给 radio。
   中文候选 Zpix 因官方仓库无许可文件被排除（不可进生产），改用许可核验通过的 Ark Pixel。
4. **实际覆盖与回退**: Cutive 拉丁 95/95（ASCII）；Ark 子集含站内全部用字（2237 字符集的子集，
   42KB 级），假名 189 枚；DSEG7 覆盖 0-9 与 `: . -` 等段码字符。
   中文回退：Songti SC / SimSun；拉丁回退：Courier New / Courier。
5. **字重 / 轴 / 体积 / 许可**: 全部单字重或双字重静态字体（无可变轴）；
   Cutive 21KB + 17KB、Ark 子集 39KB、DSEG7 5KB × 2。许可：三者均 OFL-1.1
   （DSEG 带 RFN "DSEG"，本项目原样格式分发、未改名未修改）。
6. **缺失回退顺序**: 数字 `--font-dseg7 → Cutive → Courier New → Ark Pixel → Songti SC / SimSun → monospace`；
   正文同链去掉 DSEG7 一节。

### Hierarchy
- **Display**（400, `clamp(1.7rem, 7vw, 2.1rem)`）：姓名（店号位置）。
- **Body**（400, 0.9375rem, 1.8）：简介、明细、订单、纪录。
- **Label**（400, 0.6875rem, 字距 0.22–0.34em）：品牌行、分栏标签、地址行、脚注。
- **Digits**（DSEG7）：合计 1.9rem；日期 0.8125rem。

### Named Rules
**The No-Bold Rule.** 不使用字重与斜体区分层级——墨的明度档 + 字号 + 字距就是全部手段
（`strong`/`em` 若引入需先修本规范）。

## Layout

- 单栏：`width: min(30rem, 100%)`；纸内边距 `2.6rem 1.6rem 1.5rem`（上方含撕边余量）。
- **折叠双栏（≥1024px）**：`main` 为居中容器，`width: min(72rem, calc(100% - 2 * clamp(1rem, 4vw, 3rem)))`；
  纸张填满容器，内部 `padding-inline` 为 `clamp(2rem, 4vw, 4rem)`。1440 视口纸张宽 1152px，
  左右台面各 136px（约 9.4%）。
- **两栏分配**：`.rc-fold-body` 使用 CSS 多列（`column-count: 2`），
  列间距 `clamp(5rem, 7vw, 7rem)`；内容按自然高度自动平衡。section 不跨栏拆分，
  单条订单 / 纪录保持完整，但多列容器可在条目之间换栏。
  DOM 仍保持明细 → 订单 → 纪录 → 技能 → 结账的阅读顺序，不靠 `order` 重排屏幕阅读器内容。
- **折痕**：`column-rule` 的 1px 竖线，颜色为 `--rc-line` 的 72% 透明档；
  仅桌面显示，不参与动效，不是投影。桌面分栏行宽约 40–50ch。
- **横跨元素**：票头、备注 / 简介、页脚在 `.rc-fold-body` 之外，宽度为整张纸。
- 单列流式：无栅格、无卡片；分栏间距 1.7rem，行距 1.8。
- 每栏 = 两翼虚线夹标签（`.rc-sec`）+ 若干行；明细行 = 序号 + 链接 + 点引导线 + URL（同行拉平）。
- 首屏：品牌行 → 姓名 → headline → 地址 → `备注` 与简介；红章悬停在右上角。
- 页脚以虚线切出：致谢（居中、字距）+ 条码 + 示例声明。
- 响应式：≤560px 收紧纸内边距、隐藏 URL（行只留序号与标签）、图章与字距缩小；
  561–1023px 保持单栏 30rem 票据；1024px 起双栏，结构只发生一次切换（Folded Sheet Rule）。

## Elevation & Depth

**没有投影层级。** 深度只有一件事：纸与台面——`filter: drop-shadow(0 16px 34px rgba(0,0,0,.5))`
把整张纸从深色台面托起（drop-shadow 跟随撕边轮廓，是唯一阴影）。纸内任何元素不得再有 shadow。

## Shapes

- 撕边：36 齿锯齿 polygon 在构建期生成（上缘与下缘，随纸宽自适应）；不做圆角。
- 虚线：分栏与页脚分割用 `1px dashed`；行内引导线用 `2px dotted`——都是"打印机画出来的线"。
- 图章：双层边框（2px 实线 + 内衬 1px）的小圆角矩形，旋转 -9°。
- 条码：不规则条纹的 `repeating-linear-gradient`（装饰，`aria-hidden`）。
- 链接下划线：1px、影墨色、offset 3px——像打孔而不是 UI 装饰。

## Components

### Receipt Rows（明细 / 订单 / 纪录）
- **明细行**: 序号（淡墨、两位）+ 链接（墨）+ 点引导线（影墨、居中）+ URL（淡墨、去协议短形式、≤46% 宽度省略）。
- **订单**: 序号 + 标题（有 url 则为链接，后随 `→ url`）+ 描述（淡墨、缩进归零、≤48ch）+ 标签行
  （`[ … ]` 括号由伪元素承载，不进无障碍树）。
- **纪录**: 周期 + 机构 + 角色；纯数字 / 日期式周期走段码（DSEG7），英文等叙述型周期走票据字，
  避免 DSEG7 在长叙述上报出大于可见字形的宽度；描述独立成行、淡墨。
- **长文本**：订单 / 纪录行允许在任意位置折行（`overflow-wrap: anywhere`）；纸张、栏、栏容器均设
  `min-width: 0`，英文 URL / 邮箱不得撑破双栏。
- **Semantics**: 六个分区各有一枚可见 `<h2>`（备注 / 明细 / 订单 / 纪录 / 技能 / 结账台）；
  序号、URL、引导线、条码、图章一律 `aria-hidden`（可访问名由文本标签承担）。

### Ticket（单张宽票）
- **单票合成**：`Page.astro` 经 `loadDesignView`（`src/lib/site.ts`）只取当前语言资料，
  渲染一张 `<article class="rc-paper">`；`lang` = 当前语言 code，`aria-label` = `<语言自称> <该语言的票头词>`。
- **语义**：一份 `article`、一枚 `h1`、六个可见 `h2`；标题序列无跳级，所有 section 以可见标题具名。
- **折栏容器**：正文五枚 section 直接进入 `.rc-fold-body`；宽屏多列按内容高度自动平衡，
  窄屏恢复块级顺序。
- **显现**：六个区块共用共享 IO；桌面左右两栏采用同一套 45ms 段内节奏，右栏不等待左栏。

### Links
- **Style:** 墨色 + 影墨下划线（offset 3px）；无边框、无背景。
- **Hover:** 仅在 `@media (hover: hover) and (pointer: fine)` 下反白（背景→墨、文字→纸），瞬变无过渡。
- **Touch:** `pointer: coarse` 时纵向 padding 0.55rem（命中区 ≈44px）。
- **Focus:** 2px 墨色 outline、offset 3px——**不是红色**（红只属于章）。

### Stamp（签名组件）
- **Style:** 右上角、旋转 -9°、双层边框、字距 0.34em、`mix-blend-mode: multiply`（像真盖在纸上）。
- **Motion:** 首屏印刷结束后"落章"——从 1.5 倍缩放、-1° 角压到终位，220ms，只播一次。
- **A11y:** `aria-hidden`——章是装饰语气，文本信息（受领字样）不承担导航或状态语义。

### Barcode
- **Style:** 44px 高的不规则竖条纹（影墨—墨之间），宽度 `min(17rem, 88%)`，居中。
- **Role:** 小票的身份感收尾；不承载数据（`aria-hidden`）。
- **Detector note:** `repeating-stripes-gradient` 信号属**有意为之**（条码即条纹）。

### Motion（动效）
- 动效语言 = **票据机的印刷过程**：整行离散步进出现（`steps(1)`，不做补间），落章是唯一的"机械动作"。
- **首屏**：整行按印刷顺序出现（45ms/行，80ms 起），姓名 0.13s 内可见、整屏 ≤0.4s 落定；
  图章在 0.32s 落章。核心内容不等待。
- **滚动进入视口**（复用共享 `IntersectionObserver`，只播一次；机制见 `docs/adr/0001`、`docs/adr/0003`）：
  分栏标签先出现，随后行按 45ms 节奏依次印出（每栏上限 8 行、超出回落为满延迟）。
- **折叠双栏**：左右栏用同一套 `--d` 计时；首次进入视口时两栏在同一个秒级窗口内落定。
  折痕不参与动画，不做翻折 / 3D / 拖动交互。
- **持续动效：无。** 论证：小票是印刷品——印完就该静止；票据机不会持续闪烁。
  页面把全部"动"的配额花在"印出来"这一件事上。
- `prefers-reduced-motion: reduce`：全部静止、内容原样呈现（隐藏态以 `html[data-reveal-ready]` 为唯一门控，契约见 `docs/rules/visual-language.md`）。

### Footer
- 虚线切出；致谢居中字距 0.24em → 条码 → 示例声明（0.625rem 字距 0.18em）。
- 语气刻意保留"票据收尾"：这是交易的结尾，不是网页的页脚。

## Do's and Don'ts

### Do:
- **Do** 让每一行都像"印"出来的：等宽对齐、点引导线拉平、数字切段码。
- **Do** 用墨的明度 + 字号 + 字距表达层级；红线只有图章与选区。
- **Do** 把中文原文直接放进等宽网格（12px 像素字面），不翻译内容。
- **Do** 保持纸与台面的唯一深度关系（drop-shadow 跟轮廓）；纸内零投影零圆角。
- **Do** hover 反白瞬变、focus 用墨色 outline；触屏命中区 ≥44px。
- **Do** 分区语义由可见 `<h2>` 承担；序号 / URL / 引导线 / 条码 / 图章 `aria-hidden`。

### Don't:
- **Don't** 引入第二个色相（红是章的专属）、第二个"材料"或第二套圆角。
- **Don't** 引入 SVG 图标或图标库——小票的全部标记是字符（`#` `→` `[ ]` 与段码）。
- **Don't** 用卡片、投影、渐变按钮——它们不属于票据机。
- **Don't** 做扫描线 / glitch / 大面积闪烁——那是 CRT 的语言，不是热敏纸的。
- **Don't** 给正文逐字打字（细节行只整行出现）；持续动效为零。
- **Don't** 让红色参与焦点、警告或强调；`::selection` 之外的红色都需要先改这条规范。

## Project Contract（本项目契约）

- **核心字段必须渲染**：`name` / `headline` / `bio` / `links`。
- **取数**：使用 `loadDesignView('receipt', Astro.url.pathname)`（`src/lib/site.ts`）只取当前语言；
  页面不接触文件路径、不自行判断语言。`loadDesignStrips` 保留给未来多语言同屏设计。
- **扩展区块取舍**：四个区块全部渲染——`experience`（纪录）、`projects`（订单）、
  `skills`（技能）、`contact`（结账台 + 合计）；合计 = `links.length`（明细件数，真实数据）。
- `<HeadMeta {...view.head} />` 必须原样引入；页面操作、主题切换与语言切换由**全站共享操作菜单**承担
  （无条件接入 `<ContextMenu config={view.contextMenu} />`）——本页不保留任何可见切换入口。
  菜单是项目级 chrome（中性外观）：其 lucide 图标**不受**本规范「Don't 引入 SVG 图标」约束。
- 字体：`--font-cutive-mono` / `--font-ark-pixel` / `--font-dseg7`（astro.config 的 fonts 注册 →
  页面 `<Font>`（不 preload）→ 本文件 `@theme inline`）；CSS 入口保持
  `@import "tailwindcss" source(none); @source "./";`。
- 撕边 polygon 在 Page.astro 构建期生成（零运行时脚本）；红色对比度、淡墨对比度维护在
  `docs/verification/receipt.md`。
