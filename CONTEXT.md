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

**Design batch（设计批次）**:
为同一次交付共同规划、但分别注册与验证的一组独立设计；批次只约束质量标准与协作边界，不构成共享视觉系统或运行时分类。
_Avoid_: 主题包、模板族、换色系列

**Registered design（注册设计）**:
`src/designs/<id>/` 目录存在、且四件套与 `design.json` 通过构建期校验的设计；注册不等于一定部署。
_Avoid_: 设计清单、可用设计

**Packaged design（打包设计）**:
当前部署实际构建的设计集合 = 全部注册设计 − `site.config.yaml` 的 `design.exclude`；被打包的设计生成页面与旧路径跳转。
_Avoid_: 启用设计、随机池

**Enabled design（启用设计）**:
打包集合中 `design.json.enabled` 为 true 的设计，进入随机池、切换页与语言入口；`enabled` 只在打包集合内生效。
_Avoid_: 打包设计、可用设计

**Packaging scope（打包范围）**:
由 `site.config.yaml` 的 `design.exclude` 声明的部署级设计排除名单；缺省为空 = 全部注册设计打包，不按 locale 拆分。
_Avoid_: 设计清单、白名单、主题包

**Default design（默认设计）**:
必须在所有 Locale 下可用、且属于打包 + 启用集合的那套设计，承担无 JavaScript 回退与 SEO 默认页职责；其他设计按 Design locale coverage 决定可用语言。
_Avoid_: 主主题、首选主题

**Native HTML navigation（原生 HTML 导航）**:
HTML-only 设计用于替代共享操作菜单的普通链接集合：页内区段、同主题的其他语言，以及手动切换开启时的设计切换页。
_Avoid_: 菜单回退、自建 Context Menu

### Localization

**Locale（语言）**:
站点支持的一种语言，由 `site.config.yaml` 的 `i18n.locales` 唯一声明；每种语言同时决定 URL 前缀、资料文件、HTML `lang`、文案字典、字体档位与 SEO 元数据。
_Avoid_: 语言包、lang、语系

**Site notice（站点声明）**:
`site.config.yaml` 的 `i18n.locales[].notice` 定义的可选单行纯文本声明，用于示例数据提示等站点级说明；缺省不渲染，不进入人物资料契约。
_Avoid_: 页脚固定文案、示例 profile 字段

**Locale typography profile（语言排版档位）**:
Locale 显式声明的文字系统与字符覆盖需求，用于选择核心字体角色并验证覆盖；不得从语言代码静默推断。
_Avoid_: 语系、脚本推断、字体语言

**Locale code（语言代码）**:
语言的 BCP 47 标准标识（如 `zh-CN`），用作 HTML `lang` 与翻译字典键；与 URL 前缀是两件事。
_Avoid_: locale（指代代码本身时）、lang

**Locale path（语言路径）**:
语言在 URL 中的前缀，同时是资料文件名（`src/data/profiles/<path>.yaml`）；要求唯一且合法。
_Avoid_: lang、slug

**Language self-name（语言自称）**:
语言选择器中展示该语言的名字，由各语言自己书写（简体中文 / 繁體中文 / 日本語 / English），不使用英文名或其他语言名。
_Avoid_: 语言英文名、显示名

**Localized profile（本地化资料）**:
某语言下的人物资料文件；五种语言共用同一套字段契约，不为语言拆分 schema。
_Avoid_: 翻译文件、多语言副本

**Shared messages（共享文案）**:
项目 chrome 与基础设施页（右键菜单、切换页、入口页、404、语言选择器）的用户可见文案，集中在 `src/i18n/messages.ts`；与各设计自己的 `messages.ts` 相对。
_Avoid_: 全局文案、i18n 字典

**Design messages（主题文案）**:
某套设计自身界面的用户可见文案，位于 `src/designs/<id>/messages.ts`，按该设计的视觉语言撰写，不与其他设计统一表述。主分区标准标签是共享契约，不属于设计文案（见 Standard section label）。
_Avoid_: 主题翻译、设计字典

**Language switcher（语言切换入口）**:
站点提供语言切换的全部可达路径。v0.10.0 起收敛为共享操作菜单内的语言分组（桌面二级菜单 / 移动端平铺），切换语言时保持当前页面上下文（同一主题 / 同一切换页 / 对应入口）；与主题切换相互独立，不受 `manualSwitch` 影响。
_Avoid_: 语言菜单、多语言选择器、右键菜单（会指向入口本身）

**Design locale coverage（设计语言覆盖）**:
某套设计承诺提供完整界面文案的一组 Locale；只描述文案与页面可达性，不描述字体呈现（后者见 Locale typography coverage）。未覆盖的 Locale 不提供该设计的页面，覆盖缺口必须显式可见，不得用其他语言的文案静默填充。
_Avoid_: 设计翻译进度、语言支持表

**Locale typography coverage（语言排版覆盖）**:
某套设计在某个 Locale 下用已部署的 webfont 接管该语言文字系统的承诺；与 Design locale coverage 是两个独立维度，字体缺口不得用系统回退静默顶替。`html-only` 因零字体契约豁免。
_Avoid_: 字体支持、字体覆盖（口语）、字体回退

**Untranslatable string（不翻译文案）**:
承担设计意图而非信息传达的文本（命令、ASCII 装饰、刻意的双语标识、专有名词、法律署名），按各设计 `messages.ts` 的说明保持原样。
_Avoid_: 硬编码文案（该词含贬义，此处是主动决策）

### Profile

**Profile contract（资料契约）**:
所有语言与设计共用的一套固定人物资料模型，规定核心字段、普通可选字段与有限的高级可选扩展区块；字段集合固定，不随设计、语言或使用者增减。
_Avoid_: 自由资料模型、通用资料库

**Core profile field（核心资料字段）**:
每份资料必须提供、每套设计必须呈现的 `name` / `headline` / `bio` / `links` 四个字段。
_Avoid_: 基础信息、普通字段

**Ordinary optional profile field（普通可选资料字段）**:
可由设计按视觉取舍省略的 `avatar` / `location`；二者不表达新的内容类型。
_Avoid_: 扩展字段、扩展区块

**Advanced optional profile block（高级可选扩展区块）**:
契约内固定命名的 `projects` / `experience` / `skills` / `contact`；四项全部可省略，仅为兼容既有设计而保留。它不是可新增字段或区块、可替换内容模型或可由使用者自行定义的扩展机制。
_Avoid_: 扩展字段库、自定义区块、插件区块

**User-defined profile content（用户自定义资料内容）**:
本项目明确不支持的资料形态：使用者自行声明字段或区块、采用任意内容模型，或依赖通用内容渲染兜底；不得把新的资料需求直接解释为该形态。
_Avoid_: 灵活资料、自由区块、通用 CMS

**Outbound profile link（站外资料出口）**:
核心字段 `links` 中指向站外页面或联系方式的目标，用于承载超出固定契约的更多个人信息；站点只呈现入口，目标内容的可用性、可访问性、归属与持久性受外部平台控制。
_Avoid_: 扩展资料源、外链字段

### Information Architecture

**Primary section（主分区）**:
设计页中对应资料契约固定语义的可见分区：简介 / 项目 / 经历 / 技能 / 联系 / 链接。分区标签属于信息架构，不属于主题文案；首次访问者必须无需解码主题即可识别。
_Avoid_: 模块标题、栏目名

**Standard section label（标准分区标签）**:
每个主分区在每个 Locale 下使用的固定 canonical 词；由所有设计共享的一份标签字典提供，不由各设计自行改写。英文标准词可用于双语标题，但必须来自同一 canonical 集合。
_Avoid_: 通用标题、默认文案

**Theme word（主题词）**:
某套设计为视觉母题撰写的分区替代表述；只能作为主分区标题之外的可见 kicker / 副标题或纯装饰，不得承担 heading 语义，也不得替换标准分区标签。
_Avoid_: 创意标题、主题命名

### Motion

**Motion language（动效语言）**:
每套设计在 `DESIGN.md` Motion 章节中定义的动效表达集合（形态 / 节奏 / 参数；含入场、显现、持续与交互过渡）；共享机制只提供触发与兜底，不统一各设计的动效风格。
_Avoid_: 动画系统、动效规范、全局动画配置

**Design-specific interaction（设计专属交互）**:
某套设计为实现自身隐喻而私有、允许使用少量客户端 JavaScript 的核心交互；它不是共享 chrome，也不得成为内容或真实链接可达性的前提。
_Avoid_: 主题脚本、全局交互运行时、效果 JS

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

**Font source（源字体）**:
字体上游发布的完整字体文件及其许可与版本信息，是重新裁字或分片的输入，不一定是浏览器最终加载的生产文件。
_Avoid_: 原料字体、原始字体（与其他视觉来源混淆）

**Production font asset（生产字体资产）**:
经过许可闸门与格式处理后，由站点构建实际消费的字体文件、CSS 和清单。
_Avoid_: 字体素材、字体附件

**Site subset（站内用字子集）**:
以当前仓库固定文本集合为输入裁出的**固定字形级**生产字体资产；它不是当前部署形态——固定子集要求源字体与重裁工具，内容变化后不会自动覆盖。当前每次构建按最终文本生成 Deployment subset set。
_Avoid_: 动态子集、全量字体

**CJK shard（CJK 分片）**:
按互不重叠的 `unicode-range` 从一套完整 CJK 字体预生成的生产字体资产，浏览器只获取当前页面文字命中的分片。
_Avoid_: 动态分片、按页字体

**Deployment shard set（部署分片集）**:
每次构建按最终产物文本从完整字体分片中选出的整分片集合；不修改字体字节，内容变化时随构建重新计算。当前主要用于非核心字体与回退路径；核心字体的部署形态见 Deployment subset set。
_Avoid_: 站内子集、字体裁剪发行版

**Deployment subset set（部署子集）**:
由 `fonts:subset` 在每次构建按最终产物文本从核心文字系统的源字体生成的字形子集；源字体、目录锁与分片集合保持完整，子集文件内容随构建文本变化。它只描述部署产物，不改变源字体的完整覆盖承诺。
_Avoid_: 站内子集、字体发行版、固定子集

**Core script font（核心文字系统字体）**:
承诺按源字体字形覆盖范围承接某一文字系统的字体角色；CJK 由 Zhuque、LXGW WenKai 与 Ark Pixel 承担，韩语按同一许可、分片与覆盖契约新增；繁体中文由 Noto Sans TC、Noto Serif TC、LXGW WenKai TC、Fusion Pixel TC 与 Noto Sans Mono CJK TC 承担，按页面级字体路由部署。新增字体需显式取得该角色。
_Avoid_: 中文字体、韩文字体、默认字体

**Core CJK font（核心 CJK 字体）**:
`Core script font` 在 CJK 文字系统下的角色集合；单个族只承诺其源字体实际覆盖的文字系统（Zhuque 只有汉字、LXGW 另含谚文），不得把 CJK 标签当作全文字系统覆盖承诺；繁体中文族只承诺繁体字形与相应 Han 覆盖，繁中页面通过 `html:lang(zh-TW)` 的变量重映射选择 TC 族；源码字体缺字时仍回退系统字体。
_Avoid_: 中文字体、默认中文字体、CJK 全字库

**Font coverage contract（字体覆盖契约）**:
核心 CJK 字体对源字体实际拥有的字符保持设计字体；源字体本身缺字时回退系统字体，其余展示字体只承诺其已发布子集。部署时核心字体使用当前构建生成的字形子集（Deployment subset set），非核心字体使用命中的整分片（Deployment shard set），源字体与目录锁保持完整。
_Avoid_: 全字符保证、缺字兼容

**Font distribution release（字体分发版本）**:
独立发布的、按固定版本可复现获取的一组生产字体资产，连同其源字体可选资产、许可证与来源记录。
_Avoid_: 字体文件夹、字体备份

**Font catalog release（字体目录版本）**:
以不可变快照固定各字体家族版本及其压缩包、校验和、覆盖信息与上游来源的发布索引。
_Avoid_: 字体总包、最新字体列表

**Font family package（字体家族包）**:
单个字体家族在特定版本下可独立下载和校验的压缩发行物，包含该家族的生产字体资产、覆盖元数据与许可证。
_Avoid_: 字体分片（只指其中一个文件）、字体总包

**Font source archive（源字体包）**:
与字体家族版本同批发布、用于重建与来源追踪的完整源字体压缩资产，不是普通站点构建的必需输入。
_Avoid_: 生产字体包、字体分片包

**Font bundle manifest（字体包清单）**:
描述一组生产字体资产的家族、版本、文件、覆盖范围、校验和、许可与上游来源的机器可读契约。
_Avoid_: 字体列表、下载目录

**Font catalog lock（字体目录锁）**:
主项目固定字体目录版本、需要启用的字体家族及其预期校验和的版本化依赖记录。
_Avoid_: 字体配置、最新版本记录

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
