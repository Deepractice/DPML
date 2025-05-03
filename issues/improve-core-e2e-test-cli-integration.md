# 改进Core包端到端测试以验证CLI框架集成

## 问题描述

Core包的端到端测试未能发现在实际CLI环境中出现的"领域编译器尚未初始化"错误。这表明当前的测试策略存在盲点，特别是在领域框架与CLI服务集成方面。

错误日志示例：
```
CLI initialized: agent v1.0.0
Default domain: agent

DPML Agent Chat
加载Agent配置: examples/simple-agent.dpml

错误: 领域编译器尚未初始化
```

此错误源自Core包中的`commandAdapter.ts`文件：
```typescript
function createDomainActionContext(context: DomainContext): DomainActionContext {
  return {
    getCompiler<T>(): DomainCompiler<T> {
      if (!context.compiler) {
        throw new Error('领域编译器尚未初始化');
      }
      return context.compiler as DomainCompiler<T>;
    },
    // ...
  };
}
```

## 问题分析

通过审查Core包的测试代码，发现以下问题：

1. **缺少关键流程测试**：Core包提供了创建领域编译器和CLI的基础功能，但缺少对这两者集成的端到端测试。特别是，没有测试从`createDomainDPML`到`execute`命令的完整流程。

2. **上下文传递模拟不完整**：测试中使用了模拟的DomainContext，但可能没有正确模拟编译器引用的传递过程。

3. **组件隔离测试**：现有测试侧重于各组件的隔离测试，而不是它们如何协同工作。

4. **缺少框架集成点验证**：
   - `DomainContext`如何传递到`DomainActionContext`
   - `context.compiler`如何设置和使用
   - CLI执行过程中的上下文流转

## 改进目标

1. 添加针对Core框架与CLI集成的端到端测试，确保能够发现编译器初始化相关问题。

2. 测试领域上下文传递的完整流程，特别是编译器引用的传递。

3. 建立验证框架完整性的测试策略，不仅测试各组件功能，还要测试组件之间的协作。

## 完成标准

1. 新增的端到端测试应该能够在"领域编译器尚未初始化"问题存在时失败。

2. 测试应涵盖以下关键路径：
   - `createDomainDPML` -> `compiler` -> `cli.execute` -> `commandAdapter` -> `getCompiler`
   
3. 提供测试文档，说明如何编写有效测试框架与CLI集成的端到端测试。

4. 添加针对DomainContext到DomainActionContext转换的专项测试。

## 建议实现方案

1. 添加Core框架集成测试：

```typescript
test('CORE-E2E-01: 验证创建的领域DPML实例具有可用的编译器', async () => {
  // 1. 创建领域DPML实例
  const testDPML = createDomainDPML({
    domain: 'test-domain',
    description: 'Test Domain',
    schema: { element: 'root' },
    transformers: [{
      name: 'identity',
      transform: data => data
    }],
    commands: {
      includeStandard: true,
      actions: []
    }
  });
  
  // 2. 验证编译器已正确初始化
  expect(testDPML.compiler).toBeDefined();
  expect(typeof testDPML.compiler.compile).toBe('function');
  
  // 3. 验证CLI实例已正确设置
  expect(testDPML.cli).toBeDefined();
  expect(typeof testDPML.cli.execute).toBe('function');
});
```

2. 添加完整CLI执行流程测试：

```typescript
test('CORE-E2E-02: 验证CLI执行流程中编译器可用', async () => {
  // 捕获输出
  const mockConsole = {
    log: jest.fn(),
    error: jest.fn()
  };
  const originalConsole = { ...console };
  console.log = mockConsole.log;
  console.error = mockConsole.error;
  
  try {
    // 1. 创建领域DPML
    const testDPML = createDomainDPML({
      domain: 'test-domain',
      description: 'Test Domain',
      schema: { element: 'root' },
      transformers: [{
        name: 'identity',
        transform: data => data
      }],
      commands: {
        includeStandard: true,
        actions: [
          {
            name: 'test-command',
            description: '测试命令',
            action: async (context) => {
              // 2. 获取并使用编译器
              const compiler = context.getCompiler();
              expect(compiler).toBeDefined();
              console.log('编译器可用');
            }
          }
        ]
      }
    });
    
    // 3. 设置命令行参数
    process.argv = ['node', 'dpml', 'test-domain:test-command'];
    
    // 4. 执行CLI
    await testDPML.cli.execute();
    
    // 5. 验证命令执行成功，没有抛出"领域编译器尚未初始化"错误
    expect(mockConsole.error).not.toHaveBeenCalledWith(
      expect.stringContaining('领域编译器尚未初始化')
    );
    expect(mockConsole.log).toHaveBeenCalledWith('编译器可用');
  } finally {
    // 恢复控制台
    console.log = originalConsole.log;
    console.error = originalConsole.error;
  }
});
```

3. 添加DomainContext到DomainActionContext转换测试：

```typescript
test('CORE-E2E-03: 验证DomainContext正确传递到DomainActionContext', () => {
  // 1. 创建具有编译器的DomainContext
  const domainContext: DomainContext = {
    domain: 'test',
    description: 'Test Domain',
    schema: { element: 'root' },
    transformers: [],
    options: {
      strictMode: false,
      errorHandling: 'throw',
      transformOptions: { resultMode: 'merged' },
      custom: {}
    },
    compiler: {
      compile: async () => ({}),
      extend: () => {},
      getSchema: () => ({ element: 'root' }),
      getTransformers: () => []
    }
  };
  
  // 2. 转换为DomainActionContext
  const actionContext = createDomainActionContext(domainContext);
  
  // 3. 验证编译器正确传递
  expect(() => actionContext.getCompiler()).not.toThrow('领域编译器尚未初始化');
  expect(actionContext.getCompiler()).toBe(domainContext.compiler);
});
```

4. 添加完整的框架生命周期测试：

```typescript
test('CORE-E2E-04: 验证框架生命周期中编译器始终可用', async () => {
  // 从创建领域到CLI执行的生命周期测试
  const checkpoints: string[] = [];
  
  // 1. 创建领域DPML
  const testDPML = createDomainDPML({
    domain: 'lifecycle-test',
    description: 'Lifecycle Test',
    schema: { element: 'root' },
    transformers: [{
      name: 'checkpoint',
      transform: (data) => {
        checkpoints.push('transformer-executed');
        return data;
      }
    }],
    commands: {
      includeStandard: true,
      actions: [
        {
          name: 'lifecycle',
          description: '生命周期测试命令',
          action: async (context) => {
            // 2. 在命令中使用编译器
            const compiler = context.getCompiler();
            checkpoints.push('compiler-accessed');
            
            // 3. 编译简单内容
            await compiler.compile('<root />');
            checkpoints.push('compilation-successful');
          }
        }
      ]
    }
  });
  
  // 记录创建完成
  checkpoints.push('dpml-created');
  
  // 设置命令行参数
  process.argv = ['node', 'dpml', 'lifecycle-test:lifecycle'];
  
  // 4. 执行CLI
  await testDPML.cli.execute();
  
  // 5. 验证所有检查点按顺序执行
  expect(checkpoints).toEqual([
    'dpml-created',
    'compiler-accessed',
    'transformer-executed',
    'compilation-successful'
  ]);
});
```

这些测试将确保Core包的框架与CLI集成得到充分测试，并能够在编译器初始化问题存在时提前发现。

## 优先级

高 - 这是一个关键的基础架构问题，影响所有基于DPML Core的领域实现 