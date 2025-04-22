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

## 实现处理服务(ProcessingService)类

**目标(O)**:
- 设计并实现`ProcessingService`类，作为处理模块的核心服务层
- 协调验证器和引用映射构建，提供统一的文档处理入口
- 支持类型安全的泛型扩展，允许自定义处理结果
- 实现处理上下文、验证结果和引用映射的集成

**环境(E)**:
- **代码相关**:
  - 创建文件: `packages/core/src/core/processing/ProcessingService.ts`
  - 依赖组件: 
    - `packages/core/src/core/processing/DocumentValidator.ts`
    - `packages/core/src/core/processing/ValidatorFactory.ts`
    - `packages/core/src/core/processing/ReferenceMapBuilder.ts`
  - 相关类型定义:
    - `packages/core/src/types/ProcessingResult.ts`
    - `packages/core/src/types/ValidationResult.ts`
    - `packages/core/src/types/ReferenceMap.ts`
    - `packages/core/src/types/ProcessingContext.ts`
  - 需实现的核心方法:
    ```typescript
    processDocument<T extends ProcessingResult = ProcessingResult>(document: DPMLDocument, schema: ProcessedSchema): T
    ```

- **测试相关**:
  - 测试文件: `packages/core/src/__tests__/unit/core/processing/ProcessingService.test.ts`
  - 关键测试用例:
    - UT-PROCSRV-01: processDocument应返回正确结构的结果
    - UT-PROCSRV-02: processDocument应正确构建ID引用映射
    - UT-PROCSRV-03: processDocument应支持自定义结果类型

- **实现要点**:
  - 实现`ProcessingService`类，作为处理流程的协调中心
  - 通过`ValidatorFactory`创建验证器实例
  - 使用验证器执行文档验证
  - 使用`ReferenceMapBuilder`构建引用映射
  - 集成处理上下文、验证结果和引用映射，构建完整的处理结果
  - 支持通过泛型扩展处理结果类型

- **注意事项**:
  - 保持类的职责单一，专注于协调和集成
  - 确保类型安全，特别是泛型扩展部分
  - 使用不可变数据结构处理结果
  - 考虑异常处理和错误传播
  - 采用依赖注入模式，便于单元测试

**成功标准(S)**:
- **基础达标**:
  - ProcessingService类完整实现
  - 单元测试用例UT-PROCSRV-01至03通过
  - 能够正确处理基本文档并返回期望的结果
  
- **预期品质**:
  - 代码符合DPML项目的TypeScript编码规范
  - 类型安全的实现，特别是泛型部分
  - 良好的组件协调和错误处理
  - 使用不可变数据结构确保结果安全
  
- **卓越表现**:
  - 支持高级的处理选项配置
  - 实现性能优化措施
  - 提供详细的内部文档和使用示例 