import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ensureDirectoryWithoutSymlinks, resolveProjectPath } from './paths.mjs';

const DEFAULT_RETRY_MS = 100;
const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_STALE_MS = 10 * 60_000;

export async function acquireFileLock({
  projectRoot,
  relativeDirectory,
  name,
  label = name,
  retryMs = DEFAULT_RETRY_MS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  staleMs = DEFAULT_STALE_MS,
}) {
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name)) {
    throw new Error(`invalid font lock name: ${name}`);
  }
  const lockDirectory = resolveProjectPath(projectRoot, relativeDirectory);
  await ensureDirectoryWithoutSymlinks(projectRoot, lockDirectory);
  const lockPath = path.join(lockDirectory, `${name}.lock`);
  const startedAt = Date.now();

  while (true) {
    const token = crypto.randomUUID();
    let handle;
    try {
      handle = await fs.open(lockPath, 'wx');
      try {
        await handle.writeFile(`${token}\n`, 'utf8');
      } catch (error) {
        await handle.close().catch(() => {});
        await fs.rm(lockPath, { force: true }).catch(() => {});
        throw error;
      }
      return {
        async release() {
          await handle.close().catch(() => {});
          try {
            const current = await fs.readFile(lockPath, 'utf8');
            if (current.trim() === token) await fs.rm(lockPath, { force: true });
          } catch (error) {
            if (error.code !== 'ENOENT') throw error;
          }
        },
      };
    } catch (error) {
      if (handle) await handle.close().catch(() => {});
      if (error.code !== 'EEXIST') throw error;
    }

    let stat;
    try {
      stat = await fs.lstat(lockPath);
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    if (stat.isSymbolicLink() || !stat.isFile()) {
      throw new Error(`font lock must be a regular file: ${lockPath}`);
    }
    if (Date.now() - stat.mtimeMs >= staleMs) {
      const stalePath = `${lockPath}.stale-${process.pid}-${crypto.randomUUID()}`;
      try {
        await fs.rename(lockPath, stalePath);
        await fs.rm(stalePath, { force: true });
        continue;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        continue;
      }
    }
    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(
        `timed out waiting for the ${label} lock; another font command may still be running (${lockPath})`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, retryMs));
  }
}
