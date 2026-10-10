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
| Q4 | 切换入口形态 | 共享 `/designs/` 切换页 + **每套设计必留一个入口**（形式自由、无 JS 可达）。`manualSwitch:false` → 切换页不构建（404）、无入口；设计固定 URL 仍可直达。 |
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

---

## 4. 设计规范来源、获取与保存流程

### 4.1 合规策略【已定】

- **允许入库**：
  - A. 厂商官方发布（如 official-design-md 索引的 Vercel、Nuxt、Resend、Ant Design、Atlassian、FAST、Oxide、Juspay、Clerk、Mintlify、VoltAgent）——逐份核实原文所在仓库、许可要求并保留声明；"first-party 官方"的说法目前仅为索引仓库自述，须逐份核实。
  - D. 自产（按 Google Stitch `design.md` 格式起草，并用 impeccable `document` 规范化固化；见 §18）——完全可控。
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

实施结果（2026-10-10）：Vercel 的 design.md 挂在官网、无许可声明，按合规策略弃用，替换为许可已核实的 Microsoft FAST。自产规范已由 **impeccable v4.5.2 `document`（scan 模式）** 规范化固化为正式规范（详见 §18）。

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
- 不做"设计是否渲染了核心字段"的自动检查（难以可靠实现）；由实现约定 + 新设计审查清单约束。

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
  - `site`（title/description/lang/base）；
  - `design`（自身元信息：id、displayName、isDefault、indexable）；
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

### 7.5 切换页与入口【已定】

- `/designs/`：共享基础设施页（中性极简风格，不模仿任何设计），列出全部启用设计（displayName + description + 可选 accent 色块 + 当前标记）。
- 点击 = 内联脚本写入手选存储 + 正常导航（无 JS 时导航仍可用，只是不持久化）。
- 每套设计**必须**提供一个切换入口（形式自由：页脚链接/角落按钮/导航项；无 JS 可达；文案由设计自定），指向 `/designs/`。
- `manualSwitch:false` → `/designs/` **不构建**（404，见 §10.4 实现注记）、任何入口不存在；各设计固定 URL 不受影响。

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

## 9. 项目级实现约定（补齐"单份 DESIGN.md 不足以生成完整页面"的缺口）

【已定】交付 `AGENTS.md`（仓库根目录），面向编码 Agent 的强制清单，至少包含：

1. 数据接口（`loadSite()` 的字段与用法）；核心字段必须渲染、扩展区块自行取舍；
2. 必须包含 `HeadMeta`；切换入口要求（`manualSwitch` 时）；
3. CSS 入口模板（`source(none) + @source`）；禁止动态类名；
4. 字体注册流程（astro.config 中央登记 → `<Font>` → `@theme inline`）；
5. 构建与校验命令；禁止跳过校验；
6. 禁止事项：虚构个人事实、跨设计共享视觉组件/Token、违反来源许可；
7. 已实测坑：glob 必须置于独立模块（§3.2-5）、`file()` 裸对象限制（§3.2-6）；
8. **新设计审查清单**：四件套齐备、provenance 完整、核心字段渲染、切换入口存在（无 JS 可达）、移动端适配、CSS 隔离抽查、构建通过。

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
│  │  └─ router-script.ts            #   根路由页/切换页共享的内联脚本源码生成（随机/缓存/手选）
│  ├─ components/
│  │  ├─ HeadMeta.astro              # 共享 <head> 元信息（title/canonical/robots；零 Tailwind 类）
│  │  └─ InfraStyles.astro           # 基础设施页共享极简样式（<style is:inline>，保证根页零外部请求）
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
├─ AGENTS.md                         # 项目级实现约定 + 新设计审查清单（编码 Agent 必读）
├─ LICENSE                           # MIT
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
5. 逐套实现 4 套设计（按 §9 约定；每套完成后：构建 + 目检 + 移动端 + CSS 隔离抽查 + 审查清单）。
6. 行为完善：随机/固定/缓存/避免重复/手选持久化全套 + 边界（单设计、过期、禁用设计、模式切换遗留存储）。
7. 部署：GH workflow + CF/Vercel 文档 + 自定义域名说明 + base 前缀全链路自检（`BASE_PATH=/x npm run build` 抽查）。
8. 验收：跑完 §13 全部条目；补全 README/AGENTS.md。
9. 交付：MIT `LICENSE`、AGENTS.md/README 定稿；一期不做实际部署（工作流就位，由使用者按需启用）。

---

## 13. 验收标准（可验证）

1. 干净克隆后 `npm ci && npm run build` 成功；`astro check` 无错误；注册表校验对缺失文件/缺 provenance 能明确报错（人为制造一次验证）。
2. `dist/` 含：`index.html`（根路由）、`designs/index.html`（切换页）、每套设计 `dist/<id>/index.html`；`manualSwitch:false` 构建时无 `designs/`。
3. CSS 隔离抽查：任取两套设计，A 的 CSS 不含 B 独有工具类（对 dist 产物 grep 抽查一次）。
4. 随机行为矩阵（人工，dev 或 preview）：首访落地启用池内；窗口内刷新一致；过期（手改 `expiresAt`）后重随机且不与上次重复；仅 1 套启用时永远它；禁用设计从不出现在随机结果与切换页。
5. 固定模式：根路径永远 default；`manualSwitch:true` 时手选后永久生效（清空过期逻辑不适用）；`manualSwitch:false` 无入口。
6. 手选持久化：随机模式手选后窗口内保持、过期后恢复轮换；直达设计 URL 不改变后续根路径归属。
7. 无 JS（禁用浏览器 JS）：根路径 meta refresh 进入 default；设计页与切换页内容可读、链接可导航。
8. SEO：根路径与切换页 `noindex`；仅 default 设计页 `index` + self-canonical；其余设计 `noindex,follow`。
9. 根路径零第三方请求（Network 面板确认，无字体/CSS/JS 请求）；切换在首屏前完成（无明显闪烁）。
10. 字体：dist 内自托管（无 `fonts.googleapis.com` 等第三方引用）；回退栈含系统字体（含中文），断网/屏蔽字体时版式可读。
11. 每套设计含 `DESIGN.md` + `design.json`（provenance 完整）；移动端（375px 宽）无横向溢出、内容可读；核心字段均被渲染。
12. 部署自检：`BASE_PATH=/demo npm run build` 后，产物内链接正确带 `/demo` 前缀（抽查根页脚本与切换页链接）。
13. README 覆盖：fork → 修改资料 → 三平台部署（含自定义域名说明）→ 新增设计流程。

---

## 14. 主要风险与防范

| 风险 | 防范 |
|---|---|
| 许可风险（第三方规范再分发） | §4 策略：仅许可可确认来源入库；provenance 强制；designmd.co 排除；保留声明文件；不确定即不入库 |
| CSS 体积失控（多设计类名互泄） | 从第一套设计起固定 `source(none)+@source` 协议；验收抽查隔离 |
| DESIGN.md 格式参差、单份不足以成页 | §9 项目级实现约定层 + 新设计审查清单 |
| 来源漂移（上游改 URL/删文件） | 快照归档入库 + `fetchedAt` 记录；构建不依赖上游 |
| 工具版本漂移（impeccable 等） | `generatedBy` 记录生成工具与版本；技能升级不影响已归档设计 |
| GH Pages 同域存储冲突 | 存储键含 base 命名空间 + 可覆盖 |
| GH 子路径与根路径产物差异 | env 驱动 site/base + `urls.ts` 统一前缀 + 验收第 12 条 |
| 近重复内容 SEO | 仅 default 可索引（§7.4） |
| 设计质量不可自动校验的部分（切换入口存在性等） | 审查清单人工把关（一期接受） |

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

## 18. 实施记录（2026-10-10，第一阶段完成）

- 工程与四套设计已落地并通过 `npm run build`：7 个静态页面（4 设计 + 根路由 + 切换页 + 404），`astro check` 0 错误 0 警告。
- 官方来源最终采用 **Oxide（MPL-2.0）** 与 **Microsoft FAST（MIT）**；Vercel 因文件挂在官网、无许可声明而弃用（见 §4.3）。
- 自产规范（editorial / terminal）已用 **impeccable v4.5.2 `document`（scan 模式）** 规范化固化为正式规范：frontmatter token schema（colors/typography/rounded/spacing/components）+ 规范八段结构 + Named Rules。按 impeccable 自身路由，`--seed`（实现前世界工作坊）不适用于已实现代码，改用 scan 模式"固化首个实现"；North Star 由项目所有者选定（Editorial「The Issue」/ Terminal「The Amber Terminal」）；两个 `design.json` 的 `generatedBy` 已同步更新。未生成 `.impeccable/design.json` sidecar——该 sidecar 面向单设计系统的 live panel，本仓库多设计并存，暂不需要。
- 设计路由最终实现为 `injectRoute` 注入（§10.4）；起因是动态 `[design]` 路由会把所有设计的 CSS 聚合进每个页面（§3.2-11，本机实测），改注入后每页仅链接自己的 CSS（dist 实测通过）。
- 字体：`astro:fonts` + npm provider（`remote:false`）构建期自托管，dist 内 9 个 woff2、全站零第三方字体引用；editorial 预加载 Fraunces，terminal 不预加载 JetBrains Mono（子集文件过多）。
- 新增实测坑（已写入 §3.2 与 AGENTS.md）：CSS 聚合、glob 条目 id 归一化、`weights` 过滤导致 npm provider 解析失败等。
- **额外实测坑**：Astro 7 的 `import.meta.env.BASE_URL` 在带 base 时不带尾斜杠（`'/demo'`），`urls.ts` 已做归一化（否则拼出 `/demoeditorial/`）；`BASE_PATH=/demo` 前缀自检通过（根脚本 / noscript / 切换页链接 / canonical / favicon 全部带前缀）。
- 固定模式 + `manualSwitch:false` 曾存在缺陷（会读取遗留存储），已修复为"永远 default 且不读写存储"（根脚本新增 `manualSwitch` 运行时开关）；浏览器实测：遗留存储被忽略、`/designs/` 返回 404。
- 移动端复验发现并修复 oxide 页脚横向溢出：flex 子项 `min-width:auto` 被 nowrap 的 ASCII 波形撑到 max-content；修复为 `min-width:0`（并给波形加 `max-width:100%`），复验 375×812 下 scrollWidth=360、零溢出元素。
- 行为验收（随机 / 缓存窗口 / 避免连续重复 / 手选持久化 / 切换页 / fixed 模式 / `manualSwitch:false` / `enabled:false` / 禁用 JS 降级 / 零第三方请求）全部执行并通过；`npm ci` 干净安装 + 构建通过。
- 依据 impeccable `critique`（dual-agent 评审，快照存 `.impeccable/critique/`）与 `audit`（15/20）执行第一轮修复：**editorial** 强调色收权（P1：链接下划线默认墨色、hover 转焦赭；补 `::selection`/caret）；**terminal** a11y 三件套（sr-only 分区标题、装饰符 `aria-hidden`、链接 `aria-label`）并把 dim 档提亮至 ≈6.7:1（`#c68a1a`）。类别默认信号（cream/eyebrow/cursor/stripes）经项目所有者确认为**有意保留**并按设计记录。其余 P2/P3（导航/终点/移动端整齐度/字体 preload 等）留待后续 pass。
- 第二轮修复（用户选定 layout→clarify→adapt）：editorial 增加 masthead 锚点目录（`#ed-works` / `#ed-elsewhere` / 切换设计）；页脚改"邀请"收尾（contact.note + 邮箱 CTA，colophon 降为 meta 行）；独立布局评估发现的桌面首屏分组倒置（`align-items: end` 令简介先于定位语、与 DOM 顺序不符）修为同顶对齐；≤560px kicker 仅保留中文；editorial 与 terminal 链接在 `pointer: coarse` 下扩展命中区至 ≈44px，terminal hover 反白加 `(hover: hover) and (pointer: fine)` 门控。layout 机械扫描（`detect --scope layout`）为零发现。
- 第三轮修复（distill/optimize/终端 P3 收尾）：editorial Email 去重（Elsewhere 过滤 mailto、页脚邀请段唯一呈现；`Elsewhere` 副标改"外部链接"）；字体 preload 实测结论——npm provider 不填 face 的 `subset` 元数据、family 级 `subsets` 亦为空操作，**无法子集过滤**；编辑器实测三份 preload 中约 68KB 为未使用的 latin-ext/vietnamese，故**移除 editorial 的 preload**（latin 子集仍按 unicode-range 按需加载）；`.ed-switch` 归入 Label 档（0.6875rem 大写）、DESIGN.md 增加 `work-title` 字号 token（1.35rem），检测器在 editorial/terminal 上均回到**零发现**；terminal experience 注释独立成行（`.tm-note`，缩进 3ch）、≤560px 链接列表改 grid 对齐（marker 固定列 / URL 缩进）。
- 四套设计检测器终态：editorial / terminal / fast **零发现**；oxide 保留 1 条 `codex-grid-background` advisory——该两轴网格底纹源自官方 Oxide 规范的 "Visible grids" 原则（`src/designs/oxide/DESIGN.md` 为厂商原始快照，不得修改），属**源自规范、有意保留**，在此记录为已知例外。
- 第四轮修复（复评 8 条优先问题，用户选定"全部修"）：editorial——TOC「联系方式」改「外部链接」、nav aria-label 改「本期导航」、切换入口两处文案统一（`切换设计 / Switch design`）、`.ed-work-title a` 纳入 coarse 命中区、One Accent Rule 表述改为"按栏目计数 + 交互态豁免"；terminal——命令行尾加 `aria-hidden` 视觉注释标签（# 简介/链接/经历/项目/技能/联系）、链接 URL 去协议短形式、chrome 条加 `[switch design]` 入口（页脚保留）、扫描线自全屏叠加层迁入屏幕背景层（2.5%，文字之下，dim 最坏扫描行 ≥5:1）、hero 补 `# based in …`（location）、`--font-terminal` 令牌实际启用；字体回退链修正（Fraunces 与 JetBrains Mono 配置 `fallbacks`，避免 Astro 注入的无衬线优化回退排在预期衬线/等宽回退之前）。复评基线：editorial 25/28、terminal 19/24。
- skill 演练（`design-page-verify` 首次全流程执行，对象 `fast`）：构建 / 产物 CSS 隔离 / base 前缀（`--base /demo`）/ 检测器（含 oxide 反证）/ 桌面实测（console 0、仅自身资源、h1→h2→h3 层级、light-dark 双主题实测 rgb(250,250,250)↔rgb(31,31,31)、6px 圆角、3 列网格）/ 375 触控仿真全部通过；**演练暴露并修复真实缺口**——fast 是唯一未做触控命中增强的设计（实测 `.fs-btn` 35.6px、`.fs-footer-link` 19.3px、`.fs-card-title a` 21.6px），已补 `@media (pointer: coarse)` 块（`.fs-btn` `padding-block: 0.8rem`、其余 `0.78rem`）。fast/DESIGN.md 为厂商原始快照（Microsoft FAST，MIT），不予修改，本条即项目侧记录。
- **动效机制（进入动画 + 滚动显现，v0.2.0）**：按 `docs/adr/0001-motion-reveal-mechanism.md` 实现。**范围**：仅规范授权的 **oxide**（厂商规范已有 Motion 章节，明确鼓励入场动效）与 **fast**（厂商规范提供 duration / curve token）采用动效；**editorial**（自产规范限定"唯一动效是下划线过渡"）与 **terminal**（自产规范限定"光标是唯一动效"）保持静止、不加载脚本——厂商 `DESIGN.md` 为原始快照，未修改。**实现**：首屏入场 = 各设计私有纯 CSS `@keyframes`（无 JS 依赖，包在 `@media (prefers-reduced-motion: no-preference)` 内）；滚动显现 = 共享 `src/lib/reveal.ts` 的 `IntersectionObserver`（`[data-reveal]` → 首次进入视口置 `[data-reveal-in]` 并 `unobserve`，只播一次；时长 / 缓动 / 位移 / 错落由各设计 `style.css` 维护）。**可见性契约**：内容默认可见，仅当 `src/components/Reveal.astro` 的内联 boot 判定「非 reduced-motion 且支持 `IntersectionObserver`」时才给 `<html>` 打 `data-reveal-ready`，作为 CSS 隐藏态的唯一门控——无 JS / 脚本失败 / 无 IO / 减动态四种情况内容始终可见；共享脚本不 import 任何 CSS（不触发 §3.2 的 CSS 聚合陷阱）。oxide 参数：`260ms ease-out`、`translateY(10px)`、hero 4 项 40ms 错落、列表行 30ms（上限 5）；fast 参数：复用 `--fast-duration-normal` / `--fast-curve-easy-ease`、`translateY(8px)`、hero 4 项 30ms 错落。**实测**：构建 7 页通过（`astro check` 0/0）；CSS 隔离仍成立（4 份设计 CSS 各只含自身前缀，`oxide` 一份、`fast` 一份、editorial/terminal 各一份）；`data-reveal-ready` 与模块脚本只出现在 oxide / fast 页面。
- **动效验证（`design-page-verify` 全流程，v0.2.0）**：构建 7 页通过、`astro check` 0/0；产物抽查——CSS 隔离成立（4 份设计 CSS 各只含自身前缀）、`BASE_PATH=/demo` 下 oxide 内部链接全部带 `/demo` 前缀、根页 / 切换页 / 404 **不链接**任何设计 CSS；impeccable 检测器 editorial / terminal / fast **零发现**、oxide 仅保留 1 条已记录的 `codex-grid-background` advisory（新增的 motion 规则未产生新发现）；桌面实测（oxide / fast）console 0 错误 0 警告、请求仅自身资源（Document + 自有 CSS + favicon），入场结束态 `opacity=1` 且 `animation-name` 生效，滚动到底后揭示 6/6（oxide）、3/3（fast）；375×812 + 触控仿真——`pointer: coarse` 生效、`scrollWidth == innerWidth`（无横向溢出）、主要链接命中高 ≥44px（oxide 44.8 / fast 44.2 / editorial 44.2 / terminal 44.0）；降级与可访问性——`reduced-motion: reduce` → 不写门控、`animation: none`、隐藏元素 0；无 JS → 全内容可见（截图 `verify-oxide-nojs.png`）；无 `IntersectionObserver` → 不写门控、隐藏 0；`IntersectionObserver` 构造抛错 → `try/catch` 撤销门控、隐藏 0。**验证期暴露并修复两处真实缺陷**：(1) 跳转式滚动（刷新恢复位置 / End 键）使元素"从视口下方直接跳到上方"，IO 不产生通知 → 内容永久隐藏（实测跳到底部 6 个目标只揭示 4 个），已加滚动兜底补揭示（复测 6/6）；(2) oxide 从未做触控命中增强（375px 实测 `.ox-link` 14.4px、`.ox-switch` 39.4px），已补 `@media (pointer: coarse)` 块（`padding-block: 0.95rem`；`.ox-row-title a` 的 border 下划线在触控下改用同色 `text-decoration` 以免被 padding 推离文字），复测 minHit 44.8px。**未测项**：真机（iOS / Android）与 Safari / Firefox 引擎、横屏、200% 缩放；`prefers-reduced-motion` 与无 JS 降级基于 Chromium 仿真。截图归档于 `C:\Users\lovelive\.trae-cn\trae-browser-screenshots\`（`verify-oxide-top/-bottom/-375/-nojs.png`、`verify-fast-top/-bottom/-375.png`）。
- **skill 演练（`design-page-verify` v0.2.0 更新后复跑）**：按更新后的流程完整走一遍（步骤 1–7 含 4b / 5b）。步骤 1 构建 7 页绿；步骤 2 CSS 隔离 4 份各一份、根页 / 切换页 / 404 不链接设计 CSS、`rel="preload"` 计数 0（与移除 editorial preload 后的预期一致）、`BASE_PATH=/demo` 全链路前缀正确；步骤 3 检测器 editorial / terminal / fast 零发现、oxide 仅 1 条已记录 advisory；步骤 4 桌面 oxide / fast console 0、请求仅自身资源、`h1→h2`（fast 另含 `h3`）、装饰元素 `aria-hidden` 就位、`:hover` 规则双证成立；步骤 4b 门控写入、入场 `animation-name` 生效且结束态 opacity 1、**跳转滚动后隐藏元素 0**（oxide 6/6、fast 3/3）；步骤 5 375px 触控 oxide 44.8 / fast 44.2、无横向溢出；步骤 5b 四种降级（reduced-motion / 无 JS / 无 IO / 脚本抛错）隐藏元素均为 0；步骤 6 oxide 对比度实测 dim / label 5.76、name 17.41、body 9.97、number 10.35（均 ≥4.5）。**演练暴露两项流程侧问题**：(a) skill 存在两份副本——`.agents/skills/`（入库版，本次更新）与 `.trae/skills/`（工具实际加载版）已漂移，实测 Skill 加载的是旧版；已同步两者，并需固化"以 `.agents` 为准 + 改动后同步 `.trae`"的约定；(b) 前置假设 preview 固定 4321，实测因上一 preview 进程残留导致端口被占用（回落 4322），流程缺处理说明。**另暴露 oxide 两项既存 a11y 缺口**（装饰符进入链接可访问名，实测 `▸GitHub` / `▸Email`；`.ox-hero` / `.ox-columns` / `.ox-section` 无可访问名称，`aria-label|aria-labelledby` 计数 0），对比 terminal 已具备 sr-only `<h2>` + `aria-hidden` 的同类处理——**已按项目所有者决定修复，见下条**。未测项同前（真机 / Safari / Firefox / 横屏 / 200% 缩放）。
- **oxide a11y 收口 + skill 二轮硬化（2026-10-10）**：oxide——`.ox-hero`、`.ox-columns` 内两栏、两个 `.ox-section`、`.ox-footer` 补 `aria-labelledby` 指向同区可见标签（`.ox-columns` 由 `<section>` 降为布局 `<div>`、两栏升为具名 `<section>`，CSS 无需改动）；品牌点 `●`、链接箭头 `▸`、切换入口箭头全部 `aria-hidden`；切换入口改 `aria-label="切换设计 / Switch design"`。复测：桌面 `aria-label|aria-labelledby` 7 处、`aria-hidden` 8 处、4/4 箭头隐藏、标题序列 `h1→h2`（oxide 无 h3，亦无跳级）、`.ox-columns` 桌面两列 / 375px 单列、触控命中 44.8px、跳转滚动后隐藏元素 0、console 0；检测器仍仅 1 条已记录 advisory。`design-page-verify` skill 二轮硬化：前置补"端口被占用 → 清 4321 再重启 preview"；步骤 4 的 a11y 项改为可判定（每分区必须有可访问名称且计数 > 0；装饰符号不得进入链接可访问名）；通过标准新增 a11y 行。`AGENTS.md`「入库范围」写明 skill 唯一位置为 `.agents/skills/design-page-verify/SKILL.md`——失配的 `.trae/` 本地副本已于同日删除，此后单副本、改完即生效。
- **图标与品牌标志（v0.3.0，试点）**：按 `docs/adr/0002-icon-and-brand-mark-strategy.md` 落地。**来源**：功能图标唯一来自 `@lucide/astro`（ISC；构建期内联 SVG、零客户端 JS、按需 tree-shaking）；品牌标志取自 simple-icons（CC0-1.0；canonical 仓库 github.com/simple-icons/simple-icons，经 jsDelivr 镜像获取，2026-10-10），vendored 为 `src/assets/brand/github.svg`（首个资产；商标核对结论：GitHub Logos and Usage Policy 允许个人账户链接用途；Bluesky 专项政策未查证到、暂不使用）。**接线**：`links[].icon` 可选 slug + 各设计私有映射（`Page.astro` 条件渲染）+ 未映射 / 缺省纯文本回退；标记一律 `aria-hidden`。**按设计分发**：editorial = Elsewhere 品牌 mark + Selected Works 外链箭头（`ArrowUpRight`，灰墨静态）；terminal = 零 SVG，`label → url` / `title → url` 字符标记（Dim 档、`aria-hidden`）；oxide = CHANNELS 品牌 mark 替换 `▸`（贴厂商 filled 语言，未引入 lucide）；fast = 按钮前置图标（GitHub mark / Mail）+ 项目卡外链箭头。**样式**：尺寸 / 描边 / 颜色由各设计 `style.css` 控制；无共享图标组件、无新增共享 CSS 边。厂商 `DESIGN.md`（oxide / fast）未修改。
- **图标与品牌标志验证（`design-page-verify` 全流程，v0.3.0）**：构建 7 页通过（`astro check` 0/0）；产物抽查——CSS 隔离成立（4 份设计 CSS 各只含自身前缀；`.ed-mark/.ed-ext` 仅在 editorial、`.ox-mark` 仅在 oxide、`.fs-btn-mark/.fs-card-ext` 仅在 fast；terminal 零 SVG 仅字符 `→`）；四页所有 `<svg>` 均 `aria-hidden="true"`（editorial 3 / oxide 1 / fast 4 / terminal 0）、无 `<img>`、无外链资源（`src="http` 计数 0）、`rel="preload"` 0；根页 / 切换页 / 404 不链接任何设计 CSS；`BASE_PATH=/demo` 下四页内部链接全部带 `/demo` 前缀。检测器：editorial / terminal / fast 零发现；oxide 仅 1 条已记录 `codex-grid-background` advisory（有效性反证成立）。桌面实测：console 0；可访问名干净（oxide `▸`/mark 均不入可访问名——实测 `GitHub` / `Email`；editorial 实测 `GitHub` / `博客`；fast 按钮 `GitHub` / `Email` / `博客`）；计算值——editorial `.ed-ext` 17.28px / 1.5 描边 / `#57534e`、`.ed-mark` 14.45px；oxide `.ox-mark` 12px / accent 绿；fast `.fs-btn` 计算 display flex（flex 项 blockify）+ gap 8px、mark 14px、卡片箭头 14.4px / 1.75 描边 / `#0f6cbd`；行内图标 rect 实测与文字同行、垂直居中。375×812 + 触控仿真：`matchMedia('(pointer: coarse)')` 为 true、`scrollWidth == innerWidth`（零横向溢出）、命中高度 min——editorial 44.2 / terminal 44.0 / oxide 44.8（`.ox-link` 47.2）/ fast 44.2（`.fs-btn` 46.8）。对比度：editorial mark 6.95 / terminal dim 6.75 / oxide mark 9.92 / fast 亮 5.38 / 暗 5.18（均 ≥4.5）。**验证期暴露并修复一处真实缺陷**：Tailwind Preflight 将 `svg` 置为 `display:block`，行内图标（editorial mark / 箭头、oxide mark、fast 卡片箭头）整枚折行到文字下一行（rect 实测 svg 不与文本末端相接、y 越行）——已为行内图标显式 `display:inline-block`，复测同行居中；该坑已记入 `AGENTS.md`「已知坑」。截图归档于 `C:\Users\lovelive\.trae-cn\trae-browser-screenshots\`（`verify-<id>-top/-375/-full.png`、`verify-editorial-work-title/-works/-links.png`、`verify-terminal-links/-project.png`、`verify-oxide-channels.png`、`verify-fast-actions/-card/-card-title.png`）。**未测项**：真机（iOS / Android）与 Safari / Firefox 引擎、横屏、200% 缩放。
- **链接列表面 100% 标记（v0.3.1 修正「半用」）**：依项目所有者「要么不用，要么全用」裁定（ADR 0002「修订」节）：未映射 / 缺省 slug → 通用功能图标 `Globe`（lucide），纯文本回退否决；oxide CHANNELS 的 Email / 博客由 `▸` 改为 Mail / Globe（outlined、1.5 描边，厂商规范允许 outlined variants）；editorial Elsewhere 补 Globe；fast hero 按钮补 Globe。列表面之外的链接（页脚 / Contact CTA / 切换器）保留原生 affordance。**验证**：构建 7 页绿（`astro check` 0/0）；内联 SVG 计数 editorial 4 / oxide 3 / fast 5 / terminal 0，全部 `aria-hidden`、无 `<img>` / 外链资源；CSS 隔离四份单归属；检测器 editorial / terminal / fast 零发现、oxide 仅已记录 advisory；桌面列表面 100%（Elsewhere 2/2、CHANNELS 3/3、hero 3/3），尺寸 / 描边 / 颜色符合（14.45px・1.5・`#57534e` / 12px・1.5・accent / 1em・brand）；375×812 触控 coarse、零溢出、命中 44.2–47.2px；对比度沿用同色值 6.95 / 9.92 / 5.38・5.18。截图归档于 `C:\Users\lovelive\.trae-cn\trae-browser-screenshots\`（`verify-editorial-links.png`、`verify-oxide-channels.png`、`verify-fast-actions.png`、`verify-<id>-375.png`）。未测项同前。