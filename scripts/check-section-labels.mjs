#!/usr/bin/env node
/**
 * 主分区标准标签检查（ADR 0023）。
 *
 * 扫描 dist 中的设计页，读取 [data-section] 区间内的第一个 h2，
 * 断言其文本只由当前 Locale 的 canonical / alias 标准标签组成。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const sectionDictionaryPath = path.join(projectRoot, 'src/i18n/sections.json');
const allowlistPath = path.join(projectRoot, 'scripts/section-labels.allowlist.json');
const siteConfigPath = path.join(projectRoot, 'src/data/site.config.yaml');

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntities(text) {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, body) => {
    if (body[0] === '#') {
      const isHex = body[1] === 'x' || body[1] === 'X';
      const code = Number.parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITIES[body.toLowerCase()] ?? match;
  });
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, ' '));
}

function normalizeSpace(text) {
  return text.replace(/\s+/gu, ' ').trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractSections(html) {
  const markers = [];
  const markerPattern = /\bdata-section="([a-z]+)"/g;
  let match;
  while ((match = markerPattern.exec(html)) !== null) {
    markers.push({ key: match[1], index: match.index });
  }

  return markers.map((marker, index) => {
    const end = index + 1 < markers.length ? markers[index + 1].index : html.length;
    const segment = html.slice(marker.index, end);
    const h2 = segment.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
    return {
      key: marker.key,
      h2: h2 ? normalizeSpace(stripTags(h2[1])) : null,
    };
  });
}

/**
 * 返回 h2 中不属于标准标签的文本；完全合规时返回 null。
 * 允许多词 alias、双语标准词与任意标点 / 分隔符；主题词仍会保留为非法文本。
 */
export function findIllegalText(text, locale, section, dictionary) {
  const entry = dictionary[locale]?.[section];
  if (!entry) return `未知的 Locale 或分区：${locale}/${section}`;

  const accepted = [...new Set([entry.label, entry.enLabel, ...entry.aliases])]
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);

  let remainder = text;
  let matched = false;

  for (const phrase of accepted) {
    // CJK / Kana / Hangul 没有词边界，按子串匹配；拉丁词仍要求词边界。
    const hasCjk = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u31f0-\u31ff]/u.test(phrase);
    const pattern = hasCjk
      ? new RegExp(escapeRegExp(phrase), 'gu')
      : new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(phrase)}(?![\\p{L}\\p{N}])`, 'giu');
    const replaced = remainder.replace(pattern, ' ');
    if (replaced !== remainder) {
      matched = true;
      remainder = replaced;
    }
  }

  if (!matched) return text;

  const illegal = remainder.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return illegal || null;
}

export function readSectionDictionary(file = sectionDictionaryPath) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readLocalePaths(file = siteConfigPath) {
  const config = parseYaml(fs.readFileSync(file, 'utf8'));
  return new Set((config?.i18n?.locales ?? []).map((locale) => locale.path));
}

function readDesignIds() {
  const designsDir = path.join(projectRoot, 'src/designs');
  return new Set(
    fs
      .readdirSync(designsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name),
  );
}

function walkHtmlFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(fullPath, files);
    } else if (entry.isFile() && entry.name === 'index.html') {
      files.push(fullPath);
    }
  }
  return files;
}

function resolveDesign(relativePath, localePaths, designIds) {
  const segments = relativePath.split(path.sep);
  const candidate =
    segments.length === 2
      ? segments[0]
      : segments.length === 3 && localePaths.has(segments[0])
        ? segments[1]
        : null;
  return candidate && designIds.has(candidate) ? candidate : null;
}

function resolveLocale(html, dictionary) {
  const match = html.match(/<html\b[^>]*\blang="([^"]+)"/i);
  if (!match) return null;
  return (
    Object.keys(dictionary).find((locale) => locale.toLowerCase() === match[1].toLowerCase()) ??
    null
  );
}

function isRedirectPage(html) {
  return /<meta\b[^>]*http-equiv=["']refresh["']/i.test(html);
}

export function checkPage(html, { design, locale, dictionary }) {
  const violations = [];
  const sections = extractSections(html);

  if (sections.length === 0) {
    violations.push({ design, locale, section: '-', h2: null, detail: '没有找到 data-section' });
    return { violations, sectionCount: 0 };
  }

  for (const section of sections) {
    if (!dictionary[locale]?.[section.key]) {
      violations.push({
        design,
        locale,
        section: section.key,
        h2: section.h2,
        detail: `未知的 data-section="${section.key}"`,
      });
      continue;
    }

    if (section.h2 === null) {
      if (section.key !== 'profile') {
        violations.push({
          design,
          locale,
          section: section.key,
          h2: null,
          detail: '非 profile 分区缺少 h2',
        });
      }
      continue;
    }

    const illegal = findIllegalText(section.h2, locale, section.key, dictionary);
    if (illegal) {
      violations.push({
        design,
        locale,
        section: section.key,
        h2: section.h2,
        detail: `h2 含非标准文本：「${illegal}」`,
      });
    }
  }

  return { violations, sectionCount: sections.length };
}

function main() {
  const dictionary = readSectionDictionary();
  const localePaths = readLocalePaths();
  const designIds = readDesignIds();
  const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
  const allowlisted = new Set(allowlist.designs ?? []);

  const distDir = path.join(projectRoot, 'dist');
  if (!fs.existsSync(distDir)) {
    console.error('section-label check: dist/ 不存在，请先运行 astro build');
    process.exit(1);
  }

  const files = walkHtmlFiles(distDir);
  const violations = [];
  let pageCount = 0;
  let sectionCount = 0;
  let skippedDesigns = new Set();

  for (const file of files) {
    const relativePath = path.relative(distDir, file);
    const design = resolveDesign(relativePath, localePaths, designIds);
    if (!design) continue;

    if (allowlisted.has(design)) {
      skippedDesigns.add(design);
      continue;
    }

    const html = fs.readFileSync(file, 'utf8');
    if (isRedirectPage(html)) continue;

    pageCount += 1;
    const locale = resolveLocale(html, dictionary);
    if (!locale) {
      violations.push({
        design,
        locale: '?',
        section: '-',
        h2: null,
        detail: `<html lang> 缺失或不在词表中：${relativePath}`,
      });
      continue;
    }

    const result = checkPage(html, { design, locale, dictionary });
    sectionCount += result.sectionCount;
    violations.push(...result.violations);
  }

  console.log(
    `section-label check: ${pageCount} 页, ${sectionCount} 个分区, ${skippedDesigns.size} 套 allowlist 设计跳过`,
  );

  for (const violation of violations) {
    console.error(
      `FAIL ${violation.design} (${violation.locale}, ${violation.section}): ${violation.detail}${
        violation.h2 ? ` — h2="${violation.h2}"` : ''
      }`,
    );
  }

  if (violations.length > 0) {
    console.error(`section-label check: ${violations.length} 个问题`);
    process.exit(1);
  }

  console.log('section-label check: OK');
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  main();
}
