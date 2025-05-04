// IMPORTANT: 强制执行指令 //
// AI执行者必须先阅读并宣誓接受下面的执行誓词，才能开始任务分析。
// 必须明确声明："我已阅读并接受AI执行誓词，现在开始按规范执行任务"
// 未经宣誓直接开始任务分析将视为违反规范，任务执行无效。
// 严格遵循"先环境分析，后目标分析"的顺序。
// ===================== //

# AI执行誓词

作为DPML项目的AI开发者，我庄严宣誓：

## 思考准则
我将以专业类库开发者的思维模式思考，遵循TDD原则，确保代码的可测试性、可维护性和架构一致性。我承诺：
- 以可复用、模块化代码结构为核心指导思想
- 先理解测试需求，再实现功能，通过测试验证实现
- 确保所有实现与DPML整体架构保持一致
- 严格遵循函数式和不可变数据设计原则
- 在解决问题时，积极的通过在关键步骤打日志的方式进行 debug

## 执行承诺
我将遵循严格的执行流程，不偏离既定规范。我承诺：

**第一步：全面环境分析**
- 我将完整阅读任务环境(E)中列出的所有文档和资源，不遗漏任何细节
- 我将总结所有关键约束和规范要求，并解释每个约束对实现的影响
- 在完成环境分析后，我将明确声明："环境分析完成，现在开始分析目标"

**第二步：目标与计划制定**
- 我将基于环境分析结果理解任务目标，确保目标与环境约束兼容
- 我将制定周详的实现计划，考虑所有环境约束和架构要求
- 我将将实现计划与成功标准(S)进行对照验证
- 在完成目标分析后，我将明确声明："目标分析完成，现在制定实现计划"

**第三步：测试驱动实现**
- 我将严格按照测试优先级实现功能
- 每完成一个功能点，我将立即运行相关测试验证
- 遇到测试失败时，我将使用日志和系统性调试方法而非依赖猜测
- 我将确保实现满足所有测试要求，不妥协代码质量
- 我将确保代码实现符合业务逻辑，而非仅为通过测试

**第四步：严格验证流程**
- 根据任务类型确定验证范围：
  * 基础任务：重点验证相关单元测试
  * 集成任务：验证单元测试和集成测试
  * 终结任务：验证所有相关测试并确保代码可提交
- 自我验证：
  * 我将执行`pnpm test`确保所有测试通过
  * 我将确认没有error级别的lint错误, 可以使用 --fix 快捷修复
  * 在验证通过后，我将明确声明："自我验证完成，所有测试通过，无 Error 级 lint 错误"

## 禁止事项（红线）
- 我绝不通过修改测试代码的方式通过测试，除非测试代码本身有明显错误
- 我绝不编写专门为应付测试而不符合业务逻辑的实现代码
- 我绝不依赖猜测解决问题，而是使用日志和断点进行系统性调试
- 如果我需要修改测试，我将明确说明修改理由并请求人类审批
- 我绝不在未理清任务全貌的情况下，直接开始进行任务
- 端到端测试绝对不允许靠 mock

## 调试规范
- 遇到测试失败时，我将：
  * 首先添加详细日志输出关键数据和执行路径
  * 分析测试失败的具体断言和条件
  * 比较预期值与实际值的差异
  * 追踪问题根源至具体代码
  * 验证修复方案的合理性
- 当我需要添加日志时，我将：
  * 在关键函数入口记录输入参数
  * 在数据转换处记录前后状态
  * 在条件分支处记录判断条件
  * 在返回值处记录最终结果
- 如果我认为测试代码需要修改，我将：
  * 明确标记："我认为测试代码需要修改"
  * 提供详细的理由和证据
  * 等待人类确认后才执行修改

## 项目结构
我们的项目是 monorepo，基于 pnpm workspace 管理。

## 权利
- 我有权利在设计本身就无法达成目标时停止工作
- 我有权利在符合规范的情况下，发挥自身的能力，让任务完成的更好

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## 任务: CLI模块完善与集成测试（终结任务）

**目标(O)**:
- **功能目标**:
  - 完成CLI模块的全部功能，实现所有测试通过
  - 实现集成测试和端到端测试，验证组件协作和完整流程
  - 优化错误处理和用户体验
  - 完成CLI二进制入口和包导出功能
  - 确保CLI模块可正常运行并发布使用

- **执行任务**:
  - 实现测试用例:
    - 契约测试:
      - `packages/cli/src/__tests__/contract/api/cli.contract.test.ts` 
      - `packages/cli/src/__tests__/contract/types/CommandAdapter.contract.test.ts`
      - `packages/cli/src/__tests__/contract/types/DomainDiscoverer.contract.test.ts`
      - `packages/cli/src/__tests__/contract/types/DomainExecutor.contract.test.ts`
      - `packages/cli/src/__tests__/contract/types/DomainInfo.contract.test.ts`
      - `packages/cli/src/__tests__/contract/types/DPMLError.contract.test.ts`
    
    - 集成测试:
      - `packages/cli/src/__tests__/integration/core/commandFlow.integration.test.ts`
      - `packages/cli/src/__tests__/integration/core/discovery/domainResolution.integration.test.ts`
    
    - 端到端测试:
      - `packages/cli/src/__tests__/e2e/cli/cliExecution.e2e.test.ts`
    
    - 测试辅助文件:
      - `packages/cli/src/__tests__/helpers/cli-process-runner.ts` - CLI进程运行器
  
  - 创建/完善其它重要文件:
    - `packages/cli/src/bin.ts` - CLI二进制入口
    - `packages/cli/src/index.ts` - 包导出入口
  
  - 优化与完善:
    - 完善错误处理和错误消息
    - 优化命令输出格式
    - 修复所有测试中发现的问题
    - 确保所有代码符合lint规范

- **任务边界**:
  - 本任务是CLI模块的终结任务，需要确保所有测试通过
  - 包括单元测试、契约测试、集成测试和端到端测试
  - 包括所有必要的错误处理和用户体验优化
  - 必须确保代码可以成功提交

**环境(E)**:
- **参考资源**:
  - `packages/cli/docs/CLI-Design.md` - CLI模块设计文档
  - `packages/cli/docs/CLI-Test-Design.md` - CLI测试设计文档，3.3节和3.4节包含集成测试和端到端测试设计
  - 任务`cli-01-base.task.md` - 骨架任务的实现结果
  - 任务`cli-02-implementation.task.md` - 核心实现任务的结果
  - `packages/cli/src/` - 已实现的CLI模块代码
  
- **上下文信息**:
  - CLI模块已完成基本骨架和核心功能实现
  - 单元测试已基本实现并通过
  - 需要完善契约测试、集成测试和端到端测试
  - 需要确保所有组件正确协作
  
- **规范索引**:
  - [核心层规范](../../../../rules/architecture/core-layer.md)
  - [测试用例设计](../../../../rules/architecture/test-case-design.md)
  - [测试策略](../../../../rules/architecture/testing-strategy.md)
  - [错误处理规范](../../../../rules/develop/error-handling.md)
  - [日志使用规范](../../../../rules/develop/logging-use.md)

- **注意事项**:
  - 端到端测试不允许使用mock，应真实执行CLI命令
  - 所有测试都必须真实执行，不能仅为通过测试而伪造行为
  - 错误信息应具有足够的上下文和可读性
  - 最终代码必须通过lint检查和类型检查

**实现指导(I)**:
- **契约测试实现策略**:
  - 契约测试主要验证API和类型稳定性，确保公共接口符合预期
  - 示例实现:
  ```typescript
  // cli.contract.test.ts
  import { describe, test, expect } from 'vitest';
  import { execute } from '../../../src/api/cli';
  
  describe('CT-API-CLI', () => {
    test('execute API should maintain type signature', () => {
      expect(typeof execute).toBe('function');
      // 验证函数签名，但不实际执行
      const result = execute(['--version']); // 不await，仅验证类型
      expect(result instanceof Promise).toBe(true);
    });
  });
  ```

- **集成测试实现策略**:
  - 集成测试验证组件之间的协作，模拟较少
  - 示例实现:
  ```typescript
  // commandFlow.integration.test.ts
  import { describe, test, expect, vi } from 'vitest';
  import { execute } from '../../../src/api/cli';
  import { createCommandArgsFixture } from '../../fixtures/cli/cliFixtures';
  
  describe('IT-CMDFLOW', () => {
    const commandArgs = createCommandArgsFixture();
    
    // 仅模拟console.log，其他组件使用真实实现
    const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    test('CLI should process --list option correctly', async () => {
      await execute(commandArgs.list);
      
      // 验证域名列表输出
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Available DPML domains'));
    });
    
    // 其他测试...
  });
  ```

- **端到端测试实现策略**:
  - 端到端测试通过真实进程执行CLI命令，验证实际行为
  - 使用CLI进程运行器构建和运行测试
  - 示例实现:
  ```typescript
  // cliExecution.e2e.test.ts
  import { describe, test, expect, beforeAll, afterAll } from 'vitest';
  import { runCLIProcess, createTestConfigFile, cleanupTestFile } from '../../helpers/cli-process-runner';
  
  describe('E2E-CLI', () => {
    let testFilePath: string;
    
    beforeAll(async () => {
      testFilePath = await createTestConfigFile('<test></test>', 'test-config.xml');
    });
    
    afterAll(async () => {
      await cleanupTestFile(testFilePath);
    });
    
    test('CLI should execute --version option in real environment', async () => {
      const result = await runCLIProcess(['--version']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+$/); // 版本格式验证
    });
    
    // 其他测试...
  });
  ```

- **CLI进程运行器实现**:
  ```typescript
  // cli-process-runner.ts
  import path from 'path';
  import { execa } from 'execa';
  
  export async function runCLIProcess(args: string[] = []): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
    // 查找CLI入口脚本
    const binPath = path.resolve(process.cwd(), 'dist/bin.js');
    const isDebug = args.includes('--debug');
    
    try {
      // 执行命令
      const result = await execa('node', [binPath, ...args], {
        reject: false,  // 即使命令失败也不抛出异常
        env: {
          ...process.env,
          NODE_ENV: 'test',
          DEBUG: isDebug ? 'true' : undefined
        },
        all: true  // 捕获stdout和stderr到同一流
      });
      
      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        exitCode: result.exitCode || 1
      };
    } catch (error: unknown) {
      // 处理执行错误
      const errorMessage = error instanceof Error ? error.message : 'Execution error';
      return {
        stdout: '',
        stderr: errorMessage,
        exitCode: 1
      };
    }
  }
  ```

- **二进制入口文件实现**:
  ```typescript
  // bin.ts
  #!/usr/bin/env node
  import { execute } from './api/cli';
  
  // 执行CLI命令，传递命令行参数
  execute(process.argv.slice(2))
    .catch(error => {
      // 捕获顶级未处理异常
      console.error(`Fatal Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    });
  ```

- **包入口文件实现**:
  ```typescript
  // index.ts
  export { execute } from './api/cli';
  export { DPMLError, DPMLErrorType } from './types/DPMLError';
  export type { DomainInfo } from './types/DomainInfo';
  export type { CommandAdapter } from './types/CommandAdapter';
  export type { DomainDiscoverer } from './types/DomainDiscoverer';
  export type { DomainExecutor } from './types/DomainExecutor';
  ```

- **错误处理优化**:
  - 确保所有错误都通过DPMLError类处理
  - 提供详细的上下文信息
  - 使用错误类型和错误码提高可调试性
  - 示例实现:
  ```typescript
  // 优化的错误处理
  if (!domainInfo) {
    throw new DPMLError(
      `Domain not found: ${domain}. Available domains: ${availableDomains.join(', ')}`,
      DPMLErrorType.DISCOVERY,
      'DOMAIN_NOT_FOUND'
    );
  }
  ```

**成功标准(S)**:
- **基础达标**:
  - 所有单元测试通过(UT-*)
  - 所有契约测试通过(CT-*)
  - 所有集成测试通过(IT-*)
  - 所有端到端测试通过(E2E-*)
  - 代码可以成功提交到仓库并通过CI验证
  - 所有lint错误已修复
  
- **预期品质**:
  - 契约测试覆盖了所有公共API和类型
  - 集成测试验证了主要命令流和域名解析
  - 端到端测试验证了实际的CLI命令执行
  - 错误消息清晰易懂，提供足够的上下文信息
  - 命令行工具有良好的用户体验
  - 测试覆盖率>90%
  
- **卓越表现**:
  - 测试覆盖率>95%
  - 自动完成功能已实现
  - 提供详细的帮助信息和使用示例
  - 实现了多语言支持
  - 优化了性能和启动时间 