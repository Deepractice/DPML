// 处理器常量
export const PROCESSOR_VERSION = '1.0.0';

// 处理器错误码
export enum ProcessorErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'PROCESSOR_UNKNOWN_ERROR',
  // 引用错误
  REFERENCE_NOT_FOUND = 'PROCESSOR_REFERENCE_NOT_FOUND',
  REFERENCE_CYCLE = 'PROCESSOR_REFERENCE_CYCLE',
  // 处理错误
  INVALID_PROCESSOR = 'PROCESSOR_INVALID_PROCESSOR',
  MISSING_REQUIRED_TAG = 'PROCESSOR_MISSING_REQUIRED_TAG',
}

// 处理器默认选项
export const DEFAULT_PROCESSOR_OPTIONS = {
  strictMode: false,
  errorRecovery: true,
  registerBaseVisitors: true,
  registerBaseProtocolHandlers: true,
  registerTagProcessorVisitor: true,
}; 