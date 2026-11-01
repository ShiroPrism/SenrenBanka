# 技术设计：Prettier + ESLint + LF 行尾规范

## 1. 现状与根因

- 仓库没有 ESLint / Prettier / EditorConfig；`.gitattributes` 只有 Trellis 规则。
- `core.autocrlf=true` + 索引 LF：674 个文本文件 checkout 后变为 CRLF。`fonts:check` 用 LF 字符串渲染 `generated.ts` 比较，因此干净 checkout 后构建可能失败；这不是字体逻辑问题，而是缺少仓库级行尾约定。
- 代码规模：`src` + `scripts` 约 52,782 行（不含 137,162 行的生成文件）；52 个设计 CSS、66 个 Astro、43 个 TS、32 个 MJS。
- 现有风格已接近 Prettier（单引号、分号、尾逗号、约 100 列），但没有强制；一次性格式化约改 104 个源码文件、约 1 万行空白。
- ESLint 基线 69 errors：35 `preserve-caught-error`、27 `astro/no-exports-from-components`（Preview 契约）、5 `no-control-regex`（有意）、2 `no-useless-assignment`（设计页）。

## 2. 工具链与兼容性

| 包 | 版本 | 说明 |
|---|---|---|
| `prettier` | `^3.9.10` | 格式化器 |
| `prettier-plugin-astro` | `^1.1.2` | `.astro` 解析 |
| `eslint` | `^10.14.0` | flat config |
| `@eslint/js` | `^10.0.1` | recommended |
| `typescript-eslint` | `^8.72.1` | TS parser + recommended |
| `eslint-plugin-astro` | `^3.2.1` | Astro 规则 |
| `globals` | `^17.14.0` | browser/node 全局 |

- `eslint-plugin-astro@3` 的 engines 为 `^22.22.3 || ^24.16.0 || >=26.3.0`，ESLint 10 为 `^20.19 || ^22.13 || >=24`。`package.json` engines 取二者交集：**`^22.22.3 || ^24.16.0 || >=26.3.0`**；`.nvmrc` 保持 `24`，CI 安装最新 24.x（当前本机 24.18.1）。
- 不启用 type-aware 规则（需要 parserOptions.project，成本高且 `astro check` 已覆盖类型）；不引入 Tailwind class 排序插件，避免全站 class 顺序 churn。

## 3. 文件与配置

### 3.1 `prettier.config.mjs`

```js
export default {
  printWidth: 100,
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  endOfLine: 'lf',
  plugins: ['prettier-plugin-astro'],
};
```

### 3.2 `.prettierignore`

忽略：`docs/`、`change-log/`、`*.md`、`.trellis/`、`.agents/`、`.cache/`、`.astro/`、`dist/`、`node_modules/`、`public/`、本地工具目录（`.impeccable/`、`.local-fonts/`、`.playwright-mcp/`、`.qoder/`、`.codex/`、`.trae/`、`.workbuddy/`、`.agent/`、`.codebuddy/`）、`src/fonts/generated.ts`、`fonts.catalog.json`、`fonts.lock.json`、`package-lock.json`。

`prettier --check .` 因此只覆盖源码与配置（Astro / TS / CSS / MJS / JSON / YAML），不会重写文档或生成物。

### 3.3 `eslint.config.mjs`

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  { ignores: ['dist/**', '.astro/**', '.cache/**', 'node_modules/**',
              'src/fonts/generated.ts', 'docs/**', '.trellis/**', '.agents/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ['src/designs/*/Preview.astro'],
    rules: { 'astro/no-exports-from-components': 'off' },
  },
];
```

- Preview 的 `fonts` 导出是 `docs/rules/design-contract.md`「可选 · 切换页预览碎片」的硬契约，切换页通过 `import.meta.glob` 读取；因此只对该路径关闭规则，并加注释说明，不全局关闭。
- 忽略生成文件与文档；lint 命令只扫描 `src/**/*.{astro,ts}`、`scripts/**/*.mjs`、`astro.config.mjs`、`eslint.config.mjs`、`prettier.config.mjs`。

### 3.4 `.editorconfig`

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

Markdown 保留行尾两空格（硬换行）。

### 3.5 `.gitattributes`

在保留现有 Trellis 规则的前提下新增：

```gitattributes
* text=auto eol=lf
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.webp binary
*.avif binary
*.ico binary
*.woff binary
*.woff2 binary
*.ttf binary
*.otf binary
*.pdf binary
```

索引当前已全部 LF；`git add --renormalize .` 预计不会产生内容 diff，只把工作区统一为 LF。归一化必须在开始改代码前、工作区干净时执行：

```bash
git add --renormalize .
git checkout -- .   # 仅在工作区干净时执行；用 LF 重写工作区
```

## 4. 行尾检查脚本

新增 `scripts/check-line-endings.mjs`：

- 执行 `git ls-files --eol`，解析每行的 `i/*` 与 `w/*` 状态。
- 违规：文本文件 `i/crlf`、`w/crlf`、`w/mixed`；跳过 `i/-text`（二进制）与 `i/none`（空文件/无 EOL）。
- 退出码 1，打印违规路径与修复建议（`git add --renormalize .`、检查编辑器）。
- 导出 `findLineEndingViolations(reportText)` 供测试；CLI 入口只在直接运行时执行。
- `scripts/check-line-endings.test.mjs` 覆盖 LF / CRLF / mixed / binary / no-EOL 五类输入。
- npm script `check:eol`，加入 `check` 与 `test`；这样即使编辑器写回 CRLF，本地/CI 也会在 build 前失败。

## 5. 存量 lint 修复

| 规则 | 数量 | 处理 |
|---|---:|---|
| `preserve-caught-error` | 35 | 在 catch 中重新抛出的 `new Error(...)` 增加 `{ cause: error }`（沿用实际 catch 变量），保留原始错误链；不关闭规则 |
| `astro/no-exports-from-components` | 27 | 仅对 `src/designs/*/Preview.astro` 关闭，配置注释指向预览契约 |
| `no-control-regex` | 5 | 在 `archive.mjs` / `schema.mjs` / `verify-html-only.mjs` 的具体正则前加 `// eslint-disable-next-line no-control-regex -- ...`，说明解析 tar/HTML 控制字符的意图 |
| `no-useless-assignment` | 2 | 删除 `fairy-kei` / `ink` 页面中未被后续使用的赋值，不改变渲染 |

## 6. 门禁与脚本

```json
{
  "lint": "eslint \"src/**/*.{astro,ts}\" \"scripts/**/*.mjs\" astro.config.mjs eslint.config.mjs prettier.config.mjs",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "check:eol": "node scripts/check-line-endings.mjs",
  "check": "npm run check:docs && npm run check:eol && npm run lint && npm run format:check && npm run fonts:typography && npm run fonts:coverage && astro check",
  "test": "... scripts/check-line-endings.test.mjs"
}
```

- `build` 保持原样，自动经过 `check`；CI 的 `npm run build` 因此强制 lint / format / eol。
- 不新增 CI workflow step；现有 Deploy workflow 先 `npm test` 再 `npm run build`，已覆盖。
- `npm install -D` 更新 `package-lock.json`；不改依赖运行时版本。

## 7. 格式化与验证策略

1. **基线快照**（格式化前，build 产物存在）：
   - `dist` 总字节与分类字节；
   - 175 个页面 `extractVisibleText` 的 SHA-256；
   - 已有 `docs/verification/assets/font-scope-*.png` 作为 6 个代表页基线。
2. `prettier --write .` 后重新 build。
3. 对比：
   - 175 页可见文本哈希必须完全一致；任何差异都视为模板空白回归，需调整配置或排除该文件。
   - 6 个代表页 1440/375 截图与基线像素差必须为 0（`sharp` raw diff）。
   - `dist` 总量变化 ≤1%；`fonts:audit` 0 部署缺口 / 0 孤儿。
   - 切换页 `/zh-cn/designs/` 正常渲染，27 个 Preview 的 `fonts` 导出仍被消费。
4. 若 Astro 格式化导致内联空白变化，优先调整 Prettier `htmlWhitespaceSensitivity` 或对该文件加 `<!-- prettier-ignore -->`，不修改设计文案。

## 8. 取舍与风险

- 全量格式化会产生约 104 文件、1 万行空白 diff；建议分两个提交：`chore: add lint/format tooling and fix baseline` 与 `style: format source with prettier`，便于审阅和回滚。
- 不格式化 Markdown：289 个 md 会引入大量非代码 churn，且项目文档有严格行/表格约定。
- 不启用 Tailwind class 排序：会改变所有 class 顺序，收益低、审阅成本高。
- ESLint 10 + Astro 插件 3 对 Node 下限要求较高；engines 已同步，CI `.nvmrc` 24 不受影响。若用户坚持 Node 22.12，可回退到 ESLint 9 + `eslint-plugin-astro@2`（不在本任务范围）。
- 行尾检查依赖 `git`；项目本身是 Git 仓库，可接受。

## 9. 回滚

- 工具链提交可单独回滚；格式化提交回滚后配置仍保留，但 `format:check` 会失败（预期）。
- `.gitattributes` 回滚会让 Windows 重新出现 CRLF；不推荐。
- 若 lint 修复引入行为问题（预计没有），单独回滚对应脚本修复，不影响格式化。
