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
    value.startsWith('/') ||
    value.includes('\\') ||
    /(^|\/)\.{1,2}(\/|$)/.test(value) ||
    /[\u0000-\u001f\u007f]/.test(value)
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
