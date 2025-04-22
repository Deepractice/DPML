import { processDocument as processDocumentService } from '../core/processing/processingService';
import type { DPMLDocument, ProcessingResult, ProcessedSchema } from '../types';

/**
 * 处理文档
 * 基于提供的Schema验证文档，并提供验证结果和引用信息
 *
 * @param document - 要处理的DPML文档
 * @param schema - 用于验证的已处理Schema
 * @returns 处理结果，包含验证信息和引用映射
 *
 * @example
 * const result = processDocument(document, schema);
 * if (result.validation.isValid) {
 *   // 文档有效，可以继续处理
 * } else {
 *   // 处理验证错误
 *   result.validation.errors.forEach(error => console.error(error.message));
 * }
 */
export function processDocument<T extends ProcessingResult = ProcessingResult>(
  document: DPMLDocument,
  schema: ProcessedSchema<any>
): T {
  return processDocumentService<T>(document, schema);
}
