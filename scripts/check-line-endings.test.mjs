import assert from 'node:assert/strict';
import test from 'node:test';
import { findLineEndingViolations } from './check-line-endings.mjs';

function eolLine(index, worktree, file) {
  return `i/${index}    w/${worktree}  attr/text=auto eol=lf \t${file}`;
}

test('accepts LF index and worktree', () => {
  const report = [eolLine('lf', 'lf', 'src/a.mjs'), eolLine('lf', 'lf', 'README.md')].join('\n');
  assert.deepEqual(findLineEndingViolations(report), []);
});

test('rejects CRLF and mixed text files', () => {
  const report = [
    eolLine('lf', 'crlf', 'src/crlf.mjs'),
    eolLine('crlf', 'lf', 'src/index-crlf.mjs'),
    eolLine('lf', 'mixed', 'src/mixed.txt'),
    eolLine('lf', 'lf', 'src/ok.mjs'),
  ].join('\n');
  assert.deepEqual(findLineEndingViolations(report), [
    { file: 'src/crlf.mjs', index: 'lf', worktree: 'crlf' },
    { file: 'src/index-crlf.mjs', index: 'crlf', worktree: 'lf' },
    { file: 'src/mixed.txt', index: 'lf', worktree: 'mixed' },
  ]);
});

test('ignores binary and no-EOL entries', () => {
  const report = [
    eolLine('-text', '-text', 'docs/asset.png'),
    eolLine('none', 'none', 'src/empty.txt'),
    eolLine('lf', 'none', 'src/empty-with-index.txt'),
  ].join('\n');
  assert.deepEqual(findLineEndingViolations(report), []);
});

test('ignores malformed lines', () => {
  assert.deepEqual(findLineEndingViolations('not-a-git-eol-line\n\n'), []);
});
