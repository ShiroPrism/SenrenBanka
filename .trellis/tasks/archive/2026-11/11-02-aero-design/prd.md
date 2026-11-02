# Aero 设计：2000s 科技乐观

> 子任务：`11-02-aero-design`。父任务：`11-02-next-style-batch`。本任务只改 `src/designs/aero/**` 与 `docs/verification/aero.md`。

## Goal

新增自产 styled 设计 `aero`：把个人资料做成一台 **2007 年个人设备刚开机时的桌面**——天蓝/草绿、玻璃泡、凝胶按钮、镜头光晕、半透明层；5 语言、纯 CSS、无设计专属 JS、复用现有字体、不新增图片。

## 与现有设计的差异（必须写进 DESIGN.md Do/Don't）

- vs `homepage99`：Aero 不是 90s 个人主页；不用表格边框、像素字、彩虹分隔线、闪烁 GIF 语汇。
- vs `frost`：Aero 不是 Apple HIG 毛玻璃；用饱和天空/草绿 + 强高光 + 凝胶质感 + 自然元素，限制大面积模糊。
- vs `brutal` / `cute-alism`：Aero 是光滑、友好、科技乐观，不是粗黑边/硬阴影/糖果拼贴。

## Scope / Files

```text
src/designs/aero/
  DESIGN.md
  design.json
  Page.astro
  messages.ts
  style.css
  tokens.css
  Preview.astro
docs/verification/aero.md
```

- `design.json` 草案：
  - `displayName: "Aero"`
  - `description: "2000s 科技乐观：天蓝与草绿、玻璃泡与凝胶按钮、镜头光晕与半透明层，把资料做成一块会发光的桌面。"`
  - `enabled: true`
  - `locales: ["zh-CN","zh-TW","ja","en","ko"]`
  - `accent: "#2f9fe0"`（签名天空蓝；文字/焦点用 `#0b6fa4`）
  - `source: { "type": "self-produced" }`
  - `generatedBy: "impeccable · 2026-11-02（2000s 科技乐观方向）"`

## Requirements

### R1 — 设计规范

- 先写 `DESIGN.md`，至少包含：隐喻、色板（含实测对比度）、字体六项记录、版式、组件、动效、响应式、无障碍、内容映射、Do/Don't、验证。
- 色板候选（实施时复算并登记）：
  - `--ae-sky #bfe9ff` / `--ae-sky-deep #0f6f9e` / `--ae-grass #7fcf6a` / `--ae-paper #f7fdff`
  - `--ae-ink #123247` / `--ae-ink-soft #2c536b` / `--ae-accent #2f9fe0` / `--ae-accent-ink #0b6fa4`
  - 已实测：ink on sky 10.37:1；ink on paper 13.00:1；ink on grass 7.02:1；accent-ink on paper 5.35:1；white on sky-deep 5.40:1。
- 正文只用 ink/ink-soft；白色只用于深色底上的大字号/按钮，实测 ≥4.5:1；天空蓝/草绿不单独承载链接或状态。

### R2 — 字体

- 只用现有 family：Inter（正文）+ Fredoka（展示/编号）+ CJK 核心；可选用 Roboto Flex 替代展示位。
- 不新增字体文件、不新增 `@font-face`。
- `zh-TW` / `ko` 可按项目现有 family 做 locale 路由（Noto Sans TC / Gothic A1 等），但每个字体栈必须保留核心 CJK 变量；系统 CJK 排在核心变量之后。
- 跑 `npm run fonts:typography` / `npm run fonts:coverage`。

### R3 — 页面与内容

- 页面结构：状态条 → Hero 设备面板（姓名/ headline / bio）→ links 桌面图标/工具栏 → projects 窗口卡片 → experience 系统时间线 → skills 功能徽章 → contact 发送消息 → 页脚。
- 必渲染 `name` / `headline` / `bio` / `links`；`projects` / `experience` / `skills` / `contact` 条件渲染；`avatar` 不呈现；`location` 在状态条呈现，缺失时省略。
- 内部链接用 `withBase()` / locale 辅助函数；外部链接直接用 `link.url`。
- 共享 `<ContextMenu>` 无条件渲染；不渲染 `<LanguageSwitcher>`；无设计内切换入口。

### R4 — 视觉与组件

- 设备面板：24–32px 圆角、内高光、外阴影；不伪造可交互窗口控件（窗口三点装饰 `aria-hidden`，不可聚焦）。
- 凝胶按钮：渐变高光 + inset 高光；min-height 44px（桌面建议 48px）；hover 只动 transform/颜色。
- 玻璃球/气泡/镜头光晕：纯 CSS 径向渐变；全部 `aria-hidden`；不新增图片。
- 状态条：深色底 + 纸白/浅色字；对比度实测；不模仿具体 OS 商标/任务栏。

### R5 — 动效

- 开机：状态条淡入 + 面板 `translateY(10px) → 0`，700ms，只播一次。
- 图标/窗口：`opacity + translateY` 520ms，错落 60ms，上限 3 个。
- 气泡：一次性上浮或完全静止；禁止无限漂浮。
- 全部包在 `@media (prefers-reduced-motion: no-preference)`；减动态内容直接可见。
- 无设计专属 JS；共享 `<Reveal>` 门控只能是 `html[data-reveal-ready]`。

### R6 — 响应式与无障碍

- 1440 / 1024 / 768 / 375×812 验证；375px 无横向滚动；长词 `overflow-wrap: anywhere`。
- 每页唯一 `h1` = 姓名；分区 `h2`；窗口标题 `h3`；每个 section `aria-labelledby`。
- 装饰（气泡、玻璃球、状态点、窗口三点）`aria-hidden`；链接可访问名只由文本承担。
- 焦点环 2px `--ae-accent-ink` + 3px offset；触控 ≥44px；不以颜色单独传达状态。

### R7 — 预览与验证

- `Preview.astro` 自包含、16/10、1–8KB、`aria-hidden`、无可聚焦元素；不 import `style.css`。
- 更新 `docs/verification/aero.md`：构建、5 语言、1440/768/375、键盘/焦点、对比度、减动态/无 JS/无 IO、预览、CSS 隔离、dist 增量。
- 跑 `npm test` / `npm run check` / `npm run build` / `npm run verify:html-only` / `npm run fonts:audit`（至少与父任务集成时）。

## Acceptance Criteria

- [ ] A1 `src/designs/aero/` 七个文件齐备；`design.json` 通过注册表校验；5 语言页面可达。
- [ ] A2 `DESIGN.md` 包含色板实测表、字体六项、动效、响应式、无障碍、内容映射、Do/Don't、验证章节。
- [ ] A3 无新增字体/图片/JS/第三方图标库；字体栈保留核心 CJK；`fonts:typography` / `fonts:coverage` 通过。
- [ ] A4 5 语言 `messages.ts` 键齐全；共享菜单、Reveal、`withBase()`、`aria-labelledby` 通过验证。
- [ ] A5 1440/768/375 视觉与交互通过；375px 无横向滚动；触控 ≥44px；减动态/无 JS/无 IO 内容可见。
- [ ] A6 对比度：正文 ≥4.5:1；大字 ≥3:1；非文字线条 ≥3:1；天空蓝/草绿不单独承载信息。
- [ ] A7 `docs/verification/aero.md` 完成；dist 增量记录；无 CSS 隔离/共享聚合问题。

## Open Decisions（评审确认）

- `displayName` 用 "Aero" 还是 "Aero 2007"；`description` 最终文案。
- 展示字用 Fredoka 还是 Roboto Flex（建议 Fredoka 做设备名/大字，Inter 做正文）。
- 是否接受 `zh-TW` 用 Noto Sans TC、`ko` 用 Gothic A1 的 locale 路由（不新增字体）。

## References

- 父任务 `design.md` §2 / §3；父任务 `prd.md` R2/R3。
- `docs/rules/design-contract.md`、`visual-language.md`、`accessibility-responsive.md`、`pitfalls.md`。
- `.agents/skills/design-page-verify/SKILL.md`。
- 参考实现：`src/designs/ink/`、`src/designs/deco/`（文件结构、字体栈、Preview 隔离）。
