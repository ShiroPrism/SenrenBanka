import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import zlib from 'node:zlib';
import { inspectFamilyPackageBuffer } from './fonts/lib/archive.mjs';
import { auditFonts, isCjkCodePoint } from './fonts/audit.mjs';
import { buildLocalFontDefinitions, renderGeneratedSource } from './fonts/lib/generated.mjs';
import { sha256, stableStringify } from './fonts/lib/json.mjs';
import { familyCacheRelativePath } from './fonts/lib/paths.mjs';
import { loadFontState, validateFontState } from './fonts/lib/repository.mjs';
import { checkFonts } from './fonts/check.mjs';
import { prepareFonts } from './fonts/prepare.mjs';
import { updateFonts } from './fonts/update.mjs';

const FIXTURE_ID = 'fixture-font';
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

function makeFamilyFixture({
  id = FIXTURE_ID,
  role = 'fixed',
  unicodeRange,
  badVariantHash = false,
  badVariantSize = false,
  licenseApproved = true,
  name = 'Fixture Font',
  cssVariable = '--font-fixture',
  fallbacks = ['serif'],
  extraEntries = [],
  reservedFontNames = [],
  rfnStatus = 'not-applicable',
  rfnPermissionText,
} = {}) {
  const version = FIXTURE_VERSION;
  const fontBytes = Buffer.concat([
    Buffer.from('wOF2', 'ascii'),
    crypto.createHash('sha256').update(id).digest(),
    Buffer.alloc(64, 0),
  ]);
  const fontFile = `fonts/${id}-400-normal.woff2`;
  const licenseFile = 'licenses/LICENSE.txt';
  const licenseBytes = Buffer.from(`Fixture license for ${name}\n`, 'utf8');
  const sourceFileName = `${id}-v${version}-source.tar.gz`;
  const manifest = {
    schemaVersion: 1,
    kind: 'family',
    id,
    familyName: name,
    sourceFamilyName: name,
    role,
    version,
    cssVariable,
    fallbacks,
    buildTools: {
      cnFontSplit: '7.4.3',
      fontkitten: '0.0.0-fixture',
      schema: 1,
    },
    source: {
      archiveFileName: sourceFileName,
      files: [
        {
          fileName: `${id}-source.woff2`,
          sha256: '0'.repeat(64),
          size: 1,
        },
      ],
    },
    license: {
      spdx: 'OFL-1.1',
      approvedForRedistribution: licenseApproved,
      reviewedAt: '2026-10-30',
      reviewedBy: 'Fixture',
      evidenceUrl: 'https://example.com/license',
      files: [
        {
          file: licenseFile,
          sha256: sha256(licenseBytes),
          size: licenseBytes.length,
        },
      ],
      reservedFontNames,
      rfn: {
        status: rfnStatus,
        basis: 'Fixture has no reserved font names.',
        ...(rfnPermissionText ? { permissionText: rfnPermissionText } : {}),
      },
    },
    css: 'font.css',
    variants: [
      {
        file: fontFile,
        sha256: badVariantHash ? '0'.repeat(64) : sha256(fontBytes),
        size: badVariantSize ? fontBytes.length + 1 : fontBytes.length,
        weight: '400',
        style: 'normal',
        display: 'swap',
        ...(unicodeRange ? { unicodeRange } : {}),
        font: {
          familyName: name,
          subfamilyName: 'Regular',
          postscriptName: `${name.replace(/\s+/g, '')}-Regular`,
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
      data: Buffer.from(`@font-face{font-family:"${name}";src:url("./${fontFile}")}\n`),
    },
    { path: fontFile, data: fontBytes },
    { path: licenseFile, data: licenseBytes },
    ...extraEntries,
  ]);
  return {
    manifest,
    packageBytes,
    packageFileName: `${id}-v${version}.tar.gz`,
    releaseTag: `font-${id}-v${version}`,
    source: {
      releaseTag: `font-${id}-v${version}`,
      fileName: sourceFileName,
      sha256: '0'.repeat(64),
      size: 1,
    },
  };
}

async function createTempProject() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'senrenbanka-fonts-test-'));
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
    close: () => new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))),
  };
}

async function setupPublishedFixture({
  selected = [makeFamilyFixture()],
  unselected = [],
  packageShaOverride,
  configFamilies,
  catalogVersion = FIXTURE_VERSION,
  schemaVersion = 1,
} = {}) {
  const routes = {};
  const server = await startHttpServer(routes);
  const all = [...selected, ...unselected];
  const families = {};
  for (const fixture of all) {
    const releaseSha =
      packageShaOverride && fixture.manifest.id === FIXTURE_ID
        ? packageShaOverride
        : sha256(fixture.packageBytes);
    families[fixture.manifest.id] = {
      version: FIXTURE_VERSION,
      role: fixture.manifest.role,
      package: {
        releaseTag: fixture.releaseTag,
        fileName: fixture.packageFileName,
        sha256: releaseSha,
        size: fixture.packageBytes.length,
      },
      source: fixture.source,
    };
    routes[`/${fixture.releaseTag}/${fixture.packageFileName}`] = fixture.packageBytes;
  }
  const catalog = {
    schemaVersion,
    catalogVersion,
    baseUrl: server.baseUrl,
    families,
  };
  const catalogBytes = Buffer.from(stableStringify(catalog));
  routes['/catalog.json'] = catalogBytes;
  const projectRoot = await createTempProject();
  const config = {
    schemaVersion: 1,
    baseUrl: server.baseUrl,
    families:
      configFamilies ??
      selected.map((fixture) => ({
        id: fixture.manifest.id,
        name: fixture.manifest.familyName,
        cssVariable: fixture.manifest.cssVariable,
        fallbacks: fixture.manifest.fallbacks,
      })),
  };
  await fs.writeFile(
    path.join(projectRoot, 'fonts.config.json'),
    stableStringify(config),
  );
  return {
    ...server,
    projectRoot,
    catalogUrl: `${server.baseUrl}/catalog.json`,
    catalogSha256: sha256(catalogBytes),
    selected,
    unselected,
  };
}

async function runUpdate(fixture) {
  return updateFonts({
    projectRoot: fixture.projectRoot,
    catalogUrl: fixture.catalogUrl,
    catalogSha256: fixture.catalogSha256,
  });
}

test('fonts:update filters to selected families and prepare reuses a verified cache offline', async () => {
  const selected = makeFamilyFixture();
  const unselected = makeFamilyFixture({
    id: 'unselected-font',
    name: 'Unselected Font',
    cssVariable: '--font-unselected',
  });
  const fixture = await setupPublishedFixture({ selected: [selected], unselected: [unselected] });
  try {
    const summary = await runUpdate(fixture);
    assert.equal(summary.families, 1);
    assert.equal(fixture.requests.some((request) => request.includes('unselected-font')), false);
    const trackedOutputs = [
      'fonts.catalog.json',
      'fonts.lock.json',
      'src/fonts/generated.ts',
    ];
    const firstOutputs = await Promise.all(
      trackedOutputs.map((file) => fs.readFile(path.join(fixture.projectRoot, file), 'utf8')),
    );
    await runUpdate(fixture);
    const secondOutputs = await Promise.all(
      trackedOutputs.map((file) => fs.readFile(path.join(fixture.projectRoot, file), 'utf8')),
    );
    assert.deepEqual(secondOutputs, firstOutputs);
    await Promise.all([runUpdate(fixture), runUpdate(fixture)]);
    const concurrentOutputs = await Promise.all(
      trackedOutputs.map((file) => fs.readFile(path.join(fixture.projectRoot, file), 'utf8')),
    );
    assert.deepEqual(concurrentOutputs, firstOutputs);

    const prepared = await prepareFonts({ projectRoot: fixture.projectRoot });
    assert.deepEqual(prepared.downloaded, [FIXTURE_ID]);
    const cacheRoot = path.join(
      fixture.projectRoot,
      ...familyCacheRelativePath(FIXTURE_VERSION, FIXTURE_ID, FIXTURE_VERSION).split('/'),
    );
    assert.equal(await fs.stat(path.join(cacheRoot, '.complete.json')).then((stat) => stat.isFile()), true);

    const requestCount = fixture.requests.length;
    const reused = await prepareFonts({
      projectRoot: fixture.projectRoot,
      offline: true,
      fetchImpl: () => {
        throw new Error('offline prepare must not fetch');
      },
    });
    assert.deepEqual(reused.reused, [FIXTURE_ID]);
    assert.equal(fixture.requests.length, requestCount);

    await fs.writeFile(path.join(cacheRoot, 'fonts', 'injected.woff2'), 'not declared');
    await assert.rejects(
      () => checkFonts({ projectRoot: fixture.projectRoot }),
      /undeclared file.*npm run fonts:prepare/i,
    );
    await fs.rm(path.join(cacheRoot, 'fonts', 'injected.woff2'));

    await fs.rm(path.join(cacheRoot, '.complete.json'));
    await assert.rejects(
      () => checkFonts({ projectRoot: fixture.projectRoot }),
      /missing.*npm run fonts:prepare/i,
    );
    await prepareFonts({ projectRoot: fixture.projectRoot });

    await fs.rm(path.join(cacheRoot, 'fonts', `${FIXTURE_ID}-400-normal.woff2`));
    await assert.rejects(
      () => checkFonts({ projectRoot: fixture.projectRoot }),
      /(?:missing|SHA-256).*npm run fonts:prepare/i,
    );
    const repaired = await prepareFonts({ projectRoot: fixture.projectRoot });
    assert.deepEqual(repaired.downloaded, [FIXTURE_ID]);
    await checkFonts({ projectRoot: fixture.projectRoot });
  } finally {
    await fixture.close();
  }
});

test('fonts:update rejects a bad catalog hash, missing family, and unknown schema', async () => {
  const fixture = await setupPublishedFixture();
  try {
    await assert.rejects(
      () =>
        updateFonts({
          projectRoot: fixture.projectRoot,
          catalogUrl: fixture.catalogUrl,
          catalogSha256: 'f'.repeat(64),
        }),
      /catalog SHA-256 mismatch/i,
    );

    await fs.writeFile(
      path.join(fixture.projectRoot, 'fonts.config.json'),
      stableStringify({
        schemaVersion: 1,
        baseUrl: fixture.baseUrl,
        families: [
          {
            id: 'missing-font',
            name: 'Missing Font',
            cssVariable: '--font-missing',
            fallbacks: ['serif'],
          },
        ],
      }),
    );
    await assert.rejects(() => runUpdate(fixture), /missing selected families/i);
  } finally {
    await fixture.close();
  }

  const badSchema = await setupPublishedFixture({ schemaVersion: 2 });
  try {
    await assert.rejects(() => runUpdate(badSchema), /schemaVersion/i);
  } finally {
    await badSchema.close();
  }
});

test('package verification rejects outer hash, inner hash/size, and unapproved licenses', async () => {
  const outer = await setupPublishedFixture({ packageShaOverride: '0'.repeat(64) });
  try {
    await assert.rejects(() => runUpdate(outer), /package SHA-256 mismatch/i);
  } finally {
    await outer.close();
  }

  const inner = await setupPublishedFixture({
    selected: [makeFamilyFixture({ badVariantHash: true })],
  });
  try {
    await assert.rejects(() => runUpdate(inner), /SHA-256 mismatch/i);
  } finally {
    await inner.close();
  }

  const size = await setupPublishedFixture({
    selected: [makeFamilyFixture({ badVariantSize: true })],
  });
  try {
    await assert.rejects(() => runUpdate(size), /size mismatch/i);
  } finally {
    await size.close();
  }

  const license = await setupPublishedFixture({
    selected: [makeFamilyFixture({ licenseApproved: false })],
  });
  try {
    await assert.rejects(() => runUpdate(license), /approvedForRedistribution|invalid/i);
  } finally {
    await license.close();
  }

  const invalidRfn = await setupPublishedFixture({
    selected: [
      makeFamilyFixture({
        reservedFontNames: ['Fixture'],
        rfnStatus: 'not-applicable',
      }),
    ],
  });
  try {
    await assert.rejects(() => runUpdate(invalidRfn), /reserved font names are declared/i);
  } finally {
    await invalidRfn.close();
  }

  const missingPermissionEvidence = await setupPublishedFixture({
    selected: [
      makeFamilyFixture({
        reservedFontNames: ['Fixture'],
        rfnStatus: 'permission-granted',
      }),
    ],
  });
  try {
    await assert.rejects(
      () => runUpdate(missingPermissionEvidence),
      /permission-granted requires evidence/i,
    );
  } finally {
    await missingPermissionEvidence.close();
  }

  const coreWithoutRanges = await setupPublishedFixture({
    selected: [makeFamilyFixture({ role: 'core-cjk' })],
  });
  try {
    await assert.rejects(() => runUpdate(coreWithoutRanges), /core-cjk variants require unicode ranges/i);
  } finally {
    await coreWithoutRanges.close();
  }
});

test('package verification rejects path traversal, links, duplicates, and extra files', () => {
  const traversal = createTarGz([
    { path: '../escape', data: Buffer.from('escape') },
  ]);
  assert.throws(
    () =>
      inspectFamilyPackageBuffer(traversal, {
        id: FIXTURE_ID,
        version: FIXTURE_VERSION,
        role: 'fixed',
        package: {
          releaseTag: `font-${FIXTURE_ID}-v${FIXTURE_VERSION}`,
          fileName: `${FIXTURE_ID}-v${FIXTURE_VERSION}.tar.gz`,
          sha256: sha256(traversal),
          size: traversal.length,
        },
        source: {
          releaseTag: `font-${FIXTURE_ID}-v${FIXTURE_VERSION}`,
          fileName: `${FIXTURE_ID}-v${FIXTURE_VERSION}-source.tar.gz`,
          sha256: '0'.repeat(64),
          size: 1,
        },
      }),
    /unsafe path/i,
  );

  const symlink = createTarGz([
    { path: 'fonts/link.woff2', type: '2', linkName: '../manifest.json' },
    { path: 'manifest.json', data: Buffer.from('{}') },
  ]);
  assert.throws(
    () =>
      inspectFamilyPackageBuffer(symlink, {
        id: FIXTURE_ID,
        version: FIXTURE_VERSION,
        role: 'fixed',
        package: {
          releaseTag: `font-${FIXTURE_ID}-v${FIXTURE_VERSION}`,
          fileName: `${FIXTURE_ID}-v${FIXTURE_VERSION}.tar.gz`,
          sha256: sha256(symlink),
          size: symlink.length,
        },
        source: {
          releaseTag: `font-${FIXTURE_ID}-v${FIXTURE_VERSION}`,
          fileName: `${FIXTURE_ID}-v${FIXTURE_VERSION}-source.tar.gz`,
          sha256: '0'.repeat(64),
          size: 1,
        },
      }),
    /symlink/i,
  );

  const hardlink = createTarGz([
    { path: 'fonts/link.woff2', type: '1', linkName: 'manifest.json' },
    { path: 'manifest.json', data: Buffer.from('{}') },
  ]);
  assert.throws(
    () =>
      inspectFamilyPackageBuffer(hardlink, {
        id: FIXTURE_ID,
        version: FIXTURE_VERSION,
        role: 'fixed',
        package: {
          releaseTag: `font-${FIXTURE_ID}-v${FIXTURE_VERSION}`,
          fileName: `${FIXTURE_ID}-v${FIXTURE_VERSION}.tar.gz`,
          sha256: sha256(hardlink),
          size: hardlink.length,
        },
        source: {
          releaseTag: `font-${FIXTURE_ID}-v${FIXTURE_VERSION}`,
          fileName: `${FIXTURE_ID}-v${FIXTURE_VERSION}-source.tar.gz`,
          sha256: '0'.repeat(64),
          size: 1,
        },
      }),
    /hardlink/i,
  );

  const duplicate = createTarGz([
    { path: 'manifest.json', data: Buffer.from('{}') },
    { path: 'manifest.json', data: Buffer.from('{}') },
  ]);
  assert.throws(
    () =>
      inspectFamilyPackageBuffer(duplicate, {
        id: FIXTURE_ID,
        version: FIXTURE_VERSION,
        role: 'fixed',
        package: {
          releaseTag: `font-${FIXTURE_ID}-v${FIXTURE_VERSION}`,
          fileName: `${FIXTURE_ID}-v${FIXTURE_VERSION}.tar.gz`,
          sha256: sha256(duplicate),
          size: duplicate.length,
        },
        source: {
          releaseTag: `font-${FIXTURE_ID}-v${FIXTURE_VERSION}`,
          fileName: `${FIXTURE_ID}-v${FIXTURE_VERSION}-source.tar.gz`,
          sha256: '0'.repeat(64),
          size: 1,
        },
      }),
    /duplicate entry/i,
  );

  const extra = makeFamilyFixture({
    extraEntries: [{ path: 'fonts/undeclared.woff2', data: Buffer.from('wOF2extra') }],
  });
  assert.throws(
    () =>
      inspectFamilyPackageBuffer(extra.packageBytes, {
        id: extra.manifest.id,
        version: extra.manifest.version,
        role: extra.manifest.role,
        package: {
          releaseTag: extra.releaseTag,
          fileName: extra.packageFileName,
          sha256: sha256(extra.packageBytes),
          size: extra.packageBytes.length,
        },
        source: extra.source,
      }),
    /undeclared file/i,
  );

  const alternateDataStream = createTarGz([
    { path: 'fonts/file.woff2:payload', data: Buffer.from('wOF2') },
  ]);
  assert.throws(
    () =>
      inspectFamilyPackageBuffer(alternateDataStream, {
        id: FIXTURE_ID,
        version: FIXTURE_VERSION,
        role: 'fixed',
        package: {
          releaseTag: `font-${FIXTURE_ID}-v${FIXTURE_VERSION}`,
          fileName: `${FIXTURE_ID}-v${FIXTURE_VERSION}.tar.gz`,
          sha256: sha256(alternateDataStream),
          size: alternateDataStream.length,
        },
        source: {
          releaseTag: `font-${FIXTURE_ID}-v${FIXTURE_VERSION}`,
          fileName: `${FIXTURE_ID}-v${FIXTURE_VERSION}-source.tar.gz`,
          sha256: '0'.repeat(64),
          size: 1,
        },
      }),
    /unsafe path/i,
  );
});

test('offline prepare fails clearly when the selected family is not cached', async () => {
  const fixture = await setupPublishedFixture();
  try {
    await runUpdate(fixture);
    await assert.rejects(
      () =>
        prepareFonts({
          projectRoot: fixture.projectRoot,
          offline: true,
          fetchImpl: () => {
            throw new Error('must not fetch');
          },
        }),
      /npm run fonts:prepare/i,
    );
  } finally {
    await fixture.close();
  }
});

test('concurrent prepare calls serialize installation and leave one valid cache', { timeout: 10_000 }, async () => {
  const fixture = await setupPublishedFixture();
  try {
    await runUpdate(fixture);
    let arrivals = 0;
    let releaseDownloads;
    const bothDownloading = new Promise((resolve) => {
      releaseDownloads = resolve;
    });
    const fetchImpl = async (url, options) => {
      arrivals += 1;
      if (arrivals === 2) releaseDownloads();
      await bothDownloading;
      return fetch(url, options);
    };

    await Promise.all([
      prepareFonts({ projectRoot: fixture.projectRoot, fetchImpl }),
      prepareFonts({ projectRoot: fixture.projectRoot, fetchImpl }),
    ]);
    const cached = await checkFonts({ projectRoot: fixture.projectRoot });
    assert.equal(cached.familyCount, 1);
    assert.equal(cached.cachedFiles, 4);

    const lockDirectory = path.join(
      fixture.projectRoot,
      '.cache',
      'fonts',
      FIXTURE_VERSION,
      '.locks',
    );
    assert.deepEqual(await fs.readdir(lockDirectory), []);
  } finally {
    await fixture.close();
  }
});

test('generated registration preserves all legacy local-family metadata', async () => {
  const state = await loadFontState();
  const summary = validateFontState(state);
  assert.equal(summary.familyCount, 20);
  assert.equal(summary.variantCount, 578);
  assert.equal(state.generated, renderGeneratedSource(state.snapshot, state.config));

  const legacy = JSON.parse(
    await fs.readFile(
      path.join(process.cwd(), 'scripts/fonts/fixtures/legacy-local-families.json'),
      'utf8',
    ),
  );
  const definitions = buildLocalFontDefinitions(state.snapshot, state.config);
  assert.equal(definitions.length, legacy.length);
  assert.equal(new Set(definitions.map((family) => family.name)).size, legacy.length);
  assert.equal(new Set(definitions.map((family) => family.cssVariable)).size, legacy.length);
  const definitionsByName = new Map(definitions.map((family) => [family.name, family]));
  for (const expected of legacy) {
    const actual = definitionsByName.get(expected.name);
    assert.ok(actual, `missing generated family ${expected.name}`);
    assert.equal(actual.cssVariable, expected.cssVariable);
    assert.deepEqual(actual.fallbacks, []);
    const actualVariants = actual.variants.map((variant) => ({
      weight: variant.weight,
      style: variant.style,
      ...(variant.stretch ? { stretch: variant.stretch } : {}),
      ...(variant.unicodeRange ? { unicodeRange: variant.unicodeRange } : {}),
    }));
    if (
      ['Zhuque Fangsong', 'Ark Pixel 12px', 'LXGW WenKai GB'].includes(expected.name)
    ) {
      assert.ok(actualVariants.length >= 1);
      for (const variant of actualVariants) {
        assert.equal(variant.weight, expected.variants[0].weight);
        assert.equal(variant.style, expected.variants[0].style);
        assert.ok(variant.unicodeRange?.length > 0);
      }
    } else {
      assert.deepEqual(actualVariants, expected.variants);
    }
  }
});

test('font audit reports covered and uncovered CJK while failing on missing candidates or HTML', async () => {
  assert.equal(isCjkCodePoint(0x30000), true);
  const core = makeFamilyFixture({ role: 'core-cjk', unicodeRange: ['U+4E00'] });
  const fixture = await setupPublishedFixture({ selected: [core] });
  try {
    await runUpdate(fixture);
    const dist = path.join(fixture.projectRoot, 'dist');
    await fs.mkdir(path.join(dist, '_astro', 'fonts'), { recursive: true });
    await fs.writeFile(path.join(dist, '_astro', 'fonts', 'fixture-shard.woff2'), 'wOF2fixture');
    await fs.writeFile(
      path.join(dist, 'index.html'),
      '<html><head><style>@font-face{font-family:"Fixture-h";src:url("/_astro/fonts/fixture-shard.woff2") format("woff2");unicode-range:U+4E00;}:root{--font-fixture:"Fixture-h"}</style></head><body>一龘𰀀<div hidden>変</div></body></html>',
    );
    const warnings = [];
    const report = await auditFonts({
      projectRoot: fixture.projectRoot,
      distDir: 'dist',
      jsonPath: '.cache/fonts/audit.json',
      logger: (message) => warnings.push(message),
    });
    assert.equal(report.candidatePages, 1);
    assert.equal(report.uncovered.length, 2);
    assert.equal(report.uncovered[0].codePoint, 'U+9F98');
    assert.equal(report.uncovered[1].codePoint, 'U+30000');
    assert.equal(report.uncovered.some((issue) => issue.character === '変'), false);
    assert.deepEqual(report.deployedGaps, []);
    assert.deepEqual(report.danglingFontUrls, []);
    assert.deepEqual(report.orphanFontFiles, []);
    assert.equal(report.deployed.rules, 1);
    assert.equal(report.deployed.fontFilesReferenced, 1);
    assert.equal(report.pages[0].deployedRules, 1);
    assert.match(warnings.join('\n'), /U\+9F98/);
    const written = JSON.parse(
      await fs.readFile(path.join(fixture.projectRoot, '.cache/fonts/audit.json'), 'utf8'),
    );
    assert.equal(written.uncovered[0].page, '/');

    await fs.writeFile(
      path.join(dist, 'index.html'),
      '<html><body>plain HTML-only page --font-fixture: not a declaration</body></html>',
    );
    await assert.rejects(
      () => auditFonts({ projectRoot: fixture.projectRoot, distDir: 'dist' }),
      /no candidate HTML page/i,
    );

    await fs.rm(path.join(dist, 'index.html'));
    await assert.rejects(
      () => auditFonts({ projectRoot: fixture.projectRoot, distDir: 'dist' }),
      /contains no HTML files/i,
    );

    const snapshotPath = path.join(fixture.projectRoot, 'fonts.catalog.json');
    const malformed = JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
    malformed.schemaVersion = 2;
    await fs.writeFile(snapshotPath, stableStringify(malformed));
    await fs.writeFile(path.join(dist, 'index.html'), '<html><body>测试</body></html>');
    await assert.rejects(
      () => auditFonts({ projectRoot: fixture.projectRoot, distDir: 'dist' }),
      /schemaVersion/i,
    );
  } finally {
    await fixture.close();
  }
});

test('font audit fails on a shard dropped by pruning, a dangling URL and an orphan shard', async () => {
  const core = makeFamilyFixture({ role: 'core-cjk', unicodeRange: ['U+4E00'] });
  const fixture = await setupPublishedFixture({ selected: [core] });
  try {
    await runUpdate(fixture);
    const dist = path.join(fixture.projectRoot, 'dist');
    const fontDir = path.join(dist, '_astro', 'fonts');
    await fs.mkdir(fontDir, { recursive: true });
    await fs.writeFile(path.join(fontDir, 'shard.woff2'), 'wOF2shard');
    const rule = (url) =>
      `@font-face{font-family:"Fixture-h";src:url("${url}") format("woff2");unicode-range:U+4E00;}`;
    const page = (css) =>
      `<html><head><style>${css}:root{--font-fixture:"Fixture-h"}</style></head><body>一</body></html>`;
    const audit = () => auditFonts({ projectRoot: fixture.projectRoot, distDir: 'dist' });

    // Pruning dropped every deployed rule although the source font covers U+4E00.
    await fs.writeFile(path.join(dist, 'index.html'), page(''));
    await assert.rejects(audit, /not by the deployed @font-face rules/i);

    // Dangling URL: the rule points at a shard that is not in dist.
    await fs.writeFile(path.join(dist, 'index.html'), page(rule('/_astro/fonts/missing.woff2')));
    await assert.rejects(audit, /@font-face URL\(s\) with no file/i);

    // Orphan: a shard exists but no deployed rule references it.
    await fs.writeFile(path.join(dist, 'index.html'), page(rule('/_astro/fonts/shard.woff2')));
    await fs.writeFile(path.join(fontDir, 'orphan.woff2'), 'wOF2orphan');
    await assert.rejects(audit, /unreferenced font file/i);

    // Removing the orphan makes the deployed set consistent again.
    await fs.rm(path.join(fontDir, 'orphan.woff2'));
    const report = await audit();
    assert.deepEqual(report.deployedGaps, []);
    assert.deepEqual(report.danglingFontUrls, []);
    assert.deepEqual(report.orphanFontFiles, []);
    assert.equal(report.deployed.fontFilesReferenced, 1);
    assert.deepEqual(report.uncovered, []);
  } finally {
    await fixture.close();
  }
});
