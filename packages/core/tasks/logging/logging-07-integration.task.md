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

## API层接口实现任务（集成任务）

**目标(O)**:
- **功能目标**:
  - 实现日志模块的API层接口
  - 提供简洁、直观的公共API，方便用户使用
  - 封装复杂的实现细节，只暴露必要的功能
  - 确保API的一致性和向后兼容性
  - 优化API设计，提供良好的使用体验
  
- **执行任务**:
  - 创建文件:
    - `packages/core/src/api/logging.ts` - 实现日志模块的公共API
    - `packages/core/src/api/interfaces.ts` - 在已有文件中添加日志接口导出
  - 实现功能:
    - 实现导出`getLogger`函数，支持命名日志器
    - 实现`createLogger`函数，创建自定义配置的日志器
    - 实现`setLogLevel`函数，设置默认日志级别
    - 实现`createDefaultFormatter`等工厂函数，创建格式化器
    - 实现`createConsoleTransport`等工厂函数，创建传输器
    - 导出必要的类型和接口，如`LogLevel`、`Logger`等

- **任务边界**:
  - 仅实现API层接口，依赖Core层的功能实现
  - 不实现具体的日志器、格式化器和传输器
  - 主要负责提供友好的公共接口
  - 专注于封装实现细节，提供简洁API


**环境(E)**:
- **参考资源**:
  - `packages/core/src/types/log.ts` - 日志类型定义（第一个任务的输出）
  - `packages/core/src/core/logging/loggingService.ts` - 日志服务（第六个任务的输出）
  - `packages/core/docs/product/Logger-Design.md` - 日志模块设计文档
  - `packages/core/docs/develop/Logger-Testcase-Design.md` - 日志模块测试用例设计
  - `packages/core/src/__tests__/unit/api/logging.test.ts` - API层单元测试
  - `packages/core/src/__tests__/integration/logging/index.test.ts` - 日志API集成测试
  
- **上下文信息**:
  - API层是DPML框架对外暴露的接口，是用户与系统交互的唯一入口
  - 日志API应当简洁易用，隐藏实现复杂性
  - API层依赖于Core层的loggingService实现
  - API设计应遵循一致的设计原则和命名规范
  
- **规范索引**:
  - [编码规范](../../../../rules/develop/coding-standards.md)
  - [API设计规范](../../../../rules/develop/api-design.md)
  - [公共接口规范](../../../../rules/develop/public-interfaces.md)

- **注意事项**:
  - API设计应遵循最小惊讶原则，接口行为应符合用户预期
  - 需要提供完整的JSDoc文档和类型定义
  - 公共API应当保持稳定性，支持向后兼容
  - 工厂函数应当提供合理的默认参数

**实现指导(I)**:
- **算法与流程**:
  - API层流程:
    1. 接收用户参数
    2. 验证和规范化参数
    3. 调用Core层相应功能
    4. 返回结果给用户
    
  - 工厂函数流程:
    1. 接收用户配置
    2. 合并默认配置
    3. 创建对应组件实例
    4. 返回创建的实例

- **技术选型**:
  - 使用函数式API设计模式
  - 使用命名导出（named exports）
  - 使用工厂函数模式创建组件实例
  
- **代码模式**:
  - 使用命名导出模式组织API函数
  - 使用工厂函数模式创建组件实例
  - 使用委托模式将调用委托给Core层
  - 示例代码片段:
  ```typescript
  /**
   * DPML日志模块API
   * 提供简洁的日志功能接口
   */
  import { LogLevel, Logger, LoggerConfig, LogFormatter, LogTransport } from '../types/log';
  import * as loggingService from '../core/logging/loggingService';
  import { DefaultFormatter } from '../core/logging/formatters/DefaultFormatter';
  import { JsonFormatter } from '../core/logging/formatters/JsonFormatter';
  import { SimpleFormatter } from '../core/logging/formatters/SimpleFormatter';
  import { ConsoleTransport } from '../core/logging/transports/ConsoleTransport';
  import { FileTransport } from '../core/logging/transports/FileTransport';
  import { AsyncConsoleTransport } from '../core/logging/transports/AsyncConsoleTransport';
  
  /**
   * 获取日志器
   * @param name 可选的日志器名称，默认使用'default'
   * @returns 日志器实例
   * @example
   * ```typescript
   * // 获取默认日志器
   * const logger = getLogger();
   * logger.info('Hello DPML');
   * 
   * // 获取命名日志器
   * const dbLogger = getLogger('database');
   * dbLogger.debug('DB connection established');
   * ```
   */
  export function getLogger(name?: string): Logger {
    return loggingService.getLogger(name || 'default');
  }
  
  /**
   * 创建自定义配置的日志器
   * @param name 日志器名称
   * @param config 日志器配置
   * @returns 创建的日志器实例
   * @example
   * ```typescript
   * // 创建自定义日志器
   * const logger = createLogger('custom', {
   *   minLevel: LogLevel.DEBUG,
   *   formatter: createJsonFormatter(),
   *   transports: [createConsoleTransport()]
   * });
   * ```
   */
  export function createLogger(name: string, config: LoggerConfig): Logger {
    return loggingService.createLogger(name, config);
  }
  
  /**
   * 设置全局默认日志级别
   * @param level 日志级别
   * @example
   * ```typescript
   * // 设置默认日志级别为DEBUG
   * setLogLevel(LogLevel.DEBUG);
   * ```
   */
  export function setLogLevel(level: LogLevel): void {
    loggingService.setDefaultLogLevel(level);
  }
  
  /**
   * 创建默认格式化器
   * 格式: [时间] [级别] 消息 {上下文} (位置信息)
   * @returns DefaultFormatter实例
   */
  export function createDefaultFormatter(): LogFormatter {
    return new DefaultFormatter();
  }
  
  /**
   * 创建JSON格式化器
   * 将日志条目转换为JSON格式，适用于结构化日志分析
   * @returns JsonFormatter实例
   */
  export function createJsonFormatter(): LogFormatter {
    return new JsonFormatter();
  }
  
  /**
   * 创建简单格式化器
   * 格式: [级别] 消息
   * @returns SimpleFormatter实例
   */
  export function createSimpleFormatter(): LogFormatter {
    return new SimpleFormatter();
  }
  
  /**
   * 创建控制台传输器
   * @param formatter 可选的格式化器，默认使用DefaultFormatter
   * @returns ConsoleTransport实例
   */
  export function createConsoleTransport(formatter?: LogFormatter): LogTransport {
    return new ConsoleTransport(formatter || createDefaultFormatter());
  }
  
  /**
   * 创建文件传输器
   * @param filePath 日志文件路径
   * @param formatter 可选的格式化器，默认使用DefaultFormatter
   * @returns FileTransport实例
   */
  export function createFileTransport(filePath: string, formatter?: LogFormatter): LogTransport {
    return new FileTransport(filePath, formatter || createDefaultFormatter());
  }
  
  /**
   * 创建异步控制台传输器
   * @param flushIntervalMs 可选的刷新间隔（毫秒），默认为1000
   * @param formatter 可选的格式化器，默认使用DefaultFormatter
   * @returns AsyncConsoleTransport实例
   */
  export function createAsyncConsoleTransport(
    flushIntervalMs?: number,
    formatter?: LogFormatter
  ): LogTransport & { flush: (sync?: boolean) => Promise<void> } {
    return new AsyncConsoleTransport(
      flushIntervalMs || 1000,
      formatter || createDefaultFormatter()
    );
  }
  
  // 导出类型和枚举
  export { LogLevel, Logger, LoggerConfig, LogFormatter, LogTransport };
  ```
  
  ```typescript
  // 在interfaces.ts中添加
  export { Logger, LogLevel, LoggerConfig, LogFormatter, LogTransport } from '../types/log';
  ```
  
- **实现策略**:
  1. 先实现基本的委托函数（getLogger, createLogger, setLogLevel）
  2. 实现格式化器的工厂函数
  3. 实现传输器的工厂函数
  4. 确保所有API函数有完整的JSDoc文档和示例
  5. 导出必要的类型和接口

**成功标准(S)**:
- **基础达标**:
  - 单元测试通过:
    - UT-API-LOG-01: getLogger应委托给loggingService
    - UT-API-LOG-02: createLogger应委托给loggingService
    - UT-API-LOG-03: setLogLevel应委托给loggingService
    - UT-API-LOG-04: 格式化器工厂函数应创建相应的格式化器
    - UT-API-LOG-05: 传输器工厂函数应创建相应的传输器
  - 集成测试通过:
    - IT-LOG-API-01: 通过API创建的日志器应正常工作
    - IT-LOG-API-02: 通过API设置的日志级别应生效
    - IT-LOG-API-03: 通过API创建的格式化器和传输器应协同工作
  
- **预期品质**:
  - API设计符合最小惊讶原则
  - 所有API函数有完整的JSDoc文档和使用示例
  - 所有API函数有准确的类型定义
  - 导出所有必要的类型和接口
  
- **卓越表现**:
  - 提供额外的便捷API，如特定级别日志器的快捷创建
  - 支持链式调用的流畅API设计
  - 实现更多高级功能的工厂函数 
