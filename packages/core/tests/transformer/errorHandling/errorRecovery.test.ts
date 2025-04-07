import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DefaultTransformer } from '../../../src/transformer/defaultTransformer';
import { TransformerVisitor } from '../../../src/transformer/interfaces/transformerVisitor';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { TransformOptions } from '../../../src/transformer/interfaces/transformOptions';
import { NodeType, Element, Document } from '../../../src/types/node';

describe('错误恢复机制', () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  let consoleLogSpy: any;
  
  // 在每个测试前初始化控制台间谍
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  
  // 在每个测试后恢复控制台间谍
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
  
  // 创建一个测试文档
  const createTestDocument = (): Document => ({
    type: NodeType.DOCUMENT,
    children: [
      {
        type: NodeType.ELEMENT,
        tagName: 'root',
        attributes: {},
        children: [
          {
            type: NodeType.ELEMENT,
            tagName: 'child1',
            attributes: {},
            children: [
              {
                type: NodeType.CONTENT,
                value: 'Child 1 content',
                position: { start: { line: 3, column: 1, offset: 0 }, end: { line: 3, column: 15, offset: 14 } }
              }
            ],
            position: { start: { line: 2, column: 1, offset: 0 }, end: { line: 4, column: 1, offset: 0 } }
          },
          {
            type: NodeType.ELEMENT,
            tagName: 'child2',
            attributes: {},
            children: [
              {
                type: NodeType.CONTENT,
                value: 'Child 2 content',
                position: { start: { line: 6, column: 1, offset: 0 }, end: { line: 6, column: 15, offset: 14 } }
              }
            ],
            position: { start: { line: 5, column: 1, offset: 0 }, end: { line: 7, column: 1, offset: 0 } }
          }
        ],
        position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 8, column: 1, offset: 0 } }
      }
    ],
    position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 8, column: 1, offset: 0 } }
  });
  
  it('在特定节点处理失败后，应继续处理其他节点', () => {
    // 创建一个针对特定节点抛出错误的访问者
    const selectiveErrorVisitor: TransformerVisitor = {
      name: 'selective-error-visitor',
      visitElement: (element: Element, context: TransformContext) => {
        if (element.tagName === 'child1') {
          throw new Error('特定子节点处理错误');
        }
        return {
          type: 'processed-element',
          tagName: element.tagName,
          processed: true
        };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(selectiveErrorVisitor);
    
    // 配置为宽松模式
    const options: TransformOptions = {
      mode: 'loose'
    };
    
    // 执行转换
    const result = transformer.transform(createTestDocument(), options);
    
    // 验证转换结果
    expect(result).toBeDefined();
    
    // 验证child1节点处理失败但child2节点被正确处理
    if (result && result.children && result.children.length > 0) {
      const rootElement = result.children[0];
      if (rootElement.children && rootElement.children.length > 0) {
        const child2 = rootElement.children[1];
        expect(child2).toHaveProperty('processed', true);
      }
    }
    
    // 验证错误被记录
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('特定子节点处理错误')
    );
  });
  
  it('在部分异步处理失败后，应继续处理其他部分', async () => {
    // 创建一个针对特定节点异步抛出错误的访问者
    const asyncSelectiveErrorVisitor: TransformerVisitor = {
      name: 'async-selective-error-visitor',
      visitElement: async (element: Element, context: TransformContext) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        
        if (element.tagName === 'child1') {
          throw new Error('异步特定子节点处理错误');
        }
        
        return {
          type: 'async-processed-element',
          tagName: element.tagName,
          processed: true
        };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(asyncSelectiveErrorVisitor);
    
    // 配置为宽松模式
    const options: TransformOptions = {
      mode: 'loose'
    };
    
    // 执行异步转换
    const result = await transformer.transformAsync(createTestDocument(), options);
    
    // 验证转换结果
    expect(result).toBeDefined();
    
    // 验证child1节点处理失败但child2节点被正确处理
    if (result && result.children && result.children.length > 0) {
      const rootElement = result.children[0];
      if (rootElement.children && rootElement.children.length > 0) {
        const child2 = rootElement.children[1];
        expect(child2).toHaveProperty('processed', true);
      }
    }
    
    // 验证错误被记录
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('异步特定子节点处理错误')
    );
  });
  
  it('错误访问者被禁用后，后续转换应绕过它', () => {
    // 创建一个总是抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'always-error-visitor',
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('总是失败');
      }
    };
    
    // 创建一个正常的访问者
    const normalVisitor: TransformerVisitor = {
      name: 'normal-visitor',
      visitDocument: (doc: Document, context: TransformContext) => {
        return { ...doc, processed: true };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor);
    transformer.registerVisitor(normalVisitor);
    
    // 配置为宽松模式且错误阈值为1
    const options: TransformOptions = {
      mode: 'loose',
      errorThreshold: 1
    };
    
    // 第一次转换，errorVisitor应该失败并计入错误计数
    transformer.transform(createTestDocument(), options);
    
    // 第二次转换，errorVisitor应该被禁用，只有normalVisitor执行
    const result = transformer.transform(createTestDocument(), options);
    
    // 验证结果来自normalVisitor且不包含错误
    expect(result).toHaveProperty('processed', true);
    
    // 验证错误访问者被禁用的警告
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('已禁用')
    );
    
    // 验证第二次转换没有新的错误被记录
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });
  
  it('禁用错误访问者后，不影响其他访问者处理同类型节点', () => {
    // 创建两个处理元素节点的访问者，一个会出错
    const errorElementVisitor: TransformerVisitor = {
      name: 'error-element-visitor',
      priority: 100,
      visitElement: (element: Element, context: TransformContext) => {
        throw new Error('元素处理错误');
      }
    };
    
    const goodElementVisitor: TransformerVisitor = {
      name: 'good-element-visitor',
      priority: 50,
      visitElement: (element: Element, context: TransformContext) => {
        return {
          ...element,
          processed: true,
          processor: 'good-visitor'
        };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorElementVisitor);
    transformer.registerVisitor(goodElementVisitor);
    
    // 配置为宽松模式且错误阈值为1
    const options: TransformOptions = {
      mode: 'loose',
      errorThreshold: 1
    };
    
    // 第一次转换，错误访问者应该失败并被计入
    transformer.transform(createTestDocument(), options);
    
    // 第二次转换，错误访问者应被禁用，只有好的访问者执行
    const result = transformer.transform(createTestDocument(), options);
    
    // 验证良好访问者能够正确处理元素节点
    expect(result).toBeDefined();
    if (result && result.children && result.children.length > 0) {
      // 检查root节点是否被良好访问者处理
      const rootElement = result.children[0];
      expect(rootElement).toHaveProperty('processed', true);
      expect(rootElement).toHaveProperty('processor', 'good-visitor');
      
      // 检查子节点也被良好访问者处理
      if (rootElement.children && rootElement.children.length > 0) {
        const child1 = rootElement.children[0];
        expect(child1).toHaveProperty('processed', true);
        expect(child1).toHaveProperty('processor', 'good-visitor');
      }
    }
  });
  
  it('应能从不完整AST中恢复并处理有效部分', () => {
    // 创建一个不完整的文档（缺少某些必需属性）
    const incompleteDoc: any = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          // 缺少tagName属性
          attributes: {},
          children: [
            {
              type: NodeType.CONTENT,
              value: 'Incomplete content',
              // 缺少position属性
            }
          ],
          position: { start: { line: 1, column: 1 }, end: { line: 2, column: 1 } } // 不完整的position
        },
        {
          type: NodeType.ELEMENT,
          tagName: 'valid-element',
          attributes: {},
          children: [],
          position: { start: { line: 3, column: 1, offset: 0 }, end: { line: 3, column: 10, offset: 9 } }
        }
      ],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 4, column: 1, offset: 0 } }
    };
    
    // 创建一个健壮的访问者，能处理不完整的节点
    const robustVisitor: TransformerVisitor = {
      name: 'robust-visitor',
      visitElement: (element: Element, context: TransformContext) => {
        // 检查并处理有效元素，跳过无效元素
        if (!element.tagName) {
          return element; // 返回原始元素，不处理
        }
        
        return {
          ...element,
          processed: true,
          tagName: element.tagName
        };
      },
      visitDocument: (doc: Document, context: TransformContext) => {
        return doc; // 简单地返回文档
      },
      visitContent: (content: any, context: TransformContext) => {
        // 如果内容节点有效，则处理它
        if (!content.value) {
          return content;
        }
        
        return {
          ...content,
          processed: true,
          value: content.value
        };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(robustVisitor);
    
    // 配置为宽松模式
    const options: TransformOptions = {
      mode: 'loose'
    };
    
    // 执行转换
    const result = transformer.transform(incompleteDoc, options);
    
    // 验证结果
    expect(result).toBeDefined();
    
    // 检查有效的元素是否被正确处理
    if (result && result.children && result.children.length > 1) {
      const validElement = result.children[1];
      expect(validElement).toHaveProperty('processed', true);
      expect(validElement).toHaveProperty('tagName', 'valid-element');
    }
  });
}); 