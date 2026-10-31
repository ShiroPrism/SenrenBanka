import fs from 'node:fs';
import path from 'node:path';
import { toPosixPath } from './paths.mjs';

const HTML_ENTITIES = new Map([
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
  ['apos', "'"],
  ['nbsp', '\u00a0'],
  ['hellip', '\u2026'],
  ['mdash', '\u2014'],
  ['ndash', '\u2013'],
]);

const URL_PROTOCOL_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const STYLE_ELEMENT_PATTERN = /<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi;
const LINKED_ASSET_PATTERN =
  /<(?:link|script)\b[^>]*?\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi;
const FONT_FACE_PATTERN = /@font-face\s*\{[^{}]*\}/gi;
const FONT_FACE_BODY_PATTERN = /@font-face\s*(\{[^{}]*\})/i;
const FONT_FAMILY_PATTERN = /font-family\s*:\s*(?:"([^"]*)"|'([^']*)'|([^;}]+))/i;
const FONT_URL_PATTERN = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi;
const UNICODE_RANGE_PATTERN = /unicode-range\s*:\s*([^;}]+)/i;
const CSS_ESCAPE_PATTERN = /\\(?:([0-9A-Fa-f]{1,6})(?:\r\n|[ \t\n\r\f])?|([^0-9A-Fa-f]))/g;

/** Font extensions recognised inside `dist/_astro/fonts/`. */
export const FONT_EXTENSIONS = Object.freeze(['.woff2', '.woff', '.ttf', '.otf']);

export function decodeHtmlEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, value) => {
    if (value.startsWith('#x') || value.startsWith('#X')) {
      const codePoint = Number.parseInt(value.slice(2), 16);
      return Number.isInteger(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    }
    if (value.startsWith('#')) {
      const codePoint = Number.parseInt(value.slice(1), 10);
      return Number.isInteger(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    }
    return HTML_ENTITIES.get(value.toLowerCase()) ?? match;
  });
}

/**
 * Decode CSS escapes (`\30FB`, `\0030`, `\g`) so corpus collection sees the
 * rendered character instead of the escape sequence. Over-approximate by
 * design: this text is only used to decide which shards to keep.
 */
export function decodeCssEscapes(text) {
  return text.replace(CSS_ESCAPE_PATTERN, (match, hex, literal) => {
    if (hex) {
      const codePoint = Number.parseInt(hex, 16);
      return Number.isInteger(codePoint) && codePoint > 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    }
    if (literal === '\n' || literal === '\r' || literal === '\f') return match;
    return literal;
  });
}

/** Collect every Unicode code point of `text` into `into`. */
export function collectCorpus(text, into = new Set()) {
  if (typeof text !== 'string') return into;
  for (let index = 0; index < text.length; index += 1) {
    const codePoint = text.codePointAt(index);
    into.add(codePoint);
    if (codePoint > 0xffff) index += 1;
  }
  return into;
}

export function parseUnicodeRangeToken(token) {
  const text = String(token ?? '').trim();
  const match = /^U\+([0-9A-F?]{1,6})(?:-([0-9A-F]{1,6}))?$/i.exec(text);
  if (!match) throw new Error(`invalid unicode range: ${text}`);
  const pattern = match[1];
  const wildcardIndex = pattern.indexOf('?');
  const startText =
    wildcardIndex === -1
      ? pattern
      : `${pattern.slice(0, wildcardIndex)}${'0'.repeat(pattern.length - wildcardIndex)}`;
  const endText =
    wildcardIndex === -1
      ? (match[2] ?? pattern)
      : `${pattern.slice(0, wildcardIndex)}${'F'.repeat(pattern.length - wildcardIndex)}`;
  const start = Number.parseInt(startText, 16);
  const end = Number.parseInt(endText, 16);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start > end || end > 0x10ffff) {
    throw new Error(`invalid unicode range: ${text}`);
  }
  return [start, end];
}

function unquote(value) {
  const text = String(value ?? '').trim();
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return text.slice(1, -1);
  }
  return text;
}

export const unquoteCssValue = unquote;

/**
 * Parse `@font-face` rules in source order.
 *
 * `ranges === null` means the rule has no `unicode-range` declaration and must
 * always be kept (the browser can use it for any character).
 */
export function parseFontFaceRules(css) {
  const text = typeof css === 'string' ? css : '';
  const rules = [];
  for (const match of text.matchAll(FONT_FACE_PATTERN)) {
    const raw = match[0];
    const start = match.index ?? 0;
    const body = FONT_FACE_BODY_PATTERN.exec(raw)?.[1] ?? '';
    const familyMatch = FONT_FAMILY_PATTERN.exec(body);
    const family = familyMatch
      ? unquote(familyMatch[1] ?? familyMatch[2] ?? familyMatch[3] ?? '')
      : null;
    const urls = [];
    for (const urlMatch of body.matchAll(FONT_URL_PATTERN)) {
      const url = unquote(urlMatch[1] ?? urlMatch[2] ?? urlMatch[3] ?? '');
      if (!url || /^data:/i.test(url)) continue;
      if (!urls.includes(url)) urls.push(url);
    }
    const rangeMatch = UNICODE_RANGE_PATTERN.exec(body);
    let ranges = null;
    if (rangeMatch) {
      ranges = rangeMatch[1]
        .split(',')
        .map((token) => token.trim())
        .filter(Boolean)
        .map((token) => parseUnicodeRangeToken(token));
    }
    rules.push({
      raw,
      family,
      urls,
      ranges,
      start,
      end: start + raw.length,
    });
  }
  return rules;
}

function htmlCommentRanges(html) {
  const ranges = [];
  const pattern = /<!--[\s\S]*?-->/g;
  for (const match of html.matchAll(pattern)) {
    ranges.push([match.index ?? 0, (match.index ?? 0) + match[0].length]);
  }
  return ranges;
}

function insideRanges(ranges, index) {
  return ranges.some(([start, end]) => index >= start && index < end);
}

/**
 * All `<style>` elements of an HTML document, in document order.
 * Styles inside HTML comments are skipped (they are not applied).
 */
export function extractInlineStyles(html) {
  const text = typeof html === 'string' ? html : '';
  const comments = htmlCommentRanges(text);
  const styles = [];
  for (const match of text.matchAll(STYLE_ELEMENT_PATTERN)) {
    const elementStart = match.index ?? 0;
    if (insideRanges(comments, elementStart)) continue;
    const attributes = match[1] ?? '';
    const css = match[2] ?? '';
    const contentStart = elementStart + match[0].indexOf('>') + 1;
    styles.push({
      attributes,
      css,
      elementStart,
      elementEnd: elementStart + match[0].length,
      contentStart,
      contentEnd: contentStart + css.length,
    });
  }
  return styles;
}

/** All `style="..."` attribute values of an HTML document. */
export function extractStyleAttributes(html) {
  const text = typeof html === 'string' ? html : '';
  const values = [];
  for (const match of text.matchAll(/\bstyle\s*=\s*(["'])([\s\S]*?)\1/gi)) {
    values.push(match[2]);
  }
  return values;
}

/** Local stylesheet / script URLs referenced by the page (no remote or data URLs). */
export function extractLinkedLocalAssets(html) {
  const text = typeof html === 'string' ? html : '';
  const urls = [];
  for (const match of text.matchAll(LINKED_ASSET_PATTERN)) {
    const raw = (match[1] ?? match[2] ?? match[3] ?? '').trim();
    if (!raw) continue;
    if (URL_PROTOCOL_PATTERN.test(raw)) continue;
    const pathname = raw.split('#')[0].split('?')[0];
    const extension = path.posix.extname(pathname).toLowerCase();
    if (extension !== '.css' && extension !== '.js') continue;
    if (!urls.includes(raw)) urls.push(raw);
  }
  return urls;
}

export function isLocalAssetUrl(url) {
  return !URL_PROTOCOL_PATTERN.test(String(url ?? '').trim());
}

/**
 * Derive the `<base>/_astro/` href prefix that font CSS links must use, from an
 * existing (already base-prefixed) font URL such as `/demo/_astro/fonts/x.woff2`.
 */
export function fontCssHrefPrefix(fontUrl) {
  const text = String(fontUrl ?? '');
  const index = text.indexOf('_astro/fonts/');
  if (index === -1) {
    throw new Error(`cannot derive a font CSS prefix from font URL: ${text}`);
  }
  const prefix = `${text.slice(0, index)}_astro/`;
  if (!prefix.startsWith('/')) {
    throw new Error(`font CSS prefix must be an absolute site path: ${prefix}`);
  }
  return prefix;
}

function defaultExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Resolve a site URL to a file under `dist`.
 *
 * - rejects remote / `data:` / protocol-relative URLs;
 * - rejects `..` segments and any resolution escaping `distRoot`;
 * - resolves build-base prefixes (`/demo/_astro/...`) by retrying from `_astro/`;
 * - never creates or deletes anything: callers decide from `exists`.
 */
export function resolveDistAsset(distRoot, pagePath, url, { exists = defaultExists } = {}) {
  const rawUrl = String(url ?? '').trim();
  if (!rawUrl) throw new Error('cannot resolve an empty asset URL');
  if (URL_PROTOCOL_PATTERN.test(rawUrl)) {
    throw new Error(`asset URL is not a local path: ${rawUrl}`);
  }
  if (rawUrl.includes('\\')) throw new Error(`asset URL contains a backslash: ${rawUrl}`);
  const pathname = safeDecode(rawUrl.split('#')[0].split('?')[0]);
  if (pathname.includes('\0')) throw new Error(`asset URL contains a NUL byte: ${rawUrl}`);

  const root = path.resolve(distRoot);
  const sitePath = pathname.startsWith('/')
    ? pathname
    : path.posix.resolve(path.posix.dirname(`/${pagePath ?? ''}`), pathname);

  const resolveUnder = (relativePath) => {
    if (relativePath.split('/').some((segment) => segment === '..')) {
      throw new Error(`asset URL contains a parent segment: ${rawUrl}`);
    }
    const absolutePath = path.resolve(root, relativePath);
    const relative = path.relative(root, absolutePath);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`asset URL escapes ${toPosixPath(root)}: ${rawUrl}`);
    }
    return { absolutePath, relativePath: toPosixPath(relative) };
  };

  const trimmed = sitePath.replace(/^\/+/, '');
  const primary = resolveUnder(trimmed);
  if (exists(primary.absolutePath)) {
    return { ...primary, url: rawUrl, basePrefix: '/', exists: true };
  }
  const astroIndex = trimmed.indexOf('_astro/');
  if (astroIndex > 0) {
    const fallback = resolveUnder(trimmed.slice(astroIndex));
    if (exists(fallback.absolutePath)) {
      return {
        ...fallback,
        url: rawUrl,
        basePrefix: `/${trimmed.slice(0, astroIndex).replace(/\/+$/, '')}`,
        exists: true,
      };
    }
  }
  return { ...primary, url: rawUrl, basePrefix: '/', exists: false };
}

export function rangeCovers(range, codePoint) {
  return codePoint >= range[0] && codePoint <= range[1];
}

export function ruleKeepsCodePoint(rule, codePoint) {
  if (!rule.ranges || rule.ranges.length === 0) return true;
  return rule.ranges.some((range) => rangeCovers(range, codePoint));
}

/** Ascending array of code points, for binary-searched range intersection. */
export function sortedCorpus(corpus) {
  return [...corpus].sort((left, right) => left - right);
}

function sortedCorpusIntersectsRange(sorted, start, end) {
  let low = 0;
  let high = sorted.length - 1;
  let found = -1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (sorted[middle] >= start) {
      found = middle;
      high = middle - 1;
    } else {
      low = middle + 1;
    }
  }
  return found !== -1 && sorted[found] <= end;
}

/** `ranges === null` (no `unicode-range`) always intersects: it must be kept. */
export function ruleIntersectsSortedCorpus(rule, sorted) {
  if (!rule.ranges || rule.ranges.length === 0) return true;
  if (sorted.length === 0) return false;
  return rule.ranges.some(([start, end]) => sortedCorpusIntersectsRange(sorted, start, end));
}
