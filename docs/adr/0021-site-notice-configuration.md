# 站点级示例声明：notice 从设计文案迁到 site.config

- 状态：Accepted（2026-11-02）
- 相关：`CONTEXT.md`「Site notice」；`SPEC.md` §5.4 / §6.4；`docs/rules/data-and-i18n.md`；`docs/verification/shared.md`
- 证据：`.trellis/tasks/11-02-site-notice-consolidation/`

## 背景

- 17 套设计在页脚渲染固定示例声明：16 套用设计 `messages.ts` 的 `sampleNote`（`receipt` 通过私有 `Ticket.astro` 渲染），`ink` 用 `footerNote`。
- 这些文案写在设计层，fork 用户替换 `src/data/profiles/*.yaml` 后仍会继承；要去掉必须逐套改 17 个设计 × 5 种语言。
- 声明不是人物资料，而是“当前站点使用的是示例数据”的部署级提示；`profileSchema` 是固定契约，不应为显示声明新增自由文本字段。
- `site.config.yaml` 本来就是 fork 必改文件：`i18n.locales[].title` / `description` 不换，站点标题与 SEO 仍会显示示例人物；语言清单也只在这里维护。

## 决策

1. `src/data/site.config.yaml` 的 `i18n.locales[]` 增加可选 `notice`；`localeSchema` 校验为单行、非空、去除首尾空白；`LocaleEntry` 暴露 `notice?: string`。
2. 17 套设计改为条件渲染 `view.locale.notice`（`receipt` 通过 `locale` prop 读取）；缺省时不输出声明元素、分隔符或空行。
3. 示例站五个 locale 配置本地化声明：`示例资料・仅作演示` / `示例資料・僅作演示` / `サンプル・デモ用` / `Sample profile — demo only` / `샘플 자료 · 데모용`。
4. 删除设计层的 `sampleNote`（16 套）与 `ink.footerNote`；不保留设计级 fallback，避免 fork 删除站点声明后仍看到旧文案。
5. `govuk` 的 `licenceNotice`（OGL 法律署名）与 `homepage99` 的 `footerNote`（外链提示）不属于示例声明，保持不动。
6. fork 文档明确：必须修改 `site.config.yaml` 的 `title` / `description` / `locales` / `notice`；语言清单只在 `site.config.yaml` 维护。

## 结果

- 示例声明变成单一来源；同一语言下 17 套设计使用同一句用户可控文案，设计只保留自己的页脚位置与样式。
- fork 用户删除 `notice` 键即可移除声明；只替换 profile 不再足以完成 fork 配置，README 与规则已明确这一点。
- profile 契约不变；声明不进入人物资料模型。
- 代价：放弃“示例小票 / 示例词条 / 示例磁带”等设计级措辞；示例站保留统一声明，真实资料站点默认不显示。

## 替代方案

- **`profile.notice` 自由文本字段**：fork 替换 profile 会自动移除，但把部署级声明混入固定资料契约，拒绝。
- **`profile.sample` 布尔**：保留设计文案与风味，但不能自定义文案；项目所有者选择站点配置与可配置文案，拒绝。
- **保留各设计文案 + 全站开关**：fork 仍继承设计内文案，且无法替换为自有声明，拒绝。
- **逐套覆盖设计 messages**：fork 成本 17 × 5，拒绝。

## 风险与回滚

- 移除声明元素后，个别页脚的 flex / 间距可能留下空位；实现必须逐套检查无 notice 构建，尤其 `tape` 的内联分隔符与 `fairy-kei` 的双 span 结构。
- 回滚：移除 `notice` schema / 字段与条件渲染，恢复 17 套 messages 的声明键；`notice` 字段是增量 schema，不影响已有 profile。
