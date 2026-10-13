# verification — terminal（自产：复古琥珀终端）

> 本文件是该主题**当前**的完整验证状态；重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）；记录归属见 `docs/README.md`。
> 最近全流程验证：2026-10-10（v0.4.0 动效全流程）；v0.5.0–0.5.1 菜单改动的全站回归已复核本页；2026-10-11 文档治理迁移，无页面代码改动；2026-10-11 v0.5.3 链接标记按配置化不涉及本页（`→ url` 为全量列表语言，非按 icon 分支），抽查复核。

## 构建与产物

- `npm run build` 7 页绿（`astro check` 0 错误 / 0 警告 / 0 提示）；注册表校验通过。
- CSS 隔离成立：本页恰 1 条自身样式链接；`.tm-*` 选择器只出现在自身 CSS；根页 / 切换页 / 404 不链接任何设计 CSS。
- `BASE_PATH=/demo` 全链路前缀正确；`rel="preload"` 计数 0（JetBrains Mono 不 preload，子集过多）；无外链资源（`src="http` = 0）。
- 图标：**零 SVG**——全部标记由字符语言承担（`└─` `→` `─`）。

## 结构、内容与 a11y

- 核心字段 `name` / `headline` / `bio` / `links` 全部渲染；扩展区块四个全渲染（experience / projects / skills / contact）。
- chrome 条（三个描边圆点 + `guest@senrenbanka: ~` 标题条，无切换入口）；首屏含 `# based in …`（`profile.location`）；experience 注释独立成行（`.tm-note`、缩进 3ch）；≤560px 链接列表改 `grid-template-columns: 3ch 1fr`。
- a11y：六个分区由 sr-only `<h2>`（Links / Experience / Projects / Skills / Contact）与 `aria-label`（Intro）具名；`$`、`└─`、`#`、`→` 与装饰横线一律 `aria-hidden`；链接 URL 显示为去协议短形式。
- 可访问名干净（实测早期口径 `GitHub` / `Email` 等，不以前缀装饰符开头）。

## 对比度（最近实测）

- dim 档（`#c68a1a`）**6.75:1**（2026-10-10 自 ≈5:1 提亮）；正文（基准琥珀）**10.97:1**；扫描线最坏行 dim ≥5:1（扫描线绘制在屏幕背景层、2.5% 琥珀）。
- 每次新增 / 调整色值必须实测并更新本表。

## 动效（Motion language「字符网格离散步进」）

- 入场（纯 CSS，零运行时 JS）：`$ whoami` 逐字打出 16ms/字（构建期切分 66 个 `tm-ty` span、95 处内联 `--d`）；姓名 0.3s 内、整屏 0.5s 内全部可见。
- 滚动显现：`$ 命令`逐字打出后输出行 / 列表项按 50ms 节奏落屏（每块上限 6 项）；打字只发生在命令与装饰行（≤18 字符），正文数据直接出现。
- 持续动效（仅两处小范围）：chrome 首个圆点 2.6s 呼吸；块状光标 1.1s `steps(1)` 闪烁，底边与字面底部对齐（`translateY(0.15em)`，v0.4.1 修正，减动态下位置保留、仅闪烁停止）。
- 契约：跳转式滚动兜底后隐藏元素 **0**（含 9 次快速往返滚动复测，布局稳定 `scrollHeight` 1243 → 1243）；reduced-motion 全关；无 JS / 无 IO / 脚本抛错四情形隐藏元素均 **0**。

## 触控与移动端（375×812 + 触控仿真）

- `pointer: coarse` 生效；零横向溢出（`scrollWidth == innerWidth == 375`）。
- 命中高度实测 **44.0px**（`pointer: coarse` 时纵向 padding 0.75rem）；hover 反白由 `(hover: hover) and (pointer: fine)` 门控（触屏不触发）；光标宽 0.6em 比例正确。

## 检测器（impeccable）

- 最近状态：**零发现**。
- 有意保留信号（已记录在该 `DESIGN.md`）：`blinking-cursor` / `repeating-stripes-gradient`——"琥珀终端机"的产品意图，2026-10-10 经项目所有者确认。
- 曾出现 `em-dash-overuse` 伪命中（注释中的「——」与 `--d` 字样触发）→ 改写注释后归零（v0.4.0）。

## 已定事项与历史修复要点（结论保留；过程与中间快照见 Git）

- a11y 三件套：sr-only 分区标题、装饰符 `aria-hidden`、链接 URL 去协议（P1 轮修复）。
- dim 档提亮：`#c68a1a`（自 ≈5:1 → ≈6.7:1；扫描线迁入背景层保最坏行 ≥5:1）。
- hover 反白加真悬停门控；扫描线自全屏叠加层迁入屏幕背景层。
- 字体回退链修正：JetBrains Mono 配置 `fallbacks`（等宽回退先于 Astro 注入的无衬线优化回退）。
- 光标自基线对齐改为底边贴字面底部（v0.4.1）；chrome 首个圆点呼吸灯（v0.4.0）。
- 切换入口历史：v0.5.0 起 chrome 条与页脚均无切换入口，改由共享操作菜单承担（ADR 0004 → ADR 0007）。

## 多语言（v0.9.0，2026-10-12）

- **语言切换入口 = 共享操作菜单内的语言分组**（`.cm-lang`，桌面二级子菜单 / 移动端平铺）：本设计**不渲染**可见语言切换器，`style.css` 中也**没有**语言切换样式。中性外观属项目 chrome，不模仿本设计。跨设计、跨输入环境的完整实测矩阵见 `docs/verification/action-menu.md`。
- 三语言页面：`<html lang>` 正确、robots 与 hreflang 策略正确（仅默认设计标注 hreflang）、二级菜单内 3 个语言项且目标**保持本设计 id**、**恰好 1 个** `aria-current="page"`、0 console 错误。
- 键盘可达：↑↓ 可遍历至语言项，焦点环可见（实测 `outline: 1.6px solid`）。
- 本设计 `style.css` 与改动前**逐字节一致**（仅末尾换行差异）——文案本地化与语言入口重构**未造成任何视觉漂移**。
- 跨语言路由与共享机制的完整测试矩阵见 `docs/verification/shared.md`。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎、横屏、200% 缩放未实测；触控与降级基于 Chromium 仿真。
- 截图归档：`C:\Users\lovelive\.trae-cn\trae-browser-screenshots\`（`verify-v040-terminal-*`、`verify-0.4.1-terminal-cursor.png`、`verify-051-terminal-dark.png` 等；为验证机器本地路径，未随仓库分发）。