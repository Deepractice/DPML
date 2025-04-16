# @dpml/common 包导出结构问题

## 问题概述

在集成`@dpml/common`包的日志系统到CLI工具时，发现当前的导出结构存在问题，导致无法通过标准方式直接导入和使用日志功能。

## 详细描述

目前`@dpml/common`包使用了命名空间导出方式：

```typescript
// @dpml/common/src/index.ts
import * as loggerExports from './logger';
export const logger = loggerExports;
```

这种导出方式存在以下问题：

1. **使用不便**：需要通过`import { logger } from '@dpml/common'`然后`logger.createLogger`等方式调用，与直接导入相比较繁琐
2. **类型支持不友好**：使用命名空间导出方式时，TypeScript提示和自动补全体验较差
3. **导入路径不稳定**：由于公共API不清晰，开发人员倾向于直接从内部路径导入（如`@dpml/common/dist/logger`），这依赖于实现细节，增加了版本升级时的兼容性风险

## 问题复现

当在CLI项目中尝试集成@dpml/common的日志系统时，我们不得不使用以下不规范的导入方式：

```typescript
// 不规范的导入
import { 
  createLogger, 
  LogLevel
} from '@dpml/common/dist/logger';

// 或者使用命名空间，但体验不佳
import { logger } from '@dpml/common';
const myLogger = logger.createLogger('my-module');
```

## 期望行为

期望能够直接从包根导入所需功能，例如：

```typescript
// 理想的导入方式
import { createLogger, LogLevel } from '@dpml/common';
```

## 修复建议

建议采用以下任一方案修复：

### 方案1：扁平化导出

修改`@dpml/common/src/index.ts`，将子模块的导出扁平化：

```typescript
// 直接重新导出所有子模块内容
export * from './logger';
export * from './testing';
// ...其他模块
```

### 方案2：设置package.json中的exports字段

配置子路径导出，允许用户选择直接导入或通过子路径导入：

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./logger": "./dist/logger/index.js",
    "./testing": "./dist/testing/index.js"
  }
}
```

这样用户可以使用`import { createLogger } from '@dpml/common/logger'`方式导入。

### 方案3：命名空间导出+类型增强

保持命名空间导出方式，但增加类型声明，改善开发体验：

```typescript
// index.ts
import * as loggerExports from './logger';
export const logger = loggerExports;

// 添加类型导出，方便用户使用
export type { LogLevel, ILogger } from './logger/core/types';
```

## 影响范围

此问题影响所有依赖@dpml/common包的模块，特别是需要使用日志系统的模块。修复此问题将提高开发效率并减少潜在的导入错误。

## 优先级

中等 - 不影响功能，但影响开发体验和代码质量。

---

提交人: [Your Name]  
日期: 2023-11-20 