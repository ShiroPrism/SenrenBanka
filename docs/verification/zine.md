# verification — Zine（自产：Riso / 复印朋克）

> 本文件是 `zine` 的**当前**完整验证状态；重复验证时更新本文件，历史由 Git 保留。
> 验证流程：`.agents/skills/design-page-verify/SKILL.md`。实现与验收日期：2026-11-02。

## 设计状态

- `styled` / enabled / `self-produced` / accent `#ff3b5c`（荧光红）。
- 文件：`DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`、`style.css`、`tokens.css`、`Preview.astro`。
- 无设计专属 JS；只接共享 `Reveal` 与 `ContextMenu`。无图片、无第三方依赖、无自定义光标。
- 版式：纸底 + 复印条纹 + 颗粒；刊头错位套印；宣言 / 分类广告 / 跨页 / 贡献者注记 / 印章 / 邮购回执；跨页三列（≤1023 两列，≤760 单列）。
- 5 语言：`zh-CN` / `zh-TW` / `ja` / `en` / `ko`。

## 构建与测试

| 命令 | 结果 |
|---|---|
| `npm run fonts:typography` | 通过：**29** 套 `styled` / **29** 套核心 CJK / 31 个 primary-only local family |
| `npm run fonts:coverage` | 通过：30 个设计脚本覆盖 |
| `npm run build` | 通过：**193** 页；`astro check` **0 error / 0 warning**（1 条既有 lexicon hint）；HTML-only 门禁 5 页；字体审计 0 孤儿 / 0 悬空 |
| `dist` 总体积 | **8,347,337 B（7.96 MiB）**，≤10 MiB 硬门禁（目标 ≤8.2 MiB） |
| 字体文件 | 45 个 WOFF2；`fonts:audit` 的缺字警告均来自既有设计（pager / pixel-pet-rpg / radio / receipt），不含 zine |
| `npm test` | **84/84** 通过 |

- `src/designs/descriptions.ts` 已含 Zine 的 5 语言切换页描述。
- `Page.astro` 在所有非 zh-TW 页面注册 `--font-gothic-a1`，zh-TW 由 `html:lang(zh-TW)` 重映射到 `--font-noto-sans-tc`。
- 分类广告链接触控高度补 `@media (pointer: coarse) { min-height: 44px }`；修复前 375px 为 22px。

## 检测器

```text
.agents/skills/impeccable/scripts/impeccable.cmd detect --json src/designs/zine
[]
```

- 有效性反证：同一命令对 `src/designs/oxide` 命中已知信号 `codex-grid-background`，检测器并非空转。
- Zine 的复印条纹为单轴 `repeating-linear-gradient` + 点阵颗粒，未触发两轴网格信号。

## 产物隔离

- 设计唯一 CSS：`dist/_astro/Page.BVksrbbY.css`（17,864 B）；其中 `.bt-` / `.ink-` / `.dc-` / `.ae-` / `.aero` / `.tr-` / `.transit` / `.ed-` / `.ox-` / `.fs-` 选择器计数均为 **0**。
- 5 语言页面引用同一 CSS；根页 / 404 / 各语言入口页 / 切换页不链接 Zine 设计 CSS。
- 切换页预览 `SwitcherPage` CSS 含 `.zine-pv`，属预览自身聚合；内部无可聚焦元素。

## 浏览器矩阵

预览服务：`npm run preview` → `http://127.0.0.1:4321`。本地浏览器矩阵由项目外临时 `playwright-core` + 本机 Chrome 执行，结果在 `.cache/verification/browser-matrix-zine.json`。

### 1440×900 桌面

- `scrollWidth 1440 = innerWidth`，无横向溢出；页面高度 **2047px**。
- 姓名实际字体为 League Gothic → Gothic A1 → Zhuque → 系统 CJK；`h1` 可访问名只有 `李田所`（红/蓝错位副本 `aria-hidden`）。
- Reveal：9 个目标；滚动到底 **9/9**，隐藏元素 **0**；直接跳底逻辑同共享 Reveal。
- 6 个 `<section>` 全部有可访问名；唯一 `h1`；标题序列 h1 → h2 ×5 → h3 ×3，无跳级；`aria-hidden` 元素 54。
- 核心字段：姓名、headline、bio、3 条 links 全部渲染；projects / experience / skills / contact 条件区块均存在。
- 分类广告链接桌面高度 22px（文字行高）；跨页标题 24/49px；邮购邮箱 44px。触屏下全部 ≥44px。
- console **0 error / 0 warning**。

### 768×1024 平板

- 无横向溢出（`scrollWidth 768 = innerWidth`）。
- 跨页两列；分类广告单列；滚动到底 **9/9**，隐藏元素 **0**。

### 375×812 触控

- `(pointer: coarse)` 为 true；`scrollWidth === innerWidth === 375`，无横向溢出；页面高度 **2338px**。
- 页面主链接命中区全部 **44px**（分类广告 / 跨页标题 / 邮购邮箱）。
- 悬浮球 **52×52**，`aria-label` / `aria-haspopup` / `aria-controls` 齐全；触屏 tap 可打开面板。
- 底部面板 `bottom = 812 = innerHeight`；语言项 **5** 个、`aria-current="page"` 恰好 1 个、每项 **48px**，`hreflang` 正确。
- 动作清单 `copy / share / random / switch`，无 `reload / top / print`；关闭 ✕ 与取消条均可见。
- 打开时 `html` overflow 为 `clip hidden`；关闭 ✕ 后恢复 `clip visible`、面板隐藏、`aria-expanded="false"`。
- 滚动到底 **9/9** 显现，隐藏元素 **0**；console 0。

### 降级

| 情形 | 门控 | 隐藏元素 | 结果 |
|---|---|---:|---|
| `prefers-reduced-motion: reduce` | 未写入 `data-reveal-ready` | 0 | `.zn-rise` / `.zn-sheet::before` animation `none`；扫描带 `opacity: 0` |
| 无 JavaScript | 无门控 | 0 | 全内容可见 |
| 无 `IntersectionObserver` | 未写入 | 0 | 9/9 已标记显现 |
| `IntersectionObserver` 抛错 | boot 写入后由 `try/catch` 撤销 | 0 | 9/9 已标记显现 |

## 五语言与网络

| locale | `html lang` | robots | canonical | head alternate |
|---|---|---|---|---|
| zh-cn | `zh-CN` | `noindex, follow` | `/zh-cn/zine/` | 0（非默认设计） |
| zh-tw | `zh-TW` | `noindex, follow` | `/zh-tw/zine/` | 0 |
| ja | `ja` | `noindex, follow` | `/ja/zine/` | 0 |
| en | `en` | `noindex, follow` | `/en/zine/` | 0 |
| ko | `ko` | `noindex, follow` | `/ko/zine/` | 0 |

- 5 语言共用同一设计 CSS；浏览器 console 0；网络仅本机资源，无 4xx/5xx。

## 对比度（设计令牌实测）

| 元素 | 前景 / 背景 | 比值 |
|---|---|---:|
| 姓名 / 正文（纸底） | `#111111` / `#f3efe6` | 16.46:1 |
| 次级正文（纸底） | `#2b2b2b` / `#f3efe6` | ~13:1 |
| 分类广告 / 小字链接 | `#c81e3a` / `#f3efe6` | 4.94:1 |
| 跨页标题链接 / 邮购邮箱 | `#c81e3a` / `#f3efe6` | 4.94:1 |
| 蓝色链接 / 装饰 | `#1f4bff` / `#f3efe6` | 5.22:1 |
| 荧光红装饰 / 大字 | `#ff3b5c` / `#f3efe6` | 3.03:1（仅大字/装饰） |
| 白字 on 深红 | `#ffffff` / `#c81e3a` | 5.67:1 |

- 荧光红/粉不承载正文；正文最低约 13:1；小字链接 4.94/5.22:1；荧光红只用于大字/装饰。
- 宣言首字母 drop cap 为大字号（3.1em）红字，满足大字号 3:1 阈值。

## 预览碎片

- 自包含：只 import `./tokens.css`、`./messages` 与 `PreviewProps`；`export const fonts` 导出 League Gothic / Inter / Courier Prime / Zhuque / Noto Sans TC / Gothic A1。
- 无 `:root`、无 `<Font>`、无可聚焦元素；`aria-hidden` 由切换页调用方提供。
- 缩略档位已登记在 `DESIGN.md` §5.1。

## 截图归档

- `.cache/verification/zine-1440.png`（1440 全页）
- `.cache/verification/zine-768.png`（768 全页）
- `.cache/verification/zine-375.png`（375 全页）
- `.cache/verification/zine-375-menu.png`（375 动作面板）
- `.cache/verification/zine-1440-reduced.png`（减动态）
- `.cache/verification/zine-1440-nojs.png`（无 JS）
- `.cache/verification/browser-matrix-zine.json`（完整浏览器矩阵数据）
