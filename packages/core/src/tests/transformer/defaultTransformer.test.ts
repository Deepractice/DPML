import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultTransformer } from '../../transformer/defaultTransformer';
import { TransformerVisitor } from '../../transformer/interfaces/transformerVisitor';
import { OutputAdapter } from '../../transformer/interfaces/outputAdapter';
import { ProcessedDocument } from '../../processor/interfaces/processor';
import { NodeType } from '../../types/node';
import { TransformContext } from '../../transformer/interfaces/transformContext';

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
        priority: 100,
        name: 'testVisitor'
      };
      
      transformer.registerVisitor(visitor);
      
      // 检查内部访问者是否包含注册的访问者
      expect(transformer.visitorManager.getVisitorsByMethod('visitDocument')).toContain(visitor);
    });
    
    it('应该根据优先级排序访问者', () => {
      const highPriorityVisitor: TransformerVisitor = {
        visitDocument: vi.fn(),
        priority: 200,
        name: 'highPriorityVisitor'
      };
      
      const mediumPriorityVisitor: TransformerVisitor = {
        visitDocument: vi.fn(),
        priority: 100,
        name: 'mediumPriorityVisitor'
      };
      
      const lowPriorityVisitor: TransformerVisitor = {
        visitDocument: vi.fn(),
        priority: 50,
        name: 'lowPriorityVisitor'
      };
      
      // 按随机顺序注册
      transformer.registerVisitor(mediumPriorityVisitor);
      transformer.registerVisitor(lowPriorityVisitor);
      transformer.registerVisitor(highPriorityVisitor);
      
      // 验证内部访问者数组的排序
      const visitors = transformer.visitorManager.getVisitorsByMethod('visitDocument');
      expect(visitors[0]).toBe(highPriorityVisitor);
      expect(visitors[1]).toBe(mediumPriorityVisitor);
      expect(visitors[2]).toBe(lowPriorityVisitor);
    });
    
    it('应该处理无优先级的访问者(使用默认优先级)', () => {
      const withPriorityVisitor: TransformerVisitor = {
        visitDocument: vi.fn(),
        priority: 100,
        name: 'withPriorityVisitor'
      };
      
      const noPriorityVisitor: TransformerVisitor = {
        visitDocument: vi.fn(),
        name: 'noPriorityVisitor'
      };
      
      transformer.registerVisitor(withPriorityVisitor);
      transformer.registerVisitor(noPriorityVisitor);
      
      // 转换时应该不会出错
      const doc: ProcessedDocument = {
        type: NodeType.DOCUMENT,
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 1, offset: 0 }
        }
      };
      
      transformer.transform(doc);
      
      // 验证访问者优先级排序
      const visitors = transformer.visitorManager.getVisitorsByMethod('visitDocument');
      // 有优先级的访问者应该排在无优先级的访问者之前
      const withPriorityIndex = visitors.indexOf(withPriorityVisitor);
      const noPriorityIndex = visitors.indexOf(noPriorityVisitor);
      expect(withPriorityIndex).toBeLessThan(noPriorityIndex);
    });
    
    it('应该处理相同优先级的访问者(按注册顺序)', () => {
      const firstVisitor: TransformerVisitor = {
        visitDocument: vi.fn(),
        priority: 100,
        name: 'firstVisitor'
      };
      
      const secondVisitor: TransformerVisitor = {
        visitDocument: vi.fn(),
        priority: 100,
        name: 'secondVisitor'
      };
      
      transformer.registerVisitor(firstVisitor);
      transformer.registerVisitor(secondVisitor);
      
      // 转换时按注册顺序处理相同优先级的访问者
      const doc: ProcessedDocument = {
        type: NodeType.DOCUMENT,
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 1, offset: 0 }
        }
      };
      
      transformer.transform(doc);
      
      // 验证访问者顺序
      const visitors = transformer.visitorManager.getVisitorsByMethod('visitDocument');
      // 相同优先级时保持注册顺序
      const firstIndex = visitors.indexOf(firstVisitor);
      const secondIndex = visitors.indexOf(secondVisitor);
      expect(firstIndex).toBeLessThan(secondIndex);
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
        priority: 100,
        name: 'testVisitor'
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
        priority: 100,
        name: 'testVisitor'
      };
      
      transformer.registerVisitor(visitor);
      // 故意不设置适配器
      
      // 转换文档
      const result = transformer.transform(mockDocument);
      
      // 验证结果是原始结果
      expect(result).toBe(mockResult);
    });
  });

  // 测试子节点处理委托
  describe('子节点处理委托', () => {
    let transformer: DefaultTransformer;
    
    beforeEach(() => {
      transformer = new DefaultTransformer();
    });
    
    it('应该处理包含子节点的文档', () => {
      // 创建有子节点的文档
      const docWithChildren: ProcessedDocument = {
        type: NodeType.DOCUMENT,
        children: [
          {
            type: NodeType.ELEMENT,
            tagName: 'test',
            attributes: {},
            children: [],
            position: {
              start: { line: 2, column: 1, offset: 10 },
              end: { line: 2, column: 10, offset: 20 }
            }
          }
        ],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 3, column: 1, offset: 30 }
        }
      };

      // 创建模拟访问者
      const documentVisitor: TransformerVisitor = {
        visitDocument: vi.fn().mockImplementation((doc, context) => {
          // 调用内部transformNode方法处理子节点
          const childResults = doc.children.map((child: any) => 
            (transformer as any).transformNode(child, context)
          );
          return { type: 'transformed-doc', children: childResults };
        }),
        priority: 100,
        name: 'documentVisitor'
      };

      const elementVisitor: TransformerVisitor = {
        visitElement: vi.fn().mockReturnValue({ type: 'transformed-element' }),
        priority: 100,
        name: 'elementVisitor'
      };

      transformer.registerVisitor(documentVisitor);
      transformer.registerVisitor(elementVisitor);

      // 转换文档，禁用默认的子节点处理
      const result = transformer.transform(docWithChildren, { skipNestedProcessing: true });

      // 验证结果
      expect(result).toEqual({
        type: 'transformed-doc',
        children: [
          { type: 'transformed-element' }
        ]
      });

      // 验证访问者方法调用
      expect(documentVisitor.visitDocument).toHaveBeenCalled();
      expect(elementVisitor.visitElement).toHaveBeenCalled();
    });

    it('应该支持嵌套子节点处理', () => {
      // 创建具有嵌套子节点的文档
      const docWithNestedChildren: ProcessedDocument = {
        type: NodeType.DOCUMENT,
        children: [
          {
            type: NodeType.ELEMENT,
            tagName: 'parent',
            attributes: {},
            children: [
              {
                type: NodeType.ELEMENT,
                tagName: 'child',
                attributes: {},
                children: [],
                position: {
                  start: { line: 3, column: 1, offset: 20 },
                  end: { line: 3, column: 10, offset: 30 }
                }
              }
            ],
            position: {
              start: { line: 2, column: 1, offset: 10 },
              end: { line: 4, column: 1, offset: 40 }
            }
          }
        ],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 5, column: 1, offset: 50 }
        }
      };

      // 创建递归处理子节点的访问者
      const documentVisitor: TransformerVisitor = {
        visitDocument: vi.fn().mockImplementation((doc, context) => {
          const childResults = doc.children.map((child: any) => 
            (transformer as any).transformNode(child, context)
          );
          return { type: 'doc', children: childResults };
        }),
        priority: 100,
        name: 'documentVisitor'
      };

      const elementVisitor: TransformerVisitor = {
        visitElement: vi.fn().mockImplementation((element, context) => {
          const childResults = element.children.map((child: any) => 
            (transformer as any).transformNode(child, context)
          );
          return { 
            type: 'element', 
            name: element.tagName, 
            children: childResults 
          };
        }),
        priority: 100,
        name: 'elementVisitor'
      };

      transformer.registerVisitor(documentVisitor);
      transformer.registerVisitor(elementVisitor);

      // 转换文档，禁用默认的子节点处理
      const result = transformer.transform(docWithNestedChildren, { skipNestedProcessing: true });

      // 验证结果包含正确的嵌套结构
      expect(result).toEqual({
        type: 'doc',
        children: [
          {
            type: 'element',
            name: 'parent',
            children: [
              {
                type: 'element',
                name: 'child',
                children: []
              }
            ]
          }
        ]
      });

      // 验证访问者方法被正确调用
      expect(documentVisitor.visitDocument).toHaveBeenCalled();
      expect(elementVisitor.visitElement).toHaveBeenCalledTimes(2);
    });

    it('应该在处理子节点时更新上下文路径', () => {
      const pathCapture: string[][] = [];
      
      // 创建有子节点的文档
      const docWithChildren: ProcessedDocument = {
        type: NodeType.DOCUMENT,
        children: [
          {
            type: NodeType.ELEMENT,
            tagName: 'test',
            attributes: {},
            children: [],
            position: {
              start: { line: 2, column: 1, offset: 10 },
              end: { line: 2, column: 10, offset: 20 }
            }
          }
        ],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 3, column: 1, offset: 30 }
        }
      };

      // 清空全局捕获数组
      pathCapture.length = 0;
      
      // 创建能捕获上下文路径的访问者
      const documentVisitor: TransformerVisitor = {
        visitDocument: vi.fn().mockImplementation((doc, context) => {
          pathCapture.push([...context.path]);
          const childResults = doc.children.map((child: any) => 
            (transformer as any).transformNode(child, context)
          );
          return { type: 'doc', children: childResults };
        }),
        priority: 100,
        name: 'documentVisitor'
      };

      const elementVisitor: TransformerVisitor = {
        visitElement: vi.fn().mockImplementation((element, context) => {
          pathCapture.push([...context.path]);
          return { type: 'element', name: element.tagName };
        }),
        priority: 100,
        name: 'elementVisitor'
      };

      transformer.registerVisitor(documentVisitor);
      transformer.registerVisitor(elementVisitor);

      // 转换文档，禁用默认的子节点处理
      transformer.transform(docWithChildren, { skipNestedProcessing: true });

      // 验证上下文路径被正确更新
      expect(pathCapture).toHaveLength(2);
      expect(pathCapture[0]).toEqual(['document']); // 文档访问路径
      expect(pathCapture[1]).toEqual(['document', 'element[test]']); // 元素访问路径
    });
  });
  
  // 测试转换结果缓存机制
  describe('转换结果缓存', () => {
    let transformer: DefaultTransformer;
    
    beforeEach(() => {
      transformer = new DefaultTransformer();
    });
    
    it('应该缓存节点转换结果', () => {
      // 创建带有唯一ID的文档节点
      const nodeId = 'doc-001';
      const docWithId: ProcessedDocument = {
        type: NodeType.DOCUMENT,
        id: nodeId,
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 1, offset: 0 }
        }
      };
      
      // 创建计数访问者，用于验证缓存命中
      const visitCount = { count: 0 };
      const countingVisitor: TransformerVisitor = {
        visitDocument: vi.fn().mockImplementation(() => {
          visitCount.count++;
          return { type: 'doc', id: nodeId, transformed: true };
        }),
        priority: 100,
        name: 'countingVisitor'
      };
      
      transformer.registerVisitor(countingVisitor);
      
      // 启用缓存
      transformer.configure({ enableCache: true });
      
      // 第一次转换，应该调用访问者
      const result1 = transformer.transform(docWithId);
      expect(visitCount.count).toBe(1);
      expect(result1).toEqual({ type: 'doc', id: nodeId, transformed: true });
      
      // 第二次转换相同的节点，应该使用缓存
      const result2 = transformer.transform(docWithId);
      expect(visitCount.count).toBe(1); // 访问计数应该没有增加
      expect(result2).toEqual({ type: 'doc', id: nodeId, transformed: true });
      
      // 验证结果是同一个对象（缓存命中）
      expect(result1).toBe(result2);
    });
    
    it('应该在禁用缓存时不使用缓存', () => {
      // 创建带有唯一ID的文档节点
      const nodeId = 'doc-002';
      const docWithId: ProcessedDocument = {
        type: NodeType.DOCUMENT,
        id: nodeId,
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 1, offset: 0 }
        }
      };
      
      // 创建计数访问者，用于验证每次都调用
      const visitCount = { count: 0 };
      const countingVisitor: TransformerVisitor = {
        visitDocument: vi.fn().mockImplementation(() => {
          visitCount.count++;
          return { type: 'doc', id: nodeId, transformed: true };
        }),
        priority: 100,
        name: 'countingVisitor'
      };
      
      transformer.registerVisitor(countingVisitor);
      
      // 禁用缓存
      transformer.configure({ enableCache: false });
      
      // 第一次转换
      const result1 = transformer.transform(docWithId);
      expect(visitCount.count).toBe(1);
      
      // 第二次转换相同的节点，应该再次调用访问者
      const result2 = transformer.transform(docWithId);
      expect(visitCount.count).toBe(2); // 访问计数应该增加
      
      // 结果应该是不同的对象（没有缓存）
      expect(result1).not.toBe(result2);
      // 但值应该相同
      expect(result1).toEqual(result2);
    });
    
    it('应该基于节点ID或内容哈希进行缓存', () => {
      // 创建两个内容相同但ID不同的节点
      const doc1: ProcessedDocument = {
        type: NodeType.DOCUMENT,
        id: 'doc-003-a',
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 1, offset: 0 }
        }
      };
      
      const doc2: ProcessedDocument = {
        type: NodeType.DOCUMENT,
        id: 'doc-003-b', // 不同的ID
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 1, offset: 0 }
        }
      };
      
      // 创建计数访问者
      const visitCount = { count: 0 };
      const countingVisitor: TransformerVisitor = {
        visitDocument: vi.fn().mockImplementation((doc) => {
          visitCount.count++;
          return { type: 'doc', id: (doc as any).id, transformed: true };
        }),
        priority: 100,
        name: 'countingVisitor'
      };
      
      transformer.registerVisitor(countingVisitor);
      
      // 启用缓存
      transformer.configure({ enableCache: true });
      
      // 转换第一个文档
      transformer.transform(doc1);
      expect(visitCount.count).toBe(1);
      
      // 转换第二个文档（不同ID）
      transformer.transform(doc2);
      expect(visitCount.count).toBe(2); // 应该增加
    });
    
    it('应该在文档变化时无效化缓存', () => {
      // 创建带有唯一ID的可变文档节点
      const nodeId = 'doc-004';
      const mutableDoc: ProcessedDocument = {
        type: NodeType.DOCUMENT,
        id: nodeId,
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 1, offset: 0 }
        },
        meta: { version: 1 } // 元数据，用于检测变化
      };
      
      // 创建计数访问者
      const visitCount = { count: 0 };
      const countingVisitor: TransformerVisitor = {
        visitDocument: vi.fn().mockImplementation((doc) => {
          visitCount.count++;
          // 返回包含版本的结果
          return { 
            type: 'doc', 
            id: nodeId, 
            version: (doc as any).meta.version,
            transformed: true 
          };
        }),
        priority: 100,
        name: 'countingVisitor'
      };
      
      transformer.registerVisitor(countingVisitor);
      
      // 启用缓存
      transformer.configure({ enableCache: true });
      
      // 第一次转换
      const result1 = transformer.transform(mutableDoc);
      expect(visitCount.count).toBe(1);
      expect(result1.version).toBe(1);
      
      // 修改文档
      mutableDoc.meta = { version: 2 };
      
      // 再次转换，由于文档变化，缓存应该失效
      const result2 = transformer.transform(mutableDoc);
      expect(visitCount.count).toBe(2); // 访问计数应该增加
      expect(result2.version).toBe(2); // 结果应该反映新版本
    });
    
    it('应该支持缓存的手动清除', () => {
      // 创建带有唯一ID的文档节点
      const nodeId = 'doc-005';
      const docWithId: ProcessedDocument = {
        type: NodeType.DOCUMENT,
        id: nodeId,
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 1, offset: 0 }
        }
      };
      
      // 创建计数访问者
      const visitCount = { count: 0 };
      const countingVisitor: TransformerVisitor = {
        visitDocument: vi.fn().mockImplementation(() => {
          visitCount.count++;
          return { type: 'doc', id: nodeId, transformed: true };
        }),
        priority: 100,
        name: 'countingVisitor'
      };
      
      transformer.registerVisitor(countingVisitor);
      
      // 启用缓存
      transformer.configure({ enableCache: true });
      
      // 第一次转换
      transformer.transform(docWithId);
      expect(visitCount.count).toBe(1);
      
      // 第二次转换，应该使用缓存
      transformer.transform(docWithId);
      expect(visitCount.count).toBe(1); // 计数不变
      
      // 手动清除缓存
      (transformer as any).clearCache();
      
      // 第三次转换，应该重新调用访问者
      transformer.transform(docWithId);
      expect(visitCount.count).toBe(2); // 计数增加
    });
  });
}); 