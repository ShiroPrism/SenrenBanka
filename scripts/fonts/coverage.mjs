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
const TC_SKIP_FAMILY = '__senrenbanka_tc_skip__';
const SC_HAN_CORE_VARIABLES = new Set(['--font-lxgw', '--font-zhuque', '--font-ark-pixel']);

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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function localeBlocks(source, locale) {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const pattern = new RegExp(
    `:[a-z-]*lang\\(\\s*["']?${escapeRegExp(locale)}["']?\\s*\\)[^{}]*\\{([^{}]*)\\}`,
    'gi',
  );
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

/** Locale-scoped font remaps must not leak into the base stack expansion. */
function withoutLocaleBlocks(source) {
  return source.replace(/:lang\([^)]*\)[^{}]*\{[^{}]*\}/gi, '');
}

function isTraditionalFamily(variable, familyByVariable) {
  return familyByVariable.get(variable)?.scripts.includes('han-traditional') ?? false;
}

/**
 * Traditional Chinese is page-routed, not unicode-range routed: the design
 * remaps its Han/companion variables inside `html:lang(zh-TW)` and registers
 * the TC families only on zh-TW pages. The gate mirrors that contract.
 */
function evaluateTraditionalCoverage({
  design,
  locale,
  cssSources,
  pageAstro,
  familyByVariable,
  registered,
  sharedCustomProperties,
}) {
  const findings = [];
  const allStacks = cssSources.flatMap(({ source }) =>
    collectFontStacks(source, sharedCustomProperties),
  );
  const usedVariables = new Set(allStacks.flatMap((stack) => fontVariablesIn(stack)));
  const blocks = cssSources.flatMap(({ source }) => localeBlocks(source, locale));
  if (blocks.length === 0) {
    findings.push(`${design.id} (${locale}): missing html:lang(${locale}) font overrides`);
    return findings;
  }

  const overrides = new Map();
  for (const block of blocks) {
    for (const declaration of declarationValues(block)) {
      if (declaration.property.startsWith('--font-')) {
        overrides.set(declaration.property, declaration.value);
      }
    }
  }

  const tcFamilyVariables = new Set();
  for (const variable of usedVariables) {
    const info = familyByVariable.get(variable);
    if (!info) continue;
    const companion = info.scripts.includes('hangul');
    const hanCore = SC_HAN_CORE_VARIABLES.has(variable);
    if (!companion && !hanCore) continue;

    const override = overrides.get(variable);
    if (!override) {
      findings.push(`${design.id} (${locale}): ${variable} lacks an html:lang(${locale}) override`);
      continue;
    }
    const trimmed = override.trim();
    if (trimmed === TC_SKIP_FAMILY) {
      if (hanCore) {
        findings.push(
          `${design.id} (${locale}): Han core ${variable} cannot map to the TC skip sentinel`,
        );
      }
      continue;
    }
    const target = /var\(\s*(--font-[a-z0-9-]+)\s*\)/i.exec(trimmed)?.[1];
    if (!target) {
      findings.push(
        `${design.id} (${locale}): ${variable} override is neither a font variable nor the TC skip sentinel`,
      );
      continue;
    }
    if (!isTraditionalFamily(target, familyByVariable)) {
      findings.push(
        `${design.id} (${locale}): ${variable} maps to ${target}, which is not a han-traditional family`,
      );
      continue;
    }
    tcFamilyVariables.add(target);
  }

  const hasHanCore = [...usedVariables].some((variable) => SC_HAN_CORE_VARIABLES.has(variable));
  if (!hasHanCore && tcFamilyVariables.size === 0) {
    findings.push(
      `${design.id} (${locale}): system-CJK design does not remap a font variable to a han-traditional family inside html:lang(${locale})`,
    );
  }
  for (const variable of tcFamilyVariables) {
    if (!registered.includes(variable)) {
      findings.push(
        `${design.id} (${locale}): Page.astro does not register a han-traditional core font (${variable})`,
      );
    }
  }
  if (
    tcFamilyVariables.size > 0 &&
    !new RegExp(`(?:===|!==)\\s*['"]${escapeRegExp(locale)}['"]`).test(pageAstro)
  ) {
    findings.push(
      `${design.id} (${locale}): Page.astro does not guard the TC font registration with a ${locale} locale condition`,
    );
  }
  return findings;
}

/**
 * Enforce the explicitly declared script coverage: Korean uses Hangul-only
 * unicode-range companions; Traditional Chinese uses page-scoped remapping.
 * CJK core-font presence itself remains the `typography.mjs` contract.
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
  const registered = [
    ...pageAstro.matchAll(/<Font\b[^>]*cssVariable\s*=\s*["'](--font-[a-z0-9-]+)["']/gi),
  ].map((match) => match[1]);
  const sharedCustomProperties = new Map();
  for (const { source } of cssSources) {
    for (const declaration of declarationValues(withoutLocaleBlocks(source))) {
      if (declaration.property.startsWith('--')) {
        sharedCustomProperties.set(declaration.property, declaration.value);
      }
    }
  }

  for (const [locale, requiredScript] of requiredScripts) {
    if (!locales.includes(locale)) continue;
    if (requiredScript === 'han-traditional') {
      findings.push(
        ...evaluateTraditionalCoverage({
          design,
          locale,
          cssSources,
          pageAstro,
          familyByVariable,
          registered,
          sharedCustomProperties,
        }),
      );
      continue;
    }

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
  const config = JSON.parse(await fs.readFile(path.join(projectRoot, 'fonts.config.json'), 'utf8'));
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
    if (locale.fontProfile === 'traditional-chinese') {
      requiredScripts.set(locale.code, 'han-traditional');
    }
  }

  const designsRoot = path.join(projectRoot, 'src/designs');
  const entries = await fs.readdir(designsRoot, { withFileTypes: true });
  const findings = [];
  let checked = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(designsRoot, entry.name);
    const design = JSON.parse(await fs.readFile(path.join(directory, 'design.json'), 'utf8'));
    const locales = design.locales ?? [];
    if (!locales.some((locale) => requiredScripts.has(locale))) continue;

    const cssSources = [];
    const cssFiles = (await fs.readdir(directory)).filter((file) => file.endsWith('.css')).sort();
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
