# 韩语 locale 与 Noto KR 字体接入

> 父任务：`11-01-locale-expansion`。本子任务接入首个新增语言，验证整套覆盖与字体机制。

## Goal

新增 `ko` locale：配置、资料、共享文案、首批 5–8 套设计文案与覆盖声明；外部字体仓库发布 Noto Sans KR / Noto Serif KR 核心文字系统包，按内容子集部署；四语构建通过，未覆盖设计不生成韩语页面。

## 背景

- 当前 3 locale（`zh-CN` / `ja` / `en`），27 套设计。
- 字体实测：核心 Zhuque / LXGW 有完整 Hangul（LXGW 11,172 个谚文音节）；Noto 族未接入。韩语内容子集粗估：LXGW 300–800 音节 26–43 KB；Noto KR 两族约 40–120 KB。
- 韩语首批只覆盖默认设计 + 5–8 套代表设计，避免一次性翻译 27 套。
- 文案必须人工审校；未审校机翻不得作为承诺文案。

## Requirements

### R1 locale 与资料

- `site.config.yaml` 增加 `ko`：code `ko`、path `ko`、label `한국어`、title/description 韩语；显式 `fontProfile: korean`。
- 新增 `src/data/profiles/ko.yaml`（资料字段契约与现有语言一致）。
- `src/i18n/messages.ts` 增加韩语共享文案（菜单、切换页、404、入口页、语言选择器 aria-label 等）。

### R2 设计覆盖与文案

- 首批名单建议（最终在 design.md 定稿）：`editorial`（默认，必须含 ko）、`frost`、`kern`、`oxide`、`material3`、`deco`、`magical-girl`、`little-forest`。
- 仅为首批设计的 `design.json.locales` 增加 `ko`；其余设计保持三语。
- 首批设计的 `messages.ts` 增加 `ko` 键；文案人工审校。
- 未覆盖设计不生成 `/<ko>/<design>/`；切换页不列出。

### R3 字体

- 在 `whitehair-failure/SenrenBanka-fonts` 发布 Noto Sans KR / Noto Serif KR：生产包、source archive、license、catalog 版本与校验和。
- `fonts.config.json` / `fonts.lock.json` 通过 `fonts:update` 更新；`src/fonts/generated.ts` 重新生成；`fonts:prepare` 下载源包。
- 首批设计的字体栈为韩语补上对应核心角色（无衬线/衬线），不改变原有拉丁/CJK 优先级；无法自然容纳韩语字体的设计不声明 ko。
- `fonts:subset` 按最终 dist 语料生成韩语内容子集；`fonts:prune` 裁剪；`fonts:audit` 校验 cmap 覆盖。
- 内容级缺字 → 警告 + 报告；字体角色缺失 → 构建失败。

### R4 SEO 与菜单

- `ko` 页面 `<html lang="ko">`、canonical、hreflang（默认设计互指）正确。
- 菜单语言项自动出现 `ko`；当前页 `aria-current`；切换目标按覆盖规则：覆盖保持设计，否则默认设计。
- `html-only` 设计若未覆盖 ko，其语言导航目标落到 ko 默认设计。

### R5 体积与验证

- 四语 dist ≤ 6.0 MB；10 MiB 门禁通过。
- 每个新增 ko 页面执行 `design-page-verify`（桌面、375px、动效、降级、可访问性、对比度、截图归档）。
- 无 JS 下 ko 页面内容可读、语言导航可达（html-only 原生链接；基础设施页 noscript）。

## Acceptance Criteria

- [ ] 四语构建成功；ko 页面数 = 覆盖设计数 + locale 入口 + 切换页。
- [ ] 未覆盖设计的 `/<ko>/<id>/` 无产物。
- [ ] 默认设计 `editorial` 含 ko；其余首批设计含 ko 文案。
- [ ] Noto Sans/Serif KR 生产包与源包可从 Release 复现；lock/sha 校验通过。
- [ ] 韩语内容子集部署；`fonts:audit` 通过；缺字报告为空或仅接受项。
- [ ] 四语 dist ≤ 6.0 MB；体积报告写入验证记录。
- [ ] `npm test`、`npm run check`、`npm run build`、`npm run verify:html-only`、`design-page-verify` 通过。
- [ ] 韩语文案有人工审校记录。

## Out of Scope

- 韩语以外的可选语言（西/葡/法/德/越）。
- 27 套设计全部韩语化。
- 运行时语言切换。
- 提高 10 MiB 门禁。

## Notes

- 依赖 C1（菜单 CSS 外置后的体积基线）与 C2（覆盖机制）。
- 复杂任务：实现前补 `design.md`（字体角色映射、首批设计字体栈、覆盖名单、子集/审计、回滚）与 `implement.md`。
- 外部字体仓库发布属于跨仓库操作，需先确认 Release 流程与许可证据。

## 实施记录（2026-10-31）

- 实际覆盖：`editorial`（默认）、`frost`、`fast`、`govuk`、`html-only` 五套；新增 `ko` locale、`src/data/profiles/ko.yaml`、共享文案韩语键、五套设计韩语文案与 `descriptions.ts` 韩语描述。
- 字体：试用 Fontsource Noto Sans/Serif KR 后，`fonts:prune` 保留 134 个字体文件 / 6.26 MB，`dist` 9.93 MB；按 **ADR 0016** 改为 editorial 核心 LXGW（子集 249,972 → 275,920 B）+ frost/fast/govuk/html-only 系统韩文回退；不部署 Noto KR。`fontProfile: korean` 保留，Noto KR 待外部字体仓库发布后替换。
- 构建：**124 页**、`dist` **5,147,850 B（4.91 MiB）**、字体 **34 文件 / 1,571,636 B**、核心子集 **660,052 B**、`fonts:audit` 348 规则 / 0 孤儿 / 0 悬空；`npm test` 67/67、`verify:html-only` 4 页。
- 页面：`/ko/` 7 页；`/ko/designs/` 仅列 5 套；`/ja/archive/` 的 ko 语言项回退 `/ko/editorial/`；`/ko/html-only/` 零资源、4 个语言链接；`/ko/editorial/` 与 `/ko/frost/` 浏览器实测通过（截图 `action-menu-ko-mobile.png`、`frost-ko.png`）。
- 韩语文案由 AI 起草，**待人工审校**；Noto KR 替换见 ADR 0016。
