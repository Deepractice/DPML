/**
 * @dpml/prompt 类型定义
 */

/**
 * 提示配置选项
 */
export interface PromptOptions {
  /** 验证模式（严格或宽松） */
  mode?: 'strict' | 'loose';
  /** 只进行验证而不处理内容 */
  validateOnly?: boolean;
  /** 基础路径，用于解析相对路径引用 */
  basePath?: string;
  /** 语言设置，覆盖文档中的lang属性 */
  lang?: string;
}

/**
 * 转换配置选项
 */
export interface TransformOptions {
  /** 格式模板配置 */
  format?: FormatOptions;
  /** 是否添加语言指令 */
  addLanguageDirective?: boolean;
  /** 自定义标签顺序 */
  tagOrder?: string[];
}

/**
 * 格式模板配置
 */
export interface FormatOptions {
  /** 各标签的格式配置 */
  [tagName: string]: TagFormatOptions;
}

/**
 * 标签格式配置
 */
export interface TagFormatOptions {
  /** 标题 */
  title?: string;
  /** 前缀 */
  prefix?: string;
  /** 后缀 */
  suffix?: string;
  /** 内容包装器函数 */
  wrapper?: (content: string) => string;
}

/**
 * 提示处理结果
 */
export interface ProcessedPrompt {
  /** 元数据 */
  metadata: {
    /** 提示ID */
    id?: string;
    /** 版本 */
    version?: string;
    /** 语言 */
    lang?: string;
    /** 继承源 */
    extends?: string;
    /** 其他元数据 */
    [key: string]: any;
  };
  /** 标签内容映射 */
  tags: {
    [tagName: string]: {
      /** 标签内容 */
      content?: string;
      /** 标签属性 */
      attributes?: Record<string, any>;
      /** 标签元数据 */
      metadata?: Record<string, any>;
    };
  };
  /** 原始文档 */
  rawDocument?: any;
} 