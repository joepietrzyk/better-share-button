// @ts-check
import eslint from '@eslint/js';
import teslint from "typescript-eslint";
import jsdoc from 'eslint-plugin-jsdoc';

export default teslint.config(eslint.configs.recommended,
    ...teslint.configs.recommended,
    jsdoc.configs['flat/recommended-typescript-error'],
    {
        'ignores': ['./dist/'],
        'rules': {
            'indent': ['error', 4],
            'max-len': ['error', 120],
            'semi': ['error', 'always'],
            'eol-last': ['error', 'always']
        },
    }
);
