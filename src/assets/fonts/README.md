# Font migration pointer

This directory no longer stores production font binaries or duplicated license
files. The 20 local-provider families were migrated to the versioned
[SenrenBanka-fonts](https://github.com/whitehair-failure/SenrenBanka-fonts)
catalog in catalog v1.0.0.

The runtime dependency chain is:

```text
fonts.config.json
  -> fonts.lock.json + fonts.catalog.json
  -> src/fonts/generated.ts
  -> .cache/fonts/<catalogVersion>/<family>@<version>/
  -> Astro fontProviders.local()
```

Prepare the ignored cache before a clean build:

```bash
npm run fonts:prepare
npm run build
```

Only explicitly selected families are downloaded. `fonts.lock.json` pins the
catalog and family package hashes; `fonts:check` verifies the ignored cache
offline and fails with a repair command when a file is missing or corrupted.

The upstream family, release, license, and RFN index is maintained in
[`SOURCES.md`](./SOURCES.md). The six remaining Fontsource npm-provider families
are not stored here.
