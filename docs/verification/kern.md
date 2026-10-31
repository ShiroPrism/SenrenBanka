# verification — kern（第三方分析复刻：Vercel Geist 视觉语言致敬，自撰规范）

> 本文件是该主题**当前**的完整验证状态；重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）；记录归属见 `docs/README.md`。
> 复刻为自撰规范（可修订），适配与例外记录在 `docs/designs/kern/ADAPTATION.md`；来源定性见 `design.json.source`。
> 最近全流程验证：2026-10-11（v0.7.0 首建 + 全流程）。

## 构建与产物

- `npm run build` 9 页绿（`astro check` 0 错误 / 0 警告 / 0 提示）；注册表校验通过（`third-party-analysis` provenance 字段齐全）。
- CSS 隔离成立：本页恰 1 条自身样式链接（`Page.5Oisn5HM.css`，13,488 B）；`.kern-*` 选择器 79 个；其余 5 个设计 CSS 中 `.kern-` 计数全 **0**；根页 / 切换页 / 404 不链接任何设计 CSS。
- `BASE_PATH=/demo` 全链路前缀正确（HTML 内链 / CSS / 字体 URL 全带 `/demo`；无未加前缀的 `/_astro` 引用）。
- 字体：`rel="preload"` 计数 **0**；Geist Variable + Geist Mono Variable 构建期自托管（`@theme inline` `--font-kern` / `--font-kern-mono`），页面内联 13 个 `@font-face` 子集块、运行时按需仅请求 **2** 个 woff2（浏览器工具实测 fontCount=2）；无外链资源。
- 核心字段全部渲染（name 为 Display 档 h1 / headline / bio / links）× 扩展区块四类（projects / experience / skills / contact）。
- 两款新字体族首次构建需联网拉 fallback metrics（`NODE_USE_ENV_PROXY=1`；事实已记入 AGENTS 已知坑），本次首建通过。

## 结构、token 与 a11y（桌面实测，1280×900）

- 标题层级：H1（姓名）×1 → H2 ×4（等宽分区标签）→ H3 ×3（项目）无跳级。
- 五个 `<section>` 全部具可访问名称（`aria-labelledby` → `kern-title` / `kern-projects` / `kern-experience` / `kern-skills` / `kern-contact`，实测 5 处）。
- 链接可访问名干净（`GitHub` / `Email` / `博客` / 项目标题 ×2 / 邮箱 CTA；菜单项为共享 chrome）；`aria-hidden` 装饰 SVG 5 处（按钮 mark ×2、外链箭头 ×2、CTA 邮箱图标）。
- 骨架与留白：`.kern-shell` 左右各 **96px**（1280，`max-width: 68rem` 居中）、内容内边距 **48px**；无贴边；`.kern-cells` 3 列（各 263px）；姓名 Display 档 **72px / 600 / -1.44px**（clamp 上衣）。
- 骨架实测：十字号 `::before` 宽 **9px**、双渐变绘制、颜色 `#555555`（≥69rem 显示）；顶栏底边 `#262626`；`@media (max-width: 69rem)` 隐藏规则存在于产物。
- token 复核（computed）：body `#000000` / `#ededed`；幽灵按钮高 ≈41.6px / 圆角 **6px** / 描边 **`#666666`**；反转按钮 `#ffffff` + `#000000`；芯片圆角 **4px** / 描边 `#262626` / 11px 等宽大写；单元内边距 24px；**全页 `box-shadow` 计数 0**（零阴影实测，shadowProbe=0）。
- 交互态实测：幽灵按钮 hover 底 `#111111` + 描边 `#8a8a8a`；单元 hover 底 `#111111`；focus（Tab）outline **2px solid `#ffffff`**；hover 规则均处 `(hover: hover) and (pointer: fine)` 门控（源码核对）。
- console：0 错误 / 0 警告；网络 0 请求失败 / 0 个 ≥400（Playwright wire 与浏览器工具双路一致；浏览器工具侧资源仅自身 + 会话残留 `@vite/client`，符合既有口径）。

## 动效（Motion language：仪表档）

- 门控：`data-reveal-ready` 写入；`[data-reveal]` **9** 个。
- 首屏入场：`.kern-rise` ×4（姓名 / 定位 / 简介 / 按钮组），`animation: kern-rise` 260ms + `cubic-bezier(0.22, 1, 0.36, 1)`；错落 0 / 40 / 80 / 120ms；终态 opacity 1。
- 滚动显现：滚动前隐藏 3（首屏下）、滚到底后 **0**，`data-reveal-in` **9/9**；单元错落 60ms、经历行 50ms（源码）。
- 无持续动效（论证见 DESIGN.md）；交互过渡 140ms（颜色 / 描边 / transform）。

## 降级（reduced-motion / 无 JS / 无 IO / IO 抛错）

| 情形 | 实测 |
|---|---|
| `prefers-reduced-motion: reduce` | 门控未写入；隐藏 0；`.kern-display` opacity 1 |
| 无 JavaScript | HTML 源中无 `data-reveal-ready`（CSS 隐藏态永不生效）；截图确认全内容可见（`verify-070-kern-nojs.png`） |
| 无 `IntersectionObserver` | 门控未写入；隐藏 0 |
| IO 构造抛错 | 2.6s 后安全网撤销门控；隐藏 0 |

## 触控与移动端（375×812 + hasTouch / isMobile，dpr 2）

- `matchMedia('(pointer: coarse)').matches === true`（`(hover: none)` 亦为 true）。
- 零横向溢出（`scrollWidth == innerWidth == clientWidth == 375`）；见「已定事项」首条（首测溢出修复）。
- 命中高度：`.kern-btn` ×4 全 **44px**；`.kern-cell-title a` ×2 **46px**；芯片（非交互）24.1px 记录不设门槛。
- 折行与对齐：hero 按钮组单行无溢出（左缘 21px 与内容对齐）；分区收单列（333px）；单元网格收单列（332px）；接触区 note / 反转按钮纵向堆叠。

## 对比度（核算，全部取自实测 computed 值）

| 组合 | 对比度 |
|---|---|
| 白 `#ffffff` / 黑 `#000000`（Display、标题、幽灵按钮文字、cell-title） | 21.00 |
| body `#ededed` / 黑（lede、contact-note） | 17.94 |
| muted `#a1a1a1` / 黑（bio、单元格描述、经历、芯片文字） | 8.13 |
| faint `#888888` / 黑（等宽微标注 / 页脚，最低文字档） | 5.92 |
| 反转按钮黑字 / 白底 | 21.00 |
| 幽灵按钮描边 `#666666` / 黑（交互边界） | 3.66 |

- 全部文本 ≥4.5:1（AA 硬底线），最低为等宽微标注 **5.92**；交互边界 ≥3:1。
- 结构性发丝线 / 芯片描边 `#262626` / 黑 = **1.39**——装饰性分隔与容器边界（内容可识别性由其白 / 灰文字承担），不作 3:1 要求，如实记录（与 material3 `outline-variant` 口径一致）。
- 选中态 = 反转（白底黑字，token 级，对比 21.00）。

## 检测器（impeccable）

- 首轮 3 条 advisory（`design-system-color` ×2：`#555555` / `#e5e5e5`；`design-system-font-size` ×1：`0.875rem`）——均为**文档化缺口**而非漂移：已作为设计系统值补入 `DESIGN.md`（`colors.cross` / `colors.invert-hover` / `typography.button`）与正文，**规范先改、实现未动**；复跑 → `[]` 零发现。
- 有效性反证：同命令对 oxide 命中 1 条已记录 advisory（`codex-grid-background`），检测器非空转。

## 切换页预览碎片（`Preview.astro`，2026-10-19）

- **视觉签名**：纯黑底、发丝网格、骑线十字号、黑白反转按钮与等宽元数据；缩略版仍是零阴影骨架，不借用切换页卡片样式。
- **令牌抽取**：13 个灰度、动效参数与节奏抽入 `tokens.css`，作用域 `:is(.kern, .kern-pv)`；正式页只改声明位置。
- **字体**：导出 `--font-geist` / `--font-geist-mono`，预览直接引用这两个框架变量（不使用正式页 `@theme inline` 的别名），由切换页按族去重。
- **隔离与字体边界**：预览不 import 正式页 `style.css`，无 `:root`、无可聚焦元素；本轮字体回退链有预期变化，故不再沿用“与 HEAD 基线 sha256 相等”的旧等价结论。
- **检测器**：缩略档位登记进 `DESIGN.md` 的四个 `preview-*` 字号后零发现；正式页既有 `cross` / `invert-hover` 颜色仍保留在规范中。

## 字体审计（2026-10-19）

- **接线**：Geist Variable / Geist Mono Variable 经 `astro.config.mjs` 注册、`Page.astro` 两个 `<Font>` 加载、`style.css` `@theme inline` 别名 `--font-kern` / `--font-kern-mono`；浏览器实测两族均命中，latin 主文件约 29,400 B / 23,128 B。
- **保留理由**：Geist 的几何骨架承担姓名与正文，Geist Mono 只承担分区标签、日期与页脚；与 Inter（frost）和 JetBrains Mono（terminal）相比，这组更贴近黑白坐标网格的工程语气，且双声部职责明确。
- **覆盖与回退**：Geist 无 CJK / 假名；中文回退 `PingFang SC` / `Microsoft YaHei`，日文回退 `Hiragino Sans` / `Yu Gothic UI`。等宽只用于 ASCII 元数据，缺字由系统等宽与符号字体承接。
- **加载**：0 preload；三语言无第三方字体域名；断网 / 字体失败时系统无衬线仍可读。
- **记录归属**：完整六项记录见 `src/designs/kern/DESIGN.md`「字体选型记录」。

## 已定事项（结论）

- **十字号溢出修复**：`+` 采用骑线定位（9px 宽、±5px 偏移），在骨架触碰屏缘的窄视口会向右溢出 4px——375 首测 `innerWidth/scrollWidth = 379/379`；修复 = `@media (max-width: 69rem)` 隐藏十字号（骨架由竖线 / 横线继续承担），复测 **375/375** 零溢出；规范同步（DESIGN.md Layout 节）。1104px 以上保留完整十字签名（1280 桌面实测 9px 十字在位）。
- **零阴影实测**：全页 `box-shadow` 计数 0（shadowProbe），符合 The Flat Guide Rule。
- 复刻边界：页面零"Vercel / Geist"品牌表述；字体名仅在 CSS 家族栈与 ADAPTATION 记录中出现（OFL 事实性表述）。
- 移动端截图口径：`fullPage` 截图前先滚动触发全部显现（同 carbon / material3 口径）。

## 多语言（v0.9.0，2026-10-12）

- **语言切换入口 = 共享操作菜单内的语言分组**（`.cm-lang`，桌面二级子菜单 / 移动端平铺）：本设计**不渲染**可见语言切换器，`style.css` 中也**没有**语言切换样式。中性外观属项目 chrome，不模仿本设计。跨设计、跨输入环境的完整实测矩阵见 `docs/verification/action-menu.md`。
- 三语言页面：`<html lang>` 正确、robots 与 hreflang 策略正确（仅默认设计标注 hreflang）、二级菜单内 4 个语言项且目标**保持本设计 id**、**恰好 1 个** `aria-current="page"`、0 console 错误。
- 键盘可达：↑↓ 可遍历至语言项，焦点环可见（实测 `outline: 1.6px solid`）。
- 本设计 `style.css` 与改动前**逐字节一致**（仅末尾换行差异）——文案本地化与语言入口重构**未造成任何视觉漂移**。
- 跨语言路由与共享机制的完整测试矩阵见 `docs/verification/shared.md`。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎未实测；触控与降级均基于 Chromium 1200 仿真。
- 本会话内置浏览器截图不可用（tab offscreen），截图与四降级 / 触控实测经本机 Playwright 同引擎执行；桌面 console / 资源断言另经内置浏览器工具交叉复核。
- 参照对象为公开站点的视觉观察（2026-10-11 抓取 `vercel.com/geist` 系列页做取向核对），非任何上游文件快照——复刻定性见 `design.json`。
- 截图归档：`C:\Users\lovelive\.trae-cn\trae-browser-screenshots\6acb6fb2351723235e449814\`（`verify-070-kern-desktop-hero.png`、`verify-070-kern-desktop-full.png`、`verify-070-kern-mobile-375.png`、`verify-070-kern-nojs.png`；为验证机器本地路径，未随仓库分发）。
