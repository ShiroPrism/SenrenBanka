import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECT_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
export const FONT_PATHS = Object.freeze({
  config: 'fonts.config.json',
  lock: 'fonts.lock.json',
  snapshot: 'fonts.catalog.json',
  generated: 'src/fonts/generated.ts',
  cacheRoot: '.cache/fonts',
});

export function resolveProjectPath(projectRoot, relativePath) {
  return path.join(projectRoot, ...relativePath.split('/'));
}

export function familyCacheRelativePath(catalogVersion, id, version) {
  return `${FONT_PATHS.cacheRoot}/${catalogVersion}/${id}@${version}`;
}

export function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
