import { ParseOptions } from '../../types';
import { DPMLAdapter } from './DPMLAdapter';
import { XMLAdapter } from './XMLAdapter';
import { IXMLParser } from './types';
import { XMLParser } from './XMLParser';

/**
 * 解析器工厂
 * 负责创建和配置适配器实例
 * 封装实例创建逻辑，确保正确的依赖注入
 */
export const parserFactory = {
  // 缓存的XML解析器实例
  _xmlParser: null as IXMLParser | null,

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
    // 如果已经有缓存的解析器实例，直接返回
    if (this._xmlParser) {
      return this._xmlParser;
    }

    // 创建新的解析器实例并缓存
    this._xmlParser = new XMLParser();
    return this._xmlParser;
  }
};