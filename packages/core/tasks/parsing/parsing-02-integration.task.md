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
- 我将确保实现满足所有测试要求，不妥协代码质量

**第四步：严格验证流程**
- 根据任务类型确定验证范围：
  * 基础任务：重点验证相关单元测试
  * 集成任务：验证单元测试和集成测试
  * 终结任务：验证所有相关测试并确保代码可提交
- 自我验证：
  * 我将执行`pnpm test`确保相关单元测试和集成测试通过
  * 我将执行`pnpm build`确保构建成功
  * 我将确认没有error级别的lint错误
  * 在验证通过后，我将明确声明："自我验证完成，相关单元测试和集成测试通过，构建成功"
- 他验证：
  * 作为集成任务，代码提交是可选的，但我会尽量使更多测试通过
  * 我理解可能有端到端测试仍未通过，这将在终结任务中解决
  * 在验证关键单元测试和集成测试通过后，我可以声明："集成任务核心功能验证完成"

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

# 解析错误处理增强任务（集成任务）

## 任务: 实现完善的解析错误处理机制

**目标(O)**:
- 设计并实现一套完整的解析错误处理机制，提高错误信息的准确性和可用性
- 实现parsingService.ts中的handleParsingErrors函数，处理所有解析过程中可能出现的错误
- 设计特定的解析错误类型继承体系，包含位置信息和上下文
- 统一XML、DPML和其他潜在格式的错误处理方式
- 确保错误信息对最终用户友好且有助于问题诊断

**环境(E)**:
- **代码相关**:
  - `packages/core/src/core/parsing/parsingService.ts` - 含有handleParsingErrors未实现函数
  - `packages/core/src/core/parsing/XMLAdapter.ts` - 需增强错误传递
  - `packages/core/src/core/parsing/DPMLAdapter.ts` - 需增强错误传递
  - 需创建新文件: `packages/core/src/core/parsing/errors.ts` - 定义错误类型
  
- **测试相关**:
  - `packages/core/src/__tests__/unit/core/parsing/parsingService.test.ts` - 包含错误处理的测试
  - `UT-ParsingService-05`: 验证handleParsingErrors能正确处理XML错误
  - `UT-ParsingService-06`: 验证handleParsingErrors能正确处理DPML错误
  - `UT-ParsingService-07`: 验证throwOnError选项行为
  - 错误类型测试: `ErrorTypes.test.ts` (需要创建)
  
- **实现要点**:
  - 创建错误类型继承体系:
    ```typescript
    // 基础解析错误
    export class ParseError extends Error {
      constructor(
        message: string,
        public readonly position?: XMLPosition,
        public readonly source?: string
      ) {
        super(message);
        this.name = this.constructor.name;
      }
    }
    
    // XML特定错误
    export class XMLParseError extends ParseError { ... }
    
    // DPML特定错误
    export class DPMLParseError extends ParseError { ... }
    ```
  - 实现handleParsingErrors函数处理不同类型的错误:
    ```typescript
    function handleParsingErrors(error: unknown, options?: ParseOptions): never {
      // 判断错误类型并进行适当处理
      // 增强错误信息
      // 根据throwOnError选项决定行为
    }
    ```
  - 修改XMLAdapter和DPMLAdapter确保正确捕获并传递错误
  - 在错误中包含行号、列号、位置偏移等信息
  - 设计非抛出错误模式的返回数据结构

- **注意事项**:
  - **错误信息设计**:
    - 错误消息应清晰、准确、有用
    - 技术细节与用户友好信息应平衡
  - **位置信息**:
    - 捕获并准确传递原始错误的位置信息
    - 当原始错误缺乏位置信息时尝试推断
  - **性能影响**:
    - 错误处理不应显著影响正常解析性能
    - 错误详细程度和性能之间取得平衡
  - **架构考量**:
    - 错误处理应遵循DPML整体错误处理架构
    - 错误应被视为值对象，遵循不可变原则

**成功标准(S)**:
- **基础达标** (必须通过):
  - `parsingService.test.ts`中的错误相关单元测试通过，特别是UT-ParsingService-05到07
  - 解析服务能够正确识别、处理和传递解析错误
  - 实现基本错误类型和handleParsingErrors函数
  - XMLAdapter和DPMLAdapter能正确处理和传递错误
  - 注意：作为集成任务，部分端到端测试可能仍然失败，这将在终结任务中解决
  
- **预期品质**:
  - 错误消息清晰、准确并包含必要的上下文
  - 所有解析错误都能追踪到准确的行号和列号
  - 完善的JSDoc文档说明错误处理机制
  - 相关集成测试通过，特别是错误处理相关的测试
  - 非抛出错误模式正确返回错误信息结构
  
- **卓越表现** (可选):
  - 提供错误恢复机制，在某些非致命错误情况下继续解析
  - 错误信息包含修复建议
  - 为复杂错误情况提供上下文可视化
  - 为错误处理机制编写更全面的单元测试 