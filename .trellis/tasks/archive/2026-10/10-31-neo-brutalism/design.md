# `brutal` 技术设计

## 文件边界

新增：

```
src/designs/brutal/
├─ DESIGN.md          # 视觉规范（先写，后实现）
├─ design.json        # displayName / description / enabled / accent / source
├─ messages.ts        # zh-CN / ja / en 三语言文案
├─ Page.astro         # 完整文档；loadDesignView + HeadMeta + Reveal + ContextMenu
├─ style.css          # Tailwind 入口 + 设计样式 + @theme inline
├─ tokens.css         # 色板 / 间距 / 边框 / 阴影 / 动效令牌
└─ Preview.astro      # 切换页自包含预览
docs/verification/brutal.md   # 验证状态
```

不改：现有设计、`src/components/`、`src/lib/`、`astro.config.mjs`、数据契约、ADR。

## 数据流

- `Page.astro` frontmatter：`const view = await loadDesignView('brutal', Astro.url.pathname);`
- `view.profile`：`name` / `headline` / `bio` / `links` 必渲染；`projects` / `experience` / `skills` / `contact` 条件渲染；`avatar` / `location` 可选。
- `view.head` 原样传给 `<HeadMeta {...view.head} />`。
- `view.contextMenu` 原样传给 `<ContextMenu config={view.contextMenu} />`。
- 所有内部链接使用 `localeDesignHref()` / `localeHref()` / `withBase()`；站外链接直接使用 profile URL。
- `messages.ts` 导出 `Record<'zh-CN' | 'ja' | 'en', BrutalMessages>`；页面不写死可见文案。

## DOM 结构

```
<html lang={view.head.lang}>
  <head> HeadMeta, Font x4, Reveal </head>
  <body class="bt">
    <header class="bt-header"> 姓名 / 索引 / 地点 </header>
    <main class="bt-main">
      <section class="bt-hero">
        eyebrow / h1 headline / bio / links 按钮组
      </section>
      <section class="bt-section" data-reveal> projects 卡片 </section>
      <section class="bt-section" data-reveal> experience 台账 </section>
      <section class="bt-section" data-reveal> skills 贴纸 </section>
      <section class="bt-contact" data-reveal> contact </section>
    </main>
    <footer class="bt-footer"> 姓名 / 年份 / 声明 </footer>
    <ContextMenu config={view.contextMenu} />
  </body>
</html>
```

- 每个 section 用 `aria-labelledby` 指向可见 `h2`。
- 装饰性编号 / 贴纸 / 箭头一律 `aria-hidden="true"`。
- `links` 渲染为 `<a class="bt-link">`；`contact.email` 渲染为 `mailto:`；无链接时按设计显示 `t.noContact`，不伪造地址。
- 可选区块不存在时不渲染空 section；`contact` 若既无 email 也无 note，不渲染 contact 区块或只保留可见标题（按 DESIGN.md 定稿）。

## 字体与 CSS

- `<Font cssVariable="--font-league-gothic" />`、`--font-inter`、`--font-jetbrains-mono`、`--font-zhuque`。
- `style.css`：

```css
@import "tailwindcss" source(none);
@source "./";
@source not "./Preview.astro";
@import "./tokens.css";

@theme inline {
  --font-bt-display: var(--font-league-gothic);
  --font-bt-body: var(--font-inter);
  --font-bt-mono: var(--font-jetbrains-mono);
}

.bt { ... }
```

- 字体栈（每个都带完整回退）：
  - display: `var(--font-league-gothic), var(--font-zhuque), 'PingFang SC', 'Microsoft YaHei', sans-serif`
  - body: `var(--font-inter), var(--font-zhuque), 'PingFang SC', 'Microsoft YaHei', sans-serif`
  - mono: `var(--font-jetbrains-mono), var(--font-zhuque), 'PingFang SC', 'Microsoft YaHei', monospace`
- `tokens.css` 作用域 `:is(.bt, .bt-pv)`；变量：纸色、墨色、橙、蓝、酸黄、muted、线宽、阴影、间距、时长、曲线。
- 不使用 `:root`；不在 `Page.astro` 写 `<style>`；不 import 其他设计 CSS。
- 动效只动 `opacity` / `transform`；hover / active 位移与阴影；`prefers-reduced-motion: reduce` 下关闭动画与位移。

## Preview 契约

- `Preview.astro` 使用 `PreviewProps`（locale / name / headline / location / links）。
- `export const fonts = ['--font-league-gothic', '--font-inter', '--font-jetbrains-mono', '--font-zhuque'];`
- 不 import `style.css`；只 import `./tokens.css`；样式用组件 `<style>`；无 `:root`；无 `<Font>`；无可聚焦元素；调用方 `aria-hidden`。
- 视觉签名：粗边框架 + 巨型姓名 + 两枚硬边按钮 + 两张硬阴影卡片；保持 16/10 预览画幅内可读。

## 验证计划

- `npm run fonts:typography`（字体栈门禁）。
- `npm run build`（含 fonts:check / astro check / build / subset / prune / html-only / audit）。
- `design-page-verify` 全流程：桌面 1440、平板 768、375px、键盘、对比度、减动态、无 JS、构建产物检查。
- 记录 `dist` 构建前后体积与 `docs/verification/brutal.md`。
- 若构建体积超 10 MiB：记录并另开容量任务，不降低设计质量。

## 风险与对策

| 风险 | 对策 |
|---|---|
| CJK 在 League Gothic 下回退不可控 | display/body/mono 栈都显式包含 `--font-zhuque` + 系统中文 |
| 酸性黄对比度不足 | 酸黄只作底色 + 墨黑文字；正文不用酸黄 |
| 粗边 / 硬阴影导致 375px 溢出 | `box-sizing: border-box`、`max-width: 100%`、`overflow-wrap: anywhere`、单列网格 |
| Preview 样式注入正式页 | `@source not "./Preview.astro";` 实测确认 CSS 不增工具类 |
| Preview 的 `:root` 泄漏 | tokens 仅用 `:is(.bt, .bt-pv)` |
| 字体变量重复声明 | 预览只导出 `fonts`，不写 `<Font>`；切换页按族去重声明 |

## 不做

- 设计专属 JS、canvas、WebGL、音频、自定义光标。
- 新字体、图片、第三方依赖。
- 修改共享组件或现有设计。
