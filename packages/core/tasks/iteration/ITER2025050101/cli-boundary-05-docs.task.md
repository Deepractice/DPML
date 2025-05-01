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

## 更新CLI模块设计文档

**目标(O)**:
- **功能目标**:
  - 更新CLI设计文档，明确CLI模块的职责边界
  - 添加错误处理章节，说明CLI模块处理错误的方式
  - 强调CLI模块完全封装底层库的设计原则
  - 明确bin.ts脚本的正确使用方式

- **执行任务**:
  - 修改文件:
    - `packages/core/docs/product/CLI-Design.md` - 更新CLI设计文档
  - 实现功能:
    - 添加"错误处理"专门章节
    - 更新模块职责说明
    - 增加bin.ts的正确使用示例
    - 确保文档与最新实现保持一致

- **任务边界**:
  - 仅修改CLI-Design.md文档
  - 不修改其他文档或代码文件
  - 确保文档内容与代码实现一致

**环境(E)**:
- **参考资源**:
  - `packages/core/docs/product/CLI-Design.md` - 当前CLI设计文档
  - `packages/core/src/core/cli/CLIAdapter.ts` - CLIAdapter实现
  - `packages/core/src/core/cli/cliService.ts` - cliService实现
  - `packages/core/src/bin.ts` - 入口脚本实现
  - `packages/core/tasks/iteration/ITER2025050101/ITER-Design.md` - 迁移方案设计
  - `packages/core/docs/examples/cli-usage-example.md` - CLI使用示例

- **上下文信息**:
  - 前三个任务已经分别修改了CLIAdapter.parse、cliService.createCLI和bin.ts
  - 当前文档可能不包含或不强调错误处理相关内容
  - 需要确保文档准确反映最新的代码实现和架构设计

- **规范索引**:
  - `rules/architecture/api-layer.md` - API层设计规则
  - `rules/architecture/core-layer.md` - Core层设计规则
  - `packages/core/docs/develop/CLI-Develop-Design.md` - CLI开发设计文档

- **注意事项**:
  - 确保文档与实现保持一致
  - 使用清晰的语言描述错误处理流程
  - 提供具体的代码示例说明错误处理方式
  - 保持文档的整体结构和风格

**实现指导(I)**:
- **添加错误处理章节**:
  ```markdown
  ## 错误处理

  CLI模块采用分层错误处理策略，确保底层库的实现细节不会暴露给调用者：

  ### 1. 适配器层错误处理

  CLIAdapter.parse方法内部处理Commander.js特有的错误：

  ```typescript
  public async parse(argv?: string[]): Promise<void> {
    try {
      await this.program.parseAsync(argv || process.argv);
    } catch (err) {
      // 处理Commander.js特有错误
      if (err && typeof err === 'object' && 'code' in err) {
        if (err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
          // 这些不是真正的错误，所以直接返回
          return;
        }
      }
      
      // 在测试环境中特殊处理
      if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
        return;
      }
      
      // 其他真正的错误则抛出
      throw err;
    }
  }
  ```

  ### 2. 服务层错误处理

  createCLI函数返回的execute方法处理一般错误情况：

  ```typescript
  return {
    execute: async (argv?: string[]) => {
      try {
        await adapter.parse(argv);
      } catch (error) {
        console.error('命令执行出错:', error);
        
        // 非测试环境时退出进程
        if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
          process.exit(1);
        }
        
        throw error; // 重新抛出以便调用者可以处理
      }
    },
    // ...其他方法
  };
  ```

  ### 3. 应用层错误处理

  应用代码(如bin.ts)只需处理启动失败的情况，不需要处理Commander.js特有错误：

  ```typescript
  // 执行CLI
  await cli.execute();

  // 仅处理启动失败
  main().catch(error => {
    console.error('CLI启动失败:', error);
    process.exit(1);
  });
  ```
  ```

- **更新模块职责章节**:
  ```markdown
  ## 模块职责

  CLI模块采用严格的职责划分，确保各层次关注点分离：

  ### CLI适配器(CLIAdapter)职责：
  - 完全封装底层命令行库(Commander.js)的所有实现细节
  - 提供类型安全的命令注册接口
  - 处理底层库特有错误，如帮助显示和版本显示
  - 提供解析命令行参数的功能

  ### CLI服务(cliService)职责：
  - 创建和配置CLI实例
  - 提供高级错误处理逻辑
  - 组织和注册用户命令
  - 协调CLI适配器与应用代码之间的交互

  ### 应用入口(bin.ts)职责：
  - 仅作为应用的入口点
  - 初始化和配置CLI
  - 注册应用特定命令
  - 不处理底层库实现细节
  ```

- **更新bin.ts使用示例**:
  ```markdown
  ## bin.ts正确使用示例

  以下是bin.ts脚本的推荐实现方式：

  ```typescript
  #!/usr/bin/env node
  
  import { createCLI } from './api/cli';
  import { getAllRegisteredCommands } from './core/framework/domainService';

  async function main() {
    // 创建CLI实例
    const cli = createCLI({
      name: 'dpml',
      version: '1.0.0',
      description: 'DPML命令行工具'
    }, []);

    // 注册命令
    const commands = getAllRegisteredCommands();
    cli.registerCommands(commands);

    // 执行CLI - 无需处理底层库特有错误
    await cli.execute();
  }

  // 仅处理启动失败
  main().catch(error => {
    console.error('CLI启动失败:', error);
    process.exit(1);
  });
  ```

  **注意**：应用代码不应直接处理Commander.js特有的错误代码，这些错误应由CLI模块内部处理。
  ```

- **实现策略**:
  1. 先分析当前CLI-Design.md文档结构
  2. 确定错误处理章节的最佳位置
  3. 添加错误处理章节和更新模块职责说明
  4. 添加bin.ts正确使用示例
  5. 确保文档整体一致性和准确性

**成功标准(S)**:
- **基础达标**:
  - 文档中添加了详细的错误处理章节
  - 明确了各层次的职责边界
  - 提供了bin.ts的正确使用示例
  - 文档与最新实现保持一致

- **预期品质**:
  - 文档结构清晰，易于理解
  - 使用准确的技术术语描述错误处理
  - 代码示例完整且可执行
  - 文档格式符合项目标准

- **卓越表现**:
  - 添加流程图直观展示错误处理流程
  - 提供更多使用场景和最佳实践
  - 增加常见问题(FAQ)部分解答可能的疑问 