#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import {
  astroStyleBlocks,
  declarationValues,
  expandCustomProperties,
  splitTopLevel,
} from './typography.mjs';

const DEFAULT_PROJECT_ROOT = fileURLToPath(new URL('../..', import.meta.url));

function collectFontStacks(source, sharedCustomProperties) {
  const declarations = declarationValues(source);
  const customProperties =
    sharedCustomProperties ??
    new Map(
      declarations
        .filter((declaration) => declaration.property.startsWith('--'))
        .map((declaration) => [declaration.property, declaration.value]),
    );
  const stacks = [];
  for (const declaration of declarations) {
    if (declaration.property !== 'font-family' && declaration.property !== 'font') {
      continue;
    }
    const expanded = expandCustomProperties(declaration.value, customProperties);
    stacks.push({
      property: declaration.property,
      value: declaration.value,
      expanded,
      families: splitTopLevel(expanded, ','),
    });
  }
  return stacks;
}

function fontVariablesIn(stack) {
  const variables = [];
  for (const family of stack.families) {
    for (const match of family.matchAll(/var\(\s*(--font-[a-z0-9-]+)\s*\)/gi)) {
      variables.push(match[1]);
    }
  }
  return variables;
}

/**
 * Enforce only the newly introduced script coverage (currently Korean). CJK
 * core-font presence remains the existing `typography.mjs` contract: designs
 * that intentionally use system CJK fonts are not retroactively failed.
 */
export function evaluateDesignCoverage({
  design,
  requiredScripts,
  cssSources,
  pageAstro,
  familyByVariable,
}) {
  if ((design.renderMode ?? 'styled') === 'html-only') return [];
  const findings = [];
  const locales = design.locales ?? [];
  const registered = [...pageAstro.matchAll(
    /<Font\b[^>]*cssVariable\s*=\s*["'](--font-[a-z0-9-]+)["']/gi,
  )].map((match) => match[1]);
  const sharedCustomProperties = new Map();
  for (const { source } of cssSources) {
    for (const declaration of declarationValues(source)) {
      if (declaration.property.startsWith('--')) {
        sharedCustomProperties.set(declaration.property, declaration.value);
      }
    }
  }

  for (const [locale, requiredScript] of requiredScripts) {
    if (!locales.includes(locale)) continue;
    const registeredForScript = registered.some((variable) =>
      familyByVariable.get(variable)?.scripts.includes(requiredScript),
    );
    if (!registeredForScript) {
      findings.push(
        `${design.id} (${locale}): Page.astro does not register a ${requiredScript} core font`,
      );
    }
    for (const { filename, source } of cssSources) {
      for (const stack of collectFontStacks(source, sharedCustomProperties)) {
        const hasRequired = fontVariablesIn(stack).some((variable) =>
          familyByVariable.get(variable)?.scripts.includes(requiredScript),
        );
        if (!hasRequired) {
          findings.push(
            `${filename}: ${stack.property} lacks a ${requiredScript} core font for ${design.id} (${locale})`,
          );
        }
      }
    }
  }
  return findings;
}

export async function checkFontCoverage(projectRoot = DEFAULT_PROJECT_ROOT) {
  const siteConfig = parseYaml(
    await fs.readFile(path.join(projectRoot, 'src/data/site.config.yaml'), 'utf8'),
  );
  const config = JSON.parse(
    await fs.readFile(path.join(projectRoot, 'fonts.config.json'), 'utf8'),
  );
  const snapshot = JSON.parse(
    await fs.readFile(path.join(projectRoot, 'fonts.catalog.json'), 'utf8'),
  );

  const familyByVariable = new Map();
  for (const family of config.families) {
    const manifest = snapshot.families[family.id]?.manifest;
    familyByVariable.set(family.cssVariable, {
      id: family.id,
      scripts: Array.isArray(manifest?.scripts) ? manifest.scripts : ['cjk'],
    });
  }

  const requiredScripts = new Map();
  for (const locale of siteConfig.i18n.locales) {
    if (locale.fontProfile === 'korean') requiredScripts.set(locale.code, 'hangul');
  }

  const designsRoot = path.join(projectRoot, 'src/designs');
  const entries = await fs.readdir(designsRoot, { withFileTypes: true });
  const findings = [];
  let checked = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(designsRoot, entry.name);
    const design = JSON.parse(
      await fs.readFile(path.join(directory, 'design.json'), 'utf8'),
    );
    const locales = design.locales ?? [];
    if (!locales.some((locale) => requiredScripts.has(locale))) continue;

    const cssSources = [];
    const cssFiles = (await fs.readdir(directory))
      .filter((file) => file.endsWith('.css'))
      .sort();
    for (const file of cssFiles) {
      cssSources.push({
        filename: `${entry.name}/${file}`,
        source: await fs.readFile(path.join(directory, file), 'utf8'),
      });
    }

    const astroFiles = (await fs.readdir(directory))
      .filter((file) => file.endsWith('.astro'))
      .sort();
    let pageAstro = '';
    for (const file of astroFiles) {
      const source = await fs.readFile(path.join(directory, file), 'utf8');
      if (file === 'Page.astro') pageAstro = source;
      for (const [index, style] of astroStyleBlocks(source).entries()) {
        cssSources.push({
          filename: `${entry.name}/${file}:style[${index + 1}]`,
          source: style,
        });
      }
    }

    findings.push(
      ...evaluateDesignCoverage({
        design: {
          id: design.id ?? entry.name,
          locales,
          renderMode: design.renderMode ?? 'styled',
        },
        requiredScripts,
        cssSources,
        pageAstro,
        familyByVariable,
      }),
    );
    checked += 1;
  }

  return { findings, checked };
}

async function main() {
  const { findings, checked } = await checkFontCoverage();
  if (findings.length > 0) {
    console.error('[senrenbanka:fonts] coverage failed:');
    for (const finding of findings) console.error(`- ${finding}`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `[senrenbanka:fonts] coverage check passed: ${checked} design(s) with enforced scripts`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`[senrenbanka:fonts] ${error.message}`);
    process.exitCode = 1;
  });
}
