import tseslint from 'typescript-eslint';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./config/thresholds.json', 'utf8'));

export default tseslint.config(
    {
        ignores: ['.stryker-tmp', 'coverage', 'dist'],
    },
    {
        // Configure parser for TypeScript files
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        // Only enable complexity rule (core rule)
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        rules: {
            'complexity': ['error', config.complexity],
        },
    }
);
