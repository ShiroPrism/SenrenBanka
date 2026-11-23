# 404 页面按 Locale 展示多语言内容 — 执行计划

## 实施边界

**实现代理负责**

- `src/lib/not-found.ts`（新增）
- `src/lib/context-menu.ts`
- `src/components/ContextMenu.astro`
- `src/pages/404.astro`
- `scripts/not-found-locale.test.mjs`（新增）
- `package.json` 的测试脚本（不改版本号）

**主会话负责**

- `CONTEXT.md`、`docs/adr/0025-*.md`、`SPEC.md`、`README.md`
- `docs/rules/data-and-i18n.md`、`docs/rules/action-menu.md`、`docs/rules/pitfalls.md`
- `docs/verification/shared.md`、`docs/verification/action-menu.md`
- `change-log/0.22.1.md`、`package.json` 版本号
- 浏览器实测、最终检查、git commit

实现代理不得修改设计页、字体、verification 文档或版本号；遇到需要改共享契约的情况先报告。

## 顺序清单

### 1. 读取上下文

- [ ] 读 `docs/rules/data-and-i18n.md`、`docs/rules/action-menu.md`、
  `docs/rules/accessibility-responsive.md`、`docs/rules/pitfalls.md`。
- [ ] 读 `docs/adr/0007-action-menu-site-wide-with-touch-launcher.md` 与
  `docs/adr/0024-entry-locale-negotiation-and-zero-window-random.md`。
- [ ] 读 `src/pages/404.astro`、`src/lib/site.ts`、`src/lib/context-menu.ts`、
  `src/components/ContextMenu.astro`、`src/lib/router-script.ts`、
  `src/lib/locale-match.ts`、`src/components/InfraStyles.astro`。

### 2. 新增 404 数据与脚本

- [ ] 新建 `src/lib/not-found.ts`，实现设计文档中的 `NotFoundPanel` / `NotFoundLocaleConfig` /
  `NotFoundView` / `ContextMenuLocaleVariant` 组合数据。
- [ ] `buildNotFoundView(model, helpers)` 覆盖全部 Locale，生成：
  heading、body、backToEntry、allDesigns、allDesignsHref、defaultDesignHref、
  defaultDesignName、`ActionMenuConfig`、`panelCss`、`localeScript`、`menuLocaleVariants`。
- [ ] `renderNotFoundLocaleScript(config)` 使用内联安全的 JSON 序列化（转义 `<`），生成
  path → preference → browser → default 的解析脚本；`data-404-locale` 写 Locale path，
  `lang` 写 Locale code，`document.title` 用 path 查 titles。
- [ ] 脚本不得调用 `localStorage.setItem` / `removeItem`；不得因非法偏好抛错。
- [ ] `panelCss` 使用路径属性选择器，默认区块无属性时可见；单语言配置不产生空选择器。

### 3. 扩展菜单运行时

- [ ] 在 `src/lib/context-menu.ts` 增加 `ContextMenuLanguageItem`（如需要）与
  `ContextMenuLocaleVariant`；给 `ContextMenuRuntimeConfig` 加可选 `localeVariants`。
- [ ] `initContextMenu()` 解析配置后按 `html[data-404-locale]` 选择 variant，覆盖
  `switcherHref`、`shareTitle`、`targets`、`toast`、`launcherLabel`、`menuLabel`、`closeLabel`、
  `cancel`、`languages`。
- [ ] 新增 DOM 本地化函数，更新设计文档列出的所有菜单文本、aria、随机禁用态、switch href、
  语言 href / aria-current / check 的 `cm-check-hidden` 类。
- [ ] 非 404 页面路径完全不走本地化分支；菜单运行时仍不 import 任何 CSS。

### 4. 更新菜单组件

- [ ] `src/components/ContextMenu.astro`：
  - `runtimeConfig` 带出可选 `localeVariants`。
  - 移动面板分组加 `data-cm-group="page" / "design" / "language"`。
  - 仅 404（`localeVariants` 存在）为两个语言列表渲染全部 Check；设计页 / 切换页只渲染当前项。
    404 的非当前项带 `cm-check-hidden`。
  - 在全局 style 中加入 `.cm-check.cm-check-hidden { display: none; }`。
- [ ] 不复制菜单 DOM、不改变动作顺序、不改变键盘/触控/滚动锁逻辑。

### 5. 重写 404 页面

- [ ] `src/pages/404.astro` 用 `buildNotFoundView()` 生成数据与脚本。
- [ ] `<html lang={defaultPanel.locale.code}>`；HeadMeta 用默认 panel 的 heading 与
  `noindex, follow`。
- [ ] Head 内加入 `panelCss`（`<style is:inline>`）与 `renderNotFoundLocaleScript` 输出
  （`<script is:inline>`），脚本放在 title 之后。
- [ ] Body 保留唯一 `<h1>404</h1>`；按 Locale 渲染 `[data-404-panel]` 区块与默认
  `data-default`；默认 panel 内保留 `<noscript><LanguageSwitcher /></noscript>`。
- [ ] 默认 panel 的 `ContextMenu` 配置附加 `localeVariants`；菜单只渲染一次。
- [ ] 保留 `InfraStyles`、`noindex`、`not-found` 上下文、随机全池与 `manualSwitch` 门控。

### 6. 测试

- [ ] 新建 `scripts/not-found-locale.test.mjs`，用 `node:test` + `vm` 覆盖：
  - 路径首段优先于偏好与浏览器。
  - 偏好优先于浏览器。
  - 浏览器 `zh-Hant-HK` → `zh-TW` 最长匹配；`en-US` → `en`。
  - 浏览器语言缺失时用 `navigator.language`。
  - 非法偏好忽略且不调用 `removeItem`。
  - 未配置路径 `/fr/...` 回退偏好/浏览器/默认。
  - base `/demo/` 下 `/demo/en/x` → `en`，不会把 `demo` 当 Locale。
  - 设置 `html lang` / `data-404-locale` / `document.title`。
  - 全程不调用 `setItem` / `removeItem`。
- [ ] 把新测试文件加入 `package.json` 的 `test` 与 `test:locale`；不加入 `test:html-only`。
- [ ] 运行 `npm run format`、`npm run lint`、`npm test`、`npm run test:locale`。

### 7. 构建与静态产物检查

- [ ] `npm run build`；记录 `dist/404.html` 大小、页数、字体与 HTML-only / sections 门禁结果。
- [ ] 断言只有一个 `dist/404.html`；无 `dist/<locale>/404.html`。
- [ ] 检查 `dist/404.html`：
  - 含全部 Locale 的 `data-404-panel` 与默认 `data-default`。
  - 原始 `<html>` 无 `data-404-locale`。
  - 链接带正确 Locale / base 前缀。
  - 仍 only 1 个共享菜单 CSS 链接；无设计 CSS。
  - `noindex, follow`。
- [ ] `BASE_PATH=/demo` 构建到临时目录，检查 404 面板 / 脚本 / 菜单目标；清理临时目录。
- [ ] 临时 `manualSwitch: false` 构建：404 无设计组、无 switch item；测后恢复。
- [ ] 临时单语言配置构建：一个 404 panel、无语言组；测后恢复。

### 8. 浏览器验证

使用静态服务器或 Playwright route 让错误 URL 保持原路径并返回 `dist/404.html`：

- [ ] 清空语言偏好；`/en/missing/`、`/ja/missing/`、`/zh-tw/missing/`、`/ko/missing/` 分别显示
  对应正文、`html[lang]`、`document.title`、默认设计 href、返回入口 href、全部设计 href。
- [ ] 路径优先：先写入偏好 `zh-cn`，再访问 `/en/missing/`，仍显示英文。
- [ ] 偏好优先：访问 `/missing/`，偏好 `ja` 时显示日文；偏好非法值时按浏览器语言。
- [ ] 浏览器语言：偏好为空时用 `en-US` / `zh-Hant-HK` 等上下文验证。
- [ ] 页面加载不写偏好；菜单点击语言项后写入目标 path 并导航到目标 Locale 入口。
- [ ] 菜单在每种显示语言下：标签、Toast、aria、当前勾选、switch href、随机目标、分享标题
  与显示语言一致；`manualSwitch:false` 无设计组。
- [ ] 无 JS：默认 Locale 正文可见、`<noscript>` 语言链接存在、其它 panel 不显示。
- [ ] 桌面 1440 与 375×812 触控：无横向溢出；共享菜单打开/关闭、语言项、键盘路径、滚动锁
  无回归；console 0 错误；404 只请求 Document + 共享菜单 CSS/JS + favicon。
- [ ] 截图归档到 `docs/verification/assets/` 或 `.cache/verification/`，在验证文档写路径。

### 9. 交接

- [ ] 向主会话报告：改动文件、测试命令与结果、构建页数 / 大小、未测项、任何风险。
- [ ] 不提交 git；不修改版本号、change-log、verification、SPEC/README/rules。

## 回滚点

1. 新增 `src/lib/not-found.ts` 与测试：仅新文件，删除即可。
2. `ContextMenu` 运行时 / 组件改动：可单独还原 `src/lib/context-menu.ts` 与
   `src/components/ContextMenu.astro`，404 回退为单语言。
3. `src/pages/404.astro`：可还原为当前 `resolveLocale(model, '')` 版本。
4. 文档 / 版本：最后单独提交；回滚不涉及数据迁移或外部资源。

## 完成门禁

- [ ] `npx astro build` + 独立 `check` / html-only / sections / fonts audit 门禁绿；`npm run build`
  包装脚本若被既有 `.trellis/**` worktree CRLF 的 `check:eol` 阻断，记录为环境阻塞而非本任务缺陷。
- [ ] `npm test` / `npm run test:locale` 绿
- [ ] 404 产物、浏览器矩阵、base、`manualSwitch:false`、单语言分支均有实测或明确未测声明
- [ ] 无设计 CSS / 字体 / 视觉改动
- [ ] 主会话更新 `CONTEXT.md`、ADR 0025、SPEC/README/rules、verification、change-log 与版本号
