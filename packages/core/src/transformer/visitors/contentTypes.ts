/**
 * ContentVisitor相关类型定义
 */

/**
 * 内容格式基础接口
 */
export interface ContentFormat {
  /**
   * 格式类型
   */
  type: string;
  
  /**
   * 文本内容
   */
  text: string;
  
  /**
   * 起始位置
   */
  start: number;
  
  /**
   * 结束位置
   */
  end: number;
  
  /**
   * 扩展属性
   */
  [key: string]: any;
}

/**
 * 内容链接格式
 */
export interface ContentLink extends ContentFormat {
  /**
   * 链接类型
   */
  type: 'link';
  
  /**
   * 链接URL
   */
  url: string;
  
  /**
   * 链接标题
   */
  title?: string;
  
  /**
   * 是否为外部链接
   */
  isExternal?: boolean;
}

/**
 * 内容图片格式
 */
export interface ContentImage extends ContentFormat {
  /**
   * 类型
   */
  type: 'image';
  
  /**
   * 图片替代文本
   */
  alt: string;
  
  /**
   * 图片源路径
   */
  src: string;
  
  /**
   * 图片标题
   */
  title?: string;
  
  /**
   * 图片尺寸
   */
  dimensions?: {
    width?: number;
    height?: number;
  };
}

/**
 * 内容代码格式
 */
export interface ContentCode extends ContentFormat {
  /**
   * 类型
   */
  type: 'code';
  
  /**
   * 代码内容
   */
  code?: string;
  
  /**
   * 语言
   */
  language?: string;
  
  /**
   * 高亮设置
   */
  highlight?: boolean | number[];
}

/**
 * 内容元数据扩展
 */
export interface ContentMetaExtensions {
  /**
   * 是否已处理
   */
  isProcessed?: boolean;
  
  /**
   * 是否为空内容
   */
  isEmpty?: boolean;
  
  /**
   * 是否包含Markdown格式
   */
  containsMarkdown?: boolean;
  
  /**
   * 格式列表
   */
  formats?: ContentFormat[];
  
  /**
   * 是否包含链接
   */
  containsLinks?: boolean;
  
  /**
   * 链接列表
   */
  links?: ContentLink[];
  
  /**
   * 是否包含图片
   */
  containsImages?: boolean;
  
  /**
   * 图片列表
   */
  images?: ContentImage[];
  
  /**
   * 是否包含HTML实体
   */
  containsEntities?: boolean;
  
  /**
   * 解码后的值
   */
  decodedValue?: string;
  
  /**
   * 自定义格式列表
   */
  customFormats?: ContentFormat[];
} 