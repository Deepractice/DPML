/**
 * 标准命令实现
 * 提供Framework模块的标准命令功能
 */

import fs from 'fs/promises';


import { parse } from '../../../api/parser';
import { processDocument } from '../../../api/processing';
import { processSchema } from '../../../api/schema';
import { CompilationError } from '../../../types';
import type { DomainAction } from '../../../types/DomainAction';
import type { DPMLDocument } from '../../../types/DPMLDocument';

/**
 * 从解析结果中提取DPML文档
 * @param parseResult 解析结果
 * @returns DPML文档
 */
function extractDPMLDocument(parseResult: unknown): DPMLDocument {
  if (typeof parseResult !== 'object' || parseResult === null) {
    throw new Error('Parse result is not a valid object');
  }

  // 检查是否是ParseResult
  if ('document' in parseResult && parseResult.document) {
    return parseResult.document as DPMLDocument;
  }

  // 检查是否直接是DPMLDocument
  if ('rootNode' in parseResult && parseResult.rootNode) {
    return parseResult as DPMLDocument;
  }

  throw new Error('Unable to get a valid DPML document');
}

/**
 * 标准命令集合
 * 包含validate和parse命令
 */
export const standardActions: DomainAction[] = [
  {
    name: 'validate',
    description: 'Validate DPML document against domain schema',
    args: [
      { name: 'file', description: 'DPML file path', required: true }
    ],
    options: [
      { flags: '--strict', description: 'Enable strict validation mode' }
    ],
    action: async (actionContext, filePath, options) => {
      try {
        // 读取文件内容 - 确保filePath是字符串
        const content = await fs.readFile(filePath, 'utf-8');

        console.log(`Validating file: ${filePath}`);

        // 获取编译器和选项
        const compiler = actionContext.getCompiler();
        const domainOptions = actionContext.getOptions();

        // 获取并处理Schema
        const schema = compiler.getSchema();
        const processedSchema = processSchema(schema);

        // 确保Schema处理成功
        if (!processedSchema.isValid) {
          throw new CompilationError(`Invalid schema definition: ${processedSchema.errors?.map(e => e.message).join('; ')}`);
        }

        // 解析DPML内容
        const parseResult = await parse(content);

        // 安全地提取文档
        const dpmlDocument = extractDPMLDocument(parseResult);

        // 安全地访问文档信息
        const rootTag = dpmlDocument.rootNode?.tagName || 'unknown';

        console.log(`Successfully parsed document, root node: ${rootTag}`);

        // 使用领域选项中的严格模式设置
        const strictMode = options?.strict !== undefined ? options.strict : domainOptions.strictMode;

        // 处理并验证文档
        const processingResult = processDocument(dpmlDocument, processedSchema);

        // 输出验证结果
        if (processingResult.isValid) {
          console.log(`Validation successful: document conforms to domain schema`);
        } else {
          console.error('Validation failed: document does not conform to domain schema');

          if (processingResult.validation && processingResult.validation.errors) {
            processingResult.validation.errors.forEach(error => {
              console.error(`- ${error.message}`);
            });
          }

          // 如果是严格模式，验证失败时抛出错误
          if (strictMode) {
            console.error(`Strict mode validation failed, terminating process`);
            throw new Error('Document validation failed');
          }

          // 非严格模式下只输出错误信息，不抛出异常
        }

        // 输出验证结果信息（不返回值，以符合void返回类型）
        console.log(`Validation status: ${processingResult.isValid ? 'passed' : 'failed'}`);
        console.log(`Error count: ${processingResult.validation?.errors?.length || 0}`);
        console.log(`Warning count: ${processingResult.validation?.warnings?.length || 0}`);
      } catch (error) {
        console.error(`Error validating document: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }
  },
  {
    name: 'parse',
    description: 'Parse DPML document and display parsed result',
    args: [
      { name: 'file', description: 'DPML file path', required: true }
    ],
    options: [
      { flags: '--output <file>', description: 'Output file path' },
      { flags: '--format <format>', description: 'Output format (json|xml)', defaultValue: 'json' }
    ],
    action: async (actionContext, filePath, options) => {
      try {
        // 读取文件内容 - 确保filePath是字符串
        const content = await fs.readFile(filePath, 'utf-8');

        console.log(`Parsing file: ${filePath}`);

        // 获取编译器
        const compiler = actionContext.getCompiler();

        // 解析DPML内容
        const parseResult = await parse(content);

        // 安全地提取文档
        const dpmlDocument = extractDPMLDocument(parseResult);

        // 安全地访问文档信息
        const rootTag = dpmlDocument.rootNode?.tagName || 'unknown';

        console.log(`Successfully parsed document, root node: ${rootTag}`);
        console.log(`Output format: ${options?.format || 'json'}`);

        // 获取并处理Schema
        const schema = compiler.getSchema();
        const processedSchema = processSchema(schema);

        // 确保Schema处理成功
        if (!processedSchema.isValid) {
          throw new CompilationError(`Invalid schema definition: ${processedSchema.errors?.map(e => e.message).join('; ')}`);
        }

        // 处理文档
        const processingResult = processDocument(dpmlDocument, processedSchema);

        // 准备输出结果
        const result = {
          document: processingResult.document,
          isValid: processingResult.isValid,
          validation: processingResult.validation
        };

        // 根据格式选项格式化输出
        const format = options?.format || 'json';
        let outputContent = '';

        if (format === 'json') {
          outputContent = JSON.stringify(result, (key, value) => {
            // 处理Map对象
            if (value instanceof Map) {
              return Object.fromEntries(value);
            }

            return value;
          }, 2);
        } else if (format === 'xml') {
          // 简单的XML序列化，实际项目中可能需要更复杂的实现
          outputContent = `<parseResult>
  <isValid>${result.isValid}</isValid>
  <document>
    <!-- XML序列化的文档内容 -->
  </document>
</parseResult>`;
        } else {
          throw new Error(`Unsupported output format: ${format}`);
        }

        // 输出结果
        if (options?.output) {
          await fs.writeFile(options.output, outputContent, 'utf-8');
          console.log(`Results saved to: ${options.output}`);
        } else {
          console.log(`Parsed result:`);
          console.log(outputContent);
        }

        // 不返回具体值，符合void返回类型
      } catch (error) {
        console.error(`Error parsing document: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }
  }
];

export default standardActions;
