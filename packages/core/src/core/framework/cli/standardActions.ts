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
    executor: async (context, file, options) => {
      try {
        // 读取文件内容
        const content = await fs.readFile(file, 'utf-8');

        console.log(`读取文件: ${file}`);

        // 处理Schema
        const processedSchema = processSchema(context.schema);

        // 确保Schema处理成功
        if (!processedSchema.isValid) {
          throw new CompilationError(`Schema定义无效: ${processedSchema.errors?.map(e => e.message).join('; ')}`);
        }

        // 解析DPML内容
        const document = await parse(content);

        console.log(`解析文件成功: ${file}`);

        // 使用领域上下文中的schema进行验证
        const strictMode = options?.strict !== undefined ? options.strict : context.options.strictMode;

        console.log(`验证模式: ${strictMode ? '严格' : '标准'}`);

        // 处理并验证文档
        const processingResult = processDocument(document, processedSchema);

        // 输出验证结果
        if (processingResult.isValid) {
          console.log('验证成功: 文档符合领域规范');
        } else {
          console.error('验证失败: 文档不符合领域规范');

          if (processingResult.validation && processingResult.validation.errors) {
            processingResult.validation.errors.forEach(error => {
              console.error(`- ${error.message}`);
            });
          }

          // 如果是严格模式，验证失败时抛出错误
          console.log(`严格模式状态: ${strictMode}`);
          if (strictMode) {
            console.log('即将抛出错误: 文档验证失败');
            throw new Error('文档验证失败');
          }

          // 非严格模式下只输出错误信息，不抛出异常
          console.log('非严格模式，不抛出错误');
        }

        // 返回验证结果
        return {
          isValid: processingResult.isValid,
          errors: processingResult.validation?.errors || [],
          warnings: processingResult.validation?.warnings || []
        };
      } catch (error) {
        console.error(`验证文档时出错: ${error.message}`);
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
    executor: async (context, file, options) => {
      try {
        // 读取文件内容
        const content = await fs.readFile(file, 'utf-8');

        console.log(`读取文件: ${file}`);

        // 解析DPML内容
        const document = await parse(content);

        console.log(`解析文件成功: ${file}`);

        // 处理Schema
        const processedSchema = processSchema(context.schema);

        // 确保Schema处理成功
        if (!processedSchema.isValid) {
          throw new CompilationError(`Schema定义无效: ${processedSchema.errors?.map(e => e.message).join('; ')}`);
        }

        // 处理文档
        const processingResult = processDocument(document, processedSchema);

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
          console.log('解析结果:');
          console.log(outputContent);
        }

        // 返回处理结果
        return result;
      } catch (error) {
        console.error(`解析文档时出错: ${error.message}`);
        throw error;
      }
    }
  }
];

export default standardActions;
