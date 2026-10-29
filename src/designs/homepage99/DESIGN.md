---
name: Homepage '99 — The Personal Homepage
description: A hand-maintained late-1990s personal homepage: a directory on the left, dense records in the middle, and a notice-and-badge rail on the right.
colors:
  paper: "#fffbea"
  panel: "#f1edcf"
  white: "#ffffff"
  ink: "#111111"
  muted: "#5c4b2a"
  navy: "#000080"
  blue: "#0000ee"
  visited: "#551a8b"
  teal: "#006b6b"
  lime: "#d7ff9e"
  rule: "#202020"
  red: "#b00020"
  silver: "#c0c0c0"
  grid: "#e7e0c2"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', Times, 'Songti SC', SimSun, 'Hiragino Mincho ProN', 'Yu Mincho', serif"
    fontSize: "clamp(2rem, 5.5vw, 3.35rem)"
    fontWeight: 700
    lineHeight: 1.08
  headline:
    fontFamily: "同 display"
    fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Arial, Helvetica, 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans', 'Yu Gothic UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  body-compact:
    fontFamily: "同 body"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  note:
    fontFamily: "同 body"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
  section:
    fontFamily: "同 display"
    fontSize: "clamp(1.4rem, 3vw, 1.85rem)"
    fontWeight: 700
    lineHeight: 1.2
  project-title:
    fontFamily: "同 display"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1.3
  footer-name:
    fontFamily: "同 display"
    fontSize: "1.1rem"
    fontWeight: 700
    lineHeight: 1.65
  label:
    fontFamily: "'Courier New', Courier, ui-monospace, 'PingFang SC', 'Microsoft YaHei', monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.45
  counter-display:
    fontFamily: "同 label"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
  badge:
    fontFamily: "同 label"
    fontSize: "9px"
    fontWeight: 700
    lineHeight: 1.1
  preview-body:
    fontFamily: "同 body"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.4
  preview-label:
    fontFamily: "同 label"
    fontSize: "0.5rem"
    fontWeight: 400
    lineHeight: 1.35
  preview-micro:
    fontFamily: "同 label"
    fontSize: "0.45rem"
    fontWeight: 400
    lineHeight: 1.55
  preview-link:
    fontFamily: "同 label"
    fontSize: "0.47rem"
    fontWeight: 400
    lineHeight: 1.45
  preview-display:
    fontFamily: "同 display"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.05
  preview-headline:
    fontFamily: "同 display"
    fontSize: "0.56rem"
    fontWeight: 400
    lineHeight: 1.3
  preview-foot:
    fontFamily: "同 label"
    fontSize: "0.42rem"
    fontWeight: 400
    lineHeight: 1.3
  preview-badge:
    fontFamily: "同 label"
    fontSize: "0.38rem"
    fontWeight: 700
    lineHeight: 1.1
rounded:
  all: "0"
spacing:
  outer: "1.5rem"
  frame-padding: "1rem"
  section-gap: "1.65rem"
  table-cell: "0.55rem"
  nav-width: "10rem"
  rail-width: "11rem"
components:
  link:
    textColor: "{colors.blue}"
    typography: "{typography.body}"
  link-visited:
    textColor: "{colors.visited}"
  link-hover:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
  label:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
  section-rule:
    borderColor: "{colors.rule}"
---

# Design System: Homepage '99 — The Personal Homepage

## Overview

**Creative North Star: "The Hand-Kept Homepage"**

This is not a 1990s skin applied to a modern portfolio. It is the
**organization of a personal website from 1998–1999**: a masthead written by
the owner, a persistent left directory, a long middle column of links and
records, and a narrow right rail where notices, 88×31 badges, and an offline
counter accumulate.

The page should look as if one person kept editing it over several weekends:
some rules are doubled, some are single, the directory stays close at hand,
links are underlined, and technical labels are set in a typewriter face. It is
not a CRT, radio, fax, pager, tape, receipt, card catalogue, or hardware shell.
There is no device frame, no paper roll, no ticket edge, and no archival card
stack. The only "object" is the page's own three-zone editorial skeleton.

**Key Characteristics**

- Asymmetric three-zone Grid: left directory, wide main column, right notice rail.
- Cream graph paper, dark double rules, zero rounded corners, no floating cards.
- Blue underlined links, purple visited links, lime focus/hover, one red offline warning.
- Serif display, sans body, monospace technical labels; all system fonts.
- Dense but orderly information: numbering, field labels, bracketed tags.
- One slow construction stripe; no Reveal, blinking, marquee, or scroll entrance.

## Visual Difference Matrix

| Existing family | Their signature | Homepage '99 deliberately uses |
|---|---|---|
| Terminal / Oxide | CRT screen, command output, phosphor, scanlines | cream paper, printed directory, ordinary links |
| Radio | instrument faceplate, dials, lamps | page masthead, section index, no controls |
| Fax / Receipt | paper feed, transmission header, torn or thermal edges | flat web page with a persistent directory |
| Pager | LCD, status bar, message queue | open page with a table and badge rail |
| Tape | cassette shell, J-card, reels | no physical media object |
| Archive | wooden drawer, index cards, tabs, stamp | no cards, no rotation, no drawer |
| Modern portfolio | hero, rounded cards, even spacing, whitespace-first | dense directory, double rules, zero radius |

The test is: remove the palette and the page should still read as an early
personal homepage because of its structure, not because of beige and blue.

## Colors

The palette is intentionally narrow. It evokes the browser defaults of the
period without using low-contrast rainbow text.

### Primary

- **Navy `#000080`**: masthead bar, table header, major left border, counter heading.
- **Link Blue `#0000ee`**: ordinary links.
- **Visited Purple `#551a8b`**: visited links only.
- **Lime `#d7ff9e`**: focus, hover, directory head, construction strip backing.
- **Warning Red `#b00020`**: only the offline counter label.

### Neutral

- **Paper `#fffbea`**: page ground.
- **Panel `#f1edcf`**: directory, rail, masthead foot, table row headers.
- **White `#ffffff`**: table and badge grounds.
- **Ink `#111111`**: body text and dark rules.
- **Muted `#5c4b2a`**: field labels, URLs, notes.
- **Rule `#202020`**: borders and structural rules.
- **Grid `#e7e0c2`**: 16px dot-grid paper.
- **Silver `#c0c0c0`**: inset counter bezel and decorative masthead rule only.

### Contrast Measurements

All text combinations used by the design were checked against their actual
backgrounds:

| Foreground | Background | Ratio |
|---|---|---:|
| Ink `#111111` | Paper `#fffbea` | 18.20:1 |
| Ink | Panel `#f1edcf` | 15.97:1 |
| Ink | White | 18.88:1 |
| Muted `#5c4b2a` | Paper | 8.11:1 |
| Muted | Panel | 7.12:1 |
| Muted | White | 8.42:1 |
| Link blue `#0000ee` | Paper | 9.06:1 |
| Link blue | Panel | 7.95:1 |
| Visited purple `#551a8b` | Paper | 10.61:1 |
| Visited purple | Panel | 9.31:1 |
| Navy `#000080` | Paper | 15.43:1 |
| Navy | Panel | 13.54:1 |
| White | Navy | 16.01:1 |
| Red `#b00020` | Panel | 6.19:1 |
| Lime `#d7ff9e` | Ink (hover/focus text) | 16.80:1 |

The lowest used text ratio is **6.19:1** (offline red on panel), above the
WCAG AA 4.5:1 floor. Silver is non-text decoration only.

### Named Rules

**The Browser-Default Rule.** Blue links and purple visited links are not
decorative accents; they are the historical link language. Do not recolour
individual links for emphasis.

**The One Warning Rule.** Red belongs only to the offline counter. It never
means "danger" elsewhere on the page.

**The Tiled-Paper Rule.** The dot grid is a low-contrast page ground, never a
content surface; do not place text directly over the pattern without a panel
or white ground.

## Typography

**Display Font:** Georgia / Times New Roman with CJK serif fallbacks
**Body Font:** Arial / Helvetica with CJK sans fallbacks
**Technical Font:** Courier New with CJK fallbacks

The three voices are deliberately plain and already present on the user's
machine. They are period-appropriate because they are the fonts an amateur
webmaster would have had available, not because they are fashionable today.

### System-Font Selection Record (six required items)

1. **Metaphor and required character.** The design is a hand-maintained
   personal homepage, organized like a directory rather than a product page.
   It needs a newspaper-like serif for the owner's name and section heads, a
   neutral sans for long prose and navigation, and a typewriter-like monospace
   for dates, counters, badges, URLs, and field labels. The technical voice
   must align digits and feel slightly office-machine-like without turning the
   page into a terminal.
2. **Role assignment.** Display = Georgia / Times + Songti / SimSun /
   Hiragino Mincho / Yu Mincho. Body = Arial / Helvetica + PingFang SC /
   Microsoft YaHei / Hiragino Sans / Yu Gothic UI. Technical = Courier New /
   Courier / ui-monospace + CJK sans fallback. No fourth family and no icon
   font.
3. **Why these rather than downloaded candidates.** The design deliberately
   uses the browser's existing system voices: no network cost, no licensing
   gate, no font flash, and no dependency on a period revival face. A downloaded
   "retro" font would make the page look art-directed; the homepage should look
   like it was made with whatever was already installed. Georgia/Times gives
   the masthead a printed-document voice without the editorial polish of a
   modern display serif. Arial keeps dense prose readable. Courier New makes
   counters and URLs read as technical records rather than code.
4. **Actual coverage and fallback.** Georgia and Times cover Latin, ASCII
   digits, and common punctuation; Arial covers Latin and punctuation; Courier
   New covers Latin and ASCII. None covers CJK or kana. Chinese falls back to
   Songti SC / SimSun in the display chain and PingFang SC / Microsoft YaHei
   in the body/technical chains; Japanese falls back to Hiragino Mincho ProN /
   Yu Mincho for display and Hiragino Sans / Yu Gothic UI for body. Generic
   `serif`, `sans-serif`, and `monospace` close every chain.
5. **Weights, axes, size, license.** These are system fonts: zero downloaded
   bytes, zero `@font-face`, no variable axes, no license file required in the
   repository. The design uses 400 for body and labels and 700 only for the
   name, table heads, badges, and the offline warning. Body is 16px; technical
   labels are 12px and are limited to metadata, not long reading text.
6. **Missing-font fallback order.** Display: Georgia → Times New Roman → Times
   → Songti SC → SimSun → Hiragino Mincho ProN → Yu Mincho → serif. Body:
   Arial → Helvetica → PingFang SC → Microsoft YaHei → Hiragino Sans →
   Yu Gothic UI → sans-serif. Technical: Courier New → Courier → ui-monospace
   → PingFang SC → Microsoft YaHei → monospace. If any preferred face is
   missing, the role still resolves to the correct generic family.

### Hierarchy

- **Display** (700, `clamp(2rem, 5.5vw, 3.35rem)`, 1.08): the single `h1`,
  the owner's name.
- **Headline** (400, `clamp(1.05rem, 2.2vw, 1.35rem)`, 1.45): the profile
  headline in navy serif.
- **Section heading** (700, `clamp(1.4rem, 3vw, 1.85rem)`, 1.2): `h2` in serif.
- **Body** (400, 1rem, 1.65): prose, table values, navigation.
- **Body compact** (400, 0.9375rem, 1.55): experience table values.
- **Note** (400, 0.8125rem, 1.45): contact hint, rail note, footer.
- **Section** (700, `clamp(1.4rem, 3vw, 1.85rem)`, 1.2): `h2`.
- **Project title** (700, 1.15rem, 1.3): project `h3`.
- **Footer name** (700, 1.1rem): the name in the page footer.
- **Counter display** (400, 0.875rem): dashed visitor-counter readout.
- **Badge** (700, 9px): the three 88×31 inscriptions, the only sub-12px
  full-page text and decorative only.
- **Technical** (400, 0.75rem, 1.45): URLs, field labels, dates, badges,
  counter, section marks. These are auxiliary and never carry a paragraph.
- **Preview tiers** (0.625 / 0.56 / 0.5 / 0.47 / 0.45 / 0.42 / 0.38rem):
  registered separately below.

### Named Rules

**The Three-Voice Rule.** Serif is for names and headings; sans is for reading;
monospace is for metadata. Do not use monospace for paragraphs or serif for
table data.

**The No-Font-Request Rule.** This design must not render `<Font>`, add a font
to `astro.config.mjs`, or load a font file. `Preview.astro` exports `fonts: []`.

## Layout

### Desktop

The page frame is `min(74rem, calc(100% - 3rem))`, with a 4px double border.
The masthead spans the full frame. Below it, the CSS Grid is:

```text
10rem directory | minmax(0, 1fr) main | 11rem notice rail
```

The directory is sticky at `1rem` from the top so the page's own index stays
available while reading. The main column is intentionally the widest zone;
the rail is narrow and visually secondary.

### Responsive

- **≤64rem:** two columns (`directory | main`), with the rail moved after the
  main column as a full-width row. The rail becomes three side-by-side modules:
  construction, badges, counter.
- **≤48rem:** one column in DOM order: directory → main → rail. The directory
  stops sticking. The rail stacks normally. The experience table changes to a
  block-per-record presentation while retaining its caption, `th` elements,
  and scope attributes. The mobile field labels are visible only in this mode.
- **≤25rem:** the top bar, masthead foot, and footer align to the start; badges
  stack vertically so 88px badges never force overflow.

### Density

The page uses 1rem grid gaps, 0.55rem table cells, and 1.65rem between major
sections. These are not a modern 8px spacing system; they are deliberately
close to the irregular but consistent rhythm of a hand-edited page.

## Surfaces, Borders, and Depth

- **No rounded corners anywhere.** The frame, panels, table, badges, and
  counter are all square.
- **No floating cards and no shadows.** Depth is expressed only by double
  rules, inset table borders, and the black counter display.
- **Rules:** the outer frame and section heads use double rules; ordinary
  separators use single or dotted rules. A double rule means a structural
  break, not decoration.
- **Tiled paper:** a 16px dot grid on the page ground; panels and white table
  cells cover it so text never competes with the pattern.
- **Badges:** exactly 88×31 CSS pixels, white ground, 1px border, a 4px
  coloured top edge. They are decorative and `aria-hidden`, never links.

## Components

### Masthead

Navy browser-like top bar (`SENRENBANKA`, volume mark, hand-coded status),
then a serif name, headline, bio, location, optional 128×128 avatar, and a
  monospace status foot. The avatar uses `object-fit: cover`, a 4px
double border, and a meaningful alt derived from the profile name.

### Directory

A persistent left panel with a lime heading, numbered in-page contents, a
secondary "Elsewhere" link list, and a short contact hint. It is navigation,
not a card. On desktop it sticks; on mobile it returns to normal flow.

### Link Directory

Two columns on desktop, one on mobile. Each row has a monospace number, a
blue underlined label, and the visible URL in muted monospace. Long URLs use
`overflow-wrap: anywhere`; the URL is decorative for assistive technology
because the link label already carries the name.

### Projects

A numbered file-like list. Each project has a serif `h3`, optional visible URL,
description, and bracketed tags. No card background, no rounded chip.

### Experience Table

The only real table on the page. It has a visible `caption`, four `th scope="col"`
headers, and a `th scope="row"` organization cell. Desktop keeps the table
layout. At ≤48rem, CSS changes the table to block records, hides the header row
visually while keeping it in the accessibility tree, and shows mobile labels
for role, period, and description. This is a presentation change, not a
duplicate data structure.

### Skills

Two-column list of `[x]` items. The bracket marker is ASCII, decorative, and
`aria-hidden`; the skill text is the accessible content.

### Contact

`<address>` block with a navy left rule, optional note, field label, and a
`mailto:` link. No fake form or guestbook.

### Notice Rail

Three period artifacts:

1. **Under Construction:** a static label on a lime diagonal-stripe strip.
2. **Badges:** three 88×31 text badges; decorative, not links.
3. **Visitor Counter:** a black display showing dashes, the explicit
   localized "offline / not connected" label, and a note that no visits are
   counted. There is no fake number and no `<output>` element.

No Guestbook, Webring, remote GIF, hit counter, or unavailable control exists.

### Footer

Name, external-link note, and a back-to-top link. It closes the page like a
small hand-written footer, not a product footer.

## Motion

The design **does not use the shared Reveal mechanism**. Early personal
homepages were immediate: the whole document was there when the browser
finished painting it. Scroll-triggered entrances would introduce a modern
editorial rhythm and contradict the hand-kept, static-document premise. The
page therefore has no `Reveal`, no entrance animation, no scroll progress, no
marquee, and no blinking text.

The only infinite animation is the **Under Construction stripe**: a 9-second
linear `background-position` movement on a small 2.75rem strip. It is
decorative, low-speed, and does not carry status information; the visible label
already says construction. Under `prefers-reduced-motion: reduce` the
animation is `none` and the stripe becomes a static pattern. Hover and focus
change colour and underline thickness without transitions.

## Accessibility

- One `h1` (profile name); each content section has a visible `h2`; project
  titles are `h3`. The rail uses `h2` for the rail and `h3` for construction
  and counter labels.
- Every `<section>` has `aria-labelledby`; the directory and rail have
  accessible names.
- The experience table has a caption and column/row header scope. Its mobile
  presentation preserves the same semantic elements.
- Decorative numbers, section marks, badge inscriptions, `[x]`, `//`, dotted
  rules, and URLs are `aria-hidden`; links are named by their visible labels.
- Skip link appears on focus. All links use a 3px navy `focus-visible` outline
  plus lime ground and dark text, so focus is not conveyed by colour alone.
- At `pointer: coarse`, principal links receive vertical padding without
  changing the desktop density.
- Text contrast is at least 6.19:1 for every used pair; silver is not used for
  text. Long URLs, Japanese text, and table values wrap within their columns.

## Preview Fragment

`Preview.astro` is a self-contained miniature: navy top bar, left contents,
serif name and headline, dense link rows, construction strip, and two 88×31
text badges. It imports only `tokens.css`, never `style.css`, declares no
`<Font>`, exports `fonts: []`, and contains no focusable elements. The
switcher supplies `aria-hidden`; preview text never enters the card link's
accessible name.

The miniature uses a registered reduced scale:

- body / metadata: 0.625rem / 0.5rem / 0.45rem;
- display: 1.05rem;
- headline: 0.56rem;
- badge: 0.38rem.

These are preview-only tiers, not additions to the full-page hierarchy.

## Do's and Don'ts

### Do

- **Do** keep the page as a directory + main column + notice rail, even when
  colours change.
- **Do** use double rules for structural breaks, dotted rules for records, and
  zero radius everywhere.
- **Do** use ordinary blue/purple links with visible underlines.
- **Do** set technical metadata in Courier New and prose in Arial.
- **Do** keep the construction strip slow, small, and the only infinite motion.
- **Do** render all present optional profile data; the layout must not drop a
  section because it is visually inconvenient.
- **Do** preserve the offline counter's explicit limitation.

### Don't

- **Don't** turn the page into a CRT, instrument panel, receipt, card drawer,
  cassette, or ticket.
- **Don't** add rounded cards, soft shadows, glass, gradients as surfaces, or
  a modern hero.
- **Don't** add `<Font>`, a new font dependency, remote images, GIFs, or icon
  libraries.
- **Don't** add Guestbook, Webring, fake counters, fake forms, or dead buttons.
- **Don't** add Reveal, scroll entrances, blinking, marquee text, or a second
  infinite animation.

## Project Contract

- **Data:** `loadDesignView('homepage99', Astro.url.pathname)`; the page never
  resolves locale or profile paths itself.
- **Head:** `<HeadMeta {...view.head} />` unchanged; `<html lang>` is
  `view.head.lang`.
- **Chrome:** unconditional `<ContextMenu config={view.contextMenu} />` at the
  end of `<body>`; no separate language or theme switch.
- **Core fields:** `name` / `headline` / `bio` / `links` always render.
- **Optional fields:** `avatar` when present, `location`, `projects`,
  `experience`, `skills`, and `contact` all render when data exists.
- **CSS entry:** `@import "tailwindcss" source(none); @source "./";`, then
  `@source not "./Preview.astro";`, then `@import "./tokens.css";`.
- **Tokens:** palette only, scoped to `:is(.h99, .h99-pv)`; no `:root`.
- **Fonts:** no `<Font>`, no `astro.config.mjs` changes, no downloaded files.
- **Messages:** every interface string comes from `messages.ts`; decorative
  ASCII and the English 88×31 inscriptions are documented there.
- **Detector note:** the tiled-paper background and the construction stripes
  are intentional world/material signals, not generic decorative gradients.
