#!/usr/bin/env node
import { auditFonts } from './audit.mjs';
import { checkFonts } from './check.mjs';
import { prepareFonts } from './prepare.mjs';
import { updateFonts } from './update.mjs';

const PREFIX = '[senrenbanka:fonts]';

function readOption(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`);
  return value;
}

function assertKnownOptions(args, allowedFlags, allowedValues) {
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (allowedValues.has(value)) {
      index += 1;
      continue;
    }
    if (!allowedFlags.has(value)) throw new Error(`unknown option: ${value}`);
  }
}

function log(message) {
  console.log(`${PREFIX} ${message}`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h') {
    console.log(`Usage:
  npm run fonts:update -- --catalog-url <url> [--catalog-sha256 <sha256>]
  npm run fonts:prepare [-- --offline]
  npm run fonts:check
  npm run fonts:audit [-- --dist dist --json .cache/fonts/audit-report.json]`);
    return;
  }

  if (command === 'update') {
    assertKnownOptions(args, new Set(), new Set(['--catalog-url', '--catalog-sha256']));
    const summary = await updateFonts({
      catalogUrl: readOption(args, '--catalog-url'),
      catalogSha256: readOption(args, '--catalog-sha256'),
      logger: log,
    });
    log(
      `updated catalog ${summary.catalogVersion}: ${summary.families} families, ${summary.variants} variants, ${summary.files} package files`,
    );
    return;
  }
  if (command === 'prepare') {
    assertKnownOptions(args, new Set(['--offline']), new Set());
    const summary = await prepareFonts({
      offline: args.includes('--offline'),
      logger: log,
    });
    log(
      `cache ready: ${summary.downloaded.length} prepared, ${summary.reused.length} reused`,
    );
    return;
  }
  if (command === 'check') {
    assertKnownOptions(args, new Set(), new Set());
    const summary = await checkFonts();
    log(
      `check passed offline: ${summary.familyCount} families, ${summary.variantCount} variants, ${summary.cachedFiles} cached files`,
    );
    return;
  }
  if (command === 'audit') {
    assertKnownOptions(args, new Set(), new Set(['--dist', '--json']));
    await auditFonts({
      distDir: readOption(args, '--dist') ?? 'dist',
      jsonPath: readOption(args, '--json'),
      logger: log,
    });
    return;
  }
  throw new Error(`unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`${PREFIX} ${error.message}`);
  process.exitCode = 1;
});
