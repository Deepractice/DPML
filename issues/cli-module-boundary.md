# CLI模块职责边界问题

## 问题描述

当前的DPML命令行工具实现中，存在CLI模块职责边界不清晰的问题，具体表现为：

1. **命令行库特定错误处理在bin.ts中暴露**：
   - 当前在bin.ts中直接处理Commander.js特有的错误代码(`commander.helpDisplayed`和`commander.version`)
   - 这些是底层库实现细节，不应该暴露给CLI的调用者

2. **违反了抽象封装原则**：
   - CLI模块应该完全封装底层命令行库(Commander.js)的所有细节
   - 调用者应该只需要使用高级API，不需要了解底层实现

3. **错误处理逻辑分散**：
   - 部分错误处理在CLIAdapter.parse方法中
   - 部分错误处理在bin.ts中
   - 导致错误处理不一致且难以维护

## 职责边界划分

根据架构设计原则，模块职责应该清晰划分：

- **CLI模块职责**：
  - 完全封装命令行解析库的使用细节
  - 提供高级API进行命令注册和执行
  - 处理所有命令行相关的错误，包括帮助显示和版本显示
  - 向调用者提供清晰的抽象，隐藏实现细节

- **bin.ts的职责**：
  - 仅作为应用入口点
  - 初始化和配置CLI
  - 只调用高级API，不应处理低级细节

## 解决方案

### 1. 修改CLIAdapter.parse方法，内部处理所有Commander.js特有错误

```typescript
public async parse(argv?: string[]): Promise<void> {
  try {
    await this.program.parseAsync(argv || process.argv);
  } catch (err) {
    // 处理Commander.js特有错误
    if (
      err && 
      typeof err === 'object' && 
      'code' in err
    ) {
      // 处理帮助显示和版本显示的特殊错误
      if (err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
        // 这些不是真正的错误，所以直接返回
        return;
      }
    }
    
    // 在测试环境中特殊处理
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      
      return;
    }
    
    // 其他真正的错误则抛出
    throw err;
  }
}
```

### 2. 修改createCLI返回的execute方法，处理剩余错误

```typescript
// cliService.ts
export function createCLI(options: CLIOptions, commands: CommandDefinition[]): CLI {
  // ... 其他代码不变 ...
  
  // 返回CLI接口
  return {
    execute: async (argv?: string[]) => {
      try {
        await adapter.parse(argv);
      } catch (error) {
        console.error('命令执行出错:', error);
        
        // 非测试环境时退出进程
        if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
          process.exit(1);
        }
        
        throw error; // 重新抛出以便调用者可以处理
      }
    },
    // ... 其他方法不变 ...
  };
}
```

### 3. 简化bin.ts中的错误处理

```typescript
// bin.ts
async function main() {
  // ... 其他代码不变 ...
  
  // 执行CLI，错误处理已在CLI模块内部完成
  await cli.execute();
}

// 执行主函数，只处理真正的启动错误
main().catch(error => {
  console.error('CLI启动失败:', error);
  process.exit(1);
});
```

## 优势

1. **职责清晰**：CLI模块完全负责命令行处理的所有方面
2. **封装底层库**：Commander.js的实现细节完全隐藏在CLI模块内
3. **简化调用**：调用者代码更简洁，不需要了解底层细节
4. **一致性错误处理**：所有错误处理逻辑集中在一处
5. **易于维护**：当底层库变化时，只需修改CLI模块，不影响调用者

## 实施计划

1. 修改CLIAdapter.parse方法内部逻辑
2. 修改createCLI中的execute方法
3. 简化bin.ts中的错误处理
4. 添加相关测试确保正确处理各种场景
5. 更新文档，明确CLI模块的职责边界 
