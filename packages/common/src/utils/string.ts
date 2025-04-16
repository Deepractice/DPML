/**
 * 字符串处理工具模块
 *
 * 提供字符串格式化、验证、转换等实用函数。
 */

/**
 * 检查字符串是否为空或仅包含空白字符
 * @param str 要检查的字符串
 * @returns 如果字符串为空或仅包含空白字符则返回true
 */
export function isEmpty(str: string | null | undefined): boolean {
  return str === undefined || str === null || str.trim() === '';
}

/**
 * 确保字符串以特定字符结尾
 * @param str 原始字符串
 * @param char 结尾字符
 * @returns 确保以指定字符结尾的字符串
 */
export function ensureEndsWith(str: string, char: string): string {
  return str.endsWith(char) ? str : `${str}${char}`;
}

/**
 * 确保字符串以特定字符开头
 * @param str 原始字符串
 * @param char 开头字符
 * @returns 确保以指定字符开头的字符串
 */
export function ensureStartsWith(str: string, char: string): string {
  return str.startsWith(char) ? str : `${char}${str}`;
}

/**
 * 截断字符串到指定长度，并添加省略号
 * @param str 原始字符串
 * @param maxLength 最大长度(包含省略号)
 * @returns 截断后的字符串
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * 将字符串转换为驼峰命名
 * @param str 原始字符串
 * @returns 驼峰命名格式的字符串
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

/**
 * 将字符串转换为帕斯卡命名(首字母大写的驼峰命名)
 * @param str 原始字符串
 * @returns 帕斯卡命名格式的字符串
 */
export function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * 将字符串转换为短横线分隔命名
 * @param str 原始字符串
 * @returns 短横线分隔格式的字符串
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * 将字符串转换为下划线分隔命名
 * @param str 原始字符串
 * @returns 下划线分隔格式的字符串
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * 格式化字符串模板，替换{name}形式的占位符
 * @param template 字符串模板，如"Hello, {name}!"
 * @param values 要替换的值对象，如{name: "World"}
 * @returns 格式化后的字符串
 */
export function format(template: string, values: Record<string, any>): string {
  return template.replace(
    /{([^{}]+)}/g,
    (_, key) => String(values[key.trim()] ?? `{${key}}`)
  );
}

/**
 * 将字符串中的HTML特殊字符转义
 * @param str 要转义的字符串
 * @returns 转义后的字符串
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
}

/**
 * 解析URL字符串为各个组成部分
 * @param url URL字符串
 * @returns 解析后的URL对象
 */
export function parseUrl(url: string): {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
} {
  // 在浏览器环境中使用URL API
  if (typeof URL !== 'undefined') {
    try {
      const parsedUrl = new URL(url);
      return {
        protocol: parsedUrl.protocol,
        host: parsedUrl.host,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        pathname: parsedUrl.pathname,
        search: parsedUrl.search,
        hash: parsedUrl.hash,
        origin: parsedUrl.origin
      };
    } catch (error) {
      // URL解析失败，使用备用方法
    }
  }

  // 备用方法：手动解析URL
  const match = url.match(/^(?:(https?:)\/\/)?([^:\/\s]+)(?::(\d+))?((?:\/[^\s/]+)*)?(?:\?([^\s#]*))?(#.*)?$/);

  if (!match) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const protocol = match[1] || '';
  const hostname = match[2] || '';
  const port = match[3] || '';
  const pathname = match[4] || '/';
  const search = match[5] ? `?${match[5]}` : '';
  const hash = match[6] || '';
  const host = port ? `${hostname}:${port}` : hostname;
  const origin = protocol ? `${protocol}//${host}` : '';

  return {
    protocol,
    host,
    hostname,
    port,
    pathname,
    search,
    hash,
    origin
  };
}

/**
 * 导出stringUtils对象，保持向后兼容
 */
export const stringUtils = {
  isEmpty,
  ensureEndsWith,
  ensureStartsWith,
  truncate,
  toCamelCase,
  toPascalCase,
  toKebabCase,
  toSnakeCase,
  format,
  escapeHtml,
  parseUrl
};