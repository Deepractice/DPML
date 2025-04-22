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

## 任务: schema-02-unittests-validate: 实现 Schema.validate 核心逻辑并通过单元测试

**目标(O)**:
- 在 `core/schema/Schema.ts` 中实现 `validate` 方法的核心逻辑。
- 使 `validate` 能够根据内部 Meta 规则（隐式地，基于逻辑实现）验证 `ElementSchema` 和 `DocumentSchema` 的结构，包括 `element`, `attributes`, `content`, `children`, `$ref` (基础引用) 以及文档级别的 `types`, `root`。
- 使 `Schema.test.ts` 中所有与 `validate` 相关的**单元测试**通过（包括正面 `UT-Schema-Val-*` 和负面 `UT-Schema-ValNeg-*` 用例）。
- **任务边界**: 本任务**只**关注 `validate` 方法的实现和其对应的单元测试。**不**涉及 `collectErrors` 方法的实现，也**不**要求集成或端到端测试通过。

**环境(E)**:
- **代码相关**:
  - **依赖**: 本任务依赖 `schema-01-contract.task.md` 的完成。
  - **需要修改的文件**:
    - `packages/core/src/core/schema/Schema.ts`: 主要修改 `validate` 方法的实现，替换掉之前的占位逻辑。
  - **需要引用**:
    - `packages/core/src/core/schema/types.ts`: 需要理解 `ElementMeta`, `DocumentMeta`, `AttributeMeta` 等接口定义，以实现正确的验证逻辑。
    - `packages/core/docs/product/Schema-Design.md`: 理解 Schema 设计的目标和类型引用机制。
    - `packages/core/docs/develop/Schema-Develop-Design.md`: 参考 UML 和序列图。
    - `packages/core/docs/develop/Schema-Testcase-Design.md`: 获取 `validate` 方法的单元测试用例 ID 和目标。
- **测试相关**:
  - **目标测试文件**: `packages/core/src/__tests__/unit/schema/Schema.test.ts`
  - **目标通过用例**: 所有标记为 `UT-Schema-Val-*` 和 `UT-Schema-ValNeg-*` 的单元测试用例。
  - **测试期望**: 对于测试用例中定义的各种有效和无效 Schema 输入，`Schema.validate()` 应返回 `true` 或 `false`。
- **实现要点**:
  - `validate` 方法需要递归地检查 Schema 对象的结构。
  - 需要处理 `attributes` 数组，验证每个属性对象的结构（如 `name` 是否存在）。
  - 需要处理 `content` 对象，验证其内部结构（如 `type` 是否存在）。
  - 需要处理 `children` 对象，验证其 `elements` 数组，并能处理数组中的 `ElementSchema` 或 `TypeReference` (`$ref`)。
  - 对 `$ref` 的处理，现阶段可以简化为仅检查其结构是否为 `{ $ref: string }`，暂不实现完整的类型解析。
  - 需要能够区分处理 `ElementSchema` 和 `DocumentSchema` (可能通过检查 `metaType` 或 `root` 属性)。
  - 实现需要考虑可选属性（如 `attributes?`, `content?`, `children?`）。
- **注意事项**:
  - 这是核心逻辑实现的关键一步。
  - 逻辑需要严谨，覆盖测试用例中定义的各种情况。
  - 暂不考虑复杂的 Meta 规则验证（如 `validator` 函数），重点是结构检查。

**成功标准(S)**:
- **基础达标**:
  - **所有与 `validate` 相关的单元测试 (`UT-Schema-Val-*`, `UT-Schema-ValNeg-*`) 通过**。
  - `Schema.validate` 方法包含实际的验证逻辑，不再是占位实现。
  - 项目能够成功编译 (`pnpm build` 成功)。
  - 注意：`collectErrors` 相关的单元测试以及集成、端到端测试预计仍然会失败。
- **预期品质**:
  - `validate` 方法逻辑清晰、健壮，能正确处理测试用例中的各种有效和无效结构。
  - 代码符合项目编码规范和 ESLint 规则。
- **卓越表现 (可选)**:
  - `validate` 方法的实现具有较好的可读性和可维护性。
  - 添加了充分的内部注释解释复杂的验证逻辑。 