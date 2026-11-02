# Journal - makeinu (Part 1)

> AI development session journal
> Started: 2026-10-17

---



## Session 1: 旧设计字体审计与 0.15.0 自测收口
<!-- trellis-session: v=2 fp=51bc8bd140739f91 -->

**Date**: 2026-10-19
**Task**: 旧设计字体审计与 0.15.0 自测收口
**Branch**: `codex/legacy-font-research`

### Summary

完成九套旧设计字体审计与 Oxide 接线修复；补记 0.14.1 / 0.15.0 change log；验证 73 页构建、48 个设计页隔离、16 套切换页预览响应式与降级、25 个唯一 WOFF2 与 BASE_PATH；归档任务 10-19-legacy-font-research。

### Git Commits

| Hash | Message |
|------|---------|
| `1e96544` | 0.15.0：旧设计字体审计与系统默认字体替换 |
| `0ed9dcf` | docs：补记 0.14.1 切换页卡片几何修正 |

### Status

[OK] **Completed**


## Session 2: Homepage '99 与 HTML Only 双主题落地
<!-- trellis-session: v=2 fp=25db19f2a84baf3d -->

**Date**: 2026-10-29
**Task**: Homepage '99 与 HTML Only 双主题落地
**Branch**: `main`

### Summary

新增 Homepage '99 与零 CSS/JS 的 HTML Only 双主题；引入 renderMode 契约与最终 HTML 产物门禁，补齐自包含切换页预览，完成构建、浏览器、降级与归档。

### Main Changes

- 新增 homepage99：三区 Web 1.0 个人主页、系统字体、徽章轨与离线计数器
- 新增 html-only：语义 HTML、普通语言/设计导航、零正式页 CSS/JS
- 新增 renderMode 契约、HTML-only 产物验证器与 20 项回归测试
- 切换页达到 18 卡 / 18 预览，html-only 预览自包含
- 同步 AGENTS、SPEC、ADR、验证 skill、验证记录与 0.16.0 change-log

### Git Commits

| Hash | Message |
|------|---------|
| `6437655` | feat: 0.16.0 新增 Homepage '99 与 HTML Only 双主题 |

### Testing

- [OK] npm run build：81 页，0 errors / 0 warnings / 1 existing hint；HTML-only gate 20/20 + 3 pages
- [OK] Homepage99 桌面/375/320/日语/reduced-motion 与共享菜单实测通过
- [OK] HTML-only 桌面/375/320/无 JS/无 CSS/键盘导航通过，正式页 0 style/script/stylesheet
- [OK] impeccable detect 两套主题均为 []；BASE_PATH=/demo 与 manualSwitch:false 已验证

### Status

[OK] **Completed**

### Next Steps

- 实机验收后可按需继续微调；当前任务树已归档


## Session 3: AGENTS.md 索引化与 docs/rules 拆分
<!-- trellis-session: v=2 fp=e647de8e8b96b250 -->

**Date**: 2026-10-29
**Task**: AGENTS.md 索引化与 docs/rules 拆分
**Branch**: `codex/agents-doc-index`

### Summary

将根 AGENTS.md 从 26,568 字符收缩为 4,010 字符的规则入口；完整规则拆入 docs/rules 7 个主题文件；新增 ADR 0010、文档门禁与 8 项回归测试；迁移现行引用并保持历史记录不变；npm run check/build 全绿。

### Git Commits

| Hash | Message |
|------|---------|
| `6da9ca2` | docs: 将 AGENTS.md 改为规则入口并拆分 docs/rules |
| `4aaa331` | docs: 迁移现行规则引用到 docs/rules |
| `e1ed45a` | chore: 增加规则文档门禁与 0.16.1 版本记录 |

### Status

[OK] **Completed**


## Session 4: 六套可爱风独立设计与 0.17.0 发布
<!-- trellis-session: v=2 fp=70b75e609fb718d0 -->

**Date**: 2026-10-30
**Task**: 六套可爱风独立设计与 0.17.0 发布
**Branch**: `codex/cute-design-batch`

### Summary

完成六套独立 styled design、两族字体接入、设计专属 JS 边界和完整验证；父任务与六个子任务已归档。

### Main Changes

- 新增 fairy-kei、sticker-diary、pixel-pet-rpg、little-forest、cute-alism、magical-girl 六套三语设计
- 接入 Fredoka 与 LXGW WenKai GB，新增 ADR 0011 与设计专属 JS 规则
- 发布 0.17.0，更新共享验证、六份主题验证与变更日志

### Git Commits

| Hash | Message |
|------|---------|
| `e2e005b` | feat: add cute design typography and JavaScript infrastructure |
| `ba86e0c` | feat: add six cute profile designs |
| `455e644` | chore: release 0.17.0 with verification records |

### Testing

- [OK] npm run check：0 errors / 0 warnings / 1 个既有 lexicon hint
- [OK] npm run build：105 页，HTML-only 20/20
- [OK] Chromium 桌面 1440 / 375px 触控、无 JS、脚本失败、减动态、Reveal IO 降级与共享菜单全部通过
- [OK] impeccable detect：六套均 []；BASE_PATH=/demo：105 页前缀正确

### Status

[OK] **Completed**

### Next Steps

- 项目所有者在实际设备上逐套做最终视觉手感复核


## Session 5: Font shipping: shard pruning and core content subsets
<!-- trellis-session: v=2 fp=07fbca342dae0ca7 -->

**Date**: 2026-10-31
**Task**: Font shipping: shard pruning and core content subsets
**Branch**: `feat/font-content-subset`

### Summary

Implemented and verified build-time font shard pruning (dist 33.5 -> 13.85 MiB) and then core CJK content subsets (13.85 -> 5.76 MiB; core fonts 691,332 B; core shards 0). Added source-font cache, subset cmap audit, 10 MiB guard, ADR 0013/0014, and v0.20.0 docs. All checks, tests, build and representative browser verification passed; 375px/reduced-motion/no-JS/CDP limitations recorded in docs/verification/shared.md.

### Git Commits

| Hash | Message |
|------|---------|
| `eefdbc1` | feat(fonts): prune unused shards and externalize font CSS |
| `5f66e03` | feat(fonts): subset core CJK fonts to site content |

### Status

[OK] **Completed**


## Session 6: Design batch: brutal, ink, deco
<!-- trellis-session: v=2 fp=2987e224075aa896 -->

**Date**: 2026-10-31
**Task**: Design batch: brutal, ink, deco
**Branch**: `feat/font-content-subset`

### Summary

Implemented and verified three styled designs (brutal, ink, deco) with self-contained previews. Build 117 pages, tests 67/67, typography gate 26 styled / 17 core CJK, dist 6,544,535 B (6.24 MiB), both detectors clean, and the 1440/768/375 browser matrix, Reveal degradation paths and shared action menu passed.

### Git Commits

| Hash | Message |
|------|---------|
| `cf829ef` | feat(designs): add brutal, ink and deco themed designs |

### Status

[OK] **Completed**


## Session 7: Locale coverage, Korean first batch, and menu CSS externalization
<!-- trellis-session: v=2 fp=fad2ca80a5dedd95 -->

**Date**: 2026-11-01
**Task**: Locale coverage, Korean first batch, and menu CSS externalization
**Branch**: `feat/font-content-subset`

### Summary

Implemented design.json locale coverage and single-locale fork; added Korean locale/profile/copy for editorial, frost, fast, govuk, html-only with LXGW + system Korean fonts (Noto KR deferred, ADR 0016); externalized action-menu CSS to one shared file (ADR 0015); four-locale dist 5.15 MB / 124 pages, single-locale fork 3.14 MB / 59 pages; 67/67 tests, build/check/html-only/fonts audit pass, 90-URL desktop+mobile sweep clean; docs/ADR/verification updated. Korean copy pending human review.

### Git Commits

| Hash | Message |
|------|---------|
| `fe4bf37` | feat(i18n): add locale coverage, Korean, and menu CSS externalization |

### Status

[OK] **Completed**


## Session 8: 韩语全设计覆盖：字体发行与 27 套韩语页面
<!-- trellis-session: v=2 fp=fc94ee1b8a5b533a -->

**Date**: 2026-11-01
**Task**: 韩语全设计覆盖：字体发行与 27 套韩语页面
**Branch**: `feat/font-content-subset`

### Summary

catalog v1.1.0（6 个韩语核心族）发布并接入；26 套设计字体栈 + Hangul-only 子集 + 覆盖门禁；5 套既有与 22 套新增韩语文案/descriptions/<Font>；27 个 ko 页面构建与冒烟通过；文案经用户确认审校；C1/C2/C3/父任务归档。

### Main Changes

- 字体仓库：6 族 catalog v1.1.0 发布（外部仓库 commit bab1a4f）；既有 20 族 package/source 字节零漂移。
- 主站：26 套字体栈、Hangul-only 子集/unicode-range、fonts:coverage、5 套既有 ko + 22 套新增文案/descriptions/<Font>。
- 文案：用户确认已人工审校；terminal/oxide 双语为刻意不翻译项；archive 补 :lang(ko) 防合成斜体。

### Git Commits

| Hash | Message |
|------|---------|
| `2447de2` | feat: integrate Korean core fonts and coverage gates |
| `fa44b73` | feat: add Korean content for all designs |
| `e221eaa` | docs: record Korean copy review |

### Testing

- [OK] 字体仓库：npm test 61/61；catalog:validate 26；release:verify --compare-dir reproducible: true；6 族样张通过。
- [OK] 主站：npm test 74/74；npm run check 0 error；npm run build 146 页；dist 6,056,936 B；fonts:coverage 27；fonts:audit 0 部署缺口。
- [OK] 浏览器：22 个新 ko 页 375×812 / 1280×800 全部 200 / lang=ko / 韩语字体加载 / 无溢出 / 0 console；6 族抽样截图。

### Status

[OK] **Completed**

### Next Steps

- 完整 27 页 design-page-verify 矩阵（菜单/无 JS/对比度/动效）。
- 主站 feat/font-content-subset 的 push/PR；字体仓库 catalog v1.1.0 已发布。
- 未来字体升级：修 renameSfntFont 后评估 Pretendard/D2Coding；Black Han Sans 仍不建议。


## Session 9: 繁體中文 locale 全设计覆盖与字体发布
<!-- trellis-session: v=2 fp=1b9e69e7b16a1e5a -->

**Date**: 2026-11-01
**Task**: 繁體中文 locale 全设计覆盖与字体发布
**Branch**: `feat/traditional-chinese`

### Summary

新增 zh-TW 第 5 语言并覆盖 27 套设计；5 族 TC 字体、页面级字体路由、coverage/audit 门禁与 ADR 0018；字体仓库发布 catalog v1.2.0（31 族 / 1,582 variants，catalog SHA 430cb587dcb9cfa850fc25d16953e5092ac6c48c3865e4138722cd68b7039635，commit f282642），主站切回公开 URL；npm run check/test/build 全绿（79/79、175 页、dist 8,845,322 B、0 部署缺口）；繁中文案经用户审校。

### Git Commits

| Hash | Message |
|------|---------|
| `fe77a6a` | feat: add Traditional Chinese locale and design coverage |

### Status

[OK] **Completed**


## Session 10: 打包体积优化：字体语料按引用页 + 跳转页样式精简
<!-- trellis-session: v=2 fp=c480a19fd3a42b07 -->

**Date**: 2026-11-01
**Task**: 打包体积优化：字体语料按引用页 + 跳转页样式精简
**Branch**: `main`

### Summary

fonts:subset 改为按每个 core 族实际引用页收集语料（共享非 HTML 资产全量纳入），未引用族跳过；LegacyRedirect 改用专用最小样式。dist 8,855,728 -> 7,632,396 B（7.28 MiB），字体 14 族 1,625,116 B（8 非 Hangul 1,502,884），28 个跳转页 119,080 -> 45,076 B。npm run build/test（80/80）/fonts:audit（0 部署缺口、0 孤儿）通过；5 语言代表页与 html-only 浏览器实测通过。新增 ADR 0019 与两份验证记录。

### Git Commits

| Hash | Message |
|------|---------|
| `878b62d` | perf: reduce dist size with per-page font corpus and redirect style trim |

### Status

[OK] **Completed**


## Session 11: 代码规范与行尾：Prettier + ESLint + LF
<!-- trellis-session: v=2 fp=183f22fe82d45d83 -->

**Date**: 2026-11-01
**Task**: 代码规范与行尾：Prettier + ESLint + LF
**Branch**: `main`

### Summary

新增 Prettier / ESLint flat config / EditorConfig / .gitattributes LF 约束与 check:eol 门禁；ESLint 69→0，152 个源码与 CSS/配置格式化，docs Markdown 与生成物排除；npm test 84/84、npm run build 175 页、dist 7,632,396→7,634,316 B（+0.025%）；175 页可见文本一致，格式化前后 HEAD 构建在动效禁用条件下 12/12 像素差 0；新增 ADR 0020 与验证记录。

### Git Commits

| Hash | Message |
|------|---------|
| `3a625c3` | chore: add lint/format tooling and normalize LF |
| `0b53856` | style: format source with prettier |

### Status

[OK] **Completed**


## Session 12: 批次 4：Aero / Transit / Zine
<!-- trellis-session: v=2 fp=c99177f3954703aa -->

**Date**: 2026-11-02
**Task**: 批次 4：Aero / Transit / Zine
**Branch**: `main`

### Summary

Implemented aero (2000s techno-optimism), transit (wayfinding), and zine (Riso/photocopy punk) across five locales; refreshed SPEC matrix and README, added verification records; build 193 pages / 7.96 MiB, check green, tests 84/84, browser matrix and impeccable detector pass.

### Git Commits

| Hash | Message |
|------|---------|
| `f11a991` | feat(designs): add aero, transit, and zine themes |

### Status

[OK] **Completed**
