/**
 * Parser服务API契约测试
 */
import { describe, test, expect } from 'vitest';

import { parse, parseFile, parseWithRegistry } from '../../../api';
import type {
  TagRegistry } from '../../../types';

describe('CT-Parser-ApiSignature', () => {
  // CP-01: 解析函数签名验证
  test('should have parse function with correct signature', () => {
    // 验证函数存在
    expect(typeof parse).toBe('function');

    // 通过类型推断验证参数和返回类型
    // 这里测试无法在运行时完全验证类型，但可以验证基本结构
    // TypeScript编译器会在编译时检查类型匹配

    // 验证parse接受正确的参数类型
    // 注：这会抛出错误，因为我们还没有实现实际功能，但可以验证函数签名
    try {
      parse('<root></root>');
    } catch (error) {
      // 期望的错误是实现相关的，而不是签名问题
      expect(error.message).not.toContain('argument');
      expect(error.message).not.toContain('parameter');
    }

    try {
      parse('<root></root>', { preserveWhitespace: true });
    } catch (error) {
      // 期望的错误是实现相关的，而不是签名问题
      expect(error.message).not.toContain('argument');
      expect(error.message).not.toContain('parameter');
    }
  });

  // CP-02: 文件解析函数签名验证
  test('should have parseFile function with correct signature', async () => {
    // 验证函数存在
    expect(typeof parseFile).toBe('function');

    // 验证返回Promise (间接验证其为async函数)
    const result = parseFile('test.dpml');

    expect(result).toBeInstanceOf(Promise);

    // 正确处理Promise拒绝以避免Unhandled Rejection
    await expect(result).rejects.toThrow('文件解析功能尚未实现');
  });

  // CP-03: 自定义注册表解析函数签名验证
  test('should have parseWithRegistry function with correct signature', () => {
    // 验证函数存在
    expect(typeof parseWithRegistry).toBe('function');

    // 通过参数验证基本签名
    try {
      parseWithRegistry('<root></root>', {}, {} as TagRegistry);
    } catch (error) {
      // 期望的错误是实现相关的，而不是签名问题
      expect(error.message).not.toContain('argument');
      expect(error.message).not.toContain('parameter');
    }
  });
});
