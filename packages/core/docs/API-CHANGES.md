# API变更文档

本文档记录了DPML Core包的API变更，帮助开发者了解变更内容和迁移路径。

## ValidationError 接口统一

为解决多处定义ValidationError造成的混淆，我们进行了以下统一：

### 变更内容

1. `ValidationError` 现在是一个标准数据接口，定义在 `@core/errors/types.ts` 中
2. `ValidationErrorImpl` 是错误类的标准实现，替代原来的 `DefaultValidationError`
3. 为保持向后兼容性，保留了以下别名：
   - `DefaultValidationError = ValidationErrorImpl`
   - `ValidationError = ValidationErrorImpl` (作为类的别名)

### 迁移指南

- 使用 `ValidationError` 接口定义错误数据结构
- 使用 `ValidationErrorImpl` 类创建可抛出的错误对象
- 逐步淘汰使用 `DefaultValidationError` 的代码
- 避免使用 `ValidationError` 作为类，以减少混淆

```typescript
// 推荐的错误处理方式
import { ValidationError, ValidationErrorImpl } from '@dpml/core';

// 创建错误实例
const error = new ValidationErrorImpl({
  code: 'INVALID_VALUE',
  message: '无效的值'
});

// 转换为数据接口格式
const errorData: ValidationError = error.toValidationData();

// 从数据创建实例
const errorFromData = ValidationErrorImpl.fromValidationData(errorData);
```

## ValidationResult 和 ValidationWarning 接口统一

同样将这些接口移动到 `@core/errors/types.ts` 中，作为统一的定义源。

## TagDefinition 接口标准化

### 变更内容

TagDefinition接口现在明确推荐使用对象形式定义attributes，而不是数组形式。

### 迁移指南

```typescript
// 推荐的对象形式（✓）
const tagDefinition: TagDefinition = {
  attributes: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: false }
  }
};

// 不推荐的数组形式（⚠️）
const oldTagDefinition: TagDefinition = {
  attributes: ['id', 'name'],
  requiredAttributes: ['id']
};
```

注意：数组形式将继续支持以保持向后兼容性，但不建议在新代码中使用。 

## TagRegistry辅助方法新增

为简化标签定义过程，减少重复代码，我们在TagRegistry中添加了静态辅助方法。

### 变更内容

1. 新增`TagRegistry.getBaseAttributes()`静态方法，提供通用基础属性定义
2. 新增`TagRegistry.createTagDefinition()`静态方法，用于创建包含基础属性的标签定义

### 使用指南

```typescript
// 获取基础属性定义
const baseAttributes = TagRegistry.getBaseAttributes();
// 包含 id, version, extends 等通用属性

// 简化标签定义，自动包含基础属性
const tagDefinition = TagRegistry.createTagDefinition({
  attributes: {
    // 只需定义特有属性
    custom: { type: 'string', required: true }
    // id, version, extends 已自动包含
  },
  allowedChildren: ['child-tag']
});

// 覆盖基础属性的默认设置
const customTagDef = TagRegistry.createTagDefinition({
  attributes: {
    // 覆盖id属性默认值
    id: { type: 'string', required: true }
  }
});
```

这些辅助方法可以大幅减少标签定义的代码量，同时确保基础属性的一致性。 

## 3. TagRegistry 新增便捷方法

### 3.1 `registerTag` 方法

`TagRegistry` 类新增了一个便捷方法 `registerTag`，用于简化标签注册流程：

```typescript
// 旧的方式
const tagDef = TagRegistry.createTagDefinition({
  name: 'myTag',
  attributes: { ... },
  // 其他配置
});
registry.registerTagDefinition('myTag', tagDef);

// 新的便捷方式
registry.registerTag('myTag', {
  attributes: { ... },
  // 其他配置
});
```

这个方法整合了 `createTagDefinition` 和 `registerTagDefinition` 的功能，使标签注册变得更加简洁。

### 3.2 基础属性管理

所有标签定义会自动包含基础属性（如 `id`, `class`, `style` 等）。如需获取基础属性列表：

```typescript
const baseAttrs = TagRegistry.getBaseAttributes();
// 返回 { id: true, class: true, style: true, datatest: true }
```

在使用 `createTagDefinition` 或 `registerTag` 方法时，自定义属性会与这些基础属性合并。 