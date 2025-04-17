import { ErrorCode } from '../../errors/types';
import { Node, NodeType, isElement } from '../../types/node';

import type { TagRegistry } from './TagRegistry';
import type {
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from '../../errors/types';
import type { Element, Document, SourcePosition } from '../../types/node';
import type { TagDefinition } from '../../types/parser/tag-definition';

/**
 * 验证器类
 * 负责验证DPML文档的结构和属性
 */
export class Validator {
  /**
   * 标签注册表
   */
  private tagRegistry: TagRegistry;

  /**
   * 构造函数
   * @param tagRegistry 标签注册表
   */
  constructor(tagRegistry: TagRegistry) {
    this.tagRegistry = tagRegistry;
  }

  /**
   * 验证整个文档
   * @param document DPML文档
   * @returns 验证结果
   */
  validateDocument(document: Document): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 遍历所有顶级元素进行验证
    for (const child of document.children) {
      if (isElement(child)) {
        const result = this.validateElement(child);

        if (!result.valid && result.errors) {
          errors.push(...result.errors);
        }

        if (result.warnings) {
          warnings.push(...result.warnings);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * 验证单个元素
   * @param element 元素节点
   * @returns 验证结果
   */
  validateElement(element: Element): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 获取标签定义
    const tagDefinition = this.tagRegistry.getTagDefinition(element.tagName);

    // 如果标签未注册
    if (!tagDefinition) {
      errors.push(
        this.createError(
          ErrorCode.INVALID_NESTING,
          `未知标签: ${element.tagName}`,
          element.position
        )
      );

      return {
        valid: false,
        errors,
      };
    }

    // 验证属性
    const attrResult = this.validateAttributes(element, tagDefinition);

    if (!attrResult.valid && attrResult.errors) {
      errors.push(...attrResult.errors);
    }

    if (attrResult.warnings) {
      warnings.push(...attrResult.warnings);
    }

    // 验证子元素
    const childrenResult = this.validateChildren(element);

    if (!childrenResult.valid && childrenResult.errors) {
      errors.push(...childrenResult.errors);
    }

    if (childrenResult.warnings) {
      warnings.push(...childrenResult.warnings);
    }

    // 如果标签定义有自定义验证函数，调用它
    if (tagDefinition.validate) {
      try {
        const customResult = tagDefinition.validate(element, {});

        if (!customResult.valid && customResult.errors) {
          errors.push(...customResult.errors);
        }

        if (customResult.warnings) {
          warnings.push(...customResult.warnings);
        }
      } catch (error) {
        errors.push(
          this.createError(
            ErrorCode.UNKNOWN_ERROR,
            `自定义验证器错误: ${(error as Error).message}`,
            element.position
          )
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * 验证元素的属性
   * @param element 元素节点
   * @param tagDefinition 标签定义
   * @returns 验证结果
   */
  validateAttributes(
    element: Element,
    tagDefinition: TagDefinition
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 处理旧版本的必需属性列表
    if (tagDefinition.requiredAttributes) {
      for (const requiredAttr of tagDefinition.requiredAttributes) {
        if (!(requiredAttr in element.attributes)) {
          errors.push(
            this.createError(
              ErrorCode.MISSING_REQUIRED_ATTRIBUTE,
              `缺少必需的属性: ${requiredAttr}`,
              element.position
            )
          );
        }
      }
    }

    // 检查属性是否有效以及是否必需
    if (tagDefinition.attributes) {
      const attributes = tagDefinition.attributes;

      // 检查未知属性 - 处理数组格式和对象格式
      for (const attr in element.attributes) {
        // 跳过x-前缀的扩展属性
        if (attr.startsWith('x-')) continue;

        // 检查属性是否在允许列表中
        if (Array.isArray(attributes)) {
          // 数组格式
          if (!attributes.includes(attr)) {
            warnings.push(
              this.createWarning(
                'unknown-attribute',
                `未知属性: ${attr}`,
                element.position
              )
            );
          }
        } else {
          // 对象格式
          if (!(attr in attributes)) {
            warnings.push(
              this.createWarning(
                'unknown-attribute',
                `未知属性: ${attr}`,
                element.position
              )
            );
          }
        }
      }

      // 检查必需属性 - 仅处理对象格式
      if (typeof attributes === 'object' && !Array.isArray(attributes)) {
        for (const attrName in attributes) {
          const attrDef = attributes[attrName];

          // 检查布尔值格式和对象格式
          if (typeof attrDef === 'object' && attrDef.required === true) {
            if (!(attrName in element.attributes)) {
              errors.push(
                this.createError(
                  ErrorCode.MISSING_REQUIRED_ATTRIBUTE,
                  `缺少必需的属性: ${attrName}`,
                  element.position
                )
              );
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * 验证元素的子节点
   * @param element 元素节点
   * @returns 验证结果
   */
  validateChildren(element: Element): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 获取标签定义
    const tagDefinition = this.tagRegistry.getTagDefinition(element.tagName);

    // 如果没有标签定义，跳过子节点验证
    if (!tagDefinition) {
      return { valid: true };
    }

    // 如果是自闭合标签，但有子节点，报错
    if (tagDefinition.selfClosing && element.children.length > 0) {
      errors.push(
        this.createError(
          ErrorCode.INVALID_NESTING,
          `自闭合标签不能有子节点: ${element.tagName}`,
          element.position
        )
      );

      return {
        valid: false,
        errors,
      };
    }

    // 如果没有定义允许的子标签，跳过子节点验证
    if (!tagDefinition.allowedChildren) {
      return { valid: true };
    }

    // 验证每个子元素
    for (const child of element.children) {
      // 只验证元素节点，不验证内容节点和引用节点
      if (isElement(child)) {
        // 检查子标签是否允许
        if (!tagDefinition.allowedChildren.includes(child.tagName)) {
          errors.push(
            this.createError(
              ErrorCode.INVALID_NESTING,
              `标签 ${element.tagName} 不允许子标签 ${child.tagName}`,
              child.position
            )
          );
        }

        // 递归验证子元素
        const childResult = this.validateElement(child);

        if (!childResult.valid && childResult.errors) {
          errors.push(...childResult.errors);
        }

        if (childResult.warnings) {
          warnings.push(...childResult.warnings);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * 创建验证错误
   * @param code 错误码
   * @param message 错误消息
   * @param position 位置信息
   * @returns 验证错误对象
   */
  private createError(
    code: string,
    message: string,
    position?: SourcePosition
  ): ValidationError {
    return {
      code,
      message,
      position,
    };
  }

  /**
   * 创建验证警告
   * @param code 警告码
   * @param message 警告消息
   * @param position 位置信息
   * @returns 验证警告对象
   */
  private createWarning(
    code: string,
    message: string,
    position?: SourcePosition
  ): ValidationWarning {
    return {
      code,
      message,
      position,
    };
  }
}
