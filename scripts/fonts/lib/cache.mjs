import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { sha256, stableStringify } from './json.mjs';
import { familyManifestSchema, parseWithSchema } from './schema.mjs';
import { familyCacheRelativePath, resolveProjectPath } from './paths.mjs';

async function lstatRequired(filePath, label) {
  try {
    return await fs.lstat(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`${label} is missing: ${filePath}`);
    throw new Error(`${label} cannot be inspected: ${error.message}`);
  }
}

async function assertNoSymlinkAncestors(projectRoot, target) {
  const root = path.resolve(projectRoot);
  const relative = path.relative(root, path.resolve(target));
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`cache path escapes the project root: ${target}`);
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
    if (stat.isSymbolicLink()) throw new Error(`font cache path contains a symlink: ${current}`);
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
      const relative = relativeDirectory
        ? `${relativeDirectory}/${entry.name}`
        : entry.name;
      const fullPath = path.join(directory, entry.name);
      const stat = await fs.lstat(fullPath);
      if (stat.isSymbolicLink()) throw new Error(`font cache contains a symlink: ${relative}`);
      if (stat.isDirectory()) {
        await visit(fullPath, relative);
      } else if (stat.isFile()) {
        files.set(relative, fullPath);
      } else {
        throw new Error(`font cache contains a non-regular entry: ${relative}`);
      }
    }
  };
  await visit(root);
  return files;
}

function expectedMarker(snapshot, family, lockFamily) {
  return {
    schemaVersion: 1,
    catalogVersion: snapshot.catalogVersion,
    familyId: family.manifest.id,
    familyVersion: family.version,
    packageSha256: family.package.sha256,
    manifestSha256: lockFamily.manifestSha256,
    packageFilesSha256: lockFamily.packageFilesSha256,
  };
}

async function verifyCacheDirectory(root, snapshot, family, lockFamily) {
  await assertNoSymlinkAncestors(snapshot.projectRoot, root);
  const rootStat = await lstatRequired(root, 'font cache directory');
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw new Error(`font cache entry must be a regular directory: ${root}`);
  }
  const actualFiles = await walkCache(root);
  const expected = new Map(family.files.map((file) => [file.path, file]));
  expected.set('.complete.json', null);
  for (const filePath of actualFiles.keys()) {
    if (!expected.has(filePath)) throw new Error(`font cache contains an undeclared file: ${filePath}`);
  }
  for (const filePath of expected.keys()) {
    if (!actualFiles.has(filePath)) throw new Error(`font cache is missing ${filePath}`);
  }

  for (const file of family.files) {
    const fullPath = actualFiles.get(file.path);
    const data = await fs.readFile(fullPath);
    if (data.length !== file.size) {
      throw new Error(
        `font cache ${file.path} size mismatch: expected ${file.size}, got ${data.length}`,
      );
    }
    const actualSha256 = sha256(data);
    if (actualSha256 !== file.sha256) {
      throw new Error(
        `font cache ${file.path} SHA-256 mismatch: expected ${file.sha256}, got ${actualSha256}`,
      );
    }
  }

  const marker = JSON.parse(await fs.readFile(actualFiles.get('.complete.json'), 'utf8'));
  const expectedMarkerValue = expectedMarker(snapshot, family, lockFamily);
  if (stableStringify(marker) !== stableStringify(expectedMarkerValue)) {
    throw new Error('font cache completion marker does not match the current lock');
  }

  const manifestText = await fs.readFile(actualFiles.get('manifest.json'), 'utf8');
  const manifest = parseWithSchema(
    familyManifestSchema,
    JSON.parse(manifestText),
    `font cache ${family.manifest.id} manifest`,
  );
  if (stableStringify(manifest) !== stableStringify(family.manifest)) {
    throw new Error('font cache manifest does not match fonts.catalog.json');
  }
  return { root, files: family.files.length };
}

export async function verifyFamilyCache({ projectRoot, snapshot, lock, id }) {
  const family = snapshot.families[id];
  const lockFamily = lock.families[id];
  const relative = familyCacheRelativePath(snapshot.catalogVersion, id, family.version);
  const root = resolveProjectPath(projectRoot, relative);
  return verifyCacheDirectory(root, { ...snapshot, projectRoot }, family, lockFamily);
}

export async function verifyAllCaches({ projectRoot, snapshot, lock }) {
  const results = [];
  for (const id of Object.keys(snapshot.families).sort()) {
    results.push(await verifyFamilyCache({ projectRoot, snapshot, lock, id }));
  }
  return results;
}

async function copyVerifiedStage(temporary, destination) {
  await fs.rm(destination, { recursive: true, force: true });
  await fs.mkdir(destination, { recursive: true });
  const pending = [''];
  const marker = path.join(temporary, '.complete.json');
  while (pending.length > 0) {
    const relativeDirectory = pending.shift();
    const sourceDirectory = path.join(temporary, relativeDirectory);
    const entries = await fs.readdir(sourceDirectory, { withFileTypes: true });
    for (const entry of entries) {
      const relative = relativeDirectory
        ? `${relativeDirectory}/${entry.name}`
        : entry.name;
      if (relative === '.complete.json') continue;
      const source = path.join(temporary, relative);
      const destinationPath = path.join(destination, relative);
      if (entry.isDirectory()) {
        await fs.mkdir(destinationPath, { recursive: true });
        pending.push(relative);
      } else if (entry.isFile()) {
        await fs.mkdir(path.dirname(destinationPath), { recursive: true });
        await fs.copyFile(source, destinationPath);
      } else {
        throw new Error(`staged font cache contains a non-regular entry: ${relative}`);
      }
    }
  }
  // The marker is the cache commit point. Keep it absent until every file is copied.
  await fs.copyFile(marker, path.join(destination, '.complete.json'));
}

async function replaceDirectoryAtomically(temporary, destination) {
  const backup = `${destination}.previous-${process.pid}-${crypto.randomUUID()}`;
  let movedExisting = false;
  let installed = false;
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
      await copyVerifiedStage(temporary, destination);
    }
    if (movedExisting) await fs.rm(backup, { recursive: true, force: true });
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
    if (movedExisting && !installed) await fs.rm(backup, { recursive: true, force: true });
  }
}

export async function installFamilyCache({
  projectRoot,
  snapshot,
  lock,
  id,
  inspected,
}) {
  const family = snapshot.families[id];
  const lockFamily = lock.families[id];
  const versionRoot = resolveProjectPath(
    projectRoot,
    `.cache/fonts/${snapshot.catalogVersion}`,
  );
  await fs.mkdir(versionRoot, { recursive: true });
  await assertNoSymlinkAncestors(projectRoot, versionRoot);
  const temporary = path.join(versionRoot, `.partial-${id}-${process.pid}-${crypto.randomUUID()}`);
  await fs.rm(temporary, { recursive: true, force: true });
  await fs.mkdir(temporary, { recursive: true });
  try {
    for (const file of family.files) {
      const data = inspected.entries.get(file.path);
      if (!data) throw new Error(`verified package is missing ${file.path}`);
      const destination = path.join(temporary, ...file.path.split('/'));
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, data);
    }
    await fs.writeFile(
      path.join(temporary, '.complete.json'),
      stableStringify(expectedMarker(snapshot, family, lockFamily)),
    );
    const verification = await verifyCacheDirectory(
      temporary,
      { ...snapshot, projectRoot },
      family,
      lockFamily,
    );
    if (verification.files !== family.files.length) {
      throw new Error('temporary font cache verification returned an unexpected file count');
    }

    const destination = resolveProjectPath(
      projectRoot,
      familyCacheRelativePath(snapshot.catalogVersion, id, family.version),
    );
    await replaceDirectoryAtomically(temporary, destination);
    return destination;
  } catch (error) {
    await fs.rm(temporary, { recursive: true, force: true });
    throw error;
  }
}
