import { deepClone } from '../core';

/**
 * 工厂函数类型定义
 */
export type Factory<T> = {
  /**
   * 创建一个实例
   */
  build: (overrides?: Partial<T>) => T;

  /**
   * 创建多个实例
   */
  buildList: (count: number, overrides?: Partial<T>) => T[];

  /**
   * 扩展工厂
   */
  extend: (extension: Partial<T> | ((original: T) => Partial<T>)) => Factory<T>;
};

/**
 * 创建工厂函数
 *
 * @param defaults 默认值
 * @returns 工厂实例
 */
export function createFactory<T>(defaults: T): Factory<T> {
  const factory: Factory<T> = {
    build(overrides = {}) {
      return {
        ...deepClone(defaults),
        ...overrides
      } as T;
    },

    buildList(count, overrides = {}) {
      return Array.from({ length: count }, () => factory.build(overrides));
    },

    extend(extension) {
      const extendedDefaults = typeof extension === 'function'
        ? { ...defaults, ...extension(deepClone(defaults)) }
        : { ...defaults, ...extension };

      return createFactory(extendedDefaults);
    }
  };

  return factory;
}

/**
 * 序列生成器
 *
 * @param start 起始值
 * @param step 步长
 * @returns 序列函数
 */
export function sequence(start = 1, step = 1): () => number {
  let current = start;

  return () => {
    const value = current;
    current += step;
    return value;
  };
}

/**
 * 随机布尔值生成器
 *
 * @param trueWeight 生成true的权重
 * @returns 随机布尔值函数
 */
export function randomBoolean(trueWeight = 0.5): () => boolean {
  return () => Math.random() < trueWeight;
}

/**
 * 随机整数生成器
 *
 * @param min 最小值
 * @param max 最大值
 * @returns 随机整数函数
 */
export function randomInt(min: number, max: number): () => number {
  return () => Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 随机浮点数生成器
 *
 * @param min 最小值
 * @param max 最大值
 * @param decimals 小数位数
 * @returns 随机浮点数函数
 */
export function randomFloat(min: number, max: number, decimals = 2): () => number {
  const factor = Math.pow(10, decimals);
  return () => {
    const value = Math.random() * (max - min) + min;
    return Math.round(value * factor) / factor;
  };
}

/**
 * 随机选择器
 *
 * @param items 候选项
 * @returns 随机选择函数
 */
export function randomItem<T>(items: T[]): () => T {
  return () => items[Math.floor(Math.random() * items.length)];
}

/**
 * 随机字符串生成器
 *
 * @param length 长度
 * @param charset 字符集
 * @returns 随机字符串函数
 */
export function randomString(
  length: number | (() => number) = 10,
  charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
): () => string {
  return () => {
    const len = typeof length === 'function' ? length() : length;
    let result = '';

    for (let i = 0; i < len; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset.charAt(randomIndex);
    }

    return result;
  };
}

/**
 * 随机日期生成器
 *
 * @param from 起始日期
 * @param to 结束日期
 * @returns 随机日期函数
 */
export function randomDate(
  from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  to = new Date()
): () => Date {
  const fromTime = from.getTime();
  const toTime = to.getTime();

  return () => {
    const timestamp = fromTime + Math.random() * (toTime - fromTime);
    return new Date(timestamp);
  };
}

/**
 * 随机颜色生成器
 *
 * @returns 随机颜色函数
 */
export function randomColor(): () => string {
  return () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
}

/**
 * 随机IP地址生成器
 *
 * @returns 随机IP地址函数
 */
export function randomIp(): () => string {
  return () => {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
  };
}

/**
 * 随机UUID生成器
 *
 * @returns 随机UUID函数
 */
export function randomUuid(): () => string {
  return () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

/**
 * 随机邮箱生成器
 *
 * @param domains 域名列表
 * @returns 随机邮箱函数
 */
export function randomEmail(domains = ['example.com', 'test.org', 'mock.net']): () => string {
  const randomUsername = randomString(randomInt(5, 10));
  const randomDomain = randomItem(domains);

  return () => `${randomUsername().toLowerCase()}@${randomDomain()}`;
}

/**
 * 随机URL生成器
 *
 * @param protocols 协议列表
 * @param domains 域名列表
 * @returns 随机URL函数
 */
export function randomUrl(
  protocols = ['http', 'https'],
  domains = ['example.com', 'test.org', 'mock.net']
): () => string {
  const randomProtocol = randomItem(protocols);
  const randomDomain = randomItem(domains);
  const randomPath = randomString(randomInt(0, 3));

  return () => {
    const protocol = randomProtocol();
    const domain = randomDomain();
    const path = randomPath();

    return `${protocol}://${domain}${path ? '/' + path : ''}`;
  };
}

/**
 * 测试数据工厂模块
 *
 * 提供创建测试数据的基础工厂函数。
 */

// 导出文件系统工厂
export * from './file-system-factory';

// 导出HTTP客户端工厂
export * from './http-client-factory';