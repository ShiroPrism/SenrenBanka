# 执行清单 · `ink`

> 本任务在并行批次内实现：**只做设计目录内的静态自审**，不运行构建 / 类型检查 / 字体脚本 / dev 服务。
> 构建与浏览器验收由主代理在批次合并后执行（步骤 6 列出命令）。

## 1. 规范先行

1. 读 `AGENTS.md` 八条硬门禁 + `docs/rules/{design-contract,visual-language,accessibility-responsive,pitfalls,data-and-i18n,operations}.md`。
2. 读 `docs/fonts/selection-guide.md`（六项记录模板）、`.agents/skills/design-page-verify/SKILL.md`、父任务 PRD。
3. 读结构模板 `fast/Page.astro`、`receipt/Page.astro`、`kern/Preview.astro`、`fast/tokens.css`；只读参考 `brutal/**` 的文件结构与 DESIGN 完整度（不复制其视觉语言）。
4. 写 `DESIGN.md`：定位 → 隐喻 → 色板（用途 + 实测对比度）→ 字体六项 → 版式尺度表 → 组件 → Motion → 响应式 → 无障碍 → 内容映射 → Do/Don't → 验证。

## 2. 数据与文案

5. 读三语言资料（`src/data/profiles/*.yaml`）确认字段实际长度（bio 长、headline 长、links 3 条），据此定版心 `33rem` 与竖排高度 `clamp(19rem, 46vh, 26rem)`。
6. 写 `messages.ts`：`portfolio / preface / imprint / projects / experience / skills / contact / leaf / footerNote / numerals`，三语言齐全；文件头写明不翻译项（装饰编号、页次名词形态）与理由。
7. 写 `design.json`：strict schema 允许的键只有 `displayName / description / enabled / renderMode / accent / source / generatedBy`。

## 3. 令牌与样式

8. `tokens.css`：`:is(.ink, .ink-pv)` 作用域，仅色板 + 尺寸 + 时长；不含字体角色、不含 `:root`。
9. `style.css`：
   - 首两行 `@import "tailwindcss" source(none);` / `@source "./";`，第三行 `@source not "./Preview.astro";`，再 `@import "./tokens.css";`
   - `@theme inline` 注册 `--font-ink-{display,text,kai,song}`
   - `html:has(.ink)` 只写字面量
   - `.ink` 内定义三条 `--ink-type-*` 完整回退栈
   - 版式：纸面 / 页眉 / 题署 / 小引 / 印谱 / 分区 / 卷帙 / 年表 / 笔触 / 落款 / 页脚
   - 动效：`ink-rise` / `ink-press` / `ink-draw` + 共享 Reveal 的 `[data-reveal]` 门控，全部置于 `@media (prefers-reduced-motion: no-preference)`
   - 断点：`min-width: 1024px`（竖排）/ `max-width: 1023.98px` / `760px` / `480px`，互不重叠
10. `Page.astro`：`loadDesignView('ink', …)` → `HeadMeta` + 4 × `Font` + `Reveal` → `<body class="ink">` → 页眉 / Hero / 条件分区 / 页脚 → `ContextMenu`（无条件）。可选区块先归一到数组，模板内不再判空；引首编号随实际渲染分区连续递增。
11. `Preview.astro`：只 import `./tokens.css` + `./messages` + `PreviewProps` 类型；`export const fonts` 四个变量；样式全在组件 `<style>`；无 `<Font>` / `:root` / 可聚焦元素 / `style.css` import。

## 4. 静态自审（本代理已实际执行）

12. 结构契约 grep：
    - `head -4 style.css` → 前两行精确匹配，第三条为 `@source not "./Preview.astro";`
    - `grep ":root"` → 仅注释命中；`tokens.css` 作用域行 `:is(.ink, .ink-pv)`
    - Preview：无 `<Font>` / `<a` / `<button` / `tabindex` / `:root` / `style.css` import
    - Page：含 `HeadMeta` / `Reveal` / `ContextMenu` / `loadDesignView('ink'` / 4 个 `<Font>`；无 `<LanguageSwitcher>`、无 `<script>`
13. CSS 解析：`postcss.parse()` 解析 `tokens.css` / `style.css` / Preview `<style>`，三段均 OK；花括号配平。
14. 字体门禁：以一次性脚本调用 `scripts/fonts/typography.mjs` 导出的 `inspectTypographyCss`，对 `ink/**/*.css` 与 `ink/**/*.astro` 的 `<style>` 段复算（`requiredCoreVariables = [--font-lxgw, --font-zhuque]`）→ **0 findings**，共 22 条 `font-family` 声明。
15. 对比度：一次性 node 脚本按 WCAG 相对亮度公式实算 16 组配对，结果写入 `DESIGN.md` §2（正文 15.17 / 次级 10.36 / 弱化 5.53 / 朱砂 5.68 / 青瓷 3.22 仅装饰）。

## 5. 记录

16. 写 `docs/verification/ink.md`：构建状态如实标「未运行」，静态自审结果、对比度、字体栈、未测项逐条列出（**不把未测项写成通过**）。
17. 更新 `.trellis/tasks/10-31-song-wabi/{prd.md,design.md,implement.md}`。

## 6. 待主代理执行（批次合并后）

```bash
npm run fonts:typography   # 需先把 typography.mjs 的 24→25、test 的 24/15→25/16 改好（非本任务所有权）
npm run build              # fonts:check + check + astro build + subset + prune + html-only + audit
npm run test:html-only
```

```powershell
.agents\skills\impeccable\scripts\impeccable.cmd detect --json src/designs/ink
```

浏览器（`npm run preview` → `http://localhost:4321/{zh-cn|ja|en}/ink/`）：

- 1440 / 768 / 375×812：无横向溢出（`scrollWidth <= innerWidth + 1`）；题署在 ≥1024px 竖排、<1024px 横排；卷帙 3 → 2 → 1 列。
- a11y：唯一 `h1`、`h1→h2×N→h3×N`、每个 `section` 有可访问名、装饰 `aria-hidden`、链接可访问名不含装饰符。
- 动效：`html[data-reveal-ready]` 写入；滚到底与直接跳到底（`window.scrollTo(0, scrollHeight)`）后 `[data-reveal]` 隐藏数为 0。
- 降级：`reducedMotion: 'reduce'` / `javaScriptEnabled: false` / 删除 `IntersectionObserver` / 让 IO 抛错，四种情形隐藏数为 0。
- 菜单：右键浮层 5 项、语言 3 项 1 个 `aria-current`；375px 悬浮球 52×52、底部面板语言平铺。
- 对比度复核（计算值已给，浏览器只需确认实际底色与令牌一致）。
- 截图归档到 `.local-fonts/dev/preview/ink-2026-10-31/`（桌面全页 / 375 / 菜单 / 减动态 / 无 IO / IO 抛错 / 无 JS）。
