# verification — editorial（自产：编辑杂志风）

> 本文件是该主题**当前**的完整验证状态；重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）；记录归属见 `docs/README.md`。
> 最近全流程验证：2026-10-10（v0.4.0 动效全流程）；v0.5.0–0.5.1 菜单改动的全站回归已复核本页；2026-10-11 文档治理迁移，无页面代码改动；2026-10-11 v0.5.3 链接标记按配置化 + Elsewhere 全量渲染的聚焦回归已复核本页。

## 构建与产物

- `npm run build` 7 页绿（`astro check` 0 错误 / 0 警告 / 0 提示）；注册表校验通过。
- CSS 隔离成立：本页恰 1 条自身样式链接；`.ed-*` 选择器只出现在自身 CSS；根页 / 切换页 / 404 不链接任何设计 CSS。
- `BASE_PATH=/demo` 全链路前缀正确；`rel="preload"` 计数 0（2026-10-10 移除，见下「已定事项」）；无外链资源（`src="http` = 0）。
- 图标（不含共享菜单 chrome）：Elsewhere 4 枚（品牌 mark ×2 / Mail ×2）+ 作品行外链箭头 ×2，全部 `aria-hidden`；未配置 icon 的链接不打标（2026-10-11 修订，Globe 残留 0）。

## 结构、内容与 a11y

- 核心字段 `name` / `headline` / `bio` / `links` 全部渲染；扩展区块取舍：渲染 `projects` + `contact`，**不渲染** `experience` / `skills`（编辑立场，见 `DESIGN.md` Project Contract）。
- masthead 锚点目录（`#ed-works` / `#ed-elsewhere`）；页脚"邀请"段收尾（`contact.note` + 邮箱 CTA）；Elsewhere 全量渲染 `links[]`（5/5；2026-10-11 修订：移除 mailto distill 去重）。
- 可访问名干净：链接可访问名不含装饰符（实测 `GitHub` / `博客`）；导航 `aria-label="本期导航"`；图标（品牌 mark / Mail / 外链箭头）全部 `aria-hidden`，无 icon 配置的链接可访问名即纯文本。
- 桌面首屏两栏同顶对齐（定位语先于简介，与 DOM 顺序一致）；≤720px 收单栏；≤560px kicker 仅中文。

## 对比度（最近实测）

- 灰墨系（品牌 mark / 次级文字）**6.95:1**；其余档位最近未单独重算——每次新增 / 调整色值必须实测并更新本表。

## 动效（Motion language「印刷」双动作）

- 入场（纯 CSS，无 JS 依赖）：眉标 → 姓名 → 定位/简介 90ms 错落渗入；hero 发丝线 220ms 起 520ms 从左绘出；约 0.8s 内全部落定。
- 滚动显现（共享 IO，只播一次）：栏目头两端就位（标题自左 / 副标自右各 10px，副标慢 80ms）；作品行渗入 + 行线绘制 420ms（滞后 40ms）；Elsewhere 链接 70ms 错落；页脚整体渗入。
- 契约：跳转式滚动兜底后隐藏元素 **0**；reduced-motion 全关；无 JS / 无 IO / 脚本抛错四情形隐藏元素均 **0**（Chromium 仿真）。
- 交互态过渡保持 120ms；静态焦赭 ≤3 处/栏目（One Accent Rule，按栏目计数 + 交互态豁免）。

## 触控与移动端（375×812 + 触控仿真）

- `pointer: coarse` 生效；零横向溢出（`scrollWidth == innerWidth == 375`）。
- 命中高度实测 **44.2px**（链接 / 导航 / 作品标题均在 `pointer: coarse` 下以 0.78rem 纵向 padding 扩展）。

## 检测器（impeccable）

- 最近状态：**零发现**。
- 有意保留信号（已记录在该 `DESIGN.md`）：`cream-palette` / `hero-eyebrow-chip`——"一期特刊"的产品意图，2026-10-10 经项目所有者确认。

## 已定事项与历史修复要点（结论保留；过程与中间快照见 Git）

- 强调色收权：链接静态下划线保持墨色、hover 转焦赭；补 `::selection` / caret（One Accent Rule 计数口径：按栏目计数 + 交互态豁免）。
- 字体 preload 移除：npm provider 不填 subset 元数据、无法子集过滤；移除 preload 以避免预载未使用子集（latin 子集仍按 `unicode-range` 按需加载）。
- 字体回退链修正：Fraunces 配置 `fallbacks`，避免 Astro 注入的无衬线优化回退排在衬线回退之前。
- 布局倒置修复：桌面首屏 `align-items: end` → 同顶对齐。
- 切换入口历史：v0.5.0 起移除本页全部可见切换入口，改由共享桌面右键菜单承担（ADR 0004）。

## 多语言（v0.9.0，2026-10-12）

- **语言切换入口 = 右键菜单的语言二级菜单**（`.cm-lang`，主菜单高度与语言数量无关）：本设计**不再**渲染可见语言切换器，`style.css` 中也**没有**语言切换样式（v0.9.0 修订：消除 8 套设计重复排版）。语言项由共享 `ContextMenu.astro` 提供，中性外观属项目 chrome，不模仿本设计。
- 三语言页面：`<html lang>` 正确、robots 与 hreflang 策略正确（仅默认设计标注 hreflang）、二级菜单内 3 个语言项且目标**保持本设计 id**、**恰好 1 个** `aria-current="page"`、0 console 错误。
- 键盘可达：↑↓ 可遍历至语言项，焦点环可见（实测 `outline: 1.6px solid`）。
- 本设计 `style.css` 与改动前**逐字节一致**（仅末尾换行差异）——文案本地化与语言入口重构**未造成任何视觉漂移**。
- 跨语言路由与共享机制的完整测试矩阵见 `docs/verification/shared.md`。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎、横屏、200% 缩放未实测；触控与降级基于 Chromium 仿真。
- 截图归档：`C:\Users\lovelive\.trae-cn\trae-browser-screenshots\`（`verify-v040-editorial-*`、`verify-051-editorial-menu.png`、`verify-053-editorial-links.jpg` 等；为验证机器本地路径，未随仓库分发）。