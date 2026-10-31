# receipt 当前实现与折叠双栏研究

## 现状证据

- `src/designs/receipt/Page.astro` 调用 `loadDesignStrips`，按 `i18n.locales` 渲染三份 `<Ticket>`。
- `src/designs/receipt/style.css` 在 `>=1024px` 把 `.rc-scene` 设为 `width:max-content` 的 flex 轨道，
  每份 `.rc-ticket` 固定 30rem；三份 480px 加间距后总宽超过 1440 视口，产生窗口横向滚动。
- `<1024px` 通过 `.rc-ticket:not(.is-primary) { display:none; }` 只保留当前语言。
- 当前视觉记录：`.local-fonts/dev/preview/trio-1440.png`、`trio-full-1800.png`、
  `trio-panned-right.png`、`trio-mobile.png`。
- `docs/verification/receipt.md` 当前仍记录三联、18 个 reveal 区块与横向平移断言；本次必须整体改写。

## 现可复用的机制

- 数据入口：`loadDesignView(id, pathname)` 只取当前语言，返回 `view.profile / view.locale / view.headMenu`。
- 字体：`<Font cssVariable="--font-cutive-mono|--font-ark-pixel|--font-dseg7" />` 已注册，无需改资产。
- 动效：`Reveal.astro` + `data-reveal`；隐藏态只在 `html[data-reveal-ready]` 下成立。
- 撕边：`Ticket.astro` 构建期生成 36 齿 polygon，作用在 `.rc-paper`；宽票只需让 polygon 随更宽纸张自适应。
- 共享菜单：`<ContextMenu config={view.contextMenu} />`，页面不需要感知语言切换 UI。

## 方案 B 的实现要点

1. 数据层改用 `loadDesignView`，保留 `loadDesignStrips` 供未来其他设计使用。
2. `Ticket.astro` 只渲染一份票据，正文五个 section 包进 `.rc-fold-body`。
3. 桌面 `.rc-fold-body` 使用 CSS 多栏（`column-count: 2`）或两列网格；优先选择能自动平衡
   `projects` / `experience` 长文本的机制。必须给 section 设置 `break-inside: avoid`，防止一条订单跨栏。
4. 纸张桌面宽度 `min(72rem, 100%)`，1420–1440 视口下左右留白约 8%–15%。
5. 顶部 `header`、`bio`、`footer` 在 `.rc-fold-body` 之外，横跨整张纸。
6. 折痕用 `column-rule` 或极细竖向压线；不得使用纸内阴影 / 卡片 / 圆角。
7. 移动端只移除多栏声明，保留现有单栏阅读顺序和 30rem 纸张宽度。

## 待实测的决策

- CSS 多栏是否在 Chromium 下按 section 平衡且不拆开 section；若不稳定，退化为显式两列 grid。
- 1024px 下英文长 URL / 订单描述是否可在 40–50ch 行宽内阅读。
- 双栏后 `[data-reveal]` 数量应从 18 降为 6；验证记录需按 6 个区块更新。
- 单份 `h1`、6 个 `h2`、id 不再需要语言后缀冲突规避，但保留后缀也无害，需保持唯一性。
