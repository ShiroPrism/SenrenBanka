#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PREFIX = '[senrenbanka] agent docs verification failed';
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const MAX_ROOT_CHARS = 7000;
const REQUIRED_GATES = new Map([
  ['data-loader', 'data-and-i18n.md'],
  ['profile-fields', 'data-and-i18n.md'],
  ['internal-links', 'data-and-i18n.md'],
  ['html-only-zero-assets', 'design-contract.md'],
  ['single-action-menu', 'action-menu.md'],
  ['css-isolation', 'pitfalls.md'],
  ['reveal-visibility', 'visual-language.md'],
  ['verify-after-change', 'operations.md'],
]);
const REQUIRED_RULE_FILES = [
  'README.md',
  'data-and-i18n.md',
  'design-contract.md',
  'action-menu.md',
  'visual-language.md',
  'accessibility-responsive.md',
  'pitfalls.md',
  'operations.md',
];
const ALLOWED_SHARED_HEADINGS = new Set(['适用范围', '权威级别', '相关决策', '维护归属']);

function fail(message) {
  throw new Error(message);
}

function readFile(filePath) {
  if (!fs.existsSync(filePath)) fail(`missing file: ${path.relative(projectRoot, filePath)}`);
  return fs.readFileSync(filePath, 'utf8');
}

function extractMarkdownLinks(text) {
  const links = [];
  const pattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of text.matchAll(pattern)) {
    links.push(match[1]);
  }
  return links;
}

function validateRelativeLinks(filePath, text) {
  const failures = [];
  for (const target of extractMarkdownLinks(text)) {
    if (/^(?:https?:|mailto:|tel:|#)/.test(target)) continue;
    const withoutAnchor = target.split('#')[0];
    if (!withoutAnchor) continue;
    const resolved = path.resolve(path.dirname(filePath), decodeURI(withoutAnchor));
    if (!fs.existsSync(resolved)) {
      failures.push(`${path.relative(projectRoot, filePath)} -> ${target}`);
    }
  }
  return failures;
}

function readLevelTwoHeadings(text) {
  return [...text.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
}

export function verifyAgentDocs(root = projectRoot) {
  const errors = [];
  const agentsPath = path.join(root, 'AGENTS.md');
  const rulesDir = path.join(root, 'docs', 'rules');
  const agents = readFile(agentsPath);
  const characters = [...agents].length;

  if (characters > MAX_ROOT_CHARS) {
    errors.push(`AGENTS.md has ${characters} characters (limit ${MAX_ROOT_CHARS})`);
  }

  for (const [gate, ruleFile] of REQUIRED_GATES) {
    const gateLine = agents.split(/\r?\n/).find((line) => line.includes(`<!-- gate:${gate} -->`));
    if (!gateLine) {
      errors.push(`AGENTS.md is missing hard gate "${gate}"`);
      continue;
    }
    if (!gateLine.includes(`](docs/rules/${ruleFile})`)) {
      errors.push(`AGENTS.md hard gate "${gate}" must link to docs/rules/${ruleFile}`);
    }
  }

  const trellisStart = agents.indexOf('<!-- TRELLIS:START -->');
  const trellisEnd = agents.indexOf('<!-- TRELLIS:END -->');
  if (trellisStart === -1 || trellisEnd === -1 || trellisEnd < trellisStart) {
    errors.push('AGENTS.md must contain ordered TRELLIS:START / TRELLIS:END markers');
  }

  for (const fileName of REQUIRED_RULE_FILES) {
    const rulePath = path.join(rulesDir, fileName);
    if (!fs.existsSync(rulePath)) {
      errors.push(`missing rule file: docs/rules/${fileName}`);
      continue;
    }
    const ruleText = fs.readFileSync(rulePath, 'utf8');
    if (!ruleText.trim()) errors.push(`empty rule file: docs/rules/${fileName}`);
    errors.push(...validateRelativeLinks(rulePath, ruleText));
  }

  errors.push(...validateRelativeLinks(agentsPath, agents));

  const headingOwners = new Map();
  for (const fileName of REQUIRED_RULE_FILES) {
    const rulePath = path.join(rulesDir, fileName);
    if (!fs.existsSync(rulePath)) continue;
    for (const heading of readLevelTwoHeadings(fs.readFileSync(rulePath, 'utf8'))) {
      if (ALLOWED_SHARED_HEADINGS.has(heading)) continue;
      if (headingOwners.has(heading)) {
        errors.push(
          `duplicate rule heading "${heading}" in docs/rules/${headingOwners.get(heading)} and docs/rules/${fileName}`,
        );
      } else {
        headingOwners.set(heading, fileName);
      }
    }
  }

  return { errors, characters };
}

function main() {
  try {
    const { errors, characters } = verifyAgentDocs();
    if (errors.length > 0) {
      console.error(PREFIX);
      for (const error of errors) console.error(`- ${error}`);
      process.exitCode = 1;
      return;
    }
    console.log(`[senrenbanka] agent docs ok (${characters}/${MAX_ROOT_CHARS} chars)`);
  } catch (error) {
    console.error(`${PREFIX}\n- ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
