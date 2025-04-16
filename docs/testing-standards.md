# DPML 项目测试标准

本文档定义了DPML项目的测试标准和最佳实践，旨在确保测试的一致性、有效性和可维护性。这些标准适用于所有DPML子项目，包括`@dpml/core`、`@dpml/prompt`、`@dpml/agent`、`@dpml/cli`等。

## 1. 测试策略概述

### 1.1 测试目标

- **验证功能正确性**：确保各组件按预期工作
- **防止回归**：确保修改不会破坏现有功能
- **文档化行为**：通过测试说明组件的预期行为
- **辅助设计**：促进良好的代码设计和可测试性

### 1.2 测试范围

每个DPML包应包含以下类型的测试：

- **单元测试**：测试单个函数、类或组件
- **组件测试**：测试多个协同工作的组件
- **集成测试**：测试与其他DPML包或外部系统的集成
- **性能测试**：测试关键功能的性能表现

## 2. 测试分层模型

DPML项目采用四层测试模型，每层有不同的目标和模拟策略：

### 2.1 单元测试 (Unit Tests)

- **范围**：单个函数、方法或类
- **目标**：验证核心逻辑正确性
- **模拟策略**：高度模拟，模拟大多数依赖
- **数量占比**：约60-70%的测试
- **命名前缀**：`UT-`

### 2.2 组件测试 (Component Tests)

- **范围**：多个协同工作的类和函数
- **目标**：验证组件间交互
- **模拟策略**：中度模拟，只模拟外部依赖
- **数量占比**：约20-25%的测试
- **命名前缀**：`CT-`

### 2.3 集成测试 (Integration Tests)

- **范围**：多个包或外部系统的集成
- **目标**：验证系统间交互
- **模拟策略**：低度模拟，只模拟难以访问的外部系统
- **数量占比**：约10-15%的测试
- **命名前缀**：`IT-`

### 2.4 端到端测试 (End-to-End Tests)

- **范围**：完整功能流程
- **目标**：验证实际用户场景
- **模拟策略**：最小模拟，尽可能使用真实环境
- **数量占比**：约5%的测试
- **命名前缀**：`E2E-`

## 3. 模拟(Mock)策略

过度模拟或不当模拟是导致测试与实际行为不符的主要原因。以下是DPML项目的模拟策略和最佳实践。

### 3.1 何时使用模拟

**应该模拟的组件**：
- 外部系统（文件系统、网络请求、数据库）
- 非确定性组件（日期、随机数生成器）
- 有副作用的组件（控制台输出、进程控制）
- 慢速组件（对测试速度有显著影响的组件）

**不应模拟的组件**：
- 纯函数和纯逻辑
- 核心业务规则
- 简单的数据结构和对象

### 3.2 模拟层次

按照以下层次决定模拟程度：

1. **高优先级模拟**：
   - 文件系统操作
   - 网络请求
   - 外部API调用
   - 进程控制（如`process.exit()`）

2. **中优先级模拟**：
   - 第三方库（部分功能）
   - 环境变量
   - 时间相关函数

3. **低优先级模拟**：
   - 项目内其他模块（尽量使用真实实现）
   - 日志和监控
   - 非关键配置

### 3.3 模拟最佳实践

#### 3.3.1 使用依赖注入

优先使用依赖注入而非全局模拟：

```typescript
// 好的做法
interface IFileSystem {
  readFile(path: string): Promise<string>;
}

class ConfigLoader {
  constructor(private fs: IFileSystem) {}
  
  async loadConfig(path: string) {
    return JSON.parse(await this.fs.readFile(path));
  }
}

// 测试
const mockFs: IFileSystem = {
  readFile: jest.fn().mockResolvedValue('{"key":"value"}')
};
const loader = new ConfigLoader(mockFs);
```

#### 3.3.2 模拟行为而非实现

关注组件对外的行为，而非内部实现：

```typescript
// 好的做法
test('loadConfig应返回解析后的配置', async () => {
  // 设置预期行为
  mockFs.readFile.mockResolvedValue('{"key":"value"}');
  
  // 验证结果
  const config = await loader.loadConfig('config.json');
  expect(config).toEqual({key: 'value'});
  
  // 验证正确调用了依赖
  expect(mockFs.readFile).toHaveBeenCalledWith('config.json');
});

// 避免的做法
test('loadConfig的实现细节', async () => {
  const spy = jest.spyOn(JSON, 'parse');
  await loader.loadConfig('config.json');
  expect(spy).toHaveBeenCalledTimes(1); // 过度关注实现细节
});
```

#### 3.3.3 使用共享模拟实现

为常用依赖创建标准化的模拟实现，使用`@dpml/common/testing`提供的工具：

```typescript
// 使用@dpml/common/testing提供的模拟工具
import { createMockFileSystem, createMockFunction } from '@dpml/common/testing';

// 创建模拟文件系统
const mockFs = createMockFileSystem({
  '/config.json': '{"key":"value"}',
  '/settings.json': '{"theme":"dark"}'
});

// 在测试中使用
test('loadConfig处理文件不存在的情况', async () => {
  const loader = new ConfigLoader(mockFs);
  await expect(loader.loadConfig('missing.json')).rejects.toThrow();
});
```

#### 3.3.4 模拟契约保证

确保模拟实现满足与真实实现相同的契约：

```typescript
// 契约测试
describe('FileSystem契约测试', () => {
  const implementations = [
    ['真实实现', new NodeFileSystem()],
    ['模拟实现', createMockFileSystem({'test.txt': 'content'})]
  ];
  
  test.each(implementations)('%s 应正确处理存在的文件', async (_, fs) => {
    expect(await fs.exists('test.txt')).toBe(true);
    expect(await fs.readFile('test.txt')).toBe('content');
  });
  
  test.each(implementations)('%s 应正确处理不存在的文件', async (_, fs) => {
    await expect(fs.readFile('missing.txt')).rejects.toThrow();
  });
});
```

#### 3.3.5 避免模拟整个模块

优先模拟特定函数而非整个模块：

```typescript
// 避免的做法
vi.mock('@dpml/core');

// 推荐的做法
vi.mock('@dpml/core', () => ({
  ...vi.importActual('@dpml/core'),
  parseConfig: vi.fn().mockReturnValue({})
}));
```

### 3.4 各层测试的模拟策略

#### 3.4.1 单元测试模拟策略

- 模拟所有外部依赖
- 模拟同包中其他组件（如必要）
- 不模拟被测单元内部的纯逻辑

```typescript
// CommandRegistry单元测试
import { createMockFunction } from '@dpml/common/testing';

test('register应添加命令到注册表', () => {
  const registry = new CommandRegistry();
  const mockCommand = { 
    name: 'test', 
    execute: createMockFunction() 
  };
  
  registry.register('domain', 'test', mockCommand);
  
  const result = registry.getCommand('domain', 'test');
  expect(result).toBe(mockCommand);
});
```

#### 3.4.2 组件测试模拟策略

- 模拟外部系统和第三方库
- 使用真实的内部组件
- 模拟跨包依赖

```typescript
// CommandLoader和CommandRegistry组件测试
import { createMockFileSystem } from '@dpml/common/testing';

test('loadDomainCommands应从配置加载并注册命令', async () => {
  // 模拟文件系统
  const mockFs = createMockFileSystem({
    'config.json': '{"domain":"test","commands":[{"name":"cmd"}]}'
  });
  
  // 使用真实实现
  const registry = new CommandRegistry();
  const loader = new CommandLoader(registry, mockFs);
  
  await loader.loadDomainCommands('test');
  
  expect(registry.getCommand('test', 'cmd')).toBeDefined();
});
```

#### 3.4.3 集成测试模拟策略

- 仅模拟外部系统和难以设置的依赖
- 使用真实的DPML包
- 最小化模拟范围

```typescript
// CLI和命令集成测试
import { createMockFileSystem } from '@dpml/common/testing';

test('CLI应成功加载和执行命令', async () => {
  // 仅模拟文件系统和进程
  const mockFs = createMockFileSystem({
    '~/.dpml/mapping.json': JSON.stringify({domains:{test:{package:'@dpml/test'}}})
  });
  const mockProcess = { exit: vi.fn() };
  
  // 使用真实CLI实现与注册表
  const cli = new CLI({fs: mockFs, process: mockProcess});
  await cli.run(['node', 'dpml', 'test', 'command']);
  
  // 验证结果
  expect(mockProcess.exit).not.toHaveBeenCalled();
  // 其他验证...
});
```

#### 3.4.4 端到端测试模拟策略

- 最小化模拟，尽可能使用真实环境
- 仅模拟外部服务和特定测试数据
- 使用临时文件和目录

```typescript
// CLI端到端测试
import { withTestEnvironment } from '@dpml/common/testing';

test('端到端：CLI应执行完整流程', async () => {
  await withTestEnvironment(
    { name: 'e2e-test', env: { DPML_CONFIG_DIR: 'tmp' } },
    async (env) => {
      // 执行实际CLI（最小模拟）
      const result = await execAsync('node ./bin/dpml.js --help');
      
      // 验证
      expect(result.stdout).toContain('Usage: dpml [options] [command]');
    }
  );
});
```

## 4. 测试组织与命名

### 4.1 文件结构

测试文件应与源文件保持对应关系。在DPML项目中，测试文件放置在`src/tests/`目录下：

```
src/
  core/
    loader.ts
    registry.ts
  utils/
    paths.ts
  tests/
    core/
      loader.test.ts
      registry.test.ts
    utils/
      paths.test.ts
    integration/
      cli-registry.test.ts
```

### 4.2 命名约定

- **文件名**：`<源文件名>.test.ts`
- **测试套件**：描述测试对象，如 `describe('CommandRegistry')`
- **测试用例**：描述预期行为，如 `test('should register commands')`
- **测试ID**：使用前缀标识测试类型，如 `UT-REG-001`

### 4.3 测试组织

采用BDD风格组织测试：

```typescript
describe('CommandRegistry', () => {
  describe('register方法', () => {
    test('应成功注册有效命令', () => {
      // 测试实现
    });
    
    test('应拒绝重复注册', () => {
      // 测试实现
    });
  });
  
  describe('getCommand方法', () => {
    // 更多测试...
  });
});
```

## 5. 测试数据管理

### 5.1 测试数据原则

- **隔离性**：测试数据应相互隔离
- **明确性**：测试数据应清晰表达测试意图
- **最小性**：使用满足测试需求的最小数据集
- **可重复性**：测试应能重复运行而不依赖外部状态

### 5.2 测试数据来源

按优先级排序：

1. **内联数据**：直接在测试中定义
2. **测试工厂**：通过工厂函数生成
3. **测试夹具**：从文件加载固定数据
4. **模拟服务**：通过模拟服务生成

### 5.3 测试数据工厂

为复杂对象创建工厂函数：

```typescript
// 使用@dpml/common/testing提供的工厂工具
import { createFixtureCollection } from '@dpml/common/testing';

// 创建测试数据工厂
export const createCommand = (overrides = {}) => ({
  name: 'test-command',
  description: 'Test command',
  execute: vi.fn().mockResolvedValue(undefined),
  ...overrides
});

export const createDomainConfig = (overrides = {}) => ({
  domain: 'test-domain',
  commands: [createCommand()],
  ...overrides
});

// 在测试中使用
test('应加载领域配置', () => {
  const config = createDomainConfig({
    domain: 'custom',
    commands: [createCommand({ name: 'custom-cmd' })]
  });
  // 使用配置...
});
```

## 6. 断言和验证

### 6.1 断言原则

- **明确性**：断言应清晰表达预期结果
- **全面性**：验证所有相关结果，而非部分
- **精确性**：只验证必要的细节，避免脆弱测试

### 6.2 常见断言模式

```typescript
// 结果断言
expect(result).toBe(expected);
expect(result).toEqual({id: 123, name: 'test'});
expect(array).toContain(item);

// 行为断言
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);

// 异常断言
expect(() => fn()).toThrow();
await expect(asyncFn()).rejects.toThrow();

// 快照断言（谨慎使用）
expect(result).toMatchSnapshot();
```

### 6.3 避免的断言模式

```typescript
// 避免过度指定 - 过于脆弱
expect(result).toEqual(exactLargeObject);  // 不好
expect(result.criticalProperties).toEqual({id, name});  // 更好

// 避免不必要的实现细节断言
expect(mockFn).toHaveBeenCalledTimes(3);  // 仅在调用次数重要时使用
expect(JSON.stringify(result)).toBe('{"id":1}');  // 使用toEqual代替
```

## 7. 集成和端到端测试指南

### 7.1 集成测试策略

- 测试系统边界和集成点
- 关注组件间数据流和交互
- 验证错误处理和边缘情况

### 7.2 端到端测试策略

- 模拟真实用户场景
- 覆盖关键用户流程
- 使用真实或接近真实的环境

### 7.3 测试替身 (Test Doubles)

- **监视器(Spy)**: 用于记录调用但不改变行为
- **存根(Stub)**: 提供预定义返回值
- **模拟(Mock)**: 预设期望和行为验证
- **伪装(Fake)**: 简化的实现

根据测试需求选择适当的替身类型，避免过度使用。

## 8. 测试覆盖率指南

### 8.1 覆盖率目标

- **行覆盖率**: 至少80%
- **分支覆盖率**: 至少75%
- **函数覆盖率**: 至少90%

### 8.2 覆盖率优先级

按优先级排序：

1. 核心业务逻辑
2. 错误处理路径
3. 边缘情况和特殊条件
4. 公共API和接口
5. 内部辅助函数

### 8.3 不需要测试的代码

- 纯数据声明
- 简单的getter/setter
- 配置文件和常量
- 第三方库包装代码

## 9. 测试最佳实践摘要

1. **明确测试边界**：每个测试应有明确的范围和目标
2. **隔离测试依赖**：减少测试间的依赖和共享状态
3. **关注行为而非实现**：测试组件的外部行为，不关注内部实现
4. **适当使用模拟**：只模拟必要的依赖，避免过度模拟
5. **准备-执行-验证模式**：清晰地组织测试结构
6. **一个测试一个断言**：每个测试专注于一个行为或结果
7. **测试异常路径**：不仅测试正常路径，也测试错误处理
8. **避免测试驱动的实现**：避免为了测试而改变实现
9. **保持测试简单**：简单的测试更容易维护和理解
10. **保持测试快速**：测试应该快速运行，避免不必要的延迟

## 10. 特定模块的测试策略

### 10.1 CLI模块测试策略

1. **命令注册机制**：验证命令正确注册和检索
2. **命令加载过程**：验证从配置文件加载命令的过程
3. **参数解析**：测试命令行参数的解析逻辑
4. **配置管理**：测试配置加载和保存
5. **工具函数**：测试路径工具、日志工具等
6. **错误处理**：测试各种错误情况的处理

模拟策略：
- 使用`@dpml/common/testing`提供的模拟文件系统
- 模拟进程控制 (process.exit等)
- 模拟控制台输出
- 使用真实的Commander接口进行集成测试

### 10.2 Core模块测试策略

1. **解析功能**：测试DPML文件解析
2. **验证逻辑**：测试结构验证
3. **标签处理**：测试各类标签处理器
4. **错误报告**：测试错误处理和报告

模拟策略：
- 使用静态测试文件
- 使用`@dpml/common/testing`提供的模拟文件系统
- 使用真实解析器进行端到端测试

### 10.3 Prompt/Agent模块测试策略

1. **提示词处理**：测试提示词变量替换和渲染
2. **API集成**：测试与LLM API的集成
3. **状态管理**：测试代理状态管理
4. **会话处理**：测试会话和上下文管理

模拟策略：
- 使用`@dpml/common/testing`提供的模拟HTTP客户端
- 模拟文件系统操作
- 使用小型真实调用进行集成测试

## 11. 测试环境设置

### 11.1 单元测试环境

- 使用Vitest作为测试框架
- 使用TypeScript进行类型检查
- 使用ESLint进行代码风格检查
- 使用`@dpml/common/testing`提供的测试工具

### 11.2 集成测试环境

- 在隔离环境中运行
- 使用测试配置而非生产配置
- 使用`@dpml/common/testing`提供的环境管理工具
- 使用临时目录进行文件操作

### 11.3 持续集成设置

- 在每次提交时运行单元测试
- 在PR和合并前运行集成测试
- 维护测试覆盖率并防止下降

## 11.4 测试目录结构

DPML项目已将所有测试文件从独立的`tests/`目录迁移到`src/tests/`目录下。这种变化有以下优势：

- 与源代码保持更紧密的关系
- 简化了相对导入路径
- 允许测试使用包内的模块别名
- 使测试可以更容易地访问非公开但需要测试的内部API

请确保所有新的测试都放在`src/tests/`目录下，并根据模块结构组织子目录。

## 11.5 Vitest配置

Vitest配置需要更新以反映新的测试目录结构：

```typescript
// vitest.config.ts 示例
import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@packageName': path.resolve(__dirname, './src')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    // 其他配置...
  },
});
```

## 附录：测试用例示例

### 单元测试示例

```typescript
// src/tests/core/registry.test.ts
import { createMockFunction } from '@dpml/common/testing';
import { CommandRegistry } from '../../core/registry';

describe('CommandRegistry', () => {
  let registry: CommandRegistry;
  
  beforeEach(() => {
    registry = new CommandRegistry();
  });
  
  describe('register方法', () => {
    test('应成功注册命令并能检索', () => {
      // 准备
      const mockCommand = { name: 'test', execute: createMockFunction() };
      
      // 执行
      registry.register('domain', 'test', mockCommand);
      const retrieved = registry.getCommand('domain', 'test');
      
      // 验证
      expect(retrieved).toBe(mockCommand);
    });
    
    test('注册重复命令应抛出错误', () => {
      // 准备
      const command1 = { name: 'test', execute: createMockFunction() };
      const command2 = { name: 'test', execute: createMockFunction() };
      registry.register('domain', 'test', command1);
      
      // 执行并验证
      expect(() => {
        registry.register('domain', 'test', command2);
      }).toThrow(/already registered/);
    });
  });
});
```

### 集成测试示例

```typescript
// src/tests/integration/cli-integration.test.ts
import { createMockFileSystem, withTestEnvironment } from '@dpml/common/testing';
import { CLI } from '../../core/cli';

describe('CLI集成测试', () => {
  test('应加载映射文件并执行命令', async () => {
    // 使用测试环境
    await withTestEnvironment(
      { name: 'cli-test', mockTime: true },
      async (env) => {
        // 准备
        const mockConfig = {
          domains: {
            test: {
              package: '@dpml/test',
              commandsPath: 'dist/commands.js'
            }
          }
        };
        
        const mockFs = createMockFileSystem({
          '~/.dpml/mapping.json': JSON.stringify(mockConfig)
        });
        
        const mockExecute = vi.fn().mockResolvedValue(undefined);
        const mockCommand = { 
          name: 'testcmd', 
          execute: mockExecute 
        };
        
        // 模拟动态导入
        vi.mock('@dpml/test/dist/commands.js', () => ({
          default: {
            domain: 'test',
            commands: [mockCommand]
          }
        }), { virtual: true });
        
        // 创建CLI实例
        const cli = new CLI({
          fs: mockFs,
          // 其他必要依赖...
        });
        
        // 执行
        await cli.run(['node', 'dpml', 'test', 'testcmd', 'arg1']);
        
        // 验证
        expect(mockExecute).toHaveBeenCalledWith(['arg1'], {}, expect.anything());
      }
    );
  });
}); 