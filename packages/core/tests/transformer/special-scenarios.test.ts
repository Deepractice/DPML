import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultTransformerFactory } from '../../src/transformer/defaultTransformerFactory';
import { DefaultOutputAdapterFactory } from '../../src/transformer/adapters/defaultOutputAdapterFactory';
import { Document, Element, Content, NodeType } from '../../src/types/node';
import { TransformerVisitor } from '../../src/transformer/interfaces/transformerVisitor';
import { TransformContext } from '../../src/transformer/interfaces/transformContext';
import { XMLAdapter } from '../../src/transformer/adapters/xmlAdapter';
import { JSONAdapter } from '../../src/transformer/adapters/jsonAdapter';
import { MarkdownAdapter } from '../../src/transformer/adapters/markdownAdapter';
import { SpecialScenariosVisitor } from '../../src/transformer/visitors/specialScenariosVisitor';

describe('特殊场景测试', () => {
  let transformerFactory: DefaultTransformerFactory;
  let adapterFactory: DefaultOutputAdapterFactory;
  
  beforeEach(() => {
    transformerFactory = new DefaultTransformerFactory();
    adapterFactory = new DefaultOutputAdapterFactory();
    
    // 注册常用适配器
    adapterFactory.register('json', new JSONAdapter());
    adapterFactory.register('xml', new XMLAdapter());
    adapterFactory.register('markdown', new MarkdownAdapter());
  });

  describe('空文档转换', () => {
    it('应该能正确处理完全空的文档', () => {
      // 创建一个空文档 - 没有任何子节点
      const emptyDocument: Document = {
        type: NodeType.DOCUMENT,
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 1, offset: 0 }
        }
      };
      
      const transformer = transformerFactory.createTransformer({}, adapterFactory);
      
      // 转换结果应该是一个对象，包含type和isEmpty属性
      const result = transformer.transform(emptyDocument);
      
      // 验证结果 - 应该指示这是一个空文档
      expect(result).toBeDefined();
      expect(result.type).toBe('document');
      expect(result.isEmpty).toBe(true);
      expect(result.children).toEqual([]);
    });
    
    it('应该能处理只有根元素但无内容的文档', () => {
      // 创建一个有根元素但没有内容的文档
      const emptyRootDocument: Document = {
        type: NodeType.DOCUMENT,
        children: [{
          type: NodeType.ELEMENT,
          tagName: 'root',
          attributes: {},
          children: [],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 10, offset: 9 }
          }
        } as Element],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 10, offset: 9 }
        }
      };
      
      const transformer = transformerFactory.createTransformer({}, adapterFactory);
      
      // 转换为默认格式
      const result = transformer.transform(emptyRootDocument);
      
      // 验证结果 - 应该包含根元素
      expect(result).toBeDefined();
      expect(result.type).toBe('document');
      expect(result.children.length).toBe(1);
      expect(result.children[0].tagName).toBe('root');
      expect(result.children[0].type).toBe('element');
    });
  });

  describe('特殊字符处理', () => {
    it('应该能正确处理包含特殊字符的内容', () => {
      // 创建包含特殊字符的文档
      const specialCharsDocument: Document = {
        type: NodeType.DOCUMENT,
        children: [{
          type: NodeType.ELEMENT,
          tagName: 'content',
          attributes: {},
          children: [{
            type: NodeType.CONTENT,
            value: '<div>这是HTML标签 & 特殊字符</div>',
            position: {
              start: { line: 1, column: 10, offset: 9 },
              end: { line: 1, column: 50, offset: 49 }
            }
          } as Content],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 60, offset: 59 }
          }
        } as Element],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 60, offset: 59 }
        }
      };
      
      const transformer = transformerFactory.createTransformer({}, adapterFactory);
      
      // 转换
      const result = transformer.transform(specialCharsDocument);
      
      // 验证特殊字符被正确处理
      expect(result).toBeDefined();
      expect(result.children[0].children[0].value).toContain('&lt;div&gt;');
      expect(result.children[0].children[0].value).toContain('&amp;');
      expect(result.children[0].children[0].value).toContain('&lt;/div&gt;');
    });
    
    it('应该能处理包含各种Unicode字符的内容', () => {
      // 创建包含各种Unicode字符的文档
      const unicodeDocument: Document = {
        type: NodeType.DOCUMENT,
        children: [{
          type: NodeType.ELEMENT,
          tagName: 'unicode',
          attributes: {},
          children: [{
            type: NodeType.CONTENT,
            value: '中文文本😀🚀👍日本語テキスト\n특수문자',
            position: {
              start: { line: 1, column: 10, offset: 9 },
              end: { line: 2, column: 10, offset: 49 }
            }
          } as Content],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 2, column: 20, offset: 59 }
          }
        } as Element],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 2, column: 20, offset: 59 }
        }
      };
      
      const transformer = transformerFactory.createTransformer({}, adapterFactory);
      
      // 转换
      const result = transformer.transform(unicodeDocument);
      
      // 验证Unicode字符被正确处理
      expect(result).toBeDefined();
      expect(result.children[0].children[0].value).toBe('中文文本😀🚀👍日本語テキスト\n특수문자');
    });
  });

  describe('混合格式内容处理', () => {
    it('应该能处理包含Markdown和HTML混合内容', () => {
      // 创建包含混合格式内容的文档
      const mixedFormatDocument: Document = {
        type: NodeType.DOCUMENT,
        children: [{
          type: NodeType.ELEMENT,
          tagName: 'content',
          attributes: { format: 'mixed' },
          children: [{
            type: NodeType.CONTENT,
            value: '# 标题\n\n这是**加粗文本**和<span style="color:red">HTML内容</span>',
            position: {
              start: { line: 1, column: 10, offset: 9 },
              end: { line: 3, column: 50, offset: 100 }
            }
          } as Content],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 3, column: 60, offset: 110 }
          }
        } as Element],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 3, column: 60, offset: 110 }
        }
      };
      
      const transformer = transformerFactory.createTransformer({}, adapterFactory);
      
      // 转换
      const result = transformer.transform(mixedFormatDocument);
      
      // 验证混合格式内容被正确处理
      expect(result).toBeDefined();
      expect(result.children[0].format).toBe('mixed');
      expect(result.children[0].children[0].value).toContain('# 标题');
      expect(result.children[0].children[0].value).toContain('**加粗文本**');
      expect(result.children[0].children[0].value).toContain('&lt;span style=&quot;color:red&quot;&gt;HTML内容&lt;/span&gt;');
    });
  });

  describe('非常规标签嵌套', () => {
    it('应该能处理不规则和深度嵌套的标签结构', () => {
      // 创建具有不规则嵌套结构的文档
      const level3Content: Content = {
        type: NodeType.CONTENT,
        value: '深度嵌套内容',
        position: { start: { line: 4, column: 1, offset: 30 }, end: { line: 4, column: 10, offset: 40 } }
      };

      const level3Element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'level3',
        attributes: {},
        children: [level3Content],
        position: { start: { line: 3, column: 1, offset: 20 }, end: { line: 5, column: 1, offset: 50 } }
      };

      const level2aElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'level2a',
        attributes: {},
        children: [level3Element],
        position: { start: { line: 2, column: 1, offset: 10 }, end: { line: 6, column: 1, offset: 60 } }
      };

      const level2bElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'level2b',
        attributes: { selfClosing: true },
        children: [],
        position: { start: { line: 7, column: 1, offset: 70 }, end: { line: 7, column: 10, offset: 80 } }
      };

      const level1Element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'level1',
        attributes: {},
        children: [level2aElement, level2bElement],
        position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 8, column: 1, offset: 90 } }
      };
      
      const nestedDocument: Document = {
        type: NodeType.DOCUMENT,
        children: [level1Element],
        position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 8, column: 1, offset: 90 } }
      };
      
      const transformer = transformerFactory.createTransformer({}, adapterFactory);
      
      // 转换
      const result = transformer.transform(nestedDocument);
      
      // 验证嵌套结构被正确处理
      expect(result).toBeDefined();
      expect(result.type).toBe('document');
      // 验证层级结构完整性
      expect(result.children[0].tagName).toBe('level1');
      expect(result.children[0].children[0].tagName).toBe('level2a');
      expect(result.children[0].children[0].children[0].tagName).toBe('level3');
      expect(result.children[0].children[0].children[0].children[0].value).toBe('深度嵌套内容');
      expect(result.children[0].children[1].tagName).toBe('level2b');
      expect(result.children[0].children[1].selfClosing).toBe(true);
    });
  });

  describe('自定义变量替换', () => {
    it('应该能正确替换内容中的自定义变量', () => {
      // 创建包含变量引用的文档
      const variableDocument: Document = {
        type: NodeType.DOCUMENT,
        children: [{
          type: NodeType.ELEMENT,
          tagName: 'template',
          attributes: {},
          children: [{
            type: NodeType.CONTENT,
            value: '你好，${userName}！今天是${currentDate}。',
            position: {
              start: { line: 1, column: 10, offset: 9 },
              end: { line: 1, column: 50, offset: 49 }
            }
          } as Content],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 60, offset: 59 }
          }
        } as Element],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 60, offset: 59 }
        }
      };
      
      const transformer = transformerFactory.createTransformer({}, adapterFactory);
      
      // 注册变量处理访问者（使用我们实现的SpecialScenariosVisitor已经注册）
      
      // 设置自定义变量
      const variables = {
        userName: '张三',
        currentDate: '2023年10月20日'
      };
      
      // 转换，并传入变量
      const result = transformer.transform(variableDocument, { 
        variables: variables
      });
      
      // 验证变量被正确替换
      expect(result).toBeDefined();
      expect(result.children[0].children[0].value).toBe('你好，张三！今天是2023年10月20日。');
    });
    
    it('应该能处理嵌套的变量替换', () => {
      // 创建包含嵌套变量的文档
      const nestedVariableDocument: Document = {
        type: NodeType.DOCUMENT,
        children: [{
          type: NodeType.ELEMENT,
          tagName: 'template',
          attributes: {},
          children: [{
            type: NodeType.CONTENT,
            value: '${greeting}，${user.name}！你的得分是${user.scores.total}分。',
            position: {
              start: { line: 1, column: 10, offset: 9 },
              end: { line: 1, column: 50, offset: 49 }
            }
          } as Content],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 60, offset: 59 }
          }
        } as Element],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 60, offset: 59 }
        }
      };
      
      const transformer = transformerFactory.createTransformer({}, adapterFactory);
      
      // 设置嵌套结构的变量
      const nestedVariables = {
        greeting: '你好',
        user: {
          name: '李四',
          scores: {
            total: 95
          }
        }
      };
      
      // 转换，并传入嵌套变量
      const result = transformer.transform(nestedVariableDocument, { 
        variables: nestedVariables
      });
      
      // 验证变量被正确替换
      expect(result).toBeDefined();
      // 使用我们实现的嵌套变量替换
      expect(result.children[0].children[0].value).toBe('你好，李四！你的得分是95分。');
    });
  });
}); 