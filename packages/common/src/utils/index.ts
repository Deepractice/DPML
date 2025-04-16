/**
 * 通用工具函数模块
 *
 * 提供字符串处理、数组操作、对象处理、异步操作、路径处理和平台工具等通用功能。
 * 按功能分类组织，支持部分导入以减少依赖。
 */

// 使用具名导出避免命名冲突
import * as stringUtils from './string';
import * as arrayUtils from './array';
import * as objectUtils from './object';
import * as asyncUtils from './async';
import * as pathUtils from './path';
import * as platformUtils from './platform';
import * as validationUtils from './validation';
import * as errorUtils from './error';
import * as storageUtils from './storage';

// 导出所有子模块，使用命名空间避免冲突
export {
  stringUtils as string,
  arrayUtils as array,
  objectUtils as object,
  asyncUtils as async,
  pathUtils as path,
  platformUtils as platform,
  validationUtils as validation,
  errorUtils as error,
  storageUtils as storage
};

// 也可以选择性地直接导出不冲突的函数，例如：
// export { formatString, capitalize } from './string';
// export { chunk, unique } from './array';
// 等等...