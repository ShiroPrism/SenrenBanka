import fs from 'node:fs/promises';
import path from 'node:path';
import { sha256, stableStringify, writeFileAtomic } from './lib/json.mjs';
import { PROJECT_ROOT, resolveProjectPath, toPosixPath } from './lib/paths.mjs';
import {
  FONT_EXTENSIONS,
  collectCorpus,
  decodeCssEscapes,
  decodeHtmlEntities,
  extractInlineStyles,
  extractLinkedLocalAssets,
  fontCssHrefPrefix,
  parseFontFaceRules,
  resolveDistAsset,
  ruleIntersectsSortedCorpus,
  sortedCorpus,
} from './lib/font-css.mjs';
import { extractVisibleText } from './audit.mjs';

/** Hard deployment budget for the whole `dist` tree (1 MiB = 1,048,576 bytes). */
export const SIZE_LIMIT_BYTES = 10 * 1024 * 1024;
export const FONT_DIRECTORY = '_astro/fonts';
export const REPORT_PATH = '.cache/fonts/prune-report.json';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico']);
const FONT_CSS_FILE_PATTERN = /^fonts-[0-9a-f]+\.css$/;

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

function htmlLinkHrefs(html) {
  const hrefs = new Set();
  for (const match of html.matchAll(/<link\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    hrefs.add(match[1] ?? match[2] ?? '');
  }
  return hrefs;
}

function bucketFor(relativePath) {
  if (relativePath.startsWith(`${FONT_DIRECTORY}/`)) return 'fonts';
  const extension = path.posix.extname(relativePath).toLowerCase();
  if (extension === '.html') return 'html';
  if (extension === '.css') return 'css';
  if (extension === '.js') return 'js';
  if (IMAGE_EXTENSIONS.has(extension)) return 'images';
  return 'other';
}

function summarise(files) {
  const buckets = { html: 0, css: 0, js: 0, fonts: 0, images: 0, other: 0 };
  let totalBytes = 0;
  for (const file of files) {
    totalBytes += file.size;
    buckets[bucketFor(file.relativePath)] += file.size;
  }
  const fontFiles = files.filter((file) => bucketFor(file.relativePath) === 'fonts');
  const largest = [...files]
    .sort(
      (left, right) => right.size - left.size || (left.relativePath < right.relativePath ? -1 : 1),
    )
    .slice(0, 10)
    .map((file) => ({ file: file.relativePath, bytes: file.size }));
  return {
    totalBytes,
    buckets,
    fonts: {
      count: fontFiles.length,
      bytes: fontFiles.reduce((sum, file) => sum + file.size, 0),
    },
    largest,
  };
}

async function readDistFiles(distRoot) {
  const files = await walkFiles(distRoot);
  const records = [];
  for (const absolutePath of files) {
    const stat = await fs.stat(absolutePath);
    records.push({
      absolutePath,
      relativePath: toPosixPath(path.relative(distRoot, absolutePath)),
      size: stat.size,
    });
  }
  return records;
}

async function readIfExists(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

/**
 * Deterministic, collision-safe name for a font CSS bundle. Read-only: the
 * caller writes the file once every page plan is known.
 */
async function resolveFontCssName({ cssDir, hash, content }) {
  let length = 16;
  for (;;) {
    const name = `fonts-${hash.slice(0, length)}.css`;
    const existing = await readIfExists(path.join(cssDir, name));
    if (existing === null || existing === content) return name;
    if (length >= 64) {
      throw new Error(`font CSS hash collision for ${name}; cannot externalize deterministically`);
    }
    length += 8;
  }
}

/**
 * Bundle key: pages that reference the same set of font families share one
 * font CSS bundle (locale variants of one design, for example). The bundle
 * carries the union of the `@font-face` rules those pages need; the browser
 * still downloads only the shards whose `unicode-range` matches rendered text.
 *
 * A rule without a parseable `font-family` cannot be shared safely, so such a
 * page gets a page-private bundle.
 */
function bundleKey(keptRules, label) {
  const families = new Set();
  for (const rule of keptRules) {
    if (!rule.family) return `page:${label}`;
    families.add(rule.family);
  }
  return `families:${[...families].sort().join('\u0000')}`;
}

/**
 * Prune unused font shards from a built `dist`, then externalize the remaining
 * `@font-face` rules into shared hashed CSS files.
 *
 * Never opens or rewrites a font file: it only keeps or deletes whole catalog
 * shards, rewrites HTML `<style>` markup and adds one `<link rel="stylesheet">`.
 */
export async function pruneFonts({
  projectRoot = PROJECT_ROOT,
  distDir = 'dist',
  dryRun = false,
  logger = () => {},
} = {}) {
  const distRoot = path.isAbsolute(distDir) ? distDir : resolveProjectPath(projectRoot, distDir);
  try {
    const stat = await fs.stat(distRoot);
    if (!stat.isDirectory()) throw new Error('not a directory');
  } catch (error) {
    throw new Error(`cannot scan ${distDir}: ${error.message}. Run astro build first.`, {
      cause: error,
    });
  }
  const htmlFiles = await walkFiles(distRoot, { extensions: new Set(['.html']) });
  if (htmlFiles.length === 0) {
    throw new Error(
      `cannot prune fonts: ${distDir} contains no HTML files. Run astro build first.`,
    );
  }

  const distLabel = toPosixPath(path.relative(path.resolve(projectRoot), distRoot)) || '.';
  const reportPath = resolveProjectPath(projectRoot, REPORT_PATH);
  const statsBefore = await readDistFiles(distRoot);
  const summaryBefore = summarise(statsBefore);
  const fontFilesBefore = statsBefore.filter(
    (file) =>
      file.relativePath.startsWith(`${FONT_DIRECTORY}/`) &&
      FONT_EXTENSIONS.includes(path.posix.extname(file.relativePath).toLowerCase()),
  );

  // Font URLs declared by stylesheets other than page inline styles (defensive:
  // keeps a shard alive if a shared CSS ever declares @font-face).
  const extraReferenced = new Set();
  const keepAbsolute = new Set();
  for (const file of statsBefore) {
    if (!file.relativePath.endsWith('.css')) continue;
    const css = await fs.readFile(file.absolutePath, 'utf8');
    for (const rule of parseFontFaceRules(css)) {
      for (const url of rule.urls) {
        extraReferenced.add(url);
        try {
          const resolved = resolveDistAsset(distRoot, `/${file.relativePath}`, url);
          if (resolved.exists) keepAbsolute.add(path.resolve(resolved.absolutePath));
        } catch {
          // Reported by the page-level checks below.
        }
      }
    }
  }

  // Pass 1: per-page corpus, rule decision and `<style>` rewrite plan.
  const pagePlans = [];
  const bundles = new Map();
  let removedRulesTotal = 0;
  let keptRulesTotal = 0;
  for (const htmlFile of htmlFiles) {
    const label = pageLabel(distRoot, htmlFile);
    const html = await fs.readFile(htmlFile, 'utf8');
    const styles = extractInlineStyles(html);

    const corpus = collectCorpus(decodeHtmlEntities(html));
    collectCorpus(decodeCssEscapes(html), corpus);
    for (const url of extractLinkedLocalAssets(html)) {
      let resolved;
      try {
        resolved = resolveDistAsset(distRoot, label, url);
      } catch (error) {
        throw new Error(`${label}: ${error.message}`, { cause: error });
      }
      if (!resolved.exists) continue;
      const text = await fs.readFile(resolved.absolutePath, 'utf8');
      collectCorpus(decodeHtmlEntities(text), corpus);
      collectCorpus(decodeCssEscapes(text), corpus);
    }
    const sorted = sortedCorpus(corpus);

    const stylePlans = [];
    const keptRules = [];
    let removedRules = 0;
    let firstFontStyleStart = -1;
    for (const style of styles) {
      const rules = parseFontFaceRules(style.css);
      if (rules.length === 0) continue;
      if (firstFontStyleStart === -1) firstFontStyleStart = style.elementStart;
      const parts = [];
      let cursor = 0;
      for (const rule of rules) {
        // Every @font-face rule leaves the inline block: kept rules move to the
        // shared font CSS bundle, unneeded rules are dropped entirely.
        if (ruleIntersectsSortedCorpus(rule, sorted)) keptRules.push(rule);
        else removedRules += 1;
        parts.push(style.css.slice(cursor, rule.start));
        cursor = rule.end;
      }
      parts.push(style.css.slice(cursor));
      const nextCss = parts.join('');
      stylePlans.push({
        elementStart: style.elementStart,
        elementEnd: style.elementEnd,
        replacement: nextCss.trim() === '' ? '' : `<style${style.attributes}>${nextCss}</style>`,
      });
    }
    removedRulesTotal += removedRules;
    keptRulesTotal += keptRules.length;

    for (const rule of keptRules) {
      for (const url of rule.urls) {
        let resolved;
        try {
          resolved = resolveDistAsset(distRoot, label, url);
        } catch (error) {
          throw new Error(`${label}: ${error.message}`, { cause: error });
        }
        if (!resolved.exists) {
          throw new Error(
            `${label}: @font-face references a font file that is not in ${distLabel}: ${url}`,
          );
        }
        keepAbsolute.add(path.resolve(resolved.absolutePath));
      }
    }

    let bundle = null;
    if (keptRules.length > 0) {
      const key = bundleKey(keptRules, label);
      bundle = bundles.get(key);
      if (!bundle) {
        bundle = { key, rules: [], ruleSet: new Set(), pages: [] };
        bundles.set(key, bundle);
      }
      for (const rule of keptRules) {
        if (bundle.ruleSet.has(rule.raw)) continue;
        bundle.ruleSet.add(rule.raw);
        bundle.rules.push(rule);
      }
      bundle.pages.push(label);
    }

    pagePlans.push({
      label,
      htmlFile,
      original: html,
      stylePlans,
      firstFontStyleStart,
      bundle,
      keptRules: keptRules.length,
      removedRules,
      styleBlocks: styles.length,
    });
  }

  const alreadyPruned = keptRulesTotal === 0 && removedRulesTotal === 0;
  if (alreadyPruned) {
    const existingFontLinks = [];
    for (const plan of pagePlans) {
      for (const match of plan.original.matchAll(
        /<link\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi,
      )) {
        const href = match[1] ?? match[2] ?? '';
        if (!FONT_CSS_FILE_PATTERN.test(path.posix.basename(href.split('?')[0]))) continue;
        existingFontLinks.push({ page: plan.label, href });
      }
    }
    if (existingFontLinks.length === 0) {
      throw new Error(
        `cannot prune fonts: ${distLabel} has neither inline @font-face rules nor external font CSS. Run astro build first.`,
      );
    }
    for (const link of existingFontLinks) {
      let resolved;
      try {
        resolved = resolveDistAsset(distRoot, link.page, link.href);
      } catch (error) {
        throw new Error(`${link.page}: ${error.message}`, { cause: error });
      }
      if (!resolved.exists) {
        throw new Error(`${link.page}: font stylesheet is missing from ${distLabel}: ${link.href}`);
      }
    }
    const stats = summarise(statsBefore);
    const report = {
      schemaVersion: 1,
      dist: distLabel,
      thresholdBytes: SIZE_LIMIT_BYTES,
      dryRun,
      alreadyPruned: true,
      visibleTextUnchanged: true,
      size: stats,
      sizeBefore: {
        totalBytes: summaryBefore.totalBytes,
        buckets: summaryBefore.buckets,
        fonts: summaryBefore.fonts,
      },
      fonts: {
        before: { count: fontFilesBefore.length, bytes: stats.fonts.bytes },
        after: { count: stats.fonts.count, bytes: stats.fonts.bytes },
        kept: fontFilesBefore.map((file) => file.relativePath),
        deleted: [],
        extraReferenced: [...extraReferenced].sort(),
      },
      css: { files: [], bytes: 0 },
      pages: pagePlans.map((plan) => ({
        path: plan.label,
        styleBlocks: plan.styleBlocks,
        fontStyleBlocks: plan.stylePlans.length,
        keptRules: 0,
        removedRules: 0,
        cssFile: null,
        visibleTextHash: sha256(extractVisibleText(plan.original)).slice(0, 16),
        visibleTextBytes: Buffer.byteLength(extractVisibleText(plan.original), 'utf8'),
      })),
    };
    logger(
      `already pruned: ${existingFontLinks.length} font stylesheet link(s); dist ${stats.totalBytes} bytes`,
    );
    if (!dryRun) await writeFileAtomic(reportPath, stableStringify(report));
    return { ...report, reportPath, reportDisplay: REPORT_PATH };
  }

  // Pass 2: finalize bundle contents/names and rewrite each page.
  const cssDir = path.join(distRoot, '_astro');
  const cssFiles = [];
  for (const bundle of bundles.values()) {
    bundle.content = `${bundle.rules.map((rule) => rule.raw).join('\n')}\n`;
    bundle.hash = sha256(bundle.content);
    bundle.name = await resolveFontCssName({
      cssDir,
      hash: bundle.hash,
      content: bundle.content,
    });
    bundle.bytes = Buffer.byteLength(bundle.content, 'utf8');
    bundle.families = [...new Set(bundle.rules.map((rule) => rule.family))].sort();
    cssFiles.push(bundle);
  }
  cssFiles.sort((left, right) => (left.name < right.name ? -1 : 1));

  const outputs = new Map();
  for (const plan of pagePlans) {
    const hrefs = htmlLinkHrefs(plan.original);
    let cssHref = null;
    if (plan.bundle) {
      const fontUrl = plan.bundle.rules.flatMap((rule) => rule.urls)[0];
      if (!fontUrl) {
        throw new Error(`${plan.label}: cannot externalize font CSS without a font URL`);
      }
      cssHref = `${fontCssHrefPrefix(fontUrl)}${plan.bundle.name}`;
    }
    let output = plan.original;
    const plans = [...plan.stylePlans].sort(
      (left, right) => right.elementStart - left.elementStart,
    );
    for (const stylePlan of plans) {
      let replacement = stylePlan.replacement;
      if (cssHref && stylePlan.elementStart === plan.firstFontStyleStart && !hrefs.has(cssHref)) {
        replacement = `<link rel="stylesheet" href="${cssHref}">${replacement}`;
        hrefs.add(cssHref);
      }
      output = `${output.slice(0, stylePlan.elementStart)}${replacement}${output.slice(stylePlan.elementEnd)}`;
    }
    const beforeText = extractVisibleText(plan.original);
    const afterText = extractVisibleText(output);
    if (beforeText !== afterText) {
      throw new Error(
        `${plan.label}: pruning would change visible text; aborting before any write or deletion`,
      );
    }
    plan.cssFile = cssHref === null ? null : `_astro/${path.posix.basename(cssHref)}`;
    plan.output = output;
    plan.visibleTextHash = sha256(beforeText).slice(0, 16);
    plan.visibleTextBytes = Buffer.byteLength(beforeText, 'utf8');
    outputs.set(path.resolve(plan.htmlFile), Buffer.byteLength(output, 'utf8'));
  }

  // Pass 3: write CSS first, rewrite HTML, delete unused shards last.
  if (!dryRun) {
    await fs.mkdir(cssDir, { recursive: true });
    for (const file of cssFiles) {
      const filePath = path.join(cssDir, file.name);
      if ((await readIfExists(filePath)) === null) {
        await fs.writeFile(filePath, file.content, 'utf8');
      }
    }
    for (const plan of pagePlans) {
      if (plan.output !== plan.original) await fs.writeFile(plan.htmlFile, plan.output, 'utf8');
    }
  }

  const keepNames = new Set([...keepAbsolute].map((filePath) => path.resolve(filePath)));
  const deletions = fontFilesBefore.filter(
    (file) => !keepNames.has(path.resolve(file.absolutePath)),
  );
  if (!dryRun) {
    const fontDirectory = path.resolve(distRoot, ...FONT_DIRECTORY.split('/'));
    for (const file of deletions) {
      const absolute = path.resolve(file.absolutePath);
      if (path.relative(fontDirectory, absolute).startsWith('..')) {
        throw new Error(
          `refusing to delete a file outside ${FONT_DIRECTORY}: ${file.relativePath}`,
        );
      }
      await fs.rm(absolute, { force: true });
    }
  }

  const deletedSet = new Set(deletions.map((file) => path.resolve(file.absolutePath)));
  const stats = dryRun
    ? summarise([
        ...statsBefore
          .filter((file) => !deletedSet.has(path.resolve(file.absolutePath)))
          .map((file) => {
            const rewritten = outputs.get(path.resolve(file.absolutePath));
            return rewritten === undefined ? file : { ...file, size: rewritten };
          }),
        ...cssFiles
          .filter(
            (file) => !statsBefore.some((record) => record.relativePath === `_astro/${file.name}`),
          )
          .map((file) => ({ relativePath: `_astro/${file.name}`, size: file.bytes })),
      ])
    : summarise(await readDistFiles(distRoot));

  const report = {
    schemaVersion: 1,
    dist: distLabel,
    thresholdBytes: SIZE_LIMIT_BYTES,
    dryRun,
    alreadyPruned: false,
    visibleTextUnchanged: true,
    size: stats,
    sizeBefore: {
      totalBytes: summaryBefore.totalBytes,
      buckets: summaryBefore.buckets,
      fonts: summaryBefore.fonts,
    },
    fonts: {
      before: {
        count: fontFilesBefore.length,
        bytes: fontFilesBefore.reduce((sum, file) => sum + file.size, 0),
      },
      after: { count: stats.fonts.count, bytes: stats.fonts.bytes },
      kept: fontFilesBefore
        .filter((file) => keepNames.has(path.resolve(file.absolutePath)))
        .map((file) => file.relativePath),
      deleted: deletions.map((file) => file.relativePath),
      extraReferenced: [...extraReferenced].sort(),
    },
    css: {
      files: cssFiles.map((file) => ({
        file: file.name,
        hash: file.hash.slice(0, 16),
        bytes: file.bytes,
        rules: file.rules.length,
        families: file.families,
        pages: [...file.pages].sort(),
      })),
      bytes: cssFiles.reduce((sum, file) => sum + file.bytes, 0),
    },
    pages: pagePlans.map((plan) => ({
      path: plan.label,
      styleBlocks: plan.styleBlocks,
      fontStyleBlocks: plan.stylePlans.length,
      keptRules: plan.keptRules,
      removedRules: plan.removedRules,
      cssFile: plan.cssFile,
      visibleTextHash: plan.visibleTextHash,
      visibleTextBytes: plan.visibleTextBytes,
    })),
  };

  if (!dryRun) await writeFileAtomic(reportPath, stableStringify(report));

  logger(
    `${dryRun ? 'dry-run: ' : ''}kept ${keptRulesTotal} / removed ${removedRulesTotal} @font-face rules; ` +
      `${cssFiles.length} font CSS bundle(s) / ${report.css.bytes} bytes; ` +
      `${report.fonts.after.count} of ${report.fonts.before.count} shards, ` +
      `${report.fonts.after.bytes} font bytes; dist ${stats.totalBytes} bytes`,
  );

  if (stats.totalBytes > SIZE_LIMIT_BYTES) {
    const top = stats.largest.map((file) => `  ${file.bytes}  ${file.file}`).join('\n');
    const limitMiB = SIZE_LIMIT_BYTES / (1024 * 1024);
    throw new Error(
      `dist exceeds the ${SIZE_LIMIT_BYTES}-byte (${limitMiB} MiB) budget: ${stats.totalBytes} bytes.\n` +
        `fonts: ${stats.fonts.count} files / ${stats.fonts.bytes} bytes\n` +
        `html: ${stats.buckets.html} / css: ${stats.buckets.css} / js: ${stats.buckets.js} / ` +
        `images: ${stats.buckets.images} / other: ${stats.buckets.other}\n` +
        `largest files:\n${top}\n` +
        `report: ${REPORT_PATH}`,
    );
  }

  return { ...report, reportPath, reportDisplay: REPORT_PATH };
}
