# ADR-003: Schema 验证策略

**状态**: Accepted
**日期**: 2025-01

## 背景

DPML 作为三方协同的信息载体，需要一套验证机制来确保：

1. **格式正确性**：文档符合类 XML 语法规范
2. **语义正确性**：元素、属性符合领域规范
3. **类型安全**：配置参数类型正确
4. **运行时适应**：不同场景下验证严格程度不同

**挑战**：

基于六态流转模型（见 ADR-002），不同位置的 DPML 需要不同的验证策略：

| 态        | 验证需求                                   |
| --------- | ------------------------------------------ |
| **DPML₁** | 必须宽松 → 否则用户表达受限                |
| **DPML₄** | 必须宽容 → 否则 AI 生成失败率高            |
| **DPML₅** | 必须严格 → 否则执行会出错                  |
| **DPML₆** | 必须极严格 → 否则 AI 推理会偏差            |

**传统方案的问题**：

| 方案                | 问题                                       |
| ------------------- | ------------------------------------------ |
| 全局严格验证        | 用户表达受限，AI 生成失败率高              |
| 全局宽松验证        | 执行错误，数据不一致                       |
| 无验证              | 调试困难，问题难以定位                     |
| XML Schema/DTD      | 过于复杂，不符合"约而不束"原则             |

## 决策

**DPML 采用分层验证策略：协议层验证格式，领域层验证语义，运行时根据六态位置调整严格程度。**

### 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                      运行时验证层                            │
│  根据六态位置，选择验证策略（宽松/标准/严格/极严格）          │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      领域层验证                              │
│  • 元素约束：允许的子元素、必需属性                          │
│  • 属性校验：类型、取值范围、枚举                            │
│  • 语义规则：领域特定的业务逻辑                              │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      协议层验证                              │
│  • 格式正确性：类 XML 语法                                   │
│  • 命名约定：kebab-case                                      │
│  • 保留属性：type、id                                        │
└─────────────────────────────────────────────────────────────┘
```

### 协议层验证

**职责**：只验证格式，不验证语义

**验证项**：

| 验证项       | 规则                                       | 示例                              |
| ------------ | ------------------------------------------ | --------------------------------- |
| 语法正确性   | 符合类 XML 语法                            | 标签闭合、属性引号               |
| 命名约定     | tag 和 attribute 使用 kebab-case           | `<my-agent>`，`api-key="..."`    |
| 保留属性     | `type` 和 `id` 为保留属性                  | `<prompt type="markdown">`       |

**设计原则**：

- 协议层遵循"约而不束"原则
- 只定义通用规则，不限制领域创新
- 任何符合格式的文档都是"协议有效"的

### 领域层验证

**职责**：验证语义正确性

**验证项**：

| 验证项       | 描述                                       | 示例                              |
| ------------ | ------------------------------------------ | --------------------------------- |
| 元素约束     | 允许的子元素、父元素关系                   | `<llm>` 只能在 `<agent>` 内       |
| 必需属性     | 某些元素必须有特定属性                     | `<llm>` 必须有 `model` 属性       |
| 属性类型     | 属性值的类型约束                           | `temperature` 必须是 0-2 的数字   |
| 枚举约束     | 属性值必须在允许的集合内                   | `type` 只能是 `markdown`/`text`   |
| 语义规则     | 领域特定的业务逻辑                         | 工具名不能重复                    |

**Schema 定义方式**：

```typescript
// 声明式 Schema 定义
const agentSchema = {
  element: 'agent',
  attributes: {
    id: { type: 'string', required: false }
  },
  children: {
    llm: { required: true, schema: llmSchema },
    prompt: { required: true, schema: promptSchema },
    tools: { required: false, schema: toolsSchema }
  }
};

const llmSchema = {
  element: 'llm',
  attributes: {
    model: { type: 'string', required: true },
    temperature: { type: 'number', min: 0, max: 2, default: 0.7 },
    'api-key': { type: 'string', required: false }
  }
};
```

### 运行时验证策略

**基于六态位置的验证严格程度**：

| 态        | 验证级别 | 策略                                       | 理由                          |
| --------- | -------- | ------------------------------------------ | ----------------------------- |
| **DPML₁** | 宽松     | 只验证协议层，容忍部分语义错误             | 保留人类表达的原始丰富性      |
| **DPML₂** | 标准     | 完整验证，报告所有问题                     | 帮助开发者发现配置问题        |
| **DPML₃** | 标准     | 完整验证，确保上下文完整                   | 为 AI 提供可靠的推理依据      |
| **DPML₄** | 宽容     | 验证结构，容忍小偏差，自动修复             | AI 生成可能有轻微格式问题     |
| **DPML₅** | 严格     | 完整验证 + 类型检查 + 元数据完整性         | 执行前必须确保无误            |
| **DPML₆** | 极严格   | 完整验证 + 数据完整性 + 一致性检查         | 输出数据必须可靠              |

**验证模式实现**：

```typescript
type ValidationMode = 'lenient' | 'standard' | 'tolerant' | 'strict' | 'extreme';

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  autoFixed?: AutoFixResult[];  // 宽容模式下的自动修复
}

function validate(doc: DPMLDocument, mode: ValidationMode): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };

  // 协议层验证（所有模式都执行）
  validateProtocol(doc, result);

  // 领域层验证（根据模式调整）
  if (mode !== 'lenient') {
    validateDomain(doc, result, mode);
  }

  // 自动修复（宽容模式）
  if (mode === 'tolerant' && result.errors.length > 0) {
    result.autoFixed = tryAutoFix(doc, result.errors);
  }

  return result;
}
```

### 错误处理策略

| 验证级别 | 遇到错误时的行为                           |
| -------- | ------------------------------------------ |
| 宽松     | 记录警告，继续处理                         |
| 标准     | 报告错误，可选择继续或停止                 |
| 宽容     | 尝试自动修复，修复失败才报错               |
| 严格     | 立即报错，拒绝处理                         |
| 极严格   | 立即报错，拒绝处理，记录审计日志           |

## 理由

### 为什么采用分层验证？

**关注点分离**：

| 层次   | 关注点   | 变化频率 | 验证复杂度 |
| ------ | -------- | -------- | ---------- |
| 协议层 | 如何表达 | 低       | 简单       |
| 领域层 | 表达什么 | 中       | 中等       |
| 运行时 | 何时验证 | 高       | 复杂       |

分层设计让每一层都能独立演进，降低维护成本。

### 为什么需要运行时调整验证严格程度？

**六态的不同需求**：

```
用户输入（宽松）
    ↓ 不要拒绝用户，保留原始意图
AI 生成（宽容）
    ↓ AI 可能有小错误，尝试修复
计算机执行（严格）
    ↓ 执行前必须无误
执行结果（极严格）
    ↓ 输出必须可靠，供下一步推理
```

**统一验证的问题**：
- 如果全部严格：用户体验差，AI 生成失败率高
- 如果全部宽松：执行错误，数据不一致

### 为什么不使用 XML Schema/DTD？

| 方案         | 问题                                       |
| ------------ | ------------------------------------------ |
| XML Schema   | 过于复杂，学习成本高，不符合"约而不束"     |
| DTD          | 功能有限，无法表达复杂约束                 |
| JSON Schema  | 不适合类 XML 结构                          |
| 自定义 Schema| 简单灵活，可针对 DPML 场景优化             |

DPML 采用声明式的自定义 Schema 格式，兼顾表达力和简洁性。

## 后果

### 正面

1. **类型安全**：
   - 配置参数有类型约束
   - 开发时即可发现错误
   - 减少运行时问题

2. **开发体验**：
   - IDE 可提供自动补全
   - 实时错误提示
   - 清晰的错误信息

3. **灵活适应**：
   - 不同场景选择不同验证级别
   - 用户输入宽松，执行严格
   - 平衡用户体验和系统可靠性

4. **可扩展**：
   - 领域可定义自己的 Schema
   - 不影响协议层稳定性
   - 支持渐进式采用

### 负面

1. **复杂度**：
   - 需要理解分层验证概念
   - 不同验证级别的选择
   - **缓解**：提供默认配置，大多数场景无需手动选择

2. **性能考量**：
   - 多层验证可能增加处理时间
   - **缓解**：协议层验证轻量，领域层验证可缓存 Schema

3. **Schema 维护**：
   - 每个领域需要定义和维护 Schema
   - **缓解**：提供 Schema 定义工具，自动生成文档

## 实现示例

### 协议层验证

```typescript
function validateProtocol(doc: DPMLDocument): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };

  // 1. 语法正确性（由 XML 解析器保证）

  // 2. 命名约定
  for (const element of doc.elements) {
    if (!isKebabCase(element.tag)) {
      result.errors.push({
        type: 'naming',
        message: `Tag "${element.tag}" should be kebab-case`,
        location: element.location
      });
    }

    for (const attr of element.attributes) {
      if (!isKebabCase(attr.name)) {
        result.errors.push({
          type: 'naming',
          message: `Attribute "${attr.name}" should be kebab-case`,
          location: attr.location
        });
      }
    }
  }

  result.valid = result.errors.length === 0;
  return result;
}
```

### 领域层验证

```typescript
function validateDomain(
  doc: DPMLDocument,
  schema: DomainSchema,
  mode: ValidationMode
): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };

  // 1. 元素约束
  for (const element of doc.elements) {
    const elementSchema = schema.elements[element.tag];
    if (!elementSchema) {
      if (mode === 'strict' || mode === 'extreme') {
        result.errors.push({
          type: 'unknown-element',
          message: `Unknown element "${element.tag}"`,
          location: element.location
        });
      } else {
        result.warnings.push({
          type: 'unknown-element',
          message: `Unknown element "${element.tag}"`,
          location: element.location
        });
      }
      continue;
    }

    // 2. 必需属性
    for (const [attrName, attrSchema] of Object.entries(elementSchema.attributes)) {
      if (attrSchema.required && !element.hasAttribute(attrName)) {
        result.errors.push({
          type: 'missing-attribute',
          message: `Element "${element.tag}" requires attribute "${attrName}"`,
          location: element.location
        });
      }
    }

    // 3. 属性类型
    for (const attr of element.attributes) {
      const attrSchema = elementSchema.attributes[attr.name];
      if (attrSchema && !validateType(attr.value, attrSchema.type)) {
        result.errors.push({
          type: 'type-mismatch',
          message: `Attribute "${attr.name}" should be ${attrSchema.type}`,
          location: attr.location
        });
      }
    }
  }

  result.valid = result.errors.length === 0;
  return result;
}
```

### 自动修复（宽容模式）

```typescript
function tryAutoFix(doc: DPMLDocument, errors: ValidationError[]): AutoFixResult[] {
  const fixes: AutoFixResult[] = [];

  for (const error of errors) {
    switch (error.type) {
      case 'naming':
        // 自动转换为 kebab-case
        const fixed = toKebabCase(error.original);
        fixes.push({
          error,
          fix: { type: 'rename', from: error.original, to: fixed },
          applied: true
        });
        break;

      case 'missing-attribute':
        // 如果有默认值，自动填充
        if (error.schema?.default !== undefined) {
          fixes.push({
            error,
            fix: { type: 'add-attribute', name: error.attrName, value: error.schema.default },
            applied: true
          });
        }
        break;

      // ... 其他修复策略
    }
  }

  return fixes;
}
```

## 相关决策

- ADR-001: 标记语言选择
- ADR-002: 三方协同模型

## 参考

- [DPML 白皮书 - 5.2 协议层职责](/specs/v1.0/zh/whitepaper/index.md#52-协议层职责)
- [DPML 白皮书 - 5.3 领域层职责](/specs/v1.0/zh/whitepaper/index.md#53-领域层职责)
- [DPML 白皮书 - 3.3.4 统一规范的必要性](/specs/v1.0/zh/whitepaper/index.md#334-统一规范的必要性)
