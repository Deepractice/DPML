# 修复Framework API中的CLI配置传递缺陷

## 问题描述

当前Framework API中的`createDomainDPML`函数在创建CLI服务时没有传递领域配置，导致CLI命令无法正确编译DPML文档，表现为命令执行时得到空对象，进而导致`Cannot read properties of undefined (reading 'length')`等错误。

## 复现步骤

1. 创建一个使用`@dpml/core`的领域包（如example包）
2. 使用`createDomainDPML`函数创建领域实例
3. 定义领域相关的transformer和schema
4. 尝试通过CLI执行`example execute <文件路径>`等命令
5. 命令执行失败，返回空对象或出现属性访问错误

## 错误日志

```
CLI初始化: dpml v1.0.0
默认领域: undefined
执行工作流: undefined
执行失败: Cannot read properties of undefined (reading 'length')
```

## 技术原因分析

问题出在`framework.ts`文件中的`createDomainDPML`函数实现：

```typescript
export function createDomainDPML<T>(config: DomainConfig): DomainDPML<T> {
  // 创建领域编译器
  const compiler = createDomainCompiler<T>(config);

  // 创建领域CLI - 问题在这里，没有传递config
  const cli = createDPMLCLIService();

  // 返回复合对象
  return {
    compiler,
    cli
  };
}
```

此函数虽然创建了领域编译器并传递了配置，但创建CLI服务时没有传递相同的配置。这导致：

1. 编译器能够访问领域的转换器和schema，成功编译文档
2. CLI服务无法访问这些配置，调用编译时得到空对象
3. 当尝试访问空对象的属性（如`workflow.steps.length`）时报错

## 修复方案

修改`createDomainDPML`函数，将领域配置传递给CLI服务：

```typescript
export function createDomainDPML<T>(config: DomainConfig): DomainDPML<T> {
  // 创建领域编译器
  const compiler = createDomainCompiler<T>(config);

  // 创建领域CLI并传递配置
  const cli = createDPMLCLIService({
    defaultDomain: config.domain
  });

  // 确保所有领域命令都被注册到CLI中
  if (config.commands) {
    // 处理领域命令配置
    processDomainCommands(config.commands, initializeDomain(config));
  }

  // 返回复合对象
  return {
    compiler,
    cli
  };
}
```

这样CLI服务也能访问领域配置，正确处理领域命令和DPML文档。

## 相关组件

- packages/core/src/api/framework.ts
- packages/core/src/core/framework/domainService.ts

## 影响范围

这个问题影响所有使用`createDomainDPML`创建CLI应用的场景，用户无法通过CLI命令正确编译和处理DPML文档。 