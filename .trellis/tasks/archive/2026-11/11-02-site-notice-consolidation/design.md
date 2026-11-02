# 设计：站点级示例声明与 fork 配置约束

## 边界与数据流

- `src/data/site.config.yaml` 是语言清单与每语言站点元数据的唯一来源；新增可选 `i18n.locales[].notice`（单行纯文本）。
- `src/content.config.ts` 的 `localeSchema` 校验 `notice?: string`；`src/lib/site.ts` 的 `LocaleEntry` 增加 `notice?: string`，`loadSite()` 已用 `{ ...locale }` 复制条目，无需额外映射。
- `buildDesignView()` 已返回 `locale: LocaleEntry`，设计页面直接读取 `view.locale.notice`。`loadDesignStrips()` 的语言条同样来自 `LocaleEntry`，不新增字段。
- 不在 profile schema 中新增字段：`CONTEXT.md` 的资料契约保持固定；声明属于部署/站点配置。

## Schema 与示例配置

```ts
// src/content.config.ts
notice: z.string().trim().min(1).optional(),
```

- `.trim()` 防止纯空白声明；空字符串在构建期失败。
- 示例 `src/data/site.config.yaml` 五个 locale 各加：
  - `zh-CN`: `示例资料・仅作演示`
  - `zh-TW`: `示例資料・僅作演示`
  - `ja`: `サンプル・デモ用`
  - `en`: `Sample profile — demo only`
  - `ko`: `샘플 자료 · 데모용`
- 注释明确：这是示例站声明，fork 填入真实资料后删除该键；`title` / `description` / `locales` 同样是 fork 必改项。

## 设计页渲染

17 套实际渲染声明的设计改为条件渲染；`view.locale.notice` 缺失时整个声明元素不输出，不留分隔符或空行。

| 设计 | 现状 | 改法 |
|---|---|---|
| aero | `<span>{t.sampleNote}</span>` | `{view.locale.notice && <span>{view.locale.notice}</span>}` |
| archive | `<p class="ar-sample">{t.sampleNote}</p>` | 条件渲染整个 `<p>` |
| brutal | `<span>{t.sampleNote}</span>` | 条件渲染 |
| cute-alism | `<p class="cal-footer-sample">{t.sampleNote}</p>` | 条件渲染 |
| deco | `<p class="deco-footer-note">{t.sampleNote}</p>` | 条件渲染 |
| fairy-kei | `<span>{t.sampleNote}</span>`（品牌 `<span>` 后） | 条件渲染 notice `<span>` |
| fax | `<p class="fx-sample">{t.sampleNote}</p>` | 条件渲染 |
| ink | `<span>{t.footerNote}</span>` | 条件渲染，读取 `view.locale.notice` |
| lexicon | `<p class="lx-sample">{t.sampleNote}</p>` | 条件渲染 |
| pager | `<p class="pg-end-note pg-line" style=…>{t.sampleNote}</p>` | 条件渲染整个 `<p>` |
| poster | `<p class="ps-sample">{t.sampleNote}</p>` | 条件渲染 |
| radio | `<p class="rd-sample">{t.sampleNote}</p>` | 条件渲染 |
| sticker-diary | `<p class="sd-sample">{t.sampleNote}</p>` | 条件渲染 |
| receipt | `Ticket.astro` 的 `<p class="rc-sample">{t.sampleNote}</p>` | 条件渲染整个 `<p>`，读取 `locale.notice` |
| tape | `SENRENBANKA · {t.cardTag} · {t.sampleNote}` | `SENRENBANKA · {t.cardTag}` 后按条件追加 ` · {notice}` |
| transit | `<span>{t.sampleNote}</span>` | 条件渲染 |
| zine | `<span>{t.sampleNote}</span>` | 条件渲染 |

`receipt` 通过私有 `Ticket.astro` 渲染声明，由 `locale` prop 读取 `locale.notice`。`homepage99.footerNote`（外链提示）与 `govuk.licenceNotice`（OGL 法律署名）保持不动。

## 文案清理

- 删除 16 套 `sampleNote` 的接口字段与五语言值（aero / archive / brutal / cute-alism / deco / fairy-kei / fax / lexicon / pager / poster / radio / receipt / sticker-diary / tape / transit / zine）。
- 删除 `ink.footerNote` 的示例声明字段与五语言值；`ink` 不再保留同名但含义不同的字段。
- `homepage99.footerNote` 保留。

## 文档与决策

- `CONTEXT.md` 增加 **Site notice（站点声明）**：`site.config.yaml` 的 `i18n.locales[].notice` 定义的单行纯文本声明，用于示例数据提示；缺省不渲染，不进入人物资料契约。
- 新增 `docs/adr/0021-site-notice-configuration.md`，记录从设计文案迁到站点配置的取舍、排除项与 fork 义务。
- `SPEC.md` §5.4 的 site 配置示例加入 `notice`；§6.4 的 `view.locale` 字段列表加入 `notice`。
- README 的 fork 必改列表加入 `notice`；`docs/rules/data-and-i18n.md` 的 `view.locale` 与 fork 配置义务同步。
- 更新受影响设计的 `DESIGN.md` 页脚描述（含 `receipt`：声明改为条件渲染，不是删除）。

## 取舍与替代方案

- **profile.notice（拒绝）**：会扩张固定资料契约，且 fork 替换 profile 虽能自动移除，但把站点显示声明混入人物资料。
- **profile.sample 布尔（拒绝）**：可保留设计风味，但不能自定义文案；用户已明确选择站点配置。
- **保留各设计 `sampleNote` + 全站开关（拒绝）**：fork 仍会继承设计内的示例文案，无法自定义。
- **共享一句站点文案（采用）**：放弃“示例小票 / 示例词条”等设计级措辞，换取单一来源、fork 可删除、17 套实际渲染行为一致。

## 风险与回滚

- 移除声明元素后，个别页脚的 flex/间距可能留下空位；逐套检查 16 个页脚的 no-notice 构建，尤其 `tape` 的内联分隔符与 `fairy-kei` 的双 span 结构。
- `receipt` 的声明在私有 `Ticket.astro` 中；改动必须同时覆盖组件，不能只改 `Page.astro`。
- 回滚：移除 `notice` schema/字段与条件渲染，恢复 17 套 messages 的声明键即可；schema 变更是增量的，不影响已有 profile。
