# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

<!--
Document your project's quality standards here.

Questions to answer:
- What patterns are forbidden?
- What linting rules do you enforce?
- What are your testing requirements?
- What code review standards apply?
-->

(To be filled by the team)

---

## Forbidden Patterns

<!-- Patterns that should never be used and why -->

(To be filled by the team)

---

## Required Patterns

<!-- Patterns that must always be used -->

### Documentation entry points are routing gates, not rule bodies

An agent auto-loads a root instruction file on every session. Keep that file
small and make it route to topic-scoped rule documents; do not let it accumulate
full policy prose.

```text
AGENTS.md                    # auto-loaded: hard gates + task routes
docs/rules/README.md         # index and read protocol
docs/rules/<topic>.md        # sole full-text rule source
```

Rules:

- Every hard gate is one immediately actionable sentence and links to its
  authoritative topic file.
- The root file must not duplicate long rule paragraphs.
- A documentation gate checks the root character budget, required topic files,
  relative links, ordered Trellis markers, unique level-two headings, and the
  gate-to-topic mapping.
- Historical change logs and archived tasks keep their original references;
  migrate only current source comments, docs, specs, skills, and active tasks.

Verification assertions:

```text
assert root character count <= configured budget
assert every required hard gate links to the expected docs/rules file
assert every required rule file exists and is non-empty
assert every relative Markdown link resolves
assert TRELLIS:START precedes TRELLIS:END
assert no duplicate non-whitelisted level-two headings across rule files
assert npm run check runs the documentation test suite and verifier
```

### CSS multi-column balancing for wide single sheets

When a single wide surface is split into balanced text columns, use
`column-count` and keep section and entry blocks whole:

```css
.sheet-body {
  column-count: 2;
  column-gap: clamp(5rem, 7vw, 7rem);
  column-rule: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
}

.sheet-body > section,
.sheet-body .entry {
  break-inside: avoid;
}
```

Do not add top spacing on the multi-column container itself. Chromium balances
the fragments before applying the container margin, so the second column starts
higher than the first. Put the inset on the first child instead:

```css
.sheet-body > section:first-child {
  padding-top: 1.7rem;
}
```

Keep DOM order identical to reading order; visual columns must not depend on
`order`. Long Latin text and URLs need `min-width: 0` on every column ancestor
and an explicit wrapping rule on list entries.

Verification assertions:

```text
assert computed(column-count) == "2"            # >= desktop breakpoint
assert computed(column-count) == "auto"         # below breakpoint
assert page.scrollWidth <= viewport.innerWidth + 1
assert no descendant exceeds the sheet bounds
assert every named section remains inside one column
```

---

## Testing Requirements

### Font delivery cost must be reported as a set, not a request count alone

Any change that can alter the switcher's font requests must record all of the
following from a fresh browser run against `/{locale}/designs/`:

- unique WOFF2 request URLs (deduplicated per locale);
- total bytes of those responses;
- the baseline request set and the newly added request set;
- byte total of the newly added files, kept separate from the page's total font cost.

A request-count delta such as `22 -> 25` is not a size claim. Do not infer bytes
from the count, and do not label the newly added bytes as the total cost. The
switcher currently has large existing CJK/typewriter subsets, so total font cost
can be much larger than the delta introduced by one design.

Minimum assertion points:

```text
baseline = set of unique WOFF2 URLs at 0.14.0
current  = set of unique WOFF2 URLs after the change
added    = current - baseline
removed  = baseline - current

assert added  == { expected font files }
assert removed == { expected font files }   # normally empty
assert sum(bytes of current) is recorded separately from sum(bytes of added)
```

Record the result in `docs/verification/shared.md` and the active change log.
Use the browser network log as authority; `@font-face` declaration count is not a
substitute because unicode-range subsets load lazily.

---

## Code Review Checklist

<!-- What reviewers should check -->

(To be filled by the team)

### Final-output HTML gates must be fail-closed

When a design mode promises that final HTML contains no CSS, JavaScript, or
external front-end resources, validate the built artifact rather than the
source template. Source checks cannot see resources injected by shared
components, framework integrations, or generated scripts.

Rules:

- Parse HTML start tags and attributes instead of grepping whole documents;
  markup-like text inside `title` / `textarea` is text, not an element.
- Treat browser-valid tokenizer edge cases as part of the gate: `--!>` and
  abrupt comment closures, bogus declarations, quotes inside unquoted attribute
  values, entity/control-character-obscured `javascript:` URLs, `srcset`, and
  `meta refresh`.
- Allowlist `<link rel>` values rather than denylisting individual resource
  types. A future `rel` value must fail until intentionally approved.
- Fail when no candidate pages are discovered, when an expected artifact is
  missing, or when the dist directory is absent. A gate that can pass vacuously
  is not a gate.
- Keep positive and negative cases in an automated test suite (Node's built-in
  test runner is sufficient here), and run that suite before the artifact scan
  in `npm run build`.

Verification assertions:

```text
assert npm run build runs the final-output gate
assert no candidates / missing page / missing dist exits non-zero
assert each forbidden tag, attribute, link rel, URL, and refresh case fails
assert benign literal markup in text-only elements does not fail
```
