# oxide — 项目侧适配记录（ADAPTATION）

> `src/designs/oxide/DESIGN.md` 为厂商官方快照（[oxidecomputer/design-system](https://github.com/oxidecomputer/design-system)，MPL-2.0；许可声明见同目录 `SOURCE-LICENSE.txt`），**只读、不得修改**。
> 本文件记录项目实现相对快照的适配、增补与例外；当前验证状态见 `docs/verification/oxide.md`；归属规则见 `docs/README.md`。

## 动效（快照 Motion 章节范围内）

- 入场动画（hero 4 项 260ms `ease-out` / 40ms 错落）+ 共享滚动显现（行 30ms、上限 5）——依据快照 "Motion explains a change"；机制见 ADR 0001。
- 顶部 2px 滚动进度线（CSS Scroll-Driven、`@supports` 门控、零 JS；装饰性，**不用于内容显隐**）——参数与压缩器合并坑见 `docs/verification/oxide.md` 与 `change-log/0.4.0.md`。
- ASCII 波形流动（32s linear；顶部与页脚同轨）——依据快照 "ASCII can drive motion" 与 "linear 用于恒定动效"。
- 链接 / 切换态 150ms ease 颜色过渡——依据快照 "plain ease for hover and color"。

## 图标（ADR 0002）

- CHANNELS：品牌 mark（filled、本地 vendored SVG）替换原 `▸`；功能图标 Mail 采用 lucide **outlined**、1.5 描边（无 icon 配置不打标，2026-10-11 修订）——快照 Icons 章节允许 outlined variants。
- `▸` 保留于列表面之外的原生 affordance（页脚联系）；全部装饰符 `aria-hidden`。

## a11y 增补（快照未覆盖）

- 六个分区 `aria-labelledby` 指向同区可见标签（hero / channels 两栏 / 两个 section / footer）；`.ox-columns` 由 `<section>` 降为布局 `<div>`、两栏升为具名 `<section>`（CSS 无需改动）。
- 装饰符（`●`、全部 `▸`）不得进入链接可访问名。

## 触控增补（快照未规定）

- `@media (pointer: coarse)`：`.ox-link` 等纵向 padding 0.95rem（命中 min 44.8px）；`.ox-row-title a` 的下划线在触控下改用同色 `text-decoration`。

## 修复（实现层，非规范层）

- 页脚 nowrap ASCII 波形横向溢出 → flex 子项 `min-width: 0` + 波形 `max-width: 100%`。
- 页脚小波形此前静态（仅顶部有流动轨道）→ 补 `.ox-wave-track`（v0.4.1），两处同轨（减动态均静止）。

## 检测器例外

- `codex-grid-background` advisory ×1：两轴网格底纹源自快照 "Visible grids" 原则，**有意保留**（2026-10-10 经项目所有者确认）；该信号同时作为检测器**有效性反证**目标。除此之外零发现（最近状态见 `docs/verification/oxide.md`）。

## 语言切换入口适配（v0.9.0 · 2026-10-12）

官方规范未定义语言切换入口。v0.9.0 起语言切换入口并入共享操作菜单的语言分组（`.cm-lang`），v0.10.0 起桌面二级子菜单与移动端平铺两种形态都可达（ADR 0007），本设计**不渲染**可见语言切换器，其 `style.css` 中亦无语言切换样式——语言项属项目 chrome 的中性外观，不模仿本设计视觉语言。

## 未测 / 限制

- 滚动进度线在 Firefox stable（2026-10 仍在 flag 后）按设计整条隐藏，未在该引擎实证；其余同 `docs/verification/oxide.md`。
- 快照原文见同目录 `DESIGN.md`（只读，不随项目适配改写）。