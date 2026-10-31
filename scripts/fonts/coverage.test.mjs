import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateDesignCoverage } from './coverage.mjs';

const familyByVariable = new Map([
  ['--font-gothic-a1', { id: 'gothic-a1', scripts: ['hangul'] }],
  ['--font-lxgw', { id: 'lxgw-wenkai', scripts: ['cjk', 'hangul'] }],
  ['--font-zhuque', { id: 'zhuque-fangsong', scripts: ['cjk'] }],
]);
const requiredScripts = new Map([['ko', 'hangul']]);
const koreanDesign = { id: 'fixture', locales: ['ko'], renderMode: 'styled' };
const pageAstro = '<Font cssVariable="--font-gothic-a1" />';

test('accepts a Korean design whose stacks and page register a Hangul font', () => {
  const findings = evaluateDesignCoverage({
    design: koreanDesign,
    requiredScripts,
    cssSources: [
      {
        filename: 'fixture/style.css',
        source: 'body { font-family: var(--font-gothic-a1), Georgia, serif; }',
      },
    ],
    pageAstro,
    familyByVariable,
  });
  assert.deepEqual(findings, []);
});

test('reports a stack without a Hangul font and a page without a Hangul Font registration', () => {
  const findings = evaluateDesignCoverage({
    design: koreanDesign,
    requiredScripts,
    cssSources: [
      {
        filename: 'fixture/style.css',
        source: 'body { font-family: var(--font-zhuque), serif; }',
      },
    ],
    pageAstro: '<Font cssVariable="--font-zhuque" />',
    familyByVariable,
  });
  assert.equal(findings.length, 2);
  assert.match(findings[0], /does not register a hangul core font/);
  assert.match(findings[1], /lacks a hangul core font/);
});

test('checks pure system stacks and ignores html-only designs', () => {
  const systemFindings = evaluateDesignCoverage({
    design: koreanDesign,
    requiredScripts,
    cssSources: [
      { filename: 'fixture/style.css', source: 'body { font-family: Georgia, serif; }' },
    ],
    pageAstro,
    familyByVariable,
  });
  assert.equal(systemFindings.length, 1);
  assert.match(systemFindings[0], /lacks a hangul core font/);

  const htmlOnlyFindings = evaluateDesignCoverage({
    design: { ...koreanDesign, renderMode: 'html-only' },
    requiredScripts,
    cssSources: [{ filename: 'fixture/style.css', source: 'body { font-family: serif; }' }],
    pageAstro: '',
    familyByVariable,
  });
  assert.deepEqual(htmlOnlyFindings, []);
});

test('does not enforce Korean coverage on designs without a ko locale', () => {
  const findings = evaluateDesignCoverage({
    design: { id: 'fixture', locales: ['en'], renderMode: 'styled' },
    requiredScripts,
    cssSources: [{ filename: 'fixture/style.css', source: 'body { font-family: Georgia, serif; }' }],
    pageAstro: '',
    familyByVariable,
  });
  assert.deepEqual(findings, []);
});

test('resolves font variables through custom properties from another stylesheet', () => {
  const findings = evaluateDesignCoverage({
    design: koreanDesign,
    requiredScripts,
    cssSources: [
      {
        filename: 'fixture/tokens.css',
        source: ':root { --pg-stack: var(--font-gothic-a1), serif; }',
      },
      {
        filename: 'fixture/style.css',
        source: 'body { font-family: var(--pg-stack); }',
      },
    ],
    pageAstro,
    familyByVariable,
  });
  assert.deepEqual(findings, []);
});
