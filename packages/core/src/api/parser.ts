/**
 * 解析模块API
 * 作为API层的薄层接口，直接委托模块服务层实现
 * 仅提供字符串内容解析，文件读取由调用方负责
 */

// 直接重导出解析服务
export { parse, parseAsync } from '../core/parsing/parsingService'; 