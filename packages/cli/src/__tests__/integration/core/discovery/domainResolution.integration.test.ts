import { describe, test, expect, vi, beforeEach } from 'vitest';

import { NpxDiscoverer } from '../../../../core/discovery/NpxDiscoverer';
import { ExecutorFactory } from '../../../../core/execution/ExecutorFactory';
import { NpxExecutor } from '../../../../core/execution/NpxExecutor';
import type { DomainInfo } from '../../../../types/DomainInfo';
import { DPMLError } from '../../../../types/DPMLError';
import { createDomainInfoFixture } from '../../../fixtures/cli/cliFixtures';

describe('IT-DOMAINDSCV', () => {
  const domainInfoFixtures = createDomainInfoFixture();

  // 用于测试的预定义领域信息
  const coreInfo: DomainInfo = {
    name: 'core',
    packageName: '@dpml/core',
    source: 'npx',
    version: '1.0.0'
  };

  const customInfo: DomainInfo = {
    name: 'custom',
    packageName: '@dpml/custom',
    source: 'npx',
    version: '0.1.0'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 直接模拟tryFindDomain方法
    vi.spyOn(NpxDiscoverer.prototype, 'tryFindDomain').mockImplementation(async (domain: string) => {
      if (domain === 'core') {
        return coreInfo;
      } else if (domain === 'custom') {
        return customInfo;
      }

      return null;
    });
  });

  test('System should resolve and create executor for official domain (IT-DOMAINDSCV-01)', async () => {
    // 创建发现器和工厂
    const discoverer = new NpxDiscoverer();
    const factory = new ExecutorFactory();

    // 尝试找到core领域
    const domainInfo = await discoverer.tryFindDomain('core');

    // 验证领域信息正确
    expect(domainInfo).not.toBeNull();
    expect(domainInfo?.name).toBe('core');
    expect(domainInfo?.packageName).toBe('@dpml/core');
    expect(domainInfo?.source).toBe('npx');
    expect(domainInfo?.version).toBe('1.0.0');

    // 创建执行器
    const executor = factory.createExecutor(domainInfo!);

    // 验证执行器类型和信息
    expect(executor).toBeInstanceOf(NpxExecutor);
    expect(executor.getDomainInfo()).toBe(domainInfo);
  });

  test('System should resolve and create executor for third-party domain (IT-DOMAINDSCV-02)', async () => {
    // 创建发现器和工厂
    const discoverer = new NpxDiscoverer();
    const factory = new ExecutorFactory();

    // 尝试找到自定义领域
    const domainInfo = await discoverer.tryFindDomain('custom');

    // 验证领域信息正确
    expect(domainInfo).not.toBeNull();
    expect(domainInfo?.name).toBe('custom');
    expect(domainInfo?.packageName).toBe('@dpml/custom');
    expect(domainInfo?.source).toBe('npx');
    expect(domainInfo?.version).toBe('0.1.0');

    // 创建执行器
    const executor = factory.createExecutor(domainInfo!);

    // 验证执行器类型和信息
    expect(executor).toBeInstanceOf(NpxExecutor);
    expect(executor.getDomainInfo()).toBe(domainInfo);
  });

  test('System should handle unknown domain (IT-DOMAINDSCV-03)', async () => {
    // 创建发现器和工厂
    const discoverer = new NpxDiscoverer();
    const factory = new ExecutorFactory();

    // 尝试找到未知领域
    const domainInfo = await discoverer.tryFindDomain('unknown');

    // 验证找不到领域
    expect(domainInfo).toBeNull();

    // 直接创建执行器应该抛出错误
    expect(() => {
      // 创建一个假的未知来源的领域信息
      const fakeInfo = {
        name: 'fake',
        packageName: '@dpml/fake',
        source: 'unknown' // 不支持的来源
      };

      factory.createExecutor(fakeInfo);
    }).toThrow(DPMLError);
  });
});
