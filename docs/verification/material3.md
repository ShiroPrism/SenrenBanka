# verification — material3（厂商来源：Google Material 3 官方文档汇编，CC BY 4.0 / Apache-2.0）

> 本文件是该主题**当前**的完整验证状态；重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）；记录归属见 `docs/README.md`。
> 汇编 `DESIGN.md` 为整合完成即冻结（只读）；适配与例外记录在 `docs/designs/material3/ADAPTATION.md`。
> 最近全流程验证：2026-10-11（v0.7.0 首建 + 全流程）。

## 构建与产物

- `npm run build` 8 页绿（`astro check` 22 文件：0 错误 / 0 警告 / 0 提示）；注册表校验通过（`official-docs-derived` provenance 字段齐全）。
- CSS 隔离成立：本页恰 1 条自身样式链接（`Page.C1BugrO8.css`，13,371 B）；`.m3-*` 选择器 64 个；其余 4 个设计 CSS 中 `.m3-` 计数全 **0**；根页 / 切换页 / 404 不链接任何设计 CSS。
- `BASE_PATH=/demo` 全链路前缀正确（HTML 内链 / CSS / 字体 URL 全带 `/demo`；无未加前缀的 `/_astro` 引用）。
- 字体：`rel="preload"` 计数 **0**；Roboto Flex 构建期自托管（`--font-roboto-flex` → `@theme inline --font-m3`），`@font-face` 7 个子集（`unicode-range`）内联于页面、运行时仅按需请求 1 个 woff2；无外链资源。
- 核心字段全部渲染（name / headline / bio / links）× 扩展区块四类（projects / experience / skills / contact）。
- 新字体族首次构建需联网拉 fallback metrics（`NODE_USE_ENV_PROXY=1`；事实已记入 AGENTS 已知坑），本次首建通过。

## 结构、token 与 a11y（桌面实测，1280×900）

- 标题层级：H1（headline）×1 → H2 ×4（Projects / Experience / Skills / Contact）→ H3 ×3（项目）无跳级。
- 五个 `<section>` 全部具可访问名称（`aria-labelledby` → `m3-title` / `m3-projects` / `m3-experience` / `m3-skills` / `m3-contact`，实测 5 处）。
- 链接可访问名干净（`GitHub` / `Email` / `博客` / 项目标题 ×2 / 邮箱 CTA；菜单项为共享 chrome）；`aria-hidden` 装饰 SVG 5 处（按钮 mark ×2、卡片外链箭头 ×2、CTA 邮箱图标）。
- 桌面留白：`innerWidth 1280` 下 shell 左右各 **96px**（+ 内部 padding 32px → 内容左缘 128px），无贴边；`.m3-cards` 3 列（各 ≈330.7px）；标题 45px（display-medium，≥840 档）；375 下 36px（display-small）。
- token 复核（computed，浅色）：body `#fef7ff` / `#1d1b20`；按钮 h **40px** / radius **9999px** / tonal `#e8def8`+`#1d192b` / filled `#6750a4`+`#fff`；卡片 radius **12px** + level1 阴影（`rgba(0,0,0,.3) 0 1px 2px` + `rgba(0,0,0,.15) 0 1px 3px 1px`）；contact radius **28px** + `#eaddff`；chip h **32px** / radius **8px** / 描边 `#79747e`；footer 12px / `#49454f`。
- 深色方案（`prefers-color-scheme: dark` 实测）：body `#141218` / `#e6e0e9`；卡片 `#1d1b20`；contact `#4f378b`；tonal 按钮 `#4a4458`+`#e8def8`；filled 按钮 `#d0bcff`+`#381e72`；链接 / role `#d0bcff`；footer `#cac4d0`——全部与 DESIGN.md 深色映射一致。
- 交互态双证：hover 实测（真悬停设备）tonal `#e8def8` → color-mix 8% 近似值、卡片阴影升为 level2（`…0 2px 6px 2px`）；产物 CSS 含 `.m3-btn-tonal:hover` / `.m3-btn-filled:hover` / `.m3-card:hover` 且均处 `(hover: hover) and (pointer: fine)` 门控（源码核对）。focus：Tab 后 activeElement = `A.m3-btn-tonal`，outline **2px solid `#6750a4`** + offset 2px（实测）。
- console：0 错误 / 0 警告；网络 0 请求失败 / 0 个 ≥400（浅色与深色上下文分别实测）。

## 动效（Motion language：emphasized 档）

- 门控：`data-reveal-ready` 写入；`[data-reveal]` 10 个。
- 首屏入场：`.m3-rise` ×4，`animation: m3-rise` 400ms + emphasized-decelerate；错落 0 / 30 / 60 / 90ms；终态 opacity 1。
- 滚动显现：滚动前隐藏 5（首屏下）、滚到底后 **0**，`data-reveal-in` **10/10**；卡片错落 60ms、经历行 50ms（源码）。
- hero hover / 按压：状态层近似（hover 8% / press 10%），transition 150–200ms（源码；唯一动效属性为背景色与阴影，遵循运动约束）。

## 降级（reduced-motion / 无 JS / 无 IO / IO 抛错）

| 情形 | 实测 |
|---|---|
| `prefers-reduced-motion: reduce` | 门控未写入；隐藏 0；`.m3-title` opacity 1 |
| 无 JavaScript | HTML 源中无 `data-reveal-ready`（CSS 隐藏态永不生效）；截图确认全内容可见（`verify-070-material3-nojs.png`） |
| 无 `IntersectionObserver` | 门控未写入；隐藏 0 |
| IO 构造抛错 | 2.6s 后安全网撤销门控；隐藏 0 |

## 触控与移动端（375×812 + hasTouch / isMobile，dpr 2）

- `matchMedia('(pointer: coarse)').matches === true`（`(hover: none)` 亦为 true）。
- 零横向溢出（`scrollWidth == innerWidth == 375`）。
- 命中高度：`.m3-btn` ×4 全 **48px**；`.m3-chip` ×5 全 **44px**；`.m3-card-link` ×2 **44.6px**（首测 39.8px < 40 口径 → `pointer: coarse` padding 0.65rem→0.8rem 修正后复测）。
- 折行与对齐：hero 按钮组单行无溢出、左缘与 H1 对齐（16px）；卡片单列；contact 区 note/按钮纵向堆叠（间距 24px）；页脚两行。

## 对比度（核算，全部取自实测 computed 值）

| 组合（浅色） | 对比度 |
|---|---|
| on-surface `#1d1b20` / surface `#fef7ff`（标题、正文） | 16.23 |
| on-surface-variant `#49454f` / surface（bio / 辅助文本） | 8.88 |
| on-surface-variant / surface-container-low（卡片描述 / tag） | 8.47 |
| primary `#6750a4` / surface（role） | 6.12 |
| primary / surface-container-low（卡片链接） | 5.84 |
| on-secondary-container / secondary-container（tonal 按钮） | 13.24 |
| on-primary `#fff` / primary（filled 按钮） | 6.44 |
| on-primary-container / primary-container（contact） | 13.32 |

| 组合（深色） | 对比度 |
|---|---|
| on-surface `#e6e0e9` / surface `#141218` | 14.35 |
| on-surface-variant `#cac4d0` / surface | 10.91 |
| primary `#d0bcff` / surface（链接、role） | 10.91 |
| on-secondary-container / secondary-container（tonal 按钮，最低） | 7.19 |
| on-primary-container / primary-container（contact） | 7.23 |
| on-primary / primary（filled 按钮） | 7.71 |

- 全部文本 ≥4.5:1（AA 硬底线），最低为浅色卡片链接 **5.84** 与深色 tonal 按钮 **7.19**。
- 控件边界：chip 描边 4.33 / tag 描边 4.13（浅色）、5.87 / 5.39（深色）——均 ≥3:1。`outline-variant` 分隔线（顶栏 / 页脚 / 经历行）为装饰性分隔，不作 3:1 要求，如实记录。

## 检测器（impeccable）

- `detect --json src/designs/material3` → `[]` 零发现（无例外）。
- 有效性反证：同命令对 oxide 命中 1 条已记录 advisory（`codex-grid-background`），检测器非空转。

## 已定事项（结论）

- **状态层不透明度取指南现值**（hover 8 / focus 10 / press 10 / drag 16）；tokens v0.192 中 focus/pressed 为 12% 的差异已在 DESIGN.md 注记与 ADAPTATION 记录。
- **阴影为项目侧 web 配方**（上游层级 token 只定义 dp 值、不含阴影）：静息卡片 level1、hover 升 level2；其余深度用 tonal 面层表达。
- 深色方案随系统自动切换（无手动开关、无额外交互机关）；两模式对比度均过线。
- 卡链触控命中原为 39.8px（<40 口径），经 `pointer: coarse` padding 调整后 44.6px——修正已合入首版（非遗留缺陷）。
- 移动端截图口径：`fullPage` 截图前先滚动触发全部显现（同 carbon 口径）。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎未实测；触控与降级均基于 Chromium 1200 仿真。
- 本会话内置浏览器截图不可用（tab offscreen），截图与四降级 / 触控实测经本机 Playwright 同引擎（Chromium 1200）执行；桌面 console / 资源断言另经内置浏览器工具交叉复核（console none、资源仅自身 + 会话残留 `@vite/client`，符合既有口径）。
- ripple / 弹簧物理动效未还原（静态 web 近似；M3 Expressive 不在汇编范围，见 ADAPTATION）。
- 截图归档：`C:\Users\lovelive\.trae-cn\trae-browser-screenshots\6acb6fb2351723235e449814\`（`verify-070-material3-desktop-light-hero.png`、`verify-070-material3-desktop-light-full.png`、`verify-070-material3-desktop-dark-full.png`、`verify-070-material3-mobile-375.png`、`verify-070-material3-nojs.png`；为验证机器本地路径，未随仓库分发）。