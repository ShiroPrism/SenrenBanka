import fs from 'node:fs/promises';
import path from 'node:path';
import * as fontkitten from 'fontkitten';
import subsetFont from 'subset-font';
import { Converter } from 'opencc-js';
import { buildCorpus } from '../../../../scripts/fonts/subset.mjs';

const ROOT = path.resolve('F:/SenrenBanka');
const SRC = path.resolve('F:/SenrenBanka-fonts/.cache/zh-tw-sources');
const OUT = path.resolve('F:/SenrenBanka/.trellis/tasks/11-01-traditional-chinese-font-research/research');

const FONTS = [
  { id: 'noto-sans-tc', file: 'NotoSansTC-Regular.otf' },
  { id: 'noto-serif-tc', file: 'NotoSerifTC-Regular.otf' },
  { id: 'lxgw-wenkai-tc', file: 'LXGWWenKaiTC-Regular.ttf' },
  { id: 'ark-pixel-tc', file: 'ark-pixel-12px-monospaced-zh_tw.otf' },
  { id: 'noto-sans-mono-cjk-tc', file: 'NotoSansMonoCJKtc-Regular.otf' },
];

const CORE = [
  { id: 'lxgw-wenkai', variable: '--font-lxgw' },
  { id: 'zhuque-fangsong', variable: '--font-zhuque' },
  { id: 'ark-pixel-12px', variable: '--font-ark-pixel' },
];

function uniq(text) {
  return [...new Set([...text])].sort().join('');
}

async function findCoreSource(id) {
  const base = path.join(ROOT, '.cache/font-sources');
  const versions = await fs.readdir(base);
  for (const version of versions) {
    const dir = path.join(base, version, `${id}@1.0.0`);
    try {
      const manifest = JSON.parse(await fs.readFile(path.join(dir, 'source-manifest.json'), 'utf8'));
      const file = manifest.files?.find((entry) => entry.file?.endsWith('.ttf') || entry.file?.endsWith('.otf'));
      if (file) return path.join(dir, ...file.file.split('/'));
    } catch {
      /* keep looking */
    }
  }
  return null;
}

async function measure(id, fontPath, text) {
  const source = await fs.readFile(fontPath);
  const output = await subsetFont(source, text, { targetFormat: 'woff2' });
  const characters = fontkitten.create(output).characterSet.length;
  return {
    id,
    sourceFile: path.basename(fontPath),
    sourceBytes: source.length,
    subsetBytes: output.length,
    subsetCharacters: characters,
    corpusCharacters: uniq(text).length,
    bytesPerCharacter: Math.round(output.length / uniq(text).length),
  };
}

const corpus = await buildCorpus(path.join(ROOT, 'dist'));
const convert = Converter({ from: 'cn', to: 'twp' });
const tcText = convert(corpus.text);
const unionText = uniq(corpus.text + tcText);

const result = {
  generatedAt: new Date().toISOString(),
  corpus: {
    existingCodePoints: corpus.codePoints,
    existingTextBytes: corpus.textBytes,
    tcConvertedUnique: uniq(tcText).length,
    unionUnique: uniq(unionText).length,
  },
  fonts: [],
};

for (const font of FONTS) {
  const full = await measure(font.id, path.join(SRC, font.file), unionText);
  const tcOnly = await measure(`${font.id} (tc-pages-only)`, path.join(SRC, font.file), tcText);
  result.fonts.push({ ...full, scope: 'full-dist-union' }, { ...tcOnly, scope: 'tc-pages-only' });
}

for (const core of CORE) {
  const source = await findCoreSource(core.id);
  if (!source) {
    result.fonts.push({ id: core.id, error: 'source not found in .cache/font-sources' });
    continue;
  }
  const before = await measure(core.id, source, corpus.text);
  const after = await measure(`${core.id} (with-tc-text)`, source, unionText);
  result.fonts.push(
    { ...before, variable: core.variable, scope: 'current-dist' },
    { ...after, variable: core.variable, scope: 'with-tc-text' },
  );
}

const tcSamples = '體國說時間開關學對應發現進來過這們個為與於後裡麼樣讓還點電腦網路資訊臺灣繁體龍龜直具戶說';
for (const font of FONTS) {
  const chars = new Set(fontkitten.create(await fs.readFile(path.join(SRC, font.file))).characterSet);
  const missing = [...tcSamples].filter((char) => !chars.has(char.codePointAt(0)));
  result.fonts.push({
    id: `${font.id} (tc-sample-coverage)`,
    scope: 'cmap',
    missing: missing.join(''),
    covered: `${[...tcSamples].length - missing.length}/${[...tcSamples].length}`,
  });
}

await fs.mkdir(OUT, { recursive: true });
await fs.writeFile(path.join(OUT, 'measurements.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
