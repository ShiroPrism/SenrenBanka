# Sticker Diary

## Metaphor

An authored, hand-bound scrapbook opened to one two-page spread at a time. The
book is the page: paper grain, sewn-gutter shadow, washi tape and edge bookmarks
belong to a working notebook rather than an object staged on a desk. Every
spread is laid out by hand, but long-form text remains a readable part of the
page instead of becoming decorative handwriting.

## Non-goals

- Not a desk scene with loose paper, a receipt, an archive card or a pile of
  taped cards.
- Not a generic card grid with stickers layered behind it.
- Not a wall of handwritten prose: handwriting is reserved for names, section
  headings, annotations and small marks.
- Not a scrapbook whose content depends on the navigation script.
- Not a horizontal page-turn carousel on narrow screens.

## Information Architecture

The DOM order is also the no-JavaScript reading order.

1. **Profile spread** — name (the single `h1`), headline, optional avatar,
   optional location and bio.
2. **Keepsakes spread** — every link, split across the two pages.
3. **Projects spread** — only when `projects` is non-empty; title, optional
   description, optional URL and optional tags are retained.
4. **Footsteps spread** — only when `experience` is non-empty; organisation,
   optional role, period and description are retained.
5. **Skills spread** — only when `skills` is non-empty; every skill is a paper
   sticker.
6. **Last-page spread** — contact email and note when present. When contact is
   absent the page explicitly says it is blank; it never invents a channel.

Tab labels are generated from the spreads that actually render, so optional
sections do not create empty bookmarks. Page numbers are layout marks derived
from that same list, never invented chronology.

## Visual System

### Colour

Warm oatmeal paper sits inside a dusty rose cloth cover on a muted woven
background. Rose is the annotation ink, mustard and teal are sticker accents,
and dark brown is the reading ink. Tokens live in `tokens.css`; production and
preview share them through `:is(.sd, .sd-pv)`.

Measured text/background pairs:

| Pair | Contrast |
|---|---:|
| ink `#342b27` / paper `#fffaf0` | 13.27:1 |
| muted `#66584e` / paper `#fffaf0` | 6.57:1 |
| rose `#a73e56` / paper `#fffaf0` | 5.82:1 |
| teal `#276b64` / paper `#fffaf0` | 5.98:1 |
| mustard-deep `#79551d` / paper `#fffaf0` | 6.45:1 |
| blue `#4f6b85` / paper `#fffaf0` | 5.35:1 |
| muted `#66584e` / teal keepsake `#ddeae2` | 5.52:1 |
| blue `#4f6b85` / tag `#e8edef` | 4.71:1 |
| rose `#a73e56` / contact blush `#fce9e5` | 5.17:1 |

The active bookmark uses paper text on rose: 5.82:1. Small secondary text uses
the muted tone, not the faint rule colour.

### Type

The large name, section titles, tabs and tiny marginal annotations use
UglyTypist; CJK glyphs fall through to LXGW WenKai. Bio, project descriptions,
experience descriptions and contact copy use Inter, with LXGW WenKai as the CJK
fallback. This keeps an authored hand in the display layer and a calm reading
voice in the body.

### Geometry

The main object is a cloth-covered book with a sewn center gutter. Each spread
has two equal paper leaves on wide screens. Tape strips sit at page corners or
above headings and never cover text. Sticker cards use small alternating
rotations, while all reading blocks retain a straight text axis. On narrow
screens the two leaves become one DOM-ordered column and the bookmarks become a
wrapping row.

### Spacing and Detail

Page padding is fluid; readable line length is capped in the prose. Page numbers
sit at outer lower corners. The gutter gradient, paper fibers, stitched edge,
corner curls, tape stripes and doodles are CSS-only decoration. No external
image is introduced beyond the optional profile avatar.

## Field Mapping

| Profile field | Diary expression |
|---|---|
| `name` | single `h1` on the left leaf of the profile spread |
| `headline` | pencil subtitle under the name |
| `bio` | taped note under “On the first page” |
| `links` | 01-numbered keepsake cards, split across both leaves |
| `avatar` | taped-square photo on the profile leaf; absent is a complete state |
| `location` | small pin label under the identity |
| `projects` | layered project notes with title/link, description and tags |
| `experience` | dated pressed tickets with organisation, role and description |
| `skills` | cut-paper skill stickers |
| `contact` | last-page letter block with mail link and/or note |

## Interaction and State

`script.ts` is a single private module. It does not fetch, create, reorder or
rewrite profile content.

Measured at handoff: 2,471 bytes minified / 1,059 bytes gzip (12KB budget). It
owns only one setup pass, one document key listener and click listeners on the
rendered controls; there are no timers, animation frames or loops to stop.

- **Initial state:** every spread is visible and the page is a long document.
  Bookmarks are real same-document anchors. Previous/next controls are absent
  from layout and the page does not depend on JavaScript.
- **Enhanced state:** after all required nodes are found, the script hides
  non-current spreads with the native `hidden` property, writes
  `data-sd-ready` on the root, activates the first spread or the one named by
  the URL hash, and reveals the transport controls.
- **Bookmarks:** clicking a bookmark changes the active spread, updates
  `aria-current="page"`, `aria-expanded`, `aria-controls`, the live status text
  and the URL hash.
- **Previous / next:** native buttons move one spread and move focus to the new
  spread's primary heading. Focus is never trapped.
- **Keyboard:** `ArrowLeft` / `ArrowRight` change spreads when focus is not in a
  text field, shared action menu or other dialog surface. Modified arrows are
  left to the browser.
- **Failure:** the initialization body is guarded. Any missing node, length
  mismatch or thrown setup error removes `data-sd-ready`, unhides every spread
  and returns the page to the complete long-document state.
- **Reduced motion:** the spread change still works; only the CSS entrance and
  local transition are omitted. No scroll animation is used.

## Responsive and Accessibility

- Desktop bookmarks are a vertical, at least 44px-wide edge rail. At
  `<= 60rem` they become a wrapping, at least 44px-high row above the book.
- No page-level horizontal scrolling. The book remains width-constrained; long
  URLs and emails wrap inside their cards.
- Every spread has an accessible name through `aria-labelledby`. The profile
  spread has the only `h1`; later spreads begin at `h2`, with project and
  experience entries at `h3`.
- Tape, stitching, page numbers, doodles and arrows are decorative and
  `aria-hidden`. Link and button names come from visible text.
- Focus uses a 3px rose-deep outline with offset on all links, buttons and
  programmatically focused headings.
- Touch targets: transport buttons and bookmark links are at least 44px on
  coarse pointers. Hover lift is gated to fine hover pointers.

## Motion

The motion language is “a new page settling into the binding”:

- one 560ms CSS book arrival on first paint, using only opacity and transform;
- a 280ms local settle on the newly active spread, with direction-aware
  horizontal offset and a very small rotation;
- short hover/focus lifts on stickers, gated to fine pointers.

All animation is inside `prefers-reduced-motion: no-preference`. There is no
infinite animation, requestAnimationFrame loop, scroll hijacking or shared
Reveal dependency. Content is never hidden by the motion mechanism; only the
successful spread interaction uses `hidden`.

## Font Selection Record

1. **Metaphor and roles.** A personal scrapbook needs a Latin display hand
   (name, tabs, annotations), a warm CJK hand for the same voice, and a highly
   readable body voice for long bio and project copy. There is no numeric-data
   role; page numbers use the hand at small size.
2. **Assignments.** Display/bookmarks: UglyTypist with LXGW WenKai fallback.
   CJK display: LXGW WenKai. Body: Inter with LXGW WenKai/system CJK fallback.
3. **Why these faces.** UglyTypist is already licensed and gives a slightly
   imperfect pen line without pretending to be the user's real handwriting.
   LXGW WenKai carries the same ink tone for Chinese and Japanese. Inter keeps
   the long body copy readable, avoiding the “long handwritten paragraph”
   non-goal. No third new family is added.
4. **Coverage.** UglyTypist measured 95/95 printable ASCII, 0/62 Latin-1
   letters and no CJK. LXGW full source: 6763/6763 GB2312, 176/176 kana and
   6953/6953 JIS X 0208. The final production subset is 301,340 bytes with
   2,133 mapped code points; the post-copy check of the merged six-theme,
   three-locale copy reports no missing glyphs. Inter's registered Latin/Latin-ext
   subsets cover ASCII/Latin-1 and
   add regional Latin; they contain no CJK. Chinese and Japanese therefore flow
   to LXGW or the system CJK fallback.
5. **Scale/licence.** UglyTypist 400, one 27,304-byte WOFF2, OFL-1.1.
   LXGW WenKai GB Medium 500, final site subset 301,340 bytes, OFL-1.1.
   Inter Variable uses the registered npm family with Latin/Latin-ext subsets,
   OFL-1.1, and a variable weight axis. All load with `swap`; no preload.
6. **Fallback order.** Display: UglyTypist → LXGW WenKai → PingFang SC /
   Microsoft YaHei → Hiragino Sans / Yu Gothic UI → cursive/serif. Body: Inter
   → LXGW WenKai → PingFang SC / Microsoft YaHei → Hiragino Sans / Yu Gothic UI
   → sans-serif. If either local face fails, the authored page remains legible
   with system fallbacks.

## Preview

`Preview.astro` is a self-contained decorative fragment and does not import
`style.css` or declare a font component. It shows the signature: a dusty rose cover,
one open two-leaf spread, two protruding bookmarks, washi tape and a handwritten
name line. It exports exactly the three font variables used by the fragment and
contains no focusable element. All styles are component-scoped and derive
palette values from the shared namespaced `tokens.css`. Its handoff file size is
7,987 bytes, inside the 8KB preview budget.

## Self-review

- The book has no invented dates, levels, counts, relationships or contact
  details.
- All optional blocks are conditional; empty links/contact render explicit
  localized empty states.
- The CSS namespace is `.sd` / `.sd-`; no design-level `:root` exists.
- No user copy is generated by the script and no runtime translation is needed.
