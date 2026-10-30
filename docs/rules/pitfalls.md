# 已知坑

> **适用范围**：已实测的架构、构建、菜单、预览与字体陷阱及正解。
>
> **权威级别**：本文件是该项目主题规则的唯一正文来源；根 `AGENTS.md` 只提供硬门禁与路由。
>
> **相关决策**：[`../adr/0001-motion-reveal-mechanism.md`](../adr/0001-motion-reveal-mechanism.md), [`../adr/0006-multilingual-static-routing.md`](../adr/0006-multilingual-static-routing.md), [`../adr/0007-action-menu-site-wide-with-touch-launcher.md`](../adr/0007-action-menu-site-wide-with-touch-launcher.md), [`../adr/0009-html-only-design-rendering.md`](../adr/0009-html-only-design-rendering.md)
>
> **维护归属**：规则变更先修改本文件，再检查根索引与引用。

## 已知坑（均已实测，勿重复踩）

- **不要让任何多页共享的模块对设计页面 / CSS 建立动态导入边**：
  `import.meta.glob('./*/Page.astro')`（非 eager）这类写法会把它触达的所有 `style.css` 聚合进**每个**引用方的 `<link>`。
  文件存在性检查请用 `node:fs`（见 `src/designs/registry.ts`）。
- **设计路由用 `astro.config.mjs` 的 `injectRoute`**：`getStaticPaths` 不能引用页面 frontmatter 顶层的 glob 变量（构建拆包后报 `pages is not defined`）。副作用：新增 / 删除设计目录后需重启 `npm run dev`。
- **多语言不得改成动态 `[design]` / `[locale]` 路由**：那会把所有设计的 CSS 聚合进每个页面。正解是 `injectRoute` 把同一 entrypoint 注册到多个语言前缀（见 `../adr/0006-multilingual-static-routing.md`）。
- **Astro 原生 `i18n` 对本项目零增益**：实测开关两种配置的产物完全相同（37 页 `diff` 一致），唯一作用是让 `Astro.currentLocale` 有值——不配时它为 `UNDEFINED`。语言一律由 `resolveLocale(model, Astro.url.pathname)` 自解析。
- **拼接 locale 前缀必须带斜杠**：`base + localePrefix + '/' + target + '/'`。漏掉中间的 `/` 会产出 `/zh-cnfrost/` 这种废路径（2026-10-12 实测踩坑）。
- **`site.config.yaml` 里整段注释掉的键会解析成 `null` 而不是"缺失"**：`site:` 下全部注释时 `raw.site === null`，直接 `.default({})` 会构建失败；需 `z.preprocess((v) => v ?? {}, schema)`（用 `transform` 会把输出类型擦成 `{}`）。
- **多语言的资料条目 id 带目录前缀**：glob loader 对 `profiles/*.yaml` 产出的 id 是 `profiles/zh-cn`，匹配 locale 时取 `id.split('/').pop()`。
- **子菜单的导航层级按「焦点实际所在处」判定**：`items()` 必须按**当前层级**取项，否则子菜单项会混进主菜单的 `↑↓` 序列。判据是 `submenu.contains(document.activeElement)`，**不是** `subOpen`（子菜单是否已展开）——`↑↓` 移到触发项会自动展开子菜单但焦点仍留在触发项，若按 `subOpen` 判定则 `→` 进不去子菜单；反过来若按焦点判定但 `↑↓` 仍沿用 `subOpen` 同步收起，焦点进子菜单后每按一次 `↓` 都会把子菜单收起来、焦点随即丢失（2026-10-12 首记，v0.10.0 实测修正）。
- **`hidden` 属性必须有一条自己的 CSS 兜底**：作者样式表的优先级高于 UA 样式表的 `[hidden] { display: none }`，任何容器一旦声明了 `display: flex`（面板、悬浮球都声明了）就会**无视 `hidden` 恒常可见**——表现为「面板一直开着、点关闭无效、看不到悬浮球」。因此组件样式里必须显式写 `[hidden] { display: none }` 兜底（ADR 0007）。
- **两份 DOM 中被摘除的一方必须用 `hidden` 属性**，不要用 `display: none` / `visibility: hidden` 类——只有 `hidden` 会同时移出无障碍树，两份并存时否则会被读屏重复朗读（ADR 0007）。
- **面板的显隐只能由 open 状态驱动，绝不能写成 `sheet.hidden = !inTouchMode()`**：那等于「移动端永远打开面板」。形态切换时全部容器先收起，悬浮球是移动端唯一常驻入口。
- **入场动画不得让「动画未推进」等价于「元素不可见」**：面板动画起点若为 `translateY(100%)`，在后台标签页 / rAF 被节流 / 减动态切换等情况下动画可能全程不推进，面板就永远停在视口外，用户点悬浮球像没反应。两条纪律：① 起点用**部分**位移（本项目 `translateY(14%)`），保证退化时仍有相当部分在视口内可点；② **不用 `both` / `forwards` 等会把起始帧固化的 fill-mode**，并在 `animationend` 后摘掉触发属性让它回到无动画的自然终态（ADR 0007）。
- **`applyMode()` 落定形态时浮层菜单必须显式隐藏**：不要写成 `root.hidden = touchMode`（那会让桌面菜单常驻可见）；两份容器初始都 `hidden`，由 `applyMode()` 依据形态分别摘除（v0.10.0 实测踩坑）。
- **测量移动面板的位置必须等入场动画播完**：面板用 `translateY(100%)` 入场，动画未结束时 `getBoundingClientRect()` 返回的是动画中途位置（会看到 `bottom` 远超视口高度），容易被误判为 `position: fixed` 定位失败（v0.10.0 实测踩坑）。
- **内容层 glob loader 会归一化条目 id**（`site.config.yaml` → `"siteconfig"`）：取数用 `getCollection()` 取唯一条目，不要猜 id（见 `src/lib/site.ts`）。
- **Tailwind 不识别动态拼接的类名**（如 `border-${color}` 不会被扫描到）；需要安全列表时用 `@source inline("...")`。
- **`@astrojs/tailwind` 已弃用**，勿引入；Tailwind 4 官方集成 = `@tailwindcss/vite`（已配置）。
- 切换页 `/designs/` 在 `manualSwitch: false` 时**不构建**（404）；`styled` 设计页不得另留可见 / 可聚焦的切换入口（唯一入口是共享操作菜单的**主题组**，与切换页同受 `manualSwitch` 门控——菜单本体与语言分组不受影响）。`html-only` 按 ADR 0009 提供契约规定的「全部设计」普通链接，且同样受 `manualSwitch` 门控。
- **Tailwind Preflight 把 `svg` 置为 `display: block`**：行内语境中的 svg 图标（文本旁的品牌 mark / 外链箭头）会折到下一行——必须显式 `display: inline-block`（flex 语境不受影响）。2026-10-10 由图标改动验证期 rect 实测暴露。
- **菜单运行时必须按能力门控动态加载**：`ContextMenu.astro` 用内联 `matchMedia` + 动态 `import()`（Vite 不给该 chunk 生成 `modulepreload`，dist 实测）；**不要改成静态 import**，否则纯文本浏览器会白白下载菜单逻辑。门控是「桌面鼠标 **或** 触控能力任一命中」（ADR 0007 修订——移动端也需要该运行时）。菜单样式用 `<style is:inline>`：不新增 `<link>`（"每设计页只链接自己的 CSS" 仍成立）。
- **`document.execCommand` 必须保持以 `document` 为 `this` 调用**：解构出的裸方法引用会抛 `Illegal invocation`（2026-10-10 降级复制路径实测踩坑）；该 API 虽被废弃，仍是 Clipboard API 不可用时的唯一同步降级路径，经自定义类型引用以避开 TS 废弃告警。
- **npm provider 即使 `remote: false` 仍会把字体 URL 指向 jsdelivr**：`optimizedFallbacks: false` 只关闭 metrics 取件，Astro 构建末段仍会 fetch provider 返回的字体文件。现行 6 个 Fontsource family 由 `localNpmProvider()` 包装同一 npm provider，并把解析出的包 URL 映射回 `node_modules` 本地文件；离线验证要清空 `node_modules/.astro/fonts/` 后用无效代理完整 build（2026-10-30 实测，仅关 optimized fallback 会失败）。
- **Astro 字体的 `fallbacks` 会封进 `--font-*` 变量，不能复用于多字体 CJK 栈**：若把 `PingFang SC` / `Microsoft YaHei` 留在拉丁字体 registration 内，`var(--font-latin)` 会先命系统中文，后写的 `var(--font-zhuque)` 永远轮不到。六个 npm family 与全部 local family 必须 `fallbacks: []` + `optimizedFallbacks: false`，完整顺序只写在设计 CSS；`npm run fonts:typography` 会同时拦截缺失显式 fallback 与“系统 CJK 早于 core-cjk”两类回归。
- **普通排版验证不能用强制 `document.fonts.load()` 冒充命中**：强制加载只能证明文件可载入，不能证明页面 Cascading 顺序真的选中核心字体。应检查普通加载后的 WOFF2 请求 / `unicode-range` 命中，或 CDP 的平台字体信息；强制加载只能作为附加诊断。
- **字体缓存不是普通的可手工修补目录**：`.cache/fonts/` 由 `fonts:prepare` 按 `fonts.lock.json` 原子安装并以 `.complete.json` 提交；`fonts:check` 会重新计算每个文件哈希且完全离线。缺文件时不要复制单个文件或手改 marker，执行 `npm run fonts:prepare`；缓存不得入库。
- **`src/fonts/generated.ts` 禁止手改**：它由 `fonts:update` 从已锁定目录生成，注册数组包含数百个 CJK 分片；手工补充 family 会绕开 `fonts.config.json` 的显式启用边界，并使 `fonts:check` 失败。新增/升级字体只改人工配置后运行 update/prepare/check。
- **设计 `style.css` 的 `@source "./"` 会连带扫描同目录的 `Preview.astro`**：预览 `<style>` 里的属性文本（`display: flex`、`border:`、`transform:`、`flex-wrap:`、`ease-in-out`）会被 Tailwind 当作候选工具类，把 `.flex` / `.border` / `.transform` / `.flex-wrap` / `.ease-in-out` 等规则与配套 `@property` **注进正式页 CSS**（实测约 +1.3KB/页），并让「改预览」静默影响正式页样式。必须加 `@source not "./Preview.astro";` 排除（2026-10-18 实测）。
- **`Preview.astro` 里绝不能出现 `:root` 规则**：组件内联的 `:root` **不被 Astro 作用域化**，会泄漏成切换页的全局令牌。预览令牌一律走命名空间类（`:is(.ar, .ar-pv)`）。同理，预览**不得**声明 `<Font>`（同族重复声明会产出重复 `@font-face`），也**不得**从**共享模块** glob 预览组件（会触发上面的 CSS 聚合陷阱）——glob 只能写在切换页页面 entrypoint 内。
