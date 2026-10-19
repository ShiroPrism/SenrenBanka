---
name: Archive — The Card Catalog
description: 图书馆卡片目录：一只拉开的胡桃木抽屉，里面立着一叠马尼拉索引卡——凸出的类目签、印刷横线、卡底打孔与一枚「已归档」红章。
colors:
  back: "#2b211a"
  back-rise: "#3a2c21"
  back-deep: "#1a120d"
  paper: "#eee4cf"
  paper-2: "#e6dbc2"
  ink: "#2b241a"
  dim: "#6b5e4a"
  line: "#cfc3a9"
  stamp: "#8a3a2f"
typography:
  display:
    fontFamily: "'Sorts Mill Goudy', Georgia, 'Zhuque Fangsong', 'Songti SC', 'SimSun', serif"
    fontSize: "clamp(2rem, 7vw, 2.6rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "0.01em"
  display-compact:
    fontFamily: "同 display"
    fontSize: "clamp(1.8rem, 8vw, 2.2rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "0.01em"
  headline:
    fontFamily: "同 display"
    fontSize: "1.125rem"
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.5
  headline-compact:
    fontFamily: "同 display"
    fontSize: "1rem"
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.5
  body:
    fontFamily: "'Courier Prime', 'Courier New', 'Zhuque Fangsong', 'Songti SC', 'SimSun', monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.9
  note:
    fontFamily: "同 body"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.7
  meta:
    fontFamily: "同 body"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: "同 body"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.9
    letterSpacing: "0.16em"
  micro:
    fontFamily: "同 body"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.9
    letterSpacing: "0.18em"
  tab:
    fontFamily: "同 body"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.16em"
  tab-compact:
    fontFamily: "同 body"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.14em"
  tab-no:
    fontFamily: "同 body"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.08em"
  tab-no-compact:
    fontFamily: "同 tab-no"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.08em"
  stamp:
    fontFamily: "同 body"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "0.26em"
  total:
    fontFamily: "同 display"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  thanks:
    fontFamily: "同 display"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.9
    letterSpacing: "0.04em"
  # 切换页预览层（`Preview.astro`）的缩略档位。预览是卡片的**缩微引述**，不是正式页；
  # 这三个档位只为缩略比例而设，**不并入**上面的正式页阶梯（2026-10-18 登记）。
  preview-micro:
    fontFamily: "同 body"
    fontSize: "0.5rem"
    fontWeight: 400
    lineHeight: 1.7
  preview-display:
    fontFamily: "同 display"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 1.15
  preview-display-compact:
    fontFamily: "同 display"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.15
rounded:
  card: "2px"
  tab: "3px"
  drawer: "4px"
  stamp: "2px"
spacing:
  card-gap: "2.35rem（移动端 2.2rem）"
  card-padding: "2rem 1.55rem 2.4rem（移动端 1.85rem 1.05rem 2.15rem）"
  footer-gap: "2.6rem（移动端 2.3rem）"
  drawer-width: "min(44rem, 100%)"
components:
  link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  link-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  dim:
    textColor: "{colors.dim}"
  tab:
    backgroundColor: "{colors.paper-2}"
    borderColor: "{colors.line}"
    typography: "{typography.tab}"
  tab-no:
    textColor: "{colors.stamp}"
    typography: "{typography.tab-no}"
  stamp:
    textColor: "{colors.stamp}"
    borderColor: "{colors.stamp}"
    typography: "{typography.stamp}"
  entry:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  leader:
    borderColor: "{colors.line}"
  total:
    textColor: "{colors.ink}"
    typography: "{typography.total}"
  foot:
    textColor: "{colors.dim}"
    typography: "{typography.micro}"
---

# Design System: Archive — The Card Catalog

## Overview

**Creative North Star: "The Card Catalog（卡片目录）"**

主页是一张深胡桃木桌面上被拉开的抽屉。抽屉里立着七张马尼拉索引卡：第一张是卡头（姓名、副标题、所在地、一枚「已归档」图章），其余六张各是一个分区。每张卡的类目名不是印在卡面里的标题，而是**凸出卡沿的类目签**——签上左侧是红色编号、右侧是类目词，h2 就长在签上。卡片底部有一排打孔，卡面铺着极淡的印刷横线，右上角留着铅笔写的架位号。

信息不是"排"成网页，而是"归档"进抽屉：卡片按顺序叠放、相邻两张交替 0.25° 的微旋，像被手一张张推进卡盒。没有栅格、没有卡片网格、没有导航栏；顺序即层级，抽出来看一张，再推回去看下一张。

材质是三种：深胡桃木（台面与抽屉框）、马尼拉卡纸（卡片）、打字墨与铅字（内容与编号）。整个页面只有一个彩色——章泥红；它只出现在图章与类目签编号上，连焦点环都用墨色。

**Key Characteristics:**
- **七张卡的叠放流**：卡头 + 备注 / 索引 / 编目 / 履历 / 主题词 / 借阅；页脚是抽屉前沿的著录签，不另立一张卡。
- **类目签凸出卡沿**：签比卡面高 1.5rem，是 h2 的所在；这不是标签装饰，而是卡片目录的分类结构。
- **卡纸有横线、底部有孔**：`repeating-linear-gradient` 画的是卡纸印刷横线（世界材质），不是条纹装饰。
- **唯一彩色是章**：图章与类目编号；没有第二个色相、没有彩色按钮。
- **动效只有一个作者时刻**：卡片从抽屉里升起（60ms 步进），图章最后落下；之后完全静止。

## Colors

纸、墨、木，三样材料；红只有一枚章。

### Primary
- **Ink（墨）**: `#2b241a`。卡面正文、标题、链接的基准色；纸上的"黑"。
- **Stamp Red（章泥红）**: `#8a3a2f`。全页唯一彩色。只用于图章、类目签编号与文本选区；不参与焦点、警告或按钮强调。

### Neutral
- **Paper（卡纸）**: `#eee4cf`。马尼拉卡纸的基准色；卡面自上而下极缓地转向 `paper-2`，模拟卡片受光与堆叠阴影。
- **Paper-2（卡纸下缘 / 签）**: `#e6dbc2`。类目签、卡底渐变、页脚著录签。
- **Dim（淡墨）**: `#6b5e4a`。编号、URL、注释、所在地、页脚小字。两档纸色上的对比度分别为 5.0:1 与 4.6:1（均 ≥4.5:1）。
- **Line（印刷线）**: `#cfc3a9`。卡面横线、索引点引导、虚线戳、链接下划线；**非文本**，不承载信息。
- **Back / Back-Rise / Back-Deep（木与影）**: `#2b211a` / `#3a2c21` / `#1a120d`。桌面径向渐变、抽屉木框、抽屉内影；`back-rise` 只用于受光面。

### Named Rules
**The One Red Rule.** 红只属于章与类目签编号（及 `::selection`）。任何新元素不得用红表达"强调"。
**The Paper Pair Rule.** 纸只有两档（paper / paper-2）；层级先由墨的明度与字号表达，再考虑纸色。
**The Wood Is Not UI Rule.** 木色只出现在抽屉框与桌面上；卡片内部不得使用木色做背景或边框。

## Typography

**Display / Head Font:** Sorts Mill Goudy（旧式衬线，正体 + 斜体；回退 Georgia）
**Record / Body Font:** Courier Prime（打字机等宽；回退 Courier New / Courier）
**CJK Font:** Zhuque Fangsong（朱雀仿宋；作为两条字体链的中文尾部，回退 Songti SC / SimSun）

**Character:** 卡片目录的字面是"印刷标题 + 打字记录"：姓名与副标题落在 Sorts Mill Goudy 的旧式衬线里（斜体像卡片头上手写的副题），条目、编号、字段标签落在 Courier Prime 的打字机网格里。中文不另起一套黑体，而是用朱雀仿宋接在两条链的尾部——仿宋的横细竖粗与卡纸的印刷质感同源，也比黑体更像"档案里会出现的字"。字重只有 400：层级由字号、字距与墨的明度承担。

### 字体选型记录（六项，依据 docs/fonts/selection-guide.md 流程）
1. **隐喻与特征**: 图书馆卡片目录 → 需要"阅读型旧式衬线"承担卡头与副标题，需要"打字机等宽"承担条目、编号与字段标签，需要一个与纸面共处的中文声部；选型指南的「档案卡 / 图书馆」方向明确要求"阅读型衬线 + 编号 / 标签用等宽或打字机体"。磨损感不属于这里（磨损打字机是 fax 的主角）。
2. **角色分配**: 卡头姓名 / 副标题 / 合计数字 / 页脚致谢 = Sorts Mill Goudy；正文、条目、编号、类目签、图章 = Courier Prime；中文（简中与日文汉字 / 假名）= Zhuque Fangsong。
3. **为什么是它而非其他**:
   - Sorts Mill Goudy 而非 Prociono：两者都是旧式衬线，但 Sorts Mill Goudy 有**真斜体**（卡头副标题需要），Prociono 只有罗马正体；前者的书卷气与 Goudy 的书法笔形更接近图书馆目录的印刷传统。
   - Sorts Mill Goudy 而非 Fraunces：Fraunces 是可变展示衬线，对比度高、气质更"现代编辑设计"；本套要的是安静的目录卡，不是杂志封面。
   - Courier Prime 而非 Cutive Mono：Cutive Mono 已经是 receipt 的"现代打印机"声部；Courier Prime 的字面更接近办公室打字机，且有 400 / 700 正斜四态，本套只用 400 以保持记录感。TT2020 是磨损打字机，留给 fax。
   - Zhuque Fangsong 而非 Ark Pixel：中文只有朱雀仿宋与方舟像素两条开放路径；像素黑体是 pager 的语言，会与卡纸 / 墨水世界冲突。朱雀的 GB2312 全量与假名覆盖也能承接日文页面。
4. **实际覆盖与回退**:
   - Sorts Mill Goudy：latin 95/95 ASCII + latin-ext；无 CJK。中文回退 Zhuque → Songti SC / SimSun。
   - Courier Prime：latin 95/95 + latin-ext，400 / 700 × 正 / 斜四态；无 CJK。中文回退 Zhuque → Songti SC / SimSun。
   - Zhuque Fangsong：GB2312 6763/6763，假名 189 枚（子集，站内用字已核）；日文汉字由同一子集承接，缺字再回退系统宋体。
5. **字重 / 轴 / 体积 / 许可**:
   - Sorts Mill Goudy：单字重 400，正 / 斜两态 × latin / latin-ext，共 4 文件 69KB；无可变轴；OFL-1.1，带 RFN（"Sorts Mill Goudy"），本项目**原样分发、未改名未修改**。
   - Courier Prime：400 / 700 × 正 / 斜，共 8 文件 137KB；无可变轴；OFL-1.1。
   - Zhuque Fangsong：单字重 400，子集 246KB；无可变轴；OFL-1.1（无 RFN）。
6. **缺失回退顺序**:
   - 显示 / 卡头：`--font-sorts-mill-goudy → Georgia → --font-zhuque → Songti SC → SimSun → serif`。
   - 正文 / 记录：`--font-courier-prime → Courier New → --font-zhuque → Songti SC → SimSun → monospace`。
   - 两条链都含系统中文与通用族兜底；断网、无 JS 或字体加载失败时版式仍可读。

### Hierarchy
- **Display**（400, `clamp(2rem, 7vw, 2.6rem)`, 1.15）：姓名。移动端 `clamp(1.8rem, 8vw, 2.2rem)`。
- **Headline**（400 italic, 1.125rem, 1.5）：副标题；移动端 1rem。斜体只属于拉丁声部——`:lang(zh-CN)` / `:lang(ja)` 下保持正体，不使用合成斜体。
- **Body**（400, 0.9375rem, 1.9）：简介、索引行、条目主体。
- **Note**（400, 0.8125rem, 1.7）：项目 / 履历描述。
- **Meta**（400, 0.75rem）：所在地、URL、日期、签上的类目词、图章。
- **Label**（400, 0.6875rem）：字段名、编号、页脚标题。
- **Micro**（400, 0.625rem）：借阅日期戳、样例声明。
- **Total / Thanks**（400）：合计 1.75rem；致谢 1rem。

### Letter-spacing scale（CSS 中出现的全部字距）
`0.01em`（姓名）/ `0.04em`（合计、致谢）/ `0.06em`（所在地、日期）/ `0.08em`（签编号、索引编号）/ `0.1em`（项目主题词）/ `0.12em`（合计单位）/ `0.14em`（移动端签标题）/ `0.16em`（签标题、字段名、主题词前缀）/ `0.18em`（索书号、日期戳、样例声明）/ `0.2em`（合计标签、移动端图章）/ `0.22em`（品牌行）/ `0.24em`（页脚标题、抽屉行）/ `0.26em`（图章）。

### Named Rules
**The No-Bold Rule.** 不用字重区分层级：字号、字距、墨的明度是全部手段（只用 400）。
**The Typed Record Rule.** 所有编号、字段名、URL 与图章都走打字机声部；衬线只属于卡头与"合计 / 致谢"两处收尾。

## Layout

- **抽屉**：`width: min(44rem, 100%)`，居中；木框内边距 0.55rem（移动端 0.35rem），内腔用左右两道收边阴影把卡片"立"进去。
- **卡片流**：`display: flex; flex-direction: column`；卡与卡之间 2.35rem（移动端 2.2rem），第一张不加上间距。相邻卡片交替 `-0.25deg` / `+0.25deg`；页脚不旋转。
- **类目签**：绝对定位在卡顶上方 1.5rem、左 1.15rem；签高约 1.9rem，正好露出卡沿。签内顺序 = 红色编号 → 类目词（h2）。移动端签变为满宽卡顶条（左 / 右贴齐卡沿，圆角与侧边框取消）。
- **卡面**：内边距 2rem 1.55rem 2.4rem（移动端 1.85rem 1.05rem 2.15rem）；横线每 1.6rem 一道（`repeating-linear-gradient`），只是纸的印刷纹理。正文栏宽：卡头副标题 ≤48ch、简介 ≤56ch、条目描述 ≤58ch——卡宽 44rem，右侧留出档案卡的空白。
- **卡头**：品牌行（右侧留 4rem 给铅笔号）→ 姓名 → 副标题 → 所在地 → 索书号 + 图章；右上角一枚铅笔架位号。
- **索引行**：编号 + 链接 + 点引导线 + URL 同行拉平；URL 最多 42% 宽、溢出省略。
- **页脚**：抽屉前沿的著录签——h2「著录」→ 借阅日期虚线戳 → 致谢 → `DRAWER 03 · ARCHIVE` → 样例声明，居中。
- **响应式**：≤640px 取消旋转、签变成卡顶横条、URL 与点引导线隐藏（行只留编号与标签）、卡头缩小；无横向溢出。
- **与 receipt 的不同构**：receipt 是一联连续纸带 + 两翼虚线分栏；archive 是**离散的卡片堆** + 凸出的类目签 + 木抽屉。两者不共享版式骨架。

## Elevation & Depth

**只有一条深度轴：卡片 ↔ 抽屉。** 卡片用柔和的低透明度阴影落在抽屉内腔（`0 22px 30px -24px`），卡与卡之间靠 2.35rem 的缝隙与交替微旋形成"叠"。没有硬偏移阴影、没有内发光、没有玻璃模糊。
- 抽屉内腔只有 `inset` 阴影（顶部更深、底部更浅），模拟拉开的木抽屉。
- 卡纸自身只有 1px 的受光边（`0 1px 0` 的 paper/line 混合），不是第二层投影。
- Hover / focus-within：卡片转正并抬起 0.2rem，阴影略加深；这是"把卡抽出来一点"，不是浮起的面板。

## Shapes

- **卡**：2px 圆角（纸卡裁切，不是 UI 圆角）；没有描边。
- **类目签**：3px 顶角、底边不封口（与卡面连成一张纸）；1px line/dim 混合描边。
- **图章**：2px 实线边框、2px 圆角、旋转 -7°，`mix-blend-mode: multiply`。
- **打孔**：卡底一排 0.2rem 半径的暗孔（`radial-gradient` + `repeat-x`），间距 2.5rem。
- **线**：卡面横线 1px；点引导 2px dotted；日期戳 1px dashed；链接下划线 1px、offset 3px。
- **索引符号**：编号、`SB · 03 · 02` 索书号、`3-B` 铅笔号、`DRAWER 03 · ARCHIVE` 都是字符，不是图标。

## Components

### Cards & Tabs（卡片与类目签）
- **卡片**: 背景 = 卡纸横线层 + paper→paper-2 渐变；`transform: rotate(var(--ar-rot))`。
- **类目签**: 凸出卡沿的左对齐凸片；`h2` 直接写在签上（`ar-tab-title`），红色编号 `ar-tab-no` 为装饰（`aria-hidden`）。
- **卡头**: 签为装饰（整块 `aria-hidden`），因为卡头的标题是卡面上的 `h1`。
- **Semantics**: 六个内容分区各有一枚可见 `h2`（备注 / 索引 / 编目 / 履历 / 主题词 / 借阅），`aria-labelledby` 指向签上的 h2；页脚有可见 `h2`「著录」；姓名是唯一 `h1`。

### Head Card & Stamp（卡头与图章）
- **Head**: 品牌行（SENRENBANKA · 索引卡）→ 姓名（Goudy）→ 副标题（Goudy italic）→ 所在地（字段名 + 值）→ 索书号 + 图章。
- **Stamp**: 右下角、旋转 -7°、章泥红、双层语气（2px 边框 + 字距 0.26em）、multiply 混合；`aria-hidden`，不承担状态语义。
- **Pencil**: 右上角 `3-B` 架位号，淡墨、0.55 透明度、-8°，装饰。

### Index Rows（索引 / links）
- **Row**: 编号（淡墨、两位）+ 链接（墨）+ 点引导线（line、居中）+ URL（淡墨、去协议、≤42% 省略）。
- **Touch**: `pointer: coarse` 时链接纵向 padding 0.5rem（命中区 ≈44px）。

### Catalog & Record（编目 / projects、履历 / experience）
- **Project**: 编号 + 标题（有 URL 则为链接，后随 `→ url`）+ 描述（淡墨、≤58ch）+ 主题词行（大写、字距 0.1em）。
- **Experience**: 日期（淡墨）+ 机构 + 角色（淡墨、`·` 分隔）；描述独立成行。
- **Skills**: 以 `·` 连接的主题词串，不设进度条或标签胶囊——这是一张卡，不是仪表盘。

### Circulation（借阅 / contact）
- **Total**: 合计 = `links.length`（真实数据），两位补零；标签大写、字距 0.2em；数字用 Goudy 1.75rem。
- **Contact**: 字段名 + `mailto` 链接；无邮箱时显示「未登记联系方式」；备注另起一行。
- **Semantics**: 总计数字来自 `profile.links.length`，不是装饰性数字。

### Footer（著录签）
- 抽屉前沿的一张窄纸签：可见 `h2`「著录」→ 借阅日期虚线戳（装饰、`aria-hidden`）→ 致谢（Goudy）→ `DRAWER 03 · ARCHIVE` → 样例声明（0.625rem、字距 0.18em）。
- 语气是"卡片目录的收尾"：一枚借阅日期戳、一个抽屉编号，不是网页页脚。

### Links（链接）
- **Style:** 墨色 + line 色下划线（1px、offset 3px）；无边框、无背景。
- **Hover:** 仅在 `@media (hover: hover) and (pointer: fine)` 下反白（背景→墨、文字→纸），瞬变无过渡。
- **Focus:** 2px 墨色 outline、offset 3px——**不是红色**（红只属于章）。
- **Touch:** `pointer: coarse` 时纵向 padding 0.5rem。

### Motion（动效）
- 动效语言 = **从抽屉里抽出卡片**：卡片自下方 1.1rem 处升起并淡入（380ms，短 ease-out），按 60ms 步进；图章在全部卡片落定后落下（220ms，从 1.4 倍缩放、-1° 压到 -7°，820ms 起）。之后完全静止。
- **首屏与滚动**：共享 `Reveal` 的 IntersectionObserver 触发；每张卡进入视口时按自己的 `--i × 60ms` 延迟升起。核心内容不等待（最晚的卡 420ms 开始、800ms 落定；图章 820ms 落下）。
- **只播一次**：Reveal 揭示后取消观察；图章只在卡头揭示后落下一次。
- **持续动效：无。** 卡片是档案——归档完成后不再移动；没有扫描线、没有呼吸灯、没有循环渐变。
- `prefers-reduced-motion: reduce`：全部静态，旋转保留为静态角度、hover 不抬起；内容原样呈现。
- 无 JS / 无 IntersectionObserver：`html[data-reveal-ready]` 不写入，隐藏态不生效，全部内容可见（契约见 `AGENTS.md`）。

## Do's and Don'ts

### Do:
- **Do** 让每张卡都像从抽屉里抽出来的：凸出的签、卡底孔、极淡的横线、交替微旋。
- **Do** 用墨的明度 + 字号 + 字距表达层级；红只给图章与签编号。
- **Do** 把 h2 放在类目签上——分类结构就是版式结构。
- **Do** 保持"卡片 ↔ 抽屉"的唯一深度轴；卡片内部零内发光、零硬阴影。
- **Do** 让中文落在朱雀仿宋上；日文页面同样走这条链，不另起黑体。
- **Do** 分区语义由可见 h2 承担；编号 / URL / 点引导 / 图章 / 日期戳 / 铅笔号 `aria-hidden`。
- **Do** hover 时把卡"抽出来一点"（转正 + 0.2rem），focus 用墨色 outline；触屏命中区 ≥44px。

### Don't:
- **Don't** 做成卡片网格、瀑布流或仪表盘——它是一叠被拉开的卡片流，顺序即层级。
- **Don't** 引入第二个色相或第二套圆角；红只属于章。
- **Don't** 用图像、外部请求、emoji 或 SVG 图标；全部标记是字符与 CSS。
- **Don't** 给卡片加玻璃模糊、渐变文字、硬偏移阴影——它们是别的主题的语言。
- **Don't** 做持续动效；唯一的动是"升起 + 落章"，做完即停。
- **Don't** 把图章做成按钮或状态徽章；它是盖在纸上的语气。

## Project Contract（本项目契约）

- **核心字段必须渲染**：`name` / `headline` / `bio` / `links`。
- **取数**：`loadDesignView('archive', Astro.url.pathname)`（`src/lib/site.ts`）；页面不接触文件路径、不自行判断语言。
- **扩展区块取舍**：`projects`（编目）、`experience`（履历）、`skills`（主题词）、`contact`（借阅 + 合计）全部渲染；合计 = `links.length`（真实数据）。
- `<HeadMeta {...view.head} />` 必须原样引入；页面操作、主题切换与语言切换由**全站共享操作菜单**承担（无条件接入 `<ContextMenu config={view.contextMenu} />`）——本页不保留任何可见切换入口。菜单是项目级 chrome（中性外观）：其 lucide 图标**不受**本规范「Don't 引入 SVG 图标」约束。
- 字体：`--font-sorts-mill-goudy` / `--font-courier-prime` / `--font-zhuque`（astro.config 的 fonts 注册 → 页面 `<Font>`（不 preload）→ 本文件 `@theme inline`）；CSS 入口保持 `@import "tailwindcss" source(none); @source "./";`。
- 文案：全部可见文案来自 `messages.ts`（zh-CN / ja / en）；`SENRENBANKA`、卡脊编号、`DRAWER 03 · ARCHIVE`、索书号与数据本身不翻译。
- 无障碍：`h1` ×1（姓名）；六个内容分区 + 页脚各有一枚可见 `h2` 并被 `aria-labelledby` 引用；装饰一律 `aria-hidden`；正文对比度 ≥4.5:1、大字 ≥3:1。
- 检测器说明：`repeating-linear-gradient` 只用于卡纸印刷横线（世界材质），不是条纹装饰；不得为此加忽略规则。
