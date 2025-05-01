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

## 日志模块终结任务（终结任务）

**目标(O)**:
- **功能目标**:
  - 完成日志模块的所有组件集成
  - 确保所有功能正常工作并通过测试
  - 优化性能和资源使用
  - 完善文档和类型定义
  - 准备日志模块代码提交和发布
  
- **执行任务**:
  - 验证文件:
    - 确认所有日志模块的文件已正确实现
    - 确认所有文件遵循项目规范
  - 补充功能:
    - 添加日志处理工具方法（如工具函数和常量）
    - 优化导出接口，确保API一致性
    - 编写文档注释，补充使用示例
  - 质量检查:
    - 运行所有单元测试和集成测试
    - 修复发现的错误和问题
    - 运行lint检查，修复样式和格式问题

- **任务边界**:
  - 仅对日志模块进行验证和完善
  - 不引入新的主要功能，只做优化和完善
  - 确保模块与其他模块的兼容性
  - 专注于模块的最终质量和可用性


**环境(E)**:
- **参考资源**:
  - 前面八个任务的所有输出，包括:
    - 类型定义（task-01）
    - 核心组件实现（task-02到task-05）
    - 服务层和API层实现（task-06和task-07）
    - 复合传输器实现（task-08）
  - `packages/core/docs/product/Logger-Design.md` - 日志模块设计文档
  - `packages/core/docs/develop/Logger-Testcase-Design.md` - 日志模块测试用例设计
  - 所有单元测试和集成测试文件
  
- **上下文信息**:
  - 日志模块是DPML的基础设施组件，提供记录系统运行过程中各种信息的功能
  - 该模块由多个紧密协作的组件组成
  - 需要确保所有组件正确集成，并符合整体架构设计
  - 作为终结任务，需要确保模块的整体质量和可用性
  
- **规范索引**:
  - [编码规范](../../../../rules/develop/coding-standards.md)
  - [测试策略规则](../../../../rules/develop/testing-strategy.md)
  - [文档规范](../../../../rules/develop/documentation.md)
  - [提交规范](../../../../rules/develop/commit-guidelines.md)

- **注意事项**:
  - 所有必要的类型必须正确导出
  - JSDoc文档必须完整，包括参数、返回值和使用示例
  - 组件间依赖关系应当清晰且符合分层架构设计
  - 确保没有内存泄漏和资源泄漏

**实现指导(I)**:
- **算法与流程**:
  - 验证流程:
    1. 检查所有组件是否已实现并按预期工作
    2. 运行所有测试和自动检查
    3. 检查性能和资源使用情况
    4. 修复发现的问题
    
  - 文档完善流程:
    1. 检查所有公共API是否有完整的JSDoc注释
    2. 添加缺失的使用示例和文档
    3. 确保类型定义准确且包含注释

- **技术选型**:
  - 使用pnpm测试命令运行测试
  - 使用ESLint检查代码质量
  - 使用TypeScript编译器检查类型完整性
  
- **代码模式**:
  - 添加工具方法示例:
  ```typescript
  // 在api/logging.ts中添加工具方法
  
  /**
   * 创建按命名空间分隔的日志器
   * @param namespace 命名空间
   * @param config 可选的日志器配置
   * @returns 创建的日志器实例
   * @example
   * ```typescript
   * // 创建命名空间日志器
   * const logger = createNamespacedLogger('app.database');
   * logger.info('Database connected'); // 输出: [INFO] [app.database] Database connected
   * ```
   */
  export function createNamespacedLogger(namespace: string, config?: Partial<LoggerConfig>): Logger {
    const fullConfig: LoggerConfig = {
      minLevel: LogLevel.INFO,
      ...config,
      formatter: config?.formatter || new DefaultFormatter(),
      transports: config?.transports || [new ConsoleTransport()]
    };
    
    // 装饰原始日志方法，添加命名空间前缀
    const logger = createLogger(`ns:${namespace}`, fullConfig);
    const decorated: Logger = {
      debug(message: string, context?: Record<string, unknown>, error?: Error): void {
        logger.debug(`[${namespace}] ${message}`, context, error);
      },
      info(message: string, context?: Record<string, unknown>, error?: Error): void {
        logger.info(`[${namespace}] ${message}`, context, error);
      },
      warn(message: string, context?: Record<string, unknown>, error?: Error): void {
        logger.warn(`[${namespace}] ${message}`, context, error);
      },
      error(message: string, context?: Record<string, unknown>, error?: Error): void {
        logger.error(`[${namespace}] ${message}`, context, error);
      },
      fatal(message: string, context?: Record<string, unknown>, error?: Error): void {
        logger.fatal(`[${namespace}] ${message}`, context, error);
      }
    };
    
    return decorated;
  }
  
  /**
   * 创建用于调试的日志器
   * 将自动启用调用位置捕获
   * @param name 可选的日志器名称
   * @returns 创建的日志器实例
   */
  export function createDebugLogger(name?: string): Logger {
    return createLogger(name || 'debug', {
      minLevel: LogLevel.DEBUG,
      callSiteCapture: {
        enabled: true
      },
      formatter: createDefaultFormatter(),
      transports: [createConsoleTransport()]
    });
  }
  ```
  
  - 文档示例:
  ```typescript
  /**
   * DPML日志模块
   * @module logging
   * 
   * 该模块提供了完整的日志记录功能，支持多种日志级别、格式和输出目标。
   * 
   * 基本用法:
   * ```typescript
   * import { getLogger, LogLevel } from '@dpml/core';
   * 
   * // 获取默认日志器
   * const logger = getLogger();
   * 
   * // 记录不同级别的日志
   * logger.debug('调试信息');
   * logger.info('一般信息');
   * logger.warn('警告信息');
   * logger.error('错误信息', { userId: 123 }, new Error('发生错误'));
   * logger.fatal('严重错误');
   * 
   * // 设置全局日志级别
   * setLogLevel(LogLevel.DEBUG);
   * 
   * // 创建自定义日志器
   * const customLogger = createLogger('custom', {
   *   minLevel: LogLevel.INFO,
   *   formatter: createJsonFormatter(),
   *   transports: [
   *     createConsoleTransport(),
   *     createFileTransport('./logs/app.log')
   *   ],
   *   callSiteCapture: {
   *     enabled: true,
   *     forLevels: [LogLevel.ERROR, LogLevel.FATAL]
   *   }
   * });
   * ```
   */
  ```
  
- **实现策略**:
  1. 运行所有测试，验证功能正常
  2. 检查公共API的完整性和一致性
  3. 运行lint检查，修复发现的问题
  4. 添加缺失的文档和示例
  5. 优化性能和资源使用
  6. 最终验证所有测试和检查

**成功标准(S)**:
- **基础达标**:
  - 所有单元测试通过（types、core、api）
  - 所有集成测试通过（使用场景、组件协作）
  - 所有端到端测试通过（全流程测试）
  - 所有lint检查通过，无error级别问题
  
- **预期品质**:
  - 完整的JSDoc文档，包括参数、返回值和示例
  - 完整的类型定义，无类型错误
  - 优化的性能和资源使用
  - 符合项目架构规范的组件结构
  
- **卓越表现**:
  - 提供高级实用工具方法，如createNamespacedLogger
  - 提供使用教程和最佳实践指南
  - 性能基准测试和优化
  - 零警告的代码质量 
