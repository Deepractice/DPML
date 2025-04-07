import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultTransformer } from '../../src/transformer/defaultTransformer';
import { TransformerVisitor } from '../../src/transformer/interfaces/transformerVisitor';
import { OutputAdapter } from '../../src/transformer/interfaces/outputAdapter';
import { ProcessedDocument } from '../../src/processor/interfaces/processor';
import { NodeType } from '../../src/types/node';
import { TransformContext } from '../../src/transformer/interfaces/transformContext';

describe('DefaultTransformer', () => {
  // 模拟文档
  const mockDocument: ProcessedDocument = {
    type: NodeType.DOCUMENT,
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  };
  
  // 测试访问者注册和排序
  describe('访问者注册与排序', () => {
    let transformer: DefaultTransformer;
    
    beforeEach(() => {
      transformer = new DefaultTransformer();
    });
    
    it('应该能注册访问者', () => {
      const visitor: TransformerVisitor = {
        visitDocument: vi.fn(),
        priority: 100
      };
      
      transformer.registerVisitor(visitor);
      
      // 检查内部访问者数组是否包含注册的访问者
      expect((transformer as any).visitors).toContain(visitor);
    });
    
    it('应该根据优先级排序访问者', () => {
      const highPriorityVisitor: TransformerVisitor = {
        visitDocument: vi.fn(),
        priority: 200
      };
      
      const mediumPriorityVisitor: TransformerVisitor = {
        visitDocument: vi.fn(),
        priority: 100
      };
      
      const lowPriorityVisitor: TransformerVisitor = {
        visitDocument: vi.fn(),
        priority: 50
      };
      
      // 以乱序注册
      transformer.registerVisitor(mediumPriorityVisitor);
      transformer.registerVisitor(lowPriorityVisitor);
      transformer.registerVisitor(highPriorityVisitor);
      
      // 转换时应该按优先级从高到低排序
      transformer.transform(mockDocument);
      
      // 验证内部访问者数组的排序
      const visitors = (transformer as any).visitors;
      expect(visitors[0]).toBe(highPriorityVisitor);
      expect(visitors[1]).toBe(mediumPriorityVisitor);
      expect(visitors[2]).toBe(lowPriorityVisitor);
    });
    
    it('应该处理无优先级的访问者(使用默认优先级)', () => {
      const visitor1: TransformerVisitor = {
        visitDocument: vi.fn(),
        // 无优先级，应使用默认优先级
      };
      
      const visitor2: TransformerVisitor = {
        visitDocument: vi.fn(),
        priority: 100
      };
      
      transformer.registerVisitor(visitor1);
      transformer.registerVisitor(visitor2);
      
      // 转换时应该不会出错
      transformer.transform(mockDocument);
      
      // 无优先级访问者应该使用默认优先级(通常较低)
      const visitors = (transformer as any).visitors;
      // 假设默认优先级低于100
      expect(visitors.indexOf(visitor2)).toBeLessThan(visitors.indexOf(visitor1));
    });
    
    it('应该处理相同优先级的访问者(按注册顺序)', () => {
      const visitor1: TransformerVisitor = {
        visitDocument: vi.fn(),
        priority: 100
      };
      
      const visitor2: TransformerVisitor = {
        visitDocument: vi.fn(),
        priority: 100 // 相同优先级
      };
      
      transformer.registerVisitor(visitor1);
      transformer.registerVisitor(visitor2);
      
      // 转换时按注册顺序处理相同优先级的访问者
      transformer.transform(mockDocument);
      
      // 验证内部访问者数组的排序
      const visitors = (transformer as any).visitors;
      // 相同优先级时保持注册顺序
      expect(visitors.indexOf(visitor1)).toBeLessThan(visitors.indexOf(visitor2));
    });
  });
  
  // 测试输出适配器
  describe('输出适配器', () => {
    let transformer: DefaultTransformer;
    
    beforeEach(() => {
      transformer = new DefaultTransformer();
    });
    
    it('应该能设置输出适配器', () => {
      const adapter: OutputAdapter = {
        adapt: vi.fn().mockImplementation((result) => result)
      };
      
      transformer.setOutputAdapter(adapter);
      
      // 检查内部适配器是否被设置
      expect((transformer as any).outputAdapter).toBe(adapter);
    });
    
    it('应该在转换后应用适配器', () => {
      const mockResult = { type: 'document', content: 'test' };
      
      // 创建访问者，返回模拟结果
      const visitor: TransformerVisitor = {
        visitDocument: vi.fn().mockReturnValue(mockResult),
        priority: 100
      };
      
      // 创建适配器，修改结果
      const adapter: OutputAdapter = {
        adapt: vi.fn().mockImplementation((result) => ({
          ...result,
          adapted: true
        }))
      };
      
      transformer.registerVisitor(visitor);
      transformer.setOutputAdapter(adapter);
      
      // 转换文档
      const result = transformer.transform(mockDocument);
      
      // 验证适配器被调用
      expect(adapter.adapt).toHaveBeenCalledWith(mockResult, expect.any(Object));
      // 验证结果包含适配器的修改
      expect(result).toEqual({
        ...mockResult,
        adapted: true
      });
    });
    
    it('应该在没有适配器时返回原始结果', () => {
      const mockResult = { type: 'document', content: 'test' };
      
      // 创建访问者，返回模拟结果
      const visitor: TransformerVisitor = {
        visitDocument: vi.fn().mockReturnValue(mockResult),
        priority: 100
      };
      
      transformer.registerVisitor(visitor);
      // 故意不设置适配器
      
      // 转换文档
      const result = transformer.transform(mockDocument);
      
      // 验证结果是原始结果
      expect(result).toBe(mockResult);
    });
  });
}); 