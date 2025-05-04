import { describe, test, expect, vi } from 'vitest';

import { ExecutorFactory } from '../../../../core/execution/ExecutorFactory';
import { NpxExecutor } from '../../../../core/execution/NpxExecutor';
import { DPMLError } from '../../../../types/DPMLError';
import { createDomainInfoFixture } from '../../../fixtures/cli/cliFixtures';

// Mock NpxExecutor
vi.mock('../../../../core/execution/NpxExecutor', () => ({
  NpxExecutor: vi.fn().mockImplementation(() => ({
    getDomainInfo: vi.fn(),
    execute: vi.fn().mockResolvedValue(undefined)
  }))
}));

describe('UT-EXECFACT', () => {
  const domainFixtures = createDomainInfoFixture();

  test('createExecutor should create NpxExecutor for npx source (UT-EXECFACT-01)', () => {
    // Arrange
    const factory = new ExecutorFactory();
    const domainInfo = { ...domainFixtures.core, source: 'npx' };

    // Act
    const executor = factory.createExecutor(domainInfo);

    // Assert
    expect(NpxExecutor).toHaveBeenCalledWith(domainInfo);
    expect(executor).toBeDefined();
  });

  test('createExecutor should throw for unsupported source (UT-EXECFACT-NEG-01)', () => {
    // Arrange
    const factory = new ExecutorFactory();
    const domainInfo = { ...domainFixtures.core, source: 'unsupported' };

    // Act & Assert
    expect(() => factory.createExecutor(domainInfo)).toThrow(DPMLError);
    expect(() => factory.createExecutor(domainInfo)).toThrow('Unsupported domain source: unsupported');
  });
});
