# 动效机制：入场用纯 CSS、滚动显现用共享 IntersectionObserver，可见性交给门控

## 背景与决定

要为四套设计加入页面进入动画与滚动进入视口动画，同时必须满足规范隔离与降级要求（无 JavaScript / 脚本失败 / 不支持 `IntersectionObserver` / `prefers-reduced-motion: reduce` 时内容始终可见）。决定：

1. **只让规范授权的设计动起来。** `oxide`（厂商规范已有 Motion 章节，明确鼓励入场动效）与 `fast`（厂商规范提供 duration / curve token）采用动效；`editorial`（自产规范限定"唯一动效是下划线过渡"）与 `terminal`（自产规范限定"光标是唯一动效"）保持静止，不加载任何动效脚本。
2. **两种动效分离。** 首屏**入场动画** = 各设计私有纯 CSS `@keyframes`（无 JS 依赖）；滚动**显现** = `src/lib/reveal.ts` 的共享 `IntersectionObserver`，只负责触发、不规定视觉。
3. **门控，而非默认隐藏。** 内容默认可见；仅当内联 boot 判定「非 reduced-motion 且支持 `IntersectionObserver`」时，才给 `<html>` 打 `data-reveal-ready`，各设计 CSS 的隐藏态以该属性为唯一门控。于是无 JS / 无 IO / 减动态三种情形下内容都不会被隐藏。脚本失败（模块未执行或构造抛错）由「内联计时安全网 + 模块 try/catch」兜底：撤销门控并全部揭示。
   另有一处滚动兜底：跳转式滚动（锚点 / 刷新恢复位置 / End 键）会让元素"从视口下方直接跳到上方"，不跨越 IO 阈值、不产生通知，故在滚动时补揭示已到达视口的目标，避免永久隐藏。
4. **共享脚本不 import 任何 CSS**，避免触发已知的"多设计 CSS 聚合"陷阱（SPEC §3.2）。

## 被否决的选项

- **用 `@media (scripting: enabled)` 隐藏**：脚本启用但加载失败时内容会被永久隐藏，违反降级契约。
- **把隐藏态写进各设计 CSS 的默认分支**：同样会在无 JS 时永久隐藏内容。
- **只用 CSS `animation-timeline: view()` 做滚动触发**：浏览器支持不足、降级语义不可控，且与"用原生 IntersectionObserver"的项目决定冲突。
- **改厂商 `DESIGN.md` 补 Motion 章节**：SPEC §18 规定厂商规范为不可修改的原始快照。

## 后果

- `oxide` / `fast` 的动效参数由各自 `style.css` 维护；`editorial` / `terminal` 不加载任何动效脚本。
- 相关决策与实测记录写入 `SPEC §18` 与 `change-log/0.2.0.md`；厂商 `DESIGN.md` 不改动。
