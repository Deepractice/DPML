/**
 * 关系处理转换器
 * 执行组件，实现关系处理逻辑
 */

import type { Transformer, TransformContext, RelationConfig } from '../../../types';

/**
 * 关系处理转换器
 * 处理元素间的关系和引用
 */
export class RelationProcessorTransformer<TInput, TOutput> implements Transformer<TInput, TOutput> {
  /**
   * 转换器名称
   */
  public name: string = 'relationProcessor';

  /**
   * 转换器描述
   */
  public description: string = '处理元素间的关系和引用';

  /**
   * 转换器类型
   */
  public type: string = 'relation';

  /**
   * 节点选择器
   */
  private nodeSelector: string;

  /**
   * 关系配置
   */
  private relationConfig: RelationConfig;

  /**
   * 构造函数
   * @param nodeSelector 节点选择器
   * @param relationConfig 关系配置
   */
  constructor(nodeSelector: string, relationConfig: RelationConfig) {
    this.nodeSelector = nodeSelector;
    this.relationConfig = relationConfig;
  }

  /**
   * 执行关系处理转换
   * @param input 输入数据
   * @param context 转换上下文
   * @returns 转换后的输出
   */
  transform(input: TInput, context: TransformContext): TOutput {
    try {
      // 获取文档
      const document = context.getDocument();

      if (!document) {
        // 添加警告并返回空结果
        this.addWarning(context, 'document_not_found', '无法获取文档');

        return {} as TOutput;
      }

      // 查找所有匹配节点选择器的节点
      const nodes = document.rootNode ? this.findNodes(document.rootNode, this.nodeSelector) : [];

      if (nodes.length === 0) {
        this.addWarning(context, 'no_matching_nodes', `未找到匹配选择器 "${this.nodeSelector}" 的节点`);

        return {} as TOutput;
      }

      // 处理关系
      const relations = this.processRelations(nodes, this.relationConfig);

      // 构建结果
      const result = {
        nodes: nodes.map(node => this.extractNodeInfo(node)),
        relations,
        config: this.relationConfig
      } as unknown as TOutput;

      // 将结果存储到上下文
      if (this.name) {
        context.set(this.name, result);
      }

      return result;
    } catch (error) {
      // 处理错误
      this.addWarning(context, 'relation_process_error', `处理关系时发生错误: ${error instanceof Error ? error.message : String(error)}`);

      return {} as TOutput;
    }
  }

  /**
   * 查找匹配选择器的节点
   * @param rootNode 根节点
   * @param selector 选择器
   * @returns 匹配的节点数组
   */
  private findNodes(rootNode: any, selector: string): any[] {
    // 简单选择器实现，真实场景中可能需要更复杂的选择器引擎
    // 这里假设selector是一个简单的标签名匹配
    const results: any[] = [];

    // 如果当前节点匹配
    if (rootNode.tagName === selector) {
      results.push(rootNode);
    }

    // 递归处理子节点
    if (rootNode.children && Array.isArray(rootNode.children)) {
      for (const child of rootNode.children) {
        results.push(...this.findNodes(child, selector));
      }
    }

    return results;
  }

  /**
   * 处理节点间的关系
   * @param nodes 节点数组
   * @param config 关系配置
   * @returns 关系数组
   */
  private processRelations(nodes: any[], config: RelationConfig): any[] {
    const relations: any[] = [];

    // 遍历所有节点处理关系
    for (const node of nodes) {
      // 获取源值
      const sourceValue = this.getNodeValue(node, config.source);

      if (sourceValue === undefined) continue;

      // 查找相关联的节点
      for (const targetNode of nodes) {
        if (node === targetNode) continue; // 跳过自身

        // 获取目标值
        const targetValue = this.getNodeValue(targetNode, config.target);

        if (targetValue === undefined) continue;

        // 如果存在关系，创建关系对象
        if (this.validateRelation(sourceValue, targetValue)) {
          relations.push({
            source: {
              id: this.getNodeId(node),
              value: sourceValue
            },
            target: {
              id: this.getNodeId(targetNode),
              value: targetValue
            },
            type: config.type || 'default'
          });
        }
      }
    }

    return relations;
  }

  /**
   * 从节点获取值
   * @param node 节点
   * @param path 路径或属性名
   * @returns 节点值
   */
  private getNodeValue(node: any, path: string): any {
    // 尝试从属性获取
    if (node.attributes && node.attributes.has(path)) {
      return node.attributes.get(path);
    }

    // 尝试从内容获取
    if (path === 'content' && node.content !== undefined) {
      return node.content;
    }

    // 尝试从计算属性获取（例如tagName）
    if (path === 'tagName' && node.tagName) {
      return node.tagName;
    }

    return undefined;
  }

  /**
   * 验证关系是否有效
   * @param sourceValue 源值
   * @param targetValue 目标值
   * @returns 是否存在有效关系
   */
  private validateRelation(sourceValue: any, targetValue: any): boolean {
    // 简单实现：只要两者都有值就认为存在关系
    // 真实场景中可能需要更复杂的关系验证逻辑
    return sourceValue !== undefined && targetValue !== undefined;
  }

  /**
   * 提取节点信息
   * @param node 节点
   * @returns 节点信息对象
   */
  private extractNodeInfo(node: any): any {
    // 提取节点基本信息
    return {
      id: this.getNodeId(node),
      tagName: node.tagName,
      attributes: this.convertMapToObject(node.attributes),
      content: node.content
    };
  }

  /**
   * 获取节点ID
   * @param node 节点
   * @returns 节点ID
   */
  private getNodeId(node: any): string {
    // 尝试使用现有ID
    if (node.attributes && node.attributes.has('id')) {
      return node.attributes.get('id');
    }

    // 生成基于节点信息的ID
    return `${node.tagName}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 将Map转换为普通对象
   * @param map Map对象
   * @returns 普通对象
   */
  private convertMapToObject(map: Map<string, any> | undefined): Record<string, any> {
    if (!map) return {};

    const obj: Record<string, any> = {};

    map.forEach((value, key) => {
      obj[key] = value;
    });

    return obj;
  }

  /**
   * 添加警告到上下文
   * @param context 转换上下文
   * @param code 警告代码
   * @param message 警告消息
   */
  private addWarning(context: TransformContext, code: string, message: string): void {
    const warnings = context.get<any[]>('warnings') || [];

    warnings.push({
      code,
      message,
      transformer: this.name,
      severity: 'medium'
    });
    context.set('warnings', warnings);
  }
}
