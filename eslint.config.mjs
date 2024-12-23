// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import { parser as tsparser } from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['**/dist/**', '**/build/**', '*.config.mjs', '*.config.ts', 'coverage/**'],
    },
    {
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                project: './tsconfig.json',
            },
        },
    },
    eslint.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            'prefer-promise-reject-errors': 'off',
            '@typescript-eslint/prefer-promise-reject-errors': 'off',
            '@typescript-eslint/no-misused-promises': 'off',
        },
    },
);
