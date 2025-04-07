/**
 * 内容格式基础接口
 */
export interface ContentFormat {
  /**
   * 格式类型
   */
  type: string;
  
  /**
   * 格式文本内容
   */
  text: string;
  
  /**
   * 在原内容中的起始位置
   */
  start: number;
  
  /**
   * 在原内容中的结束位置
   */
  end: number;
}

/**
 * 链接格式接口
 */
export interface ContentLink extends ContentFormat {
  /**
   * 格式类型，固定为'link'
   */
  type: 'link';
  
  /**
   * 链接URL
   */
  url: string;
  
  /**
   * 链接标题（可选）
   */
  title?: string;
}

/**
 * 图片格式接口
 */
export interface ContentImage extends ContentFormat {
  /**
   * 格式类型，固定为'image'
   */
  type: 'image';
  
  /**
   * 图片替代文本
   */
  alt: string;
  
  /**
   * 图片源地址
   */
  src: string;
  
  /**
   * 图片标题（可选）
   */
  title?: string;
} 