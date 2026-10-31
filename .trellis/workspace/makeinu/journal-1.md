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
