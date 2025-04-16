/**
 * @dpml/prompt 模块系统兼容性测试
 *
 * 测试ID: CT-P-004
 * 测试目标: 验证在CommonJS和ESM模块系统中系统正常工作
 */

import { describe, it, expect } from 'vitest';

import * as promptExports from '../..';
import { generatePrompt, processPrompt, transformPrompt } from '../../api';

import { isESMEnvironment } from './utils/environmentHelpers';

describe('模块系统兼容性测试 (CT-P-004)', () => {
  it('应该检测当前模块系统环境', () => {
    // 记录当前环境
    const isESM = isESMEnvironment();

    console.log(`当前运行环境: ${isESM ? 'ESM' : 'CommonJS'}`);
    expect(true).toBeTruthy(); // 这只是为了记录环境
  });

  it('所有API函数应该在当前模块系统中正常导出', () => {
    // 检查主要API是否正确导出
    expect(typeof promptExports.generatePrompt).toBe('function');
    expect(typeof promptExports.processPrompt).toBe('function');
    expect(typeof promptExports.transformPrompt).toBe('function');
  });

  it('应该在当前模块系统中正常处理和转换提示', async () => {
    const simpleDpml = `
      <prompt>
        <role>测试助手</role>
        <context>这是模块系统兼容性测试</context>
      </prompt>
    `;

    // 确保处理功能在当前模块系统中正常工作
    const processed = await processPrompt(simpleDpml);

    expect(processed).toBeDefined();
    expect(processed.tags).toBeDefined();

    // 打印处理后的结果结构，用于调试
    console.log(
      '处理后的结果结构:',
      JSON.stringify(
        {
          tags: Object.keys(processed.tags),
          metadata: processed.metadata,
        },
        null,
        2
      )
    );

    // 更简单的测试方式，只验证转换是否正常工作
    const transformed = transformPrompt(processed);

    expect(transformed).toBeDefined();
    expect(typeof transformed).toBe('string');
    expect(transformed.length).toBeGreaterThan(0);
  });

  it('组合API应该在当前模块系统中正常工作', async () => {
    const simpleDpml = `
      <prompt>
        <role>测试助手</role>
        <context>这是模块系统组合API测试</context>
      </prompt>
    `;

    // 测试组合API (generatePrompt)
    const result = await generatePrompt(simpleDpml);

    expect(result).toBeDefined();
    expect(result).toContain('测试助手');
    expect(result).toContain('这是模块系统组合API测试');
  });
});
