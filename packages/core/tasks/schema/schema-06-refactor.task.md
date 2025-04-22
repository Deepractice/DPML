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

## 任务: schema-06-refactor: 修正Schema模块架构，正确区分Meta和Schema

**目标(O)**:
- 修正当前Schema模块实现，建立正确的架构关系：Meta作为验证规则，Schema作为用户接口
- 创建用户友好的Schema接口，不包含内部实现细节（如metaType字段）
- 修改当前示例代码和文档，使其符合设计文档中的架构设计
- 确保区分"Meta是核心开发者定义的元模型，用于验证Schema"和"Schema是应用开发者创建的，描述DPML文档结构"
- **任务边界**: 本任务专注于架构调整和接口清理，不涉及核心验证逻辑的变更

**环境(E)**:
- **代码相关**:
  - **依赖**: 本任务依赖schema-05任务的完成
  - **需要新建的文件**:
    - `packages/core/src/types/Schema.ts`: 定义用户友好的Schema接口（不含Meta相关的内部字段）
  - **需要修改的文件**:
    - `packages/core/src/core/schema/Schema.ts`: 调整实现，确保使用Meta规则验证用户Schema
    - `packages/core/src/core/schema/schemaService.ts`: 修改processSchema流程，接收用户Schema
    - `packages/core/src/core/schema/types.ts`: 确保Meta类型正确定义为验证规则
    - `packages/core/examples/schema-usage.ts`: 更新示例代码，使用正确的用户Schema接口
    - `packages/core/docs/examples/schema-examples.md`: 更新示例文档
  - **需要引用**:
    - `packages/core/docs/product/Schema-Design.md`: 理解正确的Schema架构设计
    
- **测试相关**:
  - **需要通过的测试**: 所有当前已通过的测试，重构后不应引入新的测试失败
  
- **实现要点**:
  - 定义用户友好的Schema接口：
    ```typescript
    // 用户接口不应包含metaType等内部实现字段
    export interface AttributeSchema {
      name: string;
      type?: string;
      required?: boolean;
      enum?: string[];
    }

    export interface ElementSchema {
      element: string;
      attributes?: AttributeSchema[];
      content?: ContentSchema;
      children?: ChildrenSchema;
    }

    export interface DocumentSchema {
      root: ElementSchema | { $ref: string } | string;
      types?: ElementSchema[];
      globalAttributes?: AttributeSchema[];
    }
    ```
  - 明确内部Meta类型作为验证规则：
    ```typescript
    // Meta作为验证规则，而非用户提交的数据结构
    interface Meta {
      metaType: string;
      validator?: <T extends Meta>(this: T) => boolean;
    }
    ```
  - 修改Schema类中的验证逻辑，使用Meta规则验证用户Schema：
    ```typescript
    validate<T extends object>(schema: T): boolean {
      // 使用内部的Meta规则验证用户的Schema对象
      // 无需将Schema转换为Meta对象
    }
    ```
  
- **注意事项**:
  - 这是架构层面的重要修正，需确保与设计文档的一致性
  - 保持对用户接口的向后兼容性
  - 重点关注Schema模块的正确分层：Meta(验证规则) → Schema(用户接口) → DPML文档(最终内容)
  - 修改需谨慎，确保所有已通过的测试在重构后仍能通过

**成功标准(S)**:
- **基础达标**:
  - 创建了用户友好的Schema接口，不包含内部实现细节如`metaType`
  - 正确区分了Meta(验证规则)和Schema(用户接口)的关系
  - 修改了相关示例代码和文档，使其符合设计文档中的架构
  - 所有已通过的测试在重构后仍然通过
  - 项目能成功编译 (`pnpm build` 成功)
  
- **预期品质**:
  - 明确区分了Meta(内部验证规则)和Schema(面向用户API)的边界
  - 用户API更加直观友好
  - 重构后的架构与Schema-Design.md文档一致
  - 代码符合项目编码规范
  - 所有示例都使用正确的用户Schema接口
  
- **卓越表现 (可选)**:
  - 添加了详细的Schema接口文档和使用说明
  - 编写了额外的单元测试验证用户Schema接口
  - 提供了更多实用示例，帮助用户理解如何使用Schema接口 