import 'reflect-metadata';
import { createMock } from 'ts-auto-mock';
import { ImportType } from './types';

/**
 * 创建核心模拟对象
 */
export function createCoreMock<T extends object>() {
  const coreMock = createMock<T>();
  
  // 添加NodeType类型（根据实际需要调整）
  if (typeof coreMock === 'object' && coreMock) {
    (coreMock as any).NodeType = {
      ELEMENT: 'element',
      CONTENT: 'content',
      ATTRIBUTE: 'attribute'
    };
    
    // 添加ErrorLevel枚举
    (coreMock as any).ErrorLevel = {
      INFO: 'info',
      WARNING: 'warning',
      ERROR: 'error',
      CRITICAL: 'critical'
    };
    
    // DPMLError类
    (coreMock as any).DPMLError = class DPMLError extends Error {
      code: string;
      level: string;
      details: Record<string, any>;
      cause?: Error;
      position?: {
        line?: number;
        column?: number;
        offset?: number;
      };
      
      constructor(options: any) {
        super(options.message);
        this.name = 'DPMLError';
        this.code = options.code || 'unknown-error';
        this.level = options.level || (coreMock as any).ErrorLevel.ERROR;
        this.details = options.details || {};
        this.cause = options.cause;
        this.position = options.position;
      }

      toString(): string {
        return `[${this.level.toUpperCase()}] ${this.code}: ${this.message}`;
      }
    };
    
    // 添加其他必要的属性
    (coreMock as any).TAG_TYPES = {
      AGENT: 'agent',
      LLM: 'llm',
      PROMPT: 'prompt'
    };
    
    // TagRegistry类
    (coreMock as any).TagRegistry = class TagRegistry {
      tags = new Map();
      
      registerTag(tagName: string, tagDefinition: any) {
        // 确保标签定义包含 attributes 属性
        const tag = { 
          id: tagName, 
          selfClosing: false,
          ...tagDefinition,
          attributes: {
            id: { type: 'string', required: true },
            version: { type: 'string', required: false },
            ...(tagDefinition.attributes || {})
          }
        };
        
        // 根据不同的标签类型添加特定属性
        if (tagName === 'llm') {
          tag.attributes['api-type'] = { type: 'string', required: true };
          tag.attributes['api-url'] = { type: 'string', required: false };
          tag.attributes['model'] = { type: 'string', required: false };
          tag.attributes['key-env'] = { type: 'string', required: true };
          tag.attributes['extends'] = { type: 'string', required: false };
        } else if (tagName === 'agent') {
          tag.attributes['extends'] = { type: 'string', required: false };
          tag.allowedChildren = ['llm', 'prompt'];
        } else if (tagName === 'prompt') {
          tag.attributes['extends'] = { type: 'string', required: false };
        }
        
        this.tags.set(tagName, tag);
        return this;
      }
      
      isTagRegistered(tagName: string): boolean {
        return this.tags.has(tagName);
      }
      
      getTagDefinition(tagName: string): any {
        const tag = this.tags.get(tagName);
        if (!tag) {
          throw new Error(`Tag "${tagName}" not found`);
        }
        return tag;
      }
      
      findTagById(id: string) {
        return this.tags.get(id) || { id, name: 'MockTag' };
      }
    };
    
    // AbstractTagProcessor类
    (coreMock as any).AbstractTagProcessor = class AbstractTagProcessor {
      process(element: any, context: any = {}) {
        const tagName = element.name?.toLowerCase() || 'unknown';
        
        // 为不同的标签类型准备不同的元数据
        let metadata: Record<string, any> = {
          processed: true,
          processorName: this.constructor.name
        };
        
        if (tagName === 'agent') {
          metadata.agent = {
            id: element.attributes?.id || 'test-agent',
            version: element.attributes?.version || '2.0',
            extends: element.attributes?.extends,
            hasLLM: true,
            hasPrompt: true
          };
        } else if (tagName === 'llm') {
          metadata.llm = {
            apiType: element.attributes?.['api-type'] || 'openai',
            apiUrl: element.attributes?.['api-url'] || 'https://api.openai.com/v1',
            model: element.attributes?.model || 'gpt-4-turbo',
            keyEnv: element.attributes?.['key-env'] || 'TEST_API_KEY',
            extends: element.attributes?.extends || 'base-llm'
          };
        } else if (tagName === 'prompt') {
          metadata.prompt = {
            id: element.attributes?.id || 'test-prompt',
            extends: element.attributes?.extends || 'base-prompt',
            content: (element.children?.[0]?.value || '').trim()
          };
        }
        
        return { element, metadata };
      }
    };
  }
  
  return coreMock;
}

/**
 * 手动设置核心模拟对象（不使用ts-auto-mock）
 */
export function createManualCoreMock() {
  return {
    NodeType: {
      ELEMENT: 'element',
      CONTENT: 'content',
      ATTRIBUTE: 'attribute'
    },
    ErrorLevel: {
      INFO: 'info',
      WARNING: 'warning',
      ERROR: 'error',
      CRITICAL: 'critical'
    },
    DPMLError: class DPMLError extends Error {
      code: string;
      level: string;
      details: Record<string, any>;
      cause?: Error;
      position?: {
        line?: number;
        column?: number;
        offset?: number;
      };
      
      constructor(options: any) {
        super(options.message);
        this.name = 'DPMLError';
        this.code = options.code || 'unknown-error';
        this.level = options.level || 'error';
        this.details = options.details || {};
        this.cause = options.cause;
        this.position = options.position;
      }

      toString(): string {
        return `[${this.level.toUpperCase()}] ${this.code}: ${this.message}`;
      }
    },
    TAG_TYPES: {
      AGENT: 'agent',
      LLM: 'llm',
      PROMPT: 'prompt'
    },
    TagRegistry: class TagRegistry {
      tags = new Map();
      
      registerTag(tagName: string, tagDefinition: any) {
        const tag = { 
          id: tagName, 
          selfClosing: false,
          ...tagDefinition,
          attributes: {
            id: { type: 'string', required: true },
            version: { type: 'string', required: false },
            ...(tagDefinition.attributes || {})
          }
        };
        
        if (tagName === 'llm') {
          tag.attributes['api-type'] = { type: 'string', required: true };
          tag.attributes['api-url'] = { type: 'string', required: false };
          tag.attributes['model'] = { type: 'string', required: false };
          tag.attributes['key-env'] = { type: 'string', required: true };
          tag.attributes['extends'] = { type: 'string', required: false };
        } else if (tagName === 'agent') {
          tag.attributes['extends'] = { type: 'string', required: false };
          tag.allowedChildren = ['llm', 'prompt'];
        } else if (tagName === 'prompt') {
          tag.attributes['extends'] = { type: 'string', required: false };
        }
        
        this.tags.set(tagName, tag);
        return this;
      }
      
      isTagRegistered(tagName: string): boolean {
        return this.tags.has(tagName);
      }
      
      getTagDefinition(tagName: string): any {
        const tag = this.tags.get(tagName);
        if (!tag) {
          throw new Error(`Tag "${tagName}" not found`);
        }
        return tag;
      }
      
      findTagById(id: string) {
        return this.tags.get(id) || { id, name: 'MockTag' };
      }
    },
    AbstractTagProcessor: class AbstractTagProcessor {
      process(element: any, context: any = {}) {
        const tagName = element.name?.toLowerCase() || 'unknown';
        
        let metadata: Record<string, any> = {};
        
        if (tagName === 'agent') {
          metadata = {
            processed: true,
            processorName: 'AgentTagProcessor',
            agent: {
              id: element.attributes?.id || 'test-agent',
              version: element.attributes?.version || '1.0',
              extends: element.attributes?.extends,
              hasLLM: true,
              hasPrompt: true
            }
          };
        } else if (tagName === 'llm') {
          metadata = {
            processed: true,
            processorName: 'LLMTagProcessor',
            llm: {
              apiType: element.attributes?.['api-type'] || 'openai',
              apiUrl: element.attributes?.['api-url'] || 'https://api.openai.com/v1',
              model: element.attributes?.model || 'gpt-4-turbo',
              keyEnv: element.attributes?.['key-env'] || 'TEST_API_KEY',
              extends: element.attributes?.extends || 'base-llm'
            }
          };
        } else if (tagName === 'prompt') {
          metadata = {
            processed: true,
            processorName: 'PromptTagProcessor',
            prompt: {
              id: element.attributes?.id || 'test-prompt',
              extends: element.attributes?.extends || 'base-prompt',
              content: (element.children?.[0]?.value || '').trim()
            }
          };
        }
        
        return { element, metadata };
      }
    }
  };
}

/**
 * 设置核心模拟对象
 */
export function setupCoreMock(vi: any) {
  vi.mock('@dpml/core', () => createManualCoreMock());
}

/**
 * 获取已设置的模拟对象
 */
export function getMock(moduleName: string, vi: any) {
  return vi.importMock(moduleName);
}

// 导出其他常用类型
export * from './types'; 