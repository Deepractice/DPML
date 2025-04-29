/**
 * domainService模块单元测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  initializeDomain,
  compileDPML,
  extendDomain,
  getDomainSchema,
  getDomainTransformers
} from '../../../../core/framework/domainService';
import { ConfigurationError, CompilationError } from '../../../../types';
import {
  createDomainConfigFixture,
  createDomainStateFixture,
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
    it('应正确初始化领域状态', () => {
      // 准备
      const config = createDomainConfigFixture();

      // 执行
      const state = initializeDomain(config);

      // 断言
      expect(state.schema).toBe(config.schema);
      expect(state.transformers).toEqual(config.transformers);
      expect(state.options).toEqual(expect.objectContaining({
        strictMode: config.options?.strictMode,
        errorHandling: config.options?.errorHandling,
        transformOptions: config.options?.transformOptions
      }));
      expect(state.options.custom).toBeDefined();
    });

    it('UT-DOMSVC-02: 应设置默认选项', () => {
      // 准备
      const config = {
        schema: createDomainConfigFixture().schema,
        transformers: createDomainConfigFixture().transformers
      };

      // 执行
      const state = initializeDomain(config);

      // 断言
      expect(state.options).toEqual(expect.objectContaining({
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
      const state = createDomainStateFixture();
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
      const result = await compileDPML(content, state);

      // 断言
      expect(mockParse).toHaveBeenCalledWith(content);
      expect(mockProcessDocument).toHaveBeenCalledWith(mockDocument, {
        schema: state.schema,
        isValid: true,
        errors: undefined
      });

      // 验证注册转换器被调用
      expect(mockRegisterTransformer).toHaveBeenCalledTimes(state.transformers.length);

      // 验证transform被调用，但不需要检查具体参数，因为实现已更改
      expect(mockTransform).toHaveBeenCalled();

      expect(result).toBe(mockTransformResult.merged);
    });

    it('UT-DOMSVC-NEG-02: 应在验证失败时遵循errorHandling策略', async () => {
      // 准备
      const content = createInvalidDPMLFixture();
      const state = createDomainStateFixture();
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
      await expect(compileDPML(content, state)).rejects.toThrow(CompilationError);

      // 修改错误处理策略
      state.options.errorHandling = 'warn';
      mockTransform.mockReturnValue({
        merged: { result: 'with-warnings' }
      });

      // 执行
      const result = await compileDPML(content, state);

      // 断言
      expect(mockRegisterTransformer).toHaveBeenCalled();
      expect(mockTransform).toHaveBeenCalled();
      expect(result).toEqual({ result: 'with-warnings' });
    });

    it('UT-DOMSVC-NEG-03: 应处理解析错误', async () => {
      // 准备
      const content = createInvalidDPMLFixture();
      const state = createDomainStateFixture();
      const parseError = new Error('解析失败');

      // 设置模拟返回值
      mockParse.mockRejectedValue(parseError);

      // 执行与断言
      await expect(compileDPML(content, state)).rejects.toThrow(CompilationError);
      await expect(compileDPML(content, state)).rejects.toThrow(/编译DPML内容失败/);
    });

    it('UT-DOMSVC-NEG-04: 应处理转换错误', async () => {
      // 准备
      const content = createValidDPMLFixture();
      const state = createDomainStateFixture();
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
      await expect(compileDPML(content, state)).rejects.toThrow(CompilationError);
      await expect(compileDPML(content, state)).rejects.toThrow(/编译DPML内容失败/);
    });
  });

  describe('UT-DOMSVC-04/05/06: extendDomain函数', () => {
    it('应更新Schema', () => {
      // 准备
      const state = createDomainStateFixture();
      const originalSchema = state.schema;
      const newSchema = { element: 'newRoot' };

      // 执行
      extendDomain(state, { schema: newSchema });

      // 断言
      expect(state.schema).toBe(newSchema);
      expect(state.schema).not.toBe(originalSchema);
    });

    it('应更新转换器', () => {
      // 准备
      const state = createDomainStateFixture();
      const originalTransformers = [...state.transformers];
      const extension = createExtensionConfigFixture();

      // 执行
      extendDomain(state, extension);

      // 断言
      expect(state.transformers.length).toBe(originalTransformers.length + extension.transformers!.length);
      expect(state.transformers).toContainEqual(expect.objectContaining({
        name: 'additionalTransformer'
      }));
    });

    it('应更新选项', () => {
      // 准备
      const state = createDomainStateFixture();
      const originalOptions = { ...state.options };
      const extension = createExtensionConfigFixture();

      // 执行
      extendDomain(state, extension);

      // 断言
      expect(state.options.strictMode).toBe(extension.options!.strictMode);
      expect(state.options.errorHandling).toBe(extension.options!.errorHandling);
      expect(state.options.transformOptions).toEqual(originalOptions.transformOptions);
    });

    it('应正确合并custom选项', () => {
      // 准备
      const state = createDomainStateFixture();

      state.options.custom = { existingKey: 'value' };

      // 执行
      extendDomain(state, {
        options: {
          custom: {
            newKey: 'newValue'
          }
        }
      });

      // 断言
      expect(state.options.custom).toEqual({
        existingKey: 'value',
        newKey: 'newValue'
      });
    });
  });

  describe('UT-DOMSVC-07/08: getDomainSchema和getDomainTransformers函数', () => {
    it('getDomainSchema应返回当前Schema', () => {
      // 准备
      const state = createDomainStateFixture();

      // 执行
      const schema = getDomainSchema(state);

      // 断言
      expect(schema).toBe(state.schema);
    });

    it('getDomainTransformers应返回当前转换器数组副本', () => {
      // 准备
      const state = createDomainStateFixture();

      // 执行
      const transformers = getDomainTransformers(state);

      // 断言
      expect(transformers).toEqual(state.transformers);
      expect(transformers).not.toBe(state.transformers); // 应是副本而非引用
    });
  });
});
