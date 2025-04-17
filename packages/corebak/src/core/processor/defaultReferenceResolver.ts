/**
 * DefaultReferenceResolver实现
 *
 * 提供引用解析的默认实现
 */

import { ReferenceError, ErrorCode } from 'packages/corebak/src/errors/types';

import type { Reference } from 'packages/corebak/src/types/node';
import type {
  ProcessingContext,
  ProtocolHandler,
  ReferenceResolver,
  ResolvedReference,
  DefaultReferenceResolverOptions
} from 'packages/corebak/src/types/processor';

/**
 * 默认引用解析器实现
 */
export class DefaultReferenceResolver implements ReferenceResolver {
  /**
   * 协议处理器列表
   */
  private protocolHandlers: ProtocolHandler[] = [];

  /**
   * 是否使用缓存
   */
  private useCache: boolean = true;

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options?: DefaultReferenceResolverOptions) {
    if (options) {
      if (options.defaultProtocolHandlers) {
        this.protocolHandlers = [...options.defaultProtocolHandlers];
      }

      if (options.useCache !== undefined) {
        this.useCache = options.useCache;
      }
    }
  }

  /**
   * 注册协议处理器
   * @param handler 协议处理器
   */
  registerProtocolHandler(handler: ProtocolHandler): void {
    this.protocolHandlers.push(handler);
  }

  /**
   * 获取指定协议的处理器
   * @param protocol 协议名称
   * @returns 协议处理器，未找到则返回undefined
   */
  getProtocolHandler(protocol: string): ProtocolHandler | undefined {
    for (let i = this.protocolHandlers.length - 1; i >= 0; i--) {
      const handler = this.protocolHandlers[i];

      if (handler.canHandle(protocol)) {
        return handler;
      }
    }

    return undefined;
  }

  /**
   * 解析引用
   * @param reference 引用节点
   * @param context 处理上下文
   * @returns 解析后的引用
   */
  async resolve(
    reference: Reference,
    context: ProcessingContext
  ): Promise<ResolvedReference> {
    // 生成缓存键
    const cacheKey = `${reference.protocol}:${reference.path}`;

    // 检查缓存
    if (this.useCache && context.resolvedReferences.has(cacheKey)) {
      const cached = context.resolvedReferences.get(cacheKey)!;

      return {
        reference,
        value: cached.content,
      };
    }

    // 获取协议处理器
    const handler = this.getProtocolHandler(reference.protocol);

    if (!handler) {
      throw new ReferenceError({
        code: ErrorCode.INVALID_REFERENCE,
        message: `不支持的引用协议: ${reference.protocol}`,
        referenceUri: `${reference.protocol}:${reference.path}`,
      });
    }

    try {
      // 处理引用
      const value = await handler.handle(reference);

      // 存入缓存
      if (this.useCache) {
        context.resolvedReferences.set(cacheKey, {
          reference,
          value,
          content: value,
          timestamp: Date.now(),
        });
      }

      return {
        reference,
        value,
      };
    } catch (error) {
      throw new ReferenceError({
        code: ErrorCode.REFERENCE_NOT_FOUND,
        message: `引用解析失败: ${reference.protocol}:${reference.path}`,
        referenceUri: `${reference.protocol}:${reference.path}`,
        cause: error as Error,
      });
    }
  }
}
