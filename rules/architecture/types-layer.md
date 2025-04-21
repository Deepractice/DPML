# Types层设计规则

本文档定义了DPML类库Types层设计的强制规则。

## 1. 目录与文件组织

1. **类型目录规则**: `types/`目录存放所有API涉及的数据结构类型定义
2. **文件命名规则**: 单一核心类型使用单数形式命名文件，如`DPMLNode.ts`；包含多个相关类型的文件使用复数形式命名，如`Errors.ts`
3. **统一导出规则**: 使用`index.ts`统一导出所有类型
4. **扁平结构规则**: **types目录只能有一级文件**，不允许创建子目录，保持扁平结构

```
types/
  index.ts          # 统一导出
  DPMLNode.ts       # 节点类型
  DPMLDocument.ts   # 文档类型
  Errors.ts         # 错误类型集合
  ParserOptions.ts  # 解析器选项
  ...
```

## 2. 命名约定

1. **类型命名规则**: 类型名使用**大驼峰命名法**，如`DPMLNode`、`ParseOptions`
2. **文件与类型对应规则**: 文件名应与主要导出的类型名称一致
3. **多类型文件命名规则**: 多类型文件使用复数或领域名称，如`Errors.ts`、`ValidationTypes.ts`

## 3. 类型设计原则

1. **纯数据结构规则**: 类型只定义数据结构，不包含方法，与内部服务类明确区分
2. **只读属性规则**: 尽可能使用`readonly`修饰符确保不可变性
3. **明确可选性规则**: 使用`?`明确标记可选属性
4. **行为分离规则**: 不定义方法，行为应在Manager类或内部服务类中实现

```typescript
// 正确示例 - 纯数据结构
export interface DPMLNode {
  readonly tagName: string;
  readonly id: string | null;
  readonly attributes: Map<string, string>;
  readonly children: DPMLNode[];
  readonly content: string;
  readonly parent: DPMLNode | null;
  readonly sourceLocation?: SourceLocation;
}

// 错误示例 - 包含方法
export interface DPMLNode {
  tagName: string;
  getAttribute(name: string): string | null; // 错误：包含方法
  appendChild(child: DPMLNode): void;        // 错误：包含方法
}
```

### 3.1 特殊类型处理

1. **错误类例外规则**: API相关的错误类可以存放在`types/`目录中，包含必要的构造函数和属性
2. **枚举类型例外规则**: 表示固定选项集的枚举可以存放在`types/`目录中
3. **常量类型例外规则**: 与API相关的常量和字面量类型可以存放在`types/`目录中

```typescript
// 正确示例 - 错误类
export class ParseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly location: SourceLocation
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

// 正确示例 - 枚举类型
export enum DocumentType {
  XML,
  JSON,
  YAML
}

// 正确示例 - 常量类型
export const NodeTypes = {
  ELEMENT: 'element',
  TEXT: 'text',
  COMMENT: 'comment'
} as const;

export type NodeType = typeof NodeTypes[keyof typeof NodeTypes];
```

## 4. 类型组织原则

1. **业务关联性规则**: 同一文件中的类型应具有紧密的业务关联
2. **分层清晰规则**: 避免循环依赖，保持类型层次清晰
3. **组合优于继承规则**: 优先使用组合而非继承来构建复杂类型

```typescript
// 正确的类型组织 - 相关类型放在一起
// ValidationTypes.ts
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  code: string;
  message: string;
  location?: SourceLocation;
}
```

## 5. 接口与类型别名使用规则

1. **接口定义规则**: 使用`interface`定义对象结构
2. **类型别名规则**: 使用`type`定义类型别名、联合类型和交叉类型
3. **接口优先规则**: 推荐使用`interface`的地方尽量不使用`type`

```typescript
// 使用interface定义对象结构
export interface ParseOptions {
  validateOnParse?: boolean;
  throwOnError?: boolean;
  fileName?: string;
}

// 使用type定义联合类型
export type NodeType = 'element' | 'text' | 'comment';
```

## 6. 文档规范

1. **类型文档规则**: 每个类型定义都应有JSDoc注释说明用途
2. **属性文档规则**: 每个属性都应有简短注释说明其含义
3. **示例文档规则**: 使用`@example`提供类型使用示例

```typescript
/**
 * DPML文档节点接口
 * 表示DPML文档中的单个节点
 */
export interface DPMLNode {
  /**
   * 节点标签名
   */
  readonly tagName: string;
  
  /**
   * 节点唯一标识符，可能为null
   */
  readonly id: string | null;
  
  // ...其他属性
}
```

## 7. 内部类型与对外类型的区分

### 7.1 类型存放位置

1. **对外类型存放规则**: 对外暴露的类型必须存放在`types/`目录，遵循上述规范
2. **内部类型存放规则**: 内部实现类型应直接定义在`core/`目录下相关模块中，而非`types/`目录
3. **类型隔离规则**: `types/`目录仅用于对外API涉及的数据结构

### 7.2 内部类型设计

1. **就近定义规则**: 内部类型应与使用它们的代码放在同一模块中
2. **内部类型文件规则**: 可以在业务模块中创建专门的类型文件（如`core/parsing/types.ts`）
3. **可见性控制规则**: 使用TypeScript的导出控制确保内部类型不被外部直接访问
4. **命名一致性规则**: 内部类型应遵循与对外类型相同的命名约定，但不应添加到`index.ts`中导出

```typescript
// core/parsing/types.ts - 内部类型示例
// 这些类型仅在parsing模块内部使用

/**
 * 解析器内部节点表示
 * 注意：这是内部实现类型，不对外暴露
 */
export interface InternalParserNode {
  type: string;
  value: string;
  position: {
    start: number;
    end: number;
  };
  // 其他内部属性...
}

// 模块内部使用，不导出到模块外
interface ParserState {
  currentPosition: number;
  tokens: Token[];
  // ...
}

// 可以被模块内其他文件使用，但不会暴露到core之外
export type TokenType = 'tag' | 'text' | 'comment' | 'attribute';
```

### 7.3 类型导出控制

1. **内部类型导出规则**: 内部类型仅在定义文件中使用`export`，不在barrel文件(`index.ts`)中重导出
2. **对外类型导出规则**: 对外类型在`types/index.ts`中统一导出，使外部可以访问
3. **类型转换规则**: 当内部类型需要转换为对外类型时，应明确定义转换函数

```typescript
// core/parsing/parsingManager.ts
import { DPMLNode } from '../../types'; // 对外类型
import { InternalParserNode } from './types'; // 内部类型

/**
 * 将内部节点转换为对外暴露的节点
 */
function convertToExternalNode(internal: InternalParserNode): DPMLNode {
  // 实现转换逻辑...
  return {
    tagName: internal.type,
    // 其他属性转换...
  };
}
```

## 8. 类型安全设计规则

### 8.1 类型安全基本原则

1. **避免any规则**: 避免使用`any`类型，必要时应使用`unknown`作为替代，并进行适当的类型守卫
2. **泛型优先规则**: 为接口、类和函数设计泛型参数，保持类型安全的同时支持多种数据类型
3. **类型收窄规则**: 使用类型守卫和类型断言收窄类型，避免过早的类型转换
4. **联合类型规则**: 使用联合类型替代通用类型，增强代码可读性和类型安全

```typescript
// 泛型优先示例
interface Transformer<TInput, TOutput> {
  transform(input: TInput): TOutput;
}

// 类型守卫示例
function isTextNode(node: Node): node is TextNode {
  return node.type === 'text';
}

function processNode(node: unknown): void {
  if (isTextNode(node)) {
    // 此处node被收窄为TextNode类型
    processTextContent(node.content);
  }
}

// 联合类型示例
function processValue(value: string | number | boolean): void { /* ... */ }
```

### 8.2 类型安全架构设计

1. **模块类型定义规则**: 每个模块、组件或函数应明确定义其输入和输出类型
2. **泛型传递规则**: 在架构分层中，泛型参数应从顶层API一直传递到底层实现
3. **配置对象类型化规则**: 所有配置对象都必须有明确的接口定义，避免使用普通对象类型
4. **错误类型安全规则**: 为错误处理提供类型安全的机制，使用特定的错误类而非通用Error

### 8.3 类型安全最佳实践

1. **严格模式规则**: 必须启用TypeScript的严格模式和相关编译选项
2. **类型导出规则**: 所有公共API都应导出其参数和返回值的类型定义，方便外部使用者获得类型提示
3. **可辨识联合类型规则**: 使用标签字段创建可辨识联合类型，提升类型推断能力和代码可读性
4. **类型断言限制规则**: 类型断言(`as Type`)应作为最后手段使用，优先使用类型守卫和类型窄化
5. **类型守卫函数规则**: 为复杂类型创建类型守卫函数，提升代码可读性和类型安全性

```typescript
// 类型导出规则示例
export type TransformResult<T> = {
  data: T;
  metadata: TransformMetadata;
};

export function transform<T, R>(input: T): TransformResult<R> { /* ... */ }

// 可辨识联合类型示例
type NodeBase = {
  id: string;
};

type TextNode = NodeBase & {
  type: 'text';
  content: string;
};

type ElementNode = NodeBase & {
  type: 'element';
  tagName: string;
  children: Node[];
};

type Node = TextNode | ElementNode;

// 类型守卫函数示例
function isElementNode(node: Node): node is ElementNode {
  return node.type === 'element';
}
``` 