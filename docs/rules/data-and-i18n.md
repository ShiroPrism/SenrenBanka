# 数据与多语言

> **适用范围**：数据加载、资料契约、多语言路由、文案与语言切换规则。
>
> **权威级别**：本文件是该项目主题规则的唯一正文来源；根 `AGENTS.md` 只提供硬门禁与路由。
>
> **相关决策**：[`../adr/0006-multilingual-static-routing.md`](../adr/0006-multilingual-static-routing.md), [`../adr/0007-action-menu-site-wide-with-touch-launcher.md`](../adr/0007-action-menu-site-wide-with-touch-launcher.md), [`../adr/0021-site-notice-configuration.md`](../adr/0021-site-notice-configuration.md), [`../adr/0022-design-packaging-scope.md`](../adr/0022-design-packaging-scope.md)
>
> **维护归属**：规则变更先修改本文件，再检查根索引与引用。

## 数据接口

- 每个设计页面在 frontmatter 取数：`const view = await loadDesignView('<自己的 id>', Astro.url.pathname)`（`src/lib/site.ts`）。**第二个参数是当前请求路径**——语言由它统一解析，页面**不得**各自实现语言判断逻辑
- **多语言同屏**的设计：改用 `loadDesignStrips('<自己的 id>', Astro.url.pathname)`——与 `loadDesignView` 同一数据源与构建期校验，额外返回全部语言的资料条（`strips: { locale, profile, isCurrent }[]`）；页面仍不接触文件路径、不自行判断语言。收到 receipt 已改为单张宽票，不再使用该入口
- `view` 结构：
  - `profile`：核心字段 `name` / `headline` / `bio` / `links` **必须全部渲染**；
    `avatar` / `location` 是普通可选字段；`projects` / `experience` / `skills` / `contact` 是兼容保留的高级可选扩展区块，由设计按自身风格**自行取舍**（取舍结果写进该设计的 DESIGN.md）。资料**按当前语言**选取，页面不需要关心文件路径
  - `locale`：当前语言条目（`code` / `path` / `label` / `title` / `description` / 可选 `notice`）；`locales` 为全部语言。`notice` 是站点声明（如示例数据提示），缺省不渲染，设计直接读取 `view.locale.notice`
  - `messages`：当前语言的共享文案（共享操作菜单 / 切换页 / 404 / 语言选择器）
  - `site`：manualSwitch
  - `design`：id / displayName / description / isDefault
  - `head`：**必须原样传给 `HeadMeta`**（title / description / canonical / robots / lang / alternates 由框架统一计算，robots 索引策略不可自行更改）
  - `contextMenu`：共享操作菜单的构建期配置（`context` 页面上下文 / 目标池 / storageKey / `languages` / `designActionsEnabled` 等，含随机与固定模式的存储语义）。`styled` 页面**无条件**接入 `<ContextMenu config={view.contextMenu} />`；`html-only` 页面**不得渲染该组件**，改用普通链接导航（见 [`design-contract.md`](./design-contract.md)；v0.10.0 起无 `enabled` 开关）
- `<html lang>` 必须用 `view.head.lang`（即当前语言的 BCP 47 code），**不得**使用固定的 `zh-CN`
- 所有内部链接必须经 `withBase()`（`src/lib/urls.ts`）拼接 base 前缀，或用 `localeDesignHref()` / `localeHref()`（`src/lib/site.ts`）生成**带语言前缀**的地址；禁止硬编码绝对路径
- 禁止虚构个人事实

## 资料契约边界（强制）

- `i18n.locales[].notice` 是站点级声明，不进入 profile schema；设计通过 `view.locale.notice` 读取，缺省不渲染。它是单行纯文本，不承载富文本或任意内容区块
- 资料契约是固定 schema：字段集合不随语言、设计或使用者增减，也不提供用户自定义字段、自定义内容区块、任意内容模型或通用内容渲染兜底
- 新需求**不得直接解释为**新的自定义字段或自定义区块，也不得在设计页面或数据层自行增加通用渲染兜底；契约边界有变化时先回到产品层确认
- `projects` / `experience` / `skills` / `contact` 仅为兼容现有设计而保留的高级可选扩展区块；它们不是可继续扩充的词汇表或插件机制，不新增同类字段或区块
- 超出固定契约的更多个人信息应通过核心 `links` 指向站外页面或联系方式。站点只负责呈现入口，不托管目标内容；其可用性、可访问性、归属与持久性由外部平台控制

## 设计打包范围（Packaging scope）

- **四层区分**：Registered design（目录存在且通过 registry 校验）→ Packaged design（当前部署实际构建）→ Enabled design（打包且 `design.json.enabled: true`，进入随机池/切换页）→ Default design（必须打包 + 启用，覆盖全部 locale）。
- `site.config.yaml` 的 `design.exclude` 是唯一打包排除入口，缺省 `[]` = 全部注册设计；全站一份，不按 locale 拆分。
- `design.exclude` 的 ID 必须已注册且不重复；默认设计不得被排除；打包集合不得为空；排除后仍需至少 1 个启用设计。违反任一条构建期失败。
- 被排除设计不注入多语言页面或旧路径跳转，不生成页面 HTML / Page CSS，不进入随机池、切换页与语言入口；`enabled` 在打包集合外静默失效（不报错、不告警）。
- 语言覆盖 / `messages.ts` / `descriptions.ts` 只校验打包设计；registry 仍校验全部目录的四件套与元数据。
- 切换页的 `Preview.astro` 为 eager glob，被排除设计的预览 CSS / 描述可能仍聚合进切换页资源，属于已知限制（见 ADR 0022）；不得因此把被排除设计重新列入切换页。
- 决策见 [`../adr/0022-design-packaging-scope.md`](../adr/0022-design-packaging-scope.md)。

## 多语言（i18n）

- **Fork 配置义务**：fork 后必须修改 `src/data/site.config.yaml`——`i18n.locales[].title` / `description` 是该语言的站点 SEO 元数据，保留示例值会把示例人物信息带到新站；`i18n.locales[].notice` 是示例数据声明，填入真实资料后删除；语言清单 `i18n.locales` 也只在 `site.config.yaml` 维护，增删语言必须同步增删 `profiles/<path>.yaml`，且 `defaultLocale` 必须存在于清单。只替换 profile 不等于完成 fork 配置
- 语言清单**只在一处维护**：`src/data/site.config.yaml` 的 `i18n.locales`（`code` / `path` / `label` / `title` / `description`）。不得在其他文件重复列出语言
- 每种语言必须有 `src/data/profiles/<locale.path>.yaml`，字段契约与 `zh-CN` **完全一致**（同一套 `profileSchema`）
- 站点 SEO 元数据按语言提供（`i18n.locales[].title/description`）；**不再**保留全局 `site.title` / `site.description` / `site.lang`
- **每套设计必须提供 `src/designs/<id>/messages.ts`**，导出 `messages`，为 `design.json` 的 `locales` 中**每种 code** 各给一份文案（默认设计必须覆盖 `i18n.locales` 的全部 code）。缺文件或缺键在构建期报错；文案必须遵循该设计的视觉语言，**不得**把所有设计统一翻译成相同表述。
- **设计语言覆盖**：`design.json` 必须声明 `locales: string[]`（非空、去重）。默认设计（`design.default`）必须覆盖全部配置 locale；非默认设计可覆盖子集。未覆盖的 locale **不生成该设计页面**（直接 404）；`/<locale>/designs/` 与随机池只包含覆盖当前 locale 的设计。声明覆盖但 `messages.ts` 缺该语言文案、或 `descriptions.ts` 缺切换页描述 → **构建失败**；`design.json` 中列出但未在 `site.config.yaml` 配置的 code → **告警并忽略**（单语言 fork 不必逐套清理 design.json）。
- **Locale typography coverage（韩语）**：`fontProfile: korean` 由 `fonts:coverage` 消费；声明 `ko` 的 `styled` 设计，每个 `font` / `font-family` 栈必须包含 Hangul 核心变量，页面必须注册对应 `<Font>`；`html-only` 在字体维度豁免。CJK 核心存在性仍由 `fonts:typography` 处理。决策见 ADR 0017。
- **Locale typography coverage（繁体中文）**：`fontProfile: traditional-chinese` 由 `fonts:coverage` 消费；声明 `zh-TW` 的 `styled` 设计必须在 `html:lang(zh-TW)` 内重映射每个被用到的 CJK/伴生变量（韩文伴生槽位可映射到 `__senrenbanka_tc_skip__` 哨兵，不得提升为新的字形角色），TC `<Font>` 只在 zh-TW 页注册；`html-only` 豁免。TC 族的 `scripts` 必须同时含 `cjk` 与 `han-traditional`，否则会绕过汉字审计。决策见 ADR 0018。
- **单语言 fork**：只保留一种语言时，改 `site.config.yaml` 的 `i18n.locales` 为 1 条并删除多余 `src/data/profiles/*.yaml`；`design.json` 中未配置的 code 被忽略。`locales.length < 2` 时语言分组、`LanguageSwitcher`、注入 JSON 与 `html-only` 原生语言区整组不渲染；保留 `/<locale>/` URL 前缀。
- 不翻译的文本（命令、ASCII 装饰、刻意的双语标识、品牌专有名词、法律署名）**必须在该设计 `messages.ts` 的文件注释中写明理由**，否则视为漏译
- 用户可见静态文案**不得**留在 `Page.astro` 的模板字面量里；也包括运行时生成的提示（菜单 Toast 等）——后者由 `view.messages` 注入
- **翻译纪律（重要）**：翻译**只处理已有文案**，不得为"显得完整"而新增解释性、说明性或自我描述的句子。原页面没有的句子，译文里也不该有。
  - 典型反例：`built from a single profile` 译成「由同一份资料生成」——中文读者无法从中获得信息，只会觉得莫名其妙。
  - 若某句原文本身语义不清、拿不准，**先问项目所有者**，不要自行"润色"或保留。
  - 译文必须**能被该语言的读者读懂并获得与原文等量的信息**；做不到就说明原文该删，而不是硬译。
- 共享 chrome 文案集中在 `src/i18n/messages.ts`；该模块与各设计 `messages.ts` **都是纯数据，不得 import 任何 CSS / `Page.astro` / `style.css`**
- **语言切换入口按渲染模式分叉**：`styled` 设计使用共享操作菜单内的语言分组（`ContextMenu.astro` 内渲染，`.cm-lang`），不再单独渲染可见语言切换器，也不需要在 `style.css` 中排版语言切换；`html-only` 设计在原生导航中直接列出普通 `<a>`。两种模式的每个语言项都逐个带 `hreflang` / `lang`，当前语言标 `aria-current="page"`。共享菜单的桌面与移动形态都必须可达（v0.10.0 修订）。
- **语言项的呈现按输入环境分叉**（ADR 0007）：
  - **桌面**：收在二级子菜单里，**不得平铺进主菜单**——语言数量由配置决定且可能很多，平铺会让主菜单长到超出视口。契约：主菜单高度与语言数量**无关**；子菜单自身限高并可滚动。
  - **移动**：在底部动作面板内**平铺**（触屏没有 hover 二级菜单的心智模型，用户会滑到列表底部而不是"点开子菜单去看语言"）。限高与滚动由面板容器承担，语言再多也不会顶出视口。
  - **两种形态都不得依赖 hover**：桌面子菜单必须支持点击 / `→` / Enter 打开；移动端平铺项本身即入口。
- **`manualSwitch` 只控制主题切换入口**：`styled` 菜单中的随机 / 全部设计项由 `designActionsEnabled` 门控；`html-only` 的「全部设计」普通链接同样受它门控。语言入口在两种模式下都照常渲染——语言切换不受 `manualSwitch` 影响
- 切换语言时**保持页面上下文**（`context.kind` 派生，ADR 0007）：主题页 → 目标语言**覆盖该设计时进同一主题，否则落到目标语言的默认设计**；切换页 → 目标语言的切换页；404 → 目标语言的入口页。`html-only` 的原生语言链接遵循同一目标规则。
- 切换语言只改 locale，**不改当前主题、不重置随机窗口**；`storageKey` 不含 locale（主题偏好跨语言共享）
- 语言识别只认路径**首段**并与 `locales[].path` 精确匹配，部署 base 不得被当作语言代码
