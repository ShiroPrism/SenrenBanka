# 韩语字体调研与字体仓库发行 · 执行计划

> 工作目录：`F:\SenrenBanka-fonts`。主站 `F:\SenrenBanka` 不在本任务修改范围。

## 0. 前置

- [ ] 读 `docs/ADDING-A-FONT.md`、`docs/LICENSING.md`、`docs/RELEASING.md`、`schemas/family.schema.json`。
- [ ] 读 `research/korean-font-candidates.md`。
- [ ] `git status` 干净；记录当前 HEAD。
- [ ] 确认 `gh` 已登录且有 `whitehair-failure/SenrenBanka-fonts` 的 Release 权限。
- [ ] 预留磁盘空间（建议 ≥ 15 GB）：双构建 + 两个 source 缓存。

## 1. 固化调研

- [ ] 将候选矩阵、许可证据、实测尺寸写入 `research/korean-font-candidates.md`（随任务提交，不进入字体仓库）。
- [ ] 对 6 个短名单逐项确认：
  - OFL-1.1 完整文本、版权行、无 RFN；
  - 源文件格式（TTF/OTF）、字节数、可用 Regular 400；
  - 11,172 个谚文音节覆盖；
  - Hanja 覆盖（Galmuri/Noto Mono 较高，发布不影响，主站用 Hangul-only 路由）。

## 2. 源文件固定

- [ ] Google Fonts 四族 pin commit；下载：
  - `GothicA1-Regular.ttf` + `OFL.txt`
  - `GowunBatang-Regular.ttf` + `OFL.txt`
  - `Dongle-Regular.ttf` + `OFL.txt`
  - `PoorStory-Regular.ttf` + `OFL.txt`
- [ ] Galmuri v2.40.4 zip → `Galmuri11.ttf` + `LICENSE.txt`。
- [ ] Noto CJK Sans2.004 `12_NotoSansMonoCJKkr.zip` → `NotoSansMonoCJKkr-Regular.otf` + `LICENSE`。
- [ ] 用 `sha256sum` 计算完整哈希；与 `research/korean-font-candidates.md` 的截断哈希/大小核对。
- [ ] 将源文件放到 `.cache/bootstrap/source/fonts/`（或 descriptor 直接下载路径），许可文件同目录保留。

## 2.5 样张目检（不可跳过）

按 `F:\SenrenBanka\docs\fonts\selection-guide.md` §3 执行；这是发布前的设计质量闸门，不是可选项。

- [ ] 用 `.local-fonts/tools/specimen-server.mjs` 或临时 HTML（不入库）并排渲染 6 族。
- [ ] 每族检查：大标题 / 正文 / 小字号 / 数字 / 常用标点 / 韩文·汉字·拉丁混排 / 缺字回退。
- [ ] Galmuri11 在目标小字号下的像素网格与 Ark Pixel 12px 的并排观感。
- [ ] Noto Sans Mono CJK KR 在 terminal/oxide/fax 的等宽网格；数字与韩文对齐。
- [ ] Dongle / Poor Story 的圆体/手写气质与对应设计的匹配度；正文可读性。
- [ ] 合成粗体（Regular + browser synthetic bold）的韩文标题观感。
- [ ] 记录结论到 `research/korean-font-specimen.md`（或 research 文件附录）：通过/替换/调整映射。
- [ ] 若某族在目标设计中不合格：在发布前换族或调整映射，不把问题留到主站验收。

## 3. 添加 descriptor / license

- [ ] `catalog/families/gothic-a1/1.0.0.json`
- [ ] `catalog/families/gowun-batang/1.0.0.json`
- [ ] `catalog/families/galmuri11/1.0.0.json`
- [ ] `catalog/families/noto-sans-mono-cjk-kr/1.0.0.json`
- [ ] `catalog/families/dongle/1.0.0.json`
- [ ] `catalog/families/poor-story/1.0.0.json`
- [ ] `licenses/gothic-a1/LICENSE.txt` 等 6 份。
- [ ] 每个 descriptor：
  - `role: "core-cjk"`；
  - `scripts: ["hangul"]`；
  - `source.files[0].sha256` / `download.sha256` 完整；
  - `license.rfn.status: "not-applicable"`；
  - `output.sourceFile` 与实际文件名一致；
  - `cssVariable` 与 `design.md` 表一致。

## 4. Schema / 工具链

- [ ] `schemas/family.schema.json` 增加 `scripts`（可选，`cjk|hangul`，minItems 1，uniqueItems）。
- [ ] `schemas/manifest.schema.json` / `schemas/catalog.schema.json` 增加 `scripts`。
- [ ] `scripts/lib/descriptor.mjs` 及 build/catalog 路径透传 `scripts`；缺省 `["cjk"]`。
- [ ] 测试：
  - 新 descriptor `scripts` 保留；
  - 旧 descriptor 缺省 `["cjk"]`；
  - 非法值失败；
  - 构建确定性不变。
- [ ] `npm test` 通过。

## 5. 本地构建与复现

- [ ] `npm ci`
- [ ] `npm run catalog:validate`
- [ ] `npm run bootstrap:build -- --bootstrap-dir .cache/bootstrap --out artifacts/bootstrap-sources-v1.1.0.zip`（如需要）
- [ ] `npm run bootstrap:verify -- ...`
- [ ] `node scripts/build-catalog.mjs --out artifacts --catalog-version 1.1.0 --bootstrap-dir .cache/bootstrap --bootstrap-sha256 ...`
- [ ] `npm run release:verify -- --dir artifacts --catalog-version 1.1.0`
- [ ] `node scripts/build-catalog.mjs --out artifacts-repro ...`
- [ ] `npm run release:verify -- --dir artifacts --compare-dir artifacts-repro --catalog-version 1.1.0`
- [ ] 检查 `artifacts/catalog.json`：
  - 26 families；
  - 6 个新族 `role/scripts/version` 正确；
  - 现有 20 族仍 v1.0.0。
- [ ] 检查 `artifacts/SHA256SUMS` 覆盖 6 package + 6 source + catalog + bootstrap（如存在）。

## 6. 发布前检查点（必须暂停）

- [ ] `node scripts/publish.mjs --dir artifacts --catalog-version 1.1.0 --target-sha "$(git rev-parse HEAD)" --dry-run`
- [ ] 汇总给用户：
  - 6 个 family tag / 4 资产 / 大小；
  - catalog tag / 资产 / SHA-256；
  - git diff 摘要（descriptor/schema/tests/docs）；
  - 与原 catalog v1.0.0 的差异（仅新增）。
- [ ] 用户确认后才执行真实发布。

## 7. 发布

- [ ] 提交并推送字体仓库变更。
- [ ] 发布 6 个 `font-<id>-v1.0.0`。
- [ ] 发布 `catalog-v1.1.0`（最后）。
- [ ] 验证：
  - `gh release view <tag> -R whitehair-failure/SenrenBanka-fonts`；
  - 下载 `catalog.json` 与 `.sha256`，校验 SHA；
  - 抽查 1 个 family package/source 的 SHA。
- [ ] 若失败：Draft 保留，修复后重跑；不删除/覆盖已发布资产。

## 8. Handoff

- [ ] 写 `research/handoff.md`：
  - catalog URL + SHA；
  - 6 族 id/version/package/source/大小/cssVariable/scripts；
  - 许可证证据 URL 与文件哈希；
  - 验证命令结果；
  - 已知风险。
- [ ] 把 handoff 路径交给 C2；C2 不读取本任务 `.cache/`。

## 9. 提交边界

只提交：

- `catalog/families/<6 id>/1.0.0.json`
- `licenses/<6 id>/LICENSE.txt`
- `schemas/*.schema.json`
- `scripts/lib/*` / `tests/*` / `docs/*` / `README.md`（如需要）
- 任务产物在 `.trellis/tasks/...`（主站仓库，不随字体仓库提交）

不提交：`.cache/`、`artifacts/`、`artifacts-repro/`、`bootstrap-sources-*.zip`、字体二进制。

## 10. 验证命令汇总

```bash
cd /f/SenrenBanka-fonts
npm ci
npm test
npm run catalog:validate
npm run release:verify -- --dir artifacts --compare-dir artifacts-repro --catalog-version 1.1.0
node scripts/publish.mjs --dir artifacts --catalog-version 1.1.0 --target-sha "$(git rev-parse HEAD)" --dry-run
gh release list -R whitehair-failure/SenrenBanka-fonts
```

## 11. 回滚

- 发布前：删除 `artifacts*`、重新构建；不改已提交 descriptor。
- 发布中：Draft 保留；重跑 publish 复用/校验。
- 发布后：提升 family 版本 + 新 catalog；不删除/覆盖 v1.0.0。
- 主站仍锁 v1.0.0 时，v1.1.0 不影响现有构建。
