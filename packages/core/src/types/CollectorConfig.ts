/**
 * 收集配置接口，用于聚合转换器
 */
export interface CollectorConfig {
  /**
   * CSS选择器，定位要收集的元素
   */
  selector: string;

  /**
   * 分组字段
   * 如果提供，结果将按此字段分组
   * 通常是属性名或可以从元素提取的值
   */
  groupBy?: string;

  /**
   * 排序字段
   * 如果提供，结果将按此字段排序
   * 通常是属性名或可以从元素提取的值
   */
  sortBy?: string;
}
