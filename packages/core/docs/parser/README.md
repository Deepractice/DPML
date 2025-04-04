# DPML Parser 模块

DPML Parser 模块是 @dpml/core 包的核心组件，负责将 DPML 文本解析为结构化的抽象语法树 (AST)。该模块提供了标签注册、验证、属性处理和引用解析等功能，为 DPML 生态系统提供强大的解析基础。

## 功能特点

- **DPML 文本解析**：将 DPML 文本解析为标准的 AST 结构
- **标签注册与验证**：支持标签定义、注册和验证
- **属性处理**：处理核心属性（id、version、lang）和扩展属性（disabled、hidden 等）
- **引用处理**：支持文档内引用和外部资源引用
- **错误处理**：提供详细的错误信息和位置标记

## 安装

```bash
# 使用 npm
npm install @dpml/core

# 使用 pnpm 
pnpm add @dpml/core
```

## 基本使用

### 解析 DPML 文本

```typescript
import { DpmlAdapter } from '@dpml/core/parser/dpml-adapter';

// 创建解析器实例
const dpmlAdapter = new DpmlAdapter();

// 解析 DPML 文本
const dpmlText = `
<prompt>
  <role name="user">
    请解释什么是人工智能？
  </role>
</prompt>
`;

async function parse() {
  try {
    const result = await dpmlAdapter.parse(dpmlText);
    
    // 获取解析后的 AST
    const ast = result.ast;
    
    // 检查是否有解析错误
    if (result.errors) {
      console.error('解析错误:', result.errors);
    }
    
    // 处理解析结果
    console.log('解析成功:', ast);
  } catch (error) {
    console.error('解析失败:', error);
  }
}

parse();
```

### 配置解析选项

```typescript
// 创建带选项的解析器实例
const dpmlAdapter = new DpmlAdapter({
  validate: true,              // 启用验证
  allowUnknownTags: false,     // 不允许未知标签
  tolerant: true,              // 容错模式
  preserveComments: true,      // 保留注释
  mode: 'strict',              // 严格模式
  processInheritance: true     // 处理继承
});

// 使用解析选项进行解析
const result = await dpmlAdapter.parse(dpmlText, {
  validate: true,
  mode: 'strict'
});
```

## 标签注册与使用

### 注册自定义标签

```typescript
import { TagRegistry } from '@dpml/core/parser/tag-registry';
import { TagDefinition } from '@dpml/core/parser/tag-definition';

// 获取标签注册表
const tagRegistry = dpmlAdapter.getTagRegistry();

// 定义标签
const buttonTag: TagDefinition = {
  tagName: 'button',
  allowedAttributes: ['id', 'disabled', 'type'],
  requiredAttributes: ['type'],
  allowedChildren: ['text', 'icon'],
  selfClosing: false,
  validateAttributes: (attributes) => {
    // 自定义属性验证逻辑
    if (attributes.type && !['primary', 'secondary', 'danger'].includes(attributes.type)) {
      return { valid: false, message: '按钮类型必须是 primary、secondary 或 danger' };
    }
    return { valid: true };
  }
};

// 注册标签
tagRegistry.registerTag('button', buttonTag);
```

### 验证文档

```typescript
import { Validator } from '@dpml/core/parser/validator';

// 创建验证器
const validator = new Validator(tagRegistry);

// 获取已解析的文档
const document = result.ast;

// 验证文档
const validationResult = validator.validateDocument(document);

if (!validationResult.valid) {
  // 处理验证错误
  console.error('验证错误:', validationResult.errors);
  // 处理警告
  console.warn('验证警告:', validationResult.warnings);
}
```

## 属性处理

### 核心属性处理

DPML Parser 自动处理核心属性，如 id、version 和 lang：

```typescript
// 解析带有核心属性的 DPML
const dpmlWithAttributes = `
<prompt id="my-prompt" version="1.0" lang="zh-CN">
  <role id="user-role" name="user">
    请解释量子计算
  </role>
</prompt>
`;

const result = await dpmlAdapter.parse(dpmlWithAttributes);

// 解析过程中会自动验证和处理这些属性
// - 检查 id 的唯一性和格式
// - 验证 version 格式
// - 设置文档语言
```

### 扩展属性处理

DPML 支持扩展属性，如 disabled 和 hidden：

```typescript
// 带有扩展属性的 DPML
const dpmlWithExtendedAttributes = `
<prompt>
  <button disabled="true">禁用按钮</button>
  <div hidden="\${isSecret}">条件隐藏内容</div>
</prompt>
`;

const result = await dpmlAdapter.parse(dpmlWithExtendedAttributes);

// 解析结果中包含处理后的扩展属性信息
// 可以访问：dpmlAdapter['extendedAttributes'] 获取属性处理结果
```

## 引用处理

### 解析文档内引用

```typescript
// 包含引用的 DPML
const dpmlWithReferences = `
<prompt>
  <role id="system" name="system">
    你是一个AI助手
  </role>
  
  <role name="user">
    请参考 @system 的设定回答我的问题
  </role>
</prompt>
`;

// 解析时会识别并处理 @system 引用
const result = await dpmlAdapter.parse(dpmlWithReferences);
```

## 错误处理

```typescript
try {
  const result = await dpmlAdapter.parse(dpmlText);
  
  // 检查解析错误
  if (result.errors && result.errors.length > 0) {
    result.errors.forEach(error => {
      console.error(`错误 [${error.code}]: ${error.message}`);
      
      // 错误位置信息
      if (error.position) {
        console.error(`位置: 行 ${error.position.line}, 列 ${error.position.column}`);
      }
    });
  }
  
  // 检查警告
  if (result.warnings && result.warnings.length > 0) {
    result.warnings.forEach(warning => {
      console.warn(`警告 [${warning.code}]: ${warning.message}`);
    });
  }
} catch (error) {
  console.error('解析失败:', error);
}
```

## 高级使用

### 自定义属性处理器

您可以扩展 DPML 的属性处理能力：

```typescript
import { Element, SourcePosition } from '@dpml/core/types/node';

// 创建自定义属性处理上下文
interface CustomContext {
  customData: Map<Element, any>;
  addWarning: (code: string, message: string, position?: SourcePosition) => void;
}

// 处理自定义属性
function processCustomAttributes(element: Element, context: CustomContext): void {
  // 处理自定义属性逻辑
  if (element.attributes['custom-attr']) {
    const value = element.attributes['custom-attr'];
    // 验证和处理属性...
    
    // 存储处理结果
    if (!context.customData.has(element)) {
      context.customData.set(element, {});
    }
    context.customData.get(element).customAttr = value;
  }
}

// 在解析文档后应用
const document = result.ast;
const customContext = {
  customData: new Map(),
  addWarning: (code, message) => console.warn(`${code}: ${message}`)
};

// 遍历文档处理自定义属性
function processElement(element: Element) {
  processCustomAttributes(element, customContext);
  element.children.forEach(child => {
    if (child.type === 'element') {
      processElement(child as Element);
    }
  });
}

// 从根元素开始处理
if (document.children.length > 0 && document.children[0].type === 'element') {
  processElement(document.children[0] as Element);
}
```

## API 参考

### 主要类和接口

- **DpmlAdapter**: DPML解析的主入口点
- **TagRegistry**: 管理标签定义
- **TagDefinition**: 定义标签规范和验证规则
- **Validator**: 验证DPML文档结构
- **Document/Element/Content/Reference**: AST节点类型
- **CoreAttributeProcessor**: 处理核心属性

### 解析结果结构

```typescript
interface ParseResult {
  ast: Document;            // 解析的抽象语法树
  errors?: ParseError[];    // 解析错误
  warnings?: ParseWarning[]; // 解析警告
}
```

## 调试

启用详细日志有助于调试DPML解析过程：

```typescript
// 使用环境变量启用调试
// NODE_DEBUG=dpml:parser node your-script.js
```

## 兼容性说明

DPML Parser 模块支持不同版本的DPML:

- 版本1.0: 基本语法和核心属性
- 版本2.0: 计划中，将支持更高级的引用系统

在使用 `version` 属性时，请指定正确的DPML版本以确保兼容性。

## 限制与注意事项

- 大文档解析可能需要较多内存
- 处理复杂引用链可能影响性能
- 某些高级功能可能需要额外配置

## 更多资源

- 完整API文档: [DPML API 文档](https://github.com/your-repo/dpml/docs/api)
- 示例库: [DPML 示例](https://github.com/your-repo/dpml/examples)
- 问题反馈: [GitHub Issues](https://github.com/your-repo/dpml/issues) 