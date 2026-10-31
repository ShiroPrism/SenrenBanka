# Cute-alism — 技术设计

## Architecture

- `loadDesignView('cute-alism', Astro.url.pathname)`；完整文档、原样 HeadMeta、末尾 ContextMenu。
- 根类 `.cal`；header 姓名/headline → bio 色块 → links 标签轨 → projects 拼贴网格 → experience 阶梯 → skills 徽章 → contact 背标。
- 使用语义 header/main/section/footer 与 DOM 顺序；视觉位置不得倒置阅读顺序。

## Visual System

- 设计 token：黑/白/糖果红/柠檬黄/薄荷绿/天蓝/亮粉；文字对比由实际底色配对决定。
- 粗边框 3–6px，硬阴影固定偏移，圆角控制在切角/胶囊两类；禁止 blur、半透明玻璃、柔和渐变。
- `.cal` / `cal-*`；`tokens.css` 用 `:is(.cal, .cal-pv)`；字体在 `style.css`。

## Typography and Components

- Display：Fredoka → LXGW → system heavy sans；正文 Inter → LXGW；微标签 League Mono。
- 链接为可识别标签条，hover/focus/pressed 使用固定位移和黑白焦点环；不可仅靠颜色区分状态。

## Motion and Responsive

- 入场为 80–180ms 的几何 snap/错位落位；交互位移 1–2px，禁止统一淡入。
- 可用共享 Reveal，但各分区节奏须有差异；减动态/无 JS 全静态。
- `<=64rem` 两列，`<=48rem` 单列；大字号用 `clamp` 防止溢出，不可保留桌面绝对偏移。

## Preview

- 自包含姓名色块、两个几何贴纸、链接标签条和联系方式符号。
- 导出 `--font-fredoka`, `--font-lxgw`, `--font-inter`, `--font-league-mono`；不 import 正式 CSS。
