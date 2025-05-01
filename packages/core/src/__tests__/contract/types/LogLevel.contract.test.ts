/**
 * LogLevel枚举契约测试
 *
 * 这些测试确保LogLevel枚举的稳定性，防止意外的破坏性变更。
 */
import { describe, it, expect } from 'vitest';

import { LogLevel } from '../../../types/log';

describe('LogLevel枚举契约测试', () => {
  // CT-TYPE-LVL-01: LogLevel枚举应维持稳定性
  it('CT-TYPE-LVL-01: LogLevel枚举应维持稳定性', () => {
    // 验证LogLevel枚举包含所有必需的值
    expect(LogLevel).toHaveProperty('DEBUG');
    expect(LogLevel).toHaveProperty('INFO');
    expect(LogLevel).toHaveProperty('WARN');
    expect(LogLevel).toHaveProperty('ERROR');
    expect(LogLevel).toHaveProperty('FATAL');

    // 验证枚举可以正常使用
    const level = LogLevel.INFO;

    expect(level).toBeDefined();
  });

  // CT-TYPE-LVL-02: LogLevel枚举值应维持正确的数值顺序
  it('CT-TYPE-LVL-02: LogLevel枚举值应维持正确的数值顺序', () => {
    // 验证枚举值的数值顺序
    expect(LogLevel.DEBUG).toBe(0);
    expect(LogLevel.INFO).toBe(1);
    expect(LogLevel.WARN).toBe(2);
    expect(LogLevel.ERROR).toBe(3);
    expect(LogLevel.FATAL).toBe(4);

    // 验证严重程度递增
    expect(LogLevel.DEBUG < LogLevel.INFO).toBe(true);
    expect(LogLevel.INFO < LogLevel.WARN).toBe(true);
    expect(LogLevel.WARN < LogLevel.ERROR).toBe(true);
    expect(LogLevel.ERROR < LogLevel.FATAL).toBe(true);
  });
});
