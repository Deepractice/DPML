import type { TransformOptions } from './transformOptions';
import type { ProcessedDocument } from '../../processor/interfaces/processor';

/**
 * 转换上下文接口
 *
 * 转换上下文包含在转换过程中需要的所有信息，
 * 包括原始文档、转换选项、变量、当前路径等。
 */
export interface TransformContext {
  /**
   * 当前转换结果
   */
  output: any;

  /**
   * 原始文档
   */
  document: ProcessedDocument;

  /**
   * 转换选项
   */
  options: TransformOptions;

  /**
   * 上下文变量
   * 用于在转换过程中存储和传递数据
   */
  variables: Record<string, any>;

  /**
   * 当前路径
   * 表示在文档树中的当前位置
   */
  path: string[];

  /**
   * 父节点结果栈
   * 存储处理过的父节点结果，便于子节点访问
   */
  parentResults: any[];

  /**
   * 父上下文引用
   * 在嵌套上下文中，指向创建当前上下文的父上下文
   */
  parent?: TransformContext;

  /**
   * 子上下文集合
   * 用于存储由当前上下文创建的所有子上下文
   */
  nested?: Map<string, TransformContext>;
}
