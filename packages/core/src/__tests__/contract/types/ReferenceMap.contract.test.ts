import { describe, test, expect } from 'vitest';

import type { ReferenceMap, DPMLNode } from '../../../types';

/**
 * ReferenceMap接口契约测试
 * 验证引用映射接口的结构稳定性和只读映射类型
 */
describe('ReferenceMap Interface Contract', () => {
  // CT-TYPE-REFMAP-01: ReferenceMap 接口应维持结构稳定性
  test('ReferenceMap 接口应维持结构稳定性', () => {
    // 创建符合接口的对象
    const mockNode = {} as DPMLNode;
    const idMap = new Map([['test-id', mockNode]]);

    const referenceMap: ReferenceMap = {
      idMap
    };

    // 验证基本结构
    expect(referenceMap).toHaveProperty('idMap');
    expect(referenceMap.idMap).toBeInstanceOf(Map);
    expect(referenceMap.idMap.size).toBe(1);
    expect(referenceMap.idMap.get('test-id')).toBe(mockNode);

    // 验证类型结构（仅在编译时有效，运行时不会执行）

    const typedMap: {
      idMap: ReadonlyMap<string, DPMLNode>;
    } = referenceMap;
  });

  // CT-TYPE-REFMAP-02: ReferenceMap.idMap 应为 ReadonlyMap 类型
  test('ReferenceMap.idMap 应为 ReadonlyMap 类型', () => {
    // 创建基本引用映射
    const mockNode1 = {} as DPMLNode;
    const mockNode2 = {} as DPMLNode;
    const idMap = new Map([
      ['id-1', mockNode1],
      ['id-2', mockNode2]
    ]);

    const referenceMap: ReferenceMap = {
      idMap
    };

    // 以下代码应在TypeScript编译时报错（仅为验证只读类型，不会执行）
    const testReadOnly = () => {
      // @ts-expect-error: ReadonlyMap不允许set操作
      referenceMap.idMap.set('id-3', {} as DPMLNode);
      // @ts-expect-error: ReadonlyMap不允许clear操作
      referenceMap.idMap.clear();
      // @ts-expect-error: ReadonlyMap不允许delete操作
      referenceMap.idMap.delete('id-1');
    };

    // 运行时验证Map内容
    expect(referenceMap.idMap.size).toBe(2);
    expect(referenceMap.idMap.has('id-1')).toBe(true);
    expect(referenceMap.idMap.has('id-2')).toBe(true);
    expect(referenceMap.idMap.get('id-1')).toBe(mockNode1);
    expect(referenceMap.idMap.get('id-2')).toBe(mockNode2);

    // 验证Map只读方法可用
    const keys = Array.from(referenceMap.idMap.keys());

    expect(keys).toContain('id-1');
    expect(keys).toContain('id-2');

    const values = Array.from(referenceMap.idMap.values());

    expect(values).toContain(mockNode1);
    expect(values).toContain(mockNode2);

    const entries = Array.from(referenceMap.idMap.entries());

    expect(entries).toContainEqual(['id-1', mockNode1]);
    expect(entries).toContainEqual(['id-2', mockNode2]);
  });
});
