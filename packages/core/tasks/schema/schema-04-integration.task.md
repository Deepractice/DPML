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
  * 我将确认没有error级别的lint错误
  * 在验证通过后，我将明确声明："自我验证完成，所有测试通过，构建成功"
- 他验证：
  * 我将通过代码提交触发.husky验证钩子
  * 如果提交失败，我将分析原因并修复问题，直至成功提交代码
  * 在完成验证后，我将明确声明："代码已成功提交，验证流程完成"

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## 任务: schema-04-integration: 实现 schemaService 逻辑并通过集成测试

**目标(O)**:
- 在 `core/schema/schemaService.ts` 中实现 `processSchema` 函数的实际逻辑。
- 使 `processSchema` 能够正确地实例化 `Schema` 业务类，调用其 `validate` 和 `collectErrors` 方法。
- 根据 `Schema` 类方法的返回结果，组装并返回符合 `ProcessedSchema<T>` 接口的最终结果对象。
- 使 `schemaService.integration.test.ts` 中所有相关的**集成测试**通过 (`IT-SchemaSvc-*` 用例)。
- **任务边界**: 本任务专注于 `schemaService` 的实现及其与 `Schema` 类的集成。**不**要求端到端测试通过。

**环境(E)**:
- **代码相关**:
  - **依赖**: 本任务依赖 `schema-03-unittests-collectErrors.task.md` 的完成。
  - **需要修改的文件**:
    - `packages/core/src/core/schema/schemaService.ts`: 实现 `processSchema` 函数的逻辑，替换掉之前的占位实现。
  - **需要引用**:
    - `packages/core/src/core/schema/Schema.ts`: 需要导入并实例化 `Schema` 类。
    - `packages/core/src/types/ProcessedSchema.ts`: 需要返回此类型接口的对象。
    - `packages/core/src/types/SchemaError.ts`: 需要处理 `Schema.collectErrors` 返回的此类型数组。
    - `packages/core/docs/develop/Schema-Develop-Design.md`: 参考服务层和业务类的交互逻辑（序列图）。
    - `packages/core/docs/develop/Schema-Testcase-Design.md`: 获取集成测试用例 ID (`IT-SchemaSvc-*`) 和期望行为。
- **测试相关**:
  - **目标测试文件**: `packages/core/src/__tests__/integration/schema/schemaService.integration.test.ts` (需要创建或已有骨架)。
  - **目标通过用例**: 所有标记为 `IT-SchemaSvc-*` 的集成测试用例。
  - **测试期望**: 对于测试用例中的有效和无效 Schema 输入，`schemaService.processSchema()` 应返回正确的 `ProcessedSchema<T>` 对象，包含正确的 `isValid` 状态和（如果无效）正确的 `errors` 数组。
- **实现要点**:
  - 在 `processSchema` 函数内部，首先创建 `Schema` 类的一个实例。
  - 调用 `schemaInstance.validate(schema)`。
  - 如果 `validate` 返回 `true`，则组装并返回 `{ schema: schema, isValid: true }`。
  - 如果 `validate` 返回 `false`，则调用 `schemaInstance.collectErrors(schema)`，然后组装并返回 `{ schema: schema, isValid: false, errors: collectedErrors }`。
  - 确保泛型 `<T extends object, R extends ProcessedSchema<T> = ProcessedSchema<T>>` 被正确处理和传递。
- **注意事项**:
  - 这是将业务逻辑 (Schema 类) 与服务层连接起来的关键集成步骤。
  - 确保 `Schema` 实例的创建和方法调用正确无误。
  - 返回的 `ProcessedSchema` 对象结构必须完全符合接口定义。

**成功标准(S)**:
- **基础达标**:
  - **所有相关的集成测试 (`IT-SchemaSvc-*`) 通过**。
  - `schemaService.processSchema` 方法包含实际的业务逻辑协调实现。
  - 所有先前通过的单元测试 (`UT-Schema-*`) 和契约测试 (`CT-*`) 仍然通过。
  - 项目能够成功编译 (`pnpm build` 成功)。
  - 注意：端到端测试预计仍然会失败。
- **预期品质**:
  - `schemaService` 能正确协调 `Schema` 类，处理有效和无效输入，并返回符合预期的 `ProcessedSchema` 结果。
  - 代码逻辑清晰，符合服务层职责。
  - 代码符合项目编码规范和 ESLint 规则。
- **卓越表现 (可选)**:
  - 为 `processSchema` 函数添加更详细的 JSDoc 注释，说明其协调逻辑。 