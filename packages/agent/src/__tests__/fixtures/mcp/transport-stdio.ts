import type { ChildProcess } from 'child_process';
import { spawn } from 'child_process';
import fs from 'fs';
import type { Readable, Writable } from 'stream';
import { PassThrough } from 'stream';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';


import { createAndConnectTestMcpServer } from './server';

/**
 * stdio传输的MCP测试服务器
 * 提供基于子进程stdio的MCP测试服务
 */
export class TestStdioMcpServer {
  public callCount: number = 0;
  private childProcess: ChildProcess | null = null;
  private mcpServer: McpServer | null = null;
  private transport: StdioServerTransport | null = null;
  private childProcessPromise: Promise<ChildProcess> | null = null;
  private isClosing: boolean = false;

  // 使用当前运行的Node可执行文件路径，而不是依赖环境PATH
  public command: string = process.execPath;
  public args: string[] = ['-e', 'console.log("MCP server mock")'];
  public env: Record<string, string> = {};

  /**
   * 创建stdio测试服务器
   * @param serverName 服务器名称
   */
  constructor(private serverName = 'test-stdio-mcp-server') {}

  /**
   * 启动stdio测试服务器
   * @param stdout 可选的输出流，默认使用进程stdout
   * @param stdin 可选的输入流，默认使用进程stdin
   * @returns 启动成功的Promise
   */
  async start(stdout?: Writable, stdin?: Readable): Promise<void> {
    console.info(`[TestStdioMcpServer] 正在启动stdio MCP测试服务器: ${this.serverName}`);

    // 创建适合传输层使用的流
    const inputStream = stdin || process.stdin;
    const outputStream = stdout || process.stdout;

    console.info('[TestStdioMcpServer] 创建传输层，使用可读写流');

    // 按照SDK文档正确创建StdioServerTransport实例
    this.transport = new StdioServerTransport(inputStream, outputStream);

    // 包装方法以跟踪调用
    const originalSend = this.transport.send.bind(this.transport);

    this.transport.send = async (message) => {
      this.callCount++;
      console.info(`[TestStdioMcpServer] 处理请求 #${this.callCount}`);

      return originalSend(message);
    };

    // 创建并连接MCP服务器
    this.mcpServer = await createAndConnectTestMcpServer(
      this.transport,
      this.serverName
    );

    // 添加错误处理 - 通过事件监听模式处理错误
    if (inputStream instanceof PassThrough) {
      inputStream.on('error', (err: Error) => {
        if (!this.isClosing) {
          console.warn(`[TestStdioMcpServer] 输入流错误: ${err.message}`);
        }
      });
    }

    if (outputStream instanceof PassThrough) {
      outputStream.on('error', (err: Error) => {
        if (!this.isClosing) {
          console.warn(`[TestStdioMcpServer] 输出流错误: ${err.message}`);
        }
      });
    }

    console.info('[TestStdioMcpServer] 服务器已启动');
  }

  /**
   * 检查命令是否存在并可执行
   * @param cmd 要检查的命令
   * @returns 是否存在并可执行
   */
  private checkCommandExists(cmd: string): boolean {
    try {
      // 检查文件是否存在且可执行
      fs.accessSync(cmd, fs.constants.X_OK);

      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 启动作为单独子进程的stdio测试服务器
   * @param command 执行命令
   * @param args 命令参数
   * @returns 启动成功的Promise
   */
  async startAsChildProcess(command?: string, args: string[] = []): Promise<ChildProcess> {
    const actualCommand = command || this.command;
    const actualArgs = args.length ? args : this.args;

    console.info(`[TestStdioMcpServer] 正在启动子进程 MCP 服务器: ${actualCommand} ${actualArgs.join(' ')}`);

    // 检查命令是否存在
    if (!this.checkCommandExists(actualCommand)) {
      console.warn(`[TestStdioMcpServer] 警告: 命令 ${actualCommand} 不存在或不可执行，使用模拟流代替`);
      // 如果命令不存在，使用PassThrough流而不是真实子进程
      const inputStream = new PassThrough();
      const outputStream = new PassThrough();

      // 为PassThrough流添加错误处理
      inputStream.on('error', (err: Error) => {
        if (!this.isClosing) {
          console.warn(`[TestStdioMcpServer] 模拟输入流错误: ${err.message}`);
        }
      });

      outputStream.on('error', (err: Error) => {
        if (!this.isClosing) {
          console.warn(`[TestStdioMcpServer] 模拟输出流错误: ${err.message}`);
        }
      });

      // 写入一些初始数据到输出流，模拟子进程启动
      outputStream.write(JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        id: 1
      }) + '\n');

      await this.start(inputStream, outputStream);

      // 创建一个带有流的模拟子进程对象
      const mockProcess = {
        stdin: inputStream,
        stdout: outputStream,
        stderr: new PassThrough(),
        kill: () => true,
        on: (_event: string, _callback: any) => {},
        removeAllListeners: () => {}
      } as unknown as ChildProcess;

      this.childProcess = mockProcess;

      return mockProcess;
    }

    // 创建子进程并处理错误
    this.childProcessPromise = new Promise((resolve, reject) => {
      try {
        // 启动子进程
        const childProcess = spawn(actualCommand, actualArgs, {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, ...this.env }
        });

        // 设置错误处理
        childProcess.on('error', (error: Error) => {
          if (!this.isClosing) {
            console.error('[TestStdioMcpServer] 子进程错误', error);
            reject(error);
          }
        });

        childProcess.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
          if (!this.isClosing && code !== 0 && code !== null) {
            console.warn(`[TestStdioMcpServer] 子进程非正常退出: 代码=${code}, 信号=${signal}`);
          }
        });

        childProcess.stderr?.on('data', (data: Buffer) => {
          console.error(`[TestStdioMcpServer stderr] ${data.toString()}`);
        });

        // 启动成功，解析Promise
        this.childProcess = childProcess;
        resolve(childProcess);
      } catch (error) {
        console.error('[TestStdioMcpServer] 启动子进程失败', error);
        reject(error);
      }
    });

    try {
      const childProcess = await this.childProcessPromise;

      // 启动服务器并连接到子进程
      await this.start(
        childProcess.stdin as Writable,
        childProcess.stdout as Readable
      );

      return childProcess;
    } catch (error) {
      console.error('[TestStdioMcpServer] 启动子进程或连接到子进程失败', error);

      // 如果启动失败，使用模拟流
      console.warn('[TestStdioMcpServer] 使用模拟流代替真实子进程');
      const inputStream = new PassThrough();
      const outputStream = new PassThrough();

      // 为备用流添加错误处理
      inputStream.on('error', (err: Error) => {
        if (!this.isClosing) {
          console.warn(`[TestStdioMcpServer] 备用输入流错误: ${err.message}`);
        }
      });

      outputStream.on('error', (err: Error) => {
        if (!this.isClosing) {
          console.warn(`[TestStdioMcpServer] 备用输出流错误: ${err.message}`);
        }
      });

      await this.start(inputStream, outputStream);

      // 创建一个带有流的模拟子进程对象
      const mockProcess = {
        stdin: inputStream,
        stdout: outputStream,
        stderr: new PassThrough(),
        kill: () => true,
        on: (_event: string, _callback: any) => {},
        removeAllListeners: () => {}
      } as unknown as ChildProcess;

      this.childProcess = mockProcess;

      return mockProcess;
    }
  }

  /**
   * 停止stdio测试服务器
   */
  async stop(): Promise<void> {
    this.isClosing = true;
    console.info('[TestStdioMcpServer] 正在停止服务器...');

    if (this.mcpServer) {
      try {
        await this.mcpServer.close();
      } catch (error) {
        console.warn('[TestStdioMcpServer] 关闭服务器时出错', error);
      }

      this.mcpServer = null;
    }

    if (this.childProcess) {
      try {
        if (typeof this.childProcess.kill === 'function') {
          this.childProcess.kill();
        }

        this.childProcess.removeAllListeners?.();
      } catch (error) {
        console.warn('[TestStdioMcpServer] 终止子进程时出错', error);
      }

      this.childProcess = null;
    }

    this.childProcessPromise = null;
    console.info('[TestStdioMcpServer] 服务器已停止');
  }

  /**
   * 获取当前调用次数
   */
  getCallCount(): number {
    return this.callCount;
  }

  /**
   * 重置调用计数器
   */
  resetCallCount(): void {
    this.callCount = 0;
  }
}
