# API契约测试指南

本文档提供了实现API契约测试的指南，确保公共API接口在变更过程中保持兼容性，防止破坏现有的调用代码。

## 1. 什么是API契约测试？

API契约测试是一种特殊的测试方法，专注于验证API的"契约"或"承诺"是否得到遵守。这种契约包括：

- 函数签名（参数类型和返回值类型）
- 公共类和接口的结构
- API的行为语义
- 错误处理模式
- 数据格式和协议

契约测试不同于常规的单元测试，它不关注内部实现，而是确保对外暴露的API保持稳定和向后兼容。

## 2. 为什么需要API契约测试？

- **防止意外破坏**：避免在重构或添加功能时破坏现有API
- **保持文档一致性**：确保API文档与实际实现一致
- **强化版本语义**：支持语义化版本控制（SemVer）原则
- **提高代码质量**：促使开发者思考API设计和兼容性
- **减少集成问题**：减少因API变更导致的集成失败

## 3. 契约测试实现方法

### 3.1 TypeScript接口验证

使用TypeScript的结构类型系统验证API契约：

```typescript
// src/api/public-api.ts
export interface UserAPI {
  getUser(id: string): Promise<User>;
  createUser(data: UserData): Promise<User>;
  updateUser(id: string, data: Partial<UserData>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
}

// tests/contracts/user-api.contract.ts
import { expectTypeOf } from 'vitest';
import { UserAPI } from '../../src/api/public-api';
import { UserServiceImpl } from '../../src/services/user-service';

describe('User API Contract Tests', () => {
  it('UserServiceImpl implements UserAPI', () => {
    // 静态类型验证
    const service: UserAPI = new UserServiceImpl();

    // 方法签名验证
    expectTypeOf(service.getUser).toMatchTypeOf<
      (id: string) => Promise<User>
    >();
    expectTypeOf(service.createUser).toMatchTypeOf<
      (data: UserData) => Promise<User>
    >();
    expectTypeOf(service.updateUser).toMatchTypeOf<
      (id: string, data: Partial<UserData>) => Promise<User>
    >();
    expectTypeOf(service.deleteUser).toMatchTypeOf<
      (id: string) => Promise<boolean>
    >();
  });
});
```

### 3.2 运行时签名验证

验证函数参数和返回值的实际类型：

```typescript
// tests/contracts/runtime-validation.contract.ts
import { expect, test } from 'vitest';
import { parse, process, transform } from '@dpml/core';

test('Core API signatures', async () => {
  // 参数和返回值类型验证

  // parse函数应接受字符串并返回带有ast属性的对象
  const parseResult = await parse('<test/>');
  expect(typeof parseResult).toBe('object');
  expect(parseResult).toHaveProperty('ast');

  // process函数应接受ast并返回一个文档对象
  const processResult = await process(parseResult.ast);
  expect(typeof processResult).toBe('object');
  expect(processResult).toHaveProperty('type', 'document');

  // transform函数应接受处理后的文档并返回字符串
  const transformResult = transform(processResult);
  expect(typeof transformResult).toBe('string');
});
```

### 3.3 API结构快照测试

使用快照测试记录并验证API结构：

```typescript
// tests/contracts/api-structure.contract.ts
import { expect, test } from 'vitest';
import * as API from '@dpml/core';

test('Core API structure snapshot', () => {
  // 收集公共API
  const publicApi = Object.keys(API).sort();

  // 验证API结构未发生变化
  expect(publicApi).toMatchSnapshot();

  // 验证关键API存在
  expect(publicApi).toContain('parse');
  expect(publicApi).toContain('process');
  expect(publicApi).toContain('TagRegistry');
});
```

### 3.4 行为契约测试

验证API行为满足预期的契约：

```typescript
// tests/contracts/behavior.contract.ts
import { expect, test } from 'vitest';
import { TagRegistry } from '@dpml/core';

test('TagRegistry contract - get after register', () => {
  const registry = new TagRegistry();
  const tagDef = { name: 'test', attributes: { id: { type: 'string' } } };

  // 契约：注册后应能获取到相同的定义
  registry.registerTagDefinition('test', tagDef);
  const retrieved = registry.getTagDefinition('test');

  expect(retrieved).toEqual(tagDef);
});

test('TagRegistry contract - registration status', () => {
  const registry = new TagRegistry();

  // 契约：未注册的标签，isRegistered应返回false
  expect(registry.isTagRegistered('unknown')).toBe(false);

  // 契约：注册后，isRegistered应返回true
  registry.registerTagDefinition('test', {});
  expect(registry.isTagRegistered('test')).toBe(true);
});
```

### 3.5 版本兼容性测试

测试不同版本间的API兼容性：

```typescript
// tests/contracts/version-compatibility.contract.ts
import { expect, test } from 'vitest';
import { ValidationError } from '@dpml/core';
import { mockLegacyCode } from './mocks/legacy-code';

test('ValidationError backward compatibility', () => {
  // 模拟使用旧版API的代码
  const error = mockLegacyCode.createValidationError();

  // 契约：新版本应兼容旧代码创建的错误
  expect(error).toHaveProperty('code');
  expect(error).toHaveProperty('message');

  // 契约：新API应能处理旧格式的错误
  const result = mockLegacyCode.validateWithLegacyErrors();
  expect(result.valid).toBeDefined();
});
```

## 4. 高级契约测试技术

### 4.1 自动API提取

使用TypeScript编译器API提取并验证公共API定义：

```typescript
// tools/extract-api.ts
import * as ts from 'typescript';
import * as fs from 'fs';

function extractPublicApi(entryFile: string): Record<string, any> {
  const program = ts.createProgram([entryFile], {
    target: ts.ScriptTarget.ES2019,
    module: ts.ModuleKind.CommonJS,
  });

  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(entryFile);
  const exports: Record<string, any> = {};

  if (sourceFile) {
    ts.forEachChild(sourceFile, node => {
      if (ts.isExportDeclaration(node)) {
        // 处理导出声明
        const exportClause = node.exportClause;
        if (exportClause && ts.isNamedExports(exportClause)) {
          exportClause.elements.forEach(element => {
            const name = element.name.text;
            const symbol = checker.getSymbolAtLocation(element.name);
            if (symbol) {
              exports[name] = extractSymbolInfo(symbol, checker);
            }
          });
        }
      }
    });
  }

  return exports;
}

function extractSymbolInfo(symbol: ts.Symbol, checker: ts.TypeChecker): any {
  const type = checker.getTypeOfSymbolAtLocation(
    symbol,
    symbol.valueDeclaration!
  );
  return {
    kind: getSymbolKindString(symbol),
    type: checker.typeToString(type),
  };
}

function getSymbolKindString(symbol: ts.Symbol): string {
  if (symbol.flags & ts.SymbolFlags.Class) return 'class';
  if (symbol.flags & ts.SymbolFlags.Interface) return 'interface';
  if (symbol.flags & ts.SymbolFlags.Function) return 'function';
  if (symbol.flags & ts.SymbolFlags.TypeAlias) return 'type';
  return 'other';
}

// 使用示例
const api = extractPublicApi('./src/index.ts');
fs.writeFileSync('./api-snapshot.json', JSON.stringify(api, null, 2));
```

### 4.2 模块导出验证

确保导出的模块结构符合预期：

```typescript
// tests/contracts/exports.contract.ts
import { expect, test } from 'vitest';
import * as Core from '@dpml/core';

test('Core package exports contract', () => {
  // 核心API检查
  const coreExports = [
    // 解析相关
    'parse',
    'Parser',
    'TagRegistry',
    'TagDefinition',

    // 处理相关
    'process',
    'Processor',
    'TagProcessor',

    // 转换相关
    'transform',
    'Transformer',
    'DefaultTransformer',

    // 错误处理
    'DPMLError',
    'ValidationError',
    'ValidationErrorImpl',

    // 类型定义
    'Element',
    'Document',
    'Content',
    'Reference',
  ];

  // 验证所有核心API都已导出
  for (const api of coreExports) {
    expect(Core).toHaveProperty(api);
  }

  // 验证没有意外导出内部API
  const internalAPIs = ['__internal', '_private'];
  for (const api of internalAPIs) {
    expect(Core).not.toHaveProperty(api);
  }
});
```

### 4.3 跨包契约测试

验证不同包之间的API兼容性：

```typescript
// tests/contracts/cross-package.contract.ts
import { expect, test } from 'vitest';
import { TagDefinition, TagRegistry } from '@dpml/core';
import { promptTagDefinition } from '@dpml/prompt';

test('prompt package uses core TagDefinition correctly', () => {
  // 验证prompt包中的TagDefinition遵循core包的契约
  const registry = new TagRegistry();

  // 契约：promptTagDefinition应该可以注册到TagRegistry
  expect(() => {
    registry.registerTagDefinition('prompt', promptTagDefinition);
  }).not.toThrow();

  // 契约：注册后应能获取到相同的定义
  const retrieved = registry.getTagDefinition('prompt');
  expect(retrieved).toMatchObject(promptTagDefinition);
});
```

## 5. 契约测试工具链

### 5.1 工具组合

推荐的契约测试工具组合：

1. **TypeScript** - 静态类型验证
2. **Vitest** - 测试运行和断言
3. **expectTypeOf** - 类型匹配测试
4. **API Extractor** - API定义提取和比较
5. **ts-morph** - TypeScript AST操作
6. **jest-snapshot** - API快照对比

### 5.2 CI集成

将API契约测试集成到CI流程中：

```yaml
# .github/workflows/api-contracts.yml
name: API契约测试

on:
  push:
    branches: [main, development]
    paths:
      - 'packages/*/src/**'
      - 'packages/*/package.json'
  pull_request:
    branches: [main, development]

jobs:
  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: 安装依赖
        run: npm ci
      - name: 运行契约测试
        run: npm run test:contracts
      - name: API签名提取
        run: npm run api-extract
      - name: 验证API变更
        run: npm run api-verify
```

### 5.3 破坏性变更检测

自动检测API破坏性变更：

```typescript
// tools/detect-breaking-changes.ts
import * as fs from 'fs';
import * as path from 'path';
import { compare } from 'fast-deep-equal';

// 加载API快照
const oldApi = JSON.parse(
  fs.readFileSync('./api-snapshots/previous.json', 'utf8')
);
const newApi = JSON.parse(
  fs.readFileSync('./api-snapshots/current.json', 'utf8')
);

// 检测破坏性变更
const breakingChanges = [];

// 检查已删除的API
for (const key in oldApi) {
  if (!(key in newApi)) {
    breakingChanges.push({
      type: 'removed',
      item: key,
      description: `已移除的API: ${key}`,
    });
  }
}

// 检查签名变更
for (const key in oldApi) {
  if (key in newApi) {
    const oldType = oldApi[key].type;
    const newType = newApi[key].type;

    if (oldType !== newType) {
      breakingChanges.push({
        type: 'signature-changed',
        item: key,
        description: `签名已变更: ${key}`,
        oldSignature: oldType,
        newSignature: newType,
      });
    }
  }
}

// 输出结果
if (breakingChanges.length > 0) {
  console.error('检测到API破坏性变更:');
  console.error(JSON.stringify(breakingChanges, null, 2));
  process.exit(1);
} else {
  console.log('未检测到API破坏性变更');
}
```

## 6. 最佳实践

### 6.1 契约测试规范

1. **关注公共API**：只测试公共API，忽略内部实现
2. **独立性**：契约测试应该独立于实现细节
3. **覆盖完整性**：确保测试覆盖所有公共API
4. **语义验证**：不仅验证类型，也验证行为语义
5. **兼容性范围**：明确定义向后兼容的范围

### 6.2 测试组织

将契约测试组织为独立的测试套件：

```
/tests
  /unit              # 单元测试
  /integration       # 集成测试
  /e2e               # 端到端测试
  /contracts         # 契约测试
    /api-structure   # API结构测试
    /behavior        # 行为契约测试
    /compatibility   # 兼容性测试
    /cross-package   # 跨包契约测试
```

### 6.3 版本控制配合

配合语义化版本控制：

1. **补丁版本**（1.0.x）：所有契约测试必须通过
2. **次版本**（1.x.0）：允许新增API，所有向后兼容测试必须通过
3. **主版本**（x.0.0）：可以存在破坏性变更，需更新契约测试

### 6.4 文档集成

将契约测试与API文档集成：

1. 从契约测试生成API文档示例
2. 使用文档中的示例创建契约测试
3. 在文档中标注API的稳定性承诺
4. 记录已知的兼容性问题和限制

## 7. 故障排除

### 7.1 常见问题

1. **类型不匹配**：TypeScript接口与实现不一致
2. **行为变更**：API行为发生变化但保持相同签名
3. **内部依赖泄露**：公共API依赖内部实现细节
4. **缺少测试覆盖**：未测试所有公共API的各种用例
5. **环境差异**：不同环境下API行为不一致

### 7.2 解决策略

1. **明确API边界**：清晰区分公共API和内部API
2. **使用接口隔离**：通过接口分离定义和实现
3. **渐进式废弃**：使用废弃注释而非直接删除
4. **兼容层**：为破坏性变更提供适配层
5. **版本策略**：遵循语义化版本规范
