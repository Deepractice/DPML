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

## 多传输器支持任务（集成任务）

**目标(O)**:
- **功能目标**:
  - 实现复合传输器组件MultiTransport
  - 支持将日志同时发送到多个传输目标
  - 实现简单的过滤机制，按日志级别过滤不同传输器
  - 确保一个传输器的错误不影响其他传输器的工作
  - 提供便捷的API创建复合传输器
  
- **执行任务**:
  - 创建文件:
    - `packages/core/src/core/logging/transports/MultiTransport.ts` - 实现复合传输器组件
    - 更新 `packages/core/src/api/logging.ts` - 添加复合传输器工厂函数
  - 实现功能:
    - 实现MultiTransport类，支持多个内部传输器
    - 实现`addTransport`方法添加新传输器
    - 实现`removeTransport`方法移除传输器
    - 实现`setFilter`方法设置传输器过滤条件
    - 实现`write`方法，将日志分发到所有传输器
    - 添加API层`createMultiTransport`工厂函数

- **任务边界**:
  - 任务集中在实现复合传输器功能
  - 只修改与复合传输器直接相关的代码
  - 不修改其他传输器或日志组件的核心功能
  - 确保与现有功能兼容和无冲突


**环境(E)**:
- **参考资源**:
  - `packages/core/src/types/log.ts` - 日志类型定义（第一个任务的输出）
  - `packages/core/src/core/logging/transports/BaseTransport.ts` - 基础传输器（第四个任务的输出）
  - `packages/core/src/api/logging.ts` - 日志API（第七个任务的输出）
  - `packages/core/docs/product/Logger-Design.md` - 日志模块设计文档
  - `packages/core/docs/develop/Logger-Testcase-Design.md` - 日志模块测试用例设计
  - `packages/core/src/__tests__/unit/core/logging/transports/MultiTransport.test.ts` - 复合传输器单元测试
  - `packages/core/src/__tests__/integration/logging/multiTransportIntegration.test.ts` - 复合传输器集成测试
  
- **上下文信息**:
  - 复合传输器是实现高级日志路由功能的关键组件
  - 需要支持同时输出到多个目标，如控制台+文件
  - 需要支持每个传输器的独立配置和过滤
  - 需要确保一个传输器失败不影响整体日志功能
  
- **规范索引**:
  - [编码规范](../../../../rules/develop/coding-standards.md)
  - [组合模式规范](../../../../rules/develop/design-patterns.md)
  - [错误处理规范](../../../../rules/develop/error-handling.md)

- **注意事项**:
  - 复合传输器必须处理各个子传输器可能抛出的错误
  - 过滤规则应当简单明了，避免过度复杂的配置
  - 需要考虑添加和移除传输器的同步性
  - API接口设计应保持与其他传输器工厂函数的一致性

**实现指导(I)**:
- **算法与流程**:
  - 日志分发流程:
    1. 接收LogEntry对象
    2. 遍历所有内部传输器
    3. 对每个传输器应用过滤规则检查
    4. 通过过滤的传输器执行写入操作
    5. 处理每个传输器可能抛出的错误
    
  - 传输器管理流程:
    1. 接收传输器对象和可选名称
    2. 将传输器添加到内部Map中
    3. 关联过滤规则（如果有）
    4. 处理添加/移除操作

- **技术选型**:
  - 使用组合设计模式（Composite Pattern）
  - 使用Map存储传输器集合
  - 使用过滤器模式（Filter Pattern）
  
- **代码模式**:
  - 使用组合模式，将多个传输器组合为一个
  - 使用过滤器模式，按条件过滤日志
  - 示例代码片段:
  ```typescript
  /**
   * 传输器过滤配置
   */
  export interface TransportFilter {
    minLevel?: LogLevel;
    maxLevel?: LogLevel;
    levels?: LogLevel[];
  }
  
  /**
   * 复合传输器，将日志发送到多个目标
   */
  export class MultiTransport extends BaseTransport {
    private transports: Map<string, LogTransport> = new Map();
    private filters: Map<string, TransportFilter> = new Map();
    
    /**
     * 添加传输器
     * @param transport 传输器实例
     * @param name 传输器名称，默认使用自动生成的唯一ID
     * @returns 传输器名称
     */
    public addTransport(transport: LogTransport, name?: string): string {
      const transportId = name || `transport-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.transports.set(transportId, transport);
      return transportId;
    }
    
    /**
     * 移除传输器
     * @param name 传输器名称
     * @returns 是否成功移除
     */
    public removeTransport(name: string): boolean {
      const removed = this.transports.delete(name);
      this.filters.delete(name);
      return removed;
    }
    
    /**
     * 设置传输器过滤条件
     * @param name 传输器名称
     * @param filter 过滤条件
     */
    public setFilter(name: string, filter: TransportFilter): void {
      if (this.transports.has(name)) {
        this.filters.set(name, filter);
      } else {
        throw new Error(`传输器 "${name}" 不存在`);
      }
    }
    
    /**
     * 将日志写入所有传输器
     * @param entry 日志条目
     */
    protected writeEntry(entry: LogEntry, formatted: string): void {
      for (const [name, transport] of this.transports.entries()) {
        try {
          // 应用过滤规则
          if (this.shouldPass(name, entry)) {
            transport.write(entry);
          }
        } catch (err) {
          // 处理单个传输器的错误，不影响其他传输器
          console.error(`传输器 "${name}" 写入失败: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
    
    /**
     * 判断日志是否应该通过过滤
     * @param name 传输器名称
     * @param entry 日志条目
     * @returns 是否通过过滤
     */
    private shouldPass(name: string, entry: LogEntry): boolean {
      const filter = this.filters.get(name);
      if (!filter) {
        return true; // 没有过滤器，默认通过
      }
      
      const { minLevel, maxLevel, levels } = filter;
      
      // 检查具体级别列表
      if (levels && levels.length > 0) {
        return levels.includes(entry.level);
      }
      
      // 检查最小级别
      if (minLevel !== undefined && entry.level < minLevel) {
        return false;
      }
      
      // 检查最大级别
      if (maxLevel !== undefined && entry.level > maxLevel) {
        return false;
      }
      
      return true;
    }
  }
  ```
  
  ```typescript
  // 在api/logging.ts中添加
  /**
   * 创建复合传输器
   * @param transports 初始传输器列表
   * @returns MultiTransport实例
   * @example
   * ```typescript
   * // 创建复合传输器，同时输出到控制台和文件
   * const multiTransport = createMultiTransport([
   *   { transport: createConsoleTransport() },
   *   { 
   *     transport: createFileTransport('/logs/errors.log'),
   *     filter: { minLevel: LogLevel.ERROR }
   *   }
   * ]);
   * ```
   */
  export function createMultiTransport(
    transports: Array<{
      transport: LogTransport;
      name?: string;
      filter?: TransportFilter;
    }>
  ): MultiTransport {
    const multiTransport = new MultiTransport();
    
    for (const { transport, name, filter } of transports) {
      const transportId = multiTransport.addTransport(transport, name);
      
      if (filter) {
        multiTransport.setFilter(transportId, filter);
      }
    }
    
    return multiTransport;
  }
  
  // 导出新增类型
  export { TransportFilter } from '../core/logging/transports/MultiTransport';
  ```
  
- **实现策略**:
  1. 先实现MultiTransport的基本结构
  2. 实现传输器添加和移除功能
  3. 实现过滤规则机制
  4. 实现write方法的分发和错误处理
  5. 添加API层工厂函数
  6. 确保完整的JSDoc文档和类型导出

**成功标准(S)**:
- **基础达标**:
  - 单元测试通过:
    - UT-MULTR-01: addTransport应添加传输器并返回ID
    - UT-MULTR-02: removeTransport应移除传输器
    - UT-MULTR-03: setFilter应设置传输器过滤条件
    - UT-MULTR-04: write应将日志发送到所有传输器
    - UT-MULTR-05: write应根据过滤规则过滤日志
  - 反向测试通过:
    - UT-MULTR-NEG-01: write应处理传输器抛出的错误
    - UT-MULTR-NEG-02: setFilter应在传输器不存在时抛出错误
  - API测试通过:
    - UT-API-MULTR-01: createMultiTransport应创建复合传输器
    - UT-API-MULTR-02: createMultiTransport应支持初始传输器和过滤器
  - 集成测试通过:
    - IT-MULTR-01: 复合传输器应在真实场景中正常工作
    - IT-MULTR-02: 复合传输器的过滤机制应在集成环境中生效
  
- **预期品质**:
  - 代码遵循TypeScript最佳实践
  - 具有完整的JSDoc注释和类型声明
  - 错误处理完善，确保稳定性
  - API设计直观易用，符合现有设计风格
  
- **卓越表现**:
  - 支持更复杂的过滤规则，如基于消息内容的过滤
  - 提供传输器启用/禁用功能，而不需要移除
  - 优化内部实现，提高大量传输器时的性能 
