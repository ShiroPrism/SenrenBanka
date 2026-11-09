# S3 技术设计：部分违规与结构统一

整体契约见父任务 `design.md`；本文只记录 S3 的实现细节。

## 1. 9 套部分违规

统一模式与 S2 相同：h2 用共享 `label`，主题词移到 h2 之外，加 `data-section`。

差异点：

- **archive / fax / lexicon / poster / receipt / tape**：票据 / 档案语域；「技能」已是标准词，保持不动；只改主题词键。
- **pager**：仅「备注」违规；改动面最小，注意不要动其余标准键。
- **pixel-pet-rpg**：「经历日志」是标准词 + 主题词；h2 改为「经历」，`日志` 降为 kicker；「个人资料」可作为 profile alias 保留，或统一为「简介」。
- **radio**：「联络」是 contact alias，保持；只改「备注 / 频道 / 节目 / 日志」。
- **editorial**：见第 3 节。

## 2. oxide 结构统一

### 现状

```astro
<section aria-labelledby="ox-channels-label">
  <p id="ox-channels-label" class="ox-label">CHANNELS / 链接</p>
  ...
</section>
```

### 目标

```astro
<section data-section="links" aria-labelledby="ox-channels-label">
  <p class="ox-kicker" aria-hidden="true">CHANNELS</p>
  <h2 id="ox-channels-label" class="ox-label">
    {sections.links.enLabel} {sections.links.label}
  </h2>
  ...
</section>
```

要点：

- `ox-label` 的视觉样式（字号、字距、大写）由 `<h2>` 继承；必要时把 `.ox-label` 选择器保持，或新增 `.ox-heading` 并同步样式。
- 英文主题词降为 `.ox-kicker`；中文标准词进入 h2。双语 h2 可输出 `Links 链接`；`en` Locale 只输出 `Links`。
- profile 的 `IDENTITY / 身份` 同样改为 `Profile 简介` + kicker `IDENTITY`。
- contact 在 `<footer>`：`<footer data-section="contact" aria-labelledby="ox-contact-label">`；h2 使用共享 contact 标签。
- 行标题 `<h2 class="ox-row-title">` 是项目 / 经历条目标题；主分区 h2 引入后会出现多个 h2。建议把行标题降为 `<h3>`，保持 heading 层级 `h1 → h2（分区）→ h3（条目）`。若视觉样式依赖 `.ox-row-title`，只改标签不改类。
- 检查器只检查 `[data-section]` 区间内第一个 h2；行标题不会被误判。

## 3. editorial 结构统一

### 现状

```astro
<h2 id="ed-works" class="ed-section-title">Selected Works</h2>
<p class="ed-label">{t.worksLabel}</p>   <!-- 精选作品 -->

<h2 id="ed-elsewhere" class="ed-section-title">Elsewhere</h2>
<p class="ed-label">{t.elsewhereLabel}</p> <!-- 外部链接 -->
```

### 目标

- projects：`Selected Works` 是 en/projects alias，可保留；删除或改写下面的 `<p>精选作品</p>`，避免重复标准标签。若统一为 canonical，则 h2 用 `Projects` / `项目`，`Selected Works` 降为 kicker。
- links：h2 用 `Links` / `链接`；`Elsewhere` 降为 kicker。
- 加 `data-section="projects"` 与 `data-section="links"`；editorial 不渲染 experience / skills / contact，不补。
- 保留编辑式排版与 TOC 锚点；`href="#ed-works"` / `#ed-elsewhere` 不变。

## 4. 风险

- **oxide heading 层级**：新增分区 h2 后，行标题若仍是 h2 会产生同级重复；降为 h3 是语义修复，但要检查 `.ox-row-title` 样式是否依赖标签选择器。
- **oxide `<p>` → `<h2>`**：浏览器默认 margin / 字号会变化；必须用现有 class 或重置样式抵消。
- **editorial 别名**：`Selected Works` 作为 alias 保留时，检查器通过，但设计与 canonical 不完全一致；在 verification 中记录为有意保留。
- **receipt / poster / tape 等票据语域**：标准词进入 h2 后，票据的“结账 / 明细”语域由 kicker 承担；不要删除 kicker，否则设计辨识度下降。
- **375px**：oxide 的长英文 kicker 与标准词可能换行；检查无横向溢出。

## 5. 验证

- 11 套逐套桌面 + 375px；oxide / editorial 额外检查 heading 层级（浏览器 accessibility tree 或 `take_snapshot`）。
- `verify:sections` 在空 allowlist 下全量通过。
- 记录每套 h2 前后值、kicker 去留、heading 层级变化、CSS 调整点。
