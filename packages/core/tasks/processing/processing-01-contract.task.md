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
  * 我将执行`pnpm test`确保所有测试通过
  * 我将确认没有error级别的lint错误, 可以使用 pnpm lint --fix 快捷修复
  * 在验证通过后，我将明确声明："自我验证完成，所有测试通过，构建成功"
- 他验证：
  * 我将通过代码提交触发.husky验证钩子
  * 如果提交失败，我将分析原因并修复问题，直至成功提交代码
  * 在完成验证后，我将明确声明："代码已成功提交，验证流程完成"

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## Processing模块契约实现

**目标(O)**:
- 实现处理模块的所有类型定义，确保符合Types层设计规则
- 创建API层的处理接口，委托至Core层实现
- 编写并通过所有契约测试，验证类型和API的稳定性
- 为后续实现提供良好的类型基础设施

**环境(E)**:
- **前置任务**:
  - `processing-00-setup.task.md` - 已创建基础目录结构和文件骨架

- **测试用例**:
  - `packages/core/src/__tests__/contract/api/processing.contract.test.ts`:
    - CT-API-PROC-01: `processDocument` API 应维持类型签名
    - CT-API-PROC-02: `processDocument` API 应返回符合 ProcessingResult 接口的结果
    - CT-API-PROC-03: `processDocument` API 应支持自定义结果类型
  
  - `packages/core/src/__tests__/contract/types/ProcessingResult.contract.test.ts`:
    - CT-TYPE-PRES-01: ProcessingResult 接口应维持结构稳定性
    - CT-TYPE-PRES-02: ProcessingResult 接口应支持扩展
  
  - `packages/core/src/__tests__/contract/types/ValidationResult.contract.test.ts`:
    - CT-TYPE-VRES-01: ValidationResult 接口应维持结构稳定性
    - CT-TYPE-VRES-02: ValidationResult 应包含 ReadonlyArray 错误和警告
  
  - `packages/core/src/__tests__/contract/types/ReferenceMap.contract.test.ts`:
    - CT-TYPE-REFMAP-01: ReferenceMap 接口应维持结构稳定性
    - CT-TYPE-REFMAP-02: ReferenceMap.idMap 应为 ReadonlyMap 类型

- **文件实现要点**:
  - **Types层**:
    - `ProcessingResult.ts`: 定义处理结果接口，支持泛型扩展
    - `ProcessingContext.ts`: 定义处理上下文接口
    - `ValidationResult.ts`: 定义验证结果接口，包含错误和警告
    - `ReferenceMap.ts`: 定义引用映射接口
    - `ProcessingError.ts`: 定义处理错误接口
    - `ProcessingWarning.ts`: 定义处理警告接口
  
  - **API层**:
    - `processing.ts`: 定义处理API接口，委托至服务层

- **注意事项**:
  - 所有接口必须使用 `readonly` 修饰符确保不可变性
  - 集合类型必须使用 `ReadonlyArray` 和 `ReadonlyMap`
  - API层应是薄层，仅委托至服务层
  - 错误和警告接口需要包含严重程度区分（'error'和'warning'）
  - 处理结果需要支持自定义扩展

**成功标准(S)**:
- **基础达标**:
  - Types层所有接口实现完整且符合设计规范
  - API层处理接口实现完整，符合API层设计规则
  - 所有契约测试通过，验证接口和API的稳定性
  - 所有类型使用 `readonly` 修饰符确保不可变性
  
- **预期品质**:
  - 所有类型定义有完整的JSDoc注释
  - 类型支持泛型，特别是结果类型的扩展
  - 错误和警告类型设计合理，包含所需的位置信息和严重程度
  - 代码通过TypeScript编译检查，类型安全
  
- **卓越表现**:
  - 类型系统设计考虑了各种边界情况
  - 使用条件类型等高级TypeScript特性增强类型安全
  - 为自定义扩展提供了多种便捷方式 