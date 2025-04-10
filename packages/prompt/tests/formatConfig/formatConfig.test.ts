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
import { PromptTransformer } from '../../src/transformers/promptTransformer';

describe('格式配置功能测试', () => {
  // 测试组件
  let transformer: PromptTransformer;
  
  // 基础DPML文本，包含所有常用标签
  const fullDpmlText = `
    <prompt id="format-test-prompt">
      <role>你是一位专业的助手</role>
      <context>用户需要你提供格式化文本的帮助</context>
      <thinking>先理解用户需求，再制定合适的解决方案</thinking>
      <executing>1. 分析需求\n2. 确定格式\n3. 生成文本</executing>
      <testing>检查输出是否符合格式要求</testing>
      <protocol>使用markdown格式回复</protocol>
      <custom>用户定义的自定义内容</custom>
    </prompt>
  `;

  beforeEach(async () => {
    // 创建默认转换器实例
    transformer = new PromptTransformer();
  });

  /**
   * UT-FC-001: 默认格式应用测试
   * 
   * 测试默认格式模板是否被正确应用
   */
  it('默认格式应用测试 (UT-FC-001)', async () => {
    // 解析和处理DPML
    const parseResult = await parse(fullDpmlText);
    const processedDoc = await process(parseResult.ast);

    // 使用默认格式转换
    const result = transformer.transform(processedDoc);

    // 验证结果包含默认格式
    expect(result).toContain('## 角色');
    expect(result).toContain('## 背景');
    expect(result).toContain('## 思维框架');
    expect(result).toContain('## 执行步骤');
    expect(result).toContain('## 质量检查');
    expect(result).toContain('## 交互协议');
    
    // 验证前缀
    expect(result).toContain('你是你是一位专业的助手');
    
    // 验证自定义标签没有标题
    const customContent = '用户定义的自定义内容';
    const customIndex = result.indexOf(customContent);
    const customPrefix = result.substring(customIndex - 15, customIndex).trim();
    expect(customPrefix).not.toContain('##'); // 自定义标签默认无标题
  });

  /**
   * UT-FC-002: 自定义格式模板测试
   * 
   * 测试自定义格式模板是否能完全覆盖默认设置
   */
  it('自定义格式模板测试 (UT-FC-002)', async () => {
    // 解析和处理DPML
    const parseResult = await parse(fullDpmlText);
    const processedDoc = await process(parseResult.ast);

    // 创建完全自定义的格式模板
    const customTransformer = new PromptTransformer({
      formatTemplates: {
        role: {
          title: '# ROLE',
          prefix: 'As ',
          suffix: ', your task is important'
        },
        context: {
          title: '# CONTEXT',
          prefix: 'Situation: ',
          suffix: '.'
        },
        thinking: {
          title: '# THINKING FRAMEWORK',
          prefix: 'Think: ',
          suffix: ''
        },
        executing: {
          title: '# EXECUTION STEPS',
          prefix: 'Execute: ',
          suffix: ''
        },
        testing: {
          title: '# QUALITY CHECK',
          prefix: 'Verify: ',
          suffix: ''
        },
        protocol: {
          title: '# INTERACTION PROTOCOL',
          prefix: 'Protocol: ',
          suffix: ''
        },
        custom: {
          title: '# CUSTOM CONTENT',
          prefix: 'Custom: ',
          suffix: ''
        }
      }
    });

    // 转换为文本
    const result = customTransformer.transform(processedDoc);

    // 验证自定义格式已完全应用
    expect(result).toContain('# ROLE');
    expect(result).toContain('# CONTEXT');
    expect(result).toContain('# THINKING FRAMEWORK');
    expect(result).toContain('# EXECUTION STEPS');
    expect(result).toContain('# QUALITY CHECK');
    expect(result).toContain('# INTERACTION PROTOCOL');
    expect(result).toContain('# CUSTOM CONTENT');
    
    // 验证前缀和后缀
    expect(result).toContain('As 你是一位专业的助手, your task is important');
    expect(result).toContain('Situation: 用户需要你提供格式化文本的帮助.');
    expect(result).toContain('Think: 先理解用户需求，再制定合适的解决方案');
    expect(result).toContain('Custom: 用户定义的自定义内容');
  });

  /**
   * UT-FC-003: 标题前缀后缀测试
   * 
   * 测试标题、前缀和后缀组合效果
   */
  it('标题前缀后缀测试 (UT-FC-003)', async () => {
    // 简单的DPML
    const simpleDpml = `
      <prompt id="title-prefix-suffix-test">
        <role>助手</role>
      </prompt>
    `;
    
    // 解析和处理DPML
    const parseResult = await parse(simpleDpml);
    const processedDoc = await process(parseResult.ast);

    // 创建带有不同标题、前缀、后缀组合的转换器
    const customTransformer = new PromptTransformer({
      formatTemplates: {
        role: {
          title: '===ROLE===',
          prefix: '[',
          suffix: ']'
        }
      }
    });

    // 转换为文本
    const result = customTransformer.transform(processedDoc);

    // 验证标题、前缀和后缀
    expect(result).toContain('===ROLE===');
    expect(result).toContain('[你是助手]');
    
    // 测试没有标题的情况
    const noTitleTransformer = new PromptTransformer({
      formatTemplates: {
        role: {
          title: '',
          prefix: '<',
          suffix: '>'
        }
      }
    });
    
    // 转换为文本
    const noTitleResult = noTitleTransformer.transform(processedDoc);
    
    // 应该没有标题，但有前缀后缀
    expect(noTitleResult).not.toContain('===ROLE===');
    expect(noTitleResult).not.toContain('## 角色');
    expect(noTitleResult).toContain('<你是助手>');
  });

  /**
   * UT-FC-004: 内容包装器测试
   * 
   * 测试内容包装器函数的应用
   */
  it('内容包装器测试 (UT-FC-004)', async () => {
    // 简单的DPML
    const simpleDpml = `
      <prompt id="wrapper-test">
        <role>助手</role>
        <context>帮助用户</context>
      </prompt>
    `;
    
    // 解析和处理DPML
    const parseResult = await parse(simpleDpml);
    const processedDoc = await process(parseResult.ast);

    // 创建带有包装器函数的转换器
    const customTransformer = new PromptTransformer({
      formatTemplates: {
        role: {
          wrapper: (content) => content.toUpperCase(),
        },
        context: {
          wrapper: (content) => `**${content}**`,
        }
      }
    });

    // 转换为文本
    const result = customTransformer.transform(processedDoc);

    // 验证包装器效果
    expect(result).toContain('你是助手'.toUpperCase());
    expect(result).toContain('**帮助用户**');
    
    // 测试包装器与前缀后缀组合
    const combinedTransformer = new PromptTransformer({
      formatTemplates: {
        role: {
          prefix: '(',
          suffix: ')',
          wrapper: (content) => content.toUpperCase(),
        }
      }
    });
    
    // 转换为文本
    const combinedResult = combinedTransformer.transform(processedDoc);
    
    // 验证组合效果 (应该先应用包装器，再应用前缀后缀)
    expect(combinedResult).toContain('(你是助手'.toUpperCase() + ')');
  });

  /**
   * UT-FC-005: 标签顺序定制测试
   * 
   * 测试自定义标签顺序
   */
  it('标签顺序定制测试 (UT-FC-005)', async () => {
    // 解析和处理DPML
    const parseResult = await parse(fullDpmlText);
    const processedDoc = await process(parseResult.ast);

    // 创建带有自定义标签顺序的转换器
    const customOrderTransformer = new PromptTransformer({
      tagOrder: ['context', 'thinking', 'role', 'executing', 'testing', 'protocol', 'custom']
    });

    // 转换为文本
    const result = customOrderTransformer.transform(processedDoc);

    // 验证标签顺序
    const roleIndex = result.indexOf('## 角色');
    const contextIndex = result.indexOf('## 背景');
    const thinkingIndex = result.indexOf('## 思维框架');
    
    // context应该在role之前
    expect(contextIndex).toBeLessThan(roleIndex);
    // thinking应该在role之前
    expect(thinkingIndex).toBeLessThan(roleIndex);
    // context应该在thinking之前
    expect(contextIndex).toBeLessThan(thinkingIndex);
    
    // 颠倒顺序再测试一次
    const reversedOrderTransformer = new PromptTransformer({
      tagOrder: ['custom', 'protocol', 'testing', 'executing', 'thinking', 'context', 'role']
    });
    
    // 转换为文本
    const reversedResult = reversedOrderTransformer.transform(processedDoc);
    
    // 验证颠倒后的标签顺序
    const roleIndexR = reversedResult.indexOf('## 角色');
    const contextIndexR = reversedResult.indexOf('## 背景');
    const customIndex = reversedResult.indexOf('用户定义的自定义内容');
    
    // role应该在context之后
    expect(roleIndexR).toBeGreaterThan(contextIndexR);
    // custom应该在最前面
    expect(customIndex).toBeLessThan(contextIndexR);
    expect(customIndex).toBeLessThan(roleIndexR);
  });

  /**
   * UT-FC-006: 部分格式覆盖测试
   * 
   * 测试只覆盖部分标签的格式
   */
  it('部分格式覆盖测试 (UT-FC-006)', async () => {
    // 解析和处理DPML
    const parseResult = await parse(fullDpmlText);
    const processedDoc = await process(parseResult.ast);

    // 创建只覆盖部分标签格式的转换器
    const partialOverrideTransformer = new PromptTransformer({
      formatTemplates: {
        // 只覆盖role和context的格式
        role: {
          title: '# ROLE OVERRIDE',
          prefix: 'ROLE: '
        },
        context: {
          title: '# CONTEXT OVERRIDE',
          prefix: 'CONTEXT: '
        }
        // 其他标签使用默认格式
      }
    });

    // 转换为文本
    const result = partialOverrideTransformer.transform(processedDoc);

    // 验证被覆盖的格式
    expect(result).toContain('# ROLE OVERRIDE');
    expect(result).toContain('ROLE: 你是一位专业的助手');
    expect(result).toContain('# CONTEXT OVERRIDE');
    expect(result).toContain('CONTEXT: 用户需要你提供格式化文本的帮助');
    
    // 验证未覆盖的格式保持默认
    expect(result).toContain('## 思维框架');
    expect(result).toContain('## 执行步骤');
    expect(result).toContain('## 质量检查');
    expect(result).toContain('## 交互协议');
  });
}); 