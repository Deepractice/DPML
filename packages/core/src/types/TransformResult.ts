/**
 * 转换结果接口，定义转换输出的标准结构
 * 支持泛型指定结果类型
 */
export interface TransformResult<T> {
  /**
   * 各转换器的结果映射
   * 键为转换器名称，值为对应转换器的输出
   */
  transformers: Record<string, unknown>;

  /**
   * 合并后的结果
   * 类型为用户指定的泛型参数T
   */
  merged: T;

  /**
   * 原始未处理的结果
   * 通常是最后一个转换器的直接输出
   */
  raw?: unknown;

  /**
   * 转换过程中的警告
   */
  warnings?: TransformWarning[];

  /**
   * 转换元数据信息
   */
  metadata: TransformMetadata;
}

/**
 * 转换警告接口
 */
export interface TransformWarning {
  /**
   * 警告代码
   */
  code: string;

  /**
   * 警告消息
   */
  message: string;

  /**
   * 相关转换器
   */
  transformer?: string;

  /**
   * 警告严重程度
   */
  severity: 'low' | 'medium' | 'high';
}

/**
 * 转换元数据接口
 */
export interface TransformMetadata {
  /**
   * 参与转换的转换器名称列表
   */
  transformers: string[];

  /**
   * 转换选项
   */
  options: TransformOptions;

  /**
   * 转换时间戳
   */
  timestamp: number;

  /**
   * 执行时间（毫秒）
   */
  executionTime?: number;
}

/**
 * 从其他文件导入TransformOptions类型
 */
import type { TransformOptions } from './TransformOptions';
