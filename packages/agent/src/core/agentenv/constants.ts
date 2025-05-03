/**
 * 环境变量引用的正则表达式模式
 * 匹配 @agentenv:ENV_NAME 格式
 */
export const ENV_VAR_PATTERN = /@agentenv:([A-Z0-9_]+)/g;

/**
 * 环境变量引用前缀
 */
export const ENV_VAR_PREFIX = '@agentenv:';
