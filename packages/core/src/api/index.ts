/**
 * API入口文件
 * 导出所有公共API
 */

export {
  parse,
  parseFile,
  parseWithRegistry
} from './ParserService';

export {
  getTagRegistry,
  registerTag,
  registerTags,
  createTagRegistry
} from './TagRegistryService';
