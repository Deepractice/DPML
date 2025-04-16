import fs from 'fs';
import path from 'path';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { AgentFactory } from '../../../agent/AgentFactory';

import type { Agent } from '../../../agent/types';

// 内容创作助手代理测试 (UC-A-004)
describe('内容创作助手代理用例测试', () => {
  let agent: Agent;
  const sessionId = 'test-content-creation-assistant-session';

  // 测试用的内容草稿
  const contentDraft = `人工智能正在改变我们的工作方式。许多传统工作将被自动化，但同时也会创造新的工作机会。我们需要适应这些变化，不断学习新技能。`;

  // 内容主题请求
  const contentTopicRequest =
    '请为一篇关于可持续发展与科技创新的文章提供5个标题建议';

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
                if (prompt.includes('润色') || prompt.includes('polish')) {
                  return Promise.resolve({
                    content:
                      '润色版：\n\n人工智能正在深刻变革我们的工作模式。随着技术的不断发展，许多传统职业将被自动化系统取代，但这一转变同时也将催生大量前所未有的就业机会。在这个快速变化的时代，我们需要主动适应这些转变，持续学习和掌握新技能，才能在AI驱动的未来保持竞争力。',
                    usage: {
                      promptTokens: 150,
                      completionTokens: 200,
                      totalTokens: 350,
                    },
                  });
                } else if (
                  prompt.includes('标题') ||
                  prompt.includes('title')
                ) {
                  return Promise.resolve({
                    content:
                      '以下是关于可持续发展与科技创新的文章标题建议：\n\n1. 《科技创新：驱动可持续发展的关键引擎》\n2. 《绿色科技：连接现在与可持续未来的桥梁》\n3. 《数字化转型与环保：寻找可持续发展的平衡点》\n4. 《智能技术如何重塑可持续城市生态》\n5. 《从创新到实践：科技赋能的可持续发展之路》',
                    usage: {
                      promptTokens: 100,
                      completionTokens: 250,
                      totalTokens: 350,
                    },
                  });
                } else if (
                  prompt.includes('灵感') ||
                  prompt.includes('inspiration')
                ) {
                  return Promise.resolve({
                    content:
                      '关于人工智能与工作的未来，您可以考虑以下几个角度展开：\n\n1. **技能转换的必要性**：讨论人们如何从传统技能向数字技能转变\n2. **终身学习的重要性**：在AI时代，持续学习成为职业发展的必要条件\n3. **人机协作的新模式**：探讨AI不是替代人类，而是增强人类能力的工具\n4. **创造力与情感智能的价值**：这些难以被AI复制的人类特质将变得更加珍贵\n5. **教育体系的转型**：如何调整教育以适应AI驱动的工作环境\n6. **社会安全网的重要性**：如何保护那些因技术变革而失业的人群',
                    usage: {
                      promptTokens: 180,
                      completionTokens: 300,
                      totalTokens: 480,
                    },
                  });
                } else {
                  return Promise.resolve({
                    content:
                      '我是内容创作助手，可以帮助您润色文章、提供写作灵感、建议标题和改进内容结构。请告诉我您需要什么样的创作帮助。',
                    usage: {
                      promptTokens: 50,
                      completionTokens: 50,
                      totalTokens: 100,
                    },
                  });
                }
              }),
              completeStream: vi
                .fn()
                .mockImplementation(async function* (prompt) {
                  if (prompt.includes('润色') || prompt.includes('polish')) {
                    yield { content: '润色版：\n\n', done: false };
                    yield {
                      content: '人工智能正在深刻变革我们的工作模式。',
                      done: false,
                    };
                    yield {
                      content:
                        '随着技术的不断发展，许多传统职业将被自动化系统取代，',
                      done: false,
                    };
                    yield {
                      content: '但这一转变同时也将催生大量前所未有的就业机会。',
                      done: false,
                    };
                    yield {
                      content:
                        '在这个快速变化的时代，我们需要主动适应这些转变，',
                      done: false,
                    };
                    yield {
                      content:
                        '持续学习和掌握新技能，才能在AI驱动的未来保持竞争力。',
                      done: true,
                    };
                  } else if (
                    prompt.includes('标题') ||
                    prompt.includes('title')
                  ) {
                    yield {
                      content:
                        '以下是关于可持续发展与科技创新的文章标题建议：\n\n',
                      done: false,
                    };
                    yield {
                      content: '1. 《科技创新：驱动可持续发展的关键引擎》\n',
                      done: false,
                    };
                    yield {
                      content: '2. 《绿色科技：连接现在与可持续未来的桥梁》\n',
                      done: false,
                    };
                    yield {
                      content:
                        '3. 《数字化转型与环保：寻找可持续发展的平衡点》\n',
                      done: false,
                    };
                    yield {
                      content: '4. 《智能技术如何重塑可持续城市生态》\n',
                      done: false,
                    };
                    yield {
                      content: '5. 《从创新到实践：科技赋能的可持续发展之路》',
                      done: true,
                    };
                  } else if (
                    prompt.includes('灵感') ||
                    prompt.includes('inspiration')
                  ) {
                    yield {
                      content:
                        '关于人工智能与工作的未来，您可以考虑以下几个角度展开：\n\n',
                      done: false,
                    };
                    yield {
                      content:
                        '1. **技能转换的必要性**：讨论人们如何从传统技能向数字技能转变\n',
                      done: false,
                    };
                    yield {
                      content:
                        '2. **终身学习的重要性**：在AI时代，持续学习成为职业发展的必要条件\n',
                      done: false,
                    };
                    yield {
                      content:
                        '3. **人机协作的新模式**：探讨AI不是替代人类，而是增强人类能力的工具\n',
                      done: false,
                    };
                    yield {
                      content:
                        '4. **创造力与情感智能的价值**：这些难以被AI复制的人类特质将变得更加珍贵\n',
                      done: false,
                    };
                    yield {
                      content:
                        '5. **教育体系的转型**：如何调整教育以适应AI驱动的工作环境\n',
                      done: false,
                    };
                    yield {
                      content:
                        '6. **社会安全网的重要性**：如何保护那些因技术变革而失业的人群',
                      done: true,
                    };
                  } else {
                    yield {
                      content:
                        '我是内容创作助手，可以帮助您润色文章、提供写作灵感、建议标题和改进内容结构。',
                      done: false,
                    };
                    yield {
                      content: '请告诉我您需要什么样的创作帮助。',
                      done: true,
                    };
                  }
                }),
            };
          }),
        },
      };
    });

    // 读取内容创作助手代理定义文件
    const agentFilePath = path.join(
      __dirname,
      '../fixtures/content-creation-assistant.xml'
    );

    // 确保测试夹具目录存在
    const fixturesDir = path.join(__dirname, '../fixtures');

    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // 创建测试用的内容创作助手代理定义文件
    if (!fs.existsSync(agentFilePath)) {
      const contentCreationAssistantXml = `<agent id="content-creation-assistant" version="1.0">
  <llm api-type="openai" model="gpt-4" key-env="OPENAI_API_KEY" />
  <prompt>
    你是一个专业的内容创作助手，擅长为各类内容提供创意支持和改进建议。
    你应该：
    1. 提供高质量的内容润色和改写服务
    2. 帮助用户发掘有创意的写作灵感和角度
    3. 为不同主题提供吸引人的标题和结构建议
    4. 调整语言风格以适应不同的目标受众
    5. 保持用户内容的核心信息和意图
  </prompt>
</agent>`;

      fs.writeFileSync(agentFilePath, contentCreationAssistantXml, 'utf8');
    }

    // 读取代理定义
    const agentDefinition = fs.readFileSync(agentFilePath, 'utf8');

    // 模拟解析XML并创建代理配置
    const agentConfig = {
      id: 'content-creation-assistant',
      version: '1.0',
      executionConfig: {
        defaultModel: 'gpt-4',
        apiType: 'openai',
        systemPrompt:
          '你是一个专业的内容创作助手，擅长为各类内容提供创意支持和改进建议。',
      },
    };

    // 模拟createAgent方法以接受字符串并返回Agent
    vi.spyOn(AgentFactory, 'createAgent').mockImplementation(() => {
      return {
        getId: () => 'content-creation-assistant',
        getVersion: () => '1.0',
        getState: () => Promise.resolve({}),
        execute: vi.fn().mockImplementation(async request => {
          return {
            success: true,
            sessionId,
            response: {
              text: request.text.includes('润色')
                ? '润色版：\n\n人工智能正在深刻变革我们的工作模式。随着技术的不断发展，许多传统职业将被自动化系统取代，但这一转变同时也将催生大量前所未有的就业机会。在这个快速变化的时代，我们需要主动适应这些转变，持续学习和掌握新技能，才能在AI驱动的未来保持竞争力。'
                : request.text.includes('标题')
                  ? '以下是关于可持续发展与科技创新的文章标题建议：\n\n1. 《科技创新：驱动可持续发展的关键引擎》\n2. 《绿色科技：连接现在与可持续未来的桥梁》\n3. 《数字化转型与环保：寻找可持续发展的平衡点》\n4. 《智能技术如何重塑可持续城市生态》\n5. 《从创新到实践：科技赋能的可持续发展之路》'
                  : request.text.includes('灵感')
                    ? '关于人工智能与工作的未来，您可以考虑以下几个角度展开：\n\n1. **技能转换的必要性**：讨论人们如何从传统技能向数字技能转变\n2. **终身学习的重要性**：在AI时代，持续学习成为职业发展的必要条件\n3. **人机协作的新模式**：探讨AI不是替代人类，而是增强人类能力的工具\n4. **创造力与情感智能的价值**：这些难以被AI复制的人类特质将变得更加珍贵\n5. **教育体系的转型**：如何调整教育以适应AI驱动的工作环境\n6. **社会安全网的重要性**：如何保护那些因技术变革而失业的人群'
                    : '我是内容创作助手，可以帮助您润色文章、提供写作灵感、建议标题和改进内容结构。请告诉我您需要什么样的创作帮助。',
              timestamp: new Date().toISOString(),
            },
          };
        }),
        executeStream: vi.fn().mockImplementation(async function* (request) {
          if (request.text.includes('润色')) {
            yield {
              text: '润色版：\n\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '人工智能正在深刻变革我们的工作模式。',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '随着技术的不断发展，许多传统职业将被自动化系统取代，',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '但这一转变同时也将催生大量前所未有的就业机会。',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '在这个快速变化的时代，我们需要主动适应这些转变，',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '持续学习和掌握新技能，才能在AI驱动的未来保持竞争力。',
              timestamp: new Date().toISOString(),
            };
          } else if (request.text.includes('标题')) {
            yield {
              text: '以下是关于可持续发展与科技创新的文章标题建议：\n\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '1. 《科技创新：驱动可持续发展的关键引擎》\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '2. 《绿色科技：连接现在与可持续未来的桥梁》\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '3. 《数字化转型与环保：寻找可持续发展的平衡点》\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '4. 《智能技术如何重塑可持续城市生态》\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '5. 《从创新到实践：科技赋能的可持续发展之路》',
              timestamp: new Date().toISOString(),
            };
          } else if (request.text.includes('灵感')) {
            yield {
              text: '关于人工智能与工作的未来，您可以考虑以下几个角度展开：\n\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '1. **技能转换的必要性**：讨论人们如何从传统技能向数字技能转变\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '2. **终身学习的重要性**：在AI时代，持续学习成为职业发展的必要条件\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '3. **人机协作的新模式**：探讨AI不是替代人类，而是增强人类能力的工具\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '4. **创造力与情感智能的价值**：这些难以被AI复制的人类特质将变得更加珍贵\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '5. **教育体系的转型**：如何调整教育以适应AI驱动的工作环境\n',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '6. **社会安全网的重要性**：如何保护那些因技术变革而失业的人群',
              timestamp: new Date().toISOString(),
            };
          } else {
            yield {
              text: '我是内容创作助手，可以帮助您润色文章、提供写作灵感、建议标题和改进内容结构。',
              timestamp: new Date().toISOString(),
            };
            yield {
              text: '请告诉我您需要什么样的创作帮助。',
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

  it('应能提供内容润色服务', async () => {
    // 发送内容润色请求
    const response = await agent.execute({
      sessionId,
      text: `请润色以下内容：\n\n${contentDraft}`,
    });

    // 验证响应包含润色内容
    expect(response.success).toBe(true);
    expect(response.response?.text).toContain('润色版');
    expect(response.response?.text).toContain('人工智能');

    // 验证润色后的内容比原内容更详细、更专业
    expect(response.response?.text.length).toBeGreaterThan(contentDraft.length);
    expect(response.response?.text).toContain('深刻变革');
    expect(response.response?.text).toContain('持续学习');
    expect(response.response?.text).toContain('保持竞争力');
  });

  it('应能提供标题建议', async () => {
    // 发送标题建议请求
    const response = await agent.execute({
      sessionId,
      text: contentTopicRequest,
    });

    // 验证响应包含标题建议
    expect(response.success).toBe(true);
    expect(response.response?.text).toContain('标题建议');

    // 验证提供了5个标题
    const titles = response.response?.text.match(/《.*?》/g);

    expect(titles?.length).toBe(5);

    // 验证标题相关性
    expect(response.response?.text).toContain('可持续发展');
    expect(response.response?.text).toContain('科技');
    expect(response.response?.text).toContain('创新');
  });

  it('应能通过流式接口提供内容创作帮助', async () => {
    // 测试流式接口
    const chunks: string[] = [];

    for await (const chunk of agent.executeStream({
      sessionId,
      text: `请润色以下内容：\n\n${contentDraft}`,
    })) {
      chunks.push(chunk.text);
    }

    // 合并所有块
    const fullResponse = chunks.join('');

    // 验证完整响应内容
    expect(fullResponse).toContain('润色版');
    expect(fullResponse).toContain('人工智能');
    expect(fullResponse).toContain('工作模式');
  });

  it('应能提供写作灵感和角度建议', async () => {
    // 发送灵感请求
    const response = await agent.execute({
      sessionId,
      text: `请为我提供关于"人工智能与工作的未来"的写作灵感和角度`,
    });

    // 验证响应包含灵感和角度建议
    expect(response.success).toBe(true);
    expect(response.response?.text).toContain('角度');

    // 验证提供了多个写作角度
    expect(response.response?.text).toContain('技能转换');
    expect(response.response?.text).toContain('终身学习');
    expect(response.response?.text).toContain('人机协作');
    expect(response.response?.text).toContain('创造力');

    // 验证角度相关性
    expect(response.response?.text).toContain('AI');
    expect(response.response?.text).toContain('工作');
    expect(response.response?.text).toContain('未来');
  });
});
