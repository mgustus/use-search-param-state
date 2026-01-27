// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier/flat'; // Native Flat Config support

export default tseslint.config(
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
        },
    },
    prettierConfig, // Always place last to override conflicting rules
);
