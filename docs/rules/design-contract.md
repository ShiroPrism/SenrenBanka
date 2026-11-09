# 设计交付契约

> **适用范围**：每套设计的渲染模式、必交文件、预览碎片与构建期约束。
>
> **权威级别**：本文件是该项目主题规则的唯一正文来源；根 `AGENTS.md` 只提供硬门禁与路由。
>
> **相关决策**：[`../adr/0009-html-only-design-rendering.md`](../adr/0009-html-only-design-rendering.md)
>
> **维护归属**：规则变更先修改本文件，再检查根索引与引用。

## 每套设计必须满足

`design.json.renderMode` 显式区分两种渲染契约；省略时默认 `styled`，`html-only` 必须显式声明。

| 文件 / 能力 | `styled`（默认） | `html-only` |
|---|---|---|
| `DESIGN.md` / `design.json` / `Page.astro` / `messages.ts` | 必需 | 必需 |
| `style.css` / `tokens.css` / `Preview.astro` | `style.css` 必需；其余可选 | `style.css` / `tokens.css` **禁止存在**；`Preview.astro` 可选，但必须完全自包含 |
| 最终页面 CSS / JS | 自身样式、字体、动效与共享菜单 | 仅语义 HTML + 获准 metadata 链接 |
| 操作 / 语言入口 | 共享操作菜单 | 普通链接导航 |

1. 共同必交文件：`DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`（见 [`data-and-i18n.md`](./data-and-i18n.md)）；`style.css` 只由 `styled` 设计提供。
2. `Page.astro` 是完整文档（含 `<html>`），`<head>` 中必须原样包含 `<HeadMeta {...view.head} />`。
3. `styled` 的 `style.css` 首两行必须为：

   ```css
   @import "tailwindcss" source(none);
   @source "./";
   ```

   （如 import 了共享组件且其含工具类，追加 `@source` 指向共享目录）。`html-only` 不得提供 `style.css`、`tokens.css`、`Font`、`Reveal`、`ContextMenu`、`InfraStyles` 或任何自定义页面样式 / 脚本；最终 HTML 禁止 `<style>`、`style` 属性、`<script>`、事件处理器、`iframe` / `object` / `embed`、stylesheet / preload、`javascript:` URL 与 meta refresh，`<link>` 只允许 `canonical` / `alternate` / `icon`。其可选的 `Preview.astro` 只属于切换页，样式必须自包含，且不得 import 正式页 CSS。

   `styled` 仅在设计隐喻的核心交互存在纯 CSS 表达缺口时，提供一个设计目录私有的客户端入口（ADR 0011）。该入口只在该设计页加载，不得成为共享视觉运行时，不得 import CSS，不得门控核心内容或真实链接；无 JS / 加载失败 / 初始化失败 / 减动态时必须保留完整可见终态。切换页预览不得执行设计脚本。
4. `styled` 必须接入共享操作菜单（`<ContextMenu config={view.contextMenu} />`，放于 `<body>` 末尾，**无条件**渲染）；不得再放任何可见的「全部设计 / 切换设计 / Switch design」链接、按钮或导航项，也不得留下隐藏但可聚焦的旧入口。`html-only` 不接入菜单，必须提供页内目录、同主题语言普通链接，并在 `manualSwitch: true` 时提供一条「全部设计」普通链接。
5. `styled` 字体：人工只维护 `fonts.config.json` 的 app-only family 选择；`npm run fonts:update` 从固定字体目录生成 `fonts.lock.json` / `fonts.catalog.json` / `src/fonts/generated.ts`，`npm run fonts:prepare` 校验并安装 `.cache/fonts/`，`astro.config.mjs` 再展开生成定义接入 `local` provider。六个 npm family 与全部 local family 在 Astro registration 中必须 `fallbacks: []` + `optimizedFallbacks: false`；既有 npm provider 还必须保持 `remote: false`，且把 provider 返回的包 URL 映射回已安装的 `node_modules` 本地文件。页面仍用 `<Font cssVariable ...>`（`astro:assets`），`style.css` 用 `@theme inline` 注册进 Tailwind；**完整回退链由本设计 CSS 拥有**，使用字体变量的 `font` / `font-family` 必须有显式 fallback，且系统 CJK 不得排在 Zhuque / LXGW / Ark Pixel 之前。已选用 core-cjk 的设计，其每个字体变量栈（含预览）都必须保留该核心变量，否则新增 CJK 文案仍可能落系统字体。新增主题的字体选型必须先走 `../fonts/selection-guide.md` 流程（先隐喻、后样张目检、过许可闸门），见 [`visual-language.md`](./visual-language.md) 的字体章节。`html-only` 不选字体、不注册字体、不加载字体资源，采用浏览器用户默认排版。
6. `design.json` 的 `source`：非自产（`official-vendor` / `official-docs-derived` / `third-party-analysis`）必须填 `url` / `fetchedAt` / `license`，否则构建失败；许可要求保留声明时附 `SOURCE-LICENSE.txt`（汇编为逐来源许可合集）
7. `DESIGN.md` 定义该设计的动效语言（Motion 章节；可极简，决定静止须论证）；`styled` 采用共享滚动显现时必须接入 `<Reveal />`（见 [`visual-language.md`](./visual-language.md) 的动效章节）。`html-only` 必须在规范中论证完全静止，且不得渲染 Reveal。
8. **多语言接入**：主题的界面文案全部来自本设计 `messages.ts`；`styled` 语言切换由共享操作菜单承担，`html-only` 由原生链接承担。所有设计页都**不渲染** `<LanguageSwitcher />`（它是基础设施页的 `<noscript>` 回退，见 [`action-menu.md`](./action-menu.md)）

## 信息架构与主题文案

每套设计可以有自己的视觉母题，但**主分区必须保持求职语义**：

- 主分区固定为六个：简介 / 项目 / 经历 / 技能 / 联系 / 链接（英文 Profile / Projects / Experience / Skills / Contact / Links）。简介 hero 允许没有 h2；若存在独立简介分区，使用标准标签。
- 主分区 h2 的文本只能由标准标签词元组成：当前 Locale 的 canonical、英文 canonical 或显式 alias（`src/i18n/sections.json`）。允许分隔符（`/`、`|`、`·`、`-`、`—`、空白）；不得出现主题词或其他文本。
- 主题词只能出现在 h2 之外：可选 kicker、subtitle 或装饰；移除后页面必须仍然成立，且不得承担 heading 语义。
- 主题词或英文 kicker 与当前 Locale 的 h2 标准标签同名时（忽略大小写），必须省略该 kicker，避免标题区重复；只省略 kicker，不移除 h2。
- 标准标签由共享词表 `src/i18n/sections.ts` 提供；设计不得在 `messages.ts` 重复维护标准标签。新增 Locale 必须补齐词表。
- 每个主分区的 sectioning 元素必须带 `data-section="<key>"`；该属性只用于构建期校验，不产生样式或脚本，`html-only` 同样适用。
- `npm run verify:sections` 在构建后扫描 `dist`，按 Locale 校验每个 `data-section` 的 h2 词元；检查失败必须让构建失败。迁移期 allowlist `scripts/section-labels.allowlist.json` 只允许列出的设计跳过，最终必须为空。
- 首次访问者必须在不看设计说明的情况下识别每个分区；不得要求访问者先解码主题隐喻。
- 不得使用把候选人商品化、贬低或误导求职状态的文案作为主分区 / 核心标签（例如「非卖品」「净含量 1 人」「生产信息」「购买渠道」）。
- 新增 / 修改主题时检查 `messages.ts`、`Page.astro` 与 `Preview.astro` 的 h2 / 标签；存量审计记录见 `docs/verification/section-labels.md`。

### 可选 · 切换页预览碎片（`Preview.astro` / `tokens.css`）

切换页 `/{locale}/designs/` 为每套提供 `Preview.astro` 的设计渲染一枚**装饰性缩略引述**。它**可选**——缺失时该卡片回退为 accent 色点形态，必交文件契约不因此变更。`html-only` 可以提供自包含预览碎片，但不得提供 `tokens.css`；预览不得改变正式 HTML-only 页面零 CSS / JS 的资源契约。

1. **文件**：`src/designs/<id>/Preview.astro`（自包含碎片，样式放组件 `<style>`，目标 1–8KB）。组件**必须**导出 `fonts`（`import('astro:assets').CssVariable[]`），列出自己真正渲染用到的字体族；切换页据此**按族去重**、页面级声明一次 `<Font>`（同族重复声明会产生重复 `@font-face`，实测确认）。
2. **不得 import 本设计 `style.css`**：那会带进 Tailwind preflight 与整页规则。预览只做"视觉签名"（布局骨架 / 字体角色 / 配色 / 签名装饰），**不是**完整页面、不带动效机制、不引交互依赖，也**不得**退化为统一的通用卡片模板。
3. **令牌单一来源**：与正式页共享 `src/designs/<id>/tokens.css`（纯 CSS，无 Tailwind 指令）。令牌作用域**必须是命名空间类**（`:is(.ar, .ar-pv)` 形式），**不得**用 `:root`——预览会把该文件内联进切换页，`:root` 在那里就是全局令牌泄漏。
4. **令牌只放调色板**：字体角色留在 `style.css` 的 `@theme inline`（`html` 层）与预览各自引用同一个 `--font-*` 框架变量。把字体角色也做成令牌会因"祖先取不到后代作用域变量"而让正式页字体静默回退（2026-10-18 实测）。`html` 等**祖先**选择器消费令牌时必须改写为字面量。
5. **发现机制**：切换页**在页面 entrypoint 内** glob `../designs/*/Preview.astro`（eager）——这是安全的，且能自动发现新预览、容忍缺失。**不得**从共享模块 glob 预览组件（会触发"已知坑"的 CSS 聚合）。
6. **`style.css` 必须排除预览文件**：`@source "./"` 会连带扫描 `Preview.astro`，把 `<style>` 里的属性文本（`display: flex` / `border:` / `transform:` 等）当作候选工具类注进**正式页** CSS（实测 +1.3KB/页）。用 `@source not "./Preview.astro";` 排除（Tailwind 4 否定来源语法）。
7. **无障碍**：预览是装饰——调用方加 `aria-hidden="true"`，内部**不得**放可聚焦元素，文字**不得**进入卡片链接的可访问名。
8. **布局与规模**：切换页内容宽度 `min(74rem, calc(100% - 3rem))`，桌面每行**最多 3 张**（`repeat(3, minmax(0, 1fr))`），`<=60rem` 降 2 列、`<=48rem` 强制单列；栅格间距 `1.5rem`。卡片内部固定为 **`16 / 10` 预览画幅 + 标题 + 两行描述**，同一栅格中的全部卡片尺寸必须一致，不得靠 `stretch` 掩盖单行描述造成的底部空洞。预览 CSS 在切换页聚合为**单个**样式表（不是每套一条 `<link>`）。设计数扩至 114 时的瓶颈是 CSS 体积与 DOM 节点数，**不是**请求数；缓解次序为先 `content-visibility: auto`、再保持预览极简，**不引入**分页 / 按需加载等复杂机制。
9. **检测器**：预览的缩略档位（缩小的字号 / 圆角）应**登记进该设计 `DESIGN.md` 的阶梯**（自产 / 复刻）或 `ADAPTATION.md`（厂商来源），而不是加忽略规则——检测器的提示正是"新步进若属有意为之就写进设计系统"。
10. **变量只有主 face，预览也写完整回退**：预览使用 `var(--font-*)` 的 `font` / `font-family` 必须显式给出后续字体，并由 `npm run fonts:typography` 与正式页一起检查；不得依赖 Astro 变量内部携带的系统 fallback。
