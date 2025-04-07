/**
 * 协议处理器工厂函数
 *
 * 提供创建各种协议处理器实例的工厂函数
 */
import { HttpProtocolHandler, HttpProtocolHandlerOptions } from './httpProtocolHandler';
import { IdProtocolHandler, IdProtocolHandlerContext } from './idProtocolHandler';
import { FileProtocolHandler, FileProtocolHandlerOptions } from './fileProtocolHandler';
/**
 * 创建HTTP协议处理器
 * @param options HTTP协议处理器选项
 * @returns HTTP协议处理器实例
 */
export declare function createHttpProtocolHandler(options?: HttpProtocolHandlerOptions): HttpProtocolHandler;
/**
 * 创建ID协议处理器
 * @param context ID协议处理器上下文
 * @returns ID协议处理器实例
 */
export declare function createIdProtocolHandler(context?: IdProtocolHandlerContext): IdProtocolHandler;
/**
 * 创建文件协议处理器
 * @param options 文件协议处理器选项
 * @returns 文件协议处理器实例
 */
export declare function createFileProtocolHandler(options?: FileProtocolHandlerOptions): FileProtocolHandler;
//# sourceMappingURL=factory.d.ts.map