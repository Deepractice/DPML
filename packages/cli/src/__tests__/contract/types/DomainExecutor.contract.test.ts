import { describe, test, expect } from 'vitest';

import type { DomainExecutor } from '../../../types/DomainExecutor';
import type { DomainInfo } from '../../../types/DomainInfo';

describe('CT-TYPE-DEXEC', () => {
  test('DomainExecutor interface should maintain structural stability (CT-TYPE-DEXEC-01)', () => {
    // 创建标准DomainInfo对象
    const domainInfo: DomainInfo = {
      name: 'test',
      packageName: '@dpml/test',
      source: 'npx',
      version: '1.0.0'
    };

    // 创建最小实现的DomainExecutor
    const executor: DomainExecutor = {
      getDomainInfo: () => domainInfo,
      execute: async () => {}
    };

    // 验证所需方法存在
    expect(executor).toHaveProperty('getDomainInfo');
    expect(executor).toHaveProperty('execute');

    // 验证方法类型
    expect(typeof executor.getDomainInfo).toBe('function');
    expect(typeof executor.execute).toBe('function');
  });

  test('DomainExecutor.execute should handle args parameter correctly (CT-TYPE-DEXEC-02)', async () => {
    // 创建标准DomainInfo对象
    const domainInfo: DomainInfo = {
      name: 'test',
      packageName: '@dpml/test',
      source: 'npx',
      version: '1.0.0'
    };

    // 创建带参数验证的执行器
    const executor: DomainExecutor = {
      getDomainInfo: () => domainInfo,
      execute: async (args: string[]) => {
        // 验证可以接收string[]参数
        expect(Array.isArray(args)).toBe(true);
        expect(args).toEqual(['arg1', 'arg2']);
      }
    };

    // 测试方法签名和参数传递
    const result = executor.execute(['arg1', 'arg2']);

    expect(result).toBeInstanceOf(Promise);
    await result;

    // 验证getDomainInfo返回正确的DomainInfo
    const info = executor.getDomainInfo();

    expect(info).toEqual(domainInfo);
  });
});
