import { DefaultAdapterChain } from './defaultAdapterChain';

import type { AdapterChain } from '../interfaces/adapterChain';
import type { OutputAdapter } from '../interfaces/outputAdapter';
import type {
  OutputAdapterFactory,
  OutputAdapterFactoryOptions,
} from '../interfaces/outputAdapterFactory';

/**
 * 扩展的适配器工厂配置选项
 */
export interface ExtendedOutputAdapterFactoryOptions
  extends OutputAdapterFactoryOptions {
  /**
   * 格式别名映射
   *
   * 例如: { 'yml': 'yaml', 'markdown': 'md' }
   * 请求'yml'格式时会返回'yaml'对应的适配器
   */
  formatAliases?: Record<string, string>;

  /**
   * 适配器映射函数
   *
   * 在找不到明确匹配的适配器时，尝试使用此函数动态创建适配器
   * 如果返回null，将继续尝试使用默认适配器
   */
  formatMapper?: (
    format: string,
    factory: OutputAdapterFactory
  ) => OutputAdapter | null;
}

/**
 * 扩展的输出适配器工厂
 *
 * 增强了标准适配器工厂，增加了别名支持、适配器链构建和动态适配器创建功能
 */
export class ExtendedOutputAdapterFactory implements OutputAdapterFactory {
  /**
   * 适配器映射
   * @private
   */
  private adapters: Map<string, OutputAdapter | (() => OutputAdapter)>;

  /**
   * 格式别名映射
   * @private
   */
  private aliases: Map<string, string>;

  /**
   * 默认适配器名称
   * @private
   */
  private defaultAdapterName: string | null;

  /**
   * 是否严格匹配
   * @private
   */
  private strictMatching: boolean;

  /**
   * 适配器映射函数
   * @private
   */
  private formatMapper:
    | ((format: string, factory: OutputAdapterFactory) => OutputAdapter | null)
    | null;

  /**
   * 构造函数
   * @param options 工厂配置选项
   */
  constructor(options?: ExtendedOutputAdapterFactoryOptions) {
    this.adapters = new Map<string, OutputAdapter | (() => OutputAdapter)>();
    this.aliases = new Map<string, string>();
    this.defaultAdapterName = options?.defaultAdapter || null;
    this.strictMatching = options?.strictMatching || false;
    this.formatMapper = options?.formatMapper || null;

    // 初始化格式别名
    if (options?.formatAliases) {
      for (const [alias, format] of Object.entries(options.formatAliases)) {
        this.addAlias(alias, format);
      }
    }
  }

  /**
   * 注册适配器
   *
   * @param name 适配器名称/类型
   * @param adapter 适配器实例或工厂函数
   */
  register(name: string, adapter: OutputAdapter | (() => OutputAdapter)): void {
    // 转换为小写，确保不区分大小写
    const normalizedName = name.toLowerCase();

    this.adapters.set(normalizedName, adapter);
  }

  /**
   * 添加格式别名
   *
   * @param alias 别名
   * @param format 目标格式名称
   */
  addAlias(alias: string, format: string): void {
    const normalizedAlias = alias.toLowerCase();
    const normalizedFormat = format.toLowerCase();

    this.aliases.set(normalizedAlias, normalizedFormat);
  }

  /**
   * 移除格式别名
   *
   * @param alias 要移除的别名
   */
  removeAlias(alias: string): void {
    const normalizedAlias = alias.toLowerCase();

    this.aliases.delete(normalizedAlias);
  }

  /**
   * 获取所有已注册的别名
   *
   * @returns 别名到格式的映射
   */
  getAliases(): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [alias, format] of this.aliases.entries()) {
      result[alias] = format;
    }

    return result;
  }

  /**
   * 构建适配器链
   *
   * @param adapters 要添加到链中的适配器名称
   * @param options 链配置选项
   * @returns 构建的适配器链，如果有任何适配器找不到则返回null
   */
  buildChain(adapters: string[], options?: any): AdapterChain | null {
    const chain = new DefaultAdapterChain(options);

    for (const adapterName of adapters) {
      const adapter = this.getAdapter(adapterName);

      if (!adapter) {
        // 如果任何一个适配器找不到，就返回null
        return null;
      }

      chain.add(adapter);
    }

    return chain;
  }

  /**
   * 获取适配器
   *
   * @param format 输出格式名称
   * @returns 对应的适配器，如果未找到则返回默认适配器或null
   */
  getAdapter(format: string): OutputAdapter | null {
    // 转换为小写，确保不区分大小写
    const normalizedFormat = format.toLowerCase();

    // 1. 直接检查是否有匹配的适配器
    const adapter = this.adapters.get(normalizedFormat);

    if (adapter) {
      return this.resolveAdapter(adapter);
    }

    // 2. 检查是否是别名
    const aliasedFormat = this.aliases.get(normalizedFormat);

    if (aliasedFormat) {
      const aliasedAdapter = this.adapters.get(aliasedFormat);

      if (aliasedAdapter) {
        return this.resolveAdapter(aliasedAdapter);
      }
    }

    // 3. 尝试使用格式映射器
    if (this.formatMapper) {
      const mappedAdapter = this.formatMapper(normalizedFormat, this);

      if (mappedAdapter) {
        return mappedAdapter;
      }
    }

    // 4. 如果未找到匹配的适配器，且非严格模式，尝试使用默认适配器
    if (!this.strictMatching && this.defaultAdapterName) {
      const defaultAdapter = this.adapters.get(
        this.defaultAdapterName.toLowerCase()
      );

      if (defaultAdapter) {
        return this.resolveAdapter(defaultAdapter);
      }
    }

    return null;
  }

  /**
   * 检查是否支持指定格式
   *
   * @param format 输出格式名称
   * @returns 是否支持该格式
   */
  supportsFormat(format: string): boolean {
    // 转换为小写，确保不区分大小写
    const normalizedFormat = format.toLowerCase();

    // 检查直接支持
    if (this.adapters.has(normalizedFormat)) {
      return true;
    }

    // 检查别名支持
    const aliasedFormat = this.aliases.get(normalizedFormat);

    if (aliasedFormat && this.adapters.has(aliasedFormat)) {
      return true;
    }

    // 检查映射器支持（如果有映射器）
    if (
      this.formatMapper &&
      this.formatMapper(normalizedFormat, this) !== null
    ) {
      return true;
    }

    return false;
  }

  /**
   * 获取所有已注册的适配器名称
   *
   * @returns 适配器名称数组
   */
  getRegisteredFormats(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * 设置默认适配器
   *
   * @param name 适配器名称
   */
  setDefaultAdapter(name: string): void {
    this.defaultAdapterName = name;
  }

  /**
   * 设置严格匹配模式
   *
   * @param strict 是否启用严格匹配
   */
  setStrictMatching(strict: boolean): void {
    this.strictMatching = strict;
  }

  /**
   * 设置格式映射器
   *
   * @param mapper 格式映射函数
   */
  setFormatMapper(
    mapper: (
      format: string,
      factory: OutputAdapterFactory
    ) => OutputAdapter | null
  ): void {
    this.formatMapper = mapper;
  }

  /**
   * 解析适配器
   *
   * 如果是工厂函数，则调用工厂函数创建实例
   * 如果是适配器实例，则直接返回
   *
   * @param adapter 适配器或工厂函数
   * @returns 解析后的适配器实例
   * @private
   */
  private resolveAdapter(
    adapter: OutputAdapter | (() => OutputAdapter)
  ): OutputAdapter {
    if (typeof adapter === 'function') {
      return adapter();
    }

    return adapter;
  }
}
