﻿// @ts-check
import eslint from '@eslint/js';
import teslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import security from 'eslint-plugin-security';
import noUnsanitized from 'eslint-plugin-no-unsanitized';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    ignores: ['dist'],
  },
  eslint.configs.recommended,
  ...teslint.configs.recommended,
  security.configs.recommended,
  noUnsanitized.configs.recommended,
  prettierRecommended,
  jsdoc.configs['flat/recommended-typescript-error'],
  {
    rules: {},
  },
  {
    files: ['automation/**/*.ts', '**/*.test.ts', '**/__test__/**/*.ts'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'no-unsanitized/property': 'off',
      'no-unused-labels': 'off',
    },
  },
  {
    files: ['*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
