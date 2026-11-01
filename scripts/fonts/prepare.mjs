import { familyCacheRelativePath, PROJECT_ROOT, sourceCacheRelativePath } from './lib/paths.mjs';
import { fetchBuffer } from './lib/fetch.mjs';
import { inspectFamilyPackageBuffer, inspectSourceArchiveBuffer } from './lib/archive.mjs';
import { installFamilyCache, verifyAllCaches, verifyFamilyCache } from './lib/cache.mjs';
import {
  installSourceCache,
  verifyAllSourceCaches,
  verifyFamilySourceCache,
} from './lib/source-cache.mjs';
import { loadAndValidateFontState } from './lib/repository.mjs';
import { stableStringify } from './lib/json.mjs';

export async function prepareFonts({
  projectRoot = PROJECT_ROOT,
  offline = false,
  fetchImpl = globalThis.fetch,
  logger = () => {},
} = {}) {
  const state = await loadAndValidateFontState({ projectRoot });
  const downloaded = [];
  const reused = [];

  for (const id of Object.keys(state.snapshot.families).sort()) {
    try {
      await verifyFamilyCache({ projectRoot, ...state, id });
      reused.push(id);
      logger(`reuse ${id}`);
      continue;
    } catch (cacheError) {
      if (offline) {
        throw new Error(
          `cached font package is not usable for ${id}: ${cacheError.message}. Run npm run fonts:prepare while network access is available.`,
          { cause: cacheError },
        );
      }
      const family = state.snapshot.families[id];
      const packageUrl = `${state.snapshot.baseUrl}/${family.package.releaseTag}/${family.package.fileName}`;
      logger(`prepare ${id}@${family.version}`);
      const buffer = await fetchBuffer(packageUrl, {
        fetchImpl,
        maxBytes: family.package.size + 1,
        label: `${id} font package`,
      });
      const inspected = inspectFamilyPackageBuffer(buffer, {
        id,
        version: family.version,
        role: family.role,
        package: family.package,
        source: family.source,
      });
      if (stableStringify(inspected.files) !== stableStringify(family.files)) {
        throw new Error(
          `downloaded package file inventory differs from fonts.catalog.json for ${id}`,
          { cause: cacheError },
        );
      }
      await installFamilyCache({
        projectRoot,
        snapshot: state.snapshot,
        lock: state.lock,
        id,
        inspected,
      });
      downloaded.push(id);
    }
  }

  await verifyAllCaches({ projectRoot, snapshot: state.snapshot, lock: state.lock });

  const sourcesDownloaded = [];
  const sourcesReused = [];
  const sourceCacheDirectories = [];
  for (const id of Object.keys(state.snapshot.families).sort()) {
    const family = state.snapshot.families[id];
    if (family.manifest.role !== 'core-cjk') continue;
    sourceCacheDirectories.push(
      sourceCacheRelativePath(state.snapshot.catalogVersion, id, family.version),
    );
    try {
      await verifyFamilySourceCache({ projectRoot, snapshot: state.snapshot, id });
      sourcesReused.push(id);
      logger(`reuse source ${id}@${family.version}`);
      continue;
    } catch (cacheError) {
      if (offline) {
        throw new Error(
          `cached source archive is not usable for ${id}: ${cacheError.message}. Run npm run fonts:prepare while network access is available to download the locked source archive.`,
          { cause: cacheError },
        );
      }
    }
    const sourceUrl = `${state.snapshot.baseUrl}/${family.source.releaseTag}/${family.source.fileName}`;
    logger(`prepare source ${id}@${family.version}`);
    const buffer = await fetchBuffer(sourceUrl, {
      fetchImpl,
      maxBytes: family.source.size + 1,
      label: `${id} source archive`,
    });
    const inspected = inspectSourceArchiveBuffer(buffer, {
      id,
      version: family.version,
      source: family.source,
      manifest: family.manifest,
    });
    await installSourceCache({
      projectRoot,
      snapshot: state.snapshot,
      id,
      inspected,
    });
    sourcesDownloaded.push(id);
  }

  await verifyAllSourceCaches({ projectRoot, snapshot: state.snapshot });

  return {
    downloaded,
    reused,
    sourcesDownloaded,
    sourcesReused,
    cacheDirectories: Object.keys(state.snapshot.families).map((id) => {
      const family = state.snapshot.families[id];
      return familyCacheRelativePath(state.snapshot.catalogVersion, id, family.version);
    }),
    sourceCacheDirectories,
  };
}
