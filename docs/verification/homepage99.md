# verification — Homepage '99

> **2026-11-01 韩语覆盖（C3）**：新增 `/ko/homepage99/` 与韩语文案；375×812 / 1280×800 冒烟通过（`lang=ko`、韩语字体加载、无横向溢出、0 console）；文案已人工审校（用户确认 2026-11-01）。

> Current verification state for `homepage99` (update in place; history is
> kept by Git). Rules: `docs/rules/README.md`. Process:
> `.agents/skills/design-page-verify/SKILL.md`. Render-mode boundary:
> `docs/adr/0009-html-only-design-rendering.md`.
>
> Implementation, static verification, and browser checks: **2026-10-28**.
> Browser evidence was measured in the main session with Chromium at desktop
> and touch viewports; the implementer's earlier "pending" state is superseded.

## Design state

- `design.json`: `displayName: "Homepage '99"`, `enabled: true`,
  `renderMode: "styled"`, `accent: "#000080"`, `source.type: "self-produced"`.
- Files: `DESIGN.md`, `design.json`, `Page.astro`, `messages.ts`, `style.css`,
  `tokens.css`, `Preview.astro`.
- No assets, no new dependencies, no font registration, no `astro.config.mjs`
  change, no `<Font>`, no `Reveal`, no `InfraStyles`, no `LanguageSwitcher`.
- `Page.astro` uses `loadDesignView('homepage99', Astro.url.pathname)`,
  `view.head.lang`, an unchanged `<HeadMeta {...view.head} />`, and an
  unconditional `<ContextMenu config={view.contextMenu} />` at the end of
  `<body>`.
- All interface copy comes from `messages.ts`; the English 88×31 inscriptions,
  `SENRENBANKA`, `VOL. 99 / HTML`, and ASCII ornament are documented there as
  intentionally untranslated.

## Data coverage

- Core fields render in all three locales: `name`, `headline`, `bio`, `links`.
- Optional fields render when present: `avatar` (128×128, `object-fit: cover`,
  meaningful alt built from the profile name), `location`, `projects`,
  `experience`, `skills`, `contact`.
- All three current profiles contain every optional section, so the built
  pages exercise the complete data path.

## Layout and semantics

- Skeleton is semantic `header` / `nav` / `main` / `aside` / `footer` inside
  CSS Grid. The desktop grid is `10rem | minmax(0, 1fr) | 11rem`; at `≤64rem`
  the rail moves after the main column; at `≤48rem` the page is one column in
  DOM order.
- The only table is the experience record. It has one visible `caption`, four
  `th scope="col"` headers, and one `th scope="row"` per record. At `≤48rem`
  CSS changes it to block records while keeping the same caption / header /
  scope semantics; mobile field labels are visible only there.
- Static artifact counts per locale page: **1** `h1`, **8** `h2`, **5** `h3`,
  **5** named `<section>` elements, **7** `aria-labelledby`, **1** table,
  **1** caption, **4** column headers, **2** row headers, **0** `data-reveal`.
- Every section has `aria-labelledby`; directory and rail have accessible
  names. Decorative numbering, section marks, URLs, badges, `[x]`, `//`, and
  counter display are `aria-hidden`; links are named by visible labels.
- Long URLs use `overflow-wrap: anywhere` / `word-break: break-word`; table
  cells and mobile labels use `minmax(0, 1fr)` grids so long Japanese text and
  URLs cannot force horizontal overflow.

## Build and artifact isolation

`npm run build` (2026-10-28):

- `astro check`: **0 errors / 0 warnings / 1 hint** (existing
  `lexicon/Page.astro` unused parameter).
- Static build: **81 pages** with the sample config; the temporary
  `manualSwitch:false` build was **77 pages** and was restored byte-for-byte
  afterwards.
- HTML-only gate: 20/20 tests pass; artifact verifier passes
  `1 design × 3 locales = 3 pages`.
- Three homepage99 pages exist:
  `dist/{zh-cn,ja,en}/homepage99/index.html`.

Per-locale artifact measurements:

| locale | HTML bytes | `html lang` | CSS link | `h1` | `h2` | `h3` | table / caption | th col / row | Reveal | Preview class | `@font-face` | preload |
|---|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| zh-cn | 43,373 | `zh-CN` | `/_astro/Page.wv1Zd5IS.css` | 1 | 8 | 5 | 1 / 1 | 4 / 2 | 0 | 0 | 0 | 0 |
| ja | 44,213 | `ja` | same | 1 | 8 | 5 | 1 / 1 | 4 / 2 | 0 | 0 | 0 | 0 |
| en | 44,058 | `en` | same | 1 | 8 | 5 | 1 / 1 | 4 / 2 | 0 | 0 | 0 | 0 |

- Each page has exactly one stylesheet link; all three locales reference the
  same CSS file.
- The page CSS is **18,824 B**. It contains **0** other-design prefixes
  (`.tm`, `.ar`, `.fr`, `.m3`, `.gv`, `.kern`, `.ox`, etc.), **0** `.h99-pv-*`
  preview rules, **1** `:is(.h99, .h99-pv)` token namespace, **1** keyframe
  (`h99-stripes`), and **1** `infinite` declaration.
- The only `:root` in the CSS belongs to Tailwind's `@layer theme` framework
  variables; there is no `:root` design-token block.
- Page HTML has no `h99-pv` classes, no preview component rules, no
  `@font-face`, no preload, one avatar image, and one favicon metadata link.
- `BASE_PATH=/demo` build (temporary outDir, removed after check): **81
  pages**; `/demo/zh-cn/homepage99/` has `lang="zh-CN"`, CSS
  `/demo/_astro/Page.wv1Zd5IS.css`, canonical `/demo/zh-cn/homepage99/`,
  favicon `/demo/favicon.svg`, 19 menu target hrefs under `/demo/zh-cn/`,
  and a `/demo/zh-cn/designs/` switch target. The switcher card links to
  `/demo/zh-cn/homepage99/` and renders one preview.

## Switcher preview

- `Preview.astro` is decorative, self-contained, imports only `tokens.css`,
  declares no `<Font>`, exports `fonts: []`, and has no focusable elements.
- The zh-cn switcher contains one `h99-pv` preview and the localized
  homepage99 description. The card set is 18 and all 18 designs have a
  preview, including the self-contained `html-only` document fragment.
- `style.css` has `@source not "./Preview.astro";`; no preview selectors leak
  into the full-page CSS.
- Current switcher CSS is **56,958 B**; current zh-cn switcher HTML is
  **92,775 B**. These include the new preview.
- Design tokens are scoped to `:is(.h99, .h99-pv)`; there is no `:root` design
  token in the switcher HTML/CSS.

## Contrast

Calculated from the recorded token values against actual backgrounds:

| Pair | Ratio |
|---|---:|
| Ink / paper | 18.20:1 |
| Ink / panel | 15.97:1 |
| Ink / white | 18.88:1 |
| Muted / paper | 8.11:1 |
| Muted / panel | 7.12:1 |
| Muted / white | 8.42:1 |
| Blue link / paper | 9.06:1 |
| Blue link / panel | 7.95:1 |
| Visited / paper | 10.61:1 |
| Visited / panel | 9.31:1 |
| Navy / paper | 15.43:1 |
| Navy / panel | 13.54:1 |
| White / navy | 16.01:1 |
| Red / panel | 6.19:1 |
| Lime / ink | 16.80:1 |

Lowest used text ratio: **6.19:1** (offline red on panel), above WCAG AA.
Silver is decorative only.

## Motion and degradation

- No shared Reveal. `data-reveal` count is 0 on all three pages.
- The sole infinite animation is `.h99-construction` moving
  `background-position` over 9 seconds.
- It is wrapped in `@media (prefers-reduced-motion: no-preference)` and
  explicitly set to `animation: none` under `prefers-reduced-motion: reduce`.
- No blink, marquee, scroll entrance, or second infinite animation exists.
- Browser measurement: normal desktop computed animation is `h99-stripes` /
  `9s`; reduced-motion context computes `animation-name: none` and `0s`.

## Fonts and resources

- System stacks only:
  - display: Georgia / Times / CJK serif;
  - body: Arial / Helvetica / CJK sans;
  - technical: Courier New / Courier / CJK fallback.
- The six required selection-record items are in `DESIGN.md`.
- No `<Font>`, no font files, no `@font-face`, no preload, no new dependency.
- Expected page resources are the document, its one own CSS file, favicon,
  and the profile avatar; no remote decoration or third-party script.

## Detector

```text
.agents\skills\impeccable\scripts\impeccable.cmd detect --json src/designs/homepage99
[]
```

- Exit 0. The detector initially raised `codex-grid-background` for the
  two-axis graph-paper CSS. The ground was changed to a 16px dot grid (a tiled
  paper texture), and the result is now clean.
- No ignore rule was added.

## Browser verification (main session)

The main session ran the `design-page-verify` browser pass. Measured results:

- **Desktop 1440 / 1280:** console 0, page errors 0; resources are the document,
  one own stylesheet, avatar, favicon, and the existing ContextMenu bootstrap /
  runtime chunks. No remote decoration, font file, preload, or third-party
  request. Grid computed at 1440 as `160px | 776px | 176px`; at 1280 the same
  three zones fit with side margins. The directory, main column, and rail have
  distinct x positions, so the layout is genuinely three-zone rather than a
  stacked card column.
- **375px touch:** no horizontal overflow (`scrollWidth === 375`). Grid is one
  column in DOM order; the experience table computes `display: block`; the
  caption is a full-width horizontal band (`328 × 35px`) after the mobile
  reflow fix. Principal links measure 44px high.
- **320px:** no horizontal overflow (`scrollWidth === 305`); content wraps,
  badges remain 88×31 and do not force page width.
- **Japanese 375px:** no horizontal overflow; localized headings, table
  caption / headers, badges, counter, and footer render; the avatar alt is
  localized; language target remains `/ja/homepage99/`.
- **Reduced motion:** computed construction animation is `none`; all content
  remains visible.
- **Shared action menu, touch:** real `tap()` on the launcher opens the sheet
  (`top 195`, `bottom 812`, height 617); 3 language items, exactly 1
  `aria-current`; mobile actions are `copy`, `share`, `random`, `switch`; close
  is 44×44 and cancel is 48px. Background `overflow` is `hidden`,
  `overscroll-behavior` is `contain`, and no element computes
  `touch-action: none`. Cancel closes the sheet and restores overflow.
- **Shared action menu, desktop:** `Shift+F10` opens the menu with keyboard mode;
  11 menu items, 3 language items, 1 current language, identity `Homepage '99`;
  Arrow navigation reaches the language trigger, ArrowRight enters the submenu,
  and Escape closes. Escape returns focus to the pre-open focus target, which
  in this run was `BODY`; this matches the shared ContextMenu contract and is
  not a homepage99 regression.
- **Switcher:** 18 cards / 18 previews; homepage99 card links to
  `/zh-cn/homepage99/`, has a visible `.h99-pv` preview, zero focusable
  descendants, no preview text in the card accessible name; 82 `@font-face`
  declarations remain unchanged and homepage99 adds no font face. At 1536px
  the grid is three columns and no horizontal overflow occurs.
- **`manualSwitch:false`:** build is 77 pages; switcher and legacy
  `/designs/` are absent; homepage99 and html-only omit the all-designs link and
  theme actions while retaining language links. Config restored to the exact
  original SHA-256.
- **Screenshots:**
  `.local-fonts/dev/preview/homepage99/homepage99-desktop-1440.png`,
  `homepage99-desktop-1280.png`, `homepage99-mobile-375.png`,
  `homepage99-narrow-320.png`, `homepage99-ja-375.png`,
  `homepage99-reduced-motion-1440.png`, `homepage99-touch-menu-375.png`,
  `homepage99-switcher-1536.png`.

The only visual defect found in the browser pass was the mobile experience
caption collapsing into a narrow vertical strip. CSS now forces the caption to
a block, full-width band at the mobile breakpoint; the re-measured caption is
`328 × 35px` horizontal.

## Known limits

- `styled` pages still lack a no-JS language fallback; this is an existing
  project-wide boundary, not introduced here.
- The 88×31 badges are intentionally 9px decorative text inside fixed-size
  non-interactive spans; they do not carry information unavailable elsewhere.
- The experience table switches from a 4-column desktop table to block records
  at ≤48rem. This preserves the table semantics and header associations but is
  a visual reflow; it should be checked with Japanese content on a real narrow
  viewport.
