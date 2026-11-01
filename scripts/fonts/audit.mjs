import fs from 'node:fs/promises';
import path from 'node:path';
import { create as createFont } from 'fontkitten';
import { loadAndValidateFontState } from './lib/repository.mjs';
import { PROJECT_ROOT, resolveProjectPath, toPosixPath } from './lib/paths.mjs';
import { stableStringify, writeFileAtomic } from './lib/json.mjs';
import {
  FONT_EXTENSIONS,
  decodeHtmlEntities,
  extractInlineStyles,
  extractLinkedLocalAssets,
  extractStyleAttributes,
  parseFontFaceRules,
  parseUnicodeRangeToken,
  resolveDistAsset,
  unquoteCssValue,
} from './lib/font-css.mjs';
import { HANGUL_RANGES, isHangulCodePoint } from './lib/script-ranges.mjs';

const FONT_DIRECTORY = '_astro/fonts';

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
  ...HANGUL_RANGES,
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

export function isCjkCodePoint(codePoint) {
  return CJK_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end);
}

function codePointScript(codePoint) {
  return isHangulCodePoint(codePoint) ? 'hangul' : 'cjk';
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
  return decodeHtmlEntities(text);
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

/**
 * CSS actually applied by the page: inline `<style>` blocks, `style=""`
 * attributes and linked local stylesheets (the pruned font CSS lives there).
 */
async function pageCss(distRoot, pagePath, html) {
  const parts = extractInlineStyles(html).map((style) => style.css);
  parts.push(...extractStyleAttributes(html));
  for (const url of extractLinkedLocalAssets(html)) {
    if (!url.split('#')[0].split('?')[0].endsWith('.css')) continue;
    const resolved = resolveDistAsset(distRoot, pagePath, url);
    if (!resolved.exists) continue;
    parts.push(await fs.readFile(resolved.absolutePath, 'utf8'));
  }
  return parts.join('\n');
}

function cssVariableValue(css, cssVariable) {
  const pattern = new RegExp(
    `${cssVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*(?:"([^"]*)"|'([^']*)'|([^;}]*))`,
  );
  const match = pattern.exec(css);
  if (!match) return null;
  const value = unquoteCssValue(match[1] ?? match[2] ?? match[3] ?? '');
  return value === '' ? null : value;
}

function parseUnicodeRange(token) {
  try {
    return parseUnicodeRangeToken(token);
  } catch {
    throw new Error(`invalid unicode range in catalog snapshot: ${token}`);
  }
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

async function findFontFiles(root) {
  const directory = path.join(root, ...FONT_DIRECTORY.split('/'));
  const files = [];
  const visit = async (dir) => {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    entries.sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`dist contains a symlink: ${fullPath}`);
      if (entry.isDirectory()) {
        await visit(fullPath);
        continue;
      }
      if (entry.isFile() && FONT_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  };
  await visit(directory);
  return files;
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
      scripts: Array.isArray(family.manifest.scripts) ? family.manifest.scripts : ['cjk'],
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
  const deployedGaps = [];
  const danglingFontUrls = [];
  const referencedFontFiles = new Set();
  const characterSetCache = new Map();
  let deployedRules = 0;
  let pagesWithoutActiveCoreFont = 0;
  let notedCodePoints = 0;
  for (const htmlFile of htmlFiles) {
    const html = await fs.readFile(htmlFile, 'utf8');
    const page = `/${toPosixPath(path.relative(distRoot, htmlFile)).replace(/index\.html$/, '')}`;
    const css = await pageCss(distRoot, page, html);
    const rules = parseFontFaceRules(css);
    deployedRules += rules.length;
    for (const rule of rules) {
      for (const url of rule.urls) {
        let resolved;
        try {
          resolved = resolveDistAsset(distRoot, page, url);
        } catch (error) {
          throw new Error(`${page}: ${error.message}`);
        }
        if (!resolved.exists) {
          danglingFontUrls.push({
            page,
            url,
            family: rule.family,
            resolvedPath: resolved.relativePath,
          });
          continue;
        }
        referencedFontFiles.add(path.resolve(resolved.absolutePath));
      }
    }

    const active = coreFamilies
      .map((family) => ({ family, value: cssVariableValue(css, family.cssVariable) }))
      .filter((entry) => entry.value !== null)
      // Locale remaps point at another variable or the TC skip sentinel; neither
      // is a deployed family name, so they must not count as active sources.
      .filter(
        (entry) =>
          entry.value !== '__senrenbanka_tc_skip__' && !/^var\(/i.test(entry.value),
      );
    if (active.length === 0) {
      pagesWithoutActiveCoreFont += 1;
      continue;
    }

    // Deployed coverage: the @font-face rules actually present in this page's
    // CSS after pruning, grouped by the hashed family name of the variable.
    // Rules without unicode-range (content subsets) must be checked against the
    // real font cmap; treating them as coversAll would hide a missing glyph.
    const activeValues = new Set(active.map((entry) => entry.value));
    const deployedByName = new Map();
    for (const rule of rules) {
      if (!rule.family) continue;
      const entry =
        deployedByName.get(rule.family) ?? {
          coversAll: false,
          intervals: [],
          characters: null,
        };
      if (rule.ranges && rule.ranges.length > 0) {
        entry.intervals.push(...rule.ranges);
      } else if (rule.urls.length === 0 || !activeValues.has(rule.family)) {
        // Non-core no-range rules are not consulted by the core coverage check;
        // do not parse them (and do not make an unrelated parse failure fatal).
        entry.coversAll = true;
      } else {
        for (const url of rule.urls) {
          let resolved;
          try {
            resolved = resolveDistAsset(distRoot, page, url);
          } catch (error) {
            throw new Error(`${page}: ${error.message}`);
          }
          if (!resolved.exists) continue; // recorded as dangling above
          const absolutePath = path.resolve(resolved.absolutePath);
          let characters = characterSetCache.get(absolutePath);
          if (!characters) {
            let font;
            try {
              font = createFont(await fs.readFile(absolutePath));
            } catch (error) {
              throw new Error(
                `${page}: deployed font ${url} cannot be parsed for coverage: ${error.message}`,
              );
            }
            characters = new Set(font.characterSet);
            characterSetCache.set(absolutePath, characters);
          }
          entry.characters ??= new Set();
          for (const codePoint of characters) entry.characters.add(codePoint);
        }
      }
      deployedByName.set(rule.family, entry);
    }
    for (const entry of deployedByName.values()) {
      entry.intervals = mergeIntervals(entry.intervals);
    }
    const deployedFor = active.map((entry) => ({
      ...entry,
      deployed: deployedByName.get(entry.value) ?? null,
    }));

    const text = extractVisibleText(html);
    const seen = new Set();
    const missing = [];
    const gaps = [];
    for (const character of text) {
      const codePoint = character.codePointAt(0);
      if (!isCjkCodePoint(codePoint) || seen.has(codePoint)) continue;
      seen.add(codePoint);
      const script = codePointScript(codePoint);
      const activeForScript = active.filter(({ family }) =>
        family.scripts.includes(script),
      );
      if (activeForScript.length === 0) continue;
      const sourceCovered = activeForScript.some(
        ({ family }) => family.coverage.coversAll || covers(family.coverage.intervals, codePoint),
      );
      const deployedForScript = deployedFor.filter(({ family }) =>
        family.scripts.includes(script),
      );
      const deployedCovered = deployedForScript.some(
        ({ deployed }) =>
          deployed !== null &&
          (deployed.coversAll ||
            (deployed.characters !== null && deployed.characters.has(codePoint)) ||
            covers(deployed.intervals, codePoint)),
      );
      const baseIssue = {
        page,
        character,
        codePoint: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
        activeCoreFonts: activeForScript.map(({ family }) => ({
          id: family.id,
          name: family.name,
          cssVariable: family.cssVariable,
        })),
      };
      if (!sourceCovered) {
        missing.push(baseIssue);
        uncovered.push(baseIssue);
      } else if (!deployedCovered) {
        const gap = {
          ...baseIssue,
          deployedFamilies: deployedForScript
            .filter(({ deployed }) => deployed !== null)
            .map(({ value }) => value),
        };
        gaps.push(gap);
        deployedGaps.push(gap);
      }
    }
    notedCodePoints += seen.size;
    pages.push({
      page,
      activeCoreFonts: active.map(({ family }) => family.id),
      checkedCodePoints: seen.size,
      deployedRules: rules.length,
      uncovered: missing,
      deployedGaps: gaps,
    });
  }

  const orphanFontFiles = (await findFontFiles(distRoot))
    .filter((filePath) => !referencedFontFiles.has(path.resolve(filePath)))
    .map((filePath) => toPosixPath(path.relative(distRoot, filePath)));

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
    deployedGaps,
    danglingFontUrls,
    orphanFontFiles,
    deployed: {
      rules: deployedRules,
      fontFilesReferenced: referencedFontFiles.size,
      fontFilesPresent: referencedFontFiles.size + orphanFontFiles.length,
    },
    pages,
    artifactSafety: {
      externalFontReferences: 0,
      machinePathReferences: 0,
    },
  };
  await writeFileAtomic(reportPath, stableStringify(report));
  const reportDisplay = toPosixPath(path.relative(projectRoot, reportPath)) || reportPath;

  if (pages.length === 0) {
    throw new Error('font audit found no candidate HTML page with a core CJK font variable');
  }
  if (danglingFontUrls.length > 0) {
    throw new Error(
      `font audit found ${danglingFontUrls.length} @font-face URL(s) with no file in ${distDir}: ` +
        danglingFontUrls
          .slice(0, 5)
          .map((issue) => `${issue.page} -> ${issue.url}`)
          .join('; '),
    );
  }
  if (deployedGaps.length > 0) {
    throw new Error(
      `font audit found ${deployedGaps.length} CJK/Hangul code point(s) covered by the source font but not by the deployed @font-face rules ` +
        `(pruning/subsetting dropped a needed glyph): ` +
        deployedGaps
          .slice(0, 5)
          .map((issue) => `${issue.page} ${issue.character} (${issue.codePoint})`)
          .join('; '),
    );
  }
  if (orphanFontFiles.length > 0) {
    throw new Error(
      `font audit found ${orphanFontFiles.length} unreferenced font file(s) under ${FONT_DIRECTORY}: ` +
        orphanFontFiles.slice(0, 5).join('; '),
    );
  }

  for (const issue of uncovered.slice(0, 25)) {
    logger(
      `warning: ${issue.page} ${issue.character} (${issue.codePoint}) is not covered by active core font(s) ${issue.activeCoreFonts.map((family) => family.id).join(', ')}`,
    );
  }
  if (uncovered.length > 25) logger(`warning: ${uncovered.length - 25} more uncovered code points omitted`);
  logger(
    `deployed font set: ${deployedRules} @font-face rules, ` +
      `${report.deployed.fontFilesReferenced} referenced font files, 0 orphan`,
  );
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
