import { describe, test, expect } from 'vitest';

import type { CommandAdapter } from '../../../types/CommandAdapter';

describe('CT-TYPE-CMDADP', () => {
  test('CommandAdapter interface should maintain structural stability (CT-TYPE-CMDADP-01)', () => {
    // 创建一个最小实现的CommandAdapter，验证结构稳定性
    const adapter: CommandAdapter = {
      parseAndExecute: async () => {},
      getVersion: async () => '1.0.0'
    };

    // 验证所需方法存在
    expect(adapter).toHaveProperty('parseAndExecute');
    expect(adapter).toHaveProperty('getVersion');

    // 验证方法类型
    expect(typeof adapter.parseAndExecute).toBe('function');
    expect(typeof adapter.getVersion).toBe('function');
  });

  test('CommandAdapter methods should maintain signature stability (CT-TYPE-CMDADP-02)', async () => {
    // 创建模拟适配器
    const adapter: CommandAdapter = {
      parseAndExecute: async (args: string[]) => {
        // 验证可以接收string[]参数
        expect(Array.isArray(args)).toBe(true);

        return Promise.resolve();
      },
      getVersion: async () => {
        // 验证返回string
        return '1.0.0';
      }
    };

    // 测试方法签名
    const parseResult = adapter.parseAndExecute(['test']);

    expect(parseResult).toBeInstanceOf(Promise);
    await parseResult;

    const versionResult = await adapter.getVersion();

    expect(typeof versionResult).toBe('string');
  });
});
