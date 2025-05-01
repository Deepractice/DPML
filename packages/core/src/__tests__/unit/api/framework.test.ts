/**
 * Framework API模块单元测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createDomainDPML, createTransformerDefiner } from '../../../api/framework';
import {
  createDomainCompiler,
  createTransformerDefiner as createTransformerDefinerImpl,
  createDPMLCLIService
} from '../../../core/framework/domainService';
import type { Schema } from '../../../types';

// 模拟domainService模块
vi.mock('../../../core/framework/domainService', async () => {
  // 导入原始模块
  const actualModule = await vi.importActual('../../../core/framework/domainService');

  return {
    ...actualModule,
    createDomainCompiler: vi.fn(),
    createTransformerDefiner: vi.fn(),
    ensureCoreInitialized: vi.fn(),
    getAllRegisteredCommands: vi.fn(),
    getDefaultDomainName: vi.fn(),
    createDPMLCLIService: vi.fn()
  };
});

// 模拟cli模块
vi.mock('../../../api/cli', () => ({
  createCLI: vi.fn()
}));

describe('UT-FRM-API: Framework API模块', () => {
  // 在每个测试前重置所有模拟
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // createDomainDPML 函数测试
  describe('UT-FRM-API-01: createDomainDPML函数', () => {
    // 准备模拟数据
    const mockCompiler = {
      compile: vi.fn(),
      extend: vi.fn(),
      getSchema: vi.fn(),
      getTransformers: vi.fn()
    };

    const mockCLI = {
      execute: vi.fn(),
      showHelp: vi.fn(),
      showVersion: vi.fn(),
      registerCommands: vi.fn()
    };

    beforeEach(() => {
      // 设置模拟返回值
      (createDomainCompiler as any).mockReturnValue(mockCompiler);
      (createDPMLCLIService as any).mockReturnValue(mockCLI);
    });

    it('UT-FRM-API-01-01: 应调用domainService.createDomainCompiler和createDPMLCLIService', () => {
      // 准备
      const mockSchema: Schema = { element: 'root' };
      const mockConfig = {
        domain: 'test',
        schema: mockSchema,
        transformers: [{ name: 'test', transform: () => ({}) }]
      };

      // 执行
      const result = createDomainDPML(mockConfig);

      // 断言
      expect(createDomainCompiler).toHaveBeenCalledWith(mockConfig);
      expect(createDPMLCLIService).toHaveBeenCalled();

      // 验证返回的对象包含compiler和cli属性
      expect(result).toHaveProperty('compiler');
      expect(result).toHaveProperty('cli');
      expect(result.compiler).toBe(mockCompiler);
      expect(result.cli).toBe(mockCLI);
    });

    it('UT-FRM-API-01-02: 应返回正确结构的DomainDPML对象', () => {
      // 准备
      const mockSchema: Schema = { element: 'root' };
      const mockConfig = {
        domain: 'test',
        schema: mockSchema,
        transformers: [{ name: 'test', transform: () => ({}) }]
      };

      // 执行
      const result = createDomainDPML(mockConfig);

      // 断言
      expect(result).toEqual({
        compiler: mockCompiler,
        cli: mockCLI
      });
    });
  });

  // createTransformerDefiner 函数测试
  describe('UT-FRM-API-02: createTransformerDefiner函数', () => {
    it('应调用domainService.createTransformerDefiner', () => {
      // 准备
      (createTransformerDefinerImpl as any).mockReturnValue({});

      // 执行
      createTransformerDefiner();

      // 断言
      expect(createTransformerDefinerImpl).toHaveBeenCalled();
    });
  });
});
