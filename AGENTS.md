# AGENTS.md — 项目级实现约定

本文件是编码 Agent 的强制约定（对应 SPEC §9）。新增 / 修改设计前必读。

## 数据接口

- 每个设计页面在 frontmatter 取数：`const view = await loadDesignView('<自己的 id>')`（`src/lib/site.ts`）
- `view` 结构：
  - `profile`：核心字段 `name` / `headline` / `bio` / `links` **必须全部渲染**；
    `avatar` / `location` 可选；扩展区块 `projects` / `experience` / `skills` / `contact` 由设计按自身风格**自行取舍**（取舍结果写进该设计的 DESIGN.md）
  - `site`：title / description / lang / manualSwitch
  - `design`：id / displayName / description / isDefault
  - `head`：**必须原样传给 `HeadMeta`**（title / description / canonical / robots 由框架统一计算，robots 索引策略不可自行更改）
  - `switcher`：`enabled` 与 `href`
- 所有内部链接必须经 `withBase()`（`src/lib/urls.ts`）拼接 base 前缀，禁止硬编码绝对路径
- 禁止虚构个人事实；允许装饰性文案（如 "Selected Works"、"Elsewhere"）

## 每套设计必须满足

1. 四件套齐备：`DESIGN.md`、`design.json`、`Page.astro`、`style.css`
2. `Page.astro` 是完整文档（含 `<html>`），`<head>` 中必须包含 `<HeadMeta {...view.head} />`
3. `style.css` 首两行必须为：

   ```css
   @import "tailwindcss" source(none);
   @source "./";
   ```

   （如 import 了共享组件且其含工具类，追加 `@source` 指向共享目录）
4. `manualSwitch` 开启时必须提供可见的切换入口链接（形式自由：页脚链接 / 角落按钮 / 导航项；无 JS 可达）
5. 字体：在 `astro.config.mjs` 的 `fonts` 注册（npm provider、`remote: false` 离线优先）→ 页面内 `<Font cssVariable ...>`（`astro:assets`）→ `style.css` 里用 `@theme inline` 注册进 Tailwind
6. `design.json` 的 `source`：非自产（官方 / 第三方）必须填 `url` / `fetchedAt` / `license`，否则构建失败；许可要求保留声明时附 `SOURCE-LICENSE.txt`

## 已知坑（均已实测，勿重复踩）

- **不要让任何多页共享的模块对设计页面 / CSS 建立动态导入边**：
  `import.meta.glob('./*/Page.astro')`（非 eager）这类写法会把它触达的所有 `style.css` 聚合进**每个**引用方的 `<link>`。
  文件存在性检查请用 `node:fs`（见 `src/designs/registry.ts`）。
- **设计路由用 `astro.config.mjs` 的 `injectRoute`**：`getStaticPaths` 不能引用页面 frontmatter 顶层的 glob 变量（构建拆包后报 `pages is not defined`）。副作用：新增 / 删除设计目录后需重启 `npm run dev`。
- **内容层 glob loader 会归一化条目 id**（`site.config.yaml` → `"siteconfig"`）：取数用 `getCollection()` 取唯一条目，不要猜 id（见 `src/lib/site.ts`）。
- **Tailwind 不识别动态拼接的类名**（如 `border-${color}` 不会被扫描到）；需要安全列表时用 `@source inline("...")`。
- **`@astrojs/tailwind` 已弃用**，勿引入；Tailwind 4 官方集成 = `@tailwindcss/vite`（已配置）。
- 切换页 `/designs/` 在 `manualSwitch: false` 时**不构建**（404），且任一设计页不得留入口。

## 新增设计评审清单

- [ ] 四件套 + provenance（来源类型 / URL / 日期 / 许可）完整
- [ ] 核心字段全部渲染；扩展区块取舍与理由写进 DESIGN.md
- [ ] `<HeadMeta {...view.head} />` 与切换入口均存在
- [ ] 移动端 375px 宽无横向溢出、正文可读
- [ ] `npm run build` 通过（含 `astro check`）
- [ ] 抽查 `dist/`：该设计页面只链接自己的 CSS；根页 / 切换页 / 404 不链接任何设计 CSS

## 构建

- `npm run check`：`astro check`（TS / .astro 类型）
- `npm run build`：check + 构建；设计注册表校验失败时会以 `[senrenbanka]` 前缀明确报错
- 新设计页完成、或任一设计页/样式/构建配置改动后：按 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）执行完整验证流程
- 临时调整 `site.config.yaml`（如切 `mode: fixed`）验证行为后，请恢复示例配置再提交

## 版本与变更日志

- 变更日志在 `change-log/` 下**一个版本一个文件，以版本号命名**（如 `change-log/0.1.0.md`）
- 版本规则：**大功能更新 `+0.1`**（0.1.0 → 0.2.0）；**小功能补丁 `+0.0.1`**（0.1.0 → 0.1.1）；与 `package.json` 的 `version` 保持同步
- 每次版本更新**新增**对应版本号的日志文件，不在旧文件上累积

## 入库范围（git）

- skill 只入库**仓库定制化**的 `.agents/skills/design-page-verify/`；通用 skill（impeccable、grill-me 等）不入库
- `.trae/`、`.codex/`、`.impeccable/` 等本地工具目录不入库（规则见 `.gitignore`）
- 通用 skill 由使用者自行安装（如 impeccable：用于设计文档化 / 检测器 / 评审；`design-page-verify` 流程中的检测器步骤依赖它）