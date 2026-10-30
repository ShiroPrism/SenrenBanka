# Local-provider font source index

Canonical external repository:
[whitehair-failure/SenrenBanka-fonts](https://github.com/whitehair-failure/SenrenBanka-fonts)

Migration baseline:

- Catalog release: `catalog-v1.0.0`
- Catalog version: `1.0.0`
- Catalog SHA-256: `3ec45b912b0cae17fad5438d4dbf7443fc108c65284bc8597923329bf3d55b4c`
- External repository commit: `f666c5ee03d04ab7c5f7482e8edcde1d80aafea4`
- Package URL base: `https://github.com/whitehair-failure/SenrenBanka-fonts/releases/download`

Each family package contains `manifest.json`, `font.css`, its WOFF2 files, and
the reviewed upstream license text under `licenses/`. `npm run fonts:prepare`
installs those files into the ignored `.cache/fonts/` cache after verifying the
catalog lock, outer archive hash, manifest schema, declared file inventory, and
each file hash.

| Family id | Registered name | Upstream project | SPDX | RFN status |
|---|---|---|---|---|
| `cutive-mono` | Cutive Mono | [googlefonts/cutivemono](https://github.com/googlefonts/cutivemono) | OFL-1.1 | no reserved name |
| `courier-prime` | Courier Prime | [quoteunquoteapps/CourierPrime](https://github.com/quoteunquoteapps/CourierPrime) | OFL-1.1 | no reserved name |
| `sorts-mill-goudy` | Sorts Mill Goudy | [theleagueof/sorts-mill-goudy](https://github.com/theleagueof/sorts-mill-goudy) | OFL-1.1 | no reserved name |
| `share-tech-mono` | Share Tech Mono | [googlefonts/share-tech-mono](https://github.com/googlefonts/share-tech-mono) | OFL-1.1 | unmodified distribution |
| `league-mono` | League Mono | [theleagueof/league-mono](https://github.com/theleagueof/league-mono) | OFL-1.1 | no reserved name |
| `silkscreen` | Silkscreen | [googlefonts/silkscreen](https://github.com/googlefonts/silkscreen) | OFL-1.1 | no reserved name |
| `prociono` | Prociono | [theleagueof/prociono](https://github.com/theleagueof/prociono) | OFL-1.1 | no reserved name |
| `handjet` | Handjet Variable | [rosettatype/Handjet](https://github.com/rosettatype/Handjet) | OFL-1.1 | no reserved name |
| `league-gothic` | League Gothic Variable | [theleagueof/league-gothic](https://github.com/theleagueof/league-gothic) | OFL-1.1 | no reserved name |
| `blackout` | Blackout 2AM | [theleagueof/blackout](https://github.com/theleagueof/blackout) | OFL-1.1 | unmodified distribution |
| `uglytypist` | UglyTypist | [fontlibrary.org UglyTypist record](https://fontlibrary.org/en/font/uglytypist) | OFL-1.1 | unmodified distribution |
| `format-1452` | Format 1452 | [velvetyne/Format_1452](https://github.com/velvetyne/Format_1452) | OFL-1.1 | no reserved name |
| `fredoka` | Fredoka Variable | [googlefonts/fredoka](https://github.com/googlefonts/fredoka) | OFL-1.1 | no reserved name |
| `dseg7-classic` | DSEG7 Classic | [keshikan/DSEG](https://github.com/keshikan/DSEG) | OFL-1.1 | unmodified distribution |
| `dseg14-classic` | DSEG14 Classic | [keshikan/DSEG](https://github.com/keshikan/DSEG) | OFL-1.1 | unmodified distribution |
| `tt2020-base` | TT2020 Base | [ctrlcctrlv/TT2020](https://github.com/ctrlcctrlv/TT2020) | OFL-1.1 | no reserved name |
| `tt2020-style-d` | TT2020 Style D | [ctrlcctrlv/TT2020](https://github.com/ctrlcctrlv/TT2020) | OFL-1.1 | no reserved name |
| `zhuque-fangsong` | Zhuque Fangsong | [TrionesType/zhuque](https://github.com/TrionesType/zhuque) | OFL-1.1 | no reserved name |
| `ark-pixel-12px` | Ark Pixel 12px | [TakWolf/ark-pixel-font](https://github.com/TakWolf/ark-pixel-font) | OFL-1.1 | no reserved name |
| `lxgw-wenkai` | LXGW WenKai GB | [lxgw/LxgwWenkaiGB](https://github.com/lxgw/LxgwWenkaiGB) | OFL-1.1 | web embedding and sharded redistribution permission recorded in manifest |

The package manifests are the authoritative machine-readable license record.
`fonts.catalog.json` preserves the selected family manifests and complete
package file inventory; `fonts.lock.json` pins their digests.

`fonts.config.json` contains one compatibility override for Format 1452:
the external package records the face's intrinsic metadata as weight 500,
while this site has always registered it as 400. The override preserves the
pre-migration CSS registration without rewriting the signed package manifest.
