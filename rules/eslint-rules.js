/**
 * DPML项目的ESLint规则配置
 * 实现src-dir-rules.md和import-export-rules.md中定义的代码组织规则
 */

// 目录结构和文件命名规则
export const directoryRules = {
  rules: {
    // 文件命名规则：允许PascalCase、camelCase，以及包含专有词汇全大写的情况
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          // 允许PascalCase (类文件)
          pascalCase: true,
          // 允许camelCase (函数文件)
          camelCase: true,
        },
        // 允许包含专有词汇(DPML, XML等)全大写的文件名
        ignore: ['^index\\.ts$', '^DPML.*\\.ts$', '.*DPML.*\\.ts$', '^XML.*\\.ts$', '.*XML.*\\.ts$'],
      },
    ],
    
    // 禁止错误的目录结构 - 自定义规则
    // 'dpml/no-nested-directories': 'error',
    
    // 强制使用扁平化文件命名约定 - 自定义规则
    // 'dpml/enforce-flat-file-naming': 'error',
  },
};

// 导入和导出规则
export const importExportRules = {
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
    'import/no-unresolved': 'error',
    'import/no-duplicates': 'error',
    'import/no-cycle': 'error',
    'import/no-unused-modules': 'warn',
    
    // 导入顺序
    'import/order': [
      'error', 
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
      'error', 
      { 
        ignore: ['../api', '../core', '../types'] 
      }
    ],
    
    // 禁止通配符导入
    'import/no-namespace': 'warn',
    
    // 使用type关键字导入类型
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      },
    ],
    
    // 强制不带扩展名导入
    'import/extensions': ['error', 'never'],
  },
};

// 跨目录导入限制规则 - 需要eslint-plugin-boundaries
export const boundariesRules = {
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
};

// 自定义ESLint规则实现 - 需要在项目中注册这些规则
export const customRules = {
  // 禁止嵌套目录规则
  'dpml/no-nested-directories': {
    meta: {
      type: 'suggestion',
      docs: {
        description: '强制一级目录结构，禁止在api/types/core下创建子目录',
        category: 'DPML规则',
        recommended: true,
      },
      schema: [],
    },
    create(context) {
      // 通过文件路径检查是否有嵌套目录
      const filePath = context.getFilename();
      
      // 检查是否违反了目录规则
      // 这里需要定制实现检查逻辑
      return {};
    },
  },
  
  // 强制扁平化文件命名规则
  'dpml/enforce-flat-file-naming': {
    meta: {
      type: 'suggestion',
      docs: {
        description: '强制使用扁平化文件命名约定，如parser-core.ts而非parser/core.ts',
        category: 'DPML规则',
        recommended: true,
      },
      schema: [],
    },
    create(context) {
      // 实现文件命名规则检查逻辑
      return {};
    },
  },
};

// 把所有规则组合起来
export default [
  directoryRules,
  importExportRules,
  boundariesRules,
];

// 使用说明
/*
要使用这些规则，需要：

1. 安装所需的ESLint插件:
   ```
   npm install -D eslint-plugin-import eslint-plugin-unicorn eslint-plugin-boundaries
   ```

2. 自定义规则需要在项目中创建ESLint插件并注册:
   ```javascript
   // eslint-local-rules.js
   module.exports = {
     ...customRules
   };
   ```

3. 在eslint.config.js中引入:
   ```javascript
   import eslintLocalRules from './eslint-local-rules.js';
   import { directoryRules, importExportRules, boundariesRules } from './rules/eslint-rules.js';
   
   export default [
     // ...其他规则
     directoryRules,
     importExportRules,
     boundariesRules,
     {
       plugins: {
         'local': { rules: eslintLocalRules }
       }
     }
   ];
   ```
*/ 