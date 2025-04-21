# API层设计规则

本文档定义了DPML类库API层设计的强制规则。

## 1. 目录与文件组织

1. **API目录规则**: `api/`目录存放所有对外暴露的公共API
2. **扁平结构规则**: **api目录只能有一级文件**，不允许创建子目录
3. **按功能划分规则**: 按业务功能（而非技术组件）划分文件，如`parser.ts`、`document.ts`
4. **统一导出规则**: 使用`index.ts`统一导出所有API，便于用户引用

```
api/
  index.ts        # 统一导出
  parser.ts       # 解析相关功能
  document.ts     # 文档操作功能
  node.ts         # 节点操作功能
  tagRegistry.ts  # 标签注册功能
  ...
```

## 2. 命名约定

1. **文件命名规则**: 文件名使用**小写**，如`parser.ts`、`document.ts`
2. **函数命名规则**: 导出的函数使用**小驼峰命名法**，如`parseFile()`、`findNodeById()`
3. **语义命名规则**: 函数名应体现业务操作，而非技术实现，如用`findNodeById`而非`getNodeFromMap`

## 3. 函数设计原则

1. **纯函数设计规则**: API函数必须遵循纯函数设计，固定输入产生固定输出，无副作用
2. **显式参数传递规则**: 避免依赖隐式上下文或全局状态，通过参数明确传递所有依赖
3. **完整类型签名规则**: 参数类型和返回值类型必须完整定义，便于IDE提示
4. **单一职责规则**: 每个函数只做一件事，避免多职责

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

## 4. API组织方式

1. **按业务域划分规则**: API必须按业务功能域组织，而非技术实现
2. **统一入口规则**: 必须提供统一的导入入口
3. **避免循环依赖规则**: 保持层次结构清晰，避免循环依赖

```typescript
// api/index.ts
export * from './parser';
export * from './document';
export * from './node';

// 使用示例
import { parse, findNodeById, getAttribute } from '@dpml/core';
```

## 5. 错误处理规范

1. **领域错误规则**: 使用显式错误类型，而非通用Error
2. **错误信息规则**: 提供详细的错误信息，包括位置信息
3. **一致处理规则**: 保持一致的错误处理模式

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

## 6. 文档规范

1. **JSDoc规则**: 所有公共API函数必须有完整的JSDoc注释
2. **注释内容规则**: 注释必须包含函数描述、参数说明、返回值说明和示例
3. **边界条件说明规则**: 特殊情况和边界条件必须明确在文档中说明

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

## 7. 渐进式API暴露

1. **分层API设计规则**: 在内部实现多层API，但对外优先暴露简单高层API
2. **渐进暴露规则**: 随着项目发展和需求增加，逐步暴露更多底层API
3. **优先简化规则**: 降低用户初始学习成本，同时保留未来扩展能力

### 7.1 分层API设计

1. **高层API设计规则**: 高层API必须面向常见场景，隐藏复杂性，提供合理默认值
2. **底层API设计规则**: 底层API必须面向高级用例，提供完全控制能力
3. **内部实现规则**: 内部预先实现完整API层次，但对外仅暴露必要部分

```typescript
// core中实现多层API（内部）
// core/document/documentService.ts
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
export { mergeDocuments } from '../core/document/documentService';
// 暂不导出底层API
```

## 8. API委托原则

1. **薄层设计规则**: API层必须是一个薄层，不包含复杂业务逻辑
2. **委托职责规则**: API层主要职责是委托Core层中对应的模块服务功能给外部使用
3. **一对一映射规则**: API层函数通常与模块服务函数是一对一映射关系
4. **避免重复逻辑规则**: 避免在API层重复实现内部已有的业务逻辑
5. **间接访问规则**: API层不得直接访问业务类或内部服务类，必须通过模块服务间接使用其功能

```typescript
// api/parser.ts - 正确示例
export * from '../core/parsing/parsingService';

// api/parser.ts - 错误示例 (直接访问业务类)
import { DPMLDocument } from '../types';
import { Parser } from '../core/parsing/Parser';
import { Validator } from '../core/validation/validator';

export function parse(content: string): DPMLDocument {
  const validator = new Validator();
  const parser = new Parser({ validateOnParse: true }, validator);
  return parser.parse(content);
}
```

### 8.1 状态管理API设计

1. **闭包模式规则**: 对于需要维护状态的API场景，必须使用闭包模式保持API层的薄层特性
2. **状态委托规则**: 状态管理必须委托给模块服务层，API层不得直接管理复杂状态

```typescript
// 正确示例 - 闭包模式管理状态
// api/processor.ts
export function createProcessor(config) {
  // 委托给模块服务层创建和管理内部状态
  const processorState = processorService.initializeProcessor(config);
  
  // 返回API对象，通过闭包捕获状态
  return {
    process: (content) => processorService.processContent(content, processorState),
    validate: (schema) => processorService.validateWithState(schema, processorState),
    dispose: () => processorService.cleanupProcessor(processorState)
  };
}
``` 