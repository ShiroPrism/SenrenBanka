# fast — 项目侧适配记录（ADAPTATION）

> `src/designs/fast/DESIGN.md` 为厂商官方快照（[microsoft/fast](https://github.com/microsoft/fast)，MIT；许可声明见同目录 `SOURCE-LICENSE.txt`），**只读、不得修改**。
> 本文件记录项目实现相对快照的适配与增补；当前验证状态见 `docs/verification/fast.md`；归属规则见 `docs/README.md`。

## 动效（复用快照 token，零新增）

- 入场动画（hero 4 项，复用 `--fast-duration-normal` / `--fast-curve-easy-ease`，30ms 错落）+ 共享滚动显现（卡片 / 经历行 60 / 50ms 错落）——机制见 ADR 0001 / 0003。
- 交互态：卡片 hover（面层 + 描边 + `translate: 0 -2px`）、按钮 `:active` `scale(0.97)`、页脚链接 hover——仅 `(hover: hover) and (pointer: fine)` 生效。

## 图标（ADR 0002）

- hero 按钮前置图标（品牌 mark / Mail；无 icon 配置不打标——2026-10-11 修订）+ 项目卡外链箭头；行内 svg 显式 `inline-block`（Preflight 兼容，坑已记入 `AGENTS.md` 已知坑）。

## 触控增补（快照未规定）

- `@media (pointer: coarse)`：`.fs-btn` `padding-block: 0.8rem`、其余 0.78rem（实测 46.8 / 44.2px）。

## 检测器

- 零发现（无例外）。

## 切换页预览碎片（`Preview.astro`，2026-10-18）

快照未规定切换页预览。本套按 `AGENTS.md`「每套设计必须满足 · 可选 · 切换页预览碎片」新增自包含碎片：

- **形态**：企业级 hero（wordmark + 分隔线 → eyebrow → 大标题 → 品牌蓝实心按钮 + 描边按钮）+ 三列卡片网格（6px 圆角 + 1px 描边），保留 FAST 最可辨识的控件与分区语言。
- **令牌抽取**：调色板自 `.fs` 规则体内迁出到同目录 `tokens.css`，作用域为命名空间类 `:is(.fs, .fs-pv)`——快照的 token 命名（`category-subcategory-slot-variant-state`）与量值不变，仅改变**声明位置与作用域**。`light-dark()` 依赖的 `color-scheme` 由两个宿主各自声明。
- **零字体成本**：碎片导出 `fonts: []`，全部走系统字体栈；切换页不为本套声明任何 `@font-face`。
- **等价重构**：正式页产物与改动前逐字节一致（见 `docs/verification/fast.md`）。
- **`@source not "./Preview.astro"`**：本套 `style.css` 的 `@source "./"` 曾连带扫描预览文件，把其属性文本当工具类注进**正式页** CSS（约 +1.3KB/页）；已按 `AGENTS.md` 已知坑排除。
- **检测器**：预览未新增发现——快照 `DESIGN.md` 无 `typography` frontmatter 阶梯，检测器不对其判 `design-system-*`；快照**只读**，故本套无 `DESIGN.md` 改动。

## 语言切换入口适配（v0.9.0 · 2026-10-12）

官方规范未定义语言切换入口。v0.9.0 起语言切换入口并入共享操作菜单的语言分组（`.cm-lang`），v0.10.0 起桌面二级子菜单与移动端平铺两种形态都可达（ADR 0007），本设计**不渲染**可见语言切换器，其 `style.css` 中亦无语言切换样式——语言项属项目 chrome 的中性外观，不模仿本设计视觉语言。

## 未测 / 限制

- 同 `docs/verification/fast.md`；快照原文见同目录 `DESIGN.md`（只读，不随项目适配改写）。
