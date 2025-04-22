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

## 任务: schema-00-setup: 创建 Schema 模块基础结构和类型定义

**目标(O)**:
- 创建 Schema 模块所需的基础目录结构。
- 创建并定义 Schema 模块所需的**外部类型**文件和接口骨架 (`types/ProcessedSchema.ts`, `types/SchemaError.ts`)。
- 创建并定义 Schema 模块所需的**内部类型**文件和接口骨架 (`core/schema/types.ts`)。
- 创建 Schema 模块的**实现文件骨架** (`core/schema/Schema.ts`, `core/schema/schemaService.ts`, `api/schema.ts`)。
- 创建 Schema 模块的**主要测试文件骨架** (`__tests__/unit/schema/Schema.test.ts`, `__tests__/contract/api/schemaApi.contract.test.ts`, `__tests__/contract/types/processedSchema.contract.test.ts`, `__tests__/contract/types/schemaError.contract.test.ts`)。
- **任务边界**: 本任务**不**涉及任何具体的实现逻辑或测试逻辑，仅关注文件、目录创建和类型/接口/类的骨架定义。

**环境(E)**:
- **代码相关**:
  - **需要创建的目录**:
    - `packages/core/src/core/schema/`
    - `packages/core/src/api/` (如果尚不存在)
    - `packages/core/src/types/` (如果尚不存在)
    - `packages/core/src/__tests__/unit/schema/`
    - `packages/core/src/__tests__/contract/api/`
    - `packages/core/src/__tests__/contract/types/`
    - `packages/core/src/__tests__/integration/schema/` (可选，为后续任务准备)
    - `packages/core/src/__tests__/e2e/schema/` (可选，为后续任务准备)
  - **需要创建的文件和内容骨架**:
    - `packages/core/src/types/ProcessedSchema.ts`: 定义 `ProcessedSchema<T>` 接口骨架。
    - `packages/core/src/types/SchemaError.ts`: 定义 `SchemaError<T>` 接口骨架。
    - `packages/core/src/core/schema/types.ts`: 定义 `Meta`, `TypeReference`, `DocumentMeta`, `ElementMeta`, `AttributeMeta`, `ChildrenMeta`, `ContentMeta` 接口骨架。
    - `packages/core/src/core/schema/Schema.ts`: 定义空的 `Schema` 类骨架 (`export class Schema {}`)。
    - `packages/core/src/core/schema/schemaService.ts`: 定义空的 `processSchema` 函数骨架 (`export function processSchema() {}`)。
    - `packages/core/src/api/schema.ts`: 定义导出 `schemaService.processSchema` 的骨架 (`export { processSchema } from '../core/schema/schemaService';`)。
    - `packages/core/src/__tests__/unit/schema/Schema.test.ts`: 定义空的 `describe` 块。
    - `packages/core/src/__tests__/contract/api/schemaApi.contract.test.ts`: 定义空的 `describe` 块。
    - `packages/core/src/__tests__/contract/types/processedSchema.contract.test.ts`: 定义空的 `describe` 块。
    - `packages/core/src/__tests__/contract/types/schemaError.contract.test.ts`: 定义空的 `describe` 块。
  - **需要引用**:
    - `packages/core/docs/develop/Schema-Develop-Design.md` - 获取类型和接口定义。
    - `rules/architecture/` - 确保目录结构符合架构规则。
    - `rules/architecture/test-case-design.md` - 确保测试文件命名和位置符合规范。
- **测试相关**:
  - 本任务**不**要求任何测试通过。
- **实现要点**:
  - 确保所有接口和类型定义与 `Schema-Develop-Design.md` 中的 UML 和描述一致（仅需骨架）。
  - 文件和目录命名需严格遵守规范。
  - 确保基本的导出和导入语句正确，以避免编译错误。
- **注意事项**:
  - 这是纯粹的基础设施搭建任务。
  - 重点是结构正确性和编译通过。

**成功标准(S)**:
- **基础达标**:
  - **所有指定的核心目录和文件被成功创建**。
  - **类型文件 (`types/*.ts`, `core/schema/types.ts`) 包含与设计文档一致的接口/类型骨架定义**。
  - **实现文件 (`Schema.ts`, `schemaService.ts`, `api/schema.ts`) 包含基本的类/函数/导出骨架**。
  - **测试文件 (`*.test.ts`) 包含基本的 `describe` 骨架**。
  - **项目能够成功编译 (`pnpm build` 或等效命令成功执行，无编译错误)**。
- **预期品质**:
  - 文件和目录结构完全符合项目规范。
  - 类型骨架定义清晰、准确。
  - 代码符合基本的 ESLint 规则。
- **卓越表现 (可选)**:
  - 为所有创建的类型/接口/类/函数骨架添加基础的 JSDoc 注释。 