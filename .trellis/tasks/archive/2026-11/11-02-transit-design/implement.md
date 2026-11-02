# Transit — 执行计划

## 0. 前置

- [ ] `task.py current` 指向 `11-02-transit-design`。
- [ ] 读 `AGENTS.md`、设计契约、视觉语言、无障碍、pitfalls。
- [ ] 记录 dist 基线；确认 `src/designs/transit` 不存在。

## 1. 规范先行

- [ ] 写 `DESIGN.md`：色板实测、字体六项、版式、组件、动效、响应式、无障碍、内容映射、Do/Don't、验证。
- [ ] 写 `design.json`：5 locale、`source: self-produced`、`accent: "#0b7a5c"`。
- [ ] 字体：Inter / JetBrains Mono / CJK 核心；非 zh-TW 注册 Gothic A1；zh-TW 重映射 Noto Sans TC。

## 2. 实现

- [ ] `tokens.css`：`:is(.transit, .transit-pv)`；禁止 `:root`。
- [ ] `style.css`：纸/网格、网络条、Hero 线路图、线路链接、站点卡、时刻表、徽章、售票处、页脚；线路展开用 `scaleX`。
- [ ] `Page.astro`：`loadDesignView('transit')`；`HeadMeta` / `Font` / `Reveal` / `ContextMenu`；5 语言 `messages`；条件区块。
- [ ] `Preview.astro`：自包含 16/10；不 import `style.css`；无可聚焦元素。
- [ ] 少量自绘内联 SVG / CSS 几何符号；不引图标库、不新增图片。

## 3. 验证

- [ ] `npm run build`；5 语言页面可达。
- [ ] 1440 / 768 / 375；无横向溢出；触控 ≥44px。
- [ ] 线路色不单独承载信息；黄色线不承载文字；窄屏纵向线路。
- [ ] Reveal 滚动/直接跳底；减动态/无 JS/无 IO/IO 抛错。
- [ ] 共享菜单 5 语言、关闭路径、滚动锁。
- [ ] 检测器 `[]`；对比度达标；更新 `docs/verification/transit.md`。

## 4. 回滚

- [ ] 删除 `src/designs/transit/` 与验证记录。
