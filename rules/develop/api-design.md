# DPML API设计规范

## 1. API设计原则

### 1.1 基本原则
- **最小惊讶原则**：API行为应符合用户直觉和预期
- **一致性原则**：整个API体系保持一致的设计风格和模式
- **最小表面积原则**：只暴露必要的功能，减少API复杂度
- **渐进复杂性原则**：简单场景易用，复杂场景灵活

### 1.2 DPML特定原则
- **分层隔离**：API层与实现层严格分离，遵循分层架构
- **薄包装**：API层应作为Core层的薄包装，只负责接口设计和委托
- **类型安全**：充分利用TypeScript类型系统提供良好的类型安全体验
- **不可变性**：API设计应尊重不可变性原则，避免副作用

## 2. API命名规范

### 2.1 命名风格
- **函数命名**：采用camelCase，以动词开头
  - 获取数据：`getDocument`, `fetchData`
  - 创建实例：`createParser`, `buildSchema`
  - 转换数据：`convertToXml`, `parseString`

- **类和接口命名**：采用PascalCase，使用名词
  - 接口不使用`I`前缀：`Parser`而非`IParser`
  - 类名应描述其功能：`XmlValidator`, `SchemaBuilder`

- **常量和枚举**：
  - 常量使用UPPER_SNAKE_CASE：`DEFAULT_TIMEOUT`
  - 枚举成员使用PascalCase：`LogLevel.Debug`

### 2.2 语义命名模式
- **一致的动词前缀**：
  - `get*`：检索不需网络请求的数据
  - `fetch*`：异步获取可能需要网络请求的数据
  - `create*`：创建新实例
  - `build*`：分步构建复杂对象
  - `parse*`：解析字符串或数据流
  - `validate*`：验证数据正确性
  - `convert*`/`transform*`：数据格式转换
  - `register*`：注册组件或回调
  - `subscribe*`：订阅事件或数据流

## 3. 函数设计

### 3.1 参数设计
- **参数数量**：控制函数参数在3个以内，超过时使用配置对象
- **必选参数**：放在前面，可选参数放在后面
- **配置对象**：复杂配置使用配置对象，支持默认值
- **默认参数**：为可选参数提供合理的默认值

```typescript
// ✅ 好的设计：必选参数在前，可选参数在后
function parseXml(content: string, options?: XmlParserOptions): XmlDocument;

// ✅ 好的设计：多参数使用配置对象
function createValidator({
  schema,
  strictMode = false,
  errorHandler,
  resolvers = {}
}: ValidatorOptions): Validator;
```

### 3.2 返回值设计
- **返回类型一致性**：相似函数应返回一致的类型
- **错误处理**：使用Result模式或异常处理明确错误情况
- **异步函数**：统一使用Promise，避免混用回调和Promise
- **集合返回**：返回不可变集合类型（如ReadonlyArray）

```typescript
// ✅ 好的设计：使用Result模式处理错误
function validateData(data: unknown): Result<ValidData, ValidationError>;

// ✅ 好的设计：一致的异步模式
async function fetchSchema(url: string): Promise<Schema>;
```

### 3.3 函数重载
- **明确性优先**：使用函数重载提高API清晰度
- **一致的返回类型**：重载函数应返回一致的类型
- **渐进复杂性**：从简单到复杂排列重载签名

```typescript
// ✅ 好的设计：清晰的函数重载
function parse(content: string): Document;
function parse(content: string, options: ParserOptions): Document;
function parse(content: string, schema: Schema): ValidatedDocument;
function parse(content: string, optionsOrSchema?: ParserOptions | Schema): Document | ValidatedDocument {
  // 实现...
}
```

## 4. API层组织结构

### 4.1 模块组织
- **功能聚合**：相关功能组织在同一模块中
- **命名一致**：相关模块使用一致的命名模式
- **导出控制**：明确控制哪些是公共API，哪些是内部实现
- **桶文件导出**：使用index.ts组织和简化导出

```typescript
// api/index.ts - 主要公共API入口
export * from './parser';
export * from './validator';
export * from './transformer';

// api/parser.ts - 解析相关API
export function parseXml(content: string, options?: XmlParserOptions): XmlDocument;
export function createParser(options?: ParserOptions): Parser;
```

### 4.2 API层职责
- **参数验证**：验证输入参数的有效性
- **默认值处理**：为可选参数提供默认值
- **错误转换**：将内部错误转换为用户友好的错误
- **实现委托**：委托Core层执行实际逻辑
- **结果包装**：包装Core层结果，确保符合API契约

## 5. 类型与接口设计

### 5.1 接口设计原则
- **职责单一**：每个接口专注于单一职责
- **组合优于继承**：优先使用接口组合而非继承层次
- **最小接口**：接口应只包含必要的方法和属性
- **一致性**：相关接口应使用一致的命名和参数模式

```typescript
// ✅ 好的设计：职责单一的接口
interface Parser {
  parse(content: string): Document;
}

interface Validator {
  validate(document: Document): ValidationResult;
}

// 组合而非继承
interface ProcessingPipeline {
  parser: Parser;
  validator: Validator;
  process(content: string): ProcessingResult;
}
```

### 5.2 类型设计
- **类型别名**：使用type简化复杂类型
- **联合类型**：适当使用联合类型表示可选值
- **字面量类型**：使用字面量类型限制可能的值
- **泛型**：使用泛型提高类型灵活性和安全性

```typescript
// ✅ 好的设计：使用类型别名
type DocumentId = string;

// ✅ 好的设计：使用联合类型
type DataFormat = 'xml' | 'json' | 'yaml';

// ✅ 好的设计：使用泛型
interface Result<T, E> {
  success: boolean;
  data?: T;
  error?: E;
}
```

## 6. 异步API设计

### 6.1 Promise模式
- **统一使用Promise**：所有异步API统一返回Promise
- **避免回调**：避免使用传统回调模式
- **错误处理**：Promise应正确处理和传播错误
- **取消支持**：考虑支持取消操作的机制

```typescript
// ✅ 好的设计：统一使用Promise
async function processDocument(doc: Document): Promise<ProcessedDocument>;

// ✅ 好的设计：支持取消
function fetchData(url: string, abortSignal?: AbortSignal): Promise<Data>;
```

### 6.2 流处理
- **流式API**：处理大数据时考虑流式API
- **背压处理**：流式API应考虑背压处理机制
- **流程控制**：提供暂停、恢复和取消流的能力
- **资源释放**：确保流正确关闭和资源释放

## 7. 文档与示例

### 7.1 文档规范
- **JSDoc**：所有公共API必须有JSDoc文档
- **参数描述**：详细描述每个参数的用途和限制
- **返回值**：明确说明返回值类型和含义
- **异常**：记录可能抛出的异常类型和条件
- **示例**：提供简洁的使用示例

```typescript
/**
 * 解析XML文本为文档对象
 * @param content XML文本内容
 * @param options 可选的解析选项
 * @returns 解析后的文档对象
 * @throws ParsingError 当XML语法无效时
 * @example
 * ```typescript
 * const doc = parseXml('<root><child>value</child></root>');
 *  // 输出: value
 * ```
 */
function parseXml(content: string, options?: XmlParserOptions): XmlDocument;
```

### 7.2 示例设计
- **简洁明了**：示例应简短且针对特定用例
- **渐进复杂性**：从简单到复杂安排示例
- **完整性**：示例应是可独立运行的完整代码
- **最佳实践**：示例应展示推荐的使用模式
- **错误处理**：包含错误处理的示例

## 8. 版本与兼容性

### 8.1 版本策略
- **语义化版本**：遵循SemVer (Major.Minor.Patch)规范
- **破坏性变更**：只在主版本更新中引入破坏性变更
- **废弃流程**：使用@deprecated标记在移除前先废弃API
- **兼容层**：在必要时提供兼容层过渡

### 8.2 向后兼容性
- **接口扩展**：优先扩展而非修改现有接口
- **可选参数**：新功能通过添加可选参数实现
- **功能检测**：支持运行时功能检测
- **行为保持**：保持现有API的行为一致性

## 9. 错误处理

### 9.1 错误设计
- **分类错误**：区分不同类型的错误
- **错误体系**：设计清晰的错误类层次
- **错误信息**：提供详细且有用的错误信息
- **上下文保留**：错误中保留有助于调试的上下文

```typescript
// ✅ 好的设计：错误类层次
export class DPMLError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DPMLError';
  }
}

export class ValidationError extends DPMLError {
  constructor(message: string, public details: ValidationIssue[]) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### 9.2 错误处理模式
- **Result模式**：考虑使用Result类型而非异常
- **统一处理**：提供集中的错误处理机制
- **优雅降级**：允许部分错误情况下继续处理
- **明确错误API**：错误处理API设计清晰明确

## 10. 安全与性能

### 10.1 安全考量
- **输入验证**：API层必须验证所有输入
- **类型安全**：利用TypeScript提供编译时类型安全
- **防止注入**：防止各种形式的注入攻击
- **敏感数据**：避免在错误和日志中泄露敏感数据

### 10.2 性能考量
- **懒加载**：支持按需加载重资源组件
- **批处理**：提供批量操作API减少调用次数
- **资源管理**：确保资源正确释放
- **内存效率**：注意大数据处理的内存效率 
