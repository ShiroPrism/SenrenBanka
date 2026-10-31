# Pixel Pet RPG — 技术设计

## Architecture

- `loadDesignView('pixel-pet-rpg', Astro.url.pathname)`；完整文档、HeadMeta、末尾 ContextMenu。
- 根节点 `data-pxt-root`；HUD、地图、地点面板和完整资料区块。
- 地图节点为 `<a href="#pxt-...">`，无 JS 时自然跳到可见 section。
- `script.ts` 初始化成功后设置 `data-pxt-ready`；点击/键盘激活节点时切换 active panel 和玩家位置，非 active 面板用 `hidden` 隐藏。

## Content Mapping

- `identity`: name / headline / avatar / location / bio。
- `links`: item inventory with real outbound links.
- `projects`: destination map nodes.
- `experience`: quest log.
- `skills`: tool/skill rack.
- `contact`: postbox / save point.
- 无数据区块不渲染；不得写“Lv.”、“HP”、“XP”、“100%”等虚假状态。

## Visual System

- `.pxt` / `pxt-*`；CSS pixel grid，所有边框、阴影和偏移落在 4px 基准。
- 地图由 CSS/内联 SVG 建筑、道路、树木、水池构成；玩家标记为独立装饰。
- 字体：Silkscreen HUD/labels；Ark Pixel CJK；Handjet 数字。禁用普通现代圆角卡片视觉。

## Interaction and Motion

- JS 预算：地图状态、焦点同步、玩家标记、hash/history 可选；不得实现游戏玩法。
- 只在用户交互时移动标记；离散 `steps()` 过渡，不使用平滑镜头或无限动画。
- 减动态时地点切换立即完成；脚本失败或异常时所有 panel 可见。

## Responsive and Preview

- 桌面 HUD + 地图 + 侧面板；`<=48rem` 地图收成 2×3 节点阵和单列完整资料。
- Preview 为 16/10 像素小镇切片、HUD 条与 3 个节点；导出 `--font-silkscreen`, `--font-ark-pixel`, `--font-handjet`。
