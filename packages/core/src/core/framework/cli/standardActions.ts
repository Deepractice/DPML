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
    throw new Error('解析结果不是有效对象');
  }

  // 检查是否是ParseResult
  if ('document' in parseResult && parseResult.document) {
    return parseResult.document as DPMLDocument;
  }

  // 检查是否直接是DPMLDocument
  if ('rootNode' in parseResult && parseResult.rootNode) {
    return parseResult as DPMLDocument;
  }

  throw new Error('无法获取有效的DPML文档');
}

/**
 * 标准命令集合
 * 包含validate和parse命令
 */
export const standardActions: DomainAction[] = [
  {
    name: 'validate',
    description: '验证DPML文档是否符合领域规范',
    args: [
      { name: 'file', description: 'DPML文件路径', required: true }
    ],
    options: [
      { flags: '--strict', description: '启用严格验证模式' }
    ],
    action: async (actionContext, filePath, options) => {
      try {
        // 读取文件内容 - 确保filePath是字符串
        const content = await fs.readFile(filePath, 'utf-8');

        console.log(`验证文件: ${filePath}`);

        // 获取编译器和选项
        const compiler = actionContext.getCompiler();
        const domainOptions = actionContext.getOptions();

        // 获取并处理Schema
        const schema = compiler.getSchema();
        const processedSchema = processSchema(schema);

        // 确保Schema处理成功
        if (!processedSchema.isValid) {
          throw new CompilationError(`Schema定义无效: ${processedSchema.errors?.map(e => e.message).join('; ')}`);
        }

        // 解析DPML内容
        const parseResult = await parse(content);

        // 安全地提取文档
        const dpmlDocument = extractDPMLDocument(parseResult);

        // 安全地访问文档信息
        const rootTag = dpmlDocument.rootNode?.tagName || '未知';

        console.log(`成功解析文档，根节点: ${rootTag}`);

        // 使用领域选项中的严格模式设置
        const strictMode = options?.strict !== undefined ? options.strict : domainOptions.strictMode;

        // 处理并验证文档
        const processingResult = processDocument(dpmlDocument, processedSchema);

        // 输出验证结果
        if (processingResult.isValid) {
          console.log(`验证成功: 文档符合领域规范`);
        } else {
          console.error('验证失败: 文档不符合领域规范');

          if (processingResult.validation && processingResult.validation.errors) {
            processingResult.validation.errors.forEach(error => {
              console.error(`- ${error.message}`);
            });
          }

          // 如果是严格模式，验证失败时抛出错误
          if (strictMode) {
            console.error(`严格模式验证失败，终止处理`);
            throw new Error('文档验证失败');
          }

          // 非严格模式下只输出错误信息，不抛出异常
        }

        // 输出验证结果信息（不返回值，以符合void返回类型）
        console.log(`验证状态: ${processingResult.isValid ? '通过' : '失败'}`);
        console.log(`错误数量: ${processingResult.validation?.errors?.length || 0}`);
        console.log(`警告数量: ${processingResult.validation?.warnings?.length || 0}`);
      } catch (error) {
        console.error(`验证文档时出错: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }
  },
  {
    name: 'parse',
    description: '解析DPML文档并输出解析结果',
    args: [
      { name: 'file', description: 'DPML文件路径', required: true }
    ],
    options: [
      { flags: '--output <file>', description: '输出文件路径' },
      { flags: '--format <format>', description: '输出格式 (json|xml)', defaultValue: 'json' }
    ],
    action: async (actionContext, filePath, options) => {
      try {
        // 读取文件内容 - 确保filePath是字符串
        const content = await fs.readFile(filePath, 'utf-8');

        console.log(`解析文件: ${filePath}`);

        // 获取编译器
        const compiler = actionContext.getCompiler();

        // 解析DPML内容
        const parseResult = await parse(content);

        // 安全地提取文档
        const dpmlDocument = extractDPMLDocument(parseResult);

        // 安全地访问文档信息
        const rootTag = dpmlDocument.rootNode?.tagName || '未知';

        console.log(`成功解析文档，根节点: ${rootTag}`);
        console.log(`输出格式: ${options?.format || 'json'}`);

        // 获取并处理Schema
        const schema = compiler.getSchema();
        const processedSchema = processSchema(schema);

        // 确保Schema处理成功
        if (!processedSchema.isValid) {
          throw new CompilationError(`Schema定义无效: ${processedSchema.errors?.map(e => e.message).join('; ')}`);
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
          throw new Error(`不支持的输出格式: ${format}`);
        }

        // 输出结果
        if (options?.output) {
          await fs.writeFile(options.output, outputContent, 'utf-8');
          console.log(`结果已保存到: ${options.output}`);
        } else {
          console.log(`解析结果:`);
          console.log(outputContent);
        }

        // 不返回具体值，符合void返回类型
      } catch (error) {
        console.error(`解析文档时出错: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }
  }
];

export default standardActions;
