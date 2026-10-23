# verification — receipt（自产：热敏小票机）

> 本文件是该主题**当前**的完整验证状态；重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）；记录归属见 `docs/README.md`。
> 首次全流程验证：2026-10-17（八方向新主题 · 样板页）；2026-10-19 桌面折叠双栏重构（三联轨道 → 单张当前语言宽票）后重测；本次只记录实际执行的检查，未执行项在文末列明。

## 本轮改动（2026-10-19）

- `Page.astro` 改用 `loadDesignView('receipt', Astro.url.pathname)`，只渲染当前语言的一张票据；`ContextMenu`、`HeadMeta`、`Reveal`、字体接线未变。
- `Ticket.astro` 移除 `isCurrent` / `is-primary`，正文五枚 section 直接包进 `.rc-fold-body`；DOM 顺序保持明细 → 订单 → 纪录 → 技能 → 结账。
- `style.css` 删除三联轨道规则；≥1024px 使用 72rem 上限的宽纸与 CSS 多列（`column-count: 2`）自动平衡双栏，1024px 以下单栏 30rem；折痕为 1px `column-rule` 压线，无纸内阴影 / 卡片 / 圆角。
- `messages.ts` 三语言同步删除仅服务旧三联的 `railTitle`；`loadDesignStrips` 在 `src/lib/site.ts` 中保留。

## 构建与产物

- `npm run build` 绿（2026-10-19）：`astro check` **0 errors / 0 warnings / 1 hint**（hint 为 `src/designs/lexicon/Page.astro` 的既有未用变量，非本设计）；构建 **73 页**，注册表校验通过。
- 三语言 receipt HTML 均恰 **1 个主 `article`、1 个 `h1`、6 个 `h2`、6 个 `data-reveal`**（共享菜单的身份条可能另有一个 `article`）；`is-primary`、`railTitle`、`.rc-ticket` 在产物中计数均为 **0**。
- 三语言页面引用**同一个**样式文件 `/_astro/Page.BQ77cP9I.css`（13,498 B）；该文件含 `rc-fold-body` / `column-count:2`，不含 `.ed-` / `.ox-` / `.tm-` 等其他设计选择器；链接样式表恰 1 条。
- 字体预载计数 **0**；渲染字体栈仍为 Cutive Mono → Courier New / Courier → Ark Pixel 12px → Songti SC / SimSun；DSEG7 仍加载。浏览器实测三族 `document.fonts.check()` 均为 true，CJK 像素指纹 `1666165054` 与 Ark 字面一致、不同于 monospace `719983133`。
- 核心字段全部渲染：`name` / `headline` / `bio` / `links` 与 `location`；扩展区块四个全渲染（projects → 订单、experience → 纪录、skills → 技能、contact → 结账台）。

## 桌面布局（Chromium 实测）

探针：`node .local-fonts/dev/design-probe.mjs http://127.0.0.1:4321/zh-cn/receipt/`（本地 preview :4321；中 / 英各跑一次）。

| 视口 | 纸张宽度 | 左 / 右台面 | `scrollWidth` / `innerWidth` | 分栏计算值 | 折痕 |
|---|---:|---:|---|---:|---:|
| 1440×900 | **1152px** | 137 / 151px（约 9.5% / 10.5%） | 1425 / 1440（无横向滚动） | `column-count: 2` | **1px** |
| 1024×800 | **879px** | 65 / 80px | 1009 / 1024（无横向滚动） | `column-count: 2` | 1px |
| 1000×800 | **480px** | 252 / 268px | 985 / 1000（无横向滚动） | `column-count: auto`（单栏） | 不显示 |

- 1440 下 `.rc-fold-body` 为两列多列，按内容高度自动平衡；正文 / 注释最大行宽约 46ch，`nestedOverflow`（超出纸张矩形 1px 以上的后代）为 **0**。
- 1024 下仍为两列多列，英文长词 / 邮箱 / URL 未产生越界（`nestedOverflow = 0`）；1000 下退回单栏，两档之间没有第三档布局。
- 1440 实测 `column-count: 2`、`column-gap: 100.8px`；1024 实测 `column-gap: 80px`；1000 / 375 实测 `column-count: auto`。中英两种语言的纸面高度都明显小于旧的纵向单栏版本。
- 顶部撕边 / 红章 / 页脚 / 条码仍属于同一张 `.rc-paper`；纸内唯一 `box-shadow` 是红章的双层内描边，不是纸面投影；折痕不是投影。
- 票头、备注 / 简介、页脚均位于 `.rc-fold-body` 之外，横跨整张纸。

## 结构、内容与 a11y

- 标题层级：**h1×1** → **h2×6**（备注 / 明细 / 订单 / 纪录 / 技能 / 结账台），无跳级；六枚 section 全部以可见 `<h2>` 的 `aria-labelledby` 具名（`sectionsNamed = 6/6`）。
- DOM 阅读顺序为简介 → 明细 → 订单 → 纪录 → 技能 → 结账；双栏只改变视觉位置，不使用 `order`。
- 链接可访问名干净：`niconico` / `BB素材库` / `下北沢通信` / `王道征途 (The Royal Road)` / `特制红茶配方 (Iced Tea Formula)` / `114514@shimokitazawa.jp`，不以前缀装饰符开头。
- 装饰一律 `aria-hidden`：序号、URL、点引导线、条码、图章、`#` 前缀；本页自身 **0 SVG**（共享菜单的图标属于项目 chrome，不计入本设计内容区）。

## 对比度（沿用 2026-10-17 node 精算；本轮未改色值）

| 组合 | 比值 | 结论 |
|---|---|---|
| ink `#2b2620` / paper `#f6f2e8` | 13.41 | ✓ |
| ink / paper-2 `#eee8da` | 12.27 | ✓ |
| dim `#6d6354` / paper | 5.27 | ✓ |
| dim / paper-2 | 4.82 | ✓（≥4.5 硬底线） |
| red `#b3372c` / paper（图章，大字） | 5.37 | ✓ |
| faint `#b3a894` / paper | 2.10 | 装饰线条，非文本（声明） |

## 动效（Motion language「票据机印刷」）

- 首屏：`.rc-name` 计算 `animation-name: rc-print`，`.rc-stamp` 为 `rc-stamp`；整行仍按 45ms 步进、80ms 起，图章 0.32s 落章。
- 滚动显现：**6 个 `[data-reveal]`**（非旧记录的 18）；1440 加载后 `hiddenInViewport = 0`，滚到底后 `[data-reveal-in] = 6/6`、隐藏行 **0**；新加载直接跳到底后 `inCount = 6`、隐藏行 **0**。
- 左右两栏共用同一套 `--d` 段内节奏，没有让右栏等待左栏的额外延迟。
- 降级实测：
  - `prefers-reduced-motion: reduce`：不写 `data-reveal-ready`，`animationName: none`，隐藏 **0**；
  - 删除 `IntersectionObserver`：不写门控，隐藏 **0**；
  - `IntersectionObserver` 构造抛错：不写门控，隐藏 **0**；
  - 禁用 JavaScript：DOM 仍为 1 article / 1 h1 / 6 h2，隐藏 **0**（同步探针，截图见下）。
- 持续动效：**无**（小票印完即静止）。

## 触控与移动端（375×812 + CDP 触控仿真）

- `pointer: coarse = true`；`scrollWidth = innerWidth = 375`，无横向溢出；`.rc-paper` 338px 宽，左右各 11px 台面。
- `.rc-fold-body` 为 `display: block`；URL 隐藏；纸张单栏顺序与桌面 DOM 一致。
- 共享操作菜单（ADR 0007）：悬浮球 **52×52**、有「打开快捷操作菜单」标签；点击图标本身可打开面板，面板贴底（bottom gap = 0），动作项 `copy / share / random / switch`、语言项 3 个、✕ 与取消条都在；打开时 `html overflow: hidden`，点击 ✕ 后关闭。
- 触控链接命中：探针测得首个 `.rc-link` 高度 **45px**（≥44）；全页 `touch-action: none` 元素计数 **0**。

## 多语言与语言切换

- `dist/zh-cn|ja|en/receipt/index.html` 均存在；`<html lang>` 分别为 `zh-CN` / `ja` / `en`；页面正文随语言切换（h2：备注… / ご案内… / MEMO…）。
- 两份共享菜单 DOM 合计 **6 个 `.cm-item.cm-lang`**，每份 **1 个** `aria-current="page"`；三语言目标均保持 `/receipt/` 且带 `hreflang` / `lang`。
- `messages.ts` 的三语言键集合一致，旧 `railTitle` 已删除；预览 `Preview.astro` 仍只表现单联视觉签名。

## 共享菜单与键盘

- 桌面 `Shift+F10` 打开：焦点落首项「重新加载」；`↑↓` 到「语言」时 `aria-expanded="true"`，`→` 进入子菜单后焦点为「简体中文」；子菜单内 `↓` 到「日本語」；`←` 返回触发项并收起。整个过程 `submenu.contains(activeElement)` 正确，未飞出菜单。
- 三语言 `.cm-item.cm-lang` 目标保持同一 `receipt` id；无语言前缀硬编码。

## 检测器（impeccable）

- `.agents/skills/impeccable/scripts/impeccable.cmd detect --json src/designs/receipt` → **`[]`**（零发现，exit 0）。
- 检测器有效性反证本轮未重做；上一轮已有 `repeating-stripes-gradient` / 预览缩略档位等记录。

## 截图与证据

- 本机截图（不随仓库分发）：
  - `.local-fonts/dev/preview/receipt-folded-1440-zh.png`（1440 中文双栏全页）
  - `.local-fonts/dev/preview/receipt-folded-1440-ja.png`（1440 日文双栏全页）
  - `.local-fonts/dev/preview/receipt-folded-1440-en.png`（1440 英文双栏全页）
  - `.local-fonts/dev/preview/receipt-folded-1024-en.png`（1024 英文双栏）
  - `.local-fonts/dev/preview/receipt-folded-375.png`（375 中文单栏全页）
  - `.local-fonts/dev/preview/receipt-folded-probe-1440.png`（CDP 探针 1440 视口）
  - `.local-fonts/dev/preview/receipt-folded-probe-375.png`（375 触控视口）
  - `.local-fonts/dev/preview/receipt-folded-probe-nojs.png`（禁用 JavaScript）
- 探针原始输出：本次运行未另存 JSON；关键数值均记录在上文各节。

## 未测 / 限制

- base 前缀 `/demo`：`MSYS2_ARG_CONV_EXCL='*' npx astro build --outDir dist-demo --base /demo` 通过；三语言 receipt 页全部 18 个 `href/src` 均带 `/demo/`，canonical 分别为 `/demo/{locale}/receipt/`。
- `manualSwitch: false` 临时构建通过（69 页）：三语言切换页与旧 `/designs/` 不构建；页面 `random` / `switch` 动作计数 0，`.cm-item.cm-lang` 仍为 6、`aria-current` 2。
- `mode: fixed` 临时构建通过（73 页）：`/zh-cn/index.html` 的 refresh 目标为 `/zh-cn/editorial/`。两项配置测试后均已恢复原 `random` / `true`，`git diff` 无配置残留。
- 真机 iOS / Android、Safari / Firefox 引擎、横屏、200% 缩放未实测；触控与降级基于 Chromium 仿真。
- 对比度沿用上一轮实测值，本轮没有重新采样色值；若后续改色必须重算。
- 英文页面在 1024 下经计算值检查无溢出；建议验收时再看一次真实屏幕观感（长邮件的换行主要落在 1024 边界）。
