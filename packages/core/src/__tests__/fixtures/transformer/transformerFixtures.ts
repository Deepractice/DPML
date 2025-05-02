/**
 * Transformer模块测试夹具
 * 提供测试用的模拟数据
 */

import type {
  ProcessingResult,
  MappingRule,
  CollectorConfig,
  DPMLDocument
} from '../../../types';

/**
 * 创建基本处理结果夹具
 */
export function createProcessingResultFixture(): ProcessingResult {
  // 创建模拟的DPMLDocument
  const document: DPMLDocument = {
    rootNode: {
      tagName: 'model',
      attributes: new Map([['id', 'test-model']]),
      children: [
        {
          tagName: 'agent',
          attributes: new Map([
            ['name', 'gpt-4'],
            ['temperature', '0.7'],
            ['max-tokens', '2048']
          ]),
          children: [],
          content: '',
          parent: null // 实际使用时需要设置正确的父节点
        },
        {
          tagName: 'prompt',
          attributes: new Map([['type', 'system']]),
          children: [],
          content: '你是一个有用的助手',
          parent: null // 实际使用时需要设置正确的父节点
        },
        {
          tagName: 'prompt',
          attributes: new Map([['type', 'user']]),
          children: [],
          content: '告诉我关于人工智能的信息',
          parent: null // 实际使用时需要设置正确的父节点
        }
      ],
      content: '',
      parent: null
    },
    metadata: { // 添加必要的元数据字段
      title: "测试文档",
      description: "用于测试的DPML文档"
    }
  };

  // 设置父节点引用（实际测试中可能需要更复杂的设置）
  document.rootNode.children.forEach(child => {
    child.parent = document.rootNode;
  });

  // 创建模拟的处理结果，符合 ProcessingResult 接口
  return {
    document: document,
    isValid: true, // 这是直接传递给 TransformContext.isDocumentValid() 的值
    references: new Map([['test-model', document.rootNode]]),
    schema: {} // 可选的 schema 对象
  };
}

/**
 * 创建结构映射规则夹具
 */
export function createMappingRulesFixture(): Array<MappingRule<unknown, unknown>> {
  return [
    { selector: 'agent', targetPath: 'parameters' },
    {
      selector: 'session[temperature]',
      targetPath: 'parameters.temperature',
      transform: (value: string) => parseFloat(value)
    },
    {
      selector: 'session[max-tokens]',
      targetPath: 'parameters.maxTokens',
      transform: (value: string) => parseInt(value, 10)
    },
    {
      selector: 'prompt[type="system"]',
      targetPath: 'systemPrompt',
      transform: (node) => {

        if (Array.isArray(node)) {
          return node.length > 0 ? node[0].content : '';
        }

        return node.content;
      }
    }
  ];
}

/**
 * 创建模板字符串夹具
 */
export function createTemplateFixture(): string {
  return `System: {{systemPrompt}}
Parameters: Temperature {{parameters.temperature}}, Max Tokens {{parameters.maxTokens}}`;
}

/**
 * 创建收集配置夹具
 */
export function createCollectorConfigFixture(): CollectorConfig {
  return {
    selector: 'prompt',
    groupBy: 'type'
  };
}

/**
 * 创建转换结果的预期输出夹具
 */
export function createExpectedOutputFixture(): Record<string, unknown> {
  return {
    parameters: {
      temperature: 0.7,
      maxTokens: 2048
    },
    systemPrompt: '你是一个有用的助手',
    prompts: {
      system: ['你是一个有用的助手'],
      user: ['告诉我关于人工智能的信息']
    }
  };
}
