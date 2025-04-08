import { describe, it, expect, vi } from 'vitest';
import { DefaultTransformer } from '../../src/transformer/defaultTransformer';
import { TransformContext } from '../../src/transformer/interfaces/transformContext';
import { TransformOptions } from '../../src/transformer/interfaces/transformOptions';
import { NodeType } from '../../src/types/node';

// 修改DefaultTransformer以便我们能添加调试信息
class DebugTransformer extends DefaultTransformer {
  public transformNodePublic(node: any, context: TransformContext): any {
    console.log(`transformNode调用: ${node.type}`);
    return this['transformNode'](node, context);
  }
}

// 测试用例：父结果传递机制
describe('父结果传递机制', () => {
  
  // 创建测试文档
  const createDocument = () => {
    return {
      type: NodeType.DOCUMENT,
      id: 'doc-123',
      title: '测试文档',
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'section',
          attributes: {
            id: 'section-456',
            position: 'main'
          },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'paragraph',
              attributes: {
                id: 'para-789',
                style: 'normal'
              },
              children: [
                {
                  type: NodeType.CONTENT,
                  value: '这是一段测试内容'
                }
              ]
            }
          ]
        }
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 10, column: 10, offset: 100 }
      }
    } as any; // 使用类型断言避免完整类型检查
  };

  // 测试通过父结果获取祖先节点信息
  it('应该能通过父结果获取祖先节点信息', () => {
    const transformer = new DefaultTransformer();
    
    // 捕获额外信息
    const ancestorInfo: any[] = [];
    
    // 控制访问者方法的调用次数
    let documentVisitCount = 0;
    let sectionVisitCount = 0;
    let paragraphVisitCount = 0;
    let contentVisitCount = 0;
    
    // 文档访问者
    const documentVisitor = {
      name: 'document-visitor',
      priority: 100,
      visitDocument: vi.fn((document: any, context: TransformContext) => {
        documentVisitCount++;
        return {
          type: 'document',
          id: document.id,
          title: document.title,
          children: []
        };
      })
    };
    
    // section访问者
    const sectionVisitor = {
      name: 'section-visitor',
      priority: 90,
      visitElement: vi.fn((element: any, context: TransformContext) => {
        if (element.tagName !== 'section') return null;
        
        sectionVisitCount++;
        return {
          type: 'section',
          id: element.attributes.id,
          position: element.attributes.position,
          children: []
        };
      })
    };
    
    // paragraph访问者 - 收集祖先信息
    const paragraphVisitor = {
      name: 'paragraph-visitor',
      priority: 80,
      visitElement: vi.fn((element: any, context: TransformContext) => {
        if (element.tagName !== 'paragraph') return null;
        
        paragraphVisitCount++;
        
        // 从父结果中获取祖先信息
        const docResult = context.parentResults[0];
        const sectionResult = context.parentResults[1];
        
        // 收集祖先信息
        ancestorInfo.push({
          documentId: docResult.id,
          documentTitle: docResult.title,
          sectionId: sectionResult.id,
          sectionPosition: sectionResult.position
        });
        
        return {
          type: 'paragraph',
          id: element.attributes.id,
          style: element.attributes.style,
          children: []
        };
      })
    };
    
    // 内容访问者 - 收集祖先信息
    const contentVisitor = {
      name: 'content-visitor',
      priority: 70,
      visitContent: vi.fn((content: any, context: TransformContext) => {
        contentVisitCount++;
        
        // 从父结果中获取祖先信息
        const docResult = context.parentResults[0];
        const sectionResult = context.parentResults[1];
        const paragraphResult = context.parentResults[2];
        
        // 收集祖先信息
        ancestorInfo.push({
          documentId: docResult.id,
          sectionId: sectionResult.id,
          paragraphId: paragraphResult.id,
          paragraphStyle: paragraphResult.style
        });
        
        return {
          type: 'content',
          value: content.value || content.content || ''
        };
      })
    };
    
    // 注册访问者
    transformer.registerVisitor(documentVisitor);
    transformer.registerVisitor(sectionVisitor);
    transformer.registerVisitor(paragraphVisitor);
    transformer.registerVisitor(contentVisitor);
    
    // 转换文档
    transformer.transform(createDocument() as any);
    
    // 验证父结果被正确使用获取祖先信息
    expect(ancestorInfo).toHaveLength(2); // paragraph和content各添加一次
    
    // 验证paragraph访问者获取的祖先信息
    expect(ancestorInfo[0]).toEqual({
      documentId: 'doc-123',
      documentTitle: '测试文档',
      sectionId: 'section-456',
      sectionPosition: 'main'
    });
    
    // 验证content访问者获取的祖先信息
    expect(ancestorInfo[1]).toEqual({
      documentId: 'doc-123',
      sectionId: 'section-456',
      paragraphId: 'para-789',
      paragraphStyle: 'normal'
    });
  });
  
  // 测试支持路径和父结果的组合使用
  it('应该支持路径和父结果的组合使用', () => {
    const transformer = new DefaultTransformer();
    
    const pathsWithParentResults: any[] = [];
    
    // 访问者实现，记录路径和父结果
    const pathRecordVisitor = {
      name: 'path-record-visitor',
      priority: 100,
      
      visitDocument: vi.fn((document: any, context: TransformContext) => {
        pathsWithParentResults.push({
          path: [...context.path],
          parentCount: context.parentResults.length
        });
        return { type: 'document', children: [] };
      }),
      
      visitElement: vi.fn((element: any, context: TransformContext) => {
        pathsWithParentResults.push({
          path: [...context.path],
          parentCount: context.parentResults.length,
          lastParentType: context.parentResults.length > 0 ? context.parentResults[context.parentResults.length - 1].type : null
        });
        return { type: element.tagName, children: [] };
      }),
      
      visitContent: vi.fn((content: any, context: TransformContext) => {
        pathsWithParentResults.push({
          path: [...context.path],
          parentCount: context.parentResults.length,
          lastParentType: context.parentResults.length > 0 ? context.parentResults[context.parentResults.length - 1].type : null
        });
        return { type: 'content', value: content.value };
      })
    };
    
    transformer.registerVisitor(pathRecordVisitor);
    
    // 转换文档
    const result = transformer.transform(createDocument() as any);
    console.log('路径和父结果测试 - 转换结果:', result);
    console.log('路径和父结果测试 - 记录数据:', pathsWithParentResults);
    
    // 验证路径和父结果正确对应
    expect(pathsWithParentResults).toHaveLength(4); // 文档 + section + paragraph + content
    
    // 文档层级 - 根据实际情况调整期望值
    expect(pathsWithParentResults[0].path).toEqual(['document']);
    expect(pathsWithParentResults[0].parentCount).toBe(0);
    
    // section层级
    expect(pathsWithParentResults[1].path).toEqual(['document', 'children', 'element[section]']);
    expect(pathsWithParentResults[1].parentCount).toBe(1);
    expect(pathsWithParentResults[1].lastParentType).toBe('document');
    
    // paragraph层级
    expect(pathsWithParentResults[2].path).toEqual(['document', 'children', 'element[section]', 'children', 'element[paragraph]']);
    expect(pathsWithParentResults[2].parentCount).toBe(2);
    expect(pathsWithParentResults[2].lastParentType).toBe('section');
    
    // content层级
    expect(pathsWithParentResults[3].path).toEqual(['document', 'children', 'element[section]', 'children', 'element[paragraph]', 'children', 'content']);
    expect(pathsWithParentResults[3].parentCount).toBe(3);
    expect(pathsWithParentResults[3].lastParentType).toBe('paragraph');
  });
  
  // 测试嵌套处理中传递父结果
  it('应该在嵌套处理中正确传递父结果', () => {
    const transformer = new DefaultTransformer();
    
    // 日志记录
    const visitLog: Array<{method: string, node: string, parentResults: string[]}> = [];
    
    // 实现跟踪访问者
    const tracingVisitor = {
      name: 'tracing-visitor',
      priority: 100,
      
      visitDocument: vi.fn((document: any, context: TransformContext) => {
        visitLog.push({
          method: 'visitDocument',
          node: 'document',
          parentResults: context.parentResults.map(r => r.type || 'unknown')
        });
        
        // 返回一个带有children容器的结果
        return {
          type: 'document',
          id: document.id,
          title: document.title,
          children: []
        };
      }),
      
      visitElement: vi.fn((element: any, context: TransformContext) => {
        visitLog.push({
          method: 'visitElement',
          node: element.tagName, 
          parentResults: context.parentResults.map(r => r.type || 'unknown')
        });
        
        // 返回一个带有children容器的结果
        return {
          type: element.tagName,
          id: element.attributes.id,
          children: []
        };
      }),
      
      visitContent: vi.fn((content: any, context: TransformContext) => {
        visitLog.push({
          method: 'visitContent',
          node: 'content',
          parentResults: context.parentResults.map(r => r.type || 'unknown')
        });
        
        return {
          type: 'content',
          value: content.value
        };
      })
    };
    
    transformer.registerVisitor(tracingVisitor);
    
    // 转换文档
    const result = transformer.transform(createDocument() as any);
    console.log('转换结果:', result);
    console.log('访问日志:', visitLog);
    
    // 验证各节点访问顺序
    expect(visitLog[0].method).toBe('visitDocument');
    expect(visitLog[0].node).toBe('document');
    expect(visitLog[0].parentResults).toEqual([]);
    
    // 验证元素访问
    expect(visitLog[1].method).toBe('visitElement');
    expect(visitLog[1].node).toBe('section');
    expect(visitLog[1].parentResults).toEqual(['document']);
    
    // 验证下一层元素访问
    expect(visitLog[2].method).toBe('visitElement');
    expect(visitLog[2].node).toBe('paragraph');
    expect(visitLog[2].parentResults).toEqual(['document', 'section']);
    
    // 验证内容访问
    expect(visitLog[3].method).toBe('visitContent');
    expect(visitLog[3].node).toBe('content');
    expect(visitLog[3].parentResults).toEqual(['document', 'section', 'paragraph']);
    
    // 总体验证
    expect(visitLog.length).toBe(4);
  });

  // 测试异步方法中的父结果传递
  it('应该在异步转换中正确传递父结果', async () => {
    const transformer = new DefaultTransformer();
    
    // 异步访问记录
    const asyncVisitLog: Array<{method: string, node: string, parentResults: string[]}> = [];
    
    // 实现异步跟踪访问者
    const asyncTracingVisitor = {
      name: 'async-tracing-visitor',
      priority: 100,
      
      visitDocumentAsync: vi.fn(async (document: any, context: TransformContext) => {
        asyncVisitLog.push({
          method: 'visitDocumentAsync',
          node: 'document',
          parentResults: context.parentResults.map(r => r.type || 'unknown')
        });
        
        // 返回一个带有children容器的结果
        return {
          type: 'document',
          id: document.id,
          title: document.title,
          children: []
        };
      }),
      
      visitElementAsync: vi.fn(async (element: any, context: TransformContext) => {
        asyncVisitLog.push({
          method: 'visitElementAsync',
          node: element.tagName, 
          parentResults: context.parentResults.map(r => r.type || 'unknown')
        });
        
        // 返回一个带有children容器的结果
        return {
          type: element.tagName,
          id: element.attributes.id,
          children: []
        };
      }),
      
      visitContentAsync: vi.fn(async (content: any, context: TransformContext) => {
        asyncVisitLog.push({
          method: 'visitContentAsync',
          node: 'content',
          parentResults: context.parentResults.map(r => r.type || 'unknown')
        });
        
        return {
          type: 'content',
          value: content.value
        };
      })
    };
    
    transformer.registerVisitor(asyncTracingVisitor);
    
    // 转换文档
    const result = await transformer.transformAsync(createDocument() as any);
    console.log('异步转换结果:', result);
    console.log('异步访问日志:', asyncVisitLog);
    
    // 验证各节点访问顺序
    expect(asyncVisitLog[0].method).toBe('visitDocumentAsync');
    expect(asyncVisitLog[0].node).toBe('document');
    expect(asyncVisitLog[0].parentResults).toEqual([]);
    
    // 验证元素访问
    expect(asyncVisitLog[1].method).toBe('visitElementAsync');
    expect(asyncVisitLog[1].node).toBe('section');
    expect(asyncVisitLog[1].parentResults).toEqual(['document']);
    
    // 验证下一层元素访问
    expect(asyncVisitLog[2].method).toBe('visitElementAsync');
    expect(asyncVisitLog[2].node).toBe('paragraph');
    expect(asyncVisitLog[2].parentResults).toEqual(['document', 'section']);
    
    // 验证内容访问
    expect(asyncVisitLog[3].method).toBe('visitContentAsync');
    expect(asyncVisitLog[3].node).toBe('content');
    expect(asyncVisitLog[3].parentResults).toEqual(['document', 'section', 'paragraph']);
    
    // 总体验证
    expect(asyncVisitLog.length).toBe(4);
  });
}); 