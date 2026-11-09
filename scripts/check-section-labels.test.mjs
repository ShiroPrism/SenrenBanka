import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkPage,
  extractSections,
  findIllegalText,
  readSectionDictionary,
} from './check-section-labels.mjs';

const dictionary = {
  'zh-CN': {
    profile: { label: '简介', enLabel: 'Profile', aliases: ['关于'] },
    projects: { label: '项目', enLabel: 'Projects', aliases: ['作品', '精选项目', '精选作品'] },
    experience: { label: '经历', enLabel: 'Experience', aliases: ['履历'] },
    skills: { label: '技能', enLabel: 'Skills', aliases: ['能力'] },
    contact: { label: '联系', enLabel: 'Contact', aliases: ['联络'] },
    links: { label: '链接', enLabel: 'Links', aliases: [] },
  },
  en: {
    profile: { label: 'Profile', enLabel: 'Profile', aliases: ['About'] },
    projects: { label: 'Projects', enLabel: 'Projects', aliases: ['Works', 'Selected Works'] },
    experience: { label: 'Experience', enLabel: 'Experience', aliases: ['Work Experience'] },
    skills: { label: 'Skills', enLabel: 'Skills', aliases: ['Capabilities'] },
    contact: { label: 'Contact', enLabel: 'Contact', aliases: ['Get in Touch'] },
    links: { label: 'Links', enLabel: 'Links', aliases: ['Social Links'] },
  },
};

test('extractSections reads h2 inside data-section markers', () => {
  const html = `
    <main>
      <section data-section="projects"><h2><span>Projects</span> 项目</h2></section>
      <section data-section="links"><h2>Links</h2></section>
    </main>
  `;
  assert.deepEqual(extractSections(html), [
    { key: 'projects', h2: 'Projects 项目' },
    { key: 'links', h2: 'Links' },
  ]);
});

test('canonical, bilingual and multi-word aliases pass', () => {
  assert.equal(findIllegalText('项目', 'zh-CN', 'projects', dictionary), null);
  assert.equal(findIllegalText('Projects 项目', 'zh-CN', 'projects', dictionary), null);
  assert.equal(findIllegalText('Selected Works', 'en', 'projects', dictionary), null);
  assert.equal(findIllegalText('Work Experience', 'en', 'experience', dictionary), null);
  assert.equal(findIllegalText('能力', 'zh-CN', 'skills', dictionary), null);
  assert.equal(findIllegalText('PROJECTS', 'en', 'projects', dictionary), null);
  assert.equal(findIllegalText('项目 · Projects', 'zh-CN', 'projects', dictionary), null);
});

test('theme words and mixed labels fail', () => {
  assert.equal(findIllegalText('窗口', 'zh-CN', 'projects', dictionary), '窗口');
  assert.equal(findIllegalText('系统时间线', 'zh-CN', 'experience', dictionary), '系统时间线');
  assert.equal(findIllegalText('IDENTITY / 关于', 'zh-CN', 'profile', dictionary), 'IDENTITY');
  assert.equal(findIllegalText('经历日志', 'zh-CN', 'experience', dictionary), '日志');
  assert.equal(findIllegalText('Selected Works Extra', 'en', 'projects', dictionary), 'Extra');
  assert.equal(findIllegalText('', 'zh-CN', 'projects', dictionary), '');
});

test('checkPage: profile hero without h2 passes, other sections require h2', () => {
  const profileOnly = checkPage('<section data-section="profile"><p>bio</p></section>', {
    design: 'demo',
    locale: 'zh-CN',
    dictionary,
  });
  assert.deepEqual(profileOnly.violations, []);

  const missing = checkPage('<section data-section="projects"><p>items</p></section>', {
    design: 'demo',
    locale: 'zh-CN',
    dictionary,
  });
  assert.equal(missing.violations.length, 1);
  assert.match(missing.violations[0].detail, /缺少 h2/);
});

test('checkPage: sr-only h2 with standard text passes', () => {
  const html =
    '<section data-section="projects"><h2 class="sr-only"><span lang="en">Projects</span> 项目</h2></section>';
  const result = checkPage(html, { design: 'terminal', locale: 'zh-CN', dictionary });
  assert.deepEqual(result.violations, []);
});

test('checkPage: unknown data-section and no data-section fail', () => {
  const unknown = checkPage('<section data-section="stuff"><h2>Stuff</h2></section>', {
    design: 'demo',
    locale: 'zh-CN',
    dictionary,
  });
  assert.equal(unknown.violations.length, 1);
  assert.match(unknown.violations[0].detail, /未知的 data-section/);

  const none = checkPage('<main><h2>项目</h2></main>', {
    design: 'demo',
    locale: 'zh-CN',
    dictionary,
  });
  assert.equal(none.violations.length, 1);
  assert.match(none.violations[0].detail, /没有找到 data-section/);
});

test('project dictionary covers every locale and section', () => {
  const labels = readSectionDictionary();
  const locales = ['zh-CN', 'zh-TW', 'ja', 'en', 'ko'];
  const sections = ['profile', 'projects', 'experience', 'skills', 'contact', 'links'];

  for (const locale of locales) {
    for (const section of sections) {
      const entry = labels[locale]?.[section];
      assert.ok(entry, `${locale}/${section} missing`);
      assert.ok(entry.label, `${locale}/${section} label missing`);
      assert.ok(entry.enLabel, `${locale}/${section} enLabel missing`);
      assert.ok(Array.isArray(entry.aliases), `${locale}/${section} aliases missing`);
    }
  }
});

test('project aliases do not contain theme words', () => {
  const labels = readSectionDictionary();
  const forbidden = [
    '窗口',
    '桌面',
    '系统时间线',
    '售票处',
    '发送消息',
    'IDENTITY',
    'CHANNELS',
    'DEPLOYMENTS',
    'OPERATIONS',
    'Elsewhere',
  ];

  for (const locale of Object.keys(labels)) {
    for (const entry of Object.values(labels[locale])) {
      for (const alias of entry.aliases) {
        assert.ok(!forbidden.includes(alias), `${locale} alias contains ${alias}`);
      }
    }
  }
});
