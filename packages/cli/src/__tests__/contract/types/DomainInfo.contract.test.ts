import { describe, test, expect } from 'vitest';

import type { DomainInfo } from '../../../types/DomainInfo';

describe('CT-TYPE-DINFO', () => {
  test('DomainInfo interface should maintain structural stability (CT-TYPE-DINFO-01)', () => {
    // 创建最小实现的DomainInfo
    const domainInfo: DomainInfo = {
      name: 'test',
      packageName: '@dpml/test',
      source: 'npx'
    };

    // 验证必须字段存在
    expect(domainInfo).toHaveProperty('name');
    expect(domainInfo).toHaveProperty('packageName');
    expect(domainInfo).toHaveProperty('source');

    // 验证字段类型
    expect(typeof domainInfo.name).toBe('string');
    expect(typeof domainInfo.packageName).toBe('string');
    expect(typeof domainInfo.source).toBe('string');
  });

  test('DomainInfo.version should be optional (CT-TYPE-DINFO-02)', () => {
    // 创建没有version的DomainInfo
    const domainInfoWithoutVersion: DomainInfo = {
      name: 'test1',
      packageName: '@dpml/test1',
      source: 'npx'
    };

    // 创建带有version的DomainInfo
    const domainInfoWithVersion: DomainInfo = {
      name: 'test2',
      packageName: '@dpml/test2',
      source: 'npx',
      version: '1.0.0'
    };

    // 验证两种情况都符合接口定义
    expect(domainInfoWithoutVersion.version).toBeUndefined();
    expect(domainInfoWithVersion.version).toBe('1.0.0');

    // 测试类型兼容性
    const infoArray: DomainInfo[] = [
      domainInfoWithoutVersion,
      domainInfoWithVersion
    ];

    expect(infoArray.length).toBe(2);
    expect(infoArray[0].name).toBe('test1');
    expect(infoArray[1].version).toBe('1.0.0');
  });
});
