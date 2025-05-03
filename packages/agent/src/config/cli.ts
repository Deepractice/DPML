import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

import type { DomainCommandsConfig } from '@dpml/core';
import dotenv from 'dotenv';

import { createAgent } from '../api/agent';
import { replaceEnvVars } from '../api/agentenv';

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
 * 执行交互式聊天
 */
async function executeChat(actionContext: any, filePath: string, options: any): Promise<void> {
  try {
    // 加载环境变量
    loadEnvironmentVariables(options);

    console.log('\nDPML Agent Chat');
    console.log(`加载Agent配置: ${filePath}\n`);

    // 读取文件内容
    const content = await fs.readFile(filePath, 'utf-8');

    // 使用编译器解析DPML
    const config = await actionContext.getCompiler().compile(content);

    // 处理环境变量
    const processedConfig = replaceEnvVars(config);

    // 创建Agent实例
    const agent = createAgent(processedConfig);

    // 创建交互界面
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('你好，我是AI助手。有什么我可以帮你的？');

    // 交互式聊天循环
    const askQuestion = () => {
      rl.question('> ', async (input) => {
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit' || input.toLowerCase() === 'bye') {
          console.log('会话结束。');
          rl.close();

          return;
        }

        try {
          // 发送消息并获取响应
          const response = await agent.chat(input);

          console.log('\n' + response + '\n');
        } catch (error) {
          console.error('错误:', error instanceof Error ? error.message : String(error));
        }

        // 继续等待输入
        askQuestion();
      });
    };

    // 开始交互循环
    askQuestion();
  } catch (error) {
    console.error('错误:', error instanceof Error ? error.message : String(error));
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
      description: '启动与Agent的交互式聊天',
      args: [
        {
          name: 'filePath',
          description: 'Agent配置文件路径',
          required: true
        }
      ],
      options: [
        {
          flags: '-e, --env <KEY=VALUE...>',
          description: '设置环境变量'
        },
        {
          flags: '-f, --env-file <path>',
          description: '指定环境变量文件路径'
        },
        {
          flags: '-d, --debug',
          description: '启用调试模式'
        }
      ],
      action: executeChat
    }
  ]
};
