/**
 * 模拟文件系统示例
 * 
 * 这个示例演示了如何使用@dpml/common/testing中的模拟文件系统功能
 * 来编写文件系统相关代码的测试。
 */

import { createMockFileSystem } from '../../src/testing';
import { describe, it, expect } from 'vitest';

// 假设我们有一个配置加载器，从文件系统读取配置
class ConfigLoader {
  constructor(private fileSystem: any) {}
  
  async loadConfig(path: string): Promise<any> {
    if (!(await this.fileSystem.exists(path))) {
      throw new Error(`配置文件不存在: ${path}`);
    }
    
    const content = await this.fileSystem.readFile(path, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (err) {
      throw new Error(`配置文件格式错误: ${path}`);
    }
  }
  
  async saveConfig(path: string, config: any): Promise<void> {
    const content = JSON.stringify(config, null, 2);
    await this.fileSystem.writeFile(path, content);
  }
}

// 测试配置加载器
describe('ConfigLoader', () => {
  it('应正确加载有效的配置文件', async () => {
    // 创建模拟文件系统
    const mockFs = createMockFileSystem({
      '/app/config.json': JSON.stringify({ 
        debug: true,
        apiUrl: 'https://example.com/api'
      })
    });
    
    // 创建配置加载器
    const loader = new ConfigLoader(mockFs);
    
    // 测试加载配置
    const config = await loader.loadConfig('/app/config.json');
    
    // 验证结果
    expect(config).toEqual({
      debug: true,
      apiUrl: 'https://example.com/api'
    });
    
    // 验证调用历史
    expect(mockFs.exists.mock.calls.length).toBe(1);
    expect(mockFs.readFile.mock.calls.length).toBe(1);
    expect(mockFs.readFile.mock.calls[0][0]).toBe('/app/config.json');
  });
  
  it('应抛出错误当配置文件不存在', async () => {
    // 创建空的模拟文件系统
    const mockFs = createMockFileSystem({});
    
    // 创建配置加载器
    const loader = new ConfigLoader(mockFs);
    
    // 测试加载不存在的配置
    await expect(loader.loadConfig('/app/missing.json')).rejects.toThrow(
      '配置文件不存在'
    );
    
    // 验证调用历史
    expect(mockFs.exists.mock.calls.length).toBe(1);
    expect(mockFs.readFile.mock.calls.length).toBe(0);
  });
  
  it('应正确保存配置文件', async () => {
    // 创建模拟文件系统
    const mockFs = createMockFileSystem({});
    
    // 创建配置加载器
    const loader = new ConfigLoader(mockFs);
    
    // 测试保存配置
    await loader.saveConfig('/app/new-config.json', {
      debug: false,
      apiUrl: 'https://example.org/api'
    });
    
    // 验证调用历史
    expect(mockFs.writeFile.mock.calls.length).toBe(1);
    expect(mockFs.writeFile.mock.calls[0][0]).toBe('/app/new-config.json');
    
    // 验证写入的内容
    const expectedContent = JSON.stringify({
      debug: false,
      apiUrl: 'https://example.org/api'
    }, null, 2);
    expect(mockFs.writeFile.mock.calls[0][1]).toBe(expectedContent);
  });
});

// 注意: 这个文件可以直接用vitest运行:
// pnpm vitest run examples/testing/mock-file-system.ts 