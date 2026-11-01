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

const traditionalRequiredScripts = new Map([['zh-TW', 'han-traditional']]);
const traditionalFamilyByVariable = new Map([
  ['--font-gowun-batang', { id: 'gowun-batang', scripts: ['hangul'] }],
  ['--font-gothic-a1', { id: 'gothic-a1', scripts: ['hangul'] }],
  ['--font-lxgw', { id: 'lxgw-wenkai', scripts: ['cjk'] }],
  ['--font-lxgw-tc', { id: 'lxgw-wenkai-tc', scripts: ['cjk', 'han-traditional'] }],
  ['--font-noto-sans-tc', { id: 'noto-sans-tc', scripts: ['cjk', 'han-traditional'] }],
  ['--font-noto-serif-tc', { id: 'noto-serif-tc', scripts: ['cjk', 'han-traditional'] }],
]);
const traditionalDesign = { id: 'fixture', locales: ['zh-TW'], renderMode: 'styled' };
const traditionalCss =
  'body { font-family: var(--font-gowun-batang), var(--font-lxgw), serif; }\n' +
  "html:lang(zh-TW) { --font-gowun-batang: __senrenbanka_tc_skip__; --font-lxgw: var(--font-lxgw-tc); }";
const traditionalPage =
  "{view.locale.code === 'zh-TW' && <Font cssVariable=\"--font-lxgw-tc\" />}";

test('accepts a TC design that remaps its Han core and companion in html:lang(zh-TW)', () => {
  const findings = evaluateDesignCoverage({
    design: traditionalDesign,
    requiredScripts: traditionalRequiredScripts,
    cssSources: [{ filename: 'fixture/style.css', source: traditionalCss }],
    pageAstro: traditionalPage,
    familyByVariable: traditionalFamilyByVariable,
  });
  assert.deepEqual(findings, []);
});

test('reports a TC design without html:lang(zh-TW) overrides', () => {
  const findings = evaluateDesignCoverage({
    design: traditionalDesign,
    requiredScripts: traditionalRequiredScripts,
    cssSources: [
      {
        filename: 'fixture/style.css',
        source: 'body { font-family: var(--font-gowun-batang), var(--font-lxgw), serif; }',
      },
    ],
    pageAstro: traditionalPage,
    familyByVariable: traditionalFamilyByVariable,
  });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /missing html:lang\(zh-TW\) font overrides/);
});

test('reports an unguarded TC font registration', () => {
  const findings = evaluateDesignCoverage({
    design: traditionalDesign,
    requiredScripts: traditionalRequiredScripts,
    cssSources: [{ filename: 'fixture/style.css', source: traditionalCss }],
    pageAstro: '<Font cssVariable="--font-lxgw-tc" />',
    familyByVariable: traditionalFamilyByVariable,
  });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /does not guard the TC font registration/);
});

test('rejects mapping a Han core to the TC skip sentinel', () => {
  const findings = evaluateDesignCoverage({
    design: traditionalDesign,
    requiredScripts: traditionalRequiredScripts,
    cssSources: [
      {
        filename: 'fixture/style.css',
        source:
          'body { font-family: var(--font-gowun-batang), var(--font-lxgw), serif; }\n' +
          'html:lang(zh-TW) { --font-gowun-batang: __senrenbanka_tc_skip__; --font-lxgw: __senrenbanka_tc_skip__; }',
      },
    ],
    pageAstro: traditionalPage,
    familyByVariable: traditionalFamilyByVariable,
  });
  assert.match(findings.join('\n'), /cannot map to the TC skip sentinel/);
});

test('accepts a system-CJK design that remaps its Korean companion to a TC family', () => {
  const findings = evaluateDesignCoverage({
    design: traditionalDesign,
    requiredScripts: traditionalRequiredScripts,
    cssSources: [
      {
        filename: 'fixture/style.css',
        source:
          "body { font-family: var(--font-gothic-a1), 'PingFang SC', sans-serif; }\n" +
          'html:lang(zh-TW) { --font-gothic-a1: var(--font-noto-sans-tc); }',
      },
    ],
    pageAstro:
      "{view.locale.code === 'zh-TW' && <Font cssVariable=\"--font-noto-sans-tc\" />}",
    familyByVariable: traditionalFamilyByVariable,
  });
  assert.deepEqual(findings, []);
});
