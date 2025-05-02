/**
 * 转换器定义器接口，提供创建各种类型转换器的能力
 */
export interface TransformerDefiner {
  /**
   * 定义结构映射转换器
   * @param name 转换器名称
   * @param rules 映射规则数组
   * @returns 结构映射转换器实例
   */
  defineStructuralMapper<TInput, TOutput>(
    name: string,
    rules: Array<MappingRule<unknown, unknown>>
  ): Transformer<TInput, TOutput>;

  /**
   * 定义聚合转换器
   * @param name 转换器名称
   * @param config 收集配置
   * @returns 聚合转换器实例
   */
  defineAggregator<TInput, TOutput>(
    name: string,
    config: CollectorConfig
  ): Transformer<TInput, TOutput>;

  /**
   * 定义模板转换器
   * @param name 转换器名称
   * @param template 模板字符串或函数
   * @param preprocessor 可选的数据预处理函数
   * @returns 模板转换器实例
   */
  defineTemplateTransformer<TInput>(
    name: string,
    template: string | ((data: unknown) => string),
    preprocessor?: (input: TInput) => unknown
  ): Transformer<TInput, string>;

  /**
   * 定义关系处理转换器
   * @param name 转换器名称
   * @param nodeSelector 节点选择器
   * @param config 关系配置
   * @returns 关系处理转换器实例
   */
  defineRelationProcessor<TInput, TOutput>(
    name: string,
    nodeSelector: string,
    config: RelationConfig
  ): Transformer<TInput, TOutput>;

  /**
   * 定义语义提取转换器
   * @param name 转换器名称
   * @param extractors 提取器数组
   * @returns 语义提取转换器实例
   */
  defineSemanticExtractor<TInput, TOutput>(
    name: string,
    extractors: Array<SemanticExtractor<unknown, unknown>>
  ): Transformer<TInput, TOutput>;

  /**
   * 定义结果收集转换器
   * @param name 转换器名称
   * @param transformerNames 可选的转换器名称数组，用于选择性收集
   * @returns 结果收集转换器实例
   */
  defineResultCollector<TOutput>(
    name: string,
    transformerNames?: string[]
  ): Transformer<unknown, TOutput>;
}

// 导入必要的类型
import type { CollectorConfig } from './CollectorConfig';
import type { MappingRule } from './MappingRule';
import type { RelationConfig } from './RelationConfig';
import type { SemanticExtractor } from './SemanticExtractor';
import type { Transformer } from './Transformer';
