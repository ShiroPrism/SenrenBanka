# Technical design — build-time font shard pruning

## 1. Scope and invariants

This design implements PRD R1–R7 only. Invariants:

- No font file is opened, parsed, or rewritten; only whole catalog shards are kept or deleted.
- No design markup, copy, or CSS is changed. The prune step may only:
  - remove `@font-face` blocks from inline `<style>` elements;
  - remove an inline `<style>` element if it becomes whitespace-only;
  - insert one `<link rel="stylesheet">` for the kept font rules;
  - delete unreferenced files under `dist/_astro/fonts/`;
  - write new CSS files under `dist/_astro/`.
- `fonts.lock.json`, `fonts.catalog.json`, `fonts.config.json`, `src/fonts/generated.ts`, and `.cache/fonts/` are not modified.
- The pipeline remains Node-only. Reuse existing parsing helpers where practical; no new package dependencies.
- Language expansion is out of scope; the implementation must stay locale-agnostic and work for any future text automatically.

## 2. Current pipeline

`npm run build`:

```text
fonts:check -> check (docs + fonts:typography + astro check) -> astro build
-> verify:html-only -> fonts:audit
```

`astro build` writes:
- one HTML file per locale/design plus switcher/entry/404/legacy pages;
- hashed design CSS/JS/assets under `dist/_astro/`;
- hashed font shards under `dist/_astro/fonts/`;
- Astro `<Font>` emits `@font-face` rules inside inline `<style>` in each page, plus `--font-*` variable declarations.

Current audit reads inline styles to detect active core families, extracts visible HTML text, and checks CJK coverage against the full catalog manifest. It does not inspect deployed shard files.

## 3. New pipeline

```text
fonts:check -> check -> astro build
-> fonts:prune (scan, prune rules, externalize CSS, delete shards, size guard)
-> verify:html-only -> fonts:audit (deployed-set aware)
```

New command:

```bash
npm run fonts:prune
# internally: node scripts/fonts/cli.mjs prune [--dist dist] [--dry-run]
```

`fonts:prune` runs once after `astro build`. It is deterministic and idempotence is explicitly handled (see §8).

## 4. Module layout

New pure helpers in `scripts/fonts/lib/font-css.mjs`:

- `parseUnicodeRangeToken(token)` — supports `U+XXXX`, `U+XXXX-YYYY`, `U+4??`; returns `[start, end]`.
- `parseFontFaceRules(css)` — returns rules in source order:
  ```ts
  {
    raw: string;             // full @font-face{...} text
    family: string | null;   // font-family value, unquoted
    urls: string[];          // url(...) values, quotes removed, data: excluded
    ranges: Array<[number, number]> | null; // null = no unicode-range (always keep)
  }
  ```
- `extractInlineStyles(html)` — all `<style>` blocks.
- `extractLinkedLocalAssets(html)` — local `href`/`src` values ending in `.css` / `.js` (ignore `http:`, `//`, `data:`).
- `decodeHtmlEntities(text)` — reuse the audit's decoder or export it.
- `decodeCssEscapes(text)` — decode `\XXXXXX` / `\XX` sequences for corpus collection.
- `collectCorpus(text)` — `Set<number>` of Unicode code points after decoding.
- `resolveDistAsset(distRoot, pagePath, url)` — resolve a site URL to a file under `dist`, with path containment checks.

Refactor `scripts/fonts/audit.mjs` to use `parseUnicodeRangeToken`, `extractInlineStyles`, and `resolveDistAsset` instead of duplicating them. Keep `extractVisibleText` and `isCjkCodePoint` exports for existing tests.

New module `scripts/fonts/prune.mjs` exports `pruneFonts({ projectRoot, distDir, dryRun, logger })` and returns a report object.

## 5. Corpus collection

### 5.1 Per-page corpus

For each HTML file under `dist`:

1. Read the HTML as UTF-8.
2. Add all code points from the raw HTML (after HTML entity decoding).
3. Find local stylesheet/script URLs referenced by the page; resolve them under `dist`; if readable, add their raw text after HTML entity + CSS escape decoding.
4. Include inline `<style>` and `<script>` content implicitly through the raw HTML scan.
5. Include decoded HTML entities and CSS escapes.

The raw-HTML scan is deliberately over-approximate: it includes attribute values, `<title>`, meta content, hidden/template text, inline JSON (`data-cm-config`/`<script type="application/json">`), and CSS/JS strings. It may include code identifiers or comments from linked CSS/JS; that only keeps extra shards, never drops a needed one.

### 5.2 Global corpus and verification corpus

- The per-page corpus decides which `@font-face` rules stay in that page.
- The union of all kept rule URLs decides which font files remain in `dist`.
- The audit independently extracts visible text and verifies deployed coverage (see §7).

### 5.3 Text safety check

For each page, capture the visible text before rewriting and after rewriting. They must be byte-for-byte equal (UTF-8). If they differ, abort the prune without deleting files. This guards against breaking HTML/CSS/JS while removing rules.

## 6. Rule pruning and externalization

### 6.1 Per-page rule decision

For each `<style>` block in a page:

1. Find all complete `@font-face{...}` blocks with a regex that cannot cross a `}` (font-face blocks have no nested braces).
2. For each rule:
   - If `ranges === null` or `ranges.length === 0`: keep.
   - Else keep if any code point in the page corpus falls in any range.
   - Else remove.
3. Preserve all non-font-face CSS in the block.
4. If the resulting block is whitespace-only, remove the `<style>` element; otherwise keep it with its original attributes.

The page's kept rules are collected in document order.

### 6.2 Shared CSS files

Group pages by the set of `font-family` names used by their kept rules (a page with an unparseable family gets a page-private group). For each group:

1. The CSS content is the union of kept rules across all pages in the group, in first-seen document order, joined with `\n`.
2. Compute SHA-256 of the UTF-8 CSS content; use the first 16 hex characters as `hash`.
3. Write `dist/_astro/fonts-<hash>.css` if it does not already exist. If a file with the same hash exists but different content (collision), extend the hash deterministically; abort if still colliding.
4. Each page in the group inserts one link before the first `<style>` block that contained `@font-face`:
   ```html
   <link rel="stylesheet" href="<base>/_astro/fonts-<hash>.css">
   ```
   - `<base>` is derived from an existing font URL in the page: take the substring before `_astro/fonts/`, e.g. `/_astro/fonts/x.woff2` -> `/_astro/`; `/demo/_astro/fonts/x.woff2` -> `/demo/_astro/`.
   - If no font URL is available, abort; a font CSS link cannot be generated without an absolute site prefix.
   - If the first font `<style>` is removed, the link still goes where that tag was, inside `<head>`.
5. Do not insert duplicate links if the page already has a link to the same CSS file (idempotence guard).
6. The external CSS contains only `@font-face` blocks. It must not contain `@charset`, comments, or design CSS.

Family-set grouping is deliberate: locale variants of one design share one font CSS file even if one locale needs a few extra shards; the browser still downloads only shards matching the rendered text. The switcher page has its own all-font CSS file. This does not aggregate design CSS or violate per-design CSS isolation.

### 6.3 Font file keep set

- Collect every URL from every kept rule across all pages.
- Resolve each URL to a file under `dist`; fail if it does not exist.
- Keep those files.
- Enumerate all regular files under `dist/_astro/fonts/` with font extensions (`.woff2`, `.woff`, `.ttf`, `.otf`). Delete files not in the keep set.
- Never delete files outside `dist/_astro/fonts/`; never follow symlinks; verify resolved paths stay under `dist`.

### 6.4 Size guard

Compute the sum of file sizes under `dist` after all writes/deletions. If `> 15 * 1024 * 1024` bytes, throw with:
- total bytes;
- font bytes and count;
- HTML/CSS/JS/other buckets;
- top 10 largest files;
- the path to the prune report.

Report path: `.cache/fonts/prune-report.json` (ignored). The report includes before/after counts and bytes, kept/removed rules, kept/deleted files, per-page rule counts, and visible-text hashes.

## 7. Audit changes

`fonts:audit` remains the post-build guard, now deployed-set aware.

### 7.1 Parse deployed font faces

For each HTML page:
- Collect inline `<style>` CSS and linked local CSS files.
- Parse all `@font-face` rules with `parseFontFaceRules`.
- Map `font-family` (the hashed family name used by `--font-*`) to rules.
- Verify every `url(...)` resolves to an existing file under `dist`; missing file = fatal.
- Verify every font file under `dist/_astro/fonts/` is referenced by at least one rule; orphan = fatal.

### 7.2 Coverage check

For each page:
- Detect active core families from inline `--font-<id>: "<hashed family>"` declarations (existing behavior).
- Extract visible text (existing `extractVisibleText`).
- For each CJK code point:
  - `sourceCovered`: full catalog coverage (existing `coverageForFamily`).
  - `deployedCovered`: any kept rule for an active core family whose range covers the code point, or a kept rule without ranges.
  - If `sourceCovered && !deployedCovered`: **fatal** (pruning removed a needed shard).
  - If `!sourceCovered`: warning (existing behavior).
- Keep the report's `uncovered` warnings and add `deployedGaps` / `danglingFontUrls` sections.

The audit must not rely on the full catalog coverage alone after pruning; that was the old behavior and would hide a missing deployed shard.

### 7.3 Artifact safety

Retain the existing third-party URL / machine path checks. The new CSS files and links must pass them (no machine paths, no external font URLs).

## 8. Idempotence and failure behavior

- If `dist` contains no inline `@font-face` rules and already contains `_astro/fonts-*.css` links, treat it as already pruned: verify links exist and return a no-op report. Do not re-add rules or duplicate links.
- Write new CSS files first; rewrite HTML; delete unused font files last. If any step throws:
  - do not delete font files;
  - leave the build failed (non-zero exit);
  - the next `astro build` starts from a clean dist.
- `--dry-run` computes and reports all decisions without writing/deleting anything. Used in tests and local inspection.
- The prune step must not run on a missing/empty `dist`; fail with a clear "run astro build first" message.

## 9. Base path handling

All existing Astro asset URLs are absolute and already include the build base (e.g. `/demo/_astro/...`). The prune step must:
- derive the new CSS href prefix from an existing font URL, not from configuration;
- resolve font URLs by locating the `_astro/` segment and joining with `dist`, so `/demo/_astro/fonts/x.woff2` and `/_astro/fonts/x.woff2` both work;
- never write a machine path or a hard-coded `/` base.

Verification must include a `/demo` build + prune + browser check.

## 10. Testing

New `scripts/fonts/prune.test.mjs` (Node built-in test runner), added to `npm test`:

1. `parseUnicodeRangeToken` handles exact, range, and wildcard tokens.
2. `parseFontFaceRules` extracts family, multiple URLs, ranges; no-range rule is keep-always.
3. Per-page corpus includes HTML entities, attributes, inline JSON, linked CSS `content: "・"`, and CSS escapes (`\30FB`).
4. Rule removal keeps variables/other CSS; empty `<style>` is removed; visible text hash is unchanged.
5. Shared file keep set deletes unused shards and keeps shards used by any page.
6. Pages with the same font-family set reuse one CSS file (union of their rules); different family sets get different hashes; link href preserves `/demo/` prefix.
7. `--dry-run` does not modify the tree.
8. Size guard fails above 15 MiB and passes below.
9. Already-pruned dist is a no-op; missing link/file fails.
10. Path traversal / `..` font URL is rejected.

Existing `scripts/fonts.test.mjs`:
- Add audit fixture: a page whose CJK text is source-covered but no deployed rule covers it -> audit throws.
- Add dangling URL and orphan font file fixtures -> audit throws/warns as specified.
- Keep existing covered/uncovered CJK tests.

Integration / manual verification:
- `npm run build` on the real repo; assert ≤15 MiB.
- `npm run fonts:prune -- --dry-run` report before a real run.
- Base build: `MSYS2_ARG_CONV_EXCL='*' npx astro build --outDir dist-demo --base /demo`, then prune with `--dist dist-demo`, then browser check.
- Browser: `npm run preview`; use Playwright/CDP on representative pages:
  - `zh-cn/little-forest` (LXGW),
  - `zh-cn/archive` (Zhuque),
  - `zh-cn/pixel-pet-rpg` (Ark Pixel),
  - `en/editorial` (Latin-only),
  - `zh-cn/designs` (all-font switcher).
  - Assert no font 404, requested font URLs exist, visible text unchanged, and normal rendering actually requests the expected core-font shards. Use CDP platform font info for at least one CJK node; do not use forced `document.fonts.load()`.
- Update `docs/verification/shared.md` with measured before/after and evidence.

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Raw HTML corpus misses runtime text | Scan linked JS/CSS, inline JSON, attributes, CSS content/escapes; over-approximate rather than under-approximate. |
| HTML rewrite changes markup/text | Visible-text before/after equality check; abort without deleting fonts. |
| External CSS link breaks under base path | Derive prefix from existing font URL; `/demo` build test. |
| Font CSS externalization violates CSS isolation | CSS contains only `@font-face`; per-page/per-design grouping; no design CSS aggregation. |
| Size still >15 MiB | Externalize CSS; if still over, report top files and revisit (do not silently raise the limit). |
| Audit hides missing shards | Deployed-set coverage check with fatal `sourceCovered && !deployedCovered`. |
| Idempotence / double links | Detect already-pruned dist; dedupe links by href. |
| Path traversal via font URLs | Resolve and enforce containment under `dist`; reject `..`. |
| Fork users lack fonts | `fonts:prepare` downloads from the catalog; no local-font requirement. |

## 12. Alternatives rejected

- **Glyph-level subsetting (Q18 B/C):** smaller final payload, but modifies font bytes, requires source fonts and a new subsetter/toolchain, breaks the catalog lock model, risks OpenType features, and invalidates browser cache on every content change. Not needed after shard pruning + CSS externalization.
- **Keep all shards, externalize CSS only:** projected ~27 MB, misses the 15 MiB target.
- **Site-wide single CSS file for all fonts:** would aggregate fonts across designs and defeat per-design CSS isolation/caching semantics; rejected. Per-page rule-set hashing gives sharing without cross-design style aggregation.
- **System fonts instead of self-hosted:** violates design fidelity and the existing font contract.

## 13. Rollback

The step is post-build and does not modify source-controlled font assets. Rollback:
1. Remove `fonts:prune` from `package.json` build order.
2. Revert the new `scripts/fonts/prune.mjs`, helper/test files, and audit changes.
3. Rebuild; `dist` returns to the full-shard output.

No catalog/lock/font repository changes are involved.
