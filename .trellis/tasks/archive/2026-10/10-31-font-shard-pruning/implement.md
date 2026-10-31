# Implementation plan — font shard pruning

## Preconditions

- Task status becomes `in_progress` only after `task.py start` following PRD/design review.
- Work on a dedicated branch; do not commit until the user explicitly approves the final diff.
- `.cache/fonts/` must be prepared (`npm run fonts:prepare`) before a full build.

## Ordered checklist

### 1. Shared parsing helpers

- [ ] Create `scripts/fonts/lib/font-css.mjs` with:
  - `parseUnicodeRangeToken`
  - `parseFontFaceRules`
  - `extractInlineStyles`
  - `extractLinkedLocalAssets`
  - `decodeHtmlEntities`
  - `decodeCssEscapes`
  - `collectCorpus`
  - `resolveDistAsset`
- [ ] Reuse the audit's existing entity decoder / unicode-range parser instead of duplicating semantics.
- [ ] Refactor `scripts/fonts/audit.mjs` to import the shared helpers; keep `extractVisibleText` and `isCjkCodePoint` exports.
- [ ] Add unit tests for range parsing, wildcard ranges, multiple `url()` sources, CSS escapes, HTML entities, and path containment.

Validation:

```bash
node --test scripts/fonts/prune.test.mjs
```

Review gate A: helpers + tests green; existing `npm run test:fonts` still green.

### 2. Prune module

- [ ] Create `scripts/fonts/prune.mjs`:
  - per-page corpus collection (raw HTML + linked local CSS/JS + decoded entities/escapes);
  - per-page rule keep/remove;
  - visible-text before/after equality check;
  - shared CSS hashing and `_astro/fonts-<hash>.css` writing;
  - link injection with base-prefix derivation;
  - font file keep set and deletion;
  - size guard (15 MiB);
  - `--dry-run` and JSON report at `.cache/fonts/prune-report.json`.
- [ ] Make the step idempotent / detect already-pruned dist.
- [ ] Reject URL path traversal and symlink escapes.

Validation:

```bash
node --test scripts/fonts/prune.test.mjs
npm run fonts:prune -- --dry-run
```

Review gate B: dry-run report shows expected kept shards (~250) and no writes.

### 3. CLI + build integration

- [ ] Add `prune` to `scripts/fonts/cli.mjs` with `--dist`, `--dry-run`.
- [ ] Add `"fonts:prune": "node scripts/fonts/cli.mjs prune"` to `package.json`.
- [ ] Update `build` to:
  ```text
  fonts:check && check && astro build && fonts:prune && verify:html-only && fonts:audit
  ```
- [ ] Keep `fonts:prepare` / `fonts:check` semantics unchanged.

Validation:

```bash
npm run build
du -sh dist
```

Acceptance gate: `dist` ≤ 15 MiB; font count/bytes match the report.

### 4. Audit updates

- [ ] Parse deployed `@font-face` rules from inline styles + linked CSS.
- [ ] Fail on dangling font URLs.
- [ ] Fail on orphan files under `dist/_astro/fonts/`.
- [ ] Fail when `sourceCovered && !deployedCovered` for CJK text.
- [ ] Preserve warning behavior for source-missing CJK glyphs.
- [ ] Add audit fixture tests: missing deployed shard, dangling URL, orphan file.

Validation:

```bash
npm run fonts:audit
npm run test:fonts
```

Review gate C: audit passes on the pruned build and fails on each deliberate negative fixture.

### 5. Base-path and offline checks

- [ ] Build with base:
  ```bash
  MSYS2_ARG_CONV_EXCL='*' npx astro build --outDir dist-demo --base /demo
  npm run fonts:prune -- --dist dist-demo
  ```
- [ ] Assert CSS link and font URLs resolve under `/demo/`.
- [ ] Run `npm run fonts:check` offline.
- [ ] Confirm `fonts:prepare` + build works without any local font installation.

### 6. Browser verification (design-page-verify)

Representative pages:

- `zh-cn/little-forest` (LXGW)
- `zh-cn/archive` (Zhuque)
- `zh-cn/pixel-pet-rpg` (Ark Pixel)
- `en/editorial` (Latin-only)
- `zh-cn/designs` (all-font switcher)

Assert:

- [ ] 0 font 404s, 0 console errors.
- [ ] Requested font files exist and are declared by the page CSS.
- [ ] Normal rendering requests expected core-font shards.
- [ ] CDP platform font info for at least one CJK node matches the design's core font (do not use forced `document.fonts.load()`).
- [ ] Visible text is unchanged versus pre-prune.
- [ ] Base `/demo` page loads fonts without 404.
- [ ] Update `docs/verification/shared.md` with the current complete verification state and measured numbers.

Review gate D: browser evidence recorded; no design regression.

### 7. Documentation and domain model

- [ ] `docs/rules/operations.md`: add `fonts:prune`, build order, 15 MiB guard, deployment artifact explanation.
- [ ] `docs/fonts/selection-guide.md`: production pipeline now includes build-time shard pruning and CSS externalization; no glyph modification.
- [ ] `SPEC.md`: update font/build facts and acceptance criteria affected by pruning.
- [ ] `CONTEXT.md`: refine `Site subset` / `Font coverage contract`; add a term for the deployed shard set (build-time pruned, source fonts remain full).
- [ ] Add an ADR (`docs/adr/0013-build-time-font-shard-pruning.md`) recording the source-full/deployment-pruned trade-off and rejected glyph subsetting.
- [ ] If the package version is bumped, add `change-log/<version>.md`.

### 8. Final verification and wrap-up

Run in order:

```bash
npm run check
npm run test
npm run build
npm run fonts:audit
du -sh dist
```

Then:

- [ ] Confirm `dist` ≤ 15 MiB.
- [ ] Confirm no third-party font URL, no machine path, no dangling font references.
- [ ] Confirm the pruned dist renders representative pages correctly.
- [ ] Review the final diff; ensure no font catalog/lock/font binary changes.
- [ ] Present the diff and measured before/after; commit only after explicit user approval.

## Rollback points

| Point | Action |
|---|---|
| After helpers/tests | Revert helper/test files only. |
| After prune module but before build integration | Remove module/tests; no build behavior change yet. |
| After build integration | Remove `fonts:prune` from `package.json`; rebuild returns to full shards. |
| After docs/ADR | Revert docs; implementation remains. |

No source font, catalog, lock, or design file is modified by this task, so rollback never needs to restore font assets.

## Risks to watch during implementation

- Per-page corpus underestimation: always over-approximate (raw HTML + linked CSS/JS + decoded entities/escapes).
- HTML rewrite altering content: block deletion on visible-text hash mismatch.
- CSS externalization link/base bug: `/demo` build test is mandatory.
- Size target: if the first real build is slightly over 15 MiB, inspect the report and shrink duplicate HTML/CSS further; do not raise the threshold.
