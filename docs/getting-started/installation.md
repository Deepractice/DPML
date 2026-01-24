# 安装指南

## 前置条件

- **Node.js** >= 22.0.0
- **Bun** >= 1.3.0（推荐）
- TypeScript 5.0+（推荐）

## 包概览

DPML 以 monorepo 形式组织，提供以下包：

| 包                         | 描述                                        | 何时使用                     |
| -------------------------- | ------------------------------------------- | ---------------------------- |
| `dpml`                     | 主包 - 公共 API                              | 大多数项目 - 包含所有功能    |
| `@dpml/core`               | 核心库 - 解析、验证、转换                    | 构建自定义工具               |

## 安装主包

对于大多数项目，安装主包 `dpml` 即可：

```bash
# 使用 npm
npm install dpml

# 使用 Bun（推荐）
bun add dpml

# 使用 yarn
yarn add dpml

# 使用 pnpm
pnpm add dpml
```

这将为你提供：

- 核心 API（createDPML、defineSchema、defineTransformer）
- Schema 验证功能
- 内置 `<resource>` 元素支持
- 完整的 TypeScript 类型定义

## TypeScript 配置

DPML 使用 ESM 模块。确保你的 `tsconfig.json` 包含以下配置：

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "target": "ES2022"
  }
}
```

## 验证安装

创建一个测试文件验证安装是否成功：

```typescript
// test.ts
import { createDPML, defineSchema, defineTransformer } from 'dpml';

async function main() {
  // 1. 定义 Schema
  const schema = defineSchema({
    element: 'prompt',
    attributes: [{ name: 'role', required: true }],
  });

  // 2. 定义 Transformer
  const transformer = defineTransformer({
    name: 'test-transformer',
    transform: input => ({
      role: input.document.rootNode.attributes.get('role'),
      content: input.document.rootNode.content,
    }),
  });

  // 3. 创建 DPML 实例
  const dpml = createDPML({
    schema,
    transformers: [transformer],
  });

  // 4. 编译 DPML 内容
  const result = await dpml.compile('<prompt role="assistant">Hello</prompt>');
  console.log('Result:', result);
  // { role: 'assistant', content: 'Hello' }

  console.log('Installation verified!');
}

main().catch(console.error);
```

运行测试：

```bash
# 使用 Bun
bun run test.ts

# 使用 Node.js（需要 tsx）
npx tsx test.ts
```

如果看到输出 `Installation verified!`，说明安装成功。

## 开发环境设置

如果你想参与 DPML 开发或查看源码：

```bash
# 克隆仓库
git clone https://github.com/Deepractice/dpml.git
cd dpml

# 安装依赖
bun install

# 构建所有包
bun run build

# 运行测试
bun run test
bun run test:bdd
```

### 项目结构

```
dpml/
├── packages/
│   ├── core/          # 核心库
│   └── dpml/          # 公共 API 包
├── bdd/               # BDD 测试
│   ├── features/      # Gherkin 特性文件
│   └── steps/         # 步骤定义
└── specs/             # 语言规范
```

## 下一步

- [快速开始](./quick-start.md) - 创建你的第一个 DPML 应用
- [介绍](./introduction.md) - 了解核心概念
