/**
 * 解析选项配置类型
 * 支持错误处理和验证行为配置
 */
export interface ParseOptions {
  /** 是否在错误时立即抛出 */
  throwOnError?: boolean;

  /** 源文件名，用于错误报告 */
  fileName?: string;

  /** 底层XML解析器选项 */
  xmlParserOptions?: XMLParserOptions;

  /** 后处理器选项 */
  postProcessorOptions?: Record<string, boolean>;

  /** 内存优化选项，用于处理大文件 */
  memoryOptimization?: MemoryOptimizationOptions;
}

/**
 * XML解析器选项
 */
export interface XMLParserOptions {
  /** 是否保留空白字符 */
  preserveWhitespace?: boolean;

  /** 是否解析注释 */
  parseComments?: boolean;

  /** 是否启用命名空间支持 */
  enableNamespaces?: boolean;

  /** 最大嵌套层级 */
  maxDepth?: number;

  /** 是否验证节点引用完整性 */
  validateReferences?: boolean;

  /** 是否解析CDATA部分 */
  parseCDATA?: boolean;

  /** 是否使用流式处理（用于大文件） */
  useStreaming?: boolean;
}

/**
 * 内存优化选项
 */
export interface MemoryOptimizationOptions {
  /** 是否启用内存优化 */
  enabled?: boolean;

  /** 大文件阈值（字节数），超过此值将应用优化 */
  largeFileThreshold?: number;

  /** 是否使用流式处理 */
  useStreaming?: boolean;

  /** 批处理大小 */
  batchSize?: number;
}
