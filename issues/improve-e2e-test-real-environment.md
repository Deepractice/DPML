# 改进端到端测试以反映真实CLI执行环境

## 问题描述

当前的端到端测试过度依赖模拟(mock)对象，未能发现实际CLI运行环境中的集成问题。例如，最近在实际使用`dpml-agent agent chat`命令时发现一个"领域编译器尚未初始化"的错误，但现有的端到端测试未能发现此问题。

错误日志：
```
CLI initialized: agent v1.0.0
Default domain: agent

DPML Agent Chat
加载Agent配置: examples/simple-agent.dpml

错误: 领域编译器尚未初始化
```

## 问题分析

通过审查现有的端到端测试，发现以下问题：

1. **测试使用模拟上下文**：`dpml-cli.e2e.test.ts`使用`createMockActionContext`创建模拟上下文，而不是通过真实CLI初始化路径获取上下文。

2. **直接使用编译器实例**：`dpml-configuration.e2e.test.ts`直接创建和使用编译器实例，完全绕过CLI执行路径。

3. **不测试完整集成流程**：测试没有覆盖从`bin.ts`启动到命令执行的完整流程。

实际的CLI执行路径是：
```
bin.ts -> agentDPML.cli.execute() -> CommandAdapter -> createDomainActionContext -> getCompiler
```

现有测试未能测试这个完整路径，导致无法发现CLI环境中的集成问题。

## 改进目标

1. 添加真实环境下的端到端测试，确保能够发现CLI执行过程中的集成问题。

2. 改进测试方法，尽量减少对模拟对象的依赖，更真实地反映实际系统行为。

3. 确保测试能够捕获诸如"领域编译器尚未初始化"这类集成问题。

## 完成标准

1. 新增的端到端测试应该在存在"领域编译器尚未初始化"问题时失败。

2. 测试应该尽可能使用真实的组件而非模拟对象。

3. 测试应涵盖从CLI初始化到命令执行的完整路径。

4. 提供清晰的文档，说明如何编写有效的端到端测试。

## 工作进展

### 已完成工作

1. **创建了端到端测试框架**：
   - 新建 `real-cli-environment.e2e.test.ts` 测试文件，专门用于测试真实CLI环境
   - 创建 `real-cli-helper.ts` 帮助文件，提供辅助函数以执行CLI命令

2. **实现了两种测试场景**：
   - `agent chat` 命令测试，验证交互式命令的执行
   - `validate` 命令测试，验证非交互式命令的执行

3. **测试逻辑设计**：
   - 测试验证正常执行流程，当发现错误时会失败
   - 使用模拟的 readline 接口处理交互式命令

4. **尝试多种输出捕获方法**：
   - 直接替换 `process.stdout.write` 和 `process.stderr.write`
   - 使用 `vi.spyOn` 监控输出函数

### 遇到的问题

1. **CLI输出捕获困难**：
   - 虽然能看到CLI输出显示在控制台中，但无法在测试中可靠地捕获这些输出
   - 添加了调试日志，发现 spy 函数确实被调用，但 `output` 变量仍为空
   - 可能是因为 Vitest 测试环境、异步操作和 `process.exit` 的组合导致的复杂性

### 后续计划

1. **换用子进程方式运行CLI**：
   - 使用 `child_process.spawn` 或第三方库 `execa` 作为替代方案
   - 将CLI作为独立进程运行，完全隔离环境，更可靠地捕获标准输出和错误输出

2. **修复"领域编译器尚未初始化"问题**：
   - 当前测试已经可以检测到问题的存在（测试失败）
   - 需要深入分析并修复 `createDomainActionContext` 中的初始化逻辑

3. **完善文档**：
   - 完成测试文档，解释如何使用不同方法进行端到端测试
   - 提供最佳实践建议，帮助开发人员避免模拟过度的问题

## 修改后的实现方案

### 1. 使用子进程方式改进测试

```typescript
// 示例：使用 execa 运行 CLI 命令
import { execa } from 'execa';

async function runCLICommand(command: string, args: string[]): Promise<{stdout: string, stderr: string, exitCode: number}> {
  try {
    // 在项目根目录找到CLI入口脚本
    const binPath = path.resolve(process.cwd(), 'packages/agent/dist/bin.js');
    
    // 执行命令
    const result = await execa('node', [binPath, ...command.split(' '), ...args], {
      reject: false  // 即使命令失败也不要抛出异常
    });
    
    return { 
      stdout: result.stdout, 
      stderr: result.stderr, 
      exitCode: result.exitCode 
    };
  } catch (error) {
    // 处理执行错误
    return { 
      stdout: '', 
      stderr: error.message || '执行错误', 
      exitCode: 1 
    };
  }
}

// 测试示例
test('CLI command should execute properly', async () => {
  const { stdout, stderr, exitCode } = await runCLICommand('agent chat', ['config.dpml']);
  
  // 验证输出和退出码
  expect(stderr).not.toContain('领域编译器尚未初始化');
  expect(stdout).toContain('DPML Agent Chat');
  expect(exitCode).toBe(0);
});
```

### 2. 修复"领域编译器尚未初始化"问题

核心问题可能出在 `createDomainActionContext` 函数，需要确保编译器在使用前被正确初始化：

```typescript
function createDomainActionContext(context: DomainContext): DomainActionContext {
  // 检查并确保编译器已初始化
  if (!context.compiler) {
    // 这里应该进行正确的编译器初始化，而不是直接抛出错误
    const compiler = createDomainCompiler(context);
    context.compiler = compiler;
  }

  return {
    getCompiler<T>(): DomainCompiler<T> {
      return context.compiler as DomainCompiler<T>;
    },
    // ... 其他方法
  };
}
```

## 优先级

高 - 此问题影响用户体验，应尽快解决 