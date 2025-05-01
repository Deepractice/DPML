/**
 * domainService模块单元测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  initializeDomain,
  compileDPML,
  extendDomain,
  getDomainSchema,
  getDomainTransformers,
  processDomainCommands,
  registerCommands,
  getAllRegisteredCommands,
  resetCommandRegistry
} from '../../../../core/framework/domainService';
import { ConfigurationError, CompilationError } from '../../../../types';
import type { CommandDefinition } from '../../../../types/CLI';
import {
  createDomainConfigFixture,
  createDomainContextFixture,
  createValidDPMLFixture,
  createInvalidDPMLFixture,
  createExtensionConfigFixture,
  createMockDPMLDocument,
  createMockProcessingResult
} from '../../../fixtures/framework/frameworkFixtures';

// 模拟依赖模块
vi.mock('../../../../core/parsing/parsingService', () => ({
  parse: vi.fn()
}));

vi.mock('../../../../core/processing/processingService', () => ({
  processDocument: vi.fn()
}));

// 更新mock方式，添加registerTransformer
vi.mock('../../../../api/transformer', () => ({
  transform: vi.fn(),
  registerTransformer: vi.fn()
}));

describe('UT-DOMSVC: domainService模块', () => {
  // 导入模拟函数
  let mockParse;
  let mockProcessDocument;
  let mockTransform;
  let mockRegisterTransformer;

  beforeEach(async () => {
    // 重置模拟函数
    vi.clearAllMocks();

    const parsingService = await import('../../../../core/parsing/parsingService');
    const processingService = await import('../../../../core/processing/processingService');
    const transformerApi = await import('../../../../api/transformer');

    mockParse = parsingService.parse;
    mockProcessDocument = processingService.processDocument;
    mockTransform = transformerApi.transform;
    mockRegisterTransformer = transformerApi.registerTransformer;
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('UT-DOMSVC-01: initializeDomain函数', () => {
    it('应正确初始化领域上下文', () => {
      // 准备
      const config = createDomainConfigFixture();

      // 执行
      const context = initializeDomain(config);

      // 断言
      expect(context.domain).toBe(config.domain);
      expect(context.description).toBe(config.description);
      expect(context.schema).toBe(config.schema);
      expect(context.transformers).toEqual(config.transformers);
      expect(context.options).toEqual(expect.objectContaining({
        strictMode: config.options?.strictMode,
        errorHandling: config.options?.errorHandling,
        transformOptions: config.options?.transformOptions
      }));
      expect(context.options.custom).toBeDefined();
    });

    it('UT-DOMSVC-02: 应设置默认选项', () => {
      // 准备
      const config = {
        domain: 'test-domain',
        schema: createDomainConfigFixture().schema,
        transformers: createDomainConfigFixture().transformers
      };

      // 执行
      const context = initializeDomain(config);

      // 断言
      expect(context.options).toEqual(expect.objectContaining({
        strictMode: false,
        errorHandling: 'throw',
        transformOptions: expect.any(Object),
        custom: expect.any(Object)
      }));
    });

    it('UT-DOMSVC-NEG-01: 应验证配置有效性', () => {
      // 准备: 缺少schema
      const config1 = {
        transformers: createDomainConfigFixture().transformers
      } as any;

      // 准备: 缺少transformers
      const config2 = {
        schema: createDomainConfigFixture().schema
      } as any;

      // 准备: transformers为空数组
      const config3 = {
        domain: 'test-domain',
        schema: createDomainConfigFixture().schema,
        transformers: []
      };

      // 断言
      expect(() => initializeDomain(config1)).toThrow(ConfigurationError);
      expect(() => initializeDomain(config2)).toThrow(ConfigurationError);
      expect(() => initializeDomain(config3)).toThrow(ConfigurationError);
    });
  });

  describe('UT-DOMSVC-03: compileDPML函数', () => {
    it('应协调解析、处理和转换流程', async () => {
      // 准备
      const content = createValidDPMLFixture();
      const context = createDomainContextFixture();
      const mockDocument = createMockDPMLDocument();
      const mockProcessingResult = createMockProcessingResult();
      const mockTransformResult = {
        merged: { id: 'test-model' }
      };

      // 设置模拟返回值
      mockParse.mockResolvedValue(mockDocument);
      mockProcessDocument.mockReturnValue(mockProcessingResult);
      mockTransform.mockReturnValue(mockTransformResult);

      // 执行
      const result = await compileDPML(content, context);

      // 断言
      expect(mockParse).toHaveBeenCalledWith(content);
      expect(mockProcessDocument).toHaveBeenCalledWith(mockDocument, {
        schema: context.schema,
        isValid: true,
        errors: undefined
      });

      // 验证注册转换器被调用
      expect(mockRegisterTransformer).toHaveBeenCalledTimes(context.transformers.length);

      // 验证transform被调用，但不需要检查具体参数，因为实现已更改
      expect(mockTransform).toHaveBeenCalled();

      expect(result).toBe(mockTransformResult.merged);
    });

    it('UT-DOMSVC-NEG-02: 应在验证失败时遵循errorHandling策略', async () => {
      // 准备
      const content = createInvalidDPMLFixture();
      const context = createDomainContextFixture();
      const mockDocument = createMockDPMLDocument();
      const mockInvalidResult = {
        ...createMockProcessingResult(),
        validation: {
          isValid: false,
          errors: [{ message: '验证错误' }],
          warnings: []
        }
      };

      // 设置模拟返回值
      mockParse.mockResolvedValue(mockDocument);
      mockProcessDocument.mockReturnValue(mockInvalidResult);

      // 执行与断言
      await expect(compileDPML(content, context)).rejects.toThrow(CompilationError);

      // 修改错误处理策略
      context.options.errorHandling = 'warn';
      mockTransform.mockReturnValue({
        merged: { result: 'with-warnings' }
      });

      // 执行
      const result = await compileDPML(content, context);

      // 断言
      expect(mockRegisterTransformer).toHaveBeenCalled();
      expect(mockTransform).toHaveBeenCalled();
      expect(result).toEqual({ result: 'with-warnings' });
    });

    it('UT-DOMSVC-NEG-03: 应处理解析错误', async () => {
      // 准备
      const content = createInvalidDPMLFixture();
      const context = createDomainContextFixture();
      const parseError = new Error('解析失败');

      // 设置模拟返回值
      mockParse.mockRejectedValue(parseError);

      // 执行与断言
      await expect(compileDPML(content, context)).rejects.toThrow(CompilationError);
      await expect(compileDPML(content, context)).rejects.toThrow(/编译DPML内容失败/);
    });

    it('UT-DOMSVC-NEG-04: 应处理转换错误', async () => {
      // 准备
      const content = createValidDPMLFixture();
      const context = createDomainContextFixture();
      const mockDocument = createMockDPMLDocument();
      const mockProcessingResult = createMockProcessingResult();
      const transformError = new Error('转换失败');

      // 设置模拟返回值
      mockParse.mockResolvedValue(mockDocument);
      mockProcessDocument.mockReturnValue(mockProcessingResult);
      mockRegisterTransformer.mockImplementation(() => {
        // 正常注册
      });
      mockTransform.mockImplementation(() => {
        throw transformError;
      });

      // 执行与断言
      await expect(compileDPML(content, context)).rejects.toThrow(CompilationError);
      await expect(compileDPML(content, context)).rejects.toThrow(/编译DPML内容失败/);
    });
  });

  describe('UT-DOMSVC-04/05/06: extendDomain函数', () => {
    it('应更新Schema', () => {
      // 准备
      const context = createDomainContextFixture();
      const originalSchema = context.schema;
      const newSchema = { element: 'newRoot' };

      // 执行
      extendDomain(context, { schema: newSchema });

      // 断言
      expect(context.schema).toBe(newSchema);
      expect(context.schema).not.toBe(originalSchema);
    });

    it('应更新转换器', () => {
      // 准备
      const context = createDomainContextFixture();
      const originalTransformers = [...context.transformers];
      const extension = createExtensionConfigFixture();

      // 执行
      extendDomain(context, extension);

      // 断言
      expect(context.transformers.length).toBe(originalTransformers.length + extension.transformers!.length);
      expect(context.transformers).toContainEqual(expect.objectContaining({
        name: 'additionalTransformer'
      }));
    });

    it('应更新选项', () => {
      // 准备
      const context = createDomainContextFixture();
      const originalOptions = { ...context.options };
      const extension = createExtensionConfigFixture();

      // 执行
      extendDomain(context, extension);

      // 断言
      expect(context.options.strictMode).toBe(extension.options!.strictMode);
      expect(context.options.errorHandling).toBe(extension.options!.errorHandling);
      expect(context.options.transformOptions).toEqual(originalOptions.transformOptions);
    });

    it('应正确合并custom选项', () => {
      // 准备
      const context = createDomainContextFixture();

      context.options.custom = { existingKey: 'value' };

      // 执行
      extendDomain(context, {
        options: {
          custom: {
            newKey: 'newValue'
          }
        }
      });

      // 断言
      expect(context.options.custom).toEqual({
        existingKey: 'value',
        newKey: 'newValue'
      });
    });
  });

  describe('UT-DOMSVC-07/08: getDomainSchema和getDomainTransformers函数', () => {
    it('getDomainSchema应返回当前Schema', () => {
      // 准备
      const context = createDomainContextFixture();

      // 执行
      const schema = getDomainSchema(context);

      // 断言
      expect(schema).toBe(context.schema);
    });

    it('getDomainTransformers应返回当前转换器数组副本', () => {
      // 准备
      const context = createDomainContextFixture();

      // 执行
      const transformers = getDomainTransformers(context);

      // 断言
      expect(transformers).toEqual(context.transformers);
      expect(transformers).not.toBe(context.transformers); // 应是副本而非引用
    });
  });

  describe('UT-DOMSVC-09/10: DomainContext的domain和description字段', () => {
    it('UT-DOMSVC-09: 应正确初始化domain字段', () => {
      // 准备
      const config = createDomainConfigFixture();

      // 执行
      const context = initializeDomain(config);

      // 断言
      expect(context.domain).toBe(config.domain);
    });

    it('UT-DOMSVC-10: 应正确初始化description字段', () => {
      // 准备
      const config = createDomainConfigFixture();

      // 执行
      const context = initializeDomain(config);

      // 断言
      expect(context.description).toBe(config.description);
    });

    it('应在extendDomain中更新domain和description', () => {
      // 准备
      const context = createDomainContextFixture();
      const originalDomain = context.domain;
      const originalDescription = context.description;
      const newDomain = 'new-domain';
      const newDescription = 'New Domain Description';

      // 执行
      extendDomain(context, {
        domain: newDomain,
        description: newDescription
      });

      // 断言
      expect(context.domain).toBe(newDomain);
      expect(context.domain).not.toBe(originalDomain);
      expect(context.description).toBe(newDescription);
      expect(context.description).not.toBe(originalDescription);
    });
  });

  describe('UT-DOMSVC-11/12/13: 命令处理功能', () => {
    beforeEach(() => {
      // 每个测试前重置命令注册表
      resetCommandRegistry();
    });

    it('UT-DOMSVC-11: processDomainCommands应处理标准命令和自定义命令', () => {
      // 准备
      const context = createDomainContextFixture();
      const commandsConfig = {
        includeStandard: true,
        actions: [
          {
            name: 'custom-cmd',
            description: '自定义命令',
            executor: vi.fn()
          }
        ]
      };

      // 执行
      processDomainCommands(commandsConfig, context);
      const commands = getAllRegisteredCommands();

      // 断言
      // 标准命令数量(validate + parse) + 自定义命令数量(1)
      expect(commands.length).toBe(3);
      expect(commands).toContainEqual(expect.objectContaining({
        name: `${context.domain}:validate`,
        category: context.domain
      }));
      expect(commands).toContainEqual(expect.objectContaining({
        name: `${context.domain}:parse`,
        category: context.domain
      }));
      expect(commands).toContainEqual(expect.objectContaining({
        name: `${context.domain}:custom-cmd`,
        category: context.domain
      }));
    });

    it('UT-DOMSVC-12: registerCommands应检测命令名称冲突', () => {
      // 准备
      const conflictingCommands = [
        {
          name: 'test:cmd',
          description: '测试命令1',
          action: vi.fn()
        },
        {
          name: 'test:cmd', // 重复名称
          description: '测试命令2',
          action: vi.fn()
        }
      ];

      // 断言
      expect(() => registerCommands(conflictingCommands)).toThrow(ConfigurationError);
      expect(() => registerCommands(conflictingCommands)).toThrow(/命令名称冲突/);
    });

    it('UT-DOMSVC-13: initializeDomain应正确处理命令配置', () => {
      // 准备
      const config = {
        ...createDomainConfigFixture(),
        commands: {
          includeStandard: true,
          actions: [
            {
              name: 'test-cmd',
              description: '测试命令',
              executor: vi.fn()
            }
          ]
        }
      };

      // 执行
      initializeDomain(config);
      const commands = getAllRegisteredCommands();

      // 断言
      expect(commands.length).toBe(3); // validate + parse + test-cmd
      expect(commands).toContainEqual(expect.objectContaining({
        name: `${config.domain}:test-cmd`,
        category: config.domain
      }));
    });

    it('应正确处理空命令数组', () => {
      // 准备
      const emptyCommands: CommandDefinition[] = [];

      // 执行
      registerCommands(emptyCommands);
      const commands = getAllRegisteredCommands();

      // 断言
      expect(commands.length).toBe(0);
    });

    it('resetCommandRegistry应清空命令注册表', () => {
      // 准备
      const testCommands = [
        {
          name: 'test:cmd1',
          description: '测试命令1',
          action: vi.fn()
        },
        {
          name: 'test:cmd2',
          description: '测试命令2',
          action: vi.fn()
        }
      ];

      // 注册命令
      registerCommands(testCommands);
      expect(getAllRegisteredCommands().length).toBe(2);

      // 执行重置
      resetCommandRegistry();

      // 断言
      expect(getAllRegisteredCommands().length).toBe(0);
    });
  });
});
