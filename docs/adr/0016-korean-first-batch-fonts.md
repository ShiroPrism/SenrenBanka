# 韩语首版字体：LXGW Hangul + 系统韩文字体，Noto KR 延后

韩语 locale 首版不部署 Noto Sans/Serif KR。Editorial 的韩文使用已部署的核心 LXGW WenKai 内容子集；Frost、Fast、GOV.UK 与 HTML-only 走系统韩文字体回退。`fontProfile: korean` 仍显式记录韩文文字系统需求，Noto KR 作为后续替换目标。

## 背景

- 韩语是首个新增 locale，首批覆盖默认 `editorial` + `frost` + `fast` + `govuk` + `html-only` 五套设计。
- 试装 `@fontsource-variable/noto-sans-kr` 与 `noto-serif-kr` 后，Fontsource 把韩文按 **120 个 unicode-range 分片**发布；`fonts:prune` 对五套韩语页面仍保留 **134 个字体文件 / 6.26 MB**，`dist` 达到 **9,934,238 B（9.47 MiB）**。虽低于 10 MiB 硬门禁，但远高于四语 ≤6.0 MB 的预算。
- 外部字体仓库 `whitehair-failure/SenrenBanka-fonts` 尚未发布 Noto KR 的 core source archive；现有 `fonts:subset` 只对 3 套核心本地字体做内容子集，无法对 Fontsource 分片做字形级裁剪。
- LXGW WenKai 的源字体实测覆盖 **11,172** 个谚文音节，且已是核心文字系统字体、参与内容子集。

## 决策与依据

- **首版不引入 Noto KR 依赖**；移除试装的 Fontsource 包与两个 npm provider。
- `editorial`：字体栈为 `Fraunces → LXGW → 系统 CJK`；韩文命中 LXGW，拉丁命中 Fraunces。LXGW 子集因新韩文语料从 249,972 B 增至 **275,920 B**（+25,948 B）。
- `frost`：字体栈保留 Inter，随后回退 `system-ui` 与系统韩文字体（`Apple SD Gothic Neo` / `Malgun Gothic` / `Noto Sans KR`）；不新增部署字体文件。
- `fast` / `govuk` / `html-only`：原本使用系统字体或浏览器默认，无需字体变更。
- `site.config.yaml` 的 `ko` 继续声明 `fontProfile: korean`，记录文字系统需求，不表示当前已部署 Noto KR。
- 四语构建实测：`dist` **5,147,850 B（4.91 MiB）**、**124 页**、字体 **34 文件 / 1,571,636 B**、核心子集 **660,052 B**；`fonts:audit` 348 条规则 / 0 孤儿 / 0 悬空；`verify:html-only` 4 个页面通过。

## 考虑过的替代方案

| 方案 | 否决理由 |
|---|---|
| 继续使用 Fontsource Noto KR 两族 | 韩文分片使 dist 达 9.93 MB，接近 10 MiB 门禁，违背四语 ≤6.0 MB 预算。 |
| 只保留 Noto Sans KR 一族 | 估计仍增加约 2–3 MB，无法达到 6.0 MB 预算；且衬线设计与 Noto Sans 风格不匹配。 |
| 把 Noto KR 作为本地核心字体 + 内容子集 | 需要外部字体仓库发布 core source archive 并更新 catalog/lock；当前无发布权限与流程，不能在本任务内完成。 |
| 不做韩语 | 用户明确要求韩语必加；拒绝。 |

## 后果

- **正向**：韩语首次上线体积仅增加约 **0.21 MB**（相对四语前的 4.94 MB），10 MiB 门禁与 6.0 MB 预算均满足；不新增字体仓库依赖。
- **代价**：Editorial 的韩文呈 LXGW Kai 风格；Frost 等使用系统韩文字体，跨平台字形不一致；Noto KR 的字重/字形多样性暂时缺失。
- **后续**：当外部字体仓库发布 Noto Sans/Serif KR core source 包后，用 `fonts:update` → `fonts:prepare` → `fonts:subset` 接入内容子集，再把 `editorial` / `frost` 的韩文角色切到 Noto KR；需重跑字体审计与体积预算。
- **验证归属**：`docs/verification/shared.md` 记录韩语构建与页面实测；`docs/verification/action-menu.md` 记录 4 个语言项的桌面/移动验证。

## 回滚

移除 `ko` locale 条目、`src/data/profiles/ko.yaml`、五套设计的 `ko` 覆盖与文案、`descriptions.ts` 的 `ko` 描述，并恢复 `fontProfile` 字段即可。字体文件无新增部署，回滚不涉及字体缓存。
