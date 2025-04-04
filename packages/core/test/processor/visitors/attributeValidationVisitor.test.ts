import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NodeType, Document, Element, SourcePosition } from '../../../src/types/node';
import { ProcessingContext } from '../../../src/processor/processingContext';
import { DocumentMode } from '../../../src/processor/visitors/documentMetadataVisitor';
import { AttributeValidationVisitor, AttributeValidationOptions } from '../../../src/processor/visitors/attributeValidationVisitor';
import { ValidationError, ErrorCode, ErrorLevel } from '../../../src/errors/types';
import { TagRegistry } from '../../../src/parser/tag-registry';

describe('AttributeValidationVisitor', () => {
  let visitor: AttributeValidationVisitor;
  let context: ProcessingContext;
  let document: Document;
  let registry: TagRegistry;
  const mockPosition: SourcePosition = {
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 1, offset: 0 }
  };

  beforeEach(() => {
    // 创建标签注册表
    registry = new TagRegistry();
    
    // 注册测试标签
    registry.registerTagDefinition('role', {
      attributes: ['name', 'id', 'type'],
      requiredAttributes: ['name']
    });
    
    registry.registerTagDefinition('prompt', {
      attributes: ['id', 'version', 'model'],
      requiredAttributes: ['model']
    });
    
    // 创建基础文档
    document = {
      type: NodeType.DOCUMENT,
      children: [],
      position: mockPosition
    };
    
    // 创建处理上下文
    context = new ProcessingContext(document, '/test/path');
    
    // 记录元数据
    context.variables.metadata = {
      mode: DocumentMode.LOOSE
    };
    
    // 创建访问者
    visitor = new AttributeValidationVisitor({
      tagRegistry: registry
    });
  });

  it('应该验证属性类型', async () => {
    // 添加数字类型验证的标签定义
    registry.registerTagDefinition('number', {
      attributes: ['value', 'id'],
      requiredAttributes: ['value'],
      validate: (element) => {
        const value = element.attributes.value;
        if (isNaN(Number(value))) {
          return {
            valid: false,
            errors: [{
              code: ErrorCode.INVALID_ATTRIBUTE,
              message: `value属性必须是数字，收到: ${value}`,
              position: element.position
            }]
          };
        }
        return { valid: true };
      }
    });
    
    // 创建测试元素
    const validElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'number',
      attributes: { value: '123' },
      children: [],
      position: mockPosition
    };
    
    const invalidElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'number',
      attributes: { value: 'abc' },
      children: [],
      position: mockPosition
    };
    
    // 验证有效元素不会抛出错误
    const result1 = await visitor.visitElement(validElement, context);
    expect(result1).toBe(validElement);
    
    // 验证无效元素在严格模式下会抛出错误
    context.variables.metadata.mode = DocumentMode.STRICT;
    await expect(visitor.visitElement(invalidElement, context)).rejects.toThrow();
    
    // 验证无效元素在宽松模式下只会发出警告
    context.variables.metadata.mode = DocumentMode.LOOSE;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result2 = await visitor.visitElement(invalidElement, context);
    expect(result2).toBe(invalidElement);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('应该验证属性值范围', async () => {
    // 添加范围验证的标签定义
    registry.registerTagDefinition('range', {
      attributes: ['min', 'max', 'id'],
      requiredAttributes: ['min', 'max'],
      validate: (element) => {
        const min = Number(element.attributes.min);
        const max = Number(element.attributes.max);
        
        if (min >= max) {
          return {
            valid: false,
            errors: [{
              code: ErrorCode.INVALID_ATTRIBUTE,
              message: 'min必须小于max',
              position: element.position
            }]
          };
        }
        return { valid: true };
      }
    });
    
    // 创建测试元素
    const validElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'range',
      attributes: { min: '1', max: '10' },
      children: [],
      position: mockPosition
    };
    
    const invalidElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'range',
      attributes: { min: '10', max: '1' },
      children: [],
      position: mockPosition
    };
    
    // 验证有效元素不会抛出错误
    const result1 = await visitor.visitElement(validElement, context);
    expect(result1).toBe(validElement);
    
    // 验证无效元素在严格模式下会抛出错误
    context.variables.metadata.mode = DocumentMode.STRICT;
    await expect(visitor.visitElement(invalidElement, context)).rejects.toThrow();
  });

  it('应该验证必需属性', async () => {
    // 创建缺少必需属性的元素
    const missingRequiredElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'role',
      attributes: { id: 'test-id' }, // 缺少必需的name属性
      children: [],
      position: mockPosition
    };
    
    // 在严格模式下验证
    context.variables.metadata.mode = DocumentMode.STRICT;
    await expect(visitor.visitElement(missingRequiredElement, context)).rejects.toThrow();
    
    // 在宽松模式下验证
    context.variables.metadata.mode = DocumentMode.LOOSE;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await visitor.visitElement(missingRequiredElement, context);
    expect(result).toBe(missingRequiredElement);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
  
  it('应该识别未知属性', async () => {
    // 创建带有未知属性的元素
    const unknownAttributeElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'role',
      attributes: { 
        name: 'test',
        unknown: 'value' // 未知属性
      },
      children: [],
      position: mockPosition
    };
    
    // 在严格模式下验证
    context.variables.metadata.mode = DocumentMode.STRICT;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await visitor.visitElement(unknownAttributeElement, context);
    expect(result).toBe(unknownAttributeElement);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
    
    // 验证以x-开头的扩展属性不会触发警告
    const extensionAttributeElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'role',
      attributes: { 
        name: 'test',
        'x-custom': 'value' // 扩展属性
      },
      children: [],
      position: mockPosition
    };
    
    const warnSpy2 = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result2 = await visitor.visitElement(extensionAttributeElement, context);
    expect(result2).toBe(extensionAttributeElement);
    expect(warnSpy2).not.toHaveBeenCalled();
    warnSpy2.mockRestore();
  });
  
  it('应该区分严格模式与宽松模式的验证差异', async () => {
    // 创建缺少必需属性的元素
    const missingRequiredElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'prompt',
      attributes: { id: 'test-prompt' }, // 缺少必需的model属性
      children: [],
      position: mockPosition
    };
    
    // 在宽松模式下应只发出警告而不抛出错误
    context.variables.metadata.mode = DocumentMode.LOOSE;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result1 = await visitor.visitElement(missingRequiredElement, context);
    expect(result1).toBe(missingRequiredElement);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
    
    // 在严格模式下应抛出错误
    context.variables.metadata.mode = DocumentMode.STRICT;
    await expect(visitor.visitElement(missingRequiredElement, context)).rejects.toThrow();
    
    // 直接设置访问者为严格模式，即使文档是宽松模式
    visitor = new AttributeValidationVisitor({
      tagRegistry: registry,
      strictMode: true
    });
    
    context.variables.metadata.mode = DocumentMode.LOOSE;
    await expect(visitor.visitElement(missingRequiredElement, context)).rejects.toThrow();
  });
  
  it('应该处理无标签定义的元素', async () => {
    // 创建没有标签定义的元素
    const undefinedTagElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'undefined-tag',
      attributes: { attr: 'value' },
      children: [],
      position: mockPosition
    };
    
    // 在默认情况下，无标签定义的元素应该通过验证
    const result = await visitor.visitElement(undefinedTagElement, context);
    expect(result).toBe(undefinedTagElement);
    
    // 设置严格模式，无标签定义的元素应该触发错误
    visitor = new AttributeValidationVisitor({
      tagRegistry: registry,
      strictMode: true,
      validateUnknownTags: true
    });
    
    await expect(visitor.visitElement(undefinedTagElement, context)).rejects.toThrow();
  });
});
