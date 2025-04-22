/**
 * 映射规则接口，用于结构映射
 * 支持泛型定义输入值和输出值类型
 */
export interface MappingRule<TValue, TResult> {
  /**
   * CSS选择器，定位元素
   */
  selector: string;

  /**
   * 目标属性路径
   * 描述映射结果在目标对象中的位置
   * 例如："parameters.temperature"
   */
  targetPath: string;

  /**
   * 可选值转换函数
   * 对提取的值进行转换处理
   * @param value 从选择器提取的原始值
   * @returns 转换后的值
   */
  transform?: (value: TValue) => TResult;
}
