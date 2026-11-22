# 入口语言协商与零窗口随机

## Goal

让根入口 `/` 先按“用户手动语言偏好 → 浏览器语言 → 站点默认语言”选择 Locale，再按 random / fixed 模式选择设计并一跳进入 `/<locale>/<design>/`。同时把当前部署的随机模式改为**仅入口随机**：`cacheHours: 0`，每次从入口进入都重新抽取，但设计页、分享链接与书签地址保持稳定。

## Background

- 当前 `/` 固定进入 `i18n.defaultLocale`；`SPEC.md` §7.3 明确写着“不按浏览器语言自动改写 URL，也不做 Cookie 语言检测”。
- 当前 `cacheHours: 24`：同一浏览器 24 小时内从入口进入会落回同一套设计。用户如果把 `/ja/fax/` 存为书签，之后永远不会经过入口，随机模式自然失效。
- `cacheHours: 0` 已被根脚本、切换页与共享菜单原生支持：每次入口重抽，同时保留“上一次设计”用于 `avoidImmediateRepeat`。因此入口重随机不需要重写路由。
- 设计页是稳定内容页：`/ja/fax/` 的可分享、可书签、可被 canonical 识别，是既有契约；不能在刷新时劫持并重随机。
- 语言偏好需要与设计偏好分开存储；设计存储键继续跨语言共享，语言偏好只在用户显式切换语言时写入。

## Decisions

2026-11-22 项目所有者确认：

1. **随机只发生在入口**：`/` 与 `/<locale>/` 负责选设计；设计页刷新、直达与书签均保持原设计。
2. **当前部署使用零窗口随机**：`cacheHours: 0`；每次入口重抽，`avoidImmediateRepeat` 仍生效。
3. **根入口做语言协商**：手动语言偏好优先，其次 `navigator.languages`，最后默认 Locale。
4. **语言协商只在 `/` 发生**：`/<locale>/` 与 `/<locale>/<design>/` 的路径语言优先，不做运行时改写。
5. **语言偏好只在显式点击语言链接时写入**：直接访问 `/en/fax/` 或打开别人分享的英文链接，不覆盖收件人的入口偏好。
6. **`html-only` 的语言点击不持久化**：零脚本硬门禁不允许运行时写入；该限制必须写进文档。
7. **无 JS 根入口维持现状（Q6 = B）**：meta refresh 到默认语言默认设计 + 默认语言设计列表；不新增语言链接。
8. **入口跳转仍用 `location.replace`**：一跳完成，不把 `/` 留在浏览器历史，避免返回时反复跳转。
9. **设计页稳定契约不变**：书签 `/ja/fax/` 永远显示 fax；想书签随机就书签 `/ja/`。

### 语言匹配规则

按 `navigator.languages` 顺序逐项匹配，命中第一个可识别项：

- `zh-Hant` / `zh-TW` / `zh-HK` / `zh-MO` → `zh-TW`
- `zh-Hans` / `zh-CN` / `zh-SG` / 裸 `zh` → `zh-CN`
- `ja*` → `ja`
- `en*` → `en`
- `ko*` → `ko`
- 都不匹配 → `i18n.defaultLocale`

匹配采用“最长标签优先”，避免 `zh-TW` 被裸 `zh` 抢走。`navigator.languages` 缺失时回退 `navigator.language`；两者都不可用时回退默认语言。

## Requirements

### R1 — 根入口语言协商

- `/` 运行时先解析 Locale，再解析设计。
- 语言偏好读取失败、值非法或 Locale 已从配置移除时，忽略并清除该值，继续浏览器匹配。
- 选中 Locale 的设计池只包含覆盖该 Locale 的启用设计；若池为空（理论上被构建期契约阻止），回退默认 Locale。
- 最终只执行一次 `location.replace(base + localePath + '/' + designId + '/')`，不额外经过 `/<locale>/`。

### R2 — 语言偏好存储

- 新增独立语言偏好存储键，按部署 base 命名空间化；不得复用设计存储键，也不得把 locale 写进设计存储值。
- 值保存 Locale path（如 `en`），读取时按当前 `i18n.locales` 校验。
- 只在共享操作菜单的 `.cm-lang` 语言链接被显式激活时写入；桌面与移动两种容器共用同一逻辑。
- 直接访问 Locale 页面、设计页、切换页或 404 不写入语言偏好。
- `html-only` 页面没有共享菜单与运行时，语言点击只完成本次导航，不持久化。

### R3 — 零窗口随机

- 当前 `site.config.yaml` 的 `design.random.cacheHours` 改为 `0`。
- 每次从 `/` 或 `/<locale>/` 进入都重新抽取；`avoidImmediateRepeat: true` 时排除上一次设计。
- 切换页点击与菜单「随机一个设计」仍写入 `expiresAt: 0`；当前导航立即进入所选设计，但下一次入口重抽。
- 设计页直达、刷新、书签与分享链接不写设计存储，也不触发随机。
- `fixed` 模式行为不变：`manualSwitch: false` 永远默认设计；`manualSwitch: true` 有手选且在当前 Locale 可用时进入手选。

### R4 — 无 JS 与 SEO

- 无 JS 时 `/` 维持现状：meta refresh 到默认 Locale 的默认设计，并列出默认 Locale 的设计；不新增语言链接。
- `/` 与各 Locale 入口继续 `noindex, follow`；默认设计页 `index, follow` + self-canonical；其他设计页 `noindex, follow` + self-canonical；hreflang 策略不变。
- 语言协商是客户端行为，静态 HTML 对所有浏览器相同；不引入 `Vary: Accept-Language`、Cookie 或服务端重定向。

### R5 — 文档、决策与验证

- 更新 `SPEC.md` §7.1–§7.3、§7.5 与相关配置示例，删除“完全不按浏览器语言判断”的旧表述。
- 更新 `README.md` 的根路径、随机模式与语言切换说明；明确“设计页稳定，入口书签才随机”。
- 更新 `docs/rules/data-and-i18n.md`、`docs/rules/action-menu.md` 与 `docs/rules/operations.md` 中受影响的行为描述。
- 新增 ADR 记录根入口语言协商、零窗口随机与设计页稳定契约。
- 更新 `CONTEXT.md` 术语：入口语言协商、语言偏好、入口随机、稳定设计地址、零窗口随机。
- 更新 `.agents/skills/design-page-verify/SKILL.md` 的入口与随机验证步骤。
- 更新 `docs/verification/shared.md`，新增本任务的验证记录并归档截图。
- 版本升到 `0.22.0`，新增 `change-log/0.22.0.md`。

## Acceptance Criteria

- [ ] A1 无语言偏好时，`/` 按浏览器语言进入对应 Locale：`en-US → /en/`、`ja-JP → /ja/`、`zh-TW/zh-HK → /zh-tw/`、`zh-Hans/zh → /zh-cn/`、`fr-FR → /zh-cn/`。
- [ ] A2 已存储语言偏好 `ja` 时，即使浏览器语言是 `en-US`，`/` 仍进入 `/ja/<design>/`；非法偏好被忽略并回退。
- [ ] A3 在共享菜单点击语言链接后，下一次 `/` 尊重该偏好；直接访问 `/en/fax/` 不写偏好；`html-only` 的语言点击不持久化且已在文档声明。
- [ ] A4 连续两次从 `/` 进入，在随机池大于 1 时落到不同设计；`/ja/fax/` 直接刷新仍显示 fax，且不写设计存储。
- [ ] A5 `fixed` 模式与 `manualSwitch: false` 的既有行为不变；根入口仍先协商 Locale。
- [ ] A6 无 JS 时 `/` 的 `<noscript>` 仍只提供默认 Locale 默认设计与设计列表，没有新增语言链接。
- [ ] A7 根入口与 Locale 入口仍为 `noindex, follow`；设计页 canonical / robots / hreflang 无回归。
- [ ] A8 `npm run check`、`npm test`、`npm run build`、`npm run verify:html-only`、`npm run verify:sections` 通过；`design-page-verify` 完成；文档、ADR、CONTEXT、change-log 与版本号同步。

## Non-Goals

- 不做服务端 `Accept-Language` 解析、CDN / Worker 重定向或 Cookie 语言检测。
- 不在设计页刷新时重随机，也不劫持设计页 URL。
- 不保留 24 小时粘性随机作为当前部署默认；配置仍可手动改回。
- 不在无 JS 根入口新增语言链接。
- 不新增语言、不改设计 CSS、不改共享菜单布局、不改设计存储键或值格式。
- 不改变 SEO 索引策略与 hreflang 归属。

## Constraints

- 根入口必须保持零外部请求、内联脚本、一次跳转。
- 静态托管；所有协商在浏览器完成。
- `html-only` 最终 HTML 不得出现 `<script>` 或事件处理器。
- Locale 清单唯一来源仍是 `site.config.yaml` 的 `i18n.locales`；不得在代码中重复维护完整语言清单。
- 设计页样式隔离、共享菜单唯一入口、Reveal 降级等硬门禁不变。

## References

- `AGENTS.md` 硬门禁。
- `SPEC.md` §5.5、§7.1–§7.5。
- `docs/rules/data-and-i18n.md`、`docs/rules/action-menu.md`、`docs/rules/operations.md`、`docs/rules/pitfalls.md`。
- `docs/adr/0006-multilingual-static-routing.md`、`docs/adr/0007-action-menu-site-wide-with-touch-launcher.md`。
- `.agents/skills/design-page-verify/SKILL.md`。
