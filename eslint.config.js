import astro from 'eslint-plugin-astro';

export default [
  {
    ignores: ['node_modules/**'],
  },
  ...astro.configs['flat/recommended'],
];

