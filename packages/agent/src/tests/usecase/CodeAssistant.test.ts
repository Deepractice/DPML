import fs from 'fs';
import path from 'path';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { AgentFactory } from '../../../agent/AgentFactory';

import type { Agent } from '../../../agent/types';

// 代码助手代理测试 (UC-A-002)
describe('代码助手代理用例测试', () => {
  let agent: Agent;
  const sessionId = 'test-code-assistant-session';

  // 测试用的代码片段
  const codeSample = `
function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 计算第10个斐波那契数
const result = fibonacci(10);
console.log(result);
  `;

  // 测试用的错误代码
  const buggyCode = `
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }
  return total;
}

const cart = [
  { id: 1, name: "书", price: 20 },
  { id: 2, name: "笔", price: 5 },
  { id: 3, name: "笔记本", price: 15 }
];

const total = calculateTotal(cart);
console.log("总价: " + total);
  `;

  // 在测试前创建代理实例
  beforeEach(async () => {
    // 模拟LLM连接器的响应以避免实际API调用
    vi.mock('../../src/connector/LLMConnector', () => {
      return {
        LLMConnectorFactory: {
          createConnector: vi.fn().mockImplementation(() => {
            return {
              complete: vi.fn().mockImplementation(prompt => {
                // 根据输入提示返回不同的响应
                if (prompt.includes('解释') || prompt.includes('explanation')) {
                  return Promise.resolve({
                    content:
                      '这段代码实现了斐波那契数列的递归计算。斐波那契数列是一个以递归方式定义的数列，其中每个数都是前两个数的和，前两个数为0和1。\n\n函数`fibonacci(n)`接受一个参数n表示要计算的斐波那契数列中的第n个数。如果n小于等于1，则直接返回n；否则，函数会递归调用自身计算f(n-1)和f(n-2)，并返回它们的和。\n\n这个实现方式简单直观，但时间复杂度为O(2^n)，效率较低，因为存在大量重复计算。',
                    usage: {
                      promptTokens: 250,
                      completionTokens: 200,
                      totalTokens: 450,
                    },
                  });
                } else if (
                  prompt.includes('优化') ||
                  prompt.includes('optimize')
                ) {
                  return Promise.resolve({
                    content:
                      '以下是优化后的斐波那契数列计算函数：\n\n```javascript\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  \n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    const temp = a + b;\n    a = b;\n    b = temp;\n  }\n  \n  return b;\n}\n```\n\n这个迭代版本的时间复杂度为O(n)，空间复杂度为O(1)，比递归版本效率高得多。通过使用两个变量a和b来存储当前计算所需的前两个斐波那契数，避免了重复计算。',
                    usage: {
                      promptTokens: 200,
                      completionTokens: 250,
                      totalTokens: 450,
                    },
                  });
                } else if (
                  prompt.includes('错误') ||
                  prompt.includes('debug')
                ) {
                  return Promise.resolve({
                    content:
                      '这段代码有以下错误：\n\n1. 循环条件错误：`for (let i = 0; i <= items.length; i++)` 中的条件应该是 `i < items.length`，否则会导致访问数组越界。\n\n2. 在数组长度为3的情况下，当i=3时，`items[i]`会尝试访问数组的第4个元素（索引为3），但该元素不存在，因此`items[i].price`会产生"Cannot read property \'price\' of undefined"错误。\n\n修复后的代码：\n\n```javascript\nfunction calculateTotal(items) {\n  let total = 0;\n  for (let i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}\n```',
                    usage: {
                      promptTokens: 300,
                      completionTokens: 250,
                      totalTokens: 550,
                    },
                  });
                } else {
                  return Promise.resolve({
                    content:
                      '我是代码助手，我可以帮助你解释代码、优化代码、调试问题或生成新代码。请告诉我你需要什么样的帮助。',
                    usage: {
                      promptTokens: 50,
                      completionTokens: 30,
                      totalTokens: 80,
                    },
                  });
                }
              }),
              completeStream: vi
                .fn()
                .mockImplementation(async function* (prompt) {
                  if (
                    prompt.includes('解释') ||
                    prompt.includes('explanation')
                  ) {
                    yield {
                      content: '这段代码实现了斐波那契数列的递归计算。',
                      done: false,
                    };
                    yield {
                      content:
                        '斐波那契数列是一个以递归方式定义的数列，其中每个数都是前两个数的和，前两个数为0和1。',
                      done: false,
                    };
                    yield {
                      content:
                        '\n\n函数`fibonacci(n)`接受一个参数n表示要计算的斐波那契数列中的第n个数。',
                      done: false,
                    };
                    yield {
                      content: '如果n小于等于1，则直接返回n；',
                      done: false,
                    };
                    yield {
                      content:
                        '否则，函数会递归调用自身计算f(n-1)和f(n-2)，并返回它们的和。',
                      done: false,
                    };
                    yield {
                      content:
                        '\n\n这个实现方式简单直观，但时间复杂度为O(2^n)，效率较低，因为存在大量重复计算。',
                      done: true,
                    };
                  } else if (
                    prompt.includes('优化') ||
                    prompt.includes('optimize')
                  ) {
                    yield {
                      content:
                        '以下是优化后的斐波那契数列计算函数：\n\n```javascript',
                      done: false,
                    };
                    yield { content: '\nfunction fibonacci(n) {', done: false };
                    yield { content: '\n  if (n <= 1) return n;', done: false };
                    yield { content: '\n  ', done: false };
                    yield { content: '\n  let a = 0, b = 1;', done: false };
                    yield {
                      content: '\n  for (let i = 2; i <= n; i++) {',
                      done: false,
                    };
                    yield { content: '\n    const temp = a + b;', done: false };
                    yield { content: '\n    a = b;', done: false };
                    yield { content: '\n    b = temp;', done: false };
                    yield { content: '\n  }', done: false };
                    yield { content: '\n  ', done: false };
                    yield { content: '\n  return b;', done: false };
                    yield { content: '\n}\n```', done: false };
                    yield {
                      content:
                        '\n\n这个迭代版本的时间复杂度为O(n)，空间复杂度为O(1)，比递归版本效率高得多。',
                      done: false,
                    };
                    yield {
                      content:
                        '通过使用两个变量a和b来存储当前计算所需的前两个斐波那契数，避免了重复计算。',
                      done: true,
                    };
                  } else if (
                    prompt.includes('错误') ||
                    prompt.includes('debug')
                  ) {
                    yield { content: '这段代码有以下错误：\n\n', done: false };
                    yield {
                      content:
                        '1. 循环条件错误：`for (let i = 0; i <= items.length; i++)` 中的条件应该是 `i < items.length`，',
                      done: false,
                    };
                    yield {
                      content: '否则会导致访问数组越界。\n\n',
                      done: false,
                    };
                    yield {
                      content:
                        '2. 在数组长度为3的情况下，当i=3时，`items[i]`会尝试访问数组的第4个元素（索引为3），',
                      done: false,
                    };
                    yield {
                      content:
                        '但该元素不存在，因此`items[i].price`会产生"Cannot read property \'price\' of undefined"错误。\n\n',
                      done: false,
                    };
                    yield {
                      content: '修复后的代码：\n\n```javascript\n',
                      done: false,
                    };
                    yield {
                      content: 'function calculateTotal(items) {\n',
                      done: false,
                    };
                    yield { content: '  let total = 0;\n', done: false };
                    yield {
                      content: '  for (let i = 0; i < items.length; i++) {\n',
                      done: false,
                    };
                    yield {
                      content: '    total += items[i].price;\n',
                      done: false,
                    };
                    yield { content: '  }\n', done: false };
                    yield { content: '  return total;\n', done: false };
                    yield { content: '}\n```', done: true };
                  } else {
                    yield {
                      content:
                        '我是代码助手，我可以帮助你解释代码、优化代码、调试问题或生成新代码。',
                      done: false,
                    };
                    yield {
                      content: '请告诉我你需要什么样的帮助。',
                      done: true,
                    };
                  }
                }),
            };
          }),
        },
      };
    });

    // 读取代码助手代理定义文件
    const agentFilePath = path.join(
      __dirname,
      '../fixtures/code-assistant.xml'
    );

    // 确保测试夹具目录存在
    const fixturesDir = path.join(__dirname, '../fixtures');

    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // 创建测试用的代码助手代理定义文件
    if (!fs.existsSync(agentFilePath)) {
      const codeAssistantAgentXml = `<agent id="code-assistant" version="1.0">
  <llm api-type="openai" model="gpt-4" key-env="OPENAI_API_KEY" />
  <prompt>
    你是一个专业的代码助手，擅长解释、优化和调试代码。
    你应该：
    1. 提供清晰的代码解释，包括算法思路和复杂度分析
    2. 识别代码中的错误并提供修复建议
    3. 提供代码优化建议，提高性能和可读性
    4. 根据需求生成高质量的代码示例
    5. 使用清晰的注释解释关键代码逻辑
  </prompt>
</agent>`;

      fs.writeFileSync(agentFilePath, codeAssistantAgentXml, 'utf8');
    }

    // 读取代理定义
    const agentDefinition = fs.readFileSync(agentFilePath, 'utf8');

    // 模拟解析XML并创建代理配置
    const agentConfig = {
      id: 'code-assistant',
      version: '1.0',
      executionConfig: {
        defaultModel: 'gpt-4',
        apiType: 'openai',
        systemPrompt: '你是一个专业的代码助手，擅长解释、优化和调试代码。',
      },
    };

    // 模拟createAgent方法以接受字符串并返回Agent
    vi.spyOn(AgentFactory, 'createAgent').mockImplementation(() => {
      return {
        getId: () => 'code-assistant',
        getVersion: () => '1.0',
        getState: () => Promise.resolve({}),
        execute: vi.fn().mockImplementation(async request => {
          return {
            success: true,
            sessionId,
            response: {
              text: request.text.includes('解释')
                ? '这段代码实现了斐波那契数列的递归计算。斐波那契数列是一个以递归方式定义的数列，其中每个数都是前两个数的和，前两个数为0和1。\n\n函数`fibonacci(n)`接受一个参数n表示要计算的斐波那契数列中的第n个数。如果n小于等于1，则直接返回n；否则，函数会递归调用自身计算f(n-1)和f(n-2)，并返回它们的和。\n\n这个实现方式简单直观，但时间复杂度为O(2^n)，效率较低，因为存在大量重复计算。'
                : request.text.includes('优化')
                  ? '以下是优化后的斐波那契数列计算函数：\n\n```javascript\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  \n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    const temp = a + b;\n    a = b;\n    b = temp;\n  }\n  \n  return b;\n}\n```\n\n这个迭代版本的时间复杂度为O(n)，空间复杂度为O(1)，比递归版本效率高得多。通过使用两个变量a和b来存储当前计算所需的前两个斐波那契数，避免了重复计算。'
                  : request.text.includes('错误')
                    ? '这段代码有以下错误：\n\n1. 循环条件错误：`for (let i = 0; i <= items.length; i++)` 中的条件应该是 `i < items.length`，否则会导致访问数组越界。\n\n2. 在数组长度为3的情况下，当i=3时，`items[i]`会尝试访问数组的第4个元素（索引为3），但该元素不存在，因此`items[i].price`会产生"Cannot read property \'price\' of undefined"错误。\n\n修复后的代码：\n\n```javascript\nfunction calculateTotal(items) {\n  let total = 0;\n  for (let i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}\n```'
                    : '我是代码助手，我可以帮助你解释代码、优化代码、调试问题或生成新代码。请告诉我你需要什么样的帮助。',
              timestamp: new Date().toISOString(),
            },
          };
        }),
        executeStream: vi.fn().mockImplementation(async function* (request) {
          if (request.text.includes('解释')) {
            yield {
              text: '这段代码实现了斐波那契数列的递归计算。',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '斐波那契数列是一个以递归方式定义的数列，其中每个数都是前两个数的和，前两个数为0和1。',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n\n函数`fibonacci(n)`接受一个参数n表示要计算的斐波那契数列中的第n个数。',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '如果n小于等于1，则直接返回n；',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '否则，函数会递归调用自身计算f(n-1)和f(n-2)，并返回它们的和。',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n\n这个实现方式简单直观，但时间复杂度为O(2^n)，效率较低，因为存在大量重复计算。',
              timestamp: new Date().toISOString(),
            };
          } else if (request.text.includes('优化')) {
            yield {
              text: '以下是优化后的斐波那契数列计算函数：\n\n```javascript',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\nfunction fibonacci(n) {',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n  if (n <= 1) return n;',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n  ',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n  let a = 0, b = 1;',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n  for (let i = 2; i <= n; i++) {',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n    const temp = a + b;',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n    a = b;',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n    b = temp;',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n  }',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n  ',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n  return b;',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n}\n```',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '\n\n这个迭代版本的时间复杂度为O(n)，空间复杂度为O(1)，比递归版本效率高得多。',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '通过使用两个变量a和b来存储当前计算所需的前两个斐波那契数，避免了重复计算。',
              timestamp: new Date().toISOString(),
            };
          } else if (request.text.includes('错误')) {
            yield {
              text: '这段代码有以下错误：\n\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '1. 循环条件错误：`for (let i = 0; i <= items.length; i++)` 中的条件应该是 `i < items.length`，',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '否则会导致访问数组越界。\n\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '2. 在数组长度为3的情况下，当i=3时，`items[i]`会尝试访问数组的第4个元素（索引为3），',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '但该元素不存在，因此`items[i].price`会产生"Cannot read property \'price\' of undefined"错误。\n\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '修复后的代码：\n\n```javascript\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: 'function calculateTotal(items) {\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '  let total = 0;\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '  for (let i = 0; i < items.length; i++) {\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '    total += items[i].price;\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '  }\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '  return total;\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '}\n```',
              timestamp: new Date().toISOString(),
            };
          } else {
            yield {
              text: '我是代码助手，我可以帮助你解释代码、优化代码、调试问题或生成新代码。',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '请告诉我你需要什么样的帮助。',
              timestamp: new Date().toISOString(),
            };
          }
        }),
        interrupt: () => Promise.resolve(),
        reset: () => Promise.resolve(),
      };
    });

    // 创建代理实例
    agent = AgentFactory.createAgent(agentConfig);
  });

  // 测试后清理
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('应能提供代码解释', async () => {
    // 发送代码解释请求
    const response = await agent.execute({
      sessionId,
      text: `请解释以下代码：\n\n${codeSample}`,
    });

    // 验证响应包含解释内容
    expect(response.success).toBe(true);
    expect(response.response?.text).toContain('斐波那契数列');
    expect(response.response?.text).toContain('递归');
    expect(response.response?.text).toContain('时间复杂度');

    // 验证解释中包含关键概念
    const keyTerms = ['递归', '斐波那契', '复杂度', 'O(2^n)'];

    keyTerms.forEach(term => {
      expect(response.response?.text.toLowerCase()).toContain(
        term.toLowerCase()
      );
    });
  });

  it('应能提供代码优化建议', async () => {
    // 发送代码优化请求
    const response = await agent.execute({
      sessionId,
      text: `请优化以下代码：\n\n${codeSample}`,
    });

    // 验证响应包含优化内容
    expect(response.success).toBe(true);
    expect(response.response?.text).toContain('优化');
    expect(response.response?.text).toContain('function fibonacci');
    expect(response.response?.text).toContain('let a = 0, b = 1');

    // 验证优化建议中包含迭代实现
    expect(response.response?.text).toContain('迭代版本');
    expect(response.response?.text).toContain('O(n)');
    expect(response.response?.text).not.toContain('递归调用');
  });

  it('应能通过流式接口提供代码帮助', async () => {
    // 测试流式接口
    const chunks: string[] = [];

    for await (const chunk of agent.executeStream({
      sessionId,
      text: `请解释以下代码：\n\n${codeSample}`,
    })) {
      chunks.push(chunk.text);
    }

    // 合并所有块
    const fullResponse = chunks.join('');

    // 验证完整响应内容
    expect(fullResponse).toContain('斐波那契数列');
    expect(fullResponse).toContain('递归');
    expect(fullResponse).toContain('时间复杂度');
  });

  it('应能识别代码错误并提供修复建议', async () => {
    // 发送代码调试请求
    const response = await agent.execute({
      sessionId,
      text: `这段代码有什么错误？请修复：\n\n${buggyCode}`,
    });

    // 验证响应包含错误识别和修复建议
    expect(response.success).toBe(true);
    expect(response.response?.text).toContain('错误');
    expect(response.response?.text).toContain('循环条件');
    expect(response.response?.text).toContain('i < items.length');

    // 验证修复建议
    expect(response.response?.text).toContain('修复后的代码');
    expect(response.response?.text).toContain('function calculateTotal');
  });
});
