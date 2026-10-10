import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'src/brand-icons.js'] },

  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // The project passes plain objects as props and does not use prop-types.
      'react/prop-types': 'off',
      // Icon art comes from a vetted local file, never user input.
      'react/no-danger': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Node-side config files.
  {
    files: ['*.config.js', 'vite.config.js', 'tests/**/*.{js,mjs}'],
    languageOptions: { globals: { ...globals.node } },
  },

  // Browser checks also evaluate functions inside the page.
  {
    files: ['tests/**/*.browser.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },

  // Must stay last: turns off stylistic rules that would fight Prettier.
  prettier,
];
