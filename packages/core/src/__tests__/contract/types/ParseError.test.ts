/**
 * ParseError类契约测试
 */
import { describe, test, expect } from 'vitest';

import type { SourceLocation } from '../../../types';
import { ParseError } from '../../../types';

describe('CT-ParseError-Structure', () => {
  // CE-01: 解析错误类型验证
  test('should extend Error class', () => {
    // 创建测试所需的源位置
    const location: SourceLocation = {
      startLine: 1,
      startColumn: 10,
      endLine: 1,
      endColumn: 15,
      getLineSnippet: () => 'test snippet'
    };

    // 创建ParseError实例
    const error = new ParseError('Test error message', location);

    // 验证是Error的实例
    expect(error).toBeInstanceOf(Error);

    // 验证有自定义名称
    expect(error.name).toBe('ParseError');

    // 验证包含必要属性
    expect(error).toHaveProperty('location');
    expect(error.location).toBe(location);

    // 验证有必要的方法
    expect(typeof error.getFormattedMessage).toBe('function');
    expect(typeof error.getFormattedMessage()).toBe('string');
  });

  test('should accept additional options', () => {
    // 创建测试所需的源位置
    const location: SourceLocation = {
      startLine: 1,
      startColumn: 10,
      endLine: 1,
      endColumn: 15,
      getLineSnippet: () => 'test snippet'
    };

    // 创建带额外选项的ParseError
    const context = { tagName: 'test-tag' };
    const suggestion = 'Try closing the tag';
    const cause = new Error('Original error');

    const error = new ParseError('Test error message', location, {
      context,
      suggestion,
      cause
    });

    // 验证选项被正确设置
    expect(error.context).toBe(context);
    expect(error.suggestion).toBe(suggestion);

    // 验证格式化消息包含建议
    const formattedMessage = error.getFormattedMessage();

    expect(formattedMessage).toContain('Test error message');
    expect(formattedMessage).toContain('提示: Try closing the tag');
  });
});
