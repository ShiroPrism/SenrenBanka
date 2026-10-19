# verification — material3（厂商来源：Google Material 3 官方文档汇编，CC BY 4.0 / Apache-2.0）

> 本文件是该主题**当前**的完整验证状态；重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）；记录归属见 `docs/README.md`。
> 汇编 `DESIGN.md` 为整合完成即冻结（只读）；适配与例外记录在 `docs/designs/material3/ADAPTATION.md`。
> 最近全流程验证：2026-10-12（首屏两窗格改版后复验；v0.8.0 首建验证见Git）。

## 构建与产物

- `npm run build` 11 页绿（`astro check` 25 文件：0 错误 / 0 警告 / 0 提示）；注册表校验通过（`official-docs-derived` provenance 字段齐全）。
- CSS 隔离成立：本页恰 1 条自身样式链接（`Page.CfXYx2Z1.css`，13,718 B）；`.m3-*` 选择器 38 个；其余设计的 `ed-` / `fr-` / `kern-` / `fs-` / `gv-` / `ox-` / `tm-` 前缀在该产物中计数全 **0**；根页 / 切换页 / 404 不链接任何设计 CSS。
- `BASE_PATH=/demo` 全链路前缀正确（HTML 内链 / CSS / 字体 URL 全带 `/demo`；无未加前缀的 `/_astro` 引用）。
- 字体：`rel="preload"` 计数 **0**；Roboto Flex 构建期自托管（`--font-roboto-flex` → `@theme inline --font-m3`），`@font-face` 7 个子集（`unicode-range`）内联于页面、运行时仅按需请求 1 个 woff2；无外链资源。
- 核心字段全部渲染（name / headline / bio / links）× 扩展区块四类（projects / experience / skills / contact）。
- 新字体族首次构建需联网拉 fallback metrics（`NODE_USE_ENV_PROXY=1`；事实已记入 AGENTS 已知坑），本次首建通过。

## 首屏两窗格（2026-10-12 改版，本次重点）

**改前问题（实测）**：`.m3-hero` 被 `max-width: 46rem`（736px）限制，而下方分区 / 卡片网格通栏（1024px）——宽屏下首屏右侧恒定留下 **288px** 死白（1920 实测 `main.right 1464` vs `content.right 1176`）；头像（112px）被迫退化为正文上方的装饰件。

**改后（canonical 两窗格，1024px 起）**：

| 视口 | grid 列 | 头像 | 标题行数 | 头像右缘 vs 分区右缘 |
|---|---|---|---|---|
| 1023 | `none`（单列） | 112px，堆叠于正文之上 | 2 | — |
| 1024 | `727.85px176px` | 176px | 2 | **0px** |
| 1280 | `768px 204.8px` | 205px | 2 | **0px** |
| 1440 | `744px 224px` | 224px | 2 | **0px** |
| 1920 | `744px 224px` | 224px | 2 | **0px** |

- 死白消除：改后 `content.right == main.right`，`deadRight = 0`（改前 288px）。
- 断点 1024 而非尺寸类 840 的理由见 `docs/designs/material3/ADAPTATION.md`（840 下正文不足 550px、45px 标题被挤成 4 行）。
- 标题在各断点稳定 2 行；正文列宽由 `.m3-title`（26ch）/ `.m3-bio`（60ch）自身承担，未被拉宽。
- 缺省头像兜底：移除 `.m3-avatar` 后 `:not(:has(...))` 收回单列，`gridTemplateColumns = 1024px`，正文右缘与分区误差回到 **0px**（否则 `auto` 列宽 0 但 `column-gap` 生效仍会错开）。
- 窄屏不受影响：375 实测 `gridTemplateColumns = none`、头像 112px 仍位于正文之上（`avatarStackedAbove = true`）、`scrollWidth == innerWidth == 375`、按钮全 48px、芯片全 44px。
- 深色模式同样成立：`avatarRight == sectionRight`（误差 0px），头像 224px。

## 结构、token 与 a11y（桌面实测，1440×900 复验）

- 标题层级：H1（headline）×1 → H2 ×4（Projects / Experience / Skills / Contact）→ H3 ×3（项目）无跳级。
- 五个 `<section>` 全部具可访问名称（`aria-labelledby` → `m3-title` / `m3-projects` / `m3-experience` / `m3-skills` / `m3-contact`，实测 5 处）。
- 链接可访问名干净（`niconico` / `BB素材库` / `下北沢通信` / 项目标题 ×2 / 邮箱 CTA / 菜单项为共享 chrome）；`aria-hidden` 装饰 SVG 计数 11（按钮 mark ×2、卡片外链箭头 ×2、CTA 邮箱图标等）。
- **DOM 顺序未变**：`.m3-hero-text` 为纯布局包裹层，头像仍是 hero 首个子元素 → 键盘 / 辅助技术顺序与视觉顺序一致（宽屏下头像视觉在右，但 `alt=""` 且非交互控件，不影响阅读路径）。
- 深色方案（`prefers-color-scheme: dark` 实测）：body `#141218` / `#e6e0e9`——与 DESIGN.md 深色映射一致。

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
- **跳转兜底（1440 实测）**：直接 `window.scrollTo(0, scrollHeight)`（不产生 IO 通知的高危路径）后隐藏元素 **0**。
- hero hover / 按压：状态层近似（hover 8% / press 10%），transition 150–200ms（源码；唯一动效属性为背景色与阴影，遵循运动约束）。

## 降级（reduced-motion / 无 JS / 无 IO / IO 抛错）

| 情形 | 实测 |
|---|---|
| `prefers-reduced-motion: reduce` | 门控未写入；隐藏 0；`.m3-title` opacity 1 |
| 无 JavaScript | HTML 源中无 `data-reveal-ready`（CSS 隐藏态永不生效）；截图确认全内容可见（`verify-070-material3-nojs.png` / `m3-nojs.png`） |
| 无 `IntersectionObserver` | 门控未写入；隐藏 0 |
| IO 构造抛错 | 2.6s 后安全网撤销门控；隐藏 0 |

> 2026-10-12 复验：四情形均在 1440 下重跑，隐藏元素均为 **0**、`.m3-title` opacity 均为 **1**、两窗格头像均为 **224px**（即布局不依赖 JS 与动效，两窗格在减动态 / 无脚本下同样成立）。

## 触控与移动端（375×812 + hasTouch / isMobile，dpr 2）

- `matchMedia('(pointer: coarse)').matches === true`（`(hover: none)` 亦为 true）。
- 零横向溢出（`scrollWidth == innerWidth == 375`）。
- 命中高度：`.m3-btn` ×4 全 **48px**；`.m3-chip` ×5 全 **44px**；`.m3-card-link` ×2 **44.6px**（首测 39.8px < 40 口径 → `pointer: coarse` padding 0.65rem→0.8rem 修正后复测）。
- 折行与对齐：hero 按钮组单行无溢出、左缘与 H1 对齐（16px）；卡片单列；contact 区 note/按钮纵向堆叠（间距 24px）；页脚两行。
- **两窗格未泄漏到窄屏**：375 下 `gridTemplateColumns = none`，头像仍为 112px 且位于正文之上（`avatarStackedAbove = true`）。

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

- `detect --json src/designs/material3` → `[]` 零发现（无例外），2026-10-12 改版后复跑仍为 `[]`。
- 有效性反证：同命令对 oxide 命中 1 条已记录 advisory（`codex-grid-background`，advisory / slop），检测器非空转。

## 切换页预览碎片（`Preview.astro`，2026-10-19）

- **视觉签名**：大圆角面层、分组标签、tonal / filled 双按钮与三级 surface 层次；预览保留 M3 的面层与控件语言，不是通用卡片。
- **令牌抽取**：浅 / 深两套系统色与状态参数抽入 `tokens.css`，作用域 `:is(.m3, .m3-pv)`；正式页只改声明位置。
- **字体**：导出 `--font-roboto-flex`，与其它设计按族去重；不额外引入图标字体。
- **隔离与等价**：预览不 import 正式页 `style.css`，无 `:root`、无可聚焦元素；正式页产物与 HEAD 基线 sha256 相等。
- **检测器**：目录扫描零发现；缩略预览未引入新的 design-system 信号。

## 已定事项（结论）

- **状态层不透明度取指南现值**（hover 8 / focus 10 / press 10 / drag 16）；tokens v0.192 中 focus/pressed 为 12% 的差异已在 DESIGN.md 注记与 ADAPTATION 记录。
- **阴影为项目侧 web 配方**（上游层级 token 只定义 dp 值、不含阴影）：静息卡片 level1、hover 升 level2；其余深度用 tonal 面层表达。
- 深色方案随系统自动切换（无手动开关、无额外交互机关）；两模式对比度均过线。
- 卡链触控命中原为 39.8px（<40 口径），经 `pointer: coarse` padding 调整后 44.6px——修正已合入首版（非遗留缺陷）。
- 移动端截图口径：`fullPage` 截图前先滚动触发全部显现（同 carbon 口径）。
- **首屏两窗格断点定为 1024px**（非尺寸类的 840）：840 下正文不足 550px、45px 标题被挤成 4 行；1024 起主列 ≥960px 才成立。此为项目侧判断，理由与依据已记入 `docs/designs/material3/ADAPTATION.md`（汇编 DESIGN.md 只读、不得改写）。

## 横向对照：其余设计的首屏留白（2026-10-12 顺带核查）

用户反馈「有些设计头像位置不合理」，故对全部 8套设计在 1920 宽下实测首屏右缘死白（`main.right`− 首屏最右内容右缘），确认 material3 是唯一真正失衡者，其余无需改动：

| 设计 | 死白 | 判定 |
|---|---|---|
| material3 | **288px → 0px（已修）** | 真缺陷：首屏被 46rem 掐住而下方通栏，已改两窗格 |
| govuk | 320px | **非缺陷**：无头像；正文 `max-width: 66ch` 属 GOV.UK 内容 Measure 铁律，不得为填满而拉宽 |
| kern | 48px | 非缺陷：首屏本就通栏（1086px），骨架语言要求左对齐，48px 为网格内边距余量 |
| frost | 20px | 非缺陷：内容列 720px 居中，iOS「单列阅读」立场（DESIGN.md 明文），空白对称非偏置 |
| terminal | 41px | 非缺陷：终端等宽栅格，行宽由字符数决定 |
| editorial | 80px | 非缺陷：`ed-hero-grid` 3fr/2fr 已构成两栏，非头像问题 |
| fast / oxide | 0px | 非缺陷：首屏通栏，无死白 |

## 多语言（v0.9.0，2026-10-12）

- **语言切换入口 = 共享操作菜单内的语言分组**（`.cm-lang`，桌面二级子菜单 / 移动端平铺）：本设计**不渲染**可见语言切换器，`style.css` 中也**没有**语言切换样式。中性外观属项目 chrome，不模仿本设计。跨设计、跨输入环境的完整实测矩阵见 `docs/verification/action-menu.md`。
- 三语言页面：`<html lang>` 正确、robots 与 hreflang 策略正确（仅默认设计标注 hreflang）、二级菜单内 3 个语言项且目标**保持本设计 id**、**恰好 1 个** `aria-current="page"`、0 console 错误。
- 键盘可达：↑↓ 可遍历至语言项，焦点环可见（实测 `outline: 1.6px solid`）。
- 本设计 `style.css` 与改动前**逐字节一致**（仅末尾换行差异）——文案本地化与语言入口重构**未造成任何视觉漂移**。
- 跨语言路由与共享机制的完整测试矩阵见 `docs/verification/shared.md`。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎未实测；触控与降级均基于 Chromium 1200 仿真。**`:has()` 选择器未在 Safari / Firefox 实测**（Safari 15.4+ / Firefox 121+ 原生支持；仅影响「头像缺省」兜底路径，且失败时退化为单列正文右缘差一个 `column-gap`，不影响内容可见性）。
- 本会话内置浏览器截图不可用（tab offscreen），截图与四降级 / 触控实测经本机 Playwright 同引擎（Chromium 1200）执行；桌面 console / 资源断言另经内置浏览器工具交叉复核（console none、资源仅自身 + 会话残留 `@vite/client`，符合既有口径）。
- ripple / 弹簧物理动效未还原（静态 web 近似；M3 Expressive 不在汇编范围，见 ADAPTATION）。
- 截图归档（2026-10-12 本次）：`m3-1024.png` / `m3-1280.png` / `after-m3-1440.png` / `m3-dark-1440.png` / `m3-mobile-375.png` / `m3-nojs.png`（项目根目录，验证后清理）。
- 截图归档：`C:\Users\lovelive\.trae-cn\trae-browser-screenshots\6acb6fb2351723235e449814\`（`verify-070-material3-desktop-light-hero.png`、`verify-070-material3-desktop-light-full.png`、`verify-070-material3-desktop-dark-full.png`、`verify-070-material3-mobile-375.png`、`verify-070-material3-nojs.png`；为验证机器本地路径，未随仓库分发）。
