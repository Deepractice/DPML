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

## 项目结构
我们的项目是 monorepo，基于 pnpm workspace 管理。

## 权利
- 我有权利在设计本身就无法达成目标是停止工作
- 我有权利在符合规范的情况下，发挥自身的能力，让任务完成的更好

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## 完成命令集成的端到端测试（终结任务）

**目标(O)**:
- 实现框架CLI集成的端到端测试，验证完整功能链路
- 解决前序任务中可能出现的问题和边缘情况
- 完善代码文档和注释，确保功能说明清晰完整
- 确保所有测试通过，代码符合项目规范并可成功提交

**环境(E)**:
- **代码相关**:
  - 所有前序任务中实现的代码文件
  - `packages/core/tasks/iteration/ITER2025043001/ITER-Design.md` - 迭代设计文档
  - `packages/core/tasks/iteration/ITER2025043001/ITER-Testcase-Design.md` - 测试用例设计
  
- **测试相关**:
  - 需要创建 `packages/core/src/__tests__/e2e/framework/commandIntegration.e2e.test.ts` - 端到端测试
  - 测试用例ID: E2E-CMDINT-01, E2E-CMDINT-02, E2E-CMDINT-03, E2E-CMDINT-04
  - 前序任务的所有相关测试用例

- **实现要点**:
  - 创建端到端测试文件:
    ```typescript
    // commandIntegration.e2e.test.ts
    import { createDomainDPML, getCommandDefinitions } from '../../../../api/framework';
    import { DomainConfig } from '../../../../types/DomainConfig';
    import { DomainAction } from '../../../../types/DomainAction';
    import fs from 'fs/promises';
    import path from 'path';
    import os from 'os';
    
    describe('命令集成端到端测试', () => {
      // 创建临时文件目录
      let tempDir: string;
      
      beforeAll(async () => {
        // 设置测试环境
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dpml-cli-test-'));
      });
      
      afterAll(async () => {
        // 清理测试环境
        await fs.rm(tempDir, { recursive: true, force: true });
      });
      
      test('用户应能在DomainConfig中配置领域命令', async () => {
        // 实现E2E-CMDINT-01测试
        const config: DomainConfig = {
          domain: 'test-domain',
          description: '测试领域',
          schema: { /* 测试schema */ },
          commands: {
            includeStandard: true,
            actions: [
              {
                name: 'custom-action',
                description: '自定义命令',
                args: [{ name: 'input', description: '输入文件', required: true }],
                options: [{ flags: '--format <type>', description: '输出格式' }],
                executor: async (context, input, options) => {
                  return `Executed with ${input} and ${options.format || 'default'}`;
                }
              }
            ]
          }
        };
        
        // 创建领域编译器并验证命令注册
        const compiler = createDomainDPML(config);
        const commands = getCommandDefinitions();
        
        // 验证标准命令和自定义命令都已注册
        expect(commands.some(cmd => cmd.name === `${config.domain}:validate`)).toBe(true);
        expect(commands.some(cmd => cmd.name === `${config.domain}:custom-action`)).toBe(true);
      });
      
      test('用户应能获取并注册领域命令到CLI', async () => {
        // 实现E2E-CMDINT-02测试
        // 模拟CLI注册和使用流程
      });
      
      test('标准命令应能正确执行', async () => {
        // 实现E2E-CMDINT-03测试
        // 创建测试文件和领域配置
        const testFilePath = path.join(tempDir, 'test.dpml');
        const testContent = '<test id="123">Test content</test>';
        await fs.writeFile(testFilePath, testContent, 'utf-8');
        
        // 创建领域配置和编译器
        const config = {
          domain: 'validation-test',
          schema: { /* 有效的测试schema */ },
          commands: { includeStandard: true }
        };
        
        const compiler = createDomainDPML(config);
        const commands = getCommandDefinitions();
        
        // 查找validate命令
        const validateCmd = commands.find(cmd => cmd.name === `${config.domain}:validate`);
        expect(validateCmd).toBeDefined();
        
        // 执行命令并验证结果
        if (validateCmd) {
          const result = await validateCmd.action(testFilePath, { strict: true });
          expect(result).toBeDefined();
          // 验证具体结果...
        }
      });
      
      test('自定义领域命令应能正确执行', async () => {
        // 实现E2E-CMDINT-04测试
        // 类似标准命令测试，但针对自定义命令
      });
    });
    ```
  
  - 检查和补充前序任务的缺失部分:
    1. 完善错误处理
    2. 添加缺失的类型定义
    3. 完成文档和注释
    4. 处理边缘情况，如命令名冲突
  
- **注意事项**:
  - 端到端测试应该尽可能接近实际使用场景
  - 避免过度模拟，保持测试的真实性
  - 确保正确清理测试产生的临时文件和资源
  - 代码所有部分应符合项目编码规范

**成功标准(S)**:
- **基础达标**:
  - 所有端到端测试通过：E2E-CMDINT-01, E2E-CMDINT-02, E2E-CMDINT-03, E2E-CMDINT-04
  - 前序任务的所有单元测试和集成测试通过
  - 代码符合项目规范，无error级别的lint错误
  - 所有代码均有适当的注释和文档
  
- **预期品质**:
  - 端到端测试覆盖主要用户使用场景
  - 所有功能组件间协作正常，集成顺畅
  - 代码模块化程度高，职责分离清晰
  - 错误处理完善，包括用户输入错误和系统异常
  
- **卓越表现**:
  - 添加额外的边缘情况测试
  - 提供完整的用户指南和示例
  - 优化性能，减少不必要的重复计算
  - 代码可以成功提交并通过CI验证
  - 相关文档已更新，包括设计文档和用户指南 