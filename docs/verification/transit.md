# verification — Transit（自产：交通导视）

> **2026-11-02 页脚站点声明**：示例数据声明改由 `site.config.yaml` 的 `i18n.locales[].notice` 提供；示例站可见，缺省不渲染，无布局残留。跨设计验证见 `shared.md`。
> 本文件是 `transit` 的**当前**完整验证状态；重复验证时更新本文件，历史由 Git 保留。
> 验证流程：`.agents/skills/design-page-verify/SKILL.md`。实现与验收日期：2026-11-02。

## 设计状态

- `styled` / enabled / `self-produced` / accent `#0b7a5c`（主线绿）。
- 文件：`DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`、`style.css`、`tokens.css`、`Preview.astro`。
- 无设计专属 JS；只接共享 `Reveal` 与 `ContextMenu`。无图片、无第三方依赖、无自定义光标。
- 版式：浅色点阵纸 + 线路色带 + 站点圆点 + 站台牌 + 时刻表；Hero 两列（≤1024 单列），站点三列（≤1023 两列，≤760 单列）。
- 5 语言：`zh-CN` / `zh-TW` / `ja` / `en` / `ko`。

## 构建与测试

| 命令 | 结果 |
|---|---|
| `npm run fonts:typography` | 通过：**28** 套 `styled` / **28** 套核心 CJK / 31 个 primary-only local family |
| `npm run fonts:coverage` | 通过：29 个设计脚本覆盖 |
| `npm run build` | 通过：**187** 页；`astro check` **0 error / 0 warning**（1 条既有 lexicon hint）；HTML-only 门禁 5 页；字体审计 0 孤儿 / 0 悬空 |
| `dist` 总体积 | **8,165,025 B（7.79 MiB）**，≤10 MiB 硬门禁（目标 ≤8.2 MiB） |
| 字体文件 | 45 个 WOFF2；`fonts:audit` 的缺字警告均来自既有设计（pager / pixel-pet-rpg / radio / receipt），不含 transit |
| `npm test` | **84/84** 通过 |

- `src/designs/descriptions.ts` 已含 Transit 的 5 语言切换页描述。
- `Page.astro` 在所有非 zh-TW 页面注册 `--font-gothic-a1`，保证字体栈变量完整；zh-TW 由 `html:lang(zh-TW)` 重映射到 `--font-noto-sans-tc`。

## 检测器

```text
.agents/skills/impeccable/scripts/impeccable.cmd detect --json src/designs/transit
[]
```

- 有效性反证：同一命令对 `src/designs/oxide` 命中已知信号 `codex-grid-background`，检测器并非空转。
- Transit 的背景使用点阵（radial-gradient），不是两轴线性网格，未触发该信号。

## 产物隔离

- 设计唯一 CSS：`dist/_astro/Page.Kh2XuAWT.css`（19,426 B）；其中 `.bt-` / `.ink-` / `.dc-` / `.ae-` / `.aero` / `.zn-` / `.ed-` / `.ox-` / `.fs-` 选择器计数均为 **0**。
- 5 语言页面引用同一 CSS；根页 / 404 / 各语言入口页 / 切换页不链接 Transit 设计 CSS。
- 切换页预览 `SwitcherPage` CSS 含 `.transit-pv`，属预览自身聚合；内部无可聚焦元素。

## 浏览器矩阵

预览服务：`npm run preview` → `http://127.0.0.1:4321`。本地浏览器矩阵由项目外临时 `playwright-core` + 本机 Chrome 执行，结果在 `.cache/verification/browser-matrix.json`。

### 1440×900 桌面

- `scrollWidth 1440 = innerWidth`，无横向溢出；页面高度 **2002px**。
- 姓名实际字体为 Inter → Gothic A1 → Zhuque → 系统 CJK；`document.fonts` 命中 Inter / Zhuque。
- Reveal：8 个目标；滚动到底 **8/8**，隐藏元素 **0**；直接跳底逻辑同 Aero（共享 Reveal）。
- 6 个 `<section>` 全部有可访问名；唯一 `h1`；标题序列 h1 → h2 ×5 → h3 ×3，无跳级；`aria-hidden` 元素 61。
- 核心字段：姓名、headline、bio、3 条 links 全部渲染；projects / experience / skills / contact 条件区块均存在。
- 线路链接高度 **52px**；项目标题桌面 24px、触控 44px；售票处邮箱 44px。
- console **0 error / 0 warning**。

### 768×1024 平板

- 无横向溢出（`scrollWidth 768 = innerWidth`）；页面高度 **2214px**。
- Hero 单列；站点两列；滚动到底 **8/8**，隐藏元素 **0**。

### 375×812 触控

- `(pointer: coarse)` 为 true；`scrollWidth === innerWidth === 375`，无横向溢出；页面高度 **2575px**。
- 线路链接 52px；项目标题与邮箱 44px。
- 悬浮球 **52×52**，`aria-label` / `aria-haspopup` / `aria-controls` 齐全；触屏 tap 可打开面板。
- 底部面板 `bottom = 812 = innerHeight`；语言项 **5** 个、`aria-current="page"` 恰好 1 个、每项 **48px**，`hreflang` 正确。
- 动作清单 `copy / share / random / switch`，无 `reload / top / print`；关闭 ✕ 与取消条均可见。
- 打开时 `html` overflow 为 `clip hidden`；关闭 ✕ 后恢复 `clip visible`、面板隐藏、`aria-expanded="false"`。
- 滚动到底 **8/8** 显现，隐藏元素 **0**；console 0。

### 降级

| 情形 | 门控 | 隐藏元素 | 结果 |
|---|---|---:|---|
| `prefers-reduced-motion: reduce` | 未写入 `data-reveal-ready` | 0 | `.tr-rise` / `.tr-diagram-line` animation `none` |
| 无 JavaScript | 无门控 | 0 | 全内容可见 |
| 无 `IntersectionObserver` | 未写入 | 0 | 8/8 已标记显现 |
| `IntersectionObserver` 抛错 | boot 写入后由 `try/catch` 撤销 | 0 | 8/8 已标记显现 |

## 五语言与网络

| locale | `html lang` | robots | canonical | head alternate |
|---|---|---|---|---|
| zh-cn | `zh-CN` | `noindex, follow` | `/zh-cn/transit/` | 0（非默认设计） |
| zh-tw | `zh-TW` | `noindex, follow` | `/zh-tw/transit/` | 0 |
| ja | `ja` | `noindex, follow` | `/ja/transit/` | 0 |
| en | `en` | `noindex, follow` | `/en/transit/` | 0 |
| ko | `ko` | `noindex, follow` | `/ko/transit/` | 0 |

- 5 语言共用同一设计 CSS；浏览器 console 0；网络仅本机资源，无 4xx/5xx。

## 对比度（设计令牌实测）

| 元素 | 前景 / 背景 | 比值 |
|---|---|---:|
| 姓名 / 正文（纸底） | `#101418` / `#f5f4ef` | 16.80:1 |
| 次级正文（纸底） | `#3b4248` / `#f5f4ef` | ~10:1 |
| 弱化元信息（纸底） | `#5d646b` / `#f5f4ef` | ~6:1 |
| 绿色线路码白字 | `#f5f4ef` / `#0b7a5c` | 5.31:1 |
| 红色线路码白字 | `#f5f4ef` / `#d7263d` | 4.96:1 |
| 黄色线路码 ink 字 | `#101418` / `#f2b705` | ≥10:1 |
| 售票处纸白字 | `#f5f4ef` / `#101418` | 16.80:1 |

- 黄色线不承载白字；线路色只做编码，线路名/编号始终可见。
- 正文最低约 6:1（弱化元信息），大字号展示 ≥10:1。

## 预览碎片

- 自包含：只 import `./tokens.css`、`./messages` 与 `PreviewProps`；`export const fonts` 导出 Inter / JetBrains Mono / Zhuque / Noto Sans TC / Gothic A1。
- 无 `:root`、无 `<Font>`、无可聚焦元素；`aria-hidden` 由切换页调用方提供。
- 缩略档位已登记在 `DESIGN.md` §5.1。

## 截图归档

- `.cache/verification/transit-1440.png`（1440 全页）
- `.cache/verification/transit-768.png`（768 全页）
- `.cache/verification/transit-375.png`（375 全页）
- `.cache/verification/transit-375-menu.png`（375 动作面板）
- `.cache/verification/transit-1440-reduced.png`（减动态）
- `.cache/verification/transit-1440-nojs.png`（无 JS）
- `.cache/verification/browser-matrix.json`（完整浏览器矩阵数据）
