# SenrenBanka

一份个人资料，多套由 AI 依据 `DESIGN.md` 生成的完整设计——构建期产出纯静态页面，可部署到任何静态托管。

One profile. Many AI-designed homepages. Astro + TypeScript + Tailwind CSS 4, shipped as static files.

## 特性

- 4 套视觉与结构完全不同的设计（Editorial / Terminal / Oxide / Fast），共用一份 `src/data/profile.yaml`
- 随机 / 固定两种模式、浏览器缓存与避免连续重复、可配置手动切换
- 每套设计独立 CSS（Tailwind `source(none)` + `@source` 精确隔离），字体构建期自托管，运行时零第三方请求
- 根路径是零外部请求的客户端路由；仅默认设计对外可索引（避免近重复内容）
- fork 后只需改资料与少量配置即可部署 GitHub Pages / Cloudflare Pages / Vercel

## 快速开始

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + 构建到 dist/
npm run preview
```

- 改资料：`src/data/profile.yaml`（核心必填：`name` / `headline` / `bio` / `links`）
- 改行为：`src/data/site.config.yaml`（`mode` / `default` / `manualSwitch` / `cacheHours`）
- 增删设计：在 `src/designs/<id>/` 新建或删除目录即可（目录存在即注册；四件套：`DESIGN.md` / `design.json` / `Page.astro` / `style.css`），流程与合规要求见 `SPEC.md` §4–§6 与 `AGENTS.md`。新增目录后需重启 `npm run dev`。

## 部署

### GitHub Pages（fork 零配置）

1. 仓库 Settings → Pages → Source 选择 **GitHub Actions**
2. push 到 `main` 即自动构建部署；`SITE_URL` / `BASE_PATH` 由 `.github/workflows/deploy.yml` 从仓库上下文自动注入
3. 自定义域名：把工作流中 `BASE_PATH` 改为 `/`，并在 `public/` 放置 `CNAME` 文件

### Cloudflare Pages

- 连接仓库；Build command `npm run build`；Build output directory `dist`
- 可选环境变量：`SITE_URL=https://<你的域名>`（用于 canonical 绝对地址）

### Vercel

- 导入仓库，框架预设自动识别 Astro；可选环境变量 `SITE_URL`

## 设计来源与许可

- 本仓库代码：MIT（见 `LICENSE`）
- Oxide 设计规范：来自 [oxidecomputer/design-system](https://github.com/oxidecomputer/design-system)（MPL-2.0）
- FAST 设计规范：来自 [microsoft/fast](https://github.com/microsoft/fast)（MIT）
- 每套官方来源的完整许可与署名见对应设计目录下的 `SOURCE-LICENSE.txt`；来源 URL、获取日期与许可见 `design.json`

## 文档

- `docs/README.md`：文档职责索引与维护规则（改文档前先看它）
- `SPEC.md`：项目规格与事实来源（决策记录、运行时规则、目录结构、验收标准）
- `AGENTS.md`：编码 Agent 的强制实现约定（新增设计必读；完整验证流程见 `design-page-verify` skill）
- `docs/adr/` 长期技术决策 · `docs/designs/<id>/ADAPTATION.md` 主题适配记录 · `docs/verification/` 各主题与共享机制的当前验证状态 · `change-log/` 版本记录