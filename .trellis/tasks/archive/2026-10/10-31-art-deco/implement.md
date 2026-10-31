# deco — 执行清单

> 有序执行清单。并行阶段只做步骤 1–6（静态检查）；步骤 7 起由主代理在批次收口时执行。

## 1 规范先行

1. 读 `AGENTS.md` 硬门禁与 `docs/rules/` 相关正文（design-contract / visual-language / accessibility-responsive / pitfalls / data-and-i18n / operations）。
2. 写 `src/designs/deco/DESIGN.md`：定位、隐喻、色板（含对比度）、字体六项记录、版式、组件、Motion、响应式、无障碍、内容映射、Do/Don't。
3. 色板先算对比度再定值：正文 ≥4.5:1、大字号 ≥3:1、非文字线 ≥3:1。

## 2 元数据与文案

4. `design.json`：`displayName: "Deco"` / `description` / `enabled: true` / `accent: "#d4af37"`（金色主值，登记在 `DESIGN.md` 色板）/ `source.type: self-produced` / `generatedBy`；不加多余字段。
5. `messages.ts`：`zh-CN` / `ja` / `en` 全键齐备；文件头写明不翻译项（罗马数字、monogram、装饰、专有名词、无品牌字标）。

## 3 样式层

6. `tokens.css`：`:is(.deco, .deco-pv)`，只放调色板与量值，无 `:root`、无 Tailwind 指令。
7. `style.css`：
   - 首两行 `@import "tailwindcss" source(none);` / `@source "./";`，第 3 行 `@source not "./Preview.astro";`，第 4 行 `@import "./tokens.css";`；
   - `@theme inline` 注册三个字体角色；
   - `html:has(.deco)` 只写字面量；
   - `.deco` 内定义两条完整字体栈（Zhuque 在系统 CJK 前）；
   - 组件规则 + 焦点 + 动效（`prefers-reduced-motion: no-preference`）+ `prefers-reduced-motion: reduce` 归位 + `(hover: hover) and (pointer: fine)` + `pointer: coarse` + 四档断点。

## 4 页面与预览

8. `Page.astro`：`Font` ×3、`HeadMeta`、`Reveal`、`body.deco`、`ContextMenu` 无条件在末尾；`h1` 唯一；6 个 `<section>` 均 `aria-labelledby`；装饰 `aria-hidden`；无站内链接（故不需要 `localeDesignHref()`）。
9. `Preview.astro`：自包含碎片（`tokens.css` + `messages` + `PreviewProps`），导出 `fonts`，无 `<Font>` / `:root` / `style.css` / 可聚焦元素；样式只写在组件 `<style>`。

## 5 静态自审（本阶段唯一允许的验证）

```bash
# 1) style.css / tokens.css 契约
grep -n '@source not "./Preview.astro";' src/designs/deco/style.css
sed -n '1,4p' src/designs/deco/style.css
grep -rn ':root' src/designs/deco            # 期望：仅注释
grep -n ':is(.deco, .deco-pv)' src/designs/deco/tokens.css

# 2) Preview 禁用项
grep -nE '<Font|<a |<button|tabindex|import .*style.css|:root \{' src/designs/deco/Preview.astro   # 期望：无命中
wc -c src/designs/deco/Preview.astro         # 期望 1–8 KB

# 3) Page 必交项
grep -nE 'HeadMeta|<Reveal|ContextMenu|loadDesignView\(.deco.' src/designs/deco/Page.astro
grep -n 'LanguageSwitcher\|<script' src/designs/deco/Page.astro   # 期望：无命中

# 4) 对比度（一次性只读脚本，读 tokens.css 实值计算全部前景/背景组合）
node -e "<contrast script>"   # 数值写入 DESIGN.md 与 docs/verification/deco.md

# 5) 字体栈门禁预跑（不运行 npm 脚本）
node --input-type=module -e "import { inspectTypographyCss } from './scripts/fonts/typography.mjs'; ..."
# 期望 0 findings

# 6) .astro 静态编译（不产出 dist）
node --input-type=module -e "import { transform } from '@astrojs/compiler-rs'; ..."
# 期望 0 diagnostics
```

## 6 记录

10. 写 `docs/verification/deco.md`：已跑项写实测结果，未跑项写「未测」并说明原因（并行阶段禁止构建/浏览器），不得把未测项写成通过。
11. 更新本任务 `prd.md`（TBD → 真实需求与验收）、`design.md`、`implement.md`。

## 7 移交主代理（本阶段不做）

12. `scripts/fonts/typography.mjs` 的 `styledCount !== 24` → 最终套数；同步 `scripts/fonts/typography.test.mjs` 与 `npm test` 期望。
13. `npm run build`（含 `fonts:check` / `check:docs` / `fonts:typography` / `astro check` / `fonts:subset` / `fonts:prune` / `verify:html-only` / `fonts:audit`），记录 `dist` 体积增量。
14. 产物抽查：CSS 隔离、无预览工具类泄漏、`rel="preload"` 计数、三语言共用同一 CSS。
15. `impeccable detect --json src/designs/deco`（含有效性反证）。
16. 浏览器实测：1440 / 768 / 375×812 计算值与溢出、console 与网络、动效门控、四种降级情形、菜单冒烟、截图归档。
17. `docs/verification/shared.md` 预览数量、`docs/README.md` 设计计数、`change-log/<version>.md` 收口。

## 回滚点

- 步骤 3 结束（样式层完成）与步骤 4 结束（页面完成）各为一个可回滚点：删掉 `src/designs/deco/` 与 `docs/verification/deco.md` 即完全回到初始状态（未触碰任何共享文件）。
