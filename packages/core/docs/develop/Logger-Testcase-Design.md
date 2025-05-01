# DPML 日志模块测试用例设计

本文档遵循 [测试用例设计规则](../../../../rules/architecture/test-case-design.md) 和 [测试策略规则](../../../../rules/architecture/testing-strategy.md) 设计DPML Logger模块的测试用例。

## 1. 测试范围

本测试计划覆盖Logger模块的核心功能，包括：
- API层和Types层的契约稳定性
- 日志级别控制与过滤的正确性
- 不同传输器的功能与错误处理
- 格式化器的正确格式化能力
- 调用位置捕获功能
- 日志注册表的管理能力
- 异步日志处理
- 从简单调用到最终输出的完整日志流程

## 2. 测试类型与目标

- **契约测试**: 确保API和类型定义的稳定性，防止意外的破坏性变更
- **单元测试**: 验证各组件的独立功能，特别是DefaultLogger、LoggerRegistry和各种传输器、格式化器
- **集成测试**: 验证Logger如何协调各模块，确保完整日志流程的正确性
- **端到端测试**: 验证从用户调用API到日志实际输出的完整工作流程
- **性能测试**: 验证在高频日志和大数据量场景下的性能表现

## 3. 测试用例详情

### 3.1 契约测试 (Contract Tests)

#### 文件: `packages/core/src/__tests__/contract/api/logger.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-API-LOG-01 | `getLogger` API应维持类型签名 | 验证API契约稳定性 | 类型检查 | 符合公开文档的函数签名 | 无需模拟 |
| CT-API-LOG-02 | `createLogger` API应维持类型签名 | 验证API契约稳定性 | 类型检查 | 符合公开文档的函数签名 | 无需模拟 |
| CT-API-LOG-03 | `setDefaultLogLevel` API应维持类型签名 | 验证API契约稳定性 | 类型检查 | 符合公开文档的函数签名 | 无需模拟 |
| CT-API-LOG-04 | `getLogger` API应返回符合Logger接口的对象 | 验证返回类型契约 | 有效命名空间 | 返回符合Logger接口的对象 | 模拟loggingService返回符合契约的数据 |
| CT-API-LOG-05 | `createLogger` API应返回符合Logger接口的对象 | 验证返回类型契约 | 有效配置 | 返回符合Logger接口的对象 | 模拟loggingService返回符合契约的数据 |

#### 文件: `packages/core/src/__tests__/contract/types/Logger.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-LOG-01 | Logger接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 接口包含debug、info、warn、error和fatal方法 | 无需模拟 |
| CT-TYPE-LOG-02 | Logger接口的日志方法应支持上下文和错误参数 | 验证方法参数契约 | 类型检查 | 日志方法接受消息、上下文和错误参数 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/LogLevel.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-LVL-01 | LogLevel枚举应维持稳定性 | 验证枚举值契约 | 类型检查 | 枚举包含DEBUG、INFO、WARN、ERROR和FATAL值 | 无需模拟 |
| CT-TYPE-LVL-02 | LogLevel枚举值应维持正确的数值顺序 | 验证枚举数值契约 | 类型检查 | 枚举值从DEBUG(0)到FATAL(4)保持升序 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/LoggerConfig.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-LCFG-01 | LoggerConfig接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 接口包含minLevel、formatter、transports和callSiteCapture字段 | 无需模拟 |
| CT-TYPE-LCFG-02 | LoggerConfig中formatter和transports字段应为可选 | 验证可选性 | 类型检查 | 创建LoggerConfig时formatter和transports字段可省略 | 无需模拟 |
| CT-TYPE-LCFG-03 | LoggerConfig中callSiteCapture字段应为可选 | 验证可选性 | 类型检查 | 创建LoggerConfig时callSiteCapture字段可省略 | 无需模拟 |

### 3.2 单元测试 (Unit Tests)

#### 文件: `packages/core/src/__tests__/unit/core/logging/DefaultLogger.test.ts`

* **测试对象**: DefaultLogger类 (`core/logging/DefaultLogger.ts`)
* **主要方法**: `debug`, `info`, `warn`, `error`, `fatal`, `log`(私有)
* **测试重点**: 验证DefaultLogger如何根据级别过滤日志、捕获调用位置和委托给传输器

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-DEFLOG-01 | debug方法应在DEBUG级别启用时记录日志 | 验证日志级别过滤 | minLevel=DEBUG的logger和debug消息 | 日志被传递给传输器 | 模拟LogTransport.write |
| UT-DEFLOG-02 | info方法应在INFO级别启用时记录日志 | 验证日志级别过滤 | minLevel=INFO的logger和info消息 | 日志被传递给传输器 | 模拟LogTransport.write |
| UT-DEFLOG-03 | warn方法应在WARN级别启用时记录日志 | 验证日志级别过滤 | minLevel=WARN的logger和warn消息 | 日志被传递给传输器 | 模拟LogTransport.write |
| UT-DEFLOG-04 | error方法应在ERROR级别启用时记录日志 | 验证日志级别过滤 | minLevel=ERROR的logger和error消息 | 日志被传递给传输器 | 模拟LogTransport.write |
| UT-DEFLOG-05 | fatal方法应在任何级别都记录日志 | 验证最高级别日志 | minLevel=ERROR的logger和fatal消息 | 日志被传递给传输器 | 模拟LogTransport.write |
| UT-DEFLOG-06 | log方法应将日志条目传递给所有传输器 | 验证多传输器支持 | 多个传输器和日志消息 | 消息传递给所有传输器 | 模拟多个LogTransport.write |
| UT-DEFLOG-07 | log方法应在启用调用位置捕获时添加位置信息 | 验证调用位置捕获 | 启用调用位置的logger和日志消息 | 日志条目包含调用位置信息 | 无需模拟 |
| UT-DEFLOG-08 | log方法应仅为配置的级别捕获调用位置 | 验证选择性调用位置捕获 | 特定级别启用调用位置的logger | 仅特定级别包含调用位置 | 无需模拟 |
| **反向测试** |
| UT-DEFLOG-NEG-01 | debug方法应在高于DEBUG级别时不记录日志 | 验证日志级别过滤 | minLevel=INFO的logger和debug消息 | 日志不被记录 | 模拟LogTransport.write |
| UT-DEFLOG-NEG-02 | log方法应处理传输器抛出的错误 | 验证错误处理 | 抛出错误的传输器和日志消息 | 错误被捕获，不影响其他传输器 | 模拟LogTransport.write抛出错误 |

#### 文件: `packages/core/src/__tests__/unit/core/logging/LoggerRegistry.test.ts`

* **测试对象**: LoggerRegistry类 (`core/logging/LoggerRegistry.ts`)
* **主要方法**: `getInstance`, `getLogger`, `registerLogger`, `createLogger`
* **测试重点**: 验证LoggerRegistry如何管理日志器实例和实现单例模式

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-LOGREG-01 | getInstance应返回单例实例 | 验证单例模式 | 多次调用getInstance | 返回相同实例 | 无需模拟 |
| UT-LOGREG-02 | getInstance应使用默认配置创建实例 | 验证默认配置 | 不带参数调用getInstance | 使用默认配置创建实例 | 无需模拟 |
| UT-LOGREG-03 | getInstance应使用提供的配置创建实例 | 验证自定义配置 | 带配置调用getInstance | 使用提供的配置创建实例 | 无需模拟 |
| UT-LOGREG-04 | getLogger应返回已注册的日志器 | 验证日志器检索 | 已注册日志器的名称 | 返回对应的日志器实例 | 无需模拟 |
| UT-LOGREG-05 | getLogger应在日志器不存在时返回默认日志器 | 验证默认回退 | 未注册的日志器名称 | 返回默认日志器 | 无需模拟 |
| UT-LOGREG-06 | registerLogger应注册新日志器 | 验证日志器注册 | 日志器名称和实例 | 日志器被注册并可检索 | 无需模拟 |
| UT-LOGREG-07 | createLogger应创建并注册新日志器 | 验证日志器创建 | 日志器名称和配置 | 创建并注册日志器 | 无需模拟 |
| **反向测试** |
| UT-LOGREG-NEG-01 | registerLogger应在重复注册时覆盖现有日志器 | 验证重复注册处理 | 重复注册相同名称的日志器 | 新日志器覆盖旧日志器 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/unit/core/logging/formatters/DefaultFormatter.test.ts`

* **测试对象**: DefaultFormatter类 (`core/logging/formatters/DefaultFormatter.ts`)
* **主要方法**: `format`
* **测试重点**: 验证DefaultFormatter如何格式化不同类型的日志条目

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-DEFFRM-01 | format应格式化基本日志条目 | 验证基本格式化 | 包含消息的日志条目 | 返回格式化的字符串 | 无需模拟 |
| UT-DEFFRM-02 | format应包含时间戳 | 验证时间戳格式化 | 包含时间戳的日志条目 | 格式化字符串包含时间戳 | 无需模拟 |
| UT-DEFFRM-03 | format应包含日志级别 | 验证级别格式化 | 不同级别的日志条目 | 格式化字符串包含级别名称 | 无需模拟 |
| UT-DEFFRM-04 | format应包含上下文信息 | 验证上下文格式化 | 包含上下文的日志条目 | 格式化字符串包含上下文 | 无需模拟 |
| UT-DEFFRM-05 | format应包含错误信息 | 验证错误格式化 | 包含错误的日志条目 | 格式化字符串包含错误信息 | 无需模拟 |
| UT-DEFFRM-06 | format应包含调用位置信息 | 验证调用位置格式化 | 包含调用位置的日志条目 | 格式化字符串包含位置信息 | 无需模拟 |
| **反向测试** |
| UT-DEFFRM-NEG-01 | format应处理缺少时间戳的条目 | 验证缺失字段处理 | 缺少时间戳的日志条目 | 正常格式化，不包含时间戳 | 无需模拟 |
| UT-DEFFRM-NEG-02 | format应处理复杂嵌套上下文 | 验证复杂数据处理 | 包含嵌套对象的上下文 | 正确格式化嵌套对象 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/unit/core/logging/transports/ConsoleTransport.test.ts`

* **测试对象**: ConsoleTransport类 (`core/logging/transports/ConsoleTransport.ts`)
* **主要方法**: `write`
* **测试重点**: 验证ConsoleTransport如何将日志输出到控制台

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-CONTR-01 | write应使用console.debug输出DEBUG级别日志 | 验证DEBUG级别输出 | DEBUG级别日志条目 | 调用console.debug | 模拟console.debug |
| UT-CONTR-02 | write应使用console.info输出INFO级别日志 | 验证INFO级别输出 | INFO级别日志条目 | 调用console.info | 模拟console.info |
| UT-CONTR-03 | write应使用console.warn输出WARN级别日志 | 验证WARN级别输出 | WARN级别日志条目 | 调用console.warn | 模拟console.warn |
| UT-CONTR-04 | write应使用console.error输出ERROR级别日志 | 验证ERROR级别输出 | ERROR级别日志条目 | 调用console.error | 模拟console.error |
| UT-CONTR-05 | write应使用console.error输出FATAL级别日志 | 验证FATAL级别输出 | FATAL级别日志条目 | 调用console.error | 模拟console.error |
| UT-CONTR-06 | write应使用formatter格式化日志 | 验证格式化集成 | 日志条目和formatter | 使用formatter格式化日志 | 模拟LogFormatter.format |
| **反向测试** |
| UT-CONTR-NEG-01 | write应处理格式化器抛出的错误 | 验证错误处理 | 抛出错误的formatter | 捕获错误并继续 | 模拟LogFormatter.format抛出错误 |
| UT-CONTR-NEG-02 | write应处理console方法抛出的错误 | 验证错误处理 | 调用时console方法抛出错误 | 捕获错误并继续 | 模拟console方法抛出错误 |

#### 文件: `packages/core/src/__tests__/unit/core/logging/transports/AsyncConsoleTransport.test.ts`

* **测试对象**: AsyncConsoleTransport类 (`core/logging/transports/AsyncConsoleTransport.ts`)
* **主要方法**: `write`, `flush`
* **测试重点**: 验证AsyncConsoleTransport如何异步处理日志

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-ASYNCT-01 | write应将日志添加到队列 | 验证队列添加 | 日志条目 | 日志被添加到队列 | 无需模拟 |
| UT-ASYNCT-02 | write应在第一次添加日志时设置flush定时器 | 验证定时刷新设置 | 第一条日志 | 设置定时器 | 模拟setTimeout |
| UT-ASYNCT-03 | flush应处理队列中的所有日志 | 验证队列处理 | 包含多条日志的队列 | 所有日志被处理 | 模拟console方法 |
| UT-ASYNCT-04 | flush应在同步模式下同步处理日志 | 验证同步模式 | true作为sync参数 | 同步处理日志 | 模拟console方法 |
| UT-ASYNCT-05 | flush应清空队列 | 验证队列清空 | 包含日志的队列 | 队列被清空 | 无需模拟 |
| **反向测试** |
| UT-ASYNCT-NEG-01 | flush应处理处理日志时的错误 | 验证错误处理 | 处理时出错 | 捕获错误并继续处理其他日志 | 模拟processLogEntry抛出错误 |
| UT-ASYNCT-NEG-02 | 构造函数应使用默认间隔时间 | 验证默认值 | 无flush间隔参数 | 使用默认间隔时间 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/unit/core/logging/loggingService.test.ts`

* **测试对象**: loggingService模块 (`core/logging/loggingService.ts`)
* **主要方法**: `getDefaultLogger`, `getLogger`, `createLogger`, `setDefaultLogLevel`
* **测试重点**: 验证loggingService如何协调LoggerRegistry和DefaultLogger

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-LOGSVC-01 | getDefaultLogger应委托给LoggerRegistry | 验证委托 | 调用getDefaultLogger | 调用LoggerRegistry.getInstance().getLogger | 模拟LoggerRegistry |
| UT-LOGSVC-02 | getLogger应委托给LoggerRegistry | 验证委托 | 日志器名称 | 调用LoggerRegistry.getInstance().getLogger | 模拟LoggerRegistry |
| UT-LOGSVC-03 | createLogger应委托给LoggerRegistry | 验证委托 | 日志器名称和配置 | 调用LoggerRegistry.getInstance().createLogger | 模拟LoggerRegistry |
| UT-LOGSVC-04 | setDefaultLogLevel应更新默认日志级别 | 验证级别更新 | 新的日志级别 | 更新默认配置的minLevel | 模拟LoggerRegistry |
| **反向测试** |
| UT-LOGSVC-NEG-01 | loadLoggerConfig应处理环境变量配置 | 验证环境配置 | 设置环境变量 | 配置反映环境变量设置 | 模拟process.env |

### 3.3 集成测试 (Integration Tests)

#### 文件: `packages/core/src/__tests__/integration/logging/loggerFlowIntegration.test.ts`

* **测试对象**: 日志记录的完整流程 (从API层到日志输出)
* **测试重点**: 验证日志模块各组件的集成与协作

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| IT-LOGFLOW-01 | API层应正确创建并配置日志器 | 验证API到日志器创建流程 | 创建日志器的API调用 | 正确创建并配置日志器 | 模拟控制台输出 |
| IT-LOGFLOW-02 | 日志过滤应在API到传输器的完整流程中工作 | 验证级别过滤的端到端流程 | 不同级别的日志调用 | 正确过滤低级别日志 | 模拟控制台输出 |
| IT-LOGFLOW-03 | 调用位置捕获应在完整流程中工作 | 验证调用位置捕获的端到端流程 | 启用调用位置的日志调用 | 日志包含正确的调用位置 | 模拟控制台输出 |
| IT-LOGFLOW-04 | 异步传输应在完整流程中工作 | 验证异步日志的端到端流程 | 使用异步传输器的日志调用 | 日志被异步处理和输出 | 模拟控制台输出，控制定时器 |
| IT-LOGFLOW-05 | 自定义格式化器应在完整流程中工作 | 验证自定义格式化的端到端流程 | 使用自定义格式化器的日志调用 | 日志使用自定义格式输出 | 模拟控制台输出 |

#### 文件: `packages/core/src/__tests__/integration/logging/multiTransportIntegration.test.ts`

* **测试对象**: 多传输器配置下的日志记录
* **测试重点**: 验证日志如何同时输出到多个目标

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| IT-MULTITRANS-01 | 日志应同时写入多个传输器 | 验证多传输器流程 | 配置多个传输器的日志调用 | 日志被发送到所有传输器 | 模拟多个传输器 |
| IT-MULTITRANS-02 | 一个传输器的错误不应影响其他传输器 | 验证错误隔离 | 一个传输器抛出错误 | 其他传输器仍然接收日志 | 模拟一个传输器抛出错误 |
| IT-MULTITRANS-03 | 不同传输器应能使用不同格式化器 | 验证多格式化器支持 | 配置不同格式化器的传输器 | 每个传输器使用自己的格式化器 | 模拟多个传输器和格式化器 |

### 3.4 端到端测试 (End-to-End Tests)

#### 文件: `packages/core/src/__tests__/e2e/logging/loggerUsage.e2e.test.ts`

* **测试对象**: 日志模块的实际使用场景
* **测试重点**: 验证在真实使用场景中的完整功能

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| E2E-LOG-01 | 应能获取默认日志器并记录日志 | 验证基本使用场景 | 获取默认日志器并记录 | 日志正确输出 | 最小模拟，主要捕获输出 |
| E2E-LOG-02 | 应能创建命名日志器并使用 | 验证命名日志器场景 | 创建和使用命名日志器 | 日志包含命名空间信息 | 最小模拟，主要捕获输出 |
| E2E-LOG-03 | 应能配置和使用多个传输器 | 验证多传输器场景 | 配置控制台和文件传输器 | 日志同时输出到控制台和文件 | 最小模拟，验证文件写入 |
| E2E-LOG-04 | 应能记录异常并包含堆栈信息 | 验证错误日志场景 | 记录包含Error的日志 | 日志包含错误消息和堆栈 | 最小模拟，主要捕获输出 |
| E2E-LOG-05 | 应能使用自定义传输器和格式化器 | 验证自定义组件场景 | 使用自定义组件配置日志器 | 自定义组件被正确使用 | 最小模拟，验证自定义逻辑 |

### 3.5 性能测试 (Performance Tests)

#### 文件: `packages/core/src/__tests__/perform/logging/loggerPerformance.perf.test.ts`

* **测试对象**: 日志模块在高压力下的性能表现
* **测试重点**: 验证日志处理的效率和资源使用

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| PERF-LOG-01 | 同步日志处理在高频调用下的性能 | 验证同步日志性能 | 1000次连续日志调用 | 完成时间在可接受范围内 | 模拟或捕获控制台输出 |
| PERF-LOG-02 | 异步日志处理在高频调用下的性能 | 验证异步日志性能 | 1000次连续日志调用 | 主线程阻塞时间最小化 | 模拟或捕获控制台输出 |
| PERF-LOG-03 | 日志过滤对性能的影响 | 验证过滤性能优化 | 高于和低于minLevel的日志调用 | 过滤低级别日志显著提高性能 | 模拟或捕获控制台输出 |
| PERF-LOG-04 | 调用位置捕获对性能的影响 | 验证调用位置捕获开销 | 启用和禁用调用位置捕获的日志 | 量化调用位置捕获的性能影响 | 模拟或捕获控制台输出 |
| PERF-LOG-05 | 大数据量日志处理性能 | 验证大数据量处理能力 | 包含大对象的日志条目 | 处理大对象的性能在可接受范围内 | 模拟或捕获控制台输出 |

## 4. 测试夹具设计

为了支持上述测试用例，应创建以下测试夹具：

```typescript
// packages/core/src/__tests__/fixtures/logging/loggerFixtures.ts

import { LogLevel, LogEntry, LoggerConfig, Logger, LogFormatter, LogTransport, CallerInfo } from '../../../src/types/log';
import { DefaultFormatter } from '../../../src/core/logging/formatters/DefaultFormatter';

// 创建LogEntry夹具
export function createLogEntryFixture(overrides?: Partial<LogEntry>): LogEntry {
  return {
    timestamp: new Date(),
    level: LogLevel.INFO,
    message: "Test log message",
    context: { module: "test-module" },
    error: undefined,
    caller: undefined,
    ...overrides
  };
}

// 创建带错误的LogEntry夹具
export function createErrorLogEntryFixture(): LogEntry {
  const error = new Error("Test error");
  return createLogEntryFixture({
    level: LogLevel.ERROR,
    message: "Error occurred",
    error
  });
}

// 创建带调用位置的LogEntry夹具
export function createCallerLogEntryFixture(): LogEntry {
  const caller: CallerInfo = {
    fileName: "test-file.ts",
    functionName: "testFunction",
    lineNumber: 42,
    columnNumber: 10,
    className: "TestClass"
  };
  
  return createLogEntryFixture({
    caller
  });
}

// 创建LoggerConfig夹具
export function createLoggerConfigFixture(overrides?: Partial<LoggerConfig>): LoggerConfig {
  return {
    minLevel: LogLevel.INFO,
    formatter: new DefaultFormatter(),
    transports: [createMockTransport()],
    ...overrides
  };
}

// 创建带调用位置捕获的LoggerConfig夹具
export function createCallerCaptureConfigFixture(): LoggerConfig {
  return createLoggerConfigFixture({
    callSiteCapture: {
      enabled: true,
      forLevels: [LogLevel.ERROR, LogLevel.FATAL]
    }
  });
}

// 创建Mock Logger
export function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn()
  };
}

// 创建Mock LogFormatter
export function createMockFormatter(): LogFormatter {
  return {
    format: vi.fn().mockImplementation((entry: LogEntry) => `[${LogLevel[entry.level]}] ${entry.message}`)
  };
}

// 创建Mock LogTransport
export function createMockTransport(): LogTransport {
  return {
    write: vi.fn()
  };
}

// 创建抛出错误的Mock LogTransport
export function createErrorTransport(): LogTransport {
  return {
    write: vi.fn().mockImplementation(() => {
      throw new Error("Transport error");
    })
  };
}

// 创建大对象上下文
export function createLargeContextFixture(size: number = 1000): Record<string, unknown> {
  const context: Record<string, unknown> = {};
  for (let i = 0; i < size; i++) {
    context[`key-${i}`] = `value-${i}-${'x'.repeat(100)}`;
  }
  return context;
}

// 创建自定义格式化器
export class TestFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    return `TEST: [${LogLevel[entry.level]}] ${entry.message}`;
  }
}

// 创建记录输出的传输器
export class MemoryTransport implements LogTransport {
  logs: LogEntry[] = [];
  formatter?: LogFormatter;
  
  constructor(formatter?: LogFormatter) {
    this.formatter = formatter;
  }
  
  write(entry: LogEntry): void {
    this.logs.push({...entry});
  }
  
  getFormattedLogs(): string[] {
    if (!this.formatter) {
      return this.logs.map(log => log.message);
    }
    return this.logs.map(log => this.formatter!.format(log));
  }
  
  clear(): void {
    this.logs = [];
  }
}
```

## 5. 测试实现示例

```typescript
// packages/core/src/__tests__/unit/core/logging/DefaultLogger.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DefaultLogger } from '../../../../src/core/logging/DefaultLogger';
import { LogLevel } from '../../../../src/types/log';
import { 
  createLoggerConfigFixture,
  createCallerCaptureConfigFixture,
  createMockTransport
} from '../../../fixtures/logging/loggerFixtures';

describe('UT-DEFLOG', () => {
  let mockTransport;
  let logger;
  
  beforeEach(() => {
    mockTransport = createMockTransport();
    const config = createLoggerConfigFixture({
      minLevel: LogLevel.DEBUG,
      transports: [mockTransport]
    });
    logger = new DefaultLogger(config);
  });
  
  test('debug方法应在DEBUG级别启用时记录日志', () => {
    // 执行
    logger.debug('Debug message', { module: 'test' });
    
    // 断言
    expect(mockTransport.write).toHaveBeenCalledTimes(1);
    expect(mockTransport.write).toHaveBeenCalledWith(expect.objectContaining({
      level: LogLevel.DEBUG,
      message: 'Debug message',
      context: { module: 'test' }
    }));
  });
  
  test('debug方法应在高于DEBUG级别时不记录日志', () => {
    // 准备
    const infoConfig = createLoggerConfigFixture({
      minLevel: LogLevel.INFO,
      transports: [mockTransport]
    });
    const infoLogger = new DefaultLogger(infoConfig);
    
    // 执行
    infoLogger.debug('Debug message');
    
    // 断言
    expect(mockTransport.write).not.toHaveBeenCalled();
  });
  
  test('log方法应在启用调用位置捕获时添加位置信息', () => {
    // 准备
    const callerConfig = createCallerCaptureConfigFixture();
    callerConfig.transports = [mockTransport];
    const callerLogger = new DefaultLogger(callerConfig);
    
    // 执行
    callerLogger.error('Error message');
    
    // 断言
    expect(mockTransport.write).toHaveBeenCalledWith(expect.objectContaining({
      level: LogLevel.ERROR,
      message: 'Error message',
      caller: expect.objectContaining({
        fileName: expect.any(String),
        functionName: expect.any(String),
        lineNumber: expect.any(Number)
      })
    }));
  });
});

// packages/core/src/__tests__/integration/logging/loggerFlowIntegration.test.ts
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLogger, createLogger, LogLevel } from '../../../../src/api/logger';
import { MemoryTransport, TestFormatter } from '../../../fixtures/logging/loggerFixtures';

describe('IT-LOGFLOW', () => {
  // 捕获控制台输出
  const originalConsole = { ...console };
  const mockConsole = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
  
  beforeEach(() => {
    // 替换控制台方法
    console.debug = mockConsole.debug;
    console.info = mockConsole.info;
    console.warn = mockConsole.warn;
    console.error = mockConsole.error;
    
    // 清除mock状态
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // 恢复控制台方法
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });
  
  test('API层应正确创建并配置日志器', () => {
    // 执行
    const logger = createLogger('test-logger', {
      minLevel: LogLevel.INFO
    });
    
    // 使用日志器
    logger.debug('Debug message'); // 应被过滤
    logger.info('Info message');
    logger.warn('Warning message');
    
    // 断言
    expect(mockConsole.debug).not.toHaveBeenCalled(); // debug被过滤
    expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('Info message'));
    expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('Warning message'));
  });
  
  test('日志过滤应在API到传输器的完整流程中工作', () => {
    // 准备
    const memoryTransport = new MemoryTransport();
    
    // 执行
    const logger = createLogger('filter-test', {
      minLevel: LogLevel.WARN,
      transports: [memoryTransport]
    });
    
    // 记录不同级别的日志
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    
    // 断言
    const logs = memoryTransport.logs;
    expect(logs.length).toBe(2); // 只有WARN和ERROR
    expect(logs[0].level).toBe(LogLevel.WARN);
    expect(logs[1].level).toBe(LogLevel.ERROR);
  });
});
```

## 6. 测试覆盖率目标

- **契约测试**: 覆盖所有公共API和Types，确保接口稳定性。
- **单元测试**: 覆盖各组件所有方法，特别是DefaultLogger、LoggerRegistry、传输器和格式化器类，目标行覆盖率90%+。
- **集成测试**: 覆盖主要的协作流程，目标行覆盖率85%+。
- **端到端测试**: 覆盖关键用户场景，确保实际使用时的正确性。
- **性能测试**: 确保在高负载下的性能表现满足需求。

## 7. 模拟策略

- **契约测试**: 主要进行类型检查，部分情况下需要模拟loggingService返回符合契约的数据。
- **单元测试**:
  - 测试DefaultLogger时，模拟LogTransport.write方法以验证调用。
  - 测试传输器时，模拟console方法以验证输出。
  - 测试LoggerRegistry时尽量使用真实实例以验证单例行为。
- **集成测试**: 模拟最外层的输出目标（如控制台），但使用实际组件实现内部协作。
- **端到端测试**: 尽量减少模拟，主要捕获最终输出以验证结果。
- **性能测试**: 可能需要模拟控制台输出以防止测试输出过多，但保持真实的内部处理流程。

## 8. 测试总结

本测试设计覆盖了Logger模块的所有核心组件和关键功能，遵循DPML架构测试策略规则，设计了不同类型的测试：

1. **契约测试**: 确保API和类型的稳定性和一致性
2. **单元测试**: 验证各组件的独立功能，包括DefaultLogger、LoggerRegistry、不同的传输器和格式化器
3. **集成测试**: 验证协调和协作能力，特别是完整的日志流程和多传输器配置
4. **端到端测试**: 验证在实际使用场景中的正确行为
5. **性能测试**: 验证在高负载下的效率和资源使用

测试用例设计注重正向测试和反向测试的平衡，确保既测试正常功能路径，也测试错误处理机制。测试夹具设计提供了丰富的数据结构和模拟对象，便于测试的实施和维护。

通过全面的测试覆盖，确保Logger模块能够稳定高效地记录日志，正确处理各种配置和错误情况，并在高负载下保持良好的性能。这将为DPML项目提供可靠的日志基础设施，支持开发、调试和运行时监控。 