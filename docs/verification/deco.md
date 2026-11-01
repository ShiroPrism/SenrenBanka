# verification — Deco（自产：Art Deco 剧院节目单）

> **2026-11-01 韩语覆盖（C3）**：新增 `/ko/deco/` 与韩语文案；375×812 / 1280×800 冒烟通过（`lang=ko`、韩语字体加载、无横向溢出、0 console）；文案已人工审校（用户确认 2026-11-01）。

> 本文件是 `deco` 的**当前**完整验证状态；重复验证时更新本文件，历史由 Git 保留。
> 验证流程：`.agents/skills/design-page-verify/SKILL.md`。实现与验收日期：2026-10-31。

## 设计状态

- `styled` / enabled / `self-produced` / accent `#d4af37`（金色主值）。
- 文件：`DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`、`style.css`、`tokens.css`、`Preview.astro`。
- 无设计专属 JS；只接共享 `Reveal` 与 `ContextMenu`。无图片、无第三方依赖、无自定义光标。
- 版式：墨黑台面 + 黄铜双线框 + 金色扇形 / 阶梯角 / 菱形分隔 + Fraunces Didone 标题；对称中轴节目单。姓名以装饰 monogram（aria-hidden）+ 完整姓名 h1 呈现。

## 构建与测试

| 命令 | 结果 |
|---|---|
| `npm run fonts:typography` | 通过：**26** 套 `styled` / **17** 套核心 CJK / 20 个 primary-only local family |
| `npm run build` | 通过：**117** 页；`astro check` **0 error / 0 warning**；HTML-only 门禁 3 页；字体审计 0 孤儿 / 0 悬空 |
| 字体产物 | 核心子集 3 个 / **710,012 B**；保留 **336** 条 `@font-face` / 22 个字体 CSS 包 / **27,168 B**；字体文件 34 / **1,621,596 B** |
| `dist` 总体积 | **6,544,535 B（6.24 MiB）**，≤10 MiB 硬门禁 |
| `npm test` | **67/67** 通过 |

- `fonts:audit` 对 `/zh-cn/deco/`、`/ja/deco/`、`/en/deco/` 报告 `uncovered: []`、`deployedGaps: []`；全站 32 条缺字警告均来自既有设计，不含 deco。

## 检测器

```text
.agents/skills/impeccable/scripts/impeccable.cmd detect --json src/designs/deco
[]
```

- 首次与重跑均为 `[]`。
- 有效性反证：同一命令对 `src/designs/oxide` 命中已知信号 `codex-grid-background`，检测器并非空转。

## 产物隔离

- deco 唯一设计 CSS：`dist/_astro/Page.C0EbjVaZ.css`（20,403 B）；其中 `.fs` / `.bt` / `.ink-` / `.kern` / `.ox-` 选择器计数均为 **0**。
- 三语言页面引用同一 CSS；根页 / 404 / 各语言入口页不链接任何设计 CSS；切换页只链接自身聚合 CSS。
- 切换页预览 **27** 张；`.deco-pv` 内部可聚焦元素 **0**，且位于 `aria-hidden="true"` 祖先内。

## 浏览器矩阵

预览服务为独立静态服务器 `127.0.0.1:4517`（直接托管 `dist`）；启动前确认页面标题为 `Deco · …` 且 `body.deco` 生效。未使用 4321 的既有 preview 进程，也未终止任何用户进程。

### 1440×900 桌面

- `scrollWidth - innerWidth = -15`（含滚动条，无横向溢出）。
- 姓名实际字号 **83.2px**（`.deco-name-text`），Fraunces → Zhuque → 系统中文；`h1` 可访问名为完整姓名 `田所浩二`，装饰 monogram 不进可访问名。
- Reveal：8 个目标，首屏 **0** 个（全部位于首屏以下，Hero 本身不设 `data-reveal`）；滚动到底 **8/8**，隐藏元素 **0**；直接跳到底 **8/8**，隐藏元素 **0**。
- 6 个 `<section>` 全部有可访问名；唯一 `h1`；标题序列 h1 → h2 ×5 → h3 ×3，无跳级；`aria-hidden` 元素 49。
- 核心字段：姓名、headline、bio、3 条 links 全部渲染；projects / experience / skills / contact 条件区块均存在。
- 仅加载 `fonts-*.css` 与自身 `Page.*.css`；字体请求 3 个（Fraunces / Inter 拉丁 + Zhuque 子集）。
- 键盘 Tab 首焦点为 `niconico`，`:focus-visible` 为 1.6px solid 香槟金、offset 2.4px。

### 768×1024 平板

- 无横向溢出（`scrollWidth 753 / innerWidth 768`）。
- 姓名 **64.512px**；幕次单列；滚动到底：8/8 显现，隐藏元素 **0**。

### 375×812 触控

- `(pointer: coarse)` 与 `(any-pointer: coarse)` 均为 true；`scrollWidth === innerWidth === 375`，无横向溢出。
- 页面主链接命中区最小 **44px**（票根 48.8px、幕次标题 44px、售票处 48px）。
- 悬浮球 **52×52**，`aria-label` / `aria-haspopup` / `aria-controls` / `aria-expanded` 齐全；点击图标本身可打开面板。
- 底部面板 `getBoundingClientRect().bottom = 812 = innerHeight`；面板项最小高度 **48px**；关闭 ✕ **44px**、取消条 **48px**。
- 动作清单为 `copy / share / random / switch`，无 `reload / top / print`。
- 语言项 4 个、`aria-current="page"` 恰好 1 个；href 保持 `/zh-cn/deco/`、`/ja/deco/`、`/en/deco/`。
- 打开时 `html` overflow 为 `clip hidden` 且 `cm-scroll-locked`；关闭 ✕ / 取消 / Esc 三条路径均隐藏面板、恢复滚动锁、`aria-expanded="false"`。
- 滚动到底：8/8 显现，隐藏元素 **0**；console 0 error / 0 warning。

### 降级

| 情形 | 门控 | 隐藏元素 | 结果 |
|---|---|---:|---|
| `prefers-reduced-motion: reduce` | 未写入 `data-reveal-ready` | 0 | `deco-rise` / `deco-curtain-part` 均为 `none` |
| 无 JavaScript | 无门控 | 0 | h1 / bio 可见，6 个 section、6 个主链接均在 |
| 无 `IntersectionObserver` | 未写入 | 0 | 8/8 已标记显现 |
| `IntersectionObserver` 抛错 | boot 写入后由 `try/catch` 撤销 | 0 | 8/8 已标记显现，console 0 error |

### 三语言与网络

| locale | `html lang` | robots | canonical | hreflang | 菜单语言项 |
|---|---|---|---|---|---|
| zh-cn | `zh-CN` | `noindex, follow` | `/zh-cn/deco/` | 0（非默认设计） | 3 / 1 current |
| ja | `ja` | `noindex, follow` | `/ja/deco/` | 0 | 3 / 1 current |
| en | `en` | `noindex, follow` | `/en/deco/` | 0 | 3 / 1 current |

- 三语言合计 35 个请求，host 仅 `127.0.0.1:4517`；第三方 **0**、失败 **0**、4xx/5xx **0**；console 0 error / 0 warning。
- 正常排版产生 3 个字体请求（非强制 `document.fonts.load()`）。

## 对比度（浏览器计算值）

| 元素 | 前景 / 背景 | 实测比值 |
|---|---|---:|
| 姓名 `.deco-name-text` | `#f6f0e2` / `#07060a` | 17.78:1 |
| 副题 / bio / 幕次与演出单描述 | `#ded4c0` / `#07060a` | 13.74:1 |
| 序言标签 / 页眉地名 | `#f2e0aa` / `#07060a` | 15.41:1 |
| 分区标题（金） | `#d4af37` / `#07060a` | 9.61:1 |
| 票根文字 | `#f6f0e2` / `#100e15` | 16.87:1 |
| 机构名 | `#f6f0e2` / `#07060a` | 17.78:1 |
| 演职员 / 技能 | `#ded4c0` / `#07060a` | 13.74:1 |
| 售票处邮箱（25.6px） | `#d4af37` / `#07060a` | 9.61:1 |
| 页脚注 | `#b3a68c` / `#07060a` | 8.42:1 |

- 正文 / 描述 / 表格说明全部为米白或香槟米色，最低 **8.42:1**；饱和金 `#d4af37` 只用于标题、编号、monogram、装饰、≥1.25rem 售票处链接与焦点环，不用于正文段落。
- 0.66–0.72rem 的小号标签使用香槟 `#f2e0aa`（15.41:1），不是饱和金；该规则已写入 `DESIGN.md` §2。
- 面板与页底明度差仅 1.05–1.11:1，边界由 ≥3.47:1 的发丝线承担，属设计意图。

## 预览碎片

- 自包含：只 import `./tokens.css`、`./messages` 与 `PreviewProps`；`export const fonts` 导出 Fraunces / Inter / Zhuque 三族。
- 无 `:root`、无 `<Font>`、无可聚焦元素；`aria-hidden` 由切换页调用方提供。
- 缩略档位已登记在 `DESIGN.md`。

## 截图归档

- `.cache/verification/deco-1440.png`（1440 全页）
- `.cache/verification/deco-768.png`（768 全页）
- `.cache/verification/deco-375.png`（375 全页）
- `.cache/verification/deco-375-menu.png`（375 动作面板）
- `.cache/verification/deco-1440-nojs.png`（无 JS）

截图位于被忽略的 `.cache/`，不随仓库发布。

## 未测项（如实声明）

- `--base /demo` 构建本轮未复测；本页无硬编码站内绝对路径，共享菜单链接由既有 base 机制生成。
- Safari / Firefox / iOS / Android 真机、横屏、物理触控、200% 缩放、屏幕阅读器实读：未测。
- 未使用 CDP `CSS.getPlatformFontsForNode` 读取平台字体信息；普通字体请求与 `@font-face` 族名映射作为命中证据。
- 截图为 Chromium 桌面/移动仿真目检；扇形/幕布动画的中间帧未逐帧截图，仅验证了减动态静止与内容可见性。
- 切换页本地化描述：`src/designs/descriptions.ts` 无 `deco` 键，卡片描述回退 `design.json.description`（共享文件不在本任务改动范围内）。
