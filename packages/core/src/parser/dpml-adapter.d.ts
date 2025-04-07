import { ParseOptions, ParseResult } from './interfaces';
import { TagRegistry } from './tag-registry';
/**
 * DPML适配器核心类
 * 负责将DPML文本解析为DPML节点树
 */
export declare class DpmlAdapter {
    /**
     * XML解析适配器
     */
    private xmlParser;
    /**
     * XML到DPML节点转换器
     */
    private nodeConverter;
    /**
     * 标签注册表
     */
    private tagRegistry;
    /**
     * 验证器
     */
    private validator;
    private errors;
    private warnings;
    /**
     * 构造函数
     * @param options 解析选项
     */
    constructor(options?: ParseOptions);
    /**
     * 获取标签注册表
     * @returns 标签注册表
     */
    getTagRegistry(): TagRegistry;
    /**
     * 解析DPML文本
     * @param input DPML文本
     * @param options 解析选项
     * @returns 解析结果
     */
    parse(input: string, options?: ParseOptions): Promise<ParseResult>;
    /**
     * 处理DPML元素节点
     * @param document 文档节点
     */
    private processElements;
    /**
     * 创建空文档节点
     * @returns 空的Document节点
     */
    private createEmptyDocument;
}
//# sourceMappingURL=dpml-adapter.d.ts.map