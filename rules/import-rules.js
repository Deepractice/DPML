/**
 * 导入规则配置文件
 * 用于集中管理和配置与导入相关的ESLint规则
 */

export default {
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  rules: {
    // 禁止使用相对父级路径导入
    'import/no-relative-parent-imports': 'error',

    // 禁止使用特定模式的相对路径导入
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../*', '../*/*', '../../*', '../../*/*', '../../../*', '../../../*/*'],
            message: '请使用别名导入代替相对路径导入。例如：import { foo } from "@core/utils/helper" 替代 import { foo } from "../../utils/helper"'
          }
        ]
      }
    ],

    // 导入排序规则
    'import/order': [
      'error',
      {
        groups: [
          'builtin',    // Node内置模块
          'external',   // 外部依赖包
          'internal',   // 工作区内其他包
          'parent',     // 父目录
          'sibling',    // 同级目录
          'index',      // 当前目录index
          'object',     // 对象导入
          'type',       // 类型导入
        ],
        pathGroups: [
          // 工作区内包的别名导入规则
          {
            pattern: '@core/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@prompt/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@agent/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@workflow/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@common/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@cli/**',
            group: 'internal',
            position: 'before'
          }
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ]
  }
};
