# 根入口语言协商与零窗口随机

- 状态：Accepted（2026-11-22）
- 相关：`SPEC.md` §7.1–§7.3、§7.5；`README.md`；`docs/rules/data-and-i18n.md`；`docs/rules/action-menu.md`；`CONTEXT.md`「Entry locale negotiation / Locale preference / Entry random / Stable design URL / Zero-window random」；`.trellis/tasks/11-22-entry-locale-random/`

## 背景

根入口 `/` 原先固定进入 `i18n.defaultLocale`，`SPEC.md` §7.3 明确不按浏览器语言改写 URL。与此同时，随机模式使用 24 小时窗口：同一浏览器 24 小时内从入口进入会落回同一套设计。用户如果把 `/ja/fax/` 存为书签，之后永远不会经过入口，随机模式自然失效；设计页又必须保持稳定，不能让刷新、分享链接或书签到不同设计。

## 决策

1. `/` 在运行时按 **手动语言偏好 → `navigator.languages` → 默认 Locale** 选择语言；Locale 偏好只由用户在共享菜单中显式点击语言链接时写入，直接访问 `/<locale>/...` 不覆盖偏好。
2. 语言协商只在 `/` 发生。`/<locale>/` 与 `/<locale>/<design>/` 的路径语言优先，不做运行时改写。
3. 随机只发生在入口：`/` 与 `/<locale>/` 选设计；设计页是稳定设计地址，直达、刷新、书签与分享都渲染同一设计。
4. 当前部署使用零窗口随机：`cacheHours: 0`，每次入口重抽，`avoidImmediateRepeat` 仍生效；手动选择设计只保证本次导航，不粘住下一次入口。
5. 无 JS 根入口维持现状（Q6 = B）：meta refresh 到默认 Locale 默认设计 + 默认 Locale 设计列表，不新增语言链接。
6. 入口跳转仍用 `location.replace`，不把 `/` 放入浏览器历史。

语言匹配按 `navigator.languages` 顺序逐项进行，采用最长标签优先：`zh-Hant` / `zh-TW` / `zh-HK` / `zh-MO` → `zh-TW`；`zh-Hans` / `zh-CN` / `zh-SG` / 裸 `zh` → `zh-CN`；`ja*` / `en*` / `ko*` 分别归对应 Locale；都不匹配回退默认 Locale。

## 结果

- 根入口对多数用户直接进入可读语言；手动选择语言后不会被浏览器语言反复覆盖。
- 入口书签（`/` 或 `/<locale>/`）每次访问换一套设计；设计页书签和分享链接保持稳定。
- 设计存储键与值格式不变，主题偏好继续跨语言共享；语言偏好使用独立、按 base 命名空间化的存储键。`site.storageKey` 只覆盖设计存储键，语言偏好键始终按 base 派生，避免两种数据碰撞。
- `html-only` 页面没有运行时，语言点击只完成当次导航，不持久化语言偏好；这是零脚本硬门禁的已知代价。
- SEO 策略不变：根入口与 Locale 入口 `noindex`，只有各语言默认设计可索引；协商在客户端完成，静态 HTML 相同，不需要 `Vary` 或 Cookie。

## 替代方案

- **保持 `/` 固定默认语言**：实现最简，但日语 / 英语 / 繁中用户每次都要手动切换；与本次目标冲突。拒绝。
- **服务端 / CDN 读取 `Accept-Language` 后 301**：需要托管平台能力，破坏“纯静态、根入口零外部请求”的部署边界。拒绝。
- **设计页刷新时重随机**：同一 URL 的内容取决于“点开还是刷新”，破坏分享、书签、canonical 与刷新修复页面的直觉；无 JS 也不可用。拒绝。
- **保留 24 小时粘性随机**：入口体验稳定，但用户书签设计页后随机完全不生效；与“每次进站换一套”的目标冲突。拒绝作为当前部署默认，配置仍可手动改回。
- **任何 Locale 页面加载都写入语言偏好**：别人分享的 `/en/fax/` 会覆盖收件人的入口偏好。拒绝；只在显式语言链接激活时写入。
- **在无 JS 根入口增加语言链接**：会增加默认 Locale 页面的信息量，但本次选择维持现状（Q6 = B）。拒绝。

## 回滚

恢复 `index.astro` 固定默认 Locale、删除 `localeNegotiation` 分支；恢复 `cacheHours: 24`；删除语言偏好写入与 `.cm-lang` 数据属性。设计存储格式、设计页稳定契约与 SEO 策略不受影响。若回滚，本 ADR 标记为 superseded，不删除历史。
