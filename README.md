# SenrenBanka

一份个人资料，多套由 AI 依据 `DESIGN.md` 生成的完整设计，支持简中 / 日 / 英三语言——构建期产出纯静态页面，可部署到任何静态托管。

One profile, many AI-designed homepages, in three languages. Astro + TypeScript + Tailwind CSS 4, shipped as static files.

## 特性

- 8 套视觉与结构完全不同的设计（Editorial / Terminal / Oxide / Fast / Frost / GOV.UK / Kern / Material 3），共用同一份资料契约
- **三语言**（`zh-CN` / `ja` / `en`）：每套设计在每种语言下都是独立静态页，资料、文案与 SEO 元数据按语言分离
- **语言切换入口在右键菜单内**：语言项带各语言自称与 `hreflang`，切换语言保持当前设计；无需为每套设计重复排版（桌面鼠标环境）
- 随机 / 固定两种模式、浏览器缓存与避免连续重复、可配置手动切换
- 每套设计独立 CSS（Tailwind `source(none)` + `@source` 精确隔离），**多语言不改变这一点**，字体构建期自托管，运行时零第三方请求
- 根路径是零外部请求的客户端路由；每种语言仅其默认设计对外可索引（避免近重复内容）
- fork 后只需改资料与少量配置即可部署 GitHub Pages / Cloudflare Pages / Vercel

## 快速开始

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + 构建到 dist/
npm run preview
```

- 改资料：`src/data/profiles/{zh-cn,ja,en}.yaml`（三份，**共用同一套字段契约**；核心必填：`name` / `headline` / `bio` / `links`）
- 改语言：`src/data/site.config.yaml` 的 `i18n.locales`（**语言清单只在这里维护一处**：增删语言 = 加一份 `locales` 条目 + 一份同名 `profiles/<path>.yaml`）
- 改行为：`src/data/site.config.yaml` 的 `design`（`mode` / `default` / `manualSwitch` / `cacheHours`）
- 改界面文案：共享文案在 `src/i18n/messages.ts`，每套设计自己的文案在 `src/designs/<id>/messages.ts`（缺文件或缺键**构建期报错**）
- 增删设计：在 `src/designs/<id>/` 新建或删除目录即可（目录存在即注册；五件套：`DESIGN.md` / `design.json` / `Page.astro` / `style.css` / `messages.ts`），流程与合规要求见 `SPEC.md` §4–§6 与 `AGENTS.md`。新增目录后需重启 `npm run dev`。

### URL 规则

```
/                         根入口 → 进入默认语言（zh-CN），随机 / 固定模式同既有行为
/zh-cn/<设计>/  /ja/<设计>/  /en/<设计>/    各语言下的设计页（唯一权威地址）
/zh-cn/designs/ 等          各语言的主题切换页（manualSwitch 关闭时不构建）
/<设计>/  /designs/         旧无前缀路径 → 默认语言版本的静态跳转（meta refresh + canonical + noindex）
```

- **不按浏览器语言自动改写 URL**，也不使用 Cookie 语言检测；根路径固定进入 `i18n.defaultLocale`。
- 部署到子路径（如 GitHub Pages 的 `/<repo>/`）时，所有链接、CSS、字体、`canonical` 与 `hreflang` 自动带上 base 前缀。
- 旧路径**不是**真正的 HTTP 301（静态托管限制），而是明确声明的降级：静态 meta refresh + `canonical` + `noindex, follow`。如需真 301，请在托管平台侧配置。

### 语言切换

语言切换入口是**右键快捷操作菜单**里的一个分组（桌面鼠标环境：右键或 `Shift+F10`）。切换语言会**保持当前设计**。

- 这是项目的显式取舍：右键菜单在触屏设备上不加载，因此**移动端没有语言切换入口**——换来的是不必为每套设计重复排版语言切换器。
- 主题切换页与 404 页不使用右键菜单，它们保留独立的可见语言链接。
- 主题偏好（`localStorage`）跨语言共享：切换语言**不会**重置随机结果。

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