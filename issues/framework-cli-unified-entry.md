# Framework作为CLI统一入口的改造方案

## 问题描述

当前的DPML命令行工具实现中，CLI的创建和命令注册分散在多个地方：
1. 用户通过`domainConfig`在framework层注册领域命令
2. `bin.ts`单独创建CLI实例并重复注册命令

这种设计导致了以下问题：
- **职责重叠**：命令注册逻辑在多处重复
- **知识泄露**：bin脚本需要了解过多内部实现细节
- **维护困难**：修改命令注册逻辑时需要修改多处代码
- **使用复杂**：用户需要理解多个API来创建完整的CLI工具

## 改造方案

### 1. 在Framework模块创建统一入口

创建一个`createDPMLCLI`函数，作为创建CLI的统一入口：

```typescript
// api/framework.ts 中添加
/**
 * 创建DPML命令行工具
 * 集成所有已注册领域命令，并处理默认领域的无前缀命令
 * 
 * @param options CLI选项
 * @returns 完全配置的CLI实例
 * 
 * @example
 * ```typescript
 * // 创建CLI并执行
 * const cli = createDPMLCLI({
 *   version: '1.0.0'
 * });
 * 
 * cli.execute();
 * ```
 */
export function createDPMLCLI(options?: CLIOptions): CLI {
  // 默认选项
  const cliOptions: CLIOptions = {
    name: options?.name || 'dpml',
    version: options?.version || VERSION,
    description: options?.description || 'DPML命令行工具 - 数据处理标记语言'
  };
  
  // 创建CLI实例
  const cli = createCLI(cliOptions, []);
  
  // 注册所有已注册的领域命令
  const commands = getAllRegisteredCommands();
  cli.registerCommands(commands);
  
  // 处理默认领域的无前缀命令(core领域)
  const defaultDomainCommands = commands
    .filter(cmd => cmd.category === 'core')
    .map(cmd => {
      // 创建命令的副本
      const unprefixedCmd = { ...cmd };
      
      // 移除category以避免前缀
      delete unprefixedCmd.category;
      
      // 移除领域前缀
      unprefixedCmd.name = unprefixedCmd.name.replace(/^core:/, '');
      
      return unprefixedCmd;
    });
    
  cli.registerCommands(defaultDomainCommands);
  
  return cli;
}
```

### 2. 简化bin.ts脚本

将bin.ts脚本简化为使用统一入口：

```typescript
#!/usr/bin/env node
/**
 * DPML命令行工具入口
 */

import { createDPMLCLI } from './api/framework';

// 创建CLI并执行
createDPMLCLI()
  .execute()
  .catch(error => {
    console.error('CLI执行失败:', error);
    process.exit(1);
  });
```

### 3. 确保预先注册core领域命令

在framework模块添加初始化函数，确保基本命令已注册：

```typescript
// 内部函数，确保core领域已注册
function ensureCoreCommandsRegistered(): void {
  // 获取已注册命令
  const registeredCommands = getAllRegisteredCommands();
  const hasCoreCommands = registeredCommands.some(cmd => cmd.category === 'core');
  
  // 如果尚未注册core命令，则注册
  if (!hasCoreCommands) {
    // 创建一个基本的领域上下文
    const coreContext = initializeDomain({
      domain: 'core',
      description: 'DPML核心领域',
      schema: { element: 'root' },
      transformers: [{ 
        name: 'default', 
        transform: data => data 
      }]
    });

    // 注册标准命令
    processDomainCommands({
      includeStandard: true,
      actions: []
    }, coreContext);
  }
}
```

## 好处

这种改造带来以下好处：

1. **符合单一职责原则**：Framework模块负责所有命令注册逻辑
2. **简化用户界面**：用户只需通过一个API创建完整CLI
3. **减少重复代码**：命令注册逻辑只在一个地方实现
4. **降低维护成本**：修改命令注册逻辑只需修改一处
5. **提高代码内聚性**：相关的功能集中在一个模块中实现

## 实现步骤

1. 在framework.ts中添加`createDPMLCLI`函数
2. 添加`ensureCoreCommandsRegistered`内部函数
3. 简化bin.ts脚本
4. 更新文档和示例，反映新的API使用方式
5. 添加适当的测试确保功能正常

## 注意事项

- 确保向后兼容，已有的API不应改变行为
- 适当添加文档注释说明新API的使用方式
- 考虑为`createDPMLCLI`函数添加更多选项，例如自定义默认领域 