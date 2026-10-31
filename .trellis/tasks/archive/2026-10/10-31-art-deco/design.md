# deco — 技术设计

> 目标：在 `src/designs/deco/` 落一套 `styled` 设计（Art Deco 剧院节目单 / 暗黑奢华），不改任何共享机制。规范正文在 `src/designs/deco/DESIGN.md`；本文件只记录**实现边界与技术决策**。

## 1. 文件边界与依赖方向

```
src/designs/deco/
├─ DESIGN.md      规范（先定稿；实现与规范冲突时改规范）
├─ design.json    注册元数据（严格 schema，无多余字段）
├─ messages.ts    zh-CN / ja / en 三语言版面文案（纯数据）
├─ tokens.css     调色板 + 量值（作用域 :is(.deco, .deco-pv)）
├─ style.css      Tailwind 入口 + @theme inline 字体角色 + 全页规则 + 动效
├─ Page.astro     完整文档（head + body.deco + 共享菜单）
└─ Preview.astro  切换页装饰碎片（自包含，只 import tokens.css + messages）
```

- 依赖方向单向：`Page.astro → style.css → tokens.css`；`Preview.astro → tokens.css`。`Preview.astro` **不** import `style.css`（否则把 Tailwind preflight 与整页规则带进切换页）。
- 不新增组件文件：装饰重复（线—菱形—线）以内联 3 个 span 表达，避免额外扫描面与新抽象。
- 页面只从 `loadDesignView('deco', Astro.url.pathname)` 取数；不接触文件路径、不判断语言。
- 页面 import 仅：`astro:assets` 的 `Font`、`ContextMenu` / `HeadMeta` / `Reveal` 三个共享组件、`loadDesignView`、`./messages`、`./style.css`。无图标库、无图片、无脚本。

## 2. 命名与作用域

| 前缀 | 用途 | 作用域 |
|---|---|---|
| `--dc-*` | 设计令牌（颜色 / 线框 / 尺度 / 时长） | `:is(.deco, .deco-pv)` |
| `--dc-type-*` | 完整字体栈（含回退） | `.deco`（正式页）/ `.deco-pv`（预览自带） |
| `.deco` | 正式页宿主（`<body class="deco">`） | 全局唯一 |
| `.deco-pv` | 预览根 | 切换页卡片内 |
| `.deco-*` | 正式页组件类 | `.deco-page` 内 |

- 令牌**不含**字体角色：`html` 等祖先选择器取不到后代作用域变量，字体角色放令牌会让正式页字体静默回退（`docs/rules/design-contract.md` 第 4 条）。
- `html:has(.deco)` 只消费字面量（`#07060a` / `#7f6a35`），不引用 `--dc-*`。

## 3. 字体栈

```
展示：var(--font-fraunces), var(--font-zhuque), "Songti SC", "SimSun", "Hiragino Mincho ProN", "Yu Mincho", serif
正文：var(--font-inter), var(--font-zhuque), "PingFang SC", "Microsoft YaHei", "Hiragino Sans", "Yu Gothic UI", sans-serif
```

- 顺序契约：拉丁主 face → `--font-zhuque` → 系统中/日 → 通用族。系统 CJK 永不早于 Zhuque。
- `style.css` 用 `@theme inline` 注册 `--font-deco-display` / `--font-deco-body` / `--font-deco-cjk`（Tailwind 侧角色别名）；具体 `font-family` 声明一律写完整栈，避免“只写一个变量”的回归。
- `Preview.astro` 的 `<style>` 内自带 `.deco-pv` 的两条同序栈（`--deco-pv-display` / `--deco-pv-body`），不依赖正式页 CSS。
- 静态门禁验证方式（并行阶段允许）：直接调用 `scripts/fonts/typography.mjs` 的 `inspectTypographyCss`，对 deco 的两个 `.css` 与两个 `.astro` 的 `<style>` 块分别预跑，期望 0 findings。

## 4. 布局策略

- 单列中轴容器：`.deco-page { max-width: 66rem; padding-inline: clamp(1.15rem, 4.5vw, 3.5rem) }`；所有分区居中，卡片网格与台账在内部恢复左对齐以保可读性。
- 首屏结构（DOM 顺序 = 阅读顺序）：幕布（装饰）→ 阶梯角（装饰）→ 扇形（装饰）→ kicker → `h1`（monogram + 姓名）→ 副题 → 菱形分隔 → 序言块（`bio`）。
- 分区用 `border-top: 1px solid var(--dc-hairline)` 起头；分区标题 + 「线—菱形—线」组成 `deco-section-head`。
- 网格断点：幕次 3 → 2（≤1024）→ 1（≤760）；演职员表 3 → 2（≤1024）→ 1（≤640）；演出单两列 → 单列（≤760）。
- 溢出防线四层：`.deco` 与 `html:has(.deco)` 的 `overflow-x: clip`；长文本 `overflow-wrap: anywhere`；窄屏票根整行；`text-wrap: balance` 用于姓名与副题避免孤字。

## 5. 装饰实现（全 CSS，全部 aria-hidden）

| 装饰 | 技术 | 备注 |
|---|---|---|
| 扇形放射 | `repeating-conic-gradient(from 270deg at 50% 100%)` + 半椭圆 `border-radius` + `overflow: hidden` | 7° 一束、0.6° 线宽，金色 72% 不透明 |
| 双线框 | 外框 `border: 1px` + `::before { inset: 6px; border: 1px }` | 首屏与售票处；预览为 `inset: 4px` |
| 阶梯角 | `clip-path: polygon(...)` 的 L 形三阶 | 首屏左上/右下 2.4rem；卡片 1.6rem；≤640 降 1.6rem |
| 菱形 | 6–7px 方框 `transform: rotate(45deg)`（分隔件为空心、卡内标签为实心 `--dc-brass`） | 不进入文本节点 |
| monogram | 外层居中 2 字标记 + 两个旋转方块（外金/内黄铜） | 标记 `aria-hidden`，姓名文本独立渲染 |
| 幕布 | 两半 `scaleX` 退场 + 竖条渐变 | 基态 `scaleX(0)`，静止即“已拉开” |
| 印纸底纹 | `repeating-linear-gradient(90deg, 1.8% 米白 1px / 5px)` + 顶部金色径向辉光 | 只做氛围 |

## 6. 动效参数（与 `DESIGN.md` 第 6 节一一对应）

| 动画 | keyframes | 时长 / 缓动 | fill-mode |
|---|---|---|---|
| 幕布分开 | `deco-curtain-part`（`scaleX(1) → scaleX(0)`，`transform-origin` 左右） | 900ms / `--dc-ease-line` | 无（基态即终态） |
| 扇形展开 | `deco-fan-open`（`opacity 0→1`、`scale(0.94)→1`） | 700ms / `--dc-ease-line` | 无 |
| 金线拉直 | `deco-draw`（`scaleX(0)→scaleX(1)`） | 620ms / `--dc-ease-line` | 无 |
| 首屏升起 | `deco-rise`（`translateY(10px)→0`，只动 transform） | 520ms / `--dc-ease` | 无 |
| 滚动显现 | 共享 `Reveal` + `html[data-reveal-ready]` 门控 | 240ms / `--dc-ease`，卡错落 70/140ms | 由 `data-reveal-in` 驱动 |
| 交互 | 颜色/边框 220ms；菱形 `rotate(45deg) scale(1.25)` | 220ms | — |

- 全部关键帧在 `@media (prefers-reduced-motion: no-preference)` 内；`@media (prefers-reduced-motion: reduce)` 统一 `animation: none !important; transition: none !important`。
- 纪律：不使用 `both` / `forwards`；文字入场只动 `transform`（动画停滞也不会隐藏内容）；唯一隐藏基态是装饰性幕布。
- 无设计脚本、无无限循环、无滚动驱动时间线（本设计不使用）。

## 7. 无障碍要点

- `h1` 唯一 = 姓名；`h2` ×5；`h3` = 幕次标题；无跳级。
- 6 个 `<section>` 全部 `aria-labelledby`；首屏指向 `h1` 的 id，其余 5 个指向同区可见 `h2`。
- 装饰要么 `aria-hidden`，要么纯伪元素；链接可访问名只由 `label` / `title` 文本承担。
- `:focus-visible` 2px `--dc-gold-bright` + 3px offset；票根链接在焦点下额外变金边。
- 触控：`pointer: coarse` 下票根/售票处 ≥48px、幕次标题链接 ≥44px。
- 不渲染 `<LanguageSwitcher>`（语言入口由共享菜单承担）。

## 8. 与共享机制的边界

- 只使用：`HeadMeta`（原样传 `view.head`）、`Reveal`（`<head>` 一次）、`ContextMenu`（`<body>` 末尾无条件）。
- 不修改 `src/lib/**`、`src/components/**`、`src/designs/{preview,registry,descriptions}.ts`、`astro.config.mjs`、字体配置与生成文件。
- 不建立任何指向其它设计的 import 边；`Preview.astro` 只被切换页页面 entrypoint 的 glob 发现。

## 9. 已知风险与移交

| 风险 | 说明 | 处理 |
|---|---|---|
| `styledCount !== 24` 门禁 | `scripts/fonts/typography.mjs` 硬编码套数；本设计加入后为 25 | 主代理统一改套数 + 同步测试与 `npm test` |
| 预览与正式页字体一致性 | 两处各写一次栈，可能漂移 | 两处都经 `inspectTypographyCss` 门禁；改字体必须两处同改并把数值写回 `DESIGN.md` |
| 面层对比度 | `--dc-panel` 与页底仅 1.05:1 | 边界由 ≥3.47:1 的发丝线承担（设计意图，已在 `DESIGN.md` 说明） |
| 幕布为隐藏基态 | 若动画不推进则不显示 | 仅装饰、`aria-hidden`、无内容与交互；静止等价于“已开场” |
| 金线与扇形在旧浏览器 | `repeating-conic-gradient` / `clip-path` 在目标浏览器均可用；不支持时退化为纯色块 | 不额外提供位图回退（无图片资产策略） |
