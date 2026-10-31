# verification — Brutal

> Current verification state for `brutal`; update in place, history stays in Git.
> Process: `.agents/skills/design-page-verify/SKILL.md`. Implementation date: 2026-10-31.

## Design State

- `styled`, enabled, `self-produced`, accent `#ff4d00`.
- Files: `DESIGN.md`, `design.json`, `Page.astro`, `messages.ts`, `style.css`, `tokens.css`, `Preview.astro`.
- No theme JavaScript; shared `Reveal` and `ContextMenu` only.
- Layout: paper bulletin + protest-poster language; heavy 4px rules, 8px hard shadows, acid labels, oversized name, numbered sections, ledger experience, rotated skill stickers, black contact block.
- Fonts: League Gothic / Zhuque Fangsong display; Inter / Zhuque body; JetBrains Mono / Zhuque labels. All existing production families; no new font assets.
- Content choice: `avatar` is intentionally omitted; `location` is shown in the header; `links[].icon` is intentionally ignored (text + arrow only).

## Data Coverage

- All locales: name, headline, bio, links, location, projects, experience, skills, contact email/note.
- Optional sections render only when present; no invented facts. No empty contact block is rendered when both email and note are absent.
- Three locale pages: `en`, `ja`, `zh-CN`; core fields and 3 links present in each.

## Build and Artifact Isolation

- `npm run build` 2026-10-31: passed (`fonts:check`, `check:docs`, `fonts:typography`, `astro check`, Astro build, `fonts:subset`, `fonts:prune`, `verify:html-only`, `fonts:audit`).
- `dist` **6,196,459 B (5.91 MiB)**, +161,130 B vs the 6,035,329 B baseline; within the 10 MiB guard.
- Three locale pages generated; each links the same own CSS (`Page.P-_3jnWl.css`, 16,240 B) and the same font CSS; CSS link sets are identical across locales.
- 24 `Page.*.css` files for 24 `styled` designs; no foreign design prefix in the brutal page CSS; root / 404 / language entry / switcher pages do not link the brutal page CSS.
- `@source not "./Preview.astro"` present; no `.flex{` / `.border{` preview utility leakage. The single `.transform{` utility is a general Tailwind scan artifact also present in 13/24 existing page CSS files, not a brutal-specific preview leak. `.bt-pv` in the page CSS comes from the shared `tokens.css` scope `:is(.bt, .bt-pv)`, not from preview component styles.
- Font gate count updated for this design: 24 styled designs / 15 with core CJK; `scripts/fonts/typography.mjs` and `scripts/fonts/typography.test.mjs` updated. `npm test`: 67/67 pass.
- `BASE_PATH=/demo` was not re-run for this design; the page has no internal links beyond profile outbound links and the shared menu (which already owns base handling).

## Browser Evidence

- Desktop 1440×900: `scrollWidth` 1425 < `innerWidth` 1440; name 152px; three project cards 333px each on one row; link height 46px; five sections all have `aria-labelledby`; headings `h1 → h2 ×4 → h3 ×3`; 7 `[data-reveal]` targets all revealed after scrolling, hidden count 0; jump-to-bottom hidden count 0.
- Console: 0 errors / 0 warnings. Network: Document, own CSS, shared ContextMenu JS/chunk, four font files, favicon; no 404.
- Loaded fonts: League Gothic Variable, Inter Variable, JetBrains Mono Variable, Zhuque Fangsong. No images (`img` count 0).
- Hover: first link `transform: matrix(1, 0, 0, 1, -2, -2)`, `box-shadow: 6px 6px 0`; focus-visible outline computed `rgb(31, 75, 255)`.
- Desktop menu smoke: right-click opens `[data-cm]` at the pointer, `role="menu"`, localized label `快捷操作`; Escape closes.
- Tablet 768×900: `scrollWidth` 753 < 768; two-column project grid (336px cards; first two on one row, third on the next); name 107.52px; link height 46; reveal hidden 0; sticker visible.
- 375×812 + touch: `pointer: coarse` true; `scrollWidth == innerWidth == 375`; link heights 46; name 63.784px; sticker hidden; skill rotations none; reveal hidden 0; no overflow elements.
- Touch sheet: launcher 52×52; tap opens sheet with bottom edge 812; visible language items 3 / current 1; actions `copy`, `share`, `random`, `switch` only; close / cancel / Esc all close, restore `html` overflow and release scroll lock.
- Screenshots: `.local-fonts/dev/preview/brutal-2026-10-31/brutal-desktop-full.png`, `brutal-mobile-375.png`, `brutal-mobile-menu.png`, `brutal-reduced-motion.png`, `brutal-no-io.png`, `brutal-io-throw.png`, `brutal-no-js.png`.

## Motion and Degradation

- Entrance `bt-snap` is transform-only (no opacity), so a stalled animation cannot hide content.
- Reveal gate active; 7 targets; after scroll 7 in / 0 hidden; jump-to-bottom 0 hidden.
- `prefers-reduced-motion: reduce`: gate absent, animation `none`, transform `none`, hidden 0.
- No `IntersectionObserver`: gate absent, hidden 0.
- `IntersectionObserver` throws: gate absent, hidden 0.
- No JavaScript: full content visible in screenshot; SSR contains name / bio / project cards. Shared menu is absent without JS, as designed.

## Contrast

| Pair | Ratio |
|---|---|
| ink `#0b0b0b` / paper `#f2efe6` | 17.12:1 |
| ink-soft `#2a2a2a` / paper | 12.48:1 |
| muted `#5a564c` / paper | 6.36:1 |
| ink / paper-2 `#e6e0d2` | 14.96:1 |
| paper / ink | 17.12:1 |
| paper-2 / ink | 14.96:1 |
| acid `#d8ff00` / ink | 17.08:1 |
| ink / orange `#ff4d00` | 5.92:1 |
| white `#fffdf7` / blue `#1f4bff` | 5.88:1 |

- White on orange is **3.27:1** and is intentionally **not used**; orange always carries ink text. All used text/background pairs pass 4.5:1.

## Detector

- `impeccable detect --json src/designs/brutal` → `[]` (exit 0).
- Counter-proof: `impeccable detect --json src/designs/oxide` → known `codex-grid-background` advisory, confirming the detector is not silently empty.
- No detector exceptions recorded.

## Preview

- Self-contained `Preview.astro`; imports only `./tokens.css`; no `:root`, no `<Font>`, no focusable elements; exports four font families.
- Switcher now renders 25 previews (24 existing + `brutal`). `docs/verification/shared.md` has a batch delta note; a full shared count refresh follows after `ink` / `deco`.

## Known Limits

- Chromium simulation only; real Safari / Firefox / iOS / Android, landscape, 200% zoom and physical touch were not tested.
- `BASE_PATH=/demo` not re-run for this design.
- Visual preference tuning remains with the project owner.
