# 代码规范与行尾：Prettier、ESLint 与 LF

- 状态：Accepted（2026-11-01）
- 相关：`docs/rules/operations.md`「代码规范与行尾」；`SPEC.md` §10.1；`docs/verification/lint-format-tooling.md`
- 证据：`.trellis/tasks/11-01-lint-format-tooling/`；`git ls-files --eol`；构建与浏览器对比记录

## 背景

- 仓库此前没有 ESLint / Prettier / EditorConfig。`.gitattributes` 只有 Trellis 的 `merge=union` 与 linguist 规则。
- `core.autocrlf=true` 使 674 个文本文件在 Windows checkout 后变为 CRLF。`fonts:check` 按 LF 渲染 `src/fonts/generated.ts` 比较，干净 checkout 后构建会误报生成文件过期。
- 代码规模约 52,782 行（不含 137,162 行生成文件），风格接近 Prettier 但没有强制；ESLint 基线 69 errors：35 `preserve-caught-error`、27 `astro/no-exports-from-components`（Preview 契约）、5 `no-control-regex`（有意）、2 `no-useless-assignment`。
- `eslint-plugin-astro@3` 要求 Node `^22.22.3 || ^24.16.0 || >=26.3.0`；项目 `.nvmrc` 为 24。

## 决策

1. **Prettier**：`prettier@^3.9.10` + `prettier-plugin-astro@^1.1.2`，配置 100 列、单引号、分号、尾逗号、`endOfLine: lf`。
2. **ESLint**：`eslint@^10.14.0` flat config，组合 `@eslint/js`、`typescript-eslint`、`eslint-plugin-astro`、`globals`；不启用 type-aware 规则。
3. **格式化范围**：源码与配置（Astro / TS / MJS / CSS / JSON / YAML）；排除 `docs/`、Markdown、`dist/`、`.cache/`、`.astro/`、`src/fonts/generated.ts`、`fonts.catalog.json`、`fonts.lock.json`、`package-lock.json` 与本地工具目录。文档不参与自动重排。
4. **行尾**：`.gitattributes` 新增 `* text=auto eol=lf` 与二进制扩展名；`.editorconfig` 固定 UTF-8 / LF / 2 空格 / 最终换行（Markdown 保留行尾空格）。一次性把工作区文本文件归一化为 LF。
5. **门禁**：新增 `check:eol`、`lint`、`format`、`format:check`；`npm run check` 依次执行 `check:docs` → `check:eol` → `lint` → `format:check` → 字体/类型检查，因此 `build` 与 CI 自动强制。
6. **行尾检查**：`scripts/check-line-endings.mjs` 解析 `git ls-files --eol`，拦截文本文件的 CRLF / mixed；二进制与无 EOL 文件不误报；带单元测试。
7. **契约豁免**：仅对 `src/designs/*/Preview.astro` 关闭 `astro/no-exports-from-components`，因为 `fonts` 导出是切换页预览的硬契约；不全局关闭。
8. **存量修复**：35 处 catch 重新抛出补 `{ cause }`；5 处控制字符正则局部禁用并注明理由；2 处计数器末尾自增局部豁免 `no-useless-assignment`；不关闭 recommended 规则集。
9. **Node engines**：调整为 `^22.22.3 || ^24.16.0 || >=26.3.0`，与 ESLint 10 / Astro 插件实际支持范围一致。

## 结果

- 152 个受跟踪文件被格式化：+8,576 / -5,055 行（Astro 65、CSS 27、TS 12、MJS 33、JSON 13、YAML 6 等）。
- `lint` 0 error、`format:check` 通过、`check:eol` 通过；`git ls-files --eol` 所有文本为 `i/lf w/lf`。
- `npm test` 84/84；`npm run build` 175 页通过；`astro check` 0 error / 1 既有 hint。
- `dist` **7,632,396 → 7,634,316 B**（+1,920 B，+0.025%）；字体子集与审计结果不变（1,625,116 B；0 部署缺口 / 0 孤儿）。
- 175 页可见文本 SHA-256 **全部一致**；格式化构建与 HEAD 构建在动效禁用条件下的 6 页 × 2 视口截图 **像素差 0**；切换页 27 个 Preview 正常。
- 新检查会阻止未来编辑器写回 CRLF；`generated.ts` 不再因 CRLF 误报。

## 取舍

- 不格式化 Markdown：289 个文档会引入大量非代码 churn，且项目对文档行/表格有严格约定。
- 不启用 Tailwind class 排序：会改变所有 class 顺序，审阅成本高、收益低。
- 不引入 husky / pre-commit：当前用 `check`/CI 统一门禁，避免多一套本地运行时。
- 不降低 Node 下限使用 ESLint 9：项目 `.nvmrc` 为 24，直接匹配当前工具链更简单。

## 风险与回滚

- Astro 格式化可能改变模板空白；已用 175 页可见文本 + 6 页确定性像素对比验证为 0 差异。若未来出现差异，优先调整 `htmlWhitespaceSensitivity` 或对具体文件 `prettier-ignore`，不得改文案。
- `.gitattributes` 回滚会让 Windows 重新出现 CRLF，不推荐；若回滚工具链，`format:check` 会失败，需要同时回滚 `check` 钩子。
