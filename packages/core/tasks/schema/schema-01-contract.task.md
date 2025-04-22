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
  * 我将执行`pnpm build`确保构建成功
  * 我将确认没有error级别的lint错误
  * 在验证通过后，我将明确声明："自我验证完成，所有测试通过，构建成功"
- 他验证：
  * 我将通过代码提交触发.husky验证钩子
  * 如果提交失败，我将分析原因并修复问题，直至成功提交代码
  * 在完成验证后，我将明确声明："代码已成功提交，验证流程完成"

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## 任务: schema-01-contract: 实现 Schema 模块骨架并满足契约测试

**目标(O)**:
- 基于 `schema-00-setup` 创建的骨架，填充 `api/schema.ts`, `core/schema/schemaService.ts`, `core/schema/Schema.ts` 的函数/方法签名和基础类结构。
- 确保 `types/ProcessedSchema.ts` 和 `types/SchemaError.ts` 中的类型定义准确无误。
- 使所有 Schema 模块相关的**契约测试** (`CT-API-*`, `CT-Type-*`) 通过。
- **任务边界**: 本任务**不**要求实现核心的验证逻辑（`Schema.validate` 的复杂部分）或错误收集逻辑 (`Schema.collectErrors`)。重点在于接口签名、类型结构和基础的函数/类连接。

**环境(E)**:
- **代码相关**:
  - **依赖**: 本任务依赖 `schema-00-setup.task.md` 的完成。
  - **需要修改的文件**:
    - `packages/core/src/types/ProcessedSchema.ts`: 确认接口定义准确。
    - `packages/core/src/types/SchemaError.ts`: 确认接口定义准确。
    - `packages/core/src/core/schema/Schema.ts`: 填充 `Schema` 类的构造函数（如果需要）和 `validate`, `collectErrors` 方法的**签名**及**基础占位实现** (例如，`validate` 返回 `true`, `collectErrors` 返回 `[]`)。
    - `packages/core/src/core/schema/schemaService.ts`: 填充 `processSchema` 函数的**签名**和**基础占位实现** (例如，创建 `Schema` 实例并调用其占位方法，返回一个符合 `ProcessedSchema` 结构的占位对象)。
    - `packages/core/src/api/schema.ts`: 确认导出语句正确。
  - **需要引用**:
    - `packages/core/docs/develop/Schema-Develop-Design.md` - 获取准确的类/函数/方法签名和结构。
    - `packages/core/docs/develop/Schema-Testcase-Design.md` - 获取契约测试用例的 ID 和目标。
- **测试相关**:
  - **目标测试文件**: 
    - `packages/core/src/__tests__/contract/api/schemaApi.contract.test.ts`
    - `packages/core/src/__tests__/contract/types/processedSchema.contract.test.ts`
    - `packages/core/src/__tests__/contract/types/schemaError.contract.test.ts`
  - **目标通过用例**: 所有标记为 `CT-API-Schema-*`, `CT-Type-ProcSchema-*`, `CT-Type-SchError-*` 的测试用例。
  - **测试期望**: 契约测试主要验证函数签名、参数类型、返回值结构和类型定义的稳定性。占位实现应足以满足这些结构性检查。
- **实现要点**:
  - 仔细核对 `Schema-Develop-Design.md` 中的 UML，确保所有签名（包括泛型 `<T extends object>` 等）都准确无误。
  - `schemaService.processSchema` 的占位实现需要创建一个 `Schema` 实例，并调用其（同样是占位的）`validate` 和 `collectErrors` 方法，然后组装一个符合 `ProcessedSchema<T>` 接口的占位返回值。
  - `Schema.validate` 的占位实现可以直接返回 `true`。
  - `Schema.collectErrors` 的占位实现可以直接返回 `[]`。
- **注意事项**:
  - 占位实现不需要任何实际逻辑，只需保证类型正确和结构符合即可通过契约测试。
  - 关注点是接口和类型的对外"形状"是否正确。

**成功标准(S)**:
- **基础达标**:
  - **所有 Schema 相关的契约测试 (`CT-API-*`, `CT-Type-*`) 通过**。
  - 实现文件 (`Schema.ts`, `schemaService.ts`, `api/schema.ts`) 包含与设计文档一致的、带有基础占位实现的函数/方法签名和类结构。
  - 项目能够成功编译 (`pnpm build` 成功)。
  - 注意：单元测试、集成测试和 E2E 测试预计仍然会失败。
- **预期品质**:
  - 代码骨架清晰，签名准确。
  - 代码符合项目编码规范和 ESLint 规则。
- **卓越表现 (可选)**:
  - 为所有填充的签名和占位实现添加清晰的 JSDoc 注释。 