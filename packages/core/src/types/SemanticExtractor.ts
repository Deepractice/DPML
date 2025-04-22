/**
 * 语义提取器接口，用于语义提取转换器
 * 支持泛型元素处理和结果类型
 */
export interface SemanticExtractor<TElement, TResult> {
  /**
   * 提取器名称，用于标识
   */
  name: string;

  /**
   * CSS选择器，定位要处理的元素
   */
  selector: string;

  /**
   * 处理函数，处理提取的元素
   * @param elements 提取的元素数组
   * @returns 处理结果
   */
  processor: (elements: TElement[]) => TResult;
}
