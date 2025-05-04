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

## 任务: CLI模块核心实现（集成任务）

**目标(O)**:
- **功能目标**:
  - 基于已搭建的骨架，实现CLI模块的核心功能
  - 实现Command适配器以支持命令解析和执行
  - 实现领域发现和执行机制
  - 通过单元测试验证各组件的功能正确性

- **执行任务**:
  - 实现核心组件:
    - `packages/cli/src/core/cliService.ts` - CLI服务模块完整实现
    - `packages/cli/src/core/adapters/CommanderAdapter.ts` - 基于Commander.js的适配器实现
    - `packages/cli/src/core/discovery/NpxDiscoverer.ts` - NPX领域发现器实现
    - `packages/cli/src/core/execution/ExecutorFactory.ts` - 执行器工厂实现
    - `packages/cli/src/core/execution/NpxExecutor.ts` - NPX执行器实现
  
  - 实现测试用例:
    - `packages/cli/src/__tests__/unit/core/cliService.test.ts`
    - `packages/cli/src/__tests__/unit/core/adapters/CommanderAdapter.test.ts`
    - `packages/cli/src/__tests__/unit/core/discovery/NpxDiscoverer.test.ts` 
    - `packages/cli/src/__tests__/unit/core/execution/ExecutorFactory.test.ts`
    - `packages/cli/src/__tests__/unit/core/execution/NpxExecutor.test.ts`
    - `packages/cli/src/__tests__/fixtures/cli/cliFixtures.ts` - 测试夹具完整实现

- **任务边界**:
  - 本任务不包括契约测试和集成测试的实现
  - 不包括端到端测试的实现
  - 仅实现单元级别的功能和测试
  - 不要求所有集成测试通过，但应通过所有单元测试

**环境(E)**:
- **参考资源**:
  - `packages/cli/docs/CLI-Design.md` - CLI模块设计文档，4.3节包含核心组件设计
  - `packages/cli/docs/CLI-Test-Design.md` - CLI测试设计文档，3.2节包含单元测试设计
  - 任务`cli-01-base.task.md` - 骨架任务的实现结果
  - `packages/cli/src/types/` - 所有接口定义
  
- **上下文信息**:
  - CLI模块已完成骨架搭建，接口已定义
  - 需要实现四个核心组件:
    1. CLI服务 - 协调命令解析和执行
    2. Commander适配器 - 基于Commander.js解析命令
    3. NPX发现器 - 发现可用的领域包
    4. NPX执行器 - 通过NPX执行领域命令
  
- **规范索引**:
  - [核心层规范](../../../../rules/architecture/core-layer.md)
  - [测试用例设计](../../../../rules/architecture/test-case-design.md)
  - [错误处理规范](../../../../rules/develop/error-handling.md)
  - [日志使用规范](../../../../rules/develop/logging-use.md)

- **注意事项**:
  - 使用依赖注入模式使组件可测试
  - 单元测试需要适当模拟依赖
  - 错误处理需要规范，使用统一的DPMLError类
  - 环境变量依赖尽量最小化，方便测试

**实现指导(I)**:
- **关键算法与流程**:
  - CLI执行流程:
    1. 初始化CLI服务和组件
    2. 解析命令行参数
    3. 处理内置命令(--list, --version等)
    4. 对于领域命令，先发现领域
    5. 创建领域执行器
    6. 执行领域命令
    7. 错误处理和输出

- **技术选型**:
  - Commander.js库用于命令行解析
  - read-package-up库用于读取版本信息
  - execa库用于执行NPX命令

- **实现策略**:
  1. 先实现基本服务和执行流程
  2. 再实现命令适配器
  3. 然后实现领域发现器
  4. 最后实现执行器
  5. 每实现一个组件，编写并执行对应单元测试
  6. 实现错误处理机制

- **关键代码示例**:
  
  - cliService实现示例:
  ```typescript
  // 初始化组件并执行命令
  export const cliService = {
    async execute(args: string[]): Promise<void> {
      try {
        const components = await this.initialize();
        await components.commandAdapter.parseAndExecute(args);
      } catch (error) {
        this.handleError(error);
      }
    },
    
    async initialize() {
      const domainDiscoverer = new NpxDiscoverer();
      const executorFactory = new ExecutorFactory();
      const commandAdapter = new CommanderAdapter(domainDiscoverer, executorFactory);
      
      return {
        domainDiscoverer,
        executorFactory,
        commandAdapter
      };
    },
    
    handleError(error: unknown): never {
      // 错误处理逻辑
      // ...
    }
  };
  ```
  
  - CommanderAdapter实现要点:
  ```typescript
  // 设置命令和选项
  private setupCommands(): void {
    this.program
      .name('dpml')
      .description('DPML (Deepractice Prompt Markup Language) Command Line Tool')
      .version(this.getVersion(), '-v, --version', 'Display Version')
      .option('-l, --list', 'List all available DPML domains', () => this.handleListOption());
      
    // 领域命令处理
    this.program
      .arguments('<domain> [args...]')
      .allowUnknownOption()
      .action((domain: string, args: string[]) => {
        this.handleDomainCommand(domain, args);
      });
  }
  ```
  
  - NpxDiscoverer实现要点:
  ```typescript
  // 使用execa检查包版本
  private async getPackageVersion(packageName: string): Promise<string | null> {
    try {
      const { stdout } = await execa('npm', ['view', packageName, 'version'], {
        reject: false
      });
      
      return stdout ? stdout.trim() : null;
    } catch (error) {
      return null;
    }
  }
  ```

- **测试策略**:
  - 使用Vitest作为测试框架
  - 使用VI的模拟功能模拟依赖
  - 测试设计应符合`CLI-Test-Design.md`中3.2节的单元测试设计

- **单元测试实现示例**:
  ```typescript
  // cliService测试示例
  import { describe, test, expect, vi, beforeEach } from 'vitest';
  import { cliService } from '../../../src/core/cliService';
  import { DPMLError } from '../../../src/types/DPMLError';
  import { createCommandArgsFixture } from '../../fixtures/cli/cliFixtures';
  
  // 模拟依赖
  vi.mock('../../../src/core/adapters/CommanderAdapter', () => ({
    CommanderAdapter: vi.fn().mockImplementation(() => ({
      parseAndExecute: vi.fn().mockResolvedValue(undefined),
      getVersion: vi.fn().mockReturnValue('1.0.0')
    }))
  }));
  
  // 其他模拟...
  
  describe('UT-CLISVC', () => {
    const commandArgs = createCommandArgsFixture();
    
    beforeEach(() => {
      vi.clearAllMocks();
    });
  
    test('execute should initialize components and execute command', async () => {
      // 测试实现...
    });
    
    // 其他测试...
  });
  ```

**成功标准(S)**:
- **基础达标**:
  - CLI服务、命令适配器、发现器和执行器的核心功能已实现
  - 单元测试`UT-CLISVC-01`至`UT-CLISVC-NEG-02`通过
  - 单元测试`UT-CMDADP-01`至`UT-CMDADP-NEG-04`通过
  - 单元测试`UT-NPXDISC-01`至`UT-NPXDISC-NEG-03`通过
  - 单元测试`UT-EXECFACT-01`和`UT-EXECFACT-NEG-01`通过
  - 单元测试`UT-NPXEXEC-01`至`UT-NPXEXEC-NEG-02`通过
  - 注意：集成测试和端到端测试可能尚未通过
  
- **预期品质**:
  - 代码按照设计文档中的架构实现
  - 错误处理完整，统一使用DPMLError
  - 关键函数和方法有详细注释
  - 单元测试覆盖率>85%
  - 命令行交互符合CLI规范
  
- **卓越表现**:
  - 单元测试覆盖率>95%
  - 实现了错误码映射表，便于用户理解错误
  - 实现了详细的调试日志输出
  - 提供了自动完成支持的基础 