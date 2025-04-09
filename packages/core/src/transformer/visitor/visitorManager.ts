import { TransformerVisitor } from '../interfaces/transformerVisitor';

/**
 * 访问者管理器
 * 负责管理所有的访问者，包括注册、排序、启用和禁用功能
 */
export class VisitorManager {
  /**
   * 访问者数组
   * @private
   */
  private visitors: TransformerVisitor[] = [];
  
  /**
   * 被禁用的访问者集合
   * @private
   */
  private disabledVisitors: Set<string> = new Set();
  
  /**
   * 访问者错误计数映射
   * @private
   */
  private visitorErrorCounts: Map<string, number> = new Map();
  
  /**
   * 访问者禁用时间戳映射
   * @private
   */
  private visitorDisableTimestamps: Map<string, number> = new Map();
  
  /**
   * 错误阈值
   * @private
   */
  private errorThreshold: number;
  
  /**
   * 自动恢复时间（毫秒）
   * 如果设置为正数，被禁用的访问者在指定时间后将自动恢复
   * 默认为0（禁用自动恢复）
   * @private
   */
  private autoRecoveryTime: number;
  
  /**
   * 构造函数
   * @param errorThreshold 错误阈值，超过此值将自动禁用访问者
   * @param autoRecoveryTime 自动恢复时间（毫秒），0表示不自动恢复
   */
  constructor(errorThreshold: number = 3, autoRecoveryTime: number = 0) {
    this.errorThreshold = errorThreshold;
    this.autoRecoveryTime = autoRecoveryTime;
    this.visitors = [];
    this.disabledVisitors = new Set();
    this.visitorErrorCounts = new Map();
    this.visitorDisableTimestamps = new Map();
  }
  
  /**
   * 注册访问者
   * @param visitor 访问者
   */
  registerVisitor(visitor: TransformerVisitor): void {
    if (!visitor) {
      console.warn('尝试注册undefined访问者');
      return;
    }
    
    // 检查访问者是否已经注册
    const existingIndex = this.findVisitorIndex(visitor);
    if (existingIndex !== -1) {
      // 更新现有访问者
      this.visitors[existingIndex] = visitor;
    } else {
      // 添加新访问者
      this.visitors.push(visitor);
    }
    
    // 注册后重新排序
    this.sortVisitors();
  }
  
  /**
   * 查找访问者索引
   * @param visitor 访问者
   * @returns 访问者索引，如果不存在返回-1
   * @private
   */
  private findVisitorIndex(visitor: TransformerVisitor): number {
    if (!visitor.name) {
      return -1;
    }
    
    return this.visitors.findIndex(v => v.name === visitor.name);
  }
  
  /**
   * 排序访问者
   * 按优先级从高到低排序，优先级相同的保持注册顺序
   * @private
   */
  private sortVisitors(): void {
    // 使用稳定排序，保证同优先级的访问者保持注册顺序
    this.visitors.sort((a, b) => {
      const priorityA = typeof a.priority === 'number' ? a.priority : 0;
      const priorityB = typeof b.priority === 'number' ? b.priority : 0;
      return priorityB - priorityA; // 从高到低排序
    });
  }
  
  /**
   * 获取所有访问者
   * @returns 访问者数组
   */
  getAllVisitors(): TransformerVisitor[] {
    return [...this.visitors];
  }
  
  /**
   * 获取具有特定方法的访问者
   * @param methodName 方法名称
   * @returns 具有特定方法的访问者数组
   */
  getVisitorsByMethod(methodName: string): TransformerVisitor[] {
    // 检查并恢复被自动禁用的访问者
    this.checkAndRecoverDisabledVisitors();
    
    // 返回所有具有特定方法且未被禁用的访问者，并且保持优先级排序
    return this.visitors.filter(visitor => {
      // 检查访问者是否被禁用
      const isDisabled = visitor.name ? this.disabledVisitors.has(visitor.name) : false;
      
      // 只返回未禁用且具有指定方法的访问者
      return !isDisabled && typeof (visitor as any)[methodName] === 'function';
    });
  }
  
  /**
   * 按标签名获取访问者
   * @param tagName 标签名
   * @returns 可处理特定标签的访问者数组
   */
  getVisitorsByTagName(tagName: string): TransformerVisitor[] {
    // 检查并恢复被自动禁用的访问者
    this.checkAndRecoverDisabledVisitors();
    
    return this.visitors.filter(visitor => {
      // 检查访问者是否被禁用
      const isDisabled = visitor.name ? this.disabledVisitors.has(visitor.name) : false;
      if (isDisabled) {
        return false;
      }
      
      // 检查访问者是否有支持的标签列表
      if (Array.isArray((visitor as any).supportedTags)) {
        return (visitor as any).supportedTags.includes(tagName);
      }
      
      // 默认处理所有标签
      return true;
    });
  }
  
  /**
   * 通过名称获取访问者
   * @param name 访问者名称
   * @returns 访问者或undefined
   */
  getVisitorByName(name: string): TransformerVisitor | undefined {
    return this.visitors.find(visitor => visitor.name === name);
  }
  
  /**
   * 禁用访问者
   * @param visitorName 访问者名称
   * @param reason 禁用原因
   * @returns 是否成功禁用
   */
  disableVisitor(visitorName: string, reason: string = '未指定原因'): boolean {
    const visitor = this.getVisitorByName(visitorName);
    if (!visitor) {
      console.warn(`无法禁用未注册的访问者: ${visitorName}`);
      return false;
    }
    
    if (!this.disabledVisitors.has(visitorName)) {
      this.disabledVisitors.add(visitorName);
      
      // 记录禁用时间戳
      this.visitorDisableTimestamps.set(visitorName, Date.now());
      
      // 记录禁用消息，包含错误计数和阈值
      const errorCount = this.getErrorCount(visitorName);
      console.warn(`访问者 ${visitorName} 已禁用: ${reason}${errorCount > 0 ? `（错误次数：${errorCount}/${this.errorThreshold}）` : ''}`);
      
      // 如果启用了自动恢复，记录恢复信息
      if (this.autoRecoveryTime > 0) {
        const recoveryTimeInSeconds = this.autoRecoveryTime / 1000;
        console.warn(`[自动恢复] 访问者 ${visitorName} 将在 ${recoveryTimeInSeconds} 秒后自动恢复`);
      }
      
      return true;
    }
    
    return false; // 已经禁用
  }
  
  /**
   * 启用访问者
   * @param visitorName 访问者名称
   * @returns 是否成功启用
   */
  enableVisitor(visitorName: string): boolean {
    const visitor = this.getVisitorByName(visitorName);
    if (!visitor) {
      console.warn(`无法启用未注册的访问者: ${visitorName}`);
      return false;
    }
    
    if (this.disabledVisitors.has(visitorName)) {
      this.disabledVisitors.delete(visitorName);
      // 重置错误计数
      this.resetErrorCount(visitorName);
      // 清除禁用时间戳
      this.visitorDisableTimestamps.delete(visitorName);
      
      console.log(`访问者 ${visitorName} 已启用`);
      return true;
    }
    
    return false; // 已经启用
  }
  
  /**
   * 重置错误计数
   * @param visitorName 访问者名称
   */
  resetErrorCount(visitorName: string): void {
    if (visitorName) {
      this.visitorErrorCounts.set(visitorName, 0);
    }
  }
  
  /**
   * 增加错误计数
   * @param visitorName 访问者名称
   * @param errorMsg 错误信息
   * @returns 当前错误计数
   */
  incrementErrorCount(visitorName: string, errorMsg: string = ''): number {
    if (!visitorName) {
      return 0;
    }
    
    // 获取当前错误计数
    const currentCount = this.getErrorCount(visitorName);
    const newCount = currentCount + 1;
    
    // 更新错误计数
    this.visitorErrorCounts.set(visitorName, newCount);
    
    // 检查是否超过阈值
    if (newCount >= this.errorThreshold) {
      const reason = `错误次数超过阈值 (${newCount}/${this.errorThreshold})${errorMsg ? ': ' + errorMsg : ''}`;
      this.disableVisitor(visitorName, reason);
    }
    
    return newCount;
  }
  
  /**
   * 获取错误计数
   * @param visitorName 访问者名称
   * @returns 当前错误计数
   */
  getErrorCount(visitorName: string): number {
    return this.visitorErrorCounts.get(visitorName) || 0;
  }
  
  /**
   * 设置自动恢复时间
   * @param timeInMs 自动恢复时间（毫秒），0表示不自动恢复
   */
  setAutoRecoveryTime(timeInMs: number): void {
    this.autoRecoveryTime = timeInMs;
  }
  
  /**
   * 检查是否有被禁用的访问者可以自动恢复
   * @private
   */
  private checkAndRecoverDisabledVisitors(): void {
    // 如果未启用自动恢复，直接返回
    if (this.autoRecoveryTime <= 0) {
      return;
    }
    
    const now = Date.now();
    
    // 检查所有被禁用的访问者
    for (const visitorName of this.disabledVisitors) {
      const disableTime = this.visitorDisableTimestamps.get(visitorName);
      if (disableTime && (now - disableTime) >= this.autoRecoveryTime) {
        // 已经超过了自动恢复时间，恢复此访问者
        this.enableVisitor(visitorName);
        console.info(`访问者 ${visitorName} 已自动恢复`);
      }
    }
  }
}