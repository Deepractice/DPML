import { describe, it, expect } from 'vitest';
import { 
  AgentMemoryFactory, 
  InMemoryAgentMemory, 
  FileSystemAgentMemory 
} from '../../../memory';
import * as os from 'os';
import * as path from 'path';

describe('AgentMemoryFactory', () => {
  // 测试代理ID
  const testAgentId = 'test-agent-1';

  describe('factory creation', () => {
    it('should throw error when agentId is missing', () => {
      expect(() => {
        // @ts-expect-error 测试缺少必要参数情况
        AgentMemoryFactory.create({});
      }).toThrow(/agentId/);
    });
  });
  
  describe('memory type selection', () => {
    it('should create InMemoryAgentMemory by default', () => {
      const memory = AgentMemoryFactory.create({
        agentId: testAgentId
      });
      
      expect(memory).toBeInstanceOf(InMemoryAgentMemory);
    });
    
    it('should create InMemoryAgentMemory when type is "memory"', () => {
      const memory = AgentMemoryFactory.create({
        agentId: testAgentId,
        type: 'memory'
      });
      
      expect(memory).toBeInstanceOf(InMemoryAgentMemory);
    });
    
    it('should create FileSystemAgentMemory when type is "file"', () => {
      const memory = AgentMemoryFactory.create({
        agentId: testAgentId,
        type: 'file',
        basePath: path.join(os.tmpdir(), 'dpml-test')
      });
      
      expect(memory).toBeInstanceOf(FileSystemAgentMemory);
    });
    
    it('should throw error when type is "file" but basePath is missing', () => {
      expect(() => {
        AgentMemoryFactory.create({
          agentId: testAgentId,
          type: 'file'
        });
      }).toThrow(/basePath/);
    });
    
    it('should throw error for unknown memory type', () => {
      expect(() => {
        AgentMemoryFactory.create({
          agentId: testAgentId,
          // @ts-expect-error 测试无效类型值
          type: 'unknown'
        });
      }).toThrow(/Unknown memory type/);
    });
  });
  
  describe('options passing', () => {
    it('should pass maxItems option to memory implementations', () => {
      const memory = AgentMemoryFactory.create({
        agentId: testAgentId,
        maxItems: 100
      }) as InMemoryAgentMemory;
      
      // 注意：这里使用typescript类型断言访问私有属性进行测试
      expect((memory as any).maxItems).toBe(100);
    });
  });
}); 