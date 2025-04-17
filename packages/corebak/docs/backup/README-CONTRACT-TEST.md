# README契约测试实现指南

本文档提供了为README中的代码示例创建契约测试的指南，确保文档中的示例代码与实际实现保持一致。

## 1. 目标

README契约测试旨在实现以下目标：

- 验证README中的代码示例可运行且有效
- 确保示例代码与当前API实现一致
- 防止文档中的代码示例落后于实际代码
- 提高文档的质量和可信度

## 2. 实现方法

### 2.1 提取代码示例

首先需要从README文件中提取代码示例：

````typescript
// utils/extract-examples.ts
import * as fs from 'fs';
import * as path from 'path';

function extractExamples(readmePath: string): Record<string, string> {
  const content = fs.readFileSync(readmePath, 'utf-8');
  const examples: Record<string, string> = {};

  // 匹配代码块: ```typescript ... ```
  const codeBlockRegex = /```typescript\s+([\s\S]+?)\s+```/g;

  let match;
  let count = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const code = match[1].trim();
    examples[`example-${++count}`] = code;
  }

  return examples;
}

export { extractExamples };
````

### 2.2 创建测试文件

为每个提取的代码示例创建测试文件：

```typescript
// utils/create-test-files.ts
import * as fs from 'fs';
import * as path from 'path';
import { extractExamples } from './extract-examples';

function createTestFiles(readmePath: string, outputDir: string): void {
  const examples = extractExamples(readmePath);

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [id, code] of Object.entries(examples)) {
    const testContent = generateTestContent(id, code);
    fs.writeFileSync(path.join(outputDir, `${id}.test.ts`), testContent);
  }
}

function generateTestContent(id: string, code: string): string {
  return `
/**
 * README示例契约测试
 * 
 * 测试ID: ${id}
 * 确保README中的代码示例可以正常运行
 */

import { expect, test } from 'vitest';

test('README示例代码 - ${id}', async () => {
  // 包装示例代码在函数中执行，防止变量冲突
  const runExample = async () => {
    ${code}
    return true; // 如果代码执行没有错误，返回true
  };
  
  // 执行示例代码，并检查是否成功运行
  expect(await runExample()).toBe(true);
});
`;
}

export { createTestFiles };
```

### 2.3 运行测试脚本

创建一个脚本来执行整个流程：

```typescript
// scripts/run-readme-tests.ts
import * as path from 'path';
import { createTestFiles } from '../utils/create-test-files';
import { spawnSync } from 'child_process';

// 配置
const readmePath = path.resolve(__dirname, '../../README.md');
const outputDir = path.resolve(__dirname, '../tests/readme-examples');

// 创建测试文件
createTestFiles(readmePath, outputDir);

// 运行测试
const result = spawnSync('vitest', ['run', outputDir], {
  stdio: 'inherit',
  shell: true,
});

// 根据测试结果退出
process.exit(result.status || 0);
```

## 3. 高级实现

### 3.1 代码示例修改

有些代码示例可能需要修改才能在测试环境中运行：

```typescript
// utils/transform-example.ts
import * as ts from 'typescript';

function transformExample(code: string): string {
  // 替换文件系统操作
  code = code.replace(/fs\.readFileSync/g, 'mockReadFileSync');

  // 替换网络请求
  code = code.replace(/fetch\(/g, 'mockFetch(');

  // 添加必要的mock定义
  const mocks = `
  // Mock函数定义
  const mockReadFileSync = (path: string) => '示例内容';
  const mockFetch = async (url: string) => ({ 
    json: async () => ({ data: 'mock数据' }) 
  });
  `;

  return mocks + code;
}

export { transformExample };
```

### 3.2 上下文环境提供

为测试创建所需的上下文环境：

```typescript
// utils/create-context.ts
import { TagRegistry, parse, process } from '@dpml/core';

// 创建测试环境上下文
function createTestContext() {
  // 预设的注册表
  const registry = new TagRegistry();

  // 注册基本标签
  registry.registerTagDefinition('test', {
    attributes: {
      id: { type: 'string', required: true },
    },
    allowedChildren: ['child'],
  });

  registry.registerTagDefinition('child', {
    attributes: {
      name: { type: 'string', required: false },
    },
  });

  // 预置的解析代码
  const sampleDPML = '<test id="example">测试内容</test>';
  const parseResult = await parse(sampleDPML);

  return {
    registry,
    sampleDPML,
    parseResult,
    processedDoc: await process(parseResult.ast),
  };
}

export { createTestContext };
```

### 3.3 变量替换

将README示例中的抽象变量替换为具体变量：

```typescript
// utils/replace-placeholders.ts
function replacePlaceholders(code: string): string {
  const replacements: Record<string, string> = {
    dpmlText: '\'<test id="example">测试内容</test>\'',
    customTagName: "'custom-tag'",
    customOptions: '{ strictMode: false }',
    filePath: "'./sample.dpml'",
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    // 替换变量名
    const regex = new RegExp(`\\b${placeholder}\\b`, 'g');
    code = code.replace(regex, value);
  }

  return code;
}

export { replacePlaceholders };
```

## 4. 自动化集成

### 4.1 CI集成

将README契约测试集成到CI流程中：

```yaml
# .github/workflows/readme-tests.yml
name: README契约测试

on:
  push:
    branches: [main]
    paths:
      - 'README.md'
      - 'packages/*/src/**'
  pull_request:
    branches: [main]
    paths:
      - 'README.md'
      - 'packages/*/src/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: 安装依赖
        run: npm ci
      - name: 运行README契约测试
        run: npm run test:readme
```

### 4.2 预提交检查

添加预提交钩子，在提交README变更时自动检查：

```json
// package.json
{
  "scripts": {
    "test:readme": "ts-node scripts/run-readme-tests.ts"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "README.md": ["npm run test:readme", "git add"]
  }
}
```

## 5. 最佳实践

### 5.1 代码示例编写指南

为确保README示例可测试，请遵循以下指南：

1. **完整性**：示例代码应该是完整可运行的
2. **简洁性**：示例应该简洁明了，专注于展示特定功能
3. **独立性**：示例应该尽量独立，减少外部依赖
4. **错误处理**：包含适当的错误处理
5. **注释**：添加必要的注释解释关键步骤

### 5.2 测试维护建议

1. 每次API变更时检查README示例
2. 定期运行README契约测试
3. 修复失败的测试，同时更新README
4. 为新功能添加新的示例和契约测试

## 6. 示例测试案例

### 基本解析示例测试

```typescript
// tests/readme-examples/example-1.test.ts
import { expect, test } from 'vitest';
import { parse } from '@dpml/core';

test('README示例 - 基本解析', async () => {
  // 示例代码
  const dpmlText = '<prompt id="example">这是一个示例</prompt>';
  const result = await parse(dpmlText);
  const ast = result.ast;

  // 验证结果
  expect(result).toBeDefined();
  expect(ast).toBeDefined();
  expect(ast.children.length).toBe(1);
  expect(ast.children[0].type).toBe('element');
  expect((ast.children[0] as any).tagName).toBe('prompt');
});
```

### 标签注册示例测试

```typescript
// tests/readme-examples/example-2.test.ts
import { expect, test } from 'vitest';
import { TagRegistry, TagDefinition } from '@dpml/core';

test('README示例 - 标签注册', () => {
  // 示例代码
  const registry = new TagRegistry();

  const promptTagDef: TagDefinition = {
    attributes: {
      id: { type: 'string', required: true },
      version: { type: 'string', required: false },
      extends: { type: 'string', required: false },
    },
    allowedChildren: ['role', 'context', 'thinking', 'executing'],
  };

  registry.registerTagDefinition('prompt', promptTagDef);
  const isDefined = registry.isTagRegistered('prompt');

  // 验证结果
  expect(isDefined).toBe(true);
  expect(registry.getTagDefinition('prompt')).toEqual({
    ...promptTagDef,
    name: 'prompt', // 注册时会添加name属性
  });
});
```

## 7. 故障排除

### 常见问题

1. **导入错误**：确保示例使用正确的导入路径
2. **异步处理**：正确处理Promise和async/await
3. **环境依赖**：提供必要的mock对象和测试环境
4. **版本差异**：确保测试环境与示例假设的版本一致
5. **资源清理**：测试后清理所有资源
