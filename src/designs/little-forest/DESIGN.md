# Design System: Little Forest

## Overview

**Creative North Star: "The Field Book Walk"**

Little Forest is a quiet picture book and nature-observation notebook, not a
portfolio dashboard wearing a green theme. The page opens at a wooden entrance
sign, passes a clearing, then follows one continuous trail through signposts,
trail places, tree rings, pressed wildflowers and finally a cottage with a light
in the window. The reader should feel that the profile was discovered while
walking, one scene at a time.

The material language is watercolour bloom, coloured-pencil rules, cream paper,
moss green, bark brown and a few pale botanical accents. Texture comes entirely
from layered CSS gradients and original inline SVG. Typography remains calm:
Fraunces gives the scene labels a storybook voice, while Georgia carries long
Latin passages and LXGW WenKai carries Chinese and Japanese text. Decoration may
be irregular; reading columns and links stay straight and legible.

**Key characteristics**
- One continuous trail, not a grid of interchangeable cards.
- A warm paper ground with restrained watercolour bloom and graphite-like
  hairlines.
- Large, scene-specific compositions: signpost cluster, place markers, tree-ring
  study, herbarium sheet and cottage.
- Content-first quiet; no gradients on text, no glass panels and no ambient
  animation.
- Existing profile data only. No invented places, seasons, achievements or
  personal history.

## Non-goals

- Not a scrapbook, sticker sheet, tape collage or diary spread.
- Not a generic "forest green" SaaS page with botanical icons attached to cards.
- Not a game map with levels, quests, completion percentages or fake geography.
- Not an external illustration pack, raster texture pack, stock photograph or
  remote asset dependency.
- Not a theme-specific JavaScript experience. The trail is complete without an
  island script.
- Not a perpetual parallax or looping leaf animation.

## Information Architecture

DOM order and reading order are identical:

1. **Entrance** — wooden sign with `name`, headline, optional location and the
   observation-card avatar.
2. **Clearing** — the full `bio` in a wide, quiet reading measure.
3. **Trailheads** — every `links[]` item as a hanging wooden sign.
4. **Places along the path** — optional `projects[]`, each as a trail stop.
5. **Tree rings** — optional `experience[]`, each as a labelled growth ring.
6. **Wildflower specimens** — optional `skills[]` on one herbarium sheet.
7. **Cottage** — optional `contact`, with note and email; the route always ends
   here and has a non-factual closing line when no contact is configured.
8. **Colophon** — a small field-book footer.

On desktop, these nodes alternate across a twelve-column canvas and a decorative
S-shaped dashed path runs behind them. On narrow screens the path becomes a
single vertical dashed line at the left, and every station remains in the same
DOM order in one readable column. No section is visually reordered with
`order`.

## Field Coverage

| Profile field | Scene / treatment | Optional handling |
|---|---|---|
| `name` | Entrance wooden sign, the only `h1` | Required by schema; wrapped with `overflow-wrap:anywhere` |
| `headline` | Ink note directly under the sign | Required; measured to about 34ch |
| `bio` | Full-width clearing section | Required; full text, no clamp or truncation |
| `avatar` | Field-observation card, 4:5 crop | If absent, an original pressed-leaf SVG replaces the photo; no empty frame |
| `location` | Pencil-style location line and observation-card footer | Omitted when absent |
| `links[]` | One wooden trailhead sign per link, label and URL | Empty array gets a localized quiet empty state |
| `projects[]` | Ordered stops with title, full description, URL and all tags | Section omitted when absent or empty; optional item fields only render when non-empty |
| `experience[]` | Tree-ring layout with org, role, period and full description | Section omitted when absent or empty; role/period/description are individually conditional |
| `skills[]` | One specimen per skill on a single herbarium sheet | Section omitted when absent or empty |
| `contact.email` | Mailbox link at the cottage | Omitted when absent |
| `contact.note` | Cottage porch note | Omitted when absent |
| `contact` | Cottage ending | If neither field exists, the localized `noContact` line closes the trail |

The only link marks mapped are the explicitly configured `tv`, `video`, `coffee`
and `mail` slugs. Unknown or absent slugs produce no fallback icon. Every mark
is `aria-hidden` and the text label remains the accessible name.

## Colours

All palette values live in `tokens.css` under `:is(.lf, .lf-pv)`. There is no
design-level `:root`, so the switcher preview cannot leak tokens globally.

| Token | Value | Role |
|---|---|---|
| `--lf-paper` | `#f4efdf` | Main warm paper |
| `--lf-paper-light` | `#fbf7eb` | Observation sheet / herbarium sheet |
| `--lf-paper-deep` | `#e8dfca` | Paper shadow, pressed-leaf ground |
| `--lf-ink` | `#263229` | Primary text |
| `--lf-muted` | `#52604f` | Secondary text and labels |
| `--lf-moss` | `#4d6952` | Botanical line work |
| `--lf-moss-deep` | `#304738` | Headline ink, cottage door |
| `--lf-bark` | `#76553b` | Wooden sign faces |
| `--lf-bark-deep` | `#503a2b` | Sign outlines and post shadow |
| `--lf-ochre` | `#b7832f` | Decorative flower centres and trail accents only |
| `--lf-ochre-ink` | `#77511f` | Accessible accent text and focus ring |
| `--lf-blush` | `#b9837d` | One wildflower colour |
| `--lf-lilac` | `#81778f` | One wildflower colour |
| `--lf-sky` | `#8ca9a4` | Watercolour sky |
| `--lf-path` | `#8b7354` | Trail line |
| `--lf-path-soft` | `#c7b18e` | Path underlay, quiet rules |
| `--lf-line` | `#c8bca5` | Herbarium and section hairlines |
| `--lf-highlight` | `#f1dfad` | Window light / pale note ground |

Measured contrast (WCAG relative-luminance calculation, 2026-10-29):

- `#263229` on `#f4efdf`: **11.62:1**
- `#52604f` on `#f4efdf`: **5.81:1**
- `#304738` on `#f4efdf`: **8.76:1**
- `#503a2b` on `#f4efdf`: **9.22:1**
- `#77511f` on `#f4efdf`: **6.12:1**
- `#fff6dc` on `#76553b`: **6.21:1**
- `#fff6dc` on the sign's lightest wood `#846247`: **5.10:1**
- `#f2dfad` on `#76553b`: **5.09:1**
- `#77511f` on `#f1dfad`: **5.33:1**
- `#263229` on `#fbf7eb`: **12.48:1**
- `#52604f` on `#fbf7eb`: **6.23:1**

The ochre (`#b7832f`) is a drawing colour, not a text colour. Text that needs
ochre uses `--lf-ochre-ink`. The small specimen/observation labels remain above
6:1 against their paper surfaces.

## Typography

**Display:** Fraunces Variable → LXGW WenKai GB → Songti SC / SimSun /
Hiragino Mincho ProN / Yu Mincho → serif.

**Body:** Georgia → LXGW WenKai GB → Songti SC / SimSun /
Hiragino Mincho ProN / Yu Mincho → serif.

**Microcopy:** the same body stack, spaced and sometimes uppercased. There is no
sans-serif voice in this design.

### Type hierarchy

- **Name**: Fraunces, `clamp(2.6rem, 7.2vw, 5.8rem)`, weight 560, line-height
  0.98, optical sizing enabled. It is the one oversized gesture.
- **Section title**: Fraunces, `clamp(1.85rem, 3.5vw, 3rem)`, weight 480,
  line-height 1.1.
- **Place / ring title**: Fraunces, `clamp(1.28rem, 2.2vw, 1.65rem)`, weight
  520, line-height 1.3.
- **Headline and closing note**: Fraunces, about 1.15–1.5rem, line-height 1.48.
- **Body / descriptions**: Georgia for Latin and LXGW WenKai for CJK, 0.97–1.25rem,
  line-height 1.75–1.9.
- **Trail label**: body stack, 0.6875–0.71875rem, letter-spacing 0.12–0.16em,
  uppercase only where the language is Latin.
- **Preview micro tiers**: 0.43rem footer, 0.45–0.52rem annotations, 0.58rem
  signpost, 1.42rem name. These tiers exist only for the 16:10 switcher swatch,
  not for the full page.

### Font selection record (six required points)

1. **Metaphor and needed character**: an open children's nature field book with a
   long, quiet walk. Display type should feel authored but not antique-fairytale
   costume; body type should support long Latin / CJK paragraphs without turning
   the page into handwriting. Small labels must behave like pencil annotations.
2. **Role allocation**: Fraunces for name, scene titles, place titles, headline
   and contact note; Georgia for Latin body text; LXGW WenKai for Chinese and
   Japanese body, labels and headline fallback; all nodes share the same serif
   fallback family.
3. **Why these choices**: Fraunces has enough optical contrast and soft, slightly
   idiosyncratic terminals to evoke a modern picture book while remaining clear
   at large sizes. Georgia is already available on the target desktops, has a
   broad, readable lowercase and avoids adding a third font request just for
   body copy. LXGW WenKai is the approved warm reading CJK voice and carries the
   handwritten observation-book tone more honestly than a geometric sans.
   Systems such as Inter or a slab-serif label voice were rejected because they
   would split the page into a digital UI and a story layer.
4. **Actual coverage and fallback**: Fraunces covers the full ASCII set
   (95/95) and Latin-1 letters (62/62), with no CJK or kana. Georgia covers
   Latin through the operating system, with no CJK. LXGW WenKai GB's source
   covers GB2312 6763/6763, kana 176/176, JIS X 0208 6953/6953 and CJK
   punctuation 53/53. External catalog v1.0.0 supplies the complete `core-cjk`
   cmap as 328 `unicode-range` shards in a 13,841,062 B family package, so no
   site-copy subset is generated.
5. **Weights, axes, size and licence**: Fraunces Variable is used at 470–560
   with optical sizing; the existing normal and italic Latin files are about
   36.6 KB and 45.7 KB. LXGW WenKai GB Medium is weight 500; the external family
   package contains the production shards, while the full source archive stays
   outside the site build.
   Both are OFL-1.1 and already registered by the shared font pipeline; this
   design does not add a font licence file or a third family.
6. **Missing-font fallback order**:
   - Display: `--font-fraunces → --font-lxgw → Songti SC → SimSun →
     Hiragino Mincho ProN → Yu Mincho → serif`.
   - Body: `Georgia → --font-lxgw → Songti SC → SimSun →
     Hiragino Mincho ProN → Yu Mincho → serif`.
   - The same chain remains readable with no JS, no network and swapped or
     failed web fonts.

## Layout and Geometry

- Page shell: max width 82rem for the entrance, 78rem for the main book, with
  horizontal padding `clamp(1.15rem, 5vw, 4.5rem)`.
- Entrance: asymmetric 1.25fr / 0.75fr grid. Name and observation card are
  intentionally unequal; the card is a found object, not a matching hero card.
- Desktop trail: 12-column grid, alternating six/seven-column stations and
  `clamp(7rem, 13vw, 12rem)` row gaps. Decorations stay behind content.
- The trail's S-line is a single non-scaling dashed SVG path. It is always
  decorative and always present; it does not gate or reveal content.
- Projects use a two-column marker / body rhythm. Experience uses a tree-ring
  illustration beside a ring list. Skills become one shared herbarium sheet,
  not a set of cards.
- Shapes are mostly hand-cut rectangles, circles and leaf ellipses. Radii stay
  small; there is no glass, pill cloud or dense rounded-card system.
- At `<=760px`, the S path is removed and replaced by one vertical dashed CSS
  line at the left. Stations become full-width blocks in DOM order.
- At `<=520px`, the herbarium becomes one column and the cottage stacks its
  copy above the illustration.
- Long names, emails, tags and project titles wrap with `overflow-wrap:anywhere`.
  `min-width: 0` is set on every content grid child that can receive long Latin.

## Components and States

### Entrance sign
- Wood-gradient board, two brass nail points, grain lines and a short post.
- The name is the only `h1`. The headline sits on paper, not on the board, so
  long multilingual copy remains readable.
- The hanging observation card uses a small paper tab, graph-paper rule and a
  4:5 portrait. Portrait filter is restrained (saturation 0.82, slight sepia).

### Trailhead signpost
- A real anchor, minimum 3.4rem tall, with wood face, circular mark slot,
  label and decorative arrow.
- Sign items are offset and very slightly rotated as a collected cluster.
  Rotation returns to level on hover and is removed entirely on touch/narrow
  layouts.
- Unknown configured icons render nothing; the configured `tv`, `video`,
  `coffee` and `mail` slugs use Lucide line marks inside the circular slot.

### Trail place
- The marker reads `placeLabel + number` in localized copy; the item title is
  the `h3`. URL-bearing titles are text links with a thin underline and a
  decorative external arrow.
- Every description and tag is rendered verbatim. Tags use small leaf marks,
  not filled chips.

### Tree-ring entry
- The illustration is a decorative SVG cross-section with five rings, radial
  cracks and a warm heart. It contains no text.
- Each experience row has a numbered pencil mark, org as `h3`, a period/role
  line and the full description. Missing role or period is omitted without a
  fake dash.

### Herbarium sheet
- One paper surface with ruled lines, a red-brown margin and a small paper tab.
- Each skill is a specimen: line label, pressed stem/leaves/five-petal bloom and
  skill name. Colour rotates through blush, lilac and ochre; no item has a card
  surface or a shadow.
- At 980px the sheet moves to two columns; at 520px to one column.

### Cottage
- A two-column porch scene: contact copy and mailbox link beside an original
  inline cottage drawing.
- Email is an actual `mailto:` anchor with localized label plus the address.
  The address wraps rather than overflowing.
- Missing contact data uses a quiet localized closing line; the cottage itself
  remains the visual endpoint.

### Link and focus states
- All links inherit ink or wood-appropriate text colour and use a thin,
  botanical underline where inline.
- Hover is gated by `(hover: hover) and (pointer: fine)`: signposts settle by
  0.16rem, project/mail underlines darken, and the mailbox shifts 0.15rem.
- Focus-visible uses a 3px `--lf-ochre-ink` outline with 4px offset. The outline
  is never removed.
- Coarse-pointer primary links are at least 2.75rem high; signposts are already
  above 3.4rem. Touch never depends on hover.

## Motion

The motion language is **a page opening and a path settling**, not wildlife
looping in the background.

- **Entrance** (`prefers-reduced-motion: no-preference`, pure CSS): the entrance
  group fades and rises 0.75rem over 620ms; the wooden sign settles from a
  one-degree tilt over 720ms. No fill-mode is used, so the natural state remains
  available if an animation never starts.
- **Path settling**: the decorative dashed stroke settles its dash offset over
  1100ms, once. The path remains fully present without animation.
- **Shared scroll reveal**: `Reveal.astro` observes the clearing and each station
  once. Left stations enter from -0.8rem, right stations from +0.9rem, and
  experience/contact rise from +1rem, all within 520–620ms. There is no stagger
  long enough to delay reading and no scroll-driven progress line.
- **No continuous motion**: no leaves sway forever, no steam loops and no
  parallax.
- **Reduced motion**: all animation and transitions are removed. The entrance,
  clearing, every station and every card remain in their natural visible state.

**Reveal visibility contract:** content is visible by default. The only hidden
state is:

```css
html[data-reveal-ready] .lf-station[data-reveal]:not([data-reveal-in])
```

and its clearing counterpart, both inside `prefers-reduced-motion: no-preference`.
Thus no JS, failed module load, missing `IntersectionObserver`, or reduced-motion
mode leaves the content visible. There is no theme JavaScript and no JS-gated
trail link.

## Accessibility and Responsive Rules

- Landmarks: one `main` with a localized `aria-label`; entrance uses its own
  header. Every trail section is named by a visible `h2` through
  `aria-labelledby`. Item titles use `h3` below the matching section heading.
- Decoration: canopy, path, scene drawings, station numbers, sign arrows,
  separators and ring numbers are `aria-hidden`. Link accessible names come from
  their text labels.
- The observation portrait has a meaningful `alt` equal to the profile name;
  the field caption is visible text, not a substitute image description.
- The path is not interactive and does not enter the tab order. The trail links
  and project links remain ordinary anchors.
- Focus is visible on all actual anchors. There is no hidden focusable switch
  entry; the shared action menu is the only project-level switch and language
  entry.
- The page must remain free of horizontal page overflow at 1440, 1280, 375 and
  320px. The S path is decorative-only at desktop; the mobile line is a CSS
  border, so it cannot widen the page.
- Colour contrast is recorded above. Body text is 11.62:1; muted text and small
  pencil labels are 5.81–6.23:1; wood sign text is at least 5.09:1.
- No text is clipped or line-clamped on the full page. The only `-webkit-line-clamp`
  is the two-line headline in the decorative switcher preview.

## Preview

`Preview.astro` is a self-contained 16:10 decorative swatch. It imports only
`tokens.css`, exports both real font variables (`--font-fraunces`, `--font-lxgw`)
and does not import `style.css` or declare `<Font>`.

Signature elements:
- cream watercolour paper and pale canopy bloom;
- a curved dashed trail;
- the entrance sign with name and two-line headline;
- one hanging signpost taken from the first real link;
- a tree-ring study and a cottage;
- the field-book colophon at the bottom.

The preview contains no anchors, buttons, form controls or tab stops. Its caller
sets `aria-hidden="true"`; text is decorative and never becomes part of the
switcher card's accessible name. It has no animation and no external asset. The
source is 7,965 bytes, inside the 1–8 KiB preview budget.

## Do's and Don'ts

### Do
- Keep the path, paper texture and botanical marks subordinate to reading.
- Use each scene's own geometry: signpost, place marker, tree ring, herbarium
  sheet, cottage.
- Preserve the complete bio, descriptions, tags, roles and periods.
- Keep the body Latin on Georgia and CJK on LXGW; use Fraunces as the display
  voice.
- Use `aria-hidden` for every decorative SVG and every pseudo-ornament that
  could otherwise sound like content.
- Keep focus rings ochre-ink and visible on all links.

### Don't
- Don't add tape, stickers, scrapbook pages, anime mascots, stock plants or
  generated raster art.
- Don't turn stations into a repeated rounded card grid.
- Don't invent levels, quests, completed projects, seasons or natural facts.
- Don't add a theme script, scroll hijacking, looping leaves or parallax.
- Don't use `order` to change the trail order or hide optional sections
  visually while leaving only some of their data in the DOM.
- Don't write `:root` in the token file or preview; the preview must remain
  isolated from the switcher chrome.

## Project Contract

- Data: `loadDesignView('little-forest', Astro.url.pathname)` only.
- Head: `<HeadMeta {...view.head} />` is passed through unchanged.
- Chrome: `<ContextMenu config={view.contextMenu} />` is unconditional and is
  the final body child.
- Rendering: `styled`; `Page.astro` is a complete document with
  `<html lang={view.head.lang}>`.
- CSS entry starts with the required Tailwind import and `@source "./";`, and
  excludes `Preview.astro` with `@source not "./Preview.astro";`.
- Palette is namespaced in `tokens.css`; font roles are registered in
  `style.css` with `@theme inline`.
- No `script.ts`, no client-side theme asset and no shared-file changes.
