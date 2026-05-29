// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat'; // Native Flat Config support
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default defineConfig(
    { ignores: ['dist/**', 'node_modules/**', 'src/standardSchema.d.ts'] },

    // 1. Base ESLint recommended rules
    eslint.configs.recommended,

    // 2. Comprehensive TypeScript rules (type-aware) — scoped to TS files
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
        ],
        plugins: {
            react: reactPlugin,
            // eslint-plugin-react-hooks types are slightly looser than ESLint's Plugin type
            'react-hooks': /** @type {import('eslint').ESLint.Plugin} */ (hooksPlugin),
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
);
