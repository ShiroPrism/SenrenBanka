# verification — Magical Girl

> **2026-11-01 韩语覆盖（C3）**：新增 `/ko/magical-girl/` 与韩语文案；375×812 / 1280×800 冒烟通过（`lang=ko`、韩语字体加载、无横向溢出、0 console）；文案 AI 起草，待人工审校。

> Current verification state for `magical-girl`; update in place, history stays in Git.
> Process: `.agents/skills/design-page-verify/SKILL.md`. Implementation date: 2026-10-29.

## Design State

- `styled`, enabled, `self-produced`, accent `#a72d5a`.
- Files: `DESIGN.md`, `design.json`, `Page.astro`, `messages.ts`, `style.css`, `tokens.css`, `Preview.astro`, `script.ts`.
- Layout: character dossier and stage entrance; relic links, star-trail episodes, transformation chronology, seal skills and wax-sealed contact letter.
- Fonts: Fraunces italic display, LXGW WenKai GB CJK, Inter body.

## Assets, Data and JavaScript

- All visuals are original inline SVG/CSS; no external character art, brands, raster images or copyrighted characters.
- All core and non-empty optional fields render; avatar fallback remains complete.
- `script.ts` performs one 0.8–1.2s entrance arrangement with no overlay, sound or infinite loop.
- Built theme chunk: **646 B gzip**, below 12KB; content remains readable before/without animation.

## Build and Artifact Isolation

- Three locale pages generated; one identical own stylesheet per locale.
- No foreign design selectors or Preview rules in page CSS; tokens scoped to `:is(.mg, .mg-pv)`.
- `BASE_PATH=/demo`: CSS, canonical and menu links carry `/demo`.

## Browser Evidence

- Desktop 1440: no horizontal overflow; one h1; six named sections; shared menu opens; no console/page errors or failed requests.
- 375px touch: no horizontal overflow; all visible controls at least 44px high; menu close/cancel/scroll-lock pass.
- Reduced motion: 0 animations; dossier content visible.
- No JS and forced initialization failure: all 3 dossier blocks visible.
- Motion probe recorded 9 finite animations with a maximum end time of 1,060 ms; hidden-tab and reduced-motion paths animate 0 elements.
- Preview: 7,933 B, self-contained, exports three fonts, no focusable elements.
- Screenshots: `.local-fonts/dev/preview/cute-2026-10-29/magical-girl-desktop-1440.png`, `magical-girl-mobile-375.png`.

## Contrast and Detector

- Lowest tested body pairing is 7.49:1; focus gold on rose is 4.66:1.
- `impeccable detect --json src/designs/magical-girl` → `[]`.

## Known Limits

- Real Safari/Firefox and physical devices were not tested.
- Owner review should confirm the ornamental density and entrance timing feel right on target hardware.
