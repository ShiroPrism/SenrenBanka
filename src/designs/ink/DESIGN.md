# Ink — 宋式册页 / 侘寂

> **来源**：自产（`self-produced`）。本规范先于实现；实现与规范不一致时先改规范。
>
> **一句话**：把个人资料做成一张摊开的宋式册页——宣纸、墨色、青瓷细线、朱砂印；右侧一列竖排题署，其余留给阅读与留白。

## 1. 设计隐喻

不是「古风皮肤」，而是一件**宋人册页**：一张未裁边的宣纸，右侧引首题署（姓名＋题），下钤朱砂小印，左侧是手写小引与印谱；再往后是卷帙、年表、笔触与落款。

侘寂的部分是**克制**：只有一种纸色、一种墨色、一枚印；装饰只有细线、留白与不对称的边距。所有「古意」都由版式（竖排、界栏、题签、页次）与字体（楷、仿宋、旧体衬线）承担，不靠纹样堆砌。

三条不可让渡的骨架：

1. **竖排只属于题署**：桌面端姓名与题竖排于右缘，正文始终横排可读。
2. **一枚朱砂**：整页只允许一处饱和色（印章与衍生的短划、焦点环），其余全部是纸与墨。
3. **留白先行**：内容左缘对齐一条隐形版心线，右缘让给竖排题署；不填满、不加框、不加阴影。

## 2. 色板

所有色值只在 `tokens.css` 定义一次（`--ink-*`），作用域 `:is(.ink, .ink-pv)`。对比度为 WCAG 2.x 相对亮度公式实算（2026-10-31，node 一次性脚本）。

| 令牌 | 色值 | 用途 | 实测对比度 |
|---|---|---|---|
| `--ink-paper` | `#f4eee2` | 页面宣纸底（全站唯一底色） | 墨字 **15.17:1**；次级墨 **10.36:1** |
| `--ink-paper-2` | `#ebe3d4` | 次级纸面：题签悬停底、年表行悬停 | 墨 **13.75:1**；次级墨 **9.39:1** |
| `--ink-paper-3` | `#e8e0d0` | 最深纸面：卷帙悬停底 | 墨 **13.36:1**；弱化墨 **4.87:1** |
| `--ink-ink` | `#1b1917` | 主墨：正文重音、标题、界线文字 | 纸底 **15.17:1** |
| `--ink-ink-soft` | `#3a3632` | 次级墨：小引正文、卡片描述、年表说明 | 纸底 **10.36:1** |
| `--ink-ink-muted` | `#665e52` | 弱化墨：题签标签、页次、页脚、日期 | 纸底 **5.53:1**；`paper-2` **5.01:1**；`paper-3` **4.87:1** |
| `--ink-cinnabar` | `#a13c2c` | 朱砂：印章底、焦点环、短划、链接下划线 | 纸底 **5.68:1**；其上纸白字 **5.68:1** |
| `--ink-cinnabar-deep` | `#7c2c20` | 深朱砂：悬停态下划线与强调文字 | 纸底 **8.12:1** |
| `--ink-celadon` | `#6d8b7d` | 青瓷：**仅**细线与底纹，从不承载文字 | 纸底 **3.22:1**（装饰线，不参与文字对比度） |
| `--ink-celadon-deep` | `#4e6659` | 深青瓷：引首编号文字 | 纸底 **5.40:1**；`paper-2` **4.89:1** |
| `--ink-rule` | `rgba(27,25,23,.16)` | 界栏细线（1px） | 装饰 |
| `--ink-rule-strong` | `rgba(27,25,23,.32)` | 分区基线 / 题签描边 | 装饰 |
| `--ink-rule-celadon` | `rgba(109,139,125,.55)` | 册页外框细线 | 装饰 |

- 正文最低档 `--ink-ink-soft` = **10.36:1**，弱化档 `--ink-ink-muted` 最低 **4.87:1**，均过 AA。
- **朱砂永不配纸白以外的前景**，也永不作为大面积底色；印章内只有纸白单字（**5.68:1**）。
- 青瓷只出现在 1px 线与极淡底纹上，任何文字都不能用 `--ink-celadon`（3.22:1）。

## 3. 字体（六项记录）

1. **隐喻与特征**：册页需要三种声部——题署（书写性、有笔意、可竖排）、小引正文（印刷体、灰度均匀、长文可读）、题签标签（小字号旧体衬线、字距舒展）。中文要有**楷**（题署）与**仿宋**（正文）的分工，而不是全站一套黑体。
2. **角色分配**：
   - 展示（姓名 / 题 / 分区标题 / 卷帙标题 / 落款邮箱）：`Sorts Mill Goudy`（拉丁）+ `LXGW WenKai GB`（中文楷）+ `Zhuque Fangsong`（次选）
   - 正文（小引 / 描述 / 年表说明）：`Prociono`（拉丁）+ `Zhuque Fangsong`（中文仿宋）+ `LXGW WenKai GB`（次选）
   - 题签 / 引首 / 页次 / 页脚：`Sorts Mill Goudy`（拉丁）+ `LXGW WenKai GB`（中文）
3. **为什么是它们**：`LXGW WenKai` 是项目核心 CJK 里唯一的楷体，竖排单字有笔锋，正好承担「题署」；`Zhuque Fangsong` 是仿宋，横排长文的灰度比楷体均匀，适合「小引」与描述；`Sorts Mill Goudy` 的旧体衬线在 0.72rem 的小字号题签上仍有清晰的字脚，`Prociono` 专为长篇阅读设计、大字号下有书写感，用于落款与正文拉丁。**没有新增任何字体家族**——四个变量都是项目既有生产 family，避免为风格增加许可与体积风险。
4. **实际覆盖**：`Sorts Mill Goudy` / `Prociono` 覆盖拉丁 ASCII、常用标点与拉丁扩展；`LXGW WenKai GB` 按其 GB2312 参考集承接简体与共享汉字；`Zhuque Fangsong` 按 GB2312 / JIS 参考集承接简中、日文与共享汉字。**简中**由 LXGW + Zhuque 双核心覆盖；**日文**假名由 Zhuque / LXGW 的分片承接；**英文**由前两位拉丁字体承担。三者都不承诺生僻字，缺字时按第 6 项顺序回退系统 CJK（`Songti SC` / `SimSun`），不出现豆腐块但字面会变。
5. **字重 / 轴 / 体积 / 许可**：全部只用各家族常规字重（400），不请求 500+ 字重——册页的层级由字号、字距与留白承担，不由字重承担；因此每页只加载 4 个主 face 的常规字重（`Font` 组件按 `cssVariable` 声明，无额外字重请求）。四个 family 均已过许可闸门并进入生产管线（`fonts.config.json`），本设计不新增字体资源、不附 `SOURCE-LICENSE.txt`。CJK 体积由构建期内容子集与分片裁剪控制（ADR 0013 / 0014）。
6. **回退顺序**（与本目录 `style.css` / `Preview.astro` 逐字一致）：

   - 展示：`var(--font-sorts-mill-goudy), var(--font-lxgw), var(--font-zhuque), "Songti SC", "SimSun", "Hiragino Mincho ProN", "PingFang SC", "Microsoft YaHei", serif`
   - 正文：`var(--font-prociono), var(--font-lxgw), var(--font-zhuque), "Songti SC", "SimSun", "PingFang SC", "Microsoft YaHei", "Hiragino Sans", serif`
   - 题签：`var(--font-sorts-mill-goudy), var(--font-lxgw), var(--font-zhuque), "Songti SC", "SimSun", "PingFang SC", "Microsoft YaHei", serif`

> 实施约束：每个 `font` / `font-family` 都写完整显式回退；`--font-*` 只暴露主 face；系统 CJK（`Songti SC` / `SimSun` / `PingFang SC` / `Microsoft YaHei` / `Hiragino Sans`）一律排在 `--font-lxgw` / `--font-zhuque` **之后**；本设计已选用核心 CJK，因此**每个**字体变量栈（含预览）都保留 `var(--font-lxgw)`。

## 4. 版式

- **册页**：`--ink-sheet: 66rem` 的纸面居中，`padding` 纵向 `clamp(1.6rem, 5vw, 4.2rem)`、横向 `clamp(1.15rem, 6vw, 4.75rem)`；`::before` 在纸内缩进处画一圈 1px 青瓷外框（`.75rem` 纵向 / 横向 `0.35 × pad-inline`），作为未裁边的册页边。
- **宣纸底**：`--ink-paper` + 两层极淡径向洗色（右上青瓷 7%、左下朱砂 4.5%）+ `4px` 周期墨点纸纹（3% 透明度）。只是纸的呼吸，不承载信息。
- **页眉**：左「题签」（`t.portfolio`，`0.72rem` / 字距 `0.3em` / 大写字距化），右地点与页次（`t.leaf`），下压 1px `--ink-rule-strong` 基线。
- **题署（Hero）**：桌面 `grid-template-columns: minmax(0,1fr) auto`，`grid-template-areas: "prose titles"`；右列 `writing-mode: vertical-rl`、高度 `clamp(19rem, 46vh, 26rem)`，块流从右到左依次落下「引首标签 → 姓名 → 题 → 印」。左列是小引（`--ink-measure: 33rem`，约 31 个汉字/行）与印谱。竖排语境下 DOM 首个区块落在最右列，符合竖排右起阅读方向，不是视觉倒置；移动端恢复单列后与 DOM 顺序完全一致。
- **分区**：`grid-template-columns: var(--ink-gutter) minmax(0,1fr)`；左栏 `--ink-gutter: clamp(2.1rem, 4vw, 3.6rem)` 内放竖排引首编号（`一/二/三/四`，`aria-hidden`），右栏是分区标题 + 内容；分区之间只隔 1px 墨线。
- **分区标题**：展示字体 `clamp(1.28rem, 1.9vw, 1.62rem)`、字距 `0.16em`，标题下 1px 墨线（滚动显现时从左展开到全宽）。
- **无圆角、无阴影**：整页唯一的「体积感」来自纸色层次与毫米级线宽差。

尺度表（与 `tokens.css` 一致）：

| 令牌 | 值 | 用途 |
|---|---|---|
| `--ink-sheet` | `66rem` | 纸面最大宽度 |
| `--ink-measure` | `33rem` | 正文版心（约 31 汉字/行） |
| `--ink-pad-block` | `clamp(1.6rem, 5vw, 4.2rem)` | 纸面纵向内边距 |
| `--ink-pad-inline` | `clamp(1.15rem, 6vw, 4.75rem)` | 纸面横向内边距 |
| `--ink-gap` | `clamp(1.5rem, 4vw, 3.25rem)` | 区块间距 |
| `--ink-gutter` | `clamp(2.1rem, 4vw, 3.6rem)` | 引首栏宽 |

字号（与 `style.css` 一致）：正文 `1.0625rem / 1.9`（小引 `1.95`）；姓名 `clamp(2.5rem, 3.6vw, 3.5rem)`、行高 `1.12`（竖排）/ `clamp(2.2rem, 9vw, 2.9rem)`、行高 `1.2`（横排）；题 `clamp(1rem, 1.35vw, 1.2rem) / 1.85`；题签标签 `0.72rem / 字距 0.3em`（竖排引首再加到 `0.4em`）；引首 `0.72rem / 字距 0.42em`；卷帙标题 `clamp(1.02rem, 1.4vw, 1.18rem) / 字距 0.06em`；卷帙描述 `0.98rem / 1.85`；标签行 `0.78rem / 字距 0.1em`；年表机构 `1.02rem`、职务 `0.92rem`、年代 `0.74rem / 字距 0.18em`、说明 `0.96rem / 1.85`；笔触条目 `0.98rem / 字距 0.14em`、行高 `1.9`；落款邮箱 `clamp(1.05rem, 1.9vw, 1.4rem)`；页脚 `0.72rem / 字距 0.26em`（≤480px 收到 `0.2em`）。

## 5. 组件

- **朱砂印（`.ink-seal`）**：`2.4rem` 见方、`--ink-cinnabar` 底、纸白单字（姓名首字）、内嵌 1px 纸白细框、整体 `rotate(-2deg)`；`aria-hidden="true"`，不进入可访问名。
- **题签链接（`.ink-slip-link`）**：1px `--ink-rule-strong` 描边、纸底、`0.84rem` 展示字体、字距 `0.12em`，左侧一枚 `0.4rem` 朱砂方点（`aria-hidden` 的 `<span>`）；悬停时描边转朱砂、底色转 `paper-2`（仅颜色过渡）。
- **卷帙条目（`.ink-volume`）**：无框卡片。顶部 1px 墨线 + `卷一` 式页次（青瓷深色 `0.7rem` / 字距 `0.3em`）+ `h3` 标题 + 描述 + 标签行；悬停只把底色推到 `paper-3`、标题下划线转为朱砂。
- **年表（`.ink-chronology`）**：两列 `minmax(0,1fr) auto`；机构加重、职务次级、年代右对齐弱化墨；行间 1px 墨线，描述跨两列。
- **笔触（`.ink-brushwork`）**：可换行列表，每条前置一段 `0.5rem` 朱砂短划（伪元素，无文本），条目用展示字体、字距 `0.14em`。
- **落款（`.ink-colophon`）**：邮箱是唯一的主链接，朱砂下划线（1px，`underline-offset 0.34em`）；附注用次级墨。**邮箱与附注都不存在时整个分区不渲染**。
- **页脚（`.ink-footer`）**：1px 上墨线；左姓名、右可选站点声明；题签字体、弱化墨。

### 5.1 切换页预览的缩略档位（`Preview.astro`）

预览是**装饰性缩略**（`16 / 10` 画幅，`min-height: 9rem`），不是完整页面；它复刻正式页的签名——纸底、青瓷外框（`inset .28rem`）、右缘竖排姓名、朱砂小印、两枚印谱题签——按下列档位整体缩小，属有意为之的独立阶梯，不是随手写的近似值：

| 元素 | 预览值 | 正式页值 |
|---|---|---|
| 引首标签 | `0.5rem` / 字距 `0.34em` | `0.72rem` / 字距 `0.3em` |
| 题（截断两行） | `0.6rem` / `1.7` | `clamp(1rem, 1.35vw, 1.2rem)` / `1.85` |
| 竖排姓名 | `1.02rem`（`height: 5.6rem`） | `clamp(2.5rem, 3.6vw, 3.5rem)`（`height: clamp(19rem, 46vh, 26rem)`） |
| 印章 | `0.9rem` 见方 / `0.52rem` 字 | `2.4rem` 见方 / `1.35rem` 字 |
| 题签 | `0.5rem` / 内边距 `.12rem .32rem` | `0.84rem` / `.5rem .9rem` |
| 纸纹周期 | `3px` / 3% | `4px` / 3% |

窄于 `520px` 时预览姓名降为 `0.9rem` / `4.6rem`，保证 `16 / 10` 画幅内不溢出。

## 6. 动效（Motion）

- **动效语言**：**墨色渗入与钤印落下**。一切都在 400–650ms 内落定，缓动是「落纸后减速」（`cubic-bezier(0.22, 0.61, 0.24, 1)`），没有弹跳、没有循环。
- **入场（只播一次，纯 CSS）**：
  - `ink-rise`：`opacity 0 → 1` + `translateY(6px) → 0`，`520ms`，题署三件（引首标签 / 姓名 / 题）依次延迟 `0 / 90 / 180ms`；`animation-fill-mode: both`，首屏必然落定。
  - `ink-press`：印章 `opacity 0 → 1`、`scale(1.28) rotate(-6deg) → scale(1) rotate(-2deg)`，`420ms`、`cubic-bezier(0.16, 1, 0.3, 1)`、延迟 `320ms`——像按住印泥后落下；只减速收束，不回弹。
- **细线展开**：分区标题下的 1px 线 `.ink-rule-line` 以 `scaleX(0) → 1`（`transform-origin: left`）在区块显现时展开，`620ms`。
- **滚动显现**：共享 `Reveal`（`<head>` 内一次），区块与卷帙 / 年表行带 `data-reveal`；`html[data-reveal-ready]` 是唯一隐藏门控；`opacity 0 → 1` + `translateY(10px) → 0`，`620ms`；同组第 2 / 3 项错落 `70ms / 140ms`。
- **交互**：题签悬停只过渡 `border-color` / `background-color` / `color`（`180ms`）；卷帙悬停过渡 `background-color` 与标题 `text-decoration-color`；全部由 `(hover: hover) and (pointer: fine)` 门控。
- **减动态**：整块动画包在 `@media (prefers-reduced-motion: no-preference)` 内；`prefers-reduced-motion: reduce` 下另行关闭过渡与位移，并把印章 `transform` 归零（不用旋转也能读）。内容在任何情况下默认可见。
- **不做**：无限循环、滚动劫持、视差、逐字打印、设计专属 JS、任何 `filter` / `clip-path` 动画。

## 7. 响应式

- **≥1440px**：纸面 66rem 居中，左右各留出 ≥ 1/9 视口宽度的空纸；题署竖排于右缘；卷帙三列。
- **1024–1439px**：竖排保持；卷帙三列；纸面横向内边距随 `6vw` 收缩。
- **<1024px**（`max-width: 1023.98px` 与 `min-width: 1024px` 两个断点不重叠）：**竖排关闭**（`writing-mode` 只在 `min-width: 1024px` 内声明），题署改为横排堆叠、印在题下；Hero 单列。
- **761–1023px**：卷帙两列。
- **≤760px**：卷帙单列；年表单列（年代移到机构下方，左对齐）；卷帙取消左右内边距；页眉右端左对齐。
- **375px**：纸面横向内边距 ≈ 22.5px；正文 17px 可读；长 URL / 长词 `overflow-wrap: anywhere`；`.ink` 与 `html:has(.ink)` 双重 `overflow-x: clip`，全页无横向滚动。
- 触控（`pointer: coarse`）：题签链接、落款邮箱、卷帙标题链接以 `min-height: 44px` + `inline-flex` 命中；不改变桌面节奏（桌面仍按 padding 排版）。

## 8. 无障碍

- 姓名是**唯一** `h1`；分区标题一律 `h2`，卷帙标题 `h3`，层级 h1 → h2 → h3 不跳级。
- 每个 `<section>` 都有 `aria-labelledby` 指向同区可见标题（Hero 指向 `#ink-name`）。
- 装饰全部 `aria-hidden="true"`：印章、引首编号、题签方点、朱砂短划（伪元素无文本）、界线。链接可访问名只由文本标签承担，不以装饰符号开头。
- 焦点：`.ink :is(a):focus-visible { outline: 2px solid var(--ink-cinnabar); outline-offset: 4px }`（朱砂对纸底 5.68:1）；不做 `tabindex` 改序，键盘顺序 = DOM 顺序。
- 不靠颜色单独传达状态：链接始终带下划线或描边；悬停只是加强。
- 对比度：正文档 ≥10.36:1、弱化档 ≥4.87:1、大字号展示 ≥13:1；色板表见 §2。

## 9. 内容映射与取舍

| 资料字段 | 本设计的角色 | 呈现 |
|---|---|---|
| `name` | 署名 / 印 | `h1` 竖排题署 + 印章首字 |
| `headline` | 题 | 竖排于姓名左侧 |
| `bio` | 跋 / 小引 | 横排版心，`t.preface` 引首标签 |
| `links` | 题签 / 印谱 | 题签式外链（直接使用 `link.url`，不拼路径） |
| `projects` | 卷 / 册页 | 三列卷帙，含标题链接、描述、标签 |
| `experience` | 年表 | 两列年表（机构 / 职务 · 年代 · 说明） |
| `skills` | 笔触 | 朱砂短划引导的条目流 |
| `contact` | 落款 | 邮箱主链接 + 附注 |

- **不呈现**：`avatar`（册页以纸、墨、字为全部素材，避免图片管线与外部 URL 差异）；`location` 只在页眉作地点注（缺失时只显示页次）。
- **不虚构**：页脚只有姓名与「示例资料・仅作演示」的声明；不补写任何未在资料中出现的个人事实。
- **图标**：不渲染 `links[].icon` 映射——册页用朱砂方点与描边承担识别，混入线性图标会立刻变成「古风模板」。
- **语言入口**：由共享操作菜单承担；页面不渲染 `<LanguageSwitcher>`，也没有任何设计内的切换入口。

## 10. Do / Don't

### Do

- Do 让纸与留白承担八成的视觉，姓名只做一件事：竖排成为最右一柱。
- Do 只用一枚朱砂印；它的稀少就是它的强调。
- Do 用 1px 线表达结构（界栏、基线、分隔），不用卡片框、阴影、渐变按钮。
- Do 让中文楷（题署）与仿宋（正文）各司其职；小字号标签仍用旧体衬线保持书卷气。
- Do 在 1023px 以下彻底关掉竖排，保证 375px 可读、无横向溢出。
- Do 把每个字体栈写全回退，系统中文永远排在 LXGW / Zhuque 之后。

### Don't

- Don't 用祥云、龙纹、水墨笔刷背景、篆刻图片或任何「中国风」图库符号。
- Don't 让竖排进入正文：长文竖排会同时破坏可读性与 375px 布局。
- Don't 给分区加彩色底、圆角、投影或图标。
- Don't 引入第二枚饱和色（青瓷只做 1px 线与底纹，不做文字或块面）。
- Don't 用无限循环的「墨滴」「流云」动效，或用 `filter` / `clip-path` 做动画。
- Don't 在 `Preview.astro` 里 import `style.css`、写 `:root`、渲染 `<Font>` 或放可聚焦元素。
- Don't 新增字体、图片、第三方依赖或设计专属 JS。

## 11. 验证

按 `.agents/skills/design-page-verify/SKILL.md` 执行：构建、CSS 隔离、三语言、1440 / 768 / 375×812、键盘与焦点、减动态 / 无 JS / 无 IO / IO 抛错、对比度、预览。当前状态（本设计为并行批次，构建与浏览器验收由主代理执行）见 `docs/verification/ink.md`。
