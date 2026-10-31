# Research Notes

Research date: 2026-10-30.

## Pinned Facts

- `cn-font-split@7.4.3` is the current package inspected locally. Its API writes generated font files plus CSS into `outDir`; output uses `unicode-range` and can use a stable `renameOutputFont` pattern.
- `cn-font-split` v6+ does not accept WOFF2 directly; source must be TTF/OTF or converted first.
- `fontkitten@1.0.3` parses TTF/WOFF/WOFF2 and exposes family/style/weight metadata plus `characterSet`.
- Current source sizes: Zhuque v0.212 TTF 8,824,084 bytes; Ark Pixel 12px zh-Hans WOFF2 554,204 bytes for the existing subset source; LXGW WenKai GB v1.521 Medium TTF 25,596,480 bytes.
- Zhuque official Release v0.212: https://github.com/TrionesType/zhuque/releases/tag/v0.212
- Ark Pixel 2026.10.16 OTF/ WOFF2 assets: https://github.com/TakWolf/ark-pixel-font/releases/tag/2026.10.16
- LXGW WenKai GB v1.521 Medium TTF: https://github.com/lxgw/LxgwWenkaiGB/releases/tag/v1.521
- Google's CJK slicing guidance confirms frequency/co-occurrence grouping is better than uniform arbitrary chunks: https://web.dev/api-for-fast-beautiful-web-fonts/

## Design Consequences

- Pin tool versions and parser tests because generated CSS is the source of shard-to-range mapping.
- Separate source archives from production packages.
- Make release tags immutable and never overwrite assets.
- Build deterministic archives and compare two runs.
- The initial fixed-font migration can package existing WOFF2 bytes, but source/provenance contracts must still be explicit.
