import { describe, test, expect, beforeEach } from 'vitest';

import { DocumentValidator } from '../../../../core/processing/DocumentValidator';
import type { DPMLDocument } from '../../../../types/DPMLDocument';
import type { DPMLNode } from '../../../../types/DPMLNode';
import type { ProcessedSchema } from '../../../../types/ProcessedSchema';
import type { ElementSchema, DocumentSchema } from '../../../../types/Schema';

describe('UT-DOCVAL', () => {
  let validator: DocumentValidator;

  beforeEach(() => {
    validator = new DocumentValidator();
  });

  // 测试用例UT-DOCVAL-01: 验证符合Schema的文档
  describe('UT-DOCVAL-01: validateDocument应验证符合Schema的文档', () => {
    test('应通过验证符合Schema的简单文档', () => {
      // 创建一个简单的文档
      const document: DPMLDocument = {
        rootNode: {
          tagName: 'root',
          attributes: new Map([['id', 'root-1']]),
          children: [],
          content: '',
          parent: null,
          sourceLocation: {
            startLine: 1,
            startColumn: 1,
            endLine: 10,
            endColumn: 10
          }
        },
        metadata: {}
      };

      // 创建一个简单的Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: {
            element: 'root',
            attributes: [
              {
                name: 'id',
                required: true
              }
            ]
          },
          types: []
        },
        isValid: true
      };

      // 验证文档
      const result = validator.validateDocument(document, schema);

      // 断言验证通过
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  // 测试用例UT-DOCVAL-02: 验证复杂嵌套结构
  describe('UT-DOCVAL-02: validateDocument应验证复杂嵌套结构', () => {
    test('应通过验证嵌套多层的文档结构', () => {
      // 创建嵌套文档节点
      // 由于DPMLNode的children和parent是只读属性，我们需要使用构造函数或其他方式创建节点

      // 先创建底层节点
      const grandchildNode: DPMLNode = {
        tagName: 'grandchild',
        attributes: new Map([['type', 'special']]),
        children: [],
        content: 'Grandchild content',
        parent: null, // 临时设置，后面会通过从根开始构造解决
        sourceLocation: {
          startLine: 3,
          startColumn: 1,
          endLine: 4,
          endColumn: 10
        }
      };

      // 然后创建中层节点，包含子节点
      const childNode: DPMLNode = {
        tagName: 'child',
        attributes: new Map([['id', 'child-1']]),
        children: [grandchildNode],
        content: 'Child content',
        parent: null, // 临时设置，后面会通过从根开始构造解决
        sourceLocation: {
          startLine: 2,
          startColumn: 1,
          endLine: 5,
          endColumn: 10
        }
      };

      // 创建根节点
      const rootNode: DPMLNode = {
        tagName: 'document',
        attributes: new Map([['version', '1.0']]),
        children: [childNode],
        content: '',
        parent: null,
        sourceLocation: {
          startLine: 1,
          startColumn: 1,
          endLine: 10,
          endColumn: 10
        }
      };

      // 模拟DPMLNode的实际结构，手动构建父子关系
      // 注意：在实际项目中，应当有一个工厂函数或者解析器来正确设置这些关系
      const mockParentRelationship = (node: DPMLNode, parent: DPMLNode | null): void => {
        // 在实际代码中，这些属性应该是在构造时设置的，而不是通过修改只读属性
        Object.defineProperty(node, 'parent', { value: parent, writable: false });
        node.children.forEach(child => mockParentRelationship(child, node));
      };

      // 设置父子关系
      mockParentRelationship(rootNode, null);

      // 创建文档对象
      const document: DPMLDocument = {
        rootNode,
        metadata: {
          title: '测试文档'
        }
      };

      // 创建Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: {
            element: 'document',
            attributes: [
              { name: 'version', required: true }
            ],
            children: {
              elements: [{ element: 'child' }]
            }
          },
          types: [
            {
              element: 'child',
              attributes: [
                { name: 'id', required: true }
              ],
              content: {
                type: 'mixed',
                required: true
              },
              children: {
                elements: [{ element: 'grandchild' }]
              }
            },
            {
              element: 'grandchild',
              attributes: [
                { name: 'type', enum: ['regular', 'special'] }
              ],
              content: {
                type: 'text',
                required: true
              }
            }
          ]
        },
        isValid: true
      };

      // 验证文档
      const result = validator.validateDocument(document, schema);

      // 断言验证通过
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  // 测试用例UT-DOCVAL-03: 验证单个节点
  describe('UT-DOCVAL-03: validateNode应正确验证单个节点', () => {
    test('应验证单个节点', () => {
      // 创建节点
      const node: DPMLNode = {
        tagName: 'root',
        attributes: new Map([['id', 'test-1']]),
        children: [],
        content: 'Test content',
        parent: null,
        sourceLocation: {
          startLine: 1,
          startColumn: 1,
          endLine: 1,
          endColumn: 20
        }
      };

      // 创建Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: { element: 'root' },
          types: [
            {
              element: 'test',
              attributes: [
                { name: 'id', required: true }
              ],
              content: {
                type: 'text',
                required: true
              }
            }
          ]
        },
        isValid: true
      };

      // 验证节点
      const result = validator.validateNode(node, schema);

      // 断言验证通过
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  // 测试用例UT-DOCVAL-04: 验证属性
  describe('UT-DOCVAL-04: validateAttributes应验证有效属性', () => {
    test('应验证有效的属性', () => {
      // 创建节点
      const node: DPMLNode = {
        tagName: 'button',
        attributes: new Map([
          ['type', 'submit'],
          ['disabled', 'true']
        ]),
        children: [],
        content: '',
        parent: null,
        sourceLocation: {
          startLine: 1,
          startColumn: 1,
          endLine: 1,
          endColumn: 50
        }
      };

      // 创建元素定义
      const elementDef: ElementSchema = {
        element: 'button',
        attributes: [
          { name: 'type', enum: ['submit', 'reset', 'button'] },
          { name: 'disabled', required: false }
        ]
      };

      // 验证属性
      const result = validator.validateAttributes(node, elementDef);

      // 断言验证通过
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  // 测试用例UT-DOCVAL-05: 验证子元素
  describe('UT-DOCVAL-05: validateChildren应验证有效子元素结构', () => {
    test('应验证有效的子元素结构', () => {
      // 创建子节点和父节点，处理父子关系
      const child1: DPMLNode = {
        tagName: 'item',
        attributes: new Map(),
        children: [],
        content: 'Item 1',
        parent: null, // 临时值，稍后通过mockParentRelationship设置
        sourceLocation: {
          startLine: 2,
          startColumn: 1,
          endLine: 2,
          endColumn: 50
        }
      };

      const child2: DPMLNode = {
        tagName: 'item',
        attributes: new Map(),
        children: [],
        content: 'Item 2',
        parent: null, // 临时值，稍后通过mockParentRelationship设置
        sourceLocation: {
          startLine: 3,
          startColumn: 1,
          endLine: 3,
          endColumn: 50
        }
      };

      // 创建父节点
      const parentNode: DPMLNode = {
        tagName: 'list',
        attributes: new Map(),
        children: [child1, child2],
        content: '',
        parent: null,
        sourceLocation: {
          startLine: 1,
          startColumn: 1,
          endLine: 4,
          endColumn: 50
        }
      };

      // 设置父子关系
      const mockParentRelationship = (node: DPMLNode, parent: DPMLNode | null): void => {
        Object.defineProperty(node, 'parent', { value: parent, writable: false });
      };

      mockParentRelationship(child1, parentNode);
      mockParentRelationship(child2, parentNode);

      // 创建元素定义
      const elementDef: ElementSchema = {
        element: 'list',
        children: {
          elements: [{ element: 'item' }],
          min: 1,
          max: 5
        }
      };

      // 验证子元素
      const result = validator.validateChildren(parentNode, elementDef);

      // 断言验证通过
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  // 测试用例UT-DOCVAL-06: 验证内容
  describe('UT-DOCVAL-06: validateContent应验证有效内容', () => {
    test('应验证有效的内容', () => {
      // 创建节点
      const node: DPMLNode = {
        tagName: 'text',
        attributes: new Map(),
        children: [],
        content: 'This is valid content.',
        parent: null,
        sourceLocation: {
          startLine: 1,
          startColumn: 1,
          endLine: 1,
          endColumn: 50
        }
      };

      // 创建元素定义
      const elementDef: ElementSchema = {
        element: 'text',
        content: {
          type: 'text',
          required: true,
          pattern: '^This is.*'
        }
      };

      // 验证内容
      const result = validator.validateContent(node, elementDef);

      // 断言验证通过
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  // 测试用例UT-DOCVAL-NEG-01: 检测未知元素
  describe('UT-DOCVAL-NEG-01: validateDocument应检测未知元素', () => {
    test('应检测并报告未知元素', () => {
      // 创建文档
      const document: DPMLDocument = {
        rootNode: {
          tagName: 'unknown',
          attributes: new Map(),
          children: [],
          content: '',
          parent: null,
          sourceLocation: {
            startLine: 1,
            startColumn: 1,
            endLine: 1,
            endColumn: 20
          }
        },
        metadata: {}
      };

      // 创建Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: { element: 'root' },
          types: []
        },
        isValid: true
      };

      // 验证文档
      const result = validator.validateDocument(document, schema);

      // 断言验证失败，并有相应的错误
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe('TAG_MISMATCH');
    });
  });

  // 测试用例UT-DOCVAL-NEG-02: 检测无效属性
  describe('UT-DOCVAL-NEG-02: validateDocument应检测无效属性', () => {
    test('应检测并报告无效属性', () => {
      // 创建文档
      const document: DPMLDocument = {
        rootNode: {
          tagName: 'root',
          attributes: new Map([['unknown', 'value']]),
          children: [],
          content: '',
          parent: null,
          sourceLocation: {
            startLine: 1,
            startColumn: 1,
            endLine: 1,
            endColumn: 20
          }
        },
        metadata: {}
      };

      // 创建Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: {
            element: 'root',
            attributes: [
              { name: 'id', required: true }
            ]
          },
          types: []
        },
        isValid: true
      };

      // 验证文档
      const result = validator.validateDocument(document, schema);

      // 断言验证失败，并有相应的错误
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.code === 'UNKNOWN_ATTRIBUTE')).toBe(true);
    });
  });

  // 测试用例UT-DOCVAL-NEG-03: 检测无效子元素
  describe('UT-DOCVAL-NEG-03: validateDocument应检测无效子元素', () => {
    test('应检测并报告无效子元素', () => {
      // 创建子节点
      const childNode: DPMLNode = {
        tagName: 'unknown',
        attributes: new Map(),
        children: [],
        content: '',
        parent: null, // 临时值，稍后通过mockParentRelationship设置
        sourceLocation: {
          startLine: 2,
          startColumn: 1,
          endLine: 2,
          endColumn: 50
        }
      };

      // 创建根节点
      const rootNode: DPMLNode = {
        tagName: 'root',
        attributes: new Map(),
        children: [childNode],
        content: '',
        parent: null,
        sourceLocation: {
          startLine: 1,
          startColumn: 1,
          endLine: 3,
          endColumn: 50
        }
      };

      // 设置父子关系
      const mockParentRelationship = (node: DPMLNode, parent: DPMLNode | null): void => {
        Object.defineProperty(node, 'parent', { value: parent, writable: false });
      };

      mockParentRelationship(childNode, rootNode);

      // 创建文档
      const document: DPMLDocument = {
        rootNode,
        metadata: {}
      };

      // 创建Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: {
            element: 'root',
            children: {
              elements: [{ element: 'child' }]
            }
          },
          types: [
            {
              element: 'child',
              content: { type: 'text' }
            }
          ]
        },
        isValid: true
      };

      // 验证文档
      const result = validator.validateDocument(document, schema);

      // 断言验证失败，并有相应的错误
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.code === 'UNKNOWN_ELEMENT')).toBe(true);
    });
  });

  // 测试用例UT-DOCVAL-NEG-04: 检测无效内容
  describe('UT-DOCVAL-NEG-04: validateDocument应检测无效内容', () => {
    test('应检测并报告无效内容', () => {
      // 创建文档
      const document: DPMLDocument = {
        rootNode: {
          tagName: 'root',
          attributes: new Map(),
          children: [],
          content: 'Invalid content',
          parent: null,
          sourceLocation: {
            startLine: 1,
            startColumn: 1,
            endLine: 1,
            endColumn: 50
          }
        },
        metadata: {}
      };

      // 创建Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: {
            element: 'root',
            content: {
              type: 'text',
              pattern: '^Valid.*'
            }
          },
          types: []
        },
        isValid: true
      };

      // 验证文档
      const result = validator.validateDocument(document, schema);

      // 断言验证失败，并有相应的错误
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.code === 'CONTENT_PATTERN_MISMATCH')).toBe(true);
    });
  });

  // 测试用例UT-DOCVAL-NEG-05: 检测缺少必需属性
  describe('UT-DOCVAL-NEG-05: validateDocument应检测缺少必需属性', () => {
    test('应检测并报告缺少必需属性', () => {
      // 创建文档
      const document: DPMLDocument = {
        rootNode: {
          tagName: 'root',
          attributes: new Map(),
          children: [],
          content: '',
          parent: null,
          sourceLocation: {
            startLine: 1,
            startColumn: 1,
            endLine: 1,
            endColumn: 50
          }
        },
        metadata: {}
      };

      // 创建Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: {
            element: 'root',
            attributes: [
              { name: 'id', required: true }
            ]
          },
          types: []
        },
        isValid: true
      };

      // 验证文档
      const result = validator.validateDocument(document, schema);

      // 断言验证失败，并有相应的错误
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.code === 'MISSING_REQUIRED_ATTRIBUTE')).toBe(true);
    });
  });

  // 测试用例UT-DOCVAL-NEG-06: 检测缺少必需子元素
  describe('UT-DOCVAL-NEG-06: validateDocument应检测缺少必需子元素', () => {
    test('应检测并报告缺少必需子元素', () => {
      // 创建文档
      const document: DPMLDocument = {
        rootNode: {
          tagName: 'root',
          attributes: new Map(),
          children: [],
          content: '',
          parent: null,
          sourceLocation: {
            startLine: 1,
            startColumn: 1,
            endLine: 1,
            endColumn: 50
          }
        },
        metadata: {}
      };

      // 创建Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: {
            element: 'root',
            children: {
              elements: [{ element: 'child' }],
              min: 1
            }
          },
          types: [
            {
              element: 'child',
              content: { type: 'text' }
            }
          ]
        },
        isValid: true
      };

      // 验证文档
      const result = validator.validateDocument(document, schema);

      // 断言验证失败，并有相应的错误
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.code === 'TOO_FEW_CHILDREN')).toBe(true);
    });
  });

  // 测试用例UT-DOCVAL-NEG-07: 检测缺少必需内容
  describe('UT-DOCVAL-NEG-07: validateDocument应检测缺少必需内容', () => {
    test('应检测并报告缺少必需内容', () => {
      // 创建文档
      const document: DPMLDocument = {
        rootNode: {
          tagName: 'root',
          attributes: new Map(),
          children: [],
          content: '',
          parent: null,
          sourceLocation: {
            startLine: 1,
            startColumn: 1,
            endLine: 1,
            endColumn: 50
          }
        },
        metadata: {}
      };

      // 创建Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: {
            element: 'root',
            content: {
              type: 'text',
              required: true
            }
          },
          types: []
        },
        isValid: true
      };

      // 验证文档
      const result = validator.validateDocument(document, schema);

      // 断言验证失败，并有相应的错误
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.code === 'MISSING_REQUIRED_CONTENT')).toBe(true);
    });
  });

  // 测试用例UT-DOCVAL-ERR-01: 收集单个错误
  describe('UT-DOCVAL-ERR-01: validateDocument应收集单个错误', () => {
    test('应收集单个错误', () => {
      // 创建文档
      const document: DPMLDocument = {
        rootNode: {
          tagName: 'root',
          attributes: new Map(),
          children: [],
          content: '',
          parent: null,
          sourceLocation: {
            startLine: 1,
            startColumn: 1,
            endLine: 1,
            endColumn: 50
          }
        },
        metadata: {}
      };

      // 创建Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: {
            element: 'root',
            attributes: [
              { name: 'id', required: true }
            ]
          },
          types: []
        },
        isValid: true
      };

      // 验证文档
      const result = validator.validateDocument(document, schema);

      // 断言验证失败，并有单个错误
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].code).toBe('MISSING_REQUIRED_ATTRIBUTE');
    });
  });

  // 测试用例UT-DOCVAL-ERR-02: 收集多个错误
  describe('UT-DOCVAL-ERR-02: validateDocument应收集多个错误', () => {
    test('应收集多个错误', () => {
      // 创建文档
      const document: DPMLDocument = {
        rootNode: {
          tagName: 'root',
          attributes: new Map([['unknown', 'value']]),
          children: [],
          content: '',
          parent: null,
          sourceLocation: {
            startLine: 1,
            startColumn: 1,
            endLine: 1,
            endColumn: 50
          }
        },
        metadata: {}
      };

      // 创建Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: {
            element: 'root',
            attributes: [
              { name: 'id', required: true }
            ],
            content: {
              type: 'text',
              required: true
            }
          },
          types: []
        },
        isValid: true
      };

      // 验证文档
      const result = validator.validateDocument(document, schema);

      // 断言验证失败，并有多个错误
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors.some(e => e.code === 'UNKNOWN_ATTRIBUTE')).toBe(true);
      expect(result.errors.some(e => e.code === 'MISSING_REQUIRED_ATTRIBUTE')).toBe(true);
      expect(result.errors.some(e => e.code === 'MISSING_REQUIRED_CONTENT')).toBe(true);
    });
  });

  // 测试用例UT-DOCVAL-ERR-03: 错误提供准确位置
  describe('UT-DOCVAL-ERR-03: validateDocument应为错误提供准确位置', () => {
    test('应为错误提供准确的源位置和路径', () => {
      // 创建节点
      const node: DPMLNode = {
        tagName: 'root',
        attributes: new Map(),
        children: [],
        content: '',
        parent: null,
        sourceLocation: {
          startLine: 5,
          startColumn: 10,
          endLine: 5,
          endColumn: 50
        }
      };

      // 创建文档
      const document: DPMLDocument = {
        rootNode: node,
        metadata: {}
      };

      // 创建Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: {
            element: 'root',
            attributes: [
              { name: 'id', required: true }
            ]
          },
          types: []
        },
        isValid: true
      };

      // 验证文档
      const result = validator.validateDocument(document, schema);

      // 断言错误包含准确的位置信息
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].path).toBe('/root/@id');
      expect(result.errors[0].source).toEqual({
        startLine: 5,
        startColumn: 10,
        endLine: 5,
        endColumn: 50
      });
    });
  });

  // 测试用例UT-DOCVAL-ERR-04: 区分错误和警告
  describe('UT-DOCVAL-ERR-04: validateDocument应区分错误和警告', () => {
    test('应正确区分错误和警告', () => {
      // 创建子节点
      const childNode: DPMLNode = {
        tagName: 'text',
        attributes: new Map(),
        children: [],
        content: 'Content',
        parent: null, // 临时值，稍后通过mockParentRelationship设置
        sourceLocation: {
          startLine: 2,
          startColumn: 1,
          endLine: 2,
          endColumn: 50
        }
      };

      // 创建根节点
      const rootNode: DPMLNode = {
        tagName: 'root',
        attributes: new Map([['unknown', 'value']]),
        children: [childNode],
        content: 'Unexpected content',
        parent: null,
        sourceLocation: {
          startLine: 1,
          startColumn: 1,
          endLine: 3,
          endColumn: 50
        }
      };

      // 设置父子关系
      const mockParentRelationship = (node: DPMLNode, parent: DPMLNode | null): void => {
        Object.defineProperty(node, 'parent', { value: parent, writable: false });
      };

      mockParentRelationship(childNode, rootNode);

      // 创建文档
      const document: DPMLDocument = {
        rootNode,
        metadata: {}
      };

      // 创建Schema
      const schema: ProcessedSchema<DocumentSchema> = {
        schema: {
          root: {
            element: 'root',
            attributes: [
              // 只定义特定属性，使unknown属性成为真正的未知属性
              { name: 'known', required: false }
            ],
            children: {
              elements: [{ element: 'text' }]
            }
          },
          types: [
            {
              element: 'text',
              content: { type: 'text' }
            }
          ]
        },
        isValid: true
      };

      // 验证文档
      const result = validator.validateDocument(document, schema);

      // 断言正确区分错误和警告
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);

      // 检查错误
      expect(result.errors.some(e => e.code === 'UNKNOWN_ATTRIBUTE')).toBe(true);
      expect(result.errors.every(e => e.severity === 'error')).toBe(true);

      // 检查警告
      expect(result.warnings.some(w => w.code === 'UNEXPECTED_CONTENT')).toBe(true);
      expect(result.warnings.every(w => w.severity === 'warning')).toBe(true);
    });
  });
});
