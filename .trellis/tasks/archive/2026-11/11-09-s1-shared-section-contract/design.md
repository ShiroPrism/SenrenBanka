# S1 技术设计：共享契约与 8 套合规设计迁移

父任务 `design.md` 已定义整体契约；本文只写 S1 的实现细节。

## 1. `src/i18n/sections.ts`

```ts
import type { MessageLocaleCode } from './messages';

export type SectionKey =
  | 'profile'
  | 'projects'
  | 'experience'
  | 'skills'
  | 'contact'
  | 'links';

export interface SectionLabel {
  label: string;
  enLabel: string;
  aliases: string[];
}

export const sectionLabels: Record<
  MessageLocaleCode,
  Record<SectionKey, SectionLabel>
> = {
  'zh-CN': {
    profile: { label: '简介', enLabel: 'Profile', aliases: ['关于', '关于我', '个人资料'] },
    projects: { label: '项目', enLabel: 'Projects', aliases: ['作品', '精选项目', '精选作品'] },
    experience: { label: '经历', enLabel: 'Experience', aliases: ['履历', '工作经历'] },
    skills: { label: '技能', enLabel: 'Skills', aliases: ['能力', '专长'] },
    contact: { label: '联系', enLabel: 'Contact', aliases: ['联络', '联系方式'] },
    links: { label: '链接', enLabel: 'Links', aliases: ['社交链接'] },
  },
  // zh-TW / ja / en / ko 按父任务 design.md 第 3 节补全
};
```

约束：

- 不 import CSS、Astro 组件或字体。
- `MessageLocaleCode` 只作类型导入；不产生运行时依赖。
- 新增 Locale 时 `Record` 完整性检查会报错；同时检查 `site.config.yaml` 的 Locale 集合。

## 2. 检查脚本

### 文件

- `scripts/check-section-labels.mjs`：CLI 入口，零依赖。
- `scripts/check-section-labels.test.mjs`：`node --test` 单元测试，使用内联 HTML 夹具。
- `scripts/section-labels.allowlist.json`：

```json
{
  "designs": [
    "aero",
    "archive",
    "deco",
    "editorial",
    "fairy-kei",
    "fax",
    "ink",
    "lexicon",
    "little-forest",
    "oxide",
    "pager",
    "pixel-pet-rpg",
    "poster",
    "radio",
    "receipt",
    "sticker-diary",
    "tape",
    "transit",
    "zine"
  ]
}
```

### HTML 切片器

构建产物是项目自己生成的 HTML；不需要完整 DOM。按以下规则切片：

1. 用正则定位所有 `<[a-z][^>]*\bdata-section="([a-z]+)"[^>]*>`，记录起始位置与 key。
2. 每个分区的结束位置 = 下一个 `data-section` 的起始位置，或文件末尾。
3. 在区间内取第一个 `<h2\b[^>]*>([\s\S]*?)</h2>`；没有 h2 时：
   - `profile`：跳过；
   - 其他：违规。
4. 去除 h2 内部标签、解码基础实体、压缩空白。

限制：不处理嵌套 `data-section`（项目没有）；不处理 `<h2>` 内部嵌套 `<h2>`（无意义）；脚本对异常结构直接报错，要求设计修正。

### 词元化

```js
const separators = /[\/|·\-—\s]+/;
const tokens = text
  .split(separators)
  .map((token) => token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
  .filter((token) => /[\p{L}\p{N}]/u.test(token));
```

- ASCII 词元 `toLowerCase()`；CJK 保持原样。
- 允许集合 = `[label, enLabel, ...aliases]`，同样做 ASCII 小写化。
- 任一词元不在集合内即违规。

### Locale / design 识别

- `lang` 取 `<html lang="...">`，缺失即失败。
- 读取 `site.config.yaml` 的 `i18n.locales[].path`；若 `index.html` 的父目录是 locale path，则 design = 祖父目录；否则 design = 父目录。
- design id 必须在 `src/designs/` 目录集合中；否则跳过（入口页、切换页、404）。
- allowlist 按 design id 跳过整页。

### 输出

```text
section-label check: 27 designs, 5 locales, 108 pages, 540 sections
FAIL aero (zh-CN) projects: h2 "窗口" contains non-standard token "窗口"
FAIL ...
section-label check: 2 violation(s)
```

正常退出码 0；违规或基础设施错误退出码 1。

### 单元测试夹具

- `项目` / `Projects 项目` / `Selected Works` / `能力` / `链接` → pass。
- `窗口` / `系统时间线` / `IDENTITY / 身份` / `经历日志` / `Elsewhere` / 空 h2 → fail。
- `sr-only` h2 + 可见标准词 → pass。
- profile 无 h2 → pass。
- 非 profile 无 h2 → fail。
- 条件未渲染的分区（无 `data-section`）→ pass。
- allowlist 跳过 → pass 并计数。

## 3. 8 套合规设计迁移

| 设计 | 现状 | 迁移动作 |
|---|---|---|
| brutal | 项目/经历/技能/联系 S；hero bio；无 links h2 | h2 换共享词；加 `data-section`；删除 messages 标准键 |
| cute-alism | 六分区 S | 同上；links h2 用共享 label |
| frost | 四分区 S；hero links | 同上；无 links data-section |
| homepage99 | 五分区 S + links | 同上 |
| html-only | 五分区 S + links；html-only | 同上；只加数据属性，不加 CSS/JS |
| kern | 四分区 S；hero links | 同上 |
| material3 | 四分区 S；hero links | 同上 |
| terminal | 五分区 S + links；sr-only h2；可见 `# 标准词` | h2 用 `enLabel` + `label`（en 下不重复）；保留 sr-only 与可见注释；加 `data-section` |

迁移后 `messages.ts` 只保留主题词 / 语域文案；若某键仅用于标准标签，删除。`aria-labelledby` / `aria-label` 保持指向 h2 或使用共享 label。

## 4. 规则 / ADR 落点

- `AGENTS.md` 新门禁编号为 9；原“8 条”改为“9 条”；路由表增加「主分区标准标签」到 `design-contract` + `accessibility-responsive`。
- `design-contract.md` 的「信息架构与主题文案」重写后，保留 2026-11-07 的退役先例引用，但不再写“既有主题按批次审计”作为待办；改为“存量审计记录见 `docs/verification/section-labels.md`”。
- ADR 0023 参照 ADR 0021 的结构：背景 / 决策 / 结果 / 替代方案 / 风险与回滚。
- `design-page-verify` 增加：检查 `data-section`、h2 词元、kicker 不承担 heading、`verify:sections` 通过。

## 5. 风险

- 共享词表 import 可能被设计 CSS 的 `@source` 扫描？`sections.ts` 是纯数据、无 Tailwind 类；不会进入 CSS。
- `data-section` 若放在 `<section>` 之外（如 `<div>`），检查器仍能工作，但语义分区可能缺失；要求放在 sectioning 元素上。
- terminal 的 h2 是 `sr-only`；检查器必须按文本而非可见性判断，避免误报。
- html-only 的 `<html lang>` 与普通页一致；检查器同样覆盖，不特殊放行。
- 8 套设计标签变短后可能出现标题区留白；S1 只做必要 CSS 微调，不改变视觉语言。
