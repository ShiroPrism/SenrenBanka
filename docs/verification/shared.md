# verification — 共享机制与基础设施（shared）

> 本文件维护**共享机制**（不属于任何单一设计）的当前完整验证状态：根路由页、`/designs/` 切换页、404、桌面右键菜单（ContextMenu）、滚动显现机制（Reveal）、字体与 base 处理、行为矩阵、资产 provenance。
> 重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）；各设计自身的状态见 `docs/verification/<id>.md`。
> 验证步骤与通过标准见 `design-page-verify` skill；记录归属见 `docs/README.md`。
> 最近全流程验证：2026-10-10（v0.4.0）＋ v0.5.0 / v0.5.1（菜单）；2026-10-11 文档治理迁移，无代码改动。

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

## 资产 provenance

- `src/assets/brand/github.svg`：来源 simple-icons（CC0-1.0，canonical 仓库 `github.com/simple-icons/simple-icons`，经 jsDelivr 镜像获取，2026-10-10）；商标核对结论：GitHub Logos and Usage Policy 允许个人账户链接用途。
- Bluesky 专项商标政策未查证到——不使用；其余平台按需增补并**逐品牌核对规范**。
- 图标库：`@lucide/astro`（ISC，构建期内联、零客户端 JS）。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎、横屏、200% 缩放未实测；降级 / 触控基于 Chromium 仿真。
- `navigator.share` 缺失路径以 stub 验证（未在真实 Firefox 桌面实测）；macOS 原生分享面板呈现未实测；Linux 桌面未实测。
- 桌面端无 JS 用户没有页内切换入口（可直达 `/designs/`）——ADR 0004 明确取舍。