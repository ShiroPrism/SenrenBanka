# Technical design — content subset of core CJK fonts

## 1. Invariants

- Source fonts in the catalog and `fonts.lock.json` are unchanged; deployed subsets are build-time derived assets.
- The subset step may modify only:
  - `dist/_astro/fonts/<family>-subset-<hash>.woff2` (new files);
  - inline `@font-face` rules in `dist/**/*.html` for core families;
  - `.cache/font-sources/` (downloaded/verified source cache);
  - `.cache/fonts/subset-report.json`.
- Design pages, copy, design CSS, and font stacks are untouched.
- `fonts:prune` still owns font CSS externalization, non-core pruning, file deletion, and the size guard.
- The build remains offline after `fonts:prepare`.

## 2. Pipeline

```text
fonts:prepare (packages + core source archives)
-> fonts:check (offline packages + sources)
-> check
-> astro build
-> fonts:subset (core subset WOFF2 + inline @font-face rewrite)
-> fonts:prune (externalize rules, delete unused shards, size guard)
-> verify:html-only
-> fonts:audit (deployed-set + subset cmap coverage)
```

`fonts:subset` must run before `fonts:prune`; otherwise prune would have already externalized the sharded rules and the subset step would need to rewrite shared CSS bundles.

## 3. Dependencies

Add pinned devDependencies:

- `subset-font@2.9.0` (BSD-3-Clause): HarfBuzz WASM subsetter; outputs WOFF2 and keeps all layout features by default.
- `fontkitten@1.0.3` (MIT): cmap/characterSet reader for subset audit. It is already a transitive dependency; make it direct and pinned.

No Python/fontTools requirement for forks.

## 4. Source cache

New path constant:

```text
.cache/font-sources/<catalogVersion>/<id>@<version>/
  .complete-source.json
  source-manifest.json
  source/fonts/<font-file>
  source/licenses/<license-files>
```

Marker shape:

```json
{
  "schemaVersion": 1,
  "catalogVersion": "1.0.0",
  "familyId": "lxgw-wenkai",
  "familyVersion": "1.0.0",
  "sourceArchiveSha256": "...",
  "sourceArchiveSize": 13233017,
  "sourceManifestSha256": "...",
  "sourceFilesSha256": "...",
  "licenseFilesSha256": "..."
}
```

### 4.1 Download and verify

For each family with `manifest.role === 'core-cjk'`:

1. If the source cache is valid, reuse.
2. Otherwise (online) download `${baseUrl}/${family.source.releaseTag}/${family.source.fileName}` with `fetchBuffer` and `maxBytes = family.source.size + 1`.
3. Verify outer SHA-256 and size against `family.source`.
4. Parse the USTAR archive with the existing `archive.mjs` parser (export a generic reader or add `inspectSourceArchiveBuffer`). Enforce the same security checks: no links, no traversal, deterministic metadata.
5. Require exactly `source-manifest.json`, `source/fonts/<fileName>`, `source/licenses/*`. Verify each file against `source-manifest.json` and the catalog's `manifest.source.files` / `manifest.license.files`.
6. Install atomically with the existing file-lock/rename pattern; write the marker last.
7. `--offline` never fetches; a missing/invalid source cache yields a clear `fonts:prepare` command error.

`fonts:check` verifies every core source cache offline (marker, source font hash/size, license hashes, source manifest). Non-core families have no source cache.

### 4.2 Source font selection

The source archive currently contains exactly one `.ttf`/`.otf`. Use it. If a core family ever has multiple source font files, fail with a clear message until variant mapping is implemented; do not guess.

## 5. `fonts:subset`

New `scripts/fonts/subset.mjs`, CLI command `subset`.

### 5.1 Corpus

Collect a global corpus from all text assets under `dist`:
- extensions: `.html`, `.htm`, `.css`, `.js`, `.mjs`, `.json`, `.svg`, `.xml`, `.txt`, `.webmanifest`;
- decode HTML entities and CSS escapes; include raw text (attributes, inline JSON, scripts, CSS `content`, hidden/template text);
- reuse the corpus helpers from `scripts/fonts/lib/font-css.mjs`.

Write `corpusSha256` and `corpusCodePoints` to the report. The corpus is deliberately over-approximate; extra characters only make the subset slightly larger.

### 5.2 Subset generation

For each core family:
- load all source fonts from the source cache;
- call:
  ```js
  subsetFont(sourceBuffer, corpusText, { targetFormat: 'woff2' })
  ```
- write `dist/_astro/fonts/<family-id>-subset-<sha16>.woff2`;
- compute SHA-256 of the output; record bytes and characterSet size.

Derive the synthetic `@font-face` weight/style/display from the catalog manifest's `variants` (the catalog has no `output` block). If a core family declares more than one distinct face, fail explicitly.

The subset file is content-derived; a rebuild after profile/copy changes produces a new hash. This is intended.

### 5.3 HTML rewrite

For each HTML page:

1. Parse inline `<style>` blocks and the CSS variable values:
   - `--font-lxgw`, `--font-zhuque`, `--font-ark-pixel` -> hashed `font-family` names.
2. Find all `@font-face` rules whose `font-family` equals one of those values.
3. Remove those rules; insert one synthetic rule per core family in the same style block:
   ```css
   @font-face{
     font-family:"<original hashed family>";
     src:url("<base>/_astro/fonts/<subset-file>") format("woff2");
     font-weight:<weight>;
     font-style:<style>;
     font-display:<display>;
   }
   ```
   No `unicode-range`: the subset file is the complete deployed coverage.
4. Preserve all other CSS and CSS variables.
5. Derive `<base>` from an existing core `@font-face` URL (same helper as prune); reject non-absolute prefixes.
6. If a page does not use a core family, leave it alone.
7. If a page has no core `@font-face` rules, no subset URL is inserted.

After rewrite, compare visible text before/after; abort on any difference. Write HTML only after all pages and subset files are computed.

### 5.4 Report and dry-run

`.cache/fonts/subset-report.json`:

```json
{
  "schemaVersion": 1,
  "dist": "dist",
  "corpusSha256": "...",
  "corpusCodePoints": 1261,
  "subsetter": { "name": "subset-font", "version": "2.9.0" },
  "families": [
    {
      "id": "lxgw-wenkai",
      "sourceSha256": "...",
      "sourceFile": "...",
      "subsetFile": "_astro/fonts/lxgw-wenkai-subset-xxxx.woff2",
      "subsetSha256": "...",
      "subsetBytes": 272948,
      "characters": 1234
    }
  ],
  "pages": [{ "path": "/zh-cn/foo/", "coreFamilies": ["lxgw-wenkai"] }]
}
```

`--dry-run` computes subset sizes and page plans but writes nothing and deletes nothing.

## 6. Prune integration

No functional change to `prune.mjs` except:
- `SIZE_LIMIT_BYTES` becomes `10 * 1024 * 1024`;
- tests/docs updated for the new limit;
- prune must treat the subset rule as a normal no-range rule and keep it;
- prune deletes all core shards because no kept rule references them;
- prune's per-page rule removal must not remove the synthetic rule (no `unicode-range` => always keep).

The subset step writes subset files before prune; prune's keep set includes them. The size guard runs after prune.

## 7. Audit

### 7.1 Deployed coverage for no-range rules

Current `deployedByName` marks no-range rules as `coversAll`. Change it:

- For a rule with `unicode-range`, use the intervals (current behavior).
- For a rule without `unicode-range` and with a local font URL, load the file and parse it with `fontkitten.create(buffer)`; use `font.characterSet` as the deployed coverage.
- Cache parsed character sets by absolute file path within one audit run.
- If parsing fails, fatal.

This makes core subset coverage exact; non-core no-range fonts also get cmap coverage, which is safe.

### 7.2 Fatal/warning rules

- `sourceCovered && !deployedCovered` -> fatal (subset/prune dropped a needed glyph).
- `!sourceCovered` -> warning (source font itself lacks the glyph), unchanged.
- Dangling URL / orphan font file checks remain.
- `deployedCoversAll` is no longer assumed for core families; the report should record `deployedCharacterSets` or per-page coverage source.

## 8. Tests

New `scripts/fonts/subset.test.mjs`, added to `npm test` and `test:fonts`:

1. Source archive inspection: verifies manifest/files/licenses, rejects traversal/links/duplicate/extra entries.
2. Source cache install/verify/offline failure.
3. Subset corpus decoding (entities, CSS escapes, linked CSS content).
4. Subset generation with a small real WOFF2 fixture; output is valid WOFF2 and contains all corpus characters used on the page.
5. HTML rewrite: core rules removed, one synthetic rule remains, variables/other CSS preserved, visible text unchanged, base prefix preserved.
6. `--dry-run` writes nothing.
7. Report shape/determinism (same corpus/source/subsetter => same hash).
8. Audit: subset missing a source-covered glyph -> fatal; subset covering all -> passes; dangling/orphan still fatal.

Existing tests:
- `fonts.test.mjs`: source package download/prepare/check fixtures; update the expected cache counts.
- `prune.test.mjs`: size limit 10 MiB; synthetic no-range rule is kept.
- Full `npm test`.

Integration:

- `npm run fonts:prepare` downloads sources (or reuse local cache); `npm run fonts:check` offline.
- `npm run build`; assert dist ≤10 MiB, core fonts ≤1.2 MiB, font shards for core families = 0.
- Representative browsers: one LXGW page, one Zhuque page, one Ark page, switcher, Latin-only; expect 1-3 font requests per page, 0 404, core font hit.
- Base `/demo` build + subset + prune; font URLs/link carry `/demo`.
- 375px/reduced-motion/no-JS at least once for the shared mechanism; record limitations.

## 9. Documentation

- New ADR `docs/adr/0014-content-subset-fonts.md`: source complete/deployment subset, license basis, lazy cache invalidation, rejected alternatives; note that ADR 0013's glyph rejection is superseded for core fonts.
- `CONTEXT.md`: add `Deployment subset set（部署子集）`; update `Deployment shard set` to distinguish non-core shards; update `Font coverage contract`.
- `docs/rules/operations.md`: build order, source prepare/check, subset step, 10 MiB guard.
- `docs/fonts/selection-guide.md`: source archive + content subset pipeline, license/derived manifest.
- `README.md`, `SPEC.md`, `docs/README.md`, `docs/verification/shared.md`, `change-log/0.20.0.md`.
- `package.json` version 0.20.0; add dependencies; build script.

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Subset leaks a missing glyph | Global corpus is over-approximate; audit parses actual subset cmap and fails on source-covered misses. |
| Layout features dropped | `subset-font` retains all layout features by default; tests/browser check CJK punctuation and Latin. |
| License/RFN violation | LXGW web subset permission; Zhuque/Ark no RFN; keep source licenses; web-only WOFF2; ADR records it. |
| Source archive download too large | Only three core families (~20 MB compressed); cached; offline after prepare. |
| Determinism | Pin subsetter version; report source/corpus/subset hashes; test same input -> same output. |
| Cache invalidation | Subset hash changes with text; expected static rebuild behavior; document. |
| Base path | Derive prefix from existing core rule; `/demo` build test. |
| Audit hides missing subset glyphs | No-range core rules use fontkitten characterSet, not coversAll. |
| Fork environment | Node/WASM only; no Python; source download in prepare. |
| Prune deletes subset file | Subset rule kept (no range) -> URL in keep set; audit checks orphan/dangling. |
| Build order mistake | `subset` before `prune`; integration test asserts core shards = 0 and subset files referenced. |

## 11. Rollback

- Revert `fonts:subset` from `package.json` build order and remove new modules/tests/dependencies.
- Restore 15 MiB limit if desired; rebuild with shard pruning only.
- Source cache is ignored; no catalog/lock/font source changes to revert.
- Subset fonts are generated; deleting them and rebuilding restores the sharded dist.
