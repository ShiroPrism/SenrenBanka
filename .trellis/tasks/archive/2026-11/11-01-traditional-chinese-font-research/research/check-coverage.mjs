import fs from 'node:fs/promises';
import path from 'node:path';
import * as fontkitten from 'fontkitten';
import { Converter } from 'opencc-js';
import { buildCorpus } from '../../../../scripts/fonts/subset.mjs';

const ROOT = 'F:/SenrenBanka';
const SRC = 'F:/SenrenBanka-fonts/.cache/zh-tw-sources';
const FONTS = [
  'NotoSansTC-Regular.otf',
  'NotoSerifTC-Regular.otf',
  'LXGWWenKaiTC-Regular.ttf',
  'ark-pixel-12px-monospaced-zh_tw.otf',
  'ark-pixel-12px-monospaced-zh_hant.otf',
  'ark-pixel-12px-monospaced-zh_hk.otf',
  'NotoSansMonoCJKtc-Regular.otf',
];

const corpus = await buildCorpus(path.join(ROOT, 'dist'));
const convert = Converter({ from: 'cn', to: 'twp' });
const tcText = convert(corpus.text);
const han = (char) => {
  const cp = char.codePointAt(0);
  return (cp >= 0x3400 && cp <= 0x9fff) || (cp >= 0xf900 && cp <= 0xfaff);
};
const uniqueHan = [...new Set([...tcText].filter(han))];

for (const file of FONTS) {
  const chars = new Set(fontkitten.create(await fs.readFile(path.join(SRC, file))).characterSet);
  const missing = uniqueHan.filter((char) => !chars.has(char.codePointAt(0)));
  console.log(`${file}: TC corpus Han ${uniqueHan.length}, missing ${missing.length}${missing.length ? ' -> ' + missing.slice(0, 40).join('') : ''}`);
}
