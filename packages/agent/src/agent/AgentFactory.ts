/**
 * Agent工厂类
 * 负责创建和配置Agent实例
 *
 * 提供从配置对象或DPML文件创建Agent实例的功能
 * 支持缓存机制，避免重复创建相同配置的Agent
 */

import path from 'path';

import { LLMConnectorFactory } from '../connector/LLMConnectorFactory';
import { ErrorFactory } from '../errors/factory';
import { AgentErrorCode } from '../errors/types';
import { getGlobalEventSystem } from '../events';
import { AgentMemoryFactory } from '../memory/AgentMemoryFactory';
import {
  AgentStateManagerFactory,
  AgentStateManagerType,
} from '../state/AgentStateManagerFactory';

import { AgentImpl } from './AgentImpl';

import type { AgentMemoryOptions } from '../memory/types';
import type { Agent } from '../types';
import type { AgentFactoryConfig } from './types';
import type { LLMConfig } from '../connector/LLMConnectorFactory';

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
  static async createAgent(
    configOrPath: AgentFactoryConfig | string
  ): Promise<Agent> {
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
        executionConfig: config.executionConfig,
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
   * 从DPML文件创建Agent实例
   * 提供一个更直观的API来从文件创建Agent
   * @param filePath DPML文件路径
   * @returns Agent实例
   */
  static async createAgentFromFile(filePath: string): Promise<Agent> {
    return this.createAgent(filePath);
  }

  /**
   * 从DPML字符串创建Agent实例
   * 提供一个更直观的API来从字符串创建Agent
   * @param content DPML内容字符串
   * @returns Agent实例
   */
  static async createAgentFromString(content: string): Promise<Agent> {
    // 确保内容是DPML格式
    if (!content.trim().startsWith('<')) {
      throw ErrorFactory.createConfigError(
        '无效的DPML内容，应该以XML标签开头',
        AgentErrorCode.AGENT_TAG_ERROR
      );
    }

    return this.createAgent(content);
  }

  /**
   * 从配置对象创建Agent实例
   * 提供一个更直观的API来从配置对象创建Agent
   * @param config 配置对象
   * @returns Agent实例
   */
  static async createAgentFromConfig(
    config: AgentFactoryConfig
  ): Promise<Agent> {
    return this.createAgent(config);
  }

  /**
   * 创建默认Agent实例
   * 使用默认配置创建一个简单的Agent实例
   * @param options 可选的配置选项，用于覆盖默认配置
   * @returns Agent实例
   */
  static async createDefaultAgent(
    options: Partial<AgentFactoryConfig> = {}
  ): Promise<Agent> {
    // 创建默认配置
    const defaultConfig: AgentFactoryConfig = {
      id: options.id || `default-agent-${Date.now()}`,
      version: options.version || '1.0',
      stateManagerType: options.stateManagerType || 'memory',
      memoryType: options.memoryType || 'memory',
      executionConfig: {
        defaultModel: options.executionConfig?.defaultModel || 'gpt-4',
        apiType: options.executionConfig?.apiType || 'openai',
        apiUrl: options.executionConfig?.apiUrl || 'https://api.openai.com/v1',
        keyEnv: options.executionConfig?.keyEnv || 'OPENAI_API_KEY',
        systemPrompt:
          options.executionConfig?.systemPrompt || '你是一个有帮助的助手。',
        temperature: options.executionConfig?.temperature || 0.7,
        maxResponseTokens: options.executionConfig?.maxResponseTokens || 1000,
        defaultTimeout: options.executionConfig?.defaultTimeout || 60000,
      },
    };

    // 如果提供了basePath，添加到配置中
    if (options.basePath) {
      defaultConfig.basePath = options.basePath;
    }

    return this.createAgent(defaultConfig);
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    this.agentCache.clear();
  }

  /**
   * 获取指定ID的Agent实例
   * @param id Agent ID
   * @returns Agent实例，如果不存在则返回null
   */
  static getAgent(id: string): Agent | null {
    // 遍历缓存查找匹配的Agent
    for (const [cacheKey, agent] of this.agentCache.entries()) {
      if (agent.getId() === id) {
        return agent;
      }
    }

    return null;
  }

  /**
   * 检查是否存在指定ID的Agent实例
   * @param id Agent ID
   * @returns 是否存在
   */
  static hasAgent(id: string): boolean {
    return this.getAgent(id) !== null;
  }

  /**
   * 列出所有已创建的Agent实例
   * @returns Agent实例数组
   */
  static listAgents(): Agent[] {
    return Array.from(this.agentCache.values());
  }

  /**
   * 移除指定ID的Agent实例
   * @param id Agent ID
   * @returns 是否成功移除
   */
  static removeAgent(id: string): boolean {
    const agent = this.getAgent(id);

    if (!agent) {
      return false;
    }

    // 找到对应的缓存键
    for (const [cacheKey, cachedAgent] of this.agentCache.entries()) {
      if (cachedAgent === agent) {
        this.agentCache.delete(cacheKey);

        return true;
      }
    }

    return false;
  }

  /**
   * 解析配置
   * @param configOrPath 配置对象或DPML文件路径/内容
   * @returns 解析后的配置对象
   */
  private static async parseConfig(
    configOrPath: AgentFactoryConfig | string
  ): Promise<AgentFactoryConfig> {
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
  private static async parseFromFile(
    filePath: string
  ): Promise<AgentFactoryConfig> {
    try {
      // 读取文件内容
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');

      // 解析DPML内容
      return this.parseFromContent(content);
    } catch (error) {
      // 如果是文件系统错误
      if (error.code && error.code.startsWith('E')) {
        // Node.js 文件系统错误代码都以E开头
        throw ErrorFactory.createConfigError(
          `读取DPML文件失败: ${error.message}`,
          AgentErrorCode.EXECUTION_ERROR,
          { cause: error }
        );
      }

      // 其他错误直接传递
      throw error;
    }
  }

  /**
   * 从DPML内容解析配置
   * @param content DPML内容
   * @returns 解析后的配置对象
   */
  private static async parseFromContent(
    content: string
  ): Promise<AgentFactoryConfig> {
    try {
      console.log('DEBUG: 开始解析DPML内容...');
      console.log('DEBUG: DPML内容长度:', content.length);
      console.log('DEBUG: DPML内容预览:', content.substring(0, 200));

      // 使用DPML核心包解析内容
      const { parse, process } = await import('@dpml/core');
      const parseResult = await parse(content);

      console.log('DEBUG: 解析结果:', parseResult.errors ? '有错误' : '无错误');
      if (parseResult.errors && parseResult.errors.length > 0) {
        console.log('DEBUG: 解析错误:', parseResult.errors);
        throw ErrorFactory.createTagError(
          `解析DPML内容失败: ${parseResult.errors[0].message}`,
          AgentErrorCode.AGENT_TAG_ERROR,
          { position: parseResult.errors[0].position }
        );
      }

      console.log('DEBUG: 解析AST结构:');
      console.log(JSON.stringify(parseResult.ast, null, 2));

      const processedDoc = await process(parseResult.ast);

      console.log('DEBUG: 处理后文档:');
      console.log(JSON.stringify(processedDoc, null, 2));

      // 提取配置
      return this.extractConfigFromDocument(processedDoc);
    } catch (error) {
      // 如果已经是TagError，直接抛出
      if (error.code === AgentErrorCode.AGENT_TAG_ERROR) {
        throw error;
      }

      throw ErrorFactory.createTagError(
        `解析DPML内容失败: ${error instanceof Error ? error.message : String(error)}`,
        AgentErrorCode.AGENT_TAG_ERROR,
        { cause: error }
      );
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
        systemPrompt,
      },
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
        keyEnv: 'OPENAI_API_KEY',
      };
    }

    // 提取配置
    return {
      model: llmElement.attributes?.model || 'gpt-4',
      apiType: llmElement.attributes?.['api-type'] || 'openai',
      apiUrl: llmElement.attributes?.['api-url'] || 'https://api.openai.com/v1',
      keyEnv: llmElement.attributes?.['key-env'] || 'OPENAI_API_KEY',
    };
  }

  /**
   * 提取系统提示
   * @param agentElement agent元素
   * @returns 系统提示
   */
  private static extractSystemPrompt(agentElement: any): string {
    console.log('DEBUG: 开始提取系统提示词...');
    console.log('DEBUG: agent元素类型:', typeof agentElement);
    console.log('DEBUG: agent元素结构:', JSON.stringify(agentElement, null, 2));

    // 查找prompt元素
    const promptElement = agentElement.children.find(
      (child: any) => child.type === 'element' && child.tagName === 'prompt'
    );

    if (!promptElement) {
      console.log('DEBUG: 未找到prompt元素，使用默认提示词');

      return '你是一个有帮助的助手。';
    }

    console.log(
      'DEBUG: 找到prompt元素:',
      JSON.stringify(promptElement, null, 2)
    );

    // 检查是否有元数据中的处理后提示词
    if (promptElement.metadata?.prompt?.processedPrompt) {
      console.log('DEBUG: 使用元数据中的处理后提示词');

      return promptElement.metadata.prompt.processedPrompt.content;
    }

    // 直接检查提示词的文本内容
    if (promptElement.content) {
      console.log(
        'DEBUG: 直接使用prompt元素的content属性:',
        promptElement.content
      );

      return promptElement.content;
    }

    // 检查value属性
    if (promptElement.value) {
      console.log('DEBUG: 使用prompt元素的value属性:', promptElement.value);

      return promptElement.value;
    }

    // 提取内容元素并合并文本
    if (Array.isArray(promptElement.children)) {
      console.log(
        'DEBUG: prompt包含子元素数量:',
        promptElement.children.length
      );

      // 先检查是否有text属性
      if (promptElement.text) {
        console.log('DEBUG: 使用prompt元素的text属性:', promptElement.text);

        return promptElement.text;
      }

      // 查找content类型的子元素
      const contentElements = promptElement.children.filter(
        (child: any) => child.type === 'content' || child.type === 'text'
      );

      console.log('DEBUG: 找到内容元素数量:', contentElements.length);
      console.log(
        'DEBUG: 内容元素详情:',
        JSON.stringify(contentElements, null, 2)
      );

      if (contentElements.length > 0) {
        // 使用text或value属性
        const extractedPrompt = contentElements
          .map((el: any) => {
            // 检查可能的属性
            const textContent = el.text || el.value || el.content || '';

            console.log('DEBUG: 内容元素的内容:', textContent);

            return textContent;
          })
          .join('');

        console.log('DEBUG: 提取到的提示词:', extractedPrompt);

        return extractedPrompt;
      }

      // 如果没有内容元素，但是有任何子元素，试图从所有子元素提取文本
      const allText = promptElement.children
        .map((child: any) => {
          console.log(
            'DEBUG: 子元素类型:',
            child.type,
            '内容属性:',
            Object.keys(child).filter(key =>
              ['text', 'value', 'content'].includes(key)
            )
          );

          return child.value || child.text || child.content || '';
        })
        .join('');

      if (allText) {
        console.log('DEBUG: 从所有子元素提取的文本:', allText);

        return allText;
      }
    }

    // 检查attributes里是否有文本内容
    if (promptElement.attributes && promptElement.attributes.content) {
      console.log(
        'DEBUG: 使用prompt元素attributes中的content:',
        promptElement.attributes.content
      );

      return promptElement.attributes.content;
    }

    console.log('DEBUG: 未能提取到提示词内容，使用默认提示词');

    return '你是一个有帮助的助手。';
  }

  /**
   * 验证配置对象
   * @param config 配置对象
   */
  private static validateConfig(config: AgentFactoryConfig): void {
    // 检查必填字段
    if (!config.id) {
      throw ErrorFactory.createConfigError(
        '配置中必须包含id字段',
        AgentErrorCode.EXECUTION_ERROR
      );
    }

    if (!config.version) {
      throw ErrorFactory.createConfigError(
        '配置中必须包含version字段',
        AgentErrorCode.EXECUTION_ERROR
      );
    }

    if (!config.executionConfig) {
      throw ErrorFactory.createConfigError(
        '配置中必须包含executionConfig字段',
        AgentErrorCode.EXECUTION_ERROR
      );
    }

    if (!config.executionConfig.defaultModel) {
      throw ErrorFactory.createConfigError(
        'executionConfig中必须包含defaultModel字段',
        AgentErrorCode.EXECUTION_ERROR
      );
    }

    if (!config.executionConfig.apiType) {
      throw ErrorFactory.createConfigError(
        'executionConfig中必须包含apiType字段',
        AgentErrorCode.EXECUTION_ERROR
      );
    }

    // 检查API类型是否支持
    const supportedApiTypes = ['openai', 'anthropic'];

    if (
      !supportedApiTypes.includes(config.executionConfig.apiType.toLowerCase())
    ) {
      throw ErrorFactory.createConfigError(
        `不支持的API类型: ${config.executionConfig.apiType}，支持的类型: ${supportedApiTypes.join(', ')}`,
        AgentErrorCode.INVALID_API_URL
      );
    }

    // 验证可选字段的值范围
    if (config.executionConfig.temperature !== undefined) {
      if (
        config.executionConfig.temperature < 0 ||
        config.executionConfig.temperature > 1
      ) {
        throw ErrorFactory.createConfigError(
          `temperature必须在0到1之间，当前值: ${config.executionConfig.temperature}`,
          AgentErrorCode.EXECUTION_ERROR
        );
      }
    }

    if (config.executionConfig.maxResponseTokens !== undefined) {
      if (config.executionConfig.maxResponseTokens <= 0) {
        throw ErrorFactory.createConfigError(
          `maxResponseTokens必须大于0，当前值: ${config.executionConfig.maxResponseTokens}`,
          AgentErrorCode.EXECUTION_ERROR
        );
      }
    }

    if (config.executionConfig.topP !== undefined) {
      if (config.executionConfig.topP < 0 || config.executionConfig.topP > 1) {
        throw ErrorFactory.createConfigError(
          `topP必须在0到1之间，当前值: ${config.executionConfig.topP}`,
          AgentErrorCode.EXECUTION_ERROR
        );
      }
    }
  }

  /**
   * 生成缓存键
   * @param config 配置对象
   * @returns 缓存键
   */
  private static generateCacheKey(config: AgentFactoryConfig): string {
    // 使用更多的配置信息生成缓存键，确保唯一性
    const keyParts = [
      config.id,
      config.version,
      config.executionConfig.apiType,
      config.executionConfig.defaultModel,
      config.stateManagerType || 'memory',
      config.memoryType || 'memory',
    ];

    // 如果使用文件存储，添加路径信息
    if (
      (config.stateManagerType === 'file' || config.memoryType === 'file') &&
      config.basePath
    ) {
      keyParts.push(config.basePath);
    }

    return keyParts.join(':');
  }

  /**
   * 创建LLM连接器
   * @param config 配置对象
   * @returns LLM连接器
   */
  private static createLLMConnector(config: AgentFactoryConfig): any {
    try {
      const llmConfig: LLMConfig = {
        apiType: config.executionConfig.apiType,
        apiUrl:
          config.executionConfig.apiUrl ||
          this.getDefaultApiUrl(config.executionConfig.apiType),
        keyEnv:
          config.executionConfig.keyEnv ||
          this.getDefaultKeyEnv(config.executionConfig.apiType),
        model: config.executionConfig.defaultModel,
        systemPrompt: config.executionConfig.systemPrompt,
      };

      // 添加可选的高级配置
      if (config.executionConfig.temperature !== undefined) {
        llmConfig.temperature = config.executionConfig.temperature;
      }

      if (config.executionConfig.maxResponseTokens !== undefined) {
        llmConfig.maxTokens = config.executionConfig.maxResponseTokens;
      }

      if (config.executionConfig.topP !== undefined) {
        llmConfig.topP = config.executionConfig.topP;
      }

      // 添加API版本（主要用于Anthropic）
      if (config.executionConfig.apiVersion) {
        llmConfig.apiVersion = config.executionConfig.apiVersion;
      }

      return LLMConnectorFactory.createConnector(llmConfig);
    } catch (error) {
      throw ErrorFactory.createConfigError(
        `创建LLM连接器失败: ${error instanceof Error ? error.message : String(error)}`,
        AgentErrorCode.API_CONNECTION_ERROR,
        { cause: error }
      );
    }
  }

  /**
   * 创建状态管理器
   * @param config 配置对象
   * @returns 状态管理器
   */
  private static createStateManager(config: AgentFactoryConfig): any {
    try {
      const type = config.stateManagerType || 'memory';

      if (type === 'file') {
        if (!config.basePath) {
          throw ErrorFactory.createConfigError(
            '使用文件状态管理器时必须提供basePath',
            AgentErrorCode.MISSING_ENV_VAR
          );
        }

        // 确保 AgentStateManagerFactory 存在并且方法可用
        if (
          !AgentStateManagerFactory ||
          typeof AgentStateManagerFactory.createFileSystemStateManager !==
            'function'
        ) {
          throw ErrorFactory.createStateError(
            'AgentStateManagerFactory 或其方法不可用',
            AgentErrorCode.STATE_ERROR
          );
        }

        const stateManager =
          AgentStateManagerFactory.createFileSystemStateManager({
            agentId: config.id,
            storageDir: path.join(config.basePath, 'state'),
            // 添加可选的高级配置
            defaultTimeoutMs: config.executionConfig.defaultTimeout,
            enableEvents: true,
            detectTimeouts: true,
            eventSystem: this.createEventSystem(),
          });

        // 确保返回的状态管理器有效
        if (!stateManager) {
          throw ErrorFactory.createStateError(
            '创建文件状态管理器失败: 返回了空对象',
            AgentErrorCode.STATE_ERROR
          );
        }

        return stateManager;
      } else {
        // 确保 AgentStateManagerFactory 存在并且方法可用
        if (
          !AgentStateManagerFactory ||
          typeof AgentStateManagerFactory.createMemoryStateManager !==
            'function'
        ) {
          throw ErrorFactory.createStateError(
            'AgentStateManagerFactory 或其方法不可用',
            AgentErrorCode.STATE_ERROR
          );
        }

        const stateManager = AgentStateManagerFactory.createMemoryStateManager({
          agentId: config.id,
          // 添加可选的高级配置
          defaultTimeoutMs: config.executionConfig.defaultTimeout,
          enableEvents: true,
          detectTimeouts: true,
          eventSystem: this.createEventSystem(),
        });

        // 确保返回的状态管理器有效
        if (!stateManager) {
          throw ErrorFactory.createStateError(
            '创建内存状态管理器失败: 返回了空对象',
            AgentErrorCode.STATE_ERROR
          );
        }

        return stateManager;
      }
    } catch (error) {
      throw ErrorFactory.createStateError(
        `创建状态管理器失败: ${error instanceof Error ? error.message : String(error)}`,
        AgentErrorCode.STATE_ERROR,
        { cause: error }
      );
    }
  }

  /**
   * 创建记忆系统
   * @param config 配置对象
   * @returns 记忆系统
   */
  private static createMemory(config: AgentFactoryConfig): any {
    try {
      const type = config.memoryType || 'memory';

      const memoryOptions: AgentMemoryOptions = {
        agentId: config.id,
        type,
      };

      // 添加可选的高级配置
      if (config.maxItems) {
        memoryOptions.maxItems = config.maxItems;
      }

      if (config.maxSessions) {
        memoryOptions.maxSessions = config.maxSessions;
      }

      if (type === 'file') {
        if (!config.basePath) {
          throw ErrorFactory.createConfigError(
            '使用文件记忆系统时必须提供basePath',
            AgentErrorCode.MISSING_ENV_VAR
          );
        }

        memoryOptions.basePath = path.join(config.basePath, 'memory');
      }

      return AgentMemoryFactory.create(memoryOptions);
    } catch (error) {
      throw ErrorFactory.createMemoryError(
        `创建记忆系统失败: ${error instanceof Error ? error.message : String(error)}`,
        AgentErrorCode.MEMORY_STORAGE_ERROR,
        { cause: error }
      );
    }
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
  private static handleError(
    error: any,
    configOrPath: AgentFactoryConfig | string
  ): Error {
    // 如果已经是由ErrorFactory创建的错误，直接返回
    if (error.code && Object.values(AgentErrorCode).includes(error.code)) {
      return error;
    }

    // 如果已经是Error对象，使用ErrorFactory包装
    if (error instanceof Error) {
      return ErrorFactory.createConfigError(
        `创建Agent失败: ${error.message}`,
        AgentErrorCode.EXECUTION_ERROR,
        { cause: error }
      );
    }

    // 如果是字符串，创建ConfigError
    if (typeof error === 'string') {
      return ErrorFactory.createConfigError(
        `创建Agent失败: ${error}`,
        AgentErrorCode.EXECUTION_ERROR
      );
    }

    // 如果是其他类型，创建通用错误
    return ErrorFactory.createConfigError(
      '创建Agent失败: 未知错误',
      AgentErrorCode.UNKNOWN_AGENT_ERROR
    );
  }
}
