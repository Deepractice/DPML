import { OutputAdapter } from '../interfaces/outputAdapter';
import { AdapterChain, AdapterChainOptions } from '../interfaces/adapterChain';
import { TransformContext } from '../interfaces/transformContext';

/**
 * 默认的适配器链实现
 * 
 * 提供按顺序执行多个适配器的功能，支持多种链式模式和错误处理策略
 */
export class DefaultAdapterChain implements AdapterChain {
  /**
   * 适配器数组
   * @private
   */
  private adapters: OutputAdapter[];
  
  /**
   * 链选项
   * @private 
   */
  private options: Required<AdapterChainOptions>;

  /**
   * 构造函数
   * @param options 链配置选项 
   */
  constructor(options?: AdapterChainOptions) {
    this.adapters = [];
    
    // 设置默认选项
    this.options = {
      stopOnEmpty: false,
      stopOnError: true,
      chainResults: true,
      ...options
    };
  }

  /**
   * 添加适配器到链尾部
   * 
   * @param adapter 要添加的适配器
   * @returns 适配器链本身，用于链式调用
   */
  add(adapter: OutputAdapter): AdapterChain {
    this.adapters.push(adapter);
    return this;
  }
  
  /**
   * 在指定索引位置插入适配器
   * 
   * @param index 要插入的位置
   * @param adapter 要插入的适配器
   * @returns 适配器链本身，用于链式调用
   */
  insert(index: number, adapter: OutputAdapter): AdapterChain {
    if (index < 0) {
      index = 0;
    } else if (index > this.adapters.length) {
      index = this.adapters.length;
    }
    
    this.adapters.splice(index, 0, adapter);
    return this;
  }
  
  /**
   * 移除指定索引位置的适配器
   * 
   * @param index 要移除的适配器索引
   * @returns 被移除的适配器，如果索引无效则返回null
   */
  remove(index: number): OutputAdapter | null {
    if (index < 0 || index >= this.adapters.length) {
      return null;
    }
    
    const removed = this.adapters[index];
    this.adapters.splice(index, 1);
    return removed;
  }
  
  /**
   * 获取链中的适配器数量
   * 
   * @returns 适配器数量
   */
  getSize(): number {
    return this.adapters.length;
  }
  
  /**
   * 清空适配器链
   */
  clear(): void {
    this.adapters = [];
  }
  
  /**
   * 获取链中的所有适配器
   * 
   * @returns 适配器数组
   */
  getAdapters(): OutputAdapter[] {
    return [...this.adapters];
  }
  
  /**
   * 适配结果
   * 
   * 执行链中的所有适配器，根据配置的链式策略处理结果
   * 
   * @param result 待适配的结果
   * @param context 转换上下文
   * @returns 适配后的结果
   */
  adapt(result: any, context: TransformContext): any {
    if (this.adapters.length === 0) {
      return result;
    }
    
    try {
      // 执行所有适配器
      const results = this.execute(result, context);
      
      // 返回最后一个结果
      if (results.length > 0) {
        return results[results.length - 1];
      }
      
      return result;
    } catch (error) {
      // 如果配置了stopOnError，则向上传播错误
      if (this.options.stopOnError) {
        throw error;
      }
      
      // 否则返回原始结果
      return result;
    }
  }
  
  /**
   * 执行适配器链
   * 
   * 这是对adapt方法的包装，但提供了更详细的控制和结果信息
   * 
   * @param result 要适配的结果
   * @param context 转换上下文
   * @returns 链中每个适配器的结果数组
   */
  execute(result: any, context: TransformContext): any[] {
    if (this.adapters.length === 0) {
      return [];
    }
    
    const results: any[] = [];
    let currentResult = result;
    
    // 执行链中的每个适配器
    for (const adapter of this.adapters) {
      try {
        // 根据chainResults选项决定输入源
        const input = this.options.chainResults ? currentResult : result;
        
        // 执行适配器
        const adapterResult = adapter.adapt(input, context);
        results.push(adapterResult);
        
        // 更新当前结果
        currentResult = adapterResult;
        
        // 如果配置了stopOnEmpty并且结果为null或undefined，则停止执行
        if (this.options.stopOnEmpty && (adapterResult === null || adapterResult === undefined)) {
          break;
        }
      } catch (error) {
        // 如果配置了stopOnError，则向上传播错误
        if (this.options.stopOnError) {
          throw error;
        }
        
        // 否则记录错误并继续
        results.push(null);
      }
    }
    
    return results;
  }
} 