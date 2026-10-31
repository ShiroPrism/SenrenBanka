import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECT_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
export const FONT_PATHS = Object.freeze({
  config: 'fonts.config.json',
  lock: 'fonts.lock.json',
  snapshot: 'fonts.catalog.json',
  generated: 'src/fonts/generated.ts',
  cacheRoot: '.cache/fonts',
  sourceCacheRoot: '.cache/font-sources',
});

export function resolveProjectPath(projectRoot, relativePath) {
  return path.join(projectRoot, ...relativePath.split('/'));
}

export async function assertNoSymlinkAncestors(projectRoot, target) {
  const root = path.resolve(projectRoot);
  const relative = path.relative(root, path.resolve(target));
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`font path escapes the project root: ${target}`);
  }
  let current = root;
  for (const part of relative.split(path.sep)) {
    current = path.join(current, part);
    let stat;
    try {
      stat = await fs.lstat(current);
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    if (stat.isSymbolicLink()) throw new Error(`font path contains a symlink: ${current}`);
  }
}

export async function ensureDirectoryWithoutSymlinks(projectRoot, directory) {
  await assertNoSymlinkAncestors(projectRoot, directory);
  await fs.mkdir(directory, { recursive: true });
  await assertNoSymlinkAncestors(projectRoot, directory);
  const stat = await fs.lstat(directory);
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error(`font path must be a regular directory: ${directory}`);
  }
}

export function familyCacheRelativePath(catalogVersion, id, version) {
  return `${FONT_PATHS.cacheRoot}/${catalogVersion}/${id}@${version}`;
}

export function sourceCacheRelativePath(catalogVersion, id, version) {
  return `${FONT_PATHS.sourceCacheRoot}/${catalogVersion}/${id}@${version}`;
}

export function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
