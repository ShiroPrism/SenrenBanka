import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      '.astro/**',
      '.cache/**',
      'node_modules/**',
      'node_modules*/**',
      'docs/**',
      '.trellis/**',
      '.agents/**',
      'src/fonts/generated.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    // Preview.astro must export `fonts` for the switcher (docs/rules/design-contract.md).
    files: ['src/designs/*/Preview.astro'],
    rules: { 'astro/no-exports-from-components': 'off' },
  },
];
