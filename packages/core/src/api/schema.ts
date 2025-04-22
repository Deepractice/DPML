/**
 * Schema 模块的 API 层。
 * 作为模块对外的统一入口，遵循薄层设计原则，直接委托给 Core 层的模块服务实现。
 * 注意：这个文件仅用于导出，不包含具体实现逻辑。
 */

export { processSchema } from '../core/schema/schemaService';
