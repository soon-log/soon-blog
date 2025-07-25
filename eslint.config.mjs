import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginTestingLibrary from 'eslint-plugin-testing-library';
import eslintPluginJestDom from 'eslint-plugin-jest-dom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['node_modules/**', 'dist/**', '*.config.{js,mjs,ts}'],
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.app.json'
        }
      }
    },
    plugins: {
      prettier: eslintPluginPrettier,
      'react-hooks': eslintPluginReactHooks,
      'jsx-a11y': eslintPluginJsxA11y,
      import: eslintPluginImport
    },
    rules: {
      'linebreak-style': ['error', 'unix'],
      'no-unused-expressions': 'warn',
      'no-param-reassign': [
        'error',
        {
          props: false
        }
      ],

      'import/no-cycle': 'error',
      'import/no-anonymous-default-export': 'error',
      'import/no-named-default': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ],

      'react/react-in-jsx-scope': 'off',

      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      'jsx-a11y/alt-text': 'error',

      ...eslintConfigPrettier.rules,
      'prettier/prettier': ['error', {}, { usePrettierrc: true }]
    }
  },
  // Testing Library 설정 (테스트 파일에만 적용)
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    ...eslintPluginTestingLibrary.configs['flat/react'],
    rules: {
      'testing-library/no-node-access': 'off'
    }
  },
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    ...eslintPluginJestDom.configs['flat/recommended']
  }
];

export default eslintConfig;
