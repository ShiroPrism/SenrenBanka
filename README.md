# SenrenBanka

一份个人资料，多套由 AI 依据 `DESIGN.md` 生成的完整设计，支持简中 / 繁中 / 日 / 英 / 韩五语言——构建期产出纯静态页面，可部署到任何静态托管。

One profile, many AI-designed homepages, in five languages. Astro + TypeScript + Tailwind CSS 4, shipped as static files.

## 特性

- 30 套视觉与结构不同的设计（29 套 `styled` + 1 套零 CSS / JS 的 HTML-only），共用同一份资料契约
- **多语言（当前 `zh-CN` / `zh-TW` / `ja` / `en` / `ko`）**：每套设计在每种**它声明覆盖**的语言下都是独立静态页，资料、文案与 SEO 元数据按语言分离；未覆盖的 locale 不生成该设计页面
- **`styled` 页面的语言切换与页面操作入口统一**：桌面右键菜单、移动端悬浮球 → 底部动作面板，数据与语义完全共享（**桌面与移动端都可用**）；`html-only` 使用原生链接，不接入该菜单
- 随机 / 固定两种模式、浏览器缓存与避免连续重复、可配置手动切换
- 每套设计独立 CSS（Tailwind `source(none)` + `@source` 精确隔离），**多语言不改变这一点**，字体构建期自托管，运行时零第三方请求
- 根路径是零外部请求的客户端路由；每种语言仅其默认设计对外可索引（避免近重复内容）
- fork 后只需改资料与 `src/data/site.config.yaml` 即可部署 GitHub Pages / Cloudflare Pages / Vercel

## 快速开始

```bash
npm ci
npm run fonts:prepare  # 按 fonts.lock.json 下载并校验到 .cache/fonts/ 与 .cache/font-sources/
npm run dev            # http://localhost:4321
npm run build          # eol/lint/format + fonts:check + astro check + build + fonts:subset + fonts:prune + HTML 审计
npm run preview
```

代码与配置统一走 Prettier + ESLint；新增或修改文件后运行 `npm run format && npm run lint`。行尾由 `.gitattributes` / `.editorconfig` 固定为 LF，`npm run check:eol` 会在构建前拦截 CRLF。

字体缓存不进入版本控制，也不在 `postinstall` 中隐式联网。干净 clone 必须先
显式执行 `npm run fonts:prepare`；准备完成后，`npm run build` 的
`fonts:check` 会完全离线重算锁、快照、缓存文件与生成注册的哈希。缓存缺失或
损坏时会给出修复命令并失败。

`--font-*` 变量只暴露主 face；6 个 npm family 与 31 个外部 local family 都不
携带 Astro fallback。每套设计的 `style.css` 自己维护“拉丁声部 → 核心 CJK
（Zhuque / LXGW / Ark Pixel / 繁中 TC 族）→ 系统中文字体 → 通用族”的完整顺序，
`npm run fonts:typography` 会静态检查这条契约。

`fonts:prepare` 还会为核心 CJK 字体下载并校验 source archive；构建末尾的
`fonts:subset` 按最终 `dist` 语料生成每族一个 WOFF2 字形子集，`fonts:prune`
再把剩余 `@font-face` 外置为共享字体 CSS 并删除未引用分片。`dist` 全部文件
字节上限为 **10 MiB**。源字体、锁、快照与生成注册不变；fork 用户只需执行
`npm run fonts:prepare && npm run build`，不需要本地字体、Python 或额外子集化工具。

最小资料只需以下四个核心字段，可直接替换 `src/data/profiles/zh-cn.yaml`（`ja.yaml` / `en.yaml` 同理）：

```yaml
name: "你的名字"
headline: "一句话定位"
bio: "1–3 句简介。"
links:
  - label: GitHub
    url: "https://github.com/you"
```

- 改资料：`src/data/profiles/*.yaml`（每种配置语言一份，当前 `zh-cn` / `zh-tw` / `ja` / `en` / `ko`；**共用同一套固定字段契约**；核心必填：`name` / `headline` / `bio` / `links`）
- **fork 必改：`src/data/site.config.yaml`**——只替换 profile 会保留示例人物的站点标题 / 描述与语言清单：
  - `i18n.locales[].title` / `description`：该语言的 SEO 标题与描述；
  - `i18n.locales[].notice`：示例数据声明；填入真实资料后删除该键；
  - `i18n.locales`：语言清单只在这里维护；增删语言 = 改这里 + 增删对应的 `profiles/<path>.yaml`；`defaultLocale` 必须在清单中
- 普通可选字段：`avatar`（部分风格不放照片）/ `location`
- 高级可选扩展区块：`projects` / `experience` / `skills` / `contact`。它们仅为兼容现有设计而保留，可整体省略；不是自定义内容机制，也不会继续扩充同类字段或区块
- 站外内容：通过 `links` 指向作品集、文章或社交资料等更多信息；内容离开本站后，其可用性、可访问性、归属与持久性由外部平台控制
- 仓库中的完整 Profile（当前五份）是用于验证多套设计内容呈现的设计样张，不是必填模板
- 改语言：`src/data/site.config.yaml` 的 `i18n.locales`（**语言清单只在这里维护一处**：增删语言 = 加一份 `locales` 条目 + 一份同名 `profiles/<path>.yaml`）。新增语言还要在要覆盖它的设计 `design.json` 的 `locales` 中追加该 code；默认设计必须覆盖全部 locale。**只保留一种语言**：把 `i18n.locales` 改为 1 条并删除多余 profiles；`design.json` 中未配置的 code 会被忽略，语言分组与原生语言区整组不渲染（保留 `/<locale>/` 前缀）
- 改行为：`src/data/site.config.yaml` 的 `design`（`mode` / `default` / `manualSwitch` / `cacheHours`）
- 改界面文案：共享文案在 `src/i18n/messages.ts`，每套设计自己的文案在 `src/designs/<id>/messages.ts`（缺文件或缺键**构建期报错**）
- 增删设计：在 `src/designs/<id>/` 新建或删除目录即可（目录存在即注册）。共同必交 `DESIGN.md` / `design.json` / `Page.astro` / `messages.ts`；`renderMode: "styled"`（缺省）另需 `style.css`，`renderMode: "html-only"` 则禁止 `style.css` / `tokens.css`，但可提供自包含的 `Preview.astro`。流程与合规要求见 `SPEC.md` §4–§6 与 `docs/rules/`。新增目录后需重启 `npm run dev`。
- 字体：人工选择只维护 `fonts.config.json`；`fonts.lock.json` / `fonts.catalog.json` / `src/fonts/generated.ts` 由 `npm run fonts:update` 从固定外部目录发行物生成。6 个 Fontsource family 也通过配置内包装层读取已安装的 `node_modules` 文件，不依赖构建期 CDN。不要手改生成文件，也不要提交 `.cache/fonts/` 或 `.cache/font-sources/`。`npm run fonts:subset` 的子集报告写到 `.cache/fonts/subset-report.json`，`npm run fonts:prune` 的部署分片集与体积报告写到 `.cache/fonts/prune-report.json`；`npm run fonts:audit` 会把核心 CJK 缺字与部署集合报告写到 `.cache/fonts/audit-report.json`。

升级字体目录时必须显式提供发布页中的固定 URL 与 SHA，不接受“自动追最新”：

```bash
npm run fonts:update -- \
  --catalog-url https://github.com/whitehair-failure/SenrenBanka-fonts/releases/download/catalog-v1.0.0/catalog.json \
  --catalog-sha256 <release-sha256>
npm run fonts:prepare
npm run fonts:check
```

### URL 规则

```
/                         根入口 → 进入默认语言（zh-CN），随机 / 固定模式同既有行为
/zh-cn/<设计>/  /zh-tw/<设计>/  /ja/<设计>/  /en/<设计>/  /ko/<设计>/    各语言下已声明覆盖的设计页（唯一权威地址）
/zh-cn/designs/ 等          各语言的主题切换页（manualSwitch 关闭时不构建）
/<设计>/  /designs/         旧无前缀路径 → 默认语言版本的静态跳转（meta refresh + canonical + noindex）
```

- **不按浏览器语言自动改写 URL**，也不使用 Cookie 语言检测；根路径固定进入 `i18n.defaultLocale`。
- 部署到子路径（如 GitHub Pages 的 `/<repo>/`）时，所有链接、CSS、字体、`canonical` 与 `hreflang` 自动带上 base 前缀。
- 旧路径**不是**真正的 HTTP 301（静态托管限制），而是明确声明的降级：静态 meta refresh + `canonical` + `noindex, follow`。如需真 301，请在托管平台侧配置。

### 语言切换

`styled` 页面的语言切换入口是**共享操作菜单**里的一个分组；`html-only` 页面在正文导航中直接列出普通语言链接。两种模式切换语言都会**保持当前页面上下文**——在主题页保持当前设计，在切换页保持切换页，在 404 回到对应语言的入口。

- 桌面鼠标环境：右键或 `Shift+F10` 打开菜单，语言项收在二级子菜单里。
- 移动端：右下角**悬浮球**打开**底部动作面板**，语言项直接平铺（触屏没有 hover 二级菜单的心智模型）。
- 以上两条适用于 `styled` 页面；`html-only` 的普通语言链接不受输入环境影响。
- 主题偏好（`localStorage`）跨语言共享：在 `styled` 页面切换语言**不会**重置随机结果。
- 无 JavaScript 时，`styled` 设计页的语言入口不可达（共享菜单依赖运行时）；切换页与 404 由 `<noscript>` 语言链接回退，`html-only` 设计页使用始终可见的原生语言链接。

### 页面操作

`styled` 页面的同一套菜单还提供重新加载、回到顶部、复制链接、打印 / 保存为 PDF、分享页面，以及随机切换主题。`html-only` 页面不提供这些菜单动作，只保留普通链接导航。

- 主题页的「随机一个设计」会排除当前设计；切换页与 404 没有"当前设计"，走全部主题。
- 菜单样式属项目 chrome，中性外观，不模仿任何一套主题的视觉语言（见 `docs/rules/action-menu.md` 与 ADR 0007）。

## 部署

### GitHub Pages（fork 零配置）

1. 仓库 Settings → Pages → Source 选择 **GitHub Actions**
2. push 到 `main` 即自动构建部署；工作流按 `fonts.lock.json` 哈希复用 `.cache/fonts/`，随后执行 `npm run fonts:prepare`；`SITE_URL` / `BASE_PATH` 从仓库上下文自动注入
3. 自定义域名：把工作流中 `BASE_PATH` 改为 `/`，并在 `public/` 放置 `CNAME` 文件

### Cloudflare Pages

- 连接仓库；Build command `npm ci && npm run fonts:prepare && npm run build`；Build output directory `dist`
- 可选环境变量：`SITE_URL=https://<你的域名>`（用于 canonical 绝对地址）
- 构建环境需 Node.js `>=22.12`；只有 `fonts:prepare` 在有缓存缺失时联网，之后的 build 不访问字体源。

### Vercel

- 导入仓库，框架预设自动识别 Astro；Install Command `npm ci`；Build Command `npm run fonts:prepare && npm run build`；可选环境变量 `SITE_URL`
- Node.js 版本需 `>=22.12`。20 个 local-provider family 的二进制不进入 Git，部署时由固定的字体目录 Release 准备。

## 设计来源与许可

- 本仓库代码：MIT（见 `LICENSE`）
- Oxide 设计规范：来自 [oxidecomputer/design-system](https://github.com/oxidecomputer/design-system)（MPL-2.0）
- FAST 设计规范：来自 [microsoft/fast](https://github.com/microsoft/fast)（MIT）
- 每套官方来源的完整许可与署名见对应设计目录下的 `SOURCE-LICENSE.txt`；来源 URL、获取日期与许可见 `design.json`

## 文档

- `docs/README.md`：文档职责索引与维护规则（改文档前先看它）
- `SPEC.md`：项目规格与事实来源（决策记录、运行时规则、目录结构、验收标准）
- `AGENTS.md`：编码 Agent 的规则入口（硬门禁 + 任务路由；完整正文在 `docs/rules/`；验证流程见 `design-page-verify` skill）
- `docs/adr/` 长期技术决策 · `docs/designs/<id>/ADAPTATION.md` 主题适配记录 · `docs/verification/` 各主题与共享机制的当前验证状态 · `change-log/` 版本记录
