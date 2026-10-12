# 多语言静态路由：显式 injectRoute 而非 Astro 原生 i18n

SenrenBanka 需要在**保持"每套设计只加载自身 CSS"**的前提下支持多语言。我们把同一个 `Page.astro` 注册到多个语言前缀（`/<locale.path>/<id>`），并在构建期从 `Astro.url.pathname` 自行解析当前语言，**不启用 Astro 的原生 `i18n` 配置**。

## 背景

现有架构的关键约束（SPEC §10.4）：`astro.config.mjs` 用 `injectRoute` 为每套设计注册一条真实路由，而不是动态 `[design]` 路由。原因是被实测确认的硬约束——动态 import 会让 Vite 把**所有**设计的 `style.css` 聚合进每个页面的 `<link>`（SPEC §3.2 已记录）。任何 i18n 方案都不能破坏这一点。

## 决策与依据

实测（本机 Astro 7.3.8，见 `docs/verification/shared.md`）表明原生 `i18n` 对本项目**零增益**：

- 开启与关闭原生 `i18n`，构建产物是**完全相同的 37 个 HTML**（页面清单 `diff` 一致）。它不生成重定向、不做 fallback、不改变任何路由。
- 它唯一的实际作用是让 `Astro.currentLocale` 有值——**不配 `i18n` 时实测为 `UNDEFINED`**。

因此采用显式方案：`injectRoute` 把每个 `Page.astro` 注册到每种语言的固定路径，locale 由 `src/lib/site.ts` 的 `resolveLocale()` 从路径首段与 `i18n.locales[].path` **精确匹配**得出。

## 考虑过的替代方案

| 方案 | 否决理由 |
|---|---|
| Astro 原生 `i18n`（`prefixDefaultLocale`） | 实测产出与自建路由完全相同，却多引入一层"路由由谁生成"的真相；且 `Astro.currentLocale` 需要额外配置才能用，而自解析同样能拿到 locale。零收益 + 双份真相。 |
| 动态 `[design]` 路由 + locale 参数 | 直接违反 CSS 隔离约束（所有设计样式会被聚合），是本项目明令禁止的做法。 |
| 运行时客户端切换语言 | 违反"构建期静态 HTML、无运行时翻译服务"的项目约束；且无 JS 时不可用。 |

## 后果

- **正向**：`injectRoute` 的 CSS 隔离性质完全保留——实测三语言 × 8 套设计共 24 个页面，产物仍只有 **8 个** `Page.*.css`，且同一设计的三语言页面引用**完全相同**的单个 CSS 文件。
- **代价**：`Astro.currentLocale` 不可用，locale 解析需自己实现并测试（`resolveLocale` + `pathSegments`，含 base 前缀剥离逻辑）。
- **易错点**：语言识别只认路径**首段**并与 `locales[].path` 精确匹配，因此部署 base（`/demo`）不会被误当成语言代码——这一点在 `BASE_PATH=/demo` 下实测覆盖。