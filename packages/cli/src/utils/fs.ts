import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { isPathSafe, getDirName } from './paths';

/**
 * 读取文件内容
 * @param filePath 文件路径
 * @param encoding 编码（默认utf-8）
 * @returns 文件内容
 */
export async function readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
  try {
    return await fsPromises.readFile(filePath, encoding);
  } catch (error) {
    throw new Error(`读取文件失败: ${filePath} - ${(error as Error).message}`);
  }
}

/**
 * 写入文件内容
 * @param filePath 文件路径
 * @param content 文件内容
 * @param encoding 编码（默认utf-8）
 */
export async function writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  try {
    // 确保目录存在
    const dirPath = path.dirname(filePath);
    await fsPromises.mkdir(dirPath, { recursive: true });
    
    // 写入文件
    await fsPromises.writeFile(filePath, content, encoding);
  } catch (error) {
    throw new Error(`写入文件失败: ${filePath} - ${(error as Error).message}`);
  }
}

/**
 * 读取并解析JSON文件
 * @param filePath JSON文件路径
 * @returns 解析后的对象
 */
export async function readJsonFile<T = any>(filePath: string): Promise<T> {
  try {
    const content = await readFile(filePath);
    return JSON.parse(content) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`解析JSON文件失败: ${filePath} - ${error.message}`);
    }
    throw error;
  }
}

/**
 * 将对象序列化并写入JSON文件
 * @param filePath JSON文件路径
 * @param data 要写入的对象
 * @param pretty 是否美化输出（默认true）
 */
export async function writeJsonFile<T = any>(filePath: string, data: T, pretty = true): Promise<void> {
  try {
    const content = pretty 
      ? JSON.stringify(data, null, 2) 
      : JSON.stringify(data);
    
    await writeFile(filePath, content);
  } catch (error) {
    throw new Error(`写入JSON文件失败: ${filePath} - ${(error as Error).message}`);
  }
}

/**
 * 复制文件
 * @param sourcePath 源文件路径
 * @param destPath 目标文件路径
 */
export async function copyFile(sourcePath: string, destPath: string): Promise<void> {
  try {
    // 确保目标目录存在
    const destDir = path.dirname(destPath);
    await fsPromises.mkdir(destDir, { recursive: true });
    
    // 复制文件
    await fsPromises.copyFile(sourcePath, destPath);
  } catch (error) {
    throw new Error(`复制文件失败: ${sourcePath} -> ${destPath} - ${(error as Error).message}`);
  }
}

/**
 * 删除文件
 * @param filePath 文件路径
 */
export async function removeFile(filePath: string): Promise<void> {
  try {
    await fsPromises.unlink(filePath);
  } catch (error) {
    // 如果文件不存在，忽略错误
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw new Error(`删除文件失败: ${filePath} - ${(error as Error).message}`);
    }
  }
}

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns 是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fsPromises.access(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 处理模板字符串，替换变量
 * @param template 模板字符串
 * @param variables 变量对象
 * @returns 处理后的字符串
 */
export function processTemplate(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    // 处理嵌套属性，如 user.name
    const keys = key.trim().split('.');
    let value = variables;
    
    for (const k of keys) {
      if (value === undefined || value === null) {
        return match; // 保留原始模板变量
      }
      value = value[k];
    }
    
    return value !== undefined ? String(value) : match;
  });
}

/**
 * 创建临时目录
 * @param prefix 目录前缀
 * @returns 临时目录路径
 */
export async function createTempDirectory(prefix: string): Promise<string> {
  const tempDir = path.join(
    os.tmpdir(),
    `${prefix}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`
  );
  
  await fsPromises.mkdir(tempDir, { recursive: true });
  return tempDir;
}

/**
 * 删除临时目录
 * @param dirPath 目录路径
 */
export async function removeTempDirectory(dirPath: string): Promise<void> {
  try {
    await fsPromises.rmdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`删除临时目录失败: ${dirPath} - ${(error as Error).message}`);
  }
}

/**
 * 原子方式写入文件（先写入临时文件，再重命名）
 * @param filePath 文件路径
 * @param content 文件内容
 * @param encoding 编码（默认utf-8）
 */
export async function atomicWriteFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  // 创建临时文件路径
  const tempFilePath = `${filePath}.${Date.now()}.tmp`;
  
  try {
    // 确保目录存在
    const dirPath = path.dirname(filePath);
    await fsPromises.mkdir(dirPath, { recursive: true });
    
    // 写入临时文件
    await fsPromises.writeFile(tempFilePath, content, encoding);
    
    // 复制到目标文件（使用复制而不是重命名，以便跨设备工作）
    await fsPromises.copyFile(tempFilePath, filePath);
    
    // 删除临时文件
    await fsPromises.unlink(tempFilePath);
  } catch (error) {
    // 尝试清理临时文件
    try {
      await fsPromises.unlink(tempFilePath);
    } catch (cleanupError) {
      // 忽略清理错误
    }
    
    throw new Error(`原子写入文件失败: ${filePath} - ${(error as Error).message}`);
  }
}

/**
 * 安全地读取文件（检查路径安全性）
 * @param filePath 文件路径
 * @param baseDir 基础目录
 * @param encoding 编码（默认utf-8）
 * @returns 文件内容
 */
export async function safeReadFile(filePath: string, baseDir: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
  // 检查路径安全性
  if (!isPathSafe(baseDir, filePath)) {
    throw new Error(`不安全的文件路径: ${filePath}`);
  }
  
  return readFile(filePath, encoding);
}

/**
 * 安全地写入文件（检查路径安全性）
 * @param filePath 文件路径
 * @param content 文件内容
 * @param baseDir 基础目录
 * @param encoding 编码（默认utf-8）
 */
export async function safeWriteFile(filePath: string, content: string, baseDir: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  // 检查路径安全性
  if (!isPathSafe(baseDir, filePath)) {
    throw new Error(`不安全的文件路径: ${filePath}`);
  }
  
  return writeFile(filePath, content, encoding);
}

/**
 * 读取目录内容
 * @param dirPath 目录路径
 * @returns 目录内容列表
 */
export async function readDirectory(dirPath: string): Promise<string[]> {
  try {
    return await fsPromises.readdir(dirPath);
  } catch (error) {
    throw new Error(`读取目录失败: ${dirPath} - ${(error as Error).message}`);
  }
}

/**
 * 获取文件状态信息
 * @param filePath 文件路径
 * @returns 文件状态
 */
export async function getFileStats(filePath: string): Promise<fs.Stats> {
  try {
    return await fsPromises.stat(filePath);
  } catch (error) {
    throw new Error(`获取文件状态失败: ${filePath} - ${(error as Error).message}`);
  }
}

/**
 * 检查路径是否为目录
 * @param dirPath 目录路径
 * @returns 是否为目录
 */
export async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    const stats = await fsPromises.stat(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * 检查路径是否为文件
 * @param filePath 文件路径
 * @returns 是否为文件
 */
export async function isFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fsPromises.stat(filePath);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}
