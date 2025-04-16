import { describe, it, expect, vi } from 'vitest';

import {
  AgentStateManagerFactory,
  AgentStateManagerType,
  InMemoryAgentStateManager,
  FileSystemAgentStateManager,
} from '../../../state';

// 模拟fs模块，使用正确的方式
vi.mock('fs', async () => {
  return {
    default: {
      existsSync: vi.fn(() => true),
      mkdirSync: vi.fn(),
      promises: {
        writeFile: vi.fn(),
        readFile: vi.fn(),
      },
    },
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
    promises: {
      writeFile: vi.fn(),
      readFile: vi.fn(),
    },
  };
});

// 模拟path模块
vi.mock('path', async () => {
  return {
    default: {
      join: vi.fn((...args) => args.join('/')),
      basename: vi.fn((path, ext) => path.split('/').pop().replace(ext, '')),
    },
    join: vi.fn((...args) => args.join('/')),
    basename: vi.fn((path, ext) =>
      path
        .split('/')
        .pop()
        .replace(ext || '', '')
    ),
  };
});

describe('AgentStateManagerFactory', () => {
  const testAgentId = 'test-agent-1';

  describe('create', () => {
    it('should create a memory state manager', () => {
      const manager = AgentStateManagerFactory.create({
        type: AgentStateManagerType.MEMORY,
        options: {
          agentId: testAgentId,
        },
      });

      expect(manager).toBeInstanceOf(InMemoryAgentStateManager);
    });

    it('should create a file system state manager', () => {
      const manager = AgentStateManagerFactory.create({
        type: AgentStateManagerType.FILE_SYSTEM,
        options: {
          agentId: testAgentId,
          storageDir: '/tmp/state',
        },
      });

      expect(manager).toBeInstanceOf(FileSystemAgentStateManager);
    });

    it('should throw error for missing storage dir in file system options', () => {
      expect(() => {
        AgentStateManagerFactory.create({
          type: AgentStateManagerType.FILE_SYSTEM,
          options: {
            agentId: testAgentId,
            // missing storageDir
          },
        });
      }).toThrow(/Invalid options/);
    });

    it('should throw error for unsupported manager type', () => {
      expect(() => {
        AgentStateManagerFactory.create({
          // @ts-expect-error - testing invalid type
          type: 'unsupported-type',
          options: {
            agentId: testAgentId,
          },
        });
      }).toThrow(/Unsupported state manager type/);
    });
  });

  describe('convenience methods', () => {
    it('should create memory state manager with createMemoryStateManager', () => {
      const manager = AgentStateManagerFactory.createMemoryStateManager({
        agentId: testAgentId,
      });

      expect(manager).toBeInstanceOf(InMemoryAgentStateManager);
    });

    it('should create file system state manager with createFileSystemStateManager', () => {
      const manager = AgentStateManagerFactory.createFileSystemStateManager({
        agentId: testAgentId,
        storageDir: '/tmp/state',
      });

      expect(manager).toBeInstanceOf(FileSystemAgentStateManager);
    });
  });
});
