import express from 'express';
import http from 'http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { createAndConnectTestMcpServer } from './server';

/**
 * HTTP传输的MCP测试服务器
 * 提供基于HTTP的MCP测试服务
 */
export class TestHttpMcpServer {
  public url: string = '';
  public callCount: number = 0;
  private cachedCallCount: number = 0; // 添加缓存计数，防止stop时计数被意外重置
  private server: http.Server;
  private app: express.Application;
  private mcpServer: McpServer | null = null;
  private transport: StreamableHTTPServerTransport | null = null;
  private port: number;
  private initialized: boolean = false;

  /**
   * 创建HTTP测试服务器
   * @param port 端口号，默认为0(自动分配端口)
   * @param serverName 服务器名称
   */
  constructor(port = 0, private serverName = 'test-http-mcp-server') {
    this.app = express();
    this.app.use(express.json());
    this.server = http.createServer(this.app);
    this.port = port;
  }

  /**
   * 包装handleRequest函数创建时的处理
   */
  private setupHandleRequest(): void {
    if (!this.transport) return;
    
    // 包装handleRequest函数以跟踪调用
    const originalHandleRequest = this.transport.handleRequest.bind(this.transport);
    this.transport.handleRequest = async (...args) => {
      this.callCount++;
      this.cachedCallCount++; // 同时更新缓存计数
      console.info(`[TestHttpMcpServer] 处理请求 #${this.callCount}`);
      
      try {
        // 检查请求体，判断是否是初始化请求
        const request = args[2]; // 请求体通常是第三个参数
        if (request && typeof request === 'object' && 'method' in request) {
          const method = request.method as string;
          // 使用类型断言处理JSON-RPC请求对象
          const jsonRpcRequest = request as { method: string; id?: string | number | null };
          
          if (method === 'initialize' && this.initialized) {
            console.info(`[TestHttpMcpServer] 拦截到重复初始化请求，返回已初始化状态`);
            // 如果是初始化请求且已初始化，直接返回成功响应
            const response = {
              jsonrpc: '2.0',
              id: jsonRpcRequest.id || null,
              result: {
                server: { name: this.serverName, version: '1.0.0' },
                capabilities: {}
              }
            };
            // 将结果写入响应对象
            const res = args[1] as express.Response;
            res.status(200).json(response);
            return;
          } else if (method === 'initialize') {
            // 标记初始化状态
            this.initialized = true;
          }
        }
        
        // 尝试处理请求
        return await originalHandleRequest(...args);
      } catch (error: any) {
        // 检查是否是"服务器未初始化"的错误
        if (error.message && error.message.includes('Server not initialized')) {
          console.warn(`[TestHttpMcpServer] 检测到服务器未初始化错误，尝试自动初始化...`);
          
          try {
            // 重置服务器状态
            this.initialized = false;
            
            // 发送初始化请求
            const req = args[0] as express.Request;
            const res = args[1] as express.Response;
            
            // 构造初始化请求
            const initRequest = {
              jsonrpc: '2.0',
              id: 'auto-init-' + Date.now(),
              method: 'initialize',
              params: {}
            };
            
            // 处理初始化请求
            await originalHandleRequest(req, res, initRequest);
            console.info('[TestHttpMcpServer] 自动初始化成功');
            
            // 标记为已初始化
            this.initialized = true;
            
            // 现在重新处理原始请求
            return await originalHandleRequest(...args);
          } catch (initError) {
            console.error('[TestHttpMcpServer] 自动初始化失败:', initError);
            throw error; // 抛出原始错误
          }
        }
        // 其他错误直接抛出
        throw error;
      }
    };
  }

  /**
   * 启动HTTP测试服务器
   * @returns 启动后的URL
   */
  async start(): Promise<string> {
    console.info(`[TestHttpMcpServer] 正在启动HTTP MCP测试服务器: ${this.serverName}`);
    
    // 创建传输层
    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => 'test-session-id'
    });
    
    // 设置handleRequest包装
    this.setupHandleRequest();
    
    // 创建并连接MCP服务器
    this.mcpServer = await createAndConnectTestMcpServer(
      this.transport,
      this.serverName
    );
    
    // 设置HTTP路由
    this.app.post('/mcp', async (req: express.Request, res: express.Response) => {
      if (!this.transport) {
        res.status(500).send('Server transport not initialized');
        return;
      }
      await this.transport.handleRequest(req, res, req.body);
    });
    
    this.app.get('/mcp', async (req: express.Request, res: express.Response) => {
      if (!this.transport) {
        res.status(500).send('Server transport not initialized');
        return;
      }
      await this.transport.handleRequest(req, res);
    });
    
    this.app.delete('/mcp', async (req: express.Request, res: express.Response) => {
      if (!this.transport) {
        res.status(500).send('Server transport not initialized');
        return;
      }
      await this.transport.handleRequest(req, res);
    });
    
    // 启动HTTP服务器
    return new Promise<string>((resolve) => {
      this.server.listen(this.port, () => {
        const address = this.server.address() as { port: number };
        this.url = `http://localhost:${address.port}/mcp`;
        console.info(`[TestHttpMcpServer] 服务器已启动: ${this.url}`);
        resolve(this.url);
      });
    });
  }

  /**
   * 停止HTTP测试服务器
   */
  async stop(): Promise<void> {
    console.info('[TestHttpMcpServer] 正在停止服务器...');
    
    // 重置初始化状态
    this.initialized = false;
    
    if (this.mcpServer) {
      await this.mcpServer.close();
      this.mcpServer = null;
    }
    
    // 停止服务器前保存计数
    const savedCallCount = this.cachedCallCount;
    
    return new Promise<void>((resolve) => {
      this.server.close(() => {
        console.info('[TestHttpMcpServer] 服务器已停止');
        
        // 恢复计数，确保getCallCount()返回正确的值
        this.callCount = savedCallCount;
        
        resolve();
      });
    });
  }

  /**
   * 获取当前调用次数
   */
  getCallCount(): number {
    // 返回最大值，确保即使callCount被意外重置也能返回缓存的值
    return Math.max(this.callCount, this.cachedCallCount);
  }

  /**
   * 重置调用计数器
   */
  resetCallCount(): void {
    this.callCount = 0;
    this.cachedCallCount = 0;
  }
} 