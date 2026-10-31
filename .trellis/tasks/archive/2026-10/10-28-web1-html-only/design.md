# 技术设计：Web 1.0 与 HTML Only 双主题

## 1. 现状约束

- 自动发现分为两条独立路径：`astro.config.mjs` 按 `Page.astro` 注入路由；`src/designs/registry.ts` 按 `design.json` 建立注册与元数据。
- 当前注册表无条件要求 `style.css`，但没有任何共享代码自动加载它；CSS 全部由各 `Page.astro` 显式 import。
- `HeadMeta` 无 CSS/JS；`Font`、`Reveal`、`ContextMenu`、`InfraStyles` 都会注入样式、脚本或两者。
- `loadDesignView()` 已统一处理 locale、profile、SEO、设计元信息与操作菜单目标池。
- 当前构建命令只有 `astro check` 与 `astro build`，没有产物资源禁令测试；CI 只运行 `npm run build`。
- 父/子任务是逻辑分组，没有阻塞机制；顺序必须写进任务文档。

## 2. 渲染模式契约

### 2.1 数据模型

`designMetaSchema` 增加：

```ts
renderMode: z.enum(['styled', 'html-only']).default('styled')
```

JSON 中的 `renderMode` 可省略；省略即常规设计，避免修改既有 16 份 manifest。`html-only` 必须显式声明。

### 2.2 文件契约

| 文件 | `styled` | `html-only` |
|---|---|---|
| `DESIGN.md` | 必需 | 必需 |
| `design.json` | 必需 | 必需 |
| `Page.astro` | 必需 | 必需 |
| `messages.ts` | 必需 | 必需 |
| `style.css` | 必需 | **禁止存在** |
| `tokens.css` | 可选 | 本主题不使用 |
| `Preview.astro` | 可选 | 可选；只能自包含，不得 import 正式页 CSS |
| 私有组件 / assets | 可选 | 本主题不使用 |

注册表错误信息必须根据模式给出明确原因，不能继续声称所有设计都缺 `style.css`。

### 2.3 页面资源契约

`html-only` 页面允许：

- DOCTYPE、`html` / `head` / `body` 与任意语义化 HTML；
- `<meta>`、`<title>`；
- `<link rel="canonical|alternate|icon">`；
- 普通 `<a href>`、页内锚点与 `mailto:`。

`html-only` 页面禁止：

- `<style>`、任何 `style` 属性；
- 任何 `<script>`，含 `application/json` 配置脚本；
- `link[rel=stylesheet]`、`link[rel=preload]`、`link[rel=modulepreload]` 或其他资源预取链接；
- `on*` 事件处理器；
- `iframe` / `object` / `embed`；
- `Font`、`Reveal`、`ContextMenu`、`InfraStyles`、`LanguageSwitcher` 组件渲染；
- 页面级 `style.css` import 与 Tailwind 预检。

`HeadMeta` 原样复用。favicon 是站点 metadata，允许存在并可能产生一次图片请求。

## 3. HTML Only 页面设计

### 3.1 数据流

1. `loadDesignView('html-only', Astro.url.pathname)` 取当前资料与统一 head。
2. 直接使用 `view.profile`、`view.locale`、`view.locales`、`view.site.manualSwitch`。
3. 设计自身界面文案来自 `src/designs/html-only/messages.ts`。
4. 语言链接生成为同一 `html-only` id 的三语 URL；设计切换链接仅在 `manualSwitch` 开启时生成。
5. 不使用 `contextMenu` 组件，但可继续使用 `localeDesignHref()` / `localeHref()` 生成地址。

### 3.2 语义结构

```text
<html lang=view.head.lang>
  <head>: HeadMeta only
  <body>
    <header>: name(h1), headline, optional location
    <nav>: page sections + languages + all designs (conditional)
    <main>
      Links
      Projects? / Experience? / Skills? / Contact?
    </main>
    <footer>: back-to-top anchor
```

内容规则：

- 渲染所有核心字段与所有实际存在的扩展区块；
- `avatar` 不渲染，避免无样式的大图干扰；
- `contact.email` 使用 `mailto:`，`contact.note` 作为说明；
- 分区标题、导航标签与回顶文字来自 `messages.ts`；
- 每个 `<section>` 有可访问名称；装饰性 `<hr>` 不需要可访问名。

### 3.3 导航语义

- 语言项是普通锚点，保持当前 `html-only` 主题，并带 `hreflang` / `lang` / 当前页 `aria-current`。
- 设计切换只放一个“全部设计”链接到 `/{locale}/designs/`；不复制 18 套清单。
- 不提供“随机”链接：静态页面无法执行随机与 localStorage 更新。
- 页面仍由入口随机脚本选中，仍出现在切换页；从 HTML Only 切到其他主题后，目标页可正常使用 CSS/JS。

## 4. 构建产物验证器

新增 `scripts/verify-html-only.mjs`，以 `node` 原生能力 + 现有 `yaml` 依赖读取：

- `src/data/site.config.yaml` 的 locales；
- `src/designs/*/design.json` 的 `renderMode`；
- `dist/<locale.path>/<id>/index.html`。

对每个 HTML-only 设计 × locale：

1. 页面必须存在；
2. 扫描开始标签并拒绝 `<style>`、`<script>`、`iframe`、`object`、`embed`；
3. 扫描属性并拒绝 `style`、`on*`；
4. 解析每个 `<link>`，`rel` 只允许 `canonical` / `alternate` / `icon`；
5. 拒绝 stylesheet / preload / modulepreload 及间接 CSS/JS 资源；
6. 错误输出文件路径、违规标签/属性与原因，非零退出。

命令接线：

```json
{
  "verify:html-only": "node scripts/verify-html-only.mjs",
  "build": "npm run check && astro build && npm run verify:html-only"
}
```

因 CI 已调用 `npm run build`，无需新增工作流步骤。

负向验证：在临时 `outDir` 的副本中注入 `<style>`、`<script>`、`style=` 和 stylesheet link，确认验证器逐项失败；临时产物不得留在仓库。

## 5. Homepage '99 设计边界

- 隐喻：个人主页作者手工维护的“链接目录 + 内容页 + 徽章侧栏”，不是设备拟物。
- 骨架：语义 `header/nav/main/aside/footer` + CSS Grid；真实 `<table>` 只用于经历等结构化数据。
- 字体：标题 Times 系、正文 Arial/Helvetica 系、技术标签 Courier New 系，全部系统字体，不修改 `astro.config.mjs`。
- 视觉：有限调色板、粗边框、深浅交错分区、背景平铺纹理、侧栏目录、主内容与右侧徽章轨。
- 装饰：静态 Under Construction 条、2–3 枚 CSS 文字徽章、明确标注离线的 Visitor Counter；不含 Guestbook / Webring / 远程 GIF。
- 动效：无 Reveal、无闪烁；唯一循环是施工条低速位移斜纹，reduced-motion 下静止。
- 预览：`tokens.css` 共享调色板；`Preview.astro` 自包含迷你主页，不 import `style.css`、不声明 `<Font>`。

## 6. 文件所有权

| 文件/目录 | HTML Only 子任务 | Homepage '99 子任务 | 父任务 |
|---|---|---|---|
| `src/designs/registry.ts` | 修改 | 不修改 | 复查 |
| `scripts/verify-html-only.mjs` | 新增 | 不修改 | 复查 |
| `package.json` / lockfile | 修改 script | 不修改 | 复查 |
| `AGENTS.md` / `SPEC.md` / verify skill | 修改 | 不修改 | 复查 |
| `docs/adr/0009-*.md`、`CONTEXT.md` | 规划阶段已落盘 | 只读 | 复查 |
| `src/designs/html-only/**` | 全部（含自包含 Preview） | — | 复查 |
| `src/designs/homepage99/**` | — | 全部 | 复查 |
| `src/designs/descriptions.ts` | 只改 `html-only` 条目 | 只改 `homepage99` 条目 | 最终核对 |
| `docs/verification/html-only.md` | 新增/维护 | — | 复查 |
| `docs/verification/homepage99.md` | — | 新增/维护 | 复查 |
| `docs/verification/shared.md` | 修改共享机制事实 | 仅在需要时记录 | 最终核对 |
| change-log / 版本 | 不单独发布 | 不单独发布 | 最终整合阶段 |

## 7. 顺序、回归与回滚

- 顺序：HTML Only → Homepage '99 → 父任务最终复查。
- 回滚 HTML Only 契约：还原 `registry.ts`、package script、验证器与规范；删除 `html-only` 目录及 descriptions 条目。
- 回滚 Homepage '99：删除主题目录与 descriptions 条目；`astro.config.mjs` 未改字体，无额外回滚点。
- 贯穿回归：既有 16 套页面数、单设计 CSS 隔离、随机池、切换页、三语 SEO、base path、共享操作菜单。

## 8. 已知问题记录

- 当前 ContextMenu 的静态移动面板带 `hidden` 且无 `<noscript>` 回退；设计页无 JS 时语言入口不可用。
- `messages.ts` 的动态 locale 完整性未在注册表校验。
- `_draft` 目录在路由与注册两处规则不一致。

以上列为独立风险，不纳入本次实施。
