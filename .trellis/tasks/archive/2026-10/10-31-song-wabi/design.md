# 技术设计 · `ink`（宋式册页 / 侘寂）

## 文件边界

| 文件 | 所有权 | 说明 |
|---|---|---|
| `src/designs/ink/DESIGN.md` | 本任务 | 自产规范，先写；实现与之不一致时先改规范 |
| `src/designs/ink/design.json` | 本任务 | strict schema，无多余键 |
| `src/designs/ink/messages.ts` | 本任务 | 纯数据，三语言 |
| `src/designs/ink/tokens.css` | 本任务 | `:is(.ink, .ink-pv)`，无 `:root`，无字体角色 |
| `src/designs/ink/style.css` | 本任务 | Tailwind 入口 + `@theme inline` + 全部版式 |
| `src/designs/ink/Page.astro` | 本任务 | 完整文档，唯一 `h1` |
| `src/designs/ink/Preview.astro` | 本任务 | 自包含碎片，导出 `fonts` |
| `docs/verification/ink.md` | 本任务 | 待主代理浏览器验收的记录草稿 |

**只读、不得修改**：`scripts/fonts/**`、`docs/verification/shared.md`、父任务 PRD、现有设计、`src/components/**`、`src/lib/**`、`src/designs/preview.ts` / `registry.ts` / `descriptions.ts`、ADR、数据契约、`fonts.config.json`。

发现需要改动但不在所有权内的项：`scripts/fonts/typography.mjs`（`expected 24 styled designs`）、`scripts/fonts/typography.test.mjs`（`styledCount 24` / `coreDesignCount 15`）、`src/designs/descriptions.ts`（缺 `ink` 描述）。均在完成报告中登记，由主代理处理。

## 命名空间与作用域

- 类前缀 `ink-`（BEM 风格：`.ink-section-head`、`.ink-chrono-row`）；页面根类 `.ink`，预览根类 `.ink-pv`。
- 令牌前缀 `--ink-*`；字体角色 `--ink-type-{display|text|label}`（正式页）+ `--ink-pv-{display|text}`（预览，组件内声明）。
- `tokens.css` 作用域 `:is(.ink, .ink-pv)` —— 预览内联到切换页时不会泄漏为全局令牌。
- 祖先选择器 `html:has(.ink)` 只写字面量（`#f4eee2` / `#c9bda5`），不消费 `--ink-*`。

## 字体栈（三处逐字一致：`DESIGN.md` §3、`style.css`、`Preview.astro`）

```
display: var(--font-sorts-mill-goudy), var(--font-lxgw), var(--font-zhuque), "Songti SC", "SimSun",
         "Hiragino Mincho ProN", "PingFang SC", "Microsoft YaHei", serif
text:    var(--font-prociono), var(--font-lxgw), var(--font-zhuque), "Songti SC", "SimSun",
         "PingFang SC", "Microsoft YaHei", "Hiragino Sans", serif
label:   var(--font-sorts-mill-goudy), var(--font-lxgw), var(--font-zhuque), "Songti SC", "SimSun",
         "PingFang SC", "Microsoft YaHei", serif
```

- `style.css` 用 `@theme inline` 注册 `--font-ink-display/text/kai/song`（角色登记，不参与 `font-family` 取值，避免「主题变量只有单 face 无回退」被门禁拦截）。
- 预览在组件 `<style>` 内重复同样的完整栈（预览不 import `style.css`，取不到 `@theme`）。
- 每个栈都含 `var(--font-lxgw)`（核心 CJK）+ `var(--font-zhuque)`（次选），系统中文全部排在其后。

## 布局策略

1. **纸面**：`.ink-leaf`（`min(66rem, 100%)`，不对称纵向留白）+ `::before` 1px 青瓷外框模拟未裁边的册页边。
2. **Hero 两列（≥1024px）**：`grid-template-columns: minmax(0,1fr) auto`、`grid-template-areas: "prose tiers"`。右列 `.ink-tiers` 是唯一的竖排上下文：`writing-mode: vertical-rl` + 固定 `height: clamp(19rem, 46vh, 26rem)`，块流方向为右→左，因此「引首标签 → 姓名 → 题 → 印」自然落成四列；固定高度是换列的必要条件（不固定则长题会变成一根极长的单列）。印章 `writing-mode: horizontal-tb` + 明确 `width/height`，避免竖排块级盒被拉伸到整列高。
3. **降级**：所有竖排声明只出现在 `@media (min-width: 1024px)` 内；<1024px 时 `.ink-tiers` 回到普通块流，标题/题/印纵向堆叠。
4. **分区**：`grid-template-columns: var(--ink-gutter) minmax(0,1fr)`，左栏是竖排引首编号（单字，任何视口都成立），右栏是标题 + 内容；分区之间仅 1px 墨线。
5. **响应式断点**：`min-width: 1024px`（竖排）/ `max-width: 1023.98px`（卷帙两列）/ `max-width: 760px`（卷帙单列、年表单列）/ `max-width: 480px`（题签整行、字距收紧）。两个断点不重叠，避免 1024px 同时命中竖排与两列。
6. **溢出**：`.ink` 与 `html:has(.ink)` 双 `overflow-x: clip`；所有可能长的文本（URL、邮箱、长标签）`overflow-wrap: anywhere`。

## 动效参数

| 名称 | 形态 | 参数 | 触发 |
|---|---|---|---|
| `ink-rise` | `opacity 0→1` + `translateY(6px)→0` | `520ms`，`cubic-bezier(.22,.61,.24,1)`，`animation-fill-mode: both`，延迟 `0 / 90 / 180ms`（引首标签 / 姓名 / 题） | 首屏一次性 |
| `ink-press` | `opacity 0→1` + `scale(1.28) rotate(-6deg) → scale(1) rotate(-2deg)` | `420ms`，`cubic-bezier(.32,1.32,.4,1)`，延迟 `320ms` | 首屏一次性（印章） |
| `ink-draw` | `scaleX(0)→1`，`transform-origin: left center` | `620ms`，同主缓动 | 区块 `[data-reveal-in]` |
| Reveal | `opacity 0→1` + `translateY(10px)→0` | `620ms`，`--ink-reveal-delay` 依次 `0 / 70 / 140ms` | 共享 `IntersectionObserver` |
| hover | 只过渡 `border-color` / `background-color` / `color` / `text-decoration-color` | `180ms` | `(hover: hover) and (pointer: fine)` |

- 隐藏态只在 `@media (prefers-reduced-motion: no-preference)` 且 `html[data-reveal-ready]` 下成立；无 JS / 无 IO / 减动态 = 内容自然可见。
- `prefers-reduced-motion: reduce` 关闭全部动画与过渡，并把印章 `transform` 归零。
- 只动 `opacity` / `transform`（交互态含短促颜色过渡），无 `filter` / `clip-path` / 无限循环。

## 无障碍

- 唯一 `h1`（`#ink-name`），分区 `h2`（`#ink-{projects|experience|skills|contact}-title`），卷帙标题 `h3`。
- Hero `section[aria-labelledby="ink-name"]`；其余分区 `aria-labelledby` 指向同区可见 `h2`。
- 装饰：印章、引首编号、页眉方点、题签方点、卷帙页次、细线（含 `.ink-rule-line`、`.ink-stroke::before`）全部 `aria-hidden` 或伪元素。
- 焦点：`.ink a:focus-visible { outline: 2px solid var(--ink-cinnabar); outline-offset: 4px }`。
- 触控：`@media (pointer: coarse)` 给题签链接、落款邮箱 `min-height: 44px`，卷帙标题链接改用 `inline-flex`；桌面排版不变。

## 与共享机制的关系

- 只使用共享 `HeadMeta` / `Reveal` / `ContextMenu` / `Font`；不新建共享组件，不给共享模块加导入边。
- README / preview 描述索引不在所有权内：切换页对 `ink` 回退 `design.json.description`（中文一句）。

## 风险

- 数据若换成超长姓名或超长 headline，竖排题署会换列变宽（设计如此）；极端长度下会在 1024–1200px 挤压正文列，需要目检。
- 竖排下的拉丁姓名呈书脊式旋转（`text-orientation: mixed` 默认行为），视觉可接受但没有横向替代，需主代理在 en 语言页目检确认。
