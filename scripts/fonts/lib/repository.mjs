import fs from 'node:fs/promises';
import {
  catalogSnapshotSchema,
  fontsConfigSchema,
  fontLockSchema,
  parseWithSchema,
} from './schema.mjs';
import { machinePathFindings, readJson, stableStringify, sha256 } from './json.mjs';
import { renderGeneratedSource } from './generated.mjs';
import { FONT_PATHS, PROJECT_ROOT, resolveProjectPath } from './paths.mjs';

function sortedIds(value) {
  return Object.keys(value).sort();
}

function exactJsonEqual(left, right) {
  return stableStringify(left) === stableStringify(right);
}

function assertMachineFree(value, label) {
  const findings = machinePathFindings(value);
  if (findings.length > 0) {
    throw new Error(`${label} contains a machine-specific path or local font workspace reference`);
  }
}

export async function loadFontState({ projectRoot = PROJECT_ROOT } = {}) {
  const [rawConfig, rawSnapshot, rawLock, generated] = await Promise.all([
    readJson(resolveProjectPath(projectRoot, FONT_PATHS.config), FONT_PATHS.config),
    readJson(resolveProjectPath(projectRoot, FONT_PATHS.snapshot), FONT_PATHS.snapshot),
    readJson(resolveProjectPath(projectRoot, FONT_PATHS.lock), FONT_PATHS.lock),
    fs.readFile(resolveProjectPath(projectRoot, FONT_PATHS.generated), 'utf8').catch((error) => {
      throw new Error(`${FONT_PATHS.generated} cannot be read: ${error.message}`);
    }),
  ]);
  const config = parseWithSchema(fontsConfigSchema, rawConfig, FONT_PATHS.config);
  const snapshot = parseWithSchema(catalogSnapshotSchema, rawSnapshot, FONT_PATHS.snapshot);
  const lock = parseWithSchema(fontLockSchema, rawLock, FONT_PATHS.lock);
  return { projectRoot, config, snapshot, lock, generated };
}

export function validateFontState(state) {
  const { config, snapshot, lock, generated } = state;
  assertMachineFree(config, FONT_PATHS.config);
  assertMachineFree(snapshot, FONT_PATHS.snapshot);
  assertMachineFree(lock, FONT_PATHS.lock);
  assertMachineFree(generated, FONT_PATHS.generated);

  if (snapshot.catalogVersion !== lock.catalog.version) {
    throw new Error('fonts.catalog.json catalogVersion does not match fonts.lock.json');
  }
  if (
    snapshot.catalogUrl !== lock.catalog.url ||
    snapshot.catalogSha256 !== lock.catalog.sha256
  ) {
    throw new Error('catalog URL or SHA-256 differs between fonts.catalog.json and fonts.lock.json');
  }
  if (
    config.baseUrl !== snapshot.baseUrl ||
    snapshot.baseUrl !== lock.baseUrl
  ) {
    throw new Error('baseUrl differs between fonts.config.json, catalog snapshot, and lock');
  }
  const snapshotSha256 = sha256(Buffer.from(stableStringify(snapshot)));
  if (snapshotSha256 !== lock.catalog.snapshotSha256) {
    throw new Error(
      `fonts.catalog.json SHA-256 does not match the lock: expected ${lock.catalog.snapshotSha256}, got ${snapshotSha256}`,
    );
  }

  const configById = new Map(config.families.map((family) => [family.id, family]));
  const snapshotIds = sortedIds(snapshot.families);
  const lockIds = sortedIds(lock.families);
  const configuredIds = [...configById.keys()].sort();
  if (
    snapshotIds.join('\0') !== configuredIds.join('\0') ||
    lockIds.join('\0') !== configuredIds.join('\0')
  ) {
    throw new Error(
      `selected family set differs: fonts.config.json=[${configuredIds}], fonts.catalog.json=[${snapshotIds}], fonts.lock.json=[${lockIds}]`,
    );
  }

  for (const id of configuredIds) {
    const selected = configById.get(id);
    const family = snapshot.families[id];
    const lockFamily = lock.families[id];
    if (family.manifest.id !== id || lockFamily.version !== family.version) {
      throw new Error(`family identity/version mismatch for ${id}`);
    }
    if (
      family.manifest.version !== family.version ||
      family.manifest.role !== family.role
    ) {
      throw new Error(`catalog metadata is internally inconsistent for ${id}`);
    }
    if (
      selected.name !== family.manifest.familyName ||
      selected.cssVariable !== family.manifest.cssVariable ||
      !exactJsonEqual(selected.fallbacks, family.manifest.fallbacks)
    ) {
      throw new Error(`fonts.config.json no longer matches the locked catalog metadata for ${id}`);
    }
    if (
      !exactJsonEqual(family.package, lockFamily.package) ||
      !exactJsonEqual(family.source, lockFamily.source)
    ) {
      throw new Error(`release pointers differ between catalog snapshot and lock for ${id}`);
    }
    const manifestSha256 = sha256(Buffer.from(stableStringify(family.manifest)));
    if (manifestSha256 !== lockFamily.manifestSha256) {
      throw new Error(`manifest SHA-256 differs from the lock for ${id}`);
    }
    const packageFilesSha256 = sha256(Buffer.from(stableStringify(family.files)));
    if (packageFilesSha256 !== lockFamily.packageFilesSha256) {
      throw new Error(`package file digest differs from the lock for ${id}`);
    }
    const packageFilePaths = new Set(family.files.map((file) => file.path));
    const expectedPackagePaths = new Set([
      'manifest.json',
      family.manifest.css,
      ...family.manifest.variants.map((variant) => variant.file),
      ...family.manifest.license.files.map((file) => file.file),
    ]);
    if (
      packageFilePaths.size !== expectedPackagePaths.size ||
      [...expectedPackagePaths].some((filePath) => !packageFilePaths.has(filePath))
    ) {
      throw new Error(`catalog snapshot file list is incomplete for ${id}`);
    }
  }

  const expectedGenerated = renderGeneratedSource(snapshot, config);
  if (generated !== expectedGenerated) {
    throw new Error(
      `${FONT_PATHS.generated} is stale or hand-edited; run npm run fonts:update with the pinned catalog URL`,
    );
  }
  return {
    familyCount: configuredIds.length,
    variantCount: configuredIds.reduce(
      (total, id) => total + snapshot.families[id].manifest.variants.length,
      0,
    ),
    coreCjkFamilies: configuredIds.filter(
      (id) => snapshot.families[id].manifest.role === 'core-cjk',
    ),
    snapshotSha256,
  };
}

export async function loadAndValidateFontState({ projectRoot = PROJECT_ROOT } = {}) {
  const state = await loadFontState({ projectRoot });
  const summary = validateFontState(state);
  return { ...state, summary };
}
