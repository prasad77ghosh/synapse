// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },

  // Base ESLint + TypeScript + Prettier
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,

  // 🌍 Global environment setup
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 🧩 Rules section (last one wins)
  {
    rules: {
      // --- TypeScript Rules ---
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // ✅ Disable this rule (causing @IsString() decorator warnings)
      '@typescript-eslint/no-unsafe-call': 'off',

      // --- Prettier Integration ---
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
