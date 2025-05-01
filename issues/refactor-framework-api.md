# 重构Framework API设计 - DomainDPML复合对象

## 问题描述

当前Framework API设计存在以下问题：

1. **关注点混淆**: `createDPMLCLI` 函数直接接收 `CLIOptions` 类型参数，这是底层实现细节泄漏到框架层的表现
2. **API一致性差**: 领域编译器与CLI创建在不同的API中，但它们概念上是紧密关联的
3. **使用复杂**: 用户需要分别调用 `createDomainDPML` 和 `createDPMLCLI` 来获取完整功能
4. **参数重复**: CLI和领域编译器都需要领域信息，导致配置重复
5. **README文档错误**: 当前文档中描述的CLI用法与实际API不匹配

## 改进方案

将 `createDomainDPML` 改为返回一个复合对象，同时包含编译器和CLI功能，**完全移除** `createDPMLCLI` API：

```typescript
/**
 * 领域DPML接口，提供编译和命令行功能
 */
export interface DomainDPML<T> {
  /**
   * 领域编译器实例
   */
  compiler: DomainCompiler<T>;
  
  /**
   * 领域CLI实例
   */
  cli: CLI;
}

/**
 * 创建领域DPML
 * @template T 编译后的领域对象类型
 * @param config 领域配置
 * @returns 领域DPML实例，包含编译器和CLI
 */
export function createDomainDPML<T>(config: DomainConfig): DomainDPML<T> {
  const compiler = createDomainCompiler<T>(config);
  const cli = createInternalCLI(compiler);
  
  return {
    compiler,
    cli
  };
}
```

这种设计使API更加简洁、统一，对用户更加友好。例如，bin.ts 等入口脚本可以这样写：

```typescript
// 之前的写法
import { createDPMLCLI } from '@dpml/core';
const cli = createDPMLCLI();
await cli.execute();

// 新的写法
import { createDomainDPML } from '@dpml/core';
import { defaultConfig } from './config'; // 默认配置

const dpml = createDomainDPML(defaultConfig);
await dpml.cli.execute();
```

## 实现步骤

1. **新增接口定义**:
   - 在 `types/` 目录下定义 `DomainDPML` 接口
   - 为 `DomainDPML` 接口添加契约测试，确保接口设计符合预期

2. **新增契约测试**:
   - 创建 `src/__tests__/contract/types/DomainDPML.contract.test.ts`
   - 验证接口的结构稳定性（必须包含compiler和cli属性）
   - 验证类型约束（compiler属性符合DomainCompiler接口，cli属性符合CLI接口）
   - 验证泛型参数正确传递（T类型参数正确应用于compiler）

3. **更新API实现**:
   - 修改 `createDomainDPML` 返回复合对象
   - 添加内部函数 `createInternalCLI` 从编译器创建CLI
   - 移除 `createDPMLCLI` 函数

4. **更新bin.ts等入口点**:
   - 修改入口脚本，使用新API方式获取CLI

5. **更新测试**:
   - 修改 `framework.test.ts` 中的相关测试
   - 更新 `framework-cli.test.ts` 中的测试用例
   - 更新 `domainCommands.integration.test.ts` 中的测试
   - 调整 `commandIntegration.e2e.test.ts` 中的用例

6. **文档更新**:
   - 更新 README.md，修正CLI相关的章节
   - 更新API文档注释

## 预期优势

1. **API一致性提升**: 框架API围绕领域概念设计，职责更清晰
2. **使用简化**: 用户通过一次API调用获得完整功能
3. **减少冗余**: 避免重复配置领域信息
4. **概念清晰**: CLI不再暴露低级配置细节
5. **文档准确**: API描述与实际行为一致
6. **API数量减少**: 移除冗余API，降低学习成本

## 影响范围

1. **核心API**: `framework.ts` 中的主要函数
2. **入口脚本**: bin.ts 等使用CLI的入口点
3. **测试代码**: 多个测试文件需要更新
4. **文档**: README.md 和API文档
5. **示例代码**: 所有使用CLI的示例代码

## 预计工作量

- 代码修改: 中等 (1-2天)
- 测试更新: 较大 (2-3天)
- 文档更新: 小 (1天)

## 受影响文件

1. `src/api/framework.ts`
2. `src/types/index.ts`
3. `src/core/framework/domainService.ts`
4. `src/bin.ts`
5. `src/__tests__/contract/types/DomainDPML.contract.test.ts` (新建)
6. `src/__tests__/unit/api/framework.test.ts`
7. `src/__tests__/integration/cli/framework-cli.test.ts`
8. `src/__tests__/integration/framework/domainCommands.integration.test.ts`
9. `src/__tests__/e2e/framework/commandIntegration.e2e.test.ts`
10. `README.md`

## 后续考虑

1. 提供多领域CLI聚合方案（如需要）
2. 更新外部文档和示例 