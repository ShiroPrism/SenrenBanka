# 执行计划：入口语言协商与零窗口随机

## 0. 前置

- [ ] `python ./.trellis/scripts/task.py current` 指向 `11-22-entry-locale-random`。
- [ ] 读 `AGENTS.md`、`docs/rules/{data-and-i18n,action-menu,operations,pitfalls,accessibility-responsive}.md`、`docs/adr/0006-multilingual-static-routing.md`、`docs/adr/0007-action-menu-site-wide-with-touch-launcher.md`。
- [ ] 确认工作区干净；记录当前 `dist` 基线（页数、字节数、字体文件数）。
- [ ] 不修改 `src/designs/**` 的视觉与样式；本任务只改根入口、共享菜单语言激活与配置/文档。

## 1. 语言匹配纯函数

- [ ] 新增 `src/lib/locale-match.ts`：
  - `normalizeLanguageTag`；`localeMatchTags`；`matchLocaleTag`；`matchBrowserLanguages`。
  - 五个当前 Locale 的显式标签表；`zh` 只归 `zh-CN`，`zh-Hant/HK/MO` 归 `zh-TW`。
  - 最长标签优先；未知非中文 Locale 可回退主语言子标签。
  - 不 import Astro / CSS / `site.ts`。
- [ ] 新增 `scripts/locale-match.test.mjs`，通过 `node --experimental-strip-types` 加载 TS 模块。
- [ ] `package.json` 增加 `test:locale`，并接入 `test`。
- [ ] 跑 `npm run test:locale`，覆盖 `zh-TW`、`zh-HK`、`zh-Hans`、裸 `zh`、`ja-JP`、`en-US`、`ko-KR`、`fr-FR`、顺序回退，以及 `localeStorageKeyFor` 的 base 命名空间。

## 2. 根路由与存储

- [ ] 扩展 `src/lib/router-script.ts`：
  - `LocaleRouterEntry` / `LocaleNegotiationConfig` 类型；
  - `RouterRuntimeConfig.enabled` 改为可选，新增 `localeNegotiation`；
  - `localeStorageKeyFor(base)`；不接受 `site.storageKey` 覆盖值，避免与设计键碰撞；
  - 生成脚本支持“固定 Locale 入口”与“根入口协商”两条分支；
  - Locale 偏好读取、非法值清除、`navigator.languages` / `navigator.language` 回退；
  - 选中 Locale 的 `enabled` 池；空池回退默认 Locale；
  - 保持设计存储格式与 `location.replace` 一跳。
- [ ] `src/lib/site.ts`：
  - `SiteModel` 增加 `localeStorageKey`；
  - `loadSite()` 用 `localeStorageKeyFor(BASE)` 派生；语言偏好不复用设计键，也不读取 `site.storageKey` 覆盖值。
- [ ] `src/pages/index.astro`：
  - 保留默认 Locale 用于 `<noscript>` 回退；
  - 为全部 `model.locales` 生成 `{ path, code, matchTags, enabled }`；
  - 传 `localeNegotiation`，不再只传默认 Locale 的 `enabled`。
- [ ] `src/infra/LocaleIndex.astro` 保持固定 Locale 分支；只调整类型兼容，不引入协商。
- [ ] 确认根脚本产物含所有 Locale 设计池；`safeJson` 仍转义 `<`。

## 3. 语言偏好写入

- [ ] `src/lib/site.ts`：
  - `ContextMenuRuntimeConfig` / `ActionMenuConfig` 增加 `localeStorageKey`；
  - 菜单语言项与 `LanguageSwitcherData.items` 增加 `path`；
  - `actionMenuLanguageItems`、`languageItems`、`languageSwitcherData` 填充 `path`；
  - `buildActionMenuConfig` 注入 `localeStorageKey`。
- [ ] `src/components/ContextMenu.astro`：桌面与移动语言链接加 `data-cm-locale={item.path}`；不改布局与动作清单。
- [ ] `src/components/LanguageSwitcher.astro`：语言链接加 `data-locale={item.path}`（仅数据属性，不加脚本）。
- [ ] `src/lib/context-menu.ts`：
  - `.cm-lang` 主点击写入语言偏好后照常关闭菜单并导航；
  - `auxclick`（button 1）也写入；
  - 写入失败静默降级，不阻断导航；
  - 不改随机 / 复制 / 分享 / 键盘逻辑。

## 4. 配置

- [ ] `src/data/site.config.yaml`：`design.random.cacheHours: 24 → 0`，注释说明“每次入口重抽，设计页直达不随机”。
- [ ] 不修改 `content.config.ts` schema；`cacheHours >= 0` 已允许 0。
- [ ] 不修改设计存储键 / 值格式。

## 5. 文档与决策

- [ ] `SPEC.md`：
  - §7.1 增加语言偏好存储键与值，并写明 `site.storageKey` 只覆盖设计存储键，语言偏好键始终按 base 派生；
  - §7.2 状态表补充“入口 Locale 协商”和“零窗口随机”；
  - §7.3 路由表把 `/` 改为“协商后的 Locale”；删除“完全不按浏览器语言判断”的旧表述；写明仅 `/` 协商、Locale 路径优先、无 JS 回退；
  - §7.5 写明显式语言链接写入偏好、直接 URL 不写、`html-only` 不持久化；
  - 检查 §5.5 与配置示例是否需要同步。
- [ ] `README.md`：
  - 随机模式改为“入口随机 + 每次重抽”；
  - 根路径说明改为协商 Locale；
  - 删除“不按浏览器语言自动改写 URL”的旧句；
  - 明确设计页稳定、书签 `/` 或 `/<locale>/` 才随机。
- [ ] `docs/rules/data-and-i18n.md`：语言识别只在设计页 / Locale 入口认路径首段；根入口例外做协商；语言偏好写入时机与 `html-only` 限制。
- [ ] `docs/rules/action-menu.md`：语言项激活可写入语言偏好；直接访问 Locale URL 不写。
- [ ] `docs/rules/operations.md`：验证清单加入根入口协商与零窗口随机；`design-page-verify` skill 指向。
- [ ] 新增 `docs/adr/0024-entry-locale-negotiation-and-zero-window-random.md`：
  - 背景、决策、后果、替代方案；
  - 明确设计页稳定与书签语义；
  - 明确无 JS 根入口不新增语言链接；
  - 状态 `Accepted`（评审后）。
- [ ] `CONTEXT.md` 增加术语：Entry locale negotiation、Locale preference、Entry random、Stable design URL、Zero-window random。
- [ ] `.agents/skills/design-page-verify/SKILL.md` 增加入口验证步骤：
  - 浏览器语言矩阵；
  - 语言偏好优先与非法值回退；
  - 连续入口重抽；
  - 设计页刷新稳定；
  - 无 JS 根入口现状；
  - `--base /demo` 存储键与目标前缀。
- [ ] 更新 `docs/verification/shared.md`，并新增 `docs/verification/entry-locale-random.md` 记录完整证据。
- [ ] 版本升到 `0.22.0`，新增 `change-log/0.22.0.md`。

## 6. 验证

### 6.1 静态与构建

- [ ] `npm run format`
- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run verify:html-only`
- [ ] `npm run verify:sections`
- [ ] `npm run fonts:audit`（若未包含在 build 中则单独跑）

### 6.2 浏览器矩阵

用 `npm run dev` 或 `npm run build && npm run preview`：

- [ ] 清空 `senrenbanka.locale.v1:root`，设置 `navigator.languages`：
  - `['en-US']` → `/en/<design>/`
  - `['ja-JP']` → `/ja/<design>/`
  - `['zh-TW']` → `/zh-tw/<design>/`
  - `['zh-HK']` → `/zh-tw/<design>/`
  - `['zh-Hans-CN']` → `/zh-cn/<design>/`
  - `['fr-FR']` → `/zh-cn/<design>/`
- [ ] 写入偏好 `ja`，浏览器 `en-US` → `/ja/<design>/`。
- [ ] 写入非法偏好 `xx` → 清除并回退；控制台 0。
- [ ] 共享菜单点击 English → 存储 `en`；再访问 `/` → `/en/<design>/`。
- [ ] 直接访问 `/en/fax/` → 不改变已存偏好；刷新仍是 fax；设计存储不变。
- [ ] 连续两次访问 `/` → 27 套池中不同设计（`avoidRepeat`）。
- [ ] 临时 `mode: fixed` → 协商 Locale + 默认设计；恢复 `random`。
- [ ] 临时 `manualSwitch: false` → 协商 Locale + 默认设计，切换页 404；恢复。
- [ ] 禁用 JS：`/` 的 meta refresh → `/zh-cn/editorial/`，设计列表存在，语言链接不存在。
- [ ] `html-only` 页面点击语言链接 → 当次导航；回 `/` 不复用该选择（记录为已知限制）。
- [ ] `BASE_PATH=/demo` 构建：根脚本目标 `/demo/<locale>/<design>/`；语言存储键 `senrenbanka.locale.v1:demo`。

### 6.3 产物与 SEO

- [ ] `/` 仍零外部请求；脚本内只有一次 `location.replace`。
- [ ] `/` 与各 Locale 入口 `robots=noindex, follow`。
- [ ] 默认设计页 `index, follow` + self-canonical + hreflang；非默认设计 `noindex, follow` + self-canonical。
- [ ] 根入口、Locale 入口、404、切换页不链接任何设计 CSS。
- [ ] `html-only` 最终 HTML 无新增 `<script>` / `style` / 事件处理器。
- [ ] 根入口与设计页 console 0；无新增第三方请求。

### 6.4 截图与记录

- [ ] 桌面 1440 与 375×812 根入口（跳转前 / 跳转后）截图归档到 `.cache/verification/entry-locale-random-*.png`。
- [ ] 把实测 URL、`navigator.languages`、存储值、跳转结果、构建页数 / 字节数写入 `docs/verification/entry-locale-random.md`。
- [ ] 更新 `docs/verification/shared.md` 的当前基线与“语言自动检测”旧结论。

## 7. 审查门与提交边界

- [ ] 评审门 A：代码与文档完成后，提交 diff 摘要、行为矩阵结果、构建与测试结果给用户；确认后再提交。
- [ ] 只提交本任务相关文件；不提交 `dist/`、`.cache/verification/*.png`、字体缓存。
- [ ] `git status` 确认没有设计 CSS / `src/designs/**` 改动。
- [ ] 提交信息建议：`feat(routing): negotiate locale at entry and reroll on each visit`。

## 8. 回滚

- [ ] 恢复 `index.astro` 固定默认 Locale，删除 `localeNegotiation` 分支。
- [ ] 恢复 `cacheHours: 24`。
- [ ] 删除语言偏好写入与 `.cm-lang` 数据属性；保留设计存储格式。
- [ ] 文档 / ADR 标记为 superseded，不删除历史。
