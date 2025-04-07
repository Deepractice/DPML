/**
 * JSON输出适配器
 *
 * 将结果转换为JSON字符串
 */
export class JSONAdapter {
    /**
     * 构造函数
     * @param options 适配器选项
     */
    constructor(options = {}) {
        this.options = options;
    }
    /**
     * 适配方法
     *
     * 将结果转换为JSON字符串
     *
     * @param result 待适配的结果
     * @param context 转换上下文
     * @returns 适配后的结果，JSON字符串
     */
    adapt(result, context) {
        try {
            // 如果结果为undefined，将其转换为null
            if (result === undefined) {
                return 'null';
            }
            // 获取缩进选项
            const space = this.options.indent !== undefined ? this.options.indent : 0;
            // 使用JSON.stringify进行序列化，可能抛出循环引用错误
            return JSON.stringify(result, this.options.replacer, space);
        }
        catch (error) {
            // 处理常见的JSON序列化错误
            if (error instanceof Error) {
                // 处理循环引用错误
                if (error.message.includes('circular') || error.message.includes('循环')) {
                    return JSON.stringify({
                        error: '序列化错误: 检测到循环引用',
                        message: error.message
                    }, null, 2);
                }
                // 处理其他JSON序列化错误
                return JSON.stringify({
                    error: '序列化错误',
                    message: error.message
                }, null, 2);
            }
            // 未知错误
            return JSON.stringify({
                error: '未知序列化错误'
            }, null, 2);
        }
    }
}
//# sourceMappingURL=jsonAdapter.js.map