# DPML Agent端到端测试指南

## 概述

端到端(E2E)测试是确保DPML Agent在真实环境中正常工作的关键手段。本文档提供了编写、运行和维护有效端到端测试的指南和最佳实践。

## 测试目标

端到端测试的主要目标：

1. **验证完整执行流程**：测试从CLI入口到命令执行的完整路径
2. **检测集成问题**：发现仅在真实环境中出现的集成问题
3. **确保用户体验**：验证用户在实际环境中使用时的体验
4. **减少对模拟的依赖**：使用真实组件而非过度依赖模拟对象

## 测试类型

DPML Agent端到端测试主要分为两类：

### 1. 非交互式命令测试

适用于单次执行的命令，如`validate`、`version`等。通过`runCLICommand`函数执行命令并检查结果。

```typescript
import { runCLICommand } from '../../helpers/cli-process-runner';

test('validate命令应正确验证DPML文件', async () => {
  const { stdout, stderr, exitCode } = await runCLICommand('validate', ['config.dpml']);
  
  // 验证结果
  expect(stderr).not.toContain('错误信息');
  expect(exitCode).toBe(0);
});
```

### 2. 交互式命令测试

适用于需要用户输入的命令，如`agent chat`。使用`InteractiveCLISession`类管理子进程并处理输入输出。

```typescript
import { InteractiveCLISession } from '../../helpers/interactive-cli-runner';

test('交互式命令测试', async () => {
  const session = new InteractiveCLISession('agent chat', ['config.dpml']);
  
  // 发送输入
  await session.sendInput('hello');
  
  // 等待输出
  const found = await session.waitForOutput('expected text');
  expect(found).toBe(true);
  
  // 清理资源
  await session.terminate();
});
```

## 测试环境准备

### 1. 测试数据准备

为测试创建符合DPML规范的配置文件，使用环境变量引用：

```typescript
const agentConfig = `<?xml version="1.0" encoding="UTF-8"?>
<agent>
  <llm 
    api-type="@agentenv:API_TYPE" 
    api-url="@agentenv:API_URL" 
    api-key="@agentenv:API_KEY" 
    model="@agentenv:MODEL">
  </llm>
  
  <prompt>
    你是一个专业的助手，请帮助用户解决问题。
  </prompt>
</agent>`;

// 创建临时文件
const configPath = await createTestConfigFile(agentConfig, 'test-agent.dpml');
```

### 2. 环境变量管理

测试中应使用`@agentenv:`前缀引用环境变量，并提供这些环境变量：

```typescript
// 在测试前设置环境变量
beforeEach(() => {
  process.env.API_TYPE = 'test-api-type';
  process.env.API_URL = 'https://test-api-url.example.com';
  process.env.API_KEY = 'test-api-key-for-e2e-tests';
  process.env.MODEL = 'test-model';
});

// 在测试后恢复环境变量
afterAll(() => {
  process.env = originalEnv;
});

// 在命令行中使用--env传递环境变量
await runCLICommand('agent chat', [
  configPath,
  '--env', 'API_TYPE=test-api-type',
  '--env', 'API_URL=https://test-api-url.example.com',
  '--env', 'API_KEY=test-api-key-for-e2e-tests',
  '--env', 'MODEL=test-model'
]);
```

## 测试实施策略

### 编写有效的断言

1. **关注关键输出**，而非完整输出匹配
   ```typescript
   // 好的做法：检查是否不包含错误信息
   expect(stderr).not.toContain('错误');
   
   // 避免：完全匹配输出文本
   expect(stdout).toBe('Expected exact output');
   ```

2. **验证退出码**表示命令成功或失败
   ```typescript
   // 成功命令
   expect(exitCode).toBe(0);
   
   // 失败命令
   expect(exitCode).not.toBe(0);
   ```

3. **检查关键错误消息**是否出现
   ```typescript
   // 验证未初始化错误不存在
   expect(stderr).not.toContain('领域编译器尚未初始化');
   ```

### 避免测试不稳定性

1. **资源清理**：确保测试创建的临时文件被清理
   ```typescript
   afterAll(async () => {
     await cleanupTestFile(tempFilePath);
   });
   ```

2. **超时处理**：为长时间运行的命令设置适当的超时时间
   ```typescript
   await session.waitForOutput('expected text', 10000); // 10秒超时
   ```

3. **进程终止**：交互式测试后确保进程被正确终止
   ```typescript
   afterEach(async () => {
     if (cliSession) {
       await cliSession.terminate();
     }
   });
   ```

### 使用通用配置

为避免对特定API服务的依赖，测试应使用通用配置：

1. **使用环境变量引用**而非硬编码值
   ```xml
   <llm 
     api-type="@agentenv:API_TYPE" 
     api-url="@agentenv:API_URL" 
     api-key="@agentenv:API_KEY" 
     model="@agentenv:MODEL">
   </llm>
   ```

2. **在测试中提供通用值**，不指定特定的API服务
   ```typescript
   process.env.API_TYPE = 'test-api-type';
   process.env.API_URL = 'https://test-api-url.example.com';
   ```

3. **使用命令行参数传递环境变量**
   ```typescript
   '--env', 'API_TYPE=test-api-type',
   '--env', 'API_URL=https://test-api-url.example.com'
   ```

### 编写能发现集成问题的测试

为确保测试能够发现"领域编译器尚未初始化"等集成问题，应当遵循以下原则：

1. **确保错误捕获**：增强CLI执行工具，确保能捕获所有错误输出
   ```typescript
   // 捕获所有输出流
   const result = await execa('node', [binPath, ...args], {
     all: true, // 捕获stdout和stderr到同一个流
     reject: false
   });
   
   // 检查combined output是否包含关键错误信息
   if (result.all && result.all.includes('领域编译器尚未初始化')) {
     // 确保这个错误在stderr中可见
     enhancedStderr += '\n' + result.all;
   }
   ```

2. **明确验证关键错误不存在**：使用断言验证重要错误信息不存在
   ```typescript
   // 这个断言在错误存在时会失败，达到了测试目的
   expect(stderr).not.toContain('领域编译器尚未初始化');
   ```

3. **添加专门的错误验证测试**：创建测试确认错误能被正确捕获
   ```typescript
   test('检查并验证是否能正确捕获领域编译器错误', async () => {
     const { stderr } = await runCLICommand('agent chat', [config, '--debug']);
     
     // 输出调试信息，帮助排查是否正确捕获了错误
     console.log('DEBUG - stderr output:', stderr);
     
     // 如果存在问题，直接失败
     if (stderr.includes('领域编译器尚未初始化')) {
       throw new Error('存在已知问题："领域编译器尚未初始化"错误');
     }
   });
   ```

4. **使用DEBUG模式**：添加debug选项帮助诊断问题
   ```typescript
   // 启用调试输出
   const isDebug = args.includes('--debug');
   
   if (isDebug) {
     console.log('[DEBUG] 命令执行结果:', result);
   }
   ```

5. **注释测试预期**：在测试中明确说明预期行为
   ```typescript
   // 明确检查"领域编译器尚未初始化"错误
   // 注意：当问题修复前，这个测试会失败
   expect(stderr).not.toContain('领域编译器尚未初始化');
   ```

## 最佳实践

1. **使用子进程执行CLI命令**，而非直接调用函数，更接近真实用户体验

2. **使用临时文件**进行测试，避免污染工作目录

3. **避免硬编码依赖**测试环境的特定API服务或输出信息

4. **关注错误检测**，确保测试能发现常见问题

5. **合理使用异步/等待**，处理CLI命令的异步特性

6. **分离测试关注点**，每个测试专注于验证一个方面

7. **备份并恢复环境变量**，确保测试之间不互相影响

8. **编写预期失败的测试**，确保测试能发现实际存在的问题

9. **增强错误捕获机制**，确保能捕获到所有相关错误信息

## 常见测试场景

1. **验证环境变量替换是否正常工作**
   ```typescript
   test('环境变量替换', async () => {
     // 创建使用环境变量引用的配置文件
     const config = await createTestConfigFile(
       '<agent><llm api-key="@agentenv:TEST_KEY"></llm></agent>',
       'env-test.dpml'
     );
     
     // 运行验证命令，提供环境变量
     const { stderr } = await runCLICommand('validate', [
       config, '--env', 'TEST_KEY=test-value'
     ]);
     
     // 确保没有环境变量未定义错误
     expect(stderr).not.toContain('环境变量');
     expect(stderr).not.toContain('未定义');
   });
   ```

2. **验证编译器初始化**
   ```typescript
   test('编译器初始化', async () => {
     const { stderr } = await runCLICommand('agent chat', ['config.dpml']);
     
     // 这个断言在当前存在bug的情况下会失败
     // 当bug修复后，测试会通过
     expect(stderr).not.toContain('领域编译器尚未初始化');
   });
   ```

3. **验证错误处理**是否正确
   ```typescript
   test('错误处理', async () => {
     const { stderr, exitCode } = await runCLICommand('validate', ['invalid.xml']);
     expect(exitCode).not.toBe(0);
     expect(stderr).toContain('错误');
   });
   ```

4. **验证交互式会话**是否正常工作
   ```typescript
   test('交互式会话', async () => {
     const session = new InteractiveCLISession('agent chat', [
       'config.dpml',
       '--env', 'API_KEY=test-key'
     ]);
     await session.sendInput('hello');
     expect(session.getErrorOutput()).not.toContain('错误');
     await session.terminate();
   });
   ```

## 编写实用的辅助函数

在`helpers`目录中提供实用的测试辅助函数，简化测试代码：

```typescript
// 运行命令并捕获输出
export async function runCLICommand(command: string, args: string[] = []): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}>;

// 创建测试配置文件
export async function createTestConfigFile(content: string, fileName: string): Promise<string>;

// 清理测试文件
export async function cleanupTestFile(filePath: string): Promise<void>;
```

## 结论

有效的端到端测试能发现模拟或单元测试无法发现的问题，对确保DPML Agent在真实环境中的稳定性至关重要。特别是，测试应该能够发现"领域编译器尚未初始化"等集成问题，而不是通过放宽断言或忽略错误让测试通过。

只有当测试能在问题存在时失败，在问题修复后通过，才能真正达到提高代码质量的目的。遵循本指南中的最佳实践，特别是关于错误捕获和验证的建议，能够编写出既健壮又有效的端到端测试。 