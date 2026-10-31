import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HANGUL_RANGES,
  HANGUL_UNICODE_RANGE,
  isHangulCodePoint,
} from './lib/script-ranges.mjs';

test('Hangul ranges cover syllables, jamo, and compatibility jamo', () => {
  assert.equal(HANGUL_RANGES.length, 6);
  for (const codePoint of [0x1100, 0x3131, 0xa960, 0xac00, 0xd7a3, 0xd7b0, 0xffa0]) {
    assert.equal(isHangulCodePoint(codePoint), true);
  }
  for (const codePoint of [0x0041, 0x4e00, 0x3042, 0x20000]) {
    assert.equal(isHangulCodePoint(codePoint), false);
  }
  assert.equal(
    HANGUL_UNICODE_RANGE,
    'U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF,U+FFA0-FFDC',
  );
});
