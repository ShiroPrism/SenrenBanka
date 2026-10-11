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
2. 每套设计拥有独立的 HTML 结构、排版、CSS 与必要交互，不是换色/换字体的简单主题。
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
| Q4 | 切换入口形态 | 共享 `/designs/` 切换页 + **桌面端统一右键快捷操作菜单**（v0.5.0 起替代初版"每套设计必留一个可见入口"；移动端不提供菜单与任何替代入口）。`manualSwitch:false` → 菜单不渲染、切换页不构建（404）；设计固定 URL 仍可直达。 |
| Q5 | 根路径与 SEO | 根路径=零外部请求的轻量路由页（内联脚本 `location.replace`；noscript meta refresh→default+链接列表）。索引策略 **B**：仅 default 设计可索引，其余 `noindex,follow`。 |
| Q6 | 设计注册机制 | **目录自动发现**：`src/designs/<id>/` 存在即注册，元数据在同目录 `design.json`；站点配置不含设计清单；`_` 前缀目录忽略；构建期校验强制完整性。`enabled:false` = 页面仍构建可直达，退出随机池与切换页。 |
| Q7 | 部署基线 | `site`/`base` 由环境变量驱动（`SITE_URL` / `BASE_PATH`，默认 `/`）；GH workflow 自动注入本仓库上下文 → fork 后零配置；CF Pages/Vercel 用面板配置（文档说明）。一期验证深度：本地构建 + 文档核实，不做实际部署。 |
| Q8 | 一期设计选型 | **4 套** = 官方 2（Oxide，已实测可抓取 + Vercel，待核实；备选 Resend/Nuxt/FAST）+ 自产 2（编辑杂志风 / 复古终端风）。最终定稿在实施第 4 步（抓取 + 目检 + 许可核实）。 |

其他默认（已确认）：字体用 `astro:fonts` 构建期自托管（运行时零第三方请求）；仓库附示例 `profile.yaml`；项目名 `SenrenBanka`。

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
13. **字体 npm provider**【已核实，本机实测】：`fontProviders.npm({ remote:false })` + `options.package` 可从已安装 `@fontsource-variable/*` 包在构建期自托管（无需联网）；族名必须与包内 CSS 完全一致（`Fraunces Variable`、`JetBrains Mono Variable`）；传 `weights` 范围过滤会解析不到（省略即可，variable 包自带完整字重轴）。
14. **共享 chrome 的 CSS/JS 隔离契约**【已核实，本机实测，v0.5.0】：`ContextMenu.astro` 的样式用 `<style is:inline>` 内联——设计页不新增 `<link>`，"每设计页只链接自己的 CSS" 仍成立，根页 / 切换页 / 404 不含菜单任何字节；运行时经内联 `matchMedia('(hover: hover) and (pointer: fine)')` 门控 + 动态 `import()` 加载，Vite 不为其生成 `modulepreload`，**触屏设备零菜单 JS 请求**（375×812 触控仿真实测 chunk 请求数 0）。
15. **`import.meta.env.BASE_URL` 尾斜杠**【已核实，本机实测】：Astro 7 在带 base 时返回**不带尾斜杠**（如 `'/demo'`），`src/lib/urls.ts` 已归一化（否则拼出 `/demoeditorial/`）；`BASE_PATH=/demo` 前缀自检通过（根脚本 / noscript / 切换页链接 / canonical / favicon）。
16. **npm provider 字体无法子集过滤**【已核实，本机实测】：face 无 `subset` 元数据、family 级 `subsets` 为空操作；`preload` 会带入未使用子集——据此 editorial 移除 preload、terminal 不 preload；latin 子集仍按 `unicode-range` 按需加载。

---

## 4. 设计规范来源、获取与保存流程

### 4.1 合规策略【已定】

- **允许入库**：
  - A. 厂商官方发布（如 official-design-md 索引的 Vercel、Nuxt、Resend、Ant Design、Atlassian、FAST、Oxide、Juspay、Clerk、Mintlify、VoltAgent）——逐份核实原文所在仓库、许可要求并保留声明；"first-party 官方"的说法目前仅为索引仓库自述，须逐份核实。
  - D. 自产（按 Google Stitch `design.md` 格式起草，并用 impeccable `document`（scan 模式）规范化固化；`generatedBy` 记录工具与版本）——完全可控。
- **条件允许**：B. 第三方整理（awesome-design-md，仓库 MIT、74 套品牌分析）——仅当逐份核实许可可行，并在 `design.json` 与 README 中标注"非官方分析"。
- **排除**：designmd.co（条款/许可页为空壳，无法确认再分发授权；正文依赖 JS 注入）。

### 4.2 获取与归档流程（每新增一套设计）

1. 选定来源，抓取**完整** `DESIGN.md`（GitHub raw 优先，URL 稳定）。
2. 保存到 `src/designs/<id>/DESIGN.md`（作为快照，此后不依赖上游）。
3. 填写 `design.json.source`：`type`（official-vendor / third-party-analysis / self-produced）、`url`、`fetchedAt`（ISO 日期）、`license`、`attribution`。
4. 许可要求保留声明时，附 `SOURCE-LICENSE.txt`（原文许可或声明）。
5. 构建校验通过（缺 provenance 字段时**构建失败**）。
6. 无法获取、文件不完整或许可不明确时：**如实报告，不得伪造**；改选其他来源。

### 4.3 一期选型【已定】

| 设计 id | 来源 | 许可 | 状态 |
|---|---|---|---|
| oxide | 官方（oxidecomputer/design-system） | MPL-2.0 | 已归档（含 SOURCE-LICENSE.txt） |
| fast | 官方（microsoft/fast） | MIT | 已归档（含 SOURCE-LICENSE.txt） |
| editorial | 自产（impeccable 规范化） | — | 已实现 |
| terminal | 自产（impeccable 规范化） | — | 已实现 |

实施结果（2026-10-10）：Vercel 的 design.md 挂在官网、无许可声明，按合规策略弃用，替换为许可已核实的 Microsoft FAST。自产规范已由 **impeccable v4.5.2 `document`（scan 模式）** 规范化固化为正式规范。

---

## 5. 通用个人资料配置格式

### 5.1 文件与校验【已定】

- `src/data/profile.yaml`（个人资料）与 `src/data/site.config.yaml`（站点/行为配置），均为内容层集合（glob loader），Zod schema 校验（`strict()` 拒绝未知键，防拼写错误）。
- 所有设计通过统一数据接口（`src/lib/site.ts`）获取资料，**禁止每套设计重复维护信息**。

### 5.2 profile.yaml 示例

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
- 设计可添加装饰性文案（如 "Selected Works" 标签），**不得编造**个人事实（项目、经历、数据）。
- 不做"设计是否渲染了核心字段"的自动检查（难以可靠实现）；由实现约定（`AGENTS.md`）+ `design-page-verify` 流程约束。

### 5.4 site.config.yaml 示例

```yaml
site:
  title: "Your Name — Portfolio"
  description: "SEO 描述"
  lang: "en"
  url: null          # 可选；构建时优先使用 SITE_URL 环境变量
  storageKey: null   # 可选覆盖；默认由 base 路径自动派生（见 §7）
design:
  mode: random       # random | fixed
  default: editorial # 必填；random 模式下是无 JS/SEO 回退设计，fixed 模式下是固定展示
  manualSwitch: true
  random:
    cacheHours: 24   # 0 = 每次访问都重新随机（仍避免连续重复）
    avoidImmediateRepeat: true
```

校验规则：`default` 必须是存在的启用设计；至少 1 个启用设计；`cacheHours >= 0`。

---

## 6. 设计目录、页面接口与注册机制

### 6.1 设计目录结构【已定】

```
src/designs/<id>/
├─ DESIGN.md          # 设计规范快照（来源见 §4）
├─ design.json        # 元数据（机器可读）
├─ Page.astro         # 该设计的完整页面（含 <html> 文档）
├─ style.css          # 该设计的 CSS 入口（Tailwind source(none) + @source + 原生 CSS）
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

- `src/designs/registry.ts`：`import.meta.glob('./*/design.json', { eager: true })` 取元数据 + `import.meta.glob('./*/Page.astro')` 取惰性页面组件。
- **构建期强制校验**（失败即构建终止，报错必须指明目录与原因）：
  - 目录名（id）：`^[a-z0-9][a-z0-9-]*$`；不得使用保留字 `designs`；`_` 前缀目录忽略（放未完成设计）；
  - 四件套齐备：`DESIGN.md`、`design.json`、`Page.astro`、`style.css`；
  - `design.json` 通过 Zod 校验；非自产来源的 provenance 字段齐全；
  - 至少 1 个启用设计；`site.config.default` 存在且已启用。
- 派生数据：全部设计列表、启用设计列表（随机池）、default 设计。

### 6.4 页面接口【已定】

- 设计 `Page.astro` 是**完整文档**（含 `<html>`），渲染于 `src/pages/[design]/index.astro` 动态路由。
- 统一数据接口 `src/lib/site.ts`（async `loadSite()`）：合并 site 配置 + 注册表 + profile，完成交叉校验，向设计提供：
  - `profile`（类型化个人资料，头像已解析为可直接渲染的图片引用）；
  - `site`（title/description/lang/manualSwitch）；
  - `design`（自身元信息：id、displayName、isDefault）；
  - `contextMenu`（桌面右键菜单的构建期配置：当前设计与强调色 / 目标池 / `switcherHref` / 模式与存储语义；`manualSwitch:false` 时 `enabled:false`，见 §7.5）；
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

表注（v0.5.0）："手动切换"同时指 `/designs/` 切换页点击与右键菜单「随机一个设计」；后者额外**必须排除当前设计**（保证点击后确实发生切换），`avoidRepeat` 时再尽量排除上次，随后按上表写存储并**直接导航目标设计的固定 URL**（不回根路径）；页面加载 / 打开菜单本身不写存储。

局限（如实文档化）：清除浏览器存储后无法保证"连续两次不重复"；存储按浏览器而非访客身份；跨设备不共享。

### 7.3 根路径路由页【已定】

- 构建期将运行配置序列化为内联 JSON 注入（mode、enabled 池、default、cacheHours、avoidRepeat、base、storageKey），`<head>` 顶部内联脚本**同步**执行选择逻辑并 `location.replace(base + id + '/')`（`replace` 防止后退死循环）。
- 页面**零外部请求**（无 CSS/JS/字体加载）；极慢网络下显示一行极简提示文字。
- 无 JS 降级：`<noscript>` 内 `meta http-equiv="refresh" 0 秒 → default`，并附全部启用设计的链接列表（可访问性兜底）。注意：Googlebot 执行 JS、不解析 noscript，该降级仅面向真人。
- 影响说明：跳转在解析早期完成，真实用户≈瞬时；CDN/浏览器缓存无影响（同一份 HTML 服务所有访客，选择逻辑纯客户端）。

### 7.4 索引策略（SEO）【已定】

| 页面 | robots |
|---|---|
| 根路径 | `noindex, follow` |
| default 设计 | `index, follow` + self-canonical（唯一可索引入口） |
| 其他设计 | `noindex, follow` + self-canonical（可直达、可分享，不进搜索） |
| 切换页 | `noindex, follow` |

### 7.5 切换页与入口【已定；v0.5.0 入口形态修订】

- `/designs/`：共享基础设施页（中性极简风格，不模仿任何设计），列出全部启用设计（displayName + description + 可选 accent 色块 + 当前标记）。
- 点击 = 内联脚本写入手选存储 + 正常导航（无 JS 时导航仍可用，只是不持久化）。
- **设计切换入口 = 桌面端共享右键快捷操作菜单**（v0.5.0 起替代初版"每套设计必留可见入口"；共享组件 `src/components/ContextMenu.astro` + 运行时 `src/lib/context-menu.ts`，禁止逐设计复制实现）：
  - **触发**：仅 `(hover: hover) and (pointer: fine)`（桌面鼠标）环境，在非交互区域右键 / `Shift+F10` / 上下文菜单键打开；**链接、图片、输入控件、可编辑区、已选中文字、触屏来源（混合设备长按）一律保留浏览器原生菜单**，不得全页无条件 `preventDefault()`。
  - **菜单项**：页面操作（重新加载 / 回到顶部 / 复制当前页面链接 / 打印·保存 PDF / 分享页面）+ 设计操作（随机一个设计 / 切换设计…）；`navigator.share` 不可用时**移除**该项（不留无效项）；复制 / 分享以 Toast（`role="status"`）给出成功 / 取消 / 失败反馈。
  - **随机语义**：复用 §7.1 存储键与格式、`withBase()` URL；必须排除当前设计；`avoidRepeat` 时再尽量排除上次；仅一套启用设计时该项 `aria-disabled`（不得假装切换）；写入后导航目标固定 URL；直达固定 URL 不覆盖既有选择。
  - **键盘 / a11y**：`role="menu"` + `role="menuitem"`（icon `aria-hidden`，文本承担可访问名）；↑↓/Home/End 移动、Enter/Space 激活、Esc 关闭并归还焦点、Tab 关闭不困焦点；菜单随视口边界自动翻转收敛，点击外部 / 滚动 / 尺寸变化 / 再次右键关闭；打开时不锁定页面滚动。
  - **移动端（项目决策）**：不提供页面内切换菜单、不模拟长按、**不加载菜单运行时**（能力门控 + 动态 import，见 §3.2-14）；设计页不保留任何移动端替代入口。
- `manualSwitch:false` → `/designs/` **不构建**（404，见 §10.4 实现注记）、菜单不渲染（设计页零菜单标记 / 零脚本）；各设计固定 URL 不受影响。

---

## 8. Tailwind CSS 4 与原生 CSS 使用约定

1. **每设计独立 CSS 入口**（强制模板）：

```css
@import "tailwindcss" source(none);
@source "./";
/* 若该设计 import 了共享组件且含工具类，追加其目录： */
/* @source "../../components"; */
```

2. **动态类名禁止**（实测不可靠）；确需安全列表时用 `@source inline("…")`。
3. **原生 CSS 自由使用**（同文件或设计私有文件）；不为强行使用工具类牺牲设计还原度——复杂动画、伪元素、独特装饰、非标准布局优先原生 CSS。
4. 共享组件（`HeadMeta` 等）原则上**保持零 Tailwind 类**，避免把共享目录拖进每个设计的扫描范围。
5. **字体**：在 `astro.config` 的 `fonts` 注册（每新增设计同步注册其字体，注意：配置项是项目级的，唯一的中央登记点）；页面 `<Font cssVariable preload?>`；`@theme inline` 注册进 Tailwind。provider 以"构建期自托管、运行时零第三方请求"为目标（NPM/Fontsource 二选一，按网络可及性在实施时定）；回退栈须含系统中文字体（示例资料含中文用于验证）。【待实施验证】
6. 图片：设计私有资产放各自 `assets/`（Vite 处理）；profile 头像由数据层解析（`src/data/assets/` 本地文件或外部 URL）。
7. **禁止**把所有设计样式合并进公共 CSS、禁止跨设计共享设计 Token。

---

## 9. 项目级实现约定

【已定】项目级实现约定统一由仓库根目录 `AGENTS.md` 承载（编码 Agent 必读的**强制规则**，覆盖数据接口、每套设计必须满足、共享 chrome、动效、图标、素材、无障碍与响应式、已知坑、构建与文档维护）；本规格不再复制其条文。交付门槛（新设计完成、设计页或共享机制改动后的完整验证）由 `design-page-verify` skill 执行，其**当前状态**记录在 `docs/verification/`；文档职责索引见 `docs/README.md`。

（历史：2026-10-11 文档治理前，本节曾列出 AGENTS.md 的最低内容清单；此后规则唯一载体为 `AGENTS.md`，旧清单原文见 Git 历史。）

---

## 10. 构建、校验、测试与部署

### 10.1 npm scripts【已定】

```jsonc
{
  "dev": "astro dev",
  "check": "astro check",
  "build": "npm run check && astro build",   // 注册表校验在构建期执行（fail fast）
  "preview": "astro preview"
}
```

- `engines.node >= 22.12`；提交 `package-lock.json`。
- 校验机制：注册表构建期强校验（§6.3）+ `astro check`（TS/astro 类型）。一期不做自动化 e2e/视觉回归（二期）。

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
│  │  ├─ profile.yaml                #   个人资料（唯一真相，Zod strict 校验）
│  │  ├─ site.config.yaml            #   站点信息与行为（mode/default/manualSwitch/cacheHours…）
│  │  └─ assets/
│  │     └─ avatar.jpg               #   可选：本地资料图片
│  ├─ content.config.ts              # 内容层：profile / site 两个集合（glob loader + Zod）
│  ├─ lib/                           # 框架共享逻辑（设计不重复实现）
│  │  ├─ site.ts                     #   loadSite()：配置+注册表+资料合并、交叉校验、类型化数据接口
│  │  ├─ urls.ts                     #   base 前缀 helper（所有内部链接必须经此拼接）
│  │  ├─ router-script.ts            #   根路由页/切换页共享的内联脚本源码生成（随机/缓存/手选）
│  │  └─ context-menu.ts             #   桌面右键菜单运行时（动作/键盘/随机语义；无 CSS 边）
│  ├─ components/
│  │  ├─ HeadMeta.astro              # 共享 <head> 元信息（title/canonical/robots；零 Tailwind 类）
│  │  ├─ InfraStyles.astro           # 基础设施页共享极简样式（<style is:inline>，保证根页零外部请求）
│  │  ├─ Reveal.astro                # 滚动显现装配（内联 boot + 共享 IO 触发，不 import CSS）
│  │  └─ ContextMenu.astro           # 共享右键快捷操作菜单（中性 chrome；is:inline 样式 + 按需加载运行时）
│  ├─ designs/                       # ★ 设计库：目录存在即注册（自动发现 + 构建期强校验）
│  │  ├─ registry.ts                 #   glob design.json + Page.astro → 校验 → 派生注册表
│  │  ├─ editorial/                  # ── 单套设计示例（自产：编辑杂志风）──
│  │  │  ├─ DESIGN.md                #    设计规范快照
│  │  │  ├─ design.json              #    元数据：显示名/描述/enabled/来源与许可
│  │  │  ├─ Page.astro               #    完整页面（含 <html> 文档）
│  │  │  ├─ style.css                #    CSS 入口（source(none) + @source + 原生 CSS）
│  │  │  ├─ components/              #    该设计私有组件（可选）
│  │  │  └─ assets/                  #    该设计私有资源（可选）
│  │  ├─ terminal/                   # 自产：复古终端风（结构同 editorial）
│  │  ├─ oxide/                      # 官方来源（oxidecomputer/design-system，MPL-2.0）
│  │  │  └─ …                        #   四件套 + SOURCE-LICENSE.txt
│  │  └─ fast/                       # 官方来源（microsoft/fast，MIT）
│  │     └─ …                        #   四件套 + SOURCE-LICENSE.txt
│  ├─ infra/
│  │  └─ SwitcherPage.astro          # 切换页（astro.config 在 manualSwitch 时 injectRoute 为 /designs/）
│  └─ pages/
│     ├─ index.astro                 # 根路由页：零外部请求（内联脚本 + noscript 降级，noindex）
│     └─ 404.astro                   # 中性 404（noindex，GH Pages 自动使用）
├─ .gitignore
├─ .nvmrc                            # Node 24
├─ AGENTS.md                         # 项目级实现约定（编码 Agent 必读的强制规则）
├─ LICENSE                           # MIT
├─ change-log/                       # 版本记录（一个版本一个文件；成果 / 修复 / 验证结论）
├─ docs/                             # 文档索引 / ADR / 主题适配 / 验证状态（见 docs/README.md）
│  ├─ README.md                      #   文档职责索引与维护规则
│  ├─ adr/                           #   长期技术决策（一事一文件）
│  ├─ designs/<id>/ADAPTATION.md     #   主题适配记录（仅确有适配 / 例外时创建）
│  └─ verification/                  #   各主题与共享机制的当前验证状态（更新式）
├─ README.md                         # fork → 改资料 → 三平台部署 → 新增设计
├─ SPEC.md                           # 本规格（唯一契约文档）
├─ astro.config.mjs                  # Tailwind vite 插件 / fonts(npm provider) / site+base(env) / injectRoute 设计路由与切换页
├─ package.json                      # scripts: dev/check/build/preview；engines.node >= 22.12
├─ package-lock.json
└─ tsconfig.json                     # 继承 astro/tsconfigs/strict
```

---

## 12. 一期实施顺序

1. 脚手架：Astro 7 + TS + Tailwind 4（@tailwindcss/vite）+ @astrojs/check；`.nvmrc`、engines、npm scripts。
2. 数据层：`content.config.ts`（glob loader + Zod）→ 示例 `profile.yaml` / `site.config.yaml` → `lib/site.ts` / `lib/urls.ts`。
3. 骨架：`registry.ts`（含校验）+ `HeadMeta` + `pages/index.astro`（根路由）+ `[design]` 动态路由 + 切换页（条件构建），用 2 个临时最小设计跑通构建。
4. 选型定稿：抓取 Oxide / Vercel 的完整 DESIGN.md（核实可获取性 + 许可 + provenance；不行则换备选）；用 impeccable `document --seed` 生成 editorial、terminal 两份 DESIGN.md。
5. 逐套实现 4 套设计（按 `AGENTS.md` 约定；每套完成后：`design-page-verify` 全流程，状态写入 `docs/verification/`）。
6. 行为完善：随机/固定/缓存/避免重复/手选持久化全套 + 边界（单设计、过期、禁用设计、模式切换遗留存储）。
7. 部署：GH workflow + CF/Vercel 文档 + 自定义域名说明 + base 前缀全链路自检（`BASE_PATH=/x npm run build` 抽查）。
8. 验收：跑完 §13 全部条目；补全 README/AGENTS.md。
9. 交付：MIT `LICENSE`、AGENTS.md/README 定稿；一期不做实际部署（工作流就位，由使用者按需启用）。

---

## 13. 验收标准（可验证）

1. 干净克隆后 `npm ci && npm run build` 成功；`astro check` 无错误；注册表校验对缺失文件/缺 provenance 能明确报错（人为制造一次验证）。
2. `dist/` 含：`index.html`（根路由）、`designs/index.html`（切换页）、每套设计 `dist/<id>/index.html`；`manualSwitch:false` 构建时无 `designs/`。
3. CSS 隔离抽查：任取两套设计，A 的 CSS 不含 B 独有工具类（对 dist 产物 grep 抽查一次）。
4. 随机行为矩阵（人工，dev 或 preview）：首访落地启用池内；窗口内刷新一致；过期（手改 `expiresAt`）后重随机且不与上次重复；仅 1 套启用时永远它；禁用设计从不出现在随机结果与切换页；右键菜单「随机一个设计」遵循同一矩阵且**永不落在当前设计**（仅 1 套启用时该项禁用、点击不产生任何导航）。
5. 固定模式：根路径永远 default；`manualSwitch:true` 时手选后永久生效（清空过期逻辑不适用，菜单随机写入 `expiresAt:null`）；`manualSwitch:false` 无菜单、无可见切换入口、`/designs/` 返回 404。
6. 手选持久化：随机模式手选后窗口内保持、过期后恢复轮换；直达设计 URL 不改变后续根路径归属。
7. 无 JS（禁用浏览器 JS）：根路径 meta refresh 进入 default；设计页与切换页内容可读、链接可导航。
8. SEO：根路径与切换页 `noindex`；仅 default 设计页 `index` + self-canonical；其余设计 `noindex,follow`。
9. 根路径零第三方请求（Network 面板确认，无字体/CSS/JS 请求）；切换在首屏前完成（无明显闪烁）。
10. 字体：dist 内自托管（无 `fonts.googleapis.com` 等第三方引用）；回退栈含系统字体（含中文），断网/屏蔽字体时版式可读。
11. 每套设计含 `DESIGN.md` + `design.json`（provenance 完整）；移动端（375px 宽）无横向溢出、内容可读；核心字段均被渲染。
12. 部署自检：`BASE_PATH=/demo npm run build` 后，产物内链接正确带 `/demo` 前缀（抽查根页脚本与切换页链接）。
13. README 覆盖：fork → 修改资料 → 三平台部署（含自定义域名说明）→ 新增设计流程。
14. 右键快捷菜单（`manualSwitch:true`）：四套设计桌面端在非交互区域右键 / `Shift+F10` 均可打开菜单且视口边缘自动收敛；全部菜单项真实执行、失败路径有明确反馈（复制降级 / 分享取消 / `navigator.share` 不可用时该项不出现）；链接、图片、输入控件、可编辑区与已选中文字保留浏览器原生菜单；键盘可遍历激活、Esc 关闭并归还焦点；375px 触控仿真下无菜单且不请求菜单运行时；四套设计均不存在旧的可见 `Switch design` 入口。

---

## 14. 主要风险与防范

| 风险 | 防范 |
|---|---|
| 许可风险（第三方规范再分发） | §4 策略：仅许可可确认来源入库；provenance 强制；designmd.co 排除；保留声明文件；不确定即不入库 |
| CSS 体积失控（多设计类名互泄） | 从第一套设计起固定 `source(none)+@source` 协议；验收抽查隔离 |
| DESIGN.md 格式参差、单份不足以成页 | `AGENTS.md` 项目级实现约定层 + `design-page-verify` 流程 |
| 来源漂移（上游改 URL/删文件） | 快照归档入库 + `fetchedAt` 记录；构建不依赖上游 |
| 工具版本漂移（impeccable 等） | `generatedBy` 记录生成工具与版本；技能升级不影响已归档设计 |
| GH Pages 同域存储冲突 | 存储键含 base 命名空间 + 可覆盖 |
| GH 子路径与根路径产物差异 | env 驱动 site/base + `urls.ts` 统一前缀 + 验收第 12 条 |
| 近重复内容 SEO | 仅 default 可索引（§7.4） |
| 设计质量不可自动校验的部分（右键菜单接入、随机语义等） | `design-page-verify` 流程与通过标准（一期接受） |

---

## 15. 二期延期项

- 访客统计（第三方分析或无服务器 API）
- CF/Vercel 边缘能力增强（如带 Cookie 的服务端随机，非必需）
- 自动化 e2e / 视觉回归 / Lighthouse CI
- sitemap（一期仅 1 个可索引页，意义有限）
- awesome-design-md 可选来源接入、更多设计
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

