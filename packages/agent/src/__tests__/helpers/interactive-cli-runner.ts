import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { Writable } from 'stream';
import { once } from 'events';

/**
 * 交互式CLI会话
 * 用于测试需要用户交互的CLI命令
 */
export class InteractiveCLISession {
  private process: ChildProcess;
  private outputBuffer: string = '';
  private errorBuffer: string = '';
  private isRunning: boolean = false;

  /**
   * 创建新的交互式CLI会话
   * 
   * @param command 要执行的命令（如 'agent chat'）
   * @param args 命令参数
   */
  constructor(command: string, args: string[] = []) {
    const binPath = path.resolve(process.cwd(), 'packages/agent/dist/bin.js');
    const cmdParts = command.split(' ');
    
    this.process = spawn('node', [binPath, ...cmdParts, ...args], {
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    this.isRunning = true;
    
    // 收集输出
    this.process.stdout?.on('data', (data) => {
      this.outputBuffer += data.toString();
    });
    
    this.process.stderr?.on('data', (data) => {
      this.errorBuffer += data.toString();
    });
    
    // 处理进程结束
    this.process.on('exit', () => {
      this.isRunning = false;
    });
  }

  /**
   * 发送输入到CLI进程
   * 
   * @param input 要发送的输入文本
   */
  async sendInput(input: string): Promise<void> {
    if (!this.isRunning || !this.process.stdin) {
      throw new Error('CLI进程已不在运行中或标准输入不可用');
    }
    
    return new Promise<void>((resolve, reject) => {
      const stdin = this.process.stdin as Writable;
      
      // 写入输入并添加换行符
      stdin.write(`${input}\n`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 等待输出中出现特定文本
   * 
   * @param text 要等待的文本
   * @param timeout 超时时间（毫秒）
   */
  async waitForOutput(text: string, timeout = 5000): Promise<boolean> {
    const startTime = Date.now();
    
    while (this.isRunning && Date.now() - startTime < timeout) {
      if (this.outputBuffer.includes(text)) {
        return true;
      }
      
      // 等待一小段时间再检查
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  }

  /**
   * 获取当前输出
   */
  getOutput(): string {
    return this.outputBuffer;
  }

  /**
   * 获取当前错误输出
   */
  getErrorOutput(): string {
    return this.errorBuffer;
  }

  /**
   * 终止CLI进程
   */
  async terminate(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    
    this.process.kill();
    this.isRunning = false;
    
    // 等待进程真正结束
    if (this.process.exitCode === null) {
      await once(this.process, 'exit');
    }
  }
} 