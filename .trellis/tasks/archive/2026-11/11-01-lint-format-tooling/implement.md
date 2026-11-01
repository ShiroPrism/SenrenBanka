# 执行计划：Prettier + ESLint + LF 行尾规范

## 0. 前置与基线

- [ ] 确认 `git status` 干净；记录当前 `dist` 总字节（7,632,396 B）与分类字节。
- [ ] 记录 175 个页面可见文本 SHA-256（用 `scripts/fonts/audit.mjs` 的 `extractVisibleText`，输出到 `.cache/visible-text-baseline.json`）。
- [ ] 确认 6 个代表页基线截图存在：`docs/verification/assets/font-scope-*-{1440,375}.png`。
- [ ] 当前 `node_modules` 含临时 `--no-save` 实验包；执行 `npm ci` 恢复到 lock 状态后再开始。

## 1. 行尾归一化（必须在改代码前，工作区干净时）

- [ ] 新建 `.gitattributes`：保留 Trellis 规则，新增 `* text=auto eol=lf` + 二进制扩展名。
- [ ] 新建 `.editorconfig`（UTF-8 / LF / 2 空格 / 最终换行；Markdown 保留行尾空格）。
- [ ] 暂存两个新文件：`git add .gitattributes .editorconfig`。
- [ ] 执行 `git add --renormalize .`；预期索引已全部 LF，不产生内容 diff。
- [ ] 工作区仍干净时执行 `git checkout -- .`，让工作区文本文件统一为 LF；若已有未提交改动则**不要**执行此步。
- [ ] 验证 `git ls-files --eol`：所有文本为 `i/lf w/lf`，无 `w/crlf` / `w/mixed`；`src/fonts/generated.ts` 为 LF。

## 2. 依赖与配置

- [ ] `npm ci`。
- [ ] `npm install -D prettier@^3.9.10 prettier-plugin-astro@^1.1.2 eslint@^10.14.0 @eslint/js@^10.0.1 typescript-eslint@^8.72.1 eslint-plugin-astro@^3.2.1 globals@^17.14.0`。
- [ ] `package.json` engines 改为 `^22.22.3 || ^24.16.0 || >=26.3.0`；`.nvmrc` 保持 `24`。
- [ ] 新增 `prettier.config.mjs`、`.prettierignore`、`eslint.config.mjs`（Preview 规则豁免 + 注释）。
- [ ] 新增 `scripts/check-line-endings.mjs`、`scripts/check-line-endings.test.mjs`。
- [ ] 更新 scripts：`lint`、`format`、`format:check`、`check:eol`；`check` 插入 `check:eol` / `lint` / `format:check`；`test` 增加行尾测试。

## 3. 修复存量 lint（先于格式化）

- [ ] `npm run lint` 记录错误；按设计逐类修复：
  - 35 处 `preserve-caught-error`：`throw new Error(..., { cause: error })`，使用实际 catch 变量；
  - 5 处 `no-control-regex`：局部 `eslint-disable-next-line` + 理由；
  - 2 处 `no-useless-assignment`：删除无用赋值；
  - 27 处 Preview 导出：只通过 `eslint.config.mjs` 路径豁免，不改组件。
- [ ] `npm run lint` 0 error / 0 warning。

## 4. 全量格式化

- [ ] 执行 `npm run format`；检查 `.prettierignore` 是否成功排除 docs / generated / lock / catalog / package-lock。
- [ ] `git diff --stat` 复核：只允许源码与配置的空白/排版变化；不得出现 docs Markdown、生成物或 runtime 行为改动。
- [ ] `npm run format:check` 通过。
- [ ] `npm run lint` 仍 0 error（Prettier 可能改变格式，不应引入 lint 问题）。

## 5. 构建与行为验证

- [ ] `npm run check:eol` 通过。
- [ ] `npm run build` 全绿；记录 `dist` 总字节、字体/HTML/CSS 分类与 `fonts:audit` 结果。
- [ ] `npm test` 全绿（含新增行尾测试）。
- [ ] 重新计算 175 页可见文本 SHA-256，与 `.cache/visible-text-baseline.json` 比较：必须 **0 差异**。
- [ ] `dist` 总量变化 ≤1%；无新增资源类型。
- [ ] 6 个代表页（`zh-tw/archive`、`zh-tw/terminal`、`zh-cn/little-forest`、`ko/editorial`、`ja/pager`、`en/html-only`）在 1440/375 重新截图，与 `font-scope-*-{1440,375}.png` 做 `sharp` raw 像素对比：必须 **0 差异**。
- [ ] 检查 `/zh-cn/designs/`：27 个 Preview 正常渲染，`fonts` 导出契约未被破坏；0 console / 0 4xx。
- [ ] 若 Astro 格式化引入可见空白差异：调整 `htmlWhitespaceSensitivity` 或对具体文件加 `prettier-ignore`，不得改文案/设计。

## 6. 文档

- [ ] `docs/rules/operations.md`：增加 Prettier / ESLint / `check:eol` 命令与 LF 规则；更新 `check` / `build` 描述。
- [ ] 新增 `docs/adr/0020-lint-format-and-lf-line-endings.md`。
- [ ] 新增 `docs/verification/lint-format-tooling.md`（配置、基线、lint 修复、构建/页面/像素对比结果、未测项）。
- [ ] `docs/verification/shared.md` 顶部追加摘要并更新“最近共享机制专项验证”行。
- [ ] `npm run check:docs` 通过。

## 7. 风险文件与回滚点

| 风险文件 | 说明 |
|---|---|
| `package.json` / `package-lock.json` | 依赖与 engines；lock 必须与安装一致 |
| `eslint.config.mjs` / `prettier.config.mjs` / `.prettierignore` | 规则与格式化边界 |
| `.gitattributes` / `.editorconfig` | 行尾策略；回滚会让 Windows 重新出现 CRLF |
| `scripts/check-line-endings.mjs` / 测试 | 行尾门禁 |
| `scripts/fonts/**` | 35 处 `cause` 修复，需保持错误信息与行为 |
| `src/designs/**` | 仅格式化 + 2 处无用赋值修复；需可见文本/像素验证 |

- 回滚点 1：配置 + lint 修复完成后跑 `npm run lint` / `npm test`；失败只回滚这两部分。
- 回滚点 2：格式化完成后跑 build + 可见文本/像素对比；失败回滚格式化提交，配置保留。
- 回滚点 3：若 `.gitattributes` 归一化产生意外索引 diff，先停止并检查，不执行 `git checkout -- .`。
- 建议提交拆分：`chore: add lint/format tooling and fix baseline` → `style: format source with prettier`；Phase 3.4 再决定最终提交。
