import { DefaultAdapterChain } from './defaultAdapterChain';

import type {
  AdapterChain,
  AdapterChainOptions,
} from '../interfaces/adapterChain';
import type { OutputAdapter } from '../interfaces/outputAdapter';
import type { OutputAdapterFactory } from '../interfaces/outputAdapterFactory';

/**
 * 适配器链构建器
 *
 * 提供流式API来创建和配置适配器链
 */
export class AdapterChainBuilder {
  /**
   * 当前适配器链
   * @private
   */
  private chain: AdapterChain;

  /**
   * 适配器工厂，用于解析适配器名称
   * @private
   */
  private factory: OutputAdapterFactory | null;

  /**
   * 构造函数
   *
   * @param options 链配置选项
   * @param factory 可选的适配器工厂，用于根据名称获取适配器
   */
  constructor(options?: AdapterChainOptions, factory?: OutputAdapterFactory) {
    this.chain = new DefaultAdapterChain(options);
    this.factory = factory || null;
  }

  /**
   * 添加适配器到链尾部
   *
   * @param adapter 适配器实例或名称
   * @returns 构建器实例，用于链式调用
   */
  add(adapter: OutputAdapter | string): AdapterChainBuilder {
    if (typeof adapter === 'string') {
      if (!this.factory) {
        throw new Error(
          `无法解析适配器名称 "${adapter}"，因为未提供适配器工厂`
        );
      }

      const resolvedAdapter = this.factory.getAdapter(adapter);

      if (!resolvedAdapter) {
        throw new Error(`无法找到名为 "${adapter}" 的适配器`);
      }

      this.chain.add(resolvedAdapter);
    } else {
      this.chain.add(adapter);
    }

    return this;
  }

  /**
   * 批量添加多个适配器
   *
   * @param adapters 适配器实例或名称数组
   * @returns 构建器实例，用于链式调用
   */
  addAll(adapters: (OutputAdapter | string)[]): AdapterChainBuilder {
    for (const adapter of adapters) {
      this.add(adapter);
    }

    return this;
  }

  /**
   * 在指定索引位置插入适配器
   *
   * @param index 要插入的位置
   * @param adapter 适配器实例或名称
   * @returns 构建器实例，用于链式调用
   */
  insert(index: number, adapter: OutputAdapter | string): AdapterChainBuilder {
    if (typeof adapter === 'string') {
      if (!this.factory) {
        throw new Error(
          `无法解析适配器名称 "${adapter}"，因为未提供适配器工厂`
        );
      }

      const resolvedAdapter = this.factory.getAdapter(adapter);

      if (!resolvedAdapter) {
        throw new Error(`无法找到名为 "${adapter}" 的适配器`);
      }

      this.chain.insert(index, resolvedAdapter);
    } else {
      this.chain.insert(index, adapter);
    }

    return this;
  }

  /**
   * 移除指定索引位置的适配器
   *
   * @param index 要移除的适配器索引
   * @returns 构建器实例，用于链式调用
   */
  remove(index: number): AdapterChainBuilder {
    this.chain.remove(index);

    return this;
  }

  /**
   * 设置适配器工厂
   *
   * @param factory 适配器工厂
   * @returns 构建器实例，用于链式调用
   */
  withFactory(factory: OutputAdapterFactory): AdapterChainBuilder {
    this.factory = factory;

    return this;
  }

  /**
   * 清空适配器链
   *
   * @returns 构建器实例，用于链式调用
   */
  clear(): AdapterChainBuilder {
    this.chain.clear();

    return this;
  }

  /**
   * 根据格式设置预定义的适配器链
   *
   * 例如: format="json-pretty"会添加JSON适配器和美化适配器
   *
   * @param format 目标格式描述
   * @returns 构建器实例，用于链式调用
   */
  forFormat(format: string): AdapterChainBuilder {
    if (!this.factory) {
      throw new Error('未提供适配器工厂，无法根据格式构建适配器链');
    }

    // 预定义格式处理
    const formatParts = format.toLowerCase().split('-');

    if (formatParts.length > 1) {
      // 处理复合格式，如json-pretty、xml-minify等
      const baseFormat = formatParts[0];
      const baseAdapter = this.factory.getAdapter(baseFormat);

      if (!baseAdapter) {
        throw new Error(`无法找到基础格式 "${baseFormat}" 的适配器`);
      }

      this.chain.add(baseAdapter);

      // 处理修饰符
      for (let i = 1; i < formatParts.length; i++) {
        const modifier = formatParts[i];
        // 查找修饰符对应的适配器，例如pretty、minify等
        const modifierAdapter = this.factory.getAdapter(modifier);

        if (modifierAdapter) {
          this.chain.add(modifierAdapter);
        }
      }
    } else {
      // 单一格式
      const adapter = this.factory.getAdapter(format);

      if (!adapter) {
        throw new Error(`无法找到格式 "${format}" 的适配器`);
      }

      this.chain.add(adapter);
    }

    return this;
  }

  /**
   * 构建适配器链
   *
   * @returns 构建的适配器链
   */
  build(): AdapterChain {
    return this.chain;
  }

  /**
   * 创建新的适配器链构建器
   *
   * @param options 链配置选项
   * @param factory 可选的适配器工厂
   * @returns 新的构建器实例
   * @static
   */
  static create(
    options?: AdapterChainOptions,
    factory?: OutputAdapterFactory
  ): AdapterChainBuilder {
    return new AdapterChainBuilder(options, factory);
  }
}
