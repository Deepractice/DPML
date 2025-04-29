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
- 在解决问题时，积极的通过在关键步骤打日志的方式进行 debug

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
  * 我将确认没有error级别的lint错误, 可以使用 --fix 快捷修复
  * 在验证通过后，我将明确声明："自我验证完成，所有测试通过，无 Error 级 lint 错误"

## 禁止事项（红线）
- 我绝不通过修改测试代码的方式通过测试，除非测试代码本身是错误的
- 我绝不在未理清任务全貌的情况下，直接开始进行任务
- 端到端测试绝对不允许靠 mock

## 权利
- 我有权利在设计本身就无法达成目标是停止工作
- 我有权利在符合规范的情况下，发挥自身的能力，让任务完成的更好

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## 清理旧的Transformer模块代码

**目标(O)**:
- 移除旧的`transformer`模块中的转换器实现文件
- 删除不再需要的`transformerFactory.ts`文件
- 更新所有导入路径，使其指向framework模块中的新实现
- 调整所有测试用例中的导入路径，指向新位置
- 确保项目编译和测试通过

**环境(E)**:
- **迭代进度**:
  - **transformer-framework-01-base**: 创建Framework模块中的transformer目录结构和工厂
  - **transformer-framework-02-base**: 迁移StructuralMapperTransformer
  - **transformer-framework-03-base**: 迁移AggregatorTransformer和TemplateTransformer
  - **transformer-framework-04-base**: 迁移剩余转换器实现
  - **【当前任务】transformer-framework-05-cleanup**: 清理旧的transformer模块代码
  - **transformer-framework-06-final**: 文档更新和最终验证

- **代码相关**:
  - 已迁移的转换器：`packages/core/src/core/framework/transformer/`
  - 新工厂实现：`packages/core/src/core/framework/transformer/transformerFactory.ts`
  - 需删除的旧文件：
    - `packages/core/src/core/transformer/transformerFactory.ts`
    - `packages/core/src/core/transformer/transformers/*.ts`
  - 可能需要更新的文件：
    - `packages/core/src/core/transformer/transformerService.ts`
    - `packages/core/src/api/transformer.ts`
  - 测试文件：`packages/core/src/__tests__/unit/transformer/`和其他使用转换器的测试
  
- **架构规范**:
  - `packages/core/docs/product/Transformer-Design.md` - 转换器设计文档
  - `packages/core/docs/develop/Transformer-Develop-Design.md` - 转换器开发设计
  
- **测试相关**:
  - 单元测试：`packages/core/src/__tests__/unit/transformer/`
  - 集成测试：`packages/core/src/__tests__/integration/transformer/`
  - 所有使用转换器的测试：可能在不同目录
  
- **实现要点**:
  - 查找所有使用旧转换器实现的文件和导入
  - 更新所有导入路径，指向framework模块中的新实现
  - 删除`transformer/transformers/`目录中的所有文件
  - 删除`transformer/transformerFactory.ts`
  - 调整测试中的所有导入路径
  
- **注意事项**:
  - 确保删除前所有功能已被完全迁移到framework模块
  - 导入路径调整需要全面，避免遗漏
  - transformerService可能需要较大改动，要仔细处理
  - 测试导入路径调整后需验证测试用例能正常运行

**成功标准(S)**:
- **基础达标**:
  - 所有旧的转换器实现文件已删除
  - 旧的transformerFactory.ts已删除
  - 所有导入路径更新完成
  - 代码可以正常编译
  
- **预期品质**:
  - 项目结构更加清晰，没有冗余代码
  - 所有测试都能正常运行
  - 清理过程不影响现有功能
  - 没有遗留的未使用导入或死代码
  
- **卓越表现**:
  - 提供全面的清理报告，列出所有修改的文件
  - 确保性能没有下降，可能的话有所提升
  - 识别并记录在清理过程中发现的潜在问题 