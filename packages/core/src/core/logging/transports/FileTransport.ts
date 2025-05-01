/**
 * 文件传输器
 *
 * 将日志写入文件系统，支持追加模式和错误处理。
 * 提供资源管理和文件流控制。
 */

import * as fs from 'node:fs';
import { dirname } from 'node:path';

import type { LogEntry, LogFormatter } from '../../../types/log';

import { BaseTransport } from './BaseTransport';

/**
 * 文件传输器
 *
 * 特点：
 * - 将日志写入指定文件
 * - 支持追加模式
 * - 处理文件系统错误
 * - 提供资源清理和关闭功能
 */
export class FileTransport extends BaseTransport {
  /**
   * 日志文件路径
   */
  private filePath: string;

  /**
   * 文件写入流
   */
  private writeStream?: fs.WriteStream;

  /**
   * 构造函数
   * @param filePath 日志文件路径
   * @param formatter 可选的日志格式化器
   */
  constructor(filePath: string, formatter?: LogFormatter) {
    super(formatter);
    this.filePath = filePath;

    // 确保目录存在
    this.ensureDirectoryExists();
  }

  /**
   * 确保日志文件所在目录存在
   */
  private ensureDirectoryExists(): void {
    try {
      const dirPath = dirname(this.filePath);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (err) {
      console.error(`创建日志目录失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * 获取或创建文件写入流
   * @returns 文件写入流
   */
  private getWriteStream(): fs.WriteStream {
    if (!this.writeStream) {
      try {
        this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' });

        // 处理流错误
        this.writeStream.on('error', (err) => {
          console.error(`文件日志写入错误: ${err.message}`);
          this.writeStream = undefined;
        });
      } catch (err) {
        throw new Error(`无法创建日志文件写入流: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return this.writeStream;
  }

  /**
   * 将格式化后的日志写入文件
   * @param entry 原始日志条目
   * @param formatted 格式化后的日志字符串
   */
  protected writeEntry(entry: LogEntry, formatted: string): void {
    try {
      // 获取写入流
      const stream = this.getWriteStream();

      // 写入日志并添加换行符
      stream.write(formatted + '\n');
    } catch (err) {
      console.error(`文件日志写入失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * 关闭文件写入流
   * 在应用程序退出前应调用此方法，确保所有日志被写入
   * @returns 返回Promise以支持异步操作
   */
  public close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.writeStream) {
        resolve();

        return;
      }

      this.writeStream.end(() => {
        this.writeStream = undefined;
        resolve();
      });

      this.writeStream.on('error', (err) => {
        this.writeStream = undefined;
        reject(err);
      });
    });
  }
}
