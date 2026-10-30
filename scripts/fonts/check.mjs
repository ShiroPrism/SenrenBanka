import { verifyAllCaches } from './lib/cache.mjs';
import { loadAndValidateFontState } from './lib/repository.mjs';
import { PROJECT_ROOT } from './lib/paths.mjs';

export async function checkFonts({ projectRoot = PROJECT_ROOT } = {}) {
  const state = await loadAndValidateFontState({ projectRoot });
  let caches;
  try {
    caches = await verifyAllCaches({
      projectRoot,
      snapshot: state.snapshot,
      lock: state.lock,
    });
  } catch (error) {
    throw new Error(
      `${error.message}. Run npm run fonts:prepare to download or repair the locked cache.`,
    );
  }
  return {
    ...state.summary,
    cacheEntries: caches.length,
    cachedFiles: caches.reduce((total, cache) => total + cache.files, 0),
  };
}
