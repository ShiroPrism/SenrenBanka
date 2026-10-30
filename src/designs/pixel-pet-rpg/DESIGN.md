---
name: Pixel Pet RPG
description: A small explorable pixel-pet town where a strict player HUD, a real-anchor map, station panels, an item pouch, project signposts, a footprint log, a tool rack, and a postbox present the profile.
colors:
  night: "#172338"
  night-soft: "#294463"
  cream: "#fff7dc"
  paper: "#f6e8bc"
  white: "#fffdf5"
  muted: "#536275"
  sky: "#a9d8ef"
  sky-low: "#79bfd5"
  grass: "#75b66b"
  grass-dark: "#4c8a59"
  mint: "#a8e6c1"
  water: "#66b8cd"
  water-highlight: "#c6f2ef"
  gold: "#f4c75b"
  coral: "#ec775d"
typography:
  base:
    fontFamily: "'Silkscreen', 'Ark Pixel 12px', 'PingFang SC', 'Microsoft YaHei', monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  display:
    fontFamily: "'Silkscreen', 'Ark Pixel 12px', 'PingFang SC', 'Microsoft YaHei', monospace"
    fontSize: "clamp(1.35rem, 3vw, 2.15rem)"
    fontWeight: 700
    lineHeight: 1.15
  display-compact:
    fontFamily: "same as display"
    fontSize: "clamp(1.35rem, 8vw, 1.9rem)"
    fontWeight: 700
    lineHeight: 1.15
  heading:
    fontFamily: "same as display"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.1em"
  headline:
    fontFamily: "same as display"
    fontSize: "1.02rem"
    fontWeight: 700
    lineHeight: 1.55
  body:
    fontFamily: "'Silkscreen', 'Ark Pixel 12px', 'PingFang SC', 'Microsoft YaHei', monospace"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.8
  body-compact:
    fontFamily: "same as body"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.75
  map-title:
    fontFamily: "same as display"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.12em"
  label:
    fontFamily: "same as display"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  micro-label:
    fontFamily: "same as display"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.1em"
  micro:
    fontFamily: "same as display"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: "'Handjet Variable', 'Silkscreen', 'Ark Pixel 12px', monospace"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.04em"
  compact-label:
    fontFamily: "same as display"
    fontSize: "0.7rem"
    fontWeight: 400
    lineHeight: 1.45
  index:
    fontFamily: "'Handjet Variable', 'Silkscreen', 'Ark Pixel 12px', monospace"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1
    fontVariationSettings: "'wght' 700, 'ELGR' 1, 'ELSH' 8"
  index-small:
    fontFamily: "same as index"
    fontSize: "0.9rem"
    fontWeight: 700
    lineHeight: 1
  preview-brand:
    fontFamily: "same as display"
    fontSize: "0.38rem"
    fontWeight: 400
    lineHeight: 1.35
  preview-name:
    fontFamily: "same as display"
    fontSize: "0.7rem"
    fontWeight: 400
    lineHeight: 1.2
  preview-node:
    fontFamily: "same as display"
    fontSize: "0.34rem"
    fontWeight: 400
    lineHeight: 1.3
  preview-caption:
    fontFamily: "same as display"
    fontSize: "0.4rem"
    fontWeight: 400
    lineHeight: 1.4
spacing:
  page-gutter: "1rem; 0.6rem at <=48rem"
  frame-max: "92rem"
  hud-padding: "0.9rem 1rem"
  panel-gap: "1rem"
  pixel-step: "4px"
  touch-target: "44px minimum"
rounded:
  all: "0"
---

# Design System: Pixel Pet RPG

## Overview

**Creative North Star: "A town that is also a profile."**

The page is a small 16-bit town viewed through a handheld-RPG field screen. It is
not a device mockup: there is no bezel, d-pad, battery, or fake screen inside a
plastic shell. The whole browser viewport is the town board. A clipped player HUD
sits above a 16:10 illustrated map; the selected place opens a station dossier
beside or below it.

The spatial proposition is the differentiator. Every map label is a real anchor
to a server-rendered section. Without JavaScript the labels behave like an
old-fashioned image map and the complete profile follows in reading order. With
JavaScript, the same labels additionally switch the station dossier, expose the
current location, and carry a tiny player marker.

**Key characteristics**

- Six category stations: profile, links, projects, experience, skills, contact.
- Strong navy outlines, four-pixel offsets, zero rounded corners, no glass, no
  blurred elevation.
- Sky, grass, paths, pond, town hall, shop, flags, quest board, workshop, and
  postbox are all original CSS/inline SVG pixel geometry; two tiny CSS pets live
  in the map as aria-hidden scenery.
- Gold marks the current station; coral is the player marker and physical accents;
  mint is selection/hover support.
- The HUD contains only the design mark, the real profile name, and the real
  location. Headline and biography live in the profile station, not in the HUD.
- No continuous animation. The only scripted motion is the player marker snapping
  to the station the visitor selected.

**Non-goals**

- This is not a playable game, save system, ranking screen, inventory management
  tool, achievement wall, or progress tracker.
- It is not a pager/device shell; that belongs to `pager`. The difference is
  structural: this design is a map plus a dossier, not a framed LCD inbox.
- It is not a generic card dashboard with a pixel font painted on top.
- It does not use Canvas-only text, WebGL, external bitmap art, or a shared game
  runtime.

## Information Architecture

The server-rendered DOM order is:

1. **Player HUD** — real name (`h1`), real location if present, decorative mark.
2. **Town map** — labelled navigation with six possible category anchors.
3. **Current stop readout** — visible status plus a polite live region.
4. **Profile station** — headline, biography, real avatar, real location.
5. **Pocket-items station** — every real link; empty fallback if the array is empty.
6. **Distant-markers station** — every project, description, optional URL, tags.
7. **Footprint-log station** — every experience entry and its optional fields.
8. **Tool-rack station** — every skill.
9. **Post station** — contact note and email; only rendered when real contact data
   exists.

Optional stations are omitted when their source data is absent. The identity and
links stations are always present because `name` / `headline` / `bio` / `links`
are core fields.

### Field mapping

| Profile field | Town expression |
|---|---|
| `name` | Persistent HUD `h1` |
| `headline` | Lead line in the profile station |
| `bio` | Reading text in the profile station |
| `avatar` | Framed pixel portrait |
| `location` | HUD location tag and profile-station field |
| `links` | Pocket-items slots; label and URL are both present |
| `projects` | Distant markers; title, description, optional link, tags |
| `experience` | Footprint log; org, role, period, description |
| `skills` | Tool-rack plaques |
| `contact` | Postbox note and mailto address |

`links[].icon` is carried as an optional data attribute; the current `tv` /
`video` / `coffee` slugs tint the generic pocket icon, while unknown slugs keep the
default mint chip. It never creates a fabricated label. No project or experience
data is invented.

## Colors

The palette is a compact role system, not a generic pastel set.

### Ink and surfaces

- **Night** `#172338`: HUD, outlines, route ink, focus backing.
- **Night soft** `#294463`: current-stop readout.
- **Cream** `#fff7dc`: page board and map-sign labels.
- **Paper** `#f6e8bc`: map paths, secondary strips, badge grounds.
- **White** `#fffdf5`: station reading surface.
- **Muted** `#536275`: secondary text only.

### World colors

- **Sky** `#a9d8ef` / **sky-low** `#79bfd5`: upper bands of the town map.
- **Grass** `#75b66b` / **grass-dark** `#4c8a59`: terrain and trees.
- **Water** `#66b8cd` / **water-highlight** `#c6f2ef`: pond.
- **Gold** `#f4c75b`: current station, station index, roof flags.
- **Coral** `#ec775d`: player marker, roofs, project pins, postbox.
- **Mint** `#a8e6c1`: hover/selection support and flags.

### Contrast ledger

| Text | Background | Ratio | Use |
|---|---|---:|---|
| Night `#172338` | Cream `#fff7dc` | 14.69:1 | Default reading text |
| Night | White `#fffdf5` | 15.46:1 | Station reading text |
| Muted `#536275` | Cream `#fff7dc` | 5.81:1 | Secondary text |
| Muted | White | 6.12:1 | Secondary text on station panels |
| Muted `#536275` | Paper `#f6e8bc` | 5.10:1 | Labels on map/readout strips |
| Night | Gold `#f4c75b` | 9.87:1 | Station indexes and current node |
| Night | Coral `#ec775d` | 5.52:1 | Marker and coral-backed labels |
| Night | Sky `#a9d8ef` | 10.31:1 | Any labels over sky |
| Night | Grass `#75b66b` | 6.49:1 | Any labels over grass |
| Night | Mint `#a8e6c1` | 11.06:1 | Hover and tags |
| Night | Water `#66b8cd` | 6.97:1 | Any labels over pond |
| Cream | Night-soft `#294463` | 9.32:1 | Current-stop readout |
| Gold | Night-soft | 6.27:1 | Current-stop label |

**The Outline Rule.** Every content surface is separated by a 3–4px night outline
and a hard 3–8px offset. No content surface uses a soft drop shadow.

**The One Marker Rule.** Gold means “current/selected.” Coral means “player or
physical accent.” Neither color is used to claim a game state that does not exist.

## Typography

**Display / labels:** Silkscreen. **CJK:** Ark Pixel 12px. **Indexes and numeric
details:** Handjet Variable.

Silkscreen carries the clipped, unicase game-HUD voice. Ark Pixel supplies the
registered 12px-grid Chinese/Japanese voice whenever the Latin face lacks a glyph.
Handjet is restricted to station indexes, the player label, period text, and the
preview item count, where its dot-matrix axes remain legible at a glance.

### Selection record (six required items)

1. **Metaphor and needed character:** A tiny console-RPG town needs labels that
   look cut into a low-resolution grid, Chinese/Japanese that stays inside the same
   12px rhythm, and numerals that feel assembled from dots rather than typeset.
   The map itself carries the illustrative work, so type must stay crisp and terse.
2. **Roles:** Silkscreen for Latin display/labels; Ark Pixel for CJK; Handjet for
   station indexes, the current-player HUD mark, period text, and preview counts.
3. **Why these faces:** The brief fixes this three-family palette, and it fits the
   subject exactly: Silkscreen is the existing screen-label face, Ark Pixel is the
   registered CJK pixel face, and Handjet is the only registered face with dot-grid
   axes. A modern sans would undermine the town-map premise; a handwritten face
   belongs to `sticker-diary`, not here. The differentiation from `pager` is
   spatial, chromatic, and interaction-led rather than a font substitution.
4. **Actual coverage:** Silkscreen covers Latin and common punctuation, not CJK.
   Ark Pixel’s registered subset has 1,991 mapped characters. Every non-ASCII
   character in this design’s localized UI strings is covered (107 unique
   non-ASCII characters; zero missing). Profile prose still inherits the stored
   sample data: the current zh-CN profile misses `概 / 辈`; ja misses
   `劇 / 概 / 術 / 護 / 輩`; en misses `輩` inside the shared Niconico URL. Those
   individual glyphs use the system fallback rather than silently claiming full
   coverage. Handjet covers
   Latin digits and Latin letters.
5. **Weight, axes, size, license:** Silkscreen 400/700 static; Handjet one variable
   file with `wght 100–900`, `ELGR 1–2`, `ELSH 0–16`; Ark Pixel 400. Production
   files are the registered local assets (Silkscreen ≈16KB for two files, Handjet
   ≈18.6KB, Ark Pixel ≈40.4KB). All three are OFL-1.1 and are distributed
   unmodified by this theme.
6. **Fallback order:** CJK/display text falls
   `Silkscreen → Ark Pixel 12px → Songti SC / SimSun → PingFang SC / Microsoft YaHei
   → Hiragino Sans / Yu Gothic UI → monospace`; numbers fall
   `Handjet → Silkscreen → Ark Pixel → system CJK → monospace`. Font loading uses
   the project’s existing local registration and `display: swap`; no new asset is
   introduced here.

### Type ladder

- **HUD name:** `clamp(1.35rem, 3vw, 2.15rem)` Silkscreen 700, line-height 1.15.
- **Station heading:** 0.8125rem, 700, 0.1em tracking.
- **Headline:** 1.02rem, 700, 1.55 line-height.
- **Body:** 0.9rem, 1.8 line-height; 0.875rem at ≤48rem.
- **Secondary label:** 0.625–0.75rem, muted.
- **Index:** Handjet 700 at 0.9–1.15rem with `ELGR 1`, `ELSH 8`.
- **Preview ladder:** 0.34–0.7rem, documented here rather than left as an
  undocumented detector exception.

## Layout and Geometry

- Page frame: `min(92rem, calc(100% - 2rem))`, four-pixel night border, eight-pixel
  hard shadow on the night ground.
- Desktop workbench: flexible map column + `minmax(20rem, 24rem)` dossier column,
  1rem gap. Both are square-cornered and hard-shadowed.
- Map: 16 / 10 illustrated scene. Category anchors sit on **percent positions**:
  profile 55%/38%, links 65%/left, projects 52%/right, experience bottom-left,
  skills bottom-right, contact bottom-centre. Labels stay inside the map.
- At ≤68rem the dossier stacks below the full-width map. At ≤48rem the scenic
  artwork becomes a 10.75rem banner and the six anchors become a 2 × 3 grid under
  it; all real profile panels then follow in one column.
- Structural borders use 4px; hard shadows use 4 / 8 / 12px. Raster-sized marker
  offsets and decorative blocks snap to the same 4px unit (the scaled switcher
  preview uses a documented 2–3px micro-stroke tier to preserve its silhouette).
- No border radius is used anywhere in the page. Avatar frames, buttons, tags,
  buildings, and panels all keep square pixel corners.

## Components

### Player HUD

Night surface, cream name, gold game mark and `PLAYER` technical label. It is
labelled for assistive technology and contains no invented counters. The four
checker pixels and the coral/gold/mint rail are `aria-hidden`.

### Map anchors

Each label is an actual `<a href="#pxt-…">` with a 44px minimum target. The marker
icon is CSS geometry hidden from accessibility. Station numbers use the current
contiguous DOM order (up to `01–06`) and are aria-hidden navigation indexes, not
progress. `aria-current="location"` is added only after the enhancement succeeds.

### Station dossier

One square-cornered reading panel per category. Each is a `<section>` named by its
own visible `h2`. Project and experience entries use `h3`. Small station codes
repeat DOM order decoratively and are `aria-hidden`.

### Pocket items

A compact item slot with icon, label, URL host, and a CSS-drawn outbound arrow.
The accessible name is the real link label; the host and arrow are decorative.
No fake rarity, quantity, or currency is shown.

### Distant markers and footprint log

Projects form a route of real destinations with a vertical pixel rail; experience
forms a dated log with square footprint markers. Both preserve all real optional
text. No completion percentages, quest states, levels, or achievements exist.

### Tool rack and postbox

Skills are chunky rack plaques. Contact is a postbox label with the real note and
mailto address; if no address is available it states that rather than inventing
one.

## Interaction and Motion

**Motion thesis:** a static town that teleports the player marker when a new station
is chosen. There is no camera pan, parallax, idle breathing, or looping cloud
movement.

- Shared `Reveal` is intentionally not used: there is no scroll-triggered entrance,
  so no content is hidden behind an IntersectionObserver.
- Initial HTML shows every station and leaves the player marker hidden.
- `script.ts` runs only after the document is ready. On success it sets
  `data-pxt-ready`, selects the hash station or identity by default, hides the
  inactive stations, sets one `aria-current="location"`, moves the decorative
  marker inside the active anchor, and updates the visible polite live region from
  localized message data. Every anchor's `aria-controls` points at its station.
- Click/Enter activation does **not** call `preventDefault`; the anchor keeps its
  native jump behaviour. No focus trap and no focus stealing.
- `hashchange` supports direct links and back/forward navigation. Unknown hashes
  leave the current station alone.
- If the module fails before initialization, no panel has been hidden. If an
  activation throws, the catch path restores every panel and removes the
  enhancement state.
- The only keyframes are a 180ms, two-step marker landing. Hover/focus uses
  `steps(2, end)` color and hard-shadow changes.
- `prefers-reduced-motion: reduce` sets transitions and the landing animation to
  none. Interaction still works.
- No `requestAnimationFrame`, timers, loops, audio, or polling exist.
- Script budget: one dependency-free module. Static size check: 3,402-byte source,
  3,672-byte transpiled JavaScript, **970 bytes gzip** at level 9, safely below the
  12KB ceiling. It imports no CSS and no shared runtime.

### Fallback matrix

| Condition | Result |
|---|---|
| JavaScript disabled | All stations visible; every map anchor jumps to its target |
| Module load/init failure | All stations stay visible; marker stays hidden |
| Runtime activation error | `restore()` unhides every station and clears current state |
| Reduced motion | Same content/state behaviour with no marker landing or transitions |
| Deep link/hash | Matching station becomes active; invalid hash does not destroy the static document |

### No fabricated game state

The UI deliberately omits `Lv.`, HP, XP, coins, completion percentages,
achievements, rarity, save state, timers, and score. Decorative station numbers
use only a contiguous subset of `01–06` and are rendered only as `aria-hidden`
DOM order indexes. The current-stop status is navigation state. The preview’s item number is the actual
`links.length`, not a game statistic.

## Accessibility and Responsive Contract

- `<html lang>` and head metadata come from `view.head`; `HeadMeta` is passed
  unchanged.
- All content sections have visible, referenced `h2`; nested entries use `h3`.
  The map navigation and outer dossier section have localized accessible names.
- All SVG scenery, pixel clouds, buildings, pet sprites, marker, station codes,
  arrows, and checker patterns are `aria-hidden`; no decorative symbol enters an
  accessible name.
- Primary links are underlined with a 3px coral rule and have a gold/dark
  `:focus-visible` ring. `aria-current` has a background plus shadow, not color
  alone.
- Touch targets are at least 44px; the map and item links exceed that floor.
- At 375px and 320px there is one content column, a 2 × 3 map anchor grid, and
  `overflow-wrap: anywhere` on long names, URLs, email addresses, tags, and labels.
  The page frame, hard shadows, SVG, and marker all remain inside the viewport.
- Decorative geometry is CSS/SVG only. No external raster hotlink or remote asset
  request exists. The profile avatar is the existing data-layer image.

## Preview Specification

`Preview.astro` is a self-contained 16 / 10 town-card fragment:

- HUD with the design mark, real name, and real `links.length`;
- three station tags (`profile`, `links`, `projects`);
- original CSS sky, hills, path, pond, town hall, shop, and project flags;
- no focusable elements and no `Font` declaration;
- imports only `tokens.css`, never `style.css`;
- exports `--font-silkscreen`, `--font-handjet`, and `--font-ark-pixel`;
- preview-specific type scale stays in the component and is listed above.
- source size: **7,603 bytes**, inside the 1–8KB target.

The composition deliberately avoids the `pager` device silhouette: there is no
shell, LCD, status bar, key row, wheel, or inbox.

## Do and Don't

### Do

- Treat map labels as navigation first, enhancement second.
- Let the town illustration and spatial anchors do the differentiation.
- Use hard outlines, stepped shadows, and 4px increments.
- Keep the HUD to real identity/location plus explicit game marks.
- Preserve every real profile field in the static document.
- Make current state available through `aria-current` and the localized live text.

### Don't

- Add fake levels, HP/XP, coins, timers, progress, rarity, achievements, or scores.
- Turn project entries into stat cards or assign completion states.
- Add a pager bezel, LCD screen, d-pad, or battery chrome.
- Add a scrolling camera, parallax, idle NPC loop, or continuous animation.
- Hide a core section unless the enhancement has initialized successfully.
- Use rounded cards, glass blur, gradients as material depth, or generic pastel UI.
- Import `style.css` into the preview or use a global `:root` token block.
