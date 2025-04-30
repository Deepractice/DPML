/**
 * CLI接口契约测试
 * 验证CLI接口的结构稳定性
 */

import { describe, test, expect } from 'vitest';

import type { CLITypes } from '../../../types/CLITypes';

describe('CLI接口契约测试', () => {
  // CT-TYPE-CLITypes-01: CLI接口应维持结构稳定性
  test('CLI接口应维持结构稳定性', () => {
    // 准备 - 创建符合接口定义的对象
    const cli: CLITypes = {
      execute: async () => {},
      showHelp: () => {},
      showVersion: () => {}
    };

    // 断言 - 验证接口定义包含所有规定方法
    expect(cli).toHaveProperty('execute');
    expect(cli).toHaveProperty('showHelp');
    expect(cli).toHaveProperty('showVersion');

    // 验证方法类型
    expect(cli.execute).toBeTypeOf('function');
    expect(cli.showHelp).toBeTypeOf('function');
    expect(cli.showVersion).toBeTypeOf('function');

    // 验证execute方法返回Promise<void>
    const executeResult = cli.execute();

    expect(executeResult).toBeInstanceOf(Promise);
  });

  // CT-TYPE-CLITypes-02: CLITypes.execute应返回Promise<void>
  test('CLITypes.execute应返回Promise<void>', async () => {
    // 准备 - 创建一个返回解决的Promise的execute方法
    const cli: CLITypes = {
      execute: async () => {
        // 返回一个解决的Promise<void>
        return;
      },
      showHelp: () => {},
      showVersion: () => {}
    };

    // 执行
    const result = cli.execute();

    // 断言 - 验证返回类型为Promise
    expect(result).toBeInstanceOf(Promise);

    // 等待Promise解决，验证没有返回值（void）
    const resolved = await result;

    expect(resolved).toBeUndefined();
  });
});
