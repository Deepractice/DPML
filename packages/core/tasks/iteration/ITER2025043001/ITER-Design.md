# 需求规格：Framework模块集成CLI命令功能（ITER2025043001）

## 1. 总体目标

将CLI命令功能集成到Framework模块中，使领域开发者能够在配置领域时同时定义相关命令。实现领域特定命令与标准命令的统一管理，并提供自动注册到CLI系统的机制。确保Framework模块和CLI模块之间的职责分离与协作，同时提供简洁、直观的用户界面。

## 2. 架构设计

### 2.1 目标架构
```
core包
├─────────────────────────────────────────────────────────────────┐
│ API层                                                          │
│ - createDomainDPML (api/framework.ts)                           │
│ - getCommandDefinitions                                         │
├─────────────────────────────────────────────────────────────────┤
│ Types层                                                         │
│ - DomainConfig接口 (扩展命令支持)                               │
│ - DomainContext接口 (替代DomainState)                           │
│ - DomainAction接口 (领域命令定义)                               │
├─────────────────────────────────────────────────────────────────┤
│ Core层                                                          │
│ ┌─────────────────────────────┐    ┌─────────────────────────────┐
│ │ cli模块                    │    │ framework模块               │
│ │ - createCLI                │◄───┤ - domainService            │
│ │ - CommandRegistry          │    │ - cli/                      │
│ │ - CommandDefinition        │    │   - standardActions         │
│ └─────────────────────────────┘    │   - commandAdapter         │
│                                    └─────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 交互流程

1. 用户通过`createDomainDPML`创建领域编译器，配置包含命令定义
2. `domainService`初始化领域上下文，处理命令配置
3. 领域标准命令与自定义命令合并，注入领域上下文
4. `commandAdapter`将领域命令转换为CLI兼容格式
5. 用户通过`getCommandDefinitions`获取所有注册的命令
6. CLI模块调用`getCommandDefinitions`注册命令

## 3. 详细工作内容

### 3.1 类型定义扩展

1. **扩展DomainConfig接口**
   ```typescript
   // 在types/DomainConfig.ts中
   export interface DomainConfig {
     // 领域标识符和描述提升到顶层
     domain: string;
     description?: string;
     
     // 现有配置
     schema: Schema;
     transformers: Array<Transformer<unknown, unknown>>;
     options?: CompileOptions;
     
     // 命令配置
     commands?: {
       includeStandard?: boolean;
       actions?: Array<DomainAction>;
     };
   }
   ```

2. **创建DomainAction接口**
   ```typescript
   // 在types/DomainAction.ts中
   export interface DomainAction {
     name: string;
     description: string;
     args?: Array<DomainArgumentDefinition>;
     options?: Array<DomainOptionDefinition>;
     executor: (context: DomainContext, ...args: any[]) => Promise<void> | void;
   }
   ```

3. **重命名DomainState为DomainContext**
   ```typescript
   // 在core/framework/types.ts中
   export interface DomainContext {
     domain: string;
     description?: string;
     schema: Schema;
     transformers: Array<Transformer<unknown, unknown>>;
     options: Required<CompileOptions>;
     compiler?: DomainCompiler<unknown>;
   }
   ```

### 3.2 DomainState重命名影响分析

重命名DomainState为DomainContext将影响以下方面：

1. **接口定义**
   - `core/framework/types.ts` - 需要更新接口定义和导出

2. **函数签名**
   - `core/framework/domainService.ts` - 所有使用DomainState作为参数或返回值的函数需要更新
   - 主要函数：initializeDomain, compileDPML, extendDomain, getDomainSchema, getDomainTransformers

3. **内部实现**
   - 所有创建或使用DomainState实例的代码需要更新
   - 所有引用DomainState类型的变量声明需要更新

4. **类型断言**
   - 可能存在的`as DomainState`类型断言需要更新为`as DomainContext`

5. **测试代码**
   - 所有测试中使用DomainState类型的地方需要更新
   - 模拟对象创建和类型断言需要更新

6. **JSDoc注释**
   - 函数和变量上的类型注释需要更新

### 3.3 CLI集成目录结构

1. **创建framework/cli目录**
   - 在`core/framework/`下创建`cli`子目录，用于存放CLI集成相关模块
   - 确保目录结构清晰分离CLI集成功能

2. **标准命令实现**
   - 在`core/framework/cli/standardActions.ts`中实现
   ```typescript
   export const standardActions: DomainAction[] = [
     {
       name: 'validate',
       description: '验证DPML文档',
       args: [{ name: 'file', description: 'DPML文件路径', required: true }],
       options: [{ flags: '--strict', description: '启用严格验证' }],
       executor: async (context, file, options) => {
         // 验证实现...
       }
     },
     {
       name: 'parse',
       description: '解析DPML文档',
       args: [{ name: 'file', description: 'DPML文件路径', required: true }],
       options: [
         { flags: '--output <file>', description: '输出文件路径' },
         { flags: '--format <format>', description: '输出格式 (json|xml)', defaultValue: 'json' }
       ],
       executor: async (context, file, options) => {
         // 解析实现...
       }
     }
     // 注意：compile命令由于不同领域的transformer不同，不作为标准命令提供
     // 领域开发者应自行定义适合其领域的compile命令
   ];
   ```

3. **命令适配器实现**
   - 在`core/framework/cli/commandAdapter.ts`中实现
   ```typescript
   export function adaptDomainAction(
     action: DomainAction,
     domain: string,
     context: DomainContext
   ): CommandDefinition {
     // 转换领域命令为CLI命令...
   }
   ```

4. **CLI模块集成索引**
   - 在`core/framework/cli/index.ts`中提供统一导出
   ```typescript
   export * from './standardActions';
   export * from './commandAdapter';
   ```

### 3.4 领域服务更新

1. **更新domainService.ts**
   - 修改`initializeDomain`函数接收新的配置格式
   - 修改所有函数签名中的DomainState为DomainContext
   ```typescript
   export function initializeDomain(config: DomainConfig): DomainContext {
     // ...实现
   }
   
   export async function compileDPML<T>(content: string, context: DomainContext): Promise<T> {
     // ...实现
   }
   ```
   
   - 实现命令处理逻辑
   ```typescript
   // 全局命令注册表
   const globalCommandRegistry: CommandDefinition[] = [];
   
   // 处理领域命令
   function processDomainCommands(
     context: DomainContext, 
     commandsConfig?: DomainConfig['commands']
   ): void {
     if (!commandsConfig) return;
     
     const domainActions: DomainAction[] = [];
     
     // 添加标准命令
     if (commandsConfig.includeStandard) {
       domainActions.push(...standardActions);
     }
     
     // 添加自定义命令
     if (commandsConfig.actions?.length) {
       domainActions.push(...commandsConfig.actions);
     }
     
     // 转换并注册命令
     const cliCommands = domainActions.map(action => 
       adaptDomainAction(action, context.domain, context)
     );
     
     // 添加到全局注册表
     globalCommandRegistry.push(...cliCommands);
   }
   ```

2. **更新API层函数**
   ```typescript
   // api/framework.ts
   export function getCommandDefinitions(): CommandDefinition[] {
     // 获取所有注册的命令定义
     return domainService.getAllRegisteredCommands();
   }
   ```

### 3.5 测试用例开发

1. **单元测试**
   - 测试命令配置解析
   - 测试命令转换逻辑
   - 测试标准命令功能

2. **集成测试**
   - 测试领域命令注册流程
   - 测试与CLI模块集成

## 4. 兼容性考虑

1. **API向后兼容性**
   - 保持现有API不变
   - `domain`字段成为必填，但可为空字符串确保兼容性

2. **CLI接口兼容性**
   - 确保生成的命令符合CLI模块期望的格式
   - 保持命令注册机制不变

3. **测试兼容性**
   - 确保现有测试在更改后仍能通过
   - 为新功能添加足够的测试覆盖

## 5. 验收标准

1. 用户可在DomainConfig中配置领域命令
2. 标准命令(validate/parse)可被任何领域复用
3. 自定义命令能获取领域上下文(schema/transformers/compiler)
4. 命令能自动注册到CLI系统并正确执行
5. CLI命令格式符合`dpml [domain]:[action]`模式
6. 所有测试通过，文档更新完成
7. 领域开发者可以自行定义适合其领域特定需求的compile命令

## 6. 风险分析

1. **模块间依赖风险**
   - 风险：Framework和CLI模块间可能形成循环依赖
   - 缓解：明确接口边界，使用适配器模式，保持依赖单向流动

2. **命令冲突风险**
   - 风险：不同领域命令可能命名冲突
   - 缓解：强制使用领域前缀，实现命令冲突检测

3. **DomainState重命名影响**
   - 风险：重命名可能导致未发现的引用错误
   - 缓解：使用IDE重构工具、全局搜索，并添加完整的测试覆盖

4. **上下文安全风险**
   - 风险：命令执行时上下文可能不完整
   - 缓解：确保DomainContext在注入前完整初始化，添加类型安全检查

5. **配置复杂性风险**
   - 风险：配置结构变得过于复杂
   - 缓解：提供清晰的文档和示例，考虑分阶段配置机制

## 7. 灾难恢复计划

1. 保持关键接口向后兼容
2. 使用分支开发，便于回退
3. 编写详细的迁移文档
4. 确保每个功能点都有单元测试覆盖
5. 增量式实现和测试，避免大规模改动 