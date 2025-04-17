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
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      unicorn,
    },
    // 全局文件命名规则：只允许PascalCase和camelCase
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            // 允许PascalCase (类文件)
            pascalCase: true,
            // 允许camelCase (函数文件)
            camelCase: true,
          },
          ignore: ['^index\\.ts$'], // 允许index.ts文件
        },
      ],
    },
  },
  // 测试文件命名规则例外
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
    rules: {
      'unicorn/filename-case': 'off', // 测试文件命名更灵活
    },
  },
  // 导入规范配置
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
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
  }
];
