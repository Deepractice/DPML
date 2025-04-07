import { ProcessedDocument } from '../../processor/interfaces/processor';
import { OutputAdapter } from './outputAdapter';
import { TransformerVisitor } from './transformerVisitor';
import { TransformOptions } from './transformOptions';

/**
 * 转换器接口
 * 
 * 负责将处理后的文档转换为特定格式
 */
export interface Transformer {
  /**
   * 注册访问者
   * 
   * @param visitor 转换访问者
   */
  registerVisitor(visitor: TransformerVisitor): void;
  
  /**
   * 设置输出适配器
   * 
   * @param adapter 输出适配器
   */
  setOutputAdapter(adapter: OutputAdapter): void;
  
  /**
   * 转换文档
   * 
   * @param document 已处理的文档
   * @param options 转换选项
   * @returns 转换结果
   */
  transform(document: ProcessedDocument, options?: TransformOptions): any;
  
  /**
   * 异步转换文档
   * 
   * @param document 已处理的文档
   * @param options 转换选项
   * @returns Promise<转换结果>
   */
  transformAsync(document: ProcessedDocument, options?: TransformOptions): Promise<any>;
  
  /**
   * 配置转换器
   * 
   * @param options 配置选项
   */
  configure(options: TransformOptions): void;
} 