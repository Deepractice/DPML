/**
 * 语义提取转换器
 * 执行组件，实现语义提取逻辑
 */

import type { Transformer, TransformContext, SemanticExtractor } from '../../../types';

/**
 * 语义提取转换器
 * 提取特定领域的语义信息
 */
export class SemanticExtractorTransformer<TInput, TOutput> implements Transformer<TInput, TOutput> {
  /**
   * 转换器名称
   */
  public name: string = 'semanticExtractor';

  /**
   * 转换器描述
   */
  public description: string = '提取特定领域的语义信息';

  /**
   * 转换器类型
   */
  public type: string = 'extractor';

  /**
   * 提取器数组
   */
  private extractors: Array<SemanticExtractor<unknown, unknown>>;

  /**
   * 构造函数
   * @param extractors 提取器数组
   */
  constructor(extractors: Array<SemanticExtractor<unknown, unknown>>) {
    this.extractors = extractors;
  }

  /**
   * 执行语义提取转换
   * @param input 输入数据
   * @param context 转换上下文
   * @returns 提取的语义信息
   */
  transform(input: TInput, context: TransformContext): TOutput {
    try {
      // 获取文档
      const document = context.getDocument();

      if (!document) {
        // 添加警告并返回空结果
        this.addWarning(context, 'document_not_found', '无法获取文档');

        return {} as TOutput;
      }

      // 初始化结果对象
      const extractionResults: Record<string, unknown> = {};

      // 执行每个提取器
      for (const extractor of this.extractors) {
        try {
          // 查找匹配元素
          const elements = this.findElements(document.rootNode, extractor.selector);

          if (elements.length === 0) {
            this.addWarning(
              context,
              'no_matching_elements',
              `提取器 "${extractor.name}" 未找到匹配选择器 "${extractor.selector}" 的元素`
            );
            continue;
          }

          // 执行处理器函数
          const result = extractor.processor(elements);

          // 将结果存储到结果对象
          extractionResults[extractor.name] = result;
        } catch (extractorError) {
          // 处理单个提取器的错误，继续执行其他提取器
          this.addWarning(
            context,
            'extractor_error',
            `提取器 "${extractor.name}" 执行时发生错误: ${
              extractorError instanceof Error ? extractorError.message : String(extractorError)
            }`
          );
        }
      }

      // 将结果存储到上下文
      if (this.name) {
        context.set(this.name, extractionResults);
      }

      return extractionResults as unknown as TOutput;
    } catch (error) {
      // 处理整体错误
      this.addWarning(
        context,
        'semantic_extraction_error',
        `语义提取过程发生错误: ${error instanceof Error ? error.message : String(error)}`
      );

      return {} as TOutput;
    }
  }

  /**
   * 查找匹配选择器的元素
   * @param rootNode 根节点
   * @param selector 选择器
   * @returns 匹配的元素数组
   */
  private findElements(rootNode: any, selector: string): any[] {
    // 简单选择器实现，真实场景中可能需要更复杂的选择器引擎
    // 这里假设selector是一个简单的标签名匹配
    const results: any[] = [];

    // 如果当前节点匹配
    if (rootNode.tagName === selector) {
      results.push(rootNode);
    }

    // 递归处理子节点
    if (rootNode.children && Array.isArray(rootNode.children)) {
      for (const child of rootNode.children) {
        results.push(...this.findElements(child, selector));
      }
    }

    return results;
  }

  /**
   * 添加警告到上下文
   * @param context 转换上下文
   * @param code 警告代码
   * @param message 警告消息
   */
  private addWarning(context: TransformContext, code: string, message: string): void {
    const warnings = context.get<any[]>('warnings') || [];

    warnings.push({
      code,
      message,
      transformer: this.name,
      severity: 'medium'
    });
    context.set('warnings', warnings);
  }
} 