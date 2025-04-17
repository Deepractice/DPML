# 导入与导出规则

本文档定义了DPML项目的导入和导出规范，旨在确保代码风格统一、依赖关系清晰，并遵循最佳实践。

## 入口文件管理

包的主入口文件(`src/index.ts`)需要手动维护，遵循以下原则：

1. **只导出公共内容**
   - 所有公共API（从api/目录）
   - 所有对外类型（从types/目录）
   - 永远不要导出core目录的内容

2. **标准入口文件示例**
   ```typescript
   /**
    * 包主入口文件
    */
   
   // 导出公共API
   export * from './api/parser-api';
   export * from './api/processor-api';
   export * from './api/utils-api';
   
   // 导出公共类型
   export * from './types/parser-types';
   export * as processorTypes from './types/processor-types';
   ```

3. **版本号管理**
   - 版本号统一在package.json中维护
   - 如需在代码中访问版本号，可以动态导入package.json

## 导入规则

### 导入顺序

所有导入应按以下顺序组织，每组之间用空行分隔：

1. Node内置模块
2. 外部依赖包
3. 工作区内其他包（monorepo特有）
4. 当前包内相对路径导入（同级目录或跨一级目录）

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
import { processData } from './process-utils';
import type { ConfigOptions } from '../types/config-types';
```

### 相对路径导入

遵循扁平化目录结构原则，导入应遵循以下规则：

1. **扁平化路径**
   - 最多跨越一级目录
   - 禁止使用 `../../` 的路径

2. **导入方式**
   - 同级目录：`import { x } from './file-name';`
   - 跨一级目录：`import { x } from '../directory/file-name';`

3. **禁止的导入方式**
   ```typescript
   // 禁止：过深的相对路径
   import { x } from '../../utils/helpers';
   
   // 禁止：不必要的索引导入
   import { x } from '../core/index';  // 应改为 from '../core/specific-file'
   ```

### 类型导入

1. **使用`import type`导入类型**
   ```typescript
   // 正确
   import type { UserType, ConfigOptions } from '../types/user-types';
   
   // 避免
   import { UserType, ConfigOptions } from '../types/user-types';
   ```

2. **混合导入分离**
   ```typescript
   // 正确
   import { someFunction } from './utils';
   import type { SomeType } from './types';
   
   // 避免
   import { someFunction, type SomeType } from './somewhere';
   ```

### 工作区包导入

使用包名而非相对路径导入工作区内的其他包：

```typescript
// 正确
import { utils } from '@dpml/common';

// 错误
import { utils } from '../../common/src';
```

### 导入禁忌

1. **禁止循环依赖**
   - 包之间不应形成循环依赖关系
   - 模块之间应避免循环导入

2. **禁止通配符导入**
   ```typescript
   // 禁止
   import * as everything from './module';
   
   // 正确
   import { specificThing1, specificThing2 } from './module';
   ```

3. **禁止副作用导入**
   ```typescript
   // 禁止（除非确实需要副作用）
   import './side-effects';
   ```

## 导出规则

### 包级别导出

包的主入口文件(`src/index.ts`)遵循以下导出原则：

1. **只导出公共API**
   - 只从api和types目录导出
   - 不导出core目录内容

2. **导出方式**
   ```typescript
   // src/index.ts
   
   // 导出公共API
   export * from './api/parser-api';
   export * from './api/processor-api';
   
   // 导出类型
   export * from './types/parser-types';
   export * as processorTypes from './types/processor-types';
   ```

3. **命名空间导出**
   - 使用命名空间避免命名冲突
   ```typescript
   export * as parser from './api/parser-api';
   export * as formatter from './api/formatter-api';
   ```

### 目录级别导出

1. **api目录导出**
   - 导出公共函数、类和接口
   - 可选择使用index.ts汇总导出

2. **types目录导出**
   - 导出所有类型定义
   - 避免导出实现细节

3. **core目录导出**
   - 不使用index.ts，直接导入具体文件
   - 实现细节不对外暴露

### 最小暴露原则

1. **最小公共API**
   - 只暴露必要的函数、类和类型
   - 内部实现细节保持私有

2. **导出标记**
   - 公共API使用清晰的导出标记
   ```typescript
   // 公共API
   export function publicFunction() {...}
   
   // 内部实现，不导出
   function internalFunction() {...}
   ```

### 跨目录导入限制

为避免不当的依赖关系，遵循以下限制：

1. **允许的导入方向**
   - api可以导入types和core
   - core可以导入types
   - types不应导入api或core
   - **core严禁导入api**（内部实现严禁调用对外API）

2. **依赖图**
   ```
   api ----> core
    |        |
    v        v
   types <----
   
   禁止: core ----> api
   ```

3. **违反规则的情况**
   - 如果types需要导入api，说明设计存在问题
   - 如果出现循环依赖，应重新考虑职责划分
   - 如果core导入api，是严重的架构错误

4. **为什么core不能导入api**
   - **防止循环依赖** - api依赖core，core再依赖api会导致循环引用
   - **保持正确抽象层次** - 内部实现不应依赖其公共接口
   - **避免重构障碍** - api变更会意外影响内部实现
   - **确保可测试性** - 允许独立测试核心逻辑而不依赖公共API层

5. **正确的依赖方向**
   - api应该是对core的包装和扩展
   - 如果发现需要从core调用api，应该：
     - 将共享功能移至core内部
     - 重构设计以修正依赖方向
     - 考虑创建辅助模块解耦依赖

## 索引文件使用

索引文件(index.ts)的使用应遵循以下规则：

1. **必要的索引文件**
   - src/index.ts：包的主入口，手动维护

2. **可选的索引文件**
   - api/index.ts：汇总API导出（如有多个API文件）

3. **避免使用索引文件的情况**
   - core目录下不推荐使用index.ts
   - 直接导入实现文件更加清晰

4. **索引文件内容示例**
   ```typescript
   // api/index.ts
   export * from './parser-api';
   export * from './processor-api';
   ```

## ESLint支持

项目配置了ESLint规则来强制执行上述导入导出规范：

```javascript
// eslint.config.js 相关配置
{
  rules: {
    // 确保导入存在
    'import/no-unresolved': 'error',
    // 禁止重复导入
    'import/no-duplicates': 'error',
    // 禁止循环依赖
    'import/no-cycle': 'error',
    // 禁止未使用的导入
    'import/no-unused-modules': 'warn',
    // 使用type关键字导入类型
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      },
    ],
    // 确保导入扩展名
    'import/extensions': ['error', 'never'],
  }
}
```

## 常见问题与解决方案

### 问题：循环依赖

当A模块导入B模块，B模块又导入A模块时产生循环依赖。

**解决方案：**
1. 提取共同逻辑到第三个模块
2. 使用依赖注入
3. 重新设计模块边界

### 问题：类型导入错误

使用普通导入而非类型导入导致运行时错误。

**解决方案：**
使用`import type`确保类型只在编译时使用。

### 问题：导出命名冲突

多个模块导出同名符号导致冲突。

**解决方案：**
使用命名空间导出或重命名导出。

```typescript
// 命名空间导出
export * as parser from './parser';
export * as formatter from './formatter';

// 重命名导出
export { parse as parseXml } from './xml-parser';
export { parse as parseJson } from './json-parser';
``` 