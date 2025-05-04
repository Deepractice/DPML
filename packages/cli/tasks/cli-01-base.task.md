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

## 任务: CLI模块骨架开发（基础任务）

**目标(O)**:
- **功能目标**:
  - 根据CLI设计文档搭建DPML CLI模块的代码骨架
  - 提供DPML命令行界面的统一路由入口
  - 创建完整的TypeScript类型定义和接口

- **执行任务**:
  - 创建文件:
    - `packages/cli/src/api/cli.ts` - API入口，提供execute函数
    - `packages/cli/src/types/CommandAdapter.ts` - 命令适配器接口
    - `packages/cli/src/types/DomainDiscoverer.ts` - 领域发现器接口
    - `packages/cli/src/types/DomainExecutor.ts` - 领域执行器接口
    - `packages/cli/src/types/DomainInfo.ts` - 领域信息类型
    - `packages/cli/src/types/DPMLError.ts` - 错误类型
    - `packages/cli/src/core/cliService.ts` - CLI服务模块
    - `packages/cli/src/core/adapters/CommanderAdapter.ts` - Commander适配器（占位）
    - `packages/cli/src/core/discovery/NpxDiscoverer.ts` - NPX发现器（占位）
    - `packages/cli/src/core/execution/ExecutorFactory.ts` - 执行器工厂（占位）
    - `packages/cli/src/core/execution/NpxExecutor.ts` - NPX执行器（占位）
    - `packages/cli/src/bin.ts` - CLI二进制入口文件
    - `packages/cli/src/index.ts` - 包导出入口
  
  - 创建测试文件骨架:
    - 契约测试:
      - `packages/cli/src/__tests__/contract/api/cli.contract.test.ts` 
      - `packages/cli/src/__tests__/contract/types/CommandAdapter.contract.test.ts`
      - `packages/cli/src/__tests__/contract/types/DomainDiscoverer.contract.test.ts`
      - `packages/cli/src/__tests__/contract/types/DomainExecutor.contract.test.ts`
      - `packages/cli/src/__tests__/contract/types/DomainInfo.contract.test.ts`
      - `packages/cli/src/__tests__/contract/types/DPMLError.contract.test.ts`
    
    - 测试辅助文件:
      - `packages/cli/src/__tests__/fixtures/cli/cliFixtures.ts` - 测试夹具
      - `packages/cli/src/__tests__/helpers/cli-process-runner.ts` - CLI进程运行器

- **任务边界**:
  - 只关注代码骨架与类型定义，不实现具体功能
  - 使用TODO注释占位具体实现
  - 注重类型系统的正确性和完整性
  - 不包括完整的单元测试、集成测试和端到端测试实现


**环境(E)**:
- **参考资源**:
  - `packages/cli/docs/CLI-Design.md` - CLI模块设计文档
  - `packages/cli/docs/CLI-Test-Design.md` - CLI测试设计文档
  - `packages/cli/package.json` - CLI包配置信息
  
- **上下文信息**:
  - CLI模块是DPML的统一命令行入口
  - 采用Chain of Responsibility模式实现领域发现
  - 采用适配器模式抽象命令行解析
  - 采用策略模式封装不同执行方式
  - 采用工厂模式创建执行器
  
- **规范索引**:
  - [架构概览](../../../../rules/architecture/architecture-overview.md)
  - [API层规范](../../../../rules/architecture/api-layer.md)
  - [类型层规范](../../../../rules/architecture/types-layer.md)
  - [核心层规范](../../../../rules/architecture/core-layer.md)
  - [公共接口设计规范](../../../../rules/develop/public-interfaces.md)
  - [编码标准](../../../../rules/develop/coding-standards.md)
  - [测试策略](../../../../rules/architecture/testing-strategy.md)
  - [测试用例设计](../../../../rules/architecture/test-case-design.md)

- **注意事项**:
  - 严格遵循分层架构，各层有明确的责任边界
  - 接口名称不使用'I'前缀，类型名称使用PascalCase
  - 不硬编码实现细节，使用依赖注入提高可测试性
  - 在类型定义中遵循TypeScript最佳实践

**实现指导(I)**:
- **代码组织**:
  - 模块结构应如下组织:
    ```
    packages/cli/
      ├── src/
      │   ├── api/
      │   │   └── cli.ts           # API入口
      │   ├── types/
      │   │   ├── CommandAdapter.ts
      │   │   ├── DomainDiscoverer.ts
      │   │   ├── DomainExecutor.ts
      │   │   ├── DomainInfo.ts
      │   │   └── DPMLError.ts
      │   ├── core/
      │   │   ├── cliService.ts    # 核心服务
      │   │   ├── adapters/
      │   │   │   └── CommanderAdapter.ts
      │   │   ├── discovery/
      │   │   │   └── NpxDiscoverer.ts
      │   │   └── execution/
      │   │       ├── ExecutorFactory.ts
      │   │       └── NpxExecutor.ts
      │   ├── bin.ts              # CLI二进制入口
      │   └── index.ts            # 包导出入口
      └── __tests__/
          ├── contract/           # 契约测试
          ├── unit/               # 单元测试
          ├── integration/        # 集成测试
          ├── e2e/                # 端到端测试
          ├── fixtures/           # 测试夹具
          └── helpers/            # 测试辅助工具
    ```

- **接口设计**:
  - 命令适配器接口:
    ```typescript
    export interface CommandAdapter {
      parseAndExecute(args: string[]): Promise<void>;
      getVersion(): Promise<string>;
    }
    ```
  
  - 领域发现器接口:
    ```typescript
    export interface DomainDiscoverer {
      tryFindDomain(domain: string): Promise<DomainInfo | null>;
      listDomains(): Promise<DomainInfo[]>;
      getName(): string;
    }
    ```
  
  - 领域执行器接口:
    ```typescript
    export interface DomainExecutor {
      getDomainInfo(): DomainInfo;
      execute(args: string[]): Promise<void>;
    }
    ```

  - 领域信息类型:
    ```typescript
    export interface DomainInfo {
      readonly name: string;
      readonly packageName: string;
      readonly source: string;
      readonly version?: string;
    }
    ```

  - 错误类型:
    ```typescript
    export enum DPMLErrorType {
      COMMAND = 'COMMAND',
      DISCOVERY = 'DISCOVERY',
      EXECUTION = 'EXECUTION',
      CONFIG = 'CONFIG',
      UNKNOWN = 'UNKNOWN'
    }

    export class DPMLError extends Error {
      readonly type: DPMLErrorType;
      readonly code: string;
      readonly cause?: Error;
      
      constructor(
        message: string,
        type: DPMLErrorType = DPMLErrorType.UNKNOWN,
        code: string = 'DPML_ERROR',
        cause?: Error
      );
    }
    ```

- **实现策略**:
  1. 首先创建所有类型定义文件
  2. 然后创建API层和核心服务骨架
  3. 创建契约测试骨架
  4. 实现二进制入口文件和模块导出
  5. 使用TODO注释占位具体实现

- **测试夹具设计**:
  ```typescript
  // 示例夹具
  export function createCommandArgsFixture() {
    return {
      list: ['--list'],
      version: ['--version'],
      help: ['--help'],
      domain: ['core', 'validate', 'file.xml'],
      unknownDomain: ['unknown-domain', 'command'],
      invalidArgs: ['--invalid-option']
    };
  }
  ```

**成功标准(S)**:
- **基础达标**:
  - 所有类型定义文件已创建，符合TypeScript规范
  - 包结构符合设计文档要求
  - API层和核心层的基本骨架已搭建
  - 所有必要的文件已使用TODO注释占位
  - 契约测试骨架已创建
  
- **预期品质**:
  - 代码组织清晰，遵循项目目录结构规范
  - 接口设计符合类型层规范
  - 注释完整，说明代码用途
  - 类型定义中没有使用any
  
- **卓越表现**:
  - 所有接口类型都有详细JSDoc注释
  - 类型定义具有完整的只读属性定义
  - 提供额外的类型守卫函数
  - 测试夹具设计完善，便于后续实现测试 