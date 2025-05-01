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

## LoggerRegistry状态管理组件实现任务（基础任务）

**目标(O)**:
- **功能目标**:
  - 实现日志注册表单例组件LoggerRegistry
  - 管理所有日志器实例，提供统一访问点
  - 实现日志器的注册、获取和创建功能
  - 确保全局唯一性和一致性
  
- **执行任务**:
  - 创建文件:
    - `packages/core/src/core/logging/LoggerRegistry.ts` - 实现LoggerRegistry类
  - 实现功能:
    - 实现单例模式，确保全局唯一的LoggerRegistry实例
    - 实现`getInstance`静态方法获取或创建LoggerRegistry实例
    - 实现`getLogger`方法获取已注册的日志器
    - 实现`registerLogger`方法注册新日志器
    - 实现`createLogger`方法创建并注册新日志器

- **任务边界**:
  - 仅实现LoggerRegistry组件，不包含模块服务层和API层
  - 不负责格式化器和传输器的具体实现
  - 负责DefaultLogger实例的创建，但不涉及其内部实现
  - 专注于日志器实例的管理和状态维护


**环境(E)**:
- **参考资源**:
  - `packages/core/src/types/log.ts` - 日志类型定义（第一个任务的输出）
  - `packages/core/src/core/logging/DefaultLogger.ts` - 日志执行组件（第二个任务的输出）
  - `packages/core/docs/product/Logger-Design.md` - 日志模块设计文档
  - `packages/core/docs/develop/Logger-Testcase-Design.md` - 日志模块测试用例设计
  - `packages/core/src/__tests__/unit/core/logging/LoggerRegistry.test.ts` - LoggerRegistry单元测试
  
- **上下文信息**:
  - LoggerRegistry是日志模块的状态管理组件，负责维护所有日志器实例
  - 采用单例模式，确保全局唯一的日志注册表实例
  - 此组件依赖于DefaultLogger和LoggerConfig类型
  - LoggerRegistry将被loggingService使用，并通过API层暴露给用户
  
- **规范索引**:
  - [编码规范](../../../../rules/develop/coding-standards.md)
  - [单例模式规范](../../../../rules/develop/design-patterns.md)

- **注意事项**:
  - 单例实现需要考虑线程安全性（虽然JavaScript是单线程，但仍需确保实例的唯一性）
  - 需要处理默认配置和自定义配置的合并
  - 获取不存在的日志器时应返回默认日志器而非抛出错误

**实现指导(I)**:
- **算法与流程**:
  - 单例模式实现流程:
    1. 使用静态私有成员保存单例实例
    2. 提供静态getInstance方法获取或创建实例
    3. 将构造函数设为私有，防止直接实例化
    
  - 日志器获取流程:
    1. 根据名称从内部Map中获取日志器
    2. 如果日志器不存在，返回默认日志器
    
  - 日志器创建流程:
    1. 使用提供的配置创建DefaultLogger实例
    2. 将创建的日志器注册到内部Map中
    3. 返回创建的日志器实例

- **技术选型**:
  - 使用TypeScript类和静态成员实现单例模式
  - 使用Map数据结构存储日志器实例
  - 使用DefaultLogger作为日志器的具体实现
  
- **代码模式**:
  - 使用单例设计模式确保全局唯一实例
  - 使用工厂方法模式创建日志器实例
  - 使用委托模式将日志器创建委托给DefaultLogger
  - 示例代码片段:
  ```typescript
  /**
   * 日志注册表，管理所有日志器实例
   * 采用单例模式，确保全局唯一性
   */
  export class LoggerRegistry {
    private static instance: LoggerRegistry;
    private loggers: Map<string, Logger> = new Map();
    private defaultLogger: Logger;
    
    /**
     * 私有构造函数，防止直接实例化
     * @param defaultConfig 默认日志器配置
     */
    private constructor(defaultConfig: LoggerConfig) {
      this.defaultLogger = new DefaultLogger(defaultConfig);
      this.loggers.set('default', this.defaultLogger);
    }
    
    /**
     * 获取LoggerRegistry单例实例
     * @param defaultConfig 可选的默认日志器配置
     * @returns LoggerRegistry单例实例
     */
    public static getInstance(defaultConfig?: LoggerConfig): LoggerRegistry {
      if (!LoggerRegistry.instance) {
        const config = defaultConfig || {
          minLevel: LogLevel.INFO
        };
        LoggerRegistry.instance = new LoggerRegistry(config);
      }
      return LoggerRegistry.instance;
    }
    
    /**
     * 获取指定名称的日志器
     * @param name 日志器名称
     * @returns 日志器实例，如果不存在则返回默认日志器
     */
    public getLogger(name: string): Logger {
      return this.loggers.get(name) || this.defaultLogger;
    }
    
    /**
     * 注册日志器
     * @param name 日志器名称
     * @param logger 日志器实例
     */
    public registerLogger(name: string, logger: Logger): void {
      this.loggers.set(name, logger);
    }
    
    /**
     * 创建并注册新日志器
     * @param name 日志器名称
     * @param config 日志器配置
     * @returns 创建的日志器实例
     */
    public createLogger(name: string, config: LoggerConfig): Logger {
      const logger = new DefaultLogger(config);
      this.registerLogger(name, logger);
      return logger;
    }
  }
  ```
  
- **实现策略**:
  1. 先实现基本的单例模式架构
  2. 实现内部状态管理（loggers Map和defaultLogger）
  3. 实现日志器的获取、注册和创建方法
  4. 确保单例的线程安全性和一致性

**成功标准(S)**:
- **基础达标**:
  - LoggerRegistry单元测试通过:
    - UT-LOGREG-01: getInstance应返回单例实例
    - UT-LOGREG-02: getInstance应使用默认配置创建实例
    - UT-LOGREG-03: getInstance应使用提供的配置创建实例
    - UT-LOGREG-04: getLogger应返回已注册的日志器
    - UT-LOGREG-05: getLogger应在日志器不存在时返回默认日志器
    - UT-LOGREG-06: registerLogger应注册新日志器
    - UT-LOGREG-07: createLogger应创建并注册新日志器
  - 反向测试通过:
    - UT-LOGREG-NEG-01: registerLogger应在重复注册时覆盖现有日志器
  
- **预期品质**:
  - 单例模式实现正确，确保全局唯一性
  - 日志器管理逻辑清晰，避免内存泄漏
  - 代码具有完整的JSDoc注释和类型声明
  - 错误处理完善，确保稳定性
  
- **卓越表现**:
  - 考虑多环境支持（如浏览器和Node.js）
  - 提供配置更新和重置功能
  - 添加日志器生命周期管理 
