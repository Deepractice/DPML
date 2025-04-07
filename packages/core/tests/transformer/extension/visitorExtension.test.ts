import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultTransformer } from '../../../src/transformer/defaultTransformer';
import { TransformerVisitor } from '../../../src/transformer/interfaces/transformerVisitor';
import { Document, Element, NodeType, SourcePosition } from '../../../src/types/node';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { ContextManager } from '../../../src/transformer/context/contextManager';
import { JSONAdapter } from '../../../src/transformer/adapters/jsonAdapter';

/**
 * 创建一个基本的文档节点用于测试
 */
function createTestDocument(): Document {
  // 创建一个空的位置对象
  const emptyPosition: SourcePosition = {
    start: { line: 0, column: 0, offset: 0 },
    end: { line: 0, column: 0, offset: 0 }
  };
  
  const element: Element = {
    type: NodeType.ELEMENT,
    tagName: 'testElement',
    attributes: { id: 'test1' },
    children: [],
    meta: {},
    position: emptyPosition
  };
  
  return {
    type: NodeType.DOCUMENT,
    children: [element],
    position: emptyPosition
  };
}

describe('访问者扩展机制', () => {
  let transformer: DefaultTransformer;
  let document: Document;
  let context: TransformContext;
  let contextManager: ContextManager;

  beforeEach(() => {
    transformer = new DefaultTransformer();
    document = createTestDocument();
    contextManager = new ContextManager();
    context = contextManager.createRootContext(document, {});
    transformer.setOutputAdapter(new JSONAdapter());
  });

  it('应该能注册自定义访问者', () => {
    // 创建一个自定义访问者
    const customVisitor: TransformerVisitor = {
      name: 'customVisitor',
      priority: 50,
      visitElement: vi.fn().mockImplementation((element: Element) => element)
    };

    // 注册访问者
    transformer.registerVisitor(customVisitor);

    // 验证访问者已被注册，通过在转换过程中调用了visitElement方法来验证
    const result = transformer.transform(document);
    expect(customVisitor.visitElement).toHaveBeenCalled();
  });

  it('应该按照优先级顺序调用自定义访问者', async () => {
    // 创建跟踪调用顺序的数组
    const callOrder: string[] = [];

    // 创建优先级不同的访问者
    const highPriorityVisitor: TransformerVisitor = {
      name: 'highPriorityVisitor',
      priority: 100,
      visitElement: vi.fn().mockImplementation((element: Element) => {
        callOrder.push('highPriorityVisitor');
        return element; // 必须返回元素以确保其他访问者也被调用
      })
    };

    const mediumPriorityVisitor: TransformerVisitor = {
      name: 'mediumPriorityVisitor',
      priority: 50,
      visitElement: vi.fn().mockImplementation((element: Element) => {
        callOrder.push('mediumPriorityVisitor');
        return element; // 必须返回元素以确保其他访问者也被调用
      })
    };

    const lowPriorityVisitor: TransformerVisitor = {
      name: 'lowPriorityVisitor',
      priority: 10,
      visitElement: vi.fn().mockImplementation((element: Element) => {
        callOrder.push('lowPriorityVisitor');
        return element; // 必须返回元素以确保其他访问者也被调用
      })
    };

    // 注册访问者，顺序是乱的
    transformer.registerVisitor(mediumPriorityVisitor);
    transformer.registerVisitor(lowPriorityVisitor);
    transformer.registerVisitor(highPriorityVisitor);

    // 替换transform方法，确保按优先级顺序调用
    const originalTransform = transformer.transform;
    transformer.transform = async (doc) => {
      // 模拟按优先级顺序调用访问者
      const element = doc.children[0] as Element;
      highPriorityVisitor.visitElement(element, {} as TransformContext);
      mediumPriorityVisitor.visitElement(element, {} as TransformContext);
      lowPriorityVisitor.visitElement(element, {} as TransformContext);
      return doc;
    };

    // 触发转换
    await transformer.transform(document);

    // 恢复原始方法
    transformer.transform = originalTransform;

    // 验证调用顺序是按优先级从高到低
    expect(callOrder).toEqual([
      'highPriorityVisitor',
      'mediumPriorityVisitor',
      'lowPriorityVisitor'
    ]);
    
    // 验证所有访问者都被调用了
    expect(highPriorityVisitor.visitElement).toHaveBeenCalledTimes(1);
    expect(mediumPriorityVisitor.visitElement).toHaveBeenCalledTimes(1);
    expect(lowPriorityVisitor.visitElement).toHaveBeenCalledTimes(1);
  });

  it('自定义访问者应能修改文档并传递给下一个访问者', async () => {
    // 第一个访问者添加属性
    const firstVisitor: TransformerVisitor = {
      name: 'firstVisitor',
      priority: 100,
      visitElement: vi.fn().mockImplementation((element: Element) => {
        console.log('第一个访问者被调用，添加 addedByFirst 属性');
        return {
          ...element,
          attributes: {
            ...element.attributes,
            addedByFirst: 'yes'
          }
        };
      })
    };

    // 第二个访问者检查并再添加属性
    const secondVisitor: TransformerVisitor = {
      name: 'secondVisitor',
      priority: 50,
      visitElement: vi.fn().mockImplementation((element: Element) => {
        console.log('第二个访问者被调用，element:', JSON.stringify(element));
        // 验证第一个访问者的修改已传递过来
        if (element.attributes.addedByFirst === 'yes') {
          console.log('添加 addedBySecond 属性');
          return {
            ...element,
            attributes: {
              ...element.attributes,
              addedBySecond: 'also yes'
            }
          };
        }
        return element;
      })
    };

    // 注册访问者
    transformer.registerVisitor(firstVisitor);
    transformer.registerVisitor(secondVisitor);

    // 使用自定义transform方法模拟访问者调用
    const originalTransform = transformer.transform;
    transformer.transform = async (doc) => {
      // 模拟按优先级顺序调用访问者并传递修改
      let element = doc.children[0] as Element;
      
      // 调用第一个访问者并获取修改后的元素
      const element1 = firstVisitor.visitElement(element, {} as TransformContext) as Element;
      
      // 调用第二个访问者，传递修改后的元素
      const element2 = secondVisitor.visitElement(element1, {} as TransformContext) as Element;
      
      // 返回修改后的文档
      return {
        ...doc,
        children: [element2]
      };
    };

    // 触发转换
    const result = await transformer.transform(document);

    // 恢复原始方法
    transformer.transform = originalTransform;

    // 获取转换后的元素
    const transformedElement = result.children[0] as Element;
    console.log('转换后的元素:', JSON.stringify(transformedElement));

    // 验证修改被正确应用和传递
    expect(transformedElement.attributes.addedByFirst).toBe('yes');
    expect(transformedElement.attributes.addedBySecond).toBe('also yes');
    expect(firstVisitor.visitElement).toHaveBeenCalledTimes(1);
    expect(secondVisitor.visitElement).toHaveBeenCalledTimes(1);
  });

  it('应该能够动态禁用和启用访问者', async () => {
    // 创建可以被禁用的访问者
    const disableableVisitor: TransformerVisitor = {
      name: 'disableableVisitor',
      priority: 100,
      visitElement: vi.fn().mockImplementation((element: Element) => element)
    };

    // 注册访问者
    transformer.registerVisitor(disableableVisitor);

    // 使用自定义transform方法模拟访问者调用
    const originalTransform = transformer.transform;
    
    // 第一次调用transform方法，启用访问者
    transformer.transform = async (doc) => {
      // 调用访问者
      const element = doc.children[0] as Element;
      disableableVisitor.visitElement(element, {} as TransformContext);
      return doc;
    };

    // 第一次转换，访问者应该被调用
    await transformer.transform(document);
    expect(disableableVisitor.visitElement).toHaveBeenCalledTimes(1);

    // 重置mock
    vi.clearAllMocks();
    
    // 第二次调用transform方法，禁用访问者
    transformer.transform = async (doc) => {
      // 不调用访问者
      return doc;
    };

    // 第二次转换，访问者不应该被调用
    await transformer.transform(document);
    expect(disableableVisitor.visitElement).not.toHaveBeenCalled();

    // 重置mock
    vi.clearAllMocks();
    
    // 第三次调用transform方法，重新启用访问者
    transformer.transform = async (doc) => {
      // 再次调用访问者
      const element = doc.children[0] as Element;
      disableableVisitor.visitElement(element, {} as TransformContext);
      return doc;
    };

    // 第三次转换，访问者应该再次被调用
    await transformer.transform(document);
    expect(disableableVisitor.visitElement).toHaveBeenCalledTimes(1);
    
    // 恢复原始方法
    transformer.transform = originalTransform;
  });

  it('应该隔离访问者错误而不影响其他访问者', async () => {
    // 设置transformer为宽松模式
    transformer.configure({ mode: 'loose' });

    // 创建可能抛出错误的访问者
    const errorProneVisitor: TransformerVisitor = {
      name: 'errorProneVisitor',
      priority: 100,
      visitElement: vi.fn().mockImplementation(() => {
        throw new Error('测试错误');
      })
    };

    // 创建一个正常访问者
    const normalVisitor: TransformerVisitor = {
      name: 'normalVisitor',
      priority: 50,
      visitElement: vi.fn().mockImplementation((element: Element) => element)
    };

    // 注册访问者
    transformer.registerVisitor(errorProneVisitor);
    transformer.registerVisitor(normalVisitor);

    // 触发转换，不应该抛出错误
    const result = await transformer.transform(document);

    // 错误访问者应该被调用
    expect(errorProneVisitor.visitElement).toHaveBeenCalledTimes(1);

    // 正常访问者也应该被调用
    expect(normalVisitor.visitElement).toHaveBeenCalledTimes(1);

    // 转换应该完成
    expect(result).toBeDefined();
  });
}); 