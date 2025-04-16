# DPML 自定义标签示例

本目录包含自定义DPML标签的示例代码，展示如何使用`@dpml/core`包定义、注册和使用自定义标签。

## 示例文件

- `TagDefinition.ts`: 演示标签定义和注册
- `custom-validation.ts`: 自定义标签验证逻辑
- `custom-dpml.xml`: 使用自定义标签的示例文件

## 示例说明

### 定义和注册自定义标签

```typescript
// TagDefinition.ts
import { TagRegistry, TagDefinition } from '@dpml/core';

// 获取标签注册表
const registry = new TagRegistry();

// 方式1: 使用辅助函数创建标签定义（自动包含通用属性）
function defineCustomTags() {
  // 自定义卡片标签
  const cardTagDef = TagRegistry.createTagDefinition({
    attributes: {
      type: {
        type: 'string',
        required: true,
        validate: value => {
          return (
            ['info', 'warning', 'error'].includes(value) ||
            `无效的卡片类型: ${value}，应为info, warning或error`
          );
        },
      },
      title: { type: 'string', required: false },
    },
    allowedChildren: ['content', 'image'],
    validate: (element, context) => {
      // 自定义验证逻辑
      if (element.attributes.type === 'error' && !element.attributes.title) {
        return {
          valid: false,
          errors: [
            { code: 'MISSING_TITLE', message: 'error类型的卡片必须有标题' },
          ],
        };
      }
      return { valid: true };
    },
  });

  // 注册标签
  registry.registerTagDefinition('card', cardTagDef);

  // 方式2: 直接使用registerTag简化方法
  registry.registerTag('image', {
    attributes: {
      src: { type: 'string', required: true },
      alt: { type: 'string', required: false },
      width: { type: 'number', required: false },
      height: { type: 'number', required: false },
    },
    selfClosing: true,
  });

  return registry;
}

// 使用自定义标签
async function useCustomTags() {
  const { parse } = await import('@dpml/core');

  // 初始化注册表
  const registry = defineCustomTags();

  const dpmlText = `
    <card type="info" title="提示信息">
      这是一个信息卡片
      <image src="info.png" alt="信息图标" />
    </card>
  `;

  try {
    // 使用自定义标签注册表解析
    const result = await parse(dpmlText, {
      tagRegistry: registry,
      validate: true,
    });

    console.log('解析结果:', JSON.stringify(result.ast, null, 2));
  } catch (error) {
    console.error('解析错误:', error);
  }
}

// 运行示例
defineCustomTags();
useCustomTags();
```

### 自定义标签验证

```typescript
// custom-validation.ts
import { TagRegistry, Element, ProcessingContext } from '@dpml/core';

// 创建标签注册表
const registry = new TagRegistry();

// 注册带复杂验证的标签
registry.registerTag('data-table', {
  attributes: {
    columns: { type: 'string', required: true },
    sortable: { type: 'boolean', required: false },
    pagination: { type: 'boolean', required: false },
    pageSize: { type: 'number', required: false },
  },
  allowedChildren: ['data-row'],
  validate: (element, context) => {
    const errors = [];
    let valid = true;

    // 1. columns属性应为逗号分隔的列名列表
    const columns =
      element.attributes.columns?.split(',')?.map(c => c.trim()) || [];
    if (columns.length === 0) {
      errors.push({
        code: 'INVALID_COLUMNS',
        message: 'columns属性必须是逗号分隔的列名列表',
      });
      valid = false;
    }

    // 2. 如果启用分页，pageSize必须存在且大于0
    if (
      element.attributes.pagination === true &&
      (!element.attributes.pageSize || element.attributes.pageSize <= 0)
    ) {
      errors.push({
        code: 'INVALID_PAGE_SIZE',
        message: '启用分页时，pageSize必须大于0',
      });
      valid = false;
    }

    return { valid, errors };
  },
});

// 注册子标签
registry.registerTag('data-row', {
  attributes: {
    values: { type: 'string', required: true },
  },
  allowedChildren: [],
  validate: (element, context) => {
    // 验证行值与表格列数一致
    const parent = context.findParent(element);
    if (parent?.tagName === 'data-table') {
      const tableColumns = parent.attributes.columns?.split(',') || [];
      const rowValues = element.attributes.values?.split(',') || [];

      if (tableColumns.length !== rowValues.length) {
        return {
          valid: false,
          errors: [
            {
              code: 'COLUMN_COUNT_MISMATCH',
              message: `行值数量(${rowValues.length})与列数量(${tableColumns.length})不匹配`,
            },
          ],
        };
      }
    }

    return { valid: true };
  },
});
```

## 运行示例

确保已安装依赖：

```bash
pnpm install
```

运行示例：

```bash
ts-node examples/core/custom-tags/TagDefinition.ts
ts-node examples/core/custom-tags/custom-validation.ts
```

## 预期输出

标签定义示例将输出包含自定义标签的解析AST。

自定义验证示例将展示如何进行复杂的标签验证，并在验证失败时输出详细的错误信息。
