/**
 * DPML处理器基本使用示例
 * 
 * 本示例展示了如何使用@dpml/core中的处理器模块处理DPML文档，包括:
 * - 创建和配置DefaultProcessor
 * - 注册自定义访问者
 * - 处理简单文档
 * - 引用解析
 * - 错误处理
 */

import { 
  DefaultProcessor,
  NodeVisitor,
  ProcessingContext,
  DefaultReferenceResolver,
  FileProtocolHandler,
  IdProtocolHandler,
  HttpProtocolHandler,
} from '../packages/core/src';

import { Node, NodeType } from '../packages/core/src/types/node';
import { ErrorSeverity } from '../packages/core/src/processor/errors/processingError';

// 节点类型定义
type ElementNode = {
  type: 'element';
  name: string;
  attributes: Record<string, any>;
  children: (ElementNode | TextNode)[];
  position: { line: number, column: number };
};

type TextNode = {
  type: 'text';
  content: string;
  position: { line: number, column: number };
};

// 访问结果枚举
enum VisitResult {
  CONTINUE = 'continue',
  SKIP = 'skip',
  TERMINATE = 'terminate'
}

// 创建一个简单的DPML文档
async function createSampleDocument(): Promise<ElementNode> {
  // 创建根元素
  const rootElement: ElementNode = {
    type: 'element',
    name: 'dpml',
    attributes: {
      version: '1.0'
    },
    children: [],
    position: { line: 1, column: 1 }
  };

  // 添加一些元素
  rootElement.children.push(
    {
      type: 'element',
      name: 'section',
      attributes: {
        id: 'intro',
        title: '介绍'
      },
      children: [
        {
          type: 'element',
          name: 'content',
          attributes: {},
          children: [
            {
              type: 'text',
              content: '这是DPML文档处理器示例。',
              position: { line: 3, column: 3 }
            }
          ],
          position: { line: 3, column: 1 }
        }
      ],
      position: { line: 2, column: 1 }
    },
    {
      type: 'element',
      name: 'section',
      attributes: {
        id: 'example',
        title: '示例'
      },
      children: [
        {
          type: 'element',
          name: 'reference',
          attributes: {
            href: 'id:intro'
          },
          children: [],
          position: { line: 7, column: 1 }
        },
        {
          type: 'element',
          name: 'markdown',
          attributes: {},
          children: [
            {
              type: 'text',
              content: '# Markdown支持\n\n这是Markdown格式内容。\n\n- 项目1\n- 项目2\n',
              position: { line: 8, column: 3 }
            }
          ],
          position: { line: 8, column: 1 }
        }
      ],
      position: { line: 6, column: 1 }
    }
  );

  return rootElement;
}

// 创建一个自定义访问者
class CustomContentVisitor implements NodeVisitor {
  // 设置优先级
  priority = 100;
  
  // 访问文档根元素
  async visitDocument(document: any, context: ProcessingContext): Promise<any> {
    console.log('开始处理文档...');
    console.log(`文档版本: ${document.attributes?.version || '未指定'}`);
    return document; // 返回文档，继续处理
  }
  
  // 访问特定元素
  async visitElement(element: any, context: ProcessingContext): Promise<any> {
    // 仅处理section元素
    if (element.name === 'section') {
      console.log(`处理章节: ${element.attributes?.title || '未命名章节'} (id: ${element.attributes?.id})`);
      
      // 记录处理过的章节ID
      if (element.attributes?.id) {
        const processedSections = context.variables['processedSections'] || [];
        processedSections.push(element.attributes.id);
        context.variables['processedSections'] = processedSections;
      }
    }
    
    // 处理markdown元素
    if (element.name === 'markdown') {
      console.log('发现Markdown内容，进行处理...');
    }
    
    return element; // 返回元素，继续处理
  }
}

// 主函数
async function main() {
  try {
    console.log('===== DPML处理器示例 =====');
    
    // 创建文档
    const document = await createSampleDocument();
    console.log('创建测试文档成功');
    
    // 创建引用解析器
    const referenceResolver = new DefaultReferenceResolver();
    
    // 注册协议处理器
    referenceResolver.registerProtocolHandler(new FileProtocolHandler());
    referenceResolver.registerProtocolHandler(new IdProtocolHandler());
    referenceResolver.registerProtocolHandler(new HttpProtocolHandler());
    
    // 创建处理器
    const processor = new DefaultProcessor({
      strictMode: false, // 使用宽松模式处理错误
      errorRecovery: true // 启用错误恢复
    });
    
    // 设置引用解析器
    processor.setReferenceResolver(referenceResolver);
    
    // 注册自定义访问者
    processor.registerVisitor(new CustomContentVisitor());
    
    console.log('处理器配置完成，开始处理文档...');
    
    // 处理文档
    const processedDoc = await processor.process(document as any, 'example-document.xml');
    
    console.log('\n===== 处理结果 =====');
    console.log(`处理状态: 完成`);
    
    // 获取处理上下文中的数据
    if (processor['context']) {
      const processedSections = processor['context'].variables['processedSections'] || [];
      console.log(`处理的章节: ${processedSections.join(', ')}`);
    }
    
    console.log('\n===== 完成 =====');
  } catch (error) {
    console.error('处理过程中发生异常:', error);
  }
}

// 运行示例
main().catch(console.error); 