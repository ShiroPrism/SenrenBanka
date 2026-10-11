# verification — fast（厂商来源：microsoft/fast，MIT）

> 本文件是该主题**当前**的完整验证状态；重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）；记录归属见 `docs/README.md`。
> 厂商快照 `DESIGN.md` 只读；实现偏离与增补记录在 `docs/designs/fast/ADAPTATION.md`。
> 最近全流程验证：2026-10-10（v0.4.0 动效全流程）；v0.5.0–0.5.1 菜单改动的全站回归已复核本页；2026-10-11 文档治理迁移，无页面代码改动；2026-10-11 v0.5.3 链接标记按配置化的聚焦回归已复核本页。

## 构建与产物

- `npm run build` 7 页绿（`astro check` 0 错误 / 0 警告 / 0 提示）；注册表校验通过。
- CSS 隔离成立：本页恰 1 条自身样式链接；`.fs-*` 选择器只出现在自身 CSS；根页 / 切换页 / 404 不链接任何设计 CSS。
- `BASE_PATH=/demo` 全链路前缀正确；`rel="preload"` 计数 0；无外链资源（`src="http` = 0）。
- 图标（不含共享菜单 chrome）：hero 按钮 4 枚（品牌 mark ×2 / Mail ×2）+ 项目卡外链箭头 ×2，全部 `aria-hidden`；未配置 icon 的链接不打标（2026-10-11 修订，Globe 残留 0）；行内图标显式 `inline-block`（Preflight 兼容，记入 `AGENTS.md` 已知坑）。

## 结构、内容与 a11y

- 核心字段 `name` / `headline` / `bio` / `links` 全部渲染；扩展区块取舍见 `DESIGN.md` Project Contract。
- 结构：hero 操作按钮行 → 3 列卡片网格（桌面）→ 经历行 → 页脚；标题层级 `h1 → h2 → h3` 无跳级。
- 语义 token + `light-dark()` 双主题：亮色底实测 `rgb(250,250,250)` ↔ 暗色底 `rgb(31,31,31)`；6px 圆角、3 列网格符合 token。
- 链接列表面（hero 按钮）按配置逐条标记（5/5 渲染；未配置 / 未映射不打标）；可访问名干净（实测 `GitHub` / `Email` / `博客`）。

## 对比度（最近实测）

- 亮色 **5.93:1** · 暗色 **9.75:1**（2026-10-10 v0.4.0 口径；更早轮次的 5.38 / 5.18 已过时）。
- 每次新增 / 调整色值必须实测并更新本表。

## 动效（Motion language「层次与触感」）

- 入场（纯 CSS）：hero 4 项复用 `--fast-duration-normal` / `--fast-curve-easy-ease`、30ms 错落（`translateY(8px)`）；零新增 token。
- 滚动显现：卡片 / 经历行错落（60 / 50ms）+ 各 `.fs-section` 整块；只播一次。
- 交互态：卡片 hover 面层 `#f5f5f5` + 描边 `#d1d1d1` + `translate: 0 -2px`（rest：`none` / `#ffffff` / `#e0e0e0`）；按钮 `:active` `scale(0.97)`（实测 `matrix(0.97, 0, 0, 0.97, 0, 0)`）；仅真悬停设备生效。
- 契约：跳转式滚动兜底后隐藏元素 **0**（3/3）；reduced-motion 全关；无 JS / 无 IO / 脚本抛错四情形隐藏元素均 **0**。

## 触控与移动端（375×812 + 触控仿真）

- `pointer: coarse` 生效；零横向溢出（`scrollWidth == innerWidth == 375`）。
- 命中高度实测 **44.2px**（`.fs-btn` 46.8px）；`@media (pointer: coarse)` 块：`.fs-btn` `padding-block: 0.8rem`、其余 0.78rem。
- 初始缺口复测记录：修复前实测 35.6 / 19.3 / 21.6px → 修复后 46.8 / 44.2 / 46.5px。

## 检测器（impeccable）

- 最近状态：**零发现**（无例外）。

## 已定事项与历史修复要点（结论保留；过程与中间快照见 Git）

- 触控命中增强：本页曾为唯一遗漏触控配置的设计（`design-page-verify` 首次全流程演练暴露），已补 `@media (pointer: coarse)` 块并复测通过。
- 行内 svg 折行修复：卡片外链箭头因 Preflight `svg { display: block }` 折行 → 显式 `inline-block`。
- 切换入口历史：v0.5.0 起页脚无切换入口，改由共享桌面右键菜单承担（ADR 0004）。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎、横屏、200% 缩放未实测；触控与降级基于 Chromium 仿真。
- 截图归档：`C:\Users\lovelive\.trae-cn\trae-browser-screenshots\`（`verify-v040-fast-*`、`verify-fast-actions/-card.png`、`verify-051-fast-menu.png`、`verify-053-fast-links.jpg` 等；为验证机器本地路径，未随仓库分发）。