# Font Palette and Evidence

## New Production Families

### Fredoka Variable

- Source: Google Fonts / `@fontsource-variable/fredoka` package, OFL-1.1.
- Public license: `https://github.com/google/fonts/blob/main/ofl/fredoka/OFL.txt`.
- Examined files: latin 29,784 B; latin-ext 4,576 B; variable wght 300–700.
- Coverage: ASCII 95/95, Latin-1 letters 62/62, GB2312 0/6763, kana 0/176.
- Role: rounded toy/candy display and labels; CJK always falls to LXGW or system.
- No preload; `font-display: swap`.

### LXGW WenKai GB Medium

- Source: official `lxgw/LxgwWenkaiGB`, OFL-1.1.
- Public license: `https://github.com/lxgw/LxgwWenkaiGB/blob/main/OFL.txt`.
- Source face: Medium 500; 24.4MB full TTF.
- Coverage: ASCII 95/95, Latin-1 62/62, GB2312 6763/6763, kana 176/176, JIS X 0208 6953/6953; CJK punctuation 53/53.
- Role: warm handwritten/reading CJK voice for Fairy Kei, Sticker Diary, Little Forest, Magical Girl, with limited label use in Cute-alism.
- Production must be subset to actual site characters and rechecked after all messages are merged. The final measured size and missing-glyph policy must be recorded.
- No preload; `font-display: swap`.

## Reused Existing Families

| Family | Role | CJK behavior |
|---|---|---|
| `Inter` | readable body/UI | system CJK fallback |
| `UglyTypist` | Latin handwritten annotation | LXGW / system CJK |
| `Fraunces` | storybook / ornate display | LXGW / system serif |
| `Silkscreen` | pixel HUD | Ark Pixel |
| `Ark Pixel 12px` | CJK pixel voice | Songti / monospace fallback |
| `Handjet` | pixel numerals / counters | Silkscreen / Ark Pixel |
| `League Mono` | compact technical micro-labels | Inter / system |

## Fallback Discipline

- Display: target Latin face → `--font-lxgw` → `PingFang SC` / `Microsoft YaHei` → `Hiragino Sans` / `Yu Gothic UI` → generic family.
- Body: `Inter` → `--font-lxgw` → system CJK → `sans-serif`.
- Storybook: `Fraunces` → `--font-lxgw` → `Songti SC` / `SimSun` → `serif`.
- Pixel: Latin pixel face → Ark Pixel → system CJK → `monospace`.

## Rejected in This Batch

- A third new family.
- Unlicensed commercial CJK fonts with visually appealing rounded/handwritten shapes.
- Full 24.4MB LXGW source in production.
- Reusing `League Gothic` / `Blackout` as Cute-alism's primary voice, which would reproduce Poster.
