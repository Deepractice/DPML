/**
 * DPML Agent 包的类型定义
 * 定义与标签和处理器相关的接口和类型
 */

// 标签相关类型
export interface AgentTagAttributes {
  /**
   * 代理标识符
   */
  id: string;
  
  /**
   * 版本号
   */
  version?: string;
  
  /**
   * 继承的代理ID
   */
  extends?: string;
  
  /**
   * 代理类型
   */
  type?: string;
  
  /**
   * 描述
   */
  description?: string;
  
  /**
   * 其他属性
   */
  [key: string]: string | undefined;
}

export interface LLMTagAttributes {
  /**
   * API类型，例如：openai、anthropic
   */
  'api-type'?: string;
  
  /**
   * API端点URL
   */
  'api-url': string;
  
  /**
   * 模型名称
   */
  'model': string;
  
  /**
   * 存储API密钥的环境变量名
   */
  'key-env'?: string;
  
  /**
   * 其他属性
   */
  [key: string]: string | undefined;
}

export interface PromptTagAttributes {
  extends?: string;
} 