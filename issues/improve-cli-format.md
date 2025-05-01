# 优化CLI命令格式 - 从冒号分隔符改为空格分隔符

## 问题描述

当前DPML命令行格式使用冒号分隔符表示领域和命令的关系，例如：
```
dpml core:validate xxx.dpml
dpml core:parse xxx.dpml
```

这种格式与主流命令行工具（如git、npm等）的使用习惯不一致。更符合用户习惯的格式应该是空格分隔的子命令，例如：
```
dpml core validate xxx.dpml
dpml core parse xxx.dpml
```

## 解决方案

### 1. 修改命令路径构建方式

主要修改位置在`getCommandPath`函数中，将领域作为子命令而不是前缀：

```typescript
// packages/core/src/core/cli/commandUtils.ts
export function getCommandPath(command: CommandDefinition, parentPath?: string): string {
  // 构建基本路径
  let path = command.name;

  // 添加父路径前缀（使用空格分隔）
  if (parentPath) {
    path = `${parentPath} ${path}`;
  }

  // 添加领域作为父命令（而非前缀）
  if (command.category && !parentPath) {
    path = `${command.category} ${path}`;  // 使用空格替代冒号
  }

  return path;
}
```

### 2. 修改命令注册逻辑

当前我们为每个命令直接注册，但新方式下需要先为每个领域创建顶级命令：

```typescript
export function setupDomainCommands(adapter: CLIAdapter, domain: string, commands: CommandDefinition[]): void {
  // 先创建领域顶级命令
  const domainCommand: CommandDefinition = {
    name: domain,
    description: `${domain}领域命令`,
    action: () => {
      // 显示帮助信息
      console.log(`使用 'dpml ${domain} <command>' 执行特定命令`);
      console.log(`可用命令：${commands.map(cmd => cmd.name).join(', ')}`);
    }
  };

  // 注册领域顶级命令
  adapter.setupCommand(domainCommand);

  // 将所有命令作为子命令注册
  for (const command of commands) {
    // 创建子命令
    adapter.setupCommand({
      ...command,
      name: command.name.replace(/^.*:/, '') // 移除可能已有的前缀
    }, domain); // 指定父路径为领域名
  }
}
```

### 3. 调整命令查找逻辑

修改`findParentCommand`函数，适应新的命令结构：

```typescript
private findParentCommand(parentPath: string): Command {
  // 拆分父路径，可能包含多层
  const parts = parentPath.split(' ');
  
  // 在命令树中查找
  let currentCommand = this.program;
  
  for (const part of parts) {
    const subCmd = currentCommand.commands.find(cmd => cmd.name() === part);
    if (!subCmd) {
      throw new Error(`找不到命令: ${part} (在路径 ${parentPath} 中)`);
    }
    currentCommand = subCmd;
  }
  
  return currentCommand;
}
```

### 4. 处理默认领域的无前缀命令

对于默认领域（core），我们仍然可以支持直接使用命令而不带领域的形式：

```typescript
// 注册core领域命令的快捷方式
if (domain === 'core') {
  for (const command of commands) {
    // 直接在根级别注册，没有父命令
    adapter.setupCommand({
      ...command,
      name: command.name.replace(/^.*:/, '') // 移除可能已有的前缀
    });
  }
}
```

### 5. 修改测试用例

更新相关测试用例以适应新的命令格式：

```typescript
// 应处理领域前缀
it('应处理领域作为父命令', () => {
  // 准备测试数据
  const command: CommandDefinition = {
    name: 'test',
    description: 'Test Command',
    category: 'custom',
    action: () => {}
  };

  // 执行测试
  const path = getCommandPath(command);

  // 验证结果
  expect(path).toBe('custom test');
});
```

## 优势

1. **命令格式更直观**：符合用户习惯，如`dpml core validate`而不是`dpml core:validate`
2. **更好的层次结构**：清晰表示领域和命令的层次关系
3. **符合行业标准**：与git、npm等流行工具的命令格式一致
4. **更好的帮助信息**：在显示帮助时可以按领域进行分组
5. **更易扩展**：可以方便地增加更深层次的子命令

## 兼容性考虑

为了保持兼容性，可以在一段时间内同时支持两种格式：
1. 新的空格分隔格式作为推荐用法
2. 旧的冒号分隔格式作为别名保留一段时间，并在使用时给出警告
3. 在文档中明确说明格式变更 