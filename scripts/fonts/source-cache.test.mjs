import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import zlib from 'node:zlib';
import { inspectSourceArchiveBuffer } from './lib/archive.mjs';
import { checkFonts } from './check.mjs';
import { sha256, stableStringify } from './lib/json.mjs';
import { sourceCacheRelativePath } from './lib/paths.mjs';
import { prepareFonts } from './prepare.mjs';
import { loadFontState } from './lib/repository.mjs';
import { verifyAllSourceCaches } from './lib/source-cache.mjs';
import { updateFonts } from './update.mjs';

const FIXTURE_VERSION = '1.0.0';

function writeOctal(buffer, offset, width, value) {
  const text = value.toString(8).padStart(width - 1, '0');
  if (text.length !== width - 1) throw new Error('fixture tar numeric overflow');
  buffer.write(`${text}\0`, offset, width, 'ascii');
}

function tarHeader(entry) {
  const header = Buffer.alloc(512);
  header.write(entry.path, 0, 100, 'utf8');
  writeOctal(header, 100, 8, 0o644);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, entry.data?.length ?? 0);
  writeOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  header.write(entry.type ?? '0', 156, 1, 'ascii');
  if (entry.linkName) header.write(entry.linkName, 157, 100, 'utf8');
  header.write('ustar\0', 257, 6, 'ascii');
  header.write('00', 263, 2, 'ascii');
  let checksum = 0;
  for (const byte of header) checksum += byte;
  header.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148, 8, 'ascii');
  return header;
}

function createTarGz(entries) {
  const sorted = [...entries].sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
  const chunks = [];
  for (const entry of sorted) {
    const data = entry.data ?? Buffer.alloc(0);
    chunks.push(tarHeader({ ...entry, data }), data);
    const remainder = data.length % 512;
    if (remainder) chunks.push(Buffer.alloc(512 - remainder));
  }
  chunks.push(Buffer.alloc(1024));
  const gzip = zlib.gzipSync(Buffer.concat(chunks), { level: 9 });
  gzip.writeUInt32LE(0, 4);
  gzip[8] = 2;
  gzip[9] = 255;
  return gzip;
}

function fakeSourceFont(label) {
  return Buffer.concat([
    Buffer.from('OTTO', 'ascii'),
    crypto.createHash('sha256').update(`source-font:${label}`).digest(),
    Buffer.alloc(64, 0),
  ]);
}

function makeSourceArchive({
  id,
  version = FIXTURE_VERSION,
  sourceFiles = [{ name: `${id}-source.otf`, data: fakeSourceFont(id) }],
  licenseFiles = [{ name: 'LICENSE.txt', data: Buffer.from(`Fixture source license for ${id}\n`) }],
  extraEntries = [],
  omitPaths = [],
  mutateManifest,
} = {}) {
  const sourceManifest = {
    schemaVersion: 1,
    kind: 'source',
    id,
    version,
    files: sourceFiles.map((file) => ({
      file: `source/fonts/${file.name}`,
      sha256: sha256(file.data),
      size: file.data.length,
    })),
    licenses: licenseFiles.map((file) => ({
      file: `source/licenses/${file.name}`,
      sha256: sha256(file.data),
      size: file.data.length,
    })),
    upstream: {
      project: `${id} fixture`,
      retrievedAt: '2026-10-30',
      revision: 'fixture',
      url: 'https://example.com/fixture',
      version: '1',
    },
  };
  mutateManifest?.(sourceManifest);
  const entries = [
    { path: 'source-manifest.json', data: Buffer.from(stableStringify(sourceManifest)) },
    ...sourceFiles.map((file) => ({ path: `source/fonts/${file.name}`, data: file.data })),
    ...licenseFiles.map((file) => ({ path: `source/licenses/${file.name}`, data: file.data })),
    ...extraEntries,
  ].filter((entry) => !omitPaths.includes(entry.path));
  return {
    id,
    version,
    bytes: createTarGz(entries),
    sourceManifest,
    sourceFiles,
    licenseFiles,
  };
}

function sourceExpectation(archive) {
  const archiveFileName = `${archive.id}-v${archive.version}-source.tar.gz`;
  return {
    id: archive.id,
    version: archive.version,
    source: {
      releaseTag: `font-${archive.id}-v${archive.version}`,
      fileName: archiveFileName,
      sha256: sha256(archive.bytes),
      size: archive.bytes.length,
    },
    manifest: {
      id: archive.id,
      version: archive.version,
      source: {
        archiveFileName,
        files: archive.sourceFiles.map((file) => ({
          fileName: file.name,
          sha256: sha256(file.data),
          size: file.data.length,
        })),
      },
      license: {
        files: archive.licenseFiles.map((file) => ({
          file: `licenses/${file.name}`,
          sha256: sha256(file.data),
          size: file.data.length,
        })),
      },
    },
  };
}

function withOuterPointer(expected, bytes) {
  return {
    ...expected,
    source: { ...expected.source, sha256: sha256(bytes), size: bytes.length },
  };
}

function makeFamilyFixture({ id, role = 'fixed', sourceArchive }) {
  const version = FIXTURE_VERSION;
  const familyName = `Fixture ${id}`;
  const fontBytes = Buffer.concat([
    Buffer.from('wOF2', 'ascii'),
    crypto.createHash('sha256').update(`package-font:${id}`).digest(),
    Buffer.alloc(64, 0),
  ]);
  const fontFile = `fonts/${id}-400-normal.woff2`;
  const archiveFileName = `${id}-v${version}-source.tar.gz`;
  const manifest = {
    schemaVersion: 1,
    kind: 'family',
    id,
    familyName,
    sourceFamilyName: familyName,
    role,
    version,
    cssVariable: `--font-${id}`,
    fallbacks: ['serif'],
    buildTools: {
      cnFontSplit: 'fixture',
      fontkitten: 'fixture',
      schema: 1,
    },
    source: {
      archiveFileName,
      files: sourceArchive.sourceFiles.map((file) => ({
        fileName: file.name,
        sha256: sha256(file.data),
        size: file.data.length,
      })),
    },
    license: {
      spdx: 'OFL-1.1',
      approvedForRedistribution: true,
      reviewedAt: '2026-10-30',
      reviewedBy: 'Fixture',
      evidenceUrl: 'https://example.com/license',
      files: sourceArchive.licenseFiles.map((file) => ({
        file: `licenses/${file.name}`,
        sha256: sha256(file.data),
        size: file.data.length,
      })),
      reservedFontNames: [],
      rfn: {
        status: 'not-applicable',
        basis: 'Fixture has no reserved font names.',
      },
    },
    css: 'font.css',
    variants: [
      {
        file: fontFile,
        sha256: sha256(fontBytes),
        size: fontBytes.length,
        weight: '400',
        style: 'normal',
        display: 'swap',
        ...(role === 'core-cjk' ? { unicodeRange: ['U+4E00'] } : {}),
        font: {
          familyName,
          subfamilyName: 'Regular',
          postscriptName: `Fixture${id.replace(/-/g, '')}-Regular`,
          format: 'WOFF2',
          weight: 400,
          widthClass: 5,
          italicAngle: 0,
          coverageCount: 1,
          variationAxes: {},
        },
      },
    ],
  };
  const packageBytes = createTarGz([
    { path: 'manifest.json', data: Buffer.from(stableStringify(manifest)) },
    {
      path: 'font.css',
      data: Buffer.from(`@font-face{font-family:"${familyName}";src:url("./${fontFile}")}\n`),
    },
    { path: fontFile, data: fontBytes },
    ...manifest.license.files.map((file) => ({
      path: file.file,
      data: sourceArchive.licenseFiles.find((license) => `licenses/${license.name}` === file.file)
        .data,
    })),
  ]);
  return {
    id,
    version,
    role,
    manifest,
    packageBytes,
    packageFileName: `${id}-v${version}.tar.gz`,
    releaseTag: `font-${id}-v${version}`,
    source: {
      releaseTag: `font-${id}-v${version}`,
      fileName: archiveFileName,
      sha256: sha256(sourceArchive.bytes),
      size: sourceArchive.bytes.length,
    },
    sourceArchive,
  };
}

async function createTempProject() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'senrenbanka-font-sources-test-'));
}

async function startHttpServer(routes) {
  const requests = [];
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    requests.push(url.pathname);
    const data = routes[url.pathname];
    if (!data) {
      response.writeHead(404).end('not found');
      return;
    }
    response.writeHead(200, {
      'content-type': 'application/octet-stream',
      'content-length': data.length,
    });
    response.end(data);
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  return {
    server,
    requests,
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  };
}

async function setupPublishedFixture({ families, serveSources = true }) {
  const routes = {};
  const server = await startHttpServer(routes);
  const catalogFamilies = {};
  for (const family of families) {
    catalogFamilies[family.id] = {
      version: family.version,
      role: family.role,
      package: {
        releaseTag: family.releaseTag,
        fileName: family.packageFileName,
        sha256: sha256(family.packageBytes),
        size: family.packageBytes.length,
      },
      source: family.source,
    };
    routes[`/${family.releaseTag}/${family.packageFileName}`] = family.packageBytes;
    if (serveSources) {
      routes[`/${family.source.releaseTag}/${family.source.fileName}`] = family.sourceArchive.bytes;
    }
  }
  const catalog = {
    schemaVersion: 1,
    catalogVersion: FIXTURE_VERSION,
    baseUrl: server.baseUrl,
    families: catalogFamilies,
  };
  const catalogBytes = Buffer.from(stableStringify(catalog));
  routes['/catalog.json'] = catalogBytes;
  const projectRoot = await createTempProject();
  const config = {
    schemaVersion: 1,
    baseUrl: server.baseUrl,
    families: families.map((family) => ({
      id: family.id,
      name: family.manifest.familyName,
      cssVariable: family.manifest.cssVariable,
      fallbacks: family.manifest.fallbacks,
    })),
  };
  await fs.writeFile(path.join(projectRoot, 'fonts.config.json'), stableStringify(config));
  return {
    ...server,
    projectRoot,
    catalogUrl: `${server.baseUrl}/catalog.json`,
    catalogSha256: sha256(catalogBytes),
  };
}

async function runUpdate(fixture) {
  return updateFonts({
    projectRoot: fixture.projectRoot,
    catalogUrl: fixture.catalogUrl,
    catalogSha256: fixture.catalogSha256,
  });
}

function coreCacheRoot(projectRoot, id) {
  return path.join(
    projectRoot,
    ...sourceCacheRelativePath(FIXTURE_VERSION, id, FIXTURE_VERSION).split('/'),
  );
}

test('source archive inspection verifies the manifest, font and license and rejects unsafe archives', () => {
  const archive = makeSourceArchive({ id: 'fixture-core' });
  const expected = sourceExpectation(archive);
  const inspected = inspectSourceArchiveBuffer(archive.bytes, expected);
  assert.equal(inspected.sourceManifest.id, 'fixture-core');
  assert.equal(inspected.sourceManifest.kind, 'source');
  assert.equal(inspected.sourceFiles.length, 1);
  assert.equal(inspected.licenseFiles.length, 1);
  assert.equal(inspected.files.length, 3);
  assert.equal(
    inspected.sourceManifestSha256,
    sha256(Buffer.from(stableStringify(archive.sourceManifest))),
  );
  assert.equal(
    inspected.sourceFilesSha256,
    sha256(Buffer.from(stableStringify(archive.sourceManifest.files))),
  );
  assert.equal(
    inspected.licenseFilesSha256,
    sha256(Buffer.from(stableStringify(archive.sourceManifest.licenses))),
  );

  const traversal = createTarGz([{ path: '../escape', data: Buffer.from('escape') }]);
  assert.throws(
    () => inspectSourceArchiveBuffer(traversal, withOuterPointer(expected, traversal)),
    /unsafe path/i,
  );

  const symlink = createTarGz([
    { path: 'source/fonts/link.otf', type: '2', linkName: '../source-manifest.json' },
    { path: 'source-manifest.json', data: Buffer.from('{}') },
  ]);
  assert.throws(
    () => inspectSourceArchiveBuffer(symlink, withOuterPointer(expected, symlink)),
    /symlink/i,
  );

  const hardlink = createTarGz([
    { path: 'source/fonts/link.otf', type: '1', linkName: 'source-manifest.json' },
    { path: 'source-manifest.json', data: Buffer.from('{}') },
  ]);
  assert.throws(
    () => inspectSourceArchiveBuffer(hardlink, withOuterPointer(expected, hardlink)),
    /hardlink/i,
  );

  const duplicate = createTarGz([
    { path: 'source-manifest.json', data: Buffer.from('{}') },
    { path: 'source-manifest.json', data: Buffer.from('{}') },
  ]);
  assert.throws(
    () => inspectSourceArchiveBuffer(duplicate, withOuterPointer(expected, duplicate)),
    /duplicate entry/i,
  );

  const extra = makeSourceArchive({
    id: 'fixture-core',
    extraEntries: [{ path: 'source/fonts/extra.otf', data: Buffer.from('extra') }],
  });
  assert.throws(
    () => inspectSourceArchiveBuffer(extra.bytes, sourceExpectation(extra)),
    /undeclared file/i,
  );

  const missing = makeSourceArchive({
    id: 'fixture-core',
    omitPaths: ['source/fonts/fixture-core-source.otf'],
  });
  assert.throws(
    () => inspectSourceArchiveBuffer(missing.bytes, sourceExpectation(missing)),
    /missing declared file/i,
  );

  assert.throws(
    () =>
      inspectSourceArchiveBuffer(archive.bytes, {
        ...expected,
        source: { ...expected.source, sha256: '0'.repeat(64) },
      }),
    /SHA-256 mismatch/i,
  );
  assert.throws(
    () =>
      inspectSourceArchiveBuffer(archive.bytes, {
        ...expected,
        source: { ...expected.source, size: archive.bytes.length + 1 },
      }),
    /size mismatch/i,
  );

  const badFontHash = makeSourceArchive({
    id: 'fixture-core',
    mutateManifest: (manifest) => {
      manifest.files[0].sha256 = 'f'.repeat(64);
    },
  });
  const badFontExpected = sourceExpectation(badFontHash);
  badFontExpected.manifest.source.files[0].sha256 = 'f'.repeat(64);
  assert.throws(
    () => inspectSourceArchiveBuffer(badFontHash.bytes, badFontExpected),
    /SHA-256 mismatch/i,
  );

  const badLicenseHash = makeSourceArchive({
    id: 'fixture-core',
    mutateManifest: (manifest) => {
      manifest.licenses[0].sha256 = 'e'.repeat(64);
    },
  });
  const badLicenseExpected = sourceExpectation(badLicenseHash);
  badLicenseExpected.manifest.license.files[0].sha256 = 'e'.repeat(64);
  assert.throws(
    () => inspectSourceArchiveBuffer(badLicenseHash.bytes, badLicenseExpected),
    /SHA-256 mismatch/i,
  );

  const multipleSources = makeSourceArchive({
    id: 'fixture-core',
    sourceFiles: [
      { name: 'a.otf', data: fakeSourceFont('a') },
      { name: 'b.otf', data: fakeSourceFont('b') },
    ],
  });
  assert.throws(
    () => inspectSourceArchiveBuffer(multipleSources.bytes, sourceExpectation(multipleSources)),
    /only one source font/i,
  );

  const wrongIdentity = makeSourceArchive({
    id: 'fixture-core',
    mutateManifest: (manifest) => {
      manifest.id = 'other-font';
    },
  });
  assert.throws(
    () => inspectSourceArchiveBuffer(wrongIdentity.bytes, sourceExpectation(wrongIdentity)),
    /id mismatch/i,
  );

  const wrongCatalogFiles = sourceExpectation(archive);
  wrongCatalogFiles.manifest.source.files = [
    { fileName: 'other.otf', sha256: '0'.repeat(64), size: 1 },
  ];
  assert.throws(
    () => inspectSourceArchiveBuffer(archive.bytes, wrongCatalogFiles),
    /source font files do not match the catalog manifest/i,
  );
});

test('prepare installs a core source cache, reuses it offline and verifies it offline', async () => {
  const coreArchive = makeSourceArchive({ id: 'fixture-core' });
  const core = makeFamilyFixture({
    id: 'fixture-core',
    role: 'core-cjk',
    sourceArchive: coreArchive,
  });
  const fixedArchive = makeSourceArchive({ id: 'fixture-fixed' });
  const fixed = makeFamilyFixture({ id: 'fixture-fixed', sourceArchive: fixedArchive });
  const fixture = await setupPublishedFixture({ families: [core, fixed] });
  try {
    await runUpdate(fixture);

    const prepared = await prepareFonts({ projectRoot: fixture.projectRoot });
    assert.deepEqual(prepared.downloaded, ['fixture-core', 'fixture-fixed']);
    assert.deepEqual(prepared.sourcesDownloaded, ['fixture-core']);
    assert.deepEqual(prepared.sourcesReused, []);
    assert.deepEqual(prepared.sourceCacheDirectories, [
      sourceCacheRelativePath(FIXTURE_VERSION, 'fixture-core', FIXTURE_VERSION),
    ]);
    const coreSourcePath = `/${core.source.releaseTag}/${core.source.fileName}`;
    const fixedSourcePath = `/${fixed.source.releaseTag}/${fixed.source.fileName}`;
    assert.equal(fixture.requests.includes(coreSourcePath), true);
    assert.equal(fixture.requests.includes(fixedSourcePath), false);

    const sourceRoot = coreCacheRoot(fixture.projectRoot, 'fixture-core');
    const marker = JSON.parse(
      await fs.readFile(path.join(sourceRoot, '.complete-source.json'), 'utf8'),
    );
    assert.deepEqual(marker, {
      schemaVersion: 1,
      catalogVersion: FIXTURE_VERSION,
      familyId: 'fixture-core',
      familyVersion: FIXTURE_VERSION,
      sourceArchiveSha256: sha256(coreArchive.bytes),
      sourceArchiveSize: coreArchive.bytes.length,
      sourceManifestSha256: sha256(Buffer.from(stableStringify(coreArchive.sourceManifest))),
      sourceFilesSha256: sha256(Buffer.from(stableStringify(coreArchive.sourceManifest.files))),
      licenseFilesSha256: sha256(Buffer.from(stableStringify(coreArchive.sourceManifest.licenses))),
    });
    for (const relative of [
      'source-manifest.json',
      `source/fonts/${coreArchive.sourceFiles[0].name}`,
      `source/licenses/${coreArchive.licenseFiles[0].name}`,
    ]) {
      const stat = await fs.stat(path.join(sourceRoot, ...relative.split('/')));
      assert.equal(stat.isFile(), true, `missing cached source file ${relative}`);
    }

    const state = await loadFontState({ projectRoot: fixture.projectRoot });
    const verified = await verifyAllSourceCaches({
      projectRoot: fixture.projectRoot,
      snapshot: state.snapshot,
    });
    assert.equal(verified.length, 1);
    assert.equal(path.resolve(verified[0].root), path.resolve(sourceRoot));
    assert.deepEqual(
      {
        files: verified[0].files,
        sourceFiles: verified[0].sourceFiles,
        licenseFiles: verified[0].licenseFiles,
      },
      { files: 3, sourceFiles: 1, licenseFiles: 1 },
    );

    const requestCount = fixture.requests.length;
    const reused = await prepareFonts({
      projectRoot: fixture.projectRoot,
      offline: true,
      fetchImpl: () => {
        throw new Error('offline prepare must not fetch');
      },
    });
    assert.deepEqual(reused.sourcesDownloaded, []);
    assert.deepEqual(reused.sourcesReused, ['fixture-core']);
    assert.equal(fixture.requests.length, requestCount);

    const checked = await checkFonts({ projectRoot: fixture.projectRoot });
    assert.equal(checked.sourceCacheEntries, 1);
    assert.equal(checked.sourceCachedFiles, 3);
    assert.equal(checked.sourceFonts, 1);
    assert.equal(checked.sourceLicenses, 1);

    const cachedFont = path.join(sourceRoot, 'source', 'fonts', coreArchive.sourceFiles[0].name);
    const originalFont = await fs.readFile(cachedFont);
    await fs.writeFile(cachedFont, Buffer.concat([originalFont, Buffer.from('x')]));
    await assert.rejects(
      () => checkFonts({ projectRoot: fixture.projectRoot }),
      /size mismatch.*npm run fonts:prepare/i,
    );
    await assert.rejects(
      () =>
        prepareFonts({
          projectRoot: fixture.projectRoot,
          offline: true,
          fetchImpl: () => {
            throw new Error('offline prepare must not fetch');
          },
        }),
      /cached source archive is not usable.*npm run fonts:prepare/i,
    );
    const repaired = await prepareFonts({ projectRoot: fixture.projectRoot });
    assert.deepEqual(repaired.sourcesDownloaded, ['fixture-core']);
    await checkFonts({ projectRoot: fixture.projectRoot });

    const markerPath = path.join(sourceRoot, '.complete-source.json');
    const tamperedMarker = JSON.parse(await fs.readFile(markerPath, 'utf8'));
    tamperedMarker.familyVersion = '9.9.9';
    await fs.writeFile(markerPath, stableStringify(tamperedMarker));
    await assert.rejects(
      () => checkFonts({ projectRoot: fixture.projectRoot }),
      /completion marker.*npm run fonts:prepare/i,
    );
    await prepareFonts({ projectRoot: fixture.projectRoot });
    await checkFonts({ projectRoot: fixture.projectRoot });

    await fs.rm(path.join(sourceRoot, '.complete-source.json'));
    await assert.rejects(
      () => checkFonts({ projectRoot: fixture.projectRoot }),
      /missing \.complete-source\.json.*npm run fonts:prepare/i,
    );
    await prepareFonts({ projectRoot: fixture.projectRoot });
    await checkFonts({ projectRoot: fixture.projectRoot });
  } finally {
    await fixture.close();
  }
});

test('offline prepare and check fail clearly when a core source cache is missing', async () => {
  const coreArchive = makeSourceArchive({ id: 'fixture-core' });
  const core = makeFamilyFixture({
    id: 'fixture-core',
    role: 'core-cjk',
    sourceArchive: coreArchive,
  });
  const fixture = await setupPublishedFixture({ families: [core] });
  try {
    await runUpdate(fixture);
    const prepared = await prepareFonts({ projectRoot: fixture.projectRoot });
    assert.deepEqual(prepared.sourcesDownloaded, ['fixture-core']);

    const sourceRoot = coreCacheRoot(fixture.projectRoot, 'fixture-core');
    await fs.rm(sourceRoot, { recursive: true, force: true });
    await assert.rejects(
      () =>
        prepareFonts({
          projectRoot: fixture.projectRoot,
          offline: true,
          fetchImpl: () => {
            throw new Error('offline prepare must not fetch');
          },
        }),
      /cached source archive is not usable for fixture-core.*npm run fonts:prepare/i,
    );
    await assert.rejects(
      () => checkFonts({ projectRoot: fixture.projectRoot }),
      /font source cache directory is missing.*npm run fonts:prepare/i,
    );

    const repaired = await prepareFonts({ projectRoot: fixture.projectRoot });
    assert.deepEqual(repaired.sourcesDownloaded, ['fixture-core']);
    const checked = await checkFonts({ projectRoot: fixture.projectRoot });
    assert.equal(checked.sourceCacheEntries, 1);
  } finally {
    await fixture.close();
  }
});

test('fixed families keep working without any source cache', async () => {
  const fixedArchive = makeSourceArchive({ id: 'fixture-fixed' });
  const fixed = makeFamilyFixture({ id: 'fixture-fixed', sourceArchive: fixedArchive });
  const fixture = await setupPublishedFixture({ families: [fixed], serveSources: false });
  try {
    await runUpdate(fixture);
    const prepared = await prepareFonts({ projectRoot: fixture.projectRoot });
    assert.deepEqual(prepared.downloaded, ['fixture-fixed']);
    assert.deepEqual(prepared.sourcesDownloaded, []);
    assert.deepEqual(prepared.sourcesReused, []);
    assert.deepEqual(prepared.sourceCacheDirectories, []);
    assert.equal(
      fixture.requests.includes(`/${fixed.source.releaseTag}/${fixed.source.fileName}`),
      false,
    );

    const checked = await checkFonts({ projectRoot: fixture.projectRoot });
    assert.equal(checked.familyCount, 1);
    assert.equal(checked.sourceCacheEntries, 0);
    assert.equal(checked.sourceCachedFiles, 0);
    assert.equal(checked.sourceFonts, 0);
    assert.equal(checked.sourceLicenses, 0);
    assert.ok(checked.cachedFiles > 0);
    await assert.rejects(
      () => fs.stat(path.join(fixture.projectRoot, '.cache', 'font-sources')),
      (error) => error.code === 'ENOENT',
    );
  } finally {
    await fixture.close();
  }
});
