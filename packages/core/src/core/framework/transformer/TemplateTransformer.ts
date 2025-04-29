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

      // 添加调试信息（可选）
      this.logDebugInfo("开始转换", this.template, processedData);

      // 创建用于渲染的数据
      const templateData = this.createTemplateData(processedData, context);

      // 根据模板类型执行转换
      let result: string;

      if (typeof this.template === 'function') {
        // 函数模板
        result = this.template(templateData);
      } else {
        // 字符串模板
        result = this.renderStringTemplate(this.template, templateData);
      }

      this.logDebugInfo("渲染结果", result);

      // 将结果存储到上下文
      if (this.name) {
        context.set(this.name, result);
      }

      return result;
    } catch (error) {
      // 处理异常情况
      console.error(`TemplateTransformer(${this.name}): 转换异常:`, error);
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
   * 创建用于模板渲染的数据对象
   * 优先使用输入数据，然后结合上下文中的其他转换器结果
   * @param inputData 输入数据
   * @param context 转换上下文
   * @returns 合并后的模板数据
   */
  private createTemplateData(inputData: unknown, context: TransformContext): Record<string, unknown> {
    // 创建最终的模板数据对象
    const templateData: Record<string, unknown> = {};

    // 优先使用输入数据（如果是有效的对象）
    if (inputData && typeof inputData === 'object') {
      try {
        Object.assign(templateData, inputData);
      } catch (e) {
        // 忽略错误，继续处理
      }
    }

    // 添加上下文中的转换器结果
    try {
      // 从上下文获取所有结果
      if (context.getAllResults && typeof context.getAllResults === 'function') {
        const results = context.getAllResults();

        if (results && typeof results === 'object') {
          // 处理合并策略
          for (const [key, value] of Object.entries(results)) {
            // 跳过自身的结果（避免循环引用）
            if (key !== this.name) {
              if (value && typeof value === 'object') {
                // 如果值是对象，合并其属性
                try {
                  // 检查该结果对象是否包含结构化数据（元数据或其他常见属性）
                  const hasStructuredData = (
                    'metadata' in value ||
                    'config' in value ||
                    'workflow' in value ||
                    'collection' in value
                  );

                  // 如果是结构化数据对象，直接合并其顶级属性
                  if (hasStructuredData) {
                    Object.assign(templateData, value);
                    this.logDebugInfo(`合并了转换器 ${key} 的结构化结果`);
                  } else {
                    // 否则，添加为命名空间下的数据
                    templateData[key] = value;
                  }
                } catch (e) {
                  // 合并失败时，尝试添加为命名空间
                  templateData[key] = value;
                }
              } else {
                // 如果不是对象，直接添加
                templateData[key] = value;
              }
            }
          }
        }
      }
    } catch (e) {
      // 捕获但不中断执行
      this.logDebugInfo("获取上下文结果时出错", e);
    }

    // 添加上下文自身作为一个可访问的属性（便于调试和高级用法）
    templateData.context = context;

    // 记录模板数据的键（如果有）
    this.logTemplateDataKeys(templateData);

    return templateData;
  }

  /**
   * 渲染字符串模板
   * 使用简单的模板占位符替换机制
   * @param template 模板字符串
   * @param data 要渲染的数据
   * @returns 渲染后的字符串
   */
  private renderStringTemplate(template: string, data: Record<string, unknown>): string {
    // 使用正则表达式替换{{property}}形式的占位符
    return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const path = key.trim().split('.');
      const value = this.getValueFromPath(data, path);

      // 记录替换过程（可选）
      this.logPlaceholderReplacement(key, value);

      // 如果属性不存在返回空字符串
      return value !== undefined ? String(value) : '';
    });
  }

  /**
   * 从对象中按路径获取值
   * @param obj 源对象
   * @param path 属性路径数组
   * @returns 找到的值或undefined
   */
  private getValueFromPath(obj: unknown, path: string[]): unknown {
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }

    return path.reduce<unknown>(
      (currentObj, segment) => {
        if (currentObj && typeof currentObj === 'object') {
          return (currentObj as Record<string, unknown>)[segment];
        }

        return undefined;
      },
      obj
    );
  }

  /**
   * 记录调试信息（可选）
   */
  private logDebugInfo(message: string, ...args: unknown[]): void {
    try {
      if (args.length === 1) {
        console.log(`TemplateTransformer(${this.name}): ${message}: "${args[0]}"`);
      } else if (args.length > 1) {
        console.log(`TemplateTransformer(${this.name}): ${message}:`, ...args);
      } else {
        console.log(`TemplateTransformer(${this.name}): ${message}`);
      }
    } catch (e) {
      // 忽略日志错误
    }
  }

  /**
   * 记录模板数据的键（可选）
   */
  private logTemplateDataKeys(data: Record<string, unknown>): void {
    try {
      if (data && typeof data === 'object') {
        const keys = Object.keys(data);

        if (keys.length > 0) {
          console.log(`TemplateTransformer(${this.name}): 模板数据键: ${keys.join(', ')}`);
        } else {
          console.log(`TemplateTransformer(${this.name}): 模板数据为空对象`);
        }
      }
    } catch (e) {
      // 忽略日志错误
    }
  }

  /**
   * 记录占位符替换（可选）
   */
  private logPlaceholderReplacement(key: string, value: unknown): void {
    try {
      if (value !== undefined) {
        console.log(`TemplateTransformer(${this.name}): 占位符 {{${key}}} 的值: ${String(value)}`);
      } else {
        console.log(`TemplateTransformer(${this.name}): 占位符 {{${key}}} 的值不存在`);
      }
    } catch (e) {
      // 忽略日志错误
    }
  }
}
