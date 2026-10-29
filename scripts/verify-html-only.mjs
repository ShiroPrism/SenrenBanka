#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const PREFIX = '[senrenbanka] html-only verification failed';
const projectRoot = process.cwd();
const forbiddenTags = new Set(['style', 'script', 'iframe', 'object', 'embed']);
const rawTextTags = new Set(['title', 'textarea']);
const allowedLinkRels = new Set(['canonical', 'alternate', 'icon']);
const urlAttributes = new Set([
  'action',
  'formaction',
  'href',
  'poster',
  'src',
  'srcset',
  'xlink:href',
]);
const namedCharacterReferences = new Map([
  ['colon', ':'],
  ['newline', '\n'],
  ['tab', '\t'],
]);

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  let dist = 'dist';

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg !== '--dist') {
      fail(`unknown argument "${arg}" (expected only --dist <directory>)`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      fail('--dist requires a directory path');
    }
    dist = value;
    index += 1;
  }

  return path.resolve(projectRoot, dist);
}

function readLocales() {
  const configPath = path.join(projectRoot, 'src', 'data', 'site.config.yaml');
  if (!fs.existsSync(configPath)) {
    fail(`missing site config: ${configPath}`);
  }

  const config = parseYaml(fs.readFileSync(configPath, 'utf8'));
  const locales = config?.i18n?.locales;
  if (!Array.isArray(locales) || locales.length === 0) {
    fail('site.config.yaml must declare at least one i18n locale');
  }

  const paths = locales.map((locale) => locale?.path);
  for (const localePath of paths) {
    if (
      typeof localePath !== 'string' ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(localePath)
    ) {
      fail(`invalid locale path "${String(localePath)}"`);
    }
  }

  if (new Set(paths).size !== paths.length) {
    fail('duplicate locale paths make the expected output set ambiguous');
  }

  return paths;
}

function readHtmlOnlyDesignIds() {
  const designsRoot = path.join(projectRoot, 'src', 'designs');
  if (!fs.existsSync(designsRoot)) {
    fail(`missing designs directory: ${designsRoot}`);
  }

  const ids = [];
  const directories = fs
    .readdirSync(designsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'));

  for (const directory of directories) {
    const manifestPath = path.join(designsRoot, directory.name, 'design.json');
    if (!fs.existsSync(manifestPath)) continue;

    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (error) {
      fail(`cannot parse ${manifestPath}: ${error instanceof Error ? error.message : error}`);
    }

    const renderMode =
      manifest && Object.prototype.hasOwnProperty.call(manifest, 'renderMode')
        ? manifest.renderMode
        : 'styled';
    if (renderMode !== 'styled' && renderMode !== 'html-only') {
      fail(`invalid renderMode "${String(renderMode)}" in ${manifestPath}`);
    }
    if (renderMode === 'html-only') {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(directory.name)) {
        fail(`invalid html-only design id "${directory.name}"`);
      }
      ids.push(directory.name);
    }
  }

  if (ids.length === 0) {
    fail('no design declares renderMode "html-only"; refusing to pass vacuously');
  }

  return ids.sort();
}

function findTagEnd(html, start) {
  let quote = null;
  for (let index = start; index < html.length; index += 1) {
    const char = html[index];
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '>') return index;
  }
  return -1;
}

function findStartTagEnd(html, start) {
  let index = start;
  while (index < html.length && !/[\s/>]/.test(html[index])) index += 1;

  while (index < html.length) {
    while (index < html.length && /\s/.test(html[index])) index += 1;
    if (index >= html.length) return -1;
    if (html[index] === '>') return index;
    if (html[index] === '/') {
      index += 1;
      continue;
    }

    const nameStart = index;
    while (
      index < html.length &&
      !/[\s=/>]/.test(html[index])
    ) {
      index += 1;
    }
    if (nameStart === index) {
      index += 1;
      continue;
    }

    while (index < html.length && /\s/.test(html[index])) index += 1;
    if (html[index] !== '=') continue;

    index += 1;
    while (index < html.length && /\s/.test(html[index])) index += 1;
    const quote = html[index];
    if (quote === '"' || quote === "'") {
      index += 1;
      while (index < html.length && html[index] !== quote) index += 1;
      if (index >= html.length) {
        fail(`unterminated attribute value in start tag at offset ${start - 1}`);
      }
      index += 1;
      continue;
    }

    // Unquoted attribute values end at whitespace or the tag's closing ">";
    // quotes inside them are ordinary characters, matching HTML tokenization.
    while (index < html.length && !/[\s>]/.test(html[index])) index += 1;
  }

  return -1;
}

function findCommentEnd(html, open) {
  const contentStart = open + 4;

  // The HTML tokenizer accepts these two abrupt comment forms.
  if (html[contentStart] === '>') return contentStart + 1;
  if (html[contentStart] === '-' && html[contentStart + 1] === '>') {
    return contentStart + 2;
  }

  for (let index = contentStart; index < html.length; index += 1) {
    if (html.startsWith('-->', index)) return index + 3;
    if (html.startsWith('--!>', index)) return index + 4;
  }

  fail(`unterminated HTML comment at offset ${open}`);
}

function parseAttributes(source, offset) {
  const attributes = [];
  let index = 0;

  while (index < source.length) {
    while (index < source.length && /[\s/]/.test(source[index])) index += 1;
    if (index >= source.length) break;

    const nameStart = index;
    while (index < source.length && !/[\s=/>]/.test(source[index])) index += 1;
    if (nameStart === index) {
      index += 1;
      continue;
    }

    const name = source.slice(nameStart, index);
    while (index < source.length && /\s/.test(source[index])) index += 1;

    let value = null;
    if (source[index] === '=') {
      index += 1;
      while (index < source.length && /\s/.test(source[index])) index += 1;
      const quote = source[index];
      if (quote === '"' || quote === "'") {
        index += 1;
        const valueStart = index;
        while (index < source.length && source[index] !== quote) index += 1;
        if (index >= source.length) {
          fail(`unterminated attribute value for "${name}" at offset ${offset + nameStart}`);
        }
        value = source.slice(valueStart, index);
        index += 1;
      } else {
        const valueStart = index;
        while (index < source.length && !/[\s>]/.test(source[index])) index += 1;
        value = source.slice(valueStart, index);
      }
    }

    attributes.push({ name, value });
  }

  return attributes;
}

function decodeCharacterReferences(value) {
  return value
    .replace(/&#(?:x([0-9a-f]+)|([0-9]+));?/gi, (_, hex, decimal) => {
      const codePoint = Number.parseInt(hex ?? decimal, hex ? 16 : 10);
      return Number.isInteger(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : '\uFFFD';
    })
    .replace(/&([a-z]+);/gi, (match, name) => {
      return namedCharacterReferences.get(name.toLowerCase()) ?? match;
    });
}

function isJavascriptUrl(value) {
  const normalize = (candidate) =>
    decodeCharacterReferences(candidate)
      .replace(/[\u0000-\u0020\u007f-\u009f]/g, '')
      .toLowerCase();

  const direct = normalize(value);
  if (direct.startsWith('javascript:')) return true;

  // `srcset` is a comma-separated candidate list; each URL is independently
  // executable. Check every candidate, including descriptors after whitespace.
  return value.split(',').some((candidate) => {
    const url = candidate.trim().split(/\s+/)[0] ?? '';
    return normalize(url).startsWith('javascript:');
  });
}

function scanStartTags(html) {
  const tags = [];
  let index = 0;

  while (index < html.length) {
    const open = html.indexOf('<', index);
    if (open === -1) break;

    if (html.startsWith('<!--', open)) {
      index = findCommentEnd(html, open);
      continue;
    }

    const marker = html[open + 1];
    if (marker === '!') {
      // DOCTYPE identifiers may contain ">" inside quotes. Other "<!" forms
      // are bogus comments in HTML, whose tokenizer ignores quote syntax.
      const isDoctype = /^<!doctype(?:\s|>)/i.test(html.slice(open, open + 10));
      const close = isDoctype
        ? findTagEnd(html, open + 2)
        : html.indexOf('>', open + 2);
      if (close === -1) fail(`unterminated markup declaration at offset ${open}`);
      index = close + 1;
      continue;
    }
    if (marker === '?') {
      // "<?...>" is a bogus comment in HTML, not a quote-aware processing instruction.
      const close = html.indexOf('>', open + 2);
      if (close === -1) fail(`unterminated markup declaration at offset ${open}`);
      index = close + 1;
      continue;
    }

    if (marker === '/') {
      const close = findStartTagEnd(html, open + 2);
      if (close === -1) fail(`unterminated closing tag at offset ${open}`);
      index = close + 1;
      continue;
    }

    if (!/[A-Za-z]/.test(marker ?? '')) {
      index = open + 1;
      continue;
    }

    const close = findStartTagEnd(html, open + 1);
    if (close === -1) fail(`unterminated start tag at offset ${open}`);
    const source = html.slice(open + 1, close);
    const nameMatch = /^([A-Za-z][A-Za-z0-9:-]*)/.exec(source);
    if (!nameMatch) fail(`cannot parse start tag at offset ${open}`);

    const name = nameMatch[1];
    const attributes = parseAttributes(source.slice(name.length), open + 1 + name.length);
    tags.push({ name, attributes });
    index = close + 1;

    // `title` and `textarea` contain RCDATA: markup-like text inside them is
    // text, not a nested start tag. Skip it so literal examples do not fail the
    // resource gate. The forbidden raw-text elements (`script` / `style`) are
    // already violations and need no special handling.
    if (rawTextTags.has(name.toLowerCase())) {
      const closingTag = new RegExp(`</${name}(?:\\s|>)`, 'i').exec(html.slice(index));
      if (!closingTag) {
        fail(`unterminated <${name}> element at offset ${open}`);
      }
      const closingStart = index + closingTag.index;
      const closingEnd = findStartTagEnd(html, closingStart + 2);
      if (closingEnd === -1) {
        fail(`unterminated </${name}> tag at offset ${closingStart}`);
      }
      index = closingEnd + 1;
    }
  }

  return tags;
}

function inspectHtml(html, displayPath) {
  const violations = [];
  const tags = scanStartTags(html);

  for (const tag of tags) {
    const tagName = tag.name.toLowerCase();
    if (forbiddenTags.has(tagName)) {
      violations.push(`forbidden <${tag.name}> tag in ${displayPath}`);
    }

    for (const attribute of tag.attributes) {
      const attributeName = attribute.name.toLowerCase();
      if (attributeName === 'style') {
        violations.push(`forbidden style attribute on <${tag.name}> in ${displayPath}`);
      }
      if (attributeName.startsWith('on')) {
        violations.push(
          `forbidden event-handler attribute "${attribute.name}" on <${tag.name}> in ${displayPath}`,
        );
      }
      if (
        attribute.value !== null &&
        urlAttributes.has(attributeName) &&
        isJavascriptUrl(attribute.value)
      ) {
        violations.push(
          `forbidden javascript: URL in "${attribute.name}" on <${tag.name}> in ${displayPath}`,
        );
      }
    }

    if (tagName === 'meta') {
      const httpEquiv = tag.attributes.find(
        (attribute) => attribute.name.toLowerCase() === 'http-equiv',
      );
      if (
        httpEquiv?.value &&
        decodeCharacterReferences(httpEquiv.value).trim().toLowerCase() === 'refresh'
      ) {
        violations.push(`forbidden meta refresh in ${displayPath}`);
      }
    }

    if (tagName !== 'link') continue;
    const relAttributes = tag.attributes.filter(
      (attribute) => attribute.name.toLowerCase() === 'rel',
    );
    if (relAttributes.length !== 1 || relAttributes[0].value === null) {
      violations.push(`<link> must have exactly one rel value in ${displayPath}`);
      continue;
    }

    const rels = relAttributes[0].value.toLowerCase().split(/\s+/).filter(Boolean);
    if (rels.length === 0) {
      violations.push(`<link> has an empty rel value in ${displayPath}`);
    }
    for (const rel of rels) {
      if (!allowedLinkRels.has(rel)) {
        violations.push(`<link rel="${rel}"> is forbidden in ${displayPath}`);
      }
    }
  }

  return violations;
}

function main() {
  const distDir = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
    fail(`dist directory does not exist: ${distDir}`);
  }

  const localePaths = readLocales();
  const designIds = readHtmlOnlyDesignIds();
  const violations = [];

  for (const designId of designIds) {
    for (const localePath of localePaths) {
      const htmlPath = path.join(distDir, localePath, designId, 'index.html');
      if (!fs.existsSync(htmlPath)) {
        violations.push(`missing final HTML: ${htmlPath}`);
        continue;
      }
      const html = fs.readFileSync(htmlPath, 'utf8');
      violations.push(...inspectHtml(html, htmlPath));
    }
  }

  if (violations.length > 0) {
    for (const violation of violations) {
      console.error(`${PREFIX}: ${violation}`);
    }
    console.error(
      `${PREFIX}: ${violations.length} violation(s) across ${designIds.length} design(s) × ${localePaths.length} locale(s)`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `[senrenbanka] html-only verification passed (${designIds.length} design(s) × ${localePaths.length} locale(s) = ${designIds.length * localePaths.length} page(s))`,
  );
}

try {
  main();
} catch (error) {
  console.error(`${PREFIX}: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
