import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { inspectFamilyPackageBuffer } from './lib/archive.mjs';
import { fetchBuffer } from './lib/fetch.mjs';
import { renderGeneratedSource } from './lib/generated.mjs';
import { machinePathFindings, stableStringify, sha256 } from './lib/json.mjs';
import { acquireFileLock } from './lib/lock.mjs';
import { FONT_PATHS, PROJECT_ROOT, resolveProjectPath } from './lib/paths.mjs';
import { catalogSchema, fontsConfigSchema, parseWithSchema } from './lib/schema.mjs';

const MAX_CATALOG_BYTES = 2 * 1024 * 1024;

async function readOptionalJson(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw new Error(`cannot use the existing font lock: ${error.message}`, { cause: error });
  }
}

function sortedByPath(left, right) {
  return left.path < right.path ? -1 : left.path > right.path ? 1 : 0;
}

async function writeOutputsAtomically(projectRoot, outputs) {
  const transaction = crypto.randomUUID();
  const prepared = [];
  const installed = [];
  try {
    for (const output of outputs) {
      const destination = resolveProjectPath(projectRoot, output.relative);
      const directory = path.dirname(destination);
      await fs.mkdir(directory, { recursive: true });
      const temporary = path.join(
        directory,
        `.${path.basename(destination)}.tmp-${process.pid}-${transaction}`,
      );
      const backup = `${destination}.previous-${process.pid}-${transaction}`;
      await fs.writeFile(temporary, output.data);
      prepared.push({ destination, temporary, backup, hadExisting: false });
    }
    for (const item of prepared) {
      try {
        await fs.rename(item.destination, item.backup);
        item.hadExisting = true;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      await fs.rename(item.temporary, item.destination);
      installed.push(item);
    }
    for (const item of prepared) {
      if (item.hadExisting) await fs.rm(item.backup, { force: true });
    }
  } catch (error) {
    for (const item of installed.reverse()) {
      await fs.rm(item.destination, { force: true });
      if (item.hadExisting) await fs.rename(item.backup, item.destination).catch(() => {});
    }
    for (const item of prepared) {
      await fs.rm(item.temporary, { force: true });
      if (item.hadExisting) await fs.rename(item.backup, item.destination).catch(() => {});
    }
    throw error;
  }
}

function assertMachineFree(value, label) {
  if (machinePathFindings(value).length > 0) {
    throw new Error(
      `${label} would contain a machine-specific path or local font workspace reference`,
    );
  }
}

export async function updateFonts({
  projectRoot = PROJECT_ROOT,
  catalogUrl,
  catalogSha256,
  fetchImpl = globalThis.fetch,
  logger = () => {},
} = {}) {
  const config = parseWithSchema(
    fontsConfigSchema,
    JSON.parse(await fs.readFile(resolveProjectPath(projectRoot, FONT_PATHS.config), 'utf8')),
    FONT_PATHS.config,
  );
  const existingLock = await readOptionalJson(resolveProjectPath(projectRoot, FONT_PATHS.lock));
  const resolvedCatalogUrl = catalogUrl ?? existingLock?.catalog?.url;
  if (!resolvedCatalogUrl) {
    throw new Error(
      'fonts:update requires --catalog-url on first adoption. Use the immutable release URL, for example https://github.com/whitehair-failure/SenrenBanka-fonts/releases/download/catalog-v1.0.0/catalog.json',
    );
  }
  const expectedCatalogSha =
    catalogSha256 ??
    (existingLock?.catalog?.url === resolvedCatalogUrl ? existingLock?.catalog?.sha256 : null);
  if (!expectedCatalogSha || !/^[a-f0-9]{64}$/.test(expectedCatalogSha)) {
    throw new Error(
      'a trusted --catalog-sha256 is required when adopting a new catalog URL; it must be supplied out of band or copied from the immutable release notes',
    );
  }

  logger(`fetch ${resolvedCatalogUrl}`);
  const catalogBuffer = await fetchBuffer(resolvedCatalogUrl, {
    fetchImpl,
    maxBytes: MAX_CATALOG_BYTES,
    label: 'font catalog',
  });
  const actualCatalogSha = sha256(catalogBuffer);
  if (actualCatalogSha !== expectedCatalogSha) {
    throw new Error(
      `font catalog SHA-256 mismatch: expected ${expectedCatalogSha}, got ${actualCatalogSha}`,
    );
  }
  let rawCatalog;
  try {
    rawCatalog = JSON.parse(catalogBuffer.toString('utf8'));
  } catch (error) {
    throw new Error(`font catalog is not valid JSON: ${error.message}`, { cause: error });
  }
  const catalog = parseWithSchema(catalogSchema, rawCatalog, 'font catalog');
  if (catalog.baseUrl !== config.baseUrl) {
    throw new Error(
      `catalog baseUrl ${catalog.baseUrl} does not match fonts.config.json baseUrl ${config.baseUrl}`,
    );
  }

  const selectedIds = config.families.map((family) => family.id).sort();
  const missing = selectedIds.filter((id) => !catalog.families[id]);
  if (missing.length > 0) {
    throw new Error(`font catalog is missing selected families: ${missing.join(', ')}`);
  }
  const configById = new Map(config.families.map((family) => [family.id, family]));
  const snapshotFamilies = {};
  const lockFamilies = {};

  for (const id of selectedIds) {
    const catalogFamily = catalog.families[id];
    const selected = configById.get(id);
    const packageUrl = `${catalog.baseUrl}/${catalogFamily.package.releaseTag}/${catalogFamily.package.fileName}`;
    logger(`fetch ${id}@${catalogFamily.version} (${catalogFamily.package.size} bytes)`);
    const packageBuffer = await fetchBuffer(packageUrl, {
      fetchImpl,
      maxBytes: catalogFamily.package.size + 1,
      label: `${id} font package`,
    });
    const inspected = inspectFamilyPackageBuffer(packageBuffer, {
      id,
      version: catalogFamily.version,
      role: catalogFamily.role,
      package: catalogFamily.package,
      source: catalogFamily.source,
    });
    if (
      inspected.manifest.familyName !== selected.name ||
      inspected.manifest.cssVariable !== selected.cssVariable ||
      stableStringify(inspected.manifest.fallbacks) !== stableStringify(selected.fallbacks)
    ) {
      throw new Error(
        `${id} catalog package no longer matches the manual app-only mapping in fonts.config.json`,
      );
    }
    const catalogScripts = catalogFamily.scripts ?? ['cjk'];
    const manifestScripts = inspected.manifest.scripts ?? ['cjk'];
    if (stableStringify(catalogScripts) !== stableStringify(manifestScripts)) {
      throw new Error(`${id} catalog scripts do not match the package manifest`);
    }
    const packageVariantFiles = new Set(
      inspected.manifest.variants.map((variant) => variant.file.slice('fonts/'.length)),
    );
    for (const override of selected.variantOverrides ?? []) {
      if (!packageVariantFiles.has(override.file)) {
        throw new Error(
          `${id} variant override references an unknown package file: ${override.file}`,
        );
      }
    }
    const files = [...inspected.files].sort(sortedByPath);
    snapshotFamilies[id] = {
      version: catalogFamily.version,
      role: catalogFamily.role,
      package: catalogFamily.package,
      source: catalogFamily.source,
      manifest: inspected.manifest,
      files,
    };
    lockFamilies[id] = {
      version: catalogFamily.version,
      package: catalogFamily.package,
      source: catalogFamily.source,
      manifestSha256: inspected.manifestSha256,
      packageFilesSha256: inspected.packageFilesSha256,
    };
  }

  const snapshot = {
    schemaVersion: 1,
    catalogVersion: catalog.catalogVersion,
    catalogUrl: resolvedCatalogUrl,
    catalogSha256: actualCatalogSha,
    baseUrl: catalog.baseUrl,
    families: snapshotFamilies,
  };
  const snapshotSha256 = sha256(Buffer.from(stableStringify(snapshot)));
  const lock = {
    schemaVersion: 1,
    catalog: {
      version: catalog.catalogVersion,
      url: resolvedCatalogUrl,
      sha256: actualCatalogSha,
      snapshotSha256,
    },
    baseUrl: catalog.baseUrl,
    families: lockFamilies,
  };
  const generated = renderGeneratedSource(snapshot, config);
  assertMachineFree(snapshot, FONT_PATHS.snapshot);
  assertMachineFree(lock, FONT_PATHS.lock);
  assertMachineFree(generated, FONT_PATHS.generated);

  const updateLock = await acquireFileLock({
    projectRoot,
    relativeDirectory: '.cache/fonts/.locks',
    name: 'update',
    label: 'fonts:update',
  });
  try {
    await writeOutputsAtomically(projectRoot, [
      { relative: FONT_PATHS.snapshot, data: stableStringify(snapshot) },
      { relative: FONT_PATHS.lock, data: stableStringify(lock) },
      { relative: FONT_PATHS.generated, data: generated },
    ]);
  } finally {
    await updateLock.release();
  }

  return {
    catalogVersion: catalog.catalogVersion,
    catalogSha256: actualCatalogSha,
    families: selectedIds.length,
    variants: Object.values(snapshotFamilies).reduce(
      (total, family) => total + family.manifest.variants.length,
      0,
    ),
    files: Object.values(snapshotFamilies).reduce(
      (total, family) => total + family.files.length,
      0,
    ),
  };
}
