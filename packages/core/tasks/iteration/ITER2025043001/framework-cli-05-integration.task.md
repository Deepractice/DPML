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
- 我将确保实现满足所有测试要求，不妥协代码质量

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
- 我绝不通过修改测试代码的方式通过测试，除非测试代码本身是错误的
- 我绝不在未理清任务全貌的情况下，直接开始进行任务
- 端到端测试绝对不允许靠 mock

## 项目结构
我们的项目是 monorepo，基于 pnpm workspace 管理。

## 权利
- 我有权利在设计本身就无法达成目标是停止工作
- 我有权利在符合规范的情况下，发挥自身的能力，让任务完成的更好

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## 集成命令处理到领域服务（集成任务）

**目标(O)**:
- 扩展领域服务(DomainService)，支持命令处理和注册
- 集成标准命令和自定义命令功能到领域上下文初始化流程
- 实现命令注册表和收集机制，使框架能够管理所有领域命令

**环境(E)**:
- **代码相关**:
  - `packages/core/src/core/framework/domainService.ts` - 需要扩展的领域服务
  - `packages/core/src/core/framework/types.ts` - 包含DomainContext定义
  - `packages/core/src/core/framework/cli/standardActions.ts` - 标准命令实现
  - `packages/core/src/core/framework/cli/commandAdapter.ts` - 命令适配器
  - `packages/core/tasks/iteration/ITER2025043001/ITER-Design.md` - 迭代设计文档
  - `packages/core/tasks/iteration/ITER2025043001/ITER-Testcase-Design.md` - 测试用例设计
  
- **测试相关**:
  - `packages/core/src/__tests__/unit/core/framework/domainService.test.ts` - 需要扩展的单元测试
  - `packages/core/src/__tests__/integration/framework/domainCommands.integration.test.ts` - 需要创建的集成测试
  - 测试用例ID: UT-DOMSVC-11, UT-DOMSVC-12, UT-DOMSVC-13, IT-DMCMD-01, IT-DMCMD-02

- **实现要点**:
  - 修改领域服务实现:
    ```typescript
    // domainService.ts扩展
    import { DomainConfig } from '../../../types/DomainConfig';
    import { DomainContext } from './types';
    import { adaptDomainActions } from './cli/commandAdapter';
    import standardActions from './cli/standardActions';
    
    // 全局命令注册表
    const commandRegistry: CommandDefinition[] = [];
    
    // 初始化领域上下文时处理命令配置
    export function initializeDomain(config: DomainConfig): DomainContext {
      // 原有逻辑...
      const context: DomainContext = {
        schema: config.schema,
        transformers: config.transformers || [],
        options: config.options || defaultOptions,
        domain: config.domain,
        description: config.description
      };
      
      // 处理命令配置
      if (config.commands) {
        processDomainCommands(config.commands, context);
      }
      
      return context;
    }
    
    // 处理领域命令配置
    export function processDomainCommands(
      commands: DomainConfig['commands'],
      context: DomainContext
    ): void {
      if (!commands) return;
      
      const { domain } = context;
      
      // 处理标准命令
      if (commands.includeStandard) {
        const standardCommandDefinitions = adaptDomainActions(
          standardActions,
          domain,
          context
        );
        registerCommands(standardCommandDefinitions);
      }
      
      // 处理自定义命令
      if (commands.actions && commands.actions.length > 0) {
        const customCommandDefinitions = adaptDomainActions(
          commands.actions,
          domain,
          context
        );
        registerCommands(customCommandDefinitions);
      }
    }
    
    // 注册命令到全局注册表
    export function registerCommands(commands: CommandDefinition[]): void {
      commandRegistry.push(...commands);
    }
    
    // 获取所有注册的命令
    export function getAllRegisteredCommands(): CommandDefinition[] {
      return [...commandRegistry];
    }
    
    // 重置命令注册表（主要用于测试）
    export function resetCommandRegistry(): void {
      commandRegistry.length = 0;
    }
    ```
  
  - 创建集成测试:
    ```typescript
    // domainCommands.integration.test.ts
    import { createDomainDPML } from '../../../../api/framework';
    import { DomainConfig } from '../../../../types/DomainConfig';
    import { resetCommandRegistry, getAllRegisteredCommands } from '../../../../core/framework/domainService';
    
    describe('领域命令集成测试', () => {
      beforeEach(() => {
        // 每个测试前重置命令注册表
        resetCommandRegistry();
      });
      
      test('createDomainDPML应注册领域命令', async () => {
        // 准备测试配置...
        
        // 执行createDomainDPML，验证命令是否正确注册
      });
      
      test('getCommandDefinitions应返回所有注册命令', async () => {
        // 验证命令收集机制...
      });
      
      // 更多测试...
    });
    ```
  
- **注意事项**:
  - 确保命令注册不会导致全局状态污染
  - 提供重置命令注册表的机制，特别是在测试环境
  - 领域服务的扩展不应破坏现有功能
  - 集成测试应验证从配置到命令注册的完整流程

**成功标准(S)**:
- **基础达标**:
  - 扩展领域服务以支持命令处理
  - 实现命令注册和收集机制
  - 通过单元测试：UT-DOMSVC-11, UT-DOMSVC-12, UT-DOMSVC-13
  - 通过集成测试：IT-DMCMD-01, IT-DMCMD-02
  
- **预期品质**:
  - 命令注册机制安全可靠，不会导致命令冲突
  - 集成后的代码保持清晰的职责分离
  - 提供完整的错误处理，特别是对重复命令的处理
  - 所有接口有明确的类型定义和文档
  
- **卓越表现**:
  - 实现命令生命周期管理，支持动态注册和注销
  - 提供命令分组和过滤功能
  - 实现命令间依赖关系管理
  - 添加完整的日志记录，便于调试和跟踪 