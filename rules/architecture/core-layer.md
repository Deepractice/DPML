# Core层设计规则

本文档定义了DPML类库Core层设计的强制规则。

> **重要说明**：本文档中的所有代码示例仅用于说明设计规则和原则，是概念性的举例而非实际实现要求。实际实现时应遵循规则的精神，而不必严格按照示例代码的具体实现细节。

## 1. 目录与文件组织

1. **core目录规则**: `core/`目录存放所有内部实现代码
2. **目录层级规则**: **最多允许两级目录结构**，不能更深层次嵌套
3. **模块划分规则**: 第一级子目录必须按**业务功能**划分，而非技术组件类型
4. **模块内聚规则**: 每个业务模块目录包含该模块所有相关实现

```
core/
  parsing/                # 解析模块
    parsingService.ts     # 解析服务模块
    parser.ts             # 解析器实现
    xmlAdapter.ts         # XML适配器
  
  document/               # 文档处理模块
    documentService.ts    # 文档服务模块
    selector.ts           # 选择器实现
  
  semantics/              # 语义处理模块
    semanticsService.ts   # 语义服务模块
    referenceResolver.ts  # 引用解析器
  
  validation/             # 验证模块
    validationService.ts  # 验证服务模块
    validator.ts          # 验证器实现
```

### 1.1 模块划分原则

1. **功能划分规则**: 按实际业务功能划分，而非技术组件类型
2. **模块独立性规则**: 每个模块是一个功能相对独立的单元
3. **松耦合规则**: 模块之间尽量减少相互依赖，保持松耦合

```
// 正确的划分 - 按业务功能
core/
  parsing/     // 解析相关功能集中在一起
  document/    // 文档操作相关功能集中在一起
  semantics/   // 语义处理相关功能集中在一起

// 错误的划分 - 按技术组件类型
core/
  services/    // 所有Service模块
  processors/  // 所有处理器
  adapters/    // 所有适配器
```

## 2. 模块服务设计规则

1. **定义规则**: 模块服务是core内部实现的核心组成部分，负责提供特定模块的业务功能，直接连接API层与模块实现
2. **目录位置规则**: 模块服务文件必须放置在core目录顶层，以便统一协调各功能模块
3. **命名规则**: 文件名必须使用小驼峰命名法，以`Service`结尾，如`parsingService.ts`, `documentService.ts`
4. **功能完整性规则**: 模块服务应提供完整的模块功能，包括业务逻辑实现、组件协调和流程编排
5. **访问层次规则**: 所有核心功能必须统一通过模块服务暴露，API层不得直接访问执行组件或状态管理组件

```
core/
  parsing/                 
    parser.ts              # 执行组件
  parsingService.ts        # 模块服务(放在core目录顶层)
  documentService.ts       # 模块服务(放在core目录顶层)
```

### 2.1 模块服务的职责

1. **门面角色规则**: 作为模块的门面(Facade)，提供简化、统一的API，隐藏内部实现复杂性
2. **业务逻辑规则**: 实现业务逻辑，处理数据操作，可以包含复杂的业务规则
3. **组件协调规则**: 协调多个底层组件协同工作，管理组件间交互
4. **业务流程编排规则**: 组织完整的业务流程，实现模块功能
5. **功能聚合规则**: 将相关功能聚合在一起，形成清晰的模块边界
6. **错误处理规则**: 捕获来自执行组件和状态管理组件的异常，转换为统一的错误格式

### 2.2 模块服务实现示例

```typescript
// core/document/documentService.ts
import { Selector } from './selector';
import { validatorFactory } from '../validation/validationFactory';
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

/**
 * 错误处理示例
 */
export function parseDocument(content: string): DPMLDocument {
  try {
    const parser = parserFactory.createParser();
    return parser.parse(content);
  } catch (error) {
    // 统一错误处理
    if (error instanceof DocumentError) {
      throw error; // 已经是模块错误，直接传递
    }
    // 包装为模块错误
    throw new DocumentError(
      `文档解析失败: ${error.message}`,
      { line: 1, column: 1 }
    );
  }
}
```

### 2.3 模块服务与其他组件的关系

1. **与API层关系规则**: API层直接导出模块服务提供的功能，形成一对一映射
2. **与执行组件关系规则**: 直接使用执行组件，负责创建、配置和协调执行组件
3. **与状态管理组件关系规则**: 直接使用状态管理组件，管理其生命周期
4. **与创建组件关系规则**: 使用创建组件创建执行组件和状态管理组件实例
5. **跨模块调用规则**: 
   - 模块服务应置于core目录顶层，而非模块子目录内，以便统一协调各模块功能
   - 模块功能实现组件保留在对应领域子目录中
   - 禁止平行模块目录间的相互引用，模块间协作必须通过顶层模块服务实现

```typescript
// API层 - api/document.ts
export * from '../core/documentService';

// 跨模块调用示例 - core/documentService.ts
import { DPMLDocument } from '../types';
import { processDocument } from './document/documentProcessor';
import { validateDocument } from './validation/validator';

export function processAndValidateDocument(doc: DPMLDocument): DPMLDocument {
  // 处理文档
  const processed = processDocument(doc);
  // 调用其他模块的组件
  return validateDocument(processed);
}
```

## 3. 执行组件设计规则

1. **功能实现规则**: 执行组件负责实现特定功能逻辑
2. **依赖注入规则**: 构造函数应接收所有必要依赖
3. **显式依赖规则**: 优先通过参数传递依赖，避免隐式依赖和全局状态
4. **可测试性规则**: 设计为可独立测试的单元，支持单元测试

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

// core/parsing/parsingService.ts
import { Parser } from './Parser';
import { Validator } from '../validation/validator';
import { DPMLDocument, ParserOptions } from '../../types';

export function parse(content: string, options?: ParserOptions): DPMLDocument {
  const validator = new Validator();
  const parser = new Parser(options || {}, validator);
  return parser.parse(content);
}
```

### 3.1 执行组件与单例模式规则

1. **多实例规则**: 执行组件应设计为多实例模式，不适合使用单例模式
2. **状态隔离规则**: 执行组件通常有内部状态会随着不同操作而变化，需要隔离状态
3. **测试友好规则**: 多实例设计有利于测试，便于模拟不同场景
4. **生命周期规则**: 执行组件应由模块服务控制其生命周期

## 4. 状态管理组件设计规则

1. **定义规则**: 状态管理组件是维护特定模块状态并提供相关功能服务的组件
2. **状态管理规则**: 维护内部状态但不直接暴露，通过受控接口访问
3. **功能提供规则**: 提供特定模块的相关功能方法
4. **可见性规则**: 仅在core目录内可见，不直接对外暴露API，只能通过模块服务间接访问
5. **单例模式规则**: 通常通过创建组件以单例形式使用，确保状态共享和一致性

### 4.1 状态管理组件使用场景

1. **适用场景规则**: 状态管理组件适用于需要集中管理状态的横切关注点，如:
   - 注册表（如TagRegistry）
   - 缓存服务
   - 配置管理
   - 连接池

### 4.2 状态管理组件实现原则

1. **模块组织规则**: 每个状态管理组件专注于一个特定模块
2. **创建组件管理规则**: 通过创建组件模式创建和管理实例
3. **模块服务访问规则**: 通过模块服务访问服务功能
4. **状态封装规则**: 内部状态应适当封装，避免直接暴露

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

// core/registry/tagRegistryFactory.ts - 创建组件实现
let instance: TagRegistry | null = null;

export function getGlobalTagRegistry(): TagRegistry {
  if (!instance) {
    instance = new TagRegistry();
  }
  return instance;
}

// core/registry/registryService.ts
export function registerTag(tagName: string, definition: TagDefinition): void {
  const registry = getGlobalTagRegistry();
  registry.register({ ...definition, name: tagName });
}
```

### 4.3 状态管理组件与不可变原则

1. **状态管理例外规则**: 状态管理组件可以维护可变状态，这是其核心职责之一
2. **接口不可变规则**: 对外提供的方法应遵循不可变原则，通过返回新对象而非修改传入参数
3. **原子性规则**: 状态修改操作应保持原子性，避免部分修改导致的不一致状态
4. **状态隔离规则**: 将可变状态严格封装在内部，不直接暴露给外部修改

```typescript
// 状态管理组件中应用不可变原则的例子
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

## 5. 创建组件设计规则

1. **创建组件职责规则**: 使用创建组件处理对象创建和生命周期管理
2. **一对一规则**: 每个需要实例化管理的组件应有对应的创建组件
3. **命名规则**: 创建组件名以`factory`结尾，如`parserFactory.ts`
4. **适用场景规则**: 适用于执行组件和状态管理组件的实例化，但应用方式有所不同

### 5.1 创建组件职责

1. **创建职责规则**: 负责创建和配置复杂对象
2. **生命周期规则**: 管理对象的生命周期（包括可能的单例模式）
3. **封装规则**: 封装创建逻辑，隐藏实现细节
4. **依赖注入规则**: 注入必要的依赖

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

### 5.2 执行组件与状态管理组件的创建模式区别

1. **执行组件创建规则**: 通常创建新实例，无状态或临时状态，每次创建注入依赖，调用者控制生命周期
2. **状态管理组件创建规则**: 通常管理单例，维护持久状态，初始化时注入依赖，创建组件管理生命周期，提供重置功能

### 5.3 与模块服务的关系

1. **职责分离规则**: 创建组件负责对象创建和生命周期，模块服务负责业务逻辑和功能提供

## 6. 命名约定

1. **模块目录命名规则**: 使用小写名词，如`parsing`、`document`
2. **模块服务命名规则**: 使用小驼峰名词+Service形式，如`documentService.ts`
3. **实现类命名规则**: 使用大写驼峰名词，反映其功能，如`Parser`、`Validator`
4. **函数命名规则**: 使用小驼峰动词+名词形式，如`findNodeById`、`parseDocument`

## 7. 不可变原则

1. **数据不可变规则**: 操作数据时应遵循不可变原则
2. **参数保护规则**: 避免直接修改传入的参数
3. **新对象返回规则**: 返回新的数据结构而非修改原有结构

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

## 8. 文档规范

1. **JSDoc规则**: 所有类和函数应有JSDoc注释
2. **注释内容规则**: 注释应说明功能、参数、返回值和可能的异常
3. **复杂算法规则**: 复杂算法应有详细的实现说明

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