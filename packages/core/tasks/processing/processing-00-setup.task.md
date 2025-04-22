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
  * 我将确认没有error级别的lint错误， 可以使用 --fix 快捷修复
  * 在验证通过后，我将明确声明："自我验证完成，所有测试通过，构建成功"
- 他验证：
  * 我将通过代码提交触发.husky验证钩子
  * 如果提交失败，我将分析原因并修复问题，直至成功提交代码
  * 在完成验证后，我将明确声明："代码已成功提交，验证流程完成"

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## Processing模块初始设置

**目标(O)**:
- 为Processing模块创建基础目录结构和核心类型定义
- 准备关键组件的文件骨架，包括API层、核心服务层和验证器
- 确保文件结构符合DPML架构规范，为后续任务提供基础

**环境(E)**:
- **产品设计文档**:
  - `packages/core/docs/product/Processing-Design.md` - 处理模块设计文档，定义了处理模块的架构和组件关系
  - `packages/core/docs/develop/Processing-Testcase-Design.md` - 处理模块测试用例设计，定义了测试范围和测试用例

- **架构规范**:
  - `rules/architecture/core-layer.md` - 定义了Core层设计规则，包括目录结构和命名规范
  - `rules/architecture/api-layer.md` - 定义了API层设计规则
  - `rules/architecture/types-layer.md` - 定义了Types层设计规则

- **文件创建列表**:
  - **Types层**:
    - `packages/core/src/types/ProcessingResult.ts` - 处理结果接口
    - `packages/core/src/types/ProcessingContext.ts` - 处理上下文接口
    - `packages/core/src/types/ValidationResult.ts` - 验证结果接口
    - `packages/core/src/types/ReferenceMap.ts` - 引用映射接口
    - `packages/core/src/types/ProcessingError.ts` - 处理错误接口
    - `packages/core/src/types/ProcessingWarning.ts` - 处理警告接口
  
  - **API层**:
    - `packages/core/src/api/processing.ts` - 处理模块API接口
  
  - **Core层**:
    - `packages/core/src/core/processing/processingService.ts` - 处理服务
    - `packages/core/src/core/processing/documentValidator.ts` - 文档验证器
    - `packages/core/src/core/processing/validatorFactory.ts` - 验证器工厂

- **实现要点**:
  - 所有接口使用`readonly`修饰符确保不可变性
  - 集合类型使用`ReadonlyArray`和`ReadonlyMap`
  - 命名遵循小驼峰命名法，文件名使用小写
  - Core层目录结构最多允许两级嵌套

- **注意事项**:
  - Types层应定义纯数据结构，不含方法
  - API层是一个薄层，主要委托Core层的功能
  - 要确保泛型支持，特别是`ProcessingResult`的扩展机制

**成功标准(S)**:
- **基础达标**:
  - 所有列出的文件被创建并包含基本接口和类型定义
  - 文件结构符合架构规范，包括命名和目录结构
  - 所有接口使用`readonly`修饰符确保不可变性
  - 已创建必要的导出，包括`index.ts`文件
  
- **预期品质**:
  - 类型定义完全符合设计文档
  - 代码有完整的JSDoc注释
  - 组件间的关系清晰，符合模块设计
  - 代码通过TypeScript编译检查，不含类型错误
  
- **卓越表现**:
  - 类型定义具有高度扩展性
  - 类型定义涵盖了所有可能的边界情况
  - 类型系统充分利用TypeScript高级类型特性 