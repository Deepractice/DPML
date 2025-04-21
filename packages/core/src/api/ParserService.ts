/**
 * DPML解析器服务
 * 提供解析DPML文档的API
 */

import { Parser } from '../core/parser/Parser';
import type { DPMLDocument, ParserOptions, TagRegistry } from '../types';

// 创建默认解析器实例
// 使用单例模式，确保全局只有一个解析器实例
let defaultParser: Parser | null = null;

/**
 * 获取默认解析器实例
 * @returns 默认解析器实例
 */
function getDefaultParser(): Parser {
  if (!defaultParser) {
    defaultParser = new Parser();
  }

  return defaultParser;
}

/**
 * 解析DPML文本内容
 * @param content DPML文本内容
 * @param options 解析选项
 * @returns 解析后的文档对象
 */
export function parse(content: string, options?: ParserOptions): DPMLDocument {
  return getDefaultParser().parse(content, options);
}

/**
 * 异步解析DPML文件
 * @param path 文件路径
 * @param options 解析选项
 * @returns Promise，解析后的文档对象
 */
export async function parseFile(
  path: string,
  options?: ParserOptions
): Promise<DPMLDocument> {
  return getDefaultParser().parseFile(path, options);
}

/**
 * 使用自定义标签注册表解析DPML内容
 * @param content DPML文本内容
 * @param options 解析选项
 * @param registry 自定义标签注册表
 * @returns 解析后的文档对象
 */
export function parseWithRegistry(
  content: string,
  options?: ParserOptions,
  registry?: TagRegistry
): DPMLDocument {
  const parser = new Parser(registry);

  return parser.parse(content, options);
}

/**
 * 验证DPML文档
 * @param document DPML文档
 * @returns 验证结果
 */
export function validateDocument(document: DPMLDocument): boolean {
  return getDefaultParser().validateDocument(document);
}
