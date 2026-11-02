# verification — Ink（自产：宋式册页 / 侘寂）

> **2026-11-02 页脚站点声明**：示例数据声明改由 `site.config.yaml` 的 `i18n.locales[].notice` 提供；示例站可见，缺省不渲染，无布局残留。跨设计验证见 `shared.md`。
> **2026-11-01 韩语覆盖（C3）**：新增 `/ko/ink/` 与韩语文案；375×812 / 1280×800 冒烟通过（`lang=ko`、韩语字体加载、无横向溢出、0 console）；文案已人工审校（用户确认 2026-11-01）。

> 本文件是 `ink` 的**当前**完整验证状态；重复验证时更新本文件，历史由 Git 保留。
> 验证流程：`.agents/skills/design-page-verify/SKILL.md`。实现与验收日期：2026-10-31。

## 设计状态

- `styled` / enabled / `self-produced` / accent `#a13c2c`（朱砂）。
- 文件：`DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`、`style.css`、`tokens.css`、`Preview.astro`。
- 无设计专属 JS；只接共享 `Reveal` 与 `ContextMenu`。无图片、无第三方依赖、无自定义光标。
- 版式：宣纸底 + 墨 + 朱砂印 + 青瓷细线；≥1024px 右缘竖排题署，<1024px 降级横排单列；卷帙三列（761–1023px 两列，≤760px 单列）。

## 构建与测试

| 命令 | 结果 |
|---|---|
| `npm run fonts:typography` | 通过：**26** 套 `styled` / **17** 套核心 CJK / 20 个 primary-only local family |
| `npm run build` | 通过：**117** 页；`astro check` **0 error / 0 warning**；HTML-only 门禁 3 页；字体审计 0 孤儿 / 0 悬空 |
| 字体产物 | 核心子集 3 个 / **710,012 B**（LXGW / Zhuque / Ark）；保留 **336** 条 `@font-face` / 22 个字体 CSS 包 / **27,168 B**；字体文件 34 / **1,621,596 B** |
| `dist` 总体积 | **6,544,535 B（6.24 MiB）**，≤10 MiB 硬门禁 |
| `npm test` | **67/67** 通过 |

- `fonts:audit` 对 `/zh-cn/ink/`、`/ja/ink/`、`/en/ink/` 报告 `uncovered: []`、`deployedGaps: []`；全站 32 条缺字警告均来自既有设计，不含 ink。
- 构建在修正印章缓动后重新执行；最终产物为上述数值。

## 检测器

```text
.agents/skills/impeccable/scripts/impeccable.cmd detect --json src/designs/ink
[]
```

- 首次运行有 1 条 `bounce-easing` advisory（朱砂印 `cubic-bezier(0.32, 1.32, 0.4, 1)`）；已改为无过冲的 `cubic-bezier(0.16, 1, 0.3, 1)`，并同步 `DESIGN.md` 的 `ink-press` 说明；重跑为 `[]`。
- 有效性反证：同一命令对 `src/designs/oxide` 命中已知信号 `codex-grid-background`，检测器并非空转。

## 产物隔离

- ink 唯一设计 CSS：`dist/_astro/Page.Bg4LRdJ5.css`（20,492 B）；其中 `.fs` / `.bt` / `.dc-` / `.deco-` / `.kern` / `.ox-` 选择器计数均为 **0**。
- 三语言页面引用同一 CSS；根页 / 404 / 各语言入口页不链接任何设计 CSS；切换页只链接自身聚合 CSS。
- 切换页预览 **27** 张；`.ink-pv` 内部可聚焦元素 **0**，且位于 `aria-hidden="true"` 祖先内。

## 浏览器矩阵

预览服务为独立静态服务器 `127.0.0.1:4517`（直接托管 `dist`）；启动前确认页面标题为 `Ink · …` 且 `body.ink` 生效。未使用 4321 的既有 preview 进程，也未终止任何用户进程。

### 1440×900 桌面

- `scrollWidth - innerWidth = -15`（含滚动条，无横向溢出）。
- 姓名 `writing-mode: vertical-rl`，字号 **51.84px**；字体栈为 Sorts Mill Goudy → LXGW → Zhuque → 系统中文。
- Reveal：9 个目标，首屏已显现 4 个；滚动到底 **9/9**，隐藏元素 **0**；直接跳到底 **9/9**，隐藏元素 **0**。
- 5 个 `<section>` 全部有可访问名；唯一 `h1`；标题序列 h1 → h2 ×4 → h3 ×3，无跳级；`aria-hidden` 元素 39。
- 核心字段：姓名、headline、bio、3 条 links 全部渲染；projects / experience / skills / contact 条件区块均存在。
- 仅加载 `fonts-*.css` 与自身 `Page.*.css`；字体请求 3 个（2 个拉丁 + LXGW 子集）。
- 键盘 Tab 首焦点为 `niconico`，`:focus-visible` 为 1.6px solid 朱砂、offset 4px。

### 768×1024 平板

- 无横向溢出（`scrollWidth 753 / innerWidth 768`）。
- 姓名 `writing-mode: horizontal-tb`，字号 **46.4px**（竖排按设计关闭）。
- 滚动到底：9/9 显现，隐藏元素 **0**。

### 375×812 触控

- `(pointer: coarse)` 与 `(any-pointer: coarse)` 均为 true；`scrollWidth === innerWidth === 375`，无横向溢出。
- 姓名横排；页面主链接命中区最小 **44px**。
- 悬浮球 **52×52**，`aria-label` / `aria-haspopup` / `aria-controls` / `aria-expanded` 齐全；点击图标本身可打开面板。
- 底部面板 `getBoundingClientRect().bottom = 812 = innerHeight`；面板项最小高度 **48px**；关闭 ✕ **44px**、取消条 **48px**。
- 动作清单为 `copy / share / random / switch`，无 `reload / top / print`。
- 语言项 4 个、`aria-current="page"` 恰好 1 个；href 保持 `/zh-cn/ink/`、`/ja/ink/`、`/en/ink/`。
- 打开时 `html` overflow 为 `clip hidden` 且 `cm-scroll-locked`；关闭 ✕ / 取消 / Esc 三条路径均隐藏面板、恢复滚动锁、`aria-expanded="false"`。
- 滚动到底：9/9 显现，隐藏元素 **0**；console 0 error / 0 warning。

### 降级

| 情形 | 门控 | 隐藏元素 | 结果 |
|---|---|---:|---|
| `prefers-reduced-motion: reduce` | 未写入 `data-reveal-ready` | 0 | `ink-rise` / `ink-press` 均为 `none` |
| 无 JavaScript | 无门控 | 0 | h1 / bio 可见，5 个 section、6 个主链接均在 |
| 无 `IntersectionObserver` | 未写入 | 0 | 9/9 已标记显现 |
| `IntersectionObserver` 抛错 | boot 写入后由 `try/catch` 撤销 | 0 | 9/9 已标记显现，console 0 error |

### 三语言与网络

| locale | `html lang` | robots | canonical | hreflang | 菜单语言项 |
|---|---|---|---|---|---|
| zh-cn | `zh-CN` | `noindex, follow` | `/zh-cn/ink/` | 0（非默认设计） | 3 / 1 current |
| ja | `ja` | `noindex, follow` | `/ja/ink/` | 0 | 3 / 1 current |
| en | `en` | `noindex, follow` | `/en/ink/` | 0 | 3 / 1 current |

- 三语言合计 26 个请求，host 仅 `127.0.0.1:4517`；第三方 **0**、失败 **0**、4xx/5xx **0**；console 0 error / 0 warning。
- 正常排版产生 3 个字体请求（非强制 `document.fonts.load()`）。

## 对比度（浏览器计算值）

| 元素 | 前景 / 背景 | 实测比值 |
|---|---|---:|
| 姓名 `.ink-name` | `#1b1917` / `#f4eee2` | 15.17:1 |
| headline / bio | `#3a3632` / paper | 10.36:1 |
| 小引标签 / 页眉 / 页脚 | `#665e52` / paper | 5.53:1 |
| 题签链接 / 分区标题 / 落款邮箱 | `#1b1917` / paper | 15.17:1 |
| 卷帙与年表描述 / 笔触 | `#3a3632` / paper | 10.36:1 |

- 所有承载文字的组合均 ≥5.53:1（AA 正文）；展示大字号 ≥10.36:1。青瓷仅用于 1px 线与底纹，不承载文字。

## 预览碎片

- 自包含：只 import `./tokens.css`、`./messages` 与 `PreviewProps`；`export const fonts` 导出生效的 4 个 family。
- 无 `:root`、无 `<Font>`、无可聚焦元素；`aria-hidden` 由切换页调用方提供。
- 缩略档位已登记在 `DESIGN.md` §5.1。

## 截图归档

- `.cache/verification/ink-1440.png`（1440 全页）
- `.cache/verification/ink-768.png`（768 全页）
- `.cache/verification/ink-375.png`（375 全页）
- `.cache/verification/ink-375-menu.png`（375 动作面板）
- `.cache/verification/ink-1440-nojs.png`（无 JS）

截图位于被忽略的 `.cache/`，不随仓库发布。

## 未测项（如实声明）

- `--base /demo` 构建本轮未复测；本页无硬编码站内绝对路径，共享菜单链接由既有 base 机制生成。
- Safari / Firefox / iOS / Android 真机、横屏、物理触控、200% 缩放、屏幕阅读器实读：未测。
- 未使用 CDP `CSS.getPlatformFontsForNode` 读取平台字体信息；普通字体请求与 `@font-face` 族名映射作为命中证据。
- 截图为 Chromium 桌面/移动仿真目检；像素级视觉偏好微调仍属项目所有者。
- 切换页本地化描述：`src/designs/descriptions.ts` 无 `ink` 键，卡片描述回退 `design.json.description`（共享文件不在本任务改动范围内）。
