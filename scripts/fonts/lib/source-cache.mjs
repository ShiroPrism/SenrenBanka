import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { validateSourceManifest } from './archive.mjs';
import { sha256, stableStringify } from './json.mjs';
import { acquireFileLock } from './lock.mjs';
import {
  assertNoSymlinkAncestors,
  ensureDirectoryWithoutSymlinks,
  FONT_PATHS,
  resolveProjectPath,
  sourceCacheRelativePath,
} from './paths.mjs';

const MARKER_FILE = '.complete-source.json';
const MANIFEST_FILE = 'source-manifest.json';

async function lstatRequired(filePath, label) {
  try {
    return await fs.lstat(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`${label} is missing: ${filePath}`);
    throw new Error(`${label} cannot be inspected: ${error.message}`);
  }
}

async function renameWithRetry(source, destination) {
  const delays = [40, 100, 250, 600];
  for (let attempt = 0; ; attempt += 1) {
    try {
      await fs.rename(source, destination);
      return;
    } catch (error) {
      const retryable = ['EPERM', 'EACCES', 'EBUSY'].includes(error.code);
      if (!retryable || attempt >= delays.length) throw error;
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
    }
  }
}

async function walkCache(root) {
  const files = new Map();
  const visit = async (directory, relativeDirectory = '') => {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
    for (const entry of entries) {
      const relative = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
      const fullPath = path.join(directory, entry.name);
      const stat = await fs.lstat(fullPath);
      if (stat.isSymbolicLink()) {
        throw new Error(`font source cache contains a symlink: ${relative}`);
      }
      if (stat.isDirectory()) {
        await visit(fullPath, relative);
      } else if (stat.isFile()) {
        files.set(relative, fullPath);
      } else {
        throw new Error(`font source cache contains a non-regular entry: ${relative}`);
      }
    }
  };
  await visit(root);
  return files;
}

function markerIdentity(snapshot, family) {
  return {
    schemaVersion: 1,
    catalogVersion: snapshot.catalogVersion,
    familyId: family.manifest.id,
    familyVersion: family.version,
    sourceArchiveSha256: family.source.sha256,
    sourceArchiveSize: family.source.size,
  };
}

function expectedSource(family) {
  return {
    id: family.manifest.id,
    version: family.version,
    source: family.source,
    manifest: family.manifest,
  };
}

async function verifySourceCacheDirectory(root, snapshot, family) {
  await assertNoSymlinkAncestors(snapshot.projectRoot, root);
  const rootStat = await lstatRequired(root, 'font source cache directory');
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw new Error(`font source cache entry must be a regular directory: ${root}`);
  }
  const actualFiles = await walkCache(root);
  if (!actualFiles.has(MANIFEST_FILE)) {
    throw new Error(`font source cache is missing ${MANIFEST_FILE}`);
  }
  if (!actualFiles.has(MARKER_FILE)) {
    throw new Error(`font source cache is missing ${MARKER_FILE}`);
  }

  const manifestBytes = await fs.readFile(actualFiles.get(MANIFEST_FILE));
  let rawManifest;
  try {
    rawManifest = JSON.parse(manifestBytes.toString('utf8'));
  } catch (error) {
    throw new Error(`font source cache ${MANIFEST_FILE} is invalid JSON: ${error.message}`);
  }
  const validated = validateSourceManifest(rawManifest, expectedSource(family));

  const expectedPaths = new Set([
    MARKER_FILE,
    MANIFEST_FILE,
    ...validated.sourceFiles.map((file) => file.file),
    ...validated.licenseFiles.map((file) => file.file),
  ]);
  for (const filePath of actualFiles.keys()) {
    if (!expectedPaths.has(filePath)) {
      throw new Error(`font source cache contains an undeclared file: ${filePath}`);
    }
  }
  for (const filePath of expectedPaths) {
    if (!actualFiles.has(filePath)) {
      throw new Error(`font source cache is missing ${filePath}`);
    }
  }

  for (const file of [...validated.sourceFiles, ...validated.licenseFiles]) {
    const data = await fs.readFile(actualFiles.get(file.file));
    if (data.length !== file.size) {
      throw new Error(
        `font source cache ${file.file} size mismatch: expected ${file.size}, got ${data.length}`,
      );
    }
    const actualSha256 = sha256(data);
    if (actualSha256 !== file.sha256) {
      throw new Error(
        `font source cache ${file.file} SHA-256 mismatch: expected ${file.sha256}, got ${actualSha256}`,
      );
    }
  }

  const markerText = await fs.readFile(actualFiles.get(MARKER_FILE), 'utf8');
  let marker;
  try {
    marker = JSON.parse(markerText);
  } catch (error) {
    throw new Error(`font source cache ${MARKER_FILE} is invalid JSON: ${error.message}`);
  }
  const expectedMarker = {
    ...markerIdentity(snapshot, family),
    sourceManifestSha256: sha256(manifestBytes),
    sourceFilesSha256: validated.sourceFilesSha256,
    licenseFilesSha256: validated.licenseFilesSha256,
  };
  if (stableStringify(marker) !== stableStringify(expectedMarker)) {
    throw new Error(
      'font source cache completion marker does not match the current catalog and source manifest',
    );
  }
  return {
    root,
    files: expectedPaths.size - 1,
    sourceFiles: validated.sourceFiles.length,
    licenseFiles: validated.licenseFiles.length,
  };
}

export async function verifyFamilySourceCache({ projectRoot, snapshot, id }) {
  const family = snapshot.families[id];
  const root = resolveProjectPath(
    projectRoot,
    sourceCacheRelativePath(snapshot.catalogVersion, id, family.version),
  );
  return verifySourceCacheDirectory(root, { ...snapshot, projectRoot }, family);
}

export async function verifyAllSourceCaches({ projectRoot, snapshot }) {
  const results = [];
  for (const id of Object.keys(snapshot.families).sort()) {
    if (snapshot.families[id].manifest.role !== 'core-cjk') continue;
    results.push(await verifyFamilySourceCache({ projectRoot, snapshot, id }));
  }
  return results;
}

async function copyVerifiedStage(temporary, destination) {
  await fs.rm(destination, { recursive: true, force: true });
  await fs.mkdir(destination, { recursive: true });
  const pending = [''];
  while (pending.length > 0) {
    const relativeDirectory = pending.shift();
    const sourceDirectory = path.join(temporary, relativeDirectory);
    const entries = await fs.readdir(sourceDirectory, { withFileTypes: true });
    for (const entry of entries) {
      const relative = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
      if (relative === MARKER_FILE) continue;
      const source = path.join(temporary, relative);
      const destinationPath = path.join(destination, relative);
      if (entry.isDirectory()) {
        await fs.mkdir(destinationPath, { recursive: true });
        pending.push(relative);
      } else if (entry.isFile()) {
        await fs.mkdir(path.dirname(destinationPath), { recursive: true });
        await fs.copyFile(source, destinationPath);
      } else {
        throw new Error(`staged font source cache contains a non-regular entry: ${relative}`);
      }
    }
  }
  // The marker is the cache commit point. Keep it absent until every file is copied.
  await fs.copyFile(path.join(temporary, MARKER_FILE), path.join(destination, MARKER_FILE));
}

async function replaceDirectoryAtomically(temporary, destination, verifyInstalled) {
  const backup = `${destination}.previous-${process.pid}-${crypto.randomUUID()}`;
  let movedExisting = false;
  let installed = false;
  let destinationOwnedByFallback = false;
  try {
    try {
      await fs.lstat(destination);
      await renameWithRetry(destination, backup);
      movedExisting = true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    try {
      await renameWithRetry(temporary, destination);
      installed = true;
    } catch (error) {
      if (!['EPERM', 'EACCES', 'EBUSY', 'EXDEV'].includes(error.code)) {
        if (movedExisting) await renameWithRetry(backup, destination);
        throw error;
      }
      // Workspace file watchers can hold Windows directory handles even after
      // every file is closed. Fall back to a marker-last copy of the verified stage.
      destinationOwnedByFallback = true;
      await copyVerifiedStage(temporary, destination);
      await verifyInstalled(destination);
    }
    installed = true;
    if (movedExisting) await fs.rm(backup, { recursive: true, force: true });
  } catch (error) {
    if (installed) throw error;
    const rollbackErrors = [];
    if (!installed && destinationOwnedByFallback) {
      await fs.rm(destination, { recursive: true, force: true }).catch((rollbackError) => {
        rollbackErrors.push(rollbackError);
      });
    }
    if (movedExisting) {
      await renameWithRetry(backup, destination).catch((rollbackError) => {
        rollbackErrors.push(rollbackError);
      });
    }
    if (rollbackErrors.length > 0) {
      throw new AggregateError(
        [error, ...rollbackErrors],
        `font source cache install failed and the previous cache could not be restored: ${destination}`,
      );
    }
    throw error;
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
}

export async function installSourceCache({ projectRoot, snapshot, id, inspected }) {
  const family = snapshot.families[id];
  const installLock = await acquireFileLock({
    projectRoot,
    relativeDirectory: `${FONT_PATHS.sourceCacheRoot}/${snapshot.catalogVersion}/.locks`,
    name: id,
    label: `font source install (${id})`,
  });
  try {
    try {
      const existing = await verifyFamilySourceCache({ projectRoot, snapshot, id });
      return existing.root;
    } catch {
      // Re-check under the install lock so concurrent prepares cannot replace
      // the cache between verification and the marker-last install below.
    }

    const versionRoot = resolveProjectPath(
      projectRoot,
      `${FONT_PATHS.sourceCacheRoot}/${snapshot.catalogVersion}`,
    );
    await ensureDirectoryWithoutSymlinks(projectRoot, versionRoot);
    const temporary = path.join(
      versionRoot,
      `.partial-${id}-${process.pid}-${crypto.randomUUID()}`,
    );
    await fs.rm(temporary, { recursive: true, force: true });
    await fs.mkdir(temporary, { recursive: true });
    try {
      for (const file of inspected.files) {
        const data = inspected.entries.get(file.path);
        if (!data) throw new Error(`verified source archive is missing ${file.path}`);
        const destination = path.join(temporary, ...file.path.split('/'));
        await fs.mkdir(path.dirname(destination), { recursive: true });
        await fs.writeFile(destination, data);
      }
      await fs.writeFile(
        path.join(temporary, MARKER_FILE),
        stableStringify({
          ...markerIdentity(snapshot, family),
          sourceManifestSha256: inspected.sourceManifestSha256,
          sourceFilesSha256: inspected.sourceFilesSha256,
          licenseFilesSha256: inspected.licenseFilesSha256,
        }),
      );
      const verification = await verifySourceCacheDirectory(
        temporary,
        { ...snapshot, projectRoot },
        family,
      );
      if (verification.files !== inspected.files.length) {
        throw new Error('temporary font source cache verification returned an unexpected file count');
      }

      const destination = resolveProjectPath(
        projectRoot,
        sourceCacheRelativePath(snapshot.catalogVersion, id, family.version),
      );
      await replaceDirectoryAtomically(temporary, destination, async (installedDirectory) => {
        await verifySourceCacheDirectory(
          installedDirectory,
          { ...snapshot, projectRoot },
          family,
        );
      });
      return destination;
    } catch (error) {
      await fs.rm(temporary, { recursive: true, force: true });
      throw error;
    }
  } finally {
    await installLock.release();
  }
}
