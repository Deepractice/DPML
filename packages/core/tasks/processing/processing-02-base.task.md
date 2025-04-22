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
  * 我将确认没有error级别的lint错误，可以使用 --fix 快速修复
  * 在验证通过后，我将明确声明："自我验证完成，所有测试通过，构建成功"
- 他验证：
  * 我将通过代码提交触发.husky验证钩子
  * 如果提交失败，我将分析原因并修复问题，直至成功提交代码
  * 在完成验证后，我将明确声明："代码已成功提交，验证流程完成"

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## 实现文档验证器(DocumentValidator)类

**目标(O)**:
- 设计并实现`DocumentValidator`类，提供核心文档验证逻辑
- 实现节点递归验证功能，确保文档结构符合Schema定义
- 提供完整的错误和警告收集机制，支持精确的位置信息
- 为验证过程提供类型安全的泛型支持

**环境(E)**:
- **代码相关**:
  - 创建文件: `packages/core/src/core/processing/DocumentValidator.ts`
  - 相关类型定义: 
    - `packages/core/src/types/ValidationResult.ts`
    - `packages/core/src/types/ProcessedSchema.ts`
    - `packages/core/src/types/DPMLDocument.ts`
    - `packages/core/src/types/DPMLNode.ts`
  - 需实现的核心方法:
    ```typescript
    validateDocument<T extends ValidationResult = ValidationResult>(document: DPMLDocument, schema: ProcessedSchema): T
    validateNode(node: DPMLNode, schema: ProcessedSchema): NodeValidationResult
    findSchemaForNode(node: DPMLNode, schema: ProcessedSchema): ElementDefinition | null
    validateAttributes(node: DPMLNode, elementDef: ElementDefinition): AttributeValidationResult
    validateChildren(node: DPMLNode, elementDef: ElementDefinition): ChildrenValidationResult
    validateContent(node: DPMLNode, elementDef: ElementDefinition): ContentValidationResult
    ```

- **测试相关**:
  - 测试文件: `packages/core/src/__tests__/unit/core/processing/DocumentValidator.test.ts`
  - 关键测试用例:
    - UT-DOCVAL-01: 验证符合Schema的文档
    - UT-DOCVAL-02: 验证复杂嵌套结构
    - UT-DOCVAL-03: 验证单个节点
    - UT-DOCVAL-04至06: 验证属性、子元素和内容
    - UT-DOCVAL-NEG-01至07: 验证各种错误情况
    - UT-DOCVAL-ERR-01至04: 验证错误收集功能

- **实现要点**:
  - 采用面向对象设计，将DocumentValidator实现为类
  - 使用递归方式遍历文档树结构
  - 为每个节点查找对应的Schema定义
  - 分别验证节点的标签、属性、子元素和内容
  - 收集并聚合各级验证错误和警告
  - 使用不可变数据结构(ReadonlyArray、ReadonlyMap)确保类型安全

- **注意事项**:
  - 确保位置信息准确，便于IDE定位错误
  - 区分错误(Error)和警告(Warning)的严重程度
  - 采用深度优先的递归策略验证文档树
  - 保持验证逻辑与Schema结构解耦
  - 确保泛型支持，允许自定义验证结果类型

**成功标准(S)**:
- **基础达标**:
  - DocumentValidator类实现所有必要方法
  - 单元测试用例UT-DOCVAL-01至UT-DOCVAL-06通过
  - 能够正确识别并验证基本文档结构
  
- **预期品质**:
  - 所有单元测试通过，包括错误检测和收集测试(UT-DOCVAL-NEG和UT-DOCVAL-ERR系列)
  - 代码符合DPML项目的TypeScript编码规范
  - 错误和警告信息清晰明确，包含准确的位置信息
  - 使用不可变数据结构确保类型安全
  
- **卓越表现**:
  - 验证性能优化，处理大型文档结构高效
  - 提供详细的内部文档注释，便于后续维护
  - 完成额外的单元测试用例，提高测试覆盖率