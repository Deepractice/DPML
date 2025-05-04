import { describe, test, expect } from 'vitest';

import type { DomainDiscoverer } from '../../../types/DomainDiscoverer';
import type { DomainInfo } from '../../../types/DomainInfo';

describe('CT-TYPE-DSCVR', () => {
  test('DomainDiscoverer interface should maintain structural stability (CT-TYPE-DSCVR-01)', () => {
    // 创建最小实现的DomainDiscoverer
    const discoverer: DomainDiscoverer = {
      tryFindDomain: async () => null,
      listDomains: async () => [],
      getName: () => 'test'
    };

    // 验证所需方法存在
    expect(discoverer).toHaveProperty('tryFindDomain');
    expect(discoverer).toHaveProperty('listDomains');
    expect(discoverer).toHaveProperty('getName');

    // 验证方法类型
    expect(typeof discoverer.tryFindDomain).toBe('function');
    expect(typeof discoverer.listDomains).toBe('function');
    expect(typeof discoverer.getName).toBe('function');
  });

  test('DomainDiscoverer.tryFindDomain should return Promise<DomainInfo|null> (CT-TYPE-DSCVR-02)', async () => {
    // 创建模拟发现器，返回特定DomainInfo
    const mockDomainInfo: DomainInfo = {
      name: 'test',
      packageName: '@dpml/test',
      source: 'npx',
      version: '1.0.0'
    };

    const discovererWithDomain: DomainDiscoverer = {
      tryFindDomain: async () => mockDomainInfo,
      listDomains: async () => [mockDomainInfo],
      getName: () => 'test'
    };

    // 创建模拟发现器，返回null
    const discovererWithoutDomain: DomainDiscoverer = {
      tryFindDomain: async () => null,
      listDomains: async () => [],
      getName: () => 'test'
    };

    // 验证返回类型
    const resultWithDomain = await discovererWithDomain.tryFindDomain('test');

    expect(resultWithDomain).toEqual(mockDomainInfo);

    const resultWithoutDomain = await discovererWithoutDomain.tryFindDomain('nonexistent');

    expect(resultWithoutDomain).toBeNull();
  });
});
