/**
 * ESLint样式规则配置
 */
export default {
  rules: {
    // 空格和缩进规则
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
    'linebreak-style': ['error', 'unix'],
    'max-len': [
      'warn',
      {
        code: 80,
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
