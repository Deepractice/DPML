/**
 * Framework API模块单元测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createCLI } from '../../../api/cli';
import { createDomainDPML, createTransformerDefiner, createDPMLCLI } from '../../../api/framework';
import { createDomainCompiler, createTransformerDefiner, getAllRegisteredCommands, getDefaultDomainName, ensureCoreInitialized } from '../../../core/framework/domainService';
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
    getDefaultDomainName: vi.fn()
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
      (createTransformerDefiner as any).mockReturnValue({});

      // 执行
      createTransformerDefiner();

      // 断言
      expect(createTransformerDefiner).toHaveBeenCalled();
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
    const mockCommands = [
      { name: 'core:command1', description: 'Command 1', action: vi.fn(), category: 'core' },
      { name: 'core:command2', description: 'Command 2', action: vi.fn(), category: 'core' },
      { name: 'other:command', description: 'Other command', action: vi.fn(), category: 'other' }
    ];

    beforeEach(() => {
      // 设置模拟返回值
      (createCLI as any).mockReturnValue(mockCLI);
      (getAllRegisteredCommands as any).mockReturnValue(mockCommands);
      (getDefaultDomainName as any).mockReturnValue('core');
    });

    it('UT-FRM-API-03-01: 应确保核心领域初始化', () => {
      // 执行
      createDPMLCLI();

      // 断言
      expect(ensureCoreInitialized).toHaveBeenCalled();
    });

    it('UT-FRM-API-03-02: 应使用默认选项创建CLI', () => {
      // 执行
      createDPMLCLI();

      // 断言
      expect(createCLI).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'dpml',
          version: expect.any(String),
          description: expect.stringContaining('DPML')
        }),
        []
      );
    });

    it('UT-FRM-API-03-03: 应使用自定义选项创建CLI', () => {
      // 准备
      const customOptions = {
        name: 'custom-cli',
        version: '2.0.0',
        description: 'Custom CLI'
      };

      // 执行
      createDPMLCLI(customOptions);

      // 断言
      expect(createCLI).toHaveBeenCalledWith(
        expect.objectContaining(customOptions),
        []
      );
    });

    it('UT-FRM-API-03-04: 应注册所有命令', () => {
      // 执行
      createDPMLCLI();

      // 断言
      expect(mockCLI.registerCommands).toHaveBeenCalledWith(mockCommands);
    });

    it('UT-FRM-API-03-05: 应为核心领域命令创建无前缀别名', () => {
      // 执行
      createDPMLCLI();

      // 断言 - 第二次调用registerCommands应只包含核心命令的别名
      expect(mockCLI.registerCommands).toHaveBeenCalledTimes(2);

      // 获取第二次调用的参数
      const unprefixedCommands = mockCLI.registerCommands.mock.calls[1][0];

      // 验证别名命令
      expect(unprefixedCommands.length).toBe(2); // 只有core领域的命令
      expect(unprefixedCommands[0].name).toBe('command1'); // 去掉了core:前缀
      expect(unprefixedCommands[1].name).toBe('command2');
      expect(unprefixedCommands[0].category).toBeUndefined(); // 移除了category
      expect(unprefixedCommands[1].category).toBeUndefined();
    });

    it('UT-FRM-API-03-06: 应返回CLI实例', () => {
      // 执行
      const result = createDPMLCLI();

      // 断言
      expect(result).toBe(mockCLI);
    });
  });
});
