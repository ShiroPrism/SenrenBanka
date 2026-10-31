# Little Forest — 技术设计

## Page Architecture

- `loadDesignView('little-forest', Astro.url.pathname)`；HeadMeta 原样、ContextMenu 末尾无条件接入。
- 根类 `.lf`；入口 header → 小径容器 → links 路标 → projects 地点 → experience 树轮 → skills 标本 → contact 小屋 → footer。
- 桌面用 CSS grid 跨列和错位节点形成 S 路径；移动端取消偏移，仅保留线性路径线。

## Visual System

- 奶油白/苔藓绿/木棕/浅黄/少量粉紫；水彩晕染由多层 radial/conic gradient 做成，边缘用 SVG 彩铅线。
- 不使用胶带、贴纸或卡片网格；每个区块是场景节点，不是统一卡片。
- `tokens.css` 使用 `:is(.lf, .lf-pv)`；字体在 `style.css`。

## Typography and Content

- Display：Fraunces → LXGW → Songti/SimSun → serif。
- Body：系统 Georgia（拉丁）→ LXGW（中日文）→ Songti/SimSun → serif；不再增加 Inter，保持安静的书页声部并避免为正文新增字体请求。
- 头像以观察卡呈现；若缺失，使用植物标本卡而非空白占位。

## Motion and A11y

- 可使用共享 `<Reveal />` 做路径节点一次性显现；CSS 动画只用 opacity/transform，叶片摆动不无限循环。
- 减动态/无 JS/无 IO/脚本失败时所有内容与路径终态可见。
- 每段路径节点有可访问名称；纯装饰蘑菇、叶子、路径线 `aria-hidden`。

## Preview

- 16/10 奶油纸面、弯曲小径、入口木牌和 3 个自然节点；导出 `--font-fraunces`、`--font-lxgw`。
- 不用整页 CSS、无 `<Font>`、无动画、无可聚焦元素。
