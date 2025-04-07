/**
 * 内存优化器测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NodeType, Document, Element, Node } from '../../../src/types/node';
import { MemoryOptimizer } from '../../../src/processor/utils/memoryOptimizer';

describe('内存优化器', () => {
  let optimizer: MemoryOptimizer;
  
  beforeEach(() => {
    optimizer = new MemoryOptimizer();
  });
  
  it('应该正确创建优化器实例', () => {
    expect(optimizer).toBeInstanceOf(MemoryOptimizer);
  });
  
  it('应该使用节点池优化内存使用', () => {
    // 从池中获取节点
    const node1 = optimizer.acquireNode(NodeType.ELEMENT);
    expect(node1.type).toBe(NodeType.ELEMENT);
    
    // 释放节点到池中
    optimizer.releaseNode(node1);
    
    // 再次获取节点，应该是同一个实例
    const node2 = optimizer.acquireNode(NodeType.ELEMENT);
    
    // 在JavaScript中，对象是引用类型，所以如果node1和node2是同一实例，那么修改node2会影响node1
    (node2 as any).testProp = 'test';
    expect((node1 as any).testProp).toBe('test');
  });
  
  it('应该通过引用缓存记录和重置', () => {
    // 初始状态下不应该需要清理缓存
    expect(optimizer.recordReferenceCache()).toBe(false);
    
    // 模拟多次记录引用缓存
    for (let i = 0; i < 9999; i++) {
      expect(optimizer.recordReferenceCache()).toBe(false);
    }
    
    // 第10000次应该需要清理缓存
    expect(optimizer.recordReferenceCache()).toBe(true);
    
    // 重置引用计数
    optimizer.resetReferenceCount();
    
    // 重置后应该不需要清理缓存
    expect(optimizer.recordReferenceCache()).toBe(false);
  });
  
  it('应该正确清理内存', () => {
    // 创建一些节点并放入池中
    const nodes: Node[] = [];
    for (let i = 0; i < 10; i++) {
      const node = optimizer.acquireNode(NodeType.ELEMENT);
      nodes.push(node);
    }
    
    // 释放节点到池中
    nodes.forEach(node => optimizer.releaseNode(node));
    
    // 添加自定义探测属性
    (optimizer as any).probeProperty = 'memory-test';
    
    // 清理内存
    optimizer.cleanupMemory();
    
    // 探测属性应该仍然存在
    expect((optimizer as any).probeProperty).toBe('memory-test');
    
    // 但节点池应该被清空了（这里通过获取新节点来间接验证）
    const newNodes: Node[] = [];
    for (let i = 0; i < 10; i++) {
      newNodes.push(optimizer.acquireNode(NodeType.ELEMENT));
    }
    
    // 新节点不应该等于旧节点
    for (let i = 0; i < 10; i++) {
      expect(newNodes[i]).not.toBe(nodes[i]);
    }
  });
  
  it('应该使用迭代方式遍历文档树', () => {
    // 创建一个文档树
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 10, column: 1, offset: 1000 }
      }
    };
    
    // 创建根元素
    const root: Element = {
      type: NodeType.ELEMENT,
      tagName: 'root',
      attributes: { id: 'root' },
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 10, column: 1, offset: 1000 }
      }
    };
    document.children.push(root);
    
    // 添加三个子元素
    for (let i = 0; i < 3; i++) {
      const child: Element = {
        type: NodeType.ELEMENT,
        tagName: `child-${i}`,
        attributes: { id: `child-${i}` },
        children: [],
        position: {
          start: { line: i + 2, column: 1, offset: i * 100 + 100 },
          end: { line: i + 3, column: 1, offset: i * 100 + 199 }
        }
      };
      root.children.push(child);
    }
    
    // 创建访问函数模拟
    const mockVisitor = vi.fn();
    
    // 使用优化器遍历文档
    optimizer.traverseDocument(document, mockVisitor);
    
    // 验证访问函数被调用了正确的次数（文档 + 根元素 + 3个子元素 = 5）
    expect(mockVisitor).toHaveBeenCalledTimes(5);
    
    // 验证访问函数被调用的顺序
    expect(mockVisitor.mock.calls[0][0]).toBe(document);
    expect(mockVisitor.mock.calls[1][0]).toBe(root);
    
    // 验证剩余的调用都是元素
    for (let i = 2; i < 5; i++) {
      expect(mockVisitor.mock.calls[i][0].type).toBe(NodeType.ELEMENT);
    }
  });
  
  it('应该支持禁用迭代遍历', () => {
    // 创建一个禁用迭代遍历的优化器
    const nonIterativeOptimizer = new MemoryOptimizer({
      useIterativeTraversal: false
    });
    
    // 模拟递归方法
    vi.spyOn(nonIterativeOptimizer as any, 'traverseNode');
    
    // 创建一个简单文档
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 }
      }
    };
    
    // 创建模拟访问函数
    const mockVisitor = vi.fn();
    
    // 遍历文档
    nonIterativeOptimizer.traverseDocument(document, mockVisitor);
    
    // 验证递归方法被调用
    expect((nonIterativeOptimizer as any).traverseNode).toHaveBeenCalledWith(document, mockVisitor);
  });
  
  it('应该支持配置选项', () => {
    // 创建一个自定义配置的优化器
    const customOptimizer = new MemoryOptimizer({
      enableNodePooling: false,
      enableReferenceCache: false,
      useIterativeTraversal: false,
      maxCachedReferences: 100
    });
    
    // 当禁用引用缓存时，recordReferenceCache应该始终返回false
    for (let i = 0; i < 200; i++) {
      expect(customOptimizer.recordReferenceCache()).toBe(false);
    }
    
    // 测试禁用节点池
    const node1 = customOptimizer.acquireNode(NodeType.ELEMENT);
    customOptimizer.releaseNode(node1);
    const node2 = customOptimizer.acquireNode(NodeType.ELEMENT);
    
    // 由于禁用了节点池，所以node1和node2不应该是同一实例
    (node2 as any).testProp = 'test';
    expect((node1 as any).testProp).toBeUndefined();
    
    // 创建启用引用缓存的优化器
    const cachingOptimizer = new MemoryOptimizer({
      enableReferenceCache: true,
      maxCachedReferences: 5
    });
    
    // 验证引用缓存配置
    for (let i = 0; i < 5; i++) {
      expect(cachingOptimizer.recordReferenceCache()).toBe(false);
    }
    
    // 第6次应该超过maxCachedReferences
    expect(cachingOptimizer.recordReferenceCache()).toBe(true);
  });
}); 