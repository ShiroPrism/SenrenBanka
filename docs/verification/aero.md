# verification — Aero（自产：2000s 科技乐观）

> 本文件是 `aero` 的**当前**完整验证状态；重复验证时更新本文件，历史由 Git 保留。
> 验证流程：`.agents/skills/design-page-verify/SKILL.md`。实现与验收日期：2026-11-02。

## 设计状态

- `styled` / enabled / `self-produced` / accent `#2f9fe0`（签名天空蓝）。
- 文件：`DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`、`style.css`、`tokens.css`、`Preview.astro`。
- 无设计专属 JS；只接共享 `Reveal` 与 `ContextMenu`。无图片、无第三方依赖、无自定义光标。
- 版式：天空/草地背景 + 设备外壳 + 玻璃球 + 凝胶按钮 + 窗口卡片；Hero 两列（≤1024 单列），窗口三列（≤1023 两列，≤760 单列）。
- 5 语言：`zh-CN` / `zh-TW` / `ja` / `en` / `ko`。

## 构建与测试

| 命令 | 结果 |
|---|---|
| `npm run fonts:typography` | 通过：**27** 套 `styled` / **27** 套核心 CJK / 31 个 primary-only local family |
| `npm run fonts:coverage` | 通过：28 个设计脚本覆盖 |
| `npm run build` | 通过：**181** 页；`astro check` **0 error / 0 warning**（1 条既有 lexicon hint）；HTML-only 门禁 5 页；字体审计 0 孤儿 / 0 悬空 |
| `dist` 总体积 | **7,977,637 B（7.61 MiB）**，≤10 MiB 硬门禁（目标 ≤8.2 MiB） |
| 字体文件 | 45 个 WOFF2；`fonts:audit` 的 64 条缺字警告均来自既有设计（pager / pixel-pet-rpg / radio / receipt），不含 aero |
| `npm test` | **84/84** 通过 |

- 新增 Aero 后更新了 `scripts/fonts/typography.mjs` 与 `typography.test.mjs` 的 styled 计数（26 → 27）。
- `src/designs/descriptions.ts` 补 5 语言切换页描述；`Page.astro` 在所有非 zh-TW 页面注册 `--font-gothic-a1`，保证字体栈变量完整；zh-TW 由 `html:lang(zh-TW)` 重映射到 `--font-noto-sans-tc`。

## 检测器

```text
.agents/skills/impeccable/scripts/impeccable.cmd detect --json src/designs/aero
[]
```

- 有效性反证：同一命令对 `src/designs/oxide` 命中已知信号 `codex-grid-background`，检测器并非空转。

## 产物隔离

- 设计唯一 CSS：`dist/_astro/Page.B9w_3Q9r.css`（20,488 B）；其中 `.bt-` / `.ink-` / `.dc-` / `.tr-` / `.zn-` / `.ed-` / `.ox-` / `.fs-` 等选择器计数均为 **0**。
- 5 语言页面引用同一 CSS；根页 / 404 / 各语言入口页 / 切换页不链接 Aero 设计 CSS。
- 切换页预览 `SwitcherPage` CSS 含 `.aero-pv`，属预览自身聚合；`.aero-pv` 内可聚焦元素 0，调用方 `aria-hidden`。

## 浏览器矩阵

预览服务：`npm run preview` → `http://127.0.0.1:4321`。

### 1440×900 桌面

- 无横向溢出（`scrollWidth 1440 = innerWidth`）。
- 姓名实际字体为 Fredoka → Gothic A1 → Zhuque → 系统 CJK；`document.fonts` 中 Fredoka / Inter / Zhuque 均为 `loaded`。
- Reveal：7 个目标；滚动到底 **7/7**，隐藏元素 **0**；直接跳到底 **7/7**，隐藏元素 **0**。
- 6 个 `<section>` 全部有可访问名；唯一 `h1`；标题序列 h1 → h2 ×5 → h3 ×3，无跳级；`aria-hidden` 元素 45。
- 核心字段：姓名、headline、bio、3 条 links 全部渲染；projects / experience / skills / contact 条件区块均存在。
- 仅加载 Document + 字体 CSS + `Page.*.css` + 共享菜单 CSS/JS；console **0 error / 0 warning**，无 4xx。
- 键盘 Tab 顺序 = DOM；焦点环 3px `--ae-accent-ink`、offset 3px。

### 768×1024 平板

- 无横向溢出（`scrollWidth 768 = innerWidth`）。
- Hero 单列；窗口两列；滚动到底 **7/7**，隐藏元素 **0**。

### 375×812 触控

- `(pointer: coarse)` 为 true；`scrollWidth === innerWidth === 375`，无横向溢出。
- 页面主链接命中区：Dock 按钮 **48px**；项目标题 **44px**；消息邮箱 **44px**。
- 悬浮球 **52×52**，`aria-label` / `aria-haspopup` / `aria-controls` / `aria-expanded` 齐全；触屏 tap 可打开面板。
- 底部面板 `getBoundingClientRect().bottom = 812 = innerHeight`；面板项高度 **48px**；关闭 ✕ 与取消条均可见。
- 动作清单为 `copy / share / random / switch`，无 `reload / top / print`。
- 语言项 **5** 个、`aria-current="page"` 恰好 **1** 个；`hreflang` 与 `site.config.yaml` 一致。
- 打开时 `html` overflow 为 `clip hidden` 且滚动锁定；关闭 ✕ 后恢复 `clip visible`、面板隐藏、`aria-expanded="false"`。
- 页面高度 2591px；滚动到底 **7/7** 显现，隐藏元素 **0**；console 0。

### 降级

| 情形 | 门控 | 隐藏元素 | 结果 |
|---|---|---:|---|
| `prefers-reduced-motion: reduce` | 未写入 `data-reveal-ready` | 0 | `.aero-boot` animation `none` |
| 无 JavaScript | 无门控 | 0 | h1 / bio / 6 个 section / 主链接可见 |
| 无 `IntersectionObserver` | 未写入 | 0 | 7/7 已标记显现 |
| `IntersectionObserver` 抛错 | boot 写入后由 `try/catch` 撤销 | 0 | 7/7 已标记显现 |

## 五语言与网络

| locale | 页面 | `html lang` | robots | canonical | head alternate |
|---|---|---|---|---|---|
| zh-cn | 25946 B | `zh-CN` | `noindex, follow` | `/zh-cn/aero/` | 0（非默认设计） |
| zh-tw | 26021 B | `zh-TW` | `noindex, follow` | `/zh-tw/aero/` | 0 |
| ja | 26663 B | `ja` | `noindex, follow` | `/ja/aero/` | 0 |
| en | 26500 B | `en` | `noindex, follow` | `/en/aero/` | 0 |
| ko | 26517 B | `ko` | `noindex, follow` | `/ko/aero/` | 0 |

- 5 语言共用同一设计 CSS；菜单内 `hreflang` 共 10 个（5 语言 × SSR 双份 DOM），运行时只有一份可见。
- 浏览器 console 0；网络请求 host 仅 `127.0.0.1:4321`，第三方 0、失败 0、4xx/5xx 0。

## 对比度（设计令牌实测）

| 元素 | 前景 / 背景 | 比值 |
|---|---|---:|
| 姓名 / 正文（纸白底） | `#123247` / `#f7fdff` | 13.00:1 |
| 正文（天空底） | `#123247` / `#bfe9ff` | 10.37:1 |
| 次级正文（纸白底） | `#2c536b` / `#f7fdff` | 8.00:1 |
| 弱化元信息（纸白底） | `#3d6076` / `#f7fdff` | 6.53:1 |
| 弱化元信息（天空底） | `#3d6076` / `#bfe9ff` | 5.21:1 |
| 链接 / 焦点环（纸白底） | `#0b6fa4` / `#f7fdff` | 5.35:1 |
| 状态条 / 消息面板白字 | `#f7fdff` / `#0f6f9e` | 5.54:1 |
| 消息面板白字（深端） | `#f7fdff` / `#0b5a83` | 7.49:1 |

- 正文最低 5.21:1（弱化元信息）；天空蓝/草绿不承载正文；白色只用于深色底大字号/按钮。

## 预览碎片

- 自包含：只 import `./tokens.css`、`./messages` 与 `PreviewProps`；`export const fonts` 导出 Fredoka / Inter / Zhuque / Noto Sans TC / Gothic A1。
- 无 `:root`、无 `<Font>`、无可聚焦元素；`aria-hidden` 由切换页调用方提供。
- 缩略档位已登记在 `DESIGN.md` §5.1。

## 截图归档

- `.cache/verification/aero-1440.png`（1440 全页）
- `.cache/verification/aero-768.png`（768 全页）
- `.cache/verification/aero-375.png`（375 全页）
- `.cache/verification/aero-375-menu.png`（375 动作面板）
- `.cache/verification/aero-1440-reduced.png`（减动态）
- `.cache/verification/aero-1440-nojs.png`（无 JS）
