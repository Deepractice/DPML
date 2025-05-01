# 优化CLI命令格式 - 从冒号分隔符改为空格分隔符

## 问题描述

当前DPML CLI命令使用 `domain:command` 格式表示领域命令，例如 `dpml core:validate file.dpml`。这种格式不符合现代CLI工具的常规做法，不够直观。

## 改进目标

将命令格式从当前的 `dpml domain:command` 改为更标准的层次化结构 `dpml domain command`，例如将 `dpml core:validate file.dpml` 改为 `dpml core validate file.dpml`。

## 实现方案

已完成实现，主要修改了以下几个关键部分：

1. **修改 `getCommandPath` 函数**
   - 在 `commandUtils.ts` 中，将领域前缀改为空格分隔的父命令格式
   - 将 `${command.category}:${path}` 改为 `${command.category} ${path}`

2. **修改 `findParentCommand` 方法**
   - 在 `CLIAdapter.ts` 中，更新方法以处理空格分隔的命令路径
   - 拆分路径时使用空格而不是冒号作为分隔符

3. **修改命令注册逻辑**
   - 在 `domainService.ts` 中，为每个领域创建父命令
   - 将领域下的子命令注册为父命令的子命令，使用 `category` 属性标记父命令

4. **完善其他相关代码**
   - 确保帮助信息显示正确，适应新的层次化结构

## 实现效果

修改前的命令结构：
```
dpml core:validate file.dpml
dpml core:parse file.dpml
```

修改后的命令结构：
```
dpml core validate file.dpml
dpml core parse file.dpml
```

新的命令结构保留了原来的别名功能，用户仍然可以使用：
```
dpml validate file.dpml  # 核心领域命令的别名
```

## 优势

1. 更符合现代CLI工具的标准做法（如 git, npm, docker 等）
2. 命令层次结构更清晰，便于拓展
3. 帮助信息更有条理，更易于理解
4. 为未来添加子命令提供了更自然的结构

## 已完成测试

已验证以下功能：
- ✅ `dpml` 显示正确的帮助信息，包括领域列表
- ✅ `dpml core --help` 显示该领域下可用的命令
- ✅ 别名命令（无领域前缀）仍然可用

## 注意事项

该修改是向后兼容的API变更，不会破坏现有的用法。用户可以继续使用旧的命令格式，但在文档和示例中将推荐使用新格式。
