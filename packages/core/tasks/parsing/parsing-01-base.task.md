# ⚠️ 执行前必读：AI执行流程规范 ⚠️

❗ 第一步：宣誓确认（必须）
请阅读下方誓词，并将以下确认语复制粘贴作为你回复的第一行：
> "我已阅读并接受AI执行誓词，现在开始按规范执行任务"

⛔ 未经宣誓直接开始分析将导致任务执行无效 ⛔

✅ 强制执行顺序：
1️⃣ 先宣誓确认
2️⃣ 进行环境分析（必须明确声明"环境分析完成，现在开始分析目标"）
3️⃣ 进行目标分析（必须明确声明"目标分析完成，现在制定实现计划"）
4️⃣ 实现功能并验证

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
  * 我将执行`pnpm test`确保必需的测试通过
  * 我将执行`pnpm build`确保构建成功
  * 我将确认没有error级别的lint错误
  * 在验证通过后，我将明确声明："自我验证完成，必需的测试通过，构建成功"
- 他验证：
  * 作为基础任务，代码提交是可选的
  * 我理解可能有集成测试和端到端测试未通过
  * 在验证关键单元测试通过后，我可以声明："基础任务核心功能验证完成"

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

# XML解析器实现任务（基础任务）

## 任务: 实现可配置的XML解析器

**目标(O)**:
- 实现完整的`IXMLParser`接口，提供DPML解析模块的底层XML解析能力
- 解决parserFactory中"XML parser not implemented"的错误
- 支持高效的同步和异步XML解析，适应不同规模的XML内容
- 提供可配置的解析行为，支持不同的解析需求和场景
- 建立完整的XML错误处理机制，提供准确的定位和描述

**环境(E)**:
- **代码相关**:
  - `packages/core/src/core/parsing/types.ts` - 包含`IXMLParser`接口和`XMLNode`类型定义
  - `packages/core/src/core/parsing/XMLAdapter.ts` - 适配器类，将使用XML解析器
  - `packages/core/src/core/parsing/parserFactory.ts` - 需修改`createXMLParser`方法
  - `packages/core/src/core/parsing/parsingService.ts` - 解析服务，使用适配器
  - 需创建新文件: `packages/core/src/core/parsing/XMLParser.ts` - 实现解析器类
  - `packages/core/src/types/index.ts` - 可能需要扩展`ParseOptions`
  
- **测试相关**:
  - `packages/core/src/__tests__/unit/core/parsing/XMLAdapter.test.ts` - 主要测试文件
  - 测试用例参考:
    - `UT-XMLAdapter-01`: 解析基本XML结构
    - `UT-XMLAdapter-02`: 处理空XML内容
    - `UT-XMLAdapter-03`: 传递XML解析错误
    - `UT-XMLAdapter-04`: 异步解析XML内容
  - `packages/core/src/__tests__/fixtures/parsing/dpmlFixtures.ts` - 包含测试XML样例
  - 集成测试将验证与DPML解析流程的整合

- **实现要点**:
  - 选择适当的底层XML解析库：建议fast-xml-parser
  - 实现XMLParser类，包含以下核心方法:
    ```typescript
    // 同步解析方法
    parse(content: string): XMLNode;
    
    // 异步解析方法
    parseAsync(content: string): Promise<XMLNode>;
    
    // 配置解析器行为
    configure(options: Record<string, unknown>): void;
    ```
  - 解析结果必须遵循`XMLNode`接口规范:
    ```typescript
    interface XMLNode {
      type: string;      // 节点类型
      name: string;      // 节点名称
      attributes: Record<string, string>; // 节点属性
      children: XMLNode[]; // 子节点
      text?: string;     // 文本内容
      position?: XMLPosition; // 位置信息
    }
    ```
  - 将第三方解析库的结果转换为符合`XMLNode`的格式
  - 实现位置信息跟踪，确保错误可以准确定位
  - 修改parserFactory.createXMLParser方法，返回新实现的解析器

- **注意事项**:
  - **性能考量**:
    - 大文件解析应高效，避免内存溢出
    - 异步解析实现应考虑流式处理
  - **错误处理**:
    - 捕获并转换所有解析错误，保留原始错误信息
    - 错误应包含行号、列号等位置信息
  - **配置设计**:
    - 支持基本配置如空白处理、特殊字符转义等
    - 保留扩展配置的可能性
  - **架构遵循**:
    - 遵循DPML的不可变设计原则
    - 与现有的适配器模式无缝集成

**成功标准(S)**:
- **基础达标** (必须通过):
  - XMLAdapter.test.ts中的所有单元测试通过，特别是UT-XMLAdapter-01到UT-XMLAdapter-04
  - 解析基本XML结构和属性功能正常工作
  - 同步和异步解析方法都能正确工作
  - parserFactory不再抛出"XML parser not implemented"错误
  - 注意：作为基础任务，集成测试和端到端测试可能仍然失败，这是可以接受的
  
- **预期品质**:
  - XMLParser类实现完整，代码结构清晰
  - 错误处理机制健全，能捕获并增强错误信息
  - 位置信息跟踪实现基本功能
  - 代码符合项目规范，包括完整的JSDoc注释
  - 注意：集成测试可能仍然失败，这将在后续任务中解决
  
- **卓越表现** (可选):
  - 为XMLParser添加单元测试
  - 支持基本的XML特性，如CDATA、注释等
  - 实现内存高效的解析方式
  - 提供丰富的配置选项 