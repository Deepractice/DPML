import { describe, it, expect, beforeEach } from 'vitest';
import { OutputAdapter } from '../../../transformer/interfaces/outputAdapter';
import { TransformContext } from '../../../transformer/interfaces/transformContext';
import { AdapterSelector } from '../../../transformer/interfaces/adapterSelector';
import { DefaultAdapterSelector } from '../../../transformer/adapters/defaultAdapterSelector';
import { DefaultOutputAdapterFactory } from '../../../transformer/adapters/defaultOutputAdapterFactory';
import { GenericAdapter } from '../../../transformer/adapters/genericAdapter';
import { JSONAdapter } from '../../../transformer/adapters/jsonAdapter';
import { XMLAdapter } from '../../../transformer/adapters/xmlAdapter';
import { MarkdownAdapter } from '../../../transformer/adapters/markdownAdapter';
import { ContextManager } from '../../../transformer/context/contextManager';
import { ProcessedDocument } from '../../../processor/interfaces/processor';
import { NodeType } from '../../../types/node';

describe('AdapterSelector', () => {
  // 创建测试上下文
  const createContext = (): TransformContext => {
    // 创建一个最小化的文档
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 }
      }
    };

    // 创建上下文管理器
    const contextManager = new ContextManager();
    
    // 返回根上下文
    return contextManager.createRootContext(document, {});
  };
  
  let factory: DefaultOutputAdapterFactory;
  let selector: AdapterSelector;

  beforeEach(() => {
    factory = new DefaultOutputAdapterFactory();
    
    // 注册测试适配器
    factory.register('json', new JSONAdapter());
    factory.register('xml', new XMLAdapter());
    factory.register('md', new MarkdownAdapter());
    factory.register('generic', new GenericAdapter());
    
    // 设置默认适配器
    factory.setDefaultAdapter('generic');
    
    // 创建选择器
    selector = new DefaultAdapterSelector(factory);
  });

  it('应该根据请求的格式选择适配器', () => {
    // 准备
    const context = createContext();
    
    // 执行
    const adapter1 = selector.selectAdapter('json', context);
    const adapter2 = selector.selectAdapter('xml', context);
    
    // 验证
    expect(adapter1).toBeInstanceOf(JSONAdapter);
    expect(adapter2).toBeInstanceOf(XMLAdapter);
  });

  it('应该支持从上下文变量中获取格式', () => {
    // 准备
    const context = createContext();
    context.variables['outputFormat'] = 'json';
    
    // 执行
    const adapter = selector.selectAdapter(null, context);
    
    // 验证
    expect(adapter).toBeInstanceOf(JSONAdapter);
  });

  it('应该支持从文档元数据中获取格式', () => {
    // 准备
    const context = createContext();
    const document = context.document as ProcessedDocument;
    
    // 设置文档元数据
    if (!document.meta) {
      document.meta = {};
    }
    document.meta.outputFormat = 'xml';
    
    // 执行
    const adapter = selector.selectAdapter(null, context);
    
    // 验证
    expect(adapter).toBeInstanceOf(XMLAdapter);
  });

  it('应该支持基于内容类型的格式推断', () => {
    // 准备
    const context = createContext();
    const result = { type: 'document', content: '<root><item>测试</item></root>' };
    
    // 执行
    const adapter = selector.selectAdapter(null, context, result);
    
    // 验证 - 基于XML内容应选择XMLAdapter
    expect(adapter).toBeInstanceOf(XMLAdapter);
  });

  it('应该能处理未知格式', () => {
    // 准备
    const context = createContext();
    
    // 执行
    const adapter = selector.selectAdapter('unknown', context);
    
    // 验证 - 应返回默认适配器
    expect(adapter).toBeInstanceOf(GenericAdapter);
  });

  it('应该支持自定义格式解析逻辑', () => {
    // 准备
    class CustomSelector extends DefaultAdapterSelector {
      protected inferFormatFromResult(result: any): string | null {
        if (result && typeof result === 'object') {
          if (Array.isArray(result)) {
            return 'json'; // 数组默认用JSON
          }
          if (result.type === 'markdown') {
            return 'md';
          }
        }
        return super.inferFormatFromResult(result);
      }
    }
    
    const customSelector = new CustomSelector(factory);
    const context = createContext();
    
    // 执行
    const adapter1 = customSelector.selectAdapter(null, context, [1, 2, 3]);
    const adapter2 = customSelector.selectAdapter(null, context, { type: 'markdown', content: '# 标题' });
    
    // 验证
    expect(adapter1).toBeInstanceOf(JSONAdapter);
    expect(adapter2).toBeInstanceOf(MarkdownAdapter);
  });
  
  it('应该支持格式推断优先级', () => {
    // 准备
    const context = createContext();
    context.variables['outputFormat'] = 'json';
    
    const document = context.document as ProcessedDocument;
    if (!document.meta) {
      document.meta = {};
    }
    document.meta.outputFormat = 'xml';
    
    // 执行 - 显式传入的格式应最高优先级
    const adapter1 = selector.selectAdapter('md', context);
    
    // 验证
    expect(adapter1).toBeInstanceOf(MarkdownAdapter);
    
    // 执行 - 上下文变量应优先于文档元数据
    const adapter2 = selector.selectAdapter(null, context);
    
    // 验证
    expect(adapter2).toBeInstanceOf(JSONAdapter);
    
    // 执行 - 清除上下文变量后，应使用文档元数据
    context.variables['outputFormat'] = null;
    const adapter3 = selector.selectAdapter(null, context);
    
    // 验证
    expect(adapter3).toBeInstanceOf(XMLAdapter);
  });
}); 