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

import type { DomainState } from './types';


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
