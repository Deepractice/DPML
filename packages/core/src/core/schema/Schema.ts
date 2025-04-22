/**
 * Schema 业务类
 * 负责实现 Schema 验证和处理的核心逻辑，例如根据 Meta 规则验证用户提供的 Schema。
 */
import type { SchemaError } from '../../types/SchemaError';

import type {
  ElementMeta,
  DocumentMeta,
  AttributeMeta,
  ContentMeta,
  ChildrenMeta
} from './types';

export class Schema {
  /**
   * 验证Schema是否符合Meta规则
   * @param schema 需要验证的Schema对象
   * @returns 如果验证通过则返回true，否则返回false
   */
  validate<T extends object>(schema: T): boolean {
    if (!schema || typeof schema !== 'object') {
      return false;
    }

    // 判断是DocumentSchema还是ElementSchema
    if ('metaType' in schema && schema.metaType === 'document') {
      return this.validateDocumentSchema(schema as unknown as DocumentMeta);
    } else {
      return this.validateElementSchema(schema as unknown as ElementMeta);
    }
  }

  /**
   * 验证ElementSchema
   * @param schema ElementMeta对象
   * @returns 如果验证通过则返回true，否则返回false
   */
  private validateElementSchema(schema: ElementMeta): boolean {
    // 验证element字段是必需的
    if (!schema.element || typeof schema.element !== 'string') {
      return false;
    }

    // 验证attributes字段（如果存在）
    if (schema.attributes !== undefined) {
      // attributes必须是数组
      if (!Array.isArray(schema.attributes)) {
        return false;
      }

      // 验证每个attribute
      for (const attr of schema.attributes) {
        if (!this.validateAttribute(attr)) {
          return false;
        }
      }
    }

    // 验证content字段（如果存在）
    if (schema.content !== undefined && !this.validateContent(schema.content)) {
      return false;
    }

    // 验证children字段（如果存在）
    if (schema.children !== undefined && !this.validateChildren(schema.children)) {
      return false;
    }

    return true;
  }

  /**
   * 验证DocumentSchema
   * @param schema DocumentMeta对象
   * @returns 如果验证通过则返回true，否则返回false
   */
  private validateDocumentSchema(schema: DocumentMeta): boolean {
    // 验证root字段是必需的
    if (!schema.root) {
      return false;
    }

    // 验证root字段是ElementMeta、TypeReference或字符串
    if (typeof schema.root === 'object') {
      if ('$ref' in schema.root) {
        if (typeof schema.root.$ref !== 'string') {
          return false;
        }
      } else if (!this.validateElementSchema(schema.root as ElementMeta)) {
        return false;
      }
    } else if (typeof schema.root !== 'string') {
      return false;
    }

    // 验证types字段（如果存在）
    if (schema.types !== undefined) {
      if (!Array.isArray(schema.types)) {
        return false;
      }

      // 验证每个type
      for (const type of schema.types) {
        if (!this.validateElementSchema(type)) {
          return false;
        }
      }
    }

    // 验证globalAttributes字段（如果存在）
    if (schema.globalAttributes !== undefined) {
      if (!Array.isArray(schema.globalAttributes)) {
        return false;
      }

      // 验证每个globalAttribute
      for (const attr of schema.globalAttributes) {
        if (!this.validateAttribute(attr)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 验证attribute
   * @param attribute AttributeMeta对象
   * @returns 如果验证通过则返回true，否则返回false
   */
  private validateAttribute(attribute: AttributeMeta): boolean {
    // name字段是必需的
    if (!attribute.name || typeof attribute.name !== 'string') {
      return false;
    }

    // type字段（如果存在）必须是字符串
    if (attribute.type !== undefined && typeof attribute.type !== 'string') {
      return false;
    }

    // enum字段（如果存在）必须是字符串数组
    if (attribute.enum !== undefined) {
      if (!Array.isArray(attribute.enum)) {
        return false;
      }

      for (const value of attribute.enum) {
        if (typeof value !== 'string') {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 验证content
   * @param content ContentMeta对象
   * @returns 如果验证通过则返回true，否则返回false
   */
  private validateContent(content: ContentMeta): boolean {
    // type字段是必需的
    if (!content.type || typeof content.type !== 'string') {
      return false;
    }

    return true;
  }

  /**
   * 验证children
   * @param children ChildrenMeta对象
   * @returns 如果验证通过则返回true，否则返回false
   */
  private validateChildren(children: ChildrenMeta): boolean {
    // elements字段是必需的
    if (!children.elements || !Array.isArray(children.elements)) {
      return false;
    }

    // 验证每个element或$ref
    for (const item of children.elements) {
      if ('$ref' in item) {
        // 验证$ref是字符串
        if (typeof item.$ref !== 'string') {
          return false;
        }
      } else {
        // 验证ElementMeta
        if (!this.validateElementSchema(item as ElementMeta)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 收集Schema验证错误
   * @param schema 需要验证的Schema对象
   * @returns 验证错误列表
   */
  collectErrors<T extends object>(schema: T): SchemaError[] {
    const errors: SchemaError[] = [];

    if (!schema || typeof schema !== 'object') {
      errors.push({
        message: '必须提供有效的Schema对象',
        code: 'INVALID_SCHEMA',
        path: ''
      });

      return errors;
    }

    // 判断是DocumentSchema还是ElementSchema
    if ('metaType' in schema && schema.metaType === 'document') {
      this.collectDocumentSchemaErrors(schema as unknown as DocumentMeta, errors, '');
    } else {
      this.collectElementSchemaErrors(schema as unknown as ElementMeta, errors, '');
    }

    return errors;
  }

  /**
   * 收集ElementSchema的错误
   * @param schema ElementMeta对象
   * @param errors 错误数组
   * @param path 当前路径
   */
  private collectElementSchemaErrors(
    schema: ElementMeta,
    errors: SchemaError[],
    path: string
  ): void {
    // 验证element字段是必需的
    if (!schema.element || typeof schema.element !== 'string') {
      errors.push({
        message: 'element字段是必需的，且必须是字符串',
        code: 'MISSING_ELEMENT',
        path: path || ''
      });
    }

    // 验证attributes字段（如果存在）
    if (schema.attributes !== undefined) {
      const attrPath = path ? `${path}.attributes` : 'attributes';

      // attributes必须是数组
      if (!Array.isArray(schema.attributes)) {
        errors.push({
          message: 'attributes字段必须是数组',
          code: 'INVALID_ATTRIBUTES_TYPE',
          path: attrPath
        });
      } else {
        // 验证每个attribute
        schema.attributes.forEach((attr, index) => {
          this.collectAttributeErrors(attr, errors, `${attrPath}[${index}]`);
        });
      }
    }

    // 验证content字段（如果存在）
    if (schema.content !== undefined) {
      const contentPath = path ? `${path}.content` : 'content';

      this.collectContentErrors(schema.content, errors, contentPath);
    }

    // 验证children字段（如果存在）
    if (schema.children !== undefined) {
      const childrenPath = path ? `${path}.children` : 'children';

      this.collectChildrenErrors(schema.children, errors, childrenPath);
    }
  }

  /**
   * 收集DocumentSchema的错误
   * @param schema DocumentMeta对象
   * @param errors 错误数组
   * @param path 当前路径
   */
  private collectDocumentSchemaErrors(
    schema: DocumentMeta,
    errors: SchemaError[],
    path: string
  ): void {
    // 验证root字段是必需的
    if (!schema.root) {
      errors.push({
        message: 'root字段是必需的',
        code: 'MISSING_ROOT',
        path: path ? `${path}.root` : 'root'
      });
    } else {
      const rootPath = path ? `${path}.root` : 'root';

      // 验证root字段是ElementMeta、TypeReference或字符串
      if (typeof schema.root === 'object') {
        if ('$ref' in schema.root) {
          if (typeof schema.root.$ref !== 'string') {
            errors.push({
              message: 'root.$ref必须是字符串',
              code: 'INVALID_REF_TYPE',
              path: `${rootPath}.$ref`
            });
          }
        } else {
          this.collectElementSchemaErrors(schema.root as ElementMeta, errors, rootPath);
        }
      } else if (typeof schema.root !== 'string') {
        errors.push({
          message: 'root必须是对象或字符串',
          code: 'INVALID_ROOT_TYPE',
          path: rootPath
        });
      }
    }

    // 验证types字段（如果存在）
    if (schema.types !== undefined) {
      const typesPath = path ? `${path}.types` : 'types';

      if (!Array.isArray(schema.types)) {
        errors.push({
          message: 'types字段必须是数组',
          code: 'INVALID_TYPES_TYPE',
          path: typesPath
        });
      } else {
        // 验证每个type
        schema.types.forEach((type, index) => {
          this.collectElementSchemaErrors(type, errors, `${typesPath}[${index}]`);
        });
      }
    }

    // 验证globalAttributes字段（如果存在）
    if (schema.globalAttributes !== undefined) {
      const globalAttrPath = path ? `${path}.globalAttributes` : 'globalAttributes';

      if (!Array.isArray(schema.globalAttributes)) {
        errors.push({
          message: 'globalAttributes字段必须是数组',
          code: 'INVALID_GLOBAL_ATTRIBUTES_TYPE',
          path: globalAttrPath
        });
      } else {
        // 验证每个globalAttribute
        schema.globalAttributes.forEach((attr, index) => {
          this.collectAttributeErrors(attr, errors, `${globalAttrPath}[${index}]`);
        });
      }
    }
  }

  /**
   * 收集attribute的错误
   * @param attribute AttributeMeta对象
   * @param errors 错误数组
   * @param path 当前路径
   */
  private collectAttributeErrors(
    attribute: AttributeMeta,
    errors: SchemaError[],
    path: string
  ): void {
    // name字段是必需的
    if (!attribute.name || typeof attribute.name !== 'string') {
      errors.push({
        message: 'attribute的name字段是必需的，且必须是字符串',
        code: 'MISSING_ATTRIBUTE_NAME',
        path
      });
    }

    // type字段（如果存在）必须是字符串
    if (attribute.type !== undefined && typeof attribute.type !== 'string') {
      errors.push({
        message: 'attribute的type字段必须是字符串',
        code: 'INVALID_ATTRIBUTE_TYPE',
        path: `${path}.type`
      });
    }

    // enum字段（如果存在）必须是字符串数组
    if (attribute.enum !== undefined) {
      const enumPath = `${path}.enum`;

      if (!Array.isArray(attribute.enum)) {
        errors.push({
          message: 'attribute的enum字段必须是数组',
          code: 'INVALID_ENUM_TYPE',
          path: enumPath
        });
      } else {
        // 验证每个enum值
        attribute.enum.forEach((value, index) => {
          if (typeof value !== 'string') {
            errors.push({
              message: 'attribute的enum值必须是字符串',
              code: 'INVALID_ENUM_VALUE_TYPE',
              path: `${enumPath}[${index}]`
            });
          }
        });
      }
    }
  }

  /**
   * 收集content的错误
   * @param content ContentMeta对象
   * @param errors 错误数组
   * @param path 当前路径
   */
  private collectContentErrors(
    content: ContentMeta,
    errors: SchemaError[],
    path: string
  ): void {
    // type字段是必需的
    if (!content.type || typeof content.type !== 'string') {
      errors.push({
        message: 'content的type字段是必需的，且必须是字符串',
        code: 'MISSING_CONTENT_TYPE',
        path
      });
    }
  }

  /**
   * 收集children的错误
   * @param children ChildrenMeta对象
   * @param errors 错误数组
   * @param path 当前路径
   */
  private collectChildrenErrors(
    children: ChildrenMeta,
    errors: SchemaError[],
    path: string
  ): void {
    // elements字段是必需的
    if (!children.elements || !Array.isArray(children.elements)) {
      errors.push({
        message: 'children的elements字段是必需的，且必须是数组',
        code: 'MISSING_CHILDREN_ELEMENTS',
        path
      });

      return;
    }

    // 验证每个element或$ref
    children.elements.forEach((item, index) => {
      const itemPath = `${path}.elements[${index}]`;

      if ('$ref' in item) {
        // 验证$ref是字符串
        if (typeof item.$ref !== 'string') {
          errors.push({
            message: '$ref必须是字符串',
            code: 'INVALID_REF_TYPE',
            path: `${itemPath}.$ref`
          });
        }
      } else {
        // 验证ElementMeta
        this.collectElementSchemaErrors(item as ElementMeta, errors, itemPath);
      }
    });
  }
}
