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

## 日志传输器实现任务（基础任务）

**目标(O)**:
- **功能目标**:
  - 实现多种日志传输器组件
  - 支持同步和异步日志记录方式
  - 实现不同的日志输出目标（控制台、文件等）
  - 确保传输器的错误处理和性能优化
  - 提供统一的传输器基类以减少重复代码
  
- **执行任务**:
  - 创建文件:
    - `packages/core/src/core/logging/transports/BaseTransport.ts` - 实现基础传输器抽象类
    - `packages/core/src/core/logging/transports/ConsoleTransport.ts` - 实现控制台传输器
    - `packages/core/src/core/logging/transports/AsyncConsoleTransport.ts` - 实现异步控制台传输器
    - `packages/core/src/core/logging/transports/FileTransport.ts` - 实现文件传输器
  - 实现功能:
    - 在BaseTransport中实现通用的格式化逻辑和错误处理
    - 在ConsoleTransport中实现基于日志级别的控制台输出
    - 在AsyncConsoleTransport中实现队列和批处理机制
    - 在FileTransport中实现文件写入逻辑

- **任务边界**:
  - 仅实现传输器组件，不包含日志器和注册表
  - 不负责格式化器的具体实现（使用注入的格式化器）
  - 不实现日志聚合、轮转或高级分析功能
  - 专注于将格式化的日志写入目标位置


**环境(E)**:
- **参考资源**:
  - `packages/core/src/types/log.ts` - 日志类型定义（第一个任务的输出）
  - `packages/core/src/core/logging/formatters/` - 格式化器实现（第三个任务的输出）
  - `packages/core/docs/product/Logger-Design.md` - 日志模块设计文档
  - `packages/core/docs/develop/Logger-Testcase-Design.md` - 日志模块测试用例设计
  - `packages/core/src/__tests__/unit/core/logging/transports/ConsoleTransport.test.ts` - 控制台传输器测试
  - `packages/core/src/__tests__/unit/core/logging/transports/AsyncConsoleTransport.test.ts` - 异步传输器测试
  
- **上下文信息**:
  - 传输器是日志系统的输出组件，负责将日志写入目标位置
  - 传输器实现LogTransport接口，将被DefaultLogger使用
  - 不同传输器针对不同的输出目标，如控制台、文件、网络等
  - 异步传输器是提高性能的关键组件，尤其在高频日志记录场景
  
- **规范索引**:
  - [编码规范](../../../../rules/develop/coding-standards.md)
  - [错误处理规范](../../../../rules/develop/error-handling.md)
  - [性能优化规范](../../../../rules/develop/performance.md)

- **注意事项**:
  - 传输器必须处理写入目标时可能出现的错误
  - 异步传输器需要确保应用退出前刷新所有日志
  - 文件传输器需要处理文件系统权限、异常等问题
  - 控制台输出应根据日志级别使用不同的控制台方法

**实现指导(I)**:
- **算法与流程**:
  - BaseTransport基本流程:
    1. 接收LogEntry对象
    2. 使用格式化器将日志条目转换为字符串（如果有）
    3. 调用抽象的writeEntry方法将字符串写入目标位置
    4. 处理过程中的错误
  
  - ConsoleTransport流程:
    1. 根据日志级别选择适当的控制台方法（debug、info、warn、error）
    2. 使用所选方法输出格式化的日志
    
  - AsyncConsoleTransport流程:
    1. 将日志条目添加到内存队列
    2. 如果是第一条日志，设置定时器以定期刷新队列
    3. 定时或手动刷新队列时，批量处理日志条目
    4. 使用控制台方法输出处理后的日志
    
  - FileTransport流程:
    1. 打开文件流（如果尚未打开）
    2. 将格式化的日志写入文件
    3. 处理文件操作错误
    4. 适当时关闭文件流

- **技术选型**:
  - 使用node:fs模块处理文件操作（推荐使用fs.promises）
  - 使用setTimeout/setInterval实现异步刷新
  - 使用简单数组队列存储待处理的日志条目
  
- **代码模式**:
  - 使用模板方法模式设计BaseTransport
  - 使用策略模式处理不同级别的日志输出
  - 使用队列模式实现异步处理
  - 示例代码片段:
  ```typescript
  /**
   * 基础传输器抽象类，提供通用功能
   */
  export abstract class BaseTransport implements LogTransport {
    protected formatter?: LogFormatter;
    
    constructor(formatter?: LogFormatter) {
      this.formatter = formatter;
    }
    
    public write(entry: LogEntry): void {
      try {
        // 使用格式化器将日志条目转换为字符串
        let formatted: string;
        if (this.formatter) {
          formatted = this.formatter.format(entry);
        } else {
          formatted = `[${LogLevel[entry.level]}] ${entry.message}`;
        }
        
        // 调用子类实现的writeEntry方法
        this.writeEntry(entry, formatted);
      } catch (err) {
        // 处理错误，避免传输器问题影响应用程序
        console.error(`日志传输失败: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    /**
     * 抽象方法，由子类实现将格式化后的日志写入目标位置
     */
    protected abstract writeEntry(entry: LogEntry, formatted: string): void;
  }
  ```
  
  ```typescript
  /**
   * 控制台传输器，将日志输出到控制台
   */
  export class ConsoleTransport extends BaseTransport {
    protected writeEntry(entry: LogEntry, formatted: string): void {
      // 根据日志级别选择适当的控制台方法
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(formatted);
          break;
        default:
          console.log(formatted);
      }
    }
  }
  ```
  
  ```typescript
  /**
   * 异步控制台传输器，将日志异步输出到控制台
   */
  export class AsyncConsoleTransport extends BaseTransport {
    private queue: LogEntry[] = [];
    private isProcessing: boolean = false;
    private flushInterval: number;
    
    constructor(flushIntervalMs: number = 1000, formatter?: LogFormatter) {
      super(formatter);
      this.flushInterval = flushIntervalMs;
    }
    
    protected writeEntry(entry: LogEntry, formatted: string): void {
      // 添加到队列
      this.queue.push(entry);
      
      // 如果不在处理中，启动定时器
      if (!this.isProcessing) {
        this.isProcessing = true;
        setTimeout(() => this.flush(), this.flushInterval);
      }
    }
    
    /**
     * 刷新日志队列
     * @param sync 是否同步刷新
     */
    public async flush(sync: boolean = false): Promise<void> {
      if (this.queue.length === 0) {
        this.isProcessing = false;
        return;
      }
      
      // 复制并清空队列
      const entries = [...this.queue];
      this.queue = [];
      
      // 处理队列中的每条日志
      for (const entry of entries) {
        try {
          // 使用控制台传输器处理单条日志
          const consoleTransport = new ConsoleTransport(this.formatter);
          consoleTransport.write(entry);
        } catch (err) {
          console.error(`异步日志处理失败: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
      
      // 如果队列为空或同步模式，立即结束处理
      if (this.queue.length === 0 || sync) {
        this.isProcessing = false;
      } else {
        // 否则继续设置定时器处理新添加的日志
        setTimeout(() => this.flush(), this.flushInterval);
      }
    }
  }
  ```
  
  ```typescript
  /**
   * 文件传输器，将日志写入文件
   */
  export class FileTransport extends BaseTransport {
    private filePath: string;
    private writeStream?: fs.WriteStream;
    
    constructor(filePath: string, formatter?: LogFormatter) {
      super(formatter);
      this.filePath = filePath;
    }
    
    protected writeEntry(entry: LogEntry, formatted: string): void {
      try {
        // 确保写入流已创建
        if (!this.writeStream) {
          this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' });
          
          // 处理流错误
          this.writeStream.on('error', (err) => {
            console.error(`文件日志写入错误: ${err.message}`);
            this.writeStream = undefined;
          });
        }
        
        // 写入日志并添加换行符
        this.writeStream.write(formatted + '\n');
      } catch (err) {
        console.error(`文件日志传输失败: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    /**
     * 关闭文件写入流
     */
    public close(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (!this.writeStream) {
          resolve();
          return;
        }
        
        this.writeStream.end(() => {
          this.writeStream = undefined;
          resolve();
        });
        
        this.writeStream.on('error', reject);
      });
    }
  }
  ```
  
- **实现策略**:
  1. 先实现BaseTransport抽象类，提供通用功能
  2. 实现ConsoleTransport，支持基本的控制台输出
  3. 实现AsyncConsoleTransport，支持异步批处理
  4. 实现FileTransport，支持文件输出
  5. 确保所有传输器都有妥善的错误处理和资源清理

**成功标准(S)**:
- **基础达标**:
  - ConsoleTransport单元测试通过:
    - UT-CONTR-01: write应使用console.debug输出DEBUG级别日志
    - UT-CONTR-02: write应使用console.info输出INFO级别日志
    - UT-CONTR-03: write应使用console.warn输出WARN级别日志
    - UT-CONTR-04: write应使用console.error输出ERROR级别日志
    - UT-CONTR-05: write应使用console.error输出FATAL级别日志
    - UT-CONTR-06: write应使用formatter格式化日志
  - 反向测试通过:
    - UT-CONTR-NEG-01: write应处理格式化器抛出的错误
    - UT-CONTR-NEG-02: write应处理console方法抛出的错误
  - AsyncConsoleTransport单元测试通过:
    - UT-ASYNCT-01: write应将日志添加到队列
    - UT-ASYNCT-02: write应在第一次添加日志时设置flush定时器
    - UT-ASYNCT-03: flush应处理队列中的所有日志
    - UT-ASYNCT-04: flush应在同步模式下同步处理日志
    - UT-ASYNCT-05: flush应清空队列
  - 反向测试通过:
    - UT-ASYNCT-NEG-01: flush应处理处理日志时的错误
    - UT-ASYNCT-NEG-02: 构造函数应使用默认间隔时间
  
- **预期品质**:
  - 所有传输器遵循TypeScript最佳实践
  - 具有完整的JSDoc注释和类型声明
  - 实现健壮的错误处理，确保传输问题不影响应用程序
  - 资源使用高效，尤其是文件句柄等有限资源
  
- **卓越表现**:
  - 优化异步传输器的性能，减少CPU和内存占用
  - 提供优雅关闭机制，确保应用退出前所有日志都已写入
  - 为文件传输器提供自动日志轮转功能 
