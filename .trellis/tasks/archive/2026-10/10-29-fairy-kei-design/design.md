# Fairy Kei — 技术设计

## Page and Data

- `Page.astro` 使用 `loadDesignView('fairy-kei', Astro.url.pathname)`，完整文档、`view.head.lang`、`<HeadMeta {...view.head} />` 和末尾无条件 `<ContextMenu>`。
- DOM 顺序：identity header → links charm rail → bio packaging card → projects toy boxes → experience ribbon → skills sticker sheet → contact note → footer。
- 每个 section 由可见标题和 `aria-labelledby` 命名；头像存在时放入中央展示窗，不存在时保留完整姓名/标签构图。

## Visual System

- 根类 `.fk`，子类 `fk-*`；桌面十二列不对称舞台，中央大展窗，左右轨道和下方陈列区。
- CSS 几何：盒体分层、包装卡切角、悬挂链、贴纸圆角、硬边框与局部软影；糖果色仅作构图色块，不铺成单一粉底。
- `tokens.css` 仅放调色板，作用域 `:is(.fk, .fk-pv)`；字体在 `style.css` 的 `@theme inline`。

## Typography

- Display：`--font-fredoka` → `--font-lxgw` → system CJK。
- Body：`--font-inter` → `--font-lxgw` → PingFang/YaHei → sans-serif。
- 小标签可用大写/字距，但不得用 Emoji 补足层级。

## Motion

- 纯 CSS 一次性入场：盒盖打开、标签错落、饰品轻微回弹；总落定 ≤0.8s。
- hover/焦点只做小角度摆动和按压回弹，不无限循环；`prefers-reduced-motion: reduce` 时全部静态。
- 可选区块可使用共享 `<Reveal />`，隐藏态只允许由 `html[data-reveal-ready]` 门控。

## Responsive and A11y

- `<=64rem` 收为两区陈列；`<=48rem` 单列，所有轨道和盒子按 DOM 顺序重排。禁止页面横向滚动。
- 链接与 `summary` 目标 ≥44px；键盘焦点使用双层可见轮廓；装饰链、贴纸和包装线 `aria-hidden`。

## Preview

- 自包含收藏盒缩略：开盖盒体、彩色标签、一个姓名条和两个饰品点。
- 导出 `fonts: ['--font-fredoka', '--font-lxgw', '--font-inter']`；不 import 正式 CSS、无 `<Font>`、无动画、无可聚焦元素。
