import fs from 'node:fs/promises';
import path from 'node:path';
import { loadAndValidateFontState } from './lib/repository.mjs';
import { PROJECT_ROOT, resolveProjectPath, toPosixPath } from './lib/paths.mjs';
import { stableStringify, writeFileAtomic } from './lib/json.mjs';

const CJK_RANGES = [
  [0x2e80, 0x2fff],
  [0x3005, 0x3005],
  [0x3007, 0x3007],
  [0x3021, 0x3029],
  [0x3038, 0x303b],
  [0x3040, 0x30ff],
  [0x31f0, 0x31ff],
  [0x3400, 0x4dbf],
  [0x4e00, 0x9fff],
  [0xf900, 0xfaff],
  [0x20000, 0x2fa1f],
  [0x30000, 0x3ffff],
];

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);
const HIDDEN_RAW_TEXT_TAGS = new Set(['script', 'style', 'template', 'noscript']);

const ENTITIES = new Map([
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

export function isCjkCodePoint(codePoint) {
  return CJK_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end);
}

function findTagEnd(html, start) {
  let quote = null;
  for (let index = start; index < html.length; index += 1) {
    const character = html[index];
    if (quote) {
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '>') return index;
  }
  return -1;
}

function startTagHasHiddenAttribute(html, tagStart, tagEnd, tagName) {
  let index = tagStart + 1 + tagName.length;
  while (index < tagEnd) {
    while (index < tagEnd && /[\s/]/.test(html[index])) index += 1;
    const nameStart = index;
    while (index < tagEnd && !/[\s=/>]/.test(html[index])) index += 1;
    if (nameStart === index) {
      index += 1;
      continue;
    }
    const attributeName = html.slice(nameStart, index).toLowerCase();
    while (index < tagEnd && /\s/.test(html[index])) index += 1;
    if (html[index] === '=') {
      index += 1;
      while (index < tagEnd && /\s/.test(html[index])) index += 1;
      if (html[index] === '"' || html[index] === "'") {
        const quote = html[index];
        index += 1;
        while (index < tagEnd && html[index] !== quote) index += 1;
        index += 1;
      } else {
        while (index < tagEnd && !/[\s>]/.test(html[index])) index += 1;
      }
    }
    if (attributeName === 'hidden') return true;
  }
  return false;
}

function findRawTextEnd(html, tagName, start) {
  const pattern = new RegExp(`</\\s*${tagName}\\s*>`, 'ig');
  pattern.lastIndex = start;
  const match = pattern.exec(html);
  return match ? { start: match.index, end: match.index + match[0].length } : null;
}

function decodeEntities(text) {
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
    return ENTITIES.get(value.toLowerCase()) ?? match;
  });
}

export function extractVisibleText(html) {
  const body = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(html)?.[1] ?? '';
  const stack = [];
  let hiddenDepth = 0;
  let index = 0;
  let text = '';

  while (index < body.length) {
    const tagStart = body.indexOf('<', index);
    if (tagStart === -1) {
      if (hiddenDepth === 0) text += body.slice(index);
      break;
    }
    if (tagStart > index && hiddenDepth === 0) text += body.slice(index, tagStart);
    if (body.startsWith('<!--', tagStart)) {
      const commentEnd = body.indexOf('-->', tagStart + 4);
      index = commentEnd === -1 ? body.length : commentEnd + 3;
      continue;
    }
    const tagEnd = findTagEnd(body, tagStart + 1);
    if (tagEnd === -1) {
      if (hiddenDepth === 0) text += body.slice(tagStart);
      break;
    }
    const token = body.slice(tagStart, tagEnd + 1);
    const match = /^<\s*(\/?)\s*([A-Za-z][A-Za-z0-9:-]*)/.exec(token);
    if (!match) {
      if (hiddenDepth === 0) text += token;
      index = tagEnd + 1;
      continue;
    }

    const closing = match[1] === '/';
    const tagName = match[2].toLowerCase();
    if (closing) {
      let openIndex = -1;
      for (let stackIndex = stack.length - 1; stackIndex >= 0; stackIndex -= 1) {
        if (stack[stackIndex].name === tagName) {
          openIndex = stackIndex;
          break;
        }
      }
      if (openIndex !== -1) {
        for (let stackIndex = stack.length - 1; stackIndex >= openIndex; stackIndex -= 1) {
          if (stack[stackIndex].hidden) hiddenDepth -= 1;
        }
        stack.length = openIndex;
      }
      index = tagEnd + 1;
      continue;
    }

    if (HIDDEN_RAW_TEXT_TAGS.has(tagName)) {
      const rawEnd = findRawTextEnd(body, tagName, tagEnd + 1);
      index = rawEnd ? rawEnd.end : body.length;
      continue;
    }
    if (tagName === 'textarea') {
      const rawEnd = findRawTextEnd(body, tagName, tagEnd + 1);
      if (hiddenDepth === 0) {
        text += body.slice(tagEnd + 1, rawEnd?.start ?? body.length);
      }
      index = rawEnd ? rawEnd.end : body.length;
      continue;
    }

    const selfClosing = /\/\s*>$/.test(token);
    if (!selfClosing && !VOID_TAGS.has(tagName)) {
      const hidden = startTagHasHiddenAttribute(body, tagStart, tagEnd, tagName);
      stack.push({ name: tagName, hidden });
      if (hidden) hiddenDepth += 1;
    }
    index = tagEnd + 1;
  }

  return decodeEntities(text);
}

function styleSources(html) {
  const withoutComments = html.replace(/<!--[\s\S]*?-->/g, ' ');
  const sources = [];
  for (const match of withoutComments.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)) {
    sources.push(match[1]);
  }
  for (const match of withoutComments.matchAll(/\bstyle\s*=\s*(["'])([\s\S]*?)\1/gi)) {
    sources.push(match[2]);
  }
  return sources.join('\n');
}

function parseUnicodeRange(token) {
  const match = /^U\+([0-9A-F?]{1,6})(?:-([0-9A-F]{1,6}))?$/i.exec(token);
  if (!match) throw new Error(`invalid unicode range in catalog snapshot: ${token}`);
  const pattern = match[1];
  const wildcardIndex = pattern.indexOf('?');
  const startText =
    wildcardIndex === -1 ? pattern : `${pattern.slice(0, wildcardIndex)}${'0'.repeat(pattern.length - wildcardIndex)}`;
  const patternEndText =
    wildcardIndex === -1 ? pattern : `${pattern.slice(0, wildcardIndex)}${'F'.repeat(pattern.length - wildcardIndex)}`;
  const start = Number.parseInt(startText, 16);
  const end = Number.parseInt(match[2] ?? patternEndText, 16);
  if (start > end || end > 0x10ffff) {
    throw new Error(`invalid unicode range in catalog snapshot: ${token}`);
  }
  return [start, end];
}

function mergeIntervals(intervals) {
  const sorted = [...intervals].sort((left, right) => left[0] - right[0] || left[1] - right[1]);
  const merged = [];
  for (const interval of sorted) {
    const previous = merged.at(-1);
    if (!previous || interval[0] > previous[1] + 1) merged.push([...interval]);
    else previous[1] = Math.max(previous[1], interval[1]);
  }
  return merged;
}

function coverageForFamily(family) {
  const intervals = [];
  let coversAll = false;
  for (const variant of family.manifest.variants) {
    if (!variant.unicodeRange) {
      coversAll = true;
      break;
    }
    for (const token of variant.unicodeRange) intervals.push(parseUnicodeRange(token));
  }
  return { coversAll, intervals: mergeIntervals(intervals) };
}

function covers(intervals, codePoint) {
  let low = 0;
  let high = intervals.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const [start, end] = intervals[middle];
    if (codePoint < start) high = middle - 1;
    else if (codePoint > end) low = middle + 1;
    else return true;
  }
  return false;
}

async function findHtmlFiles(root) {
  const files = [];
  const visit = async (directory) => {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`dist contains a symlink: ${fullPath}`);
      if (entry.isDirectory()) await visit(fullPath);
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath);
    }
  };
  await visit(root);
  return files;
}

async function findAuditTextFiles(root) {
  const extensions = new Set(['.html', '.css', '.js', '.json']);
  const files = [];
  const visit = async (directory) => {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`dist contains a symlink: ${fullPath}`);
      if (entry.isDirectory()) await visit(fullPath);
      else if (entry.isFile() && extensions.has(path.extname(entry.name))) files.push(fullPath);
    }
  };
  await visit(root);
  return files;
}

async function verifyArtifactSafety(distRoot) {
  const files = await findAuditTextFiles(distRoot);
  const externalFontPattern =
    /(?:https?:)?\/\/(?:cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)\/|(?:https?:)?\/\/[^\s"'<>]+\.(?:woff2?|ttf|otf)(?:[?#\s"'<>]|$)/i;
  const machinePathPatterns = [
    /\.local-fonts/i,
    /F:\\SenrenBanka-fonts/i,
    /(?:^|[\\/])src[\\/]assets[\\/]fonts[\\/]/i,
    /(?:^|[^A-Za-z0-9+.-])[A-Za-z]:[\\/]/,
  ];
  for (const filePath of files) {
    const text = await fs.readFile(filePath, 'utf8');
    const relative = toPosixPath(path.relative(distRoot, filePath));
    if (externalFontPattern.test(text)) {
      throw new Error(`dist contains a third-party font URL: ${relative}`);
    }
    if (machinePathPatterns.some((pattern) => pattern.test(text))) {
      throw new Error(`dist contains a machine-specific or legacy font path: ${relative}`);
    }
  }
  return files.length;
}

export async function auditFonts({
  projectRoot = PROJECT_ROOT,
  distDir = 'dist',
  jsonPath,
  logger = () => {},
} = {}) {
  const state = await loadAndValidateFontState({ projectRoot });
  const coreFamilies = Object.entries(state.snapshot.families)
    .filter(([, family]) => family.manifest.role === 'core-cjk')
    .map(([id, family]) => ({
      id,
      name: family.manifest.familyName,
      cssVariable: family.manifest.cssVariable,
      coverage: coverageForFamily(family),
    }));
  const distRoot = path.isAbsolute(distDir)
    ? distDir
    : resolveProjectPath(projectRoot, distDir);
  let htmlFiles;
  try {
    const stat = await fs.stat(distRoot);
    if (!stat.isDirectory()) throw new Error('not a directory');
    htmlFiles = await findHtmlFiles(distRoot);
  } catch (error) {
    throw new Error(`cannot scan ${distDir}: ${error.message}. Run astro build first.`);
  }
  if (htmlFiles.length === 0) throw new Error(`cannot audit fonts: ${distDir} contains no HTML files`);
  const auditTextFiles = await verifyArtifactSafety(distRoot);

  const pages = [];
  const uncovered = [];
  let pagesWithoutActiveCoreFont = 0;
  let notedCodePoints = 0;
  for (const htmlFile of htmlFiles) {
    const html = await fs.readFile(htmlFile, 'utf8');
    const styles = styleSources(html);
    const active = coreFamilies.filter((family) =>
      new RegExp(`${family.cssVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`).test(
        styles,
      ),
    );
    if (active.length === 0) {
      pagesWithoutActiveCoreFont += 1;
      continue;
    }
    const page = `/${toPosixPath(path.relative(distRoot, htmlFile)).replace(/index\.html$/, '')}`;
    const text = extractVisibleText(html);
    const seen = new Set();
    const missing = [];
    for (const character of text) {
      const codePoint = character.codePointAt(0);
      if (!isCjkCodePoint(codePoint) || seen.has(codePoint)) continue;
      seen.add(codePoint);
      const covered = active.some(
        (family) => family.coverage.coversAll || covers(family.coverage.intervals, codePoint),
      );
      if (!covered) {
        const issue = {
          page,
          character,
          codePoint: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
          activeCoreFonts: active.map((family) => ({
            id: family.id,
            name: family.name,
            cssVariable: family.cssVariable,
          })),
        };
        missing.push(issue);
        uncovered.push(issue);
      }
    }
    notedCodePoints += seen.size;
    pages.push({
      page,
      activeCoreFonts: active.map((family) => family.id),
      checkedCodePoints: seen.size,
      uncovered: missing,
    });
  }

  if (pages.length === 0) {
    throw new Error('font audit found no candidate HTML page with a core CJK font variable');
  }

  const reportPath = jsonPath
    ? path.isAbsolute(jsonPath)
      ? jsonPath
      : resolveProjectPath(projectRoot, jsonPath)
    : resolveProjectPath(projectRoot, '.cache/fonts/audit-report.json');
  const report = {
    schemaVersion: 1,
    catalogVersion: state.snapshot.catalogVersion,
    htmlFiles: htmlFiles.length,
    auditTextFiles,
    candidatePages: pages.length,
    pagesWithoutActiveCoreFont,
    checkedCodePoints: notedCodePoints,
    uncovered,
    pages,
    artifactSafety: {
      externalFontReferences: 0,
      machinePathReferences: 0,
    },
  };
  await writeFileAtomic(reportPath, stableStringify(report));
  const reportDisplay = toPosixPath(path.relative(projectRoot, reportPath)) || reportPath;

  for (const issue of uncovered.slice(0, 25)) {
    logger(
      `warning: ${issue.page} ${issue.character} (${issue.codePoint}) is not covered by active core font(s) ${issue.activeCoreFonts.map((family) => family.id).join(', ')}`,
    );
  }
  if (uncovered.length > 25) logger(`warning: ${uncovered.length - 25} more uncovered code points omitted`);
  if (uncovered.length > 0) {
    logger(
      `font audit found ${uncovered.length} uncovered CJK code points; report: ${reportDisplay}`,
    );
  } else {
    logger(
      `font audit passed: ${pages.length} candidate pages, ${notedCodePoints} CJK code points; report: ${reportDisplay}`,
    );
  }
  return {
    ...report,
    reportPath,
    reportDisplay,
  };
}
