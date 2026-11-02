# Transit 设计：交通导视

> 子任务：`11-02-transit-design`。父任务：`11-02-next-style-batch`。本任务只改 `src/designs/transit/**` 与 `docs/verification/transit.md`。

## Goal

新增自产 styled 设计 `transit`：把个人资料做成 **一张城市轨道网络图 + 站台导视**——线路色带、站点圆点、换乘节点、方向箭头、站台牌、时刻表；5 语言、纯 CSS + 少量内联 SVG、无设计专属 JS、复用现有字体、不新增图片。

## 与现有设计的差异（必须写进 DESIGN.md Do/Don't）

- vs `govuk`：Transit 不是政务 Web 表单；不用蓝幅/黄 focus/黑白描边政务语言，而是环境图形的线路/站点/方向系统。
- vs `oxide`：Transit 不是深色工业 HUD；用浅色纸、线路色带和公共导视排版，不用 ASCII/扫描线/暗色面板。
- vs `fast` / `material3`：Transit 不是企业 UI 卡片/圆角/阴影；用 1px 网格、线路节点和时刻表。

## Scope / Files

```text
src/designs/transit/
  DESIGN.md
  design.json
  Page.astro
  messages.ts
  style.css
  tokens.css
  Preview.astro
docs/verification/transit.md
```

- `design.json` 草案：
  - `displayName: "Transit"`
  - `description: "交通导视：线路色带、站点圆点、换乘与方向箭头，把资料排成一张城市轨道网络图。"`
  - `enabled: true`
  - `locales: ["zh-CN","zh-TW","ja","en","ko"]`
  - `accent: "#0b7a5c"`（主线绿；第二线红 `#d7263d`，第三线黄 `#f2b705` 只做非文字）
  - `source: { "type": "self-produced" }`
  - `generatedBy: "impeccable · 2026-11-02（交通导视方向）"`

## Requirements

### R1 — 设计规范

- 先写 `DESIGN.md`，至少包含：隐喻、色板（含实测对比度）、字体六项、版式、组件、动效、响应式、无障碍、内容映射、Do/Don't、验证。
- 色板候选（实施时复算并登记）：
  - `--tr-paper #f5f4ef` / `--tr-ink #101418` / `--tr-ink-soft #3b4248` / `--tr-muted #5d646b`
  - `--tr-line #0b7a5c` / `--tr-line-2 #d7263d` / `--tr-line-3 #f2b705` / `--tr-rule #c9c7bd`
  - 已实测：ink on paper 16.80:1；green on paper 4.82:1；red on paper 4.50:1；white on green 5.31:1；white on red 4.96:1；yellow on paper ≈1.9:1（只做非文字）。
- 线路色只用于色带/圆点/边框；正文与线路名用 ink；黄色线永不承载文字；白字只用于 ≥18.66px bold / ≥24px 大字号。

### R2 — 字体

- 只用现有 family：Inter / Roboto Flex（正文与展示）+ JetBrains Mono（站码/时刻）+ CJK 核心。
- 不新增字体文件、不新增 `@font-face`；每个字体栈保留核心 CJK 变量；系统 CJK 排在核心变量之后。
- 跑 `npm run fonts:typography` / `npm run fonts:coverage`。

### R3 — 页面与内容

- 页面结构：网络条（线路徽章/终点站/地点）→ Hero（姓名=线路/终点站，headline=服务说明，bio=网络公告）→ links 线路/换乘 → projects 站点卡片 → experience 时刻表 → skills 线路徽章 → contact 售票处 → 页脚。
- 必渲染 `name` / `headline` / `bio` / `links`；其余条件渲染；`avatar` 不呈现；`location` 在网络条呈现，缺失时省略。
- 内部链接用 `withBase()` / locale 辅助函数；外部链接直接用 `link.url`。
- 共享 `<ContextMenu>` 无条件渲染；不渲染 `<LanguageSwitcher>`。

### R4 — 视觉与组件

- 浅色网格纸 + 1px 线路骨架；线路图用 CSS grid + 伪元素，不用 Canvas/图片。
- 顶部网络条：线路徽章 + 终点站 + 地点/日期；徽章用线路色块 + ink/白字（按对比度）。
- 站点卡片：站点码（等宽）+ 标题 + 描述 + 标签；站点码是装饰/编号，不进入可访问名（除非有语义）。
- 时刻表：真实 `<table>` 语义（`th`/`scope`）或定义列表；窄屏重排为纵向，不横向滚动。
- Pictogram：少量自绘内联 SVG（列车、换乘、出口、信息），24px、2px stroke、`currentColor`；装饰性 `aria-hidden`，有语义的配文字标签；不引入整套图标库。
- 方向箭头：CSS 伪元素或内联 SVG；`aria-hidden`；文字标签承担语义。

### R5 — 动效

- 线路展开：伪元素 `scaleX(0) → 1`，600ms，只播一次；不用 `stroke-dashoffset`。
- 站点点亮：`opacity 0 → 1` + `scale(.8) → 1`，240ms，错落 40ms。
- 时刻表行淡入 180ms；不做翻牌无限循环。
- 全部包在 `@media (prefers-reduced-motion: no-preference)`；减动态内容直接可见。
- 无设计专属 JS；共享 `<Reveal>` 门控只能是 `html[data-reveal-ready]`。

### R6 — 响应式与无障碍

- 1440 / 1024 / 768 / 375×812 验证；375px 无横向滚动；线路图重排为纵向线路；长词 `overflow-wrap: anywhere`。
- 每页唯一 `h1` = 姓名；分区 `h2`；站点标题 `h3`；每个 section `aria-labelledby`。
- 线路色不单独承载信息：线路名/编号始终可见；色盲安全；焦点环 2px + offset；触控 ≥44px（建议 48px）。
- 装饰线路/箭头/站点点缀 `aria-hidden`；站点信息用真实列表/表格承载；不以颜色单独传达状态。

### R7 — 预览与验证

- `Preview.astro` 自包含、16/10、1–8KB、`aria-hidden`、无可聚焦元素；不 import `style.css`。
- 更新 `docs/verification/transit.md`：构建、5 语言、1440/768/375、键盘/焦点、对比度、减动态/无 JS/无 IO、预览、CSS 隔离、dist 增量。
- 跑 `npm test` / `npm run check` / `npm run build` / `npm run verify:html-only` / `npm run fonts:audit`（至少与父任务集成时）。

## Acceptance Criteria

- [ ] A1 `src/designs/transit/` 七个文件齐备；`design.json` 通过注册表校验；5 语言页面可达。
- [ ] A2 `DESIGN.md` 包含色板实测表、字体六项、动效、响应式、无障碍、内容映射、Do/Don't、验证章节。
- [ ] A3 无新增字体/图片/JS/第三方图标库；内联 SVG 图标有文字标签或 `aria-hidden`；`fonts:typography` / `fonts:coverage` 通过。
- [ ] A4 5 语言 `messages.ts` 键齐全；共享菜单、Reveal、`withBase()`、`aria-labelledby` 通过验证。
- [ ] A5 线路色不单独承载信息；黄色线不承载文字；窄屏纵向线路无横向滚动；触控 ≥44px。
- [ ] A6 对比度：正文 ≥4.5:1；大字 ≥3:1；非文字线条 ≥3:1；白字仅用于合格大字号。
- [ ] A7 `docs/verification/transit.md` 完成；dist 增量记录；无 CSS 隔离/共享聚合问题。

## Open Decisions（评审确认）

- `displayName` 用 "Transit" 还是 "Transit Map"；`description` 最终文案。
- 主线色用绿 `#0b7a5c` 还是红 `#d7263d`（建议绿，红作第二线；红色主色可留给节庆/记分牌）。
- 是否使用 2–4 个自绘内联 SVG pictogram；若不用图标，线路名+箭头文字是否足够。

## References

- 父任务 `design.md` §2 / §4；父任务 `prd.md` R2/R3。
- `docs/rules/design-contract.md`、`visual-language.md`、`accessibility-responsive.md`、`pitfalls.md`。
- `.agents/skills/design-page-verify/SKILL.md`。
- 参考实现：`src/designs/govuk/`（信息层级/表格）、`src/designs/oxide/`（技术标签，反面参照）、`src/designs/ink/`（文件结构）。
