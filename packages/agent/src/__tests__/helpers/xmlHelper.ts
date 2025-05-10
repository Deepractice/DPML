/**
 * XML测试辅助函数
 */

/**
 * 创建一个简单的XML解析器，用于测试目的
 *
 * @returns 解析函数
 */
export function createSimpleXmlParser() {
  return async (xml: string): Promise<any> => {
    // 这是一个模拟实现，实际测试中会被vi.fn替代
    return {};
  };
}
