import { TransformContext } from '../interfaces/transformContext';
import { ProcessedDocument } from '../../processor/interfaces/processor';
import { TransformOptions } from '../interfaces/transformOptions';
/**
 * 上下文管理器，负责创建和管理转换上下文
 */
export declare class ContextManager {
    /**
     * 创建根上下文
     * @param document 处理后的文档
     * @param options 转换选项
     * @returns 根上下文
     */
    createRootContext(document: ProcessedDocument, options: TransformOptions): TransformContext;
    /**
     * 创建子上下文
     * @param parentContext 父上下文
     * @param pathElement 路径元素
     * @param variables 变量覆盖
     * @returns 子上下文
     */
    createChildContext(parentContext: TransformContext, pathElement: string, variables?: Record<string, any>): TransformContext;
    /**
     * 添加结果到上下文
     * @param context 上下文
     * @param result 结果
     * @returns 更新后的上下文
     */
    addResult(context: TransformContext, result: any): TransformContext;
    /**
     * 获取当前路径位置
     * @param context 上下文
     * @returns 当前路径位置名称
     */
    getCurrentPathElement(context: TransformContext): string | undefined;
    /**
     * 获取父路径位置
     * @param context 上下文
     * @returns 父路径位置名称
     */
    getParentPathElement(context: TransformContext): string | undefined;
    /**
     * 获取路径标识符
     * @param context 上下文
     * @param separator 分隔符
     * @returns 路径标识符
     */
    getPathIdentifier(context: TransformContext, separator?: string): string;
    /**
     * 检查上下文路径是否包含指定元素
     * @param context 上下文
     * @param element 路径元素
     * @returns 是否包含
     */
    pathContains(context: TransformContext, element: string): boolean;
    /**
     * 获取路径元素的索引
     * @param pathElement 路径元素
     * @returns 索引或undefined
     */
    getElementIndex(pathElement: string): number | undefined;
    /**
     * 获取路径元素的名称（不含索引或标识符）
     * @param pathElement 路径元素
     * @returns 名称
     */
    getElementName(pathElement: string): string;
    /**
     * 获取路径元素的标识符
     * @param pathElement 路径元素
     * @returns 标识符或undefined
     */
    getElementIdentifier(pathElement: string): string | undefined;
    /**
     * 设置变量
     * @param context 上下文
     * @param name 变量名
     * @param value 变量值
     * @returns 更新后的上下文
     */
    setVariable(context: TransformContext, name: string, value: any): TransformContext;
    /**
     * 获取变量
     * @param context 上下文
     * @param name 变量名
     * @param defaultValue 默认值
     * @param searchParent 是否搜索父上下文
     * @returns 变量值
     */
    getVariable(context: TransformContext, name: string, defaultValue?: any, searchParent?: boolean): any;
    /**
     * 批量设置变量
     * @param context 上下文
     * @param variables 变量映射
     * @returns 更新后的上下文
     */
    setVariables(context: TransformContext, variables: Record<string, any>): TransformContext;
    /**
     * 创建新的上下文副本
     * @param context 原上下文
     * @returns 上下文副本
     */
    cloneContext(context: TransformContext): TransformContext;
    /**
     * 获取指定类型的父结果
     * @param context 上下文
     * @param type 结果类型
     * @returns 匹配的结果或undefined
     */
    getParentResultByType(context: TransformContext, type: string): any | undefined;
    /**
     * 获取指定索引的父结果
     * @param context 上下文
     * @param index 索引
     * @returns 结果或undefined
     */
    getParentResultByIndex(context: TransformContext, index: number): any | undefined;
    /**
     * 获取最近的父结果
     * @param context 上下文
     * @returns 最近的父结果或undefined
     */
    getLatestParentResult(context: TransformContext): any | undefined;
    /**
     * 获取所有指定类型的父结果
     * @param context 上下文
     * @param type 结果类型
     * @returns 匹配的结果数组
     */
    getAllParentResultsByType(context: TransformContext, type: string): any[];
    /**
     * 检查是否有指定类型的父结果
     * @param context 上下文
     * @param type 结果类型
     * @returns 是否存在
     */
    hasParentResultOfType(context: TransformContext, type: string): boolean;
    /**
     * 通过路径获取对应父结果
     * @param context 上下文
     * @param path 路径
     * @returns 父结果链
     */
    getParentResultsByPath(context: TransformContext): Record<string, any>;
    /**
     * 合并父结果链
     * @param parentResults1 第一条父结果链
     * @param parentResults2 第二条父结果链
     * @returns 合并后的父结果链
     */
    mergeParentResults(parentResults1: any[], parentResults2: any[]): any[];
    /**
     * 深度克隆对象
     * @param obj 要克隆的对象
     * @returns 深度克隆后的对象
     * @private
     */
    private deepCloneObject;
    /**
     * 深度克隆上下文
     * @param context 原上下文
     * @returns 深度克隆后的上下文
     */
    deepCloneContext(context: TransformContext): TransformContext;
    /**
     * 创建嵌套上下文
     * @param parentContext 父上下文
     * @param pathElement 路径元素
     * @param variables 变量覆盖
     * @returns 嵌套子上下文
     */
    createNestedContext(parentContext: TransformContext, pathElement: string, variables?: Record<string, any>): TransformContext;
    /**
     * 获取指定层级的祖先上下文
     * @param context 当前上下文
     * @param level 祖先层级（0表示当前上下文，1表示父上下文，依此类推）
     * @returns 祖先上下文或undefined
     */
    getAncestorContext(context: TransformContext, level: number): TransformContext | undefined;
    /**
     * 通过路径元素获取祖先上下文
     * @param context 当前上下文
     * @param pathElement 路径元素名称
     * @returns 匹配的祖先上下文或undefined
     */
    getAncestorContextByPathElement(context: TransformContext, pathElement: string): TransformContext | undefined;
    /**
     * 将变更传播到所有子上下文
     * @param context 已更新的上下文
     * @returns 更新后的子上下文映射
     */
    propagateChange(context: TransformContext): Map<string, TransformContext>;
    /**
     * 获取组合的所有父结果
     * @param context 当前上下文
     * @returns 组合后的父结果数组
     */
    getCombinedResults(context: TransformContext): any[];
    /**
     * 通过路径获取结果映射
     * @param context 当前上下文
     * @returns 路径到结果的映射
     */
    getResultsByPath(context: TransformContext): Record<string, any>;
    /**
     * 深度克隆嵌套上下文结构
     * @param context 要克隆的上下文
     * @returns 深度克隆后的上下文，包括嵌套结构
     */
    deepCloneNestedContext(context: TransformContext): TransformContext;
}
//# sourceMappingURL=contextManager.d.ts.map