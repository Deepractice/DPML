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

## Framework模块Transformer目录结构和转换器工厂创建

**目标(O)**:
- 在Framework模块中创建transformer子模块的目录结构
- 创建转换器工厂`transformerFactory.ts`
- 实现与原`transformerFactory.ts`相同的工厂函数功能
- 为后续转换器迁移准备基础架构

**环境(E)**:
- **迭代进度**:
  - **【当前任务】transformer-framework-01-base**: 创建Framework模块中的transformer目录结构和工厂
  - **transformer-framework-02-base**: 迁移StructuralMapperTransformer
  - **transformer-framework-03-base**: 迁移后续转换器实现
  - **transformer-framework-04-base**: 迁移剩余转换器实现
  - **transformer-framework-05-cleanup**: 清理旧的transformer模块代码
  - **transformer-framework-06-final**: 文档更新和最终验证

- **代码相关**:
  - `packages/core/src/core/framework/` - Framework模块目录
  - `packages/core/src/core/framework/domainService.ts` - Framework模块已有文件
  - `packages/core/src/core/framework/types.ts` - Framework模块类型
  - `packages/core/src/core/transformer/transformerFactory.ts` - 原工厂实现
  - `packages/core/src/core/transformer/transformers/` - 转换器实现目录
  - 迁移设计文档：`packages/core/tasks/iteration/ITER2025042901/ITER-Design.md`
  
- **架构规范**:
  - `rules/architecture/architecture-overview.md` - 架构概览规则
  - `packages/core/docs/product/Transformer-Design.md` - 转换器设计文档
  - `packages/core/docs/develop/Transformer-Develop-Design.md` - 转换器开发设计
  
- **测试相关**:
  - `packages/core/src/__tests__/unit/transformer/transformerFactory.test.ts` - 原工厂单元测试
  - 测试用例为现有测试，后续任务将调整测试导入路径
  
- **实现要点**:
  - 创建Framework模块中的transformer目录
  - 实现transformerFactory.ts，保持与原工厂函数相同的签名
  - 确保工厂函数能正确导入类型和调用转换器构造函数
  
- **注意事项**:
  - 避免循环依赖，保持依赖方向从transformer到framework
  - 保持函数签名完全一致，确保向后兼容
  - 为了支持未来迁移，需提前导入转换器类型

**成功标准(S)**:
- **基础达标**:
  - Framework模块中的transformer目录结构创建完成
  - transformerFactory.ts文件创建，并实现所有工厂函数
  - 函数签名与原transformerFactory.ts保持一致
  - 注意：由于尚未迁移转换器实现，测试可能暂时失败
  
- **预期品质**:
  - 代码组织清晰，符合项目规范
  - 工厂函数有完整的注释说明
  - 文件结构符合架构规范
  
- **卓越表现**:
  - 为框架转换器工厂添加更好的错误处理机制
  - 优化依赖结构，确保最小化依赖
  - 提供更详细的函数文档注释 