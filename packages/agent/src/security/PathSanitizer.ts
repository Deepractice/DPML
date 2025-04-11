/**
 * 路径安全工具类
 * 
 * 提供专门的路径安全工具，防止路径遍历和其他路径相关安全问题
 */

import * as fs from 'fs';
import * as path from 'path';
import { ErrorFactory } from '../errors/factory';
import { AgentErrorCode } from '../errors/types';

/**
 * 路径安全选项
 */
export interface PathSanitizeOptions {
  /**
   * 是否允许上级目录访问
   */
  allowParentTraversal?: boolean;
  
  /**
   * 是否允许绝对路径
   */
  allowAbsolutePath?: boolean;
  
  /**
   * 允许的文件扩展名（例如：['.txt', '.json']）
   */
  allowedExtensions?: string[];
  
  /**
   * 基础目录 - 所有相对路径都会相对于此目录解析
   */
  baseDir?: string;
}

/**
 * 路径安全工具类
 */
export class PathSanitizer {
  /**
   * 默认选项
   */
  private static readonly DEFAULT_OPTIONS: PathSanitizeOptions = {
    allowParentTraversal: false,
    allowAbsolutePath: false,
    allowedExtensions: undefined,
    baseDir: undefined
  };
  
  /**
   * 净化文件路径
   * 
   * @param filePath 文件路径
   * @param options 选项
   * @returns 安全的文件路径
   * @throws SecurityError 如果路径不安全
   */
  static sanitizeFilePath(filePath: string, options: PathSanitizeOptions = {}): string {
    if (!filePath) {
      return '';
    }
    
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    // 规范化路径分隔符
    let normalized = filePath.replace(/\\/g, '/');
    
    // 处理绝对路径
    if (path.isAbsolute(normalized)) {
      if (!opts.allowAbsolutePath) {
        throw ErrorFactory.createSecurityError(
          '不允许使用绝对路径',
          AgentErrorCode.PATH_TRAVERSAL_ATTEMPT,
          { securityContext: 'path-security' }
        );
      }
    }
    
    // 检查父目录遍历
    if (!opts.allowParentTraversal && normalized.includes('../')) {
      throw ErrorFactory.createSecurityError(
        '检测到路径遍历尝试',
        AgentErrorCode.PATH_TRAVERSAL_ATTEMPT,
        { securityContext: 'path-security' }
      );
    }
    
    // 检查文件扩展名
    if (opts.allowedExtensions && opts.allowedExtensions.length > 0) {
      const ext = path.extname(normalized).toLowerCase();
      if (!opts.allowedExtensions.includes(ext)) {
        throw ErrorFactory.createSecurityError(
          `不允许的文件扩展名: ${ext}`,
          AgentErrorCode.PATH_TRAVERSAL_ATTEMPT,
          { securityContext: 'path-security' }
        );
      }
    }
    
    // 解析最终路径
    let resolvedPath: string;
    
    if (opts.baseDir) {
      // 如果提供了基础目录，相对路径都基于此目录解析
      resolvedPath = path.resolve(opts.baseDir, normalized);
      
      // 确保解析后的路径在基础目录内
      if (!resolvedPath.startsWith(path.resolve(opts.baseDir))) {
        throw ErrorFactory.createSecurityError(
          '路径超出允许的基础目录',
          AgentErrorCode.PATH_TRAVERSAL_ATTEMPT,
          { securityContext: 'path-security' }
        );
      }
    } else {
      resolvedPath = path.resolve(normalized);
    }
    
    return resolvedPath;
  }
  
  /**
   * 安全地创建文件名
   * 
   * @param name 原始名称
   * @returns 安全的文件名
   */
  static createSafeFileName(name: string): string {
    if (!name) {
      return '';
    }
    
    // 移除所有不安全的字符
    return name
      // 只保留安全字符
      .replace(/[^a-zA-Z0-9_\-.]/g, '_')
      // 限制文件名长度
      .substring(0, 255);
  }
  
  /**
   * 安全地创建目录
   * 
   * @param dirPath 目录路径
   * @param options 选项
   * @returns 创建的目录路径
   */
  static safeCreateDirectory(dirPath: string, options: PathSanitizeOptions = {}): string {
    // 净化目录路径
    const safePath = this.sanitizeFilePath(dirPath, options);
    
    // 创建目录（如果不存在）
    if (!fs.existsSync(safePath)) {
      fs.mkdirSync(safePath, { recursive: true });
    } else if (!fs.statSync(safePath).isDirectory()) {
      throw ErrorFactory.createSecurityError(
        `路径存在但不是目录: ${safePath}`,
        AgentErrorCode.PATH_TRAVERSAL_ATTEMPT,
        { securityContext: 'path-security' }
      );
    }
    
    return safePath;
  }
  
  /**
   * 安全地从文件读取内容
   * 
   * @param filePath 文件路径
   * @param options 选项
   * @returns 文件内容
   */
  static safeReadFile(filePath: string, options: PathSanitizeOptions = {}): string {
    // 净化文件路径
    const safePath = this.sanitizeFilePath(filePath, options);
    
    // 检查文件是否存在
    if (!fs.existsSync(safePath)) {
      throw ErrorFactory.createSecurityError(
        `文件不存在: ${safePath}`,
        AgentErrorCode.PATH_TRAVERSAL_ATTEMPT,
        { securityContext: 'path-security' }
      );
    }
    
    // 检查是否是文件
    if (!fs.statSync(safePath).isFile()) {
      throw ErrorFactory.createSecurityError(
        `路径存在但不是文件: ${safePath}`,
        AgentErrorCode.PATH_TRAVERSAL_ATTEMPT,
        { securityContext: 'path-security' }
      );
    }
    
    // 读取文件
    return fs.readFileSync(safePath, 'utf-8');
  }
  
  /**
   * 安全地写入文件
   * 
   * @param filePath 文件路径
   * @param content 文件内容
   * @param options 选项
   */
  static safeWriteFile(filePath: string, content: string, options: PathSanitizeOptions = {}): void {
    // 净化文件路径
    const safePath = this.sanitizeFilePath(filePath, options);
    
    // 创建父目录（如果不存在）
    const dirPath = path.dirname(safePath);
    this.safeCreateDirectory(dirPath, options);
    
    // 写入文件
    fs.writeFileSync(safePath, content, 'utf-8');
  }
} 