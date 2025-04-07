/**
 * PromptTagProcessor
 *
 * Prompt领域的标签处理器示例
 */
import { Element } from '../../types/node';
import { ProcessingContext, TagProcessor } from '../interfaces';
/**
 * Prompt标签处理器
 *
 * 处理prompt标签，提取其语义信息，生成prompt元数据
 * 这是一个领域标签处理器的示例实现
 */
export declare class PromptTagProcessor implements TagProcessor {
    /**
     * 处理器优先级
     */
    priority: number;
    /**
     * 判断是否可以处理该元素
     * @param element 元素
     * @returns 如果是prompt标签返回true
     */
    canProcess(element: Element): boolean;
    /**
     * 处理prompt标签
     * @param element prompt元素
     * @param context 处理上下文
     * @returns 处理后的元素
     */
    process(element: Element, context: ProcessingContext): Promise<Element>;
    /**
     * 提取元素内容
     * @param element 元素
     * @returns 内容文本
     */
    private extractContent;
}
//# sourceMappingURL=promptTagProcessor.d.ts.map