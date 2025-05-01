/**
 * 领域DPML接口，提供编译和命令行功能的统一接口
 * @template T 编译后的领域对象类型
 */
export interface DomainDPML<T> {
  /**
   * 领域编译器实例
   * 提供DPML编译与配置管理功能
   */
  compiler: DomainCompiler<T>;

  /**
   * 领域CLI实例
   * 提供命令行交互功能
   */
  cli: CLI;
}

// 导入相关类型，确保DomainDPML接口可以被正确编译
import type { CLI } from './CLI';
import type { DomainCompiler } from './DomainCompiler';
