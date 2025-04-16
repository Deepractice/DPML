/**
 * 存储工具模块
 * 
 * 提供跨平台的数据存储和检索功能。
 * 在浏览器环境中使用localStorage，在Node.js环境中使用文件系统。
 */

import { isRunningInNode } from './platform';
import * as path from './path';
import * as fs from 'fs';
import * as os from 'os';

// 内存存储，用于Node.js环境下的临时存储
const memoryStorage: Record<string, string> = {};

/**
 * 获取存储路径（仅Node.js环境）
 * @returns 存储目录路径
 */
function getStoragePath(): string {
  if (!isRunningInNode()) {
    throw new Error('getStoragePath is only available in Node.js environment');
  }
  
  const homedir = os.homedir();
  const storagePath = path.join(homedir, '.dpml', 'storage');
  
  // 确保目录存在
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }
  
  return storagePath;
}

/**
 * 存储数据
 * @param key 存储键
 * @param value 要存储的值
 */
export function set<T>(key: string, value: T): void {
  const serialized = JSON.stringify(value);
  
  if (isRunningInNode()) {
    try {
      // 尝试使用文件系统
      const storagePath = getStoragePath();
      const filePath = path.join(storagePath, `${key}.json`);
      fs.writeFileSync(filePath, serialized, 'utf-8');
    } catch (error) {
      // 如果文件系统访问失败，回退到内存存储
      memoryStorage[key] = serialized;
    }
  } else if (typeof localStorage !== 'undefined') {
    // 浏览器环境使用localStorage
    try {
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.warn(`Failed to store data in localStorage: ${error}`);
      // 如果localStorage访问失败（例如隐私模式），回退到内存存储
      memoryStorage[key] = serialized;
    }
  } else {
    // 其他环境使用内存存储
    memoryStorage[key] = serialized;
  }
}

/**
 * 获取存储的数据
 * @param key 存储键
 * @returns 存储的值，如果不存在则返回null
 */
export function get<T>(key: string): T | null {
  let serialized: string | null = null;
  
  if (isRunningInNode()) {
    try {
      // 尝试从文件系统读取
      const storagePath = getStoragePath();
      const filePath = path.join(storagePath, `${key}.json`);
      
      if (fs.existsSync(filePath)) {
        serialized = fs.readFileSync(filePath, 'utf-8');
      }
    } catch (error) {
      // 如果文件系统访问失败，回退到内存存储
      serialized = memoryStorage[key] || null;
    }
  } else if (typeof localStorage !== 'undefined') {
    // 浏览器环境使用localStorage
    try {
      serialized = localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to retrieve data from localStorage: ${error}`);
      // 如果localStorage访问失败，回退到内存存储
      serialized = memoryStorage[key] || null;
    }
  } else {
    // 其他环境使用内存存储
    serialized = memoryStorage[key] || null;
  }
  
  if (serialized === null) {
    return null;
  }
  
  try {
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.warn(`Failed to parse stored data: ${error}`);
    return null;
  }
}

/**
 * 移除存储的数据
 * @param key 存储键
 */
export function remove(key: string): void {
  if (isRunningInNode()) {
    try {
      // 尝试从文件系统删除
      const storagePath = getStoragePath();
      const filePath = path.join(storagePath, `${key}.json`);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // 忽略文件系统错误
    }
    
    // 同时从内存存储中删除
    delete memoryStorage[key];
  } else if (typeof localStorage !== 'undefined') {
    // 浏览器环境使用localStorage
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove data from localStorage: ${error}`);
    }
    
    // 同时从内存存储中删除
    delete memoryStorage[key];
  } else {
    // 其他环境只使用内存存储
    delete memoryStorage[key];
  }
}

/**
 * 获取所有存储键
 * @returns 存储键数组
 */
export function keys(): string[] {
  if (isRunningInNode()) {
    try {
      // 尝试从文件系统获取所有键
      const storagePath = getStoragePath();
      
      if (fs.existsSync(storagePath)) {
        return fs.readdirSync(storagePath)
          .filter(file => file.endsWith('.json'))
          .map(file => file.slice(0, -5)); // 移除.json后缀
      }
    } catch (error) {
      // 如果文件系统访问失败，回退到内存存储
      return Object.keys(memoryStorage);
    }
  } else if (typeof localStorage !== 'undefined') {
    // 浏览器环境使用localStorage
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.warn(`Failed to get keys from localStorage: ${error}`);
      // 如果localStorage访问失败，回退到内存存储
      return Object.keys(memoryStorage);
    }
  }
  
  // 其他环境使用内存存储
  return Object.keys(memoryStorage);
}

/**
 * 清除所有存储数据
 */
export function clear(): void {
  if (isRunningInNode()) {
    try {
      // 尝试清除文件系统存储
      const storagePath = getStoragePath();
      
      if (fs.existsSync(storagePath)) {
        fs.readdirSync(storagePath)
          .filter(file => file.endsWith('.json'))
          .forEach(file => {
            fs.unlinkSync(path.join(storagePath, file));
          });
      }
    } catch (error) {
      // 忽略文件系统错误
    }
  } else if (typeof localStorage !== 'undefined') {
    // 浏览器环境使用localStorage
    try {
      localStorage.clear();
    } catch (error) {
      console.warn(`Failed to clear localStorage: ${error}`);
    }
  }
  
  // 清除内存存储
  Object.keys(memoryStorage).forEach(key => {
    delete memoryStorage[key];
  });
}

/**
 * 导出storageUtils对象，保持向后兼容
 */
export const storageUtils = {
  set,
  get,
  remove,
  keys,
  clear
};
