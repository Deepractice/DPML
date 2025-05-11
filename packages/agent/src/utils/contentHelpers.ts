import type { Content, ContentItem } from '../types/Content';

/**
 * 从ContentItem中提取文本内容
 *
 * @param item 内容项
 * @returns 如果内容项是文本，则返回文本字符串；否则返回空字符串
 */
export function extractTextFromContentItem(item: ContentItem): string {
  if (item.type === 'text' && typeof item.value === 'string') {
    return item.value;
  }

  return '';
}

/**
 * 从Content中提取文本内容
 *
 * @param content 内容或内容数组
 * @returns 提取的文本内容，多个文本内容将合并
 */
export function extractTextContent(content: Content): string {
  if (Array.isArray(content)) {
    return content.map(extractTextFromContentItem).join('');
  }

  return extractTextFromContentItem(content);
}

/**
 * 创建文本内容项
 *
 * @param text 文本内容
 * @returns 文本内容项
 */
export function createTextContent(text: string): ContentItem {
  return {
    type: 'text',
    value: text
  };
}
