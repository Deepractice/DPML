/**
 * PromptTransformer
 * 
 * 将DPML结构转换为纯文本提示的基本转换器
 */
import { 
  DefaultTransformer,
  TransformerVisitor,
  Node,
  Element,
  Content,
  Document,
  NodeType,
  ProcessedDocument
} from '@dpml/core';
// 从正确路径导入TransformContext
import { TransformContext } from '@dpml/core/src/transformer/interfaces/transformContext';
import { 
  FormatTemplate, 
  FormatTemplates, 
  defaultFormatTemplates, 
  langSpecificTemplates, 
  langDirectives, 
  defaultTagOrder,
  applyFormatTemplate,
  getTemplateForTag,
  sortTagContents
} from './formatConfig';

/**
 * PromptTransformer选项
 */
export interface PromptTransformerOptions {
  /**
   * 格式模板
   */
  formatTemplates?: FormatTemplates;
  
  /**
   * 语言设置
   */
  lang?: string;
  
  /**
   * 是否添加语言指令
   */
  addLanguageDirective?: boolean;
  
  /**
   * 标签顺序
   */
  tagOrder?: string[];
}

/**
 * 提示转换器访问者
 * 负责将不同类型的节点转换为文本
 */
class PromptTransformerVisitor implements TransformerVisitor {
  name = 'PromptTransformerVisitor';
  priority = 10;
  
  constructor(private transformer: PromptTransformer) {}
  
  /**
   * 访问处理过的文档
   * 
   * @param document 处理过的文档
   * @param context 转换上下文
   * @returns 转换结果
   */
  visitDocument(document: ProcessedDocument, context: TransformContext): string {
    // 检查文档为空的情况
    if (!document || !document.children) {
      return '';
    }
    
    // 查找prompt元素
    let promptElement: Element | null = null;
    for (const node of document.children) {
      if (node.type === NodeType.ELEMENT) {
        const element = node as Element;
        if (element.tagName === 'prompt') {
          promptElement = element;
          break;
        }
      }
    }
    
    // 如果没有找到prompt元素，返回空字符串
    if (!promptElement) {
      return '';
    }
    
    // 提取语言设置
    const lang = this.transformer.getLang(promptElement);
    
    // 按标签类型收集内容
    const tagContents: Record<string, string> = {};
    
    // 处理子元素
    for (const node of promptElement.children) {
      if (node.type === NodeType.ELEMENT) {
        const element = node as Element;
        const tagName = element.tagName;
        const content = this.getElementContent(element);
        
        // 获取合适的模板
        const template = this.transformer.getTemplateForTag(tagName);
        
        // 应用格式模板
        const formattedContent = applyFormatTemplate(tagName, content, template);
        
        // 保存格式化后的内容
        tagContents[tagName] = formattedContent;
      }
    }
    
    // 按指定顺序排序内容
    const sortedContents = sortTagContents(tagContents, this.transformer.getTagOrder());
    
    // 合并成最终结果
    let result = sortedContents.join('\n\n');
    
    // 添加语言指令（如果启用）
    if (this.transformer.shouldAddLanguageDirective()) {
      const directive = langDirectives[lang];
      if (directive) {
        result += '\n\n' + directive;
      }
    }
    
    return result;
  }
  
  /**
   * 获取元素的文本内容
   * 
   * @param element 元素
   * @returns 元素的文本内容
   */
  private getElementContent(element: Element): string {
    let content = '';
    
    for (const child of element.children) {
      if (child.type === NodeType.CONTENT) {
        content += (child as Content).value;
      }
    }
    
    return content;
  }
}

/**
 * 提示转换器
 * 将DPML文档结构转换为纯文本提示
 */
export class PromptTransformer extends DefaultTransformer {
  /**
   * 格式模板
   */
  private formatTemplates: FormatTemplates;
  
  /**
   * 语言设置
   */
  private lang: string;
  
  /**
   * 是否添加语言指令
   */
  private addLanguageDirective: boolean;
  
  /**
   * 标签顺序
   */
  private tagOrder: string[];
  
  /**
   * 构造函数
   * @param options 转换器选项
   */
  constructor(options?: PromptTransformerOptions) {
    super();
    
    // 初始化格式模板
    this.formatTemplates = options?.formatTemplates || {};
    
    // 初始化语言设置
    this.lang = options?.lang || 'en';
    
    // 初始化语言指令设置
    this.addLanguageDirective = options?.addLanguageDirective || false;
    
    // 初始化标签顺序
    this.tagOrder = options?.tagOrder || defaultTagOrder;

    // 注册访问者
    this.registerVisitor(new PromptTransformerVisitor(this));
  }
  
  /**
   * 获取标签的格式模板
   * @param tagName 标签名
   * @returns 格式模板
   */
  getTemplateForTag(tagName: string): FormatTemplate {
    return getTemplateForTag(tagName, this.formatTemplates, this.lang);
  }
  
  /**
   * 获取语言设置
   * @param promptElement prompt元素
   * @returns 语言代码
   */
  getLang(promptElement: Element): string {
    // 如果在转换器选项中设置了语言，优先使用
    if (this.lang !== undefined) {
      return this.lang;
    }
    
    // 否则，从prompt标签的lang属性获取
    const langAttr = promptElement.attributes?.lang;
    if (langAttr && typeof langAttr === 'string') {
      return langAttr;
    }
    
    // 默认使用英语
    return 'en';
  }
  
  /**
   * 获取标签顺序
   * @returns 标签顺序数组
   */
  getTagOrder(): string[] {
    return this.tagOrder;
  }
  
  /**
   * 是否应添加语言指令
   * @returns 是否添加语言指令
   */
  shouldAddLanguageDirective(): boolean {
    return this.addLanguageDirective;
  }
} 