# 加入 Prettier + ESLint 与 LF 行尾规范

## Goal

为项目加入 Prettier、ESLint（Astro / TypeScript 支持）、`.editorconfig` 与 `.gitattributes` LF 约束，修复存量 lint 问题，并把 `lint` / `format:check` / 行尾检查接入 `npm run check`（进而覆盖 `build` 与 CI）。目标是不改变任何页面输出与运行行为，并彻底消除 Windows `autocrlf` 导致的 CRLF/LF 不一致（如 `src/fonts/generated.ts` 使 `fonts:check` 失败）。

## Background

- 仓库当前没有任何 ESLint / Prettier / EditorConfig 配置；`.gitattributes` 只有 Trellis 的 `merge=union` 与 linguist 规则。
- `git ls-files --eol` 实测：674 个文本文件为 **index LF / worktree CRLF**，43 个 LF/LF，1 个 mixed，53 个二进制，35 个无换行；`core.autocrlf=true`。这就是 generated.ts 在 checkout 后变 CRLF、`fonts:check` 按 LF 比较失败的根因。
- 代码规模（`src` + `scripts`）：66 个 `.astro`、52 个 `.css`、43 个 `.ts`、32 个 `.mjs`；约 52,782 行（不含 `src/fonts/generated.ts` 的 137,162 行）。
- Prettier 基线实验：未归一化行尾时 198 个文件 check 失败；在副本上实际 `--write` 后约 104 个源码文件、约 1 万行空白差异（Astro 65 文件 +5,038/-3,502；CSS 27 文件 +1,204/-609；TS 13；MJS 26）。代码本身已接近 Prettier 风格，差异主要是换行与排版。
- ESLint 10.14.0 + `eslint-plugin-astro` 3.2.1 + `typescript-eslint` 8.72.1 基线：**69 errors / 0 warnings**：
  - 35 `preserve-caught-error`（`scripts/fonts/**`，需补 `{ cause }`）；
  - 27 `astro/no-exports-from-components`（全部是 `Preview.astro` 的 `fonts` 具名导出——项目契约要求，必须局部豁免）；
  - 5 `no-control-regex`（tar/HTML 解析中的控制字符正则，属有意为之）；
  - 2 `no-useless-assignment`（`fairy-kei` / `ink` 的 `Page.astro`）。
- 版本兼容：ESLint 10 要求 Node `^20.19 || ^22.13 || >=24`；`eslint-plugin-astro` 3.2.1 要求 Node `^22.22.3 || ^24.16.0 || >=26.3.0`；`.nvmrc` 为 `24`，本机 Node 24.18.1，CI 通过 `.nvmrc` 安装 24.x。

## Scope

**In scope**

- 新增 Prettier / ESLint / EditorConfig / gitattributes / 行尾检查脚本与 npm scripts。
- 全量格式化源码与 CSS、配置（不含 Markdown 文档与生成物）。
- 修复 69 个存量 ESLint 错误；对 `Preview.astro` 的合法 `fonts` 导出做局部规则豁免并注明契约。
- `npm run check` 接入 `lint`、`format:check`、`check:eol`；`build` 与 CI 自动继承。
- 更新 `docs/rules/operations.md`、新增 ADR 与验证记录。

**Out of scope**

- 格式化 `docs/**`、`change-log/**`、根 Markdown（README / SPEC / AGENTS / CONTEXT）与 `DESIGN.md`。
- 格式化 `src/fonts/generated.ts`、`fonts.catalog.json`、`fonts.lock.json`、`package-lock.json`。
- 行为、视觉、设计 token、字体选择、菜单、构建产物结构的主动调整。
- Tailwind class 排序、pre-commit hook / husky、type-aware ESLint 规则、额外风格规则（如 import 排序）。

## Requirements

- R1 安装开发依赖：`prettier@^3.9.10`、`prettier-plugin-astro@^1.1.2`、`eslint@^10.14.0`、`@eslint/js@^10.0.1`、`typescript-eslint@^8.72.1`、`eslint-plugin-astro@^3.2.1`、`globals@^17.14.0`。
- R2 `package.json` engines 调整为与 `eslint-plugin-astro` 3.x 匹配的 `^22.22.3 || ^24.16.0 || >=26.3.0`；`.nvmrc` 保持 `24`。
- R3 新增 `prettier.config.mjs`：`printWidth: 100`、`singleQuote`、`semi`、`trailingComma: all`、`endOfLine: lf`、Astro 插件。
- R4 新增 `.prettierignore`：忽略 Markdown、`docs/`、`change-log/`、`.trellis/`、`.agents/`、`.cache/`、`.astro/`、`dist/`、`node_modules/`、`src/fonts/generated.ts`、`fonts.catalog.json`、`fonts.lock.json`、`package-lock.json`。
- R5 新增 `eslint.config.mjs`（flat config）：`@eslint/js` recommended + `typescript-eslint` recommended + `eslint-plugin-astro` recommended + browser/node globals；忽略生成物与构建目录。
- R6 `src/designs/*/Preview.astro` 仅关闭 `astro/no-exports-from-components`，并用注释说明 `fonts` 导出是 `docs/rules/design-contract.md` 预览契约的一部分。
- R7 新增 `.editorconfig`：UTF-8、LF、2 空格、最终换行；Markdown 保留行尾空格（硬换行）。
- R8 新增 `.gitattributes`：`* text=auto eol=lf` + 常见二进制扩展名 `binary`；保留现有 Trellis 规则。
- R9 新增 `scripts/check-line-endings.mjs` 与测试：解析 `git ls-files --eol`，当文本文件 index 或 worktree 为 CRLF / mixed 时失败；不把二进制或无 EOL 文件误报。
- R10 修复存量 ESLint：为 catch 重新抛出的 Error 补 `{ cause }`；控制字符正则加带理由的局部禁用；修复 2 处无用赋值；不通过放宽 recommended 规则来规避。
- R11 `package.json` scripts：
  - `lint`、`format`、`format:check`、`check:eol`；
  - `check` = `check:docs` + `check:eol` + `lint` + `format:check` + 现有字体/类型检查；
  - `test` 增加行尾检查测试；`build` 保持不变（自动经过 `check`）。
- R12 一次性 `prettier --write .`（受 `.prettierignore` 约束），随后 `lint` 必须 0 error；不得改变页面可见文本或交互。
- R13 文档更新：`docs/rules/operations.md` 增加工具链与行尾规则；新增 ADR 0020 与 `docs/verification/lint-format-tooling.md`，并在 `docs/verification/shared.md` 摘要。

## Acceptance Criteria

- [x] A1 `npm run lint` 0 error / 0 warning；`npm run format:check` 通过；`npm run check:eol` 通过。
- [x] A2 `git ls-files --eol` 中所有文本文件为 `i/lf w/lf`，无 `w/crlf` / `w/mixed`；`src/fonts/generated.ts` 不再因 CRLF 让 `fonts:check` 失败。
- [x] A3 `npm run check`、`npm test`、`npm run build` 全绿；`astro check` 0 error / 仅既有 hint；`fonts:audit` 0 部署缺口 / 0 孤儿。
- [x] A4 175 个页面的可见文本哈希与格式化前逐页一致；`dist` 体积变化 ≤ 1%（仅允许空白/构建差异），无新增资源类型。
- [x] A5 6 个代表页（5 种语言 + `html-only`）在 1440 / 375 的截图与格式化前像素一致；无 console / 4xx / 横向溢出。
- [x] A6 `Preview.astro` 的 `fonts` 导出仍被切换页正确消费；27 个预览无功能变化。
- [x] A7 新增的行尾检查脚本有单元测试；测试覆盖 LF / CRLF / mixed / binary / no-EOL 五类输入。
- [x] A8 `git diff --stat` 不含 `docs/**` Markdown 内容改写、生成物格式化或 runtime/design 行为改动。
- [x] A9 `docs/rules/operations.md`、ADR 0020、验证记录与 `shared.md` 摘要已更新。
- [x] A10 工作区在 `.gitattributes` 生效后从干净 checkout 重演：文本文件默认 LF，`npm run build` 不因行尾失败。

## Risks

- **Astro 格式化可能改变模板空白**：Prettier 可能调整内联元素间空白；用 175 页可见文本哈希 + 6 页像素对比 + 完整 build 兜底。
- **一次性大 diff**：约 104 个源码文件空白变更；建议“工具链配置 + lint 修复”与“全量格式化”分两个提交，便于审阅与回滚。
- **ESLint 10 / Node 版本**：engines 收紧到插件实际支持范围；Node 22 用户需 ≥22.22.3，CI 的 `.nvmrc` 24 不受影响。
- **规则豁免误用**：只豁免 `Preview.astro` 的单一规则；不全局关闭 `no-exports-from-components`。

## Open Questions

无；格式化范围、门禁强度、Node engines 与存量修复策略已由用户确认。
