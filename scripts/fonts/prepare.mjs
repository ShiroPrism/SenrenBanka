import { familyCacheRelativePath, PROJECT_ROOT } from './lib/paths.mjs';
import { fetchBuffer } from './lib/fetch.mjs';
import { inspectFamilyPackageBuffer } from './lib/archive.mjs';
import { installFamilyCache, verifyAllCaches, verifyFamilyCache } from './lib/cache.mjs';
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
        throw new Error(`downloaded package file inventory differs from fonts.catalog.json for ${id}`);
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
  return {
    downloaded,
    reused,
    cacheDirectories: Object.keys(state.snapshot.families).map((id) => {
      const family = state.snapshot.families[id];
      return familyCacheRelativePath(state.snapshot.catalogVersion, id, family.version);
    }),
  };
}
