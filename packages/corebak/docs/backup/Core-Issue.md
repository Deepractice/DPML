# DPML Core 模块问题记录

本文档记录DPML Core模块开发过程中遇到的问题，以便后续集中解决。

## 处理器（Processor）模块

### 1. 错误恢复机制

**问题描述**：

- 错误恢复测试未通过，DefaultProcessor处理访问者错误的行为与预期不符
- 测试显示错误未被正确记录，且严格模式（strict mode）下未正确中断处理流程
- 不同严重级别的错误未能触发相应的恢复行为

**影响**：中等。核心功能仍能工作，但在处理异常情况时可能不够健壮。

**相关文件**：

- `test/processor/error/error-recovery.test.ts`
- `src/processor/defaultProcessor.ts`

**解决方向**：

1. 调整DefaultProcessor中的错误处理逻辑，确保errors数组正确记录错误
2. 完善strict模式下的处理中断机制
3. 实现基于错误严重级别的不同恢复策略

### 2. 跨平台文件路径处理

**问题描述**：

- 跨平台文件引用处理相关测试未通过
- Windows格式和Unix格式的路径处理存在问题
- 测试中的mock配置有误（`vi.mocked(...).mockRestore is not a function`）

**影响**：中等。在不同操作系统环境下可能导致文件引用解析失败。

**相关文件**：

- `test/processor/crossPlatformReference.test.ts`
- `src/utils/pathUtils.ts`

**解决方向**：

1. 改进`pathUtils.ts`中的平台检测和路径转换逻辑
2. 修复测试中的mock配置，使用正确的方式恢复原始函数
3. 确保路径分隔符在不同平台间正确转换

### 3. 内存优化问题

**问题描述**：

- 内存使用测试未通过，存在常量赋值错误（`Assignment to constant variable`）
- 测试中尝试释放文档引用的方式不正确

**影响**：低。不影响基本功能，但可能在处理大型文档时性能不佳。

**相关文件**：

- `test/processor/performance/memory-usage.test.ts`
- `src/processor/utils/memoryOptimizer.ts`

**解决方向**：

1. 修复测试中的常量赋值错误，使用正确的方式释放引用
2. 实现更高效的内存管理策略，特别是对大型文档和深层嵌套结构

### 4. 文件协议处理器问题

**问题描述**：

- FileProtocolHandler测试未通过，主要是路径处理相关问题
- 测试中的path模块mock配置有误（`No "normalize" export is defined on the "path" mock`）

**影响**：中等。可能影响文件引用解析功能。

**相关文件**：

- `test/processor/protocols/fileProtocolHandler.test.ts`
- `src/processor/protocols/fileProtocolHandler.ts`

**解决方向**：

1. 修复测试中的path模块mock配置，正确使用importOriginal
2. 改进FileProtocolHandler中的路径解析逻辑

### 5. Parser与Processor集成问题

**问题描述**：

- Parser与Processor之间的集成测试未通过
- 存在方法调用错误（`tagRegistry.register is not a function`）

**影响**：高。可能影响整个解析处理流程。

**相关文件**：

- `test/integration/parser-processor-integration.test.ts`
- `src/parser/TagRegistry.ts`

**解决方向**：

1. 检查TagRegistry的接口实现，确保register方法正确定义
2. 完善Parser和Processor之间的集成逻辑

### 6. 测试覆盖率工具配置

**问题描述**：

- 覆盖率监控脚本执行失败
- V8CoverageProvider初始化错误（`this._initialize is not a function`）

**影响**：低。仅影响开发过程中的测试覆盖度量。

**相关文件**：

- `scripts/coverage-monitor.js`
- `scripts/ci-coverage-check.js`
- `vitest.config.ts`

**解决方向**：

1. 检查vitest和@vitest/coverage-v8的版本兼容性
2. 调整覆盖率配置，解决初始化问题

## 后续计划

上述问题将在完成Core模块的其他部分后统一解决。目前处理器模块的核心功能已经可用，不会影响后续开发。

预计解决时间：Core模块完成后的优化阶段（约2周后）。
