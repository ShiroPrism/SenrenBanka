# verification — Pixel Pet RPG

> Current verification state for `pixel-pet-rpg`; update in place, history stays in Git.
> Process: `.agents/skills/design-page-verify/SKILL.md`. Implementation date: 2026-10-29.

## Design State

- `styled`, enabled, `self-produced`, accent `#f4c75b`.
- Files: `DESIGN.md`, `design.json`, `Page.astro`, `messages.ts`, `style.css`, `tokens.css`, `Preview.astro`, `script.ts`.
- Layout: HUD, explorable town map, current-stop readout and six profile stations; links are pocket items, projects are destinations, experience is a trail log.
- Fonts: Silkscreen, Ark Pixel 12px, Handjet.

## Data and JavaScript

- All core and non-empty optional fields render; no fabricated level, HP, XP, achievement, rank, rarity or progress.
- Map nodes are real fragment anchors without JS; all six panels remain visible.
- Success adds `data-pxt-ready`, switches active panel, `aria-current`, live status and player marker.
- Errors restore every panel and remove enhancement state.
- Built theme chunk: **706 B gzip**, below 12KB.

## Build and Artifact Isolation

- Three locale pages generated; one identical own stylesheet per locale; full build 105 pages.
- No foreign design selectors or Preview rules in page CSS; tokens scoped; no external assets.
- `BASE_PATH=/demo` CSS, canonical and menu links are prefixed.

## Browser Evidence

- Desktop 1440: no horizontal overflow; one h1; eight named sections; shared menu opens; no console/page errors or failed requests.
- Clicking `#pxt-projects` makes the station current and hides other panels.
- 375px touch: no horizontal overflow; menu sheet language/close/cancel/scroll-lock checks pass; all visible controls at least 44px high.
- Reduced motion: no animations; content remains visible.
- No JS: all 6 panels visible.
- Forced initialization failure: all 6 panels visible.
- Preview: 7,603 B, self-contained, no focusable elements.
- Screenshots: `.local-fonts/dev/preview/cute-2026-10-29/pixel-pet-rpg-desktop-1440.png`, `pixel-pet-rpg-mobile-375.png`.

## Detector and Limits

- `impeccable detect --json src/designs/pixel-pet-rpg` → `[]`.
- Profile prose may use documented system fallback for glyphs outside the Ark Pixel subset.
- Real Safari/Firefox and physical devices remain untested.
