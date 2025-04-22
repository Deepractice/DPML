import { describe, it, expect } from 'vitest';

import { Schema } from '../../../core/schema/Schema';

describe('Schema Unit Tests', () => {
  describe('validate method', () => {
    // Positive Cases
    it('UT-Schema-Val-01: validate 应接受基本的有效 ElementSchema', () => {
      const schemaInstance = new Schema();
      const input = { element: "button" };

      expect(schemaInstance.validate(input)).toBe(true);
    });

    it('UT-Schema-Val-02: validate 应接受带有效 attributes 的 ElementSchema', () => {
      const schemaInstance = new Schema();
      const input = {
        element: "button",
        attributes: [
          { name: "type", enum: ["a", "b"] },
          { name: "disabled" }
        ]
      };

      expect(schemaInstance.validate(input)).toBe(true);
    });

    it('UT-Schema-Val-03: validate 应接受带有效 content 的 ElementSchema', () => {
      const schemaInstance = new Schema();
      const input = {
        element: "p",
        content: { type: "text", required: true }
      };

      expect(schemaInstance.validate(input)).toBe(true);
    });

    it('UT-Schema-Val-04: validate 应接受带有效 children 的 ElementSchema', () => {
      const schemaInstance = new Schema();
      const input = {
        element: "div",
        children: {
          elements: [{ element: "span" }]
        }
      };

      expect(schemaInstance.validate(input)).toBe(true);
    });

    it('UT-Schema-Val-05: validate 应接受带有效 $ref 引用的 ElementSchema', () => {
      const schemaInstance = new Schema();
      const input = {
        element: "form",
        children: {
          elements: [{ $ref: "button" }]
        }
      };

      expect(schemaInstance.validate(input)).toBe(true);
    });

    it('UT-Schema-Val-06: validate 应接受有效的 DocumentSchema', () => {
      const schemaInstance = new Schema();
      const input = {
        metaType: "document",
        root: { element: "div" },
        types: [
          { metaType: "element", element: "button" }
        ]
      };

      expect(schemaInstance.validate(input)).toBe(true);
    });

    it('UT-Schema-Val-07: validate 应接受带 globalAttributes 的 DocumentSchema', () => {
      const schemaInstance = new Schema();
      const input = {
        metaType: "document",
        root: { element: "div" },
        types: [
          { metaType: "element", element: "button" }
        ],
        globalAttributes: [
          { name: "class" },
          { name: "id" }
        ]
      };

      expect(schemaInstance.validate(input)).toBe(true);
    });

    // Negative Cases
    it('UT-Schema-ValNeg-01: validate 应拒绝缺少 element 的 ElementSchema', () => {
      const schemaInstance = new Schema();
      const input = { attributes: [] };

      expect(schemaInstance.validate(input)).toBe(false);
    });

    it('UT-Schema-ValNeg-02: validate 应拒绝 attributes 不是数组的 ElementSchema', () => {
      const schemaInstance = new Schema();
      const input = {
        element: "button",
        attributes: { name: "type" }
      };

      expect(schemaInstance.validate(input)).toBe(false);
    });

    it('UT-Schema-ValNeg-03: validate 应拒绝 attribute 定义缺少 name', () => {
      const schemaInstance = new Schema();
      const input = {
        element: "button",
        attributes: [{ enum: ["a", "b"] }]
      };

      expect(schemaInstance.validate(input)).toBe(false);
    });

    it('UT-Schema-ValNeg-04: validate 应拒绝 content 定义缺少 type', () => {
      const schemaInstance = new Schema();
      const input = {
        element: "p",
        content: { required: true }
      };

      expect(schemaInstance.validate(input)).toBe(false);
    });

    it('UT-Schema-ValNeg-05: validate 应拒绝 children 定义缺少 elements', () => {
      const schemaInstance = new Schema();
      const input = {
        element: "div",
        children: { orderImportant: true }
      };

      expect(schemaInstance.validate(input)).toBe(false);
    });

    it('UT-Schema-ValNeg-06: validate 应拒绝无效的 $ref (引用不存在的类型)', () => {
      const schemaInstance = new Schema();
      const input = {
        element: "form",
        children: {
          elements: [{ $ref: 123 }] // 非字符串引用
        }
      };

      expect(schemaInstance.validate(input)).toBe(false);
    });

    it('UT-Schema-ValNeg-07: validate 应拒绝 DocumentSchema 缺少 root', () => {
      const schemaInstance = new Schema();
      const input = {
        metaType: "document",
        types: [
          { metaType: "element", element: "button" }
        ]
      };

      expect(schemaInstance.validate(input)).toBe(false);
    });
  });

  describe('collectErrors method', () => {
    it('UT-Schema-CollErr-01: collectErrors 应收集单个错误信息', () => {
      const schemaInstance = new Schema();
      // 使用与UT-Schema-ValNeg-01相同的输入：缺少element的ElementSchema
      const input = { attributes: [] };

      const errors = schemaInstance.collectErrors(input);

      // 校验返回的错误
      expect(errors).toBeInstanceOf(Array);
      expect(errors.length).toBe(1);
      expect(errors[0].message).toBeDefined();
      expect(errors[0].code).toBe('MISSING_ELEMENT');
      expect(errors[0].path).toBeDefined();
    });

    it('UT-Schema-CollErr-02: collectErrors 应收集多个错误信息', () => {
      const schemaInstance = new Schema();
      // 输入同时缺少element和content.type，children.elements
      const input = {
        content: {},
        children: {}
      };

      const errors = schemaInstance.collectErrors(input);

      // 校验返回多个错误
      expect(errors).toBeInstanceOf(Array);
      expect(errors.length).toBeGreaterThan(1);

      // 验证包含了所有期望的错误
      const errorCodes = errors.map(e => e.code);

      expect(errorCodes).toContain('MISSING_ELEMENT');
      expect(errorCodes).toContain('MISSING_CONTENT_TYPE');
      expect(errorCodes).toContain('MISSING_CHILDREN_ELEMENTS');
    });

    it('UT-Schema-CollErr-03: collectErrors 应包含正确的错误 path', () => {
      const schemaInstance = new Schema();
      // 属性缺少name
      const input = {
        element: "button",
        attributes: [{ enum: ["a", "b"] }]
      };

      const errors = schemaInstance.collectErrors(input);

      // 校验错误路径
      expect(errors).toBeInstanceOf(Array);
      expect(errors.length).toBe(1);
      expect(errors[0].path).toBe('attributes[0]');
      expect(errors[0].code).toBe('MISSING_ATTRIBUTE_NAME');
    });

    it('UT-Schema-CollErr-04: collectErrors 对有效 Schema 应返回空数组', () => {
      const schemaInstance = new Schema();
      // 使用与UT-Schema-Val-01相同的输入：有效的ElementSchema
      const input = { element: "button" };

      const errors = schemaInstance.collectErrors(input);

      // 校验返回空数组
      expect(errors).toBeInstanceOf(Array);
      expect(errors.length).toBe(0);
    });
  });
});
