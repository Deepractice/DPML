/**
 * 领域编译器接口，提供DPML编译与管理功能
 * @template T 编译后的领域对象类型
 */
export interface DomainCompiler<T> {
  /**
   * 编译DPML内容为领域对象
   * @param content DPML内容字符串
   * @returns 编译后的领域对象
   */
  compile(content: string): Promise<T>;

  /**
   * 扩展当前配置
   * @param extensionConfig 要合并的配置片段
   */
  extend(extensionConfig: Partial<DomainConfig>): void;

  /**
   * 获取当前架构
   * @returns 当前架构对象
   */
  getSchema(): Schema;

  /**
   * 获取当前转换器集合
   * @returns 转换器数组
   */
  getTransformers(): Array<Transformer<unknown, unknown>>;
}

// 导入相关类型，确保DomainCompiler接口可以被正确编译
import type { DomainConfig } from './DomainConfig';
import type { Schema } from './Schema';
import type { Transformer } from './Transformer';
