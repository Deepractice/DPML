/**
 * Framework API模块单元测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createDomainDPML, createTransformerDefiner, createDPMLCLI } from '../../../api/framework';
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
    it('应调用domainService.createDomainCompiler', () => {
      // 准备
      const mockSchema: Schema = { element: 'root' };
      const mockConfig = {
        domain: 'test',
        schema: mockSchema,
        transformers: [{ name: 'test', transform: () => ({}) }]
      };

      (createDomainCompiler as any).mockReturnValue({});

      // 执行
      createDomainDPML(mockConfig);

      // 断言
      expect(createDomainCompiler).toHaveBeenCalledWith(mockConfig);
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

  // createDPMLCLI 函数测试
  describe('UT-FRM-API-03: createDPMLCLI函数', () => {
    // 准备模拟数据
    const mockCLI = {
      execute: vi.fn(),
      showHelp: vi.fn(),
      showVersion: vi.fn(),
      registerCommands: vi.fn()
    };

    beforeEach(() => {
      // 设置模拟返回值
      (createDPMLCLIService as any).mockReturnValue(mockCLI);
    });

    it('UT-FRM-API-03-01: 应调用domainService.createDPMLCLIService', () => {
      // 准备
      const customOptions = {
        name: 'custom-cli',
        version: '2.0.0',
        description: 'Custom CLI'
      };

      // 执行
      const result = createDPMLCLI(customOptions);

      // 断言
      expect(createDPMLCLIService).toHaveBeenCalledWith(customOptions);
      expect(result).toBe(mockCLI);
    });

    it('UT-FRM-API-03-02: 应在无选项时正确调用', () => {
      // 执行
      createDPMLCLI();

      // 断言
      expect(createDPMLCLIService).toHaveBeenCalledWith(undefined);
    });
  });
});
