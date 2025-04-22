/**
 * 关系配置接口，用于关系处理转换器
 */
export interface RelationConfig {
  /**
   * 源选择器或属性
   * 定义关系的源端点
   */
  source: string;

  /**
   * 目标选择器或属性
   * 定义关系的目标端点
   */
  target: string;

  /**
   * 关系类型
   * 可选的关系类型描述
   */
  type?: string;
}
