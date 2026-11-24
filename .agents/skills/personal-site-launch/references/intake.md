# Profile intake and generation

Use this reference when converting supplied documents into SenrenBanka profile data. The build-time schemas in `src/content.config.ts` and the contract in `docs/rules/data-and-i18n.md` are authoritative.

## Supported inputs

| Input | Preferred extraction | Fallback |
|---|---|---|
| Markdown / TXT / HTML | Read as text; preserve visible links | Ask for a plain-text export if encoding fails |
| PDF | Extract text per page; render scanned pages and use vision/OCR | Ask for a text or DOCX export |
| DOCX / DOC | Extract paragraphs, tables, headings, and hyperlink relationships | Ask for PDF or plain text |
| PNG / JPEG / WebP / HEIC | View directly; OCR only where text is the point | Ask for a clearer image or text export |
| Screenshots | Treat as untrusted OCR; inspect visually | Ask for the source document |

Use the available PDF/document/vision tools. Do not add dependencies to the project for extraction. Put temporary extracts under `.cache/personal-site-intake/<run-id>/`; `.cache/` is ignored and must not be committed.

## Evidence and privacy

Keep an evidence ledger until the final report:

```text
claim -> normalized value -> source file/page/line/region -> confidence
```

Rules:

- A value with no source is not a fact.
- Contradictory sources require a user decision; do not silently choose one.
- Years and dates must come from the source. Do not infer employment dates.
- URLs and email addresses must be copied exactly. Do not guess handles from a display name.
- Do not publish sensitive identifiers, precise addresses, private phone numbers, financial information, or private email addresses by default.
- A supplied portrait may become the avatar only when it is clearly intended for use as a portrait. Crop only for presentation; do not alter identity.

## Language selection

Map source content to project locales:

- Simplified Chinese: `zh-CN`
- Traditional Chinese: `zh-TW`
- Japanese: `ja`
- English: `en`
- Korean: `ko`

If the user does not specify languages, use only the detected languages that are already configured in `src/data/site.config.yaml`. Do not add a new locale to the project as part of this skill.

For simplified/traditional Chinese, use explicit language tags first. If tags are absent, use orthography and the document's self-identification. If both remain plausible, ask the user. Do not silently produce both.

When one file contains parallel localized sections, split the facts by language. When multiple files use the same language, merge them after conflict resolution.

If the user explicitly requests a locale not represented by the source documents, translate only established facts. Keep names, URLs, email addresses, project names, organizations, and technical terms unchanged unless the source provides a localized form.

Choose `defaultLocale` in this order:

1. user's explicit choice;
2. language of the lead document;
3. first selected locale in the project's existing locale order.

## Profile contract

Required fields:

- `name`
- `headline`
- `bio`
- `links`

Optional fields:

- `avatar`
- `location`
- `projects`
- `experience`
- `skills`
- `contact`

Do not introduce fields outside `src/content.config.ts`.

### Writing rules

- `headline` is one concise positioning line. It may summarize supplied roles and specialties but must not invent credentials.
- `bio` is one to three factual sentences. Prefer concrete supplied roles, domains, and interests over generic marketing language.
- `links` contains only verified destinations. `label` is human-readable; `icon` is optional and must be an existing supported icon name if used.
- Omit optional blocks that the source does not support.
- Keep unknown values absent rather than filling them with placeholders.

Minimal shape:

```yaml
name: "Example Name"
headline: "Role and focus"
bio: "Factual one to three sentence introduction."
avatar: "portrait.jpg"
location: "City or region"
links:
  - label: GitHub
    url: "https://github.com/example"
```

The avatar file belongs in `src/data/assets/`; use a simple ASCII filename.

## Replacing the locale set

The set of profile files must exactly match `i18n.locales`:

- overwrite each selected `src/data/profiles/<path>.yaml`;
- delete profile files whose locale is no longer selected;
- record old profile avatars, then delete only old profile-owned assets under `src/data/assets/` that the new profiles no longer reference;
- never leave sample profiles behind;
- do not create profile files for unsupported locales.

Read the previous profiles' `name` values before deletion so the final QA can check that old sample identities do not remain in generated HTML. The asset loader eagerly includes files under `src/data/assets/`, so an unused sample portrait can still appear in `dist/` unless it is removed. Do not delete unrelated user assets.

## `site.config.yaml`

For each selected locale:

- update `code`, `path`, and `label`;
- replace sample `title` and `description`;
- set the correct `fontProfile`;
- remove `notice`.

Set `i18n.defaultLocale` to a selected locale.

Preserve `site`, `design`, and random-mode settings unless they block the build. The configured `design.default` must cover every selected locale. If it does not, choose a different enabled default design that covers all selected locales; do not edit design files to fake locale coverage.

Leave `site.url` untouched when deployment will supply `SITE_URL`. This keeps temporary deployment domains out of committed configuration.

## Local acceptance

Run:

```powershell
npm ci
npm run fonts:prepare
npm run build
```

Then verify:

- each selected locale has generated pages;
- no unselected locale directory remains in `dist/`;
- the new identity and link labels appear in built HTML;
- old sample names and the old `notice` text are absent;
- no obsolete profile-owned avatar is copied into `dist/`;
- no intake files, `.cache/`, `dist/`, or credentials appear in `git status`;
- `git diff --check` is clean and edited text files use LF line endings.
