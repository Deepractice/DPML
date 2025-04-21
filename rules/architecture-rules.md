# 注意力路由表 (AttentionRouter)

根据当前任务类型，请以不同注意力等级关注相应章节。注意力等级定义如下：

- **忽略** - 当前任务可以不关注此内容
- **略知** - 大致了解即可，不需深入
- **了解** - 需要理解主要内容和原则
- **熟知** - 需要全面掌握内容和细节
- **谨记** - 必须牢记并严格遵守的核心规则

## 注意力分配矩阵

| 章节 | 公共API和数据结构开发 | 内部实现任务 | 重构任务 |
|------|----------------------|------------|----------|
| **§1.1-1.2 目录与命名约定** | **熟知** | **略知** | **熟知** |
| **§1.3 函数设计原则** | **谨记** | **略知** | **了解** |
| **§1.4-1.7 API组织方式** | **熟知** | **略知** | **了解** |
| **§1.8 API委托原则** | **谨记** | **了解** | **熟知** |
| **§2.1-2.3 类型目录与命名** | **谨记** | **熟知** | **熟知** |
| **§2.4-2.6 类型组织原则** | **谨记** | **熟知** | **了解** |
| **§3.1-3.2 目录与领域划分** | **略知** | **谨记** | **谨记** |
| **§3.3 管理器模块设计** | **了解** | **谨记** | **谨记** |
| **§3.3 vs §3.4 管理器与业务类区别** | **略知** | **了解** | **谨记** |
| **§3.3 vs §3.5 管理器与内部服务类区别** | **略知** | **了解** | **谨记** |
| **§3.4 业务类设计** | **略知** | **谨记** | **了解** |
| **§3.5 内部服务类设计** | **熟知** | **谨记** | **熟知** |
| **§3.6-3.9 命名与设计原则** | **略知** | **熟知** | **熟知** |
| **§3.7 不可变原则** | **熟知** | **熟知** | **熟知** |
| **§3.10 Service层设计** | **熟知** | **谨记** | **谨记** |
| **§4.1-4.2 架构图与数据流** | **熟知** | **了解** | **谨记** |
| **§4.3 组件关系矩阵** | **熟知** | **熟知** | **谨记** |

---

# DPML核心架构规则

## 1. API设计规范

### 1.1 目录与文件组织

- **api/**目录存放所有对外暴露的公共API
- 按业务功能（而非技术组件）划分文件，如`parser.ts`、`document.ts`、`node.ts`
- 使用`index.ts`统一导出所有API，方便用户引用
- **api目录只能有一级文件**，不允许创建子目录，保持扁平结构

```
api/
  index.ts        # 统一导出
  parser.ts       # 解析相关功能
  document.ts     # 文档操作功能
  node.ts         # 节点操作功能
  tagRegistry.ts  # 标签注册功能
  ...
```

### 1.2 命名约定

- 文件名使用**小写**，如`parser.ts`、`document.ts`
- 导出的函数使用**小驼峰命名法**，如`parseFile()`、`findNodeById()`
- 函数名应体现业务操作，而非技术实现，如用`findNodeById`而非`getNodeFromMap`

### 1.3 函数设计原则

- **纯函数设计**：固定输入产生固定输出，无副作用
- **显式参数传递**：避免依赖隐式上下文或全局状态
- **完整签名**：参数类型和返回值类型完整，便于IDE提示
- **明确职责**：每个函数只做一件事，避免多职责

```typescript
// 正确示例 - 纯函数，明确参数和返回值
export function findNodeById(document: DPMLDocument, id: string): DPMLNode | undefined {
  // 实现...
}

// 错误示例 - 依赖隐式上下文
export function findNodeById(id: string): DPMLNode | undefined {
  // 依赖全局document对象
}
```

### 1.4 API组织方式

- **按业务域划分**：API应按业务功能域组织，而非技术实现
- **统一入口**：提供统一的导入入口
- **层次清晰**：避免循环依赖，保持层次结构清晰

```typescript
// api/index.ts
export * from './parser';
export * from './document';
export * from './node';

// 使用示例
import { parse, findNodeById, getAttribute } from '@dpml/core';
```

### 1.5 错误处理规范

- 使用显式错误类型，而非通用Error
- 提供详细的错误信息，包括位置信息
- 保持一致的错误处理模式

```typescript
// 正确的错误处理
export function parse(content: string): DPMLDocument {
  try {
    // 解析逻辑
  } catch (error) {
    if (error instanceof ParseError) {
      throw error; // 保留原始错误
    }
    // 包装为领域错误
    throw new ParseError(`解析失败: ${error.message}`, {
      line: 1,
      column: 1,
    });
  }
}
```

### 1.6 文档规范

- 所有公共API函数必须有完整的JSDoc注释
- 注释应包含函数描述、参数说明、返回值说明和示例
- 特殊情况和边界条件应明确在文档中说明

```typescript
/**
 * 查找指定ID的节点
 * @param document - DPML文档
 * @param id - 要查找的节点ID
 * @returns 找到的节点，未找到时返回undefined
 * 
 * @example
 * const node = findNodeById(document, 'header');
 * if (node) {
 *   // 处理节点
 * }
 */
export function findNodeById(document: DPMLDocument, id: string): DPMLNode | undefined {
  // 实现...
}
```

### 1.7 渐进式API暴露

- 采用分层API设计，在内部实现多层API，但对外优先暴露简单高层API
- 随着项目发展和需求增加，逐步暴露更多底层API
- 降低用户初始学习成本，同时保留未来扩展能力

#### 1.7.1 分层API设计原则

- **高层API**：面向常见场景，隐藏复杂性，提供合理默认值
- **底层API**：面向高级用例，提供完全控制能力
- 内部预先实现完整API层次，但对外仅暴露必要部分

```typescript
// core中实现多层API（内部）
// core/document/documentManager.ts
// 高层简化API - 默认行为
export function mergeDocuments(target: DPMLDocument, source: DPMLDocument): DPMLDocument {
  return mergeDocumentsWithOptions(target, source, {
    validateFirst: true,
    resolveConflicts: 'target-wins'
  });
}

// 底层完全控制API
export function mergeDocumentsWithOptions(
  target: DPMLDocument, 
  source: DPMLDocument, 
  options: MergeOptions
): DPMLDocument {
  // 完整实现，支持所有选项
}

// api层仅暴露高层API（早期）
// api/document.ts
export { mergeDocuments } from '../core/document/documentManager';
// 暂不导出底层API
```

#### 1.7.2 API演进策略

按照以下策略逐步暴露API：

1. **初始阶段**：只暴露高层简化API，满足大多数基本需求
2. **成长阶段**：根据用户反馈和需求，有选择地暴露部分底层API
3. **成熟阶段**：为高级用户提供完整的底层API访问

```typescript
// 未来版本的api层（成熟阶段）
// api/document.ts
export { 
  mergeDocuments,
  // 随着需求增加，暴露底层API
  mergeDocumentsWithOptions 
} from '../core/document/documentManager';
```

#### 1.7.3 渐进式暴露的优势

- **降低学习曲线**：新用户只需了解少量简单API即可开始
- **按需增加复杂度**：只在确实需要时才增加API表面积
- **保持架构灵活性**：内部保留完整能力，无需大幅重构即可扩展
- **自然适应用户成长**：随着用户熟悉度提高，逐步提供更多控制能力

#### 1.7.4 与API委托原则的协调

API层虽然是"薄层"，但并不意味着API的数量和粒度必须有限。"薄层"主要是指每个API函数本身不包含复杂业务逻辑，而是委托给Service层。随着项目发展，API层可以增加更多不同粒度的函数，但每个函数仍然保持"薄"的特性。

可以将这种策略理解为：
- API层的"宽度"(函数数量)可以随需求增加而扩展
- API层的"厚度"(每个函数的复杂度)始终保持最小

这样既保持了API委托原则的核心(不在API层实现逻辑)，又实现了渐进式API暴露(随时间提供更多控制能力)。

### 1.8 API委托原则

- **薄层设计**：API层应该是一个薄层，不包含复杂业务逻辑
- **委托职责**：API层主要职责是委托内部Service层的功能给外部使用
- **一对一映射**：API层函数通常与Service层函数是一对一映射关系
- **无重复逻辑**：避免在API层重复实现内部已有的业务逻辑
- **间接访问原则**：API层不应直接访问Manager层、内部服务类或业务类，而应通过Service层间接使用其功能

```typescript
// api/parser.ts - 正确示例
export * from '../core/parsing/ParserService';

// api/parser.ts - 错误示例 (直接访问Manager)
export { parse, parseFile, parseAsync } from '../core/parsing/parsingManager';

// api/parser.ts - 错误示例 (在API层实现复杂逻辑)
import { DPMLDocument } from '../types';
import { Parser } from '../core/parsing/Parser';
import { Validator } from '../core/validation/Validator';

export function parse(content: string): DPMLDocument {
  const validator = new Validator();
  const parser = new Parser({ validateOnParse: true }, validator);
  return parser.parse(content);
}

// api/registry.ts - 错误示例：直接访问内部服务类
import { TagRegistry } from '../core/registry/TagRegistry';
export function getTagDefinition(tagName: string) {
  // 错误：API层直接访问内部服务类
  const registry = new TagRegistry();
  return registry.getDefinition(tagName);
}
```

坚持API委托原则的好处：
- **关注点分离**：API层关注外部接口稳定性，Service层关注功能聚合，Manager层关注业务逻辑
- **减少重复**：避免相同逻辑在多处实现
- **简化测试**：API层测试可以专注于接口契约而非复杂逻辑
- **便于重构**：内部实现变化时，API层通常不需要修改

## 2. 数据类型设计规范

### 2.1 目录与文件组织

- **types/**目录存放所有API涉及的数据结构类型定义
- 单一核心类型使用单数形式命名文件，如`DPMLNode.ts`
- 包含多个相关类型的文件使用复数形式命名，如`Errors.ts`
- 使用`index.ts`统一导出所有类型
- **types目录只能有一级文件**，不允许创建子目录，保持扁平结构

```
types/
  index.ts          # 统一导出
  DPMLNode.ts       # 节点类型
  DPMLDocument.ts   # 文档类型
  Errors.ts         # 错误类型集合
  ParserOptions.ts  # 解析器选项
  ...
```

### 2.2 命名约定

- 类型名使用**大写驼峰命名法**，如`DPMLNode`、`ParseOptions`
- 文件名应与主要导出的类型名称一致
- 多类型文件使用复数或领域名称，如`Errors.ts`、`ValidationTypes.ts`

### 2.3 类型设计原则

- **纯数据结构**：类型只定义数据结构，不包含方法，与内部服务类明确区分
- **只读属性**：尽可能使用`readonly`修饰符确保不可变性
- **明确可选性**：使用`?`明确标记可选属性
- **不包含行为**：不定义方法，行为应在Manager类或内部服务类中实现

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

### 2.4 类型组织原则

- **业务关联性**：同一文件中的类型应具有紧密的业务关联
- **分层清晰**：避免循环依赖，保持类型层次清晰
- **组合优于继承**：优先使用组合而非继承来构建复杂类型

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

### 2.5 接口与类型别名

- 使用`interface`定义对象结构
- 使用`type`定义类型别名、联合类型和交叉类型
- 推荐使用`interface`的地方尽量不使用`type`

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

### 2.6 文档规范

- 每个类型定义都应有JSDoc注释说明用途
- 每个属性都应有简短注释说明其含义
- 使用`@example`提供类型使用示例

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

### 2.7 内部类型与对外类型的区分

#### 2.7.1 类型存放位置原则

- **对外暴露的类型**：必须存放在`types/`目录，遵循2.1-2.6节的规范
- **内部实现类型**：应直接定义在`core/`目录下相关模块中，而非`types/`目录
- **内部类型不得放入types目录**：`types/`目录仅用于对外API涉及的数据结构

#### 2.7.2 内部类型设计原则

- **就近定义**：内部类型应与使用它们的代码放在同一模块中
- **文件组织**：可以在业务模块中创建专门的类型文件（如`core/parsing/types.ts`）
- **可见性控制**：使用TypeScript的导出控制确保内部类型不被外部直接访问
- **命名规范**：内部类型应遵循与对外类型相同的命名约定，但不应添加到`index.ts`中导出

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

#### 2.7.3 类型导出控制

- **内部类型**：仅在定义文件中使用`export`，不在barrel文件(`index.ts`)中重导出
- **对外类型**：在`types/index.ts`中统一导出，使外部可以访问
- **混合使用场景**：当内部类型需要转换为对外类型时，应明确定义转换函数

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

#### 2.7.4 内外类型分离的好处

- **关注点分离**：对外API类型专注于稳定接口，内部类型可以自由演化
- **实现自由度**：内部实现可以使用最适合的数据结构，而不受对外API约束
- **减少类型污染**：避免内部实现细节泄露到公共类型定义中
- **维护边界清晰**：明确区分哪些是公共契约，哪些是实现细节

### 2.8 类型安全设计规则

类型安全是TypeScript项目的核心优势，DPML架构强调通过严格的类型系统提升代码质量和开发体验。

#### 2.8.1 类型安全基本原则

1. **避免使用`any`类型**：`any`类型绕过TypeScript的类型检查，应尽量避免使用。必要时应使用`unknown`作为替代，并进行适当的类型守卫。

2. **泛型优先**：为接口、类和函数设计泛型参数，使它们能够在保持类型安全的同时支持多种数据类型。
   ```typescript
   // 不推荐
   interface Transformer {
     transform(input: any): any;
   }
   
   // 推荐
   interface Transformer<TInput, TOutput> {
     transform(input: TInput): TOutput;
   }
   ```

3. **类型收窄**：使用类型守卫和类型断言收窄类型，避免过早的类型转换。
   ```typescript
   // 推荐
   function processNode(node: unknown): void {
     if (isTextNode(node)) {
       // 此处node被收窄为TextNode类型
       processTextContent(node.content);
     }
   }
   ```

4. **联合类型**：使用联合类型替代通用类型，增强代码可读性和类型安全。
   ```typescript
   // 不推荐
   function processValue(value: any): void { /* ... */ }
   
   // 推荐
   function processValue(value: string | number | boolean): void { /* ... */ }
   ```

#### 2.8.2 类型安全架构设计

1. **模块输入输出类型定义**：每个模块、组件或函数应明确定义其输入和输出类型，确保架构边界的类型安全。

2. **泛型传递原则**：在架构分层中，泛型参数应从顶层API一直传递到底层实现，保持类型信息的连贯性。
   ```typescript
   // API层
   export function transform<T, R>(input: T): R {
     return transformerService.transform<T, R>(input);
   }
   
   // Service层
   export function transform<T, R>(input: T): R {
     return transformerManager.executeTransform<T, R>(input);
   }
   ```

3. **配置对象类型化**：确保所有配置对象都有明确的接口定义，避免使用普通对象类型。
   ```typescript
   // 不推荐
   function configure(options: Record<string, any>): void { /* ... */ }
   
   // 推荐
   interface ConfigOptions {
     timeout?: number;
     retries?: number;
     validator?: (data: unknown) => boolean;
   }
   
   function configure(options: ConfigOptions): void { /* ... */ }
   ```

4. **错误类型的类型安全**：为错误处理提供类型安全的机制，使用特定的错误类而非通用Error。
   ```typescript
   // 推荐
   class ValidationError extends Error {
     constructor(
       message: string,
       public readonly violations: ValidationViolation[]
     ) {
       super(message);
       this.name = 'ValidationError';
     }
   }
   ```

#### 2.8.3 类型安全最佳实践

1. **启用严格模式**：在`tsconfig.json`中启用`strict: true`和其他严格相关的编译选项，如`noImplicitAny`。

2. **类型导出原则**：所有公共API都应导出其参数和返回值的类型定义，方便外部使用者获得类型提示。
   ```typescript
   export type TransformResult<T> = {
     data: T;
     metadata: TransformMetadata;
   };
   
   export function transform<T, R>(input: T): TransformResult<R> { /* ... */ }
   ```

3. **可辨识联合类型**：使用标签字段创建可辨识联合类型，提升类型推断能力和代码可读性。
   ```typescript
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
   ```

4. **避免类型断言滥用**：类型断言(`as Type`)应作为最后手段使用，优先使用类型守卫和类型窄化。

5. **类型守卫函数**：为复杂类型创建类型守卫函数，提升代码可读性和类型安全性。
   ```typescript
   function isElementNode(node: Node): node is ElementNode {
     return node.type === 'element';
   }
   ```

通过严格遵循这些类型安全设计规则，DPML项目可以最大限度地利用TypeScript的类型系统，确保代码质量，减少运行时错误，并提供卓越的开发体验。

## 3. 内部组件设计规范

### 3.1 目录与文件组织

- **core/**目录存放所有内部实现代码
- **最多允许两级目录结构**，不能更深层次嵌套
- 第一级子目录必须按**业务领域**划分，而非技术组件类型
- 每个业务领域目录包含该领域所有相关实现

```
core/
  parsing/                # 解析领域
    parser.ts             # 解析器实现
    parsingManager.ts     # 解析管理函数
    xmlAdapter.ts         # XML适配器
  
  document/               # 文档处理领域
    documentManager.ts    # 文档操作函数
    nodeManager.ts        # 节点操作函数
    selector.ts           # 选择器实现
  
  semantics/              # 语义处理领域
    semanticProcessor.ts  # 语义处理器
    referenceResolver.ts  # 引用解析器
  
  validation/             # 验证领域
    validator.ts          # 验证器
    schemaValidator.ts    # Schema验证器
```

### 3.1.1 目录结构限制的合理性

限制最多两级目录结构是基于TypeScript类库项目的特点而制定的实用性原则：

1. **简化导入路径**：避免过深的目录结构导致的冗长导入语句
2. **利用TypeScript优势**：TypeScript的模块系统使得在文件级别组织代码更为高效
3. **提高可导航性**：扁平化的目录结构使代码导航更直观，减少多层目录跳转
4. **便于理解**：对于库项目，简单的目录结构使使用者更容易理解项目组织

这一限制专为TypeScript类库项目设计，不一定适用于所有类型的项目。

### 3.2 业务领域划分原则

- 按实际业务功能划分，而非技术组件类型
- 每个领域是一个功能相对独立的模块
- 领域之间尽量减少相互依赖，保持松耦合

```
// 正确的划分 - 按业务领域
core/
  parsing/     // 解析相关功能集中在一起
  document/    // 文档操作相关功能集中在一起
  semantics/   // 语义处理相关功能集中在一起

// 错误的划分 - 按技术组件类型
core/
  managers/    // 所有Manager函数
  processors/  // 所有处理器
  adapters/    // 所有适配器
```

### 3.3 管理器模块设计

- 每个业务领域应有对应的管理器模块（如`documentManager.ts`）
- 管理器模块作为**领域门面(Facade)**，对外提供统一的功能接口
- 不仅处理数据操作，还负责**组件协调**和**业务流程编排**
- 从DDD视角看，管理器模块相当于**领域服务(Domain Service)**，专注于具体业务逻辑的实现

#### 3.3.1 管理器模块的四大职责

1. **门面角色**：提供简化、统一的API，隐藏内部实现复杂性
2. **组件协调**：协调多个底层组件协同工作，管理组件间交互
3. **业务流程编排**：组织完整的业务流程，实现领域功能
4. **能力聚合**：将相关功能聚合在一起，形成清晰的领域边界

```typescript
// core/document/documentManager.ts
import { Selector } from './selector';
import { validatorFactory } from '../validation/validatorFactory';
import { documentFactory } from './documentFactory';
import { DPMLDocument, DPMLNode } from '../../types';

/**
 * 查找指定ID的节点
 * [数据操作职责]
 */
export function findNodeById(document: DPMLDocument, id: string): DPMLNode | undefined {
  return document.nodesById?.get(id);
}

/**
 * 使用选择器查找节点
 * [组件协调职责]
 */
export function querySelector(document: DPMLDocument, selector: string): DPMLNode | undefined {
  // 协调使用选择器组件
  const selectorEngine = new Selector();
  return selectorEngine.querySelector(document.rootNode, selector);
}

/**
 * 验证并合并文档
 * [业务流程编排职责]
 */
export function mergeDocuments(target: DPMLDocument, source: DPMLDocument): DPMLDocument {
  // 1. 验证文档兼容性
  const validator = validatorFactory.createValidator();
  const canMerge = validator.validateMerge(target, source);
  
  if (!canMerge) {
    throw new DocumentError('文档不兼容，无法合并');
  }
  
  // 2. 创建文档副本
  const result = documentFactory.cloneDocument(target);
  
  // 3. 执行合并操作
  // ...合并逻辑
  
  // 4. 返回合并结果
  return result;
}
```

#### 3.3.2 与其他模块的关系

- **与工厂模块的协作**：管理器使用工厂函数创建所需组件
- **与数据类型的关系**：对数据结构进行操作，但不修改数据结构定义
- **与内部服务类的关系**：协调和使用内部服务类提供的功能
- **与API层的关系**：API层直接重导出管理器函数，几乎是一对一映射

```typescript
// api层与管理器模块的关系示例
// api/document.ts
export { 
  findNodeById,
  querySelector, 
  mergeDocuments 
} from '../core/document/documentManager';
```

#### 3.3.3 管理器模块与内部服务类的协作

管理器模块与内部服务类在架构中扮演不同角色，但需要协同工作：

- **管理器职责**：
  - 提供对外的业务功能接口
  - 编排业务流程和控制执行顺序
  - 协调多个组件和服务的交互
  - 处理业务规则和逻辑判断

- **内部服务类职责**：
  - 管理特定领域的内部状态
  - 提供领域特定的基础功能
  - 实现状态持久化和共享
  - 作为可被多个管理器复用的服务

**协作模式**：

1. **访问控制模式**：管理器模块应通过工厂获取内部服务类的实例，并控制对其功能的访问
2. **功能封装模式**：管理器可以封装内部服务类的多个操作，提供更高级别的业务功能
3. **状态隔离模式**：管理器不应直接操作内部服务类的内部状态，而应通过其公开方法

```typescript
// 正确的协作示例
// core/registry/registryManager.ts
import { tagRegistryFactory } from './tagRegistryFactory';

export function registerTag(tagName: string, definition: TagDefinition): void {
  // 管理器通过工厂获取内部服务类实例
  const registry = tagRegistryFactory.getGlobalTagRegistry();
  
  // 管理器负责业务规则检查
  if (!isValidTagName(tagName)) {
    throw new Error(`无效的标签名: ${tagName}`);
  }
  
  // 管理器调用内部服务类功能
  registry.register({ ...definition, name: tagName });
}
```

### 3.4 业务类设计

- 业务类负责实现特定功能逻辑
- 构造函数应接收所有必要依赖
- 优先通过参数传递依赖，避免隐式依赖和全局状态
- 设计为可独立测试的单元，支持单元测试

```typescript
// core/parsing/Parser.ts
export class Parser {
  constructor(
    private readonly options: ParserOptions,
    private readonly validator: Validator
  ) {}
  
  parse(content: string): DPMLDocument {
    // 解析逻辑实现
  }
}

// core/parsing/parsingManager.ts
import { Parser } from './Parser';
import { Validator } from '../validation/validator';
import { DPMLDocument, ParserOptions } from '../../types';

export function parse(content: string, options?: ParserOptions): DPMLDocument {
  const validator = new Validator();
  const parser = new Parser(options || {}, validator);
  return parser.parse(content);
}
```

#### 3.4.1 业务类与单例模式

业务类通常不适合使用单例模式，原因如下：

- 业务类通常有内部状态会随着不同操作而变化
- 单例会导致业务类之间产生隐式依赖
- 对测试不友好，难以模拟不同场景
- 并发操作下可能导致竞态条件

业务类应设计为通过构造函数接收依赖的多实例模式，由调用者控制其生命周期。这与内部服务类作为单例使用形成对比，体现了两种组件在职责和用途上的本质区别。

### 3.5 内部服务类设计

内部服务类是介于数据结构和管理器模块之间的特殊组件，维护特定领域状态并提供相关功能服务。

#### 3.5.1 内部服务类的特征

- **状态管理**：维护内部状态但不直接暴露，通过受控接口访问
- **功能提供**：提供特定领域的相关功能方法
- **内部可见性**：仅在core目录内可见，不直接对外暴露API，只能通过Manager模块间接访问
- **单例模式**：通常通过工厂以单例形式使用，确保状态共享和一致性
- **从DDD视角看**：内部服务类相当于**基础设施层(Infrastructure)**，提供公共组件和共享数据管理

#### 3.5.2 内部服务类的使用场景

适用于需要集中管理状态的横切关注点，如：
- 注册表（如TagRegistry）
- 缓存服务
- 配置管理
- 连接池

#### 3.5.3 与其他组件的区别

| 特性 | 内部服务类 | 数据结构 | Manager模块 | 业务类 |
|------|------------|----------|------------|--------|
| 状态 | 有状态 | 纯数据 | 无状态 | 可有状态 |
| 方法 | 有方法 | 无方法 | 有方法 | 有方法 |
| 可见性 | 内部可见 | 对外可见 | 对外API | 内部可见 |
| 实例化 | 单例 | 多实例 | 函数集合 | 多实例 |
| 职责 | 领域服务 | 数据表示 | 门面协调 | 功能实现 |

#### 3.5.4 内部服务类实现原则

- **按业务领域组织**：每个服务类专注于一个特定领域
- **工厂管理**：通过工厂模式创建和管理实例
- **Manager访问**：通过Manager模块访问服务功能
- **状态封装**：内部状态应适当封装，避免直接暴露

```typescript
// core/registry/TagRegistry.ts
export class TagRegistry {
  private tagDefinitions: Map<string, TagDefinition> = new Map();
  
  register(definition: TagDefinition): void {
    this.tagDefinitions.set(definition.name, definition);
  }
  
  getDefinition(tagName: string): TagDefinition | null {
    return this.tagDefinitions.get(tagName) || null;
  }
  
  // 其他方法...
}

// core/registry/tagRegistryFactory.ts
let instance: TagRegistry | null = null;

export function getGlobalTagRegistry(): TagRegistry {
  if (!instance) {
    instance = new TagRegistry();
  }
  return instance;
}

// core/registry/registryManager.ts
export function registerTag(tagName: string, definition: TagDefinition): void {
  const registry = getGlobalTagRegistry();
  registry.register({ ...definition, name: tagName });
}
```

#### 3.5.5 内部服务类与业务类的架构关系

内部服务类与业务类在架构中分别扮演**横向**与**纵向**的角色：

- **内部服务类（横向）**：作为基础设施层，横跨多个业务领域，提供共享服务和状态管理
  - 从DDD角度看类似于基础设施层，提供底层共享能力
  - 如TagRegistry管理所有标签定义，为多个业务领域提供服务

- **业务类（纵向）**：专注于单一业务领域的具体功能实现，消费内部服务类提供的能力
  - 从DDD角度看类似于简化版的实体，专注于特定业务逻辑
  - 不需要像传统DDD中的实体那样高度内聚，更多关注功能实现而非状态管理

这种横纵关系可以概念上表示为：

```
                     应用层 (Service)
 ───────────────────────────────────────────────
                  管理器层 (Manager)
 ───────────────────────────────────────────────
   解析领域  |  文档领域  |  验证领域  |  其他领域
 (纵向业务类) | (纵向业务类) | (纵向业务类) | (纵向业务类)
   Parser   |  Selector  |  Validator |   ...
     ↓      |     ↓      |     ↓      |    ↓
 ═══════════════════════════════════════════════
            内部服务类（横向基础设施）
      TagRegistry、缓存、配置、连接池等
```

**重要说明**：上图是概念模型，展示了组件间的逻辑关系。在实际目录结构中，仍需遵循§3.1节中"最多允许两级目录结构"的约束：

1. **物理目录组织**：代码应按业务领域组织在相应的一级子目录中
2. **内部服务类位置**：内部服务类应放在其主要服务的业务领域目录下
3. **跨域访问**：逻辑上的"横向"是通过跨目录引用实现，而非创建额外的目录层级

示例目录结构：
```
core/
  registry/               # 注册相关领域
    TagRegistry.ts        # 内部服务类
    tagRegistryFactory.ts # 工厂
    registryManager.ts    # 管理器
    
  parsing/                # 解析相关领域
    Parser.ts             # 业务类
    parserFactory.ts      # 工厂
    parsingManager.ts     # 管理器
    
  document/               # 文档相关领域
    // ...可以使用registry领域中的内部服务类
```

这样既保持了概念上的横向/纵向架构关系，又符合§3.1节的目录结构约束。

**架构设计优势**：

1. **关注点分离**：内部服务类负责共享状态管理，业务类专注于业务逻辑
2. **依赖明确**：业务类通过依赖注入或工厂方法获取内部服务
3. **重用性提高**：内部服务可被多个业务领域共同使用，避免重复实现
4. **测试便利**：可以通过mock内部服务来独立测试业务类

在实际开发中，识别组件是作为横向的内部服务类还是纵向的业务类，有助于正确设计其职责边界和交互方式。

#### 3.5.6 内部服务类与不可变原则

尽管内部服务类需要管理状态，但仍应尽可能遵循不可变原则：

1. **内部状态管理**：内部服务类可以维护可变状态，这是其核心职责之一
2. **对外接口设计**：对外提供的方法应遵循不可变原则，通过返回新对象而非修改传入参数
3. **操作原子性**：状态修改操作应保持原子性，避免部分修改导致的不一致状态
4. **状态隔离**：将可变状态严格封装在内部，不直接暴露给外部修改

```typescript
// 内部服务类中应用不可变原则的例子
export class TagRegistry {
  // 内部状态允许可变
  private tagDefinitions: Map<string, TagDefinition> = new Map();
  
  // 对外接口遵循不可变原则
  getDefinitions(): ReadonlyMap<string, TagDefinition> {
    // 返回只读视图，防止外部修改
    return this.tagDefinitions;
  }
  
  // 明确的状态修改方法
  register(definition: TagDefinition): void {
    // 内部状态修改是有意的设计
    this.tagDefinitions.set(definition.name, { ...definition });
  }
  
  // 操作返回新对象而非修改输入
  mergeDefinitions(otherDefinitions: TagDefinition[]): TagRegistry {
    const newRegistry = new TagRegistry();
    
    // 复制当前定义
    for (const [name, def] of this.tagDefinitions.entries()) {
      newRegistry.register({ ...def });
    }
    
    // 添加新定义
    for (const def of otherDefinitions) {
      newRegistry.register({ ...def });
    }
    
    return newRegistry;
  }
}
```

这种设计使内部服务类能够集中管理状态，同时尽可能遵循不可变原则。

### 3.6 命名约定

- **业务领域目录**：使用小写名词，如`parsing`、`document`
- **管理器模块**：使用小驼峰名词+Manager形式，如`documentManager.ts`
- **实现类**：使用大写驼峰名词，反映其功能，如`Parser`、`Validator`
- **函数名称**：使用小驼峰动词+名词形式，如`findNodeById`、`parseDocument`

### 3.7 不可变原则

- 操作数据时应遵循不可变原则
- 避免直接修改传入的参数
- 返回新的数据结构而非修改原有结构

```typescript
// 正确示例 - 返回新对象
export function addAttribute(node: DPMLNode, name: string, value: string): DPMLNode {
  return {
    ...node,
    attributes: new Map([...node.attributes, [name, value]])
  };
}

// 错误示例 - 修改原对象
export function addAttribute(node: DPMLNode, name: string, value: string): void {
  node.attributes.set(name, value);
}
```

### 3.8 文档规范

- 所有类和函数应有JSDoc注释
- 注释应说明功能、参数、返回值和可能的异常
- 复杂算法应有详细的实现说明

```typescript
/**
 * 从文档中分离指定的节点，返回新的文档
 * @param document - 源文档
 * @param nodeId - 要分离的节点ID
 * @returns 包含分离节点的新文档，如果未找到节点则返回null
 * @throws DocumentError 当节点不存在时抛出
 */
export function extractNode(document: DPMLDocument, nodeId: string): DPMLDocument | null {
  // 实现...
}
```

### 3.9 工厂模式设计

- 使用工厂模块处理对象创建和生命周期管理
- 每个需要实例化管理的组件应有对应的工厂模块
- 工厂模块名以`factory`结尾，如`parserFactory.ts`
- 适用于业务类和内部服务类的实例化，但应用方式有所不同

#### 3.9.1 工厂模块职责

- 负责创建和配置复杂对象
- 管理对象的生命周期（包括可能的单例模式）
- 封装创建逻辑，隐藏实现细节
- 注入必要的依赖

```typescript
// core/parsing/parserFactory.ts
import { Parser } from './Parser';
import { validatorFactory } from '../validation/validatorFactory';
import { ParserOptions } from '../../types';

/**
 * 创建解析器实例
 */
export function createParser(options?: ParserOptions): Parser {
  const validator = validatorFactory.createValidator();
  return new Parser(options || {}, validator);
}
```

#### 3.9.2 业务类与内部服务类的工厂模式区别

| 特性 | 业务类工厂 | 内部服务类工厂 |
|------|----------|--------------|
| 实例管理 | 通常创建新实例 | 通常管理单例 |
| 状态 | 无状态或临时状态 | 维护持久状态 |
| 依赖注入 | 每次创建注入依赖 | 初始化时注入依赖 |
| 生命周期 | 调用者控制 | 工厂管理 |
| 重置功能 | 很少需要 | 通常提供(主要用于测试) |

##### 业务类工厂示例

```typescript
// 业务类工厂：每次调用创建新实例
export function createParser(options?: ParserOptions): Parser {
  // 创建依赖
  const validator = validatorFactory.createValidator();
  // 返回新实例
  return new Parser(options || {}, validator);
}
```

##### 内部服务类工厂示例

```typescript
// 内部服务类工厂：管理单例
import { TagRegistry } from './TagRegistry';

// 单例实例
let instance: TagRegistry | null = null;

// 获取全局单例
export function getGlobalTagRegistry(): TagRegistry {
  if (!instance) {
    instance = new TagRegistry();
  }
  return instance;
}

// 创建新实例(用于特殊场景)
export function createTagRegistry(): TagRegistry {
  return new TagRegistry();
}

// 重置单例(主要用于测试)
export function resetGlobalTagRegistry(): void {
  instance = null;
}

// 导出为命名空间对象
export const tagRegistryFactory = {
  getGlobalTagRegistry,
  createTagRegistry,
  resetGlobalTagRegistry
};
```

#### 3.9.3 与管理器模块的区别

- **工厂模块**：负责对象创建和生命周期
- **管理器模块**：提供数据操作和业务逻辑

```typescript
// 使用示例
// core/parsing/parsingManager.ts
import { parserFactory } from './parserFactory';
import { DPMLDocument, ParserOptions } from '../../types';

export function parse(content: string, options?: ParserOptions): DPMLDocument {
  // 使用工厂函数创建Parser
  const parser = parserFactory.createParser(options);
  // 执行解析操作
  return parser.parse(content);
}
```

#### 3.9.4 高级工厂模式

对于更复杂的场景，可以实现高级工厂模式并导出命名空间：

```typescript
// core/validation/validatorFactory.ts
import { Validator, BasicValidator, SchemaValidator } from './validators';

/**
 * 根据验证类型创建验证器
 */
function createValidator(type: 'schema' | 'basic' = 'basic'): Validator {
  switch (type) {
    case 'schema':
      return new SchemaValidator();
    case 'basic':
    default:
      return new BasicValidator();
  }
}

// 导出命名空间对象
export const validatorFactory = {
  createValidator
};
```

### 3.10 Service层设计

Service层作为core内部实现的关键组成部分，连接Manager模块与API层，提供业务功能的组织和封装。

#### 3.10.1 Service层的定义与职责

- **领域功能组织**：整合同一业务领域的功能，提供聚合的服务接口
- **映射与转换**：将Manager模块提供的功能映射到对外的API
- **功能聚合点**：作为特定领域功能的聚合点，使上层API保持简洁
- **抽象隔离**：在core内部与上层API之间提供稳定的抽象层
- **错误处理统一**：捕获来自Manager层的领域异常，转换为统一的错误格式
- **从DDD视角看**：Service层相当于**应用服务层(Application Service)**，组织用例级别的功能

#### 3.10.2 Service层组织原则

- **按业务领域划分**：每个业务领域应有对应的Service模块
- **命名规范**：文件名使用大驼峰命名法，以`Service`结尾，如`DocumentService.ts`、`ParserService.ts`
- **保持轻量**：不应包含复杂业务逻辑，主要职责是重新导出和组织Manager层函数
- **一致性**：所有Manager功能应统一通过Service层暴露，API层不应直接导出Manager函数

```typescript
// core/document/DocumentService.ts - 正确示例
/**
 * 文档服务
 * 提供文档和节点操作的服务
 */
export {
  createDocument,
  cloneDocument,
  findNodeById,
  querySelector
} from './documentManager';

// 同时聚合多个Manager的功能
export {
  validateDocument
} from '../validation/validationManager';

// api/document.ts - 正确示例
export * from '../core/document/DocumentService';

// api/document.ts - 错误示例
// 错误：API层直接从Manager导出，绕过Service层
import {
  createDocument,
  findNodeById
} from '../core/document/documentManager';
```

#### 3.10.3 与其他层的关系

- **与API层**：API层直接导出Service层提供的功能，形成一对一映射
- **与Manager层**：Service层重组和封装来自不同Manager的功能，提供领域级服务
- **与业务类**：不直接使用业务类，而是通过Manager层间接使用
- **与内部服务类**：不直接使用内部服务类，保持间接访问原则

#### 3.10.4 Service层的优势

- **关注点分离**：使API层专注于暴露接口，Manager层专注于业务逻辑，Service层专注于功能组织
- **接口稳定性**：当内部实现变化时，可以在Service层适配，保持API稳定
- **功能演进**：便于随着业务发展逐步扩展和重组API，而不破坏已有接口
- **领域一致性**：确保同一领域的功能以一致的方式暴露和使用

Service层是连接内部实现与上层API的关键环节，通过合理设计Service层，可以使系统架构更加清晰、灵活和可维护。

#### 3.10.5 统一错误处理策略

Service层是处理错误的关键环节，负责将内部错误转换为对外一致的格式：

1. **错误捕获**：捕获来自Manager和业务层的领域异常
2. **错误转换**：将内部异常转换为对外一致的错误类型
3. **上下文丰富**：添加额外上下文信息，使错误更有意义
4. **错误传递**：API层直接传递Service层的错误，不做额外处理

```typescript
// Service层统一错误处理示例 - core/parsing/ParserService.ts
import { parse as internalParse } from './parsingManager';
import { DPMLDocument, ParserError } from '../../types';

export function parse(content: string): DPMLDocument {
  try {
    return internalParse(content);
  } catch (error) {
    // 统一错误处理
    if (error instanceof ParserError) {
      // 已经是领域错误，直接传递
      throw error;
    }
    // 普通错误转换为领域错误
    throw new ParserError(
      `解析失败: ${error.message}`,
      { fileName: 'unknown', line: 0, column: 0 }
    );
  }
}
```

这种策略确保从API层抛出的所有错误都有一致的格式和足够的上下文信息，简化客户端的错误处理。

## 4. 架构总览

本章节提供DPML核心架构的整体视图，帮助开发者全面理解各组件间的关系和数据流动方式。

### 4.1 架构分层可视化

以下是DPML核心架构的分层示意图，展示了顶层架构和core内部实现的组织结构：

```
                        ┌───────────────────────┐
                        │     外部使用者         │
                        └───────────┬───────────┘
                                    │
           ┌────────────────────────▼─────────────────────────┐
           │                  顶层架构                          │
           │  ┌─────────────────────────────────────────────┐ │
           │  │                  API 层                     │ │
           │  │    (函数式API接口，对外暴露，最薄的一层)        │ │
           │  └─────────────────────────────────────────────┘ │
           │                      │                           │
           │  ┌─────────────────────────────────────────────┐ │
           │  │                 types 层                    │ │
           │  │    (数据结构定义，无行为逻辑的纯类型)           │ │
           │  └─────────────────────────────────────────────┘ │
           └────────────────────────┬─────────────────────────┘
                                    │
           ┌────────────────────────▼─────────────────────────┐
           │                 core 内部实现                     │
           │                                                  │
           │  ┌─────────────────────────────────────────────┐ │
           │  │               Service 层                    │ │
           │  │  ┌───────────┐  ┌───────────┐  ┌─────────┐  │ │
           │  │  │ParserServ.│  │DocumentS. │  │RegistryS│  │ │
           │  │  └───────────┘  └───────────┘  └─────────┘  │ │
           │  └──────────────────────┬──────────────────────┘ │
           │                         │                        │
           │  ┌──────────────────────▼──────────────────────┐ │
           │  │               Manager 层                    │ │
           │  │  ┌───────────┐  ┌───────────┐  ┌─────────┐  │ │
           │  │  │parsingMgr │  │documentMgr│  │registryM│  │ │
           │  │  └───────────┘  └───────────┘  └─────────┘  │ │
           │  └──────┬─────────────┬────────────┬───────────┘ │
           │         │             │            │             │
           │  ┌──────▼──────┐ ┌────▼────────┐ ┌─▼──────────┐  │
           │  │ 解析领域     │ │ 文档领域    │ │ 注册表领域  │  │
           │  │             │ │            │ │            │  │
           │  │ ┌─────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │  │
           │  │ │Parser   │ │ │ │Selector│ │ │ │TagReg. │ │  │
           │  │ │(业务类)  │ │ │ │(业务类)│ │ │ │(内部服务)│ │  │
           │  │ └─────────┘ │ │ └────────┘ │ │ └────────┘ │  │
           │  │             │ │            │ │            │  │
           │  │ ┌─────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │  │
           │  │ │工厂模块  │ │ │ │工厂模块│ │ │ │工厂模块 │ │  │
           │  │ └─────────┘ │ │ └────────┘ │ │ └────────┘ │  │
           │  └─────────────┘ └────────────┘ └────────────┘  │
           └──────────────────────────────────────────────────┘
```

DPML架构分为两个主要部分：

1. **顶层架构**：
   - **API层**：最薄的一层，纯函数式接口，直接暴露给外部使用者
   - **types层**：纯数据结构定义，无行为逻辑

2. **core内部实现**：
   - **Service层**：组织和封装业务功能，连接Manager与API层
   - **Manager层**：协调领域功能，提供业务流程编排
   - **领域层**：包含业务类、内部服务类与工厂模块

这种分层设计使各组件职责边界清晰，并反映标准的代码组织结构。

### 4.2 数据流示意图

下图展示了数据在DPML架构中的标准流动路径：

```
            请求数据流向                         响应数据流向
            ────────────>                       <────────────
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│        │    │        │    │        │    │        │    │        │
│ 外部   │    │  API   │    │ Service│    │Manager │    │业务类/ │
│使用者  │───>│ (函数) │───>│  层    │───>│ 模块   │───>│内部服务 │
│        │    │        │    │        │    │        │    │        │
└────────┘    └────────┘    └────────┘    └────────┘    └────────┘
                │                              │             │
                │                              │             │
                └──────────────────────────────┘             ▼
                              │                         ┌────────┐
                              │                         │        │
                              │                         │数据类型│
                              │                         │        │
                              │                         └────────┘
                              │                             ▲
                              │         ┌────────┐          │
                              └────────>│ 工厂   │──────────┘
                                        │ 模块   │
                                        └────────┘
```

数据流动过程：
1. **请求入口**：外部使用者调用API层函数
2. **API传递**：API层将请求传递给Service层
3. **Service组织**：Service层组织功能并委托给Manager模块
4. **Manager协调**：Manager使用工厂创建所需的业务类/内部服务类实例
5. **业务处理**：业务类/内部服务类处理请求，操作数据结构
6. **数据返回**：处理后的数据结构通过各层返回给外部使用者

重要说明：
- API层是纯函数层，不包含状态和业务逻辑
- Service层负责功能组织，不包含复杂实现
- 数据操作和业务逻辑集中在Manager层和领域层
- 数据结构(类型)在整个流程中作为数据载体，不包含行为

### 4.3 核心组件关系矩阵

下表定义了DPML架构中各核心组件之间的访问和依赖关系：

| 组件类型 | 可以访问 | 不可访问 | 被谁访问 | 依赖关系 |
|---------|---------|----------|---------|---------|
| **API函数** | Service层 | Manager、业务类、内部服务类、工厂 | 外部使用者 | 依赖Service层 |
| **types类型** | - | - | 所有组件 | 纯数据结构，无依赖 |
| **Service层** | Manager模块 | 业务类、内部服务类、工厂 | API函数 | 依赖Manager模块 |
| **Manager模块** | 业务类、内部服务类、工厂、types类型 | API函数 | Service层、其他Manager | 依赖工厂模块和types类型 |
| **业务类** | 其他业务类、内部服务类、types类型 | API函数、Service层 | Manager模块 | 通过构造函数注入依赖 |
| **内部服务类** | types类型 | API函数、Service层 | Manager模块、业务类 | 通常作为单例，状态独立 |
| **工厂模块** | 业务类、内部服务类、其他工厂 | API函数、Service层 | Manager模块 | 负责创建和管理组件实例 |

组件交互规则：
- **单向依赖**：组件依赖方向为API → Service → Manager → 业务类/内部服务类，避免循环依赖
- **层级访问控制**：上层组件只能访问直接下层组件，不能跨层访问
- **顶层与core层分离**：顶层架构(API函数、types类型)与core内部实现严格分离
- **职责边界**：每种组件具有明确职责边界，不越权操作
- **可见性控制**：内部组件对外部不可见，保持封装性

### 4.4 核心层次概念明确区分

为避免在架构实现中出现概念混淆，本节详细区分API层、Service层和Manager层的定义、职责和关系。

#### 4.4.1 三个层次的明确定义

| 层次 | 目录位置 | 命名规范 | 主要职责 | 代码性质 | 可见性 | 依赖方向 |
|------|----------|----------|----------|----------|--------|----------|
| **API层** | `/api` | 领域名称<br>如`parser.ts` | 暴露功能、委托转发 | 极简导出语句 | 对外可见 | 仅依赖Service层 |
| **Service层** | `/core/[domain]` | 大驼峰+Service<br>如`ParserService.ts` | 功能聚合、领域封装 | 重组导出语句 | 仅核心内可见 | 依赖一个或多个Manager层 |
| **Manager层** | `/core/[domain]` | 小驼峰+Manager<br>如`parsingManager.ts` | 业务逻辑实现、流程编排 | 实现函数 | 仅核心内可见 | 依赖业务类和内部服务类 |

#### 4.4.2 关键区别

#### API层 vs Service层
- **API层**是面向外部的接口层，不包含任何业务逻辑，只做委托转发
- **Service层**是面向内部的域服务层，组织同一领域的功能，可能聚合多个Manager的功能
- **API层**直接导出**Service层**的功能，不应跨过Service层直接访问Manager层

```typescript
// API层 - api/parser.ts
export * from '../core/parsing/ParserService';

// Service层 - core/parsing/ParserService.ts
export { parse, parseFile } from './parsingManager';
export { validateSyntax } from '../validation/validationManager';
```

#### Service层 vs Manager层
- **Service层**负责功能聚合和重新导出，本身不实现业务逻辑
- **Manager层**负责实际的业务逻辑实现、流程编排和组件协调
- **Service层**可聚合多个**Manager层**的功能，形成领域级服务

```typescript
// Service层 - core/document/DocumentService.ts
export { createDocument, findNodeById } from './documentManager';
export { validateDocument } from '../validation/validationManager';

// Manager层 - core/document/documentManager.ts
import { DocumentFactory } from './DocumentFactory';
import { NodeRegistry } from '../registry/NodeRegistry';

export function createDocument() {
  const factory = new DocumentFactory();
  return factory.create();
}

export function findNodeById(doc, id) {
  // 实现业务逻辑
}
```

#### 4.4.3 代码示例对比

**三层交互完整示例：**

```typescript
// 内部服务类 - core/registry/TagRegistry.ts
export class TagRegistry {
  private definitions = new Map();
  
  getDefinition(name: string) {
    return this.definitions.get(name);
  }
  
  // 其他方法...
}

// Manager层 - core/registry/registryManager.ts
import { TagRegistry } from './TagRegistry';

export function getTagDefinition(name: string) {
  const registry = new TagRegistry();
  return registry.getDefinition(name);
}

// Service层 - core/registry/RegistryService.ts
export { getTagDefinition } from './registryManager';

// API层 - api/registry.ts
export * from '../core/registry/RegistryService';

// 用户代码 - 使用API
import { getTagDefinition } from './api/registry';
```

#### 4.4.4 判断标准

判断代码应该属于哪一层的基本原则：

1. **如果代码只是导出其他模块的功能**，且位于`/api`目录，那它属于**API层**
2. **如果代码只包含导出语句，重组多个Manager的功能**，且位于`/core`目录中，那它属于**Service层**
3. **如果代码包含实际的业务逻辑实现**，且位于`/core`目录中，那它属于**Manager层**
4. **如果代码是具体组件的内部实现**，那它应该是业务类或内部服务类

### 4.4.5 常见误区

1. **直接从API层使用Manager层**
   ```typescript
   // 错误示例：API层绕过Service层
   // api/document.ts
   export * from '../core/document/documentManager';
   ```

2. **在Service层实现业务逻辑**
   ```typescript
   // 错误示例：Service层不应包含业务逻辑实现
   // core/parsing/ParserService.ts
   export function parse(content) {
     // 这里不应该有业务逻辑实现，应该放在Manager层
     const ast = buildAST(content);
     return transformAST(ast);
   }
   ```

3. **Manager层直接暴露内部服务类**
   ```typescript
   // 错误示例：Manager不应直接暴露内部服务类
   // core/registry/registryManager.ts
   export { TagRegistry } from './TagRegistry';
   ```

4. **层次职责不清**
   ```typescript
   // 错误示例：混合多层职责
   // api/parser.ts
   import { Parser } from '../core/parsing/Parser';
   
   export function parse(content) {
     // API层不应包含业务逻辑，应委托给Service层
     const parser = new Parser();
     return parser.parse(content);
   }
   ```

通过遵循这些明确的层次划分和原则，可以使系统架构更加清晰，职责分明，降低各组件间的耦合，提高代码的可维护性和可扩展性。

## 5. 测试策略

为确保DPML架构的稳定性和可靠性，不同层次应采用不同的测试策略，针对其在架构中的职责进行有效测试。

### 5.1 分层测试策略

| 架构层次 | 测试类型 | 测试重点 | 测试工具 |
|---------|---------|---------|---------|
| **API层和types层** | 契约测试、端到端测试 | 接口稳定性、类型定义、完整功能路径 | Jest、TypeScript |
| **Service层** | 集成测试 | 用例级功能、错误处理、组件协作 | Jest、模拟 |
| **Manager层和组件** | 单元测试 | 业务逻辑、边界条件 | Jest、模拟 |

### 5.2 测试侧重点

#### 5.2.1 需要单元测试的组件

- **Manager层**的业务逻辑函数
- **业务类**(如Parser)的具体实现
- **内部服务类**的核心方法
- **工厂模块**的创建逻辑

#### 5.2.2 可以不做单元测试的组件

- **API层函数**(因为只是薄层委托)
- **Service层**(主要是重导出和组织)
- 简单的工具函数
- 纯数据类型定义

### 5.3 测试实践建议

- **契约测试**：确保API签名和类型定义不会意外变更
- **端到端测试**：验证从API调用到最终结果的完整流程
- **集成测试**：测试Service层组织的用例级功能，包括错误处理
- **单元测试**：隔离测试Manager和业务类的核心逻辑

```typescript
// API层契约测试示例
describe('API契约测试', () => {
  it('parse函数应保持签名稳定', () => {
    // 验证函数存在且签名正确
    expect(typeof parse).toBe('function');
    // 调用函数验证基本行为
    const result = parse('<tag>content</tag>');
    expect(result).toHaveProperty('rootNode');
  });
});

// Service层集成测试示例
describe('ParserService集成测试', () => {
  it('应正确解析并验证文档', () => {
    const result = parseWithValidation('<tag>content</tag>');
    expect(result.valid).toBe(true);
    expect(result.document.rootNode.tagName).toBe('tag');
  });
  
  it('应统一处理解析错误', () => {
    expect(() => parseWithValidation('<<<')).toThrow(ParserError);
  });
});

// Manager层单元测试示例
describe('parsingManager单元测试', () => {
  it('findNodeById应返回正确节点', () => {
    const doc = createTestDocument();
    const node = findNodeById(doc, 'test-id');
    expect(node?.tagName).toBe('expected-tag');
  });
});
```

这种测试策略确保测试资源集中在最有价值的部分，避免为测试而测试，同时保障整个架构的稳定性和可靠性。

## 6. 架构应用与歧义解决

为消除实施过程中的潜在歧义，本章节提供补充指南和决策框架。

### 6.1 架构结构调整说明

#### 6.1.1 Service层位置调整

与原文档描述不同，Service层文件应直接放置在core目录下，而非业务领域目录内：

```
core/
  parsing/                 
    Parser.ts              # 业务类
    parsingManager.ts      # Manager层
  parserService.ts         # Service层(直接放在core目录下)
  documentService.ts       # Service层(直接放在core目录下)
```

这种调整有以下优势：
- 更好地体现Service作为跨领域聚合层的架构定位
- 通过目录结构直接反映架构层次，更加直观
- 避免在领域目录中混合不同层次的组件
- 更符合DDD中应用服务层的概念定位

#### 6.1.2 Service层命名规范修正

Service层文件应使用小驼峰命名法，而非之前描述的大驼峰命名法：

- **正确**：`parserService.ts`、`documentService.ts`
- **错误**：`ParserService.ts`、`DocumentService.ts`

原因是Service不是类而是功能模块(包含导出语句的文件)，应按照TypeScript模块命名惯例使用小驼峰。

### 6.2 Service层与Manager层界限明确化

#### 6.2.1 决策树判断

```
开始 → 是否只包含导出语句和简单组合？
      ├── 是 → 是否需要跨领域聚合功能？
      │     ├── 是 → Service层(放在core目录下)
      │     └── 否 → 是否位于api目录？
      │           ├── 是 → API层
      │           └── 否 → Service层(功能较单一)
      └── 否 → 是否包含具体业务逻辑实现？
            ├── 是 → Manager层(放在领域目录下)
            └── 否 → 工具函数
```

#### 6.2.2 层次职责澄清

| 层次 | 主要职责 | 位置 | 命名规范 | DDD对应 |
|------|---------|------|---------|---------|
| **API层** | 对外暴露接口，委托Service | `/api` | 小写领域名<br>如`parser.ts` | 接口层 |
| **Service层** | 跨域功能聚合，统一错误处理 | `/core` | 小驼峰+service<br>如`parserService.ts` | 应用服务层 |
| **Manager层** | 业务逻辑实现，组件协调 | `/core/[domain]` | 小驼峰+Manager<br>如`parsingManager.ts` | 领域服务层 |

#### 6.2.3 边界案例示例

```typescript
// Service层示例 - 跨域功能聚合，放在core目录
// core/documentService.ts
import { findNodeById } from './document/documentManager';
import { validateNode } from './validation/validationManager';

// 跨域功能聚合
export function findAndValidateNode(doc, id) {
  const node = findNodeById(doc, id);
  if (!node) return null;
  return { node, isValid: validateNode(node) };
}

// 直接重导出
export { findNodeById } from './document/documentManager';
export { createDocument } from './document/documentFactory';

// Manager层示例 - 单域业务逻辑实现
// core/document/documentManager.ts
import { DocumentFactory } from './DocumentFactory';
import { NodeRegistry } from '../registry/NodeRegistry';

export function findNodeById(doc, id) {
  // 具体业务逻辑实现
  // ...
}
```

### 6.3 内部服务类与业务类区分指南

#### 6.3.1 混合类型处理准则

当组件同时具备内部服务类和业务类特性时，按以下优先级判断：

1. **主要职责原则**：评估类的主要职责是状态管理还是业务功能
2. **状态共享程度**：需要全局共享状态的优先视为内部服务类
3. **实例化模式**：设计为单例的通常应视为内部服务类

#### 6.3.2 决策流程图

```
开始 → 是否需要管理共享状态？
      ├── 是 → 是否需要在多个域间共享？
      │     ├── 是 → 内部服务类
      │     └── 否 → 是否设计为单例？
      │           ├── 是 → 内部服务类
      │           └── 否 → 业务类(带状态)
      └── 否 → 是否主要提供功能？
            ├── 是 → 业务类
            └── 否 → 重新评估组件职责
```

#### 6.3.3 混合职责重构指南

识别到混合职责的类时，考虑以下重构方法：
- 提取状态管理到专用内部服务类
- 将业务逻辑移至业务类
- 通过依赖注入建立两者关系

```typescript
// 重构前 - 混合职责
class TagProcessor {
  private static instance: TagProcessor;
  private tags = new Map();
  
  static getInstance() { /* 单例逻辑 */ }
  
  registerTag(tag) { /* 状态管理 */ }
  processTag(tag) { /* 业务逻辑 */ }
}

// 重构后 - 职责分离
// 内部服务类
class TagRegistry {
  private static instance: TagRegistry;
  private tags = new Map();
  
  static getInstance() { /* 单例逻辑 */ }
  registerTag(tag) { /* 状态管理 */ }
  getTag(name) { /* 状态访问 */ }
}

// 业务类
class TagProcessor {
  constructor(private registry: TagRegistry) {}
  processTag(tag) { /* 业务逻辑 */ }
}
```

### 6.4 API委托原则与渐进式API暴露的统一

#### 6.4.1 "薄层"概念澄清

"薄层"特指每个API函数的逻辑复杂度，而非API的数量或粒度：
- API函数可以有多种粒度和数量，但每个函数都应避免包含复杂业务逻辑
- 随项目发展API数量可增加，但每个API本身应保持"薄"的特性

#### 6.4.2 API演进决策矩阵

| 项目阶段 | API复杂度策略 | API数量策略 | 委托方式 |
|---------|------------|------------|---------|
| 初始阶段 | 简单高层API | 最小必要集 | 直接委托到单一Service |
| 成长阶段 | 保持简单+有选择性暴露底层 | 按需增加 | 可能组合多个Service |
| 成熟阶段 | 多层次API体系 | 完整覆盖 | 复杂委托关系 |

#### 6.4.3 平衡原则

1. **包装而非实现**：API层可以包装和组合Service层功能，但不应实现业务逻辑
2. **组合不违反薄层**：多个Service功能的简单组合不视为违反薄层原则
3. **参数转换是允许的**：API层可进行简单参数转换和默认值设置

### 6.5 目录结构约束的灵活应用

#### 6.5.1 允许例外的场景

二级目录结构限制的例外情况：

1. **测试目录**：`__tests__`目录可以有更深的嵌套以匹配源代码结构
2. **生成的代码**：自动生成的代码可以有自己的目录结构
3. **第三方集成**：与第三方系统集成的适配器可以有独立的子目录
4. **大型模块拆分**：当单个模块代码量超过一定阈值(如5000行)时

#### 6.5.2 大型项目的组织替代方案

当项目增长超出两级目录结构的合理管理范围时：

1. **水平拆分**：将大型域拆分为多个平行小域
   ```
   // 替代深层嵌套
   core/
     parsing/            // 变为多个平行目录
     parsing-xml/
     parsing-json/
     parsing-custom/
   ```

2. **提取公共库**：将稳定的公共功能提取到单独的包
   ```
   packages/
     core/               // 核心功能
     parsing-utils/      // 提取的解析工具
     validation/         // 提取的验证功能
   ```

3. **使用命名约定**：通过文件命名传达归属关系
   ```
   core/parsing/
     base.parser.ts      // 命名约定表达层次
     xml.parser.ts
     json.parser.ts
   ```

### 6.6 测试策略明确化

#### 6.6.1 组件对应测试策略矩阵

| 组件类型 | 主要测试方法 | 测试重点 | 测试示例 |
|---------|------------|----------|---------|
| API层 | 集成测试+契约测试 | 接口稳定性、行为正确性 | 验证API签名和基本功能 |
| Service层 | 集成测试 | 跨域功能组合正确性 | 测试跨Manager功能协作 |
| Manager层 | 单元测试+集成测试 | 业务逻辑正确性 | 测试各种业务场景和边界条件 |
| 业务类 | 单元测试 | 功能实现正确性 | 隔离测试每个方法行为 |
| 内部服务类 | 单元测试+状态测试 | 状态管理正确性 | 测试状态变化和并发行为 |

#### 6.6.2 Service层测试示例

```typescript
// Service层集成测试示例
describe('documentService', () => {
  it('findAndValidateNode应正确组合多个Manager功能', () => {
    const doc = createTestDocument();
    // 测试跨域功能组合
    const result = findAndValidateNode(doc, 'test-id');
    expect(result.node).toBeDefined();
    expect(result.valid).toBe(true);
  });
});
```

### 6.7 统一异常处理架构

为弥补文档中异常处理架构的不足，增加以下补充设计：

#### 6.7.1 错误分类体系

建立清晰的错误类型继承层次：

```typescript
// 基础错误类
export abstract class DPMLError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly severity: ErrorSeverity = 'error'
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// 解析错误
export class ParseError extends DPMLError {
  constructor(
    message: string,
    public readonly location: SourceLocation
  ) {
    super(message, 'PARSE_ERROR');
  }
}

// 验证错误
export class ValidationError extends DPMLError {
  constructor(
    message: string,
    public readonly violations: ValidationViolation[]
  ) {
    super(message, 'VALIDATION_ERROR');
  }
}

// 更多特定错误类型...
```

#### 6.7.2 错误处理责任分配

| 层次 | 错误处理职责 |
|------|------------|
| API层 | 直接传递Service层错误，不做额外处理 |
| Service层 | 捕获Manager错误，转换为统一错误类型，添加上下文 |
| Manager层 | 捕获业务类错误，添加业务上下文，可能重新抛出 |
| 业务类 | 抛出具体操作错误，附带详细上下文 |

#### 6.7.3 Service层统一错误处理示例

```typescript
// core/parserService.ts
import { parse as internalParse } from './parsing/parsingManager';
import { DPMLDocument, ParseError, DPMLError } from '../types';

export function parse(content: string): DPMLDocument {
  try {
    return internalParse(content);
  } catch (error) {
    // 统一错误处理
    if (error instanceof DPMLError) {
      // 已经是领域错误，直接传递
      throw error;
    }
    // 普通错误转换为领域错误
    throw new ParseError(
      `解析失败: ${error.message}`,
      { fileName: 'unknown', line: 0, column: 0 }
    );
  }
}
```

### 6.8 架构规则的灵活应用

#### 6.8.1 主导特性原则

组件分类基于其主导特性，而非要求完全符合所有特性：
- 一个组件可能具有次要特性，但应基于其主要职责进行分类
- 识别组件的主导特性(如状态管理、业务逻辑、数据传输)做出判断

#### 6.8.2 架构适应性原则

1. **目标导向**：架构规则服务于代码质量和可维护性，而非相反
2. **合理变通**：在合理情况下可灵活应用规则，但需文档说明
3. **渐进改进**：允许代码随项目演进逐步符合架构规则
4. **异常处理**：特殊情况应通过团队评审决定，并记录决策理由
