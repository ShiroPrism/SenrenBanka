# SenrenBanka — AI 多设计个人主页生成器 · 项目规格 v1

> 本规格由技术调研（2026-10-10）与需求访谈（Q1–Q8）产出，可直接作为编码 Agent 的第一阶段实施依据。
>
> 标记说明：
> - 【已定】访谈确认的需求决策
> - 【已核实】经官方文档 / 原始文件 / 本机实测确认的技术事实
> - 【待实施验证】实施第一步需要先跑通验证的点
> - 【待决定】仍需项目所有者决定的事项

---

## 1. 项目目标与非目标

### 目标

1. 使用者只维护**一份**个人资料配置（`profile.yaml`），即可拥有多套由 AI 依据各自 `DESIGN.md` 生成的、视觉与页面结构完全不同的静态个人主页。
2. 每套 `styled` 设计拥有独立的 HTML 结构、排版、CSS 与必要交互，不是换色/换字体的简单主题；`html-only` 设计以无自定义 CSS/JS 的原生语义 HTML 作为显式例外。
3. 支持 `fixed` / `random` 两种模式、可配置手动切换、浏览器缓存与避免连续重复。
4. 构建期预生成全部静态 HTML；访客访问时不调用 AI、不需要服务端。
5. fork 后修改资料与少量配置，即可部署到 GitHub Pages / Cloudflare Pages / Vercel。
6. 一期用 4 套差异明显的设计验证完整工作流。

### 非目标（一期不做）

- 运行时 AI 服务、设计规范运行时解析/下载
- 动态服务端、数据库、账号系统、在线编辑器、设计市场
- 访客统计（二期评估第三方分析或无服务器 API）
- 每套设计的逐区块内容开关（内容取舍由设计自行决定）

---

## 2. 决策记录（Q1–Q8 摘要）

| # | 议题 | 结论 |
|---|------|------|
| Q1 | 设计规范来源与合规 | 只用两类来源：**厂商官方发布**（official-design-md 索引）+ **自产**（impeccable `document --seed`）。第三方整理源（awesome-design-md）需逐份核实许可并标注"非官方"后可选入库；designmd.co **排除**（许可无法核实）。 |
| Q2 | 个人资料字段契约 | 核心必填（name/headline/bio/links，所有设计必须呈现）+ 可选字段（avatar/location）+ 扩展区块词汇表（projects/experience/skills/contact，**设计自行取舍**）。设计可加装饰性文案，不得虚构个人信息。 |
| Q3 | 切换与持久化语义 | 随机：存储有效→用存储；过期→重随机（排除上次）并写新窗口；手选=写入+重开窗口。固定：手选**永久记住**，无则用 default；手选在随机模式下**按 cacheHours 过期**。直达 URL 不写存储。 |
| Q4 | 切换入口形态 | 共享 `/designs/` 切换页 + **全站共享操作菜单**（v0.5.0 起替代初版"每套设计必留一个可见入口"；v0.10.0 起扩展到移动端：桌面右键 / `Shift+F10`，移动端悬浮球 → 底部动作面板，见 ADR 0007）。共享操作菜单用于 `styled` 页面；`html-only` 按 ADR 0009 使用普通链接。`manualSwitch:false` → 主题入口不渲染、切换页不构建（404）；设计固定 URL 仍可直达。 |
| Q5 | 根路径与 SEO | 根路径=零外部请求的轻量路由页（内联脚本 `location.replace`；noscript meta refresh→default+链接列表）。索引策略 **B**：仅 default 设计可索引，其余 `noindex,follow`。 |
| Q6 | 设计注册机制 | **目录自动发现**：`src/designs/<id>/` 存在即注册，元数据在同目录 `design.json`；站点配置不含设计清单；`_` 前缀目录忽略；构建期校验强制完整性。`enabled:false` = 页面仍构建可直达，退出随机池与切换页。 |
| Q7 | 部署基线 | `site`/`base` 由环境变量驱动（`SITE_URL` / `BASE_PATH`，默认 `/`）；GH workflow 自动注入本仓库上下文 → fork 后零配置；CF Pages/Vercel 用面板配置（文档说明）。一期验证深度：本地构建 + 文档核实，不做实际部署。 |
| Q8 | 一期设计选型 | **4 套** = 官方 2（Oxide，已实测可抓取 + Vercel，待核实；备选 Resend/Nuxt/FAST）+ 自产 2（编辑杂志风 / 复古终端风）。最终定稿在实施第 4 步（抓取 + 目检 + 许可核实）。 |

其他默认（已确认）：字体用 `astro:fonts` 构建期自托管（运行时零第三方请求）；仓库附示例 `profile.yaml`；项目名 `SenrenBanka`。

> 2026-10-11 扩充（grill 访谈）：设计来源口径扩为「快照 / 官方文档汇编 / 视觉复刻 / 自产」四形态与二期 30 席选型，见 §4.1 / §4.4（决策记录 ADR 0005）。

---

## 3. 技术栈与关键事实

### 3.1 版本（npm 实测，2026-10-10）

| 依赖 | 版本 | 说明 |
|---|---|---|
| astro | 7.3.8 | 最新稳定；要求 Node ≥ 22.12（本机 v24.18.1） |
| tailwindcss / @tailwindcss/vite | 4.3.3 | 官方集成方式即 Vite 插件 |
| @astrojs/check | 0.9.10 | 提供 `astro check`；peer：typescript ^5 或 ^6 |
| 包管理器 | npm + package-lock.json | 通用性最好；备选 pnpm 需自行调整 |

### 3.2 已核实的技术事实

1. **Tailwind 4 集成**【已核实】：官方方式 = `npm i tailwindcss @tailwindcss/vite` → `astro.config` 加 `vite.plugins: [tailwindcss()]` → CSS 写 `@import "tailwindcss";`。旧 `@astrojs/tailwind` 已被官方标记弃用，不得使用。
2. **每设计 CSS 隔离**【已核实，文档 + 本机实测】：官方文档明确 `source(none)` 就是为"多套样式表互不污染"设计的；本机以 tailwindcss 4.3.3 CLI 实测三入口：
   - 入口 A（`source(none)` + `@source "./"` + `@source "../../shared"`）：只含 A 自身与 shared 的类；
   - 入口 B（`source(none)` + `@source "./"`）：只含 B 自身；
   - 入口 A（默认自动扫描，不加限定）：**全项目所有设计的类都会混入**。
   → 结论：从第一套设计起就固定 `source(none) + @source` 协议。
3. **动态类名**【已核实】：Tailwind 按纯文本扫描，字符串拼接/插值生成的类名不会被识别；必须使用完整类名。逃生口：`@source inline("…")`（含 brace 展开与变体语法）。
4. **每页只加载自己的 CSS**【已核实】：Vite `build.cssCodeSplit` 默认 true + Astro 按页输出样式；每套设计页面只 import 自己的 CSS 入口。
5. **设计动态路由**【已核实，本机实测 astro 7.3.8】：`src/pages/[design]/index.astro` + 注册表模块（`import.meta.glob('./*/Page.astro')` 置于独立模块）可正确产出各设计独立静态 HTML。
   **已知坑（实测）**：若 `import.meta.glob` 结果声明在页面 frontmatter 顶层、再在 `getStaticPaths` 中引用，构建拆包后会报 `pages is not defined`。必须把 glob 放进独立模块（`registry.ts`）再 import；`getStaticPaths` 可为 async。
6. **内容层加载 YAML**【已核实】：`src/content.config.ts` + `defineCollection({ loader, schema })`；`astro/loaders` 提供 `glob()` / `file()`；YAML 受支持。**坑**：`file()` 不接受"裸单对象"，单文件数据推荐 `glob({ base: './src/data', pattern: 'xxx.yaml' })`（每文件=1 条目，id=文件名）。
7. **字体**【已核实】：`astro/config` 导出 `fontProviders`（内置 provider：Adobe/Bunny/Fontshare/Fontsource/Google/Google Icons/NPM/local）；`fonts` 配置项声明 `{ provider, name, cssVariable, weights?, styles? }`；页面在 `<head>` 放 `import { Font } from 'astro:assets'` 的 `<Font cssVariable="--font-x" preload? />`；Tailwind 4 用 `@theme inline { --font-sans: var(--font-x); }` 注册。API 自述"下载并缓存字体、由站点自身提供"，含优化的回退字体（fallbacks 可定制）。
8. **部署**【已核实】：Astro CLI 支持 `--site` / `--base` 公共参数；GH Pages project pages 必须 `base: '/repo'`（自定义域名则 base=`/` 并放 `public/CNAME`）；CF Pages（`npm run build` / 输出 `dist`；免费层 500 次构建/月、2 万文件上限）；Vercel 零配置识别 Astro。同一份 dist 不能同时适配 GH 子路径与根路径，用构建参数区分。
9. **同域存储** 【已核实】：GitHub Pages 同账号下所有项目共享同一 origin，localStorage 完全共享（规范层面无法按路径隔离）→ 存储键必须按站点命名空间化。
10. **先例**：未发现"根路径随机分配整套设计"的直接可复用项目；astro-distro（26 主题、localStorage、防闪烁内联脚本，MIT）可作实现参考；CSS Zen Garden / Style Stage 验证了"同内容多设计、固定 URL"的理念。
11. **CSS 聚合陷阱**【已核实，本机实测】：多页共享模块中任何对设计 `Page.astro` / `style.css` 的**动态导入边**（如非 eager `import.meta.glob('./*/Page.astro')`）会把**所有**设计的 CSS 聚合进**每个**引用页面的 `<link>`（实测：根页曾携带全部设计 CSS）。对策：设计路由改用 `injectRoute`（每页只带自己的 CSS），注册表的存在性检查改用 `node:fs`。
12. **内容层条目 id 会归一化**【已核实，本机实测】：glob loader 把 `site.config.yaml` 的条目 id 归一化为 `siteconfig`；按"单文件集合取唯一条目"处理（`getCollection()[0]`）。
13. **字体 npm provider**【已核实，本机实测】：`fontProviders.npm({ remote:false })` + `options.package` 可从已安装 `@fontsource-variable/*` 包在构建期自托管（无需联网）；族名必须与包内 CSS 完全一致（`Fraunces Variable`、`JetBrains Mono Variable`）；传 `weights` 范围过滤会解析不到（省略即可，variable 包自带完整字重轴）。**修订（2026-10-11）**：provider 即使 `remote: false`，仍把字体文件 URL 重写为 jsdelivr 地址——构建期 fallback metrics（Capsize）会拉取主字体二进制并按 URL 哈希缓存至 `node_modules/.astro/fonts/`；**新增字体族的首次构建需可访问 jsdelivr**（本机 Node fetch 走代理需 `NODE_USE_ENV_PROXY=1`），缓存就绪后离线构建成立（2026-10-11 新字体族接入实测）。
14. **共享 chrome 的 CSS/JS 隔离契约**【已核实，本机实测，v0.5.0】：`ContextMenu.astro` 的样式用 `<style is:inline>` 内联——设计页不新增 `<link>`，"每设计页只链接自己的 CSS" 仍成立，根页 / 切换页 / 404 不含菜单任何字节；运行时经内联 `matchMedia` 门控 + 动态 `import()` 加载，Vite 不为其生成 `modulepreload`。门控为「桌面鼠标 **或** 触控能力任一命中」（v0.10.0 修订：移动端也需要该运行时）。
15. **`import.meta.env.BASE_URL` 尾斜杠**【已核实，本机实测】：Astro 7 在带 base 时返回**不带尾斜杠**（如 `'/demo'`），`src/lib/urls.ts` 已归一化（否则拼出 `/demoeditorial/`）；`BASE_PATH=/demo` 前缀自检通过（根脚本 / noscript / 切换页链接 / canonical / favicon）。
16. **npm provider 字体无法子集过滤**【已核实，本机实测】：face 无 `subset` 元数据、family 级 `subsets` 为空操作；`preload` 会带入未使用子集——据此 editorial 移除 preload、terminal 不 preload；latin 子集仍按 `unicode-range` 按需加载。
17. **切换页预览碎片（`Preview.astro`）**【已核实，本机实测，2026-10-19 全铺】：
   - 预览碎片**不 import** 本设计 `style.css`、不声明 `<Font>`、样式走组件 `<style>`；组件导出 `fonts`（`CssVariable[]`），切换页收集后**按族去重**、页面级声明一次——同族重复声明会产出重复 `@font-face`（实测：组件内再声明同族使 `@font-face` 由 15 增至 22）。
   - 预览令牌来自与正式页同源的 `tokens.css`，作用域为**命名空间类**（`:is(.ar, .ar-pv)`）。组件内联的 `:root` **不被 Astro 作用域化**，会成为切换页的全局令牌泄漏。
   - 16 套预览的 CSS 在切换页聚合为**单个**独立 `<link>`（实测 **51 963 B**）——该样式表归属切换页 entrypoint，不含 Tailwind preflight、不含任何设计整页选择器；设计页仍恰好 1 个 `<link>`、0 个预览选择器。
   - 切换页**在页面 entrypoint 内** eager glob `../designs/*/Preview.astro` 安全且可自动发现、容忍缺失；从**共享模块** glob 预览组件会触发第 11 条的聚合陷阱。
   - `style.css` 的 `@source "./"` 会连带扫描同目录 `Preview.astro`，把其 `<style>` 的属性文本当候选工具类注进**正式页** CSS（实测约 +1.3KB/页）；须用 `@source not "./Preview.astro";` 排除（Tailwind 4 否定来源语法）。
   - **栅格与卡片几何**：内容宽度 `min(74rem, calc(100% - 3rem))`；桌面 `repeat(3, minmax(0, 1fr))`（每行最多 3 张），`<=60rem` 2 列、`<=48rem` 单列，栅格间距 `1.5rem`。卡片内部固定为 `16 / 10` 预览画幅 + 标题 + 两行描述，16 张卡片尺寸一致；实测 1536px 下均约 `379×333px`，预览均约 `353×221px`。
   - 实测成本（16 套全铺，zh-cn 切换页）：CSS **51 963 B**（单资源）、HTML **89 379 B**、`@font-face` **82**（38 个生成族名、23 个唯一字体变量）；运行时每种语言实际请求 **22** 个唯一 woff2，0 preload。线性外推 114 套 ≈ 370KB CSS / 637KB HTML——届时优先评估 `content-visibility: auto` 与分类，仍不引入分页 / 按需加载 / 服务器依赖。

---

## 4. 设计规范来源、获取与保存流程

### 4.1 合规策略【已定】

- **允许入库**：
  - A. **厂商官方发布（快照）**（如 official-design-md 索引的 Vercel、Nuxt、Resend、Ant Design、Atlassian、FAST、Oxide、Juspay、Clerk、Mintlify、VoltAgent）——逐份核实原文所在仓库、许可要求并保留声明；"first-party 官方"的说法仅为索引仓库自述，须逐份核实。2026-10-11 复核：索引 11 条中仅 FAST / Oxide（已收录）与 Juspay / VoltAgent 的文件带明确许可；Nuxt / Resend / Clerk / Mintlify / Ant Design 的官网文件本身无许可声明、Atlassian 明文禁止再分发、Vercel 无许可——一律不按快照收录。
  - C. **官方文档衍生整合**（`source.type: official-docs-derived`，2026-10-11 新增）——从厂商**官方开放文档**（仓库 markdown / 官网文档；许可为可再分发类型，如 MIT / Apache-2.0 / CC0 / CC BY / OGL / PDL / MPL）遴选整合为一份 `DESIGN.md`：自有行文组织、文末「来源与许可」附录逐节保留出处、附逐来源许可全文；**非逐字快照，整合完成即冻结**。
  - D. 自产（按 Google Stitch `design.md` 格式起草，并用 impeccable `document`（scan 模式）规范化固化；`generatedBy` 记录工具与版本）——完全可控。
- **条件允许**：B. **第三方分析**（`source.type: third-party-analysis`）——**视觉语言复刻**（2026-10-11 新增）：仅借鉴目标设计系统的视觉语言，规范完全自撰、不移植上游文本与素材；在 `design.json` 与 README 中标注"非官方分析"；`url` / `fetchedAt` = 参考对象入口与视觉分析日期，`license` 填参考对象许可状况说明。
- **排除**：designmd.co（条款/许可页为空壳，无法确认再分发授权；正文依赖 JS 注入）；外部抽取 / 逆向索引——awesome-design-md 经 2026-10-11 复核为自托管抽取产物（README 自述 "extracted from real websites"、无官方来源链接），designmd.app、designsystems.one、langlabs.io 同类——一律不接入；Atlassian、Shopify Polaris 的快照与复刻均回避（许可明文禁止再分发 / 演绎）。

### 4.2 获取与归档流程（每新增一套设计）

按来源形态三选一：

- **快照（A）**：抓取**完整** `DESIGN.md`（GitHub raw 优先，URL 稳定）→ 原样保存到 `src/designs/<id>/DESIGN.md`（此后不依赖上游）。
- **汇编（C）**：先核定上游材料清单与逐来源许可（可再分发类型）→ 遴选整合为一份规范（自有行文组织、文末「来源与许可」附录逐节列 URL、必要引用短句并标注、不整段逐字移植）→ 保存到 `src/designs/<id>/DESIGN.md`；**整合完成即冻结**（跟随上游 = 新一次整合，记 changelog，不静默修改）。
- **复刻（B）**：分析目标视觉语言，规范完全自撰（可经 impeccable 规范化），不移植上游文本与素材。

共同收口：

1. 填写 `design.json.source`：`type`（official-vendor / official-docs-derived / third-party-analysis / self-produced）、`url`、`fetchedAt`（ISO 日期）、`license`、`attribution`。
2. 许可要求保留声明时，附 `SOURCE-LICENSE.txt`（快照：原文许可；汇编：逐来源许可全文合集）。
3. 构建校验通过（缺 provenance 字段时**构建失败**）。
4. 厂商来源（快照 / 汇编 / 复刻）建 `docs/designs/<id>/ADAPTATION.md` 记录适配与取舍（对齐 fast / oxide 惯例），并更新 `docs/verification/` 与 `change-log/`。
5. 无法获取、文件不完整或许可不明确时：**如实报告，不得伪造**；改选其他来源。

### 4.3 一期选型【已定】

| 设计 id | 来源 | 许可 | 状态 |
|---|---|---|---|
| oxide | 官方（oxidecomputer/design-system） | MPL-2.0 | 已归档（含 SOURCE-LICENSE.txt） |
| fast | 官方（microsoft/fast） | MIT | 已归档（含 SOURCE-LICENSE.txt） |
| editorial | 自产（impeccable 规范化） | — | 已实现 |
| terminal | 自产（impeccable 规范化） | — | 已实现 |

实施结果（2026-10-10）：Vercel 的 design.md 挂在官网、无许可声明，按合规策略弃用，替换为许可已核实的 Microsoft FAST。自产规范已由 **impeccable v4.5.2 `document`（scan 模式）** 规范化固化为正式规范。

### 4.4 二期扩充选型【已定，2026-10-11】

来源口径（2026-10-11 grill 访谈）：A（快照 + 汇编）与 B（复刻）**全收**、分批覆盖、不设硬上限、每批后评估；文档许可未证实的 C 类候选不追查许可、视同不可用，仅以复刻形态收录；排序准则 = 许可硬门槛 → 视觉差异主导 → 落地成本系数 → 知名度补充。复刻设计的 id / displayName 不以厂商商标命名（逐套提案后定稿），`description` 以指示性文案注明"非官方致敬"。

| 序 | id（草案） | 来源 | 形态 | 许可 | 状态 |
|---|---|---|---|---|---|
| 1 | carbon | IBM Carbon Design System | 汇编 | Apache-2.0 | **已移除**（2026-10-11 打样后同质复核：与 fast 重叠；recipe 经验保留） |
| 2 | uswds | US Web Design System | 汇编 | CC0 1.0 | 待批 |
| 3 | material3 | Google Material 3 | 汇编 | CC BY 4.0（内容）/ Apache-2.0（代码） | **已实现**（v0.7.0；整合前逐页复核完成） |
| 4 | govuk | GOV.UK Design System | 汇编 | OGL v3 | **已实现**（v0.8.0；2025 品牌刷新口径，GDS Transport 回退 Arial） |
| 5 | patternfly | Red Hat PatternFly | 汇编 | MIT | 待批 |
| 6 | gitlab | GitLab Pajamas | 汇编 | MIT | 待批（材料量最大） |
| 7 | ant-design | Ant Group Ant Design | 汇编 | MIT | 待批 |
| 8 | tdesign | Tencent TDesign | 汇编 | MIT | 待批 |
| 9 | dads | 日本数字厅 DADS | 汇编 | PDL 1.0 | 待批 |
| 10 | nhs | NHS Digital Service Manual | 汇编 | OGL v3 | 待批（Frutiger 字体回退） |
| 11 | protocol | Mozilla Protocol | 汇编 | MPL-2.0 | 待批 |
| 12 | paste | Twilio Paste | 汇编 | MIT | 待批 |
| 13 | primer | GitHub Primer | 汇编 | MIT | 待批（指南源仓库复核） |
| 14 | semi | ByteDance Semi Design | 汇编 | MIT | 待批 |
| 15 | nutui | JD NutUI | 汇编 | MIT | 待批 |
| 16 | vanilla | Canonical Vanilla | 汇编 | CC-BY-SA 4.0 | 待批（同许可 + 署名义务） |

原生单份快照尾巴：`juspay`（Juspay Blend，MIT，随手可加）；小微厂 Arkite UI / UIZZE 暂不收录。

复刻席（序 17–30，命名逐套提案；规范自撰、不移植上游内容）：17 Apple HIG、18 Microsoft Fluent 2、19 Vercel Geist、20 Uber Base Web、21 Adobe Spectrum、22 Salesforce SLDS、23 VMware/Broadcom Clarity、24 ByteDance Arco、25 Huawei DevUI、26 EU ECL、27 Singapore SGDS、28 Wikimedia Codex、29 Nordhealth Nord、30 Zendesk Garden。首批复刻已落地：19 Vercel Geist → **`kern`**（v0.7.0）、17 Apple HIG → **`frost`**（v0.8.0）——id / displayName 均于 2026-10-11 按命名提案定稿。

排除（明示）：Atlassian、Shopify Polaris（禁止再分发 / 演绎，快照与复刻均回避）；Vercel、Nuxt、Resend、Clerk、Mintlify（官网文件无许可声明）；外部抽取 / 逆向索引一律不接入（见 §4.1）。

批次节奏（2026-10-11 修订）：Carbon 打样批次已移除（打样产出与 fast 同质，复核后删去；汇编 recipe 经验保留——见 §4.2 与实测坑）。批次 2 起按「视觉差异化矩阵」（与现有设计的正交性）过滤重排后推进——每批 2–3 套、版本 +0.1/批；复刻批与汇编同批推进（2026-10-11 修订：批次 2 = `material3` + 复刻首套 `kern`，原「数批后插入」不再适用）。**批次 2 已完成（v0.7.0，2026-10-11）；批次 3 已完成（v0.8.0，2026-10-11：`govuk` + 复刻 `frost`）。**

#### 4.4.1 视觉差异化矩阵与分级【2026-10-11 复核】

锚点画像（现有设计；五维 = 色温 · 明度｜几何｜字体｜装饰语言）：

| 设计 | 色温 · 明度 | 几何 | 字体 | 装饰语言 |
|---|---|---|---|---|
| editorial | 暖（米白 + 焦赭）· 浅 | 直角发丝线 / 非对称编辑网格 | 衬线主导 | 期号 / 序号 |
| terminal | 暖橙 · 极暗 | 屏框 / 扫描线 | 等宽 | ASCII 波形 / 光标呼吸 |
| oxide | 冷绿 · 深 | 发丝线 / 致密纹理 | 无衬线 + 等宽标签 | ASCII 波形 / 网格 |
| fast | 冷蓝 · 浅 | 圆角卡片 | 系统无衬线 | 克制，零装饰 |

覆盖缺口（2026-10-11 批次 3 后更新：紫 tonal、纯黑白极简、大圆角与阴影层级、政务语言、玻璃 / 材质感均已覆盖）：浅色红系。

分级（仅视觉维；许可复核仍是前置硬门槛，逐一按 §4.2 执行）：

- **A 强差异化（优先）**：`material3`（紫 tonal 色系、12–28px 大圆角、阴影层级、深浅双模——**已实现，v0.7.0**）；`geist`（复刻；纯黑白极简 + 几何细节——**已实现为 `kern`，v0.7.0**）；`govuk`（蓝幅 / 黄 focus / 高对比直角语言——**已实现，v0.8.0**，2025 品牌刷新口径）；Apple HIG（复刻；玻璃 / 材质感——**已实现为 `frost`，v0.8.0**）。
- **B 中等（备选）**：`vanilla`（紫橙）、`paste`（红）、`protocol`（黑白 + 橙）、`gitlab`（紫橙 DevOps）、`codex`（冷百科衬线，与 editorial 暖衬线部分接近）。
- **C 同质暂缓**：浅蓝企业组（`uswds`、`ant-design`、`tdesign`、`patternfly`、`primer`、SLDS、Spectrum、Clarity、Arco、DevUI、semi——与 fast 高度同质）；政务蓝组（`nhs`、`dads`、ECL、SGDS——与 govuk 择一）；Fluent 2（与 fast 同源）；nutui 与 paste 红系二选一。

批次建议：**批次 3 已完成**（`govuk` + `frost`，v0.8.0，2026-10-11，经项目所有者确认执行）；后续批次按 §4.4.1 分级次序推进（`paste` 等浅红系 / B 级候选）；`uswds` 暂缓（研究材料保留，后续如需可直接复用）。

---

## 5. 通用个人资料配置格式

### 5.1 文件与校验【已定】

- `src/data/profiles/<locale.path>.yaml`（各语言的个人资料）与 `src/data/site.config.yaml`（站点/多语言/行为配置），均为内容层集合（glob loader），Zod schema 校验（`strict()` 拒绝未知键，防拼写错误）。
- 所有设计通过统一数据接口（`src/lib/site.ts`）获取资料，**禁止每套设计重复维护信息**。
- 三种语言共用**同一套** `profileSchema`，不为语言拆分字段契约。

### 5.2 profile 示例（以 `src/data/profiles/zh-cn.yaml` 为例）

```yaml
name: "Your Name"
headline: "一句话定位（每套设计必须呈现）"
bio: "1–3 句简介。"
avatar: "assets/avatar.jpg"   # 可选；本地文件（相对 src/data/assets/）或 https URL
location: "Shanghai, China"   # 可选
links:                        # 核心必填（可空数组，但强烈建议填写）
  - label: GitHub
    url: "https://github.com/you"
    icon: github              # 可选关键词，未知值设计可退回文字
  - label: Email
    url: "mailto:you@example.com"
    icon: mail
projects:                     # 扩展区块（设计自行取舍）
  - title: "Project A"
    description: "…"
    url: "https://…"
    tags: ["TypeScript", "Astro"]
experience:                   # 扩展区块
  - org: "Company"
    role: "Engineer"
    period: "2022 – now"
    description: "…"
skills: ["TypeScript", "Astro", "Tailwind"]   # 扩展区块
contact:                      # 扩展区块
  email: "you@example.com"
  note: "欢迎交流合作"
```

### 5.3 契约规则【已定】

- **核心（必填，所有设计必须呈现）**：`name`、`headline`、`bio`、`links`。
- **可选字段**：`avatar`（部分风格不放照片）、`location`。
- **扩展词汇表（一期仅 4 个）**：`projects`、`experience`、`skills`、`contact`。设计按自身风格**自行决定取舍、排列与样式**；不提供逐区块开关配置。
- 设计可添加装饰性文案，**不得编造**个人事实（项目、经历、数据）。
- 不做"设计是否渲染了核心字段"的自动检查（难以可靠实现）；由规则正文（`docs/rules/`）+ `design-page-verify` 流程约束。

### 5.4 site.config.yaml 示例

```yaml
site:
  url: null          # 可选；构建时优先使用 SITE_URL 环境变量
  storageKey: null   # 可选覆盖；默认由 base 路径自动派生（见 §7）

i18n:                # 语言清单只在此处维护一处，路由/资料/SEO 均由此派生
  defaultLocale: zh-CN
  locales:
    - code: zh-CN    # BCP 47：HTML lang 与文案字典键
      path: zh-cn    # URL 前缀 + 资料文件名（src/data/profiles/zh-cn.yaml）
      label: 简体中文     # 语言自称，用于语言选择器
      title: "Your Name — Portfolio"      # 该语言 SEO 标题
      description: "SEO 描述"             # 该语言 SEO 描述
    - code: ja
      path: ja
      label: 日本語
      title: "…"
      description: "…"
    - code: en
      path: en
      label: English
      title: "…"
      description: "…"

design:
  mode: random       # random | fixed
  default: editorial # 必填；random 模式下是无 JS/SEO 回退设计，fixed 模式下是固定展示
  manualSwitch: true
  random:
    cacheHours: 24   # 0 = 每次访问都重新随机（仍避免连续重复）
    avoidImmediateRepeat: true
```

校验规则：`default` 必须是存在的启用设计；至少 1 个启用设计；`cacheHours >= 0`。

### 5.5 多语言契约【已定，v0.9.0】

**语言清单的唯一来源**是 `site.config.yaml` 的 `i18n.locales`；路由注册、资料选择、文案字典与 SEO 元数据都从它派生，任何其他文件不得重复列出语言。

| 字段 | 职责 |
|---|---|
| `code` | HTML `lang`、翻译字典键使用的标准语言标识（BCP 47） |
| `path` | URL 语言前缀，同时是对应资料文件的标识（要求唯一、合法） |
| `label` | 语言选择器展示的**语言自称** |
| `title` / `description` | 该语言的站点 SEO 元数据 |

**文案分两层**：

- **共享文案**（`src/i18n/messages.ts`）：项目 chrome 与基础设施页——共享操作菜单（桌面浮层 / 移动面板 / 悬浮球，含运行时 Toast）、切换页、根入口页、404、语言选择器。必须覆盖全部语言，缺键在**构建期**报错。
- **主题文案**（`src/designs/<id>/messages.ts`）：每套设计自身的界面文案，按该设计的视觉语言撰写，**不得**把所有设计统一翻译成相同表述。

翻译原则：个人简介、headline、项目描述、工作职责、链接标签、联系说明等**需要本地化的内容要翻译**；项目名称、公司名称、URL、邮箱、技术标记等**专有名词不机械翻译**。承担设计意图而非信息传达的文本（终端命令、ASCII 装饰、刻意的双语标识、法律署名）保持原样，且**必须在该设计 `messages.ts` 的注释中写明理由**。

**配置强校验**（Zod `superRefine`，构建期失败而非静默回退）：语言 `code` 与 `path` 均不得重复；`defaultLocale` 必须存在于 `locales`；每种语言必须有完整元数据与对应资料文件；`src/data/profiles/` 中存在未声明的资料文件同样报错。

---

## 6. 设计目录、页面接口与注册机制

### 6.1 设计目录结构【已定】

```
src/designs/<id>/
├─ DESIGN.md          # 设计规范快照（来源见 §4）
├─ design.json        # 元数据（机器可读）
├─ Page.astro         # 该设计的完整页面（含 <html> 文档）
├─ messages.ts        # 该设计的各语言界面文案（必需）
├─ style.css          # styled 必需；html-only 禁止存在
├─ tokens.css         # styled 可选：设计令牌单一来源；html-only 不使用
├─ Preview.astro      # 可选：切换页预览碎片；html-only 若提供必须完全自包含
├─ components/…       # 可选，该设计私有组件
├─ assets/…           # 可选，该设计私有资源
└─ SOURCE-LICENSE.txt # 可选，来源许可要求时
```

### 6.2 design.json schema

```jsonc
{
  "displayName": "Editorial",            // 切换页显示名
  "description": "杂志排版风，强调字体层级与留白",  // 一句话描述
  "enabled": true,                       // false = 不随机、不上切换页，但页面仍构建可直达
  "renderMode": "styled",                // styled | html-only；省略时默认 styled
  "accent": "#b45309",                   // 可选，切换页色块
  "source": {
    "type": "official-vendor",           // official-vendor | third-party-analysis | self-produced
    "url": "https://…",                  // type != self-produced 时必填
    "fetchedAt": "2026-10-12",           // type != self-produced 时必填
    "license": "MIT",                    // type != self-produced 时必填
    "attribution": "…"                   // 可选署名文本
  },
  "generatedBy": "impeccable document --seed"  // 可选，自产时记录工具与版本
}
```

### 6.3 注册与校验【已定】

- `src/designs/registry.ts`：`import.meta.glob('./*/design.json', { eager: true })` 取元数据；`astro.config.mjs` 扫描 `Page.astro` 并通过 `injectRoute` 注入路由。
- **构建期强制校验**（失败即构建终止，报错必须指明目录与原因）：
  - 目录名（id）：`^[a-z0-9][a-z0-9-]*$`；不得使用保留字 `designs`；`_` 前缀目录忽略（放未完成设计）；
  - 共同必交：`DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`；
  - `renderMode: "styled"`（默认）：`style.css` 必须存在；
  - `renderMode: "html-only"`：`style.css` / `tokens.css` 必须不存在；`Preview.astro` 可选但必须自包含，且不得 import 正式页 CSS。显式声明后最终页面只允许语义 HTML 与 `canonical` / `alternate` / `icon` metadata 链接；
  - `design.json` 通过 Zod 校验；非自产来源的 provenance 字段齐全；
  - 至少 1 个启用设计；`site.config.default` 存在且已启用。
- 派生数据：全部设计列表、启用设计列表（随机池）、default 设计。

### 6.4 页面接口【已定】

- 设计 `Page.astro` 是**完整文档**（含 `<html>`），由 `astro.config.mjs` 为每种 locale 注入固定路由。
- 统一数据接口 `src/lib/site.ts`（async `loadSite()`）：合并 site 配置 + 注册表 + profile，完成交叉校验，向设计提供：
  - `profile`（类型化个人资料，头像已解析为可直接渲染的图片引用）；
  - `site`（title/description/lang/manualSwitch）；
  - `design`（自身元信息：id、displayName、isDefault）；
  - `contextMenu`（共享操作菜单的构建期配置：`context` 页面上下文判别联合 `design` / `switcher` / `not-found` / 目标池 / `switcherHref` / 模式与存储语义 / `designActionsEnabled`；v0.10.0 起**没有** `enabled` 字段）。`styled` 页面必须渲染该配置；`html-only` 不渲染菜单，见 §7.5 与 ADR 0009；
  - URL helper（`src/lib/urls.ts`，所有内部链接必须经它拼接 base 前缀）。
- 每套设计 **必须**在 `<head>` 引入共享组件 `HeadMeta.astro`（title/description/canonical/robots/favicon；robots 规则见 §7.4）。

---

## 7. 固定模式、随机模式、手动切换与缓存规则

### 7.1 存储模型【已定】

- 键：`senrenbanka.design.v1:<baseKey>`（`baseKey`：`/` → `root`；`/repo/` → `repo`）；可用 `site.storageKey` 覆盖。**必须带命名空间**（GH Pages 同域多项目共享 localStorage）。
- 值：JSON `{ "designId": "terminal", "expiresAt": 1760000000000 | null }`（null 仅出现在固定模式的手动选择）。
- 所有读写均做容错（JSON 解析失败、designId 不在启用池 → 视为无效并覆盖/回退）。

### 7.2 行为状态表【已定】

| 场景 | 根路径行为 | 存储写入 |
|---|---|---|
| 随机模式，存储有效（未过期） | 进入存储设计 | 无 |
| 随机模式，无存储或已过期 | 重随机（`avoidImmediateRepeat` 时排除上次，池空则回退全部启用）→ 进入 | `{id, now + cacheHours}`；`cacheHours=0` 时窗口为 0（下次访问必重随机，但记得"上次"） |
| 随机模式，手动切换 | 进入所选设计 | `{id, now + cacheHours}`（重开窗口） |
| 固定模式，`manualSwitch:false` | 永远进入 default | 无读写 |
| 固定模式，`manualSwitch:true`，有手选存储 | 进入存储设计 | 无 |
| 固定模式，`manualSwitch:true`，无手选存储 | 进入 default | 无 |
| 固定模式，手动切换 | 进入所选设计 | `{id, expiresAt: null}`（永久记住） |
| 直达某设计固定 URL（分享链接） | 正常渲染该设计 | **不写存储** |
| 启用设计仅 1 套 | 永远进入它（排除逻辑自然失效） | 随机模式照常写窗口 |

表注（v0.5.0，v0.10.0 补充页面上下文）："手动切换"同时指 `/designs/` 切换页点击与菜单内「随机一个设计」；后者在**主题页**额外**必须排除当前设计**（保证点击后确实发生切换），在**切换页 / 404** 没有当前主题、走全池；`avoidRepeat` 时再尽量排除上次，随后按上表写存储并**直接导航目标设计的固定 URL**（不回根路径）；页面加载 / 打开菜单本身不写存储。

局限（如实文档化）：清除浏览器存储后无法保证"连续两次不重复"；存储按浏览器而非访客身份；跨设备不共享。

### 7.3 路由与语言入口【v0.9.0 修订】

**路由形态**（`astro.config.mjs` 的 `injectRoute`，理由见 `docs/adr/0006-multilingual-static-routing.md`）：

| 路径 | 页面 | 说明 |
|---|---|---|
| `/` | `src/pages/index.astro` | 进入**默认语言**，沿用既有 random / fixed 机制 |
| `/<locale.path>/` | `src/infra/LocaleIndex.astro` | 每种语言的入口页，目标带该语言前缀 |
| `/<locale.path>/<design>/` | `src/designs/<id>/Page.astro` | 每套设计在每种语言下的页面 |
| `/<locale.path>/designs/` | `src/infra/SwitcherPage.astro` | 每种语言的切换页；`manualSwitch: false` 时不构建 |
| `/<design>/`、`/designs/` | `src/infra/LegacyRedirect.astro` | 旧无前缀路径的兼容入口 |

- 同一 `Page.astro` 被注册到多个语言前缀；语言由 `resolveLocale(model, Astro.url.pathname)` **在构建期**从路径首段解析，页面不各自判断。
- **不启用 Astro 原生 `i18n`**：实测其开关两种配置产物完全相同，唯一作用是让 `Astro.currentLocale` 有值（不配时为 `UNDEFINED`）。采用自解析可让 `/demo` 这类部署 base 与语言前缀的边界完全可控。
- 入口页零外部请求、无 JS 降级与既有行为一致，只是 `location.replace(base + localePrefix + '/' + id + '/')` 的目标带上语言前缀。
- **不按浏览器语言自动改写 URL，也不做 Cookie 语言检测**：根路径与各 locale 入口都保持既定 random / fixed 行为。
- **语言识别只认路径首段**并与 `locales[].path` 精确匹配，因此部署 base（`/demo`）不会被误当成语言代码。

**旧路径兼容的降级行为（明确声明）**：静态托管无法在代码内实现真正的 HTTP 301（重定向由平台配置决定），因此 `/<design>/` 与 `/designs/` 采用**静态 meta refresh + `canonical` + `noindex, follow`** 的降级方案——旧链接仍可用，无 JavaScript 依赖，且不与 locale 页面形成重复可索引内容。权威地址只有带语言前缀的那一份。真正的 301 如有需要，应在托管平台侧另行配置。

### 7.4 索引策略（SEO）【已定；v0.9.0 多语言修订】

| 页面 | robots |
|---|---|
| 根路径 / 各 locale 入口页 | `noindex, follow` |
| default 设计（**每种语言各一个**） | `index, follow` + self-canonical |
| 其他设计 | `noindex, follow` + self-canonical（可直达、可分享，不进搜索） |
| 切换页 | `noindex, follow` |
| 旧无前缀兼容路径 | `noindex, follow` + `canonical` 指向默认语言版本 |

延续"每种语言只有默认主题可索引"的策略，避免 24 个视觉不同但内容相近的主题页全部参与索引。

**hreflang**：只标注在**各语言的默认主题页面**上，三种语言互指 + `x-default` 指向默认语言版本。`noindex` 的非默认主题**不标注** hreflang——它们不是可索引的等价翻译页。

`canonical` 必须包含实际 locale 路径与部署 base 前缀。

### 7.5 切换页与入口【已定；v0.5.0 入口形态修订；v0.9.0 多语言修订】

- `/<locale.path>/designs/`：共享基础设施页（中性极简风格，不模仿任何设计），列出全部启用设计（displayName + **本地化** description + 可选 accent 色块 + 当前标记）。设计说明取自各主题消息的本地化描述，而不是把单一语言的 `design.json.description` 强用于所有语言。
- 点击 = 内联脚本写入手选存储 + 正常导航（无 JS 时导航仍可用，只是不持久化）。
- **页面级操作入口 = 全站共享操作菜单（Action menu）**（v0.5.0 起替代初版"每套设计必留可见入口"；共享组件 `src/components/ContextMenu.astro` + 运行时 `src/lib/context-menu.ts`，禁止逐设计复制实现）：
  - **触发**：仅 `(hover: hover) and (pointer: fine)`（桌面鼠标）环境，在非交互区域右键 / `Shift+F10` / 上下文菜单键打开；**链接、图片、输入控件、可编辑区、已选中文字、触屏来源（混合设备长按）一律保留浏览器原生菜单**，不得全页无条件 `preventDefault()`。
  - **菜单项**：页面操作（重新加载 / 回到顶部 / 复制当前页面链接 / 打印·保存 PDF / 分享页面）+ 设计操作（随机一个设计 / 切换设计…）；`navigator.share` 不可用时**移除**该项（不留无效项）；复制 / 分享以 Toast（`role="status"`）给出成功 / 取消 / 失败反馈。**菜单标签与 Toast 文案均随当前语言**（由 `view.messages` 注入，组件本身不判断语言）。
  - **随机语义**：复用 §7.1 存储键与格式、`withBase()` URL；必须排除当前设计；`avoidRepeat` 时再尽量排除上次；仅一套启用设计时该项 `aria-disabled`（不得假装切换）；写入后导航目标固定 URL；直达固定 URL 不覆盖既有选择。**所有目标保留当前语言前缀**。
  - **键盘 / a11y**：`role="menu"` + `role="menuitem"`（icon `aria-hidden`，文本承担可访问名）；↑↓/Home/End 移动、Enter/Space 激活、Esc 关闭并归还焦点、Tab 关闭不困焦点；菜单随视口边界自动翻转收敛，点击外部 / 滚动 / 尺寸变化 / 再次右键关闭；打开时不锁定页面滚动。
  - **移动端（v0.10.0 修订 · ADR 0007）**：提供**悬浮球**入口，点击打开**底部动作面板**；**不模拟长按**、不拦截原生长按与文本选择。面板与桌面菜单**共享同一份文案 / 动作语义 / 状态语义**，但**动作清单按端裁剪**（见下条），容器形态与语言项呈现也分叉（桌面二级子菜单、移动平铺）。移动形态按 **action sheet** 契约实现（`bar` / `body` / `foot` 三段）：面板内自带**头部 ✕ 按钮**与**底部取消条**，遮罩仅作兜底——触屏没有指针、没有 hover、没有 Esc，关闭控件必须出现在面板内部。
  - **动作清单按端裁剪**（`ContextMenu.astro` 的 `desktopActions` 5 项 / `sheetActions` **2 项**），判断标准只有一条：**移动端浏览器 / 系统是否已原生提供这个动作**。移动端只保留「复制链接 / 分享」——原生长按地址栏拷贝要 2~3 步且把用户带离页面，`navigator.share()` 唤起的正是系统原生分享表单，二者都属于**缩短路径**而非重复。删除三项：**重新加载**（移动浏览器页首内置下拉刷新，且本项目上一轮刚主动把这条通道还给浏览器——保留此项等于自相矛盾）、**回到页面顶部**（NNGroup：4 屏以内属 overkill；iOS 另有"点屏幕顶端回顶"原生手势）、**打印 / 保存为 PDF**（iOS Safari 16+ 完全忽略 `window.print()`，Android Chrome 默认隐藏打印入口，两端都是"点了没反应"）。
  - **不做下拉关闭手势**：实现它需要 `touch-action: none` 抢占触屏手势，代价是**整站页面顶部的下拉刷新被一并禁用**。移动浏览器把"在页首下拉"理解为用户要求重新加载；为"少点一次 ✕"牺牲刷新能力不成立。抓手降级为纯装饰。
- **语言切换入口按渲染模式分叉**：`styled` 设计使用共享操作菜单内的语言分组（`ContextMenu.astro`，v0.9.0 修订；v0.10.0 起桌面与移动端都可达），不再单独渲染可见语言切换器，也不需要在自己的 `style.css` 中排版语言切换；`html-only` 设计在原生导航中直接提供普通语言链接。两种模式都必须带 `hreflang` / `lang`，当前语言标 `aria-current="page"`。
  - **二级菜单（而非平铺）是硬性要求**：语言项全部收进子菜单，**主菜单高度与语言数量无关**。平铺方案在语言数增多时菜单会长到超出视口而不可用；实测注入 18 种语言后主菜单仍为 8 项 / 374px（与 3 语言时完全一致），子菜单自身 `max-height: min(60vh, 26rem)` + 滚动。
  - **触发**：`语言` 行（`[data-cm-submenu-trigger]`，带 `ChevronRight` 箭头与 `aria-haspopup` / `aria-expanded` / `aria-controls`）。鼠标**悬浮**（120ms 延迟开启、180–220ms 延迟关闭，避免横扫误触与斜向移动误关）、**点击**（切换开合）或键盘 **→** 均可打开。
  - **定位**：默认贴触发项右侧；右侧放不下则**翻转到左侧**；纵向对齐触发项并收敛进视口。
  - 语言项是**普通 `<a>`**（非 button），逐个带 `hreflang` / `lang`，当前语言标 `aria-current="page"` 并附勾选标记；语言名用各语言**自称**；子菜单带翻译后的 `aria-label`。
  - 目标保持**同一主题 id**（`languageItems(model, locale, design.id)`），不重置随机有效期。
  - **键盘**：`↑↓` 在当前层级内移动；移到触发项时展开子菜单、移开时收起；`→` 进入子菜单并聚焦首项，`←` 返回触发项；`Esc` 关闭整个菜单。导航层级由 `activeMenu` 跟踪——**子菜单的项不会混进主菜单的 `↑↓` 序列**（这是二级菜单最易出错的地方）。
  - **`manualSwitch` 只控制主题切换入口**（`styled` 的随机 / 切换设计…由 `designActionsEnabled` 门控）；`manualSwitch: false` 时这些入口不渲染，`html-only` 的「全部设计」链接也不渲染，**但语言入口在两种模式下照常可用**。
  - **移动菜单的静态 DOM 不是无 JavaScript 回退**：`.cm` 与 `.cm-sheet` 初始均带 `hidden`，悬浮球与菜单交互依赖运行时，因此无 JS 时这些语言链接不可见、不可达。该表述曾是已知文档错误，ADR 0009 已更正。
  - **基础设施页例外**：切换页与 404 也接入共享菜单（v0.10.0 起），其可见 `LanguageSwitcher`（共享组件，中性样式由 `InfraStyles.astro` 提供）**包进 `<noscript>`**——运行时只有菜单一个可见入口，无 JS 时靠它回退。设计页不渲染它。
- `html-only` 以普通链接提供页内目录、同主题语言链接，并在 `manualSwitch:true` 时提供一条「全部设计」链接；不得渲染随机入口、`Font`、`Reveal`、`ContextMenu`、`InfraStyles` 或 `LanguageSwitcher`。
- `manualSwitch:false` → 各语言切换页**不构建**（404，见 §10.4 实现注记）、`styled` 菜单的「设计」组不渲染、`html-only` 的「全部设计」链接不渲染；两种模式的语言入口与各设计固定 URL 均不受影响。

### 7.6 主题偏好与语言的耦合【v0.9.0】

- 主题选择的 `localStorage` 格式与 `storageKeyFor()` 命名空间策略**保持兼容**，且**不含 locale**——主题偏好跨语言共享，不因切换语言而形成互相覆盖的不同选择。
- 切换语言只改变 locale，**不改变当前主题、不重置随机有效期**；切换主题必须保留当前语言前缀。

---

## 8. Tailwind CSS 4 与原生 CSS 使用约定

1. **每设计独立 CSS 入口**（`styled` 强制模板）：

```css
@import "tailwindcss" source(none);
@source "./";
/* 若该设计 import 了共享组件且含工具类，追加其目录： */
/* @source "../../components"; */
```

2. **动态类名禁止**（实测不可靠）；确需安全列表时用 `@source inline("…")`。
3. **原生 CSS 自由使用**（同文件或设计私有文件）；不为强行使用工具类牺牲设计还原度——复杂动画、伪元素、独特装饰、非标准布局优先原生 CSS。
4. 共享组件（`HeadMeta` 等）原则上**保持零 Tailwind 类**，避免把共享目录拖进每个设计的扫描范围。
5. **字体**：在 `astro.config` 的 `fonts` 注册（每新增设计同步注册其字体，注意：配置项是项目级的，唯一的中央登记点）；页面 `<Font cssVariable preload?>`；`@theme inline` 注册进 Tailwind。provider 以"构建期自托管、运行时零第三方请求"为目标（NPM/Fontsource 二选一，按网络可及性在实施时定）；回退栈须含系统中文字体（示例资料含中文用于验证）。【待实施验证】新增主题的字体选型流程见 `docs/fonts/selection-guide.md`（本地字体库仅用于发现与预览，不参与构建；未核实许可的字体不得进入生产管线，决策见 `docs/adr/0008-local-font-library-isolation.md`）。
6. 图片：设计私有资产放各自 `assets/`（Vite 处理）；profile 头像由数据层解析（`src/data/assets/` 本地文件或外部 URL）。
7. **禁止**把所有设计样式合并进公共 CSS、禁止跨设计共享设计 Token。
8. **预览碎片的样式隔离**（v0.10.0+，见 `docs/rules/design-contract.md`）：`Preview.astro` 不得 import 本设计 `style.css`；令牌只能来自命名空间类作用域的 `tokens.css`（禁止 `:root`）；预览样式只出现在切换页，设计页 0 个预览选择器；`style.css` 必须 `@source not "./Preview.astro";` 排除预览文件。预览 CSS 在切换页聚合为单个样式表——这**不违反**第 1 条（它不是设计 CSS 入口，且不含 preflight 与整页规则）。
9. **`html-only` 例外**（ADR 0009）：不提供 `style.css` / `tokens.css`，不 import Tailwind，不渲染字体、Reveal、共享菜单或基础设施样式；页面使用浏览器默认呈现。可选的 `Preview.astro` 只用于切换页，样式自包含，不改变正式页面的资源契约。

---

## 9. 项目级实现约定

【已定】项目级实现约定由仓库根目录 `AGENTS.md` 与 `docs/rules/` 共同承载：根文件只保留编码 Agent 每次会话必须立即知道的硬门禁与任务路由，`docs/rules/` 是全部规则的唯一完整正文来源；本规格不再复制其条文。交付门槛（新设计完成、设计页或共享机制改动后的完整验证）由 `design-page-verify` skill 执行，其**当前状态**记录在 `docs/verification/`；文档职责索引见 `docs/README.md`。

（历史：2026-10-11 文档治理前，本节曾列出 AGENTS.md 的最低内容清单；2026-10-29 起根文件改为入口，完整正文迁入 `docs/rules/`；旧清单原文见 Git 历史。）

---

## 10. 构建、校验、测试与部署

### 10.1 npm scripts【已定】

```jsonc
{
  "dev": "astro dev",
  "check": "astro check",
  "test:html-only": "node --test scripts/verify-html-only.test.mjs",
  "verify:html-only": "npm run test:html-only && node scripts/verify-html-only.mjs",
  "build": "npm run check && astro build && npm run verify:html-only",
  "preview": "astro preview"
}
```

- `engines.node >= 22.12`；提交 `package-lock.json`。
- `scripts/verify-html-only.mjs` 使用 Node 标准库与现有 `yaml`，读取 `site.config.yaml` / `design.json`，逐 `html-only` 设计 × locale 检查最终 HTML；无候选、缺页面或违规资源均非零退出，支持 `--dist <dir>`。注册表校验在 Astro 构建期 fail-fast。
- 校验机制：注册表构建期强校验（§6.3）+ `astro check` + HTML-only 产物门禁。一期不做自动化 e2e/视觉回归（二期）。

### 10.2 GitHub Pages【已定】【待实施验证】

- `.github/workflows/deploy.yml`：显式步骤（checkout → setup-node（Node 24，开 npm 缓存）→ `npm ci` → 注入 env 后 `npm run build` → configure-pages → upload-pages-artifact（`dist`）→ deploy-pages）；`permissions: contents:read, pages:write, id-token:write`；deploy 作业限 `main` 分支。action 版本号实施时按 GitHub 官方 starter workflow 核对（不采用纯封装 action，以保证环境变量注入透明可控）。
- env 自动注入：`SITE_URL: https://${{ github.repository_owner }}.github.io`、`BASE_PATH: /${{ github.event.repository.name }}` → **fork 后零配置**。
- 自定义域名：`public/CNAME` + 把 workflow 的 `BASE_PATH` 改为 `/`（README 说明）。
- Source 选 "GitHub Actions"；`.nojekyll` 仅"分支发布"时代需要，Actions artifact 方式预期不需要（实施时顺手实测确认）。

### 10.3 Cloudflare Pages / Vercel【已定】

- CF Pages：连接仓库；Build command `npm run build`；输出目录 `dist`；可选环境变量 `SITE_URL`；Node 版本用 `.nvmrc`。不使用 `_headers`/`_redirects`/Functions（二期可选）。
- Vercel：导入仓库，框架预设自动识别 Astro；可选 `SITE_URL`；零配置。
- 二者文档写入 README（三步操作 + 自定义域名提示）。

### 10.4 base/site 处理【已定】

- `astro.config.mjs`：`site: process.env.SITE_URL ?? 示例值`、`base: process.env.BASE_PATH ?? '/'`。
- 所有内部链接经 `src/lib/urls.ts` helper（自动拼 base），设计不得硬编码绝对路径。
- 设计路由与切换页均通过 `astro.config.mjs` 的本地集成 `injectRoute` 注入（`manualSwitch:false` 时不注入切换页 → 404）。**【已实施，实测通过】** 原因：动态 `[design]` 路由的 `import.meta.glob` 会把所有设计的 CSS 聚合进每个页面（见 §3.2-11）。副作用：新增 / 删除设计目录后需重启 dev 服务器。

---

## 11. 建议目录结构

```
SenrenBanka/
├─ .github/
│  └─ workflows/
│     └─ deploy.yml                  # GitHub Pages 部署：checkout → Node 24 + npm ci →
│                                    #   注入 SITE_URL/BASE_PATH 构建 → 上传 dist → deploy
├─ public/
│  └─ favicon.svg                    # 唯一公共静态资源（自定义域名时此处加 CNAME）
├─ src/
│  ├─ data/                          # ★ 使用者日常只改这里
│  │  ├─ profiles/                   #   各语言的个人资料（文件名 = i18n.locales[].path）
│  │  │  ├─ zh-cn.yaml               #   简体中文资料（共用同一套 schema）
│  │  │  ├─ ja.yaml                  #   日语资料
│  │  │  └─ en.yaml                  #   英语资料
│  │  ├─ site.config.yaml            #   站点 + i18n 语言清单 + 行为配置（mode/default/manualSwitch…）
│  │  └─ assets/
│  │     └─ avatar.jpg               #   可选：本地资料图片
│  ├─ content.config.ts              # 内容层：profile / site 两个集合（glob loader + Zod）
│  ├─ lib/                           # 框架共享逻辑（设计不重复实现）
│  │  ├─ site.ts                     #   loadSite()：多语言资料合并与交叉校验、resolveLocale()、类型化数据接口
│  │  ├─ urls.ts                     #   base 前缀 helper（所有内部链接必须经此拼接）+ 路径分段解析
│  │  ├─ router-script.ts            #   根路由页/切换页共享的内联脚本源码生成（随机/缓存/手选）
│  │  └─ context-menu.ts             #   共享操作菜单运行时（形态判定/动作/键盘/随机语义；无 CSS 边）
│  ├─ i18n/
│  │  ├─ messages.ts                # 共享文案（操作菜单/切换页/入口/404/语言选择器；纯数据，无 CSS 边）
│  │  └─ resolve.ts                 # 按语言取共享文案的唯一入口（缺键构建期报错，不静默回退）
│  ├─ components/
│  │  ├─ HeadMeta.astro              # 共享 <head> 元信息（title/description/canonical/robots/hreflang）
│  │  ├─ LanguageSwitcher.astro      # 语言切换的无 JS 回退（可见静态链接；仅基础设施页在 <noscript> 内使用，样式由 InfraStyles 提供）
│  │  ├─ InfraStyles.astro           # 基础设施页共享极简样式（<style is:inline>，保证根页零外部请求）
│  │  ├─ Reveal.astro                # 滚动显现装配（内联 boot + 共享 IO 触发，不 import CSS）
│  │  └─ ContextMenu.astro           # 共享操作菜单（中性 chrome；桌面浮层 + 移动面板 + 悬浮球三件；is:inline 样式 + 按需加载运行时）
│  ├─ designs/                       # ★ 设计库：目录存在即注册（自动发现 + 构建期强校验）
│  │  ├─ registry.ts                 #   glob design.json → 按 renderMode 校验 → 派生注册表
│  │  ├─ editorial/                  # ── 单套设计示例（自产：编辑杂志风）──
│  │  │  ├─ DESIGN.md                #    设计规范快照
│  │  │  ├─ design.json              #    元数据：显示名/描述/enabled/来源与许可
│  │  │  ├─ messages.ts              #    该设计的三语言界面文案（缺文件或缺键构建期报错）
│  │  │  ├─ Page.astro               #    完整页面（含 <html> 文档）
│  │  │  ├─ style.css                #    styled 的 CSS 入口（source(none) + @source + 原生 CSS）
│  │  │  ├─ components/              #    该设计私有组件（可选）
│  │  │  └─ assets/                  #    该设计私有资源（可选）
│  │  ├─ terminal/                   # 自产：复古终端风（结构同 editorial）
│  │  ├─ oxide/                      # 官方来源（oxidecomputer/design-system，MPL-2.0）
│  │  │  └─ …                        #   必交文件 + SOURCE-LICENSE.txt
│  │  └─ fast/                       # 官方来源（microsoft/fast，MIT）
│  │     └─ …                        #   必交文件 + SOURCE-LICENSE.txt
│  ├─ infra/
│  │  ├─ SwitcherPage.astro          # 切换页（injectRoute 为 /<locale>/designs/，manualSwitch 时才注入）
│  │  ├─ LocaleIndex.astro           # 语言入口页（injectRoute 为 /<locale>/）
│  │  └─ LegacyRedirect.astro        # 旧无前缀路径的静态跳转页（meta refresh + canonical + noindex）
│  └─ pages/
│     ├─ index.astro                 # 根路由页：进入默认语言（内联脚本 + noscript 降级，noindex）
│     └─ 404.astro                   # 中性 404（noindex，提供各语言入口）
├─ .gitignore
├─ .nvmrc                            # Node 24
├─ AGENTS.md                         # 项目规则入口（硬门禁 + 任务路由；完整正文在 docs/rules/）
├─ LICENSE                           # MIT
├─ change-log/                       # 版本记录（一个版本一个文件；成果 / 修复 / 验证结论）
├─ docs/                             # 文档索引 / ADR / 主题适配 / 字体选型 / 验证状态（见 docs/README.md）
│  ├─ README.md                      #   文档职责索引与维护规则
│  ├─ rules/                         #   项目级规则唯一完整正文来源
│  ├─ adr/                           #   长期技术决策（一事一文件）
│  ├─ designs/<id>/ADAPTATION.md     #   主题适配记录（仅确有适配 / 例外时创建）
│  ├─ fonts/selection-guide.md       #   字体选型流程（本地字体库仅发现 / 预览，不入库、不进构建）
│  └─ verification/                  #   各主题与共享机制的当前验证状态（更新式）
├─ README.md                         # fork → 改资料 → 三平台部署 → 新增设计
├─ scripts/
│  └─ verify-html-only.mjs           # html-only 最终 HTML 资源门禁（支持 --dist）
├─ SPEC.md                           # 本规格（唯一契约文档）
├─ astro.config.mjs                  # Tailwind vite 插件 / fonts(npm provider) / site+base(env) / injectRoute 多语言设计路由·语言入口·切换页·旧路径跳转
├─ package.json                      # scripts: dev/check/test:html-only/build/verify:html-only/preview；engines.node >= 22.12
├─ package-lock.json
└─ tsconfig.json                     # 继承 astro/tsconfigs/strict
```

---

## 12. 一期实施顺序

1. 脚手架：Astro 7 + TS + Tailwind 4（@tailwindcss/vite）+ @astrojs/check；`.nvmrc`、engines、npm scripts。
2. 数据层：`content.config.ts`（glob loader + Zod）→ 示例 `profile.yaml` / `site.config.yaml` → `lib/site.ts` / `lib/urls.ts`。
3. 骨架：`registry.ts`（含校验）+ `HeadMeta` + `pages/index.astro`（根路由）+ `[design]` 动态路由 + 切换页（条件构建），用 2 个临时最小设计跑通构建。
4. 选型定稿：抓取 Oxide / Vercel 的完整 DESIGN.md（核实可获取性 + 许可 + provenance；不行则换备选）；用 impeccable `document --seed` 生成 editorial、terminal 两份 DESIGN.md。
5. 逐套实现 4 套设计（按 `docs/rules/` 约定；每套完成后：`design-page-verify` 全流程，状态写入 `docs/verification/`）。
6. 行为完善：随机/固定/缓存/避免重复/手选持久化全套 + 边界（单设计、过期、禁用设计、模式切换遗留存储）。
7. 部署：GH workflow + CF/Vercel 文档 + 自定义域名说明 + base 前缀全链路自检（`BASE_PATH=/x npm run build` 抽查）。
8. 验收：跑完 §13 全部条目；补全 README、AGENTS.md 入口与 `docs/rules/` 正文。
9. 交付：MIT `LICENSE`、AGENTS.md/README 与 `docs/rules/` 定稿；一期不做实际部署（工作流就位，由使用者按需启用）。

---

## 13. 验收标准（可验证）

1. 干净克隆后 `npm ci && npm run build` 成功（末尾执行 HTML-only 产物门禁）；`astro check` 无错误；注册表校验对缺失文件、错误的 `renderMode` 文件组合与缺 provenance 能明确报错（人为制造一次验证）。
2. `dist/` 含：`index.html`（根路由）、`designs/index.html`（切换页）、每套设计 `dist/<id>/index.html`；`manualSwitch:false` 构建时无 `designs/`。
3. CSS 隔离抽查：任取两套 `styled` 设计，A 的 CSS 不含 B 独有工具类（对 dist 产物 grep 抽查一次）；`html-only` 页面链接的 stylesheet 数必须为 0。
4. 随机行为矩阵（人工，dev 或 preview）：首访落地启用池内；窗口内刷新一致；过期（手改 `expiresAt`）后重随机且不与上次重复；仅 1 套启用时永远它；禁用设计从不出现在随机结果与切换页；菜单「随机一个设计」在**主题页**遵循同一矩阵且**永不落在当前设计**，在切换页 / 404 走全池（不排除任何主题）；仅 1 套启用时该项禁用、点击不产生任何导航。
5. 固定模式：根路径永远 default；`manualSwitch:true` 时手选后永久生效（清空过期逻辑不适用，菜单随机写入 `expiresAt:null`）；`manualSwitch:false` 时 `styled` 菜单本体与语言分组仍渲染（无可见主题切换入口）、`html-only` 无“全部设计”链接但语言链接仍可用、`/designs/` 返回 404。
6. 手选持久化：随机模式手选后窗口内保持、过期后恢复轮换；直达设计 URL 不改变后续根路径归属。
7. 无 JS（禁用浏览器 JS）：根路径 meta refresh 进入 default；设计页与切换页内容可读、链接可导航。`styled` 设计页的菜单语言入口仍不可达（这是已知取舍，不得把隐藏菜单 DOM 声称为回退）；`html-only` 的目录、语言与资料链接必须以普通锚点保持可达。
8. SEO：根路径与切换页 `noindex`；仅 default 设计页 `index` + self-canonical；其余设计 `noindex,follow`。
9. 根路径零第三方请求（Network 面板确认，无字体/CSS/JS 请求）；切换在首屏前完成（无明显闪烁）。
10. 字体：dist 内自托管（无 `fonts.googleapis.com` 等第三方引用）；回退栈含系统字体（含中文），断网/屏蔽字体时版式可读。
11. 每套设计含 `DESIGN.md` + `design.json` + `Page.astro` + `messages.ts`（provenance 完整）；`design.json.renderMode` 缺省按 `styled` 处理，`html-only` 不提供 `style.css` / `tokens.css`，但可提供自包含 `Preview.astro`；移动端（375px 宽）无横向溢出、内容可读；核心字段均被渲染。
12. 部署自检：`BASE_PATH=/demo npm run build` 后，产物内链接正确带 `/demo` 前缀（抽查根页脚本、切换页链接与 html-only 语言 / 设计链接）。
13. README 覆盖：fork → 修改资料 → 三平台部署（含自定义域名说明）→ 新增设计流程。
14. 共享操作菜单（`manualSwitch:true`，所有 `styled` 设计）：桌面端在非交互区域右键 / `Shift+F10` 均可打开菜单且视口边缘自动收敛；全部菜单项真实执行、失败路径有明确反馈（复制降级 / 分享取消 / `navigator.share` 不可用时该项不出现）；链接、图片、输入控件、可编辑区与已选中文字保留浏览器原生菜单；键盘可遍历激活、Esc 关闭并归还焦点；375px 触控仿真下悬浮球可见（命中 ≥44px）、点击可开合底部动作面板、面板内语言项平铺可达、**面板内两条关闭路径均可用（头部 ✕ 44px / 底部取消条 ≥48px）且均解锁背景滚动**、操作项按页面/设计/语言分组、**移动端面板内不存在「重新加载 / 回到页面顶部 / 打印」三项而桌面菜单仍有**、**全站 `touch-action` 计算值无 `none`（页面顶部下拉刷新可用）**、无横向溢出（v0.10.0 修订）；切换页与 404 同样能打开共享菜单，且切换页不渲染重复的「切换设计…」项；所有 `styled` 设计均不存在旧的可见 `Switch design` 入口。`html-only` 不接入菜单。
15. HTML-only 产物门禁：每个 `html-only` 设计 × locale 的最终 HTML 不含 `<style>`、`style` 属性、`<script>`、事件处理器、`iframe` / `object` / `embed`、`javascript:` URL 或 meta refresh；`<link>` 只含 `canonical` / `alternate` / `icon`，无 stylesheet / preload。缺少候选或页面、任一项违规均让 `npm run verify:html-only` 非零退出；该命令先跑 Node 内置回归测试，`--dist` 可检查指定产物目录。

---

## 14. 主要风险与防范

| 风险 | 防范 |
|---|---|
| 许可风险（第三方规范再分发） | §4 策略：仅许可可确认来源入库；provenance 强制；designmd.co 排除；保留声明文件；不确定即不入库 |
| CSS 体积失控（多设计类名互泄） | 从第一套设计起固定 `source(none)+@source` 协议；验收抽查隔离 |
| DESIGN.md 格式参差、单份不足以成页 | `docs/rules/` 项目级规则正文层 + `AGENTS.md` 入口 + `design-page-verify` 流程 |
| 来源漂移（上游改 URL/删文件） | 快照归档入库 + `fetchedAt` 记录；构建不依赖上游 |
| 工具版本漂移（impeccable 等） | `generatedBy` 记录生成工具与版本；技能升级不影响已归档设计 |
| GH Pages 同域存储冲突 | 存储键含 base 命名空间 + 可覆盖 |
| GH 子路径与根路径产物差异 | env 驱动 site/base + `urls.ts` 统一前缀 + 验收第 12 条 |
| 近重复内容 SEO | 仅 default 可索引（§7.4） |
| 设计质量不可自动校验的部分（共享操作菜单接入、随机语义等） | `design-page-verify` 流程与通过标准（一期接受）；菜单跨设计 / 跨输入环境的实测矩阵见 `docs/verification/action-menu.md` |

---

## 15. 二期延期项

- 访客统计（第三方分析或无服务器 API）
- CF/Vercel 边缘能力增强（如带 Cookie 的服务端随机，非必需）
- 自动化 e2e / 视觉回归 / Lighthouse CI
- sitemap（一期仅 1 个可索引页，意义有限）
- 更多设计扩充（2026-10-11 启动，见 §4.4；awesome-design-md 接入经复核取消，见 §4.1）
- i18n、多资料语言版本
- 设计市场 / 在线编辑器 / 账号系统 / 后端（不在一期，也未承诺）

---

## 16. 已决定事项（原开放事项，2026-10-10 确认）

1. 仓库开源许可证：**MIT**（随一期交付 `LICENSE`；内置第三方 DESIGN.md 的声明保留要求与之兼容，见 §4）。
2. 官方来源最终替换：由实施者自主决定（Vercel 不可获取/许可不明时替换 Resend / Nuxt / FAST；标准 = 风格差异显著 + 许可可确认）。
3. 一期不做实际部署上线：仅本地构建验证 + 部署工作流与文档就位。
4. 示例 `profile.yaml`：占位内容（中英混排，用于验证字体回退与排版）。
5. 正式远程仓库：`https://github.com/whitehair-failure/SenrenBanka.git`（GH Pages 的 `SITE_URL`/`BASE_PATH` 将由 workflow 按仓库上下文自动推导）。

---

## 17. 调研来源（关键链接）

- Astro 样式/Tailwind 集成：https://docs.astro.build/en/guides/styling/ ；https://tailwindcss.com/docs/installation/framework-guides/astro
- Tailwind 源扫描：https://tailwindcss.com/docs/detecting-classes-in-source-files
- Astro 内容层：https://docs.astro.build/en/guides/content-collections/ ；https://docs.astro.build/en/reference/content-loader-reference/
- Astro 字体：https://docs.astro.build/en/guides/fonts/
- Astro 路由/getStaticPaths：https://docs.astro.build/en/reference/routing-reference/
- 部署：https://docs.astro.build/en/guides/deploy/github/ ；https://developers.cloudflare.com/pages/ ；https://vercel.com/docs
- VOLTAGENT 官方目录：https://github.com/VoltAgent/official-design-md （索引 11 份，MIT 仅覆盖索引）
- awesome-design-md（第三方分析，备选）：https://github.com/VoltAgent/awesome-design-md
- DesignMD Catalog（已排除）：https://www.designmd.co/catalog （许可页空壳，未能核实）
- Impeccable：https://impeccable.style/ ；https://github.com/pbakaus/impeccable （Apache-2.0）
- design.md 格式（Google Stitch）：https://github.com/google-labs-code/design.md
- 参考先例：https://github.com/ansango/astro-distro ；https://www.csszengarden.com/
- 存储规范背景：https://html.spec.whatwg.org/multipage/webstorage.html

---

## 18. 实施与验证记录的归属（2026-10-11 文档治理迁移）

本规格**不维护**逐次实施 / 验证日志；各类记录的当前归属：

- 各主题当前验证状态：`docs/verification/<id>.md`（共享机制：`docs/verification/shared.md`）
- 主题适配与例外（厂商来源等）：`docs/designs/<id>/ADAPTATION.md`
- 版本成果、修复与验证结论：`change-log/<version>.md`
- 长期技术决策：`docs/adr/`
- 文档职责索引与引用关系：`docs/README.md`

2026-10-11 迁移把原 §18（v0.1.0–v0.5.2 的实施记录）按下述方式整理：仍有效的结论并入 §3.2 与本规格相关章节；验证细节迁入 `docs/verification/`；主题适配迁入 `docs/designs/<id>/ADAPTATION.md`；其余纯历史过程由 Git 保留（迁移前全文见 Git 历史）。

