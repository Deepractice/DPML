import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

import type { DomainCommandsConfig } from '@dpml/core';
import dotenv from 'dotenv';
import { firstValueFrom } from 'rxjs';

import { createAgent } from '../api';
import { replaceEnvVars } from '../api/agentenv';
import type { ChatOutput } from '../types';
import { extractTextContent } from '../utils/contentHelpers';

/**
 * 加载环境变量
 */
function loadEnvironmentVariables(options: any): void {
  // 从env文件加载
  if (options.envFile) {
    const envPath = path.resolve(process.cwd(), options.envFile);

    dotenv.config({ path: envPath });
  }

  // 从命令行选项加载
  if (options.env) {
    for (const envVar of options.env) {
      const [key, value] = envVar.split('=');

      if (key && value) {
        process.env[key] = value;
      }
    }
  }
}

/**
 * 处理聊天输出（支持流式和非流式模式）
 * @param agent Agent实例
 * @param sessionId 会话ID
 * @param input 用户输入
 * @param streaming 是否使用流式输出
 */
export async function handleChat(
  agent: any,
  sessionId: string,
  input: string,
  streaming: boolean = true
): Promise<void> {
  try {
    if (streaming) {
      // 流式输出处理
      process.stdout.write('\n');

      try {
        return new Promise<void>((resolve, reject) => {
          const subscription = agent.chat(sessionId, input).subscribe({
            next: (chunk: ChatOutput) => {
              try {
                // 提取每个块的文本内容并输出
                const textContent = extractTextContent(chunk.content);

                process.stdout.write(textContent);
              } catch (err) {
                console.error(
                  '\nError:',
                  err instanceof Error ? err.message : String(err)
                );
                reject(err);
              }
            },
            error: (err: any) => {
              console.error(
                '\nError:',
                err instanceof Error ? err.message : String(err)
              );
              // 捕获所有错误并转换为 rejection
              reject(err);
            },
            complete: () => {
              process.stdout.write('\n\n'); // 输出结束添加空行
              resolve();
            },
          });

          // 返回取消订阅函数，以便可以在需要时中断处理
          return () => subscription.unsubscribe();
        });
      } catch (streamError) {
        // 捕获与订阅相关的错误
        console.error(
          '\nError:',
          streamError instanceof Error
            ? streamError.message
            : String(streamError)
        );
      }
    } else {
      // 非流式处理
      try {
        const response = (await firstValueFrom(
          agent.chat(sessionId, input)
        )) as ChatOutput;

        // 提取文本内容
        const textContent = extractTextContent(response.content);

        console.log('\n' + textContent + '\n');
      } catch (nonStreamError) {
        console.error(
          'Error:',
          nonStreamError instanceof Error
            ? nonStreamError.message
            : String(nonStreamError)
        );
      }
    }
  } catch (error) {
    // 捕获所有其他可能的错误
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * 执行交互式聊天
 */
async function executeChat(
  actionContext: any,
  filePath: string,
  options: any
): Promise<void> {
  try {
    // 加载环境变量
    loadEnvironmentVariables(options);

    console.log('\nDPML Agent Chat');
    console.log(`Loading Agent configuration: ${filePath}\n`);

    // 读取文件内容
    const content = await fs.readFile(filePath, 'utf-8');

    // 使用编译器解析DPML
    const config = await actionContext.getCompiler().compile(content);

    // 处理环境变量
    const processedConfig = replaceEnvVars(config);

    // 创建Agent实例
    const agent = createAgent(processedConfig);

    // 创建会话
    const sessionId = agent.createSession();

    // 打印会话ID
    console.log(`Session ID: ${sessionId}`);

    // 创建交互界面
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n');

    // 确定是否使用流式输出（默认启用）
    const useStream = options.stream !== false;

    // 交互式聊天循环
    const askQuestion = () => {
      rl.question('> ', async input => {
        if (
          input.toLowerCase() === 'exit' ||
          input.toLowerCase() === 'quit' ||
          input.toLowerCase() === 'bye'
        ) {
          console.log('Session ended.');
          rl.close();

          return;
        }

        // 处理聊天，使用相应的流式选项
        await handleChat(agent, sessionId, input, useStream);

        // 继续等待输入
        askQuestion();
      });
    };

    // 开始交互循环
    askQuestion();
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

/**
 * Agent CLI命令配置
 */
export const commandsConfig: DomainCommandsConfig = {
  // 包含标准validate命令
  includeStandard: true,

  // 自定义命令
  actions: [
    {
      name: 'chat',
      description: 'Start interactive chat with the Agent',
      args: [
        {
          name: 'filePath',
          description: 'Path to the Agent configuration file',
          required: true,
        },
      ],
      options: [
        {
          flags: '-e, --env <KEY=VALUE...>',
          description: 'Set environment variables',
        },
        {
          flags: '-f, --env-file <path>',
          description: 'Specify the path to the environment variable file',
        },
        {
          flags: '-d, --debug',
          description: 'Enable debug mode',
        },
        {
          flags: '-s, --stream',
          description: 'Enable streaming output mode (default enabled)',
          defaultValue: true,
        },
      ],
      action: executeChat,
    },
  ],
};
