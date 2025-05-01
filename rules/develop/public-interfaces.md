# DPML 公共接口规范

## 1. 公共接口定义与范围

### 1.1 公共接口定义
在DPML项目中，公共接口是指：
- 通过API层直接导出的所有函数、类、接口和类型
- 用户会直接使用或扩展的组件
- 在项目文档中明确标记为公共API的部分
- 在版本间需要保持兼容性的接口

### 1.2 接口稳定性分类
DPML项目的接口按稳定性分为三类：
1. **稳定接口(Stable)**: 经过充分测试，承诺向后兼容的接口
2. **实验性接口(Experimental)**: 可能变更的新功能接口，使用`@experimental`标记
3. **内部接口(Internal)**: 不对外公开，可能随时变更的内部实现

## 2. 公共接口设计原则

### 2.1 一致性原则
- 相似功能使用相似的接口设计模式
- 参数顺序、命名模式和返回值格式保持一致
- 错误处理机制在所有公共接口中保持一致

### 2.2 可扩展性原则
- 接口设计应预见未来可能的扩展需求
- 使用配置对象模式支持未来参数扩展
- 考虑使用Hook模式允许用户扩展功能点

### 2.3 自文档化原则
- 接口名称和参数名应清晰表达其用途
- 使用TypeScript类型系统增强接口可读性
- 所有公共接口必须有全面的JSDoc文档

## 3. 公共接口导出规范

### 3.1 API模块组织
- 使用桶文件(index.ts)组织和控制导出内容
- 将API按功能域组织到不同文件中
- 明确区分公共API和内部实现

```typescript
// 公共API入口 - api/index.ts
export * from './parser';
export * from './validator';

// 但不导出内部实现
// export * from './internal';
```

### 3.2 导出控制
- 公共接口通过`export`导出
- 实验性接口使用`@experimental`JSDoc标记
- 内部实现不在顶层导出，或标记为`@internal`
- 封装细节实现，只导出必要的接口

```typescript
// 稳定公共接口
export function parseDocument(source: string): Document;

// 实验性接口
/**
 * @experimental 此API可能在未来版本中变更
 */
export function parseDocumentWithValidation(source: string): ValidationResult;

// 内部接口（不应直接导出）
/**
 * @internal
 */
export function parseTokenStream(tokens: Token[]): InternalNode;
```

## 4. 接口命名与组织

### 4.1 命名约定
- **函数和方法**：使用动词或动词短语，camelCase
- **类和接口**：使用名词或名词短语，PascalCase
- **常量和枚举值**：使用大写下划线命名 UPPER_SNAKE_CASE
- **类型别名**：使用PascalCase，表示具体数据类型

### 4.2 接口组织
- 按功能域组织接口，而非实现细节
- 相关功能放在同一模块中
- 接口设计应反映领域模型，而非技术实现

```typescript
// 按功能域组织 - parser.ts
export interface Parser { /* ... */ }
export function createParser(options?: ParserOptions): Parser;
export function parse(content: string): Document;

// 按功能域组织 - validator.ts
export interface Validator { /* ... */ }
export function createValidator(schema: Schema): Validator;
export function validate(document: Document, schema: Schema): ValidationResult;
```

## 5. 公共接口文档规范

### 5.1 JSDoc规范
- 所有公共接口必须有JSDoc文档
- 文档应包括简要描述、参数说明、返回值说明
- 标注异常情况和特殊行为
- 提供使用示例

```typescript
/**
 * 解析XML字符串为文档对象
 *
 * @param source - XML源文本
 * @param options - 可选的解析配置
 * @returns 解析后的文档对象
 * @throws {ParsingError} 当XML格式无效时
 *
 * @example
 * ```typescript
 * const doc = parseXml('<root><child>value</child></root>');
 * console.log(doc.root.child.textContent); // 输出: value
 * ```
 */
export function parseXml(source: string, options?: XmlParserOptions): XmlDocument;
```

### 5.2 标记说明
- `@public` - 明确标记为公共API（默认）
- `@experimental` - 实验性API，可能变更
- `@deprecated` - 已废弃，指明替代方案
- `@beta` - 测试版API，相对稳定但未最终确定
- `@internal` - 内部使用，不应被外部直接调用
- `@sealed` - 密封的，不应被继承或覆盖

```typescript
/**
 * @deprecated 使用 `parseDocument` 代替
 */
export function parse(source: string): Document;

/**
 * @beta
 */
export function validateAgainstSchema(doc: Document, schema: Schema): ValidationResult;
```

## 6. 向后兼容性管理

### 6.1 兼容性定义
DPML项目中，向后兼容性的定义：
- **源码兼容**: 使用旧API的现有代码无需修改即可编译
- **语义兼容**: 使用新版本的行为与旧版本一致
- **类型兼容**: TypeScript类型定义保持兼容

### 6.2 兼容性维护策略
- 避免移除或重命名公共API
- 不更改现有参数的含义或行为
- 通过添加可选参数扩展功能
- 使用重载而非替换现有函数

### 6.3 不兼容变更流程
当不得不进行不兼容变更时：
1. 使用`@deprecated`标记旧API，保留至少一个次要版本
2. 在文档中明确说明替代方案
3. 提供迁移工具或详细的迁移指南
4. 只在主版本更新(Major Version)中移除废弃API

## 7. 类型系统与接口设计

### 7.1 类型安全
- 利用TypeScript类型系统提供编译时安全保证
- 避免使用any类型，优先使用unknown或具体类型
- 使用泛型提供类型安全的灵活接口
- 考虑使用类型防护确保运行时类型安全

```typescript
// ✅ 类型安全的泛型接口
export interface Parser<T> {
  parse(source: string): T;
}

// ✅ 类型安全的工厂函数
export function createXmlParser<T>(): Parser<T>;
export function createJsonParser<T>(): Parser<T>;
```

### 7.2 接口扩展
- 使用接口继承扩展现有接口
- 优先考虑组合而非继承的接口设计
- 使用泛型约束限制类型参数

```typescript
// 基础接口
export interface Reader {
  read(): string;
}

// 扩展接口
export interface BufferedReader extends Reader {
  readLine(): string;
}

// 泛型约束
export function parse<T extends Document>(source: string): T;
```

## 8. 特殊接口设计模式

### 8.1 构建器模式
当需要构建复杂对象时，提供流畅的构建器接口：

```typescript
export interface SchemaBuilder {
  addElement(name: string): SchemaBuilder;
  addAttribute(element: string, attribute: string): SchemaBuilder;
  setRequired(element: string, required: boolean): SchemaBuilder;
  build(): Schema;
}

export function createSchemaBuilder(): SchemaBuilder;
```

### 8.2 工厂模式
使用工厂函数创建复杂对象，隐藏实现细节：

```typescript
export function createParser(format: 'xml'): XmlParser;
export function createParser(format: 'json'): JsonParser;
export function createParser(format: string): Parser;
```

### 8.3 订阅模式
提供事件订阅和通知机制：

```typescript
export interface DocumentProcessor {
  onBeforeProcess(handler: (doc: Document) => void): void;
  onAfterProcess(handler: (doc: Document, result: ProcessingResult) => void): void;
  onError(handler: (error: Error) => boolean): void;
  process(doc: Document): ProcessingResult;
}
```

## 9. 错误处理接口

### 9.1 异常模式
使用异常处理意外错误：

```typescript
/**
 * 解析文档
 * @throws {ParsingError} 当解析失败时
 */
export function parseDocument(source: string): Document;
```

### 9.2 Result模式
使用结果对象处理预期可能的错误：

```typescript
export interface Result<T, E> {
  success: boolean;
  value?: T;
  error?: E;
}

export function validateDocument(doc: Document): Result<void, ValidationError[]>;
```

### 9.3 混合模式
结合两种模式处理不同错误情况：

```typescript
/**
 * 处理文档
 * @returns 处理结果，包含可能的验证错误
 * @throws {ProcessingError} 当处理过程意外失败时
 */
export function processDocument(doc: Document): Result<ProcessedDocument, ValidationError[]>;
```

## 10. 最佳实践

### 10.1 推荐做法
- 设计接口时考虑API使用者的体验
- 提供合理的默认值，减少配置负担
- 接口设计应反映问题域而非实现细节
- 遵循最小惊讶原则，行为应符合预期
- 提供可组合的小型接口而非庞大的接口

### 10.2 避免做法
- 避免过多强制配置，导致使用复杂
- 避免无意义的抽象层，增加理解负担
- 避免暴露内部实现细节给API用户
- 避免使用不一致的命名和参数约定
- 避免创建难以测试的公共接口 