# Sticker Diary — 技术设计

## DOM and Data

- `loadDesignView('sticker-diary', Astro.url.pathname)`；完整文档、原样 HeadMeta、末尾 ContextMenu。
- `data-sd-root` 包含书签导航与多个 `data-sd-spread` 区块；默认 CSS 不隐藏任何 spread。
- 每个 spread 使用语义 `section` 和可见标题；首页含 identity，后续映射 links / projects / experience / skills / contact。

## Progressive Enhancement

- `script.ts` 初始化成功后给根节点加 `data-sd-ready`；仅在该状态下隐藏非当前 spread。
- 书签使用真实锚点与 `aria-controls`；脚本拦截后切换 `hidden`、`aria-expanded`/`aria-current`，无 JS 时锚点直接跳转。
- 上一页/下一页使用原生 `button`；方向键仅在根节点包含焦点或页面已处于日记导航时生效，不劫持表单/链接。
- 捕获异常时移除 ready 状态并完全显示所有 spread。

## Visual System

- `.sd` / `sd-*`；桌面 ring binder + two-page composition，移动端按跨页顺序成单列纸页。
- 纸张纹理由渐变/重复背景与 SVG 组成；胶带只作边缘/转角连接，不覆盖文字；错位不超过可读边界。
- `tokens.css` 使用 `:is(.sd, .sd-pv)`；字体在 `@theme inline`。

## Typography and Motion

- UglyTypist 只用于拉丁标题/批注；LXGW 只用于中日文手写声部；Inter 承担长正文。
- 翻页只动 `opacity` / `transform`，约 240–320ms；减动态立即切换。
- 不无限循环；滚动显现若使用 Reveal 必须遵守门控契约。

## Preview

- 两页错位纸面、一条胶带、两个凸出书签和手写姓名线；不可出现按钮或真实翻页。
- 导出 `--font-uglytypist`、`--font-lxgw`、`--font-inter`；不 import 正式 CSS。
