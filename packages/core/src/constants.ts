/**
 * Constants for the DPML language
 */

/**
 * Current DPML version
 */
export const CURRENT_VERSION = '1.0';

/**
 * Default parsing mode
 */
export const DEFAULT_PARSING_MODE = 'loose';

/**
 * Default reference mode
 */
export const DEFAULT_REF_MODE = 'extend';

/**
 * Extension attribute prefix
 */
export const EXTENSION_PREFIX = 'x-';

/**
 * Reference symbol
 */
export const REFERENCE_SYMBOL = '@';

/**
 * Fragment symbol for references
 */
export const FRAGMENT_SYMBOL = '#';

/**
 * Support URI protocols
 */
export const SUPPORTED_PROTOCOLS = ['http', 'https', 'file', 'data'];

/**
 * Core tag names
 * (These are just examples and not part of the specification itself)
 */
export const CORE_TAGS = {
  ROOT: 'prompt',
  ROLE: 'role',
  THINKING: 'thinking',
  EXECUTING: 'executing',
  TASK: 'task',
  REFERENCE: 'reference',
};

/**
 * 项目常量定义
 * 
 * 包含所有核心功能所需的常量值
 */

//=============================================================================
// 解析器相关常量
//=============================================================================

export const PARSER_ERROR_MESSAGES = {
  INVALID_TAG: '无效的标签',
  UNKNOWN_TAG: '未知的标签',
  INVALID_ATTRIBUTE: '无效的属性',
  MISSING_REQUIRED_ATTRIBUTE: '缺少必需的属性',
  INVALID_CHILD_TAG: '无效的子标签',
  PARSE_ERROR: '解析错误',
};

export const PARSER_DEFAULT_OPTIONS = {
  allowUnknownTags: true,
  tolerant: false,
  preserveComments: false,
  validate: false,
  mode: 'loose',
};

//=============================================================================
// 处理器相关常量
//=============================================================================

// 处理器版本
export const PROCESSOR_VERSION = '1.0.0';

// 处理器错误码
export enum PROCESSOR_ERROR_CODE {
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
export const PROCESSOR_DEFAULT_OPTIONS = {
  strictMode: false,
  errorRecovery: true,
  registerBaseVisitors: true,
  registerBaseProtocolHandlers: true,
  registerTagProcessorVisitor: true,
};

//=============================================================================
// 转换器相关常量
//=============================================================================

// 暂无转换器常量
