/**
 * 流式交互式对话代理示例
 *
 * 本示例展示了如何创建一个支持流式输出的交互式对话代理，实时显示响应内容
 */

// @ts-ignore - 忽略类型定义错误
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

import { AgentFactory, AgentState } from '../../../packages/agent';

// 启用调试模式
const DEBUG = false;

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 提示用户输入
function prompt(question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// 确保会话目录存在
const sessionsDir = path.join(__dirname, 'sessions');

if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

async function main() {
  try {
    console.log('=== 流式交互式对话代理示例 ===');
    console.log('创建流式交互式对话代理...');

    // 从DPML文件创建代理
    const dpmlFilePath = path.join(__dirname, '../basic/assistant.dpml');
    const agent = await AgentFactory.createAgentFromFile(dpmlFilePath);

    console.log(`创建成功: ${agent.getId()} v${agent.getVersion()}`);

    // 创建一个会话ID
    const sessionId = `streaming-session-${Date.now()}`;

    console.log(`会话ID: ${sessionId}`);

    console.log(
      '\n开始流式交互式对话 (输入"退出"结束对话, "重置"重置会话, "状态"查看当前状态):'
    );

    let userInput = '';

    do {
      // 获取用户输入
      userInput = await prompt('\n你: ');

      // 检查特殊命令
      if (userInput.toLowerCase() === '退出') {
        break;
      } else if (userInput.toLowerCase() === '重置') {
        try {
          await agent.reset(sessionId);
          console.log('会话已重置');
          continue;
        } catch (error) {
          console.error('重置会话失败:', error);
          continue;
        }
      } else if (userInput.toLowerCase() === '状态') {
        try {
          const state = await agent.getSessionState(sessionId);

          console.log('\n当前会话状态:');
          console.log(JSON.stringify(state, null, 2));
          continue;
        } catch (error) {
          console.error('获取状态失败:', error);
          continue;
        }
      }

      try {
        // 检查当前状态，如果是错误状态，先重置
        try {
          const currentState = await agent.getSessionState(sessionId);

          if (currentState?.status === AgentState.ERROR) {
            console.log('\n检测到错误状态，正在重置会话...');
            await agent.reset(sessionId);
            console.log('会话已重置');
          }
        } catch (e) {
          // 如果会话不存在，不需要特殊处理
        }

        console.log('\n代理: ');
        process.stdout.write(''); // 确保光标在正确的位置

        // 使用流式执行方法
        let fullResponse = '';

        // 获取流式响应生成器
        const stream = agent.executeStream({
          text: userInput,
          sessionId,
        });

        // 处理流式响应
        let chunkCount = 0;

        for await (const chunk of stream) {
          // 增加调试信息
          if (DEBUG) {
            chunkCount++;
            if (chunkCount === 1) {
              console.log(`\nDEBUG: 接收到第一个响应块`);
            }

            if (chunkCount % 10 === 0) {
              console.log(`\nDEBUG: 已接收 ${chunkCount} 个响应块`);
            }
          }

          // 检查是否有错误标记
          if (chunk.isError) {
            console.log(`\n\n错误: ${chunk.text}`);
            break;
          }

          // 打印每个响应块
          process.stdout.write(chunk.text);
          fullResponse += chunk.text;
        }

        if (DEBUG) {
          console.log(`\nDEBUG: 流式响应完成，共接收 ${chunkCount} 个响应块`);
        }

        console.log('\n'); // 添加一个换行
      } catch (error) {
        console.error('执行错误:', error);

        // 尝试重置会话
        try {
          console.log('\n尝试重置会话状态...');
          await agent.reset(sessionId);
          console.log('会话已重置，请重试');
        } catch (resetError) {
          console.error(`重置会话失败: ${resetError}`);
        }
      }
    } while (userInput.toLowerCase() !== '退出');

    // 关闭命令行界面
    rl.close();
    console.log('\n对话已结束');
  } catch (error) {
    console.error('初始化错误:', error);
    rl.close();
  }
}

// 运行示例
main().catch(console.error);
