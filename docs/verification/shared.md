# verification — 共享机制与基础设施（shared）

> 本文件维护**共享机制**（不属于任何单一设计）的当前完整验证状态：根路由页、各语言入口页、`/<locale>/designs/` 切换页、旧路径跳转页、404、语言切换器、桌面右键菜单（ContextMenu）、滚动显现机制（Reveal）、字体与 base 处理、行为矩阵、**多语言路由测试矩阵**、资产 provenance。
> 重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）；各设计自身的状态见 `docs/verification/<id>.md`。
> 验证步骤与通过标准见 `design-page-verify` skill；记录归属见 `docs/README.md`。
> 最近全流程验证：**2026-10-12（v0.9.0 多语言）**；此前 2026-10-10（v0.4.0）＋ v0.5.0 / v0.5.1（菜单）；2026-10-11 文档治理迁移，无代码改动。

## 构建与产物隔离

- `npm run build` 7 页绿（`astro check` 0 错误 / 0 警告 / 0 提示）；`manualSwitch:false` 时构建 6 页（`/designs/` 不构建 → 404）。
- 根页 / 切换页 / 404：**零**设计 CSS 链接、**零**菜单字节、不含 `data-reveal-ready`（reveal 脚本仅存在于设计页）。
- 菜单样式为 `<style is:inline>`（不新增 `<link>`，"每设计页只链接自己的 CSS" 成立）；运行时 chunk（`context-menu.*.js`）独立、无 `modulepreload`。
- `BASE_PATH=/demo` 全链路前缀正确（根脚本 / noscript / 切换页链接 / canonical / favicon / 菜单配置 JSON / 随机导航均带前缀）。
- 根路径零第三方请求（无字体 / CSS / JS 加载）。

## 行为矩阵（随机 / 固定 / 缓存 / 切换）

- 随机：存储有效→用存储；过期→重随机（`avoidRepeat` 排除上次）并写新窗口；`cacheHours=0` 有效窗口为 0。
- 固定：`manualSwitch:true` 有手选→用存储；无手选→default；`manualSwitch:false`→永远 default 且**不读写存储**（曾存缺陷，已修复并经浏览器实测：遗留存储被忽略）。
- 手选持久化：随机模式手选按 `cacheHours` 过期；固定模式手选 `expiresAt:null` 永久。
- 直达设计固定 URL **不写存储**；`enabled:false` 设计不进随机池与切换页、页面仍可直达。
- 仅 1 套启用设计：随机自然落它；菜单「随机一个设计」项 `aria-disabled` 且强制点击不导航。
- 无 JS：根页 `<noscript>` meta refresh → default + 链接列表；设计页 / 切换页内容可读、链接可导航。
- 存储键命名空间化（`senrenbanka.design.v1:<baseKey>`）；JSON 损坏 / 非法 id → 视为无效并回退（容错）。

## 桌面右键菜单（ContextMenu，ADR 0004）

- 单行身份条（v0.5.1）：设计 accent 圆点（`--cm-accent` 内联）+ 设计名 + 「当前设计」标签；宽度实测四套设计均 **216px**、高 326px；超长名收敛 264px 上限 + ellipsis。
- 打开 / 关闭：`(hover: hover) and (pointer: fine)` 非交互区右键 / `Shift+F10` / 上下文键；链接、图片、输入控件、可编辑区、已选中文字、触屏来源一律保留原生菜单（不全页 `preventDefault()`）；再次右键 / 外部左键 / 滚动 / 尺寸变化 / Esc 关闭；视口边缘自动翻转收敛。
- 键盘：打开时聚焦容器（鼠标不预高亮）；`Shift+F10` / 键盘打开落首项聚焦并显示 `data-cm-key` 焦点环；↑↓/Home/End 移动、Enter/Space 激活、Esc 关闭归还焦点、Tab 关闭不困焦点。
- 动作：重载（sessionStorage 计数 1→2）、回顶（796→0）、复制（Clipboard API → `execCommand` 降级（以 `document` 为 `this`）→ 双失败 Toast）、打印 / 保存 PDF、分享（成功 / AbortError 取消 / 失败三态 Toast；`navigator.share` 不可用时该项移除）。
- 随机：复用存储契约；必须排除当前设计，`avoidRepeat` 再排除上次；写入后直接导航目标固定 URL；打开菜单 / 页面加载不写存储。
- 对比度（菜单色板）：亮——设计名 17.01、标签 5.00、icon 5.15（首版 eyebrow `#8e8e93` 3.26 不达标 → 调深 `#6f6f74` 5.00）；暗 6.04–14.52；Toast 13.73、错误档 9.36；禁用项为 WCAG 豁免（`aria-disabled` + opacity）。
- 深色主题实测：底 `rgb(32,32,36)` / 名 `rgb(242,242,244)` / 标签 `rgb(157,157,166)`。
- 触屏（375×812 + coarse）：菜单不显示、程序化 `contextmenu` 无响应、**菜单 chunk 请求数 0**、无横向溢出、无可见切换入口。
- `manualSwitch:false`：组件整体不渲染（设计页零菜单标记 / 零脚本、右键不拦截）。

## 滚动显现机制（Reveal，ADR 0001）

- 观察 `[data-reveal]` → 首次进入视口置 `[data-reveal-in]` 并 `unobserve`（只播一次）；门控 `html[data-reveal-ready]` 由内联 boot 在「非 reduced-motion 且支持 `IntersectionObserver`」时同步写入。
- 降级四情形（Chromium 仿真）：reduced-motion（门控不写、动画 0、隐藏 0）、无 JS（门控不写、内容齐备）、无 IO（门控不写、隐藏 0）、IO 构造抛错（`try/catch` 撤销门控、隐藏 0）。
- 脚本失败安全网：内联计时安全网（2s 未初始化则撤销门控并全部揭示）+ 模块 `try/catch`。
- 跳转式滚动兜底：刷新恢复位置 / End 键 / 锚点跳转不产生 IO 通知，已加滚动补揭示；四页实测隐藏目标 0。
- 共享模块（`src/lib/reveal.ts` / `Reveal.astro`）不 import 任何 CSS。

## 字体与 base

- 字体构建期自托管：dist 内 9 个 woff2，全站零第三方字体引用；`rel="preload"` 四页均 0。
- 结论：npm provider 不填 face 的 subset 元数据、family 级 `subsets` 为空操作——**无法子集过滤**（preload 会带入未使用子集；latin 子集仍按 `unicode-range` 按需加载）。
- 回退栈含系统中文字体（示例资料中英混排验证通过）。
- `import.meta.env.BASE_URL` 在带 base 时不带尾斜杠（如 `'/demo'`）→ `src/lib/urls.ts` 归一化；`BASE_PATH=/demo` 前缀自检通过。

## 多语言路由测试矩阵（v0.9.0，2026-10-12）

**构建**：`npm run check` 0 错误 / 0 警告；`npm run build` **41 页**（3 语言 × 8 设计 = 24 设计页 + 3 语言入口 + 3 切换页 + 根入口 + 404 + 8 旧路径跳转 + 旧 `/designs/` 跳转）。

**架构实测结论**：Astro 7.3.8 原生 `i18n` 对本项目**零增益**——开启与关闭两种配置的产物页面清单 `diff` **完全一致**（37 页），它不生成重定向、不做 fallback；唯一作用是让 `Astro.currentLocale` 有值，**不配时实测为 `UNDEFINED`**。故采用 `injectRoute` 显式注册 + `resolveLocale()` 自解析（见 `docs/adr/0006-multilingual-static-routing.md`）。

**CSS 隔离（多语言未破坏原约束）**

| 断言 | 实测 |
|---|---|
| `dist/_astro/*.css` 总数 | **8**（= 设计数，未因语言增加） |
| 每页引用的设计 CSS | **恰好 1 个**；同一设计的 3 个语言页面引用**完全相同**的文件 |
| 根入口 / 404 / 语言入口 / 切换页 / 旧跳转页 | 设计 CSS 链接数 **0** |
| 消息模块的 CSS 边 | `src/i18n/messages.ts`、`src/designs/*/messages.ts` **不 import** 任何 CSS / `Page.astro` / `style.css` |

**逐语言 × 逐设计实测矩阵**（Playwright，24 页，桌面 1280×900 与 375×812 触控各一轮）

| 断言 | 结果 |
|---|---|
| `<html lang>` | 24/24 与 locale 相符（`zh-CN` / `ja` / `en`） |
| console 错误 | **0**（24 页） |
| 375px 横向溢出 | **0**（24 页，`scrollWidth - innerWidth = 0`） |
| 二级菜单内语言项 / `aria-current="page"` | **3 / 恰好 1**（24 页，悬浮展开后测） |
| 设计页残留可见语言切换器 | **0**（`.lang-switch` 计数，24 页） |
| 子菜单 `aria-label` / 触发项 `aria-expanded` | 已本地化；展开时 `aria-expanded="true"` |
| **18 语言扩展性** | 注入 18 种语言后主菜单仍 **8 项 / 374px**（与 3 语言一致），子菜单限高滚动且在视口内 |
| 切换语言保持主题 | 8/8 设计链接均保持同一 `<id>`；实点击 `/zh-cn/oxide/` → English 落点 `/en/oxide/` |

**SEO 实测**

| 页面 | robots | canonical | hreflang |
|---|---|---|---|
| `/<locale>/editorial/`（默认设计） | `index, follow` | 含 locale 前缀 | 3 语言互指 + `x-default` → `zh-cn` |
| `/<locale>/<非默认设计>/` | `noindex, follow` | 含 locale 前缀 | **0 个** `<link rel=alternate>` |
| `/`、各语言入口页、切换页、404 | `noindex, follow` | — | 0 |
| 旧 `/<design>/`、`/designs/` | `noindex, follow` | 指向默认语言版本 | 0 |

**路由与降级实测**

- **语言切换实测（右键菜单二级菜单内）**：24 页逐一打开右键菜单并悬浮展开子菜单，`cm-lang` 均 3 项、目标保持同一设计 id、`aria-current` 恰好 1 个；实点击 `/zh-cn/oxide/` 的 English 落点 `/en/oxide/`、`/ja/oxide/` → `/en/oxide/`（`lang=en`）。
- **二级菜单交互实测**：悬浮开启（含延迟）、点击切换开合、斜向移入子菜单不误关；子菜单默认贴右侧，放不下时翻转到左侧，纵向始终收敛在视口内。
- **键盘实测**：`↑↓` 在主菜单 8 项间循环**不飞出菜单**（修复前第 8 次 `↓` 会落到 BODY）；移到「语言」自动展开、移开收起；`→` 进入并聚焦首项、`←` 返回触发项；焦点环实测 `outline: 1.6px solid`。
- **重复排版已消除**：8 套设计的 `style.css` 中语言切换样式全部移除（约 **9.4 KB**），各设计 `style.css` 现与改动前**逐字节一致**（仅末尾换行）——文案本地化与入口重构**零视觉漂移**，检测器状态回到改动前基线。
- 语言入口：`/zh-cn/` → `/zh-cn/frost/`、`/ja/` → `/ja/frost/`、`/en/` → `/en/frost/`（**均保留自身 locale 前缀**）。
- 根路径 `/` → `/zh-cn/frost/`（进入**默认语言**，不按浏览器语言改写 URL，无 Cookie 检测）。
- 旧路径兼容：`/editorial/` → `/zh-cn/editorial/`、`/designs/` → `/zh-cn/designs/`、`/terminal/` → `/zh-cn/terminal/`（meta refresh + canonical + noindex）。**真正的 HTTP 301 未实现**——静态托管下由平台配置决定，属明确声明的降级（SPEC §7.3）。
- `manualSwitch: false` + `mode: fixed`：切换页与旧 `/designs/` **均不构建**（37 页）；菜单内**主题切换项不渲染**（`data-cm-action="random"` / `switch"` 计数 0），**但菜单与语言分组照常渲染**（`cm-lang` 仍 3 项）——语言切换不受 `manualSwitch` 影响；测后已恢复示例配置。
- 无 JS：正文可读、语言链接在基础设施页仍可导航；**语言项是普通 `<a>`，无 JS 时菜单 DOM 仍存在**（样式内联），但菜单交互依赖运行时。
- Reveal 四情形（`/ja/kern/`）：normal 隐藏 0 / 门控 `true`；reduced-motion、无 `IntersectionObserver`、IO 抛错三种情形隐藏元素均为 **0** 且门控不写入。
- `BASE_PATH=/demo`：内部链接 / CSS / canonical / hreflang **全部带 `/demo`**，全站无遗漏；`/demo/zh-cn/` 仍正确解析为 `zh-CN`（部署 base 未被误判为语言代码）；右键菜单随机目标同样带 base 与 locale。
  **环境坑**：Git Bash 下必须 `MSYS2_ARG_CONV_EXCL='*'` **与** `--base /demo` 同时使用；只给 `BASE_PATH=/demo` 或只给 `--base /demo` 都会被 MSYS 转换成 `/D:/Git/demo`。

**文案纪律**：翻译只处理**已有**文案，不新增解释性 / 自我描述的句子（`AGENTS.md` 强制条款）。据此已删除 fast / frost / govuk / kern / material3 页脚的无意义直译「由同一份资料生成」——24 页页脚实测：fast / frost / kern 仅姓名；govuk 姓名 + OGL 许可声明；material3 姓名 + M3 来源署名；editorial / oxide / terminal 各保留其原有文案不变。

**共享文案本地化覆盖**：右键菜单静态标签（含新增的**语言分组标题**）+ `lib/context-menu.ts` 6 处运行时 Toast、切换页（标题/说明/计数句/当前标记）、入口页（含 noscript 文案）、404、语言选择器 `aria-label`——全部随语言切换。原 `InfraStyles.astro` 中由 CSS `content: ' · 当前 / current'` 生成的「当前」标记已改为切换页模板里的**真实元素**（可本地化、可被读屏读取），运行时按存储显隐。

## 资产 provenance

- `src/assets/brand/github.svg`：来源 simple-icons（CC0-1.0，canonical 仓库 `github.com/simple-icons/simple-icons`，经 jsDelivr 镜像获取，2026-10-10）；商标核对结论：GitHub Logos and Usage Policy 允许个人账户链接用途。
- Bluesky 专项商标政策未查证到——不使用；其余平台按需增补并**逐品牌核对规范**。
- 图标库：`@lucide/astro`（ISC，构建期内联、零客户端 JS）。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎、横屏、200% 缩放未实测；降级 / 触控基于 Chromium 仿真。
- `navigator.share` 缺失路径以 stub 验证（未在真实 Firefox 桌面实测）；macOS 原生分享面板呈现未实测；Linux 桌面未实测。
- 桌面端无 JS 用户没有页内切换入口（可直达 `/<locale>/designs/`）——ADR 0004 明确取舍。
- **旧路径未实现真正的 HTTP 301**：静态托管限制，当前为 meta refresh + canonical + noindex 的降级方案（SPEC §7.3）。
- **未做真实搜索引擎验证**：hreflang / canonical 的正确性仅经产物断言与浏览器实测，未经 Google / Bing 实际抓取验证。
- **语言自动检测为项目决策且未实现**：不按浏览器语言改写 URL、不使用 Cookie 语言检测。
- 样例资料为**虚构角色**，三语内容为示例翻译，未经专业译者校对；日文排版仅验证无溢出，未做日文 typographic 精修。
- **语言切换仅桌面可达（项目取舍）**：右键菜单受 `(hover: hover) and (pointer: fine)` 门控，触屏设备不加载菜单运行时 → **移动端没有语言切换入口**。2026-10-12 由项目所有者裁定接受此代价以消除 8 套设计的重复排版成本。基础设施页（切换页 / 404）不受影响（保留可见切换器）。