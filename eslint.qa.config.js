
import js from '@eslint/js';
import security from 'eslint-plugin-security';
import jsdoc from 'eslint-plugin-jsdoc';
import jsonc from 'eslint-plugin-jsonc';
import yml from 'eslint-plugin-yml';
import markdown from 'eslint-plugin-markdown';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
    {
        ignores: ['dist', 'coverage', 'reports', 'report', 'node_modules', '.stryker-tmp']
    },
    // Security Checks (JS/TS)
    {
        files: ['**/*.{js,ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            security,
            '@typescript-eslint': tseslint.plugin
        },
        rules: {
            ...security.configs.recommended.rules
        }
    },
    // Documentation Checks (JS/TS)
    {
        files: ['**/*.{js,ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: { jsdoc },
        rules: {
            'jsdoc/check-alignment': 'warn',
            'jsdoc/check-param-names': 'warn',
        }
    },
    // JSON Checks
    ...jsonc.configs['flat/recommended-with-jsonc'],
    {
        files: ['**/*.json', '**/*.jsonc'],
        rules: {
            'jsonc/indent': ['error', 2],
        }
    },
    // YAML Checks
    ...yml.configs['flat/recommended'],
    {
        files: ['**/*.yaml', '**/*.yml'],
        rules: {
            'yml/indent': ['error', 2],
        }
    },
    // Markdown Checks
    ...markdown.configs.recommended,
];
