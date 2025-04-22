import type { DPMLDocument } from '../../types/DPMLDocument';
import type { ProcessingResult } from '../../types/ProcessingResult';
import type { ReferenceMap } from '../../types/ReferenceMap';

/**
 * 转换上下文类，负责在转换过程中维护状态
 * 提供类型安全的数据访问方法
 */
export class TransformContext {
  /**
   * 存储上下文数据的内部Map
   */
  private data: Map<string, unknown>;

  /**
   * 原始处理结果引用
   */
  private processingResult: ProcessingResult;

  /**
   * 创建上下文实例
   * @param processingResult 原始处理结果
   * @param initialData 可选的初始数据
   */
  constructor(processingResult: ProcessingResult, initialData?: Record<string, unknown>) {
    this.processingResult = processingResult;
    this.data = new Map<string, unknown>();

    // 初始化数据
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        this.data.set(key, value);
      });
    }
  }

  /**
   * 类型安全的数据存储
   * @template T 值的类型
   * @param key 存储键
   * @param value 存储值
   */
  public set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }

  /**
   * 类型安全的数据获取
   * @template T 期望的返回类型
   * @param key 获取键
   * @returns 获取的值，若不存在则返回undefined
   */
  public get<T>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  /**
   * 检查键是否存在
   * @param key 检查键
   * @returns 是否存在
   */
  public has(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * 获取原始文档
   * @returns 文档对象
   */
  public getDocument(): DPMLDocument {
    return this.processingResult.document;
  }

  /**
   * 获取引用关系
   * @returns 引用映射
   */
  public getReferences(): ReferenceMap | undefined {
    return this.processingResult.references;
  }

  /**
   * 检查文档有效性
   * @returns 是否有效
   */
  public isDocumentValid(): boolean {
    return this.processingResult.isValid;
  }

  /**
   * 获取所有结果
   * @returns 所有存储的数据
   */
  public getAllResults(): Record<string, unknown> {
    const results: Record<string, unknown> = {};

    this.data.forEach((value, key) => {
      results[key] = value;
    });

    return results;
  }
}
