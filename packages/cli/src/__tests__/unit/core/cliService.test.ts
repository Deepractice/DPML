import { describe, test, expect, vi, beforeEach } from 'vitest';

import { cliService } from '../../../core/cliService';
import { DPMLError, DPMLErrorType } from '../../../types/DPMLError';
import { createCommandArgsFixture } from '../../fixtures/cli/cliFixtures';

// Mock dependencies
vi.mock('../../../core/adapters/CommanderAdapter', () => ({
  CommanderAdapter: vi.fn().mockImplementation(() => ({
    parseAndExecute: vi.fn().mockResolvedValue(undefined),
    getVersion: vi.fn().mockResolvedValue('1.0.0')
  }))
}));

vi.mock('../../../core/discovery/NpxDiscoverer', () => ({
  NpxDiscoverer: vi.fn().mockImplementation(() => ({
    getName: vi.fn().mockReturnValue('npx'),
    tryFindDomain: vi.fn().mockResolvedValue(null),
    listDomains: vi.fn().mockResolvedValue([])
  }))
}));

vi.mock('../../../core/execution/ExecutorFactory', () => ({
  ExecutorFactory: vi.fn().mockImplementation(() => ({
    createExecutor: vi.fn().mockReturnValue({
      getDomainInfo: vi.fn(),
      execute: vi.fn().mockResolvedValue(undefined)
    })
  }))
}));

// Mock console.error and process.exit for error handling tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
  throw new Error(`Exit with code ${code}`);
}) as unknown as typeof process.exit;

describe('UT-CLISVC', () => {
  const commandArgs = createCommandArgsFixture();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('execute should initialize components and execute command (UT-CLISVC-01)', async () => {
    // Import mocked modules
    const { CommanderAdapter } = await import('../../../core/adapters/CommanderAdapter');

    // Setup
    const initializeSpy = vi.spyOn(cliService, 'initialize');

    // Execute
    await cliService.execute(commandArgs.list);

    // Assert
    expect(initializeSpy).toHaveBeenCalled();
    expect(CommanderAdapter).toHaveBeenCalled();
    const mockedAdapter = (CommanderAdapter as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;

    expect(mockedAdapter.parseAndExecute).toHaveBeenCalledWith(commandArgs.list);
  });

  test('initialize should create all required components (UT-CLISVC-02)', async () => {
    // Import mocked modules
    const { CommanderAdapter } = await import('../../../core/adapters/CommanderAdapter');
    const { NpxDiscoverer } = await import('../../../core/discovery/NpxDiscoverer');
    const { ExecutorFactory } = await import('../../../core/execution/ExecutorFactory');

    // Execute
    const components = await cliService.initialize();

    // Assert
    expect(NpxDiscoverer).toHaveBeenCalled();
    expect(ExecutorFactory).toHaveBeenCalled();
    expect(CommanderAdapter).toHaveBeenCalled();
    expect(components).toHaveProperty('domainDiscoverer');
    expect(components).toHaveProperty('executorFactory');
    expect(components).toHaveProperty('commandAdapter');
  });

  test('handleError should process DPML errors correctly (UT-CLISVC-NEG-01)', () => {
    // Setup
    const error = new DPMLError('Test error', DPMLErrorType.COMMAND, 'TEST_ERROR');

    // Execute & Assert
    expect(() => cliService.handleError(error)).toThrow('Exit with code 1');
    expect(mockConsoleError).toHaveBeenCalledWith('Error: Test error');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  test('handleError should convert unknown errors to DPML errors (UT-CLISVC-NEG-02)', () => {
    // Setup
    const error = new Error('Unknown error');

    // Execute & Assert
    expect(() => cliService.handleError(error)).toThrow('Exit with code 1');
    expect(mockConsoleError).toHaveBeenCalledWith('Unknown Error: Unknown error');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });
});
