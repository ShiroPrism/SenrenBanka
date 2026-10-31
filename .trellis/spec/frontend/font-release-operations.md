# Font Release Operations Code-Spec

## Scenario: Immutable Font Catalog Releases

### 1. Scope / Trigger

Apply when implementing or reviewing the external `SenrenBanka-fonts` catalog
release flow, or when changing how SenrenBanka consumes its release assets.
The trigger is a GitHub release/tag/asset contract or release-workflow change.

### 2. Signatures

```text
GET    /repos/{owner}/{repo}/releases?per_page=100
POST   /repos/{owner}/{repo}/releases
POST   /repos/{owner}/{repo}/releases/{releaseId}/assets
PATCH  /repos/{owner}/{repo}/releases/{releaseId}   { draft: false }
GET    /repos/{owner}/{repo}/git/ref/tags/{tag}
```

Family package path:

```text
{baseUrl}/{releaseTag}/{fileName}
```

### 3. Contracts

- Release discovery must list releases. GitHub's
  `GET /releases/tags/{tag}` endpoint does not return Draft Releases.
- New releases follow: empty Draft -> upload missing assets -> remote verify ->
  Publish. No Publish call may occur before every expected Draft verifies.
- Publish order is bootstrap, families, catalog. Catalog is the visibility
  commit point.
- Expected assets are matched by exact name, size, and `sha256:` digest. Extra,
  missing, or conflicting assets fail closed.
- Existing Drafts are reusable. Existing published Releases are read-only and
  may be reused only after exact verification.
- A tag without a Release is ambiguous and must fail before mutation.
- `GITHUB_TOKEN` must not query the admin-only Immutable Releases setting.
  Immutability is a repository administrator setting enforced by GitHub.
- Workflow permissions: build job `contents: read`; publish job
  `contents: write`; no PAT or administrator credential.
- Never use `--clobber`, delete tags, delete Drafts, or delete published assets
  as part of normal recovery.

### 4. Validation & Error Matrix

| Condition | Required behavior |
|---|---|
| Release API list fails | Stop before any mutation |
| Existing tag without Release | Stop before any mutation |
| Existing Draft has missing assets | Upload only missing assets |
| Existing Draft has same asset bytes | Skip upload |
| Existing Draft has extra/conflicting asset | Stop; do not overwrite |
| Any upload fails | Leave Draft recoverable; publish nothing |
| Any Draft fails post-upload verification | Publish nothing |
| Existing published assets exactly match | Reuse without mutation |
| Existing published assets differ | Stop without mutation |
| Catalog Publish not last | Invalid implementation |

### 5. Good/Base/Bad Cases

- Good: interrupted upload leaves a Draft; retry discovers it through release
  listing, uploads the missing file, verifies all Drafts, then publishes.
- Base: all 22 releases already exist and match; the implementation performs
  one release-list GET and zero mutations.
- Bad: use the tag endpoint to look for a Draft, receive 404, and recreate the
  same tag; this breaks recovery.

### 6. Tests Required

- Empty Draft creation and bootstrap -> families -> catalog order.
- Draft recovery after create, partial upload, verification failure, partial
  publication, and transport failure.
- Matching asset skip; conflicting/extra asset rejection before mutation.
- Existing published bootstrap/family/catalog reuse.
- Tag-without-release rejection.
- Fully published catalog replay performs no mutation.
- Static assertion that source contains no Immutable Releases query,
  `--clobber`, release deletion, or `--cleanup-tag`.

### 7. Wrong vs Correct

#### Wrong

```text
GET /releases/tags/font-example-v1
if 404: create release
```

#### Correct

```text
GET paginated /releases
index all Draft and published releases by tag_name
verify/reuse or create an empty Draft only after global preflight
```
