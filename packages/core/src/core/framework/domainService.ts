/**
 * Framework模块服务层
 * 提供领域编译器的核心服务功能
 */

import { parse } from '../../api/parser';
import { processDocument } from '../../api/processing';
import { processSchema } from '../../api/schema';
import { transform, registerTransformer } from '../../api/transformer';
import { ConfigurationError, CompilationError } from '../../types';
import type { CompileOptions } from '../../types/CompileOptions';
import type { DomainConfig } from '../../types/DomainConfig';
import type { DPMLDocument } from '../../types/DPMLDocument';
import type { ParseResult } from '../../types/ParseResult';
import type { ProcessedSchema } from '../../types/ProcessedSchema';
import type { ProcessingResult } from '../../types/ProcessingResult';
import type { Schema } from '../../types/Schema';
import type { TransformContext } from '../../types/TransformContext';
import type { Transformer } from '../../types/Transformer';
import type { TransformResult } from '../../types/TransformResult';
import type { ValidationResult } from '../../types/ValidationResult';
import type { TransformerDefiner } from '../../types/TransformerDefiner';
import type { MappingRule } from '../../types/MappingRule';
import type { CollectorConfig } from '../../types/CollectorConfig';
import type { RelationConfig } from '../../types/RelationConfig';
import type { SemanticExtractor } from '../../types/SemanticExtractor';
import type { DomainCompiler } from '../../types/DomainCompiler';

import type { DomainState } from './types';

// 导入transformer工厂函数
import {
  createStructuralMapper,
  createAggregator,
  createTemplateTransformer,
  createRelationProcessor,
  createSemanticExtractor,
  createResultCollector
} from './transformer/transformerFactory';

// 导入API层函数

/**
 * 默认编译选项
 */
const defaultOptions: Required<CompileOptions> & { custom: Record<string, any> } = {
  strictMode: false,
  errorHandling: 'throw',
  transformOptions: {
    resultMode: 'merged'
  },
  custom: {}
};

/**
 * 验证领域配置的有效性
 * @param config 要验证的配置
 * @throws {ConfigurationError} 当配置无效时抛出
 */
function validateConfig(config: DomainConfig): void {
  // 验证schema
  if (!config.schema) {
    throw new ConfigurationError('缺少必需的schema配置');
  }

  // 验证transformers
  if (!config.transformers || !Array.isArray(config.transformers) || config.transformers.length === 0) {
    throw new ConfigurationError('transformers必须是非空数组');
  }

  // 验证每个转换器
  for (const transformer of config.transformers) {
    if (!transformer.name || typeof transformer.transform !== 'function') {
      throw new ConfigurationError('转换器必须包含name属性和transform方法');
    }
  }
}

/**
 * 初始化领域状态
 * @param config 领域配置
 * @returns 初始化的领域状态
 * @throws {ConfigurationError} 当配置无效时抛出
 */
export function initializeDomain(config: DomainConfig): DomainState {
  // 验证配置
  validateConfig(config);

  // 创建内部状态，合并默认选项
  return {
    schema: config.schema,
    transformers: [...config.transformers],
    options: {
      ...defaultOptions,
      ...config.options,
      // 确保custom始终存在
      custom: {
        ...defaultOptions.custom,
        ...(config.options?.custom || {})
      }
    }
  };
}

/**
 * 编译DPML内容为领域对象
 * @param content DPML内容字符串
 * @param state 领域状态
 * @returns 编译后的领域对象
 * @throws {CompilationError} 当编译过程中发生错误时抛出
 */
export async function compileDPML<T>(content: string, state: DomainState): Promise<T> {
  try {
    // 1. 解析DPML内容
    const parseResult = await parse(content);

    // 确保解析成功 - 根据parse返回类型判断
    let document: DPMLDocument;

    if ('success' in parseResult) {
      // 处理ParseResult类型的返回值
      if (!parseResult.success) {
        throw new CompilationError(`解析DPML内容失败: ${parseResult.error?.message || '未知错误'}`);
      }

      // 确保data不为undefined
      if (!parseResult.data) {
        throw new CompilationError('解析成功但未返回有效文档');
      }

      document = parseResult.data;
    } else {
      // 直接返回了DPMLDocument
      document = parseResult;
    }

    // 2. 处理Schema
    const processedSchema = processSchema(state.schema);

    // 确保Schema处理成功
    if (!processedSchema.isValid) {
      throw new CompilationError(`Schema定义无效: ${processedSchema.errors?.map(e => e.message).join('; ')}`);
    }

    // 3. 处理并验证文档
    const processingResult = processDocument(document, processedSchema);

    // 默认的验证结果
    const validation: ValidationResult = processingResult.validation || {
      isValid: processingResult.isValid ?? true,
      errors: [],
      warnings: []
    };

    // 如果验证失败且错误处理策略为throw，则抛出错误
    if (!validation.isValid && state.options.errorHandling === 'throw') {
      throw new CompilationError(
        `文档验证失败: ${validation.errors
          .map(err => err.message)
          .join('; ')}`
      );
    }

    // 4. 转换为目标格式
    try {
      // 注册领域中定义的所有转换器
      for (const transformer of state.transformers) {
        registerTransformer(transformer);
      }

      // 准备转换选项
      const transformOptions = {
        ...state.options.transformOptions
      };

      // 调用transform函数进行转换
      const transformResult = transform<T>(processingResult, transformOptions);

      // 根据结果模式返回适当的结果
      const resultMode = state.options.transformOptions?.resultMode || 'merged';

      if (resultMode === 'raw' && transformResult && 'raw' in transformResult) {
        return transformResult.raw as T;
      } else {
        return transformResult.merged as T;
      }
    } catch (transformError) {
      // 如果转换过程中出错，重新抛出
      throw transformError;
    }
  } catch (error) {
    // 捕获并包装错误
    if (error instanceof CompilationError) {
      throw error; // 已经是编译错误，直接传递
    }

    // 包装为编译错误
    throw new CompilationError(
      `编译DPML内容失败: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * 扩展领域配置
 * @param state 当前领域状态
 * @param config 要合并的配置片段
 * @throws {ConfigurationError} 当扩展配置无效时抛出
 */
export function extendDomain(state: DomainState, config: Partial<DomainConfig>): void {
  // 更新schema（如果提供）
  if (config.schema) {
    state.schema = config.schema;
  }

  // 追加或替换转换器（如果提供）
  if (config.transformers) {
    // 验证新的转换器
    for (const transformer of config.transformers) {
      if (!transformer.name || typeof transformer.transform !== 'function') {
        throw new ConfigurationError('转换器必须包含name属性和transform方法');
      }
    }

    // 添加新的转换器
    state.transformers = [...state.transformers, ...config.transformers];
  }

  // 合并选项（如果提供）
  if (config.options) {
    state.options = {
      ...state.options,
      ...config.options,
      // 确保custom正确合并
      custom: {
        ...state.options.custom,
        ...(config.options.custom || {})
      }
    };
  }
}

/**
 * 获取当前领域架构
 * @param state 领域状态
 * @returns 当前架构对象
 */
export function getDomainSchema(state: DomainState): Schema {
  return state.schema;
}

/**
 * 获取当前领域转换器集合
 * @param state 领域状态
 * @returns 转换器数组副本
 */
export function getDomainTransformers(state: DomainState): Array<Transformer<unknown, unknown>> {
  // 返回副本而非直接引用，避免外部修改
  return [...state.transformers];
}

/**
 * 创建领域编译器
 * @template T 编译后的领域对象类型
 * @param config 领域配置
 * @returns 领域编译器实例
 */
export function createDomainCompiler<T>(config: DomainConfig): DomainCompiler<T> {
  // 初始化领域状态，使用闭包模式保持状态隔离
  const state = initializeDomain(config);

  // 返回领域编译器实现
  return {
    /**
     * 编译DPML内容为领域对象
     * @param content DPML内容字符串
     * @returns 编译后的领域对象
     */
    compile: async (content: string): Promise<T> => {
      return compileDPML<T>(content, state);
    },

    /**
     * 扩展当前配置
     * @param extensionConfig 要合并的配置片段
     */
    extend: (extensionConfig: Partial<DomainConfig>): void => {
      extendDomain(state, extensionConfig);
    },

    /**
     * 获取当前架构
     * @returns 当前架构对象
     */
    getSchema: (): Schema => {
      return getDomainSchema(state);
    },

    /**
     * 获取当前转换器集合
     * @returns 转换器数组
     */
    getTransformers: (): Array<Transformer<unknown, unknown>> => {
      return getDomainTransformers(state);
    }
  };
}

/**
 * 创建转换器定义器
 * @returns 转换器定义器实例
 */
export function createTransformerDefiner(): TransformerDefiner {
  // 使用闭包模式返回TransformerDefiner接口实现
  return {
    /**
     * 定义结构映射转换器
     * @param rules 映射规则数组
     * @returns 结构映射转换器实例
     */
    defineStructuralMapper<TInput, TOutput>(
      rules: Array<MappingRule<unknown, unknown>>
    ): Transformer<TInput, TOutput> {
      return createStructuralMapper<TInput, TOutput>(rules);
    },

    /**
     * 定义聚合转换器
     * @param config 收集配置
     * @returns 聚合转换器实例
     */
    defineAggregator<TInput, TOutput>(
      config: CollectorConfig
    ): Transformer<TInput, TOutput> {
      return createAggregator<TInput, TOutput>(config);
    },

    /**
     * 定义模板转换器
     * @param template 模板字符串或函数
     * @param preprocessor 可选的数据预处理函数
     * @returns 模板转换器实例
     */
    defineTemplateTransformer<TInput>(
      template: string | ((data: unknown) => string),
      preprocessor?: (input: TInput) => unknown
    ): Transformer<TInput, string> {
      return createTemplateTransformer<TInput>(template, preprocessor);
    },

    /**
     * 定义关系处理转换器
     * @param nodeSelector 节点选择器
     * @param config 关系配置
     * @returns 关系处理转换器实例
     */
    defineRelationProcessor<TInput, TOutput>(
      nodeSelector: string,
      config: RelationConfig
    ): Transformer<TInput, TOutput> {
      return createRelationProcessor<TInput, TOutput>(nodeSelector, config);
    },

    /**
     * 定义语义提取转换器
     * @param extractors 提取器数组
     * @returns 语义提取转换器实例
     */
    defineSemanticExtractor<TInput, TOutput>(
      extractors: Array<SemanticExtractor<unknown, unknown>>
    ): Transformer<TInput, TOutput> {
      return createSemanticExtractor<TInput, TOutput>(extractors);
    },

    /**
     * 定义结果收集转换器
     * @param transformerNames 可选的转换器名称数组，用于选择性收集
     * @returns 结果收集转换器实例
     */
    defineResultCollector<TOutput>(
      transformerNames?: string[]
    ): Transformer<unknown, TOutput> {
      return createResultCollector<TOutput>(transformerNames);
    }
  };
}
