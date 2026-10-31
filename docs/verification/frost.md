# verification — frost（第三方分析复刻：Apple HIG 材料与层次语言致敬，自撰规范）

> 本文件是该主题**当前**的完整验证状态；重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）；记录归属见 `docs/README.md`。
> 复刻为自撰规范（可修订），适配与例外记录在 `docs/designs/frost/ADAPTATION.md`；来源定性见 `design.json.source`。
> 最近全流程验证：2026-10-11（v0.8.0 首建 + 全流程）；**2026-10-31 韩语增量**：新增 `/ko/frost/`，Inter → 系统韩文字体回退；ko 页实测 `lang=ko`、韩文渲染、无横向溢出、0 console（截图 `docs/verification/assets/frost-ko.png`）；未重跑完整三语视觉矩阵。

## 构建与产物

- `npm run build` 11 页绿（`astro check` 0 错误 / 0 警告 / 0 提示）；注册表校验通过（`third-party-analysis` provenance 字段齐全）。
- CSS 隔离成立：本页恰 1 条自身样式链接（`Page.DpMJfFNg.css`，13,823 B）；`.fr-*` 选择器 56 个；其余 6 个设计 CSS 中 `.fr-` 计数全 **0**；根页 / 切换页 / 404 不链接任何设计 CSS。
- `BASE_PATH=/demo` 全链路前缀正确。
- 字体：`rel="preload"` 计数 **0**；Inter Variable 构建期自托管（`@theme inline` `--font-fr`）；无外链资源。
- 核心字段全部渲染（name = Large Title h1 + 导航 Headline / headline / bio / links）× 扩展区块四类（projects / experience / skills / contact）。

## 结构、token 与 a11y（桌面实测，1280×900）

- 标题层级：H1 ×1 → H2 ×4（分组标签）→ H3 ×5（项目 + 经历）无跳级；五个 `<section>` 全部具可访问名称；
- **材料实测（玻璃路径，CDP 仿真 `prefers-reduced-transparency: no-preference`）**：导航 `position: sticky` / 底 `rgba(250,250,250,0.6)` / `blur(20px) saturate(1.8)` / 高 53px；卡片底 `rgba(255,255,255,0.78)` + 同参数模糊 + 16px 圆角；contact 卡 22px 圆角——**两层材料厚度成立**。
- token 复核：胶囊高 **44px** / 圆角 9999px / Fill 底 `rgba(120,120,128,0.12)`；Filled 底 `rgb(0,113,227)`；Large Title **34 / 40.1px / ls -0.51px**、Title2 22px、正文 **17 / 25px**；字体为 Inter（哈希族名 + 回退）；行分隔线 `rgb(198,198,200)`、左缩进 **16px**（伪元素实测）。
- 极光层：`fixed` / `z-index: -1` / `pointer-events: none` / 4 层径向渐变（浅深两套 8 色值已文档化于 DESIGN.md `aurora-*`）。
- 内容列 720px；reflow 与 a11y：装饰 SVG `aria-hidden`（4 处：按钮 mark ×2、外链箭头 ×2）；无 `<img>`（资料无头像）。
- 交互态实测：胶囊 hover 混合色生效；键盘 Tab 焦点 = `2px solid rgb(0,113,227)`。
- console：0 错误 / 0 警告；网络 0 失败 / 0 个 ≥400（浅深双上下文）。

## 动效（Motion language：弹簧档）

- 门控：`data-reveal-ready` 写入；`[data-reveal]` **9** 个。
- 首屏入场：`.fr-rise` ×4，`animation: fr-rise` 500ms + `cubic-bezier(0.32, 1.25, 0.5, 1)`（弹簧轻微过冲）；错落 0 / 40 / 80 / 120ms；终态 opacity 1。
- 滚动显现：滚动前隐藏 3（首屏下）、滚到底后 **0**，`data-reveal-in` **9/9**；行错落 50ms、组错落 70ms。
- 降级（reduced-motion / 无 JS / 无 IO / IO 抛错）：门控未写入或不成立、隐藏元素全 **0**（四态实测）；无 JS 截图确认全内容可见。
- **降低透明度回退实测（CDP 三态）**：环境默认（本机 headless 默认即 `reduce`）→ 导航 `rgba(250,250,250,0.97)`；仿真 `no-preference` → `0.6`（玻璃路径）；再仿真 `reduce` → `0.97`。`@supports not (backdrop-filter…)` 回退块同值，存在于产物 CSS（源码与产物核对；`backdrop-filter` 不支持的引擎按 CSS 条件自动命中）。

## 触控与移动端（375×812 + hasTouch / isMobile，dpr 2）

- `matchMedia('(pointer: coarse)').matches === true`；零横向溢出（`scrollWidth == innerWidth == 375`）。
- 命中高度：`.fr-capsule` ×4 全 **44px**；行标题链接 ×2 **44.3px**（coarse 下 0.7rem padding）；导航 53px。

## 对比度（核算：表层层叠按 rgba 合成、基底取画布色；实测 computed）

| 组合（浅色） | 对比度 |
|---|---|
| nav-name / 导航材料（`#1C1C1E` on `#FAFAFA`） | 16.27 |
| h1 / 画布 `#F2F2F7` | 15.25 |
| row-title / 卡片 materials（`#fff` 合成） | 16.96 |
| bio / 画布（secondary `#636366`） | 5.37 |
| row-sub / 卡片（secondary） | 5.97 |
| chip / chip 底（fill 合成 `#EEEEF0`） | 5.19 |
| cap-fill / fill 底 | 11.37 |
| cap-accent 白字 / `#0071E3` | 4.70 |
| footer / 画布（tertiary `#6E6E73`，全档最低） | 4.54 |

| 组合（深色） | 对比度 |
|---|---|
| nav-name / 导航材料 | 18.18 |
| bio / 黑画布（`#A1A1A6`） | 8.16 |
| row-sub / 卡片（`#1B1B1D` 合成） | 6.67 |
| chip / chip 底 | 5.01 |
| cap-accent 白字 / `#0071E3`（全档最低） | 4.70 |
| footer / 黑画布（`#8E8E93`） | 6.44 |

- 全部文本 ≥4.5:1（浅色最低 **4.54**、深色最低 **4.70**）。**方法说明**：材料底按 `rgba` 与画布合成；极光为低频柔彩叠加，其最坏叠加点经解析核算仍在上述值之上（已由 token 合成口径覆盖，未逐像素采样）。

## 检测器（impeccable）

- `detect --json src/designs/frost` → **2 条 `bounce-easing`**（弹簧曲线，advisory）——**已记录例外**：弹簧过冲是 HIG 复刻的核心运动语言（受控幅度，1.25 控制点），见 `ADAPTATION.md`「检测器例外」。首轮 9 条 `design-system-color`（极光色）已作为设计系统值补入 `DESIGN.md`（`colors.aurora-*`）后复跑清零。
- 有效性反证：同命令对 oxide 命中 1 条已记录 advisory，检测器非空转。

## 切换页预览碎片（`Preview.astro`，2026-10-19）

- **视觉签名**：极光作为背景内容，前层保留导航玻璃、大标题、Filled / tonal 胶囊与分组卡；这是 HIG 材料层次而不是通用卡片。
- **令牌抽取**：浅 / 深两套系统色与材料参数抽入 `tokens.css`，作用域 `:is(.fr, .fr-pv)`；正式页只改声明位置。
- **字体**：导出 `--font-inter`，与其它设计按族去重；切换页不 preload。
- **隔离与字体边界**：预览不 import 正式页 `style.css`，无 `:root`、无可聚焦元素；本轮字体回退链有预期变化，故不再沿用“与 HEAD 基线 sha256 相等”的旧等价结论。
- **检测器**：新增 `preview-body` / `preview-pill` 两个缩略字号档后，预览零新增发现；仍余 2 条既有 `bounce-easing` 例外。

## 字体审计（2026-10-19）

- **接线**：Inter Variable 经 `astro.config.mjs` 注册、`Page.astro` `<Font>` 加载、`style.css` `@theme inline` 别名 `--font-fr`；浏览器实测 Inter 命中，latin normal 约 48,256 B、italic 约 51,832 B。
- **保留理由**：SF Pro 受 Apple 平台字体许可限制，不能随站点再分发；Inter 是开放许可、字面比例接近系统 UI 的替代，17px 正文与 34px Large Title 样张成立。Roboto Flex 会带来 Material 视觉记忆，不适合 frost 的系统材料声部。
- **覆盖与回退**：Inter 无 CJK / 假名；中文回退 `PingFang SC` / `Microsoft YaHei`，日文回退 `Hiragino Sans` / `Yu Gothic UI`，通用族 `sans-serif` 收尾。字体加载失败时 iOS 型阶尺寸与行高不变。
- **加载**：0 preload；三语言无第三方字体域名；CJK 子集按 `unicode-range` 惰性加载。
- **记录归属**：完整六项记录见 `src/designs/frost/DESIGN.md`「字体选型记录」。

## 已定事项（结论）

- **Accent Solid**：Filled 胶囊底固定 `#0071E3`（深浅同值）——白字在深色档系统蓝 `#0A84FF` 上仅 3.65:1（AA 不过）；浅色强调蓝亦取 `#0071E3`（`#007AFF` 不达 4.5）。两处收紧均已写入规范。
- **玻璃路径的测量口径**：本机 headless Chromium 默认 `prefers-reduced-transparency: reduce`，玻璃观感需 CDP 显式仿真 `no-preference` 实测；截图亦在该仿真下归档（代表真实玻璃观感）。
- 两层材料厚度与回退三态（supports / reduced-transparency）均实测在位；极光静止（无持续动效，DESIGN.md 论证）。

## 多语言（v0.9.0，2026-10-12）

- **语言切换入口 = 共享操作菜单内的语言分组**（`.cm-lang`，桌面二级子菜单 / 移动端平铺）：本设计**不渲染**可见语言切换器，`style.css` 中也**没有**语言切换样式。中性外观属项目 chrome，不模仿本设计。跨设计、跨输入环境的完整实测矩阵见 `docs/verification/action-menu.md`。
- 四语言页面：`<html lang>` 正确、robots 与 hreflang 策略正确（仅默认设计标注 hreflang）、二级菜单内 4 个语言项且目标**保持本设计 id**、**恰好 1 个** `aria-current="page"`、0 console 错误。
- 键盘可达：↑↓ 可遍历至语言项，焦点环可见（实测 `outline: 1.6px solid`）。
- 本设计 `style.css` 与改动前**逐字节一致**（仅末尾换行差异）——文案本地化与语言入口重构**未造成任何视觉漂移**。
- 跨语言路由与共享机制的完整测试矩阵见 `docs/verification/shared.md`。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎未实测；触控 / 降级 / 玻璃路径均基于 Chromium 1200 仿真。
- backdrop-filter 实际模糊观感随浏览器与 GPU 而异；回退路径保证功能等价（近实底 + 保留描边）。
- 截图归档：`C:\Users\lovelive\.trae-cn\trae-browser-screenshots\6acb6fb2351723235e449814\`（`verify-080-frost-desktop-light-hero.png`、`verify-080-frost-desktop-light-full.png`、`verify-080-frost-desktop-dark-full.png`、`verify-080-frost-mobile-375.png`、`verify-080-frost-nojs.png`；为验证机器本地路径，未随仓库分发）。
