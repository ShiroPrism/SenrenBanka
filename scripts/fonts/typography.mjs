#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const DEFAULT_PROJECT_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const CORE_FONT_VARIABLES = new Set([
  '--font-ark-pixel',
  '--font-lxgw',
  '--font-zhuque',
]);
const SYSTEM_CJK_FONTS = new Set([
  'apple ligothic',
  'fang song',
  'fangsong',
  'heiti sc',
  'hiragino mincho pron',
  'hiragino sans',
  'microsoft jhenghei',
  'microsoft yahei',
  'noto sans cjk',
  'noto sans cjk sc',
  'noto serif cjk',
  'noto serif cjk sc',
  'pingfang sc',
  'simsun',
  'songti sc',
  'source han sans',
  'source han serif',
  'yu gothic ui',
  'yu mincho',
]);

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function objectProperty(object, name) {
  return object.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) && propertyName(property.name) === name,
  );
}

function arrayProperty(object, name) {
  const property = objectProperty(object, name);
  return property && ts.isArrayLiteralExpression(property.initializer)
    ? property.initializer
    : undefined;
}

function falseProperty(object, name) {
  const property = objectProperty(object, name);
  return property?.initializer.kind === ts.SyntaxKind.FalseKeyword;
}

function arrayAt(root, name) {
  let result;
  function visit(node) {
    if (ts.isPropertyAssignment(node) && propertyName(node.name) === name) {
      if (ts.isArrayLiteralExpression(node.initializer)) {
        result = node.initializer;
        return;
      }
    }
    if (!result) ts.forEachChild(node, visit);
  }
  visit(root);
  return result;
}

function providerKind(expression) {
  const text = expression.getText();
  if (text.startsWith('localNpmProvider(')) return 'npm';
  if (text.includes('fontProviders.local(')) return 'local';
  return undefined;
}

export function inspectAstroFontSource(
  source,
  filename = 'astro.config.mjs',
  { expectedNpmCount = 6 } = {},
) {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const fonts = arrayAt(file, 'fonts');
  const findings = [];
  const registrations = [];

  if (!fonts) {
    return { findings: [`${filename}: missing fonts array`], registrations };
  }

  for (const element of fonts.elements) {
    let object;
    if (ts.isObjectLiteralExpression(element)) {
      object = element;
    } else if (
      ts.isSpreadElement(element) &&
      ts.isCallExpression(element.expression) &&
      ts.isPropertyAccessExpression(element.expression.expression) &&
      element.expression.expression.name.text === 'map'
    ) {
      const callback = element.expression.arguments[0];
      if (callback && ts.isArrowFunction(callback)) {
        const body = ts.isParenthesizedExpression(callback.body)
          ? callback.body.expression
          : callback.body;
        object = ts.isObjectLiteralExpression(body) ? body : undefined;
      }
    }
    if (!object) continue;

    const provider = objectProperty(object, 'provider');
    const kind =
      provider && ts.isPropertyAssignment(provider)
        ? providerKind(provider.initializer)
        : undefined;
    if (!kind) continue;

    const nameProperty = objectProperty(object, 'name');
    const name = nameProperty?.initializer.getText() ?? '<generated local family>';
    registrations.push({ kind, name });
    if (!arrayProperty(object, 'fallbacks') || arrayProperty(object, 'fallbacks').elements.length > 0) {
      findings.push(`${filename}: ${kind} registration ${name} must use fallbacks: []`);
    }
    if (!falseProperty(object, 'optimizedFallbacks')) {
      findings.push(
        `${filename}: ${kind} registration ${name} must set optimizedFallbacks: false`,
      );
    }
  }

  const npmCount = registrations.filter((entry) => entry.kind === 'npm').length;
  if (npmCount !== expectedNpmCount) {
    findings.push(
      `${filename}: expected ${expectedNpmCount} npm registrations, found ${npmCount}`,
    );
  }
  if (!registrations.some((entry) => entry.kind === 'local')) {
    findings.push(`${filename}: missing generated local registration`);
  }
  return { findings, registrations };
}

export function inspectGeneratedFontSource(source, filename = 'src/fonts/generated.ts') {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  let definitions;
  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'localFontDefinitions' &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      definitions = node.initializer;
      return;
    }
    if (!definitions) ts.forEachChild(node, visit);
  }
  visit(file);
  if (!definitions) {
    return { findings: [`${filename}: missing localFontDefinitions array`], count: 0 };
  }

  const findings = [];
  let index = 0;
  for (const element of definitions.elements) {
    index += 1;
    if (!ts.isObjectLiteralExpression(element)) {
      findings.push(`${filename}: definition #${index} is not an object literal`);
      continue;
    }
    const nameProperty = objectProperty(element, 'name');
    const name = nameProperty?.initializer.getText() ?? `#${index}`;
    const fallbacks = arrayProperty(element, 'fallbacks');
    if (!fallbacks || fallbacks.elements.length > 0) {
      findings.push(`${filename}: generated family ${name} must use fallbacks: []`);
    }
  }
  return { findings, count: definitions.elements.length };
}

function stripCssComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

function splitTopLevel(value, delimiter) {
  const tokens = [];
  let current = '';
  let quote = '';
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      current += char;
      if (char === quote && value[index - 1] !== '\\') quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }
    if (char === '(') depth += 1;
    if (char === ')') depth = Math.max(0, depth - 1);
    if (char === delimiter && depth === 0) {
      tokens.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) tokens.push(current.trim());
  return tokens;
}

function declarationValues(source) {
  const text = stripCssComments(source);
  const declarations = [];
  const pattern = /(?:^|[;{])\s*(--[a-z0-9-]+|font-family|font)\s*:\s*([^;{}]+)/gi;
  for (const match of text.matchAll(pattern)) {
    declarations.push({ property: match[1].toLowerCase(), value: match[2].trim() });
  }
  return declarations;
}

function expandCustomProperties(value, customProperties, seen = new Set()) {
  let expanded = value;
  for (let pass = 0; pass < 20; pass += 1) {
    let changed = false;
    expanded = expanded.replace(/var\(\s*(--[a-z0-9-]+)\s*\)/gi, (token, name) => {
      const key = name.toLowerCase();
      if (seen.has(key) || !customProperties.has(key)) return token;
      changed = true;
      return customProperties.get(key);
    });
    if (!changed) break;
  }
  return expanded;
}

function normalizedFamily(token) {
  return token
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\/g, '')
    .toLowerCase();
}

export function inspectTypographyCss(
  source,
  filename = '<css>',
  { requiredCoreVariables = [] } = {},
) {
  const declarations = declarationValues(source);
  const customProperties = new Map(
    declarations
      .filter((declaration) => declaration.property.startsWith('--'))
      .map((declaration) => [declaration.property, declaration.value]),
  );
  const findings = [];

  for (const declaration of declarations) {
    if (declaration.property !== 'font-family' && declaration.property !== 'font') {
      continue;
    }
    const expanded = expandCustomProperties(declaration.value, customProperties);
    if (!/var\(\s*--font-[a-z0-9-]+/i.test(expanded)) continue;

    const families = splitTopLevel(expanded, ',');
    const fontIndexes = families.flatMap((family, index) =>
      /var\(\s*--font-[a-z0-9-]+/i.test(family) ? [index] : [],
    );
    const lastFontIndex = fontIndexes.at(-1);
    if (lastFontIndex === undefined || lastFontIndex === families.length - 1) {
      findings.push(
        `${filename}: ${declaration.property} must put an explicit fallback after every font variable`,
      );
      continue;
    }

    if (
      requiredCoreVariables.length > 0 &&
      !requiredCoreVariables.some((variable) =>
        new RegExp(`var\\(\\s*${variable}\\s*\\)`, 'i').test(expanded),
      )
    ) {
      findings.push(
        `${filename}: ${declaration.property} must include a core CJK font variable before system/generic fallbacks`,
      );
    }

    const coreIndexes = families.flatMap((family, index) =>
      [...CORE_FONT_VARIABLES].some((variable) =>
        new RegExp(`var\\(\\s*${variable}\\s*\\)`, 'i').test(family),
      )
        ? [index]
        : [],
    );
    const firstCoreIndex = coreIndexes.at(0);
    const lastCoreIndex = coreIndexes.at(-1);
    if (
      firstCoreIndex !== undefined &&
      families
        .slice(0, firstCoreIndex)
        .some((family) => SYSTEM_CJK_FONTS.has(normalizedFamily(family)))
    ) {
      findings.push(
        `${filename}: a system CJK fallback precedes a core CJK font variable`,
      );
    }
    if (
      lastCoreIndex !== undefined &&
      !families
        .slice(lastCoreIndex + 1)
        .some((family) => SYSTEM_CJK_FONTS.has(normalizedFamily(family)))
    ) {
      findings.push(
        `${filename}: core CJK font variable must be followed by an explicit system CJK fallback`,
      );
    }
  }
  return findings;
}

async function readIfPresent(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

function astroStyleBlocks(source) {
  return [...source.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi)].map(
    (match) => match[1],
  );
}

export async function checkTypography(projectRoot = DEFAULT_PROJECT_ROOT) {
  const findings = [];
  const astroPath = path.join(projectRoot, 'astro.config.mjs');
  const generatedPath = path.join(projectRoot, 'src/fonts/generated.ts');
  const astro = inspectAstroFontSource(await fs.readFile(astroPath, 'utf8'), astroPath);
  const generated = inspectGeneratedFontSource(
    await fs.readFile(generatedPath, 'utf8'),
    generatedPath,
  );
  findings.push(...astro.findings, ...generated.findings);
  if (generated.count !== 20) {
    findings.push(`${generatedPath}: expected 20 generated families, found ${generated.count}`);
  }

  const designsDirectory = path.join(projectRoot, 'src/designs');
  const entries = await fs.readdir(designsDirectory, { withFileTypes: true });
  let styledCount = 0;
  let coreDesignCount = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(designsDirectory, entry.name);
    const designJson = JSON.parse(
      await fs.readFile(path.join(directory, 'design.json'), 'utf8'),
    );
    const renderMode = designJson.renderMode ?? 'styled';
    if (renderMode !== 'styled') continue;
    styledCount += 1;

    const stylePath = path.join(directory, 'style.css');
    const style = await readIfPresent(stylePath);
    if (style === undefined) {
      findings.push(`${stylePath}: styled design is missing style.css`);
      continue;
    }
    const cssFiles = (await fs.readdir(directory))
      .filter((file) => file.endsWith('.css'))
      .sort();
    const cssSources = await Promise.all(
      cssFiles.map((file) => fs.readFile(path.join(directory, file), 'utf8')),
    );

    const astroFiles = (await fs.readdir(directory)).filter((file) => file.endsWith('.astro'));
    const astroSources = [];
    for (const file of astroFiles) {
      const filePath = path.join(directory, file);
      const source = await fs.readFile(filePath, 'utf8');
      for (const [index, styleBlock] of astroStyleBlocks(source).entries()) {
        astroSources.push({
          filename: `${filePath}:style[${index + 1}]`,
          source: styleBlock,
        });
      }
    }

    const allSources = [...cssSources, ...astroSources.map((entry) => entry.source)].join('\n');
    const requiredCoreVariables = [...CORE_FONT_VARIABLES].filter((variable) =>
      allSources.includes(variable),
    );
    if (requiredCoreVariables.length > 0) coreDesignCount += 1;

    findings.push(
      ...inspectTypographyCss(cssSources.join('\n'), `${directory}/*.css`, {
        requiredCoreVariables,
      }),
    );
    for (const astroSource of astroSources) {
      findings.push(
        ...inspectTypographyCss(astroSource.source, astroSource.filename, {
          requiredCoreVariables,
        }),
      );
    }
  }

  if (styledCount !== 26) {
    findings.push(
      `${designsDirectory}: expected 26 styled designs, found ${styledCount}`,
    );
  }
  return {
    findings,
    styledCount,
    coreDesignCount,
    generatedFamilies: generated.count,
  };
}

async function main() {
  const { findings, styledCount, coreDesignCount, generatedFamilies } =
    await checkTypography();
  if (findings.length > 0) {
    console.error('[senrenbanka:fonts] typography contract failed:');
    for (const finding of findings) console.error(`- ${finding}`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `[senrenbanka:fonts] typography check passed: ${styledCount} styled designs (${coreDesignCount} with core CJK), ${generatedFamilies} primary-only local families`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`[senrenbanka:fonts] ${error.message}`);
    process.exitCode = 1;
  });
}
