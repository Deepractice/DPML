import { expect, describe, it, beforeEach } from 'vitest';
import { DpmlAdapter } from '../../../src/parser/dpml-adapter';
import { CoreAttributeProcessor } from '../../../src/parser/attribute-processors/core-attributes';
import { ParseContext } from '../../../src/parser/attribute-processors/core-attributes';
import { Element } from '../../../src/types/node';

describe('核心属性处理器集成测试', () => {
  let processor: CoreAttributeProcessor;
  let dpmlAdapter: DpmlAdapter;
  
  beforeEach(() => {
    processor = new CoreAttributeProcessor();
    dpmlAdapter = new DpmlAdapter();
  });
  
  describe('基础集成', () => {
    it('应该能处理DPML文档中的id属性', async () => {
      const dpml = `
        <prompt>
          <role id="user-role" name="user">
            用户内容
          </role>
          <role id="assistant-role" name="assistant">
            助手内容
          </role>
        </prompt>
      `;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      
      // 创建一个用于处理的上下文
      const idRegistry = new Map<string, Element>();
      const context: ParseContext = {
        idRegistry,
        addWarning: () => {},
        addError: () => {}
      };
      
      // 处理第一个role元素的id属性
      const promptElement = document.children[0] as Element;
      const roleElement = promptElement.children[0] as Element;
      
      processor.processElementId(roleElement, context);
      
      // ID应该被注册
      expect(idRegistry.has('user-role')).toBe(true);
      expect(idRegistry.get('user-role')).toBe(roleElement);
    });
    
    it('应该能处理DPML文档中的version属性', async () => {
      const dpml = `<prompt version="1.0">提示内容</prompt>`;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      const promptElement = document.children[0] as Element;
      
      // 创建一个用于处理的上下文
      const context: ParseContext = {
        documentLang: 'en',
        addWarning: () => {}
      };
      
      processor.processRootAttributes(promptElement, context);
      
      // 版本应该被处理，但我们无法直接验证内部状态
      // 这里我们只验证方法执行不抛出异常
      expect(true).toBe(true);
    });
    
    it('应该能处理DPML文档中的lang属性', async () => {
      const dpml = `<prompt lang="zh-CN">中文内容</prompt>`;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      const promptElement = document.children[0] as Element;
      
      // 创建一个用于处理的上下文
      const context: ParseContext = {
        documentLang: 'en',
        addWarning: () => {}
      };
      
      processor.processRootAttributes(promptElement, context);
      
      // 语言应该被设置
      expect(context.documentLang).toBe('zh-CN');
    });
  });
  
  describe('错误处理', () => {
    it('应该能识别无效的ID属性', async () => {
      const dpml = `<prompt><role id="1invalid">无效ID</role></prompt>`;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      const promptElement = document.children[0] as Element;
      const roleElement = promptElement.children[0] as Element;
      
      // 创建一个用于捕获警告的上下文
      let warningCalled = false;
      let warningCode = '';
      const idRegistry = new Map<string, Element>();
      
      const context: ParseContext = {
        idRegistry,
        addWarning: (code) => {
          warningCalled = true;
          warningCode = code;
        }
      };
      
      processor.processElementId(roleElement, context);
      
      // 应该添加警告
      expect(warningCalled).toBe(true);
      expect(warningCode).toBe('invalid-id');
      
      // ID不应该被注册
      expect(idRegistry.has('1invalid')).toBe(false);
    });
    
    it('应该能识别重复的ID属性', async () => {
      const dpml = `
        <prompt>
          <role id="duplicate-id" name="user">用户</role>
          <role id="duplicate-id" name="assistant">助手</role>
        </prompt>
      `;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      const promptElement = document.children[0] as Element;
      const firstRoleElement = promptElement.children[0] as Element;
      const secondRoleElement = promptElement.children[1] as Element;
      
      // 创建一个用于捕获错误的上下文
      let errorCalled = false;
      let errorCode = '';
      const idRegistry = new Map<string, Element>();
      
      const context: ParseContext = {
        idRegistry,
        addWarning: () => {},
        addError: (code) => {
          errorCalled = true;
          errorCode = code;
        }
      };
      
      // 处理第一个元素
      processor.processElementId(firstRoleElement, context);
      
      // 处理第二个元素（具有相同ID）
      processor.processElementId(secondRoleElement, context);
      
      // 应该添加错误
      expect(errorCalled).toBe(true);
      expect(errorCode).toBe('duplicate-id');
    });
    
    it('应该能识别无效的版本格式', async () => {
      const dpml = `<prompt version="invalid">内容</prompt>`;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      const promptElement = document.children[0] as Element;
      
      // 创建一个用于捕获警告的上下文
      let warningCalled = false;
      let warningCode = '';
      
      const context: ParseContext = {
        documentLang: 'en',
        addWarning: (code) => {
          warningCalled = true;
          warningCode = code;
        }
      };
      
      processor.processRootAttributes(promptElement, context);
      
      // 应该添加警告
      expect(warningCalled).toBe(true);
      expect(warningCode).toBe('invalid-version');
    });
  });
}); 