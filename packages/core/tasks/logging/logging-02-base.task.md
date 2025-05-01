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

## DefaultLogger执行组件实现任务（基础任务）

**目标(O)**:
- **功能目标**:
  - 实现核心日志执行组件DefaultLogger
  - 实现日志级别过滤功能
  - 实现调用位置捕获功能
  - 实现多传输器支持
  - 实现错误处理机制，确保日志系统故障不影响应用程序
  
- **执行任务**:
  - 创建文件:
    - `packages/core/src/core/logging/DefaultLogger.ts` - 实现DefaultLogger类
  - 实现功能:
    - 实现Logger接口定义的所有公共方法: `debug`, `info`, `warn`, `error`, `fatal`
    - 实现私有方法`log`处理通用日志逻辑
    - 实现`getCaller`方法获取调用位置信息
    - 实现`shouldCaptureCallSite`方法判断是否需要捕获调用位置

- **任务边界**:
  - 仅实现DefaultLogger类，不包含其他组件
  - 不包含LoggerRegistry和loggingService的实现
  - 不负责格式化器和传输器的具体实现
  - 传输器和格式化器的实例化由外部传入，而非在DefaultLogger中创建


**环境(E)**:
- **参考资源**:
  - `packages/core/src/types/log.ts` - 日志类型定义（上一任务的输出）
  - `packages/core/docs/product/Logger-Design.md` - 日志模块设计文档
  - `packages/core/docs/develop/Logger-Testcase-Design.md` - 日志模块测试用例设计
  - `packages/core/src/__tests__/unit/core/logging/DefaultLogger.test.ts` - DefaultLogger单元测试
  - `packages/core/src/__tests__/fixtures/logging/loggerFixtures.ts` - 测试夹具
  
- **上下文信息**:
  - DefaultLogger是日志模块的核心执行组件，负责根据配置记录日志
  - 此任务依赖于types/log.ts中的类型定义
  - DefaultLogger将被LoggerRegistry管理，并通过API层暴露给用户
  
- **规范索引**:
  - [编码规范](../../../../rules/develop/coding-standards.md)
  - [错误处理规范](../../../../rules/develop/error-handling.md)
  - [不可变数据规范](../../../../rules/develop/immutable-data.md)

- **注意事项**:
  - 日志级别过滤应在记录日志之前进行，避免不必要的性能开销
  - 捕获调用位置会影响性能，应根据配置有选择地启用
  - 传输器可能会抛出错误，必须妥善处理这些错误以避免影响应用程序

**实现指导(I)**:
- **算法与流程**:
  - 日志记录流程:
    1. 检查日志级别是否需要记录
    2. 如果需要，检查是否需要捕获调用位置
    3. 创建LogEntry对象
    4. 将LogEntry传递给所有传输器
    5. 处理传输过程中的错误
  
  - 调用位置捕获流程:
    1. 创建Error对象获取堆栈信息
    2. 解析堆栈信息提取文件名、函数名和行号
    3. 构建CallerInfo对象
    4. 将CallerInfo添加到LogEntry中

- **技术选型**:
  - 使用Error.captureStackTrace获取调用栈（如果可用）
  - 使用正则表达式解析调用栈字符串
  - 使用try-catch块隔离传输器错误
  
- **代码模式**:
  - 遵循单一职责原则，DefaultLogger只负责日志过滤和分发
  - 使用不可变对象模式处理LogEntry
  - 示例代码片段:
  ```typescript
  export class DefaultLogger implements Logger {
    private minLevel: LogLevel;
    private formatter?: LogFormatter;
    private transports: LogTransport[];
    private callSiteCapture: CallSiteCaptureConfig;
    
    constructor(config: LoggerConfig) {
      this.minLevel = config.minLevel;
      this.formatter = config.formatter;
      this.transports = config.transports || [];
      this.callSiteCapture = config.callSiteCapture || { enabled: false };
    }
    
    public debug(message: string, context?: Record<string, unknown>, error?: Error): void {
      this.log(LogLevel.DEBUG, message, context, error);
    }
    
    // 其他公共方法类似...
    
    private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
      // 1. 检查日志级别
      if (level < this.minLevel) {
        return;
      }
      
      // 2. 创建日志条目
      const entry: LogEntry = {
        timestamp: new Date(),
        level,
        message,
        context,
        error
      };
      
      // 3. 捕获调用位置（如果需要）
      if (this.shouldCaptureCallSite(level)) {
        entry.caller = this.getCaller();
      }
      
      // 4. 传递给所有传输器
      for (const transport of this.transports) {
        try {
          transport.write(entry);
        } catch (err) {
          // 处理传输器错误，避免影响其他传输器和应用程序
          console.error(`日志传输器错误: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
    
    private shouldCaptureCallSite(level: LogLevel): boolean {
      const { enabled, forLevels } = this.callSiteCapture;
      if (!enabled) {
        return false;
      }
      if (!forLevels || forLevels.length === 0) {
        return true;
      }
      return forLevels.includes(level);
    }
    
    private getCaller(): CallerInfo | undefined {
      // 实现调用位置捕获逻辑
      // ...
    }
  }
  ```
  
- **实现策略**:
  1. 先实现基本的Logger接口方法（debug, info, warn, error, fatal）
  2. 实现日志级别过滤功能
  3. 实现`log`方法的核心日志处理逻辑
  4. 添加调用位置捕获功能
  5. 实现错误处理逻辑，确保传输器错误得到妥善处理

**成功标准(S)**:
- **基础达标**:
  - 单元测试通过:
    - UT-DEFLOG-01: debug方法应在DEBUG级别启用时记录日志
    - UT-DEFLOG-02: info方法应在INFO级别启用时记录日志
    - UT-DEFLOG-03: warn方法应在WARN级别启用时记录日志
    - UT-DEFLOG-04: error方法应在ERROR级别启用时记录日志
    - UT-DEFLOG-05: fatal方法应在任何级别都记录日志
    - UT-DEFLOG-06: log方法应将日志条目传递给所有传输器
    - UT-DEFLOG-07: log方法应在启用调用位置捕获时添加位置信息
    - UT-DEFLOG-08: log方法应仅为配置的级别捕获调用位置
  - 反向测试通过:
    - UT-DEFLOG-NEG-01: debug方法应在高于DEBUG级别时不记录日志
    - UT-DEFLOG-NEG-02: log方法应处理传输器抛出的错误
  
- **预期品质**:
  - 代码遵循TypeScript最佳实践
  - 具有完整的JSDoc注释和类型声明
  - 实现健壮的错误处理机制
  - 符合单一职责原则，只负责日志过滤和分发
  
- **卓越表现**:
  - 优化调用位置捕获功能，减少性能影响
  - 提供详细的日志和错误信息
  - 考虑额外的错误恢复机制 
