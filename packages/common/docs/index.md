# @dpml/common 文档

欢迎使用@dpml/common包的文档！本文档提供了DPML项目通用工具和共享功能库的详细说明。

## 关于 @dpml/common

@dpml/common包提供了DPML项目中所有包共用的功能，包括日志系统、测试工具、通用工具函数和共享类型定义。它旨在减少代码重复，提供统一的接口和实现，简化DPML项目的开发。

## 快速入门

### 安装

```bash
pnpm add @dpml/common
```

### 导入模块

@dpml/common包设计为支持部分导入，可以只导入需要的模块：

```typescript
// 导入整个包
import * as common from '@dpml/common';

// 导入特定命名空间
import { logger, utils } from '@dpml/common';

// 直接导入特定模块（推荐，减少打包体积）
import { createLogger } from '@dpml/common/logger';
import { stringUtils } from '@dpml/common/utils';
```

## 包含模块

@dpml/common包含四个核心模块：

1. **[日志系统 (Logger)](./logger/README.md)**  
   提供统一的日志接口和实现，支持多级别日志和不同输出目标。

2. **[测试工具 (Testing)](./testing/README.md)**  
   提供测试辅助工具、模拟对象和测试数据工厂。

3. **[通用工具函数 (Utils)](./utils/README.md)**  
   提供字符串处理、数组操作、对象处理和异步操作等工具。

4. **[共享类型定义 (Types)](./types/README.md)**  
   提供DPML项目中共享的基础类型定义。

## 文档导航

- **[API参考文档](./API-Reference.md)** - 详细的API说明
- **[集成指南](./integration-guide.md)** - 与其他DPML包集成的说明
- **[升级与迁移指南](./migration-guide.md)** - 版本迁移说明

## 示例

@dpml/common包提供了多个使用示例：

- **日志系统示例** - [examples/logger/basic-usage.ts](../examples/logger/basic-usage.ts)
- **测试工具示例** - [examples/testing/mock-file-system.ts](../examples/testing/mock-file-system.ts)
- **工具函数示例** - [examples/utils/string-array-utils.ts](../examples/utils/string-array-utils.ts)
- **类型使用示例** - [examples/types/result-error-handling.ts](../examples/types/result-error-handling.ts)

## 贡献

如果您想为@dpml/common包做出贡献，请查看项目的[贡献指南](../../CONTRIBUTING.md)。 