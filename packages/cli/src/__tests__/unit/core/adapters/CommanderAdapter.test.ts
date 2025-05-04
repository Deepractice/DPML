import { describe, test, expect, vi, beforeEach } from 'vitest';

import { CommanderAdapter } from '../../../../core/adapters/CommanderAdapter';
import { DPMLError } from '../../../../types/DPMLError';
import { createCommandArgsFixture, createDomainInfoFixture } from '../../../fixtures/cli/cliFixtures';

// mock命令对象
const mockCommandInstance = {
  name: vi.fn().mockReturnThis(),
  description: vi.fn().mockReturnThis(),
  version: vi.fn().mockReturnThis(),
  option: vi.fn().mockReturnThis(),
  argument: vi.fn().mockReturnThis(),
  arguments: vi.fn().mockReturnThis(),
  allowUnknownOption: vi.fn().mockReturnThis(),
  action: vi.fn().mockReturnThis(),
  addHelpText: vi.fn().mockReturnThis(),
  help: vi.fn().mockReturnThis(),
  parseAsync: vi.fn().mockResolvedValue({})
};

// Mock the Commander library
vi.mock('commander', () => ({
  Command: vi.fn(() => mockCommandInstance)
}));

// Mock fs, url, and path modules
vi.mock('fs', () => ({
  readFileSync: vi.fn()
}));

vi.mock('url', () => ({
  fileURLToPath: vi.fn()
}));

vi.mock('path', () => ({
  dirname: vi.fn(),
  resolve: vi.fn()
}));

// 导入已模拟的模块
import { Command } from 'commander';

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

describe('UT-CMDADP', () => {
  // Setup fixtures
  const commandArgs = createCommandArgsFixture();
  const domainFixtures = createDomainInfoFixture();

  // Mock domain discoverer
  const mockDiscoverer = {
    getName: vi.fn().mockReturnValue('mock'),
    tryFindDomain: vi.fn().mockResolvedValue(null),
    listDomains: vi.fn().mockResolvedValue([domainFixtures.core, domainFixtures.agent])
  };

  // Mock executor factory
  const mockExecutor = {
    getDomainInfo: vi.fn().mockReturnValue(domainFixtures.core),
    execute: vi.fn().mockResolvedValue(undefined)
  };

  const mockExecutorFactory = {
    createExecutor: vi.fn().mockReturnValue(mockExecutor)
  };

  // Capture console output
  const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();

    // 设置文件路径模拟
    vi.mocked(fileURLToPath).mockReturnValue('/mock/path/src/core/adapters/CommanderAdapter.ts');
    vi.mocked(dirname).mockReturnValue('/mock/path/src/core/adapters');
    vi.mocked(resolve).mockReturnValue('/mock/path/package.json');

    // 模拟package.json内容
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0' }));
  });

  test('constructor should initialize Commander program (UT-CMDADP-01)', () => {
    // Arrange & Act
    const adapter = new CommanderAdapter(mockDiscoverer, mockExecutorFactory);

    // Assert
    expect(Command).toHaveBeenCalled();
    expect(mockCommandInstance.name).toHaveBeenCalledWith('dpml');
    expect(mockCommandInstance.description).toHaveBeenCalled();
    expect(mockCommandInstance.version).toHaveBeenCalled();
    expect(mockCommandInstance.option).toHaveBeenCalled();
    expect(mockCommandInstance.argument).toHaveBeenCalled();
    expect(mockCommandInstance.action).toHaveBeenCalled();
    expect(mockCommandInstance.addHelpText).toHaveBeenCalled();
  });

  test('parseAndExecute should parse arguments (UT-CMDADP-02)', async () => {
    // Arrange
    const adapter = new CommanderAdapter(mockDiscoverer, mockExecutorFactory);

    // 模拟标准命令行参数，不含--list选项
    const regularArgs = ['domain', 'arg1', 'arg2'];

    // Spy handleListOption方法
    const handleListOptionSpy = vi.spyOn(adapter as any, 'handleListOption');

    // Act - 执行普通命令
    await adapter.parseAndExecute(regularArgs);

    // Assert - 验证parseAsync被调用
    expect(mockCommandInstance.parseAsync).toHaveBeenCalledWith(regularArgs, { from: 'user' });
    expect(handleListOptionSpy).not.toHaveBeenCalled();

    // 清除记录，准备测试--list选项
    vi.clearAllMocks();

    // Act - 执行--list选项
    await adapter.parseAndExecute(['--list']);

    // Assert - 验证handleListOption被调用而不是parseAsync
    expect(mockCommandInstance.parseAsync).not.toHaveBeenCalled();
    expect(handleListOptionSpy).toHaveBeenCalled();
  });

  test('getVersion should read version from package.json (UT-CMDADP-03)', () => {
    // Arrange
    const adapter = new CommanderAdapter(mockDiscoverer, mockExecutorFactory);

    // Act
    const version = adapter.getVersion();

    // Assert
    expect(fileURLToPath).toHaveBeenCalled();
    expect(dirname).toHaveBeenCalled();
    expect(resolve).toHaveBeenCalled();
    expect(readFileSync).toHaveBeenCalled();
    expect(version).toBe('1.0.0');
  });

  test('handleListOption should list domains (UT-CMDADP-04)', async () => {
    // Arrange
    const adapter = new CommanderAdapter(mockDiscoverer, mockExecutorFactory);

    // Get access to private method
    const handleListOption = Reflect.get(adapter, 'handleListOption').bind(adapter);

    // Act
    await handleListOption();

    // Assert
    expect(mockDiscoverer.listDomains).toHaveBeenCalled();
    expect(mockConsoleLog).toHaveBeenCalled();
    expect(mockConsoleLog).toHaveBeenCalledWith('Available DPML domains:');
  });

  test('handleDomainCommand should execute domain command (UT-CMDADP-05)', async () => {
    // Arrange
    const adapter = new CommanderAdapter(mockDiscoverer, mockExecutorFactory);

    mockDiscoverer.tryFindDomain.mockResolvedValue(domainFixtures.core);

    // Get access to private method
    const handleDomainCommand = Reflect.get(adapter, 'handleDomainCommand').bind(adapter);

    // Act
    await handleDomainCommand('core', ['validate', 'file.xml']);

    // Assert
    expect(mockDiscoverer.tryFindDomain).toHaveBeenCalledWith('core');
    expect(mockExecutorFactory.createExecutor).toHaveBeenCalledWith(domainFixtures.core);
    expect(mockExecutor.execute).toHaveBeenCalledWith(['validate', 'file.xml']);
  });

  test('handleListOption should handle domain listing errors (UT-CMDADP-NEG-01)', async () => {
    // Arrange
    const adapter = new CommanderAdapter(mockDiscoverer, mockExecutorFactory);

    mockDiscoverer.listDomains.mockRejectedValue(new Error('Listing failed'));

    // Get access to private method
    const handleListOption = Reflect.get(adapter, 'handleListOption').bind(adapter);

    // Act & Assert
    await expect(handleListOption()).rejects.toThrow(DPMLError);
    await expect(handleListOption()).rejects.toThrow('Cannot list domains: Listing failed');
  });

  test('handleDomainCommand should handle domain not found (UT-CMDADP-NEG-02)', async () => {
    // Arrange
    const adapter = new CommanderAdapter(mockDiscoverer, mockExecutorFactory);

    // 确保返回null(域不存在)
    mockDiscoverer.tryFindDomain.mockResolvedValue(null);

    // 提供可用域列表
    mockDiscoverer.listDomains.mockResolvedValue([domainFixtures.core, domainFixtures.agent]);

    // Get access to private method
    const handleDomainCommand = Reflect.get(adapter, 'handleDomainCommand').bind(adapter);

    // Act & Assert
    await expect(handleDomainCommand('unknown', [])).rejects.toThrow(DPMLError);
    await expect(handleDomainCommand('unknown', [])).rejects.toThrow('Domain not found: unknown');
  });

  test('handleDomainCommand should handle execution errors (UT-CMDADP-NEG-03)', async () => {
    // Arrange
    const adapter = new CommanderAdapter(mockDiscoverer, mockExecutorFactory);

    mockDiscoverer.tryFindDomain.mockResolvedValue(domainFixtures.core);
    mockExecutor.execute.mockRejectedValue(new Error('Execution failed'));

    // Get access to private method
    const handleDomainCommand = Reflect.get(adapter, 'handleDomainCommand').bind(adapter);

    // Act & Assert
    await expect(handleDomainCommand('core', [])).rejects.toThrow(DPMLError);
    await expect(handleDomainCommand('core', [])).rejects.toThrow('Domain Command Execution Failed: Execution failed');
  });

  test('getVersion should handle file read errors (UT-CMDADP-NEG-04)', () => {
    // Arrange
    const adapter = new CommanderAdapter(mockDiscoverer, mockExecutorFactory);

    // 模拟文件读取错误
    vi.mocked(readFileSync).mockImplementationOnce(() => {
      throw new Error('File read error');
    });

    // Act
    const version = adapter.getVersion();

    // Assert
    expect(readFileSync).toHaveBeenCalled();
    expect(version).toBe('0.1.0'); // Default version fallback
  });
});
