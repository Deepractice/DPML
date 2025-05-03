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

# 修复：CLI执行时领域编译器未初始化的问题

## 问题描述

当使用Agent包的CLI功能执行命令时，出现"领域编译器尚未初始化"错误。具体复现步骤：

1. 创建一个简单的Agent DPML文件 (如 `examples/simple-agent.dpml`)
2. 运行命令 `dpml-agent agent chat examples/simple-agent.dpml --env-file .env`
3. 出现错误：

```
CLI initialized: agent v1.0.0
Default domain: agent

DPML Agent Chat
加载Agent配置: examples/simple-agent.dpml

错误: 领域编译器尚未初始化
```

## 原因分析

通过对代码的分析，发现问题出在Core包的Framework与CLI集成处理上。具体来说：

1. 在`commandAdapter.ts`中，`createDomainActionContext`函数从`DomainContext`创建`DomainActionContext`时，发现`context.compiler`为空：

```typescript
// packages/core/src/core/framework/cli/commandAdapter.ts
function createDomainActionContext(context: DomainContext): DomainActionContext {
  return {
    getCompiler<T>(): DomainCompiler<T> {
      if (!context.compiler) {
        throw new Error('领域编译器尚未初始化');
      }
      return context.compiler as DomainCompiler<T>;
    },
    // ...其他方法
  };
}
```

2. 在整个执行流程中，初始化了领域编译器，但在CLI执行命令时，这个编译器实例没有正确地传递到命令上下文中：

```
createDomainDPML -> agentDPML.cli.execute() -> commandAdapter -> createDomainActionContext
```

3. 在`domainService.ts`的`initializeDomainCLI`函数中，虽然正确处理了命令配置，但可能没有将`compiler`设置到上下文中。

4. 核心问题：在`agentDPML`创建后，生成的`DomainContext`缺少对编译器的引用，或者在CLI执行时没有传递正确的上下文。

## 代码定位

问题涉及以下几个关键文件：

1. `packages/core/src/core/framework/cli/commandAdapter.ts` - 抛出错误的地方
2. `packages/core/src/api/framework.ts` - 创建DomainDPML的地方
3. `packages/core/src/core/framework/domainService.ts` - 初始化领域和CLI的地方
4. `packages/agent/src/bin.ts` - CLI入口点

关键代码路径：

```typescript
// packages/agent/src/bin.ts
async function main() {
  try {
    // 执行CLI命令
    await agentDPML.cli.execute();
  } catch (error) {
    // 错误处理
  }
}

// packages/agent/src/index.ts
export const agentDPML = createDomainDPML<AgentConfig>({
  domain: 'agent',
  description: 'AI Agent Domain',
  schema,
  transformers,
  commands: commandsConfig,
  options: {
    strictMode: true,
    errorHandling: 'throw'
  }
});
```

## 建议修复方案

修复这个问题可能有以下几种方法：

1. **确保编译器引用在上下文中传递**：

```typescript
// 在packages/core/src/api/framework.ts中
export function createDomainDPML<T>(config: DomainConfig): DomainDPML<T> {
  // 创建领域编译器
  const compiler = createDomainCompiler<T>(config);
  
  // 修改：确保CLI初始化时能够访问编译器
  // 创建CLI上下文时传入编译器引用
  const cli = createDPMLCLIService({
    ...config,
    contextExtensions: { compiler }  // 添加编译器引用
  });
  
  return { compiler, cli };
}
```

2. **修改领域上下文初始化逻辑**：

```typescript
// 在packages/core/src/core/framework/domainService.ts中
export function initializeDomainCLI(config: DomainConfig, compiler?: DomainCompiler<unknown>): DomainContext {
  // 获取或创建上下文
  const context = /* 现有逻辑 */;
  
  // 确保context.compiler存在
  if (compiler && !context.compiler) {
    context.compiler = compiler;
  }
  
  return context;
}
```

3. **在CLI执行前验证编译器**：

```typescript
// 在packages/agent/src/bin.ts中
async function main() {
  try {
    // 确保编译器已初始化
    if (!agentDPML.compiler) {
      throw new Error('编译器未初始化，无法执行CLI命令');
    }
    
    // 执行CLI命令
    await agentDPML.cli.execute();
  } catch (error) {
    // 错误处理
  }
}
```

## 推荐解决方案

最佳解决方案是修改Core包中的`createDomainDPML`函数，确保编译器引用正确地传递到CLI上下文中：

```typescript
// 在packages/core/src/api/framework.ts中
export function createDomainDPML<T>(config: DomainConfig): DomainDPML<T> {
  // 创建领域编译器
  const compiler = createDomainCompiler<T>(config);
  
  // 获取已注册的领域上下文
  const domainContext = getDomainContext(config.domain);
  
  // 设置编译器引用
  if (domainContext) {
    domainContext.compiler = compiler;
  }
  
  // 创建领域CLI
  const cli = createDPMLCLIService(config);
  
  return { compiler, cli };
}
```

这样可以确保在CLI执行时，`context.compiler`引用是可用的。

## 优先级与影响

- **优先级**：高 - 这个问题会导致CLI功能完全不可用
- **影响范围**：所有使用CLI功能的领域实现，特别是Agent包
- **解决难度**：中等 - 需要理解内部框架结构，但修改相对局部

## 测试建议

修复后，应添加以下测试以验证解决方案：

1. 执行完整CLI流程的端到端测试
2. 验证`DomainContext`到`DomainActionContext`转换的单元测试
3. 验证编译器引用在框架生命周期中的传递测试 