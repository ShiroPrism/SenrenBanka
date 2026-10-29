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

### Design Rendering

**Design render mode（设计渲染模式）**:
由 `design.json` 显式声明、决定必需交付物与允许浏览器资源的契约：`styled` 遵循标准设计管线，`html-only` 禁止自定义 CSS/JS 与共享交互 chrome。
_Avoid_: 主题类型、模板模式、render flag

**Styled design（常规设计）**:
页面可加载自身 CSS、使用已注册字体与动效，并接入共享操作菜单的设计。
_Avoid_: 普通主题、CSS 主题

**HTML-only design（原生 HTML 设计）**:
最终页面只含语义化 HTML 与获准的 metadata 链接，不加载样式表、内联样式、脚本、字体资源或共享操作菜单的设计。
_Avoid_: 无样式页面、裸 HTML、零前端设计

**Native HTML navigation（原生 HTML 导航）**:
HTML-only 设计用于替代共享操作菜单的普通链接集合：页内区段、同主题的其他语言，以及手动切换开启时的设计切换页。
_Avoid_: 菜单回退、自建 Context Menu

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
站点提供语言切换的全部可达路径。v0.10.0 起收敛为共享操作菜单内的语言分组（桌面二级菜单 / 移动端平铺），切换语言时保持当前页面上下文（同一主题 / 同一切换页 / 对应入口）；与主题切换相互独立，不受 `manualSwitch` 影响。
_Avoid_: 语言菜单、多语言选择器、右键菜单（会指向入口本身）

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

### Fonts

**Local font library（本地字体库）**:
本机个人字体集合，经 `.local-fonts/library/` 目录联接提供唯一入口；只用于字体发现与预览，不是生产依赖，也不是站点静态资源。
_Avoid_: 字体库（不指明"本地"时与生产字体管线混淆）、系统字体目录

**Font catalog（字体清单）**:
扫描本地字体库生成的机器可读清单（文件哈希、完整 cmap 级字符覆盖、可变轴、内嵌许可线索）；仅存于 `.local-fonts/`，不入库、不进构建。
_Avoid_: 字体索引、字体数据库

**Specimen（字体样张）**:
用真实字体文件渲染的本地对照预览（标题 / 正文 / 按钮 / 数字 / 字重与可变轴 / 缺字回退），是字体选型目检的依据；不是站点页面，不进入构建产物。
_Avoid_: 预览页、字体 demo

**License gate（许可闸门）**:
字体进入生产字体管线前的合规判据——必须确认允许网站嵌入与再分发；内嵌许可字段与嵌入许可位只作线索，未核实者只能停留在本地候选。
_Avoid_: 许可检查、版权确认（口语）

### Switching & Chrome

**Project chrome（项目 chrome）**:
不属于任何一套设计视觉系统的共享基础设施 UI——`/designs/` 切换页与共享操作菜单（含其移动端形态与悬浮球）；中性外观、随系统明暗，不模仿也不受各设计规范约束。
_Avoid_: 公共组件、通用 UI、infra 样式

**Action menu（共享操作菜单）**:
全站唯一的页面级操作入口，在所有有实际交互意义的页面上出现，承担页面操作、主题切换与语言切换。其**数据、文案、动作处理与状态语义在所有输入环境间完全共享**，只有容器形态与语言项的呈现方式随输入环境分叉。
_Avoid_: 右键菜单（只指其中一种触发方式）、Command palette、更多菜单

**Menu trigger（菜单触发方式）**:
打开共享操作菜单的输入路径，与菜单本身解耦。桌面为非交互区域右键 / `Shift+F10`；移动端为悬浮球点击；同一环境内并存两种触发时各自按输入能力门控，互不干扰。
_Avoid_: 入口（语义过泛）、唤起方式

**Launcher（悬浮球）**:
仅在具备触控能力的环境（`(any-pointer: coarse)`）显示的固定圆形按钮，是移动端打开共享操作菜单的触发方式；属项目 chrome，不模仿任何主题的视觉语言。
_Avoid_: FAB、浮动按钮、汉堡按钮、移动端菜单

**Page context（页面上下文）**:
描述当前页面在站点中的角色，取值为 `design` / `switcher` / `not-found` / `entry` 四种。它决定菜单身份条是否渲染、随机主题是否排除当前、进入切换页的动作是否隐藏，以及语言项的目标 URL。菜单配置据此派生，不假设每页都存在"当前主题"。
_Avoid_: 页面类型、路由类型、页面模式

**Context menu（快捷操作菜单）**:
共享操作菜单在桌面鼠标环境（`(hover: hover) and (any-pointer: fine)`）非交互区域右键 / `Shift+F10` 打开时的形态：贴近点击点定位、二级子菜单、语言项收在子菜单内。v0.5.0 起引入，v0.10.0 起被 `Action menu` 统摄。
_Avoid_: 右键菜单（口语，掩盖了它只是形态之一）、切设计弹窗

**Toast（状态提示）**:
菜单操作结果的短暂浮层提示（复制 / 分享的成功、取消、失败），`role="status"`，自动消失；不是需要用户确认的对话框。
_Avoid_: 通知、弹窗、alert、snackbar

### Documentation Governance

**Rule entry（规则入口）**:
仓库根 `AGENTS.md`，每次编码会话自动加载；只承载不可延迟加载的硬门禁与任务路由，不是完整规则正文。
_Avoid_: 规则全文、主规则文件

**Rule body（规则正文）**:
`docs/rules/*.md` 中按主题维护的完整可执行规则；项目级规则的唯一完整正文来源。
_Avoid_: 规则摘要、规则副本

**Rule index（规则索引）**:
`docs/rules/README.md`，列出主题文件、读取时机与维护边界；只做指针，不复制正文。
_Avoid_: 规则目录页、文档目录
