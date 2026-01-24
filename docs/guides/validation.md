# 验证最佳实践

本指南介绍如何使用 DPML 的验证功能确保文档符合 Schema 定义，以及如何处理验证错误。

## 概述

DPML 提供完整的文档验证流程：

- **解析验证**：检查 XML 语法正确性
- **Schema 验证**：检查文档结构是否符合定义
- **属性验证**：检查属性值是否符合约束
- **内容验证**：检查元素内容是否符合规则

## 验证流程

### 基本验证

使用 `validate` 方法验证文档：

```typescript
import { createDPML, defineSchema } from 'dpml';

const schema = defineSchema({
  element: 'prompt',
  attributes: [
    { name: 'role', required: true },
  ],
});

const dpml = createDPML({
  schema,
  transformers: [],
});

const result = dpml.validate('<prompt role="assistant">Hello</prompt>');

console.log(result.isValid);  // true
console.log(result.errors);   // []
console.log(result.warnings); // []
```

### ValidationResult 结构

验证结果包含以下信息：

```typescript
interface ValidationResult {
  /** 是否通过验证 */
  isValid: boolean;

  /** 验证错误列表 */
  errors: ReadonlyArray<ProcessingError>;

  /** 验证警告列表 */
  warnings: ReadonlyArray<ProcessingWarning>;
}
```

## 常见验证场景

### 必需属性验证

检查是否缺少必需属性：

```typescript
const schema = defineSchema({
  element: 'prompt',
  attributes: [
    { name: 'role', required: true },
  ],
});

const dpml = createDPML({ schema, transformers: [] });

// 缺少 role 属性
const result = dpml.validate('<prompt>Hello</prompt>');

console.log(result.isValid); // false
console.log(result.errors[0].message); // 包含 "role" 的错误信息
```

### 枚举值验证

检查属性值是否在允许的列表中：

```typescript
const schema = defineSchema({
  element: 'prompt',
  attributes: [
    { name: 'role', enum: ['user', 'assistant', 'system'] },
  ],
});

const dpml = createDPML({ schema, transformers: [] });

// 使用无效的 role 值
const result = dpml.validate('<prompt role="invalid">Hello</prompt>');

console.log(result.isValid); // false
// 错误信息包含 "invalid"
```

### 根元素验证

检查根元素是否匹配 Schema：

```typescript
const schema = defineSchema({
  element: 'prompt',
});

const dpml = createDPML({ schema, transformers: [] });

// 根元素不匹配
const result = dpml.validate('<other>Hello</other>');

console.log(result.isValid); // false
```

### 可选属性验证

可选属性允许不提供：

```typescript
const schema = defineSchema({
  element: 'prompt',
  attributes: [
    { name: 'role', required: false },
  ],
});

const dpml = createDPML({ schema, transformers: [] });

// 不提供可选属性
const result = dpml.validate('<prompt>Hello</prompt>');

console.log(result.isValid); // true
```

## 错误处理

### 解析错误处理

处理 XML 语法错误：

```typescript
const schema = defineSchema({ element: 'prompt' });
const dpml = createDPML({ schema, transformers: [] });

try {
  // 未闭合的标签
  const result = dpml.validate('<prompt>Unclosed');
  // 解析失败会抛出错误或返回验证失败结果
} catch (error) {
  console.error('Parse error:', error.message);
}
```

### 空内容处理

空内容会导致解析失败：

```typescript
const schema = defineSchema({ element: 'prompt' });
const dpml = createDPML({ schema, transformers: [] });

try {
  const result = dpml.validate('');
  // 空内容会导致解析错误
} catch (error) {
  console.error('Empty content error');
}
```

### 编译时验证

`compile` 方法会执行验证，验证失败可能返回带警告的结果：

```typescript
const schema = defineSchema({
  element: 'prompt',
  attributes: [
    { name: 'role', required: true },
  ],
});

const transformer = defineTransformer({
  name: 'simple',
  transform: (input) => input,
});

const dpml = createDPML({ schema, transformers: [transformer] });

// 缺少必需属性，但编译会继续并返回带警告的结果
const result = await dpml.compile('<prompt>Hello</prompt>');
// result 包含验证警告
```

## 自定义验证规则

### 在变换器中添加验证

通过变换器实现自定义验证逻辑：

```typescript
interface ValidationEnhancedResult {
  isValid: boolean;
  customErrors: string[];
  originalValidation: ValidationResult;
  data: unknown;
}

const customValidator = defineTransformer<any, ValidationEnhancedResult>({
  name: 'custom-validator',
  transform: (input, context) => {
    const customErrors: string[] = [];
    const rootNode = input.document.rootNode;

    // 自定义规则 1：内容长度限制
    if (rootNode.content.length > 5000) {
      customErrors.push('Content exceeds 5000 characters');
    }

    // 自定义规则 2：禁止空内容
    if (rootNode.content.trim().length === 0 && rootNode.children.length === 0) {
      customErrors.push('Element must have content or children');
    }

    // 自定义规则 3：特定子元素要求
    const hasRequired = rootNode.children.some(c => c.tagName === 'instruction');
    if (!hasRequired) {
      customErrors.push('Missing required <instruction> element');
    }

    // 自定义规则 4：属性值格式验证
    const version = rootNode.attributes.get('version');
    if (version && !/^\d+\.\d+\.\d+$/.test(version)) {
      customErrors.push('Version must be in semver format (e.g., 1.0.0)');
    }

    return {
      isValid: context.isDocumentValid() && customErrors.length === 0,
      customErrors,
      originalValidation: context.getValidation(),
      data: input,
    };
  },
});
```

### 组合多个验证器

```typescript
// 内容验证器
const contentValidator = defineTransformer({
  name: 'content-validator',
  transform: (input, context) => {
    const errors: string[] = context.get('validationErrors') || [];

    const content = input.document.rootNode.content;
    if (content.includes('forbidden')) {
      errors.push('Content contains forbidden word');
    }

    context.set('validationErrors', errors);
    return input;
  },
});

// 结构验证器
const structureValidator = defineTransformer({
  name: 'structure-validator',
  transform: (input, context) => {
    const errors: string[] = context.get('validationErrors') || [];

    const children = input.document.rootNode.children;
    if (children.length > 10) {
      errors.push('Too many child elements (max: 10)');
    }

    context.set('validationErrors', errors);
    return input;
  },
});

// 最终验证汇总
const validationSummary = defineTransformer({
  name: 'validation-summary',
  transform: (input, context) => {
    const customErrors: string[] = context.get('validationErrors') || [];

    return {
      ...input,
      validation: {
        isValid: context.isDocumentValid() && customErrors.length === 0,
        schemaErrors: context.getValidation().errors,
        customErrors,
      },
    };
  },
});

const dpml = createDPML({
  schema,
  transformers: [contentValidator, structureValidator, validationSummary],
});
```

## 验证策略

### 严格模式

实现严格验证模式，验证失败时抛出错误：

```typescript
const strictValidator = defineTransformer({
  name: 'strict-validator',
  transform: (input, context) => {
    if (!context.isDocumentValid()) {
      const errors = context.getValidation().errors;
      throw new Error(
        `Validation failed: ${errors.map(e => e.message).join(', ')}`
      );
    }
    return input;
  },
});
```

### 宽松模式

收集错误但继续处理：

```typescript
const lenientValidator = defineTransformer({
  name: 'lenient-validator',
  transform: (input, context) => {
    const validation = context.getValidation();

    return {
      ...input,
      validationReport: {
        passed: validation.isValid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        details: {
          errors: validation.errors,
          warnings: validation.warnings,
        },
      },
    };
  },
});
```

## 实战示例

### 完整验证流程

```typescript
import { createDPML, defineSchema, defineTransformer } from 'dpml';

// 定义 Schema
const schema = defineSchema({
  element: 'prompt',
  attributes: [
    { name: 'role', required: true, enum: ['user', 'assistant', 'system'] },
    { name: 'version', type: 'string' },
  ],
  children: {
    elements: [
      { element: 'context' },
      { element: 'instruction' },
    ],
  },
});

// 自定义验证变换器
const customValidator = defineTransformer({
  name: 'custom-validator',
  transform: (input, context) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const rootNode = input.document.rootNode;

    // 检查是否有 instruction
    const instruction = rootNode.children.find(c => c.tagName === 'instruction');
    if (!instruction) {
      errors.push('Missing <instruction> element');
    } else if (instruction.content.trim().length < 10) {
      warnings.push('Instruction content is very short');
    }

    // 检查 context 内容
    const contexts = rootNode.children.filter(c => c.tagName === 'context');
    if (contexts.length > 3) {
      warnings.push('Too many context elements, consider consolidating');
    }

    return {
      ...input,
      customValidation: {
        errors,
        warnings,
        isValid: errors.length === 0,
      },
    };
  },
});

// 验证汇总变换器
const validationSummary = defineTransformer({
  name: 'summary',
  transform: (input, context) => {
    const schemaValidation = context.getValidation();
    const customValidation = input.customValidation;

    const allErrors = [
      ...schemaValidation.errors.map(e => e.message),
      ...customValidation.errors,
    ];

    const allWarnings = [
      ...schemaValidation.warnings.map(w => w.message),
      ...customValidation.warnings,
    ];

    return {
      isValid: schemaValidation.isValid && customValidation.isValid,
      errors: allErrors,
      warnings: allWarnings,
      document: input.document,
    };
  },
});

// 创建 DPML 实例
const dpml = createDPML({
  schema,
  transformers: [customValidator, validationSummary],
});

// 验证文档
async function validateDocument(content: string) {
  try {
    const result = await dpml.compile(content);

    if (!result.isValid) {
      console.log('Validation failed:');
      result.errors.forEach(err => console.log(`  Error: ${err}`));
    }

    if (result.warnings.length > 0) {
      console.log('Warnings:');
      result.warnings.forEach(warn => console.log(`  Warning: ${warn}`));
    }

    return result;
  } catch (error) {
    console.error('Parse error:', error.message);
    return null;
  }
}

// 使用示例
const doc = `
<prompt role="assistant">
  <context>You are a helpful assistant.</context>
  <instruction>Please help the user with their question.</instruction>
</prompt>
`;

validateDocument(doc);
```

### 错误报告格式化

```typescript
interface FormattedError {
  type: 'error' | 'warning';
  message: string;
  location?: {
    line: number;
    column: number;
  };
  suggestion?: string;
}

const errorFormatter = defineTransformer({
  name: 'error-formatter',
  transform: (input, context) => {
    const validation = context.getValidation();
    const formatted: FormattedError[] = [];

    for (const error of validation.errors) {
      formatted.push({
        type: 'error',
        message: error.message,
        location: error.location ? {
          line: error.location.startLine,
          column: error.location.startColumn,
        } : undefined,
        suggestion: getSuggestion(error),
      });
    }

    for (const warning of validation.warnings) {
      formatted.push({
        type: 'warning',
        message: warning.message,
      });
    }

    return {
      ...input,
      formattedErrors: formatted,
    };
  },
});

function getSuggestion(error: any): string | undefined {
  if (error.message.includes('required')) {
    return 'Add the missing required attribute';
  }
  if (error.message.includes('enum')) {
    return 'Use one of the allowed values';
  }
  return undefined;
}
```

## 最佳实践

1. **先验证后编译**：在生产环境中，先使用 `validate` 检查文档，再调用 `compile`
2. **分层验证**：Schema 验证基本结构，自定义变换器验证业务规则
3. **提供清晰的错误信息**：包含位置信息和修复建议
4. **区分错误和警告**：严重问题作为错误，建议改进作为警告
5. **验证早期失败**：在管道早期进行验证，避免处理无效数据
6. **记录验证日志**：在生产环境中记录验证失败以便分析

## 相关文档

- [Schema 定义指南](./defining-schema.md)
- [自定义变换器指南](./custom-transformer.md)
- [集成指南](./integration.md)
