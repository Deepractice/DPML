# DPML 基础解析示例

本目录包含DPML基础解析的示例代码，展示如何使用`@dpml/core`包进行DPML文档的解析。

## 示例文件

- `parsing.ts`: 演示基本解析功能和选项
- `simple-dpml.xml`: 示例DPML文件

## 示例说明

### 基本解析

```typescript
// parsing.ts
import { parse } from '@dpml/core';

// 基本解析
async function basicParsing() {
  const dpmlText = `
    <prompt id="example">
      这是一个示例提示
      <role name="assistant">
        我是一个AI助手
      </role>
    </prompt>
  `;

  try {
    const result = await parse(dpmlText);
    console.log('解析结果:', JSON.stringify(result.ast, null, 2));
  } catch (error) {
    console.error('解析错误:', error);
  }
}

// 使用解析选项
async function parsingWithOptions() {
  const dpmlText = `
    <prompt id="example">
      <!-- 这是一个注释 -->
      <unknown-tag>未知标签</unknown-tag>
      这是示例内容
    </prompt>
  `;

  try {
    const result = await parse(dpmlText, {
      allowUnknownTags: true,    // 允许未知标签
      validate: true,            // 启用验证
      tolerant: true,            // 错误时继续解析
      preserveComments: true     // 保留注释
    });
    
    console.log('带选项的解析结果:', JSON.stringify(result.ast, null, 2));
    
    // 查看解析警告
    if (result.warnings.length > 0) {
      console.log('解析警告:', result.warnings);
    }
  } catch (error) {
    console.error('解析错误:', error);
  }
}

// 运行示例
basicParsing();
parsingWithOptions();
```

## 运行示例

确保已安装依赖：

```bash
pnpm install
```

运行示例：

```bash
pnpm exmaple:core:parsing
```

## 预期输出

基本解析将输出解析后的AST结构，包含`prompt`元素及其子元素。

带选项的解析将输出包含未知标签和注释的AST，以及关于未知标签的警告信息。 