import { Element } from '../../types/node';
import { TransformContext } from './transformContext';
/**
 * 标签处理器接口
 *
 * 负责处理特定类型的标签
 */
export interface TagProcessor {
    /**
     * 判断是否能处理该标签
     *
     * @param element 待处理的元素
     * @returns 是否能处理该元素
     */
    canProcess(element: Element): boolean;
    /**
     * 处理标签并返回结果
     *
     * @param element 待处理的元素
     * @param context 转换上下文
     * @returns 处理结果
     */
    process(element: Element, context: TransformContext): any;
}
//# sourceMappingURL=tagProcessor.d.ts.map