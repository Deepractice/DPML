# @dpml/common 集成测试和性能验证

本目录包含@dpml/common包的集成测试、跨包兼容性测试和性能测试。

## 测试组织结构

集成测试按照模块划分为不同的测试文件：

- **logger-integration.test.ts** - 日志系统集成测试
- **testing-integration.test.ts** - 测试工具集成测试
- **utils-integration.test.ts** - 工具函数集成测试
- **cross-package-integration.test.ts** - 跨包集成测试
- **performance.test.ts** - 性能测试
- **browser-compatibility.test.ts** - 浏览器兼容性测试
- **index.ts** - 集成测试工具和报告生成

## 启用测试

> **注意**：由于集成测试需要依赖包已正确构建，请确保先构建包再运行测试。

目前测试导入失败是因为模块路径问题。请按以下步骤启用测试：

1. 首先确保包已构建：

```bash
pnpm build
```

2. 修改vitest.config.ts文件，添加别名映射：

```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules'],
    testTimeout: 10000
  },
  resolve: {
    alias: {
      '@dpml/common': resolve(__dirname, './src'),
      '@dpml/common/logger': resolve(__dirname, './src/logger'),
      '@dpml/common/testing': resolve(__dirname, './src/testing'),
      '@dpml/common/utils': resolve(__dirname, './src/utils'),
      '@dpml/common/types': resolve(__dirname, './src/types')
    }
  }
});
```

3. 为了测试模块间的相互依赖，需要确保每个模块都正确导出其API。

## 运行测试

### 运行所有测试

运行所有集成测试：

```bash
pnpm test
```

### 运行特定测试

运行特定的集成测试文件：

```bash
pnpm vitest run tests/integration/logger-integration.test.ts
```

### 运行性能测试

性能测试会生成性能报告：

```bash
pnpm vitest run tests/integration/performance.test.ts
```

## 测试场景与覆盖率

### 集成测试覆盖

- **日志系统**：验证日志级别、多传输通道、格式化功能集成
- **测试工具**：验证环境管理、模拟对象和测试工具的集成性
- **工具函数**：验证不同功能的组合使用和统一接口

### 跨包集成测试

验证@dpml/common包可被其他DPML包正确使用：
- 日志系统被其他包使用
- 测试工具支持其他包的测试
- 工具函数在其他包中的应用

### 性能测试

针对关键功能进行性能测试和基准设定：
- 日志记录性能
- 深拷贝性能
- 路径操作性能
- 数组操作性能
- 模拟对象性能

### 兼容性测试

测试在不同环境中的兼容性：
- Node.js 不同版本
- 浏览器环境兼容性
- 平台差异处理

## 测试报告

集成测试完成后会生成测试报告，包含以下信息：
- 测试通过率
- 各模块集成情况
- 性能测试结果
- 环境兼容性结果

 