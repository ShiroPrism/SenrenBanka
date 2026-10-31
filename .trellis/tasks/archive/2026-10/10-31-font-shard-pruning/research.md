# Font shard pruning research (2026-10-31)

## Current dist composition

Measured on the existing `dist` before this task.

| Part | Size | Count |
|---|---:|---:|
| `dist/_astro/fonts/*.woff2` | 21.37 MB | 611 |
| HTML | 11.31 MB | 105 |
| - inline `<style>` inside HTML | 9.06 MB | 80.1% of HTML |
| Shared CSS | 0.53 MB | 24 |
| Avatar PNG | 0.30 MB | 1 |
| JS | ~0.003 MB | 2 |

Font family attribution:

| Family | Size | Shards |
|---|---:|---:|
| LXGW WenKai GB | 13.06 MB | 328 |
| Zhuque Fangsong | 5.65 MB | 161 |
| Ark Pixel 12px | 1.20 MB | 55 |
| All remaining local + npm families | 1.46 MB | 67 |

Per-locale HTML is ~3.71 MB, of which ~2.99 MB is duplicated inline `@font-face` CSS.
The three locales repeat the same font CSS; unique inline style blobs total 3.00 MB across 26 page types.

`@font-face` appears only in inline HTML `<style>` blocks. No shared CSS file contains `@font-face`; there are no font preloads.

## Actual page transfer (production preview, no dev toolbar)

| Page | HTML | Font requests | Total |
|---|---:|---:|---:|
| `/en/editorial/` | 35 KB | ~0 | ~4 KB |
| `/zh-cn/little-forest/` | 276 KB | 1.14 MB / 31 shards | 1.44 MB (includes 303 KB avatar) |
| `/zh-cn/designs/` | 556 KB | 1.77 MB / 82 shards | 1.79 MB |

The 33.5 MB dist is a deployment artifact, not a single-page download. Browsers only fetch shards whose `unicode-range` matches rendered text.

## Pruning simulation

Corpus: all visible text in the 105 HTML files; union = 1,031 unique code points.
Shards whose declared `unicode-range` intersects that corpus: 229 of 611, 8.13 MB.

Per-page simulation using raw HTML + linked CSS/JS as an over-approximate page corpus:

- Kept rules: 2,321; removed rules: 7,891
- Kept shard files: 247 of 611; 8.72 MB
- HTML after removing unused rules: 5.53 MB
- Projected dist without font-CSS externalization: **15.08 MB** (slightly above the 15 MiB target)

Because the target is ≤15 MiB, A must also externalize the remaining `@font-face` rules into shared hashed CSS files:

- Unique font CSS after pruning: roughly 1.0–1.5 MB
- HTML drops from 5.53 MB to roughly 2.3 MB
- Projected dist: roughly **12–14 MB**

## Build/pipeline facts

- `fonts:prepare` downloads only locked production packages; it does not download source fonts (`scripts/fonts/prepare.mjs:31`).
- Font files are self-hosted under `dist/_astro/fonts/`; no third-party font URLs.
- `fonts:audit` currently checks CJK code points against the full catalog coverage, not against deployed files.
- No glyph-level subsetting is required: pruning whole catalog shards does not modify font bytes and does not trigger OFL RFN modification concerns.
- Core font licenses:
  - LXGW WenKai GB: OFL with an additional permission for web-only subsetting/WOFF2 conversion (not installable desktop fonts).
  - Zhuque Fangsong: OFL, no Reserved Font Name.
  - Ark Pixel 12px: OFL, no Reserved Font Name.

## Verification references

- Design-page verification skill: `.agents/skills/design-page-verify/SKILL.md`
- Shared mechanism verification record: `docs/verification/shared.md`
- Operations/build rules: `docs/rules/operations.md`
- Font selection and production pipeline: `docs/fonts/selection-guide.md`
