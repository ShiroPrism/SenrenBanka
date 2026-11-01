export const HANGUL_RANGES = Object.freeze([
  [0x1100, 0x11ff],
  [0x3130, 0x318f],
  [0xa960, 0xa97f],
  [0xac00, 0xd7a3],
  [0xd7b0, 0xd7ff],
  [0xffa0, 0xffdc],
]);

export const HANGUL_UNICODE_RANGE = HANGUL_RANGES.map(
  ([start, end]) => `U+${start.toString(16).toUpperCase()}-${end.toString(16).toUpperCase()}`,
).join(',');

export function isHangulCodePoint(codePoint) {
  return HANGUL_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end);
}
