/**
 * 协议处理器工厂函数
 *
 * 提供创建各种协议处理器实例的工厂函数
 */
import { HttpProtocolHandler } from './httpProtocolHandler';
import { IdProtocolHandler } from './idProtocolHandler';
import { FileProtocolHandler } from './fileProtocolHandler';
/**
 * 创建HTTP协议处理器
 * @param options HTTP协议处理器选项
 * @returns HTTP协议处理器实例
 */
export function createHttpProtocolHandler(options) {
    return new HttpProtocolHandler(options);
}
/**
 * 创建ID协议处理器
 * @param context ID协议处理器上下文
 * @returns ID协议处理器实例
 */
export function createIdProtocolHandler(context) {
    const handler = new IdProtocolHandler();
    if (context) {
        handler.setContext(context);
    }
    return handler;
}
/**
 * 创建文件协议处理器
 * @param options 文件协议处理器选项
 * @returns 文件协议处理器实例
 */
export function createFileProtocolHandler(options) {
    return new FileProtocolHandler(options);
}
//# sourceMappingURL=factory.js.map