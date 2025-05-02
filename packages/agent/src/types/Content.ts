/**
 * 内容类型
 */
export type ContentType = 'text' | 'image' | 'audio' | 'video' | 'file';

/**
 * 内容项
 *
 * 表示多模态内容的统一接口。
 */
export interface ContentItem {
  /**
   * 内容类型
   */
  readonly type: ContentType;

  /**
   * 内容值，根据类型有不同的表示
   */
  readonly value: string | Uint8Array | Record<string, any>;

  /**
   * MIME类型，可选
   */
  readonly mimeType?: string;
}

/**
 * 内容
 *
 * 表示单个内容项或内容项数组，提供灵活的内容表示方式。
 */
export type Content = ContentItem | ContentItem[];
