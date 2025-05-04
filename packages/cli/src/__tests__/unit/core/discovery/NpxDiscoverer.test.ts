import { describe, test, expect, vi, beforeEach } from 'vitest';

import { NpxDiscoverer } from '../../../../core/discovery/NpxDiscoverer';
import { createDomainInfoFixture } from '../../../fixtures/cli/cliFixtures';

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn().mockImplementation((command, args) => {
    // Mock npm view command based on package name
    if (command === 'npm' && args[0] === 'view') {
      const packageName = args[1];

      // Return different responses based on package name
      if (packageName === '@dpml/core') {
        return Promise.resolve({ stdout: '1.0.0', exitCode: 0 });
      } else if (packageName === '@dpml/agent') {
        return Promise.resolve({ stdout: '1.0.0', exitCode: 0 });
      } else if (packageName === '@dpml/example') {
        return Promise.resolve({ stdout: '1.0.0', exitCode: 0 });
      } else if (packageName === '@dpml/custom') {
        return Promise.resolve({ stdout: '0.1.0', exitCode: 0 });
      } else {
        return Promise.resolve({ stdout: '', exitCode: 1 });
      }
    }

    return Promise.resolve({ stdout: '', exitCode: 0 });
  })
}));

describe('UT-NPXDISC', () => {
  const domainFixtures = createDomainInfoFixture();
  const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getName should return "npx" (UT-NPXDISC-01)', () => {
    // Arrange
    const discoverer = new NpxDiscoverer();

    // Act
    const name = discoverer.getName();

    // Assert
    expect(name).toBe('npx');
  });

  test('tryFindDomain should find official domain (UT-NPXDISC-02)', async () => {
    // Arrange
    const discoverer = new NpxDiscoverer();
    const { execa } = await import('execa');

    // Act
    const domainInfo = await discoverer.tryFindDomain('core');

    // Assert
    expect(execa).toHaveBeenCalledWith('npm', ['view', '@dpml/core', 'version'], expect.any(Object));
    expect(domainInfo).toEqual({
      name: 'core',
      packageName: '@dpml/core',
      source: 'npx',
      version: '1.0.0'
    });
  });

  test('tryFindDomain should handle @dpml prefixed packages (UT-NPXDISC-03)', async () => {
    // Arrange
    const discoverer = new NpxDiscoverer();

    // Act
    const domainInfo = await discoverer.tryFindDomain('@dpml/custom');

    // Assert
    expect(domainInfo).toEqual({
      name: 'custom',
      packageName: '@dpml/custom',
      source: 'npx',
      version: '0.1.0'
    });
  });

  test('tryFindDomain should find third-party domain (UT-NPXDISC-04)', async () => {
    // Arrange
    const discoverer = new NpxDiscoverer();
    const { execa } = await import('execa');

    // Act
    const domainInfo = await discoverer.tryFindDomain('custom');

    // Assert
    expect(execa).toHaveBeenCalledWith('npm', ['view', '@dpml/custom', 'version'], expect.any(Object));
    expect(domainInfo).toEqual({
      name: 'custom',
      packageName: '@dpml/custom',
      source: 'npx',
      version: '0.1.0'
    });
  });

  test('listDomains should return official domains (UT-NPXDISC-05)', async () => {
    // Arrange
    const discoverer = new NpxDiscoverer();

    // Act
    const domains = await discoverer.listDomains();

    // Assert
    expect(domains).toHaveLength(3); // core, agent, example
    expect(domains).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'core', packageName: '@dpml/core' }),
      expect.objectContaining({ name: 'agent', packageName: '@dpml/agent' }),
      expect.objectContaining({ name: 'example', packageName: '@dpml/example' })
    ]));
  });

  test('getPackageVersion should use execa to check npm version (UT-NPXDISC-06)', async () => {
    // Arrange
    const discoverer = new NpxDiscoverer();
    const { execa } = await import('execa');

    // Get access to private method
    const getPackageVersion = Reflect.get(discoverer, 'getPackageVersion').bind(discoverer);

    // Act
    const version = await getPackageVersion('@dpml/core');

    // Assert
    expect(execa).toHaveBeenCalledWith('npm', ['view', '@dpml/core', 'version'], expect.any(Object));
    expect(version).toBe('1.0.0');
  });

  test('tryFindDomain should return null for unknown domain (UT-NPXDISC-NEG-01)', async () => {
    // Arrange
    const discoverer = new NpxDiscoverer();

    // Act
    const domainInfo = await discoverer.tryFindDomain('unknown');

    // Assert
    expect(domainInfo).toBeNull();
  });

  test('getPackageVersion should handle execa errors (UT-NPXDISC-NEG-02)', async () => {
    // Arrange
    const discoverer = new NpxDiscoverer();
    const { execa } = await import('execa');

    (execa as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('npm error'));

    // Get access to private method
    const getPackageVersion = Reflect.get(discoverer, 'getPackageVersion').bind(discoverer);

    // Act
    const version = await getPackageVersion('error-package');

    // Assert
    expect(version).toBeNull();
    expect(mockConsoleWarn).toHaveBeenCalled();
  });

  test('getPackageVersion should handle malformed npm output (UT-NPXDISC-NEG-03)', async () => {
    // Arrange
    const discoverer = new NpxDiscoverer();
    const { execa } = await import('execa');

    (execa as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      stdout: '', // Empty output
      exitCode: 0
    });

    // Get access to private method
    const getPackageVersion = Reflect.get(discoverer, 'getPackageVersion').bind(discoverer);

    // Act
    const version = await getPackageVersion('empty-output-package');

    // Assert
    expect(version).toBeNull();
  });
});
