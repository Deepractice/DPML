/**
 * 模板转换器
 * 执行组件，实现模板渲染逻辑
 */

import type { Transformer, TransformContext } from '../../../types';

/**
 * 模板转换器
 * 将数据应用到模板生成输出
 */
export class TemplateTransformer<TInput> implements Transformer<TInput, string> {
  /**
   * 转换器名称
   */
  public name: string = 'templateTransformer';

  /**
   * 转换器描述
   */
  public description: string = '使用模板渲染数据生成文本输出';

  /**
   * 转换器类型
   */
  public type: string = 'template';

  /**
   * 模板字符串或函数
   */
  private template: string | ((data: unknown) => string);

  /**
   * 数据预处理函数
   */
  private dataPreprocessor?: (input: TInput) => unknown;

  /**
   * 构造函数
   * @param template 模板字符串或函数
   * @param dataPreprocessor 数据预处理函数
   */
  constructor(
    template: string | ((data: unknown) => string),
    dataPreprocessor?: (input: TInput) => unknown
  ) {
    this.template = template;
    this.dataPreprocessor = dataPreprocessor;
  }

  /**
   * 执行模板转换
   * @param input 输入数据
   * @param context 转换上下文
   * @returns 渲染后的字符串
   */
  transform(input: TInput, context: TransformContext): string {
    try {
      // 应用数据预处理（如果有）
      const processedData = this.dataPreprocessor ? this.dataPreprocessor(input) : input;

      let result: string;

      // 根据模板类型执行转换
      if (typeof this.template === 'function') {
        // 函数模板
        result = this.template(processedData);
      } else {
        // 字符串模板
        result = this.renderStringTemplate(this.template, processedData);
      }

      // 将结果存储到上下文
      if (this.name) {
        context.set(this.name, result);
      }

      return result;
    } catch (error) {
      // 处理异常情况
      const warningsArray = context.get<unknown[]>('warnings') || [];

      context.set('warnings', [
        ...warningsArray,
        {
          code: 'template_render_error',
          message: error instanceof Error ? error.message : '模板渲染错误',
          transformer: this.name,
          severity: 'medium'
        }
      ]);

      // 返回空字符串作为默认结果
      return '';
    }
  }

  /**
   * 渲染字符串模板
   * 使用简单的模板占位符替换机制
   * @param template 模板字符串
   * @param data 要渲染的数据
   * @returns 渲染后的字符串
   */
  private renderStringTemplate(template: string, data: unknown): string {
    // 如果数据不是对象，无法进行渲染
    if (!data || typeof data !== 'object') {
      return template;
    }

    // 使用正则表达式替换{{property}}形式的占位符
    return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      // 处理嵌套属性路径，如a.b.c
      const value = key.trim().split('.').reduce(
        (obj: Record<string, unknown>, path: string) =>
          (obj && typeof obj === 'object') ? obj[path] : undefined,
        data as Record<string, unknown>
      );

      // 如果属性不存在返回空字符串
      return value !== undefined ? String(value) : '';
    });
  }
}
