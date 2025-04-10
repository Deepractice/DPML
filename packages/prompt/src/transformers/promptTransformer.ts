/**
 * PromptTransformer
 * 
 * 将DPML结构转换为纯文本提示的基本转换器
 */
import { DefaultTransformer } from '@dpml/core';
import { TransformerVisitor } from '@dpml/core/src/transformer/interfaces/transformerVisitor';
import { TransformContext } from '@dpml/core/src/transformer/interfaces/transformContext';
import { Node, Element, Content, Document, NodeType } from '@dpml/core/src/types/node';
import { ProcessedDocument } from '@dpml/core/src/processor/interfaces/processor';

/**
 * 格式模板定义
 */
export interface FormatTemplate {
  /**
   * 标题
   */
  title?: string;
  
  /**
   * 内容前缀
   */
  prefix?: string;
  
  /**
   * 内容后缀
   */
  suffix?: string;
  
  /**
   * 包装器函数
   */
  wrapper?: (content: string) => string;
}

/**
 * 格式模板集合
 */
export interface FormatTemplates {
  [tagName: string]: FormatTemplate;
}

/**
 * 默认格式模板
 */
const defaultFormatTemplates: FormatTemplates = {
  role: {
    title: '## 角色',
    prefix: '你是',
    suffix: '',
    wrapper: (content) => content
  },
  context: {
    title: '## 背景',
    prefix: '',
    suffix: '',
    wrapper: (content) => content
  },
  thinking: {
    title: '## 思维框架',
    prefix: '',
    suffix: '',
    wrapper: (content) => content
  },
  executing: {
    title: '## 执行步骤',
    prefix: '',
    suffix: '',
    wrapper: (content) => content
  },
  testing: {
    title: '## 质量检查',
    prefix: '',
    suffix: '',
    wrapper: (content) => content
  },
  protocol: {
    title: '## 交互协议',
    prefix: '',
    suffix: '',
    wrapper: (content) => content
  },
  custom: {
    title: '', // 默认无标题
    prefix: '',
    suffix: '',
    wrapper: (content) => content
  }
};

/**
 * 中文格式模板
 */
const zhFormatTemplates: FormatTemplates = {
  role: {
    title: '## 角色',
    prefix: '你是',
    suffix: '',
    wrapper: (content) => content
  },
  context: {
    title: '## 背景',
    prefix: '',
    suffix: '',
    wrapper: (content) => content
  },
  thinking: {
    title: '## 思维框架',
    prefix: '请使用以下思维框架:\n',
    suffix: '',
    wrapper: (content) => content
  },
  executing: {
    title: '## 执行步骤',
    prefix: '',
    suffix: '',
    wrapper: (content) => content
  },
  testing: {
    title: '## 质量检查',
    prefix: '',
    suffix: '',
    wrapper: (content) => content
  },
  protocol: {
    title: '## 交互协议',
    prefix: '',
    suffix: '',
    wrapper: (content) => content
  },
  custom: {
    title: '', // 默认无标题
    prefix: '',
    suffix: '',
    wrapper: (content) => content
  }
};

/**
 * 语言特定模板映射
 */
const langSpecificTemplates: Record<string, FormatTemplates> = {
  'zh-CN': zhFormatTemplates,
  'zh-TW': zhFormatTemplates
};

/**
 * 语言指令映射
 */
const langDirectives: Record<string, string> = {
  'zh-CN': '请用中文回复',
  'zh-TW': '請用繁體中文回覆',
  'ja-JP': '日本語で回答してください',
  'en-US': 'Please respond in English',
  'en': 'Please respond in English'
};

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
 */
class PromptTransformerVisitor implements TransformerVisitor {
  name = 'PromptTransformerVisitor';
  priority = 100;

  constructor(private transformer: PromptTransformer) {}

  visitElement(element: Element, context: TransformContext): string {
    return this.transformer.handleVisitElement(element);
  }

  visitContent(content: Content): string {
    return content.value || '';
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
    this.formatTemplates = options?.formatTemplates || defaultFormatTemplates;
    
    // 初始化语言设置
    this.lang = options?.lang || 'en';
    
    // 初始化语言指令设置
    this.addLanguageDirective = options?.addLanguageDirective || false;
    
    // 初始化标签顺序
    this.tagOrder = options?.tagOrder || [
      'role', 'context', 'thinking', 'executing', 'testing', 'protocol', 'custom'
    ];

    // 注册访问者
    this.registerVisitor(new PromptTransformerVisitor(this));
  }

  /**
   * 处理访问元素
   * @param element 元素节点
   * @returns 转换结果
   */
  handleVisitElement(element: Element): string {
    // 获取标签名
    const tagName = element.tagName;
    
    // 根据标签名分派处理
    switch (tagName) {
      case 'prompt':
        return this.processPromptTag(element);
      case 'role':
        return this.processRoleTag(element);
      case 'context':
        return this.processContextTag(element);
      case 'thinking':
        return this.processThinkingTag(element);
      case 'executing':
        return this.processExecutingTag(element);
      case 'testing':
        return this.processTestingTag(element);
      case 'protocol':
        return this.processProtocolTag(element);
      case 'custom':
        return this.processCustomTag(element);
      default:
        // 默认处理
        return '';
    }
  }
  
  /**
   * 转换文档
   * @param doc 处理后的文档
   * @returns 转换结果
   */
  transform(doc: ProcessedDocument): string {
    try {
      // 创建一个简单的字符串结果
      let result = '';
      
      // 获取根元素（prompt标签）
      if (doc.children && doc.children.length > 0) {
        const rootElement = doc.children[0];
        if (rootElement.type === NodeType.ELEMENT && (rootElement as Element).tagName === 'prompt') {
          const promptElement = rootElement as Element;
          
          // 处理语言属性
          if (promptElement.attributes.lang) {
            this.lang = promptElement.attributes.lang as string;
          }
          
          // 递归处理prompt标签内容
          result = this.processPromptContent(promptElement);
        }
      }
      
      // 添加语言指令
      if (this.addLanguageDirective && langDirectives[this.lang]) {
        result += '\n\n' + langDirectives[this.lang];
      }
      
      return result;
    } catch (error) {
      console.error('转换错误:', error);
      return `Error: ${(error as Error).message}`;
    }
  }
  
  /**
   * 处理Prompt内容
   * @param promptElement prompt元素
   * @returns 格式化后的提示文本
   */
  private processPromptContent(promptElement: Element): string {
    // 获取所有子标签，并按标签名分组
    const childrenByTagName: Record<string, Element[]> = {};
    
    if (promptElement.children) {
      promptElement.children.forEach(child => {
        if (child.type === NodeType.ELEMENT) {
          const tagName = (child as Element).tagName;
          if (!childrenByTagName[tagName]) {
            childrenByTagName[tagName] = [];
          }
          childrenByTagName[tagName].push(child as Element);
        }
      });
    }
    
    // 按配置的顺序处理标签
    const orderedContents = this.tagOrder
      .map(tagName => {
        const elements = childrenByTagName[tagName];
        if (!elements || elements.length === 0) {
          return '';
        }
        
        // 处理第一个元素
        const element = elements[0];
        return this.handleVisitElement(element);
      })
      .filter(content => content && content.trim() !== '')
      .join('\n\n');
    
    return orderedContents;
  }
  
  /**
   * 提取元素内容
   * @param element 元素节点
   * @returns 元素内容文本
   */
  private extractElementContent(element: Element): string {
    if (!element.children || element.children.length === 0) {
      return '';
    }
    
    return element.children
      .filter(child => child.type === NodeType.CONTENT)
      .map(child => (child as Content).value)
      .join('');
  }
  
  /**
   * 应用格式模板
   * @param tagName 标签名
   * @param content 内容
   * @returns 格式化后的内容
   */
  private applyTemplate(tagName: string, content: string): string {
    // 获取模板
    const template = this.getTemplateForTag(tagName);
    if (!template) {
      return content;
    }
    
    // 构建格式化结果
    let result = '';
    
    // 添加标题
    if (template.title) {
      result += template.title + '\n';
    }
    
    // 添加内容(应用前缀、后缀和包装器)
    let formattedContent = content;
    if (template.prefix) {
      formattedContent = template.prefix + formattedContent;
    }
    if (template.suffix) {
      formattedContent += template.suffix;
    }
    if (template.wrapper && typeof template.wrapper === 'function') {
      formattedContent = template.wrapper(formattedContent);
    }
    
    result += formattedContent;
    
    return result;
  }
  
  /**
   * 获取标签的格式模板
   * @param tagName 标签名
   * @returns 格式模板
   */
  private getTemplateForTag(tagName: string): FormatTemplate {
    // 检查自定义模板
    if (this.formatTemplates[tagName]) {
      return this.formatTemplates[tagName];
    }
    
    // 检查语言特定模板
    const langTemplates = langSpecificTemplates[this.lang];
    if (langTemplates && langTemplates[tagName]) {
      return langTemplates[tagName];
    }
    
    // 使用默认模板
    return defaultFormatTemplates[tagName] || { 
      title: '', 
      prefix: '', 
      suffix: '',
      wrapper: (content) => content
    };
  }
  
  /**
   * 处理prompt标签
   * @param element prompt元素
   * @returns 转换结果
   */
  private processPromptTag(element: Element): string {
    // 获取语言属性
    if (element.attributes.lang) {
      this.lang = element.attributes.lang as string;
    }
    
    // 递归处理内容委托给processPromptContent
    return this.processPromptContent(element);
  }
  
  /**
   * 处理role标签
   * @param element role元素
   * @returns 转换结果
   */
  private processRoleTag(element: Element): string {
    const content = this.extractElementContent(element);
    return this.applyTemplate('role', content);
  }
  
  /**
   * 处理context标签
   * @param element context元素
   * @returns 转换结果
   */
  private processContextTag(element: Element): string {
    const content = this.extractElementContent(element);
    return this.applyTemplate('context', content);
  }
  
  /**
   * 处理thinking标签
   * @param element thinking元素
   * @returns 转换结果
   */
  private processThinkingTag(element: Element): string {
    const content = this.extractElementContent(element);
    return this.applyTemplate('thinking', content);
  }
  
  /**
   * 处理executing标签
   * @param element executing元素
   * @returns 转换结果
   */
  private processExecutingTag(element: Element): string {
    const content = this.extractElementContent(element);
    return this.applyTemplate('executing', content);
  }
  
  /**
   * 处理testing标签
   * @param element testing元素
   * @returns 转换结果
   */
  private processTestingTag(element: Element): string {
    const content = this.extractElementContent(element);
    return this.applyTemplate('testing', content);
  }
  
  /**
   * 处理protocol标签
   * @param element protocol元素
   * @returns 转换结果
   */
  private processProtocolTag(element: Element): string {
    const content = this.extractElementContent(element);
    return this.applyTemplate('protocol', content);
  }
  
  /**
   * 处理custom标签
   * @param element custom元素
   * @returns 转换结果
   */
  private processCustomTag(element: Element): string {
    const content = this.extractElementContent(element);
    return this.applyTemplate('custom', content);
  }
} 