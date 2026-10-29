# 原生 HTML 设计作为显式的无 CSS/JS 渲染模式

**Status:** accepted

SenrenBanka 的常规设计契约要求 `style.css`、字体/动效接线和共享操作菜单，这些都会向最终页面注入 CSS 或 JavaScript。为了让“无自定义 CSS 与 JavaScript 的语义化 HTML 仍能完整呈现同一份资料”成为可验证的设计，需要允许一类显式声明、审计边界清晰的例外，而不是用空 CSS 文件或文件缺失来伪装。

## Decision

1. `design.json` 新增 `renderMode`，取值为 `styled` 或 `html-only`，缺省为 `styled`。
2. `html-only` 设计必须提供 `DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`；不得提供 `style.css` 或 `tokens.css`。
3. `html-only` 页面必须继续使用 `loadDesignView()`、`view.head.lang` 与原样传入的 `<HeadMeta>`，保留 profile 核心资料、三语路由、SEO、base path、随机池和手动切换页中的设计身份。
4. `html-only` 页面不得渲染 `Font`、`Reveal`、`ContextMenu`、`InfraStyles` 或任何自定义样式/脚本；语言与设计切换由普通 `<a>` 完成。页面不提供随机按钮，但设计本身仍可被入口随机选中。
5. 产物验收按最终 HTML 的 `rel` 与标签判断：允许 `canonical` / `alternate` / `icon` 等 metadata 链接，禁止 `<style>`、`style` 属性、任何 `<script>`、stylesheet / preload、事件处理器及 `iframe` / `object` / `embed`。
6. 构建必须执行产物级 HTML-only 校验；主题源码能通过类型检查不算验收。

7. `html-only` 可提供可选的 `Preview.astro` 供切换页使用；预览必须完全自包含，不 import 正式页 CSS，也不得改变第 4、5 条对正式 HTML-only 页面的资源约束。

## Considered Options

- **保留一个未引用的空 `style.css` 以满足旧校验**：会把“没有样式”和“忘记接样式”混为一谈，否决。
- **根据 `style.css` 是否存在自动推断模式**：文件缺失可能来自错误，无法表达设计意图，否决。
- **允许少量页面 CSS、只禁 JavaScript**：不能满足本主题“无 CSS/JS”的定义，否决。
- **让 HTML-only 页面复用共享操作菜单的静态 DOM**：当前菜单 DOM 含内联样式和脚本，且无 JS 时全部入口带 `hidden`，不能作为回退，否决。

## Consequences

- 注册表、项目规则、验证 skill 与构建脚本都要理解两种渲染模式；`styled` 的既有契约保持不变。
- HTML-only 页面自身不能实现随机抽选或持久化当前主题；随机与手选语义只发生在入口、切换页与其他常规设计页。
- 两套渲染模式共享同一路由、资料、locale、SEO 与 enabled 语义，不形成第二套站点架构。
- 现有常规设计页的“无 JS 语言切换回退”缺陷仍独立存在，不由本决定修复。
