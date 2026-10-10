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

**Typing cascade（打字级联）**:
以逐字符 opacity 离散步进模拟"正在输入"的效果；仅用于终端的命令与装饰行（≤18 字符），不做宽度动画、不延迟正文。
_Avoid_: typewriter、逐字打印

**Print cascade（落屏级联）**:
终端输出行 / 列表项按内联 `--d` 延迟依次出现的一次性级联，复用共享 Reveal 触发，只播一次。
_Avoid_: 逐行打印、打字机效果

**Rule draw（发丝线绘制）**:
editorial 的发丝线以 `transform: scaleX` 从左向右展开的效果，只播一次。
_Avoid_: 边框动画、line animation

**Scroll progress（滚动进度）**:
oxide 顶部的 2px 进度线，由 CSS Scroll-Driven Animations（`animation-timeline: scroll()`）驱动，零 JS；不支持或减动态时隐藏。
_Avoid_: 进度条动画、progress bar

### Icons & Marks

**Brand mark（品牌标志）**:
第三方平台的品牌图形（如 GitHub octocat），作为链接的识别标记；数据来自 simple-icons（CC0），以本地 SVG vendored 于 `src/assets/brand/`，构建期内联、单色（`currentColor`）。
_Avoid_: brand icon、logo 图标、social icon

**Functional icon（功能图标）**:
不指向特定品牌的通用界面图形（如信封、地球、外链箭头）；全项目唯一来源是 `@lucide/astro`（stroke 风格、构建期内联、零客户端 JS），与品牌标志分开处理。
_Avoid_: UI icon、界面图标

**Icon fallback（图标回退）**:
`links[].icon` 缺省或 slug 未被某设计映射时，该链接渲染所属设计的通用功能图标（如 Globe）——链接列表面 100% 标记、不留裸链接（2026-10-10 依「要么不用，要么全用」修订）。
_Avoid_: 缺失图标、装饰降级、纯文本回退
