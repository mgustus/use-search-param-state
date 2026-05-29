// @ts-check
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier/flat'; // Native Flat Config support
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
    // 1. Base ESLint recommended rules
    eslint.configs.recommended,

    // 2. Comprehensive TypeScript rules that require type information
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            react: reactPlugin,
            'react-hooks': hooksPlugin,
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: { jsx: true },
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            ...reactPlugin.configs.flat.recommended.rules,
            ...reactPlugin.configs.flat['jsx-runtime'].rules, // For React 17+
            ...hooksPlugin.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off', // Not needed in modern React
            'react/prop-types': 'off', // TypeScript handles this
            'react-hooks/refs': 'off', // Hook intentionally uses refs during render to emulate useState semantics
        },
    },
    prettierConfig, // Always place last to override conflicting rules
];
