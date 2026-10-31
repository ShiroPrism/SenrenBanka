# Content-subset font research (2026-10-31)

## Baseline after shard pruning

Current committed `dist` (v0.19.0) is 14,520,742 B / 13.85 MiB. Fonts are 9,147,548 B / 247 shards:

| Family | Pruned bytes | Shards |
|---|---:|---:|
| LXGW WenKai GB | 4.00 MiB | 88 |
| Zhuque Fangsong | 3.04 MiB | 94 |
| Ark Pixel 12px | 0.81 MiB | 34 |
| All other fonts | 0.87 MiB | 31 |
| **Total** | **8.72 MiB** | **247** |

The site uses ~1,261 distinct characters across all final HTML/CSS/JS/JSON; the core shards carry roughly 40k glyph slots because shard granularity is 70 KiB per target.

Page-level union after excluding the three `/{locale}/designs/` switcher pages: 207 shards / 6.83 MiB. The switcher previews add 40 shards / 1.89 MiB.

## Source fonts

The external font catalog source archives contain one source font + license + `source-manifest.json` per core family:

| Family | Source file | Source bytes | Archive bytes |
|---|---|---:|---:|
| lxgw-wenkai | LXGWWenKaiGB-Medium.ttf | 25,596,480 | 13,233,017 |
| zhuque-fangsong | ZhuqueFangsong-Regular.ttf | 8,824,084 | 5,874,251 |
| ark-pixel-12px | ark-pixel-12px-monospaced-zh_hans.otf | 3,607,968 | 870,477 |

`fonts.lock.json` already records the source archive SHA-256 and size for each family. `fonts:prepare` currently downloads only production packages.

## Subsetter prototype

`subset-font@2.9.0` (BSD-3-Clause, HarfBuzz WASM) was installed in a temporary cache and run against the source fonts with the 1,261-character corpus:

| Family | Subset WOFF2 |
|---|---:|
| LXGW WenKai GB | 272,948 B |
| Zhuque Fangsong | 382,396 B |
| Ark Pixel 12px | 35,964 B |
| **Core total** | **691,308 B (0.66 MiB)** |

The same corpus via `pyftsubset` produced 277,636 / 386,860 / 36,324 B, confirming the WASM result. `subset-font` retains all layout features by default and outputs WOFF2.

Projected final dist:

- core fonts 0.66 MiB + other fonts 0.87 MiB = ~1.53 MiB fonts
- HTML 3.54 MiB, design CSS 0.54 MiB, image 0.30 MiB, JS 0.01 MiB
- font CSS shrinks from 0.96 MiB to a few KB (one rule per core family)
- **projected total ~5.5–6.5 MiB**

## Source archive shape

Example entry list:

```text
source-manifest.json
source/fonts/<source-font>
source/licenses/LICENSE.txt
```

`source-manifest.json` records `files[]` and `licenses[]` with SHA-256 and size. The catalog manifest's `source.files` mirrors the font file hashes; the license files are mirrored under `manifest.license.files`.

## License facts

- LXGW WenKai GB: OFL-1.1 with an additional permission for web-only subsetting/WOFF2 conversion, provided the modified font is not made available as an installable desktop font.
- Zhuque Fangsong: OFL-1.1, no Reserved Font Name.
- Ark Pixel 12px: OFL-1.1, no Reserved Font Name.
- `subset-font`: BSD-3-Clause; `fontkitten`: MIT.

The deployed subset is web-only WOFF2; source archives and their licenses remain in the ignored source cache for provenance.

## Rejected alternatives

- Smaller shard chunk size: measured Zhuque at 16 KiB target only 3.04 -> 2.71 MiB; not enough for the cross-repo catalog release cost.
- Drop switcher preview fonts: saves only 1.89 MiB and degrades the preview gallery.
- Keep full shards: leaves 8.72 MiB fonts and 13.85 MiB dist.
