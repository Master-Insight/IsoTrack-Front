import js from '@eslint/js';
import astro from 'eslint-plugin-astro';

export default [
  js.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astro.parsers.astro,
    },
    plugins: {
      astro,
    },
    rules: {
      ...astro.configs['flat/recommended'].rules,
    },
  },
];