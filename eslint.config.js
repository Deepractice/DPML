import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

import importRules from './rules/import-rules.js';
import styleRules from './rules/style-rules.js';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  styleRules,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/temp/**',
      '**/.turbo/**',
    ],
  },
  {
    rules: {
      // 从旧配置迁移的规则
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      unicorn,
    },
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
        },
      ],
    },
  },
  {
    files: [
      '**/src/components/**/*.{ts,tsx}',
      '**/src/models/**/*.ts',
      '**/src/**/types/**/*.ts',
    ],
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          case: 'pascalCase',
        },
      ],
    },
  },
  {
    files: [
      '**/src/utils/**/*.ts',
      '**/src/helpers/**/*.ts',
      '**/src/functions/**/*.ts',
    ],
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          case: 'camelCase',
        },
      ],
    },
  },
  {
    files: ['**/src/tests/**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
  // 导入规范配置
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './packages/*/tsconfig.json'],
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
    rules: {
      // 确保导入存在
      'import/no-unresolved': 'error',
      // 禁止重复导入
      'import/no-duplicates': 'error',
      // 禁止循环依赖
      'import/no-cycle': 'error',
      // 禁止未使用的导入
      'import/no-unused-modules': 'warn',
      // 使用type关键字导入类型
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      // 确保导入扩展名
      'import/extensions': ['error', 'never'],
    },
  },
  // 导入新的导入规则配置
  importRules,
];
