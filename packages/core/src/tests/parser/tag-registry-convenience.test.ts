import { TagRegistry } from '../../parser/tag-registry';
import { expect, describe, it, beforeEach } from 'vitest';

describe('TagRegistry便捷方法测试', () => {
  describe('getBaseAttributes', () => {
    it('应返回正确的基础属性集合', () => {
      const baseAttrs = TagRegistry.getBaseAttributes();
      
      // 验证结果是否为对象格式
      expect(baseAttrs).toBeDefined();
      
      // 验证是否包含所有预期的基础属性
      expect(baseAttrs).toHaveProperty('id', true);
      expect(baseAttrs).toHaveProperty('class', true);
      expect(baseAttrs).toHaveProperty('style', true);
      expect(baseAttrs).toHaveProperty('datatest', true);
      
      // 验证是否只包含预期的属性
      expect(Object.keys(baseAttrs)).toHaveLength(4);
    });
  });
  
  describe('createTagDefinition', () => {
    it('应自动合并基础属性和自定义属性', () => {
      const customAttrs = {
        type: true,
        format: true
      };
      
      const tagDef = TagRegistry.createTagDefinition({
        name: 'testTag',
        attributes: customAttrs,
        allowedChildren: ['child1', 'child2'],
        selfClosing: true
      });
      
      // 验证基础属性是否被合并
      expect(tagDef.attributes).toHaveProperty('id', true);
      expect(tagDef.attributes).toHaveProperty('class', true);
      expect(tagDef.attributes).toHaveProperty('style', true);
      expect(tagDef.attributes).toHaveProperty('datatest', true);
      
      // 验证自定义属性是否存在
      expect(tagDef.attributes).toHaveProperty('type', true);
      expect(tagDef.attributes).toHaveProperty('format', true);
      
      // 验证其他属性是否正确设置
      expect(tagDef.name).toBe('testTag');
      expect(tagDef.allowedChildren).toEqual(['child1', 'child2']);
      expect(tagDef.selfClosing).toBe(true);
    });
    
    it('在没有提供自定义属性时应只使用基础属性', () => {
      const tagDef = TagRegistry.createTagDefinition({
        name: 'basicTag'
      });
      
      // 验证只包含基础属性
      const baseAttrs = TagRegistry.getBaseAttributes();
      expect(tagDef.attributes).toEqual(baseAttrs);
    });
  });
  
  describe('registerTag', () => {
    it('应使用便捷方法正确注册标签', () => {
      const registry = new TagRegistry();
      
      // 使用便捷方法注册标签
      registry.registerTag('convenientTag', {
        attributes: { format: true },
        allowedChildren: ['text'],
        selfClosing: true
      });
      
      // 验证标签是否已正确注册
      expect(registry.isTagRegistered('convenientTag')).toBe(true);
      
      // 获取并验证标签定义
      const tagDef = registry.getTagDefinition('convenientTag');
      expect(tagDef).toBeDefined();
      
      // 验证属性是否正确合并
      expect(tagDef!.attributes).toHaveProperty('id', true);
      expect(tagDef!.attributes).toHaveProperty('format', true);
      
      // 验证其他属性
      expect(tagDef!.allowedChildren).toEqual(['text']);
      expect(tagDef!.selfClosing).toBe(true);
    });
    
    it('应处理标签名称的大小写问题', () => {
      const registry = new TagRegistry();
      
      // 注册使用大写的标签名
      registry.registerTag('MixedCaseTag', {
        selfClosing: true
      });
      
      // 验证使用小写名称也能找到
      expect(registry.isTagRegistered('mixedcasetag')).toBe(true);
      expect(registry.getTagDefinition('mixedcasetag')).toBeDefined();
    });
  });
  
  describe('README示例验证', () => {
    it('应验证README中的示例代码正确工作', () => {
      // 这个测试验证README中展示的代码示例
      const myTagAttributes = {
        type: true,
        format: true
      };
      
      // 创建包含基础属性的标签定义
      const myTagDef = TagRegistry.createTagDefinition({
        name: 'myTag',
        attributes: myTagAttributes,
        allowedChildren: ['text', 'code']
      });
      
      // 验证标签定义
      expect(myTagDef.attributes).toHaveProperty('id', true);
      expect(myTagDef.attributes).toHaveProperty('type', true);
      expect(myTagDef.attributes).toHaveProperty('format', true);
      expect(myTagDef.allowedChildren).toEqual(['text', 'code']);
      
      // 测试注册过程
      const registry = new TagRegistry();
      
      // 旧方式：分两步完成
      registry.registerTagDefinition('myTag', myTagDef);
      expect(registry.isTagRegistered('myTag')).toBe(true);
      
      // 新方式：使用便捷方法直接注册
      registry.registerTag('directTag', {
        attributes: {
          type: true,
          format: true
        },
        allowedChildren: ['text', 'code'],
        selfClosing: false
      });
      
      expect(registry.isTagRegistered('directTag')).toBe(true);
      
      // 验证两种方式结果一致
      const traditionalDef = registry.getTagDefinition('myTag');
      const directDef = registry.getTagDefinition('directTag');
      
      // 比较关键属性
      expect(traditionalDef!.attributes).toEqual(directDef!.attributes);
      expect(traditionalDef!.allowedChildren).toEqual(directDef!.allowedChildren);
      expect(traditionalDef!.selfClosing).toBe(directDef!.selfClosing);
    });
  });
}); 