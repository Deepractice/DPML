# API规范

本文档定义了DPML项目的API设计规范和最佳实践。

## 设计原则

1. **一致性原则**：所有API应保持一致的设计风格和行为模式
2. **最小化原则**：API应该暴露最小必要的功能，避免过度设计
3. **直观性原则**：API设计应该易于理解和使用，避免晦涩的抽象
4. **可组合性原则**：小型、专注的API更易于组合使用
5. **幂等性原则**：操作应尽可能设计为幂等的，相同输入总是产生相同输出

## 命名规范

### 接口和类型命名

```typescript
// 接口命名：使用大驼峰命名法，描述性名称
export interface XmlParserOptions {
  preserveWhitespace: boolean;
  validateOnParse: boolean;
}

// 类型别名：使用大驼峰命名法，通常以Type或Kind结尾
export type NodeType = 'element' | 'text' | 'comment' | 'cdata';

// 枚举：使用大驼峰命名法，单数形式
export enum ValidationSeverity {
  Error,
  Warning,
  Info
}
```

### 函数和方法命名

```typescript
// 动词开头，表明操作意图
export function parseXml(content: string): Document;
export function transformNode(node: Node): TransformedNode;

// 布尔判断函数使用is、has、can等前缀
export function isValidNode(node: unknown): node is Node;
export function hasChildren(element: Element): boolean;

// 异步函数通常加上Async后缀
export async function parseFileAsync(path: string): Promise<Document>;

// 事件处理函数使用handle或on前缀
export function handleNodeChange(node: Node): void;
```

### 常量命名

```typescript
// 使用全大写加下划线分隔
export const DEFAULT_PARSER_OPTIONS: XmlParserOptions = {
  preserveWhitespace: false,
  validateOnParse: true
};

// 私有/包内常量使用小驼峰
const defaultValidators = [...];
```

## 参数和返回值设计

### 参数设计

1. **参数数量**：函数参数不应超过3个，超过时应使用选项对象
2. **可选参数**：可选参数应放在必选参数之后，并提供合理的默认值
3. **选项对象**：复杂选项应使用对象形式，并有文档说明

```typescript
// 避免
function createParser(
  validateOnParse: boolean,
  preserveWhitespace: boolean,
  resolveEntities: boolean,
  includeComments: boolean,
  encoding: string
) { ... }

// 推荐
function createParser(options: ParserOptions = DEFAULT_PARSER_OPTIONS) { ... }

interface ParserOptions {
  validateOnParse?: boolean;
  preserveWhitespace?: boolean;
  resolveEntities?: boolean;
  includeComments?: boolean;
  encoding?: string;
}

const DEFAULT_PARSER_OPTIONS: ParserOptions = {
  validateOnParse: true,
  preserveWhitespace: false,
  resolveEntities: true,
  includeComments: false,
  encoding: 'utf-8'
};
```

### 返回值设计

1. **返回类型一致性**：相似函数应返回相似的类型结构
2. **避免返回null**：优先使用可选类型（Type | undefined）
3. **复杂返回值**：使用接口明确定义返回类型
4. **错误处理**：使用异常或Result类型处理错误，避免特殊返回值表示错误

```typescript
// 使用明确的返回类型
export function parseNode(xml: string): Node;

// 返回复合结果对象
export function validateDocument(doc: Document): ValidationResult {
  return {
    valid: true,
    errors: [],
    warnings: []
  };
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// 使用Result模式处理可能失败的操作
export function tryParseXml(content: string): Result<Document, ParseError> {
  try {
    const doc = parseXml(content);
    return { success: true, value: doc };
  } catch (error) {
    return { 
      success: false, 
      error: new ParseError('Failed to parse XML', { cause: error }) 
    };
  }
}

interface Result<T, E extends Error> {
  success: boolean;
  value?: T;
  error?: E;
}
```

## 错误处理规范

### 错误设计原则

1. **使用自定义错误类**：扩展基础Error类，提供更多上下文
2. **错误命名**：错误类名应以Error结尾
3. **错误消息**：提供清晰、具体的错误消息，包含必要的上下文信息

### 错误处理模式

```typescript
// 定义特定领域的错误类
export class ParserError extends Error {
  constructor(message: string, public readonly parserContext?: any) {
    super(message);
    this.name = 'ParserError';
  }
}

// 异步函数应该统一使用async/await和try/catch
export async function parseFileAsync(path: string): Promise<Document> {
  try {
    const content = await fs.readFile(path, 'utf-8');
    return parseXml(content);
  } catch (error) {
    // 重新包装错误，添加上下文
    throw new ParserError(
      `Failed to parse file: ${path}`, 
      { cause: error, path }
    );
  }
}

// 使用Result类型处理可能失败的操作
export function tryValidate(doc: Document): ValidationResult {
  const errors: ValidationError[] = [];
  // 执行验证...
  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}
```

## 版本控制与兼容性

### 版本号规范

遵循语义化版本（SemVer）:
- **主版本号**：不兼容的API变更
- **次版本号**：向后兼容的功能性新增
- **修订号**：向后兼容的问题修正

### API兼容性策略

1. **不破坏现有API**：新版本不应破坏现有的API契约
2. **渐进式弃用**：需要修改的API应先标记为deprecated
3. **兼容层**：必要时提供兼容层以支持旧版本API

```typescript
// 弃用标记示例
/**
 * @deprecated Use parseXml() instead, will be removed in v3.0
 */
export function parse(content: string): Document {
  return parseXml(content);
}

// 新API
export function parseXml(content: string, options?: XmlParserOptions): Document {
  // 实现
}

// 版本兼容层示例
export function createV1CompatClient(newClient: Client): V1Client {
  return {
    // 将新API适配到旧接口
    process(data) {
      return newClient.processData({ 
        content: data, 
        format: 'legacy' 
      });
    }
  };
}
```

## 异步API设计

### Promise使用规范

1. **返回Promise**：所有异步API应返回Promise，不使用回调
2. **错误处理**：Promise应正确处理和传播错误
3. **Promise链**：避免深层嵌套，优先使用链式调用或async/await

### 异步函数命名

```typescript
// 异步函数使用Async后缀
export async function loadConfigAsync(): Promise<Config>;
export async function parseFileAsync(path: string): Promise<Document>;

// 或返回Promise的函数
export function loadConfig(): Promise<Config>;
```

## 模块导出规范

### 导出设计

1. **命名导出**：优先使用命名导出，便于静态分析和树摇
2. **默认导出限制**：避免过度使用默认导出，特别是对公共API
3. **重新导出**：在index.ts中集中管理导出

```typescript
// 推荐
export class XmlParser { ... }
export interface ParserOptions { ... }
export function parseXml(content: string): Document { ... }

// 在index.ts中集中导出
export * from './parser';
export * from './transformer';
// 有选择地重新导出
export { validateXml, ValidationResult } from './validator';
```

### 模块结构

```
/src
  /api         # 公共API
    index.ts   # 主要导出点
    types.ts   # 类型定义
  /internal    # 内部实现，不直接导出
  /utils       # 内部工具函数
```

## 泛型API设计

### 泛型参数命名

```typescript
// 单字母泛型参数（传统约定）
export function identity<T>(value: T): T;

// 更具描述性的泛型参数名（复杂情况）
export function transform<SourceType, TargetType>(
  source: SourceType, 
  transformer: (source: SourceType) => TargetType
): TargetType;
```

### 泛型约束

```typescript
// 使用约束限制泛型参数
export function processNode<T extends Node>(node: T): T;

// 多重约束
export function merge<T extends object, U extends Partial<T>>(
  target: T, 
  source: U
): T & U;
```

## API文档规范

### JSDoc规范

所有公共API必须有JSDoc文档，包括：
- 函数/方法的简短描述
- 所有参数说明
- 返回值说明
- 异常说明
- 示例代码（复杂API）

```typescript
/**
 * 解析XML内容为文档对象
 * 
 * @param content - 要解析的XML字符串
 * @param options - 解析器选项
 * @returns 解析后的文档对象
 * @throws {ParserError} 如果内容无法解析为有效的XML
 * 
 * @example
 * ```ts
 * const doc = parseXml('<root><child>text</child></root>');
 * console.log(doc.root.child.textContent); // "text"
 * ```
 */
export function parseXml(
  content: string, 
  options?: XmlParserOptions
): Document { ... }
```

## 安全性考虑

### 输入验证

1. **所有外部输入必须验证**：API入口点必须验证所有输入
2. **使用类型守卫**：实现运行时类型检查
3. **验证深层结构**：不仅验证顶层属性，也验证嵌套属性

```typitten
// 类型守卫示例
function isValidOptions(obj: unknown): obj is ParserOptions {
  return (
    typeof obj === 'object' && 
    obj !== null &&
    (obj as any).validateOnParse === undefined || 
      typeof (obj as any).validateOnParse === 'boolean'
    // ...其他属性检查
  );
}

// API入口点验证
export function parseWithOptions(content: string, options: unknown): Document {
  if (!isValidOptions(options)) {
    throw new TypeError('Invalid parser options provided');
  }
  
  // 继续处理...
}
```

## 性能考虑

### API性能设计

1. **惰性计算**：对于计算密集型操作，考虑惰性计算
2. **批处理**：提供批处理API避免多次调用开销
3. **资源管理**：确保正确释放资源，避免内存泄漏

```typescript
// 批处理API示例
// 避免
documents.forEach(doc => parser.parse(doc));

// 推荐
parser.parseMany(documents);

// 惰性计算示例
export function createNodeIterator(doc: Document) {
  let currentIndex = 0;
  const nodes: Node[] = [...collectNodes(doc)];
  
  return {
    next() {
      if (currentIndex < nodes.length) {
        return { value: nodes[currentIndex++], done: false };
      }
      return { value: undefined, done: true };
    }
  };
}
```

## 测试要求

1. **测试覆盖率**：公共API应有至少90%的测试覆盖率
2. **契约测试**：确保API满足其文档所述的契约
3. **边界条件测试**：测试各种边界条件和错误场景

## 示例：完整的API设计

下面是一个遵循上述规范的API设计示例：

```typescript
// parser.ts
/**
 * XML解析器选项
 */
export interface XmlParserOptions {
  /** 是否保留空白字符 */
  preserveWhitespace?: boolean;
  /** 是否在解析时验证 */
  validateOnParse?: boolean;
  /** 字符编码 */
  encoding?: string;
}

/**
 * 默认解析器选项
 */
export const DEFAULT_PARSER_OPTIONS: XmlParserOptions = {
  preserveWhitespace: false,
  validateOnParse: true,
  encoding: 'utf-8'
};

/**
 * 解析错误
 */
export class XmlParseError extends Error {
  constructor(
    message: string, 
    public readonly line?: number,
    public readonly column?: number,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'XmlParseError';
  }
}

/**
 * 解析结果
 */
export interface ParseResult<T> {
  /** 解析是否成功 */
  success: boolean;
  /** 解析出的值，仅当success为true时存在 */
  value?: T;
  /** 解析错误，仅当success为false时存在 */
  error?: XmlParseError;
}

/**
 * XML解析器
 * 提供XML文档解析功能
 */
export class XmlParser {
  private options: XmlParserOptions;
  
  /**
   * 创建新的XML解析器实例
   * 
   * @param options - 解析器选项
   */
  constructor(options: XmlParserOptions = DEFAULT_PARSER_OPTIONS) {
    this.options = { ...DEFAULT_PARSER_OPTIONS, ...options };
  }
  
  /**
   * 解析XML字符串为文档对象
   * 
   * @param content - XML内容
   * @returns 解析后的文档
   * @throws {XmlParseError} 解析失败时抛出
   */
  public parse(content: string): Document {
    try {
      // 实现解析逻辑...
      return document;
    } catch (error) {
      throw new XmlParseError(
        'Failed to parse XML content',
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * 尝试解析XML，返回结果对象而不是抛出异常
   * 
   * @param content - XML内容
   * @returns 包含成功状态和结果或错误的对象
   */
  public tryParse(content: string): ParseResult<Document> {
    try {
      const doc = this.parse(content);
      return { success: true, value: doc };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof XmlParseError 
          ? error 
          : new XmlParseError('Unknown error during parsing', undefined, undefined, 
              error instanceof Error ? error : undefined)
      };
    }
  }
  
  /**
   * 异步解析文件
   * 
   * @param filePath - 文件路径
   * @returns Promise，解析为文档对象
   */
  public async parseFileAsync(filePath: string): Promise<Document> {
    try {
      // 读取文件并解析...
      return document;
    } catch (error) {
      throw new XmlParseError(
        `Failed to parse file: ${filePath}`,
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * 批量解析多个XML字符串
   * 
   * @param contents - 多个XML内容的数组
   * @returns 解析结果数组
   */
  public parseMany(contents: string[]): ParseResult<Document>[] {
    return contents.map(content => this.tryParse(content));
  }
}

// 导出便捷函数
/**
 * 使用默认选项解析XML
 * 
 * @param content - XML内容
 * @returns 解析后的文档
 */
export function parseXml(content: string): Document {
  const parser = new XmlParser();
  return parser.parse(content);
}

/**
 * 尝试解析XML，返回结果对象
 * 
 * @param content - XML内容
 * @returns 解析结果
 */
export function tryParseXml(content: string): ParseResult<Document> {
  const parser = new XmlParser();
  return parser.tryParse(content);
}
```

## API演变与生命周期

1. **API引入阶段**：添加新API时，可标记为实验性
2. **API稳定阶段**：稳定后遵循语义化版本控制
3. **API弃用阶段**：使用@deprecated标记并提供迁移路径
4. **API移除阶段**：主版本更新中完全移除

```typescript
// 实验性API标记
/**
 * @experimental 此API可能在未来版本中变更
 */
export function experimentalFeature() { ... }

// 弃用标记
/**
 * @deprecated 从v3.0起将移除，请使用newFunction()代替
 */
export function oldFunction() {
  return newFunction();
}
``` 