import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkTypography,
  inspectAstroFontSource,
  inspectGeneratedFontSource,
  inspectTypographyCss,
} from './typography.mjs';

test('Astro registrations expose primary faces only and stay offline-capable', () => {
  const valid = `
    export default defineConfig({
      fonts: [
        {
          provider: localNpmProvider(),
          name: 'Latin',
          cssVariable: '--font-latin',
          fallbacks: [],
          optimizedFallbacks: false,
        },
        ...localFontDefinitions.map((definition) => ({
          provider: fontProviders.local(),
          name: definition.name,
          cssVariable: definition.cssVariable,
          fallbacks: [],
          optimizedFallbacks: false,
        })),
      ],
    });
  `;
  const invalid = valid.replace('fallbacks: [],', "fallbacks: ['sans-serif'],");
  assert.deepEqual(
    inspectAstroFontSource(valid, 'astro.config.mjs', { expectedNpmCount: 1 }).findings,
    [],
  );
  assert.match(
    inspectAstroFontSource(invalid, 'astro.config.mjs', {
      expectedNpmCount: 1,
    }).findings.join('\n'),
    /fallbacks: \[\]/,
  );
});

test('generated TypeScript declarations expose no fallback chain', () => {
  const valid = `
    export const localFontDefinitions: LocalFontDefinition[] = [
      { name: 'One', cssVariable: '--font-one', fallbacks: [], variants: [] },
    ];
  `;
  const invalid = valid.replace('fallbacks: []', "fallbacks: ['serif']");
  assert.deepEqual(inspectGeneratedFontSource(valid).findings, []);
  assert.match(inspectGeneratedFontSource(invalid).findings.join('\n'), /fallbacks: \[\]/);
});

test('design CSS requires explicit fallback and CJK ordering', () => {
  assert.deepEqual(
    inspectTypographyCss(
      '.x { font-family: var(--font-fraunces), "PingFang SC", sans-serif; }',
    ),
    [],
  );
  assert.match(
    inspectTypographyCss('.x { font-family: var(--font-fraunces); }').join('\n'),
    /explicit fallback/,
  );
  assert.match(
    inspectTypographyCss(
      '.x { font-family: var(--font-fraunces), "PingFang SC", var(--font-lxgw), serif; }',
    ).join('\n'),
    /system CJK fallback precedes/,
  );
  assert.match(
    inspectTypographyCss(
      '.x { font-family: var(--font-lxgw), sans-serif; }',
    ).join('\n'),
    /followed by an explicit system CJK fallback/,
  );
  assert.match(
    inspectTypographyCss(
      '.x { font-family: var(--font-latin), sans-serif; }',
      '<css>',
      { requiredCoreVariables: ['--font-lxgw'] },
    ).join('\n'),
    /must include a core CJK font variable/,
  );
  assert.deepEqual(
    inspectTypographyCss(
      ':root { --body: var(--font-lxgw), "Songti SC", serif; } .x { font-family: var(--body); }',
      '<css>',
      { requiredCoreVariables: ['--font-lxgw'] },
    ),
    [],
  );
});

test('repository typography contract passes', async () => {
  const result = await checkTypography();
  assert.deepEqual(result.findings, []);
  assert.equal(result.styledCount, 26);
  assert.equal(result.coreDesignCount, 17);
  assert.equal(result.generatedFamilies, 20);
});
