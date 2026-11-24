---
name: personal-site-launch
description: "SenrenBanka 快速上线：检查当前 Agent 环境中的 GitHub、Cloudflare、Vercel 连接和部署权限，从用户提供的图片、PDF、DOCX、Markdown 等资料提取可核实的个人信息，按资料语言与项目现有语言的交集替换 profiles、同步 site.config.yaml，构建验收后部署并验证可访问网址。用于个人主页的资料导入、建站和部署；不用于修改设计样式、新增字段或重构站点。"
---

# Personal Site Launch

## Outcome

Produce a deployable SenrenBanka site whose profile data comes from the user's files, whose locale set matches the supplied documents and the project's supported locales, whose site metadata is no longer sample data, and whose live URL has been verified when deployment was requested.

Read `docs/rules/data-and-i18n.md`, `docs/rules/operations.md`, and the deployment section of `README.md` before editing. Project rules override this skill where they are stricter.

## Hard boundaries

- Extract only facts present in the supplied files or confirmed by the user. Never invent employers, dates, links, achievements, contact details, or a biography.
- Do not publish government identifiers, financial data, account numbers, a precise home address, or private phone numbers. `location` may contain a city or region. Publish email only when it is visibly intended as public contact information or the user confirms it.
- Treat raw attachments as private working data. Keep extracted copies under `.cache/personal-site-intake/<run-id>/` and never commit them.
- Replace profile data and locale metadata only. Do not edit design pages, shared components, font configuration, or content-schema fields.
- Keep edited text files LF. The repository's `check:eol` gate rejects CRLF.
- A request to prepare or preview the site does not authorize publishing. Pushing commits, creating remote repositories/projects, deploying, binding a domain, changing DNS, and deleting remote resources are separate external mutations.
- Do not claim success from a local build alone. For deployment, verify the provider reports success and the live URL returns the expected content.

## Workflow

### 1. Establish project state and bootstrap

1. Confirm whether the current directory is a SenrenBanka checkout by checking `package.json`, `src/data/site.config.yaml`, and `src/data/profiles/`.
2. If it is not, create a checkout before doing anything else:
   - If the selected deployment path is GitHub Pages or a Git integration, create an independent repository from the template `ShiroPrism/SenrenBanka`:

     ```text
     gh repo create <repository-name> --template ShiroPrism/SenrenBanka --public --clone
     ```

     Use `--private` instead when the user explicitly wants private source and understands GitHub Pages may depend on the account plan. If the repository name or visibility is not supplied, ask one concise question before creating anything. Before running the command, verify that a GitHub connector or authenticated `gh` session is available. If it is not, stop and list the missing connection/permission; do not create a local half-checkout or ask the user to manage the repository manually.
   - If the user only wants Cloudflare Pages Direct Upload or Vercel CLI, clone `https://github.com/ShiroPrism/SenrenBanka` into a new local directory; no new remote is required.
   - If the user already has write access to a source checkout, clone that source instead.
   - Never work inside the installed skill directory, never overwrite an existing directory, and never assume a shell's current directory after cloning. Run subsequent commands in the checkout.
3. Run `node .agents/skills/personal-site-launch/scripts/preflight.mjs --json` from the checkout.
4. Inspect `git status`. Preserve unrelated changes. If `src/data/profiles/` or `src/data/site.config.yaml` already contains changes you did not make, stop and ask before replacing them.
5. Determine the requested mode:
   - configure only;
   - configure and deploy;
   - configure, deploy to temporary resources, verify, then clean up.

### 2. Pass the deployment permission gate

Check both halves of the runtime:

- the active Agent tool list for GitHub, Cloudflare, and Vercel connectors or MCP tools;
- local CLIs and authenticated sessions reported by preflight, especially `gh`, `wrangler`, and `vercel`.

Read `references/deployment.md` for the provider permission matrix.

- Determine repository ownership before choosing GitHub Pages. A public upstream that the user cannot push to is a source, not a deployment target. If the source is a template repository, create an independent repository with "Use this template" or `gh repo create --template`, then clone it. If the source is not a template and is not writable, use a fork or create an independent repository, then clone the writable copy. Local profile work may continue while waiting.
- A direct-upload path (Cloudflare Pages Direct Upload or Vercel CLI) can deploy a locally built `dist/` without a writable Git remote, but that path does not provide GitHub Actions or Git-integration auto-deploy.
- If at least one usable provider exists, continue.
- If the user named a provider that is not available, finish any local-only preparation, then stop before remote mutation and tell the user exactly which plugin/connection or CLI login must be enabled. Wait for the user to enable it before retrying the external step.
- If the user named no provider, prefer GitHub Pages when repository write, Actions, and Pages administration are available. Otherwise choose a connected Cloudflare or Vercel path. If none is usable, ask the user to connect one.
- If temporary deployment and cleanup are requested, verify deletion permission before creating the temporary repository/project. GitHub repository deletion requires the `delete_repo` OAuth scope or an equivalent connector capability. Do not discover this only after creating the repo.
- Never ask the user to paste a token into chat and never print tokens.

### 3. Extract personal facts

Read `references/intake.md`.

1. Inventory every supplied file and note its format and language.
2. Extract text and images using the available PDF/document/vision tools. Do not add project dependencies for extraction.
3. Maintain an evidence ledger while extracting:

   ```text
   field -> value -> source file + page/line/region + confidence
   ```

4. Normalize duplicate facts across files. On a conflict, do not average or guess: ask one concise question that lists the conflicting values and sources.
5. If a required field is missing, ask one bundled question for all missing required fields. Required fields are `name`, `headline`, `bio`, and `links`. A factual `headline` or `bio` may be synthesized from supplied facts, but it must not add new claims. An empty `links` array is valid only when the user explicitly accepts it.
6. Select an avatar only when an image is clearly a portrait intended for publication. Copy it to `src/data/assets/` with a simple ASCII filename; never use a resume page screenshot as the avatar.
7. When the source supports an optional block, include it. Do not drop verified `projects`, `experience`, `skills`, or `contact` content merely to keep the profile short; omit only blocks that are unsupported or unverified.

### 4. Resolve the locale set

Use the language of the source material and the locales already declared in `src/data/site.config.yaml`.

- If the user names target languages, use those. Translate only facts already established; do not translate or localize URLs, proper names, or technical identifiers.
- If the user does not name target languages, use: `detected document languages ∩ currently configured project locales`.
- Do not add a locale that the project does not already support.
- If the intersection is empty, or simplified/traditional Chinese cannot be distinguished confidently, ask before generating profiles.
- Use the user's explicit default-locale choice. Otherwise use the language of the lead document; when that is ambiguous, use the first selected locale in the project's existing locale order.

Known mappings:

| Locale | Path | `fontProfile` |
|---|---|---|
| `zh-CN` | `zh-cn` | `cjk` |
| `zh-TW` | `zh-tw` | `traditional-chinese` |
| `ja` | `ja` | `cjk` |
| `en` | `en` | `latin` |
| `ko` | `ko` | `korean` |

### 5. Replace profiles and synchronize site metadata

1. Replace every selected `src/data/profiles/<path>.yaml` completely. Do not merge old sample facts into the new profile.
2. Delete profile files for locales no longer selected. The build requires a one-to-one match between `i18n.locales` and `src/data/profiles/*.yaml`.
3. Record every asset referenced by the old profiles before deleting them. After the replacement, remove only old profile-owned assets under `src/data/assets/` that are no longer referenced by any selected profile. Never delete unrelated user assets. Astro's eager asset registry can otherwise copy an obsolete sample portrait into `dist/`.
4. Update each locale entry in `src/data/site.config.yaml`:
   - `code`, `path`, and `label`;
   - localized `title` and `description`;
   - matching `fontProfile`;
   - remove `notice`.
5. Set `i18n.defaultLocale` to a selected locale.
6. Keep the existing `design` block unless it cannot build with the selected locales. The default design must cover every selected locale. If it does not, choose an enabled design whose `design.json.locales` covers all of them; if none does, stop and ask.
7. Leave `site.url` unset unless the user supplies a canonical URL. Deployment should use `SITE_URL` so temporary domains do not get committed.

### 6. Validate locally

Use Node 24 from `.nvmrc`.

```powershell
npm ci
npm run fonts:prepare
npm run build
```

`npm ci` may be skipped only when `node_modules/` is already installed from the same lockfile. Never skip `fonts:prepare` after a clean clone or missing font cache.

Before handing off:

- Confirm every selected locale has generated pages and no unselected locale directory remains in `dist/`.
- Confirm the new `name`, `headline`, `bio`, and each link appear in the built HTML for the relevant locales.
- Confirm old sample names and `notice` text no longer appear in generated pages.
- Confirm `git status` contains no raw intake files, `.cache`, `dist`, or temporary credentials.
- Run `git diff --check`.

Do not run the full `design-page-verify` skill for a profile/config-only change. If the task also changed a design or shared rendering code, that verification is required by project rules.

### 7. Deploy

Use the selected provider's reference in `references/deployment.md`.

Before the first remote mutation, report the concrete target:

```text
provider, account/owner, repository or project name, visibility, branch,
canonical URL, custom domain (if any), resources that will be created
```

Proceed when the user's request already authorizes that target. Ask only when a target is ambiguous or the operation adds a custom domain, DNS change, paid resource, or deletion outside a temp-test namespace.

For a temporary fork/test:

1. Use an isolated local clone under the ignored workspace cache, for example `.cache/personal-site-launch-tests/<run-id>/`; do not test in the main working tree or in a sibling directory outside the workspace.
2. If the source repository belongs to another account, a GitHub fork is appropriate. If it is already owned by the target account, GitHub cannot fork it to the same account; create a new temporary repository from the clean clone instead.
3. Name remote resources `senrenbanka-launch-<yyyyMMdd-HHmmss>` and record every created resource in the run log.
4. Publish only the generated site or test branch required by the deployment.

### 8. Verify the live result

- Fetch the provider-reported URL; require a successful HTTP response.
- For GitHub Pages, resolve the URL from the Pages API (`html_url`) instead of assuming `<owner>.github.io`. Account-level custom hostnames can rewrite the public origin. If the canonical or hreflang origin differs from the public Pages origin, fix the deployment `SITE_URL` for a real launch or report the mismatch explicitly; do not present the canonical check as passing.
- When the Pages API reports `http://` but the origin serves HTTPS with an approved certificate, use the verified `https://` origin for canonical and hreflang values.
- Check the root and at least one `/<locale>/<design>/` route for every selected locale.
- Verify the new profile name and a link label appear in the deployed HTML.
- Verify the old sample notice and old profile identity are absent.
- Verify there are no obvious missing assets or runtime console errors when a browser tool is available.
- For GitHub Pages, verify the deployment workflow completed successfully.

### 9. Clean up temporary resources

Delete only resources recorded in this run whose names match the temporary namespace and whose owner/account matches the tested account.

- Remove custom-domain bindings before deleting a temporary project/repository when the binding is also temporary.
- For GitHub, confirm `delete_repo` capability immediately before deletion.
- For Cloudflare/Vercel, verify the resolved project/account IDs before deletion.
- For local directories, resolve the absolute path, confirm it is under the intended temporary root, and then remove it. Never recursively delete a computed path without those checks.
- If cleanup permission is unavailable, report the exact remaining resources and the permission needed. Do not claim cleanup succeeded.

## References

- `references/intake.md` — supported formats, extraction, evidence, language mapping, profile and `site.config.yaml` rules.
- `references/deployment.md` — provider capability checks, permission matrix, GitHub Pages / Cloudflare Pages / Vercel flows, and cleanup.
- `scripts/preflight.mjs` — read-only local environment and git/auth probe.

## Completion report

Report:

- selected locales and the evidence used to choose them;
- profiles replaced or deleted;
- missing/omitted information and whether the user confirmed it;
- build result and relevant verification checks;
- provider, deployment URL, and workflow/deployment result;
- temporary resources created, deleted, or still remaining;
- any permission that was unavailable.
