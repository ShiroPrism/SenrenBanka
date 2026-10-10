# SenrenBanka

多设计个人主页生成器：一份个人资料（`profile.yaml`）由多套互相独立的 `DESIGN.md` 规范生成多个静态设计页；本文件只收录本项目特有的领域术语，不含实现细节。

## Language

### Motion

**Entrance animation（入场动画）**:
首屏元素在页面加载时一次性出现的动效，由各设计私有的纯 CSS `@keyframes` 实现，不依赖 JavaScript。
_Avoid_: 首屏动画、load animation

**Reveal（滚动显现）**:
元素滚入视口时一次性出现的动效，由共享的 `IntersectionObserver` 机制（`src/lib/reveal.ts`）触发。
_Avoid_: scroll animation、scroll-triggered animation、viewport animation

**Reveal gate（显现门控）**:
`<html data-reveal-ready>` 属性——由内联 boot 在「非 reduced-motion 且支持 IntersectionObserver」时同步写入，是各设计 CSS 隐藏态的唯一开关；门控未成立时内容始终可见。
_Avoid_: js class、no-js class、hydrated
