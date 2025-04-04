import { expect, describe, it, beforeEach } from 'vitest';
import { DpmlAdapter } from '../../../src/parser/dpml-adapter';
import { ExtendedAttributeProcessor } from '../../../src/parser/attribute-processors/extended-attributes';
import { Element } from '../../../src/types/node';

describe('扩展属性处理器集成测试', () => {
  let processor: ExtendedAttributeProcessor;
  let dpmlAdapter: DpmlAdapter;
  
  beforeEach(() => {
    processor = new ExtendedAttributeProcessor();
    dpmlAdapter = new DpmlAdapter();
  });
  
  describe('基础集成', () => {
    it('应该能处理DPML文档中的disabled属性', async () => {
      const dpml = `
        <prompt>
          <button disabled="true">禁用按钮</button>
        </prompt>
      `;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      
      // 创建一个用于处理的上下文
      const extendedAttributes = new Map();
      const context = {
        extendedAttributes,
        addWarning: () => {}
      };
      
      // 处理button元素的disabled属性
      const promptElement = document.children[0] as Element;
      const buttonElement = promptElement.children[0] as Element;
      
      processor.processDisabled(buttonElement, context);
      
      // disabled属性应该被正确处理
      expect(extendedAttributes.has(buttonElement)).toBe(true);
      const attrs = extendedAttributes.get(buttonElement);
      expect(attrs).toHaveProperty('disabled');
      expect(attrs.disabled.value).toBe(true);
      expect(attrs.disabled.conditional).toBe(false);
    });
    
    it('应该能处理DPML文档中的条件disabled属性', async () => {
      const dpml = `
        <prompt>
          <button disabled="\${isAdmin}">管理员功能</button>
        </prompt>
      `;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      
      // 创建一个用于处理的上下文
      const extendedAttributes = new Map();
      const context = {
        extendedAttributes,
        addWarning: () => {}
      };
      
      // 处理button元素的disabled属性
      const promptElement = document.children[0] as Element;
      const buttonElement = promptElement.children[0] as Element;
      
      processor.processDisabled(buttonElement, context);
      
      // 条件disabled属性应该被正确处理
      expect(extendedAttributes.has(buttonElement)).toBe(true);
      const attrs = extendedAttributes.get(buttonElement);
      expect(attrs).toHaveProperty('disabled');
      expect(attrs.disabled.value).toBe('${isAdmin}');
      expect(attrs.disabled.conditional).toBe(true);
      expect(attrs.disabled.expression).toBe('isAdmin');
    });
    
    it('应该能处理DPML文档中的hidden属性', async () => {
      const dpml = `
        <prompt>
          <div hidden="true">隐藏内容</div>
        </prompt>
      `;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      
      // 创建一个用于处理的上下文
      const extendedAttributes = new Map();
      const context = {
        extendedAttributes,
        addWarning: () => {}
      };
      
      // 处理div元素的hidden属性
      const promptElement = document.children[0] as Element;
      const divElement = promptElement.children[0] as Element;
      
      processor.processHidden(divElement, context);
      
      // hidden属性应该被正确处理
      expect(extendedAttributes.has(divElement)).toBe(true);
      const attrs = extendedAttributes.get(divElement);
      expect(attrs).toHaveProperty('hidden');
      expect(attrs.hidden.value).toBe(true);
      expect(attrs.hidden.conditional).toBe(false);
    });
  });
  
  describe('错误处理', () => {
    it('应该能检测无效的disabled属性值', async () => {
      const dpml = `
        <prompt>
          <button disabled="maybe">有问题的按钮</button>
        </prompt>
      `;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      
      // 创建一个用于捕获警告的上下文
      let warningCalled = false;
      let warningMessage = '';
      
      const context = {
        extendedAttributes: new Map(),
        addWarning: (code: string, message: string) => {
          warningCalled = true;
          warningMessage = message;
        }
      };
      
      // 处理button元素的disabled属性
      const promptElement = document.children[0] as Element;
      const buttonElement = promptElement.children[0] as Element;
      
      processor.processDisabled(buttonElement, context);
      
      // 应该添加警告
      expect(warningCalled).toBe(true);
      expect(warningMessage).toContain('无效的disabled属性值');
    });
    
    it('应该能处理同时具有多个扩展属性的元素', async () => {
      const dpml = `
        <prompt>
          <button disabled="true" hidden="\${isSecret}">特殊按钮</button>
        </prompt>
      `;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      
      // 创建一个用于处理的上下文
      const extendedAttributes = new Map();
      const context = {
        extendedAttributes,
        addWarning: () => {}
      };
      
      // 处理button元素的所有扩展属性
      const promptElement = document.children[0] as Element;
      const buttonElement = promptElement.children[0] as Element;
      
      processor.processAttributes(buttonElement, context);
      
      // 所有扩展属性应该被正确处理
      expect(extendedAttributes.has(buttonElement)).toBe(true);
      const attrs = extendedAttributes.get(buttonElement);
      
      // 检查disabled属性
      expect(attrs).toHaveProperty('disabled');
      expect(attrs.disabled.value).toBe(true);
      expect(attrs.disabled.conditional).toBe(false);
      
      // 检查hidden属性
      expect(attrs).toHaveProperty('hidden');
      expect(attrs.hidden.value).toBe('${isSecret}');
      expect(attrs.hidden.conditional).toBe(true);
      expect(attrs.hidden.expression).toBe('isSecret');
    });
  });
}); 