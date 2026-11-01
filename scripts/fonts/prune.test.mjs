import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { extractVisibleText } from './audit.mjs';
import {
  collectCorpus,
  decodeCssEscapes,
  decodeHtmlEntities,
  extractInlineStyles,
  extractLinkedLocalAssets,
  fontCssHrefPrefix,
  parseFontFaceRules,
  parseUnicodeRangeToken,
  resolveDistAsset,
  ruleIntersectsSortedCorpus,
  ruleKeepsCodePoint,
  sortedCorpus,
} from './lib/font-css.mjs';
import { SIZE_LIMIT_BYTES, pruneFonts } from './prune.mjs';

function fontFace({ family = 'Family-h', url, ranges, extra = '' } = {}) {
  const unicodeRange = ranges ? `unicode-range:${ranges};` : '';
  return `@font-face{font-family:"${family}";src:url("${url}") format("woff2");font-display:swap;${unicodeRange}${extra}font-weight:400;font-style:normal;}`;
}

function pageHtml({ rules = [], vars = {}, body = '', headExtra = '', lang = 'en' } = {}) {
  const variableCss = Object.entries(vars)
    .map(([name, value]) => `--font-${name}:"${value}";`)
    .join('');
  const style = `${rules.join('')}${variableCss ? `:root{${variableCss}}` : ''}`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">${headExtra}${
    style ? `<style>${style}</style>` : ''
  }</head><body>${body}</body></html>`;
}

async function makeProject() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'senrenbanka-font-prune-'));
  await fs.mkdir(path.join(root, 'dist'), { recursive: true });
  return root;
}

async function write(projectRoot, relativePath, content) {
  const filePath = path.join(projectRoot, ...relativePath.split('/'));
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
  return filePath;
}

async function writeFonts(projectRoot, urls, bytes = 'wOF2fixture') {
  for (const url of urls) {
    const relativePath = url.replace(/^\/?(?:demo\/)?/, '');
    await write(projectRoot, `dist/${relativePath}`, bytes);
  }
}

async function snapshotTree(root) {
  const entries = [];
  const visit = async (directory) => {
    for (const entry of (await fs.readdir(directory, { withFileTypes: true })).sort(
      (left, right) => (left.name < right.name ? -1 : 1),
    )) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(fullPath);
        continue;
      }
      const data = await fs.readFile(fullPath);
      entries.push({
        path: path.relative(root, fullPath).split(path.sep).join('/'),
        size: data.length,
        sha256: crypto.createHash('sha256').update(data).digest('hex'),
      });
    }
  };
  await visit(root);
  return entries;
}

async function read(projectRoot, relativePath) {
  return fs.readFile(path.join(projectRoot, ...relativePath.split('/')), 'utf8');
}

async function exists(projectRoot, relativePath) {
  try {
    await fs.stat(path.join(projectRoot, ...relativePath.split('/')));
    return true;
  } catch {
    return false;
  }
}

function stylesheetHrefs(html) {
  return [...html.matchAll(/<link rel="stylesheet" href="([^"]*)"/g)].map((match) => match[1]);
}

test('parseUnicodeRangeToken handles exact, ranged and wildcard tokens', () => {
  assert.deepEqual(parseUnicodeRangeToken('U+4E00'), [0x4e00, 0x4e00]);
  assert.deepEqual(parseUnicodeRangeToken('U+0102-0103'), [0x0102, 0x0103]);
  assert.deepEqual(parseUnicodeRangeToken('U+4??'), [0x400, 0x4ff]);
  assert.deepEqual(parseUnicodeRangeToken('u+30fb'), [0x30fb, 0x30fb]);
  assert.throws(() => parseUnicodeRangeToken('U+'), /invalid unicode range/);
  assert.throws(() => parseUnicodeRangeToken('U+110000'), /invalid unicode range/);
  assert.throws(() => parseUnicodeRangeToken('900-9FF'), /invalid unicode range/);
});

test('parseFontFaceRules extracts family, every url and unicode ranges', () => {
  const css = [
    '@font-face{font-family:"Shard Family-a1";src:url("/_astro/fonts/a.woff2") format("woff2"),url(\'/_astro/fonts/a.woff\') format("woff");unicode-range:U+4E00,U+4E01-4E03;font-weight:400;}',
    '@font-face{font-family:Unquoted;src:url(data:font/woff2;base64,AAA=),url(/_astro/fonts/b.woff2);}',
    '.x{color:red}',
  ].join('\n');
  const rules = parseFontFaceRules(css);
  assert.equal(rules.length, 2);
  assert.equal(rules[0].family, 'Shard Family-a1');
  assert.deepEqual(rules[0].urls, ['/_astro/fonts/a.woff2', '/_astro/fonts/a.woff']);
  assert.deepEqual(rules[0].ranges, [
    [0x4e00, 0x4e00],
    [0x4e01, 0x4e03],
  ]);
  assert.match(rules[0].raw, /^@font-face\{/);
  assert.equal(rules[1].family, 'Unquoted');
  assert.deepEqual(rules[1].urls, ['/_astro/fonts/b.woff2']);
  assert.equal(rules[1].ranges, null);
  assert.equal(ruleKeepsCodePoint(rules[1], 0x1f600), true);

  const noRange = parseFontFaceRules(fontFace({ url: '/_astro/fonts/c.woff2' }));
  assert.equal(noRange[0].ranges, null);
  assert.equal(ruleIntersectsSortedCorpus(noRange[0], []), true);
  assert.equal(ruleIntersectsSortedCorpus(rules[0], sortedCorpus(new Set([0x4e02]))), true);
  assert.equal(ruleIntersectsSortedCorpus(rules[0], sortedCorpus(new Set([0x4e04]))), false);
});

test('inline style and linked asset extraction ignore remote, data and commented blocks', () => {
  const html = [
    '<head>',
    '<link rel="stylesheet" href="/_astro/Page.a.css">',
    '<link rel="stylesheet" href="https://cdn.example.com/x.css">',
    '<link rel="stylesheet" href="//cdn.example.com/y.css">',
    '<link rel="icon" href="/favicon.svg">',
    '<script type="module" src="/_astro/app.b.js"></script>',
    '<script src="https://cdn.example.com/z.js"></script>',
    '<style>:root{--a:1}</style>',
    '<!-- <style>:root{--commented:1}</style> -->',
    '</head>',
  ].join('');
  assert.deepEqual(extractLinkedLocalAssets(html), ['/_astro/Page.a.css', '/_astro/app.b.js']);
  const styles = extractInlineStyles(html);
  assert.equal(styles.length, 1);
  assert.equal(styles[0].css, ':root{--a:1}');
  assert.equal(html.slice(styles[0].contentStart, styles[0].contentEnd), ':root{--a:1}');
});

test('corpus decoding covers HTML entities, attributes, inline JSON, CSS content and escapes', () => {
  const html = [
    '<html><head><style>',
    fontFace({ url: '/_astro/fonts/e.woff2', ranges: 'U+3001' }),
    fontFace({ url: '/_astro/fonts/f.woff2', ranges: 'U+30FB' }),
    fontFace({ url: '/_astro/fonts/g.woff2', ranges: 'U+3005' }),
    fontFace({ url: '/_astro/fonts/h.woff2', ranges: 'U+4E00' }),
    fontFace({ url: '/_astro/fonts/i.woff2', ranges: 'U+9F98' }),
    '</style><link rel="stylesheet" href="/_astro/Page.a.css"></head>',
    '<body><p aria-label="・">&#x3001;</p>',
    '<script type="application/json">{"label":"々"}</script>',
    '<p>\u3000</p></body></html>',
  ].join('');
  const linkedCss = '.x::after{content:"\\4E00"}';

  const entityCorpus = collectCorpus(decodeHtmlEntities(html));
  assert.equal(entityCorpus.has(0x3001), true);
  assert.equal(entityCorpus.has(0x30fb), true);
  assert.equal(entityCorpus.has(0x3005), true);
  assert.equal(entityCorpus.has(0x9f98), false);

  const corpus = collectCorpus(decodeCssEscapes(decodeHtmlEntities(html)));
  collectCorpus(decodeCssEscapes(linkedCss), corpus);
  assert.equal(corpus.has(0x4e00), true, 'CSS escape in a linked stylesheet is decoded');
  assert.equal(corpus.has(0x9f98), false, 'characters absent from every asset stay absent');

  assert.equal(decodeCssEscapes('.a::after{content:"\\30FB"}').includes('\u30fb'), true);
  assert.equal(decodeHtmlEntities('&#x3001;&#12289;&hellip;&bogus;'), '\u3001\u3001\u2026&bogus;');
});

test('prune keeps only intersecting rules, preserves other CSS and visible text', async () => {
  const projectRoot = await makeProject();
  const ruleA = fontFace({ url: '/_astro/fonts/kept.woff2', ranges: 'U+4E00' });
  const ruleB = fontFace({ url: '/_astro/fonts/dropped.woff2', ranges: 'U+9F98' });
  const html = pageHtml({
    rules: [ruleA, ruleB],
    vars: { lxgw: 'Family-h' },
    body: '<h1>一</h1><p>keep me</p>',
  });
  await write(projectRoot, 'dist/index.html', html);
  await writeFonts(projectRoot, ['/_astro/fonts/kept.woff2', '/_astro/fonts/dropped.woff2']);

  const report = await pruneFonts({ projectRoot, logger: () => {} });
  const output = await read(projectRoot, 'dist/index.html');
  assert.equal(output.includes('@font-face'), false);
  assert.equal(output.includes('U+9F98'), false);
  assert.equal(output.includes(':root{--font-lxgw:"Family-h";}'), true);
  assert.equal(extractVisibleText(output), extractVisibleText(html));
  assert.equal(report.pages[0].keptRules, 1);
  assert.equal(report.pages[0].removedRules, 1);
  assert.equal(report.visibleTextUnchanged, true);
  assert.equal(report.pages[0].visibleTextHash.length, 16);

  const css = await read(projectRoot, `dist/${report.pages[0].cssFile}`);
  assert.equal(css.includes('kept.woff2'), true);
  assert.equal(css.includes('dropped.woff2'), false);
  assert.equal(await exists(projectRoot, 'dist/_astro/fonts/kept.woff2'), true);
  assert.equal(await exists(projectRoot, 'dist/_astro/fonts/dropped.woff2'), false);
  assert.deepEqual(stylesheetHrefs(output), [`/${report.pages[0].cssFile}`]);

  // A `<style>` block whose only content was @font-face is removed entirely.
  const emptyStyleRoot = await makeProject();
  await write(emptyStyleRoot, 'dist/index.html', pageHtml({ rules: [ruleB], body: 'text' }));
  await writeFonts(emptyStyleRoot, ['/_astro/fonts/dropped.woff2']);
  await pruneFonts({ projectRoot: emptyStyleRoot, logger: () => {} });
  const emptyOutput = await read(emptyStyleRoot, 'dist/index.html');
  assert.equal(emptyOutput.includes('<style'), false);
  assert.deepEqual(stylesheetHrefs(emptyOutput), []);
});

test('shard keep set is site-wide: files used by any page survive, others are deleted', async () => {
  const projectRoot = await makeProject();
  await write(
    projectRoot,
    'dist/a/index.html',
    pageHtml({ rules: [fontFace({ url: '/_astro/fonts/a.woff2', ranges: 'U+4E00' })], body: '一' }),
  );
  await write(
    projectRoot,
    'dist/b/index.html',
    pageHtml({ rules: [fontFace({ url: '/_astro/fonts/b.woff2', ranges: 'U+4E01' })], body: '丁' }),
  );
  await writeFonts(projectRoot, [
    '/_astro/fonts/a.woff2',
    '/_astro/fonts/b.woff2',
    '/_astro/fonts/unused.woff2',
    '/_astro/fonts/unused.woff',
  ]);
  await write(projectRoot, 'dist/_astro/Page.keep.css', '.x{color:red}');

  const report = await pruneFonts({ projectRoot, logger: () => {} });
  assert.deepEqual(report.fonts.kept, ['_astro/fonts/a.woff2', '_astro/fonts/b.woff2']);
  assert.deepEqual(report.fonts.deleted, ['_astro/fonts/unused.woff', '_astro/fonts/unused.woff2']);
  assert.equal(await exists(projectRoot, 'dist/_astro/Page.keep.css'), true);
  assert.equal(await exists(projectRoot, 'dist/_astro/fonts/unused.woff2'), false);
});

test('pages with the same font families share one font CSS bundle, different families do not', async () => {
  const projectRoot = await makeProject();
  const zhRules = [
    fontFace({ url: '/_astro/fonts/latin.woff2', ranges: 'U+0000-00FF' }),
    fontFace({ url: '/_astro/fonts/cjk-shared.woff2', ranges: 'U+4E00' }),
  ];
  const jaRules = [
    fontFace({ url: '/_astro/fonts/latin.woff2', ranges: 'U+0000-00FF' }),
    fontFace({ url: '/_astro/fonts/cjk-shared.woff2', ranges: 'U+4E00' }),
    fontFace({ url: '/_astro/fonts/cjk-ja.woff2', ranges: 'U+3042' }),
  ];
  const otherRules = [
    fontFace({ family: 'Other-h', url: '/_astro/fonts/other.woff2', ranges: 'U+0041' }),
  ];
  await write(
    projectRoot,
    'dist/zh-cn/a/index.html',
    pageHtml({ rules: zhRules, vars: { a: 'Family-h' }, body: 'abc一' }),
  );
  await write(
    projectRoot,
    'dist/ja/a/index.html',
    pageHtml({ rules: jaRules, vars: { a: 'Family-h' }, body: 'abc一あ' }),
  );
  await write(
    projectRoot,
    'dist/en/other/index.html',
    pageHtml({ rules: otherRules, vars: { b: 'Other-h' }, body: 'A' }),
  );
  await writeFonts(projectRoot, [
    '/_astro/fonts/latin.woff2',
    '/_astro/fonts/cjk-shared.woff2',
    '/_astro/fonts/cjk-ja.woff2',
    '/_astro/fonts/other.woff2',
  ]);

  const report = await pruneFonts({ projectRoot, logger: () => {} });
  assert.equal(report.css.files.length, 2, 'one bundle per font-family set');
  const zhHref = stylesheetHrefs(await read(projectRoot, 'dist/zh-cn/a/index.html'))[0];
  const jaHref = stylesheetHrefs(await read(projectRoot, 'dist/ja/a/index.html'))[0];
  const otherHref = stylesheetHrefs(await read(projectRoot, 'dist/en/other/index.html'))[0];
  assert.equal(zhHref, jaHref);
  assert.notEqual(zhHref, otherHref);
  // The shared bundle carries the union so the Japanese shard is not lost.
  const bundleCss = await read(projectRoot, `dist/${zhHref.replace(/^\//, '')}`);
  assert.equal(bundleCss.includes('cjk-ja.woff2'), true);
  assert.equal(bundleCss.includes('@charset'), false);
  assert.equal(bundleCss.includes('<'), false);
});

test('prune preserves the build base prefix in font CSS links and font URLs', async () => {
  const projectRoot = await makeProject();
  await write(
    projectRoot,
    'dist/zh-cn/a/index.html',
    pageHtml({
      rules: [fontFace({ url: '/demo/_astro/fonts/a.woff2', ranges: 'U+4E00' })],
      vars: { a: 'Family-h' },
      body: '一',
    }),
  );
  await write(projectRoot, 'dist/_astro/fonts/a.woff2', 'wOF2demo');

  const report = await pruneFonts({ projectRoot, logger: () => {} });
  const href = stylesheetHrefs(await read(projectRoot, 'dist/zh-cn/a/index.html'))[0];
  assert.match(href, /^\/demo\/_astro\/fonts-[0-9a-f]{16}\.css$/);
  assert.match(report.pages[0].cssFile, /^_astro\/fonts-[0-9a-f]{16}\.css$/);
  assert.equal(await exists(projectRoot, `dist/${report.pages[0].cssFile}`), true);
  assert.equal(href, `/demo/${report.pages[0].cssFile}`);
  assert.equal(fontCssHrefPrefix('/demo/_astro/fonts/a.woff2'), '/demo/_astro/');
  assert.equal(fontCssHrefPrefix('/_astro/fonts/a.woff2'), '/_astro/');
  assert.throws(
    () => fontCssHrefPrefix('_astro/fonts/a.woff2'),
    /font CSS prefix must be an absolute site path/,
  );
});

test('--dry-run reports every decision without touching the tree', async () => {
  const projectRoot = await makeProject();
  await write(
    projectRoot,
    'dist/index.html',
    pageHtml({
      rules: [
        fontFace({ url: '/_astro/fonts/keep.woff2', ranges: 'U+4E00' }),
        fontFace({ url: '/_astro/fonts/drop.woff2', ranges: 'U+9F98' }),
      ],
      vars: { a: 'Family-h' },
      body: '一',
    }),
  );
  await writeFonts(projectRoot, ['/_astro/fonts/keep.woff2', '/_astro/fonts/drop.woff2']);
  await write(projectRoot, 'dist/_astro/Page.a.css', '.x{color:red}');
  const before = await snapshotTree(projectRoot);

  const report = await pruneFonts({ projectRoot, dryRun: true, logger: () => {} });
  assert.equal(report.dryRun, true);
  assert.deepEqual(await snapshotTree(projectRoot), before);
  assert.equal(await exists(projectRoot, '.cache/fonts/prune-report.json'), false);
  assert.equal(report.fonts.after.count, 1);
  assert.equal(report.fonts.deleted.length, 1);
  assert.equal(report.css.files.length, 1);
  assert.equal(report.size.totalBytes < before.reduce((sum, file) => sum + file.size, 0), true);
});

test('size guard fails above 10 MiB and passes below it', async () => {
  const overRoot = await makeProject();
  await write(
    overRoot,
    'dist/index.html',
    pageHtml({ rules: [fontFace({ url: '/_astro/fonts/a.woff2', ranges: 'U+4E00' })], body: '一' }),
  );
  await writeFonts(overRoot, ['/_astro/fonts/a.woff2']);
  await write(overRoot, 'dist/_astro/oversize.bin', Buffer.alloc(SIZE_LIMIT_BYTES + 1024, 0));
  await assert.rejects(
    () => pruneFonts({ projectRoot: overRoot, logger: () => {} }),
    /exceeds the 10485760-byte \(10 MiB\) budget/,
  );

  const underRoot = await makeProject();
  await write(
    underRoot,
    'dist/index.html',
    pageHtml({ rules: [fontFace({ url: '/_astro/fonts/a.woff2', ranges: 'U+4E00' })], body: '一' }),
  );
  await writeFonts(underRoot, ['/_astro/fonts/a.woff2']);
  const report = await pruneFonts({ projectRoot: underRoot, logger: () => {} });
  assert.equal(report.size.totalBytes <= SIZE_LIMIT_BYTES, true);
});

test('an already pruned dist is a no-op and a missing bundle is fatal', async () => {
  const projectRoot = await makeProject();
  await write(
    projectRoot,
    'dist/index.html',
    pageHtml({
      rules: [fontFace({ url: '/_astro/fonts/a.woff2', ranges: 'U+4E00' })],
      vars: { a: 'Family-h' },
      body: '一',
    }),
  );
  await writeFonts(projectRoot, ['/_astro/fonts/a.woff2']);
  const first = await pruneFonts({ projectRoot, logger: () => {} });
  const html = await read(projectRoot, 'dist/index.html');
  const before = (await snapshotTree(projectRoot)).filter((file) => file.path.startsWith('dist/'));
  assert.deepEqual(stylesheetHrefs(html).length, 1, 'one font link after the first prune');

  const second = await pruneFonts({ projectRoot, logger: () => {} });
  assert.equal(second.alreadyPruned, true);
  assert.equal(await read(projectRoot, 'dist/index.html'), html);
  assert.equal(stylesheetHrefs(html).length, 1, 'no duplicate font link');
  assert.deepEqual(
    (await snapshotTree(projectRoot)).filter((file) => file.path.startsWith('dist/')),
    before,
  );

  await fs.rm(path.join(projectRoot, 'dist', ...first.pages[0].cssFile.split('/')));
  await assert.rejects(
    () => pruneFonts({ projectRoot, logger: () => {} }),
    /font stylesheet is missing/,
  );
});

test('path traversal and remote font URLs are rejected', async () => {
  assert.throws(
    () => resolveDistAsset('/tmp/dist', '/index.html', '/../../etc/passwd'),
    /parent segment/,
  );
  assert.throws(
    () => resolveDistAsset('/tmp/dist', '/index.html', 'https://cdn.example.com/a.woff2'),
    /not a local path/,
  );
  assert.throws(
    () => resolveDistAsset('/tmp/dist', '/index.html', 'data:font/woff2;base64,AA'),
    /not a local path/,
  );

  const baseProject = await makeProject();
  await write(baseProject, 'dist/_astro/fonts/a.woff2', 'wOF2demo');
  const baseDist = path.join(baseProject, 'dist');
  const resolved = resolveDistAsset(baseDist, '/zh-cn/a/index.html', '/demo/_astro/fonts/a.woff2');
  assert.equal(resolved.relativePath, '_astro/fonts/a.woff2');
  assert.equal(resolved.basePrefix, '/demo');
  assert.equal(resolved.exists, true);

  const projectRoot = await makeProject();
  await write(
    projectRoot,
    'dist/index.html',
    pageHtml({
      rules: [fontFace({ url: '/../../escape.woff2', ranges: 'U+4E00' })],
      vars: { a: 'Family-h' },
      body: '一',
    }),
  );
  await write(projectRoot, 'escape.woff2', 'wOF2escape');
  await assert.rejects(() => pruneFonts({ projectRoot, logger: () => {} }), /parent segment/);
  assert.equal(await exists(projectRoot, 'escape.woff2'), true, 'nothing outside dist is deleted');
});

test('prune refuses to run on a missing or font-free dist', async () => {
  const projectRoot = await makeProject();
  await assert.rejects(
    () => pruneFonts({ projectRoot, logger: () => {} }),
    /contains no HTML files/,
  );
  await write(projectRoot, 'dist/index.html', pageHtml({ body: 'plain' }));
  await assert.rejects(
    () => pruneFonts({ projectRoot, logger: () => {} }),
    /neither inline @font-face rules nor external font CSS/,
  );
  await assert.rejects(
    () => pruneFonts({ projectRoot, distDir: 'missing-dist', logger: () => {} }),
    /Run astro build first/,
  );
});
