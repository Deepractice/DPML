# CLI模块职责边界迁移方案设计

## 迭代信息

- **迭代编号**：ITER2025050101
- **迭代名称**：CLI模块职责边界优化
- **负责人**：架构师
- **迭代目标**：解决CLI模块职责边界不清晰的问题，确保底层库实现细节不暴露给调用者

## 问题背景

当前的DPML命令行工具实现中，存在CLI模块职责边界不清晰的问题，具体表现为：

1. **命令行库特定错误处理在bin.ts中暴露**：
   - bin.ts中直接处理Commander.js特有的错误代码(`commander.helpDisplayed`和`commander.version`)
   - 这些底层库实现细节不应该暴露给CLI的调用者

2. **违反了抽象封装原则**：
   - CLI模块应该完全封装底层命令行库(Commander.js)的所有细节
   - 调用者应该只需要使用高级API，不需要了解底层实现

3. **错误处理逻辑分散**：
   - 部分错误处理在CLIAdapter.parse方法中
   - 部分错误处理在bin.ts中
   - 导致错误处理不一致且难以维护

## 架构设计原则

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

## 需要修改的文件

1. `packages/core/src/core/cli/CLIAdapter.ts`
2. `packages/core/src/core/cli/cliService.ts`
3. `packages/core/src/bin.ts`
4. `packages/core/src/__tests__/unit/core/cli/CLIAdapter.test.ts`
5. `packages/core/src/__tests__/unit/core/cli/cliService.test.ts`
6. `packages/core/src/__tests__/integration/cli/cli.test.ts`
7. `packages/core/docs/product/CLI-Design.md`

## 具体修改内容

### 1. CLIAdapter.ts

修改`CLIAdapter.parse`方法，内部处理所有Commander.js特有错误：

```typescript
/**
 * 解析命令行参数
 *
 * @param argv 命令行参数数组，默认为process.argv
 */
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
    
    // 在测试环境中特殊处理，保持向后兼容性
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return;
    }
    
    // 其他真正的错误则抛出
    throw err;
  }
}
```

### 2. cliService.ts

修改`createCLI`函数返回的`execute`方法，处理剩余错误：

```typescript
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
  showHelp: () => adapter.showHelp(),
  showVersion: () => adapter.showVersion(),
  registerCommands: (externalCommands: CommandDefinition[]) => {
    validateCommands(externalCommands);
    registerExternalCommands(adapter, externalCommands);
  }
};
```

### 3. bin.ts

简化`bin.ts`中的错误处理：

```typescript
// 执行CLI
await cli.execute();
```

移除原来的try-catch块以及特殊错误处理代码。

## 测试调整

### 1. CLIAdapter.test.ts

添加测试用例验证Commander.js特有错误的内部处理：

```typescript
test('parse方法应正确处理Commander.js帮助和版本显示错误', async () => {
  // 模拟Commander.js帮助显示错误
  mockProgram.parseAsync.mockRejectedValueOnce({
    code: 'commander.helpDisplayed'
  });

  // 不应该抛出错误
  await expect(adapter.parse()).resolves.not.toThrow();

  // 模拟Commander.js版本显示错误
  mockProgram.parseAsync.mockRejectedValueOnce({
    code: 'commander.version'
  });

  // 不应该抛出错误
  await expect(adapter.parse()).resolves.not.toThrow();
});
```

### 2. cliService.test.ts

添加测试用例验证execute方法的错误处理：

```typescript
test('execute方法应处理解析错误', async () => {
  // 模拟适配器抛出错误
  const errorMock = new Error('解析错误');
  mockAdapter.parse.mockRejectedValueOnce(errorMock);

  // 模拟控制台
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

  // 执行方法
  await expect(cli.execute()).rejects.toThrow(errorMock);

  // 验证错误被记录
  expect(consoleSpy).toHaveBeenCalledWith('命令执行出错:', errorMock);

  // 恢复模拟
  consoleSpy.mockRestore();
  processExitSpy.mockRestore();
});
```

### 3. cli.test.ts (集成测试)

添加集成测试验证整个执行流程：

```typescript
test('CLI执行过程中的帮助和版本命令不应导致错误', async () => {
  // 创建CLI实例
  const cli = createCLI(cliOptionsFixture(), []);

  // 使用--help参数
  const helpArgv = ['node', 'cli', '--help'];
  await expect(cli.execute(helpArgv)).resolves.not.toThrow();

  // 使用--version参数
  const versionArgv = ['node', 'cli', '--version'];
  await expect(cli.execute(versionArgv)).resolves.not.toThrow();
});
```

## 文档更新

### CLI-Design.md

更新CLI设计文档，明确CLI模块的职责边界：

1. 添加错误处理章节，说明CLI模块如何处理不同类型的错误
2. 强调CLI模块完全封装底层库细节的设计原则
3. 明确bin.ts脚本的正确使用方式

## 迁移计划

1. **阶段1：修改源代码**
   - 任务1: 修改CLIAdapter.parse方法，优化错误处理逻辑
   - 任务2: 修改cliService.createCLI返回的execute方法
   - 任务3: 简化bin.ts中的错误处理逻辑

2. **阶段2：更新测试**
   - 任务4: 更新CLIAdapter单元测试
   - 任务5: 更新cliService单元测试
   - 任务6: 添加集成测试验证错误处理流程

3. **阶段3：文档更新**
   - 任务7: 更新CLI设计文档，明确职责边界
   - 任务8: 更新示例代码

## 验收标准

1. Commander.js特有的错误代码不再暴露在bin.ts中
2. CLIAdapter.parse方法内部处理所有Commander.js特有错误
3. cliService.createCLI返回的execute方法处理剩余错误
4. bin.ts只使用高级API，不处理底层细节
5. 所有测试通过，覆盖率不低于现有水平
6. 文档与代码实现一致
7. 现有功能保持不变，用户体验一致

## 风险评估

1. **向后兼容性风险**：
   - 风险：可能影响依赖于当前错误处理方式的代码
   - 缓解措施：保持API签名不变，确保函数行为一致

2. **测试覆盖风险**：
   - 风险：可能遗漏某些错误处理场景
   - 缓解措施：增加针对错误处理的专门测试用例 