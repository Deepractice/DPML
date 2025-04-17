/**
 * 转换选项接口
 *
 * 定义转换过程的配置选项
 */
export interface TransformOptions {
  /**
   * 输出格式
   * 例如: 'json', 'string', 'object' 等
   */
  format?: string;

  /**
   * 转换模式
   * strict: 严格模式，任何错误都会中断转换
   * lenient: 宽松模式，尝试处理错误并继续转换
   * ignore: 忽略模式，忽略错误并继续处理
   */
  mode?: 'strict' | 'loose' | 'lenient' | 'ignore';

  /**
   * 全局变量
   * 在整个转换过程中可用的变量
   */
  variables?: Record<string, any>;

  /**
   * 是否启用转换结果缓存
   * - true：启用缓存，相同节点的转换结果将被缓存
   * - false：禁用缓存，每次都重新计算转换结果
   */
  enableCache?: boolean;

  /**
   * 缓存大小限制
   * 当缓存项数量超过此值时，将使用LRU策略清理
   */
  cacheSize?: number;

  /**
   * 是否合并多个访问者的返回值
   * - true：合并所有访问者的返回值
   * - false：只使用第一个返回非null/undefined的访问者结果
   */
  mergeReturnValues?: boolean;

  /**
   * 是否对嵌套对象进行深度合并
   * - true：递归合并所有嵌套对象
   * - false：只合并顶层属性
   */
  deepMerge?: boolean;

  /**
   * 是否合并数组
   * - true：连接不同访问者返回的数组
   * - false：覆盖先前返回的数组
   */
  mergeArrays?: boolean;

  /**
   * 冲突解决策略
   * - first-wins：第一个返回值优先
   * - last-wins：最后一个返回值优先
   */
  conflictStrategy?: 'first-wins' | 'last-wins';

  /**
   * 自定义合并函数
   * 用于自定义处理不同访问者返回值的合并逻辑
   */
  customMergeFn?: (key: string, value1: any, value2: any) => any;

  /**
   * 错误处理阈值
   * 访问者连续抛出错误超过该阈值后将被禁用
   */
  errorThreshold?: number;

  /**
   * 是否跳过嵌套处理
   * - true：跳过默认的子节点处理逻辑
   * - false：自动处理子节点
   */
  skipNestedProcessing?: boolean;

  /**
   * 缓存过期时间（毫秒）
   * 缓存项超过此时间后将被视为过期
   */
  cacheExpiry?: number;

  /**
   * 其他扩展选项
   * 允许添加自定义选项
   */
  [key: string]: any;
}
