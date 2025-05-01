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

## 模块服务层实现任务（集成任务）

**目标(O)**:
- **功能目标**:
  - 实现日志模块的服务层组件loggingService
  - 协调日志模块各组件，为API层提供功能支持
  - 管理日志配置，包括从环境变量加载配置
  - 提供日志器的获取和创建功能
  - 实现默认日志级别设置功能
  
- **执行任务**:
  - 创建文件:
    - `packages/core/src/core/logging/loggingService.ts` - 实现loggingService模块
  - 实现功能:
    - 实现`getDefaultLogger`方法获取默认日志器
    - 实现`getLogger`方法获取指定名称的日志器
    - 实现`createLogger`方法创建新日志器
    - 实现`setDefaultLogLevel`方法设置默认日志级别
    - 实现`loadLoggerConfig`私有方法加载日志配置

- **任务边界**:
  - 仅实现模块服务层，不包含API层
  - 不实现具体的日志器、格式化器和传输器
  - 主要负责组件间的协调和统一配置管理
  - 专注于为API层提供功能支持


**环境(E)**:
- **参考资源**:
  - `packages/core/src/types/log.ts` - 日志类型定义（第一个任务的输出）
  - `packages/core/src/core/logging/LoggerRegistry.ts` - 日志注册表（第五个任务的输出）
  - `packages/core/docs/product/Logger-Design.md` - 日志模块设计文档
  - `packages/core/docs/develop/Logger-Testcase-Design.md` - 日志模块测试用例设计
  - `packages/core/src/__tests__/unit/core/logging/loggingService.test.ts` - loggingService单元测试
  - `packages/core/src/__tests__/integration/logging/loggerFlowIntegration.test.ts` - 日志流程集成测试
  
- **上下文信息**:
  - loggingService是日志模块的服务层组件，负责协调各组件工作
  - 作为Core层和API层之间的桥梁，为API提供所需功能
  - 此组件依赖于LoggerRegistry和相关类型定义
  - 需要处理环境变量配置和默认配置
  
- **规范索引**:
  - [编码规范](../../../../rules/develop/coding-standards.md)
  - [模块设计规范](../../../../rules/develop/module-design.md)
  - [配置管理规范](../../../../rules/develop/configuration.md)

- **注意事项**:
  - 环境变量配置应优先于默认配置
  - 需要处理默认日志级别的动态更新
  - 模块服务层是核心层，不应直接依赖外部库

**实现指导(I)**:
- **算法与流程**:
  - 配置加载流程:
    1. 检查环境变量中的日志配置（如LOG_LEVEL）
    2. 根据环境变量覆盖默认配置
    3. 返回最终配置对象
    
  - 默认日志级别设置流程:
    1. 获取LoggerRegistry单例
    2. 创建包含新日志级别的配置
    3. 使用新配置创建默认日志器
    4. 更新LoggerRegistry中的默认日志器

- **技术选型**:
  - 使用模块模式（Module Pattern）组织代码
  - 使用委托模式将操作委托给LoggerRegistry
  - 使用环境变量获取配置
  
- **代码模式**:
  - 使用命名导出模式（Named Exports）组织模块功能
  - 使用委托模式减少代码重复
  - 示例代码片段:
  ```typescript
  /**
   * 日志服务模块，提供日志相关功能
   * 作为API层和核心实现之间的桥梁
   */
  import { Logger, LoggerConfig, LogLevel } from '../../../types/log';
  import { LoggerRegistry } from './LoggerRegistry';
  
  /**
   * 获取默认日志器
   * @returns 默认日志器实例
   */
  export function getDefaultLogger(): Logger {
    return LoggerRegistry.getInstance().getLogger('default');
  }
  
  /**
   * 获取指定名称的日志器
   * @param name 日志器名称
   * @returns 日志器实例
   */
  export function getLogger(name: string): Logger {
    return LoggerRegistry.getInstance().getLogger(name);
  }
  
  /**
   * 创建并注册新日志器
   * @param name 日志器名称
   * @param config 日志器配置
   * @returns 创建的日志器实例
   */
  export function createLogger(name: string, config: LoggerConfig): Logger {
    return LoggerRegistry.getInstance().createLogger(name, config);
  }
  
  /**
   * 设置默认日志级别
   * @param level 新的默认日志级别
   */
  export function setDefaultLogLevel(level: LogLevel): void {
    // 创建新配置，保留现有配置中的其他属性
    const config = loadLoggerConfig();
    config.minLevel = level;
    
    // 创建新的默认日志器
    const logger = LoggerRegistry.getInstance().createLogger('default', config);
    LoggerRegistry.getInstance().registerLogger('default', logger);
  }
  
  /**
   * 加载日志配置
   * 从环境变量和默认值构建配置
   * @returns 日志配置对象
   */
  function loadLoggerConfig(): LoggerConfig {
    // 默认配置
    const config: LoggerConfig = {
      minLevel: LogLevel.INFO
    };
    
    // 从环境变量中读取配置
    try {
      if (typeof process !== 'undefined' && process.env) {
        // 读取日志级别
        const envLogLevel = process.env.LOG_LEVEL;
        if (envLogLevel) {
          const level = LogLevel[envLogLevel as keyof typeof LogLevel];
          if (typeof level === 'number') {
            config.minLevel = level;
          }
        }
        
        // 读取调用位置捕获配置
        const enableCallSiteCapture = process.env.LOG_CAPTURE_CALLSITE;
        if (enableCallSiteCapture === 'true') {
          config.callSiteCapture = {
            enabled: true
          };
        }
      }
    } catch (err) {
      // 环境变量读取失败，使用默认配置
      console.warn('读取日志环境变量配置失败，使用默认配置');
    }
    
    return config;
  }
  ```
  
- **实现策略**:
  1. 先实现基本的委托功能（getDefaultLogger, getLogger, createLogger）
  2. 实现配置加载和管理功能
  3. 实现日志级别动态设置功能
  4. 确保模块与LoggerRegistry正确集成

**成功标准(S)**:
- **基础达标**:
  - 单元测试通过:
    - UT-LOGSVC-01: getDefaultLogger应委托给LoggerRegistry
    - UT-LOGSVC-02: getLogger应委托给LoggerRegistry
    - UT-LOGSVC-03: createLogger应委托给LoggerRegistry
    - UT-LOGSVC-04: setDefaultLogLevel应更新默认日志级别
  - 反向测试通过:
    - UT-LOGSVC-NEG-01: loadLoggerConfig应处理环境变量配置
  - 集成测试通过:
    - IT-LOGFLOW-01: API层应正确创建并配置日志器
    - IT-LOGFLOW-02: 日志过滤应在API到传输器的完整流程中工作
    - IT-LOGFLOW-03: 调用位置捕获应在完整流程中工作
  
- **预期品质**:
  - 代码遵循模块设计最佳实践
  - 具有完整的JSDoc注释和类型声明
  - 错误处理完善，确保稳定性
  - 模块接口清晰，便于API层调用
  
- **卓越表现**:
  - 提供更丰富的配置选项
  - 支持配置持久化
  - 实现日志配置动态监控和更新 
