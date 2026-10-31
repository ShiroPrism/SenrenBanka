# Implementation plan — content subset of core CJK fonts

## Preconditions

- Parent shard-pruning task is committed (`eefdbc1`).
- Work on a dedicated branch; do not commit until the user explicitly approves.
- `subset-font@2.9.0` and `fontkitten@1.0.3` are pinned devDependencies.
- Core source archives are available from the catalog; for local development the font repo's `artifacts/*-source.tar.gz` may be used to seed the source cache, but the production code must download from the lock URLs.

## Ordered checklist

### 1. Source cache + prepare/check

- [ ] Add `.cache/font-sources/<catalogVersion>/<id>@<version>/` path constant.
- [ ] Export a safe USTAR source archive reader from `scripts/fonts/lib/archive.mjs` or add `inspectSourceArchiveBuffer`.
- [ ] Implement source cache install/verify with marker, source font, licenses, source manifest; atomic install + file lock.
- [ ] Extend `prepareFonts` to download/verify sources for `role: core-cjk`; reuse offline, clear error when missing.
- [ ] Extend `checkFonts` to verify source caches offline; update summary counts.
- [ ] CLI/log summaries for sources.
- [ ] Tests: source archive positive/negative, cache verify, offline failure, no network in `fonts:check`.

### 2. Subset module + CLI

- [ ] Add `subset-font` and `fontkitten` to `package.json` devDependencies and lockfile.
- [ ] Create `scripts/fonts/subset.mjs`:
  - global dist corpus (reuse `font-css` helpers);
  - load source font for each core family;
  - `subsetFont(source, corpus, { targetFormat: 'woff2' })`;
  - write subset files under `dist/_astro/fonts/`;
  - rewrite inline `@font-face` rules per page (core rules -> one synthetic rule, no unicode-range);
  - visible-text before/after equality;
  - base prefix from existing font URL;
  - report `.cache/fonts/subset-report.json`;
  - `--dry-run`, `--dist`.
- [ ] Add `subset` to `scripts/fonts/cli.mjs`; add `"fonts:subset"` script.
- [ ] Update build order:
  `... astro build && fonts:subset && fonts:prune && verify:html-only && fonts:audit`.
- [ ] Tests: corpus decoding, subset validity/coverage, HTML rewrite, base prefix, dry-run, determinism, already-subset/no-op behavior.

### 3. Prune limit + integration

- [ ] Change `SIZE_LIMIT_BYTES` from 15 MiB to **10 MiB**; update tests/docs.
- [ ] Confirm prune keeps the synthetic no-range rule, deletes core shards, and keeps subset files.
- [ ] Assert final core shard count = 0 and core font files <= 1.2 MiB.
- [ ] `npm run build`; measure dist; expected 5.5–6.5 MiB.

### 4. Audit cmap coverage

- [ ] For no-range rules with local font URLs, parse the font with `fontkitten.create` and use `font.characterSet` for deployed coverage.
- [ ] Cache character sets per file in one audit run; parse failure = fatal.
- [ ] Keep source-covered/deployed-missing fatal; source-missing warning.
- [ ] Add tests: subset missing a glyph -> fatal; complete subset -> pass; dangling/orphan unchanged.
- [ ] Keep existing sharded-font tests working (ranges still used).

### 5. Browser / base verification

- [ ] `npm run fonts:prepare` (source download or seeded cache), `npm run fonts:check` offline.
- [ ] Representative pages: LXGW, Zhuque, Ark, Latin-only, switcher.
  - expect 1–3 font requests per page (not 30+);
  - 0 font 404 / console errors;
  - actual core font request corresponds to the subset family;
  - visible text unchanged.
- [ ] `--base /demo` build + subset + prune; assert `/demo` prefix and audit pass.
- [ ] 375px / reduced-motion / no-JS shared-mechanism regression (or record limitation).
- [ ] Update `docs/verification/shared.md`.

### 6. Docs / ADR / version

- [ ] Add `docs/adr/0014-content-subset-fonts.md`; update ADR 0013 cross-reference.
- [ ] Update `CONTEXT.md` (`Deployment subset set`, `Deployment shard set`, `Font coverage contract`).
- [ ] Update `docs/rules/operations.md`, `docs/fonts/selection-guide.md`, `README.md`, `SPEC.md`, `docs/README.md`.
- [ ] Add `change-log/0.20.0.md`; bump package/lock version to `0.20.0`.
- [ ] Update `docs/verification/shared.md` with measured before/after and limitations.

### 7. Final verification

```bash
npm run fonts:check          # offline, packages + sources
npm run check
npm test
npm run build
npm run fonts:audit
du -sh dist
```

- [ ] dist ≤10 MiB; core fonts ≤1.2 MiB; core shards = 0.
- [ ] No dangling/orphan font references; no third-party URLs/machine paths.
- [ ] No source font, catalog, lock, or design file modified.
- [ ] Review final diff; commit only after explicit user approval.

## Rollback points

| Point | Action |
|---|---|
| After source cache work | Revert source modules/tests; prepare/check return to package-only. |
| After subset module before build integration | Remove subset command/tests; no build behavior change. |
| After build integration | Remove `fonts:subset` from build; rebuild restores sharded dist. |
| After docs/ADR | Revert docs; code remains. |

No catalog/lock/font source changes are made, so rollback never needs to restore external font assets.

## Risks to watch

- Source archive parsing must not accept links/traversal/extra files.
- Subset corpus must include runtime strings, attributes, CSS `content`, and linked CSS/JS.
- `subset-font` must retain layout features; default is all features.
- Audit must parse the actual subset cmap, not assume no-range = full coverage.
- Prune's no-range keep rule is mandatory; otherwise the subset file becomes orphan.
- Size limit must be 10 MiB in code, tests, docs, and reports.
- Determinism: same source/corpus/subsetter -> same output hash.
