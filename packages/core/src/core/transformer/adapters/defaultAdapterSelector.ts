import type { ProcessedDocument } from '@core/types/processor';

import type {
  AdapterSelector,
  AdapterSelectorOptions,
} from '../interfaces/adapterSelector';
import type { OutputAdapter } from '../interfaces/outputAdapter';
import type { OutputAdapterFactory } from '../interfaces/outputAdapterFactory';
import type { TransformContext } from '../interfaces/transformContext';

/**
 * 默认适配器选择器
 *
 * 基于格式、上下文和结果选择合适的适配器
 */
export class DefaultAdapterSelector implements AdapterSelector {
  /**
   * 适配器工厂
   * @private
   */
  private factory: OutputAdapterFactory;

  /**
   * 配置选项
   * @private
   */
  private options: Required<AdapterSelectorOptions>;

  /**
   * 构造函数
   *
   * @param factory 适配器工厂
   * @param options 选择器配置选项
   */
  constructor(factory: OutputAdapterFactory, options?: AdapterSelectorOptions) {
    this.factory = factory;

    // 设置默认选项
    this.options = {
      formatVariableName: 'outputFormat',
      metaFormatProperty: 'outputFormat',
      enableFormatInference: true,
      strictMatching: false,
      ...options,
    };
  }

  /**
   * 选择适配器
   *
   * 根据指定的格式、上下文和结果选择合适的适配器
   *
   * @param format 请求的格式，可以为null
   * @param context 转换上下文
   * @param result 可选的转换结果，用于根据内容推断格式
   * @returns 选择的适配器，如果找不到则返回默认适配器或null
   */
  selectAdapter(
    format: string | null,
    context: TransformContext,
    result?: any
  ): OutputAdapter | null {
    // 1. 优先使用显式传入的格式
    if (format) {
      const adapter = this.factory.getAdapter(format);

      if (adapter) return adapter;
    }

    // 2. 尝试从上下文变量中获取格式
    const formatFromContext = this.getFormatFromContext(context);

    if (formatFromContext) {
      const adapter = this.factory.getAdapter(formatFromContext);

      if (adapter) return adapter;
    }

    // 3. 尝试从文档元数据中获取格式
    const formatFromMeta = this.getFormatFromMeta(context);

    if (formatFromMeta) {
      const adapter = this.factory.getAdapter(formatFromMeta);

      if (adapter) return adapter;
    }

    // 4. 如果启用推断，尝试从结果推断格式
    if (this.options.enableFormatInference && result !== undefined) {
      const inferredFormat = this.inferFormatFromResult(result);

      if (inferredFormat) {
        const adapter = this.factory.getAdapter(inferredFormat);

        if (adapter) return adapter;
      }
    }

    // 5. 如果严格匹配，且上述步骤均未获取到适配器，则返回null
    if (this.options.strictMatching) {
      return null;
    }

    // 6. 使用默认适配器（由工厂决定）
    return this.factory.getAdapter('generic');
  }

  /**
   * 设置配置选项
   *
   * @param options 选择器配置选项
   */
  configure(options: AdapterSelectorOptions): void {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  /**
   * 从上下文变量中获取格式
   *
   * @param context 转换上下文
   * @returns 格式或null
   * @protected
   */
  protected getFormatFromContext(context: TransformContext): string | null {
    const format = context.variables[this.options.formatVariableName];

    if (typeof format === 'string') {
      return format;
    }

    return null;
  }

  /**
   * 从文档元数据中获取格式
   *
   * @param context 转换上下文
   * @returns 格式或null
   * @protected
   */
  protected getFormatFromMeta(context: TransformContext): string | null {
    const document = context.document as ProcessedDocument;

    if (document && document.meta && typeof document.meta === 'object') {
      const format = document.meta[this.options.metaFormatProperty];

      if (typeof format === 'string') {
        return format;
      }
    }

    return null;
  }

  /**
   * 从结果推断格式
   *
   * @param result 转换结果
   * @returns 推断的格式或null
   * @protected
   */
  protected inferFormatFromResult(result: any): string | null {
    // 如果结果为null或undefined，无法推断
    if (result === null || result === undefined) {
      return null;
    }

    // 如果是字符串，检查是否是JSON、XML或Markdown
    if (typeof result === 'string') {
      const trimmed = result.trim();

      // 检查是否是JSON
      if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ) {
        try {
          JSON.parse(trimmed);

          return 'json';
        } catch {
          // 不是有效的JSON
        }
      }

      // 检查是否是XML
      if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
        if (
          trimmed.includes('<?xml') ||
          trimmed.includes('<!DOCTYPE') ||
          /<\w+[^>]*>[\s\S]*<\/\w+>/.test(trimmed)
        ) {
          return 'xml';
        }
      }

      // 检查是否是Markdown
      if (
        trimmed.startsWith('#') ||
        trimmed.includes('\n#') ||
        trimmed.includes('**') ||
        trimmed.includes('```') ||
        trimmed.includes('- ') ||
        trimmed.includes('1. ')
      ) {
        return 'md';
      }
    }

    // 如果是对象，检查对象属性
    if (typeof result === 'object' && result !== null) {
      // 如果有type属性，根据type判断
      if (result.type) {
        if (
          result.type === 'document' &&
          result.content &&
          typeof result.content === 'string'
        ) {
          // 递归检查content字段
          return this.inferFormatFromResult(result.content);
        }
      }

      // 如果是数组或对象，可能是JSON格式
      if (Array.isArray(result) || Object.keys(result).length > 0) {
        return 'json';
      }
    }

    // 无法推断格式
    return null;
  }
}
