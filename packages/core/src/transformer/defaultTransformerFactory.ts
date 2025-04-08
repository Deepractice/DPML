import { Transformer } from './interfaces/transformer';
import { TransformerFactory } from './interfaces/transformerFactory';
import { TransformerOptions } from './interfaces/transformerOptions';
import { DefaultTransformer } from './defaultTransformer';
import { OutputAdapterFactory } from './interfaces/outputAdapterFactory';
import { JSONDocumentVisitor } from './visitors/jsonDocumentVisitor';
import { SpecialScenariosVisitor } from './visitors/specialScenariosVisitor';

/**
 * 默认转换器工厂实现
 */
export class DefaultTransformerFactory implements TransformerFactory {
  /**
   * 创建转换器
   * 
   * @param options 转换选项
   * @param adapterFactory 输出适配器工厂
   * @returns 转换器实例
   */
  createTransformer(options?: TransformerOptions, adapterFactory?: OutputAdapterFactory): Transformer {
    // 创建转换器实例
    const transformer = new DefaultTransformer(options);
    
    // 配置转换器
    if (options) {
      transformer.configure(options);
    }
    
    // 设置适配器工厂
    if (adapterFactory) {
      transformer.setOutputAdapterFactory(adapterFactory);
    }
    
    // 注册内置访问者
    this.registerBuiltinVisitors(transformer);
    
    return transformer;
  }

  /**
   * 注册内置访问者
   * 
   * @param transformer 转换器实例
   * @private
   */
  private registerBuiltinVisitors(transformer: DefaultTransformer): void {
    // 注册特殊场景访问者
    transformer.registerVisitor(new SpecialScenariosVisitor());
    
    // 添加更多内置访问者
    // ...
  }
} 