# 重构CLI服务API以符合领域设计原则

## 问题描述

当前`createDPMLCLIService`函数的设计存在职责不清晰的问题。该函数同时接受两个参数：
1. `options?: Partial<CLIOptions>` - CLI模块的配置选项
2. `domainConfig?: DomainConfig` - 领域配置

这种设计混合了不同模块的关注点，违反了单一职责原则和关注点分离原则。

## 技术分析

1. `CLIOptions`是CLI模块的内部接口类型，不应该在Framework层的API中暴露
2. Framework层的函数应该只接受领域相关的配置（`DomainConfig`）
3. CLI相关的配置应该在内部从`DomainConfig`中提取并适配
4. 当前设计使得API调用者需要了解两个不同层次的配置结构

## 修改建议

将`createDPMLCLIService`函数重构为仅接受`DomainConfig`：

```typescript
/**
 * 创建DPML命令行工具服务
 * @param config 领域配置
 * @returns 配置完成的CLI实例
 */
export function createDPMLCLIService(config: DomainConfig): CLI {
  // 确保核心命令已注册
  ensureCoreInitialized();
  
  // 从DomainConfig提取CLI选项
  const cliOptions: CLIOptions = {
    name: config.domain || 'dpml',
    version: VERSION,
    description: config.description || '领域DPML命令行工具',
    defaultDomain: config.domain
  };

  // 初始化领域上下文并处理命令
  const context = initializeDomain(config);
  
  // 处理领域命令(如果存在)
  if (config.commands) {
    processDomainCommands(config.commands, context);
  }
  
  // 创建CLI实例并配置
  // ... 其余逻辑保持不变
}
```

## 影响范围

1. `framework.ts`中对`createDPMLCLIService`的调用需要调整
2. 任何直接使用`createDPMLCLIService`的代码需要更新
3. 测试代码需要更新以适应新的API

## 好处

1. API更加简洁明了，职责更加单一
2. 不再暴露CLI模块的内部结构到Framework层
3. 提高了API的内聚性
4. 更符合"最小知识原则"，调用者只需了解领域配置 