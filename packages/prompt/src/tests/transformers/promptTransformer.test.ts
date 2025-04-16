/**
 * @dpml/prompt PromptTransformer测试
 *
 * 测试ID:
 * - UT-PT-001: 基本转换功能
 * - UT-PT-002: 标签序列化测试
 * - UT-PT-003: 转换选项配置
 * - UT-PT-004: 空值处理
 * - UT-PT-005: Markdown转换
 */

import { parse, process } from '@dpml/core';
import { describe, it, expect, beforeEach } from 'vitest';

import { PromptTransformer } from '../../transformers/promptTransformer';

describe('PromptTransformer基础功能测试', () => {
  // 测试组件
  let transformer: PromptTransformer;

  beforeEach(() => {
    // 创建转换器实例
    transformer = new PromptTransformer();
  });

  /**
   * UT-PT-001: 基本转换功能测试
   *
   * 测试基本的DPML提示转换为纯文本
   */
  it('基本转换功能 (UT-PT-001)', async () => {
    // 基础DPML文本
    const dpmlText = `
      <prompt id="test-prompt">
        <role>你是一位助手</role>
        <context>用户正在请求帮助</context>
      </prompt>
    `;

    // 解析和处理DPML
    const parseResult = await parse(dpmlText);
    const processedDoc = await process(parseResult.ast);

    // 转换为文本
    const result = transformer.transform(processedDoc);

    // 验证结果
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toContain('你是一位助手');
    expect(result).toContain('用户正在请求帮助');
  });

  /**
   * UT-PT-002: 标签序列化测试
   *
   * 测试不同标签的序列化格式是否符合预期
   */
  it('标签序列化测试 (UT-PT-002)', async () => {
    // 包含所有标签的DPML
    const dpmlText = `
      <prompt id="full-prompt">
        <role>你是一位助手</role>
        <context>用户需要帮助</context>
        <thinking>思考问题的多个方面</thinking>
        <executing>按步骤执行任务</executing>
        <testing>检查结果的正确性</testing>
        <protocol>按照规定格式响应</protocol>
        <custom>自定义内容</custom>
      </prompt>
    `;

    // 解析和处理DPML
    const parseResult = await parse(dpmlText);
    const processedDoc = await process(parseResult.ast);

    // 转换为文本
    const result = transformer.transform(processedDoc);

    // 验证每个标签的转换结果
    expect(result).toContain('你是一位助手');
    expect(result).toContain('用户需要帮助');
    expect(result).toContain('思考问题的多个方面');
    expect(result).toContain('按步骤执行任务');
    expect(result).toContain('检查结果的正确性');
    expect(result).toContain('按照规定格式响应');
    expect(result).toContain('自定义内容');

    // 验证标签顺序和分隔
    const sections = result.split(/\n{2,}/);

    expect(sections.length).toBeGreaterThanOrEqual(7); // 至少有7个部分
  });

  /**
   * UT-PT-003: 转换选项配置测试
   *
   * 测试转换选项如何影响输出结果
   */
  it('转换选项配置测试 (UT-PT-003)', async () => {
    // 基础DPML文本
    const dpmlText = `
      <prompt id="test-prompt">
        <role>你是一位助手</role>
        <context>用户正在请求帮助</context>
      </prompt>
    `;

    // 解析和处理DPML
    const parseResult = await parse(dpmlText);
    const processedDoc = await process(parseResult.ast);

    // 使用自定义格式模板
    const customTransformer = new PromptTransformer({
      formatTemplates: {
        role: {
          title: '# 角色定义',
          prefix: '作为',
          suffix: '，你需要提供帮助',
        },
        context: {
          title: '# 背景信息',
          prefix: '当前情境：',
        },
      },
    });

    // 转换为文本
    const result = customTransformer.transform(processedDoc);

    // 验证自定义格式已应用
    expect(result).toContain('# 角色定义');
    expect(result).toContain('作为你是一位助手，你需要提供帮助');
    expect(result).toContain('# 背景信息');
    expect(result).toContain('当前情境：用户正在请求帮助');
  });

  /**
   * UT-PT-004: 空值处理测试
   *
   * 测试空标签和空内容的处理
   */
  it('空值处理测试 (UT-PT-004)', async () => {
    // 包含空标签的DPML
    const dpmlText = `
      <prompt id="empty-content-prompt">
        <role></role>
        <context>用户正在请求帮助</context>
        <thinking>
        </thinking>
      </prompt>
    `;

    // 解析和处理DPML
    const parseResult = await parse(dpmlText);
    const processedDoc = await process(parseResult.ast);

    // 转换为文本
    const result = transformer.transform(processedDoc);

    // 验证结果不包含多余空行
    expect(result).not.toContain('\n\n\n'); // 不应有连续三个换行

    // 验证空标签处理
    const lines = result.split('\n').filter(line => line.trim() !== '');

    expect(lines.length).toBeGreaterThan(0); // 至少有一行内容
  });

  /**
   * UT-PT-005: Markdown转换测试
   *
   * 测试Markdown内容的转换
   */
  it('Markdown转换测试 (UT-PT-005)', async () => {
    // 包含Markdown内容的DPML
    const dpmlText = `
      <prompt id="markdown-prompt">
        <role>你是一位**技术文档**撰写专家</role>
        <context>
          用户需要帮助编写以下格式的文档：
          
          ## 文档结构
          
          1. 引言
          2. 主体内容
          3. 结论
          
          > 引用部分示例
          
          \`\`\`js
          // 代码示例
          function example() {
            return 'test';
          }
          \`\`\`
        </context>
      </prompt>
    `;

    // 解析和处理DPML
    const parseResult = await parse(dpmlText);
    const processedDoc = await process(parseResult.ast);

    // 转换为文本
    const result = transformer.transform(processedDoc);

    // 验证Markdown内容被正确保留
    expect(result).toContain('**技术文档**');
    expect(result).toContain('## 文档结构');
    expect(result).toContain('1. 引言');
    expect(result).toContain('> 引用部分示例');
    expect(result).toContain('```js');
    expect(result).toContain('function example()');
  });
});
