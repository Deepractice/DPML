# 包结构与导入/导出规范

本文档定义了DPML项目的包结构标准和导入/导出规范，旨在确保代码组织的一致性、可维护性和可扩展性。

## 包目录结构

每个包应遵循以下标准目录结构：

```
packages/my-package/
├── src/
│   ├── api/              # 对外暴露的公共API
│   │   ├── index.ts      # API模块导出（自动生成）
│   │   └── ...           # API实现文件
│   │
│   ├── types/            # 类型定义
│   │   ├── index.ts      # 类型导出（自动生成）
│   │   └── ...           # 具体类型定义文件
│   │
│   ├── core/             # 核心实现逻辑
│   │   ├── index.ts      # 核心模块导出（自动生成）
│   │   └── ...           # 具体实现文件
│   │
│   ├── constants/        # 常量定义
│   │   ├── index.ts      # 常量导出（自动生成）
│   │   └── ...           # 常量文件
│   │
│   ├── configs/          # 内部配置（不对外暴露）
│   │   └── default.ts    # 默认配置
│   │
│   ├── __tests__/        # 测试文件
│   │   ├── api/          # API测试
│   │   └── core/         # 核心实现测试
│   │
│   └── index.ts          # 包主入口（手动维护）
│
└── package.json
```

### 目录职责详解

1. **api/**: 仅包含对外暴露的公共接口

   - 定义包的外部契约
   - 封装内部实现细节
   - 提供稳定的向后兼容API

2. **types/**: 包含所有对外暴露的类型定义

   - 接口(interface)定义
   - 类型别名(type)定义
   - 枚举(enum)定义

3. **core/**: 包含内部实现逻辑

   - 不直接对外暴露
   - 实现API所需的具体功能
   - 可自由重构而不影响外部API

4. **constants/**: 常量定义

   - 使用大写字母和下划线命名
   - 按功能领域分组

5. **configs/**: 内部配置参数（不对外暴露）

   - 内部功能的配置选项
   - 默认参数值
   - 特性开关

6. ****tests**/**: 测试文件
   - 单元测试
   - 集成测试
   - 遵循Jest/Vitest命名约定

## 文件命名规范

1. **组件和模型文件**: 使用PascalCase

   - `/src/components/**/*.{ts,tsx}`
   - `/src/models/**/*.ts`
   - `/src/**/types/**/*.ts`

2. **工具类文件**: 使用camelCase

   - `/src/utils/**/*.ts`
   - `/src/helpers/**/*.ts`
   - `/src/functions/**/*.ts`

3. **其他文件**: 使用kebab-case

   - 默认使用kebab-case命名文件

4. **测试文件**: 命名规范灵活
   - 推荐格式: `原文件名.test.ts` 或 `原文件名.spec.ts`

## 导入规范

### 导入顺序

所有导入应按以下顺序组织，每组之间用空行分隔：

1. Node内置模块
2. 外部依赖包
3. 工作区内其他包（monorepo特有）
4. 当前包内绝对路径导入
5. 相对路径导入

示例：

```typescript
// 1. Node内置模块
import fs from 'fs';
import path from 'path';

// 2. 外部依赖包
import { z } from 'zod';
import lodash from 'lodash';

// 3. 工作区内其他包
import { Logger } from '@dpml/common';
import { Parser } from '@dpml/core';

// 4. 当前包内绝对路径导入
import { ApiError } from '#/errors';

// 5. 相对路径导入
import { processData } from '../utils';
import { DEFAULT_OPTIONS } from './constants';
```

### 导入路径规则

1. **禁止过深的相对路径**

   - 超过两级目录应使用别名或绝对路径
   - 错误: `import { x } from '../../../utils/helpers'`
   - 正确: `import { x } from '@package/utils'`

2. **类型导入使用`type`关键字**

   ```typescript
   import type { UserType, ConfigOptions } from './types';
   ```

3. **工作区包导入使用包名**

   ```typescript
   // 正确
   import { utils } from '@dpml/common';

   // 避免
   import { utils } from '../../common/src';
   ```

## 导出规范

### 导出策略

1. **包级别手动维护**

   - 包的主入口文件(`src/index.ts`)需手动维护
   - 采用命名空间式导出
   - 只导出必要的公共API

2. **子目录自动生成**
   - 使用`pnpm barrels`自动生成子目录barrel文件
   - 内部模块使用扁平导出

### 包级别导出示例

```typescript
// src/index.ts - 手动维护
/**
 * @dpml/core 包的主入口文件
 */

// 导出所有公共API
export * from './api';

// 导出所有类型
export * from './types';

// 命名空间导出
export * as constants from './constants';

// 直接导出主要类/函数
export { Parser } from './api/parser';
```

### 避免命名冲突

1. **使用命名空间导出**

   ```typescript
   // 在包入口
   export * as parser from './api/parser';
   export * as formatter from './api/formatter';

   // 使用时
   import { parser, formatter } from '@dpml/core';
   parser.parse();
   formatter.format();
   ```

2. **避免通配符导入**

   ```typescript
   // 避免
   import * from '@dpml/core';

   // 推荐
   import { specific, functions } from '@dpml/core';
   ```

## 工具支持

1. **自动生成barrel文件**

   ```bash
   # 生成所有子目录的barrel文件
   pnpm barrels

   # 监视文件变化并自动生成
   pnpm barrels:watch
   ```

2. **ESLint规则支持**
   - 文件命名规则
   - 导入顺序规则
   - 导入路径规则

## 依赖管理原则

1. **使用common包共享通用功能**

   - 工具函数: 使用`@dpml/common/utils`
   - 错误处理: 使用`@dpml/common/errors`
   - 通用类型: 使用`@dpml/common/types`

2. **避免循环依赖**
   - 包之间的依赖应形成有向无环图
   - 公共类型可提取到专用包或common包

## 最佳实践

1. **契约优先设计**

   - 先定义API和类型，再实现内部逻辑
   - 保持向后兼容性

2. **最小暴露原则**

   - 只暴露必要的公共API
   - 内部实现细节对外隐藏

3. **命名空间隔离**

   - 使用命名空间避免名称冲突
   - 清晰表达模块边界

4. **测试与实现共存**
   - 测试文件与源代码在同一目录结构中
   - 遵循就近原则，方便维护
