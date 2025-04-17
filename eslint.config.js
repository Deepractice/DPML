import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';

import styleRules from './rules/style-rules.js';
import { directoryRules, importExportRules, boundariesRules } from './rules/eslint-rules.js';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  styleRules,
  
  // 新增的DPML项目特定规则
  directoryRules,
  importExportRules,
  boundariesRules,
  
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
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // 将未使用变量改为警告级别
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      unicorn,
      import: importPlugin,
      boundaries: boundaries,
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
      // 目录边界配置
      'boundaries/elements': [
        {
          type: 'api',
          pattern: 'src/api/*',
        },
        {
          type: 'types',
          pattern: 'src/types/*',
        },
        {
          type: 'core',
          pattern: 'src/core/*',
        },
      ],
    },
    rules: {
      // 文件命名规则：允许PascalCase、camelCase，以及包含专有词汇全大写的情况
      ...((/\.(ts|tsx)$/.test('$&')) ? {
        'unicorn/filename-case': [
          'error',
          {
            cases: {
              // 允许PascalCase (类文件)
              pascalCase: true,
              // 允许camelCase (函数文件)
              camelCase: true,
            },
            // 允许包含专有词汇(DPML等)全大写的文件名
            ignore: ['^index\\.ts$', '^DPML.*\\.ts$', '.*DPML.*\\.ts$'],
          },
        ],
      } : {}),
      
      // 导入相关规则
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      'import/no-unused-modules': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      'import/extensions': ['error', 'never'],
      
      // 强制目录间依赖规则
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            // api可以导入types和core
            { from: 'api', allow: ['types', 'core'] },
            // core可以导入types，但不能导入api
            { from: 'core', allow: ['types'] },
            // types不能导入任何东西
            { from: 'types', allow: [] },
          ],
        },
      ],
    },
  },
  // 测试文件命名规则例外
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
    rules: {
      'unicorn/filename-case': 'off', // 测试文件命名更灵活
      '@typescript-eslint/no-unused-vars': 'off', // 在测试文件中禁用未使用变量的检查
    },
  },
  // API接口文件特殊规则
  {
    files: ['**/api/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // 在API定义文件中禁用未使用变量的检查
    },
  },
];
