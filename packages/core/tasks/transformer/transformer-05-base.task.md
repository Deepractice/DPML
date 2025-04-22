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

## 实现模板转换器和聚合转换器

**目标(O)**:
- 实现TemplateTransformer转换器，用于基于模板生成文本输出
- 实现AggregatorTransformer转换器，用于收集和聚合元素
- 扩展transformerFactory添加相应的创建方法
- 完善转换器生态系统

**环境(E)**:
- **项目进度**:
  - **transformer-00-setup.task.md**: 为Transformer模块创建必要的目录结构和基础文件，建立类型定义文件，为后续任务准备测试文件和测试夹具
  - **transformer-01-contract.task.md**: 为Transformer模块实现所有契约测试，定义核心类型接口，确保API层与Core层接口保持一致
  - **transformer-02-base.task.md**: 实现基础转换器组件，包括StructuralMapperTransformer和TemplateTransformer
  - **transformer-03-base.task.md**: 实现Pipeline和TransformerRegistry组件
  - **transformer-04-base.task.md**: 实现ResultCollectorTransformer和AggregatorTransformer组件
  - **【当前任务】transformer-05-base.task.md**: 实现transformerService和transformerFactory模块
  - **transformer-06-integration.task.md**: 实现集成测试，验证不同组件协同工作的功能
  - **transformer-07-final.task.md**: 完成所有端到端测试，确保整体功能符合需求
- **代码相关**:
  - `packages/core/src/core/transformer/TemplateTransformer.ts` - 模板转换器
  - `packages/core/src/core/transformer/AggregatorTransformer.ts` - 聚合转换器
  - `packages/core/src/core/transformer/transformerFactory.ts` - 转换器工厂
  - `packages/core/src/types/CollectorConfig.ts` - 收集器配置类型
  - `packages/core/src/types/Transformer.ts` - 转换器接口
  
- **测试相关**:
  - `packages/core/src/__tests__/unit/transformer/transformers/TemplateTransformer.test.ts` - 模板转换器测试
  - `packages/core/src/__tests__/unit/transformer/transformers/AggregatorTransformer.test.ts` - 聚合转换器测试
  - 单元测试用例：UT-TEMPLATE-01到UT-TEMPLATE-04，UT-TEMPLATE-NEG-01（模板转换器）
  - 单元测试用例：UT-AGGRE-01到UT-AGGRE-04，UT-AGGRE-NEG-01（聚合转换器）
  
- **实现要点**:
  - TemplateTransformer支持字符串模板和函数模板
  - TemplateTransformer支持可选的数据预处理
  - AggregatorTransformer支持元素收集、分组和排序
  - transformerFactory添加createTemplateTransformer和createAggregator方法
  
- **注意事项**:
  - 模板转换器应支持多种模板引擎，提供灵活接口
  - 聚合转换器应处理各种元素类型和分组场景
  - 所有转换器必须正确处理错误情况
  - 保持类型安全和泛型参数的正确传递

**成功标准(S)**:
- **基础达标**:
  - TemplateTransformer的所有单元测试通过
  - AggregatorTransformer的所有单元测试通过
  - transformerFactory完成相应的创建方法
  
- **预期品质**:
  - 模板转换器支持多种模板格式和预处理
  - 聚合转换器支持复杂的分组和排序逻辑
  - 所有错误情况都得到妥善处理
  - 代码有清晰的注释和文档
  
- **卓越表现**:
  - 提供更丰富的模板函数库
  - 优化聚合性能，支持大量元素的高效处理
  - 增强调试和错误报告能力
  - 提供更多定制选项和高级功能 