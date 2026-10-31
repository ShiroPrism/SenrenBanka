# verification — HTML Only

> 当前完整验证状态（更新式；历史由 Git 保留）。规则见 `docs/rules/README.md`，验证流程见 `design-page-verify` skill，长期决策见 `docs/adr/0009-html-only-design-rendering.md`。
> 实施、静态验证与浏览器检查：**2026-10-28**。浏览器结果来自主会话提供的本机 Chromium 实测；2026-10-29（v0.17.0）只更新全站当前页数与切换页产物计数，未重跑本设计的浏览器矩阵。**2026-10-31 韩语增量**：新增 `/ko/html-only/`，当前 4 个 locale 页面、每页 4 个语言链接；`verify:html-only` 通过；未重跑 2026-10-28 浏览器矩阵。**2026-11-01 全设计字体层（ADR 0017）**：`/ko/html-only/` 仍为零 CSS/JS/字体（浏览器 `fontCount=0`、`styleSheets=0`）；截图 `assets/korean-html-only-desktop.png`。

## 设计状态

- `design.json.renderMode: "html-only"`，`enabled: true`，自产来源。
- 正式页文件仅 `DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`。
- 目录确认不存在 `style.css`、`tokens.css`；`Preview.astro` 为切换页专用、完全自包含。
- 页面使用 `loadDesignView('html-only', Astro.url.pathname)`、`view.head.lang`、原样 `<HeadMeta {...view.head} />`、`localeDesignHref()` 与 `localeHref()`。
- 不渲染 `Font`、`Reveal`、`ContextMenu`、`InfraStyles`、`LanguageSwitcher`；不提供随机入口。
- 核心字段全部渲染；`location`、`projects`、`experience`、`skills`、`contact` 全部渲染；`avatar` 按 DESIGN.md 决定不渲染。
- 页面含目录、语言链接、`manualSwitch:true` 时的“全部设计”链接与 back-to-top；所有 section 均有 `aria-labelledby`。

## 构建

- `npm run build`：**105 页**通过（v0.17.0 当前全站构建；本设计实现时的 77 页基线保留为历史）。
- `astro check`：0 errors / 0 warnings / 1 条既有 `lexicon/Page.astro` hint。
- `npm run verify:html-only`：20 项回归测试全绿，产物门禁通过，`1 design × 3 locales = 3 pages`。
- 页面构成：23 套 `styled` × 3 locale（69 页）+ 3 个 `html-only` 页面 + 3 个语言入口 + 3 个切换页 + 根入口 + 404 + 24 个设计旧路径 + 旧 `/designs/`，共 **105 页**。

## 三语产物静态检查

| locale | `html lang` | title | canonical | robots | `<link>` | stylesheet / preload | `<style>` / `<script>` / `style=` / `on*` / `javascript:` / refresh | 菜单 / Reveal |
|---|---|---|---|---|---|---|---|---|
| zh-cn | `zh-CN` | `HTML Only · 田所浩二 / Tadokoro Koji (野獣先輩)` | `/zh-cn/html-only/` | `noindex, follow` | 2（canonical + icon） | 0 / 0 | 0 / 0 / 0 / 0 / 0 / 0 | 0 / 0 |
| ja | `ja` | `HTML Only · 田所浩二 / 野獣先輩` | `/ja/html-only/` | `noindex, follow` | 2（canonical + icon） | 0 / 0 | 0 / 0 / 0 / 0 / 0 / 0 | 0 / 0 |
| en | `en` | `HTML Only · Tadokoro Koji (野獣先輩)` | `/en/html-only/` | `noindex, follow` | 2（canonical + icon） | 0 / 0 | 0 / 0 / 0 / 0 / 0 / 0 | 0 / 0 |

- 非默认设计，`alternate` / `x-default` 均为 0，符合统一 SEO 规则。
- 每页唯一 `h1`；5 个 `<section>`（links / projects / experience / skills / contact）均有可访问名称。
- 每页 4 个语言链接，均带 `hreflang` / `lang`，恰好 1 个 `aria-current="page"`，目标保持 `html-only`。
- 链接、项目、经历、技能、联系邮箱与说明均来自当前语言 profile；未出现模板内的用户可见硬编码文案。

## 选择与切换页

- 三语切换页均出现 `html-only` 卡片，目标为对应 locale 的 `/html-only/`。
- 卡片渲染自包含的普通 HTML 文档缩略图：真实姓名、headline、目录、普通蓝色链接；无 `style.css` / `tokens.css` 依赖。
- 切换页当前产物：24 张卡 / 24 个预览；`html-only` 预览容器为 `aria-hidden="true"`、无可聚焦元素、预览文字不进入卡片可访问名。2026-10-28 的 1536px 浏览器实测记录为 18 张卡、预览画幅约 `353 × 221px`，v0.17.0 未重测新增六张卡片的浏览器几何。
- 截图：`.local-fonts/dev/preview/html-only/html-only-switcher-preview.png`。
- `html-only` 进入 enabled 随机池；页面自身不提供随机按钮或持久化脚本。

## base path

- `BASE_PATH=/demo` 构建到临时 outDir：**105 页**通过（v0.17.0 当前构建；历史实现基线为 77 页）。
- `node scripts/verify-html-only.mjs --dist <temp>` 通过。
- 抽查 `/demo/zh-cn/html-only/`：canonical、favicon、三语链接、全部设计链接与锚点均正确；内部绝对路径无缺失 `/demo` 前缀。
- 切换页的 `html-only` 卡片目标为 `/demo/zh-cn/html-only/`。

## 配置边界

2026-10-28 临时把 `site.config.yaml` 的 `manualSwitch` 改为 `false` 后构建（v0.17.0 未重跑该分支）：

- 当时构建 **73 页**；三语切换页与旧 `/designs/` 不构建。
- `html-only` 页面不渲染“设计”导航组或“全部设计”链接。
- 三语语言链接仍完整可用。
- 测试后配置已按原始字节恢复。

## 注册表负向测试

- 临时 `styled` fixture 省略 `renderMode` 且无 `style.css`：`astro build` 失败，报错 `renderMode 为 "styled" 时必须提供 style.css（CSS 入口）`。
- 临时给 `html-only` 加入 `style.css`：`astro build` 失败，报错 `renderMode 为 "html-only" 时禁止提供 style.css`。
- 临时给 `html-only` 加入 `tokens.css`：`astro build` 失败并指出该模式禁止该文件；`Preview.astro` 允许自包含存在，但不得改变正式页门禁。
- 两个临时 fixture / 产物均已删除。

## 产物验证器负向测试

临时产物副本先通过正向检查；随后分别注入以下内容，四次均以 exit 1 失败并指出具体 `index.html`：

| 注入 | 结果 |
|---|---|
| `<style>body{}</style>` | `forbidden <style> tag` |
| `<script>alert(1)</script>` | `forbidden <script> tag` |
| `<div style="color:red"></div>` | `forbidden style attribute on <div>` |
| `<link rel="stylesheet" href="/x.css">` | `<link rel="stylesheet"> is forbidden` |

验证器无候选时 fail-closed；支持默认 `dist` 与 `--dist <dir>`。
2026-10-28 一次最终构建在字体复制阶段出现 Rust `memory allocation ... failed`；原命令重跑后 **77 页**
与全部门禁通过，未复现，属本机瞬时资源失败而非代码断言失败。

补充 parser 边界负向用例（均 exit 1 且报 `forbidden <script> tag`）：

| 注入 | 被绕过的原因（修复前） |
|---|---|
| `<!-- probe --!><script>…</script>-->` | 只识别 `-->`，漏掉浏览器同样接受的 `--!>` 注释闭合 |
| `<!--><script>…</script>` | 只识别标准注释闭合，漏掉 `<!-->` 的 abrupt comment |
| `<!bogus "><script>…</script>"` | 把 bogus declaration 当作带引号的声明，导致 `>` 在引号内被跳过 |
| `<?bogus "><script>…</script>"` | 把 HTML 中的 processing-instruction 形态当作带引号的标签 |
| `<div foo=bar"baz><script>…</script>` | 引号感知的标签扫描把无引号属性值中的 `"` 误当成引号起点 |

验证器还会拒绝 `javascript:` URL（含数字实体、命名实体、ASCII 控制字符与 `srcset`
候选变体）与 `<meta http-equiv="refresh">`。`npm run test:html-only` 用 Node 内置 test
runner 固化上述正向 / 负向用例（20 项），并正向覆盖 `<textarea>` / `<title>` 中
作为文本出现的标签字面量；`npm run verify:html-only` 与 `npm run build` 都会先执行该测试。

## 检测器

```text
.agents\skills\impeccable\scripts\impeccable.cmd detect --json src/designs/html-only
[]
```

## 浏览器实测（2026-10-28，本机 Chromium）

### 桌面 1440px

- 无横向溢出：`document.documentElement.scrollWidth <= innerWidth + 1`。
- 0 个 stylesheet、0 个 `<style>`、0 个 `<script>`、0 个内联 `style` 属性。
- 网络仅 Document 与 favicon metadata 请求；0 console / page error。
- 页面结构：1 个 `h1`、5 个具名 `<section>`、3 个语言链接且恰好 1 个 `aria-current="page"`。
- 键盘遍历到达全部非 `mailto:` 链接；Japanese 语言链接实际落到 `/ja/html-only/`，“All designs” 实际落到 `/zh-cn/designs/`。
- 截图：`.local-fonts/dev/preview/html-only/html-only-desktop-1440.png`。

### 375px 移动视口

- 无横向溢出；正文、目录、语言、设计切换与全部资料区块完整。
- 3 个语言链接均为普通 `<a>`；无悬浮球 / `.cm-*` / Reveal。主会话未声明该视口启用了触控指针仿真，因此这里不把“链接可点”冒充为触控命中实测。
- 截图：`.local-fonts/dev/preview/html-only/html-only-mobile-375.png`。

### 320px 窄屏

- 无横向溢出，目录、列表与长文本自然换行，内容未裁切。
- 截图：`.local-fonts/dev/preview/html-only/html-only-narrow-320.png`。

### 降级

- 禁用 JavaScript：内容、目录、语言链接、全部设计链接与资料链接保持完整；无隐藏交互依赖。
- 禁用 CSS：内容仍完整可读；该设计的最终呈现本来就只依赖浏览器默认样式。
- 截图：`.local-fonts/dev/preview/html-only/html-only-no-js-375.png`、
  `.local-fonts/dev/preview/html-only/html-only-no-css-375.png`。
- 无 JS 与无 CSS 两张截图当前字节相同（`122377 B`），因为本页没有任何 CSS / JS 可被禁；这是预期结果，不是漏测。

### 未测 / 限制

- 真机 iOS / Android、Safari / Firefox 引擎、横屏与 200% 缩放未实测；320px 为窄视口截图，375px 的触控指针仿真状态未记录。
- 截图已目检；本轮未逐项复跑主会话的浏览器会话，只复核了产物与归档截图。

## 已知边界（不在本任务修复）

- `styled` 设计页在无 JS 时仍没有菜单语言入口；`.cm` / `.cm-sheet` 初始带 `hidden`，静态 DOM 不可作为回退。
- `messages.ts` 的 locale 完整性仍由各页面类型与约定保障，注册表尚未按 `i18n.locales` 动态强校验。
- `_draft` 目录在路由扫描与注册表 glob 之间仍不一致。
