# 模块重构指南

本文档总结了将现有模块重构为符合项目规范的目录结构的步骤和经验，基于 parser 和 processor 模块重构的实践。

## 重构步骤概述

1. **分析现有结构**
   - 了解模块的文件组织
   - 识别类型、API、实现的边界
   - 找出依赖关系

2. **创建新的目录结构**
   - 遵循 `package-structure-and-import-rules.md` 中的规范
   - 建立 api、types、core、constants 等目录

3. **迁移代码**
   - 先迁移类型定义
   - 创建 API 层
   - 迁移核心实现
   - 提取常量
   - 迁移测试

4. **更新引用路径**
   - 修复导入语句
   - 处理模块间依赖

5. **清理和验证**
   - 验证构建成功
   - 运行测试
   - 清理不再需要的代码

## 详细步骤与经验

### 1. 分析现有结构

首先需要充分了解要重构的模块：

```bash
# 检查目录结构
ls -la packages/core/src/module-name

# 分析主要文件内容
cat packages/core/src/module-name/index.ts
```

识别：
- 哪些是类型定义
- 哪些是对外暴露的 API
- 哪些是内部实现
- 测试文件组织方式

### 2. 创建新的目录结构

根据规范创建标准目录结构：

```bash
mkdir -p packages/core/src/api/module-name
mkdir -p packages/core/src/types/module-name
mkdir -p packages/core/src/core/module-name
mkdir -p packages/core/src/constants/module-name
mkdir -p packages/core/src/__tests__/module-name
```

### 3. 迁移代码

#### 3.1 先迁移类型定义

将类型定义从实现代码中分离并移至 `types` 目录：

```bash
# 示例：迁移类型定义
cp packages/core/src/module-name/interfaces.ts packages/core/src/types/module-name/types.ts
```

调整类型定义文件中的导入路径。

> **经验**：处理类型循环依赖可能很棘手，可能需要拆分类型定义文件或重新设计类型结构。

> **新经验**：在接口抽取过程中，注意识别和处理实现文件中可能存在的接口定义。创建专门的接口文件（如 errors.ts、protocols.ts）对相关接口进行归类，保持类型定义的组织性和可维护性。

#### 3.2 创建 API 层

创建对外暴露的 API 接口，位于 `api` 目录：

```bash
touch packages/core/src/api/module-name/index.ts
touch packages/core/src/api/module-name/module-name.ts
```

API 层应该：
- 简洁明了
- 只依赖必要的类型
- 调用核心实现

> **新经验**：API 层应统一导出风格，如果有核心类重命名（如 DefaultProcessor 重命名为 defaultProcessor）应在这里处理，保持 API 命名一致性。

#### 3.3 迁移核心实现

将核心实现移至 `core` 目录，并更新其导入路径：

```bash
cp packages/core/src/module-name/implementation.ts packages/core/src/core/module-name/
```

> **经验**：处理实现文件中混合的类型定义是一个挑战。有时需要完全重写文件而不是简单修改导入路径。

> **新经验**：对于复杂实现文件，可以先迁移文件，再通过批量替换工具（如 sed）处理导入路径，比手动修改更高效。例如：
> ```bash
> find packages/core/src/core/module-name -name "*.ts" -exec sed -i '' 's|@core/module-name/interfaces|@core/types/module-name|g' {} \;
> ```

#### 3.4 提取常量

将常量提取到 `constants` 目录：

```bash
touch packages/core/src/constants/module-name/index.ts
```

> **新经验**：常量文件应包含模块的版本信息、错误码枚举和默认配置选项。这有助于集中管理和维护模块的配置参数。

#### 3.5 迁移测试

将测试移至 `__tests__` 目录：

```bash
cp -r packages/core/src/tests/module-name/* packages/core/src/__tests__/module-name/
```

> **经验**：测试可能是最后更新的部分，因为它们可能依赖于新的目录结构。

> **新经验**：除了迁移测试文件外，还需要同步更新测试文件中的导入路径。可以在迁移完所有实现后，使用与核心实现相同的批量替换方法更新测试导入。

### 4. 更新引用路径

更新所有迁移文件中的导入路径，匹配新的目录结构：

- 使用相对路径而不是别名
- 调整导入层次
- 检查类型导入是否使用 `import type`

> **新经验**：系统性地更新引用路径是重构中最容易出错的环节。推荐使用以下策略：
> 1. 先处理类型导入
> 2. 再处理核心实现之间的相互引用
> 3. 最后更新测试导入
> 4. 使用 grep 工具检查是否有遗漏的旧路径引用

### 5. 创建正确的 barrel 文件 (index.ts)

为每个目录创建恰当的 barrel 文件，确保正确导出：

```typescript
// src/api/module-name/index.ts
export * from './module-name';

// src/types/module-name/index.ts
export * from './types';
export * from './other-types';

// src/core/module-name/index.ts
export * from './implementation';
```

> **新经验**：barrel 文件的组织对模块使用体验至关重要。在 types 目录的 index.ts 中，应该导出所有类型子文件，遵循"按领域分组"的原则。

### 6. 更新根入口文件

修改主包入口点以使用新的模块结构：

```typescript
// src/index.ts
export * from './api/module-name';
export * from './types/module-name';
export * as constants from './constants/module-name';
```

### 7. 清理和验证

```bash
# 构建测试
cd packages/core && pnpm build

# 运行测试
pnpm test

# 删除旧文件
rm -rf packages/core/src/module-name
```

> **新经验**：在删除旧代码之前，确保所有引用已更新完毕。可以使用 grep 命令搜索项目中是否还存在对旧路径的引用：
> ```bash
> grep -r "@core/module-name" packages/
> ```
> 如果发现仍有引用，应先更新这些引用再删除旧代码。

## 常见问题及解决方案

### 1. 导入路径错误

问题：重构后模块间引用路径错误导致编译失败
解决：系统性地检查并更新所有导入路径，特别是多级目录嵌套的情况

### 2. 循环依赖

问题：拆分文件后可能引入循环依赖
解决：重新设计模块边界，使用接口分离原则

### 3. 测试适应性

问题：测试在新结构下失败
解决：优先修复构建问题，然后再修复测试，可能需要更新测试文件中的导入

### 4. 重复文件

问题：重构过程中可能出现重复文件
解决：确保旧文件被删除，所有引用都指向新位置

### 5. 类型导出不一致

问题：barrel 文件中的类型导出与直接导入不一致
解决：确保 barrel 文件正确导出所有必要类型

### 6. 接口与实现重复定义 

问题：接口在实现文件中有本地定义，与新抽取的接口文件冲突
解决：移除实现文件中的接口定义，使用从 types 目录导入的接口

### 7. 实现文件中的依赖更新

问题：实现文件中大量引用了旧路径
解决：使用批量替换工具（如 sed）更高效地更新导入路径

## 重构后的验证清单

- [ ] 构建成功完成
- [ ] 所有直接测试通过
- [ ] 所有集成测试通过
- [ ] 没有冗余或重复文件
- [ ] 导入路径遵循规范
- [ ] 公共 API 保持不变
- [ ] 文档已更新
- [ ] 已使用 grep 确认没有遗留的旧路径引用

## 总结

模块重构是一个系统性工作，需要耐心和细致。通过遵循上述步骤，可以将现有模块重构为符合项目规范的结构，提高代码的可维护性和可理解性。

重构的关键是保持功能不变的同时改进结构，所以充分的测试和验证是必不可少的。跨模块的重构尤其需要系统性思维，确保每个部分都衔接得当。 