import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const verifier = path.join(projectRoot, 'scripts', 'verify-html-only.mjs');
const config = parseYaml(
  fs.readFileSync(path.join(projectRoot, 'src', 'data', 'site.config.yaml'), 'utf8'),
);
const localePaths = config.i18n.locales.map((locale) => locale.path);
const htmlOnlyDesignIds = fs
  .readdirSync(path.join(projectRoot, 'src', 'designs'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
  .flatMap((entry) => {
    const manifestPath = path.join(projectRoot, 'src', 'designs', entry.name, 'design.json');
    if (!fs.existsSync(manifestPath)) return [];
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return manifest.renderMode === 'html-only' ? [entry.name] : [];
  })
  .sort();

const validHtml =
  '<!doctype html><html lang="zh-CN"><head>' +
  '<link rel="canonical" href="/zh-cn/html-only/"></head>' +
  '<body><a href="https://example.com/">ok</a></body></html>';

function runProbe(html) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'senrenbanka-html-only-test-'));

  try {
    for (const designId of htmlOnlyDesignIds) {
      for (const localePath of localePaths) {
        const targetDirectory = path.join(root, localePath, designId);
        fs.mkdirSync(targetDirectory, { recursive: true });
        fs.writeFileSync(
          path.join(targetDirectory, 'index.html'),
          designId === htmlOnlyDesignIds[0] && localePath === localePaths[0] ? html : validHtml,
          'utf8',
        );
      }
    }

    const result = spawnSync(process.execPath, [verifier, '--dist', root], {
      cwd: projectRoot,
      encoding: 'utf8',
    });
    return {
      status: result.status,
      stderr: result.stderr,
      stdout: result.stdout,
    };
  } finally {
    const tempRoot = path.resolve(os.tmpdir());
    const resolvedRoot = path.resolve(root);
    if (
      path.dirname(resolvedRoot) === tempRoot &&
      path.basename(resolvedRoot).startsWith('senrenbanka-html-only-test-')
    ) {
      fs.rmSync(resolvedRoot, { recursive: true, force: true });
    }
  }
}

test('accepts a clean html-only artifact set', () => {
  const result = runProbe(validHtml);
  assert.equal(result.status, 0, result.stderr);
});

test('does not treat markup-like text in textarea as a script tag', () => {
  const result = runProbe(
    validHtml.replace(
      '<body>',
      '<body><textarea>literal <script>alert(1)</script> text</textarea>',
    ),
  );
  assert.equal(result.status, 0, result.stderr);
});

test('does not treat markup-like text in title as a script tag', () => {
  const result = runProbe(
    validHtml.replace('<head>', '<head><title>literal <script>alert(1)</script> text</title>'),
  );
  assert.equal(result.status, 0, result.stderr);
});

for (const [name, html, expected] of [
  [
    'style tag',
    validHtml.replace('</head>', '<style>body{}</style></head>'),
    /forbidden <style> tag/,
  ],
  [
    'script tag',
    validHtml.replace('</body>', '<script>alert(1)</script></body>'),
    /forbidden <script> tag/,
  ],
  [
    'style attribute',
    validHtml.replace('<body>', '<body style="color:red">'),
    /forbidden style attribute/,
  ],
  [
    'stylesheet link',
    validHtml.replace('</head>', '<link rel="stylesheet" href="/x.css"></head>'),
    /<link rel="stylesheet"> is forbidden/,
  ],
  [
    'preload link',
    validHtml.replace('</head>', '<link rel="preload" href="/font.woff2"></head>'),
    /<link rel="preload"> is forbidden/,
  ],
  [
    'event-handler attribute',
    validHtml.replace('<body>', '<body onclick="alert(1)">'),
    /forbidden event-handler attribute/,
  ],
  [
    'comment closed with --!>',
    validHtml.replace('<body>', '<body><!-- probe --!><script>alert(1)</script>-->'),
    /forbidden <script> tag/,
  ],
  [
    'abrupt comment close',
    validHtml.replace('<body>', '<body><!--><script>alert(1)</script>'),
    /forbidden <script> tag/,
  ],
  [
    'bogus declaration with quoted >',
    validHtml.replace('<body>', '<body><!bogus "><script>alert(1)</script>">'),
    /forbidden <script> tag/,
  ],
  [
    'processing-instruction-like bogus comment',
    validHtml.replace('<body>', '<body><?bogus "><script>alert(1)</script>">'),
    /forbidden <script> tag/,
  ],
  [
    'quote inside unquoted attribute value',
    validHtml.replace('<body>', '<body><div foo=bar"baz><script>alert(1)</script>'),
    /forbidden <script> tag/,
  ],
  [
    'javascript URL',
    validHtml.replace('https://example.com/', 'javascript:alert(1)'),
    /forbidden javascript: URL/,
  ],
  [
    'entity-encoded javascript URL',
    validHtml.replace('https://example.com/', 'java&#x73;cript:alert(1)'),
    /forbidden javascript: URL/,
  ],
  [
    'named-entity javascript URL',
    validHtml.replace('https://example.com/', 'javascript&colon;alert(1)'),
    /forbidden javascript: URL/,
  ],
  [
    'control-character javascript URL',
    validHtml.replace('https://example.com/', 'java&#x0A;script:alert(1)'),
    /forbidden javascript: URL/,
  ],
  [
    'srcset javascript URL',
    validHtml.replace(
      'https://example.com/',
      'https://example.com/a.png 1x,javascript:alert(1) 2x',
    ),
    /forbidden javascript: URL/,
  ],
  [
    'meta refresh',
    validHtml.replace('</head>', '<meta http-equiv="refresh" content="0;url=/x"></head>'),
    /forbidden meta refresh/,
  ],
]) {
  test(`rejects ${name}`, () => {
    const result = runProbe(html);
    assert.equal(result.status, 1, `expected failure\n${result.stdout}\n${result.stderr}`);
    assert.match(result.stderr, expected);
  });
}
