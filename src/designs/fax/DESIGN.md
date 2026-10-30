---
name: Fax — The Fax Transmission Sheet
description: 一张刚从传真机里吐出来的传输纸：FAX TRANSMISSION 表单表头、两侧走纸孔、磨损的打字机字面与一枚红章。
colors:
  back: "#242220"
  back-deep: "#191715"
  paper: "#f2eee4"
  paper-2: "#eae4d6"
  ink: "#322e26"
  dim: "#6f6656"
  line: "#c9c1af"
  stamp: "#9c3b31"
  shadow: "rgba(0, 0, 0, 0.55)"
typography:
  display:
    fontFamily: "'TT2020 Style D', 'Zhuque Fangsong', 'Courier New', 'Songti SC', 'SimSun', monospace"
    fontSize: "clamp(1.5rem, 4.2vw, 1.875rem)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0"
  body:
    fontFamily: "同 display"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0"
  note:
    fontFamily: "同 display"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  field:
    fontFamily: "'Courier Prime', 'Zhuque Fangsong', 'Courier New', 'Songti SC', 'SimSun', monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0.04em"
  label:
    fontFamily: "同 field"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.18em"
  micro:
    fontFamily: "同 field"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.16em"
  handle:
    fontFamily: "同 field"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0.02em"
  counter:
    fontFamily: "同 field"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  # 切换页预览层（`Preview.astro`）的缩略档位；不并入正式页阶梯（2026-10-19）。
  preview-body:
    fontFamily: "同 display"
    fontSize: "0.52rem"
    fontWeight: 400
    lineHeight: 1.55
  preview-field:
    fontFamily: "同 field"
    fontSize: "0.42rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0.08em"
  preview-label:
    fontFamily: "同 field"
    fontSize: "0.4rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.14em"
  preview-note:
    fontFamily: "同 display"
    fontSize: "0.44rem"
    fontWeight: 400
    lineHeight: 1.55
  preview-micro:
    fontFamily: "同 field"
    fontSize: "0.38rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.14em"
rounded:
  paper: "0（纸是直角，撕边/圆角一概没有）"
  stamp: "3px"
spacing:
  sheet: "min(48rem, 100%)"
  block: "1.75rem"
  line: "1.8"
  tractor: "1.5rem"
components:
  link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    textDecorationColor: "{colors.line}"
  link-hover:
    textColor: "{colors.ink}"
    textDecorationColor: "{colors.ink}"
  dim:
    textColor: "{colors.dim}"
  field-label:
    textColor: "{colors.dim}"
    typography: "{typography.label}"
  section-label:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  rule:
    borderColor: "{colors.line}"
  stamp:
    textColor: "{colors.stamp}"
    borderColor: "{colors.stamp}"
---

# Design System: Fax — The Fax Transmission Sheet

## Overview

**Creative North Star: "The Fax Transmission Sheet（传真传输纸）"**

主页是一张刚从传真机里送出来的 A4 宽幅传输纸，摊在暗色办公桌上。纸面上第一眼看到的是
**FAX TRANSMISSION 表单**：`TO / FROM / DATE / PAGES` 四行字段，标签走机器打的等宽英文，
值落在字段的下划线上，右上角压着一枚歪斜的红章。往下才是正文——备注、明细、订单、纪录、技能、结账，
每区一段虚线拉开的标签，段末一枚页码。纸的两侧各有一列走纸孔，孔的间隔像连续打印纸那样均匀。

信息不是"排"在网页上，是"传输"过来的：纸被送出来（自上方展开）、章被按下去，然后整张纸就不再动。
正文的字面是磨损的打字机——复写纸上一遍遍打出来的字，边缘毛糙、基线略微不稳，**这个质感就是这套的主角**。

与热敏小票（receipt）的区别是刻意的：纸更宽（48rem 对 30rem）、有表单表头与走纸孔、
分区标题是**单侧虚线**、行间是**整幅虚线**而不是点引导线、没有撕边、没有多语言并排、也没有段码数字。

**Key Characteristics:**
- 一张纸、一条竖流；没有卡片、没有栅格、没有第二层纸。
- 表头是**表单**，不是标题组：`<table>` 的四行字段 + 双线收口 + 发信地。
- 两侧走纸孔是唯一"纸的物理结构"（`aria-hidden`，窄屏隐藏）。
- 墨只有三档（ink / dim / line）；彩色只有一个（红章），连选区与焦点环都不用红。
- 数字不另起声部：页码、合计都用 Courier Prime 的打字机数字，与表单统一。

## Colors

桌面 + 纸 + 墨 + 章，四样材料。

### Primary
- **Ink（墨）`#322e26`**: 正文、标题、链接。纸上的唯一"黑"（纸面对比度 11.66:1）。

### Accent
- **Stamp Red（章泥红）`#9c3b31`**: 全页唯一彩色。只属于红章（`RECEIVED` / 已收 / 受領）。
  纯色对纸面 5.88:1（最深的纸边 5.37:1）；叠上 `opacity .86` + `multiply` 后的实际观感读数
  对纸面 4.80:1、对纸边 4.66:1，仍过 AA。焦点环、选区、错误态**都不用它**。

### Neutral
- **Paper（纸）`#f2eee4`**: 纸面基准色。
- **Paper-2（暗纸边）`#eae4d6`**: 仅供纸面渐变的最下缘——**明度衰减只在最后 12% 展开**
  （`paper 0% → paper 88% → paper-2 100%`）。这样淡墨 `dim` 在正文可能出现的最低处仍 ≥4.57:1；
  若把衰减拉成整幅（58% 起），页脚处会掉到 4.46:1，不合格。
- **Dim（淡墨）`#6f6656`**: 字段标签、序号、URL、页码、样例声明。纸面 4.88:1、纸边最深处 4.46:1（不使用于该处）。
- **Line（虚线）`#c9c1af`**: 分区虚线、字段下划线、走纸孔分界、链接下划线。**非文本**。
- **Back（桌面）`#242220` / Back-Deep（桌沿）`#191715`**: 径向渐变的两端（只有这两个色，不引入第三个灰）。
- **Shadow** `rgba(0, 0, 0, 0.55)`: 纸影唯一的构成（drop-shadow），不是纸面色。

### Named Rules
**The One Red Rule.** 红只属于章。任何新元素不得用红表达"强调"；焦点环走墨色，选区走反白。
**The Two-Ink Rule.** 墨只有 ink / dim 两档文本色（line 是线，不是字）。层级先由明度表达，再考虑字号。
**The Last-12-Percent Rule.** 纸面渐变只允许出现在最后 12% 的高度里。想加整幅渐变，先把 dim 调深并重测。

## Typography

**Label / Field / Footer Font:** Courier Prime（表单机打的等宽英文；含 400/700 与斜体，本页只用 400）
**Body Font:** TT2020 Style D（高保真磨损打字机字面——**这套的主角**）
**CJK Font:** Zhuque Fangsong（朱雀仿宋，与打字机字面同灰度地并置）

**Character:** 表单行是"机器打印的"，因此必须端正、等距、字距拉开；正文是"人打的"，
因此必须带磨损：TT2020 Style D 的字面边缘毛糙、同一字符两次出现也不完全一样，
中文落在仿宋的书写笔意里，和磨损的拉丁混排不打架。

### 字号 / 字距 / 行高登记（CSS 中的每一个值）

| 选择器 | 字族 | 字号 | 字距 | 行高 |
|---|---|---|---|---|
| `.fx`（正文基准） | TT2020 Style D → Zhuque | 0.9375rem | 0 | 1.8 |
| `.fx-caption`（FAX TRANSMISSION） | Courier Prime | 0.9375rem（≤560px 0.8125rem） | 0.2em（≤560px 0.14em） | 1.4 |
| `.fx-caption-brand` | Courier Prime | 0.6875rem | 0.24em | 继承 1.4 |
| `.fx-meta th`（TO / FROM / DATE / PAGES） | Courier Prime | 0.6875rem | 0.18em | 1.6 |
| `.fx-meta td`（字段值） | Courier Prime | 0.8125rem | 0.04em | 1.7 |
| `.fx-name`（h1） | TT2020 Style D | clamp(1.5rem, 4.2vw, 1.875rem) | 0 | 1.25 |
| `.fx-headline` | TT2020 Style D | 0.9375rem | 0 | 1.8 |
| `.fx-loc`（发信地） | Courier Prime | 0.6875rem | 0.12em | 继承 1.8 |
| `.fx-stamp` | Courier Prime | 0.6875rem（≤560px 0.625rem） | 0.28em（≤560px 0.2em） | 1.2 |
| `.fx-block::after`（段末页码） | Courier Prime | 0.625rem | 0.18em | 继承 1.8 |
| `.fx-sec`（分区标题） | Courier Prime | 0.6875rem | 0.26em | 1.6 |
| `.fx-note`（描述） | TT2020 Style D | 0.8125rem | 0 | 1.7 |
| `.fx-idx`（序号） | Courier Prime | 0.6875rem | 0.08em | 继承 1.8 |
| `.fx-handle`（URL） | Courier Prime | 0.75rem | 0.02em | 继承 1.8 |
| `.fx-tags` | Courier Prime | 0.6875rem | 0.06em | 继承 1.8 |
| `.fx-period`（年份区间） | Courier Prime | 0.8125rem | 0.04em | 继承 1.8 |
| `.fx-total-label`（合计） | Courier Prime | 0.6875rem | 0.22em | 继承 1.8 |
| `.fx-total-num` | Courier Prime | 1.5rem | 0.04em | 1 |
| `.fx-end`（END OF TRANSMISSION） | Courier Prime | 0.6875rem | 0.24em | 继承 1.8 |
| `.fx-sample`（样例声明） | Courier Prime | 0.625rem | 0.16em | 继承 1.8 |

- 字距只出现在**机器打印的字**上；TT2020 一律不加字距（它自带不稳定基线，再加就假）。
- `<h2>` 的 `text-transform: uppercase` 作用于纯拉丁（zh/ja 无变化）。

### 字体选型记录（六项，依据 docs/fonts/selection-guide.md 流程）
1. **隐喻与特征**: 传真机 / 复古办公室 → 表头必须"机器打的等宽英文"（端正、等距、可拉开字距），
   正文必须"人打的磨损打字机"（边缘毛糙、基线不稳）；中文需与打字机同灰度的书写体，
   不能是点阵（点阵属热敏小票的语言）。
2. **角色分配**: 表头 / 字段 / 标签 / 页码 / 合计 / 红章 = **Courier Prime**；
   正文 / 姓名 / 描述 = **TT2020 Style D**；中文 = **Zhuque Fangsong**（前两者的 CJK 回退位）。
   数字不单设声部（没有段码），与打字机统一。
3. **为什么是它们**: Cutive Mono（receipt 用）字面偏"干净现代"，缺磨损；Handjet / Silkscreen 是
   工程与像素语言；League Mono 无磨损基线。Courier Prime 是表单机打的经典字面，等宽数字天然对齐字段。
   TT2020 Style D 相对 TT2020 Base 磨损更重、字符随机性更明显，正是复写纸的物理质感——
   **磨损是这套的主角**，故用重磨损的 Style D 而非 Base。中文没有用点阵（Ark Pixel）：
   点阵属热敏小票，传真纸是"打出来的"，需要仿宋。
4. **实际覆盖与回退（fontkitten 实测 cmap）**: TT2020 Style D 子集 2008 字形，ASCII 95/95，CJK / 假名 0；
   Courier Prime latin ASCII 95/95；Zhuque Fangsong 由外部字体目录提供完整 core-cjk cmap
   （12,882 个映射码位，GB2312 6763/6763），覆盖本页三语全部 CJK / 假名；
   2026-10-30 `fonts:audit` 对本页无缺字警告。回退仍保留 Songti SC / SimSun 以应对字体加载失败。
5. **字重 / 轴 / 体积 / 许可**: 三者均为单字重静态字体（无可变轴）。体积：TT2020 Style D 子集 310KB、
   Courier Prime latin-400-normal 18.6KB（astro.config 注册了 8 个变体，本页只用到 400 normal）、
    Zhuque 为 161 个 WOFF2 分片、字体文件合计 5,927,616 B（家族包 5,998,018 B），
    浏览器只请求 `unicode-range` 命中的分片。
    许可：三者均 SIL OFL-1.1
    （见 `fonts.catalog.json` 对应 package manifest 的 `licenses/` 记录）；许可全文随外部
    package 提供，主仓不再复制。
6. **缺失回退顺序**:
   - 标签 / 字段：`Courier Prime → Zhuque Fangsong → Courier New → Songti SC → SimSun → monospace`
   - 正文：`TT2020 Style D → Zhuque Fangsong → Courier New → Songti SC → SimSun → monospace`

### Named Rules
**The No-Bold Rule.** 不用字重与斜体区分层级（`strong` / `em` 若引入需先改本规范）。
层级 = 墨的明度档 + 字号 + 字距。
**The Machine-Lettering Rule.** 字距只给"机器打印的字"（Courier Prime）。正文一律 0 字距。

## Layout

- 纸：`.fx-stage` 宽 `min(48rem, 100%)`，桌面居中；`<body>` 用 grid 的 `place-items: start center` 定位。
- 纸内边距 `2.75rem clamp(1.25rem, 4vw, 3.25rem) 2rem`——左右额外留出走纸孔列（1.5rem）的地盘。
- **表头**：`<table class="fx-meta">`，`caption` 是机打抬头（`FAX TRANSMISSION` + 站名小字），
  下方 `3px double` 双线收口；四行字段 `th`（6.5rem 固定列）+ `td`（值），行间是 1px 虚线字段线；
  发信地另起一行小字（`ORIGIN` + 地点）。
- **正文分区**：六个 `.fx-block`，间距 1.75rem；标题 = 标签 + 单侧虚线（`::after { flex: 1 }`）拉到纸边；
  段末右对齐页码（`P.02`…），由 CSS 计数器生成（`counter-reset: fx-page 1`，每区 +1），封面即 P.01。
- **明细行**：`序号（2.25rem 固定列） / 标签 / URL（右端省略）` 三列网格，行间整幅虚线；
  订单与纪录是"标签 + 值 + 描述 + 标签行"的短块，不做行内拉平。
- **结账**：合计（标签 + 两位数字 + 单位）+ 回传地址 + 备注。
- **页脚**：`3px double` 双线切出，居中 `END OF TRANSMISSION · P.07` + 样例声明。
- **响应式**：≤767px 隐藏走纸孔、纸内边距收成 `2rem 1.25rem 1.5rem`，纸满宽；
  ≤560px 抬头字号与字距收紧（给红章让位）、字段标签列 4.25rem、URL 隐藏、明细行收成两列、红章缩小。
  跨视口 DOM 顺序与视觉顺序一致，不倒置。

## Elevation & Depth

**只有一层深度：纸与桌面。** `filter: drop-shadow(0 20px 44px rgba(0,0,0,.55))` 放在外层
`.fx-stage` 上（不放在纸上：走纸动画的 `clip-path` 会把子元素自己的投影裁掉）。
纸内任何元素都没有 shadow——传真纸是平的。

## Shapes

- 纸：**直角**。没有圆角、没有撕边（撕边是小票的语言）。
- 双线：`3px double`——抬头收口与页脚分割（表单纸的经典收边）。
- 虚线：字段线与分区线都是 `1px dashed`；整幅横穿，不做点引导线（那是小票的机制）。
- 走纸孔：`radial-gradient` 圆点列，孔半径 3px、纵向步距 0.95rem，两侧各有 1px 虚线分界；`opacity: .82`
  让它像"透过纸看到的暗桌面"而不是纯黑点。
- 红章：`3px` 圆角矩形 + `2px` 实线边框 + `1px` 内衬，`rotate(-7deg)`，`mix-blend-mode: multiply`。
- 链接下划线：1px、虚线色、offset 3px；悬停时变墨色并加粗到 2px（像被敲了第二遍）。

## Components

### Transmission Header（表头，签名组件）
- **结构**：`<table>` + `<caption>`；`TO / FROM / DATE / PAGES` 四行，`th scope="row"`。
  `FROM` 的单元格里放 `<h1>`（姓名）与 headline——这份传真是"他"发的。
- **字段值**：`TO` = 收件人（这份传真发给"读它的人"），`DATE` = 构建日（`YYYY-MM-DD`，UTC，与语言无关），
  `PAGES` = 封面 + 实际渲染的分区数（真实计数），`FROM` = 姓名 + headline。
- **机打英文不翻译**：`FAX TRANSMISSION` / `TO` / `FROM` / `DATE` / `PAGES` / `END OF TRANSMISSION`
  是传真机自己印的表单行，各地传真封面纸都印同一批词；理由登记在 `messages.ts` 文件头。
- **A11y**：`caption` 即表格名；`article` 用 `aria-labelledby` 指向 `<h1>`。

### Tractor Feed（走纸孔）
- **形态**：两侧 `1.5rem` 宽的圆点列 + 1px 虚线分界；`aria-hidden="true"`、`pointer-events` 不参与交互。
- **行为**：≥768px 显示，≤767px `display: none`（窄屏没有空间，纸改满宽）。

### Section Labels & Page Numbers
- **标题**：`<h2>` 可见文字 + 单侧虚线；`text-transform: uppercase` 只影响拉丁。
- **页码**：`.fx-block::after` 用 CSS 计数器生成 `P.0n`，不占 DOM、不参与结构；封面是 P.01。

### Rows（明细 / 订单 / 纪录 / 技能）
- **明细行**：序号（淡墨）+ 链接（墨）+ URL（淡墨、右端省略）；行间 `1px dashed`。
- **订单**：序号 + 标题（有 url 则链接）+ URL + 描述（≤48ch）+ 标签行（`/` 分隔，淡墨、Courier）。
- **纪录**：年份区间（Courier）+ 机构 + 角色（淡墨）；描述独立成行。
- **技能**：一行，`/` 分隔。
- **Semantics**：六个分区各一枚可见 `<h2>`，`aria-labelledby` 指向它；序号 / URL / 走纸孔 / 红章 /
  页码一律不进可访问名。

### Links
- **Style**：墨色 + 虚线色下划线（1px、offset 3px）；无边框、无背景。
- **Hover**：仅 `(hover: hover) and (pointer: fine)`；下划线转墨色并加粗到 2px，瞬变无过渡。
- **Touch**：`pointer: coarse` 时纵向 padding 0.55rem（命中高度 ≥44px）。
- **Focus**：2px 墨色 outline、offset 3px——**不是红色**。

### Stamp（红章）
- **Style**：表头右上、`rotate(-7deg)`、双层边框、字距 0.28em、`opacity: .86`、`mix-blend-mode: multiply`。
- **Motion**：首屏走纸结束后落下（见下）。
- **A11y**：`aria-hidden`——章是语气，不承担状态语义。

### Motion（动效）
动效语言 = **传真机的走纸过程**，只做两件事，做完即静止：
- **走纸进入**（一次性，纯 CSS）：`.fx-sheet` 的 `clip-path: inset(0 0 92% 0)` 展开到 `inset(0)`，
  同时 `translateY(-0.9rem) → 0`；`640ms cubic-bezier(0.2, 0.75, 0.3, 1)`。纸像被机器自上而下送出来。
- **落章**：`.fx-stamp` 从 `opacity 0 / rotate(-3deg) / scale(1.5)` 压到 `opacity .86 / rotate(-7deg) / scale(1)`；
  `240ms cubic-bezier(0.2, 0.7, 0.3, 1)`，延迟 420ms（走纸接近落定时按下）。
- **滚动进入视口**（复用共享 `IntersectionObserver`，只播一次；见 `docs/adr/0001`、`docs/adr/0003`）：
  分区与页脚 `opacity 0 / translateY(8px) → 自然态`，280ms `ease-out`，`--d` 可错落。
- **fill-mode 不用于隐藏内容**：纸的走纸不用 fill-mode（结束后回自然态）；只有落章用 `backwards`
  压住 420ms 延迟期间的闪现，且其结束帧与自然态完全一致——两者都不存在"动画不推进 = 看不见"。
- **持续动效：无。** 论证：传真件是静止的纸——机器只在"送纸"和"盖章"两个瞬间动过，
  之后没有任何东西会自己闪。整套的动效配额全花在这两个机械动作上。
- `prefers-reduced-motion: reduce`：不生成动画与过渡，纸与章直接呈现终态（章仍是 `rotate(-7deg)`、`opacity .86`）。

## Do's and Don'ts

### Do:
- **Do** 把表头当真表单排：固定标签列、字段下划线、双线收口；`th scope="row"`。
- **Do** 用墨的明度 + 字号 + 字距表达层级；红只给章。
- **Do** 让正文保持 0 字距、0.9375rem / 1.8，磨损交给 TT2020 自己。
- **Do** 段落用整幅虚线 + 单侧虚线标题；页码交给 CSS 计数器。
- **Do** 窄屏主动收掉走纸孔与 URL，而不是让它们溢出。
- **Do** hover 只改下划线、focus 用墨色 outline；触屏命中区 ≥44px。

### Don't:
- **Don't** 引入第二个彩色、第二层纸或第二套圆角；纸永远是直角。
- **Don't** 复用热敏小票的机制：撕边、多语言并排、点引导线、七段数字——这套一个都不要。
- **Don't** 给 TT2020 加字距或字重；磨损字面靠原样呈现。
- **Don't** 加扫描线、噪点动画或持续闪烁——那是 CRT 的语言，不是传真纸的。
- **Don't** 把走纸动画写成"未推进 = 看不见"：不用 `both/forwards` 固化起始帧。
- **Don't** 在纸的下缘 12% 之外再加深纸色（会击穿 dim 的 4.5:1）。

## Project Contract（本项目契约）

- **核心字段必须渲染**：`name` / `headline` / `bio` / `links`。
- **取数**：`loadDesignView('fax', Astro.url.pathname)`（`src/lib/site.ts`）——语言由路径统一解析，
  页面不接触文件路径、不自行判断语言。
- **扩展区块取舍**：四个全部渲染——`projects`（订单）、`experience`（纪录）、`skills`（技能）、
  `contact`（结账：回传地址 + 合计）；无数据时该区块（连同它的页码）整段不渲染，`PAGES` 随实际分区数变化。
- `<HeadMeta {...view.head} />` 原样引入；页面操作、主题切换与语言切换由**全站共享操作菜单**承担
  （无条件接入 `<ContextMenu config={view.contextMenu} />`）——本页不留任何可见切换入口。
  菜单是项目级 chrome（中性外观），其 lucide 图标不受本规范「不做图标」的约束。
- **字体接线**：`--font-courier-prime` / `--font-tt2020-styled` / `--font-zhuque`
  （astro.config 的 fonts 注册 → 页面 `<Font>`（不 preload）→ 本文件 `@theme inline`）；
  CSS 入口保持 `@import "tailwindcss" source(none); @source "./";`。
- **与实施简报的偏差（有意）**：简报的「标签 + 点引导线 + 值」在表头改为**表单下划线**——
  点引导线是 receipt 的机制，本套要求与 receipt 一眼可辨，故字段值改为落在虚线下划线上。
- 对比度实测（WCAG 公式，本机计算）：ink / paper 11.66、ink / paper-2 10.66、dim / paper 4.88、
  dim 在渐变最低处 4.57、红章 / paper 5.88、红章叠 blend 后 4.80、ink 反白选区 11.66。
  结论同步到 `docs/verification/`。
