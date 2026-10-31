# 技术设计：HTML Only 原生渲染契约与主题

> 本文件是任务技术设计，不是交付物 `src/designs/html-only/DESIGN.md`。

## 1. 模式与注册表

### 1.1 Schema

在 `designMetaSchema` 增加：

```ts
renderMode: z.enum(['styled', 'html-only']).default('styled')
```

`DesignMeta` 自动继承该字段。注册表维护函数分模式检查：

- 共同必需：`DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`；
- `styled`：`style.css` 必须存在；
- `html-only`：`style.css` / `tokens.css` 必须不存在，错误信息直接说明该模式禁止 CSS 入口；`Preview.astro` 可选且必须自包含。

不修改路由扫描。`Page.astro` 存在仍会注入三语路由与旧路径兼容入口；registry 继续负责 enabled 与元信息。

### 1.2 回归保障

- 16 份既有 `design.json` 不新增字段，依靠 default 保持原行为。
- `allDesigns` / `enabledDesigns` 结构不变。
- `site.ts`、随机脚本与 ContextMenu 不需要理解渲染模式。

## 2. 页面实现

### 2.1 文件

```text
src/designs/html-only/
├─ DESIGN.md
├─ design.json
├─ Page.astro
├─ messages.ts
└─ Preview.astro     # 可选：仅切换页使用，自包含
```

`design.json`：

```json
{
  "displayName": "HTML Only",
  "description": "Semantic HTML with no custom CSS or JavaScript.",
  "enabled": true,
  "renderMode": "html-only",
  "accent": "#111111",
  "source": { "type": "self-produced" }
}
```

### 2.2 组件边界

允许 import：

- `HeadMeta.astro`；
- `loadDesignView`、`localeDesignHref`、`localeHref`；
- 本设计 `messages.ts`。

禁止 import / 渲染：

- `ContextMenu.astro`、`Reveal.astro`、`LanguageSwitcher.astro`、`InfraStyles.astro`；
- `astro:assets` 的 `Font`；
- 本目录不存在的 `style.css`；
- 任何客户端脚本或 style 属性。

`Preview.astro` 不属于正式页组件边界：它只在切换页渲染，样式写入组件 `<style>`，不得 import 正式页 CSS 或 `tokens.css`。

### 2.3 DOM

```html
<html lang={view.head.lang}>
  <head><HeadMeta {...view.head} /></head>
  <body>
    <header>
      <h1>{profile.name}</h1>
      <p>{profile.headline}</p>
      <p>{profile.bio}</p>
      {location?}
    </header>
    <nav aria-label={t.navigation}>
      <h2>{t.contents}</h2>
      <ul> section anchors </ul>
      <h2>{t.languages}</h2>
      <ul> locale links </ul>
      {manualSwitch? <p><a>{t.allDesigns}</a></p>}
    </nav>
    <main>
      <section id="links" aria-labelledby="links-title">…</section>
      {projects?}
      {experience?}
      {skills?}
      {contact?}
    </main>
    <footer><a href="#top">{t.backToTop}</a></footer>
  </body>
</html>
```

`id="top"` 可挂在 `body` 或页首元素。每个存在区块的目录项都来自同一条件，避免链接到不存在锚点。

### 2.4 数据映射

- links：`<ul><li><a href={link.url}>{link.label}</a></li></ul>`；
- projects：标题（可选链接）、描述、tags 列表；
- experience：`<dl>` 或 `<ul>`，保留 org / role / period / description；
- skills：单项 `<ul>`；
- contact：`<address>`，可选 `mailto:` 与 note；
- 文本内容不做样式化装饰，标题层级按 `h2` 分区、`h3` 子项。

### 2.5 导航

语言链接：

```ts
localeDesignHref(entry.path, 'html-only')
```

设计切换：

```ts
localeHref(view.locale.path, 'designs/')
```

只在 `view.site.manualSwitch` 为 true 时输出。语言项以 `entry.code === view.locale.code` 标 `aria-current="page"`。

## 3. 产物验证器

### 3.1 命令

- `scripts/verify-html-only.mjs`
- `npm run verify:html-only`
- `npm run build` 末尾调用验证器
- 支持 `--dist <dir>`，默认 `dist`

### 3.2 发现

1. 读取 `src/data/site.config.yaml`；
2. 扫描 `src/designs/*/design.json`；
3. 筛选 `renderMode === 'html-only'`；
4. 若没有候选，直接失败，防止门禁空转；
5. 对每个候选 × 每个 locale 读取对应 `index.html`。

### 3.3 检查

扫描开始标签，而不是对全文做模糊 grep：

- 禁止标签：`style`、`script`、`iframe`、`object`、`embed`；
- 禁止属性：`style`、所有 `on*`；
- `<link>` 必须先取得 `rel`；允许集合为 `canonical`、`alternate`、`icon`；
- 其他 link 一律失败，覆盖 stylesheet、preload、modulepreload、prefetch；
- 错误以 `[senrenbanka] html-only verification failed` 统一前缀输出。

不递归扫描其他设计页面或 switcher；HTML-only 的链接目标只需检查 URL 正确和文件存在，不把离开该主题后的目标资源纳入禁用范围。

### 3.4 负向验证

复制 `dist` 到系统临时目录，分别注入违规片段并运行 `--dist <temp>`：

1. `<style>body{}</style>`
2. `<script>alert(1)</script>`
3. `<div style="color:red">`
4. `<link rel="stylesheet" href="/x.css">`

四条都必须失败；删除临时目录后 `git status` 无残留。

## 4. 文档与规范同步

- `AGENTS.md`：新增渲染模式；`style.css`、ContextMenu、字体、Reveal 规则改为分模式；删除“移动面板 DOM 是可用无 JS 回退”的错误表述。
- `SPEC.md`：同步 §6.1 / 6.2 / 6.3 / 8 / 10 / 13。
- `.agents/skills/design-page-verify/SKILL.md`：`styled` 与 `html-only` 分轨；HTML-only 不要求菜单/Reveal/字体测试，改测纯 HTML 导航与产物门禁。
- `docs/verification/action-menu.md`：如实记录上下文菜单仍无无 JS 回退。
- `docs/verification/shared.md`：记录新模式、验证器与当前产物数字。
- `docs/verification/html-only.md`：完整当前验证状态。
- `src/designs/descriptions.ts`：新增 `html-only` 三语说明。

## 5. 风险与回滚

| 风险 | 防护 | 回滚 |
|---|---|---|
| 默认值未生效导致既有 manifest 全失败 | 显式验证 16 套既有设计构建 | 修正 schema default，不写空值到 manifest |
| Astro 隐式注入 style/script | 实际产物验证，不查源码猜 | 移除触发注入的组件 |
| 验证器误报文本中的 `<style>` | 只扫描开始标签并处理 HTML 实体 | 调整扫描器并保留负向测试 |
| 无 JS 菜单事实被误写 | 引用现有验证记录与代码 | 修正文档，不夸大能力 |
| 验证器空转 | 无候选或页面缺失即失败 | 保持 fail-closed |
