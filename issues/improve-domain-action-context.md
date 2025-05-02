# 优化CLI命令Action函数参数设计

## 问题描述

当前DPML CLI框架中的DomainAction接口设计存在以下问题：

1. **接口不一致性**：`action`函数接收`DomainContext`作为第一个参数，但`DomainContext`接口只有可选的`compiler?`属性，没有`getCompiler()`方法。

2. **内部实现细节泄露**：`DomainContext`包含了许多内部实现细节（如`schema`、`transformers`、`options`等），但大多数命令只需要使用编译器功能。

3. **类型安全性不足**：当命令尝试使用不存在的方法（如`context.getCompiler()`）时，在编译阶段无法检测到错误，只能在运行时才会暴露问题。

4. **紧耦合**：命令处理函数与Framework内部结构紧密耦合，难以独立测试和重用。

## 改进方案

创建专用的`DomainActionContext`接口，专门为命令执行提供所需的功能，同时隔离内部实现细节：

```typescript
/**
 * 领域命令执行上下文接口
 * 专为命令执行设计的上下文环境
 */
export interface DomainActionContext {
  /**
   * 获取领域编译器
   * @returns 领域编译器实例
   */
  getCompiler<T = unknown>(): DomainCompiler<T>;
  
  /**
   * 获取领域标识符
   * @returns 领域标识符
   */
  getDomain(): string;
  
  /**
   * 获取领域描述
   * @returns 领域描述
   */
  getDescription(): string;
  
  /**
   * 获取编译选项
   * @returns 编译选项
   */
  getOptions(): Required<CompileOptions>;
  
  // 未来可以在此灵活添加命令需要的能力
}
```

相应地，更新 DomainAction 接口：

```typescript
/**
 * 领域命令接口
 */
export interface DomainAction {
  // ... 其他属性不变 ...

  /**
   * 命令执行函数
   * 第一个参数为领域命令上下文，后续参数为命令参数
   * @param actionContext 领域命令上下文
   * @param args 命令参数
   */
  action: (actionContext: DomainActionContext, ...args: any[]) => Promise<void> | void;
}
```

这个改进将带来以下好处：

1. **接口分离**：将"内部实现上下文"与"命令执行上下文"清晰分离
2. **封装内部实现**：不直接暴露内部属性，只提供必要的访问方法
3. **类型安全**：提供类型安全的方法，编译期即可发现错误
4. **灵活扩展**：可以根据需要灵活添加命令特有的能力
5. **可测试性**：便于编写测试时模拟依赖
6. **向后兼容**：允许在不破坏原有架构的情况下实现新接口

## 实现步骤

1. **新增接口定义**：
   - 在 `types` 目录下创建 `DomainActionContext.ts`
   - 定义 `DomainActionContext` 接口
   - 更新 `DomainAction.ts` 使用新接口

2. **实现适配器**：
   - 在 `framework/cli` 目录下扩展 `commandAdapter.ts`
   - 添加从 `DomainContext` 创建 `DomainActionContext` 的适配器函数
   - 在命令执行前转换上下文对象

3. **调整命令处理流程**：
   - 修改 `domainService.ts` 中的命令处理逻辑
   - 确保正确创建和传递 `DomainActionContext`

4. **更新测试**：
   - 添加 `DomainActionContext` 的契约测试
   - 更新 `DomainAction` 的契约测试
   - 更新相关单元测试和集成测试
   - 调整测试夹具

5. **文档更新**：
   - 更新API文档
   - 更新示例代码
   - 添加迁移指南

## 代码修改示例

### DomainActionContext 接口定义

```typescript
// types/DomainActionContext.ts
/**
 * 领域命令执行上下文接口
 * 专为命令执行设计的上下文环境
 */
export interface DomainActionContext {
  /**
   * 获取领域编译器
   * @returns 领域编译器实例
   */
  getCompiler<T = unknown>(): DomainCompiler<T>;
  
  /**
   * 获取领域标识符
   * @returns 领域标识符
   */
  getDomain(): string;
  
  /**
   * 获取领域描述
   * @returns 领域描述
   */
  getDescription(): string;
  
  /**
   * 获取编译选项
   * @returns 编译选项
   */
  getOptions(): Required<CompileOptions>;
}

// 导入相关类型
import type { DomainCompiler } from './DomainCompiler';
import type { CompileOptions } from './CompileOptions';
```

### 适配器实现

```typescript
// core/framework/cli/commandAdapter.ts
/**
 * 创建领域命令上下文
 * 将内部DomainContext转换为命令专用的DomainActionContext
 * @param context 内部领域上下文
 * @returns 领域命令上下文
 */
function createDomainActionContext(context: DomainContext): DomainActionContext {
  return {
    getCompiler<T>(): DomainCompiler<T> {
      if (!context.compiler) {
        throw new Error('领域编译器尚未初始化');
      }
      return context.compiler as DomainCompiler<T>;
    },
    
    getDomain(): string {
      return context.domain;
    },
    
    getDescription(): string {
      return context.description || '';
    },
    
    getOptions(): Required<CompileOptions> {
      return context.options;
    }
  };
}

/**
 * 将领域命令转换为CLI命令定义
 * @param action 领域命令
 * @param domain 领域标识符
 * @param context 领域上下文
 * @returns CLI命令定义
 */
export function adaptDomainAction(
  action: DomainAction,
  domain: string,
  context: DomainContext
): CommandDefinition {
  // 创建命令上下文
  const actionContext = createDomainActionContext(context);
  
  return {
    name: `${domain}:${action.name}`,
    description: action.description,
    arguments: action.args,
    options: action.options,
    action: async (...args) => {
      // 执行器调用时注入命令上下文
      return action.action(actionContext, ...args);
    },
    category: domain
  };
}
```

### 命令使用示例

```typescript
// 使用新接口的命令示例
const validateCommand: DomainAction = {
  name: 'validate',
  description: '验证DPML文档是否符合领域规范',
  args: [
    { name: 'file', description: 'DPML文件路径', required: true }
  ],
  options: [
    { flags: '--strict', description: '启用严格验证模式' }
  ],
  action: async (actionContext, file, options) => {
    try {
      // 获取编译器
      const compiler = actionContext.getCompiler();
      
      // 获取领域选项
      const domainOptions = actionContext.getOptions();
      
      // 获取文件内容
      const content = await readFile(file, 'utf-8');
      
      // 使用编译器功能
      const schema = compiler.getSchema();
      // ... 继续处理 ...
    } catch (error) {
      console.error('执行失败:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
}
```

## 受影响的文件

1. **新文件**:
   - `src/types/DomainActionContext.ts`

2. **修改文件**:
   - `src/types/DomainAction.ts`
   - `src/core/framework/cli/commandAdapter.ts`
   - `src/core/framework/cli/standardActions.ts`

3. **测试文件**:
   - `src/__tests__/contract/types/DomainAction.contract.test.ts`
   - `src/__tests__/contract/types/DomainActionContext.contract.test.ts` (新增)
   - `src/__tests__/unit/core/framework/cli/commandAdapter.test.ts`
   - `src/__tests__/e2e/framework/commandIntegration.e2e.test.ts`
   - `src/__tests__/fixtures/framework/cliFixtures.ts`

4. **文档**:
   - 所有使用 DomainAction 的示例代码和文档

## 兼容性影响

这是一个破坏性变更，将影响所有自定义命令的实现。但考虑到：

1. 框架尚处于早期开发阶段
2. 当前已出现实际问题（如`context.getCompiler()`不存在）
3. 改变将使API更加一致和安全
4. 迁移路径明确且直观

我们认为现在是实施这一改进的最佳时机，在大规模采用前解决这一设计问题。

## 预计工作量

- 接口设计和实现: 小 (0.5天)
- 适配器和核心逻辑修改: 中等 (1天)
- 测试更新: 中等 (1天)
- 文档更新: 小 (0.5天)

## 总结

通过创建专用的`DomainActionContext`接口，我们可以显著提高框架的类型安全性、降低耦合度，为命令提供稳定且专用的API，同时为未来的扩展留出充分空间。这一改进虽然是破坏性的，但将使API更加一致、直观，避免当前已经出现的误用问题，提升整体开发体验。 