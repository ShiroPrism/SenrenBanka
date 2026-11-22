# 入口语言协商与零窗口随机 — 技术设计

## 1. 边界

本设计只处理根入口的路由选择与语言偏好：

```
浏览器访问 /
  │
  ├─ 读取语言偏好（localStorage，按 base 命名空间化）
  ├─ 否则读取 navigator.languages / navigator.language
  ├─ 否则 i18n.defaultLocale
  ▼
选定 Locale 的启用设计池
  │
  ├─ random：读取/更新设计存储；cacheHours=0 时每次重抽
  └─ fixed：按既有 manualSwitch / 手选规则
  ▼
location.replace(base + localePath + '/' + designId + '/')
```

不处理：设计页渲染、设计 CSS、SEO 索引策略、共享菜单布局、设计存储格式、Locale 清单来源。

## 2. 数据模型

### 2.1 语言匹配模块

新增纯函数模块 `src/lib/locale-match.ts`：

```ts
export interface LocaleTagSource {
  code: string;
  path: string;
}

export function normalizeLanguageTag(value: string): string;
export function localeMatchTags(locale: LocaleTagSource): string[];
export function matchLocaleTag(
  tag: string,
  locales: readonly LocaleTagSource[],
): string | null;
export function matchBrowserLanguages(
  tags: readonly string[],
  locales: readonly LocaleTagSource[],
): string | null;
```

约束：

- 不 import `astro:content`、`site.ts` 或任何 CSS，保证可在 Node 测试中直接加载。
- `normalizeLanguageTag`：去空白、转小写、`_` → `-`。
- `localeMatchTags`：合并显式标签、`code` 小写、`path` 小写，去重。
- `matchLocaleTag`：标签完全相等或以 `标签 + '-'` 开头即命中；多个命中时取最长标签。
- `matchBrowserLanguages`：按传入顺序逐项匹配，返回第一个命中的 Locale path；全部失败返回 `null`。

当前五语言的显式标签（按 Locale path 取表，避免 `code` 大小写差异）：

| Locale | 匹配标签 |
|---|---|
| `zh-CN` | `zh-hans`、`zh-cn`、`zh-sg`、`zh` |
| `zh-TW` | `zh-hant`、`zh-tw`、`zh-hk`、`zh-mo` |
| `ja` | `ja` |
| `en` | `en` |
| `ko` | `ko` |

未来新增 `zh-*` Locale 必须先补显式标签，不能靠 `zh` 前缀推断；其他语言可回退到主语言子标签（如 `fr-CA` → `fr`）。

### 2.2 根脚本配置

扩展 `src/lib/router-script.ts` 的 `RouterRuntimeConfig`：

```ts
export interface LocaleRouterEntry {
  path: string;
  code: string;
  matchTags: string[];
  enabled: string[];
}

export interface LocaleNegotiationConfig {
  storageKey: string;
  defaultPath: string;
  entries: LocaleRouterEntry[];
}

export interface RouterRuntimeConfig {
  mode: 'random' | 'fixed';
  manualSwitch: boolean;
  defaultId: string;
  enabled?: string[];
  cacheHours: number;
  avoidRepeat: boolean;
  base: string;
  storageKey: string;
  /** 固定 Locale 入口使用；根入口改用 localeNegotiation。 */
  localePrefix?: string;
  /** 仅根入口提供。 */
  localeNegotiation?: LocaleNegotiationConfig;
}
```

兼容性：

- `LocaleIndex.astro` 继续传 `enabled` + `localePrefix`，脚本走固定 Locale 分支。
- `index.astro` 传 `localeNegotiation`，脚本先选 Locale，再从该 Locale 的 `enabled` 抽设计。
- 两者都不提供时视为构建期错误；由 TypeScript 与页面调用保证。

### 2.3 存储键

`router-script.ts` 增加：

```ts
export function localeStorageKeyFor(base: string): string;
```

默认键：`senrenbanka.locale.v1:<baseKey>`，其中 `baseKey` 与设计存储一致：

- `/` → `root`
- `/repo/` → `repo`

设计存储键 `senrenbanka.design.v1:<baseKey>` 不变。`SiteModel` 增加 `localeStorageKey`，由 `loadSite()` 一次性派生。

`site.storageKey` 只覆盖设计存储键，**不得**复用到语言偏好键：否则用户把设计键改为 `my-portfolio` 时，两种数据会共用同一个键。语言偏好始终按 base 命名空间化。

## 3. 根脚本运行时

生成的脚本保持单文件、无外部请求，并继续用 `safeJson` 转义 `<`。

### 3.1 Locale 选择

```js
function localeByPath(path) {
  for (var i = 0; i < C.localeNegotiation.entries.length; i++) {
    if (C.localeNegotiation.entries[i].path === path) return C.localeNegotiation.entries[i];
  }
  return null;
}

function findLocaleForTag(tag) {
  var best = null;
  var bestLength = 0;
  for (var i = 0; i < C.localeNegotiation.entries.length; i++) {
    var entry = C.localeNegotiation.entries[i];
    for (var j = 0; j < entry.matchTags.length; j++) {
      var match = entry.matchTags[j];
      if ((tag === match || tag.indexOf(match + '-') === 0) && match.length > bestLength) {
        best = entry;
        bestLength = match.length;
      }
    }
  }
  return best;
}
```

`pickLocale()` 顺序：

1. `localStorage.getItem(localeStorageKey)`；去掉首尾 `/`；命中 path 即返回。
2. 非法偏好：`removeItem`（失败忽略）。
3. 收集 `navigator.languages`（逐项）或 `navigator.language`。
4. 按数组顺序调用 `findLocaleForTag`，返回第一个命中。
5. `defaultPath`；再不行取 `entries[0]`。

### 3.2 设计与跳转

Locale 确定后：

- `enabled = locale.enabled`。
- `valid` 仍要求存储设计 ID 在当前 Locale 的 `enabled` 中。
- `fixed` 分支保持现状。
- `random` 分支保持现状；`cacheHours: 0` 时 `stored.expiresAt > now` 恒为 false，因此每次入口重抽。
- 写设计存储仍为 `{ designId, expiresAt }`，不写 Locale。
- 最终跳转：

```js
location.replace(C.base + locale.path + '/' + target + '/');
```

`path` 不含首尾斜杠；`base` 已由 `urls.ts` 归一化。

## 4. 语言偏好写入

### 4.1 数据流

```
site.config.yaml i18n.locales
  → SiteModel.locales / localeStorageKey
  → buildActionMenuConfig()
  → ContextMenu.astro（data-cm-locale）
  → context-menu.ts 点击 .cm-lang
  → localStorage[localeStorageKey] = locale path
```

### 4.2 类型与组件

- `ContextMenuRuntimeConfig` 增加 `localeStorageKey: string`。
- 菜单语言项增加 `path: string`；`ContextMenu.astro` 的桌面与移动语言链接都加 `data-cm-locale={item.path}`。
- `LanguageSwitcherData.items` 增加 `path: string`，由 `languageItems()` / `languageSwitcherData()` 填充；`LanguageSwitcher.astro` 可加 `data-locale` 供未来复用，但不引入脚本。
- `ActionMenuConfig.languages` 继承带 `path` 的类型。

### 4.3 点击处理

`context-menu.ts` 的 `.cm-lang` 分支：

```ts
const onLanguageActivate = (item: HTMLElement) => {
  const path = item.getAttribute('data-cm-locale');
  if (!path) return;
  try {
    localStorage.setItem(config.localeStorageKey, path);
  } catch {
    // 存储不可用：本次导航仍正常，偏好不被记住
  }
};
```

- 主点击（含 Ctrl/Cmd+点击）在 `onActionClick` 中写入。
- 中键 `auxclick`（button 1）也写入，但当前页面不导航。
- 不拦截默认导航；不改变菜单关闭语义。
- `html-only` 没有 `ContextMenu`，因此不写入；这是零脚本契约的明确限制。

## 5. 配置与行为矩阵

### 5.1 当前配置

```yaml
design:
  mode: random
  default: editorial
  manualSwitch: true
  random:
    cacheHours: 0
    avoidImmediateRepeat: true
```

### 5.2 行为矩阵

| 场景 | 结果 |
|---|---|
| `/`，无偏好，浏览器 `en-US` | `/en/<random>/` |
| `/`，偏好 `ja`，浏览器 `en-US` | `/ja/<random>/` |
| `/`，偏好值非法 | 清除偏好，按浏览器语言或默认语言 |
| `/ja/` | `/ja/<random>/`，不读语言偏好 |
| `/ja/fax/` | 渲染 fax；刷新仍是 fax；不写设计存储 |
| 菜单「随机一个设计」 | 切换并写入 `expiresAt: 0`；下一次入口重抽 |
| 切换页点击 fax | 进入 `/ja/fax/` 并写入 `expiresAt: 0`；下一次入口重抽 |
| `fixed` + `manualSwitch: false` | 协商 Locale 后进入该 Locale 的默认设计 |
| 无 JS `/` | `/zh-cn/editorial/` + 默认 Locale 设计列表；无语言链接 |
| `html-only` 语言点击 | 当次导航；不写语言偏好 |

## 6. SEO、降级与历史

- `/` 与 `/<locale>/` 保持 `noindex, follow`。
- 默认设计页保持 `index, follow` + self-canonical；非默认设计保持 `noindex, follow` + self-canonical；hreflang 不变。
- 不改变 canonical 的目标；不把 `/` 设为 `x-default`。
- 协商在客户端完成，静态 HTML 相同；不加 `Vary`、Cookie 或服务端重定向。
- 继续 `location.replace`，根入口不进入历史栈。
- 无 JS 根入口不新增语言链接；浏览器语言协商不可用，这是已接受限制。

## 7. 测试策略

### 7.1 纯函数测试

`scripts/locale-match.test.mjs` 通过 Node 类型剥离直接加载 `src/lib/locale-match.ts`，覆盖：

- `zh-TW` / `zh-HK` / `zh-MO` / `zh-Hant-TW` → `zh-TW`
- `zh-CN` / `zh-Hans-CN` / `zh-SG` / `zh` → `zh-CN`
- `ja-JP`、`en-US`、`ko-KR` → 对应 Locale
- `fr-FR` → `null`
- `['fr-FR', 'ja-JP']` → `ja`
- 未知 Locale 的主语言回退（如未来 `fr-CA` → `fr`）
- `localeStorageKeyFor('/')` → `senrenbanka.locale.v1:root`；`localeStorageKeyFor('/demo/')` → `senrenbanka.locale.v1:demo`；不读取 `site.storageKey` 覆盖值

### 7.2 运行时与产物验证

- 根脚本产物包含 `localeStorageKey`、`matchTags`、所有 Locale 的 `enabled` 池。
- 断言 `/` 仍是零外部请求、单次 `location.replace`。
- 断言 `html-only` 最终 HTML 没有新增 `<script>` 或事件处理器。
- 断言设计页 canonical / robots / hreflang 与基线一致。

### 7.3 浏览器矩阵

使用 preview + Playwright / 浏览器实测：

- 清空语言偏好，设置 `navigator.languages` 为 `en-US`、`ja-JP`、`zh-TW`、`zh-HK`、`zh-Hans-CN`、`fr-FR`，验证 A1。
- 写入语言偏好 `ja`，设置浏览器 `en-US`，验证 A2。
- 在共享菜单点击 English，再访问 `/`，验证 A3。
- 连续访问 `/` 两次，验证 A4；再访问 `/ja/fax/` 并按 F5，验证稳定。
- 临时切 `mode: fixed` / `manualSwitch: false`，验证 A5；测后恢复。
- 禁用 JS，验证 A6。
- `BASE_PATH=/demo` 构建，验证根脚本目标与语言存储键命名空间。

## 8. 回滚

- 恢复 `index.astro` 固定默认 Locale，删除 `localeNegotiation` 分支。
- 恢复 `cacheHours: 24`。
- 删除语言偏好存储与 `.cm-lang` 写入；保留设计存储不变。
- 文档与 ADR 标记为 superseded，不删除历史。
