// @ts-check
import eslint from '@eslint/js';
import teslint from "typescript-eslint";
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default teslint.config(eslint.configs.recommended,
    ...teslint.configs.recommended,
    jsdoc.configs['flat/recommended-typescript-error'],
    {
        ignores: ['./dist/'],
        rules: {
            'indent': ['error', 4],
            'max-len': ['error', 120],
            'semi': ['error', 'always'],
            'eol-last': ['error', 'always']
        },
    },
    {
        files: ['**/*.test.ts', "**/*.spec.ts"],
        rules: {
            'jsdoc/require-jsdoc': 'off',
        }
    },
    {
        files: ['*.js'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    }
);
