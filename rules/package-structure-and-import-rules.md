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
│   ├── utils/            # 通用工具函数
│   │   ├── index.ts      # 工具函数导出（自动生成）
│   │   └── ...           # 各类工具函数
│   │
│   ├── errors/           # 错误处理
│   │   ├── index.ts      # 错误类导出（自动生成）
│   │   └── ...           # 自定义错误类和处理
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

6. **utils/**: 通用工具函数

   - 各类工具函数

7. **errors/**: 错误处理

   - 自定义错误类和处理

8. ****tests**/**: 测试文件
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
4. 当前包内相对路径导入（同级目录或跨一级目录）

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

// 4. 当前包内相对路径导入
import { ApiError } from '../errors/api-error';
import { processData } from '../utils/process';
import { DEFAULT_OPTIONS } from './constants';
```

### 扁平化目录结构与相对路径导入

为提高代码的可读性和可维护性，包内结构与导入应遵循以下规则：

1. **保持扁平化的目录结构**

   - 只使用一级目录分类，避免深层嵌套
   - 如果模块复杂度增加，使用命名约定而非子目录
   
   ```
   // 推荐
   src/api/parser-core.ts
   src/api/parser-utils.ts
   
   // 避免
   src/api/parser/core.ts
   src/api/parser/utils.ts
   ```

2. **使用相对路径导入**

   - 优先使用相对路径而非别名
   - 同目录文件: `import { something } from './something';`
   - 跨一级目录: `import { something } from '../otherModule/something';`
   
   ```typescript
   // 同级目录导入
   import { parseXml } from './xml-parser';
   
   // 跨一级目录导入（推荐的最大深度）
   import { StringType } from '../types/string-type';
   ```

3. **通过索引文件聚合相关功能**

   - 使用index.ts来聚合相关功能，简化导入
   - 由`pnpm barrels`命令自动生成一级目录的index.ts
   
   ```typescript
   // api/index.ts（自动生成）
   export * from './parser-core';
   export * from './parser-utils';
   
   // 在其他文件中导入
   import { parse, validate } from '../api';
   ```

4. **处理复杂模块**

   - 当功能模块变得过于复杂时，考虑拆分为独立的包
   - 例如将 parser 从 core 包中分离出来成为 `@dpml/parser`

这种方式简化了配置，提高了工具兼容性，并与TypeScript社区最佳实践保持一致。

### 导入路径规则

1. **避免过深的相对路径**

   - 相对路径最多跨越一级目录
   - 错误: `import { x } from '../../utils/helpers'`
   - 正确: `import { x } from '../utils/helpers'` 

2. **类型导入使用`type`关键字**

   ```typescript
   import type { UserType, ConfigOptions } from '../types/user';
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

### 索引文件管理原则

项目中的索引文件(index.ts)管理遵循以下原则：

1. **包级索引文件**（src/index.ts）
   - 手动维护
   - 有选择性地导出公共API和类型
   - 决定包对外暴露的内容
   - 可以使用命名空间导出避免命名冲突

2. **一级目录索引文件**（如src/api/index.ts, src/types/index.ts等）
   - 由`pnpm barrels`命令自动生成
   - 收集并导出该目录下所有内容
   - 开发人员通常通过这些一级目录索引导入模块

3. **深层目录**（如src/core/processor等）
   - 原则上不需要索引文件
   - 每个文件直接导出其函数、类等
   - 只有当该子模块需要统一导出时才考虑添加索引文件

4. **导入原则**
   - 优先从一级目录导入: `import { Something } from '#types'`
   - 当存在命名冲突时，采用重命名或深层导入

通过遵循上述原则，可以在减少手动工作量的同时，保持包结构的清晰和可控。

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

## 测试文件组织与命名规范

### 测试目录结构

测试文件应组织在 `__tests__` 目录中，按照以下结构：

```
__tests__/
├── unit/                # 单元测试（镜像源代码结构）
│   ├── api/
│   ├── core/
│   └── utils/
├── integration/         # 集成测试（按功能分组）
│   ├── workflow/
│   └── system/
├── e2e/                 # 端到端测试
├── performance/         # 性能测试
│   ├── parsing.bench.ts
│   └── rendering.bench.ts
└── fixtures/            # 测试数据和固定装置
    ├── mock-data/
    └── test-utils/
```

### 测试文件命名约定

1. **单元测试和集成测试**
   - 标准格式：`原文件名.test.ts` 或 `原文件名.spec.ts`
   - 示例：`parser.test.ts`, `formatter.spec.ts`

2. **性能测试/基准测试**
   - 使用 `.bench.ts` 扩展名
   - 示例：`parsing.bench.ts`, `rendering.bench.ts`

3. **端到端测试**
   - 使用有描述性的文件名，格式为 `feature-name.e2e.ts`
   - 示例：`user-workflow.e2e.ts`

### 性能测试配置

使用 Vitest 进行性能测试时，需在配置文件中启用基准测试功能：

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: ['**/*.{test,spec,bench}.{js,ts,jsx,tsx}'],
    benchmark: {
      include: ['**/*.bench.{js,ts}']
    }
  }
})
```

### 测试文件组织最佳实践

1. **单元测试镜像源代码结构**
   - 单元测试应反映源代码的目录结构
   - 示例：`src/api/parser.ts` 对应 `__tests__/unit/api/parser.test.ts`

2. **测试数据集中管理**
   - 共享测试数据放在 `__tests__/fixtures` 目录
   - 按功能或模块组织测试数据文件

3. **区分测试类型**
   - 每种测试类型（单元、集成、性能）应有明确的职责
   - 性能测试聚焦于关键性能指标和瓶颈点

4. **测试工具函数复用**
   - 提取共用测试工具到 `__tests__/fixtures/test-utils`
   - 减少测试代码重复
