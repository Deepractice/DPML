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

## 权利
- 我有权利在设计本身就无法达成目标是停止工作
- 我有权利在符合规范的情况下，发挥自身的能力，让任务完成的更好

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## 实现Pipeline组件和基础转换器框架

**目标(O)**:
- 实现Pipeline协调组件，用于管理和执行转换器链
- 实现ResultCollectorTransformer基础转换器
- 创建转换器执行流程的基础框架
- 确保类型安全的数据流转

**环境(E)**:

- **代码相关**:
  - `packages/core/src/core/transformer/Pipeline.ts` - Pipeline协调组件
  - `packages/core/src/core/transformer/ResultCollectorTransformer.ts` - 结果收集器
  - `packages/core/src/core/transformer/transformerFactory.ts` - 转换器工厂
  - `packages/core/src/types/Transformer.ts` - 转换器接口
  - `packages/core/src/types/TransformContext.ts` - 上下文接口
  
- **测试相关**:
  - `packages/core/src/__tests__/unit/transformer/Pipeline.test.ts` - Pipeline单元测试
  - `packages/core/src/__tests__/unit/transformer/transformers/ResultCollectorTransformer.test.ts` - 结果收集器单元测试
  - 单元测试用例：UT-PIPE-01到UT-PIPE-04，UT-PIPE-NEG-01（Pipeline测试）
  - 单元测试用例：UT-RESCOL-01到UT-RESCOL-03，UT-RESCOL-NEG-01（结果收集器测试）
  
- **实现要点**:
  - Pipeline需实现add和execute方法，支持添加和按顺序执行转换器
  - ResultCollectorTransformer需要收集和整合所有转换器结果
  - transformerFactory需添加createResultCollector方法
  - 确保转换器执行过程中的数据流正确传递
  
- **注意事项**:
  - Pipeline是转换流程的核心，必须确保稳定和高效
  - Pipeline应支持类型安全的转换器链执行
  - 结果收集器需要支持可选的转换器名称过滤
  - 确保所有泛型类型参数在整个执行流程中正确传递

**成功标准(S)**:
- **基础达标**:
  - Pipeline的所有单元测试通过（UT-PIPE-01到UT-PIPE-04，UT-PIPE-NEG-01）
  - ResultCollectorTransformer的所有单元测试通过（UT-RESCOL-01到UT-RESCOL-03，UT-RESCOL-NEG-01）
  - transformerFactory完成ResultCollector创建方法
  
- **预期品质**:
  - Pipeline支持错误处理和异常传播
  - 确保类型安全的数据流转
  - 代码结构清晰，注释完整
  - 遵循函数式编程原则
  
- **卓越表现**:
  - 优化Pipeline执行性能
  - 为Pipeline添加更多调试和日志功能
  - 增强ResultCollector的合并策略选项
  - 提供更灵活的转换器选择机制 