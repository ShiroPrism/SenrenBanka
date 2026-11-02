# Zine 设计：Riso / 复印朋克

> 子任务：`11-02-zine-design`。父任务：`11-02-next-style-batch`。本任务只改 `src/designs/zine/**` 与 `docs/verification/zine.md`。

## Goal

新增自产 styled 设计 `zine`：把个人资料做成一本 ** photocopied 地下小杂志**——2–3 个专色、错位套印、半调颗粒、复印条纹、剪贴标题、手写圈注、胶带与邮购回执；5 语言、纯 CSS、无设计专属 JS、复用现有字体、不新增图片。

## 与现有设计的差异（必须写进 DESIGN.md Do/Don't）

- vs `poster`：Zine 不是丝网印刷海报；不做巨幅窄体+套准标记的干净实验海报，而是**错版/低墨/复印/剪贴**。
- vs `receipt`：Zine 不是热敏小票；不用点引导线/段码数字/票据机长条，而是杂志跨页与分类广告。
- vs `fax` / `tape`：Zine 不是硬件外壳/传输纸；不做机器面板、走纸孔、J 卡结构。
- vs `brutal`：Zine 不是新粗野告示板；不用硬偏移阴影/酸黄标签/粗黑框作为主语言，而用专色错位与纸张颗粒。

## Scope / Files

```text
src/designs/zine/
  DESIGN.md
  design.json
  Page.astro
  messages.ts
  style.css
  tokens.css
  Preview.astro
docs/verification/zine.md
```

- `design.json` 草案：
  - `displayName: "Zine"`
  - `description: "Riso 复印朋克：荧光专色、错位套印、颗粒与剪贴，把资料做成一本地下小杂志。"`
  - `enabled: true`
  - `locales: ["zh-CN","zh-TW","ja","en","ko"]`
  - `accent: "#ff3b5c"`（荧光红；正文/小字链接用深红 `#c81e3a`）
  - `source: { "type": "self-produced" }`
  - `generatedBy: "impeccable · 2026-11-02（Riso/复印朋克方向）"`

## Requirements

### R1 — 设计规范

- 先写 `DESIGN.md`，至少包含：隐喻、色板（含实测对比度）、字体六项、版式、组件、动效、响应式、无障碍、内容映射、Do/Don't、验证。
- 色板候选（实施时复算并登记）：
  - `--zn-paper #f3efe6` / `--zn-ink #111111` / `--zn-ink-soft #2b2b2b`
  - `--zn-red #ff3b5c`（荧光红：装饰/大字）/ `--zn-red-ink #c81e3a`（深红：链接/小字）/ `--zn-blue #1f4bff`（第二专色）/ `--zn-pink #ff8fb1`（可选第三专色：装饰）
  - 已实测：ink on paper 16.46:1；荧光红 on paper 3.03:1（只做装饰/大字）；深红 on paper 4.94:1；蓝 on paper 5.22:1；白 on 深红 5.67:1。
- 荧光红/粉永远不写正文；正文用 ink；小字链接用深红/蓝；同页只保留一个链接色。
- 任何新增色值先算对比度并登记。

### R2 — 字体

- 只用现有 family：League Gothic / Blackout（masthead）+ Courier Prime（标签/正文备选）+ Handjet / UglyTypist（手写点缀）+ CJK 核心。
- 不新增字体文件、不新增 `@font-face`；每个字体栈保留核心 CJK 变量；系统 CJK 排在核心变量之后。
- 正文字号与行高优先可读性；Courier Prime 只用于短标签，长文用 Inter 或 CJK 核心。
- 跑 `npm run fonts:typography` / `npm run fonts:coverage`。

### R3 — 页面与内容

- 页面结构：Masthead（姓名/期号/地点）→ Cover line（headline）→ Manifesto（bio）→ Classifieds（links）→ Spreads（projects）→ Contributor notes（experience）→ Stamps（skills）→ Mail-in coupon（contact）→ 页脚。
- 必渲染 `name` / `headline` / `bio` / `links`；其余条件渲染；`avatar` 不呈现；`location` 在期号/地点行呈现，缺失时省略。
- 内部链接用 `withBase()` / locale 辅助函数；外部链接直接用 `link.url`。
- 共享 `<ContextMenu>` 无条件渲染；不渲染 `<LanguageSwitcher>`。

### R4 — 视觉与组件

- 纸底 + 复印条纹 + 颗粒；纹理层数受控，不影响正文阅读。
- 错位套印：标题/标签用 1–2px 偏移的伪元素或 text-shadow 做第二色；**不复制正文**。
- 剪贴/胶带：静态 `clip-path` 或伪元素色块；不新增图片；不参与动画。
- 手写圈注：Handjet / UglyTypist 少量用于标签/圈注；不用于长文。
- Masthead：刊名（h1）+ 期号 + 地点/日期；不抄真实杂志刊头/品牌 Logo；不伪造 ISBN/条码。
- 分类广告：links 列表；每项有文字标签，不以颜色/形状单独承载。
- 邮购回执：contact 面板；email 是唯一主链接；无 email/note 时整块不渲染。

### R5 — 动效

- 印章落下：`scale(1.25) rotate(-4deg) → scale(1) rotate(-2deg)`，180ms，`steps(2, end)`，只播一次。
- 复印扫描：一条低透明度色带 `translateX` 一次，300ms；不无限循环。
- 滚动显现：共享 Reveal，180–240ms，位移 ≤12px；卡片错落 40–60ms。
- 交互：链接 hover 只变颜色/下划线；不做抖动/闪烁。
- 全部包在 `@media (prefers-reduced-motion: no-preference)`；减动态印章不旋转、扫描带隐藏，内容可见。
- 无设计专属 JS；共享 `<Reveal>` 门控只能是 `html[data-reveal-ready]`。

### R6 — 响应式与无障碍

- 1440 / 1024 / 768 / 375×812 验证；375px 无横向滚动；长词 `overflow-wrap: anywhere`。
- 每页唯一 `h1` = 姓名；分区 `h2`；跨页标题 `h3`；每个 section `aria-labelledby`。
- 装饰（印章、胶带、圈注、复印条纹、期号）`aria-hidden` 或伪元素；链接可访问名只由文本承担。
- 焦点环 2px 深红/蓝 + offset；触控 ≥44px；不以颜色单独传达状态；不做闪烁/频闪。
- 正文对比 ≥4.5:1；大字 ≥3:1；荧光红只做装饰/大字；纹理不造成阅读疲劳。

### R7 — 预览与验证

- `Preview.astro` 自包含、16/10、1–8KB、`aria-hidden`、无可聚焦元素；不 import `style.css`。
- 更新 `docs/verification/zine.md`：构建、5 语言、1440/768/375、键盘/焦点、对比度、减动态/无 JS/无 IO、预览、CSS 隔离、dist 增量。
- 跑 `npm test` / `npm run check` / `npm run build` / `npm run verify:html-only` / `npm run fonts:audit`（至少与父任务集成时）。

## Acceptance Criteria

- [ ] A1 `src/designs/zine/` 七个文件齐备；`design.json` 通过注册表校验；5 语言页面可达。
- [ ] A2 `DESIGN.md` 包含色板实测表、字体六项、动效、响应式、无障碍、内容映射、Do/Don't、验证章节。
- [ ] A3 无新增字体/图片/JS/第三方图标库；字体栈保留核心 CJK；`fonts:typography` / `fonts:coverage` 通过。
- [ ] A4 5 语言 `messages.ts` 键齐全；共享菜单、Reveal、`withBase()`、`aria-labelledby` 通过验证。
- [ ] A5 荧光红/粉不承载正文；深红/蓝小字链接 ≥4.5:1；错位/颗粒不影响正文可读性；375px 无横向滚动。
- [ ] A6 无无限 marquee/闪烁；减动态/无 JS/无 IO 内容可见；触控 ≥44px。
- [ ] A7 `docs/verification/zine.md` 完成；dist 增量记录；无 CSS 隔离/共享聚合问题。

## Open Decisions（评审确认）

- `displayName` 用 "Zine" 还是 "Riso Zine"；`description` 最终文案。
- 主专色用荧光红 `#ff3b5c` 还是荧光粉 `#ff8fb1`（建议红；粉作第二/第三专色）。
- 长文正文是否用 Inter（更可读）还是 Courier Prime（更 zine）；建议正文 Inter，标签/引文 Courier Prime。

## References

- 父任务 `design.md` §2 / §5；父任务 `prd.md` R2/R3。
- `docs/rules/design-contract.md`、`visual-language.md`、`accessibility-responsive.md`、`pitfalls.md`。
- `.agents/skills/design-page-verify/SKILL.md`。
- 参考实现：`src/designs/poster/`（印刷语言，反面参照）、`src/designs/receipt/`（纸/票据，反面参照）、`src/designs/deco/`（文件结构与 Preview 隔离）。
