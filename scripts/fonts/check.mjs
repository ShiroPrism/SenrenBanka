import { verifyAllCaches } from './lib/cache.mjs';
import { verifyAllSourceCaches } from './lib/source-cache.mjs';
import { loadAndValidateFontState } from './lib/repository.mjs';
import { PROJECT_ROOT } from './lib/paths.mjs';

export async function checkFonts({ projectRoot = PROJECT_ROOT } = {}) {
  const state = await loadAndValidateFontState({ projectRoot });
  let caches;
  let sourceCaches;
  try {
    caches = await verifyAllCaches({
      projectRoot,
      snapshot: state.snapshot,
      lock: state.lock,
    });
    sourceCaches = await verifyAllSourceCaches({
      projectRoot,
      snapshot: state.snapshot,
    });
  } catch (error) {
    throw new Error(
      `${error.message}. Run npm run fonts:prepare to download or repair the locked cache.`,
      { cause: error },
    );
  }
  return {
    ...state.summary,
    cacheEntries: caches.length,
    cachedFiles: caches.reduce((total, cache) => total + cache.files, 0),
    sourceCacheEntries: sourceCaches.length,
    sourceCachedFiles: sourceCaches.reduce((total, cache) => total + cache.files, 0),
    sourceFonts: sourceCaches.reduce((total, cache) => total + cache.sourceFiles, 0),
    sourceLicenses: sourceCaches.reduce((total, cache) => total + cache.licenseFiles, 0),
  };
}
