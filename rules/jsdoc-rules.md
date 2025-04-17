# JSDoc 注释规范

本文档定义了DPML项目的JSDoc注释规范和最佳实践。

## 基本原则

1. **所有公共API必须有JSDoc注释**
2. **注释使用英文编写**
3. **注释应该清晰简洁，避免冗余**
4. **必须说明函数的用途、参数、返回值和可能的异常**
5. **类型信息优先使用TypeScript类型，而非JSDoc类型**
6. **提供实际的代码示例**

## 必需的注释内容

### 文件头部注释

每个源文件的顶部应包含版权信息和文件描述：

```typescript
/**
 * @file Defines the Parser class for handling document parsing
 * @copyright DPML Project 2023
 * @license MIT
 */
```

### 函数和方法注释

```typescript
/**
 * Parses the input document and returns structured data
 * 
 * @param input - The document content to parse
 * @param options - Parsing configuration options
 * @returns Parsed document structure
 * @throws {ParseError} When the document format is invalid
 * @example
 * ```ts
 * const result = parseDocument('<data>test</data>', { validate: true });
 * ```
 */
function parseDocument(input: string, options?: ParseOptions): Document {
  // Implementation...
}
```

### 类注释

```typescript
/**
 * Document parser for XML/HTML content
 * 
 * The parser handles validation, transformation, and extraction
 * of data from document formats.
 * 
 * @example
 * ```ts
 * const parser = new Parser({ strict: true });
 * const doc = parser.parse('<root><item>1</item></root>');
 * ```
 */
class Parser {
  // Implementation...
}
```

### 接口和类型注释

```typescript
/**
 * Configuration options for the parser
 */
interface ParserOptions {
  /**
   * Whether to validate the document structure
   * @default false
   */
  validate?: boolean;
  
  /**
   * Character encoding of the input document
   * @default 'utf-8'
   */
  encoding?: string;
}
```

### 属性注释

```typescript
class Configuration {
  /**
   * The current parser version
   * @readonly
   */
  public readonly version: string;
  
  /**
   * Whether strict mode is enabled
   * @default false
   */
  private _strictMode = false;
}
```

## JSDoc标签使用规范

### 必需标签

| 标签 | 用途 | 适用场景 |
|------|------|----------|
| `@param` | 描述函数参数 | 函数、方法 |
| `@returns` | 描述返回值 | 函数、方法 |
| `@throws` | 描述可能的异常 | 可能抛出异常的函数 |
| `@example` | 提供使用示例 | 公共API |

### 推荐标签

| 标签 | 用途 | 适用场景 |
|------|------|----------|
| `@deprecated` | 标记废弃的API | 计划移除的内容 |
| `@since` | 标记引入的版本 | 新功能 |
| `@see` | 引用相关文档或API | 相关功能 |
| `@default` | 描述默认值 | 可选参数、属性 |
| `@readonly` | 标记只读属性 | 类属性 |
| `@internal` | 标记内部API | 不希望公开的功能 |

## 不同代码元素的注释规范

### 1. 模块导出

每个公开导出的对象都应该有清晰的文档：

```typescript
/**
 * Configuration management module
 * 
 * @module config
 */

/**
 * Creates a configuration object with default settings
 */
export function createConfig(): Config {
  // Implementation...
}
```

### 2. 枚举类型

```typescript
/**
 * Log levels supported by the logging system
 */
export enum LogLevel {
  /**
   * Debug level for development information
   */
  DEBUG = 0,
  
  /**
   * Informational messages about system operation
   */
  INFO = 1,
  
  /**
   * Warning messages about potential issues
   */
  WARN = 2,
  
  /**
   * Error messages about failures
   */
  ERROR = 3
}
```

### 3. 常量和变量

```typescript
/**
 * Default timeout for network operations in milliseconds
 * @default 30000
 */
export const DEFAULT_TIMEOUT = 30000;
```

## 示例和反例

### ✅ 好的示例

```typescript
/**
 * Formats a date as a string using the specified format
 *
 * @param date - The date to format
 * @param format - The format template to use
 * @param locale - The locale to use for formatting
 * @returns Formatted date string
 * @example
 * ```ts
 * // Returns "2023-01-15"
 * formatDate(new Date(2023, 0, 15), 'YYYY-MM-DD');
 * ```
 */
export function formatDate(
  date: Date,
  format: string,
  locale: string = 'en-US'
): string {
  // Implementation...
}
```

### ❌ 不好的示例

```typescript
/**
 * Format date
 */
export function formatDate(date, format, locale) {
  // Implementation...
}
```

## 自动化工具配置

### ESLint配置

使用`eslint-plugin-jsdoc`插件检查JSDoc注释规范：

```javascript
module.exports = {
  plugins: ['jsdoc'],
  extends: ['plugin:jsdoc/recommended'],
  rules: {
    'jsdoc/require-jsdoc': ['error', {
      'publicOnly': true,
      'require': {
        'FunctionDeclaration': true,
        'MethodDefinition': true,
        'ClassDeclaration': true,
        'ArrowFunctionExpression': false,
        'FunctionExpression': false
      }
    }],
    'jsdoc/require-description': 'error',
    'jsdoc/require-param': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-returns': 'error',
    'jsdoc/require-returns-description': 'error',
    'jsdoc/require-example': ['error', {
      'avoidExampleOnConstructors': true
    }]
  }
};
```

### TypeDoc配置

用于生成API文档的TypeDoc配置（保存为`typedoc.json`）：

```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "name": "DPML API Documentation",
  "excludePrivate": true,
  "excludeInternal": true,
  "readme": "README.md",
  "plugin": ["typedoc-plugin-markdown"]
}
```

### 文档生成命令

在项目的`package.json`中添加以下脚本命令：

```json
{
  "scripts": {
    "docs": "typedoc --options typedoc.json",
    "docs:watch": "typedoc --options typedoc.json --watch",
    "docs:serve": "npx serve docs/api"
  }
}
```

#### 工作区级别配置

对于monorepo项目，在根`package.json`中添加：

```json
{
  "scripts": {
    "docs": "turbo run docs",
    "docs:all": "typedoc --options typedoc.json"
  }
}
```

然后在每个包的`package.json`中添加：

```json
{
  "scripts": {
    "docs": "typedoc --options ../../typedoc.json --out ../../docs/api/[package-name]"
  }
}
```

### 自动化工作流

在CI/CD流程中自动生成和发布文档：

```yaml
# .github/workflows/docs.yml
name: Generate Documentation

on:
  push:
    branches: [main]
    paths:
      - 'packages/*/src/**/*.ts'
      - 'typedoc.json'

jobs:
  build-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run docs:all
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: docs/api
          branch: gh-pages
```

## 实施建议

1. **渐进式采用** - 从公共API开始实施，逐步扩展到其他部分
2. **代码审查** - 将JSDoc规范纳入代码审查检查项
3. **自动化验证** - 在CI流程中添加JSDoc规范检查
4. **文档生成** - 定期生成API文档，确保其完整性
5. **持续集成** - 将文档生成纳入CI/CD流程，确保文档与代码同步更新

## IDE集成

为了便于开发，建议在IDE中配置JSDoc模板：

### VSCode Snippets

```json
{
  "Function JSDoc": {
    "prefix": "/**fn",
    "body": [
      "/**",
      " * ${1:Function description}",
      " *",
      " * @param ${2:param} - ${3:Parameter description}",
      " * @returns ${4:Return description}",
      " * @example",
      " * ```ts",
      " * ${5:Example code}",
      " * ```",
      " */",
      ""
    ],
    "description": "JSDoc for functions"
  }
}
``` 