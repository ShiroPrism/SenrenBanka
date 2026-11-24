#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const offline = args.has('--offline');

function findProjectRoot(start) {
  let current = path.resolve(start);
  for (;;) {
    if (
      fs.existsSync(path.join(current, 'package.json')) &&
      fs.existsSync(path.join(current, 'src', 'data', 'site.config.yaml'))
    ) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function resolveCommand(name) {
  const probe =
    process.platform === 'win32'
      ? spawnSync('where.exe', [name], { encoding: 'utf8', windowsHide: true })
      : spawnSync('sh', ['-lc', `command -v ${JSON.stringify(name)}`], {
          encoding: 'utf8',
          windowsHide: true,
        });
  const candidate = `${probe.stdout ?? ''}\n${probe.stderr ?? ''}`
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  return probe.status === 0 && candidate ? candidate : null;
}

function run(file, commandArgs, timeout = 15000) {
  try {
    return spawnSync(file, commandArgs, {
      encoding: 'utf8',
      windowsHide: true,
      timeout,
      maxBuffer: 1024 * 1024,
    });
  } catch {
    return null;
  }
}

function textOf(result) {
  return `${result?.stdout ?? ''}\n${result?.stderr ?? ''}`.trim();
}

function readPackage(root) {
  const packagePath = path.join(root, 'package.json');
  try {
    return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  } catch {
    return null;
  }
}

function readSiteConfig(root) {
  const filePath = path.join(root, 'src', 'data', 'site.config.yaml');
  if (!fs.existsSync(filePath)) return { locales: [], defaultLocale: null, hasNotice: false };
  const source = fs.readFileSync(filePath, 'utf8');
  const locales = [...source.matchAll(/^\s*-\s+code:\s*['"]?([^'"\s#]+)['"]?/gm)].map(
    (match) => match[1],
  );
  const defaultLocale = source.match(/^\s*defaultLocale:\s*['"]?([^'"\s#]+)['"]?/m)?.[1] ?? null;
  return { locales, defaultLocale, hasNotice: /^\s*notice:/m.test(source) };
}

function listProfiles(root) {
  const directory = path.join(root, 'src', 'data', 'profiles');
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((name) => name.endsWith('.yaml'))
    .sort();
}

function gitInfo(root) {
  const git = resolveCommand('git');
  if (!git) return { available: false };
  const branch = textOf(run(git, ['branch', '--show-current'], 10000)).split(/\r?\n/)[0] || null;
  const status = textOf(run(git, ['status', '--short'], 10000));
  const remotes = textOf(run(git, ['remote', '-v'], 10000));
  const topLevel = textOf(run(git, ['rev-parse', '--show-toplevel'], 10000)).split(/\r?\n/)[0];
  const changedFiles = status ? status.split(/\r?\n/).filter(Boolean) : [];
  return {
    available: true,
    topLevel: topLevel || null,
    branch,
    dirty: Boolean(status),
    changedEntries: changedFiles.length,
    changedFiles,
    remotes: remotes.split(/\r?\n/).filter(Boolean),
  };
}

function githubInfo() {
  const gh = resolveCommand('gh');
  if (!gh) {
    return {
      cliAvailable: false,
      authenticated: false,
      login: null,
      scopes: [],
      repository: null,
    };
  }
  if (offline) {
    return {
      cliAvailable: true,
      authenticated: null,
      login: null,
      scopes: [],
      repository: null,
    };
  }
  const auth = run(gh, ['auth', 'status'], 15000);
  const authText = textOf(auth);
  const login = authText.match(/Logged in to \S+ as ([^\s]+)/)?.[1] ?? null;
  const scopesText = authText.match(/Token scopes:\s*([^\r\n]+)/)?.[1] ?? '';
  const scopes = scopesText
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);
  let repository = null;
  if (login) {
    const view = run(
      gh,
      [
        'repo',
        'view',
        '--json',
        'nameWithOwner,isFork,isTemplate,isPrivate,viewerPermission,defaultBranchRef,parent',
      ],
      20000,
    );
    if (view?.status === 0) {
      try {
        repository = JSON.parse(view.stdout);
      } catch {
        repository = null;
      }
    }
  }
  return {
    cliAvailable: true,
    authenticated: Boolean(login),
    login,
    scopes,
    repository,
  };
}

function vercelInfo() {
  const vercel = resolveCommand('vercel');
  if (!vercel) return { cliAvailable: false, authenticated: null, account: null };
  if (offline) return { cliAvailable: true, authenticated: null, account: null };
  const whoami = run(vercel, ['whoami'], 20000);
  const account = textOf(whoami).split(/\r?\n/).find(Boolean) ?? null;
  return { cliAvailable: true, authenticated: whoami?.status === 0, account };
}

function wranglerInfo() {
  const wrangler = resolveCommand('wrangler');
  if (!wrangler) return { cliAvailable: false, authenticated: null, account: null };
  if (offline) return { cliAvailable: true, authenticated: null, account: null };
  const whoami = run(wrangler, ['whoami'], 20000);
  const account = textOf(whoami).split(/\r?\n/).find(Boolean) ?? null;
  return { cliAvailable: true, authenticated: whoami?.status === 0, account };
}

function main() {
  const root = findProjectRoot(process.cwd());
  if (!root) {
    console.error('SenrenBanka project root not found.');
    process.exitCode = 1;
    return;
  }

  const packageJson = readPackage(root);
  const siteConfig = readSiteConfig(root);
  const result = {
    projectRoot: root,
    offline,
    node: {
      version: process.version,
      required: packageJson?.engines?.node ?? null,
    },
    project: {
      version: packageJson?.version ?? null,
      hasPackageLock: fs.existsSync(path.join(root, 'package-lock.json')),
      hasNodeModules: fs.existsSync(path.join(root, 'node_modules')),
      hasPreparedFonts: fs.existsSync(path.join(root, '.cache', 'fonts')),
      hasPreparedFontSources: fs.existsSync(path.join(root, '.cache', 'font-sources')),
      hasPagesWorkflow: fs.existsSync(
        path.join(root, '.github', 'workflows', 'deploy.yml'),
      ),
      locales: siteConfig.locales,
      defaultLocale: siteConfig.defaultLocale,
      profiles: listProfiles(root),
      siteConfigHasNotice: siteConfig.hasNotice,
    },
    git: gitInfo(root),
    github: githubInfo(),
    cloudflareCli: wranglerInfo(),
    vercelCli: vercelInfo(),
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
