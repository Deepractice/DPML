/**
 * @dpml/prompt 格式配置功能测试
 * 
 * 测试ID:
 * - UT-FC-001: 默认格式应用
 * - UT-FC-002: 自定义格式模板
 * - UT-FC-003: 标题前缀后缀
 * - UT-FC-004: 内容包装器
 * - UT-FC-005: 标签顺序定制
 * - UT-FC-006: 部分格式覆盖
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { parse, process } from '@dpml/core';
import { PromptTransformer, FormatTemplates } from '../../src/transformers/promptTransformer';

describe('格式配置功能测试', () => {
  // 基础DPML文本
  const baseDpmlText = `
    <prompt id="format-test" lang="en">
      <role>你是一位AI助手</role>
      <context>用户需要帮助完成一项任务</context>
      <thinking>考虑问题的各个方面，保持逻辑思考</thinking>
      <executing>1. 理解问题\n2. 分析需求\n3. 提供解决方案</executing>
      <testing>确保回答准确、有帮助、符合要求</testing>
      <protocol>以友好、专业的语气回应用户</protocol>
      <custom>这是一段自定义内容</custom>
    </prompt>
  `;

  /**
   * UT-FC-001: 默认格式应用测试
   * 
   * 测试默认格式模板是否正确应用到输出
   */
  it('默认格式应用测试 (UT-FC-001)', async () => {
    // 创建默认转换器
    const transformer = new PromptTransformer();
    
    // 解析和处理DPML
    const parseResult = await parse(baseDpmlText);
    const processedDoc = await process(parseResult.ast);
    
    // 使用默认格式转换
    const result = transformer.transform(processedDoc);
    
    // 验证默认格式已应用
    expect(result).toContain('## 角色');
    expect(result).toContain('你是一位AI助手'); // 不再有重复的前缀
    
    expect(result).toContain('## 背景');
    expect(result).toContain('用户需要帮助完成一项任务');
    
    expect(result).toContain('## 思维框架');
    expect(result).toContain('考虑问题的各个方面，保持逻辑思考');
    
    expect(result).toContain('## 执行步骤');
    expect(result).toContain('1. 理解问题');
    
    expect(result).toContain('## 质量检查');
    expect(result).toContain('确保回答准确、有帮助、符合要求');
    
    expect(result).toContain('## 交互协议');
    expect(result).toContain('以友好、专业的语气回应用户');
    
    // 自定义标签默认没有标题
    expect(result).toContain('这是一段自定义内容');
    
    // 检查标签顺序是否符合默认顺序
    const sections = result.split(/\n{2,}/);
    let roleIndex = -1;
    let contextIndex = -1;
    
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].includes('## 角色')) roleIndex = i;
      if (sections[i].includes('## 背景')) contextIndex = i;
    }
    
    expect(roleIndex).toBeLessThan(contextIndex);
  });

  /**
   * UT-FC-002: 自定义格式模板测试
   * 
   * 测试自定义格式模板是否正确覆盖默认设置
   */
  it('自定义格式模板测试 (UT-FC-002)', async () => {
    // 自定义格式模板
    const customTemplates: FormatTemplates = {
      role: {
        title: '# 自定义角色标题',
        prefix: '作为',
        suffix: '，请提供帮助'
      },
      context: {
        title: '# 自定义背景标题',
        prefix: '背景信息：'
      },
      thinking: {
        title: '# 思考方式',
        prefix: '请按照以下框架思考：'
      }
    };
    
    // 创建使用自定义模板的转换器
    const transformer = new PromptTransformer({
      formatTemplates: customTemplates
    });
    
    // 解析和处理DPML
    const parseResult = await parse(baseDpmlText);
    const processedDoc = await process(parseResult.ast);
    
    // 使用自定义格式转换
    const result = transformer.transform(processedDoc);
    
    // 验证自定义格式已应用
    expect(result).toContain('# 自定义角色标题');
    expect(result).toContain('作为你是一位AI助手，请提供帮助');
    
    expect(result).toContain('# 自定义背景标题');
    expect(result).toContain('背景信息：用户需要帮助完成一项任务');
    
    expect(result).toContain('# 思考方式');
    expect(result).toContain('请按照以下框架思考：考虑问题的各个方面，保持逻辑思考');
    
    // 未覆盖的标签应保持默认格式
    expect(result).toContain('## 执行步骤');
  });

  /**
   * UT-FC-003: 标题前缀后缀测试
   * 
   * 测试标题、前缀和后缀是否被正确应用
   */
  it('标题前缀后缀测试 (UT-FC-003)', async () => {
    // 创建带有复杂标题、前缀、后缀的转换器
    const transformer = new PromptTransformer({
      formatTemplates: {
        role: {
          title: '# 角色定位 [重要]',
          prefix: '👤 ',
          suffix: ' 👤'
        },
        context: {
          title: '# 情境 [必读]',
          prefix: '📝 ',
          suffix: ' 📝'
        }
      }
    });
    
    // 解析和处理DPML
    const parseResult = await parse(baseDpmlText);
    const processedDoc = await process(parseResult.ast);
    
    // 转换
    const result = transformer.transform(processedDoc);
    
    // 验证标题、前缀、后缀
    expect(result).toContain('# 角色定位 [重要]');
    expect(result).toContain('👤 你是一位AI助手 👤');
    
    expect(result).toContain('# 情境 [必读]');
    expect(result).toContain('📝 用户需要帮助完成一项任务 📝');
  });

  /**
   * UT-FC-004: 内容包装器测试
   * 
   * 测试内容包装器函数是否正确处理内容
   */
  it('内容包装器测试 (UT-FC-004)', async () => {
    // 创建带有内容包装器的转换器
    const transformer = new PromptTransformer({
      formatTemplates: {
        role: {
          wrapper: (content) => `**${content}**` // 加粗内容
        },
        context: {
          wrapper: (content) => content.toUpperCase() // 大写转换
        },
        executing: {
          wrapper: (content) => {
            // 为每行步骤添加复选框
            return content.split('\n')
              .map(line => line.trim().startsWith('1') || 
                         line.trim().startsWith('2') || 
                         line.trim().startsWith('3') ? 
                         `- [ ] ${line}` : line)
              .join('\n');
          }
        }
      }
    });
    
    // 解析和处理DPML
    const parseResult = await parse(baseDpmlText);
    const processedDoc = await process(parseResult.ast);
    
    // 转换
    const result = transformer.transform(processedDoc);
    
    // 验证内容包装器应用
    expect(result).toContain('**你是一位AI助手**');
    expect(result).toContain('用户需要帮助完成一项任务'.toUpperCase());
    expect(result).toContain('- [ ] 1. 理解问题');
    expect(result).toContain('- [ ] 2. 分析需求');
    expect(result).toContain('- [ ] 3. 提供解决方案');
  });

  /**
   * UT-FC-005: 标签顺序定制测试
   * 
   * 测试是否可以自定义标签的输出顺序
   */
  it('标签顺序定制测试 (UT-FC-005)', async () => {
    // 自定义标签顺序
    const customOrder = [
      'context', 'role', 'executing', 'thinking', 'testing', 'protocol', 'custom'
    ];
    
    // 创建自定义标签顺序的转换器
    const transformer = new PromptTransformer({
      tagOrder: customOrder
    });
    
    // 解析和处理DPML
    const parseResult = await parse(baseDpmlText);
    const processedDoc = await process(parseResult.ast);
    
    // 转换
    const result = transformer.transform(processedDoc);
    
    // 将结果分割成段落
    const paragraphs = result.split(/\n{2,}/);
    
    // 获取各标签在结果中的位置
    let contextIndex = -1;
    let roleIndex = -1;
    
    for (let i = 0; i < paragraphs.length; i++) {
      if (paragraphs[i].includes('## 背景')) contextIndex = i;
      if (paragraphs[i].includes('## 角色')) roleIndex = i;
    }
    
    // 验证自定义顺序已应用（context应该在role之前）
    expect(contextIndex).toBeLessThan(roleIndex);
  });

  /**
   * UT-FC-006: 部分格式覆盖测试
   * 
   * 测试部分标签格式覆盖，其他保持默认
   */
  it('部分格式覆盖测试 (UT-FC-006)', async () => {
    // 仅覆盖部分标签的格式
    const partialTemplates: FormatTemplates = {
      role: {
        title: '# 定制角色'
      },
      // 未覆盖其他标签
    };
    
    // 创建部分覆盖的转换器
    const transformer = new PromptTransformer({
      formatTemplates: partialTemplates
    });
    
    // 解析和处理DPML
    const parseResult = await parse(baseDpmlText);
    const processedDoc = await process(parseResult.ast);
    
    // 转换
    const result = transformer.transform(processedDoc);
    
    // 验证覆盖的部分应用了新格式
    expect(result).toContain('# 定制角色');
    expect(result).toContain('你是一位AI助手'); // 不再有重复的前缀
    
    // 未覆盖的部分应保持默认格式
    expect(result).toContain('## 背景');
    expect(result).toContain('## 思维框架');
    expect(result).toContain('## 执行步骤');
  });
}); 