/**
 * Agent工厂类
 * 负责创建和配置Agent实例
 */

import path from 'path';
import { Agent } from '../types';
import { AgentFactoryConfig } from './types';
import { AgentImpl } from './AgentImpl';
import { LLMConnectorFactory } from '../connector/LLMConnectorFactory';
import { getGlobalEventSystem } from '../events/DefaultEventSystem';
import { AgentStateManagerFactory } from '../state/AgentStateManagerFactory';
import { AgentMemoryFactory } from '../memory/AgentMemoryFactory';

/**
 * Agent工厂类
 * 负责根据配置创建Agent实例
 */
export class AgentFactory {
  // 缓存已创建的Agent实例
  private static agentCache = new Map<string, Agent>();

  /**
   * 创建Agent实例
   * @param configOrPath 配置对象或DPML文件路径/内容
   * @returns Agent实例
   */
  static async createAgent(configOrPath: AgentFactoryConfig | string): Promise<Agent> {
    try {
      // 1. 解析配置
      const config = await this.parseConfig(configOrPath);

      // 2. 验证配置
      this.validateConfig(config);

      // 3. 检查缓存
      const cacheKey = this.generateCacheKey(config);
      const cachedAgent = this.agentCache.get(cacheKey);
      if (cachedAgent) {
        return cachedAgent;
      }

      // 4. 创建组件
      const connector = this.createLLMConnector(config);
      const stateManager = this.createStateManager(config);
      const memory = this.createMemory(config);
      const eventSystem = this.createEventSystem();

      // 5. 初始化组件
      await stateManager.initialize();

      // 6. 创建Agent实例
      const agent = new AgentImpl({
        id: config.id,
        version: config.version,
        stateManager,
        memory,
        connector,
        eventSystem,
        executionConfig: config.executionConfig
      });

      // 7. 缓存Agent实例
      this.agentCache.set(cacheKey, agent);

      return agent;
    } catch (error) {
      // 处理错误
      throw this.handleError(error, configOrPath);
    }
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    this.agentCache.clear();
  }

  /**
   * 解析配置
   * @param configOrPath 配置对象或DPML文件路径/内容
   * @returns 解析后的配置对象
   */
  private static async parseConfig(configOrPath: AgentFactoryConfig | string): Promise<AgentFactoryConfig> {
    // 如果是配置对象，直接返回
    if (typeof configOrPath !== 'string') {
      return configOrPath;
    }

    // 如果是文件路径，加载并解析文件
    if (configOrPath.endsWith('.dpml') || configOrPath.endsWith('.xml')) {
      return this.parseFromFile(configOrPath);
    }

    // 如果是DPML内容，直接解析
    return this.parseFromContent(configOrPath);
  }

  /**
   * 从文件解析配置
   * @param filePath 文件路径
   * @returns 解析后的配置对象
   */
  private static async parseFromFile(filePath: string): Promise<AgentFactoryConfig> {
    try {
      // 读取文件内容
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');

      // 解析DPML内容
      return this.parseFromContent(content);
    } catch (error) {
      throw new Error(`解析DPML文件失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 从DPML内容解析配置
   * @param content DPML内容
   * @returns 解析后的配置对象
   */
  private static async parseFromContent(content: string): Promise<AgentFactoryConfig> {
    try {
      // 使用DPML核心包解析内容
      const { parse, process } = await import('@dpml/core');
      const parseResult = await parse(content);

      if (parseResult.errors && parseResult.errors.length > 0) {
        throw new Error(`解析DPML内容失败: ${parseResult.errors[0].message}`);
      }

      const processedDoc = await process(parseResult.ast);

      // 转换为配置对象
      return this.extractConfigFromDocument(processedDoc);
    } catch (error) {
      throw new Error(`解析DPML内容失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 从处理后的文档提取配置
   * @param document 处理后的文档
   * @returns 配置对象
   */
  private static extractConfigFromDocument(document: any): AgentFactoryConfig {
    // 查找agent元素
    const agentElement = this.findAgentElement(document);
    if (!agentElement) {
      throw new Error('DPML文档中未找到agent元素');
    }

    // 提取基本属性
    const id = agentElement.attributes?.id || 'default-agent';
    const version = agentElement.attributes?.version || '1.0';

    // 提取LLM配置
    const llmConfig = this.extractLLMConfig(agentElement);

    // 提取系统提示
    const systemPrompt = this.extractSystemPrompt(agentElement);

    // 构建配置对象
    return {
      id,
      version,
      executionConfig: {
        defaultModel: llmConfig.model,
        apiType: llmConfig.apiType,
        apiUrl: llmConfig.apiUrl,
        keyEnv: llmConfig.keyEnv,
        systemPrompt
      }
    };
  }

  /**
   * 查找agent元素
   * @param document 处理后的文档
   * @returns agent元素
   */
  private static findAgentElement(document: any): any {
    // 如果文档本身就是agent元素
    if (document.type === 'element' && document.tagName === 'agent') {
      return document;
    }

    // 如果文档是document节点，查找其子元素
    if (document.type === 'document' && Array.isArray(document.children)) {
      for (const child of document.children) {
        if (child.type === 'element' && child.tagName === 'agent') {
          return child;
        }
      }
    }

    return null;
  }

  /**
   * 提取LLM配置
   * @param agentElement agent元素
   * @returns LLM配置
   */
  private static extractLLMConfig(agentElement: any): any {
    // 查找llm元素
    const llmElement = agentElement.children.find(
      (child: any) => child.type === 'element' && child.tagName === 'llm'
    );

    if (!llmElement) {
      // 使用默认配置
      return {
        model: 'gpt-4',
        apiType: 'openai',
        apiUrl: 'https://api.openai.com/v1',
        keyEnv: 'OPENAI_API_KEY'
      };
    }

    // 提取配置
    return {
      model: llmElement.attributes?.model || 'gpt-4',
      apiType: llmElement.attributes?.['api-type'] || 'openai',
      apiUrl: llmElement.attributes?.['api-url'] || 'https://api.openai.com/v1',
      keyEnv: llmElement.attributes?.['key-env'] || 'OPENAI_API_KEY'
    };
  }

  /**
   * 提取系统提示
   * @param agentElement agent元素
   * @returns 系统提示
   */
  private static extractSystemPrompt(agentElement: any): string {
    // 查找prompt元素
    const promptElement = agentElement.children.find(
      (child: any) => child.type === 'element' && child.tagName === 'prompt'
    );

    if (!promptElement) {
      return '你是一个有帮助的助手。';
    }

    // 从元数据中获取处理后的提示词
    if (promptElement.metadata?.prompt?.processedPrompt) {
      return promptElement.metadata.prompt.processedPrompt.content;
    }

    // 提取内容
    if (Array.isArray(promptElement.children)) {
      const contentElements = promptElement.children.filter(
        (child: any) => child.type === 'content'
      );

      if (contentElements.length > 0) {
        return contentElements.map((el: any) => el.text).join('');
      }
    }

    return '你是一个有帮助的助手。';
  }

  /**
   * 验证配置对象
   * @param config 配置对象
   */
  private static validateConfig(config: AgentFactoryConfig): void {
    // 检查必填字段
    if (!config.id) {
      throw new Error('配置中必须包含id字段');
    }

    if (!config.version) {
      throw new Error('配置中必须包含version字段');
    }

    if (!config.executionConfig) {
      throw new Error('配置中必须包含executionConfig字段');
    }

    if (!config.executionConfig.defaultModel) {
      throw new Error('executionConfig中必须包含defaultModel字段');
    }

    if (!config.executionConfig.apiType) {
      throw new Error('executionConfig中必须包含apiType字段');
    }

    // 检查API类型是否支持
    const supportedApiTypes = ['openai', 'anthropic'];
    if (!supportedApiTypes.includes(config.executionConfig.apiType.toLowerCase())) {
      throw new Error(`不支持的API类型: ${config.executionConfig.apiType}，支持的类型: ${supportedApiTypes.join(', ')}`);
    }
  }

  /**
   * 生成缓存键
   * @param config 配置对象
   * @returns 缓存键
   */
  private static generateCacheKey(config: AgentFactoryConfig): string {
    return `${config.id}:${config.version}`;
  }

  /**
   * 创建LLM连接器
   * @param config 配置对象
   * @returns LLM连接器
   */
  private static createLLMConnector(config: AgentFactoryConfig): any {
    const llmConfig: any = {
      apiType: config.executionConfig.apiType,
      apiUrl: config.executionConfig.apiUrl || this.getDefaultApiUrl(config.executionConfig.apiType),
      keyEnv: config.executionConfig.keyEnv || this.getDefaultKeyEnv(config.executionConfig.apiType),
      model: config.executionConfig.defaultModel,
      systemPrompt: config.executionConfig.systemPrompt
    };

    return LLMConnectorFactory.createConnector(llmConfig);
  }

  /**
   * 创建状态管理器
   * @param config 配置对象
   * @returns 状态管理器
   */
  private static createStateManager(config: AgentFactoryConfig): any {
    const type = config.stateManagerType || 'memory';

    if (type === 'file') {
      if (!config.basePath) {
        throw new Error('使用文件状态管理器时必须提供basePath');
      }

      return AgentStateManagerFactory.createFileSystemStateManager({
        agentId: config.id,
        storageDir: path.join(config.basePath, 'state')
      });
    } else {
      return AgentStateManagerFactory.createMemoryStateManager({
        agentId: config.id
      });
    }
  }

  /**
   * 创建记忆系统
   * @param config 配置对象
   * @returns 记忆系统
   */
  private static createMemory(config: AgentFactoryConfig): any {
    const type = config.memoryType || 'memory';

    const memoryOptions: any = {
      agentId: config.id,
      type
    };

    if (type === 'file') {
      if (!config.basePath) {
        throw new Error('使用文件记忆系统时必须提供basePath');
      }

      memoryOptions.basePath = path.join(config.basePath, 'memory');
    }

    return AgentMemoryFactory.create(memoryOptions);
  }

  /**
   * 创建事件系统
   * @returns 事件系统
   */
  private static createEventSystem(): any {
    // 使用默认事件系统
    return getGlobalEventSystem();
  }

  /**
   * 获取默认API URL
   * @param apiType API类型
   * @returns 默认API URL
   */
  private static getDefaultApiUrl(apiType: string): string {
    switch (apiType.toLowerCase()) {
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'anthropic':
        return 'https://api.anthropic.com';
      default:
        throw new Error(`不支持的API类型: ${apiType}`);
    }
  }

  /**
   * 获取默认API密钥环境变量名
   * @param apiType API类型
   * @returns 默认API密钥环境变量名
   */
  private static getDefaultKeyEnv(apiType: string): string {
    switch (apiType.toLowerCase()) {
      case 'openai':
        return 'OPENAI_API_KEY';
      case 'anthropic':
        return 'ANTHROPIC_API_KEY';
      default:
        throw new Error(`不支持的API类型: ${apiType}`);
    }
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @param configOrPath 配置对象或DPML文件路径/内容
   * @returns 处理后的错误对象
   */
  private static handleError(error: any, configOrPath: AgentFactoryConfig | string): Error {
    // 如果已经是Error对象，添加上下文信息
    if (error instanceof Error) {
      error.message = `创建Agent失败: ${error.message}`;
      return error;
    }

    // 如果是字符串，创建Error对象
    if (typeof error === 'string') {
      return new Error(`创建Agent失败: ${error}`);
    }

    // 如果是其他类型，创建通用错误
    return new Error(`创建Agent失败: 未知错误`);
  }
}