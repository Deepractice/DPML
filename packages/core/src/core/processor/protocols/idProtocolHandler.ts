/**
 * IdProtocolHandler
 *
 * 处理ID协议的引用
 */

import { ReferenceError, ErrorCode } from '@core/errors/types';

import type {
  ProcessingContext,
  ProtocolHandler,
} from '@core/types/processor';
import type { Reference } from '@core/types/node';

/**
 * ID协议处理器上下文
 */
export interface IdProtocolHandlerContext {
  /**
   * 处理上下文
   */
  processingContext: ProcessingContext;
}

/**
 * ID协议处理器
 * 处理ID协议的引用，用于引用文档内的元素
 */
export class IdProtocolHandler implements ProtocolHandler {
  /**
   * 上下文
   */
  private context?: IdProtocolHandlerContext;

  /**
   * 设置上下文
   * @param context 上下文
   */
  setContext(context: IdProtocolHandlerContext): void {
    this.context = context;
  }

  /**
   * 检查是否可以处理指定协议
   * @param protocol 协议名称
   * @returns 是否可以处理
   */
  canHandle(protocol: string): boolean {
    return protocol === 'id';
  }

  /**
   * 处理引用
   * @param reference 引用节点
   * @returns 解析后的结果
   */
  async handle(reference: Reference): Promise<any> {
    if (!this.context) {
      throw new Error('ID协议处理器未设置上下文');
    }

    const { processingContext } = this.context;
    const { idMap } = processingContext;

    if (!idMap) {
      throw new Error('处理上下文中未初始化ID映射');
    }

    const id = reference.path;
    const element = idMap.get(id);

    if (!element) {
      throw new ReferenceError({
        code: ErrorCode.REFERENCE_NOT_FOUND,
        message: `找不到ID为"${id}"的元素`,
        referenceUri: `id:${id}`,
      });
    }

    return element;
  }
}
