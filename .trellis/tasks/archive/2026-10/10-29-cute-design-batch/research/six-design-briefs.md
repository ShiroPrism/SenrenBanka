# Six Design Briefs

## Common Contract

- Six independent `styled design` pages.
- Render all non-empty core and optional Profile fields; never invent personal facts or fictional game progress.
- No external raster assets or hotlinks. CSS, original inline SVG, HTML geometry and the existing avatar only.
- Desktop may be spatial; mobile follows DOM order in one readable column with no page-level horizontal scrolling.
- Each `DESIGN.md` must include metaphor, non-goals, IA, color type spacing geometry, field mapping, component/state rules, motion, responsive/a11y/contrast, six font-selection records, preview spec.

## Fairy Kei

- Core object: an opened retro toy collection case, not a pink card page.
- Composition: central identity window; hanging charm links; packaging-card bio; lower toy boxes for projects; ribbon rail for experience; sticker sheet for skills; note card for contact.
- Native HTML/CSS only. `details` may open drawers; no theme script.
- Motion: spring entrance and charm settle, one-time; reduced motion static.
- Distinct from generic kawaii and Sticker Diary: toy display geometry, not scrapbook spread.

## Sticker Diary

- Core object: a handmade scrapbook with multiple spreads.
- Composition: first spread holds identity/avatar/location/bio; later spreads hold links and optional sections; bookmarks and page controls navigate.
- One private script implements spread state. Without JS, all spreads render as a complete long document.
- Fonts: UglyTypist for Latin handwriting, LXGW WenKai for CJK handwriting, Inter for body.
- Distinct from Tape/Archive/Receipt: an authored page-turning notebook, not a paper object on a desk.

## Pixel Pet RPG

- Core object: a small explorable town, not a pager/device shell.
- Composition: top HUD with real name/headline; central map with station nodes; current location panel; links as inventory; projects as destinations; experience as quest log; skills as tools; contact as postbox/save point.
- Map nodes remain real anchors without JS. With JS they switch the active place panel and player marker.
- No fake level, HP, XP, completion, achievements or stats.
- Fonts: Silkscreen, Ark Pixel 12px, Handjet.

## Little Forest

- Core object: a picture-book trail from forest entrance to a cottage.
- Composition: identity at entrance sign; avatar as field-observation card; links as signposts; projects as trail locations; experience as tree rings; skills as wildflower specimens; contact as cottage.
- Desktop S-shaped route, mobile linear path. CSS/SVG only; no theme script.
- Fonts: Fraunces, LXGW WenKai, system serif.
- Distinct from scrapbook: quiet watercolor/colored-pencil naturalist storytelling, no tape/stickers.

## Cute-alism

- Core object: one full-page geometric collage system with hard black outlines and hard offset shadows.
- Composition: oversized type and color blocks, asymmetric weights; projects as collage grid; experience as stepped color bands; skills as sticker badges; contact as candy-pack back panel.
- No gradients, glass or soft shadows. CSS only; no theme script.
- Fonts: Fredoka, LXGW WenKai, Inter and League Mono for micro labels.
- Distinct from Poster: not a single screenprint poster or stencil composition.

## Magical Girl

- Core object: character dossier layered with a stage entrance.
- Composition: avatar medallion or silhouette; name/headline/bio as stage identity; links as magical items; projects as star-trail episodes; experience as transformation chronology; skills as seals; contact as sealed letter.
- One private script orchestrates a single 0.8–1.2 second entrance; no overlay, sound, external character art or blocking wait.
- Fonts: Fraunces Italic, LXGW WenKai, Inter.
- Distinct from generic pink gradients: authored ribbons, star paths, seals and dossier layout; complete without avatar.
