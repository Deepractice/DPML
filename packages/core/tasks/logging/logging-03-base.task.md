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

## 格式化器组件实现任务（基础任务）

**目标(O)**:
- **功能目标**:
  - 实现多种日志格式化器组件
  - 负责将LogEntry对象转换为格式化的字符串
  - 支持不同的日志格式需求
  - 确保格式化器能够适应各种复杂和异常情况
  
- **执行任务**:
  - 创建文件:
    - `packages/core/src/core/logging/formatters/DefaultFormatter.ts` - 实现默认格式化器
    - `packages/core/src/core/logging/formatters/JsonFormatter.ts` - 实现JSON格式化器
    - `packages/core/src/core/logging/formatters/SimpleFormatter.ts` - 实现简单格式化器
  - 实现功能:
    - 实现`format`方法将日志条目格式化为字符串
    - 处理各种日志元素（时间戳、级别、消息、上下文、错误等）
    - 确保格式化结果清晰易读
    - 处理复杂嵌套对象等特殊情况

- **任务边界**:
  - 仅实现格式化器组件，不包含其他组件
  - 不负责传输器、日志器或注册表的实现
  - 不负责格式化器的工厂或注册管理
  - 专注于将LogEntry数据结构转换为字符串表示


**环境(E)**:
- **参考资源**:
  - `packages/core/src/types/log.ts` - 日志类型定义（第一个任务的输出）
  - `packages/core/docs/product/Logger-Design.md` - 日志模块设计文档
  - `packages/core/docs/develop/Logger-Testcase-Design.md` - 日志模块测试用例设计
  - `packages/core/src/__tests__/unit/core/logging/formatters/DefaultFormatter.test.ts` - 格式化器单元测试
  - `packages/core/src/__tests__/fixtures/logging/loggerFixtures.ts` - 测试夹具
  
- **上下文信息**:
  - 格式化器是日志系统的关键组件，负责确定日志的最终呈现形式
  - 格式化器实现LogFormatter接口，将被传输器使用
  - 不同的格式化器针对不同的使用场景，如控制台日志、文件日志、JSON日志等
  
- **规范索引**:
  - [编码规范](../../../../rules/develop/coding-standards.md)
  - [错误处理规范](../../../../rules/develop/error-handling.md)

- **注意事项**:
  - 格式化器必须处理所有可能的输入情况，包括缺失字段、null值等
  - JSON格式化时需要注意循环引用问题
  - 格式化大对象时需要考虑性能和可读性的平衡
  - 日期格式应遵循ISO标准或项目约定

**实现指导(I)**:
- **算法与流程**:
  - 默认格式化器流程:
    1. 提取LogEntry中的各字段（时间戳、级别、消息等）
    2. 格式化时间戳为ISO字符串
    3. 将日志级别转换为字符串表示
    4. 格式化上下文对象为字符串（避免循环引用）
    5. 组合各部分为最终格式化字符串
  
  - JSON格式化器流程:
    1. 创建新对象包含LogEntry所有字段
    2. 将日志级别转换为字符串名称
    3. 确保Error对象正确序列化（提取message和stack）
    4. 使用JSON.stringify处理对象，处理循环引用
    
  - 简单格式化器流程:
    1. 仅提取最基本信息（级别、消息）
    2. 以简洁格式组合（适合空间受限场景）

- **技术选型**:
  - 使用标准JavaScript方法处理字符串和对象
  - 考虑使用第三方库处理JSON循环引用问题（可选）
  - 使用模板字符串提高可读性
  
- **代码模式**:
  - 遵循单一职责原则，每个格式化器只负责一种格式
  - 使用不可变数据模式，避免修改输入对象
  - 示例代码片段:
  ```typescript
  /**
   * 默认格式化器，提供人类可读的日志格式
   * 格式: [时间] [级别] 消息 {上下文} (位置信息)
   */
  export class DefaultFormatter implements LogFormatter {
    public format(entry: LogEntry): string {
      const { timestamp, level, message, context, error, caller } = entry;
      
      // 基础格式: [时间] [级别] 消息
      let result = `[${timestamp.toISOString()}] [${LogLevel[level]}] ${message}`;
      
      // 添加上下文信息
      if (context && Object.keys(context).length > 0) {
        try {
          result += ` ${JSON.stringify(context)}`;
        } catch (err) {
          // 处理循环引用等JSON序列化问题
          result += ` {上下文序列化失败: ${err instanceof Error ? err.message : String(err)}}`;
        }
      }
      
      // 添加错误信息
      if (error) {
        result += ` Error: ${error.message}`;
        if (error.stack) {
          result += `\n${error.stack}`;
        }
      }
      
      // 添加调用位置信息
      if (caller) {
        result += ` (at ${caller.fileName}:${caller.lineNumber}`;
        if (caller.functionName) {
          result += ` in ${caller.functionName}`;
        }
        result += ')';
      }
      
      return result;
    }
  }
  ```
  
  ```typescript
  /**
   * JSON格式化器，将日志条目转换为JSON格式
   * 适用于结构化日志分析
   */
  export class JsonFormatter implements LogFormatter {
    public format(entry: LogEntry): string {
      const formatted: Record<string, unknown> = {
        timestamp: entry.timestamp.toISOString(),
        level: LogLevel[entry.level],
        message: entry.message
      };
      
      // 添加上下文
      if (entry.context) {
        formatted.context = entry.context;
      }
      
      // 处理错误对象
      if (entry.error) {
        formatted.error = {
          message: entry.error.message,
          stack: entry.error.stack
        };
      }
      
      // 添加调用位置
      if (entry.caller) {
        formatted.caller = entry.caller;
      }
      
      try {
        return JSON.stringify(formatted);
      } catch (err) {
        // 处理循环引用
        return JSON.stringify({
          timestamp: formatted.timestamp,
          level: formatted.level,
          message: formatted.message,
          error: "Failed to serialize the complete log entry"
        });
      }
    }
  }
  ```
  
  ```typescript
  /**
   * 简单格式化器，提供简洁的日志格式
   * 格式: [级别] 消息
   */
  export class SimpleFormatter implements LogFormatter {
    public format(entry: LogEntry): string {
      return `[${LogLevel[entry.level]}] ${entry.message}`;
    }
  }
  ```
  
- **实现策略**:
  1. 先实现DefaultFormatter，处理基本格式化需求
  2. 实现JsonFormatter，支持结构化日志
  3. 实现SimpleFormatter，提供简洁输出选项
  4. 确保所有格式化器都处理空值、特殊字符和异常情况

**成功标准(S)**:
- **基础达标**:
  - DefaultFormatter单元测试通过:
    - UT-DEFFRM-01: format应格式化基本日志条目
    - UT-DEFFRM-02: format应包含时间戳
    - UT-DEFFRM-03: format应包含日志级别
    - UT-DEFFRM-04: format应包含上下文信息
    - UT-DEFFRM-05: format应包含错误信息
    - UT-DEFFRM-06: format应包含调用位置信息
  - 反向测试通过:
    - UT-DEFFRM-NEG-01: format应处理缺少时间戳的条目
    - UT-DEFFRM-NEG-02: format应处理复杂嵌套上下文
  - JsonFormatter和SimpleFormatter基本功能测试通过
  
- **预期品质**:
  - 所有格式化器遵循TypeScript最佳实践
  - 具有完整的JSDoc注释和类型声明
  - 实现健壮的错误处理，避免因格式化错误导致日志丢失
  - 格式化结果直观易读，符合各自的格式定义
  
- **卓越表现**:
  - 优化复杂对象和大型数据结构的格式化
  - 处理特殊情况如循环引用、二进制数据等
  - 提供配置选项，如日期格式、缩进级别等自定义选项 
