# Framework模块集成CLI命令功能测试用例设计（ITER2025043001）

本文档定义了Framework模块集成CLI命令功能的测试用例设计，作为ITER2025043001迭代任务的测试规范。

## 1. 测试范围

本测试计划覆盖Framework模块集成CLI命令功能的以下方面：
- 扩展的DomainConfig接口对命令配置的支持
- 新增的DomainAction接口及其契约稳定性
- 标准命令的定义和执行
- 命令适配器将领域命令转换为CLI命令的功能
- DomainState重命名为DomainContext的兼容性
- 领域命令的注册和收集机制
- 从API调用到CLI命令执行的完整集成流程

## 2. 测试类型与目标

- **契约测试**: 确保API和新增类型定义的稳定性
- **单元测试**: 验证命令适配、标准命令和领域服务的命令处理功能
- **集成测试**: 验证领域命令如何注册和集成到CLI系统
- **端到端测试**: 验证从用户配置到命令执行的完整工作流程

## 3. 测试用例详情

### 3.1 契约测试 (Contract Tests)

#### 文件: `packages/core/src/__tests__/contract/types/DomainConfig.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-DCONF-03 | DomainConfig应支持领域标识符 | 验证领域标识符字段 | 类型检查 | 接口包含domain字段 | 无需模拟 |
| CT-TYPE-DCONF-04 | DomainConfig应支持领域描述 | 验证领域描述字段 | 类型检查 | 接口包含可选description字段 | 无需模拟 |
| CT-TYPE-DCONF-05 | DomainConfig应支持命令配置 | 验证命令配置结构 | 类型检查 | 接口包含commands字段且结构符合预期 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/DomainAction.contract.test.ts` (新文件)

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-DACT-01 | DomainAction接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 接口包含name、description、args、options和executor字段 | 无需模拟 |
| CT-TYPE-DACT-02 | DomainAction.executor应接收DomainContext | 验证执行器函数签名 | 类型检查 | executor函数第一个参数为DomainContext类型 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/api/framework.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-API-FRMW-04 | `getCommandDefinitions` API应维持类型签名 | 验证API契约 | 类型检查 | 函数返回CommandDefinition数组 | 无需模拟 |

### 3.2 单元测试 (Unit Tests)

#### 文件: `packages/core/src/__tests__/unit/core/framework/domainService.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| UT-DOMSVC-09 | initializeDomain应接收domain字段 | 验证domain处理 | 含domain字段的配置 | DomainContext包含相同domain值 | 无需模拟 |
| UT-DOMSVC-10 | initializeDomain应接收description字段 | 验证description处理 | 含description字段的配置 | DomainContext包含相同description值 | 无需模拟 |
| UT-DOMSVC-11 | processDomainCommands应处理标准命令 | 验证标准命令处理 | includeStandard为true的配置 | 标准命令被添加到注册表 | 模拟standardActions |
| UT-DOMSVC-12 | processDomainCommands应处理自定义命令 | 验证自定义命令处理 | 含actions的配置 | 自定义命令被添加到注册表 | 模拟commandAdapter |
| UT-DOMSVC-13 | getAllRegisteredCommands应返回所有命令 | 验证命令获取 | 多个已注册命令 | 返回所有注册的命令 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/unit/core/framework/cli/commandAdapter.test.ts` (新文件)

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| UT-CMDADP-01 | adaptDomainAction应转换基本命令信息 | 验证命令基本信息转换 | DomainAction实例 | 返回包含相同name、description的CommandDefinition | 无需模拟 |
| UT-CMDADP-02 | adaptDomainAction应添加领域前缀 | 验证领域前缀 | DomainAction和domain | 返回name为"{domain}:{action.name}"的CommandDefinition | 无需模拟 |
| UT-CMDADP-03 | adaptDomainAction应转换参数定义 | 验证参数转换 | 含args的DomainAction | 返回包含相同参数定义的CommandDefinition | 无需模拟 |
| UT-CMDADP-04 | adaptDomainAction应转换选项定义 | 验证选项转换 | 含options的DomainAction | 返回包含相同选项定义的CommandDefinition | 无需模拟 |
| UT-CMDADP-05 | adaptDomainAction应注入上下文到执行器 | 验证上下文注入 | DomainAction和DomainContext | 返回的action函数在调用时使用上下文调用executor | 模拟executor函数 |

#### 文件: `packages/core/src/__tests__/unit/core/framework/cli/standardActions.test.ts` (新文件)

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| UT-STDACT-01 | standardActions应定义validate命令 | 验证标准命令定义 | 获取standardActions | 包含name为"validate"的命令 | 无需模拟 |
| UT-STDACT-02 | standardActions应定义parse命令 | 验证标准命令定义 | 获取standardActions | 包含name为"parse"的命令 | 无需模拟 |
| UT-STDACT-03 | standardActions应定义compile命令 | 验证标准命令定义 | 获取standardActions | 包含name为"compile"的命令 | 无需模拟 |
| UT-STDACT-04 | validate命令executor应正确执行验证 | 验证执行逻辑 | 调用validate命令executor | 使用context.schema验证文档 | 模拟fs和parse函数 |
| UT-STDACT-05 | compile命令executor应正确执行编译 | 验证执行逻辑 | 调用compile命令executor | 使用context.compiler编译内容 | 模拟fs和compiler.compile |

### 3.3 集成测试 (Integration Tests)

#### 文件: `packages/core/src/__tests__/integration/framework/domainCommands.integration.test.ts` (新文件)

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| IT-DMCMD-01 | createDomainDPML应注册领域命令 | 验证命令注册流程 | 含commands的配置 | 命令被注册到全局注册表 | 模拟commandAdapter |
| IT-DMCMD-02 | getCommandDefinitions应返回所有注册命令 | 验证命令收集 | 创建多个领域编译器 | 返回所有领域的命令 | 模拟domainService |
| IT-DMCMD-03 | 标准命令应能获取领域上下文 | 验证上下文传递 | 领域编译器 | 标准命令能访问领域上下文 | 部分模拟核心模块 |
| IT-DMCMD-04 | 自定义命令应能获取领域上下文 | 验证上下文传递 | 领域编译器 | 自定义命令能访问领域上下文 | 部分模拟核心模块 |

### 3.4 端到端测试 (End-to-End Tests)

#### 文件: `packages/core/src/__tests__/e2e/framework/commandIntegration.e2e.test.ts` (新文件)

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| E2E-CMDINT-01 | 用户应能在DomainConfig中配置领域命令 | 验证配置 | 含commands的配置 | 领域编译器被创建且命令被注册 | 最小模拟 |
| E2E-CMDINT-02 | 用户应能获取并注册领域命令到CLI | 验证集成流程 | 领域编译器和CLI | CLI能注册并执行领域命令 | 最小模拟 |
| E2E-CMDINT-03 | 标准命令应能正确执行 | 验证标准命令执行 | 调用标准命令 | 命令正确执行并产生预期结果 | 最小模拟 |
| E2E-CMDINT-04 | 自定义领域命令应能正确执行 | 验证自定义命令执行 | 调用自定义命令 | 命令正确执行并产生预期结果 | 最小模拟 |

## 4. 测试夹具设计

为了支持上述测试用例，应创建以下测试夹具：

```typescript
// packages/core/src/__tests__/fixtures/framework/cliFixtures.ts

// 创建基本领域配置夹具（包含CLI命令）
export function createDomainConfigWithCommandsFixture() {
  return {
    domain: 'test-domain',
    description: '测试领域',
    schema: { /* 基本schema */ },
    transformers: [{ /* 基本转换器 */ }],
    commands: {
      includeStandard: true,
      actions: [
        {
          name: 'custom-action',
          description: '自定义命令',
          args: [
            { name: 'input', description: '输入文件', required: true }
          ],
          options: [
            { flags: '--format <type>', description: '输出格式' }
          ],
          executor: async (context, input, options) => {
            // 测试执行器逻辑
            return `Executed with ${input} and ${options.format}`;
          }
        }
      ]
    }
  };
}

// 创建标准命令测试夹具
export function createStandardActionTestFixture() {
  // 提供测试标准命令需要的上下文和参数
  return {
    context: {
      domain: 'test',
      schema: { /* 测试schema */ },
      transformers: [],
      options: {
        strictMode: true,
        errorHandling: 'throw',
        transformOptions: { resultMode: 'merged' },
        custom: {}
      },
      compiler: {
        compile: async (content) => ({ result: 'compiled' }),
        extend: () => {},
        getSchema: () => ({}),
        getTransformers: () => []
      }
    },
    args: {
      file: 'test.dpml',
      options: {
        strict: true,
        output: 'output.json',
        format: 'json'
      }
    },
    fileContent: '<test id="123">Test content</test>'
  };
}

// 创建Command测试夹具
export function createCommandDefinitionFixture() {
  return {
    name: 'test:command',
    description: '测试命令',
    domain: 'test',
    arguments: [
      { name: 'arg1', description: '参数1', required: true }
    ],
    options: [
      { flags: '-o, --option <value>', description: '选项' }
    ],
    action: async (...args) => {
      // 测试命令动作
    }
  };
}

// 创建DomainAction测试夹具
export function createDomainActionFixture() {
  return {
    name: 'test-action',
    description: '测试动作',
    args: [
      { name: 'arg1', description: '参数1', required: true }
    ],
    options: [
      { flags: '-o, --option <value>', description: '选项' }
    ],
    executor: async (context, arg1, options) => {
      // 测试执行器
      return `Executed with ${arg1}`;
    }
  };
}
```

## 5. DomainState重命名兼容性测试

为确保DomainState重命名为DomainContext的兼容性，需要验证所有使用DomainState的地方：

1. **文件识别测试**:
   - 扫描项目中所有引用DomainState的文件
   - 确保所有引用已更新为DomainContext

2. **API兼容性测试**:
   - 验证所有使用DomainState类型的函数签名更新后的行为一致性
   - 验证现有测试在更改后仍能通过

3. **测试用例更新验证**:
   - 确保所有测试用例中DomainState类型的模拟对象已更新
   - 验证测试覆盖率保持同级别或提高

## 6. 测试注意事项

1. **测试隔离**：
   - 确保命令注册测试不影响全局状态
   - 在每个测试前重置全局命令注册表

2. **命令转换验证**：
   - 验证生成的CLI命令与领域命令的映射关系
   - 确保命令执行时能正确访问领域上下文

3. **处理临时文件**：
   - 标准命令测试可能需要处理文件I/O
   - 使用临时文件夹和清理机制

## 7. 测试覆盖率目标

- **类型契约测试**: 覆盖所有新增类型和API，确保接口稳定性
- **单元测试**: 覆盖DomainContext、命令适配器和标准命令的核心逻辑，目标行覆盖率90%+
- **集成测试**: 覆盖命令注册和执行的主要流程，目标行覆盖率80%+
- **端到端测试**: 覆盖从配置到执行的关键用户场景

## 8. 总结

本测试计划提供了Framework模块集成CLI命令功能的全面测试策略，包括契约测试、单元测试、集成测试和端到端测试。测试用例设计覆盖了领域命令配置、标准命令实现、命令适配转换和命令执行等核心功能。

测试夹具的设计提供了测试所需的各种对象和数据结构，确保测试的一致性和可重复性。特别关注了DomainState重命名为DomainContext的兼容性，确保现有功能不受影响。

通过执行这些测试用例，我们可以确保Framework模块能够正确地与CLI系统集成，提供一致、稳定的命令行体验。 