/**
 * FileProtocolHandler
 * 
 * 处理文件协议的引用
 */

import { Reference } from '../../types/node';
import { ProtocolHandler } from '../interfaces';
import fs from 'fs/promises';
import path from 'path';
import { normalizePath, isAbsolutePath, resolveRelativePath } from '../../utils/pathUtils';

/**
 * 文件系统错误类型
 */
interface FileSystemError extends Error {
  code?: string;
}

/**
 * 文件协议处理器选项
 */
export interface FileProtocolHandlerOptions {
  /**
   * 基础目录，用于解析相对路径
   */
  baseDir?: string;
}

/**
 * 文件协议处理器
 * 处理file协议的引用，用于读取文件系统中的文件
 */
export class FileProtocolHandler implements ProtocolHandler {
  /**
   * 基础目录，用于解析相对路径
   */
  private baseDir: string;
  
  /**
   * 当前上下文路径，用于解析相对引用
   */
  private contextPath?: string;
  
  /**
   * 构造函数
   * @param options 选项
   */
  constructor(options?: FileProtocolHandlerOptions) {
    this.baseDir = options?.baseDir ?? process.cwd();
  }
  
  /**
   * 设置上下文路径
   * @param contextPath 上下文路径
   */
  setContextPath(contextPath: string): void {
    this.contextPath = contextPath;
  }
  
  /**
   * 检查是否可以处理指定协议
   * @param protocol 协议名称
   * @returns 是否可以处理
   */
  canHandle(protocol: string): boolean {
    return protocol === 'file';
  }
  
  /**
   * 处理引用
   * @param reference 引用节点
   * @returns 解析后的结果
   */
  async handle(reference: Reference): Promise<any> {
    // 获取文件路径
    const filePath = reference.path;
    
    // 解析完整路径
    const resolvedPath = this.resolvePath(filePath);
    
    try {
      // 读取文件内容
      const content = await fs.readFile(resolvedPath, 'utf-8');
      
      // 如果是JSON文件，尝试解析
      if (path.extname(resolvedPath).toLowerCase() === '.json') {
        try {
          return JSON.parse(content);
        } catch (error: unknown) {
          const jsonError = error instanceof Error ? error : new Error(String(error));
          throw new Error(`无效的JSON文件: ${jsonError.message}`);
        }
      }
      
      // 返回文件内容
      return content;
    } catch (error: unknown) {
      // 处理常见的文件系统错误
      const fsError = error as FileSystemError;
      
      if (fsError.code === 'ENOENT') {
        throw new Error(`找不到文件: ${resolvedPath}`);
      } else if (fsError.code === 'EACCES') {
        throw new Error(`无权限访问文件: ${resolvedPath}`);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }
  
  /**
   * 解析文件路径
   * @param filePath 文件路径
   * @returns 解析后的完整路径
   */
  private resolvePath(filePath: string): string {
    // 标准化路径，处理不同平台的路径分隔符
    filePath = normalizePath(filePath);
    
    // 如果是绝对路径，直接标准化后返回
    if (isAbsolutePath(filePath)) {
      return filePath;
    }
    
    // 如果有上下文路径，相对于上下文路径解析
    if (this.contextPath) {
      return resolveRelativePath(this.contextPath, filePath);
    }
    
    // 否则相对于基础目录解析
    return resolveRelativePath(this.baseDir, filePath);
  }
} 