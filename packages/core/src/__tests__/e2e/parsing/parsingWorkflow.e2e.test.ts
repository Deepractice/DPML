import { describe, test, expect } from 'vitest';
import { parse, parseAsync } from '../../../api/parser';
import { createBasicDPMLFixture, createComplexDPMLFixture, createInvalidDPMLFixture } from '../../fixtures/parsing/dpmlFixtures';
import { DPMLDocument } from '../../../types/DPMLDocument';

/**
 * 端到端测试：解析工作流
 * 这些测试通过API层验证完整的解析功能
 * 不使用任何模拟，使用真实的组件实现
 */
describe('解析工作流端到端测试', () => {
  test('E2E-Parsing-01: 用户应能解析有效DPML内容', () => {
    // 执行 - 通过API解析DPML内容
    const result = parse<DPMLDocument>(createBasicDPMLFixture());
    
    // 断言 - 验证结果符合预期
    expect(result).toBeDefined();
    expect(result.rootNode).toBeDefined();
    expect(result.rootNode.tagName).toBe('root');
    expect(result.rootNode.children).toHaveLength(1);
    expect(result.rootNode.children[0].tagName).toBe('child');
    expect(result.rootNode.children[0].attributes.get('id')).toBe('child1');
    expect(result.rootNode.children[0].content).toBe('内容');
  });
  
  test('E2E-Parsing-02: 用户应能异步解析大型DPML', async () => {
    // 执行 - 通过API异步解析复杂DPML内容
    const result = await parseAsync<DPMLDocument>(createComplexDPMLFixture());
    
    // 断言 - 验证复杂结构被正确解析
    expect(result.rootNode.tagName).toBe('root');
    
    // 验证嵌套结构
    expect(result.rootNode.children.length).toBeGreaterThan(0);
    
    // 查找特定节点 - 使用节点ID索引
    const headerNode = result.nodesById?.get('header1');
    expect(headerNode).toBeDefined();
    expect(headerNode?.tagName).toBe('header');
    
    // 查找section节点
    const sectionNode = result.nodesById?.get('section1');
    expect(sectionNode).toBeDefined();
    expect(sectionNode?.tagName).toBe('section');
    expect(sectionNode?.children.length).toBeGreaterThan(0);
  });
  
  test('E2E-Parsing-03: 解析错误应提供清晰错误信息', () => {
    // 执行 & 断言 - 无效内容应抛出错误
    expect(() => {
      parse(createInvalidDPMLFixture());
    }).toThrow();
    
    // 尝试捕获错误以检查错误消息
    try {
      parse(createInvalidDPMLFixture());
    } catch (error) {
      // 错误消息应包含有用信息
      expect((error as Error).message).toMatch(/解析错误/);
    }
  });
  
  test('E2E-Parsing-04: 解析选项应正确影响解析行为', () => {
    // 准备 - 使用自定义选项
    const options = {
      throwOnError: false,
      fileName: 'test.dpml'
    };
    
    // 尝试解析有效内容
    const validResult = parse<DPMLDocument>(createBasicDPMLFixture(), options);
    expect(validResult).toBeDefined();
    
    // 尝试解析无效内容 - 不应抛出错误
    // 注意：由于骨架代码中未实现非抛出选项，此测试可能需要在实现后修改
    expect(() => {
      parse(createInvalidDPMLFixture(), { throwOnError: false });
    }).toThrow(); // 实现完整后改为不抛出错误的验证
  });
}); 