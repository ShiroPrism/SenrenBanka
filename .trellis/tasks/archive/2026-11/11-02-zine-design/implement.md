# Zine — 执行计划

## 0. 前置

- [ ] `task.py current` 指向 `11-02-zine-design`。
- [ ] 读 `AGENTS.md`、设计契约、视觉语言、无障碍、pitfalls。
- [ ] 确认 `src/designs/zine` 不存在；记录 dist 基线。

## 1. 规范先行

- [ ] 写 `DESIGN.md`：色板实测、字体六项、版式、组件、动效、响应式、无障碍、内容映射、Do/Don't、验证。
- [ ] 写 `design.json`：5 locale、`source: self-produced`、`accent: "#ff3b5c"`。
- [ ] 字体：League Gothic / Inter / Courier Prime / CJK 核心；非 zh-TW 注册 Gothic A1；zh-TW 重映射 Noto Sans TC。

## 2. 实现

- [ ] `tokens.css`：`:is(.zine, .zine-pv)`；禁止 `:root`。
- [ ] `style.css`：纸/复印纹理、masthead、manifesto、classifieds、spreads、notes、stamps、coupon、页脚；错位用伪元素/text-shadow。
- [ ] `Page.astro`：`loadDesignView('zine')`；`HeadMeta` / `Font` / `Reveal` / `ContextMenu`；5 语言 `messages`；条件区块。
- [ ] `Preview.astro`：自包含 16/10；不 import `style.css`；无可聚焦元素。
- [ ] 荧光红/粉只做装饰/大字；正文 ink；不做无限 marquee/闪烁。

## 3. 验证

- [ ] `npm run build`；5 语言页面可达。
- [ ] 1440 / 768 / 375；无横向溢出；触控 ≥44px。
- [ ] 荧光色对比、错位可读性、纹理疲劳、窄屏重排。
- [ ] Reveal 滚动/直接跳底；减动态/无 JS/无 IO/IO 抛错。
- [ ] 共享菜单 5 语言、关闭路径、滚动锁。
- [ ] 检测器 `[]`；对比度达标；更新 `docs/verification/zine.md`。

## 4. 回滚

- [ ] 删除 `src/designs/zine/` 与验证记录。
