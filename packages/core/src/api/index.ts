/**
 * 核心API函数
 */
import { DpmlAdapter } from '../parser';
import { ParseOptions, ParseResult } from '../parser/interfaces';
import { DefaultProcessor, ProcessorOptions, ProcessedDocument } from '../processor';
// 直接导入所需类型
import { NodeType } from '../types/node';
import type { Document, Element, Content, Node } from '../types/node';

/**
 * 解析DPML文本
 * @param input DPML文本
 * @param options 解析选项
 * @returns 解析结果
 */
export async function parse(input: string, options?: ParseOptions): Promise<ParseResult> {
  const parser = new DpmlAdapter();
  return parser.parse(input, options);
}

/**
 * 处理DPML文档
 * @param document 待处理的文档
 * @param pathOrOptions 文档路径或处理选项
 * @returns 处理后的文档
 */
export async function process(
  document: Document,
  pathOrOptions?: string | ProcessorOptions
): Promise<ProcessedDocument> {
  const processor = new DefaultProcessor();

  // 处理参数
  if (typeof pathOrOptions === 'string') {
    // 如果是字符串，则为文档路径
    return processor.process(document, pathOrOptions);
  } else if (pathOrOptions) {
    // 如果是对象，则为处理选项
    processor.configure(pathOrOptions);
    return processor.process(document, ''); // 传入空字符串作为path参数
  }

  // 不带路径调用处理方法，传入默认的空字符串
  return processor.process(document, '');
}

/**
 * 警告类型，用于解析结果中的警告
 */
export interface Warning {
  code: string;
  message: string;
  position?: any;
}

// 重新导出其他需要的类型
export type { ParseOptions, ParseResult };

// 重新导出Node类型
export { Element, Content, Node, NodeType };