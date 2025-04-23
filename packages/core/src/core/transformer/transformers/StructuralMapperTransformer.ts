/**
 * 结构映射转换器
 * 执行组件，实现结构映射逻辑
 */

import type { Transformer, TransformContext, MappingRule, DPMLNode, DPMLDocument } from '../../../types';

/**
 * 使用简单的节点查询函数
 * 注意：这是一个简单实现，完整实现应该使用选择器引擎
 * @param document 要查询的文档
 * @param selector 选择器字符串
 * @returns 匹配的节点或undefined
 */
function querySelector(document: DPMLDocument, selector: string): DPMLNode | undefined {
  // 查询机制，根据测试用例模拟的行为，假定文档已经有querySelector方法
  // 在真实实现中，这里应该调用selector模块的方法
  const docWithSelector = document as unknown as { querySelector: (selector: string) => DPMLNode | undefined };

  if (typeof docWithSelector.querySelector === 'function') {
    return docWithSelector.querySelector(selector);
  }

  // 特殊情况：属性选择器，例如 agent[temperature]
  const attributeMatch = selector.match(/^([a-zA-Z0-9-_]+)\[([a-zA-Z0-9-_]+)\]$/);

  if (attributeMatch) {
    const [, tagName, attributeName] = attributeMatch;
    const nodes = querySelectorAllHelper(document.rootNode, tagName);

    for (const node of nodes) {
      if (node.attributes.has(attributeName)) {
        return node;
      }
    }

    return undefined;
  }

  // 特殊情况：属性值选择器，例如 prompt[type="system"]
  const attributeValueMatch = selector.match(/^([a-zA-Z0-9-_]+)\[([a-zA-Z0-9-_]+)="([^"]+)"\]$/);

  if (attributeValueMatch) {
    const [, tagName, attributeName, attributeValue] = attributeValueMatch;
    const nodes = querySelectorAllHelper(document.rootNode, tagName);

    for (const node of nodes) {
      if (node.attributes.has(attributeName) && node.attributes.get(attributeName) === attributeValue) {
        return node;
      }
    }

    return undefined;
  }

  // 特殊情况：子元素选择器，例如 metadata > title
  if (selector.includes('>')) {
    const [parentSelector, childSelector] = selector.split('>').map(s => s.trim());
    const parentNode = querySelector(document, parentSelector);

    if (parentNode) {
      const childMatch = querySelectorAllHelper(parentNode, childSelector);

      return childMatch.length > 0 ? childMatch[0] : undefined;
    }

    return undefined;
  }

  // 默认：简单标签名选择器
  const found = querySelectorAllHelper(document.rootNode, selector);

  return found.length > 0 ? found[0] : undefined;
}

/**
 * 查询所有匹配的节点
 * @param document 要查询的文档
 * @param selector 选择器字符串
 * @returns 匹配的节点数组
 */
function querySelectorAll(document: DPMLDocument, selector: string): DPMLNode[] {
  const docWithSelector = document as unknown as { querySelectorAll: (selector: string) => DPMLNode[] };

  if (typeof docWithSelector.querySelectorAll === 'function') {
    return docWithSelector.querySelectorAll(selector);
  }

  // 特殊情况：属性选择器，例如 agent[temperature]
  const attributeMatch = selector.match(/^([a-zA-Z0-9-_]+)\[([a-zA-Z0-9-_]+)\]$/);

  if (attributeMatch) {
    const [, tagName, attributeName] = attributeMatch;
    const nodes = querySelectorAllHelper(document.rootNode, tagName);

    return nodes.filter(node => node.attributes.has(attributeName));
  }

  // 特殊情况：属性值选择器，例如 prompt[type="system"]
  const attributeValueMatch = selector.match(/^([a-zA-Z0-9-_]+)\[([a-zA-Z0-9-_]+)="([^"]+)"\]$/);

  if (attributeValueMatch) {
    const [, tagName, attributeName, attributeValue] = attributeValueMatch;
    const nodes = querySelectorAllHelper(document.rootNode, tagName);

    return nodes.filter(node =>
      node.attributes.has(attributeName) && node.attributes.get(attributeName) === attributeValue
    );
  }

  // 特殊情况：子元素选择器，例如 metadata > title
  if (selector.includes('>')) {
    const [parentSelector, childSelector] = selector.split('>').map(s => s.trim());
    const parentNodes = querySelectorAll(document, parentSelector);

    const results: DPMLNode[] = [];

    for (const parentNode of parentNodes) {
      results.push(...querySelectorAllHelper(parentNode, childSelector));
    }

    return results;
  }

  // 默认：简单标签名选择器
  return querySelectorAllHelper(document.rootNode, selector);
}

/**
 * 辅助函数：查找所有匹配标签名的节点
 * @param rootNode 根节点
 * @param tagName 标签名
 * @returns 匹配节点数组
 */
function querySelectorAllHelper(rootNode: DPMLNode, tagName: string): DPMLNode[] {
  const result: DPMLNode[] = [];

  if (rootNode.tagName === tagName) {
    result.push(rootNode);
  }

  for (const child of rootNode.children) {
    result.push(...querySelectorAllHelper(child, tagName));
  }

  return result;
}

/**
 * 根据路径设置对象属性
 * @param obj 目标对象
 * @param path 属性路径，例如 "parameters.temperature"
 * @param value 要设置的值
 */
function setByPath(obj: Record<string, any>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current = obj;

  // 遍历路径的每一部分，直到最后一个
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    // 如果当前部分不存在，创建一个空对象
    if (current[part] === undefined) {
      current[part] = {};
    }

    // 移动到下一级
    current = current[part];
  }

  // 设置最后一个属性的值
  const lastPart = parts[parts.length - 1];

  current[lastPart] = value;
}

/**
 * 检查对象是否有特定属性
 * @param obj 要检查的对象
 * @param prop 属性名
 * @returns 是否包含该属性
 */
function hasProperty(obj: unknown, prop: string): boolean {
  return obj !== null &&
         typeof obj === 'object' &&
         Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * 从输入中提取文档对象
 * 处理不同的数据结构格式
 * @param input 输入数据
 * @param context 转换上下文
 * @returns 提取的文档对象
 */
function extractDocument(input: unknown, context: TransformContext): DPMLDocument | undefined {
  // 1. 首先尝试使用上下文直接获取文档
  const document = context.getDocument();

  if (document && hasProperty(document, 'rootNode')) {
    return document;
  }

  // 2. 然后尝试从输入数据中获取
  if (input) {
    // 2.1 检查直接的 input.document
    if (hasProperty(input, 'document')) {
      const doc = (input as any).document;

      if (doc && hasProperty(doc, 'rootNode')) {
        return doc as DPMLDocument;
      }
    }
  }

  return undefined;
}

/**
 * 结构映射转换器
 * 将选择器定位的数据映射到目标结构
 */
export class StructuralMapperTransformer<TInput, TOutput> implements Transformer<TInput, TOutput> {
  /**
   * 转换器名称
   */
  public name: string = 'structuralMapper';

  /**
   * 转换器描述
   */
  public description: string = '基于选择器和映射规则将数据映射到目标结构';

  /**
   * 转换器类型
   */
  public type: string = 'mapper';

  /**
   * 映射规则数组
   */
  private mappingRules: Array<MappingRule<unknown, unknown>>;

  /**
   * 构造函数
   * @param mappingRules 映射规则数组
   */
  constructor(mappingRules: Array<MappingRule<unknown, unknown>>) {
    this.mappingRules = mappingRules;
  }

  /**
   * 执行结构映射转换
   * @param input 输入数据
   * @param context 转换上下文
   * @returns 转换后的输出
   */
  transform(input: TInput, context: TransformContext): TOutput {
    console.log('StructuralMapperTransformer: 开始转换，映射规则数量:', this.mappingRules.length);

    // 检查文档是否有效
    if (!context.isDocumentValid()) {
      // 添加警告
      console.log('StructuralMapperTransformer: 文档无效');
      this.addWarning(context, 'invalid_document', '文档无效，无法执行结构映射');

      // 返回空对象
      return {} as TOutput;
    }

    // 获取文档 - 使用提取函数处理多种数据结构
    const document = extractDocument(input, context);

    console.log('StructuralMapperTransformer: 提取的文档:', document ? '有效' : '无效');

    // 确保文档存在
    if (!document || !document.rootNode) {
      console.log('StructuralMapperTransformer: 文档结构无效');
      this.addWarning(context, 'invalid_document_structure', '文档结构无效');

      return {} as TOutput;
    }

    console.log('StructuralMapperTransformer: 文档根节点标签:', document.rootNode.tagName);
    console.log('StructuralMapperTransformer: 文档根节点子元素数量:', document.rootNode.children.length);

    // 创建结果对象
    const result: Record<string, any> = {};

    // 应用每个映射规则
    for (const rule of this.mappingRules) {
      console.log('StructuralMapperTransformer: 处理规则 ->', rule.selector, '->', rule.targetPath);
      try {
        // 查找匹配选择器的元素
        const attributeMatch = rule.selector.match(/^([a-zA-Z0-9-_]+)\[([a-zA-Z0-9-_]+)\]$/);
        const attributeValueMatch = rule.selector.match(/^([a-zA-Z0-9-_]+)\[([a-zA-Z0-9-_]+)="([^"]+)"\]$/);

        // 处理数组结果的情况
        if (attributeValueMatch) {
          // 对于属性值选择器，可能匹配多个元素，如prompt[type="system"]
          const [, tagName, attributeName, attributeValue] = attributeValueMatch;
          const elements = querySelectorAll(document, rule.selector);

          console.log(`StructuralMapperTransformer: 属性值选择器 ${rule.selector} 匹配元素数量:`, elements.length);

          if (elements && elements.length > 0) {
            // 如果有转换函数，应用于整个节点数组
            let value: unknown = elements;

            if (rule.transform) {
              try {
                value = rule.transform(elements as any);
                console.log(`StructuralMapperTransformer: 应用转换函数后的值:`, value);
              } catch (error) {
                console.log(`StructuralMapperTransformer: 转换函数错误:`, error);
                this.addWarning(
                  context,
                  'transform_error',
                  `转换函数错误 (${rule.selector} -> ${rule.targetPath}): ${(error as Error).message}`
                );
                continue;
              }
            }

            setByPath(result, rule.targetPath, value);
            console.log(`StructuralMapperTransformer: 已设置 ${rule.targetPath} 的值`);
          } else {
            console.log(`StructuralMapperTransformer: 选择器 ${rule.selector} 未找到匹配元素`);
            this.addWarning(
              context,
              'selector_no_match',
              `选择器 "${rule.selector}" 未找到匹配元素`
            );
          }
        } else if (attributeMatch) {
          // 单个属性选择器，如agent[temperature]
          const element = querySelector(document, rule.selector);

          console.log(`StructuralMapperTransformer: 属性选择器 ${rule.selector} 匹配元素:`, element ? '找到' : '未找到');
          if (element) {
            const [, , attributeName] = attributeMatch;
            let value: unknown = element.attributes.get(attributeName);

            console.log(`StructuralMapperTransformer: 获取属性 ${attributeName} 的值:`, value);

            // 应用转换函数(如果有)
            if (rule.transform) {
              try {
                value = rule.transform(value as any);
                console.log(`StructuralMapperTransformer: 应用转换函数后的值:`, value);
              } catch (error) {
                console.log(`StructuralMapperTransformer: 转换函数错误:`, error);
                this.addWarning(
                  context,
                  'transform_error',
                  `转换函数错误 (${rule.selector} -> ${rule.targetPath}): ${(error as Error).message}`
                );
                continue;
              }
            }

            setByPath(result, rule.targetPath, value);
            console.log(`StructuralMapperTransformer: 已设置 ${rule.targetPath} 的值`);
          } else {
            console.log(`StructuralMapperTransformer: 选择器 ${rule.selector} 未找到匹配元素`);
            this.addWarning(
              context,
              'selector_no_match',
              `选择器 "${rule.selector}" 未找到匹配元素`
            );
          }
        } else {
          // 普通标签选择器
          // 检查是否需要返回多个元素
          const isArrayPath = rule.targetPath.endsWith('[]');
          const targetPath = isArrayPath ? rule.targetPath.slice(0, -2) : rule.targetPath;

          console.log(`StructuralMapperTransformer: 标签选择器 ${rule.selector}, 是否数组:`, isArrayPath);

          if (isArrayPath) {
            // 返回所有匹配元素的数组
            const elements = querySelectorAll(document, rule.selector);

            console.log(`StructuralMapperTransformer: 标签选择器(数组) ${rule.selector} 匹配元素数量:`, elements.length);
            if (elements && elements.length > 0) {
              let value: unknown = elements;

              if (rule.transform) {
                try {
                  value = rule.transform(elements as any);
                  console.log(`StructuralMapperTransformer: 应用转换函数后的值:`, value);
                } catch (error) {
                  console.log(`StructuralMapperTransformer: 转换函数错误:`, error);
                  this.addWarning(
                    context,
                    'transform_error',
                    `转换函数错误 (${rule.selector} -> ${targetPath}): ${(error as Error).message}`
                  );
                  continue;
                }
              }

              setByPath(result, targetPath, value);
              console.log(`StructuralMapperTransformer: 已设置 ${targetPath} 的值`);
            } else {
              console.log(`StructuralMapperTransformer: 选择器 ${rule.selector} 未找到匹配元素`);
              this.addWarning(
                context,
                'selector_no_match',
                `选择器 "${rule.selector}" 未找到匹配元素`
              );
            }
          } else {
            // 返回单个元素
            const element = querySelector(document, rule.selector);

            console.log(`StructuralMapperTransformer: 标签选择器 ${rule.selector} 匹配元素:`, element ? '找到' : '未找到');
            if (element) {
              let value: unknown = element;

              if (rule.transform) {
                try {
                  value = rule.transform(value as any);
                  console.log(`StructuralMapperTransformer: 应用转换函数后的值:`, value);
                } catch (error) {
                  console.log(`StructuralMapperTransformer: 转换函数错误:`, error);
                  this.addWarning(
                    context,
                    'transform_error',
                    `转换函数错误 (${rule.selector} -> ${targetPath}): ${(error as Error).message}`
                  );
                  continue;
                }
              }

              setByPath(result, targetPath, value);
              console.log(`StructuralMapperTransformer: 已设置 ${targetPath} 的值`);
            } else {
              console.log(`StructuralMapperTransformer: 选择器 ${rule.selector} 未找到匹配元素`);
              this.addWarning(
                context,
                'selector_no_match',
                `选择器 "${rule.selector}" 未找到匹配元素`
              );
            }
          }
        }
      } catch (error) {
        // 处理整体异常
        console.log(`StructuralMapperTransformer: 映射错误:`, error);
        this.addWarning(
          context,
          'mapping_error',
          `映射错误 (${rule.selector} -> ${rule.targetPath}): ${(error as Error).message}`
        );
      }
    }

    console.log('StructuralMapperTransformer: 最终结果:', result);

    // 将结果存储到上下文
    if (this.name) {
      context.set(this.name, result);
    }

    return result as unknown as TOutput;
  }

  /**
   * 添加警告到上下文
   * @param context 上下文
   * @param code 警告代码
   * @param message 警告消息
   * @param severity 严重程度
   */
  private addWarning(
    context: TransformContext,
    code: string,
    message: string,
    severity: 'low' | 'medium' | 'high' = 'medium'
  ): void {
    const warnings = context.get<Array<{
      code: string;
      message: string;
      transformer?: string;
      severity: 'low' | 'medium' | 'high';
    }>>('warnings') || [];

    context.set('warnings', [
      ...warnings,
      {
        code,
        message,
        transformer: this.name,
        severity
      }
    ]);
  }
}
