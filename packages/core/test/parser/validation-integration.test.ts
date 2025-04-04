import { expect, describe, it, beforeEach } from 'vitest';
import { DpmlAdapter } from '../../src/parser/dpml-adapter';
import { TagRegistry } from '../../src/parser/tag-registry';
import { Validator } from '../../src/parser/validator';
import { NodeType, Element } from '../../src/types/node';
import { ErrorCode } from '../../src/errors/types';

describe('验证集成测试', () => {
  let registry: TagRegistry;
  let validator: Validator;
  let dpmlAdapter: DpmlAdapter;
  
  beforeEach(() => {
    registry = new TagRegistry();
    
    // 注册测试标签
    registry.registerTagDefinition('prompt', {
      attributes: ['version', 'id'],
      allowedChildren: ['role', 'context', 'br']
    });
    
    registry.registerTagDefinition('role', {
      attributes: ['name', 'id'],
      requiredAttributes: ['name'],
      allowedChildren: ['content']
    });
    
    registry.registerTagDefinition('context', {
      attributes: ['id'],
      allowedChildren: []
    });
    
    registry.registerTagDefinition('br', {
      selfClosing: true
    });
    
    validator = new Validator(registry);
    dpmlAdapter = new DpmlAdapter();
  });
  
  describe('基本验证测试', () => {
    it('应该验证有效的DPML文档', async () => {
      const dpml = `
        <prompt version="1.0">
          <role name="user">你好</role>
          <role name="assistant">我是助手</role>
        </prompt>
      `;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      const validationResult = validator.validateDocument(document);
      
      expect(validationResult.valid).toBe(true);
      expect(validationResult.errors).toBeUndefined();
    });
    
    it('应该检测到缺少必需属性', async () => {
      const dpml = `
        <prompt>
          <role>缺少name属性</role>
        </prompt>
      `;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      const validationResult = validator.validateDocument(document);
      
      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors).toBeDefined();
      expect(validationResult.errors!.length).toBeGreaterThan(0);
      expect(validationResult.errors![0].code).toBe(ErrorCode.MISSING_REQUIRED_ATTRIBUTE);
      expect(validationResult.errors![0].message).toContain('name');
    });
    
    it('应该检测到标签嵌套错误', async () => {
      const dpml = `
        <role name="user">
          <prompt>标签嵌套错误</prompt>
        </role>
      `;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      const validationResult = validator.validateDocument(document);
      
      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors).toBeDefined();
      expect(validationResult.errors!.length).toBeGreaterThan(0);
      expect(validationResult.errors![0].code).toBe(ErrorCode.INVALID_NESTING);
      expect(validationResult.errors![0].message).toContain('role');
      expect(validationResult.errors![0].message).toContain('prompt');
    });
    
    it('应该处理未知标签', async () => {
      const dpml = `
        <prompt>
          <unknown-tag>未知标签</unknown-tag>
        </prompt>
      `;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      const validationResult = validator.validateDocument(document);
      
      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors).toBeDefined();
      expect(validationResult.errors!.length).toBeGreaterThan(0);
      expect(validationResult.errors![0].code).toBe(ErrorCode.INVALID_NESTING);
      expect(validationResult.errors![0].message).toContain('prompt');
      expect(validationResult.errors![0].message).toContain('unknown-tag');
    });
    
    it('应该处理自闭合标签', async () => {
      const dpml = `
        <prompt>
          文本 <br/> 文本
        </prompt>
      `;
      
      const result = await dpmlAdapter.parse(dpml);
      const document = result.ast;
      const validationResult = validator.validateDocument(document);
      
      expect(validationResult.valid).toBe(true);
    });
  });
}); 