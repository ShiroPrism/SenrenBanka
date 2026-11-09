# 共享标准分区标签：技术设计

## 1. 边界

本设计只处理“主分区标签”这一层：

- 输入：`loadDesignView()` 已解析出的 `profile` 与 `locale`，以及各设计现有的 `messages.ts` 文案。
- 输出：标准标签数据模块、h2 渲染约定、`data-section` 数据契约、构建后检查脚本、规则 / ADR。
- 不处理：资料字段、视觉语言、字体、共享操作菜单、路由与随机逻辑。

```
src/i18n/messages.ts      （Locale 类型 / 共享 chrome 文案）
        │  import type
        ▼
src/i18n/sections.ts      （标准分区词表：canonical + enLabel + aliases）
        │  import
        ▼
src/designs/<id>/Page.astro
   └─ <section data-section="projects">
        <h2>{sections.projects.label}</h2>
        <p class="kicker">{t.projects}</p>   ← 主题词，可选
      </section>

scripts/check-section-labels.mjs  ← 扫描 dist，读取 data-section + h2 文本
```

## 2. 数据模型

```ts
export type SectionKey =
  | 'profile'
  | 'projects'
  | 'experience'
  | 'skills'
  | 'contact'
  | 'links';

export interface SectionLabel {
  /** 当前 Locale 的 canonical 标签。 */
  label: string;
  /** 英文 canonical 标签；en 下与 label 相同。 */
  enLabel: string;
  /** 检查器接受的显式同义词；不得包含主题词。 */
  aliases: string[];
}

export const sectionLabels: Record<MessageLocaleCode, Record<SectionKey, SectionLabel>>;
```

模块约束：

- 纯数据，不 import CSS、`Page.astro`、`style.css`、`astro:assets`。
- 只 `import type { MessageLocaleCode } from './messages'`，避免运行时耦合。
- 新增 Locale 时由 TypeScript 的 `Record` 完整性检查强制补齐；与 `site.config.yaml` 的 Locale 集合对齐。

## 3. 词表（canonical + alias）

canonical 用于新设计与已修改设计的 h2；alias 只用于检查器接受既有同义标准词。alias 不包含主题词。

| SectionKey | zh-CN | zh-TW | ja | en | ko |
|---|---|---|---|---|---|
| profile | 简介 | 簡介 | プロフィール | Profile | 프로필 |
| projects | 项目 | 專案 | プロジェクト | Projects | 프로젝트 |
| experience | 经历 | 經歷 | 経歴 | Experience | 경력 |
| skills | 技能 | 技能 | スキル | Skills | 기술 |
| contact | 联系 | 聯絡 | 連絡先 | Contact | 연락처 |
| links | 链接 | 連結 | リンク | Links | 링크 |

alias 白名单（初版，S1 评审后冻结）：

| SectionKey | zh-CN | zh-TW | ja | en | ko |
|---|---|---|---|---|---|
| profile | 关于, 关于我, 个人资料 | 關於, 關於我, 個人資料 | 自己紹介, について | About | 소개 |
| projects | 作品, 精选项目, 精选作品 | 作品, 精選專案, 精選作品 | 作品 | Works, Selected Works | 작품 |
| experience | 履历, 工作经历 | 履歷, 工作經歷 | 職歴 | Work Experience | 이력, 경험 |
| skills | 能力, 专长 | 能力, 專長 | 技能, 能力 | Capabilities | 역량, 스킬 |
| contact | 联络, 联系方式 | 聯繫, 聯絡方式, 聯繫方式 | お問い合わせ, コンタクト | Get in Touch | 문의, 연락 |
| links | 社交链接 | 社群連結 | ソーシャルリンク | Social Links | 소셜 링크 |

明确拒绝的词（示例，非穷举）：窗口、桌面、系统时间线、功能、发送消息、剧目表、幕次、演出单、演职员表、售票处、盒底说明卡、玩具抽屉、丝带卷轴、贴纸册、卷帙、年表、笔触、落款、树轮、野花标本、林中小屋、做过的事、走过的地方、最后一页、站点、时刻表、线路徽章、跨页、贡献者注记、印章、邮购回执、订单、纪录、结账、明细、频道、节目、日志、企划、曲目、结算、备注、编目、索引、借阅、远方路标、随身物品、工具、IDENTITY、CHANNELS、CAPABILITIES、DEPLOYMENTS、OPERATIONS、Elsewhere。

`Selected Works` 作为 en / projects alias 接受；`Elsewhere` 不接受。

## 4. h2 渲染契约

- h2 文本允许的词元集合 = `{label, enLabel} ∪ aliases`。
- 允许分隔符：`/`、`|`、`·`、`-`、`—`、空白。词元大小写不敏感（仅 ASCII）；CJK 精确匹配。
- 双语标题示例：`Projects 项目`、`Profile 简介`；两个词元都必须在集合内。`en` Locale 下不要重复输出 `Projects Projects`；设计用 `locale.code === 'en' ? label : enLabel + ' ' + label` 控制。
- 主题词（如「窗口」「系统时间线」）只能出现在 h2 之外的 `<p>` / `<span>`，可前置为 kicker、后置为 subtitle，或纯装饰；是否可见由设计决定。
- profile hero 可以没有 h2；若保留独立简介分区，h2 使用 `profile` 标签。
- 每个分区保留 `aria-labelledby` 指向标准标签，或 `aria-label` 使用标准标签；不得让主题词成为唯一可访问名称。

示例（aero projects）：

```astro
<section class="aero-section" data-section="projects" aria-labelledby="ae-projects-title">
  <div class="aero-section-head">
    <p class="aero-kicker" aria-hidden="true">{t.projects}</p>
    <h2 id="ae-projects-title" class="aero-section-title">
      {sections.projects.label}
    </h2>
    <span class="aero-section-hint" aria-hidden="true">{pad(projects.length)}</span>
  </div>
  ...
</section>
```

## 5. `data-section` 契约

- 值域：`profile` / `projects` / `experience` / `skills` / `contact` / `links`。
- 放在主分区的 sectioning 元素上；oxide 的 contact 在 `<footer>` 上。
- 只用于构建期检查；不产生 CSS / JS / 行为。
- `html-only` 页面允许该属性；不改变零 CSS / 零 JS 契约。
- 检查器把 `[data-section]` 作为分区边界；不在 `data-section` 上的 h2 不参与主分区检查（例如项目卡片的 `<h3>`、oxide 的行标题 `<h2>`）。

## 6. 检查脚本

文件：`scripts/check-section-labels.mjs`；测试：`scripts/check-section-labels.test.mjs`。

### 输入

- `dist/**/index.html`。
- `<html lang="...">` 决定 Locale；`lang` 缺失时失败。
- 路径识别设计 id：
  - `dist/<design>/index.html` → design = `<design>`（默认 Locale）。
  - `dist/<locale-path>/<design>/index.html` → design = `<design>`。
  - `dist/designs/index.html`、`404.html`、根入口页等不含 `data-section`，自然跳过。
- 读取 `site.config.yaml` 的 `i18n.locales[].path` 识别 Locale 路径；读取 `src/designs/` 目录集合校验 design id。

### 算法

1. 用依赖为零的 HTML 切片器扫描文件：定位每个 `data-section="<key>"`，取该位置到下一个 `data-section` 或文件末尾之间的第一个 `<h2 ...>...</h2>`。
2. 去除标签、解码基础实体（`&amp;` / `&lt;` / `&gt;` / `&quot;` / `&#39;`）、压缩空白。
3. 按分隔符切分词元；丢弃不含字母 / 数字 / CJK 的纯符号词元。
4. ASCII 词元转小写；CJK 保持原样。
5. 每个词元必须属于该 Locale × SectionKey 的允许集合；任一非法词元即违规，输出设计、Locale、SectionKey、h2 文本、非法词元。
6. `profile`：若区间内没有 h2，跳过（hero）；有 h2 则同样校验。
7. 若设计 id 在 `scripts/section-labels.allowlist.json` 中，跳过整个设计的检查并计数；最终 allowlist 必须为空。
8. 任何违规以非零码退出；无违规输出统计（页数、分区数、跳过的 allowlist 设计数）。

### 单元测试

- 通过：`项目`、`Projects 项目`、`Selected Works`、`能力`、`链接`。
- 失败：`窗口`、`系统时间线`、`IDENTITY / 身份`、`经历日志`、`Elsewhere`、空 h2。
- 通过：`sr-only` h2 + 可见标准词（terminal 模式）。
- 通过：profile hero 无 h2。
- 失败：`data-section` 存在但无 h2（非 profile）。
- 通过：条件未渲染的分区（没有 `data-section`）。
- 失败：allowlist 为空时主题词-only 页面。

脚本不依赖浏览器或网络；可在 CI 中运行。

### 接入

`package.json`：

```json
"verify:sections": "node scripts/check-section-labels.mjs",
"build": "npm run fonts:check && npm run check && astro build && npm run fonts:subset && npm run fonts:prune && npm run verify:html-only && npm run verify:sections && npm run fonts:audit"
```

`npm run test` 加入 `scripts/check-section-labels.test.mjs`。

## 7. 迁移策略

| 批次 | 设计 | allowlist 变化 |
|---|---|---|
| S1 | 8 套语义合规：brutal、cute-alism、frost、homepage99、html-only、kern、material3、terminal | 创建 19 条；这 8 套不在清单内 |
| S2 | 8 套全违规：aero、deco、fairy-kei、ink、little-forest、sticker-diary、transit、zine | 19 → 11 |
| S3 | 9 套部分违规 + oxide + editorial | 11 → 0 |

每套设计的迁移步骤：

1. `Page.astro` import `sectionLabels`，取 `const sections = sectionLabels[view.locale.code]`。
2. 主分区加 `data-section`。
3. h2 改为 `sections.<key>.label`（或双语 canonical）；原主题词移到 h2 之外，保留为可选 kicker。
4. 检查 `aria-labelledby` / `aria-label` 仍指向标准标签。
5. 因标签变短导致的换行 / 留白变化，按设计微调 CSS；不改变视觉语言。
6. `messages.ts` 删除不再使用的标准标签键；主题词键保留。
7. 从 allowlist 删除该设计；运行检查与 `design-page-verify`。

## 8. 规则 / 文档改动

- `docs/rules/design-contract.md`：重写「信息架构与主题文案」；新增 `data-section` 与共享词表说明。
- `AGENTS.md`：新增第 9 条硬门禁；更新“8 条”为“9 条”。
- `docs/rules/operations.md`：构建脚本列表加入 `verify:sections`；说明 allowlist 与清空要求。
- `docs/rules/accessibility-responsive.md`：补一句“分区可访问名称不得只含主题词”。
- `docs/rules/data-and-i18n.md`：补充分区标准标签属于共享契约，不属于设计 messages。
- `docs/adr/0023-standard-section-labels.md`：记录决策、替代方案、代价、回滚。
- `.agents/skills/design-page-verify/SKILL.md`：加入标准标签检查项。
- `docs/verification/section-labels.md`：审计、批次、最终证据。

## 9. 取舍与风险

- **共享词表 vs 各设计自持**：共享避免 27 × 5 × 6 的漂移，但打破“设计文案全归设计”的旧边界；ADR 记录这是项目契约而非主题文案。
- **alias 白名单**：保留 `Selected Works`、`能力`、`联络` 等既有标准同义词，减少无意义 churn；但白名单必须显式、可审查，不能成为主题词后门。
- **data-section 字节**：每页增加少量属性；可接受，换取确定性检查。
- **短标签的排版影响**：h2 变短可能改变换行和留白；每套设计需要目检与 CSS 微调，不能只改文案。
- **sr-only h2**：terminal 模式合法，因为可见区域已有标准词；但不得用 sr-only 掩盖“视觉上仍是主题词-only”的分区。
- **HTML-only**：允许 `data-section`，不引入样式 / 脚本；检查器同样覆盖。
- **共享组件禁令**：不创建 `<SectionHeading>` 共享组件，避免样式隔离与设计自由度问题；只共享数据。

## 10. 回滚

- 每个子任务独立提交；回滚一个子任务不影响其他子任务的交付。
- `sections.ts`、`data-section`、检查脚本都是增量；回滚时删除导入与属性，恢复 `messages.ts` 的标签键。
- allowlist 可临时恢复某设计，但必须记录原因；最终交付要求为空。
- 不涉及数据 schema、路由、字体或共享菜单，回滚面可控。

## 11. 验证

- `npm run check`：lint / format / docs / fonts 静态门禁。
- `npm run build`：包含 `verify:html-only` 与新的 `verify:sections`。
- `npm run test`：检查脚本单元测试。
- `design-page-verify`：每套改动设计的桌面、375px、减动态、无 JS、对比度、截图归档。
- `docs/verification/section-labels.md`：逐套记录 h2 前后值、kicker 去留、allowlist 变化与浏览器证据。
