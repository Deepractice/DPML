# DPML Monorepo项目编码规范

本文档定义了DPML项目中各包之间交互的编码规范，确保代码的可维护性和模块化。

## 包封装原则

1. **黑盒使用原则**

   - 每个包应视为黑盒，只通过公开API交互
   - 不依赖其他包的内部实现细节
   - 包的内部修改不应影响其他包的正常使用

2. **禁止直接引用源码**

   - 严禁使用相对路径直接引用其他包的源代码
   - 不通过文件路径跨越包边界访问内部模块
   - 对其他包的依赖应通过包管理系统解析

3. **API契约优先**
   - 依赖公开文档中描述的API契约，而非源码实现细节
   - 实现可以变化，但API契约应保持稳定
   - 所有跨包交互必须通过公开声明的接口

## 文件命名规范

DPML项目采用基于微软TypeScript风格的文件命名约定，确保代码库的一致性和可读性。

1. **基本原则**

   - 文件命名应与其导出的主要内容相匹配
   - 根据内容类型选择适当的命名风格
   - 在整个项目中保持一致性

2. **命名风格按内容类型区分**

   - **类/接口/类型/枚举/装饰器文件**：使用PascalCase
     - 例：`TagRegistry.ts`, `PromptProcessor.ts`, `ElementType.ts`
   - **函数/工具/模块文件**：使用camelCase
     - 例：`utils.ts`, `formatHelpers.ts`, `stringValidation.ts`

3. **特殊文件命名**

   - **测试文件**：与被测试文件使用相同的命名风格，添加`.test`或`.spec`后缀
     - 例：`TagRegistry.test.ts`, `utils.test.ts`
   - **类型定义文件**：使用与实现相同的命名风格，添加`.d.ts`后缀
     - 例：`index.d.ts`, `api.d.ts`
   - **索引文件**：统一使用`index.ts`
     - 用于重新导出模块内容，提供公共API

4. **目录命名**

   - 源码目录使用camelCase：`src/`, `utils/`, `helpers/`
   - 按功能或领域组织的目录使用camelCase：`tags/`, `processors/`, `transformers/`
   - 测试目录使用camelCase：`src/tests/`, `src/tests/unit/`, `src/tests/integration/`
   - 避免使用短横线或下划线命名目录

5. **组件与模块文件**
   - 单个React/UI组件文件使用PascalCase：`Button.tsx`, `Dialog.tsx`
   - 配置文件使用camelCase：`tsconfig.json`, `vitest.config.ts`

## 导入规范

1. **包名导入**

   - 使用包名导入: `import { TagRegistry } from '@dpml/core'`
   - 确保package.json中正确声明了依赖关系
   - 使用workspace协议确保本地开发版本可用: `"@dpml/core": "workspace:*"`

2. **禁止路径导入**

   - 禁止使用形如 `import { ... } from '../../../core/src/...'` 的路径导入
   - 不使用相对路径跨越包边界
   - 避免因目录结构变化导致的导入失效

3. **避免路径映射滥用**

   - 不在测试配置中直接映射其他包路径，确保测试环境与实际环境一致
   - tsconfig.json中的paths配置应谨慎使用，不应破坏包的封装性
   - 别名仅用于当前包内部的模块组织，不用于跨包引用

4. **包内部路径别名**
   - 包内部使用 `@包名/` 前缀代替相对路径导入：`import { Foo } from '@prompt/utils/helper'`
   - 在每个包的 tsconfig.json, vitest.config.ts, tsup.config.ts 中配置路径别名
   - 路径别名应映射到包的 src 目录：`@prompt -> ./src`
   - 测试文件使用同样的别名规则：`import { TestHelper } from '@core/tests/utils/testHelper'`
   - 好处包括：
     - 提高代码可读性，避免复杂的相对路径计算 (`../../` 等)
     - 文件移动时不需要修改导入路径
     - 清晰标识导入来源，便于区分包内部模块和外部依赖
     - 降低因路径计算错误导致的导入问题
   - 示例：

     ```typescript
     // 推荐 (使用路径别名)
     import { SomeProcessor } from '@prompt/processors/someProcessor';

     // 不推荐 (使用相对路径)
     import { SomeProcessor } from '../../processors/someProcessor';

     // 测试文件导入 (使用路径别名)
     import { TestHelper } from '@prompt/tests/utils/testHelper';
     ```

## API使用规范

1. **以文档为准**

   - 严格按照README等文档描述的方式使用API
   - 有疑问时应先查阅文档而非直接查看源码
   - 不对未文档化的行为产生依赖

2. **方法名称准确**

   - 使用精确的方法名，如 `registerTagDefinition()` 而非自行猜测的简写
   - 不依赖内部实现可能提供的便捷方法
   - 遵循API设计者的意图使用接口

3. **参数顺序正确**
   - 按照API文档要求传递参数，不随意调整参数顺序
   - 使用命名参数和对象参数提高代码可读性
   - 对可选参数有清晰的处理逻辑

## 测试规范

1. **隔离性**

   - 测试应该独立于其他包的内部实现
   - 使用模拟(Mock)隔离对其他包的依赖
   - 专注测试当前包的逻辑而非集成场景

2. **API一致性**

   - 测试中调用的方法应与实际API一致，如使用 `isTagRegistered()` 而非 `has()`
   - 测试用例应成为API使用的良好示例
   - 避免在测试中使用内部API或非公开接口

3. **环境一致性**

   - 测试环境配置应尽量接近实际使用环境
   - 避免为测试特殊定制包的导入路径
   - 确保测试能验证实际使用场景

4. **测试目录结构**

   - 测试文件放置在`src/tests/`目录下，而非独立的`tests/`目录
   - 测试目录结构应与源码结构保持对应关系
   - 使用子目录组织不同类型的测试：`src/tests/unit/`, `src/tests/integration/`
   - 示例：

     ```
     src/
       core/
         loader.ts
       utils/
         paths.ts
       tests/
         core/
           loader.test.ts
         utils/
           paths.test.ts
         integration/
           core-utils.test.ts
     ```

5. **测试导入路径**
   - 测试文件应使用相对路径导入被测代码：`import { Component } from '../../core/component'`
   - 或使用包内路径别名：`import { Component } from '@package/core/component'`
   - 测试辅助工具可以从测试目录导入：`import { helper } from '../utils/testHelper'`
   - 避免使用过于复杂的相对路径导入

## 工具配置规范

1. **别名限制**

   - alias配置仅用于当前包内部模块引用
   - 在vitest.config.ts等配置中避免映射其他包的内部路径
   - 使用标准包解析机制确保一致性

2. **依赖明确**

   - 显式声明所有依赖，不依赖路径技巧绕过依赖管理
   - 明确区分开发依赖与运行时依赖
   - 依赖版本应明确且受控

3. **包边界清晰**

   - 工具配置不应破坏包的边界和封装性
   - 构建输出应只包含公开API
   - 确保包的独立性与可复用性

4. **测试配置**

   - 在vitest.config.ts中配置测试文件路径：`include: ['src/tests/**/*.test.ts']`
   - 确保路径别名在测试环境中正确配置
   - 示例配置：

     ```typescript
     // vitest.config.ts
     import { defineConfig } from 'vitest/config';
     import * as path from 'path';

     export default defineConfig({
       resolve: {
         alias: {
           '@packageName': path.resolve(__dirname, './src'),
         },
       },
       test: {
         globals: true,
         environment: 'node',
         include: ['src/tests/**/*.test.ts'],
       },
     });
     ```

## 最佳实践

1. **文档先行**

   - 先阅读包的README和API文档，再开始使用
   - 不确定时参考官方示例代码
   - 避免对未记录行为的依赖

2. **接口稳定**

   - 公开API应保持稳定，避免频繁变更
   - 内部实现可以优化和重构，但不影响外部使用
   - 使用版本控制管理API变更

3. **错误处理**
   - 合理处理API可能返回的错误和异常
   - 不假设其他包的内部实现总是成功
   - 提供清晰的错误信息和回溯路径

## 通用工具使用规范

DPML项目提供了`@dpml/common`包作为跨包共享的工具和功能库，为确保代码一致性和减少重复实现，应遵循以下规范：

1. **优先使用共享工具**

   - 使用`@dpml/common`中的工具函数，而非在各包中重复实现
   - 对于字符串处理、数组操作、对象操作等通用功能，优先使用共享工具
   - 遵循"不重复发明轮子"原则，减少代码重复和维护成本

2. **日志系统规范**

   - 所有包应使用`@dpml/common/logger`提供的统一日志接口
   - 按包名和模块名创建日志记录器，确保日志来源可跟踪
   - 遵循日志级别约定：debug用于开发信息，info用于重要状态变更，warn用于潜在问题，error用于错误情况
   - 示例：

     ```typescript
     import { createLogger } from '@dpml/common/logger';

     // 创建特定模块的日志记录器
     const logger = createLogger('prompt:parser');

     // 记录不同级别的信息
     logger.debug('详细的调试信息');
     logger.info('重要的状态变更');
     logger.warn('潜在的问题');
     logger.error('错误情况', { errorDetails: '详细错误信息' });
     ```

3. **错误处理规范**

   - 使用`@dpml/common/types`中的`DPMLError`和`Result`类型进行统一错误处理
   - 对于可预见的错误情况，返回`Result`类型而非抛出异常
   - 使用标准化的错误代码和格式，便于错误识别和处理
   - 示例：

     ```typescript
     import {
       Result,
       success,
       failure,
       createDPMLError,
       DPMLErrorCode,
     } from '@dpml/common/types';

     function processFile(path: string): Result<string, Error> {
       try {
         // 处理逻辑
         return success(fileContent);
       } catch (err) {
         return failure(
           createDPMLError(
             '文件处理失败',
             DPMLErrorCode.FILE_PROCESSING_ERROR,
             { path, cause: err }
           )
         );
       }
     }
     ```

4. **类型定义共享**

   - 使用`@dpml/common/types`中的共享接口和类型，确保类型定义一致性
   - 为包特定的类型添加专门的前缀，避免与共享类型冲突
   - 继承和扩展共享接口，而非重新定义相似的接口

5. **测试工具规范**
   - 使用`@dpml/common/testing`中的模拟对象和测试辅助工具
   - 按照测试标准文档中的指导使用共享测试工具
   - 为通用测试场景使用标准化的测试夹具和断言

## 文档与资源

关于`@dpml/common`包的详细使用说明，请参考以下资源：

1. **API文档**

   - [API参考文档](../packages/common/docs/API-Reference.md)
   - [日志系统文档](../packages/common/docs/logger/README.md)
   - [测试工具文档](../packages/common/docs/testing/README.md)
   - [工具函数文档](../packages/common/docs/utils/README.md)
   - [类型定义文档](../packages/common/docs/types/README.md)

2. **集成指南**

   - [集成指南](../packages/common/docs/integration-guide.md) - 与其他DPML包集成的说明
   - [升级与迁移指南](../packages/common/docs/migration-guide.md) - 版本迁移说明

3. **示例代码**
   - [日志系统示例](../packages/common/examples/logger/basic-usage.ts)
   - [测试工具示例](../packages/common/examples/testing/mock-file-system.ts)
   - [工具函数示例](../packages/common/examples/utils/string-array-utils.ts)
   - [类型使用示例](../packages/common/examples/types/result-error-handling.ts)

## 项目命令规范

为解决monorepo项目中目录导航和命令执行的问题，DPML项目提供了一套标准命令，避免了修改系统配置的需要。

1. **目录上下文命令**

   - 使用`pnpm r`在项目根目录执行命令：`pnpm r git status`
   - 使用`pnpm <package>`在特定包目录执行命令：`pnpm prompt ls -la`
   - 避免通过`cd`反复切换目录，减少路径错误

2. **预定义包命令**

   - 使用`pnpm <package>:<command>`执行特定包的预定义命令：`pnpm prompt:test`
   - 包名和命令之间使用冒号分隔，便于识别
   - 常用命令应添加到根package.json中，方便整个团队使用

3. **命令组合**

   - 多条命令组合使用`&&`连接：`pnpm r git add . && pnpm r git commit -m "message"`
   - 同一包内的多条命令可以使用引号封装：`pnpm prompt "npm run lint && npm run test"`
   - 避免过于复杂的命令链，必要时创建npm脚本

4. **路径引用规则**

   - 命令中的路径始终相对于执行环境（根目录或包目录）
   - 引用当前包外的文件时，使用绝对路径或相对于包目录的路径
   - 共享资源应放在约定位置，便于跨包访问

5. **脚本命名规范**

   - 根目录命令使用简短名称：`r`
   - 包命令使用包名：`prompt`, `core`
   - 包特定任务使用`包名:任务名`格式：`prompt:test`
   - 名称应准确反映命令的用途和范围

6. **依赖管理命令**
   - 使用`pnpm build`在根目录构建所有包（自动处理依赖顺序）
   - 使用`pnpm turbo run test --filter=@dpml/agent`测试特定包（自动构建其依赖）
   - 使用`pnpm turbo run build --filter=@dpml/workflow...`构建指定包及其所有依赖
   - 避免在没有构建依赖包的情况下直接测试特定包

这种项目级命令规范确保了团队成员可以在不同目录环境中一致地执行命令，避免了路径混淆和错误操作，同时保持了项目的可移植性。

遵循这些规范能有效防止包之间的紧耦合，提高代码的可维护性和可靠性，同时减少因内部实现变化导致的连锁问题。

## Turborepo依赖管理

DPML项目使用Turborepo管理包之间的依赖关系和构建顺序，确保开发体验的一致性。

1. **自动依赖顺序**

   - Turborepo会自动分析包之间的依赖关系，确保按正确顺序构建
   - 不需要手动维护构建顺序，减少人为错误

2. **缓存加速**

   - Turborepo会缓存构建结果，大幅提升重复构建的速度
   - 仅重新构建有变更的包，节省开发时间

3. **过滤命令**

   - 使用`--filter`选项指定操作范围：`pnpm turbo run build --filter=@dpml/agent`
   - 使用`...`后缀表示包括所有依赖：`--filter=@dpml/workflow...`
   - 使用`^`前缀表示包括所有依赖它的包：`--filter=^@dpml/core`

4. **命令集成**
   - 根目录的`pnpm build`、`pnpm test`等命令已通过Turborepo增强
   - 这些命令会自动处理依赖关系，无需额外学习专用命令
