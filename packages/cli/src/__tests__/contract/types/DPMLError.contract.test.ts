import { describe, test, expect } from 'vitest';

import { DPMLError, DPMLErrorType } from '../../../types/DPMLError';

describe('CT-TYPE-ERROR', () => {
  test('DPMLError class should maintain structural stability (CT-TYPE-ERROR-01)', () => {
    // 创建带所有参数的错误实例
    const cause = new Error('Original error');
    const error = new DPMLError(
      'Test error message',
      DPMLErrorType.COMMAND,
      'TEST_ERROR_CODE',
      cause
    );

    // 验证实例是Error的子类
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DPMLError);

    // 验证属性存在和类型
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('type');
    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('cause');
    expect(error.name).toBe('DPMLError');

    expect(error.message).toBe('Test error message');
    expect(error.type).toBe(DPMLErrorType.COMMAND);
    expect(error.code).toBe('TEST_ERROR_CODE');
    expect(error.cause).toBe(cause);

    // 测试默认参数
    const defaultError = new DPMLError('Default error');

    expect(defaultError.type).toBe(DPMLErrorType.UNKNOWN);
    expect(defaultError.code).toBe('DPML_ERROR');
    expect(defaultError.cause).toBeUndefined();
  });

  test('DPMLErrorType enum should maintain value stability (CT-TYPE-ERROR-02)', () => {
    // 验证所有预期的枚举值存在
    expect(DPMLErrorType).toHaveProperty('COMMAND');
    expect(DPMLErrorType).toHaveProperty('DISCOVERY');
    expect(DPMLErrorType).toHaveProperty('EXECUTION');
    expect(DPMLErrorType).toHaveProperty('CONFIG');
    expect(DPMLErrorType).toHaveProperty('UNKNOWN');

    // 验证枚举值的内容
    expect(DPMLErrorType.COMMAND).toBe('COMMAND');
    expect(DPMLErrorType.DISCOVERY).toBe('DISCOVERY');
    expect(DPMLErrorType.EXECUTION).toBe('EXECUTION');
    expect(DPMLErrorType.CONFIG).toBe('CONFIG');
    expect(DPMLErrorType.UNKNOWN).toBe('UNKNOWN');

    // 使用枚举创建错误
    const commandError = new DPMLError('Command error', DPMLErrorType.COMMAND);
    const discoveryError = new DPMLError('Discovery error', DPMLErrorType.DISCOVERY);
    const executionError = new DPMLError('Execution error', DPMLErrorType.EXECUTION);
    const configError = new DPMLError('Config error', DPMLErrorType.CONFIG);
    const unknownError = new DPMLError('Unknown error', DPMLErrorType.UNKNOWN);

    expect(commandError.type).toBe(DPMLErrorType.COMMAND);
    expect(discoveryError.type).toBe(DPMLErrorType.DISCOVERY);
    expect(executionError.type).toBe(DPMLErrorType.EXECUTION);
    expect(configError.type).toBe(DPMLErrorType.CONFIG);
    expect(unknownError.type).toBe(DPMLErrorType.UNKNOWN);
  });
});
