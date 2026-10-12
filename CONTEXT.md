# SenrenBanka

多设计个人主页生成器：一份个人资料（按语言分文件维护于 `src/data/profiles/`）由多套互相独立的 `DESIGN.md` 规范生成多个静态设计页；本文件只收录本项目特有的领域术语，不含实现细节。

## Language

### Design Sources

**Source form（来源形态）**:
一套设计的规范与上游的关系方式——厂商快照 / 规范整合 / 视觉复刻 / 自产，与 `design.json` 的 `source.type` 四值一一对应。
_Avoid_: 来源类型、source 字段

**Vendor snapshot（厂商快照）**:
厂商官方**单份** `DESIGN.md` 的逐字快照（`source.type: official-vendor`）；入库后只读、此后不依赖上游，适配偏差记入该主题 `ADAPTATION.md`。
_Avoid_: 官方文档、下载的规范

**Design compilation（规范整合）**:
从厂商官方**开放文档**（多文件 / 网站）遴选整合而成的一份规范（`source.type: official-docs-derived`）；自有行文组织、文末附逐节来源与许可，**整合完成即冻结**——不是逐字快照。
_Avoid_: 文档汇总、二手整理、摘抄

**Design reinterpretation（视觉复刻）**:
仅借鉴目标设计系统的视觉语言、规范完全自撰的设计（`source.type: third-party-analysis`）；不移植上游文本与素材，标注"非官方"，命名不含厂商商标。
_Avoid_: 仿制、克隆、致敬版

### Localization

**Locale（语言）**:
站点支持的一种语言，由 `site.config.yaml` 的 `i18n.locales` 唯一声明；每种语言同时决定 URL 前缀、资料文件、HTML `lang`、文案字典与 SEO 元数据。
_Avoid_: 语言包、lang、语系

**Locale code（语言代码）**:
语言的 BCP 47 标准标识（如 `zh-CN`），用作 HTML `lang` 与翻译字典键；与 URL 前缀是两件事。
_Avoid_: locale（指代代码本身时）、lang

**Locale path（语言路径）**:
语言在 URL 中的前缀，同时是资料文件名（`src/data/profiles/<path>.yaml`）；要求唯一且合法。
_Avoid_: lang、slug

**Language self-name（语言自称）**:
语言选择器中展示该语言的名字，由各语言自己书写（简体中文 / 日本語 / English），不使用英文名或其他语言名。
_Avoid_: 语言英文名、显示名

**Localized profile（本地化资料）**:
某语言下的人物资料文件；三种语言共用同一套字段契约，不为语言拆分 schema。
_Avoid_: 翻译文件、多语言副本

**Shared messages（共享文案）**:
项目 chrome 与基础设施页（右键菜单、切换页、入口页、404、语言选择器）的用户可见文案，集中在 `src/i18n/messages.ts`；与各设计自己的 `messages.ts` 相对。
_Avoid_: 全局文案、i18n 字典

**Design messages（主题文案）**:
某套设计自身界面的用户可见文案，位于 `src/designs/<id>/messages.ts`，按该设计的视觉语言撰写，不与其他设计统一表述。
_Avoid_: 主题翻译、设计字典

**Language switcher（语言切换入口）**:
每套设计页可见的静态链接组，切换语言时保持当前主题不变；与主题切换入口相互独立，不受 `manualSwitch` 影响。
_Avoid_: 语言菜单、多语言选择器

**Untranslatable string（不翻译文案）**:
承担设计意图而非信息传达的文本（命令、ASCII 装饰、刻意的双语标识、专有名词、法律署名），按各设计 `messages.ts` 的说明保持原样。
_Avoid_: 硬编码文案（该词含贬义，此处是主动决策）

### Motion

**Motion language（动效语言）**:
每套设计在 `DESIGN.md` Motion 章节中定义的动效表达集合（形态 / 节奏 / 参数；含入场、显现、持续与交互过渡）；共享机制只提供触发与兜底，不统一各设计的动效风格。
_Avoid_: 动画系统、动效规范、全局动画配置

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

**Link mark（链接标记）**:
由 `links[].icon` 映射驱动的链接标识（品牌 mark / 功能图标）；仅当 slug 存在映射时才渲染，未配置 / 未映射不渲染任何标记（2026-10-11 修订：按配置逐条标记，旧「Globe 回退 / 100% 标记」被否决）。
_Avoid_: icon fallback、默认图标、纯文本回退

### Assets

**Visual asset（视觉素材）**:
设计中使用的图片、自定义光标等非图标类视觉素材；入库于该设计的 `assets/` 并记录 provenance，区别于功能图标 / 品牌标志，也区别于由数据层统一解析的 profile 头像。
_Avoid_: 图片资源、素材库、装饰资源

### Switching & Chrome

**Project chrome（项目 chrome）**:
不属于任何一套设计视觉系统的共享基础设施 UI——`/designs/` 切换页与桌面右键快捷操作菜单；中性外观、随系统明暗，不模仿也不受各设计规范约束。
_Avoid_: 公共组件、通用 UI、infra 样式

**Context menu（快捷操作菜单）**:
桌面鼠标环境（`(hover: hover) and (pointer: fine)`）在非交互区域右键 / `Shift+F10` 打开的共享菜单，承担页面操作与设计切换；是 v0.5.0 起的唯一页内切换入口，触屏设备不提供。
_Avoid_: 右键菜单（口语）、右键入口、切设计弹窗

**Toast（状态提示）**:
菜单操作结果的短暂浮层提示（复制 / 分享的成功、取消、失败），`role="status"`，自动消失；不是需要用户确认的对话框。
_Avoid_: 通知、弹窗、alert、snackbar
