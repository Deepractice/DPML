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

## 任务: schema-03-unittests-collectErrors: 实现 Schema.collectErrors 逻辑并通过单元测试

**目标(O)**:
- 在 `core/schema/Schema.ts` 中实现 `collectErrors` 方法的核心逻辑。
- 使 `collectErrors` 能够执行与 `validate` 类似的验证过程，但重点在于收集所有发现的结构性错误。
- 为每个发现的错误生成一个符合 `SchemaError<T>` 接口的对象，包含准确的错误信息 (`message`)、错误路径 (`path`) 和一个初步的错误代码 (`code`)。
- 使 `Schema.test.ts` 中所有与 `collectErrors` 相关的**单元测试**通过（`UT-Schema-CollErr-*` 用例）。
- **任务边界**: 本任务**只**关注 `collectErrors` 方法的实现和其对应的单元测试。**不**要求集成或端到端测试通过。`validate` 方法的功能应保持不变。

**环境(E)**:
- **代码相关**:
  - **依赖**: 本任务依赖 `schema-02-unittests-validate.task.md` 的完成。
  - **需要修改的文件**:
    - `packages/core/src/core/schema/Schema.ts`: 主要实现 `collectErrors` 方法的逻辑，替换掉之前的占位实现。
  - **需要引用**:
    - `packages/core/src/types/SchemaError.ts`: 需要实例化 `SchemaError` 接口。
    - `packages/core/src/core/schema/types.ts`: 参考内部类型定义以确定验证点。
    - `packages/core/docs/develop/Schema-Testcase-Design.md`: 获取 `collectErrors` 方法的单元测试用例 ID (`UT-Schema-CollErr-*`) 和期望的错误输出（尤其是路径和数量）。
    - （可选）`Schema.validate` 的实现逻辑可以作为参考或复用基础。
- **测试相关**:
  - **目标测试文件**: `packages/core/src/__tests__/unit/schema/Schema.test.ts`
  - **目标通过用例**: 所有标记为 `UT-Schema-CollErr-*` 的单元测试用例。
  - **测试期望**: 对于测试用例中定义的无效 Schema 输入，`Schema.collectErrors()` 应返回一个包含一个或多个 `SchemaError` 对象的数组，每个对象的 `message`, `code`, `path` 符合预期。对于有效输入，应返回空数组 `[]`。
- **实现要点**:
  - `collectErrors` 需要一个递归或迭代的机制来遍历 Schema 对象。
  - 在遍历过程中需要维护当前的路径信息（例如，使用数组 `['attributes', 0, 'name']` 或字符串 `'attributes[0].name'`）。
  - 当检测到验证失败时（基于 `schema-02` 中实现的逻辑），创建一个 `SchemaError` 对象，填充 `message`, `path`, 和一个临时的 `code` (例如 `'VALIDATION_ERROR'`)。
  - 将所有生成的 `SchemaError` 对象收集到一个数组中并返回。
  - 需要处理与 `validate` 相同的结构：`element`, `attributes`, `content`, `children`, `$ref`, `DocumentSchema` 等。
- **注意事项**:
  - 错误路径 (`path`) 的准确性非常重要。
  - 错误信息 (`message`) 应清晰描述问题所在。
  - `collectErrors` 应该收集 *所有* 错误，而不是在找到第一个错误时就停止。
  - `validate` 方法的功能不应被此任务破坏。

**成功标准(S)**:
- **基础达标**:
  - **所有与 `collectErrors` 相关的单元测试 (`UT-Schema-CollErr-*`) 通过**。
  - `Schema.collectErrors` 方法包含实际的错误收集逻辑，不再是占位实现。
  - `validate` 方法相关的单元测试仍然通过。
  - 项目能够成功编译 (`pnpm build` 成功)。
  - 注意：集成和端到端测试预计仍然会失败。
- **预期品质**:
  - `collectErrors` 能准确识别并报告测试用例中定义的各种结构错误。
  - 生成的 `SchemaError` 对象包含准确的 `message`, `code`, 和 `path`。
  - 代码符合项目编码规范和 ESLint 规则。
- **卓越表现 (可选)**:
  - 实现一个健壮且可复用的路径跟踪机制。
  - 定义更具体的错误代码（例如 `'MISSING_REQUIRED_PROPERTY'`, `'INVALID_TYPE'`）并应用于生成的错误。

</rewritten_file> 