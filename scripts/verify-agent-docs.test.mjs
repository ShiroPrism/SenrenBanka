import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { verifyAgentDocs } from './verify-agent-docs.mjs';

const requiredRules = [
  'README.md',
  'data-and-i18n.md',
  'design-contract.md',
  'action-menu.md',
  'visual-language.md',
  'accessibility-responsive.md',
  'pitfalls.md',
  'operations.md',
];

function buildFixture({ rootText, rules = {}, extraLinks = '', headings = {} } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'senrenbanka-agent-docs-'));
  const rulesDir = path.join(root, 'docs', 'rules');
  fs.mkdirSync(rulesDir, { recursive: true });

  const gates = [
    ['data-loader', 'data-and-i18n.md'],
    ['profile-fields', 'data-and-i18n.md'],
    ['internal-links', 'data-and-i18n.md'],
    ['html-only-zero-assets', 'design-contract.md'],
    ['single-action-menu', 'action-menu.md'],
    ['css-isolation', 'pitfalls.md'],
    ['reveal-visibility', 'visual-language.md'],
    ['verify-after-change', 'operations.md'],
  ]
    .map(([gate, ruleFile]) => `<!-- gate:${gate} --> [rule](docs/rules/${ruleFile})`)
    .join('\n');

  const defaultRoot = `# AGENTS.md\n\n${gates}\n\n${extraLinks}\n<!-- TRELLIS:START -->\nTrellis\n<!-- TRELLIS:END -->\n`;
  fs.writeFileSync(path.join(root, 'AGENTS.md'), rootText ?? defaultRoot, 'utf8');

  for (const fileName of requiredRules) {
    const body = rules[fileName] ?? `# ${fileName}\n\n## ${headings[fileName] ?? `Section ${fileName}`}\n\nRule body.\n`;
    fs.writeFileSync(path.join(rulesDir, fileName), body, 'utf8');
  }

  return root;
}

function cleanup(root) {
  fs.rmSync(root, { recursive: true, force: true });
}

test('accepts a compliant minimal rules tree', () => {
  const root = buildFixture();
  try {
    const result = verifyAgentDocs(root);
    assert.deepEqual(result.errors, []);
    assert.ok(result.characters > 0);
  } finally {
    cleanup(root);
  }
});

test('rejects an over-budget AGENTS.md', () => {
  const root = buildFixture({ rootText: `# AGENTS.md\n\n${'x'.repeat(7100)}` });
  try {
    const result = verifyAgentDocs(root);
    assert.match(result.errors.join('\n'), /characters \(limit 7000\)/);
  } finally {
    cleanup(root);
  }
});

test('rejects a missing rule file', () => {
  const root = buildFixture();
  fs.rmSync(path.join(root, 'docs', 'rules', 'pitfalls.md'));
  try {
    const result = verifyAgentDocs(root);
    assert.match(result.errors.join('\n'), /missing rule file: docs\/rules\/pitfalls.md/);
  } finally {
    cleanup(root);
  }
});

test('rejects a broken relative link', () => {
  const root = buildFixture({ extraLinks: '[missing](docs/rules/missing.md)' });
  try {
    const result = verifyAgentDocs(root);
    assert.match(result.errors.join('\n'), /AGENTS\.md -> docs\/rules\/missing\.md/);
  } finally {
    cleanup(root);
  }
});

test('rejects a missing hard gate', () => {
  const root = buildFixture({
    rootText: '<!-- TRELLIS:START -->\nTrellis\n<!-- TRELLIS:END -->\n',
  });
  try {
    const result = verifyAgentDocs(root);
    assert.match(result.errors.join('\n'), /missing hard gate "data-loader"/);
  } finally {
    cleanup(root);
  }
});

test('rejects a hard gate without its rule link', () => {
  const root = buildFixture({
    rootText: '<!-- gate:data-loader -->\n<!-- TRELLIS:START -->\nTrellis\n<!-- TRELLIS:END -->\n',
  });
  try {
    const result = verifyAgentDocs(root);
    assert.match(result.errors.join('\n'), /hard gate "data-loader" must link to docs\/rules\/data-and-i18n\.md/);
  } finally {
    cleanup(root);
  }
});

test('rejects missing Trellis markers', () => {
  const root = buildFixture({ rootText: '# AGENTS.md\n\n<!-- gate:data-loader -->\n' });
  try {
    const result = verifyAgentDocs(root);
    assert.match(result.errors.join('\n'), /TRELLIS:START \/ TRELLIS:END/);
  } finally {
    cleanup(root);
  }
});

test('rejects duplicate level-two headings across rule files', () => {
  const root = buildFixture({
    headings: {
      'data-and-i18n.md': 'Shared heading',
      'design-contract.md': 'Shared heading',
    },
  });
  try {
    const result = verifyAgentDocs(root);
    assert.match(result.errors.join('\n'), /duplicate rule heading "Shared heading"/);
  } finally {
    cleanup(root);
  }
});
