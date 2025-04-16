import { LogLevel, LogMeta, LogTransport } from '../core/types';
import { isNodeEnvironment } from '../core/environment';

/**
 * 文件传输选项
 */
export interface FileTransportOptions {
  /**
   * 日志文件路径
   */
  filename: string;
  
  /**
   * 是否追加到现有文件
   * @default true
   */
  append?: boolean;
  
  /**
   * 创建目录（如果不存在）
   * @default true
   */
  mkdir?: boolean;
}

/**
 * 文件传输实现（仅限Node.js环境）
 * 将日志写入到文件系统
 */
export class FileTransport implements LogTransport {
  private filename: string;
  private append: boolean;
  private mkdir: boolean;
  private fs: any = null;
  private path: any = null;
  private initialized: boolean = false;
  private stream: any = null;
  
  /**
   * 创建文件传输
   * @throws {Error} 如果不是Node.js环境
   */
  constructor(options: FileTransportOptions) {
    if (!isNodeEnvironment()) {
      throw new Error('FileTransport只能在Node.js环境中使用');
    }
    
    this.filename = options.filename;
    this.append = options.append !== false;
    this.mkdir = options.mkdir !== false;
    
    // 延迟导入Node.js模块
    this.lazyInitialize();
  }
  
  /**
   * 记录日志到文件
   */
  async log(level: LogLevel, message: string, meta: LogMeta): Promise<void> {
    if (!this.initialized) {
      await this.lazyInitialize();
    }
    
    // 检查并创建目录
    if (this.mkdir) {
      const dir = this.path.dirname(this.filename);
      if (!this.fs.existsSync(dir)) {
        this.fs.mkdirSync(dir, { recursive: true });
      }
    }
    
    // 确保流已打开
    if (!this.stream) {
      this.stream = this.fs.createWriteStream(this.filename, { 
        flags: this.append ? 'a' : 'w',
        encoding: 'utf8'
      });
    }
    
    // 写入日志，添加换行符
    return new Promise<void>((resolve, reject) => {
      const success = this.stream.write(message + '\n', 'utf8', (err: Error | null) => {
        if (err) {
          reject(err);
        } else if (success) {
          resolve();
        }
      });
      
      // 如果缓冲区已满，等待drain事件
      if (!success) {
        this.stream.once('drain', resolve);
      }
    });
  }
  
  /**
   * 返回此传输是否异步
   */
  isAsync(): boolean {
    return true;
  }
  
  /**
   * 关闭文件流
   */
  async close(): Promise<void> {
    if (this.stream) {
      return new Promise<void>((resolve, reject) => {
        this.stream.end((err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            this.stream = null;
            resolve();
          }
        });
      });
    }
  }
  
  /**
   * 延迟初始化，按需导入Node.js模块
   */
  private async lazyInitialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // 动态导入，避免在浏览器环境中出错
      this.fs = await import('fs');
      this.path = await import('path');
      this.initialized = true;
    } catch (error) {
      throw new Error(`无法导入Node.js模块: ${(error as Error).message}`);
    }
  }
} 