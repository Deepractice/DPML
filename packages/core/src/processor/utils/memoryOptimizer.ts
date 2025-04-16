/**
 * 内存优化工具类
 *
 * 提供处理大型文档时的内存优化功能
 */

import { NodeType } from '../../types/node';

import type { Document, Node, Element } from '../../types/node';

/**
 * 声明global.gc类型
 */
declare global {
  var gc: (() => void) | undefined;
}

/**
 * 内存优化器配置选项
 */
export interface MemoryOptimizerOptions {
  /**
   * 是否启用节点池复用
   * 默认: true
   */
  enableNodePooling?: boolean;

  /**
   * 是否启用引用缓存
   * 默认: true
   */
  enableReferenceCache?: boolean;

  /**
   * 是否使用迭代代替递归进行文档遍历
   * 对大型深度嵌套文档很重要，避免栈溢出
   * 默认: true
   */
  useIterativeTraversal?: boolean;

  /**
   * 最大缓存引用数量
   * 一旦超过此数量，最早的缓存将被清除
   * 默认: 10000
   */
  maxCachedReferences?: number;
}

/**
 * 内存优化器默认选项
 */
const DEFAULT_MEMORY_OPTIMIZER_OPTIONS: Required<MemoryOptimizerOptions> = {
  enableNodePooling: true,
  enableReferenceCache: true,
  useIterativeTraversal: true,
  maxCachedReferences: 10000,
};

/**
 * 内存优化器
 *
 * 提供处理大型文档时的内存优化功能
 */
export class MemoryOptimizer {
  /**
   * 配置选项
   */
  private options: Required<MemoryOptimizerOptions>;

  /**
   * 节点池
   */
  private nodePool: Node[] = [];

  /**
   * 池中节点数量
   */
  private poolSize = 0;

  /**
   * 最大池大小
   */
  private readonly MAX_POOL_SIZE = 1000;

  /**
   * 引用缓存计数
   */
  private referenceCount = 0;

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options?: MemoryOptimizerOptions) {
    this.options = {
      ...DEFAULT_MEMORY_OPTIMIZER_OPTIONS,
      ...options,
    };
  }

  /**
   * 检查并清理内存
   *
   * 此方法可以在处理大型文档的关键点调用，帮助减少内存占用
   */
  cleanupMemory(): void {
    if (this.options.enableNodePooling) {
      // 清理节点池
      this.nodePool = [];
      this.poolSize = 0;
    }

    // 建议手动触发垃圾回收（如果可用）
    if (typeof gc !== 'undefined') {
      gc();
    }
  }

  /**
   * 获取一个节点实例，优先从池中获取
   * @param type 节点类型
   * @returns 节点实例
   */
  acquireNode(type: NodeType): Node {
    if (!this.options.enableNodePooling || this.poolSize === 0) {
      // 池为空或禁用池化，创建新节点
      return this.createNode(type);
    }

    // 从池中获取节点并重用
    const node = this.nodePool[--this.poolSize];

    // 重置节点属性
    if (node.type !== type) {
      node.type = type;
    }

    return node;
  }

  /**
   * 释放一个节点，将其返回到池中
   * @param node 要释放的节点
   */
  releaseNode(node: Node): void {
    if (
      !this.options.enableNodePooling ||
      this.poolSize >= this.MAX_POOL_SIZE
    ) {
      // 池已满或禁用池化，不处理
      return;
    }

    // 清理节点属性
    this.clearNodeProperties(node);

    // 放入池中
    this.nodePool[this.poolSize++] = node;
  }

  /**
   * 迭代遍历文档树
   *
   * 使用迭代而非递归，避免深度嵌套导致的栈溢出
   *
   * @param document 文档
   * @param visitor 访问函数
   */
  traverseDocument(document: Document, visitor: (node: Node) => void): void {
    if (!this.options.useIterativeTraversal) {
      // 如果禁用迭代遍历，使用递归
      this.traverseNode(document, visitor);

      return;
    }

    // 使用迭代方式遍历
    const stack: Node[] = [document];
    const visited = new Set<Node>();

    while (stack.length > 0) {
      const node = stack.pop()!;

      if (visited.has(node)) {
        continue;
      }

      visited.add(node);
      visitor(node);

      // 添加子节点到堆栈（从后往前，保持顺序）
      if ('children' in node && Array.isArray(node.children)) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push(node.children[i]);
        }
      }
    }
  }

  /**
   * 记录引用缓存使用
   * 如果超过最大缓存数，返回true表示应清理缓存
   */
  recordReferenceCache(): boolean {
    if (!this.options.enableReferenceCache) {
      return false;
    }

    this.referenceCount++;

    return this.referenceCount > this.options.maxCachedReferences;
  }

  /**
   * 重置引用缓存计数
   */
  resetReferenceCount(): void {
    this.referenceCount = 0;
  }

  /**
   * 递归遍历节点及其子节点（内部使用）
   * @param node 节点
   * @param visitor 访问函数
   */
  private traverseNode(node: Node, visitor: (node: Node) => void): void {
    visitor(node);

    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        this.traverseNode(child, visitor);
      }
    }
  }

  /**
   * 创建一个新节点
   * @param type 节点类型
   * @returns 节点实例
   */
  private createNode(type: NodeType): Node {
    const node: Node = { type } as any;

    // 根据类型初始化节点属性
    switch (type) {
      case NodeType.DOCUMENT:
        (node as Document).children = [];
        break;
      case NodeType.ELEMENT:
        (node as Element).tagName = '';
        (node as Element).attributes = {};
        (node as Element).children = [];
        break;
      // 可以根据需要添加其他节点类型的初始化
    }

    return node;
  }

  /**
   * 清理节点属性，准备复用
   * @param node 要清理的节点
   */
  private clearNodeProperties(node: Node): void {
    // 保留节点类型，清理其他属性
    const type = node.type;

    // 清除所有属性
    for (const key in node) {
      if (key !== 'type') {
        delete (node as any)[key];
      }
    }

    // 恢复类型
    node.type = type;
  }
}
