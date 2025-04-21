import { DPMLDocument, DPMLNode, ParseOptions, SourceLocation } from '../../types';
import { XMLAdapter } from './XMLAdapter';
import { XMLNode, XMLPosition } from './types';

/**
 * DPML适配器
 * 负责将XML结构转换为DPML对象模型
 * 处理DPML特定语义，如节点索引、引用解析
 */
export class DPMLAdapter {
  /**
   * XML适配器实例
   */
  private xmlAdapter: XMLAdapter;

  /**
   * 解析配置选项
   */
  private options: ParseOptions;

  /**
   * 创建适配器并注入依赖
   * @param options 解析配置选项
   * @param xmlAdapter XML适配器实例
   */
  constructor(options: ParseOptions, xmlAdapter: XMLAdapter) {
    this.options = options;
    this.xmlAdapter = xmlAdapter;
  }

  /**
   * 解析DPML内容，构建文档对象模型
   * @param content DPML内容字符串
   * @returns DPML文档对象
   */
  public parse<T>(content: string): T {
    // TODO: 实现DPML解析逻辑
    const xmlResult = this.xmlAdapter.parse<XMLNode>(content);
    const rootNode = this.convertToDPML(xmlResult);
    
    const document: DPMLDocument = {
      rootNode,
      nodesById: this.buildNodeMap(rootNode),
      metadata: {
        sourceFileName: this.options.fileName,
        createdAt: new Date()
      }
    };
    
    return document as unknown as T;
  }

  /**
   * 异步解析DPML内容
   * @param content DPML内容字符串
   * @returns DPML文档对象Promise
   */
  public async parseAsync<T>(content: string): Promise<T> {
    // TODO: 实现异步DPML解析逻辑
    const xmlResult = await this.xmlAdapter.parseAsync<XMLNode>(content);
    const rootNode = this.convertToDPML(xmlResult);
    
    const document: DPMLDocument = {
      rootNode,
      nodesById: this.buildNodeMap(rootNode),
      metadata: {
        sourceFileName: this.options.fileName,
        createdAt: new Date()
      }
    };
    
    return document as unknown as T;
  }

  /**
   * 将XML节点转换为DPML节点
   * @param xmlNode XML节点
   * @returns DPML节点
   */
  private convertToDPML(xmlNode: XMLNode): DPMLNode {
    // TODO: 实现节点转换逻辑
    // 处理子节点
    const childNodes = xmlNode.children.map(childXml => this.convertToDPML(childXml));
    
    // 创建节点对象
    const node: DPMLNode = {
      tagName: xmlNode.name,
      attributes: new Map<string, string>(),
      children: childNodes,
      content: xmlNode.text || '',
      parent: null,
      sourceLocation: xmlNode.position ? this.createSourceLocation(xmlNode.position) : undefined
    };
    
    // 转换属性
    Object.entries(xmlNode.attributes).forEach(([key, value]) => {
      node.attributes.set(key, value);
    });
    
    // 设置父节点引用
    childNodes.forEach(childNode => {
      Object.defineProperty(childNode, 'parent', {
        value: node,
        enumerable: true
      });
    });
    
    return node;
  }

  /**
   * 构建节点ID索引
   * @param rootNode 根节点
   * @returns 节点ID索引映射
   */
  private buildNodeMap(rootNode: DPMLNode): Map<string, DPMLNode> {
    // TODO: 实现节点索引构建逻辑
    const nodeMap = new Map<string, DPMLNode>();
    
    // 递归遍历并索引节点
    const indexNode = (node: DPMLNode) => {
      const id = node.attributes.get('id');
      if (id) {
        nodeMap.set(id, node);
      }
      
      node.children.forEach(indexNode);
    };
    
    indexNode(rootNode);
    return nodeMap;
  }

  /**
   * 创建位置信息对象
   * @param position XML位置信息
   * @returns 源码位置信息
   */
  private createSourceLocation(position: XMLPosition): SourceLocation {
    return {
      startLine: position.start.line,
      startColumn: position.start.column,
      endLine: position.end.line,
      endColumn: position.end.column,
      fileName: this.options.fileName
    };
  }
} 