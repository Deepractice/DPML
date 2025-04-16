import * as fs from 'fs';
import * as path from 'path';

import { isNodeEnvironment } from '../core/environment';

import type { LogLevel, LogMeta, LogTransport } from '../core/types';

/**
 * 文件传输选项
 */
export interface FileTransportOptions {
  /**
   * 日志文件路径
   */
  filePath: string;

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

  /**
   * 自定义文件系统（用于测试）
   */
  fs?: typeof fs;

  /**
   * 自定义路径模块（用于测试）
   */
  path?: typeof path;
}

/**
 * 文件传输实现（仅限Node.js环境）
 * 将日志写入到文件系统
 */
export class FileTransport implements LogTransport {
  private filePath: string;
  private append: boolean;
  private mkdir: boolean;
  private fs: typeof fs;
  private path: typeof path;
  private stream: fs.WriteStream | null = null;

  /**
   * 创建文件传输
   * @throws {Error} 如果不是Node.js环境
   */
  constructor(options: FileTransportOptions) {
    if (!isNodeEnvironment()) {
      throw new Error('FileTransport只能在Node.js环境中使用');
    }

    this.filePath = options.filePath;
    this.append = options.append !== false;
    this.mkdir = options.mkdir !== false;

    // 使用注入的依赖或者导入模块
    this.fs = options.fs || fs;
    this.path = options.path || path;

    // 确保目录存在
    this.ensureDirectoryExists();
  }

  /**
   * 确保目录存在
   */
  private ensureDirectoryExists(): void {
    if (this.mkdir) {
      try {
        const dir = this.path.dirname(this.filePath);

        // 增加调试日志
        console.debug(`确保日志目录存在: ${dir}`);

        if (!this.fs.existsSync(dir)) {
          console.debug(`目录不存在，正在创建: ${dir}`);
          this.fs.mkdirSync(dir, { recursive: true });

          // 验证目录是否成功创建
          if (!this.fs.existsSync(dir)) {
            throw new Error(`无法创建目录: ${dir}`);
          }

          console.debug(`目录创建成功: ${dir}`);
        }
      } catch (error) {
        // 更详细的错误输出
        console.error(`创建日志目录失败:`, error);
        throw new Error(`无法创建日志目录: ${error}`);
      }
    }
  }

  /**
   * 记录日志到文件
   */
  log(level: LogLevel, message: string, meta: LogMeta): Promise<void> | void {
    // 确保流已打开
    if (!this.stream) {
      try {
        this.stream = this.fs.createWriteStream(this.filePath, {
          flags: this.append ? 'a' : 'w',
          encoding: 'utf8',
        });
      } catch (err) {
        console.error(`无法创建日志文件: ${err}`);

        return Promise.reject(err);
      }
    }

    // 写入日志，添加换行符
    return new Promise<void>((resolve, reject) => {
      const success = this.stream!.write(
        message + '\n',
        'utf8',
        (err?: Error | null) => {
          if (err) {
            reject(err);
          } else if (success) {
            resolve();
          }
        }
      );

      // 如果缓冲区已满，等待drain事件
      if (!success) {
        this.stream!.once('drain', resolve);
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
        this.stream!.end((err?: Error | null) => {
          if (err) {
            reject(err);
          } else {
            this.stream = null;
            resolve();
          }
        });
      });
    }

    return Promise.resolve();
  }
}
