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
} 