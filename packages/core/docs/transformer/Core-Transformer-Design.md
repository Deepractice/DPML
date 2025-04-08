# DPML Transformer 设计文档

## 1. 概述

DPML Transformer 是 DPML 核心库的重要组成部分，负责将处理后的文档转换为不同格式的输出。转换器采用访问者模式设计，通过一系列专用访问者来处理不同类型的节点，并支持通过适配器将转换结果输出为不同格式。

### 1.1 主要功能

- 基于访问者模式的文档转换
- 支持多种输出格式（JSON、XML、Markdown等）
- 支持自定义变量替换
- 处理特殊场景（空文档、特殊字符、混合格式等）
- 灵活的扩展机制
- 错误处理和容错机制

## 2. 架构设计

### 2.1 核心组件

Transformer 模块由以下核心组件组成：

1. **Transformer 接口**：定义转换器的基本行为
2. **默认转换器实现**：提供标准的转换逻辑
3. **访问者接口与实现**：处理不同类型的节点
4. **输出适配器**：将转换结果转换为不同的输出格式
5. **转换上下文**：在转换过程中传递状态和配置
6. **标签处理器**：处理特定标签的转换逻辑

### 2.2 组件关系图

```
┌─────────────────┐     ┌───────────────────┐
│  TransformerAPI │────>│ TransformerFactory│
└────────┬────────┘     └─────────┬─────────┘
         │                        │
         │                        │ 创建
         │                        ▼
         │              ┌─────────────────────┐        ┌─────────────────┐
         └─────────────>│ DefaultTransformer  │<───────│ TransformContext│
                        └──────────┬──────────┘        └─────────────────┘
                                   │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
        ┌────────▼─────────┐  ┌────▼────┐   ┌────────▼──────────┐
        │TransformerVisitor│  │Adapters │   │TagProcessorRegistry│
        └──────────────────┘  └─────────┘   └───────────────────┘
```

### 2.3 处理流程

1. 创建转换器实例
2. 注册所需的访问者
3. 配置适配器和选项
4. 将文档传入转换方法
5. 转换器递归处理文档节点
6. 每种节点类型由对应的访问者处理
7. 应用输出适配器生成最终结果

## 3. 核心接口

### 3.1 转换器接口

```typescript
interface Transformer {
  // 注册访问者
  registerVisitor(visitor: TransformerVisitor): void;
  
  // 设置输出适配器
  setOutputAdapter(adapter: OutputAdapter): void;
  
  // 设置输出适配器工厂
  setOutputAdapterFactory(factory: OutputAdapterFactory): void;
  
  // 转换文档
  transform(document: Document, options?: TransformOptions): any;
  
  // 异步转换文档
  transformAsync(document: Document, options?: TransformOptions): Promise<any>;
  
  // 配置转换器
  configure(options: TransformOptions): void;
  
  // 清除缓存
  clearCache(): void;
}
```

### 3.2 访问者接口

```typescript
interface TransformerVisitor {
  // 访问者名称
  name: string;
  
  // 访问者优先级（数值越大优先级越高）
  priority?: number;
  
  // 访问文档节点
  visitDocument?(document: Document, context: TransformContext): any;
  
  // 访问元素节点
  visitElement?(element: Element, context: TransformContext): any;
  
  // 访问内容节点
  visitContent?(content: Content, context: TransformContext): any;
  
  // 访问引用节点
  visitReference?(reference: Reference, context: TransformContext): any;
}
```

### 3.3 适配器接口

```typescript
interface OutputAdapter {
  // 适配转换结果
  adapt(result: any, context: TransformContext): any;
  
  // 异步适配（可选）
  adaptAsync?(result: any, context: TransformContext): Promise<any>;
}
```

### 3.4 转换上下文

```typescript
interface TransformContext {
  // 原始文档
  document: Document;
  
  // 当前路径
  path: string[];
  
  // 转换选项
  options: TransformOptions;
  
  // 变量
  variables?: Record<string, any>;
  
  // 父节点结果
  parentResults?: any[];
}
```

## 4. 默认转换器实现

DefaultTransformer 类是转换器接口的标准实现，包含以下关键功能：

1. **访问者注册与排序**：根据优先级对访问者进行排序
2. **节点转换**：根据节点类型调用不同的转换方法
3. **子节点处理**：递归处理子节点，维护正确的上下文路径
4. **错误处理**：支持严格模式和宽松模式的错误处理
5. **适配器应用**：将转换结果应用到输出适配器
6. **缓存机制**：支持结果缓存以提高性能

## 5. 内置访问者

### 5.1 SpecialScenariosVisitor

用于处理各种特殊场景：

- 空文档处理
- 特殊字符处理
- 混合格式内容处理
- 变量替换

### 5.2 DocumentStructureVisitor

处理文档结构，包括：

- 文档元数据收集
- 文档输出框架构建

### 5.3 ElementVisitor

处理元素节点，包括：

- 元素属性转换
- 元素元数据收集
- 嵌套元素处理

## 6. 内置适配器

### 6.1 JSONAdapter

将转换结果输出为 JSON 格式。

### 6.2 XMLAdapter

将转换结果输出为 XML 格式。

### 6.3 MarkdownAdapter

将转换结果输出为 Markdown 格式。

### 6.4 StringAdapter

将转换结果输出为字符串格式。

## 7. 使用指南

### 7.1 基本使用

```typescript
// 创建转换器工厂
const factory = new DefaultTransformerFactory();

// 创建适配器工厂
const adapterFactory = new DefaultOutputAdapterFactory();

// 注册适配器
adapterFactory.registerAdapter('json', new JSONAdapter());
adapterFactory.registerAdapter('xml', new XMLAdapter());

// 创建转换器
const transformer = factory.createTransformer({}, adapterFactory);

// 转换文档
const result = transformer.transform(document, { 
  format: 'json',
  variables: {
    username: '张三',
    age: 30
  }
});
```

### 7.2 自定义访问者

```typescript
class CustomVisitor implements TransformerVisitor {
  name = 'CustomVisitor';
  priority = 100;
  
  visitElement(element: Element, context: TransformContext): any {
    // 自定义元素处理逻辑
    return {
      type: 'element',
      name: element.tagName,
      attributes: element.attributes,
      children: element.children
    };
  }
}

// 注册自定义访问者
transformer.registerVisitor(new CustomVisitor());
```

### 7.3 自定义适配器

```typescript
class CustomAdapter implements OutputAdapter {
  adapt(result: any, context: TransformContext): any {
    // 自定义适配逻辑
    return {
      data: result,
      metadata: {
        format: 'custom',
        timestamp: Date.now()
      }
    };
  }
}

// 注册自定义适配器
adapterFactory.registerAdapter('custom', new CustomAdapter());
```

## 8. 最佳实践

1. **按优先级组织访问者**：高优先级的访问者先处理，可以控制处理顺序
2. **合理使用上下文**：通过上下文传递状态和配置
3. **处理错误**：实现适当的错误处理机制
4. **扩展而非修改**：通过添加新的访问者和适配器扩展功能
5. **使用缓存**：对于重复转换的文档，启用缓存提高性能

## 9. 扩展点

1. **自定义访问者**：实现 TransformerVisitor 接口
2. **自定义适配器**：实现 OutputAdapter 接口
3. **自定义标签处理器**：实现 TagProcessor 接口
4. **自定义转换器**：扩展 DefaultTransformer 类或实现 Transformer 接口 