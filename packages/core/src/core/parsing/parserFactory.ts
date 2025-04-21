import { ParseOptions } from '../../types';
import { DPMLAdapter } from './DPMLAdapter';
import { XMLAdapter } from './XMLAdapter';
import { IXMLParser } from './types';

/**
 * 解析器工厂
 * 负责创建和配置适配器实例
 * 封装实例创建逻辑，确保正确的依赖注入
 */
export const parserFactory = {
  /**
   * 创建DPML适配器实例
   * @param options 解析选项
   * @returns DPML适配器实例
   */
  createDPMLAdapter<T>(options: ParseOptions = {}): DPMLAdapter {
    // 创建XML适配器
    const xmlAdapter = this.createXMLAdapter<T>(options);
    
    // 创建并返回DPML适配器
    return new DPMLAdapter(options, xmlAdapter);
  },
  
  /**
   * 创建XML适配器实例
   * @param options 解析选项
   * @returns XML适配器实例
   */
  createXMLAdapter<T>(options: ParseOptions = {}): XMLAdapter {
    // 获取底层XML解析器实例
    const xmlParser = this.createXMLParser();
    
    // 创建并返回XML适配器
    return new XMLAdapter(options, xmlParser);
  },
  
  /**
   * 创建底层XML解析器实例
   * @returns XML解析器实例
   * @internal 仅供内部使用
   */
  createXMLParser(): IXMLParser {
    // TODO: 实现XML解析器创建逻辑，可能使用第三方库
    return {
      parse(content: string) {
        // 默认实现，实际项目中会替换为真实解析器
        throw new Error('XML parser not implemented');
      },
      parseAsync(content: string) {
        // 默认实现，实际项目中会替换为真实解析器
        return Promise.reject(new Error('XML parser not implemented'));
      },
      configure(options: Record<string, unknown>) {
        // 默认实现
      }
    };
  }
}; 