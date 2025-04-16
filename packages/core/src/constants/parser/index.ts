/**
 * Parser 相关常量
 */

export const ERROR_MESSAGES = {
  INVALID_TAG: '无效的标签',
  UNKNOWN_TAG: '未知的标签',
  INVALID_ATTRIBUTE: '无效的属性',
  MISSING_REQUIRED_ATTRIBUTE: '缺少必需的属性',
  INVALID_CHILD_TAG: '无效的子标签',
  PARSE_ERROR: '解析错误',
};

export const DEFAULT_OPTIONS = {
  allowUnknownTags: true,
  tolerant: false,
  preserveComments: false,
  validate: false,
  mode: 'loose',
}; 