# Aero — 实现设计

> 子任务技术设计。设计源以 `src/designs/aero/DESIGN.md` 为准；本文件锁定实现结构、令牌、类名与验证口径。父任务见 `../11-02-next-style-batch/design.md` §2/§3。

## 1. 文件与职责

| 文件 | 内容 |
|---|---|
| `DESIGN.md` | 隐喻、色板、字体六项、版式、组件、动效、响应式、无障碍、内容映射、Do/Don't、验证 |
| `design.json` | `displayName: "Aero"`、`description`、`enabled: true`、5 locale、`accent: "#2f9fe0"`、`source: self-produced` |
| `tokens.css` | `:is(.aero, .aero-pv)` 下的 `--ae-*` 令牌；禁止 `:root` |
| `style.css` | `@import "tailwindcss" source(none);` + `@source "./";` + `@source not "./Preview.astro";`；版式/组件/动效 |
| `Page.astro` | `loadDesignView('aero', Astro.url.pathname)`；`<HeadMeta>`、`<Font>`、`<Reveal>`、`<ContextMenu>` |
| `messages.ts` | 5 语言：`zh-CN` / `zh-TW` / `ja` / `en` / `ko` |
| `Preview.astro` | 自包含 16/10 缩略；不 import `style.css`；`aria-hidden`；无可聚焦元素 |

## 2. 令牌

```css
:is(.aero, .aero-pv) {
  --ae-sky: #bfe9ff;
  --ae-sky-deep: #0f6f9e;
  --ae-grass: #7fcf6a;
  --ae-paper: #f7fdff;
  --ae-ink: #123247;
  --ae-ink-soft: #2c536b;
  --ae-accent: #2f9fe0;
  --ae-accent-ink: #0b6fa4;
  --ae-gloss: linear-gradient(180deg, rgb(255 255 255 / 0.9), rgb(255 255 255 / 0.25) 46%, rgb(255 255 255 / 0) 47%);
  --ae-shell: 74rem;
  --ae-radius: 28px;
}
```

对比度（已实算）：ink/sky 10.37:1；ink/paper 13.00:1；ink/grass 7.02:1；accent-ink/paper 5.35:1；white/sky-deep 5.40:1。正文只用 ink / ink-soft；白色只用于深色底大字号。

## 3. 字体

- 展示：`Fredoka` + CJK 核心（`Zhuque` / `LXGW`）。
- 正文：`Inter` + CJK 核心。
- 可选：`Roboto Flex` 替代展示位；不新增 family。
- 每个 `font` / `font-family` 写完整 fallback；系统 CJK 排在 `--font-zhuque` / `--font-lxgw` 之后。
- `zh-TW` 可加 `<Font cssVariable="--font-noto-sans-tc" />`；`ko` 可加 `<Font cssVariable="--font-gothic-a1" />`；核心 CJK 变量仍保留。

## 4. 布局与类名

```text
body.aero
  .aero-sky           背景渐变 + 径向高光（装饰）
  .aero-shell
    header.aero-statusbar   设备名 / 地点 / 时间感标签
    main
      section.aero-hero       h1 姓名 + headline + bio + 玻璃球
      section.aero-dock       links 凝胶按钮
      section.aero-windows    projects 窗口卡片
      section.aero-timeline   experience 时间线
      section.aero-badges     skills 功能徽章
      section.aero-message    contact 发送消息
    footer.aero-footer
  ContextMenu
```

- Hero：`grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr)`；≤1024 单列。
- 玻璃球：`aria-hidden`，纯 CSS 径向渐变 + 内高光。
- 窗口卡片：标题栏 + 内容区 + 三个装饰点；装饰点 `aria-hidden`，不可聚焦。
- 链接：`min-height: 48px`；触控 ≥44px；焦点环 2px `--ae-accent-ink` + 3px offset。

## 5. 动效

- `ae-boot`：状态条/面板 `opacity 0→1`、`translateY(10px)→0`，700ms，只播一次。
- `ae-rise`：图标/窗口 `opacity + translateY` 520ms，错落 60ms，上限 3 个。
- `ae-bubble`：气泡一次性上浮 8px + 淡出；不做无限漂浮。
- 全部包在 `@media (prefers-reduced-motion: no-preference)`；减动态内容直接可见。
- 共享 `<Reveal>` 门控仅 `html[data-reveal-ready]`。

## 6. 响应式与无障碍

- 1440：74rem，Hero 两列，窗口三列。
- 1024–1439：Hero 两列，窗口两列。
- 768–1023：Hero 单列，窗口两列。
- ≤760：窗口单列，状态条换行。
- 375×812：正文 16px，无横向溢出，长词 `overflow-wrap: anywhere`。
- 唯一 `h1` = 姓名；分区 `h2`；窗口 `h3`；`aria-labelledby`；装饰 `aria-hidden`。
- 不以颜色单独传达状态；链接始终有下划线/文字标签。

## 7. 内容映射

| 字段 | 呈现 |
|---|---|
| `name` | `h1` + 状态条设备名 |
| `headline` | Hero 副题 |
| `bio` | About this device |
| `links` | 桌面图标/工具栏 |
| `projects` | 窗口卡片 |
| `experience` | 系统时间线 |
| `skills` | 功能徽章 |
| `contact` | 发送消息面板 |
| `avatar` | 不呈现 |
| `location` | 状态条地点；缺失省略 |

## 8. Do / Don't

- Do 用饱和天空/草绿 + 强高光 + 凝胶质感建立 2000s 科技乐观。
- Do 让姓名成为设备名/开机标识，信息像窗口和图标一样排列。
- Don't 做 90s 表格/像素/彩虹分隔线；Don't 做 Apple 毛玻璃大模糊。
- Don't 伪造可交互窗口按钮；Don't 用 OS 商标/真实截图。
- Don't 加图片、字体、设计专属 JS。

## 9. 验证

- `design-page-verify`：构建、5 语言、1440/768/375、键盘/焦点、对比度、减动态/无 JS/无 IO、预览、CSS 隔离、dist 增量。
- 记录写入 `docs/verification/aero.md`。
