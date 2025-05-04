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
  arguments: vi.fn().mockReturnThis(),
  allowUnknownOption: vi.fn().mockReturnThis(),
  action: vi.fn().mockReturnThis(),
  addHelpText: vi.fn().mockReturnThis(),
  parseAsync: vi.fn().mockResolvedValue({})
};

// Mock the Commander library
vi.mock('commander', () => ({
  Command: vi.fn(() => mockCommandInstance)
}));

// Mock read-package-up
vi.mock('read-package-up', () => ({
  readPackageUp: vi.fn()
}));

// 导入已模拟的模块
import { Command } from 'commander';
import { readPackageUp } from 'read-package-up';

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
    vi.mocked(readPackageUp).mockResolvedValue({ packageJson: { version: '1.0.0' } });
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
    expect(mockCommandInstance.arguments).toHaveBeenCalled();
    expect(mockCommandInstance.action).toHaveBeenCalled();
    expect(mockCommandInstance.addHelpText).toHaveBeenCalled();
  });

  test('parseAndExecute should parse arguments (UT-CMDADP-02)', async () => {
    // Arrange
    const adapter = new CommanderAdapter(mockDiscoverer, mockExecutorFactory);

    // Act
    await adapter.parseAndExecute(commandArgs.list);

    // Assert
    expect(mockCommandInstance.parseAsync).toHaveBeenCalledWith(commandArgs.list, { from: 'user' });
  });

  test('getVersion should read version using read-package-up (UT-CMDADP-03)', async () => {
    // Arrange
    const adapter = new CommanderAdapter(mockDiscoverer, mockExecutorFactory);

    // Act
    const version = await adapter.getVersion();

    // Assert
    expect(readPackageUp).toHaveBeenCalled();
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

    mockDiscoverer.tryFindDomain.mockResolvedValue(null);

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

  test('getVersion should handle read-package-up errors (UT-CMDADP-NEG-04)', async () => {
    // Arrange
    const adapter = new CommanderAdapter(mockDiscoverer, mockExecutorFactory);

    // 模拟readPackageUp抛出错误
    vi.mocked(readPackageUp).mockRejectedValueOnce(new Error('Package read error'));

    // Act
    const version = await adapter.getVersion();

    // Assert
    expect(readPackageUp).toHaveBeenCalled();
    expect(version).toBe('0.1.0'); // Default version fallback
  });
});
