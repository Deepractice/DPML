import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';

// 样式规则
const styleRules = {
  rules: {
    // 空格和缩进规则
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
    'linebreak-style': ['error', 'unix'],
    'max-len': [
      'warn',
      {
        code: 150,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],

    // 括号、逗号和分号规则
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'only-multiline'],
    'comma-spacing': ['error', { before: false, after: true }],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-in-parens': ['error', 'never'],

    // 空行规则
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      {
        blankLine: 'any',
        prev: ['const', 'let', 'var'],
        next: ['const', 'let', 'var'],
      },
      { blankLine: 'always', prev: 'directive', next: '*' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
    ],

    // 操作符周围的空格
    'space-infix-ops': 'error',
    'keyword-spacing': ['error', { before: true, after: true }],
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    'space-before-blocks': 'error',
    'space-before-function-paren': [
      'error',
      { anonymous: 'always', named: 'never', asyncArrow: 'always' },
    ],

    // 命名规范
    camelcase: ['error', { properties: 'never' }],
  },
};

// 目录结构和文件命名规则
const directoryRules = {
  plugins: {
    unicorn: unicornPlugin
  },
  rules: {
    // 文件命名规则：允许PascalCase、camelCase，以及包含专有词汇全大写的情况
    'unicorn/filename-case': [
      'warn',
      {
        cases: {
          // 允许PascalCase (类文件)
          pascalCase: true,
          // 允许camelCase (函数文件)
          camelCase: true,
        },
        // 允许包含专有词汇(DPML, XML等)全大写的文件名
        ignore: ['^index\\.ts$', '^DPML.*\\.ts$',  '^LLM.*\\.ts$', '.*DPML.*\\.ts$', '^XML.*\\.ts$', '.*XML.*\\.ts$', '^CLITypes.*\\.ts$', '.*CLITypes.*\\.ts$'],
      },
    ],
  },
};

// 导入和导出规则
const importExportRules = {
  plugins: {
    import: importPlugin
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
  },
  rules: {
    // 基本导入规则
    'import/no-unresolved': 'warn',
    'import/no-duplicates': 'warn',
    'import/no-cycle': 'warn',
    'import/no-unused-modules': 'warn',

    // 导入顺序
    'import/order': [
      'warn',
      {
        'groups': ['builtin', 'external', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }
    ],

    // 禁止过深的相对路径导入
    'import/no-relative-parent-imports': [
      'warn',
      {
        ignore: ['../api', '../core', '../types']
      }
    ],

    // 禁止通配符导入
    'import/no-namespace': 'warn',

    // 使用type关键字导入类型
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      },
    ],

    // 强制不带扩展名导入
    'import/extensions': ['warn', 'never'],
  },
};

// 跨目录导入限制规则
const boundariesRules = {
  plugins: {
    boundaries: boundaries
  },
  settings: {
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
    // 强制目录间依赖规则
    'boundaries/element-types': [
      'warn',
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
};

// 变量使用规则
const variableUsageRules = {
  plugins: {
    'unused-imports': unusedImports
  },
  rules: {
    // 禁止未使用的变量
    '@typescript-eslint/no-unused-vars': 'off', // 关闭默认规则以避免冲突
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      { 
        vars: 'all', 
        varsIgnorePattern: '^_', 
        args: 'after-used', 
        argsIgnorePattern: '^_' 
      }
    ],
  }
};

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  styleRules,

  // DPML项目特定规则
  directoryRules,
  importExportRules,
  boundariesRules,
  variableUsageRules,

  // 完全排除所有JS文件
  {
    ignores: [
      // 基本忽略
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/temp/**',
      '**/.turbo/**',
      // 排除所有JS文件
      '**/*.js',
      '**/*.jsx',
      '**/*.mjs',
      '**/*.cjs',
    ],
  },
  {
    rules: {
      // 从旧配置迁移的规则
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // 将未使用变量改为警告级别
      '@typescript-eslint/no-unused-vars': 'warn',
      // 设置通用规则覆盖，将所有错误降级为警告
      'no-useless-escape': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'import/no-namespace': 'warn',
      'import/no-relative-parent-imports': 'warn',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
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
      // 导入相关规则
      'import/no-unresolved': 'warn',
      'import/no-duplicates': 'warn',
      'import/no-cycle': 'warn',
      'import/no-unused-modules': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      'import/extensions': ['warn', 'never'],

      // 强制目录间依赖规则
      'boundaries/element-types': [
        'warn',
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
