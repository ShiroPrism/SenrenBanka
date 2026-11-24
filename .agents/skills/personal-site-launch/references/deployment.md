# Deployment providers and permissions

Use this reference only when deployment or cleanup is requested.

## Permission checklist

Check connectors and CLIs in the current harness. A connected plugin, MCP server, or authenticated CLI all count as a usable connection.

| Provider | Minimum deploy permission | Extra permission | Required checks |
|---|---|---|---|
| GitHub Pages | repository contents write; admin or maintainer permission to configure Pages; Actions enabled | `delete_repo` for deleting a temporary repository; DNS/domain control for a custom domain | `gh auth status`, repository `viewerPermission`, Pages API, workflow runs |
| Cloudflare Pages | Cloudflare Pages Write; Account Read | Zone DNS Edit for a custom hostname; project deletion | connector account identity, `wrangler whoami`, project list |
| Vercel | project/deployment creation in the selected team | domain management for a custom domain; project deletion | connector team context, CLI login or `VERCEL_TOKEN`, project list |

The preflight script can report local CLI/auth state. It cannot see Agent connectors; inspect the active tool list separately.

If permission is missing:

1. Continue local profile work that does not require the provider.
2. Name the exact connection or scope that is missing.
3. Stop before creating a repository/project, pushing, deploying, or deleting.
4. Retry only after the user enables the connection or scope.

Never ask for a token in a chat message. Use the Agent's plugin/connection flow or the CLI's own login flow.

## Provider selection

For a public starter repository, distinguish the source repository from the deployment repository:

- The owner or an authorized collaborator may clone the source repository, push changes, and deploy from it.
- If the source is a template repository, use "Use this template" in the GitHub UI or `gh repo create <name> --template <owner>/<repo> --clone` to create an independent repository, then clone that writable copy. Ask for public/private visibility when the provider is GitHub Pages; a public repository is the simplest free-plan path.
- If the source is not a template and the external user has read-only access, clone the source only to make local changes; to deploy through GitHub Pages or a Git integration, fork it to their account or create an independent repository, then clone that writable copy.
- A locally built `dist/` can be deployed without a Git remote through Cloudflare Pages Direct Upload or the Vercel CLI. This is a separate deployment mode and does not create automatic GitHub Actions deployment.

When the user does not choose:

1. Use GitHub Pages if the current repository can be pushed and Pages can be administered.
2. Otherwise use a connected Cloudflare account with Pages permission.
3. Otherwise use a connected Vercel team with deployment permission.
4. If none is usable, ask the user to connect one.

GitHub Pages is the default because this repository already contains `.github/workflows/deploy.yml`.

## Temporary test resources

For an end-to-end test or a temporary site:

- use an isolated local clone under `.cache/personal-site-launch-tests/<run-id>/`, not the main working tree or a sibling directory outside the workspace;
- name resources `senrenbanka-launch-<yyyyMMdd-HHmmss>`;
- record owner/account, repository/project name, URL, and creation time;
- use a public test repository only when the user authorized public publication;
- verify deletion permission before creating temporary resources;
- never delete a resource whose resolved owner/name does not match the run log.

If the repository is owned by another account, a GitHub fork is appropriate. If the target account already owns the source repository, GitHub cannot create a same-account fork. Create a new temporary repository from the isolated clone instead and state that it is a copy, not a GitHub fork.

## GitHub Pages

### Preconditions

- `gh auth status` succeeds.
- The repository is writable (`viewerPermission` is `WRITE`, `MAINTAIN`, or `ADMIN`); configuring a publishing source requires admin or maintainer permission.
- Actions are enabled for the repository.
- Pages source is set to GitHub Actions for this deployment method.
- For cleanup, `delete_repo` is available.

The repository workflow injects:

```text
SITE_URL=https://<owner>.github.io
BASE_PATH=/<repository>
```

Build locally first, but let the workflow perform the production build so the subpath base and canonical URLs are correct.

### Deploy flow

1. Commit only the intended profile/config changes in the isolated clone.
2. Push to the default branch `main`.
3. If this is a new repository, create it with the authenticated `gh` account and push the clone.
4. Enable Pages with GitHub Actions as the source when it is not already enabled.
5. Enable the workflow if a fork left it disabled.
6. Wait for the Pages deployment workflow to finish successfully.
7. Read the Pages URL from `GET /repos/{owner}/{repo}/pages`, field `html_url`, and verify that exact public origin. Do not assume the project-page URL is always `<owner>.github.io`; an account-level Pages custom hostname can rewrite it.

For a project page without an account-level custom hostname, the expected URL is:

```text
https://<owner>.github.io/<repository>/
```

If the repository is `<owner>.github.io`, the base path must be `/`.

If the Pages API returns a different hostname, compare it with the deployed HTML's canonical and hreflang origins. The repository workflow currently derives `SITE_URL` from `github.repository_owner`; for a real deployment whose Pages origin differs, feed the verified public origin into the build:

1. Change the workflow's build environment to:

   ```yaml
   SITE_URL: ${{ vars.SITE_URL || format('https://{0}.github.io', github.repository_owner) }}
   ```

2. Set the repository variable and rerun deployment:

   ```powershell
   gh variable set SITE_URL --repo <owner>/<repo> --body "https://<pages-host>"
   ```

3. Re-run the Pages workflow and verify that canonical and hreflang use the same HTTPS host and repository base path as the live site.

Use `https://` when the host serves the site over HTTPS with an approved certificate, even if the Pages API reports an `http://` value. Do not change global account Pages settings merely to make the test URL look conventional.

### Custom domain

Only when requested:

- add `public/CNAME`;
- change workflow `BASE_PATH` to `/`;
- set `SITE_URL` to the custom origin;
- configure DNS and GitHub Pages domain verification;
- wait for HTTPS provisioning.

Do not publish a custom domain from a temporary test run unless the user explicitly asked for one.

### Cleanup

Verify the exact `owner/name`, then delete the temporary repository. If `delete_repo` is unavailable, report the repository URL and the missing scope; do not claim deletion. To request the scope interactively:

```powershell
gh auth refresh -h github.com -s delete_repo
```

This changes the GitHub CLI account authorization and requires the user to complete the browser/device approval.

## Cloudflare Pages

### Preconditions

- Cloudflare connector can identify the account, or `wrangler whoami` succeeds.
- Token/connection has Pages Write and Account Read.
- DNS permission is required only for a custom hostname.
- Project deletion permission is verified before a temporary project is made.

### Two supported paths

Preferred for a quick launch: direct upload.

```text
npm ci
npm run fonts:prepare
npm run build
wrangler pages project create <project>
wrangler pages deploy dist --project-name <project>
```

If `wrangler` is not installed, use a project-scoped ephemeral invocation or the Cloudflare connector/API; do not add it to the site's runtime dependencies.

Alternative: connect the repository in the Cloudflare dashboard and use:

```text
Build command: npm ci && npm run fonts:prepare && npm run build
Output directory: dist
Node version: 24
```

Set `SITE_URL` to the final Pages URL or custom domain. Do not set `BASE_PATH` for a Pages root deployment.

### Verification and cleanup

- Verify the reported `*.pages.dev` URL and at least one locale route.
- Remove any temporary custom domain before deleting the project.
- Verify the account ID and project name before deletion.

## Vercel

### Preconditions

- A Vercel connector with team access, or an authenticated Vercel CLI/token.
- Permission to create a project and production deployment.
- Domain permission only if a custom domain is requested.
- Project deletion permission verified before creating a temporary project.

The Vercel connector may be read-only for deployments. If it cannot create a deployment, use the CLI or the Vercel Git integration instead of claiming the connector can deploy.

### Deploy flow

For a Git-integrated project:

```text
Install command: npm ci
Build command: npm run fonts:prepare && npm run build
Output directory: dist
Node version: 24
```

Set `SITE_URL` to the final Vercel URL or custom domain.

For CLI deployment, authenticate through the CLI's own login flow or a user-provided environment secret. Never echo the secret. Ensure the project's install/build commands include `fonts:prepare`, because font binaries are not stored in Git.

### Verification and cleanup

- Verify the production URL and at least one locale route.
- Confirm the deployment belongs to the intended team and project.
- Remove temporary domains/aliases before deleting a temporary project.
- Verify project/team IDs before deletion.

## Live acceptance

For every provider, verify:

- provider dashboard/API says deployment succeeded;
- the URL resolves successfully;
- the new profile name appears;
- the old sample identity and sample notice do not appear;
- every selected locale route exists;
- no unselected locale route is advertised;
- assets and fonts load without obvious 404s or console errors.

Record the exact URL, provider, account/owner, deployment identifier, and cleanup status in the final report.
