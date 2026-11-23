# 404 页面按 Locale 展示多语言内容 — 技术设计

## 结论

保留单份静态 `dist/404.html`。构建期把所有已配置 Locale 的 404 内容预渲染为同一页内的
`[data-404-panel]` 区块，默认 Locale 区块带 `data-default`。`<head>` 内的内联脚本在首屏前解析
Locale，设置 `html[lang]`、`html[data-404-locale]`（值为 Locale path）和 `<title>`；一段内联 CSS
只显示对应区块。共享操作菜单仍只渲染一份 DOM，运行时按同一解析结果替换菜单配置与可见标签。

不生成每语言 404 页面，不依赖 GitHub Pages / Cloudflare Pages / Vercel 的路径级 404 rewrite。

## 既有约束

- 静态托管只在未知路径返回根 `404.html`，URL 保持原样；构建期拿不到请求路径。
- 现有 Locale 契约：`/<locale>/...` 路径语言优先；只有 `/` 做偏好 → 浏览器 → 默认协商。
- 404 的 `PageContext` 是 `{ kind: 'not-found' }`，没有当前设计；随机走全池，语言项目标为
  目标 Locale 入口页（`actionMenuLanguageItems()` 已实现）。
- `ContextMenu` 的静态 DOM 与菜单运行时是共享机制；菜单运行时按输入能力动态加载，且不能
  import CSS。
- 404 目前只链接共享菜单 CSS；页面主体样式由 `InfraStyles.astro` 内联提供。

## 数据与渲染流

### 1. 构建期

新增 `src/lib/not-found.ts`：

```ts
export interface NotFoundPanel {
  locale: LocaleEntry;
  messages: LocaleMessages;
  heading: string;
  body: string;
  backToEntry: string;
  allDesigns: string;
  allDesignsHref: string | null;
  defaultDesignHref: string;
  defaultDesignName: string;
  contextMenu: ActionMenuConfig;
}

export interface NotFoundLocaleConfig {
  base: string;
  defaultPath: string;
  storageKey: string;
  locales: Array<{ code: string; path: string; matchTags: string[] }>;
  titles: Record<string, string>;
}

export interface NotFoundView {
  defaultPanel: NotFoundPanel;
  panels: NotFoundPanel[];
  panelCss: string;
  localeScript: NotFoundLocaleConfig;
  menuLocaleVariants: Record<string, ContextMenuLocaleVariant>;
}

export function buildNotFoundView(model: SiteModel, helpers: NotFoundBuildHelpers): NotFoundView;
export function renderNotFoundLocaleScript(config: NotFoundLocaleConfig): string;
```

`buildNotFoundView(model, helpers)`：

1. 按 `model.locales` 顺序为每个 Locale 取 `sharedMessagesFor(locale.code)`。
2. `heading = 404 · ${messages.notFound.titleSuffix} · ${locale.title}`。
3. 调 `buildActionMenuConfig(model, locale, { kind: 'not-found' }, heading)`。
4. 生成 `backToEntry`、`allDesigns`、`allDesignsHref`（受 `model.switcherEnabled` 门控）、
   `defaultDesignHref`、`defaultDesignName`。
5. 生成 `panelCss`：默认隐藏所有区块，无 `[data-404-locale]` 时显示 `[data-default]`；有属性时
   用 `html[data-404-locale="<path>"] [data-404-panel="<path>"]` 显示对应区块。
6. 生成 `localeScript`：base、默认 path、`model.localeStorageKey`、每个 Locale 的
   `code/path/matchTags`、`titles`（按 path 索引）。
7. 生成 `menuLocaleVariants`：按 Locale path 索引，包含菜单运行时需要的本地化字段。

`renderNotFoundLocaleScript()` 生成无依赖的内联 ES5 风格脚本，复用与入口路由一致的匹配算法：

1. 从 `location.pathname` 去掉部署 base 后取第一段；精确匹配 `path` 即命中。
2. 否则读取 `localStorage[storageKey]`，规范化首尾 `/` 后精确匹配 path；非法值直接忽略。
3. 否则按 `navigator.languages` 顺序匹配；缺失时用 `navigator.language`；`matchTags` 已由
   `localeMatchTags()` 预计算，最长标签优先。
4. 否则用 `defaultPath`，再否则第一个 Locale。
5. 设置 `document.documentElement` 的 `lang` 与 `data-404-locale`（path），并设置
   `document.title = titles[path]`。
6. **不调用** `localStorage.setItem()` 或 `removeItem()`；所有存储读取都在 try/catch 内。
7. 任何异常都不阻止页面显示默认区块（脚本自然退出，HTML 保持无 `data-404-locale` 状态）。

### 2. 404 页面

`src/pages/404.astro`：

```astro
const model = await loadSite();
const view = buildNotFoundView(model, {
  sharedMessagesFor,
  buildActionMenuConfig,
  localeDesignHref,
  localeHref,
});
const contextMenu = {
  ...view.defaultPanel.contextMenu,
  localeVariants: view.menuLocaleVariants,
};
const script = renderNotFoundLocaleScript(view.localeScript);
const fallbackLanguage = languageSwitcherData(
  model,
  view.defaultPanel.locale,
  (entry) => localeHref(entry.path),
);
```

- `<html lang={view.defaultPanel.locale.code}>`；默认 Locale 是 `i18n.defaultLocale`。
- `<HeadMeta title={view.defaultPanel.heading} robots="noindex, follow" />`。
- Head 内追加 `<style is:inline set:html={view.panelCss} />` 与
  `<script is:inline set:html={script} />`；脚本位于 `<title>` 之后，保证能设置标题。
- Body 的 `<h1>404</h1>` 保持唯一；`view.panels.map(...)` 渲染 `div` 区块：

```astro
<div
  class="not-found-panel"
  data-404-panel={panel.locale.path}
  data-default={panel.locale.code === view.defaultPanel.locale.code ? 'true' : undefined}
  lang={panel.locale.code}
>
  <p>{panel.body}</p>
  {panel.locale.code === view.defaultPanel.locale.code ? (
    <noscript><LanguageSwitcher language={fallbackLanguage} /></noscript>
  ) : null}
  <ul class="infra-list">...</ul>
</div>
```

- 默认区块内放 `<noscript>` 语言链接；无 JS 时默认区块可见，其它区块 `display: none`。
- `<ContextMenu config={contextMenu} />` 只渲染一次。

### 3. 菜单运行时

在 `src/lib/context-menu.ts` 增加：

```ts
import type { LocaleMessages } from '../i18n/messages';

export interface ContextMenuLocaleVariant {
  switcherHref: string;
  shareTitle: string;
  targets: ContextMenuTarget[];
  toast: ContextMenuToastMessages;
  launcherLabel: string;
  menuLabel: string;
  closeLabel: string;
  cancel: string;
  languages?: ContextMenuLanguageItem[];
  contextMenu: LocaleMessages['contextMenu'];
}

export interface ContextMenuRuntimeConfig {
  // ...
  localeVariants?: Record<string, ContextMenuLocaleVariant>;
}
```

`initContextMenu()` 读取 `data-cm-config` 后：

1. 从 `document.documentElement.getAttribute('data-404-locale')` 取 path。
2. 若 `config.localeVariants[path]` 存在，用 variant 覆盖运行配置中的：
   `switcherHref`、`shareTitle`、`targets`、`toast`、`launcherLabel`、`menuLabel`、
   `closeLabel`、`cancel`、`languages`。
3. 调 `applyMenuLocale(variant)` 更新一份 DOM：
   - `.cm` 与 `.cm-sheet` 的 `aria-label`、`.cm-sheet-title`。
   - 所有 `[data-cm-action]` 的 `.cm-label`：
     `reload/top/copy/print/share/random/switch`。
   - `[data-cm-group="page|design|language"]` 文本。
   - `.cm-sub-trigger .cm-label` 与 `[data-cm-submenu]` 的 `aria-label`。
   - `.cm-launcher` 的 `aria-label`；`.cm-sheet-close` 的 `aria-label`；
     `.cm-sheet-cancel` 文本。
   - 随机项 `aria-disabled` 按 `variant.targets.length < 2` 更新。
   - `[data-cm-action="switch"]` 的 `href` 更新为 `variant.switcherHref`。
   - 所有 `.cm-lang`：按 `variant.languages` 更新 `href`、`aria-current` 与 `.cm-check` 的
     `cm-check-hidden` 类。
4. 对非 404 页面（无 `data-404-locale` 或无 variants）不执行任何更新，保持现状。

`ContextMenu.astro` 改动：

- `runtimeConfig` 带出 `localeVariants: config.localeVariants`（无值时不进 JSON）。
- 移动面板分组增加 `data-cm-group="page" / "design" / "language"`。
- 仅在 `config.localeVariants` 存在（即 404）时为每个语言项渲染 Check；设计页 / 切换页只渲染
  当前语言项，避免给所有菜单页增加无用 SVG。404 的非当前项加 `cm-check-hidden` 类，CSS 写
  `.cm-check.cm-check-hidden { display: none; }`。Lucide 的 `Check` 类型不接受 `hidden`，
  且图标本身已 `aria-hidden`，用命名类隐藏既避开类型冲突，也不会进入无障碍树。
- 不复制菜单 DOM；不改变菜单动作、键盘、触控与滚动锁实现。

## 兼容与降级

| 情形 | 行为 |
|---|---|
| 无 JS | 默认 Locale 区块可见；`<noscript>` 语言链接可用；菜单 DOM 仍隐藏 |
| Head 脚本异常 | `data-404-locale` 未设置，默认区块保持可见 |
| 菜单运行时未加载 / 输入环境不匹配 | 页面内容仍按 Locale 显示；菜单不可打开（既有约束） |
| 菜单运行时无对应 variant | 菜单保持默认 Locale 标签；页面内容不回退（内部构建错误，需测试发现） |
| 非法 Locale preference | 忽略且不删除；继续浏览器语言 / 默认回退 |
| 未知路径首段（如 `/fr/...`） | 视为无路径语言，继续偏好 / 浏览器 / 默认回退 |
| 单语言配置 | 一个 panel、无语言组、无 variants 差异；脚本仍正常设置 `lang/title` |
| `BASE_PATH=/demo` | 脚本先去 base 再匹配；链接由 `localeHref` / `localeDesignHref` 生成 |

## 数据契约与边界

- 404 不新增 profile 字段、不读资料文件、不自建 i18n 字典；只消费 `loadSite()` 与共享文案。
- 404 不写 Locale preference；语言偏好仍只在菜单 `.cm-lang` 显式点击 / Ctrl/Cmd 点击 / 中键
  时由 `rememberLocale()` 写入。
- 404 的语言项目标仍由 `actionMenuLanguageItems()` 的 `not-found` 分支决定，指向
  `localeHref(entry.path)`，不改为当前错误 URL。
- 404 的 `<title>` 只本地化现有 title suffix + Locale title，不新增说明句。
- 不引入新依赖、服务端 API、Cookie 或 Hosting 配置。

## 备选方案

- **每 Locale 生成独立 404 页面 + Hosting 按路径 routing**：静态托管不可移植；GitHub Pages
  只认根 `404.html`。拒绝。
- **只渲染默认区块，运行时替换文本**：实现更小，但首屏会闪错语言，且会丢失无 JS 时的
  Locale 语义。拒绝。
- **运行时不本地化菜单，只换正文**：会出现英文正文 + 中文菜单 / 当前语言标记。拒绝。
- **无 JS 也按路径显示**：单份静态 HTML 在构建期拿不到请求路径，只能在无 JS 时显示默认。
  接受为明确限制。

## 风险与验证重点

- HTML 体积增加来自 5 个 404 正文区块与菜单 variants；需记录 `dist/404.html` 改动前后字节。
- 若页面 CSS 在脚本之前解析，需确认 `data-404-locale` 在首屏前已设置；浏览器实测检查
  `html[lang]`、可见 panel、`document.title` 与截图。
- 需验证 404 页面加载不写偏好、菜单点击写偏好；需验证 `ContextMenu` 的桌面 / 移动 / 键盘路径
  不回归。
- `manualSwitch:false`、单语言、`BASE_PATH=/demo` 三个配置分支至少各构建一次。
- 不能修改设计页 CSS / 字体；404 仍只链接共享菜单 CSS。
