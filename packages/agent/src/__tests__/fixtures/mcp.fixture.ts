import type { Tool, InvokeToolRequest } from '../../core/mcp/pipeline/ToolCallContext';
import type { Message } from '../../core/types';
import type { ChatOutput } from '../../types';

/**
 * 模拟工具列表
 */
export const mockTools: Tool[] = [
  {
    name: 'search',
    description: '搜索互联网上的信息',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索查询词'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'calculator',
    description: '执行数学计算',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: '要计算的数学表达式'
        }
      },
      required: ['expression']
    }
  },
  {
    name: 'weather',
    description: '获取天气信息',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: '位置名称'
        },
        unit: {
          type: 'string',
          description: '温度单位',
          enum: ['celsius', 'fahrenheit']
        }
      },
      required: ['location']
    }
  },
  {
    name: 'translator',
    description: '翻译文本',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: '要翻译的文本'
        },
        targetLanguage: {
          type: 'string',
          description: '目标语言',
          enum: ['en', 'zh', 'ja', 'fr', 'de', 'es']
        }
      },
      required: ['text', 'targetLanguage']
    }
  }
];

/**
 * 模拟工具调用结果
 */
export const mockToolResults: Record<string, any> = {
  search: {
    content: [{
      type: 'text',
      text: '关于"TypeScript"的搜索结果：TypeScript是微软开发的JavaScript的超集编程语言。'
    }]
  },
  calculator: {
    content: [{
      type: 'text',
      text: '计算结果为：42'
    }]
  },
  weather: {
    content: [{
      type: 'text',
      text: '北京当前天气：晴，温度25°C，湿度40%，风力3级。'
    }]
  },
  translator: {
    content: [{
      type: 'text',
      text: '翻译结果：Hello World'
    }]
  },
  error: {
    error: {
      code: 'EXECUTION_ERROR',
      message: '工具执行失败'
    }
  }
};

/**
 * 模拟包含工具调用的LLM响应
 */
export function createMockLLMResponseWithToolCall(toolName: string, params: Record<string, any>): string {
  return `我需要使用工具来回答这个问题。
  
<function_calls>
<invoke name="${toolName}">
${Object.entries(params).map(([key, value]) => `<parameter name="${key}">${value}</parameter>`).join('\n')}
</invoke>
</function_calls>`;
}

/**
 * 创建模拟流式响应
 */
export async function* createMockStreamResponse(content: string): AsyncIterable<ChatOutput> {
  const chunks = content.split(' ');

  for (const chunk of chunks) {
    yield {
      role: 'assistant',
      content: {
        type: 'text',
        value: chunk + ' '
      }
    } as ChatOutput;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

/**
 * 模拟工具调用对象
 */
export const mockToolCalls: InvokeToolRequest[] = [
  {
    name: 'search',
    parameters: {
      query: 'TypeScript'
    }
  },
  {
    name: 'calculator',
    parameters: {
      expression: '6 * 7'
    }
  },
  {
    name: 'weather',
    parameters: {
      location: '北京',
      unit: 'celsius'
    }
  },
  {
    name: 'translator',
    parameters: {
      text: '你好世界',
      targetLanguage: 'en'
    }
  }
];

/**
 * 模拟消息历史
 */
export const mockMessages: Message[] = [
  {
    role: 'system',
    content: {
      type: 'text',
      value: '你是一个有用的AI助手。'
    }
  },
  {
    role: 'user',
    content: {
      type: 'text',
      value: '什么是TypeScript？'
    }
  }
];

/**
 * 模拟工具调用结果
 */
export const mockToolResults2: Record<string, any>[] = [
  {
    toolCall: mockToolCalls[0],
    status: 'success',
    result: '关于"TypeScript"的搜索结果：TypeScript是微软开发的JavaScript的超集编程语言。'
  },
  {
    toolCall: mockToolCalls[1],
    status: 'success',
    result: '计算结果为：42'
  },
  {
    toolCall: {
      name: 'non-existent-tool',
      parameters: {}
    },
    status: 'error',
    error: '工具不存在'
  }
];

/**
 * 创建模拟ToolCallContext
 */
export function createMockToolCallContext(options: Partial<any> = {}): any {
  return {
    messages: options.messages || [...mockMessages],
    stream: options.stream ?? false,
    response: options.response,
    tools: options.tools || [...mockTools.slice(0, 2)],
    toolCalls: options.toolCalls,
    results: options.results,
    finalResponse: options.finalResponse
  };
}
