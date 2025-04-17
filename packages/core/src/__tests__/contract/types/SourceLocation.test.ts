/**
 * SourceLocation接口契约测试
 */
import { describe, test, expect } from 'vitest';

import type { SourceLocation } from '../../../types';

describe('CT-SourceLocation-Structure', () => {
  test('should have all required properties', () => {
    // 创建符合SourceLocation接口的对象
    const location: SourceLocation = {
      startLine: 1,
      startColumn: 5,
      endLine: 2,
      endColumn: 10,
      fileName: 'test.dpml',
      sourceText: '<root>\n  <child></child>\n</root>',
      getLineSnippet: () => '<root>'
    };

    // 验证所有必要属性存在
    expect(location).toHaveProperty('startLine');
    expect(location).toHaveProperty('startColumn');
    expect(location).toHaveProperty('endLine');
    expect(location).toHaveProperty('endColumn');
    expect(location).toHaveProperty('getLineSnippet');

    // 验证位置属性是数字类型
    expect(typeof location.startLine).toBe('number');
    expect(typeof location.startColumn).toBe('number');
    expect(typeof location.endLine).toBe('number');
    expect(typeof location.endColumn).toBe('number');

    // 验证可选属性类型
    expect(typeof location.fileName).toBe('string');
    expect(typeof location.sourceText).toBe('string');

    // 验证方法存在和类型
    expect(typeof location.getLineSnippet).toBe('function');
    expect(typeof location.getLineSnippet()).toBe('string');
  });

  test('should support optional properties', () => {
    // 创建只有必要属性的SourceLocation
    const location: SourceLocation = {
      startLine: 1,
      startColumn: 5,
      endLine: 2,
      endColumn: 10,
      getLineSnippet: () => ''
    };

    // 验证位置属性存在
    expect(location.startLine).toBe(1);
    expect(location.startColumn).toBe(5);
    expect(location.endLine).toBe(2);
    expect(location.endColumn).toBe(10);

    // 验证可选属性是未定义的
    expect(location.fileName).toBeUndefined();
    expect(location.sourceText).toBeUndefined();
  });
});
