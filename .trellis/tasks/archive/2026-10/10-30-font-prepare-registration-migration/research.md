# Research Notes

Research date: 2026-10-30.

## Repository Facts

- `astro.config.mjs` currently registers 6 `fontProviders.npm({ remote: false })` families and 20 `fontProviders.local()` families across 18 asset directories.
- `src/assets/fonts/` contains 56 files (~1.49 MiB): 37 font files plus licenses/manifests.
- The current subset script reads profiles/messages and overwrites four target WOFF2 files only; it is not part of `npm run build`.
- The script skips missing source files and still exits successfully.
- `.local-fonts/` is ignored by the root `.*/` rule.
- Deploy workflow currently runs only `npm ci` then `npm run build`.

## Astro Provider Facts

- Installed Astro is 7.3.8.
- `LocalFontProvider` resolves source entries relative to the Astro project root and passes absolute filesystem paths to the font fetcher; a project-root hidden cache is technically valid.
- Local provider forwards `unicodeRange`, weight, style, stretch, display, feature settings, and variation settings.
- npm provider can still fetch fallback metrics from jsDelivr even with `remote: false`; project SPEC/pitfalls document this.
- `fonts` family supports `optimizedFallbacks: false`, which can remove the metrics network path for npm families at the cost of Astro's generated metric-adjusted fallback faces.

## Core CJK Sources

- Zhuque local source is `ZhuqueFangsong-Regular.ttf`, version 0.212, SHA-256 `558c62730844fe54ba220146ed62f859d4e2880188d92d985f8921c6e3743bc4`.
- LXGW WenKai GB Medium local source is version 1.521, SHA-256 `c23176a461f65d71a72aed32ed8ca32f29ebb7f8ae43c0ca3c3f08830de6180b`; official v1.521 asset size matches 25,596,480 bytes.
- Ark Pixel existing zh-Hans Mono WOFF2 reports version 2026.10.16. Its official release provides a 12px monospaced OTF zip for the same version; `cn-font-split` requires TTF/OTF rather than WOFF2 input.

## Implementation Consequences

- Generate lock/catalog/registration text; keep binaries in ignored `.cache/fonts/`.
- Do not run `fonts:prepare` from postinstall.
- Verify local provider source paths outside `src/` with a small build fixture before deleting existing assets.
- Compare generated family definitions with current config, including existing latin/latin-ext unicode ranges and variable-font metadata.
- Use final HTML plus generated coverage metadata for audit; browser verification remains the authority for actual CSS font selection.
