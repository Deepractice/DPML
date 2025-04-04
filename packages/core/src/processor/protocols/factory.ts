/**
 * 协议处理器工厂函数
 * 
 * 提供创建各种协议处理器实例的工厂函数
 */

import { HttpProtocolHandler, HttpProtocolHandlerOptions } from './httpProtocolHandler';
import { IdProtocolHandler, IdProtocolHandlerContext } from './idProtocolHandler';

/**
 * 创建HTTP协议处理器
 * @param options HTTP协议处理器选项
 * @returns HTTP协议处理器实例
 */
export function createHttpProtocolHandler(options?: HttpProtocolHandlerOptions): HttpProtocolHandler {
  return new HttpProtocolHandler(options);
}

/**
 * 创建ID协议处理器
 * @param context ID协议处理器上下文
 * @returns ID协议处理器实例
 */
export function createIdProtocolHandler(context?: IdProtocolHandlerContext): IdProtocolHandler {
  const handler = new IdProtocolHandler();
  if (context) {
    handler.setContext(context);
  }
  return handler;
}