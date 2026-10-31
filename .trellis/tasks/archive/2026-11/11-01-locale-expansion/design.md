# Locale 配置与语言扩展机制 — 技术设计

> 父任务设计。子任务实现时以本文件为跨层契约来源；子任务可有自己的 design.md 记录局部实现细节。

## 1. 决策摘要

| # | 决策 | 依据 |
|---|---|---|
| D1 | 保留 ADR 0006 的静态多语言路由：每 locale 独立 URL、独立 HTML | 无 JS 可达、SEO/hreflang、按文字系统选字体、html-only 零 JS 契约 |
| D2 | 不做运行时客户端语言切换 | ADR 0006；本项目是 27 套设计 + 零 JS html-only 的静态展示站 |
| D3 | 先外置共享菜单 CSS，再扩语言 | 每页 18,823 B 相同 CSS × 87 个含菜单页面 ≈ 1.56 MB；外置是最低风险的大杠杆 |
| D4 | `design.json` 新增必填 `locales` 覆盖数组；默认设计必须全量 | 避免每加一语改 27 套设计；覆盖缺口显式可见 |
| D5 | 未配置的 locale code 在覆盖数组中忽略并告警 | fork 删除语言时无需逐套清理 design.json |
| D6 | 语言切换目标：目标 locale 覆盖当前设计则保持设计，否则落到默认设计 | 保持语言切换永远可达 |
| D7 | `locales.length < 2` 时语言分组整组不渲染 | fork 单语言不出现空分组 |
| D8 | 韩语使用 Noto Sans KR / Noto Serif KR 核心文字系统角色，部署内容子集 | 视觉正确；体积 40–120 KB；与现有核心字体策略一致 |
| D9 | 10 MiB 门禁不变；扩语言靠外置 + 窄覆盖，不抬门禁 | 用户对部署包体积敏感 |
| D10 | 可选拉丁语言本轮不加 | 文案与页面成本高于字体成本；机制先就绪 |

## 2. 现有约束（不可破坏）

- `astro.config.mjs` 用 `injectRoute` 为每套设计注册真实路由；禁止动态 `[design]` 路由导致 CSS 聚合（SPEC §3.2）。
- 每套设计只加载自己的 `style.css`；共享模块不得跨设计聚合样式（AGENTS 硬门禁 6）。
- `html-only` 设计零 CSS/JS/字体；语言导航用原生 `<a>`（ADR 0009）。
- 共享操作菜单全站唯一实现；`styled` 设计不得复制菜单（AGENTS 硬门禁 5）。
- 内容默认可见；隐藏态只由 `html[data-reveal-ready]` 门控（硬门禁 7）。
- 改动设计页/共享机制后必须执行 `design-page-verify` 并更新 `docs/verification/`（硬门禁 8）。

## 3. Locale 数据流

```
site.config.yaml i18n.locales
        │
        ├── profiles/<path>.yaml        （资料，缺失即构建失败）
        ├── src/i18n/messages.ts        （共享文案，缺键即构建失败）
        ├── src/fonts/* + fontProfile   （字体角色/子集）
        └── design.json locales[]       （每套设计的覆盖声明）
                    │
                    ▼
           registry / astro.config
                    │
      ┌─────────────┴──────────────┐
      │                            │
生成 (design × locale) 页面     生成每 locale 的入口/切换页/404
      │                            │
      └────────────► 菜单语言项（全部 locale，按覆盖决定目标）
```

## 4. `design.json` 契约

```jsonc
{
  "displayName": "Editorial",
  "enabled": true,
  "renderMode": "styled",
  "locales": ["zh-CN", "ja", "en", "ko"], // 必填；默认设计必须等于全部配置 code
  "source": { ... }
}
```

校验（`src/designs/registry.ts`，zod strict）：

- `locales` 为 `z.string().min(1)` 数组，`.min(1)`，去重后不得有重复。
- 过滤掉不在 `site.config.yaml` 中的 code，并输出构建告警（含设计 id 与 code）。
- 过滤后为空 → 构建失败（设计没有任何可用语言）。
- `design.default` 对应设计过滤后的覆盖集合必须包含全部配置 code。
- 每个 `(design, coveredLocale)` 必须能从 `messages.ts` 取到完整文案；缺失 → 构建失败，错误信息包含设计目录、locale code、缺失键路径。
- 字体角色：locale 的 `fontProfile` 需要核心角色时，若字体目录没有该角色 → 构建失败（由韩语子任务实现）。

## 5. 文案类型与查找

现状：`src/designs/<id>/messages.ts` 导出 `messages: Record<'zh-CN' | 'ja' | 'en', Messages>`，`Page.astro` 直接 `messages[locale.code] as Messages`。

目标：

- 定义 `Partial<Record<string, Messages>>` 或 `Record<string, Messages>` 作为存储类型；不再硬编码三语 union。
- 新增共享解析函数，例如 `src/i18n/resolve.ts` 中的 `getDesignMessages(messages, locale, designId)`：
  - 若 locale 不在设计覆盖中，调用方不应请求（路由/页面守卫保证）；
  - 若覆盖但缺键，抛出带上下文的构建错误；
  - 返回强类型 `Messages`。
- 构建期还有一次全量扫描（registry 或专用 validate 脚本）：遍历所有 design × covered locale，提前给出全部缺失项，而不是等渲染到该页才报错。
- `src/designs/descriptions.ts`（切换页描述）同样改为按 locale 覆盖查找；未覆盖该 locale 的设计不出现在切换页。描述缺失属于结构缺口 → 构建失败。
- 共享文案 `src/i18n/messages.ts` 已有全 locale 校验（`src/lib/site.ts`），保留；新增 locale 必须补齐。

## 6. 路由与页面生成

- `astro.config.mjs` 读取设计注册表与 `design.json.locales`，只为 `(design, locale)` 覆盖对注入路由。
- 未覆盖的 `/<locale>/<design>/` 没有产物；静态托管自然 404。
- 每 locale 仍生成：locale 入口页、`/<locale>/designs/` 切换页、404（全局一个）。
- 切换页只列出覆盖当前 locale 的设计；计数与卡片描述来自覆盖过滤后的集合。
- `hreflang` 仍只在各 locale 的默认设计页之间互指；新增 locale 自动加入。
- 旧路径跳转页（28 个）与语言数无关，保持不变。
- 单语言 fork 仍保留 `/<locale>/` 前缀；路由逻辑无需特判。

## 7. 语言菜单与切换目标

数据源：`src/lib/site.ts` 的 `buildActionMenuConfig()` / `view.contextMenu`。

- 语言项集合 = 全部配置 locale，**不按设计覆盖过滤**。
- 目标 URL：
  - 当前设计覆盖目标 locale → `localeDesignHref(target.path, currentDesign.id)`；
  - 否则 → `localeDesignHref(target.path, design.default)`。
- 当前语言项 `aria-current="page"`；每项带 `hreflang` / `lang`；保持 `Language self-name` 规则。
- `html-only` 原生导航使用同一目标函数。
- 单语言：整个语言分组（桌面触发项 + 子菜单、移动分组、注入 JSON、html-only 导航语言区）构建期不渲染；不得留下空 `<ul>`、空标题或空 JSON 数组。
- 菜单的“当前设计”身份条与随机主题逻辑不受覆盖影响。

## 8. 共享菜单 CSS 外置（子任务 C1）

现状：`src/components/ContextMenu.astro` 顶部注释明确「样式以 `<style is:inline>` 内联（不新增 `<link>`，每设计页仍只链接自己的 CSS）」。

目标：

- 把 18,823 B 的 `<style is:inline>` 内容迁移为 `src/components/context-menu.css`（或等价入口），由 Astro 构建为单一 hash CSS。
- 所有含菜单的页面在 `<head>` 链接该 CSS；每页仍只链接自己的设计 CSS + 这一份 chrome CSS，不产生跨设计聚合。
- 菜单容器初始 `hidden`，外置 CSS 为 render-blocking `<link>`，不引入可见 FOUC；悬浮球若在 CSS 前可见，需要验证。
- 更新 `docs/rules/action-menu.md` 中“内联/不新增 link”的表述；新增 ADR（建议编号 0015）记录：体积收益、缓存收益、额外请求、CSS 隔离边界、回滚方式。
- 验收：三语 dist ≤ 5.2 MB；styled 页面无内联菜单 CSS；桌面右键/移动悬浮球/无 JS 行为不变；html-only 零资源不变。

CSS 隔离判定：菜单 CSS 是项目 chrome，不是任何设计的 `style.css`；外置后每页仍只链接自己的设计 CSS。不得通过 `@import` 从设计 CSS 引入菜单 CSS，也不得把多套设计 CSS 合并。

## 9. 韩语与字体（子任务 C4）

- `site.config.yaml` locale 条目新增显式 `fontProfile`（本任务先为 ko 添加 `korean`；其余 locale 可回填 `cjk` / `latin`），不从 BCP 47 推断。
- 外部字体仓库 `whitehair-failure/SenrenBanka-fonts` 新增两个 core script 角色：
  - Noto Sans KR（无衬线）
  - Noto Serif KR（衬线）
- 生产包 + source archive 发布；`fonts.config.json` / `fonts.lock.json` 通过 `fonts:update` 更新；`src/fonts/generated.ts` 重新生成。
- 部署仍走 `fonts:subset`（按最终 dist 文本生成内容子集）+ `fonts:prune`（非核心整分片裁剪）+ `fonts:audit`（cmap 覆盖校验）。
- 韩语覆盖的每套设计，其可见字体角色必须能落到 Noto KR 或已覆盖 Hangul 的核心族；否则该设计不声明 ko。
- 首批覆盖名单建议（在 C4 PRD 定稿）：`editorial`（默认）、`frost`、`kern`、`oxide`、`terminal`、`material3`、`deco`、`magical-girl`。这些设计的拉丁/正文栈以 npm 族或核心族为主，韩语字形风险低。

**实施修订（2026-10-31，ADR 0016）**：Noto KR 的 Fontsource 两族会把韩文拆成 120 个 unicode-range 分片；五套韩语页面部署后 `fonts:prune` 保留 134 个字体文件 / 6.26 MB，`dist` 9.93 MB（虽低于 10 MiB，但远超 6.0 MB 预算）。外部字体仓库尚未发布 Noto KR core source 包，无法做字形级子集。首版因此改为：`editorial` 的韩文命中核心 LXGW（子集 249,972 → 275,920 B），`frost` / `fast` / `govuk` / `html-only` 使用系统韩文字体回退；首批实际覆盖 `editorial`、`frost`、`fast`、`govuk`、`html-only` 五套。`fontProfile: korean` 保留，Noto KR 待外部发布后替换。四语 dist 实测 5,147,850 B / 124 页。

## 10. 体积预算模型

| 阶段 | 预估 dist | 说明 |
|---|---|---|
| 现状 3 语 | 6,544,535 B | 实测 |
| C1 外置后 3 语 | ~4.98 MB | 省约 1.56 MB 内联菜单 CSS |
| C4 韩语窄覆盖（5 套） | **5,147,850 B（4.91 MiB）** | 实测；LXGW 子集 275,920 B（+25,948 B）；不部署 Noto KR；124 页 |
| C4 若韩语全 27 套 | ~6.25 MB | 仍低于 10 MiB；翻译成本才是约束 |
| 后续每新增窄覆盖语言 | +0.25–0.4 MB | 拉丁语系共用一次性 latin-ext 约 0.28 MB |

门禁：`scripts/fonts/prune.mjs` 的 10 MiB 不变；每次构建输出体积报告。

## 11. 失败级别与报告

| 情况 | 级别 | 处理 |
|---|---|---|
| `site.config` 缺 profile / 共享文案缺 locale 键 | 构建失败 | 现有逻辑保留 |
| `design.json.locales` 为空 / 重复 / 默认设计未全量 | 构建失败 | 新增校验 |
| 设计声明覆盖但 `messages.ts` 缺键 / 描述缺失 | 构建失败 | 新增校验，列出全部缺失 |
| 设计覆盖数组含未配置 locale | 告警 | 过滤后继续 |
| 字体角色缺失（fontProfile 要求） | 构建失败 | 字体审计 |
| 源字体缺个别字形 | 告警 + 报告 | 不静默回退文案 |

## 12. 已否决替代方案

- **运行时 JS 切换语言 / 单 URL 多语言**：ADR 0006；失去无 JS 可达、每语言 SEO、按文字系统裁字体；不重开。
- **动态 `[design]` / `[locale]` 路由**：CSS 聚合，明确禁止。
- **每个新语言全 27 套翻译**：页面与文案成本线性增长；用覆盖机制窄启动。
- **`locales` 缺省 = 全部 locale**：新语言会自动生成未翻译页面并导致构建失败；要求显式声明。
- **覆盖数组含未配置 code 时构建失败**：会让单语言 fork 必须逐套改 27 个 design.json；改为忽略 + 告警。
- **提高 10 MiB 门禁**：不解决重复 chrome 的根因。

## 13. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 菜单 CSS 外置改变视觉/层级 | 像素级桌面 + 375px 截图对比；无 JS / 减动态复测；ADR 记录回滚 |
| 覆盖重构触碰 27 套文案 | 现有三语产物逐页对比（HTML 字节/结构）；类型检查 + 构建全量扫描 |
| 韩语字体包发布延迟 | C4 依赖外部 Release；未发布前不声明 ko 覆盖 |
| 韩语文案质量 | 人工审校作为发布门槛；未审校不发布 |
| 切换页/描述/canonical 仍硬编码 3 语 | 全局搜索 `zh-CN`/`ja`/`en` 字面量并补测试 |
| fork 文档与实际行为不一致 | 单语言构建用例 + README 步骤实测 |

## 14. 发布与回滚

- C1 可独立发布；回滚 = 恢复 `<style is:inline>`。
- C2 可在保持现有三语输出不变的前提下合并；回滚 = 移除字段与校验。
- C3 可独立合并；回滚 = 恢复语言分组渲染。
- C4 加入 ko；回滚 = 移除 locale 条目、profile、覆盖声明与字体包（字体仓库版本保留）。
- C5 文档在代码稳定后更新；回滚 = 文档随代码回退。
