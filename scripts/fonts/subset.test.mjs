import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import * as fontkitten from 'fontkitten';
import { extractVisibleText } from './audit.mjs';
import { sha256, stableStringify } from './lib/json.mjs';
import { PROJECT_ROOT, sourceCacheRelativePath } from './lib/paths.mjs';
import { prepareFonts } from './prepare.mjs';
import { updateFonts } from './update.mjs';
import { buildCorpus, subsetCoreFonts } from './subset.mjs';

const FIXTURE_VERSION = '1.0.0';
const PROJECT_ROOT_PATH = fileURLToPath(new URL('../../', import.meta.url));
const REAL_LATIN_FONT = path.join(
  PROJECT_ROOT_PATH,
  'node_modules',
  '@fontsource-variable',
  'inter',
  'files',
  'inter-latin-wght-normal.woff2',
);
const REAL_CORE_SOURCES = [
  path.join(PROJECT_ROOT_PATH, '.cache', 'font-sources', '1.0.0', 'lxgw-wenkai@1.0.0', 'source', 'fonts', 'LXGWWenKaiGB-Medium.ttf'),
  path.join(PROJECT_ROOT_PATH, '.cache', 'font-sources', '1.0.0', 'zhuque-fangsong@1.0.0', 'source', 'fonts', 'ZhuqueFangsong-Regular.ttf'),
  path.join(PROJECT_ROOT_PATH, '.cache', 'font-sources', '1.0.0', 'ark-pixel-12px@1.0.0', 'source', 'fonts', 'ark-pixel-12px-monospaced-zh_hans.otf'),
];

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

/** Tiny stand-in for the deployed shards: only the WOFF2 magic matters here. */
function fakeShard(label) {
  return Buffer.concat([
    Buffer.from('wOF2', 'ascii'),
    crypto.createHash('sha256').update(`shard:${label}`).digest(),
    Buffer.alloc(64, 0),
  ]);
}

function makeSourceArchive({ id, sourceFont }) {
  const sourceFiles = [{ name: `${id}-source.woff2`, data: sourceFont }];
  const licenseFiles = [{ name: 'LICENSE.txt', data: Buffer.from(`Fixture source license for ${id}\n`) }];
  const sourceManifest = {
    schemaVersion: 1,
    kind: 'source',
    id,
    version: FIXTURE_VERSION,
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
  const bytes = createTarGz([
    { path: 'source-manifest.json', data: Buffer.from(stableStringify(sourceManifest)) },
    ...sourceFiles.map((file) => ({ path: `source/fonts/${file.name}`, data: file.data })),
    ...licenseFiles.map((file) => ({ path: `source/licenses/${file.name}`, data: file.data })),
  ]);
  return { id, version: FIXTURE_VERSION, bytes, sourceManifest, sourceFiles, licenseFiles };
}

/**
 * A published fixture family: one production package (shard-shaped WOFF2) plus
 * one source archive that carries a real, subsettable font.
 */
function makeFamilyFixture({ id, role = 'core-cjk', weights = ['400'], sourceFont }) {
  const familyName = `Fixture ${id}`;
  const archiveFileName = `${id}-v${FIXTURE_VERSION}-source.tar.gz`;
  const archive = makeSourceArchive({ id, sourceFont });
  const variants = weights.map((weight) => {
    const bytes = fakeShard(`${id}:${weight}`);
    return {
      file: `fonts/${id}-${weight}-normal.woff2`,
      bytes,
      variant: {
        file: `fonts/${id}-${weight}-normal.woff2`,
        sha256: sha256(bytes),
        size: bytes.length,
        weight,
        style: 'normal',
        display: 'swap',
        unicodeRange: ['U+4E00'],
        font: {
          familyName,
          subfamilyName: 'Regular',
          postscriptName: `Fixture${id.replace(/-/g, '')}${weight}`,
          format: 'WOFF2',
          weight: Number(weight),
          widthClass: 5,
          italicAngle: 0,
          coverageCount: 1,
          variationAxes: {},
        },
      },
    };
  });
  const manifest = {
    schemaVersion: 1,
    kind: 'family',
    id,
    familyName,
    sourceFamilyName: familyName,
    role,
    version: FIXTURE_VERSION,
    cssVariable: `--font-${id}`,
    fallbacks: ['serif'],
    buildTools: { cnFontSplit: 'fixture', fontkitten: 'fixture', schema: 1 },
    source: {
      archiveFileName,
      files: archive.sourceFiles.map((file) => ({
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
      files: archive.licenseFiles.map((file) => ({
        file: `licenses/${file.name}`,
        sha256: sha256(file.data),
        size: file.data.length,
      })),
      reservedFontNames: [],
      rfn: { status: 'not-applicable', basis: 'Fixture has no reserved font names.' },
    },
    css: 'font.css',
    variants: variants.map((entry) => entry.variant),
  };
  const packageBytes = createTarGz([
    { path: 'manifest.json', data: Buffer.from(stableStringify(manifest)) },
    {
      path: 'font.css',
      data: Buffer.from(`@font-face{font-family:"${familyName}";src:url("./fonts/x.woff2")}\n`),
    },
    ...variants.map((entry) => ({ path: entry.file, data: entry.bytes })),
    ...manifest.license.files.map((file) => ({
      path: file.file,
      data: archive.licenseFiles.find((license) => `licenses/${license.name}` === file.file).data,
    })),
  ]);
  return {
    id,
    role,
    manifest,
    packageBytes,
    packageFileName: `${id}-v${FIXTURE_VERSION}.tar.gz`,
    releaseTag: `font-${id}-v${FIXTURE_VERSION}`,
    source: {
      releaseTag: `font-${id}-v${FIXTURE_VERSION}`,
      fileName: archiveFileName,
      sha256: sha256(archive.bytes),
      size: archive.bytes.length,
    },
    sourceArchive: archive,
  };
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
    requests,
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  };
}

/**
 * Published catalog + lock + generated registration + prepared caches for the
 * given families, so `subsetCoreFonts` runs against a real, validated state.
 */
async function setupFontProject({ families }) {
  const routes = {};
  const server = await startHttpServer(routes);
  const catalogFamilies = {};
  for (const family of families) {
    catalogFamilies[family.id] = {
      version: FIXTURE_VERSION,
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
    routes[`/${family.source.releaseTag}/${family.source.fileName}`] = family.sourceArchive.bytes;
  }
  const catalogBytes = Buffer.from(
    stableStringify({
      schemaVersion: 1,
      catalogVersion: FIXTURE_VERSION,
      baseUrl: server.baseUrl,
      families: catalogFamilies,
    }),
  );
  routes['/catalog.json'] = catalogBytes;
  const projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'senrenbanka-font-subset-'));
  await fs.writeFile(
    path.join(projectRoot, 'fonts.config.json'),
    stableStringify({
      schemaVersion: 1,
      baseUrl: server.baseUrl,
      families: families.map((family) => ({
        id: family.id,
        name: family.manifest.familyName,
        cssVariable: family.manifest.cssVariable,
        fallbacks: family.manifest.fallbacks,
      })),
    }),
  );
  await updateFonts({
    projectRoot,
    catalogUrl: `${server.baseUrl}/catalog.json`,
    catalogSha256: sha256(catalogBytes),
  });
  await prepareFonts({ projectRoot, logger: () => {} });
  return {
    projectRoot,
    requests: server.requests,
    close: async () => {
      await server.close();
      await fs.rm(projectRoot, { recursive: true, force: true });
    },
  };
}

async function write(projectRoot, relativePath, content) {
  const filePath = path.join(projectRoot, ...relativePath.split('/'));
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
  return filePath;
}

async function read(projectRoot, relativePath) {
  return fs.readFile(path.join(projectRoot, ...relativePath.split('/')), 'utf8');
}

function fontFace({ family, url, ranges = null, weight = '400', style = 'normal' }) {
  const unicodeRange = ranges ? `unicode-range:${ranges};` : '';
  return `@font-face{font-family:"${family}";src:url("${url}") format("woff2");font-display:swap;${unicodeRange}font-weight:${weight};font-style:${style};}`;
}

function pageHtml({ styles, body, lang = 'zh-CN' }) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">${styles.map((css) => `<style>${css}</style>`).join('')}</head><body>${body}</body></html>`;
}

async function snapshotTree(root) {
  const entries = [];
  const visit = async (directory) => {
    const names = (await fs.readdir(directory, { withFileTypes: true })).sort((left, right) =>
      left.name < right.name ? -1 : 1,
    );
    for (const entry of names) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(fullPath);
        continue;
      }
      const data = await fs.readFile(fullPath);
      entries.push({
        path: path.relative(root, fullPath).split(path.sep).join('/'),
        size: data.length,
        sha256: sha256(data),
      });
    }
  };
  await visit(root);
  return entries;
}

function coreFamilyNames(html, family) {
  return [...html.matchAll(/@font-face\{font-family:([^;]*);src:url\("([^"]*)"\)([^}]*)\}/g)]
    .filter((match) => (match[1] ?? '').includes(family))
    .map((match) => ({
      family: match[1],
      url: match[2],
      body: match[3],
      raw: match[0],
    }));
}

/** Builds the standard two-page dist used by most of the rewrite assertions. */
async function writeDist(projectRoot, { coreName, base = '', shardUrls = [] } = {}) {
  const [first, second] = shardUrls;
  const coreCss = [
    fontFace({ family: coreName, url: `${base}/_astro/fonts/${first}`, ranges: 'U+4E00-4E05', weight: '500' }),
    fontFace({ family: coreName, url: `${base}/_astro/fonts/${second}`, ranges: 'U+4E10', weight: '500' }),
    `:root{--font-fixture-core:"${coreName}";}`,
  ].join('');
  const otherCss = `@font-face{font-family:"Other-h";src:url("${base}/_astro/fonts/other.woff2") format("woff2");font-display:swap;font-weight:400;font-style:normal;}.hero{color:red}`;
  await write(
    projectRoot,
    'dist/zh-cn/a/index.html',
    pageHtml({
      styles: [otherCss, coreCss],
      body: '<h1 class="hero">Hello 世界</h1><p>Subset corpus text</p>',
    }),
  );
  await write(
    projectRoot,
    'dist/en/plain/index.html',
    pageHtml({ styles: [otherCss], body: '<p>Latin only</p>', lang: 'en' }),
  );
  for (const name of [first, second, 'other.woff2']) {
    await write(projectRoot, `dist/_astro/fonts/${name}`, fakeShard(name));
  }
  return {
    coreCss,
    pagePath: 'dist/zh-cn/a/index.html',
    plainPath: 'dist/en/plain/index.html',
  };
}

test('subset corpus decodes entities, CSS escapes, attributes and every text asset', async () => {
  const projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'senrenbanka-subset-corpus-'));
  try {
    await write(
      projectRoot,
      'dist/index.html',
      [
        '<!doctype html><html><head><style>.x::after{content:"\\4E00"}</style>',
        '<link rel="stylesheet" href="/_astro/Page.a.css"><script src="/_astro/app.js"></script>',
        '</head><body><p aria-label="・">&#x3001; &hellip;</p>',
        '<noscript><template data-label="々">一</template></noscript>',
        '<script type="application/json">{"label":"\\30FB"}</script></body></html>',
      ].join(''),
    );
    await write(projectRoot, 'dist/_astro/Page.a.css', '.y::after{content:"\\9F98"}');
    await write(projectRoot, 'dist/_astro/app.js', 'const label = "\\30A1";');
    await write(projectRoot, 'dist/robots.txt', 'text \u3007');
    await write(projectRoot, 'dist/site.webmanifest', '{"name":"\u4E09"}');
    await write(projectRoot, 'dist/icon.svg', '<svg><text>\u56DB</text></svg>');
    // Binary assets must never enter the corpus, even if the bytes look like text.
    const binaryMarker = 0x1f600;
    const fontBinaryMarker = 0x1f601;
    await write(
      projectRoot,
      'dist/_astro/image.png',
      Buffer.from(`${String.fromCodePoint(binaryMarker)}png-binary`, 'utf8'),
    );
    await write(
      projectRoot,
      'dist/_astro/fonts/lxgw-wenkai-subset-0000000000000000.woff2',
      Buffer.from(`${String.fromCodePoint(fontBinaryMarker)}font-binary`, 'utf8'),
    );

    const corpus = await buildCorpus(path.join(projectRoot, 'dist'));
    const codePoints = new Set([...corpus.text].map((character) => character.codePointAt(0)));
    for (const [character, source] of [
      ['\u3001', 'HTML entity'],
      ['\u2026', 'named HTML entity'],
      ['\u30fb', 'attribute value and inline JSON escape'],
      ['\u3005', 'template attribute value'],
      ['\u4e00', 'CSS escape inside a <style> block'],
      ['\u9f98', 'CSS escape inside a linked stylesheet'],
      ['\u30a1', 'CSS-style escape inside a linked script'],
      ['\u3007', 'plain text asset'],
      ['\u4e09', 'webmanifest JSON'],
      ['\u56db', 'SVG text'],
    ]) {
      assert.equal(codePoints.has(character.codePointAt(0)), true, `${source} must be collected`);
    }
    assert.equal(codePoints.has(0x9f98), true, 'the escape decodes to its character');
    assert.equal(codePoints.has(binaryMarker), false, 'binary assets stay out of the corpus');
    assert.equal(codePoints.has(fontBinaryMarker), false, 'font binaries stay out of the corpus');
    assert.equal(corpus.textFiles, 6);
    assert.equal(corpus.sha256.length, 64);
    await assert.rejects(
      () => buildCorpus(path.join(projectRoot, 'dist/index.html')),
      /ENOTDIR|not a directory/i,
    );
  } finally {
    await fs.rm(projectRoot, { recursive: true, force: true });
  }
});

test('subset rewrites core shard rules into one range-free rule per page', async () => {
  const family = makeFamilyFixture({
    id: 'fixture-core',
    sourceFont: await fs.readFile(REAL_LATIN_FONT),
  });
  const project = await setupFontProject({ families: [family] });
  try {
    const coreName = 'Fixture fixture-core-abcdef';
    const dist = await writeDist(project.projectRoot, {
      coreName,
      shardUrls: ['shard-a.woff2', 'shard-b.woff2'],
    });
    const original = await read(project.projectRoot, dist.pagePath);
    const plainOriginal = await read(project.projectRoot, dist.plainPath);

    const report = await subsetCoreFonts({ projectRoot: project.projectRoot, logger: () => {} });
    assert.equal(report.schemaVersion, 2);
    assert.equal(report.corpusScope, 'per-family');
    assert.equal(report.families.length, 1);
    const [entry] = report.families;
    assert.equal(entry.id, 'fixture-core');
    assert.equal(entry.corpus, 'page-scope');
    assert.equal(entry.corpusPages, 1);
    assert.equal(entry.corpusCodePoints > 0, true);
    assert.equal(entry.corpusSha256.length, 64);
    assert.equal(report.sharedCorpus.textFiles, 0);
    assert.match(entry.subsetFile, /^_astro\/fonts\/fixture-core-subset-[0-9a-f]{16}\.woff2$/);
    assert.equal(entry.subsetSha256.length, 64);
    assert.equal(entry.subsetBytes > 0, true);
    assert.equal(entry.characters > 0, true);
    assert.equal(entry.weight, '400');
    assert.match(entry.sourceFile, /^\.cache\/font-sources\/1\.0\.0\/fixture-core@1\.0\.0\//);
    assert.equal(report.corpusCodePoints > 0, true);
    assert.equal(report.corpusSha256.length, 64);
    assert.equal(report.subsetter.name, 'subset-font');
    assert.equal(report.subsetter.version, '2.9.0');

    const subsetPath = path.join(
      project.projectRoot,
      'dist',
      ...entry.subsetFile.split('/'),
    );
    const subsetBytes = await fs.readFile(subsetPath);
    assert.equal(subsetBytes.subarray(0, 4).toString('ascii'), 'wOF2');
    assert.equal(sha256(subsetBytes), entry.subsetSha256);
    assert.equal(subsetBytes.length, entry.subsetBytes);
    const subsetFont = fontkitten.create(subsetBytes);
    for (const character of 'Hello Subset corpus text') {
      assert.equal(
        subsetFont.hasGlyphForCodePoint(character.codePointAt(0)),
        true,
        `subset must keep ${JSON.stringify(character)} from the page text`,
      );
    }

    const output = await read(project.projectRoot, dist.pagePath);
    assert.equal(output.includes('shard-a.woff2'), false, 'shard URL removed');
    assert.equal(output.includes('shard-b.woff2'), false, 'second shard URL removed');
    const coreRules = coreFamilyNames(output, 'fixture-core');
    assert.equal(coreRules.length, 1, 'exactly one synthetic rule per core family');
    assert.equal(coreRules[0].family, `"${coreName}"`);
    assert.equal(
      coreRules[0].url,
      `/_astro/fonts/${entry.subsetFile.split('/').pop()}`,
      'rule points at the subset file',
    );
    assert.match(coreRules[0].raw, /format\("woff2"\)/);
    assert.match(coreRules[0].raw, /font-weight:400;/);
    assert.match(coreRules[0].raw, /font-style:normal;/);
    assert.match(coreRules[0].raw, /font-display:swap;/);
    assert.equal(/unicode-range/.test(coreRules[0].raw), false, 'no unicode-range on the subset');
    assert.equal(
      output.includes(`:root{--font-fixture-core:"${coreName}";}`),
      true,
      'CSS variables are preserved',
    );
    assert.equal(output.includes('.hero{color:red}'), true, 'other CSS is preserved');
    assert.equal(output.includes('Other-h'), true, 'non-core font rules are preserved');
    assert.equal(extractVisibleText(output), extractVisibleText(original), 'visible text unchanged');
    assert.equal(await read(project.projectRoot, dist.plainPath), plainOriginal, 'unused page untouched');

    const pages = new Map(report.pages.map((page) => [page.path, page]));
    assert.deepEqual(pages.get('/zh-cn/a/').coreFamilies, ['fixture-core']);
    assert.equal(pages.get('/zh-cn/a/').shardRules, 2);
    assert.equal(pages.get('/zh-cn/a/').changed, true);
    assert.deepEqual(pages.get('/en/plain/').coreFamilies, []);
    assert.equal(pages.get('/en/plain/').changed, false);

    const reportPath = path.join(project.projectRoot, '.cache', 'fonts', 'subset-report.json');
    const written = JSON.parse(await fs.readFile(reportPath, 'utf8'));
    assert.equal(written.corpusSha256, report.corpusSha256);
    assert.equal(written.families[0].subsetSha256, entry.subsetSha256);
    assert.equal(written.families[0].subsetFile, entry.subsetFile);

    // Idempotence: a second run must not duplicate the synthetic rule.
    const second = await subsetCoreFonts({ projectRoot: project.projectRoot, logger: () => {} });
    assert.equal(second.families[0].subsetSha256, entry.subsetSha256, 'same input, same hash');
    assert.equal(await read(project.projectRoot, dist.pagePath), output, 'already subset is a no-op');
    assert.equal(
      second.pages.find((page) => page.path === '/zh-cn/a/').changed,
      false,
      'already subset page reports no change',
    );
  } finally {
    await project.close();
  }
});

test('subset preserves the build base prefix in the synthetic rule URL', async () => {
  const family = makeFamilyFixture({
    id: 'fixture-core',
    sourceFont: await fs.readFile(REAL_LATIN_FONT),
  });
  const project = await setupFontProject({ families: [family] });
  try {
    const coreName = 'Fixture fixture-core-abcdef';
    const dist = await writeDist(project.projectRoot, {
      coreName,
      base: '/demo',
      shardUrls: ['shard-a.woff2', 'shard-b.woff2'],
    });
    const report = await subsetCoreFonts({ projectRoot: project.projectRoot, logger: () => {} });
    const output = await read(project.projectRoot, dist.pagePath);
    const [rule] = coreFamilyNames(output, 'fixture-core');
    assert.equal(
      rule.url,
      `/demo/_astro/fonts/${report.families[0].subsetFile.split('/').pop()}`,
      'subset URL keeps the /demo base prefix',
    );
    assert.equal(output.includes('/_astro/fonts/shard-a.woff2'), false);
    assert.equal(
      report.pages.find((page) => page.path === '/zh-cn/a/').coreFamilies.includes('fixture-core'),
      true,
    );
  } finally {
    await project.close();
  }
});

test('subset --dry-run reports the plan and writes nothing', async () => {
  const family = makeFamilyFixture({
    id: 'fixture-core',
    sourceFont: await fs.readFile(REAL_LATIN_FONT),
  });
  const project = await setupFontProject({ families: [family] });
  try {
    const coreName = 'Fixture fixture-core-abcdef';
    await writeDist(project.projectRoot, {
      coreName,
      shardUrls: ['shard-a.woff2', 'shard-b.woff2'],
    });
    const before = await snapshotTree(project.projectRoot);
    const report = await subsetCoreFonts({
      projectRoot: project.projectRoot,
      dryRun: true,
      logger: () => {},
    });
    assert.equal(report.dryRun, true);
    assert.equal(report.families.length, 1);
    assert.equal(report.families[0].subsetBytes > 0, true);
    assert.deepEqual(await snapshotTree(project.projectRoot), before, 'dry-run writes nothing');
    assert.equal(
      await fs
        .stat(path.join(project.projectRoot, '.cache', 'fonts', 'subset-report.json'))
        .then(() => true)
        .catch(() => false),
      false,
      'dry-run writes no report',
    );
    assert.equal(
      report.pages.find((page) => page.path === '/zh-cn/a/').changed,
      true,
      'dry-run still reports the planned rewrite',
    );
  } finally {
    await project.close();
  }
});

test('subset fails clearly when the core source cache is missing or unrepaired', async () => {
  const family = makeFamilyFixture({
    id: 'fixture-core',
    sourceFont: await fs.readFile(REAL_LATIN_FONT),
  });
  const project = await setupFontProject({ families: [family] });
  try {
    await writeDist(project.projectRoot, {
      coreName: 'Fixture fixture-core-abcdef',
      shardUrls: ['shard-a.woff2', 'shard-b.woff2'],
    });
    const sourceRoot = path.join(
      project.projectRoot,
      ...sourceCacheRelativePath(FIXTURE_VERSION, 'fixture-core', FIXTURE_VERSION).split('/'),
    );
    await fs.rm(sourceRoot, { recursive: true, force: true });
    await assert.rejects(
      () => subsetCoreFonts({ projectRoot: project.projectRoot, logger: () => {} }),
      /core font source cache is missing for fixture-core.*npm run fonts:prepare/s,
    );

    // A tampered source font must not silently produce a subset.
    await prepareFonts({ projectRoot: project.projectRoot, logger: () => {} });
    const fontPath = path.join(sourceRoot, 'source', 'fonts', 'fixture-core-source.woff2');
    const original = await fs.readFile(fontPath);
    await fs.writeFile(fontPath, Buffer.concat([original, Buffer.from('x')]));
    await assert.rejects(
      () => subsetCoreFonts({ projectRoot: project.projectRoot, logger: () => {} }),
      /Run npm run fonts:prepare/s,
    );
  } finally {
    await project.close();
  }
});

test('subset refuses a core family with more than one face', async () => {
  const family = makeFamilyFixture({
    id: 'fixture-core',
    weights: ['400', '500'],
    sourceFont: await fs.readFile(REAL_LATIN_FONT),
  });
  const project = await setupFontProject({ families: [family] });
  try {
    await writeDist(project.projectRoot, {
      coreName: 'Fixture fixture-core-abcdef',
      shardUrls: ['shard-a.woff2', 'shard-b.woff2'],
    });
    await assert.rejects(
      () => subsetCoreFonts({ projectRoot: project.projectRoot, logger: () => {} }),
      /declares 2 distinct faces/,
    );
  } finally {
    await project.close();
  }
});

test('subset refuses an already pruned dist instead of orphaning a subset file', async () => {
  const family = makeFamilyFixture({
    id: 'fixture-core',
    sourceFont: await fs.readFile(REAL_LATIN_FONT),
  });
  const project = await setupFontProject({ families: [family] });
  try {
    await write(
      project.projectRoot,
      'dist/index.html',
      pageHtml({
        styles: [':root{--font-fixture-core:"Fixture fixture-core-abcdef";}'],
        body: '<p>Hello</p>',
      }),
    );
    await write(project.projectRoot, 'dist/_astro/fonts-0123456789abcdef.css', '.x{color:red}');
    const html = await read(project.projectRoot, 'dist/index.html');
    await write(
      project.projectRoot,
      'dist/index.html',
      html.replace(
        '</head>',
        '<link rel="stylesheet" href="/_astro/fonts-0123456789abcdef.css"></head>',
      ),
    );
    await assert.rejects(
      () => subsetCoreFonts({ projectRoot: project.projectRoot, logger: () => {} }),
      /already has externalized font CSS/,
    );

    await write(
      project.projectRoot,
      'dist/index.html',
      pageHtml({ styles: [':root{--nope:1}'], body: '<p>Hello</p>' }),
    );
    const noCore = await subsetCoreFonts({ projectRoot: project.projectRoot, logger: () => {} });
    assert.equal(noCore.families.length, 0);
    assert.equal(noCore.subsetFileCount, 0);
    await assert.rejects(
      () => subsetCoreFonts({ projectRoot: project.projectRoot, distDir: 'missing-dist' }),
      /Run astro build first/,
    );
  } finally {
    await project.close();
  }
});

test(
  'subset of the seeded CJK source cache covers the CJK text of a page',
  {
    skip: REAL_CORE_SOURCES.every((file) => existsSync(file))
      ? false
      : 'run npm run fonts:prepare to seed .cache/font-sources for the real core coverage check',
  },
  async () => {
    const distRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'senrenbanka-subset-cjk-'));
    try {
      const coreName = 'LXGW WenKai GB-realhash';
      await write(
        distRoot,
        'zh-cn/a/index.html',
        pageHtml({
          styles: [
            fontFace({ family: coreName, url: '/_astro/fonts/real-a.woff2', ranges: 'U+4E00', weight: '500' }),
            fontFace({ family: coreName, url: '/_astro/fonts/real-b.woff2', ranges: 'U+4E8C', weight: '500' }),
            `:root{--font-lxgw:"${coreName}";}`,
          ],
          body: '<h1>世界 一二三</h1><p>日本語のテキスト</p>',
        }),
      );
      await write(distRoot, '_astro/fonts/real-a.woff2', fakeShard('real-a'));
      await write(distRoot, '_astro/fonts/real-b.woff2', fakeShard('real-b'));

      const report = await subsetCoreFonts({
        projectRoot: PROJECT_ROOT,
        distDir: distRoot,
        reportPath: path.join(distRoot, 'subset-report.json'),
        logger: () => {},
      });
      const lxgw = report.families.find((family) => family.id === 'lxgw-wenkai');
      assert.ok(lxgw, 'lxgw-wenkai subset generated');
      assert.equal(lxgw.subsetBytes < 1024 * 1024, true, 'a content subset stays small');
      const subsetFont = fontkitten.create(
        await fs.readFile(path.join(distRoot, ...lxgw.subsetFile.split('/'))),
      );
      for (const character of '世界一二三日本語のテキスト') {
        assert.equal(
          subsetFont.hasGlyphForCodePoint(character.codePointAt(0)),
          true,
          `subset must keep ${character}`,
        );
      }
      const output = await read(distRoot, 'zh-cn/a/index.html');
      const rules = coreFamilyNames(output, 'LXGW WenKai GB');
      const lxgwRules = rules.filter((rule) => rule.family === `"${coreName}"`);
      assert.equal(lxgwRules.length, 1);
      assert.equal(lxgwRules[0].url, `/_astro/fonts/${lxgw.subsetFile.split('/').pop()}`);
    } finally {
      await fs.rm(distRoot, { recursive: true, force: true });
    }
  },
);

test('subset scopes each core family to the pages that reference it', async () => {
  const sourceFont = await fs.readFile(REAL_LATIN_FONT);
  const families = ['a', 'b', 'c'].map((suffix) =>
    makeFamilyFixture({ id: `fixture-core-${suffix}`, sourceFont }),
  );
  const project = await setupFontProject({ families });
  try {
    const names = {
      a: 'Fixture fixture-core-a-aaaaaa',
      b: 'Fixture fixture-core-b-bbbbbb',
      c: 'Fixture fixture-core-c-cccccc',
    };
    const page = (suffix, body) =>
      pageHtml({
        styles: [
          fontFace({ family: names[suffix], url: `/_astro/fonts/${suffix}.woff2`, ranges: 'U+4E00' }),
          `:root{--font-fixture-core-${suffix}:"${names[suffix]}";}`,
        ],
        body,
      });
    await write(project.projectRoot, 'dist/zh-cn/a/index.html', page('a', '<p>QQQQ</p>'));
    await write(project.projectRoot, 'dist/zh-cn/b/index.html', page('b', '<p>ZZZZ</p>'));
    await write(project.projectRoot, 'dist/_astro/fonts/a.woff2', fakeShard('a'));
    await write(project.projectRoot, 'dist/_astro/fonts/b.woff2', fakeShard('b'));

    const report = await subsetCoreFonts({ projectRoot: project.projectRoot, logger: () => {} });
    assert.equal(report.schemaVersion, 2);
    assert.equal(report.corpusScope, 'per-family');
    assert.equal(report.families.length, 2, 'a core family with no referencing page is skipped');
    const byId = new Map(report.families.map((entry) => [entry.id, entry]));
    assert.equal(byId.get('fixture-core-a').corpusPages, 1);
    assert.equal(byId.get('fixture-core-b').corpusPages, 1);
    assert.equal(byId.has('fixture-core-c'), false);

    const subsetPath = (id) =>
      path.join(project.projectRoot, 'dist', ...byId.get(id).subsetFile.split('/'));
    const fontA = fontkitten.create(await fs.readFile(subsetPath('fixture-core-a')));
    const fontB = fontkitten.create(await fs.readFile(subsetPath('fixture-core-b')));
    assert.equal(fontA.hasGlyphForCodePoint('Q'.codePointAt(0)), true);
    assert.equal(fontA.hasGlyphForCodePoint('Z'.codePointAt(0)), false, 'page B text stays out of A');
    assert.equal(fontB.hasGlyphForCodePoint('Z'.codePointAt(0)), true);
    assert.equal(fontB.hasGlyphForCodePoint('Q'.codePointAt(0)), false, 'page A text stays out of B');

    const fontDirectory = path.join(project.projectRoot, 'dist', '_astro', 'fonts');
    const files = await fs.readdir(fontDirectory);
    assert.equal(
      files.some((file) => file.startsWith('fixture-core-c-subset-')),
      false,
      'no subset file is emitted for an unreferenced core',
    );

    const beforeA = await read(project.projectRoot, 'dist/zh-cn/a/index.html');
    const beforeB = await read(project.projectRoot, 'dist/zh-cn/b/index.html');
    const second = await subsetCoreFonts({ projectRoot: project.projectRoot, logger: () => {} });
    assert.equal(second.families.length, 2);
    assert.equal(await read(project.projectRoot, 'dist/zh-cn/a/index.html'), beforeA);
    assert.equal(await read(project.projectRoot, 'dist/zh-cn/b/index.html'), beforeB);
  } finally {
    await project.close();
  }
});
