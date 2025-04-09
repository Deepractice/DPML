# DPML API 一致性问题清单

本文档整理了在 `@dpml/core` 包中发现的 API 一致性问题，需要由开发人员逐一修复。
修复过程中需要保持设计的一致性，避免破坏现有功能。

## 1. TagDefinition 接口不一致问题

### 1.1 问题描述

`TagDefinition` 接口在不同地方使用方式不一致：

- **core 包定义**：在 `packages/core/src/parser/tag-definition.ts` 中定义的接口使用**数组**形式：
  ```typescript
  export interface TagDefinition {
    attributes?: string[];
    requiredAttributes?: string[];
    allowedChildren?: string[];
    selfClosing?: boolean;
    validate?: (element: any, context: any) => ValidationResult;
  }
  ```

- **prompt 包使用**：在 `packages/prompt/src/tags/core.ts` 中使用了**对象**形式：
  ```typescript
  export const promptTagDefinition: TagDefinition = {
    name: 'prompt',
    attributes: {
      id: {
        type: 'string',
        required: false
      },
      // ...其他属性
    },
    // ...
  }
  ```

- **README 示例**：README 中的示例与核心定义一致，使用数组形式：
  ```typescript
  const promptTagDef: TagDefinition = {
    attributes: ['id', 'version', 'extends'],
    requiredAttributes: ['id'],
    allowedChildren: ['role', 'context', 'thinking', 'executing'],
    // ...
  };
  ```

### 1.2 修复任务

- [ ] **任务 1-1**：确定 TagDefinition 接口的标准形式（数组或对象结构）
- [ ] **任务 1-2**：更新 `packages/core/src/parser/tag-definition.ts` 中的接口定义
- [ ] **任务 1-3**：确保 `packages/prompt/src/tags/core.ts` 中的用法与接口定义一致
- [ ] **任务 1-4**：更新 README 示例确保与实际接口一致
- [ ] **任务 1-5**：添加接口迁移指南（如果决定更改接口）

## 2. ValidationError 重复定义问题

### 2.1 问题描述

`ValidationError` 在多个地方有不同的定义：

- **接口定义 1**：在 `packages/core/src/parser/tag-definition.ts` 中定义为接口：
  ```typescript
  export interface ValidationError {
    code: string;
    message: string;
    position?: any;
  }
  ```

- **接口定义 2**：在 `packages/core/src/parser/interfaces.ts` 中也定义为接口：
  ```typescript
  export interface ValidationError {
    code: string;
    message: string;
    position?: any;
  }
  ```

- **类定义**：在 `packages/core/src/errors/types.ts` 中定义为类：
  ```typescript
  export class ValidationError extends DPMLError {
    constructor(options: ValidationErrorOptions) {
      super(options);
    }
  }
  ```

- **名称冲突**：在某些地方需要使用别名导入：
  ```typescript
  import { ValidationError as ParserValidationError } from '@core/parser/tag-definition';
  ```

### 2.2 修复任务

- [ ] **任务 2-1**：统一 ValidationError 的定义，确定使用接口还是类
- [ ] **任务 2-2**：移除重复的接口定义，保留一个标准定义
- [ ] **任务 2-3**：如果保留类实现，确保接口与类实现兼容
- [ ] **任务 2-4**：更新所有导入，移除别名导入需求
- [ ] **任务 2-5**：更新文档和示例以反映标准定义

## 3. API 一致性测试不足

### 3.1 问题描述

现有测试不足以检测 API 不一致性问题：

- 单元测试仅测试了各自的功能，没有测试跨模块的 API 一致性
- 没有针对 README 示例的正确性测试
- 缺少集成测试验证 @dpml/core 与 @dpml/prompt 之间的接口兼容性

### 3.2 修复任务

- [ ] **任务 3-1**：添加跨模块 API 一致性测试
- [ ] **任务 3-2**：为 README 中的示例添加测试用例
- [ ] **任务 3-3**：添加 @dpml/core 与 @dpml/prompt 之间的集成测试
- [ ] **任务 3-4**：实现 API 契约测试确保不破坏公共接口

## 4. 设计与实现分离问题

### 4.1 问题描述

- 核心 API 设计与实际实现不一致
- 文档中的 API 描述与实际代码不匹配
- 缺少类型检查以确保实现符合设计规范

### 4.2 修复任务

- [ ] **任务 4-1**：审查所有公共 API 确保设计与实现一致
- [ ] **任务 4-2**：更新文档以反映实际 API 实现
- [ ] **任务 4-3**：添加类型检查以防止实现偏离设计
- [ ] **任务 4-4**：实现 API 变更流程，确保文档与代码同步更新

## 5. 优先级和执行策略

鉴于不一致问题可能影响现有代码，建议按以下优先级执行修复：

1. **调查阶段**：
   - 确定标准接口定义（任务 1-1 和 2-1）
   - 评估更改影响范围

2. **修复阶段**：
   - 从核心定义开始修复（任务 1-2、1-3 和 2-2）
   - 确保不破坏现有功能
   - 更新文档和示例（任务 1-4 和 2-4）

3. **测试增强阶段**：
   - 实现一致性测试（任务 3-1、3-2、3-3）
   - 确保 API 在所有使用场景下一致

4. **预防措施**：
   - 实施 API 变更流程（任务 4-4）
   - 添加类型检查和契约测试（任务 3-4 和 4-3）

## 注意事项

1. 修复过程中应保持与现有设计的兼容性
2. 所有更改都需要包含相应的测试
3. 文档需要与代码同步更新
4. 考虑添加临时的类型兼容层以支持平滑过渡 