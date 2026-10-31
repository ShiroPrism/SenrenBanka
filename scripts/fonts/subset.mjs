import { readFileSync } from 'node:fs';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import * as fontkitten from 'fontkitten';
import subsetFont from 'subset-font';
import { loadAndValidateFontState } from './lib/repository.mjs';
import { validateSourceManifest } from './lib/archive.mjs';
import { sha256, stableStringify, writeFileAtomic } from './lib/json.mjs';
import {
  PROJECT_ROOT,
  resolveProjectPath,
  sourceCacheRelativePath,
  toPosixPath,
} from './lib/paths.mjs';
import {
  collectCorpus,
  decodeCssEscapes,
  decodeHtmlEntities,
  extractInlineStyles,
  extractLinkedLocalAssets,
  extractStyleAttributes,
  fontCssHrefPrefix,
  parseFontFaceRules,
  resolveDistAsset,
  unquoteCssValue,
} from './lib/font-css.mjs';
import { extractVisibleText } from './audit.mjs';

const require = createRequire(import.meta.url);

/** Deployed font directory inside `dist`. */
export const FONT_DIRECTORY = '_astro/fonts';
export const REPORT_PATH = '.cache/fonts/subset-report.json';

/** Text assets that can render core-font glyphs; the subset corpus derives from them. */
export const TEXT_ASSET_EXTENSIONS = Object.freeze([
  '.html',
  '.htm',
  '.css',
  '.js',
  '.mjs',
  '.json',
  '.svg',
  '.xml',
  '.txt',
  '.webmanifest',
]);

const HTML_EXTENSIONS = new Set(['.html', '.htm']);
const FONT_CSS_FILE_PATTERN = /^fonts-[0-9a-f]+\.css$/;
/**
 * `@font-face` bodies carry only family names, URLs and unicode-range tokens:
 * no rendered text. Dropping them keeps the corpus stable when the step itself
 * rewrites font rules, so re-running on an already subset `dist` is a no-op.
 */
const FONT_FACE_BLOCK_PATTERN = /@font-face\s*\{[^{}]*\}/gi;

function packageVersion(name) {
  try {
    return require(`${name}/package.json`).version;
  } catch {
    // Some packages hide package.json behind an exports map; walk up from the
    // resolved entry instead of reporting "unknown" in the provenance report.
  }
  try {
    let directory = path.dirname(require.resolve(name));
    for (let depth = 0; depth < 6; depth += 1) {
      try {
        const pkg = JSON.parse(readFileSync(path.join(directory, 'package.json'), 'utf8'));
        if (pkg.name === name) return pkg.version;
      } catch {
        /* keep walking */
      }
      const parent = path.dirname(directory);
      if (parent === directory) break;
      directory = parent;
    }
  } catch {
    /* fall through */
  }
  return 'unknown';
}

export const SUBSETTER = Object.freeze({
  name: 'subset-font',
  version: packageVersion('subset-font'),
});
export const COVERAGE_READER = Object.freeze({
  name: 'fontkitten',
  version: packageVersion('fontkitten'),
});

async function walkFiles(root, { extensions } = {}) {
  const files = [];
  const visit = async (directory) => {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`dist contains a symlink: ${fullPath}`);
      if (entry.isDirectory()) {
        await visit(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (extensions && !extensions.has(path.extname(entry.name).toLowerCase())) continue;
      files.push(fullPath);
    }
  };
  await visit(root);
  return files;
}

function pageLabel(distRoot, htmlFile) {
  return `/${toPosixPath(path.relative(distRoot, htmlFile)).replace(/index\.html$/, '')}`;
}

/**
 * Select the `role: core-cjk` families that get a content subset, plus the
 * single face (weight/style/display) each one deploys.
 *
 * A core family with more than one face cannot be represented by one subset
 * file, so it fails instead of silently dropping a face.
 */
function coreFaces(snapshot) {
  const cores = [];
  for (const id of Object.keys(snapshot.families).sort()) {
    const family = snapshot.families[id];
    const manifest = family.manifest;
    if (manifest.role !== 'core-cjk') continue;
    const faces = new Map();
    for (const variant of manifest.variants) {
      const weight = String(variant.weight ?? variant.font?.weight ?? '');
      const style = variant.style ?? 'normal';
      const display = variant.display ?? 'swap';
      faces.set(`${weight}|${style}|${display}`, { weight, style, display });
    }
    if (faces.size !== 1) {
      throw new Error(
        `core font ${id} declares ${faces.size} distinct faces (${[...faces.keys()].join(', ')}); one content subset per family cannot represent multiple faces yet`,
      );
    }
    const [face] = faces.values();
    cores.push({
      id,
      family,
      version: family.version,
      cssVariable: manifest.cssVariable,
      face,
    });
  }
  return cores;
}

/**
 * Load and verify the single source font of a core family from
 * `.cache/font-sources/<catalogVersion>/<id>@<version>/`.
 */
async function loadCoreSource({ projectRoot, snapshot, core }) {
  const cacheRelative = sourceCacheRelativePath(snapshot.catalogVersion, core.id, core.version);
  const cacheRoot = resolveProjectPath(projectRoot, cacheRelative);
  const manifestPath = path.join(cacheRoot, 'source-manifest.json');
  let manifestBytes;
  try {
    manifestBytes = await fs.readFile(manifestPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(`core font source cache for ${core.id} cannot be read: ${error.message}`);
    }
    throw new Error(
      `core font source cache is missing for ${core.id} (${cacheRelative}/source-manifest.json). ` +
        'Run npm run fonts:prepare to download the locked source archive.',
    );
  }

  let rawManifest;
  try {
    rawManifest = JSON.parse(manifestBytes.toString('utf8'));
  } catch (error) {
    throw new Error(
      `core font source cache for ${core.id} has an invalid source-manifest.json: ${error.message}. ` +
        'Run npm run fonts:prepare to repair the locked source archive.',
    );
  }

  let validated;
  try {
    validated = validateSourceManifest(rawManifest, {
      id: core.id,
      version: core.version,
      source: core.family.source,
      manifest: core.family.manifest,
    });
  } catch (error) {
    throw new Error(`${error.message}. Run npm run fonts:prepare to repair the locked source archive.`);
  }
  if (validated.sourceFiles.length !== 1) {
    throw new Error(
      `core font ${core.id} has ${validated.sourceFiles.length} source font files; one content subset per family needs exactly one source font`,
    );
  }

  const [sourceFile] = validated.sourceFiles;
  const sourcePath = path.join(cacheRoot, ...sourceFile.file.split('/'));
  let buffer;
  try {
    buffer = await fs.readFile(sourcePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(`core source font for ${core.id} cannot be read: ${error.message}`);
    }
    throw new Error(
      `core source font is missing for ${core.id} (${cacheRelative}/${sourceFile.file}). ` +
        'Run npm run fonts:prepare to download the locked source archive.',
    );
  }
  if (buffer.length !== sourceFile.size) {
    throw new Error(
      `core source font for ${core.id} has ${buffer.length} bytes but the catalog declares ${sourceFile.size}. ` +
        'Run npm run fonts:prepare to repair the locked source archive.',
    );
  }
  const sourceSha256 = sha256(buffer);
  if (sourceSha256 !== sourceFile.sha256) {
    throw new Error(
      `core source font for ${core.id} does not match the catalog SHA-256. ` +
        'Run npm run fonts:prepare to repair the locked source archive.',
    );
  }
  return {
    buffer,
    sourceSha256,
    sourceBytes: buffer.length,
    sourceFile: `${cacheRelative}/${sourceFile.file}`,
  };
}

/**
 * Global corpus of every text asset in `dist`.
 *
 * Deliberately over-approximate: raw markup, attributes, inline JSON/scripts,
 * CSS and linked assets are all decoded and collected, so the subset carries
 * every character that could ever be rendered. Extra characters only make the
 * subset slightly larger; the audit still checks the deployed cmap.
 */
export async function buildCorpus(distRoot) {
  const files = await walkFiles(distRoot, { extensions: new Set(TEXT_ASSET_EXTENSIONS) });
  const corpus = new Set();
  let bytes = 0;
  for (const filePath of files) {
    const raw = await fs.readFile(filePath, 'utf8');
    bytes += Buffer.byteLength(raw, 'utf8');
    const text = raw.replace(FONT_FACE_BLOCK_PATTERN, '');
    collectCorpus(decodeHtmlEntities(text), corpus);
    collectCorpus(decodeCssEscapes(text), corpus);
  }
  const sorted = [...corpus].sort((left, right) => left - right);
  const chunks = [];
  for (let index = 0; index < sorted.length; index += 1024) {
    chunks.push(String.fromCodePoint(...sorted.slice(index, index + 1024)));
  }
  const text = chunks.join('');
  return {
    text,
    codePoints: sorted.length,
    sha256: sha256(text),
    textFiles: files.length,
    textBytes: bytes,
  };
}

/**
 * Font family names declared by a `--font-*` variable. The first name is the
 * deployed family; later names are fallbacks and never own `@font-face` rules.
 */
function cssVariableFamilies(css, cssVariable) {
  const pattern = new RegExp(
    `${cssVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*(?:"([^"]*)"|'([^']*)'|([^;}]*))`,
  );
  const match = pattern.exec(css);
  if (!match) return [];
  return (match[1] ?? match[2] ?? match[3] ?? '')
    .split(',')
    .map((value) => unquoteCssValue(value).trim())
    .filter((value) => value !== '');
}

/** CSS actually applied by the page, used only to read the `--font-*` values. */
async function pageCss({ distRoot, label, html, styles }) {
  const parts = styles.map((style) => style.css);
  parts.push(...extractStyleAttributes(html));
  for (const url of extractLinkedLocalAssets(html)) {
    if (!url.split('#')[0].split('?')[0].endsWith('.css')) continue;
    const resolved = resolveDistAsset(distRoot, label, url);
    if (!resolved.exists) continue;
    parts.push(await fs.readFile(resolved.absolutePath, 'utf8'));
  }
  return parts.join('\n');
}

function syntheticRule({ familyName, url, face }) {
  return (
    `@font-face{font-family:"${familyName}";src:url("${url}") format("woff2");` +
    `font-weight:${face.weight};font-style:${face.style};font-display:${face.display};}`
  );
}

/**
 * Remove every `@font-face` rule of `coreRules` from one `<style>` block and
 * insert the planned synthetic rules once, where the first removed rule was.
 */
function rewriteStyleBlock(css, coreRules, plannedRaw) {
  let output = '';
  let cursor = 0;
  let inserted = false;
  for (const rule of coreRules) {
    output += css.slice(cursor, rule.start);
    if (!inserted) {
      output += plannedRaw;
      inserted = true;
    }
    cursor = rule.end;
  }
  output += css.slice(cursor);
  return output;
}

/**
 * Replace the core-font shard rules of a built `dist` with one content-subset
 * `@font-face` per core family.
 *
 * Runs after `astro build` and before `fonts:prune`: the inline `@font-face`
 * rules are still page-local, so no shared CSS bundle has to be rewritten.
 * Never touches font sources, the catalog, or design CSS.
 */
export async function subsetCoreFonts({
  projectRoot = PROJECT_ROOT,
  distDir = 'dist',
  dryRun = false,
  reportPath: reportPathOption = REPORT_PATH,
  logger = () => {},
} = {}) {
  const state = await loadAndValidateFontState({ projectRoot });
  const distRoot = path.isAbsolute(distDir) ? distDir : resolveProjectPath(projectRoot, distDir);
  try {
    const stat = await fs.stat(distRoot);
    if (!stat.isDirectory()) throw new Error('not a directory');
  } catch (error) {
    throw new Error(`cannot scan ${distDir}: ${error.message}. Run astro build first.`);
  }
  const distLabel = toPosixPath(path.relative(path.resolve(projectRoot), distRoot)) || '.';
  const reportPath = path.isAbsolute(reportPathOption)
    ? reportPathOption
    : resolveProjectPath(projectRoot, reportPathOption);
  const reportDisplay = toPosixPath(path.relative(path.resolve(projectRoot), reportPath)) || reportPath;

  const cores = coreFaces(state.snapshot);
  const htmlFiles = await walkFiles(distRoot, { extensions: HTML_EXTENSIONS });
  if (htmlFiles.length === 0) {
    throw new Error(
      `cannot subset fonts: ${distLabel} contains no HTML files. Run astro build first.`,
    );
  }

  if (cores.length === 0) {
    logger('no core-cjk families selected; nothing to subset');
    const report = {
      schemaVersion: 1,
      dist: distLabel,
      dryRun,
      catalogVersion: state.snapshot.catalogVersion,
      corpusSha256: null,
      corpusCodePoints: 0,
      corpusTextFiles: 0,
      subsetter: { ...SUBSETTER },
      coverageReader: { ...COVERAGE_READER },
      families: [],
      pages: [],
    };
    if (!dryRun) await writeFileAtomic(reportPath, stableStringify(report));
    return { ...report, reportPath, reportDisplay };
  }

  const corpus = await buildCorpus(distRoot);
  if (corpus.text.length === 0) {
    throw new Error(`cannot subset fonts: ${distLabel} contains no readable text assets`);
  }
  logger(
    `corpus: ${corpus.codePoints} code points from ${corpus.textFiles} text assets (${corpus.textBytes} bytes)`,
  );

  // Pass 1: one subset file per core family.
  const subsets = [];
  for (const core of cores) {
    const source = await loadCoreSource({ projectRoot, snapshot: state.snapshot, core });
    const output = await subsetFont(source.buffer, corpus.text, { targetFormat: 'woff2' });
    if (!Buffer.isBuffer(output) || output.subarray(0, 4).toString('ascii') !== 'wOF2') {
      throw new Error(`subset-font did not return a WOFF2 buffer for ${core.id}`);
    }
    const subsetSha256 = sha256(output);
    const fileName = `${core.id}-subset-${subsetSha256.slice(0, 16)}.woff2`;
    const characters = fontkitten.create(output).characterSet.length;
    subsets.push({
      id: core.id,
      core,
      fileName,
      buffer: output,
      bytes: output.length,
      sha256: subsetSha256,
      characters,
      source,
    });
    logger(
      `subset ${core.id}: ${source.sourceBytes} -> ${output.length} bytes, ${characters} characters (${fileName})`,
    );
  }
  const subsetById = new Map(subsets.map((subset) => [subset.id, subset]));

  // Pass 2: plan the inline `@font-face` rewrite for every HTML page.
  const pagePlans = [];
  let pagesWithCoreRules = 0;
  const summary = [];
  for (const htmlFile of htmlFiles) {
    const label = pageLabel(distRoot, htmlFile);
    const html = await fs.readFile(htmlFile, 'utf8');
    const styles = extractInlineStyles(html);
    const css = await pageCss({ distRoot, label, html, styles });

    const coreByFamilyName = new Map();
    for (const core of cores) {
      for (const familyName of cssVariableFamilies(css, core.cssVariable)) {
        if (!coreByFamilyName.has(familyName)) coreByFamilyName.set(familyName, core);
      }
    }
    const pageCores = [];
    let output = html;
    let shardRules = 0;
    if (coreByFamilyName.size > 0) {
      const emitted = new Set();
      const replacements = [];
      let prefix = null;
      for (const style of styles) {
        const rules = parseFontFaceRules(style.css);
        const coreRules = rules.filter((rule) => rule.family && coreByFamilyName.has(rule.family));
        if (coreRules.length === 0) continue;
        if (prefix === null) {
          const coreUrl = coreRules.flatMap((rule) => rule.urls)[0];
          if (!coreUrl) {
            throw new Error(
              `${label}: a core @font-face rule declares no font URL; cannot derive the subset URL prefix`,
            );
          }
          prefix = fontCssHrefPrefix(coreUrl);
        }
        const planned = [];
        for (const rule of coreRules) {
          const core = coreByFamilyName.get(rule.family);
          pageCores.push(core.id);
          if (rule.ranges && rule.ranges.length > 0) shardRules += 1;
          if (emitted.has(core.id)) continue;
          emitted.add(core.id);
          const subset = subsetById.get(core.id);
          planned.push(
            syntheticRule({
              familyName: rule.family,
              url: `${prefix}fonts/${subset.fileName}`,
              face: core.face,
            }),
          );
        }
        const nextCss = rewriteStyleBlock(style.css, coreRules, planned.join(''));
        if (nextCss === style.css) continue;
        replacements.push({
          elementStart: style.elementStart,
          elementEnd: style.elementEnd,
          replacement:
            nextCss.trim() === '' ? '' : `<style${style.attributes}>${nextCss}</style>`,
        });
      }
      for (const replacement of [...replacements].sort(
        (left, right) => right.elementStart - left.elementStart,
      )) {
        output = `${output.slice(0, replacement.elementStart)}${replacement.replacement}${output.slice(replacement.elementEnd)}`;
      }
    }

    const coreFamilyIds = [...new Set(pageCores)].sort();
    if (coreFamilyIds.length > 0) pagesWithCoreRules += 1;
    const beforeText = extractVisibleText(html);
    const afterText = extractVisibleText(output);
    if (beforeText !== afterText) {
      throw new Error(
        `${label}: the core font subset would change visible text; aborting before any write`,
      );
    }
    const plan = {
      path: label,
      htmlFile,
      original: html,
      output,
      coreFamilies: coreFamilyIds,
      shardRules,
      changed: output !== html,
    };
    pagePlans.push(plan);
    summary.push({
      path: plan.path,
      coreFamilies: coreFamilyIds,
      shardRules,
      changed: plan.changed,
    });
  }

  if (pagesWithCoreRules === 0) {
    const externalized = pagePlans.some((plan) =>
      [...plan.original.matchAll(/<link\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].some(
        (match) => FONT_CSS_FILE_PATTERN.test(path.posix.basename((match[1] ?? match[2] ?? '').split('?')[0])),
      ),
    );
    if (externalized) {
      throw new Error(
        `cannot subset fonts: ${distLabel} already has externalized font CSS (fonts:prune ran). ` +
          'Run astro build again before fonts:subset.',
      );
    }
    // A Latin-only fork may keep the catalog but use no core-cjk design. That is
    // a valid build: skip the subset instead of failing the whole site.
    logger(
      `no inline @font-face rule for a core-cjk family in ${distLabel}; skipping core content subset`,
    );
    const report = {
      schemaVersion: 1,
      dist: distLabel,
      dryRun,
      catalogVersion: state.snapshot.catalogVersion,
      corpusSha256: corpus.sha256,
      corpusCodePoints: corpus.codePoints,
      corpusTextFiles: corpus.textFiles,
      corpusTextBytes: corpus.textBytes,
      subsetter: { ...SUBSETTER },
      coverageReader: { ...COVERAGE_READER },
      families: [],
      pages: summary,
      subsetBytes: 0,
      subsetFileCount: 0,
    };
    if (!dryRun) await writeFileAtomic(reportPath, stableStringify(report));
    return { ...report, reportPath, reportDisplay: REPORT_PATH };
  }

  const report = {
    schemaVersion: 1,
    dist: distLabel,
    dryRun,
    catalogVersion: state.snapshot.catalogVersion,
    corpusSha256: corpus.sha256,
    corpusCodePoints: corpus.codePoints,
    corpusTextFiles: corpus.textFiles,
    corpusTextBytes: corpus.textBytes,
    subsetter: { ...SUBSETTER },
    coverageReader: { ...COVERAGE_READER },
    families: subsets.map((subset) => ({
      id: subset.id,
      cssVariable: subset.core.cssVariable,
      sourceFile: subset.source.sourceFile,
      sourceSha256: subset.source.sourceSha256,
      sourceBytes: subset.source.sourceBytes,
      subsetFile: `${FONT_DIRECTORY}/${subset.fileName}`,
      subsetSha256: subset.sha256,
      subsetBytes: subset.bytes,
      characters: subset.characters,
      weight: subset.core.face.weight,
      style: subset.core.face.style,
      display: subset.core.face.display,
    })),
    subsetBytes: subsets.reduce((total, subset) => total + subset.bytes, 0),
    pages: summary,
  };

  if (!dryRun) {
    const fontDirectory = path.resolve(distRoot, ...FONT_DIRECTORY.split('/'));
    await fs.mkdir(fontDirectory, { recursive: true });
    for (const subset of subsets) {
      const subsetPath = path.join(fontDirectory, subset.fileName);
      let existing = null;
      try {
        existing = await fs.readFile(subsetPath);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      if (existing === null || Buffer.compare(existing, subset.buffer) !== 0) {
        await fs.writeFile(subsetPath, subset.buffer);
      }
    }
    for (const plan of pagePlans) {
      if (plan.changed) await fs.writeFile(plan.htmlFile, plan.output, 'utf8');
    }
    await writeFileAtomic(reportPath, stableStringify(report));
  }

  const changedPages = pagePlans.filter((plan) => plan.changed).length;
  logger(
    `${dryRun ? 'dry-run: ' : ''}${subsets.length} core subset file(s) / ${report.subsetBytes} bytes; ` +
      `rewrote ${changedPages} of ${pagePlans.length} pages (${pagesWithCoreRules} with core fonts)`,
  );

  return { ...report, reportPath, reportDisplay };
}
