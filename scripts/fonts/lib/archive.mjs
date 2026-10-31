import zlib from 'node:zlib';
import { stableStringify, sha256 } from './json.mjs';
import { parseWithSchema, familyManifestSchema } from './schema.mjs';

const BLOCK_SIZE = 512;
const LIMITS = Object.freeze({
  maxArchiveBytes: 64 * 1024 * 1024,
  maxExpandedBytes: 256 * 1024 * 1024,
  maxEntries: 4096,
});

function parseOctal(buffer, label) {
  const value = buffer.toString('ascii').replace(/\0.*$/, '').trim();
  if (!value) return 0;
  if (!/^[0-7]+$/.test(value)) throw new Error(`package tar has an invalid ${label}`);
  return Number.parseInt(value, 8);
}

function safeArchivePath(value) {
  if (
    !value ||
    value.length > 240 ||
    value.startsWith('/') ||
    value.includes('\\') ||
    value.includes(':') ||
    /(^|\/)\.{1,2}(\/|$)/.test(value) ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    throw new Error(`package archive contains an unsafe path: ${JSON.stringify(value)}`);
  }
  if (
    value
      .split('/')
      .some(
        (part) =>
          part.length === 0 ||
          part.endsWith('.') ||
          part.endsWith(' '),
      )
  ) {
    throw new Error(`package archive contains an unsafe path: ${JSON.stringify(value)}`);
  }
  return value;
}

function readTarGz(input, label = 'font package') {
  if (!Buffer.isBuffer(input) || input.length === 0) {
    throw new Error(`${label} is empty`);
  }
  if (input.length > LIMITS.maxArchiveBytes) {
    throw new Error(`${label} exceeds ${LIMITS.maxArchiveBytes} bytes`);
  }
  if (
    input.length < 10 ||
    input[0] !== 0x1f ||
    input[1] !== 0x8b ||
    input[2] !== 8 ||
    input[3] !== 0 ||
    input.readUInt32LE(4) !== 0 ||
    input[8] !== 2 ||
    input[9] !== 255
  ) {
    throw new Error(`${label} must be a deterministic gzip-compressed USTAR archive`);
  }

  let tar;
  try {
    tar = zlib.gunzipSync(input, { maxOutputLength: LIMITS.maxExpandedBytes });
  } catch (error) {
    throw new Error(`${label} could not be decompressed: ${error.message}`);
  }
  if (tar.length % BLOCK_SIZE !== 0) {
    throw new Error(`${label} has an invalid tar length`);
  }

  const entries = new Map();
  const portable = new Map();
  let offset = 0;
  let expanded = 0;
  let previousPath = '';
  let ended = false;
  while (offset + BLOCK_SIZE <= tar.length) {
    const header = tar.subarray(offset, offset + BLOCK_SIZE);
    offset += BLOCK_SIZE;
    if (header.every((byte) => byte === 0)) {
      if (
        offset + BLOCK_SIZE > tar.length ||
        !tar.subarray(offset, offset + BLOCK_SIZE).every((byte) => byte === 0) ||
        offset + BLOCK_SIZE !== tar.length
      ) {
        throw new Error(`${label} has an invalid tar terminator`);
      }
      ended = true;
      break;
    }

    const storedChecksum = parseOctal(header.subarray(148, 156), 'checksum');
    const checksumHeader = Buffer.from(header);
    checksumHeader.fill(0x20, 148, 156);
    let actualChecksum = 0;
    for (const byte of checksumHeader) actualChecksum += byte;
    if (storedChecksum !== actualChecksum) throw new Error(`${label} has a bad tar checksum`);

    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    const prefix = header.subarray(345, 500).toString('utf8').replace(/\0.*$/, '');
    const entryPath = safeArchivePath(prefix ? `${prefix}/${name}` : name);
    if (header.subarray(257, 263).toString('ascii') !== 'ustar\0') {
      throw new Error(`${label} contains a non-USTAR entry: ${entryPath}`);
    }
    const type = String.fromCharCode(header[156] || 0x30);
    if (type !== '0') {
      const kind = type === '1' ? 'hardlink' : type === '2' ? 'symlink' : 'non-regular entry';
      throw new Error(`${label} contains a ${kind}: ${entryPath}`);
    }
    if (header.subarray(157, 257).some((byte) => byte !== 0)) {
      throw new Error(`${label} contains a link target: ${entryPath}`);
    }
    const mode = parseOctal(header.subarray(100, 108), 'mode');
    const uid = parseOctal(header.subarray(108, 116), 'uid');
    const gid = parseOctal(header.subarray(116, 124), 'gid');
    const size = parseOctal(header.subarray(124, 136), 'size');
    const mtime = parseOctal(header.subarray(136, 148), 'mtime');
    if (mode !== 0o644 || uid !== 0 || gid !== 0 || mtime !== 0) {
      throw new Error(`${label} entry metadata is not normalized: ${entryPath}`);
    }
    if (entries.has(entryPath)) throw new Error(`${label} contains a duplicate entry: ${entryPath}`);
    if (previousPath && entryPath < previousPath) {
      throw new Error(`${label} entries are not sorted: ${entryPath}`);
    }
    const portablePath = entryPath.normalize('NFC').toLowerCase();
    if (portable.has(portablePath)) {
      throw new Error(
        `${label} contains a case-insensitive path collision: ${portable.get(portablePath)}, ${entryPath}`,
      );
    }
    portable.set(portablePath, entryPath);
    previousPath = entryPath;
    if (offset + size > tar.length) throw new Error(`${label} entry is truncated: ${entryPath}`);
    const nextOffset = offset + Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE;
    if (nextOffset > tar.length) throw new Error(`${label} entry is truncated: ${entryPath}`);
    if (tar.subarray(offset + size, nextOffset).some((byte) => byte !== 0)) {
      throw new Error(`${label} contains nonzero padding: ${entryPath}`);
    }
    expanded += size;
    if (expanded > LIMITS.maxExpandedBytes) throw new Error(`${label} expands beyond the size limit`);
    entries.set(entryPath, Buffer.from(tar.subarray(offset, offset + size)));
    if (entries.size > LIMITS.maxEntries) throw new Error(`${label} has too many entries`);
    offset = nextOffset;
  }
  if (!ended) throw new Error(`${label} is missing its tar terminator`);
  return entries;
}

export function inspectFamilyPackageBuffer(buffer, expected) {
  const label = `${expected.id}@${expected.version} font package`;
  if (buffer.length !== expected.package.size) {
    throw new Error(
      `${label} size mismatch: expected ${expected.package.size}, got ${buffer.length}`,
    );
  }
  const actualSha256 = sha256(buffer);
  if (actualSha256 !== expected.package.sha256) {
    throw new Error(
      `${label} SHA-256 mismatch: expected ${expected.package.sha256}, got ${actualSha256}`,
    );
  }

  const entries = readTarGz(buffer, label);
  const manifestBytes = entries.get('manifest.json');
  if (!manifestBytes) throw new Error(`${label} is missing manifest.json`);
  let rawManifest;
  try {
    rawManifest = JSON.parse(manifestBytes.toString('utf8'));
  } catch (error) {
    throw new Error(`${label} manifest.json is invalid JSON: ${error.message}`);
  }
  const manifest = parseWithSchema(familyManifestSchema, rawManifest, `${label} manifest.json`);
  if (manifest.id !== expected.id || manifest.version !== expected.version) {
    throw new Error(
      `${label} manifest identity mismatch: expected ${expected.id}@${expected.version}, got ${manifest.id}@${manifest.version}`,
    );
  }
  if (manifest.role !== expected.role) {
    throw new Error(`${label} role mismatch: expected ${expected.role}, got ${manifest.role}`);
  }
  if (manifest.license.approvedForRedistribution !== true) {
    throw new Error(`${label} has not been approved for redistribution`);
  }

  const expectedPaths = new Set([
    'manifest.json',
    manifest.css,
    ...manifest.variants.map((variant) => variant.file),
    ...manifest.license.files.map((file) => file.file),
  ]);
  for (const entryPath of entries.keys()) {
    if (!expectedPaths.has(entryPath)) {
      throw new Error(`${label} contains an undeclared file: ${entryPath}`);
    }
  }
  for (const entryPath of expectedPaths) {
    if (!entries.has(entryPath)) throw new Error(`${label} is missing declared file: ${entryPath}`);
  }

  const verifyFile = (entryPath, fileSha256, fileSize) => {
    const data = entries.get(entryPath);
    if (data.length !== fileSize) {
      throw new Error(`${label} ${entryPath} size mismatch: expected ${fileSize}, got ${data.length}`);
    }
    const actual = sha256(data);
    if (actual !== fileSha256) {
      throw new Error(
        `${label} ${entryPath} SHA-256 mismatch: expected ${fileSha256}, got ${actual}`,
      );
    }
  };

  for (const variant of manifest.variants) {
    verifyFile(variant.file, variant.sha256, variant.size);
    if (entries.get(variant.file).subarray(0, 4).toString('ascii') !== 'wOF2') {
      throw new Error(`${label} ${variant.file} is not a WOFF2 font`);
    }
  }
  for (const licenseFile of manifest.license.files) {
    verifyFile(licenseFile.file, licenseFile.sha256, licenseFile.size);
  }
  if (entries.get(manifest.css).length === 0) {
    throw new Error(`${label} ${manifest.css} is empty`);
  }
  if (manifest.source.archiveFileName !== expected.source.fileName) {
    throw new Error(
      `${label} source archive mismatch: expected ${expected.source.fileName}, got ${manifest.source.archiveFileName}`,
    );
  }

  const files = [...entries.entries()]
    .map(([entryPath, data]) => ({
      path: entryPath,
      sha256: sha256(data),
      size: data.length,
    }))
    .sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0));
  return {
    manifest,
    entries,
    manifestSha256: sha256(Buffer.from(stableStringify(manifest))),
    packageFilesSha256: sha256(Buffer.from(stableStringify(files))),
    files,
  };
}

const SOURCE_SHA256_PATTERN = /^[a-f0-9]{64}$/;

function sourceManifestFailure(label, message) {
  throw new Error(`${label} source-manifest.json ${message}`);
}

function sourceManifestFileEntry(entry, index, prefix, label, listName) {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    sourceManifestFailure(label, `${listName}[${index}] must be an object`);
  }
  if (typeof entry.file !== 'string' || !entry.file.startsWith(prefix)) {
    sourceManifestFailure(label, `${listName}[${index}].file must start with ${prefix}`);
  }
  const name = entry.file.slice(prefix.length);
  if (
    name.length === 0 ||
    name.includes('/') ||
    name.includes('\\') ||
    name.includes(':') ||
    name.endsWith('.') ||
    name.endsWith(' ') ||
    /[\u0000-\u001f\u007f]/.test(name)
  ) {
    sourceManifestFailure(
      label,
      `${listName}[${index}].file is not a safe file name: ${JSON.stringify(entry.file)}`,
    );
  }
  if (typeof entry.sha256 !== 'string' || !SOURCE_SHA256_PATTERN.test(entry.sha256)) {
    sourceManifestFailure(label, `${listName}[${index}].sha256 is not a lowercase SHA-256 digest`);
  }
  if (!Number.isSafeInteger(entry.size) || entry.size <= 0) {
    sourceManifestFailure(label, `${listName}[${index}].size must be a positive integer`);
  }
  return { name, file: entry.file, sha256: entry.sha256, size: entry.size };
}

function catalogLicenseName(value) {
  if (typeof value !== 'string' || !value.startsWith('licenses/')) {
    throw new Error(`catalog license file path must start with licenses/: ${JSON.stringify(value)}`);
  }
  return value.slice('licenses/'.length);
}

function normalizeSourceManifestList(list) {
  // Digest only the declared path/hash/size triple; `name` is derived locally.
  return list.map((file) => ({ file: file.file, sha256: file.sha256, size: file.size }));
}

export function validateSourceManifest(rawManifest, expected) {
  const label = `${expected.id}@${expected.version} source archive`;
  if (rawManifest === null || typeof rawManifest !== 'object' || Array.isArray(rawManifest)) {
    sourceManifestFailure(label, 'must be a JSON object');
  }
  if (rawManifest.schemaVersion !== 1) {
    sourceManifestFailure(label, 'schemaVersion must be 1');
  }
  if (rawManifest.kind !== 'source') {
    sourceManifestFailure(label, 'kind must be source');
  }
  if (rawManifest.id !== expected.id) {
    sourceManifestFailure(
      label,
      `id mismatch: expected ${expected.id}, got ${String(rawManifest.id)}`,
    );
  }
  if (rawManifest.version !== expected.version) {
    sourceManifestFailure(
      label,
      `version mismatch: expected ${expected.version}, got ${String(rawManifest.version)}`,
    );
  }
  if (!Array.isArray(rawManifest.files) || rawManifest.files.length === 0) {
    sourceManifestFailure(label, 'files must be a non-empty array');
  }
  if (!Array.isArray(rawManifest.licenses) || rawManifest.licenses.length === 0) {
    sourceManifestFailure(label, 'licenses must be a non-empty array');
  }

  const sourceFiles = rawManifest.files.map((entry, index) =>
    sourceManifestFileEntry(entry, index, 'source/fonts/', label, 'files'),
  );
  const licenseFiles = rawManifest.licenses.map((entry, index) =>
    sourceManifestFileEntry(entry, index, 'source/licenses/', label, 'licenses'),
  );
  if (sourceFiles.length !== 1) {
    throw new Error(
      `${label} source-manifest.json declares ${sourceFiles.length} source font files; only one source font per family is supported until variant mapping is implemented`,
    );
  }

  const sourceByName = new Map();
  for (const file of sourceFiles) {
    if (sourceByName.has(file.name)) {
      sourceManifestFailure(label, `lists source font ${file.name} more than once`);
    }
    sourceByName.set(file.name, file);
  }
  const licenseByName = new Map();
  for (const file of licenseFiles) {
    if (licenseByName.has(file.name)) {
      sourceManifestFailure(label, `lists license ${file.name} more than once`);
    }
    licenseByName.set(file.name, file);
  }

  const catalogSourceFiles = new Map(
    expected.manifest.source.files.map((file) => [file.fileName, file]),
  );
  if (
    catalogSourceFiles.size !== sourceByName.size ||
    [...sourceByName.keys()].some((name) => !catalogSourceFiles.has(name))
  ) {
    throw new Error(`${label} source font files do not match the catalog manifest`);
  }
  for (const [name, file] of sourceByName) {
    const catalogFile = catalogSourceFiles.get(name);
    if (catalogFile.sha256 !== file.sha256 || catalogFile.size !== file.size) {
      throw new Error(
        `${label} source font ${name} digest does not match the catalog manifest`,
      );
    }
  }

  const catalogLicenses = new Map(
    expected.manifest.license.files.map((file) => [catalogLicenseName(file.file), file]),
  );
  if (
    catalogLicenses.size !== licenseByName.size ||
    [...licenseByName.keys()].some((name) => !catalogLicenses.has(name))
  ) {
    throw new Error(`${label} license files do not match the catalog manifest`);
  }
  for (const [name, file] of licenseByName) {
    const catalogFile = catalogLicenses.get(name);
    if (catalogFile.sha256 !== file.sha256 || catalogFile.size !== file.size) {
      throw new Error(`${label} license ${name} digest does not match the catalog manifest`);
    }
  }

  if (expected.manifest.source.archiveFileName !== expected.source.fileName) {
    throw new Error(
      `${label} catalog source archive name mismatch: expected ${expected.source.fileName}, got ${expected.manifest.source.archiveFileName}`,
    );
  }

  return {
    sourceManifest: rawManifest,
    sourceFiles,
    licenseFiles,
    sourceFilesSha256: sha256(Buffer.from(stableStringify(normalizeSourceManifestList(sourceFiles)))),
    licenseFilesSha256: sha256(Buffer.from(stableStringify(normalizeSourceManifestList(licenseFiles)))),
  };
}

export function inspectSourceArchiveBuffer(buffer, expected) {
  const label = `${expected.id}@${expected.version} source archive`;
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error(`${label} is empty`);
  }
  if (buffer.length !== expected.source.size) {
    throw new Error(
      `${label} size mismatch: expected ${expected.source.size}, got ${buffer.length}`,
    );
  }
  const actualSha256 = sha256(buffer);
  if (actualSha256 !== expected.source.sha256) {
    throw new Error(
      `${label} SHA-256 mismatch: expected ${expected.source.sha256}, got ${actualSha256}`,
    );
  }

  const entries = readTarGz(buffer, label);
  const manifestBytes = entries.get('source-manifest.json');
  if (!manifestBytes) throw new Error(`${label} is missing source-manifest.json`);
  let rawManifest;
  try {
    rawManifest = JSON.parse(manifestBytes.toString('utf8'));
  } catch (error) {
    throw new Error(`${label} source-manifest.json is invalid JSON: ${error.message}`);
  }
  const validated = validateSourceManifest(rawManifest, expected);

  const declaredPaths = new Set([
    'source-manifest.json',
    ...validated.sourceFiles.map((file) => file.file),
    ...validated.licenseFiles.map((file) => file.file),
  ]);
  for (const entryPath of entries.keys()) {
    if (!declaredPaths.has(entryPath)) {
      throw new Error(`${label} contains an undeclared file: ${entryPath}`);
    }
  }
  for (const entryPath of declaredPaths) {
    if (!entries.has(entryPath)) {
      throw new Error(`${label} is missing declared file: ${entryPath}`);
    }
  }

  const verifyFile = (file) => {
    const data = entries.get(file.file);
    if (data.length !== file.size) {
      throw new Error(
        `${label} ${file.file} size mismatch: expected ${file.size}, got ${data.length}`,
      );
    }
    const actual = sha256(data);
    if (actual !== file.sha256) {
      throw new Error(
        `${label} ${file.file} SHA-256 mismatch: expected ${file.sha256}, got ${actual}`,
      );
    }
  };
  for (const file of validated.sourceFiles) verifyFile(file);
  for (const file of validated.licenseFiles) verifyFile(file);

  return {
    ...validated,
    sourceManifestSha256: sha256(manifestBytes),
    entries,
    files: [...entries.entries()]
      .map(([entryPath, data]) => ({
        path: entryPath,
        sha256: sha256(data),
        size: data.length,
      }))
      .sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0)),
  };
}
