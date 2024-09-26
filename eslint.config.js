// @ts-check
import eslint from '@eslint/js';
import teslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default [
  {
    ignores: ['dist',],
  },
  eslint.configs.recommended,
  ...teslint.configs.recommended,
  jsdoc.configs['flat/recommended-typescript-error'],
  {
    rules: {
      'arrow-parens': ['error', 'as-needed',],
      'indent': ['error', 2,],
      'max-len': ['error', 120,],
      'semi': ['error', 'always',],
      'eol-last': ['error', 'always',],
      'quotes': ['error', 'single',],
      'comma-dangle': ['error', { arrays: 'always', objects: 'always',},],
      'brace-style': ['error', '1tbs',],
      'comma-spacing': ['error', { before: false, after: true, },],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts',],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    files: ['*.js',],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
