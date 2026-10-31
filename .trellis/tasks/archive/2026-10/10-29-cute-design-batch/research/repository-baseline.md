# Repository Baseline

- Current branch: `main`; working tree was clean at planning start.
- Version: `0.16.1`; package manager npm; Node engine `>=22.12`.
- Existing designs: 16 enabled — 15 `styled` + 1 `html-only`; current default remains `editorial`.
- Locales: `zh-CN` / `ja` / `en`; each design must supply all three message dictionaries.
- Existing design IDs do not conflict with the six requested IDs.
- Registry: `src/designs/registry.ts` auto-discovers `*/design.json`; required files are `DESIGN.md`, `design.json`, `Page.astro`, `messages.ts`, plus `style.css` for `styled`.
- Routes: `astro.config.mjs` injects fixed per-locale routes; no route edit is needed for new design directories.
- Descriptions: `src/designs/descriptions.ts` is the switcher's localized description index and must be updated centrally.
- Preview: `src/infra/SwitcherPage.astro` eager-globs `../designs/*/Preview.astro`; previews are decorative SSR fragments and must export `fonts`.
- CSS isolation: every `style.css` starts with `@import "tailwindcss" source(none); @source "./";`, adds `@source not "./Preview.astro";`, and avoids design-level `:root`.
- Existing adjacency risks: `tape` (handmade paper/handwriting), `archive` / `fax` / `receipt` (paper objects), `poster` (bold print), `pager` (pixel device).
- Existing verification baseline (latest recorded build): 81 pages at version 0.16.1; do not assume the exact page count remains after six designs and must record the new count.
- Current full build may legitimately report pre-existing hints; classify them rather than treating them as new regressions.
- Shared browser/build tools must be used serially after all six design directories are complete because this platform has no isolated sub-agent worktree entry.
