# 改进TransformerDefiner接口，要求显式指定转换器名称

## 问题描述

当前`TransformerDefiner`接口中的定义方法（如`defineStructuralMapper`、`defineAggregator`等）没有要求提供转换器名称参数。这导致以下问题：

1. 多个转换器默认使用同一个名称（例如所有的StructuralMapperTransformer都使用"structuralMapper"名称）
2. 在transformerService中合并结果时，后面的转换器结果会覆盖前面转换器的结果
3. 开发者必须手动在创建转换器后额外设置名称，如：`transformer.name = 'customName'`
4. 容易忘记设置名称，导致难以排查的数据丢失问题

示例代码：

```typescript
// 当前使用方式
const workflowBaseTransformer = definer.defineStructuralMapper<unknown, Workflow>([...]);
const variablesTransformer = definer.defineStructuralMapper<unknown, Workflow>([...]);

// 必须手动设置不同的名称，避免冲突
workflowBaseTransformer.name = 'workflowBaseTransformer';
variablesTransformer.name = 'variablesTransformer';
```

## 建议解决方案

修改`TransformerDefiner`接口，在所有define方法中添加名称参数：

```typescript
// 修改前
defineStructuralMapper<TInput, TOutput>(
  rules: Array<MappingRule<unknown, unknown>>
): Transformer<TInput, TOutput>;

// 修改后
defineStructuralMapper<TInput, TOutput>(
  name: string,
  rules: Array<MappingRule<unknown, unknown>>
): Transformer<TInput, TOutput>;
```

同样的改进应该应用于接口中的所有define方法：
- defineAggregator
- defineTemplateTransformer
- defineRelationProcessor
- defineSemanticExtractor
- defineResultCollector

修改后的使用方式：

```typescript
// 新的使用方式
const workflowBaseTransformer = definer.defineStructuralMapper<unknown, Workflow>(
  'workflowBaseTransformer',
  [...]
);

const variablesTransformer = definer.defineStructuralMapper<unknown, Workflow>(
  'variablesTransformer',
  [...]
);

// 不再需要额外设置名称
```

## 影响分析

### 积极影响

1. 避免转换器名称冲突
2. 强制开发者显式指定名称，提高代码可读性
3. 减少深层合并时的数据丢失问题
4. 简化调试，名称清晰有助于追踪问题

### 消极影响

1. 这是一个破坏性更改，需要更新现有代码
2. 需要修改框架核心API和所有使用转换器的地方

## 实现计划

1. 修改 `TransformerDefiner` 接口，添加名称参数
2. 更新所有转换器工厂方法的实现
3. 编写迁移指南，帮助用户适应新的API
4. 添加或更新相关测试用例
5. 在示例项目中更新使用方式

## 参考

- 相关问题：[fix-transformer-service-merge-results.md](fix-transformer-service-merge-results.md)
- 相关文件：`packages/core/src/types/TransformerDefiner.ts` 