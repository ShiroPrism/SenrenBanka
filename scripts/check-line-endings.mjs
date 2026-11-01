import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

/**
 * Parse `git ls-files --eol` output and return text files whose index or
 * worktree line endings are not plain LF. Binary (`-text`) and empty (`none`)
 * entries are ignored.
 */
export function findLineEndingViolations(report) {
  const violations = [];
  for (const line of report.split(/\r?\n/)) {
    const tab = line.indexOf('\t');
    if (tab === -1) continue;
    const meta = line.slice(0, tab);
    const file = line.slice(tab + 1);
    if (!file) continue;

    const index = /\bi\/(\S+)/.exec(meta)?.[1];
    const worktree = /\bw\/(\S+)/.exec(meta)?.[1];
    if (!index || !worktree) continue;
    if (index === '-text' || index === 'none') continue;
    if (worktree === '-text' || worktree === 'none') continue;
    if (index === 'crlf' || worktree === 'crlf' || worktree === 'mixed') {
      violations.push({ file, index, worktree });
    }
  }
  return violations;
}

export function main() {
  const report = execFileSync('git', ['ls-files', '--eol'], { encoding: 'utf8' });
  const violations = findLineEndingViolations(report);
  if (violations.length === 0) {
    console.log('line endings ok: all tracked text files use LF');
    return 0;
  }

  console.error(`line ending violations: ${violations.length}`);
  for (const { file, index, worktree } of violations) {
    console.error(`  ${file} (index: ${index}, worktree: ${worktree})`);
  }
  console.error('Run `git add --renormalize .` and make sure the editor writes LF.');
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
