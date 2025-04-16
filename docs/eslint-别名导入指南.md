# 别名导入指南

## 概述

为了提高代码可维护性和可读性，我们强制使用别名导入（alias import）代替复杂的相对路径导入。这份指南将帮助你理解如何正确使用别名导入。

## 为什么使用别名导入

- **可读性更好**：`@core/utils/helper` 比 `../../../../utils/helper` 更直观
- **移动文件更容易**：当移动文件时，不需要调整相对路径
- **减少错误**：避免因路径层级计算错误导致的问题
- **代码组织更清晰**：明确标识了模块来源

## 别名配置

每个包都配置了自己的别名前缀，对应到该包的 `src` 目录：

| 包名 | 别名前缀 | 对应路径 |
|------|---------|---------|
| core | @core/ | packages/core/src/ |
| prompt | @prompt/ | packages/prompt/src/ |
| agent | @agent/ | packages/agent/src/ |
| workflow | @workflow/ | packages/workflow/src/ |
| common | @common/ | packages/common/src/ |
| cli | @cli/ | packages/cli/src/ |

## 如何使用

### 错误示例（不要这样做）：

```typescript
// 不要使用相对路径导入
import { Parser } from '../../../core/parser';
import { TagRegistry } from '../../core/parser/TagRegistry';
```

### 正确示例：

```typescript
// 使用别名导入
import { Parser } from '@core/parser';
import { TagRegistry } from '@core/parser/TagRegistry';
```

## 针对不同场景

### 同一个包内部导入

```typescript
// 在 packages/core/src/utils/helper.ts 中导入 packages/core/src/parser/index.ts
import { Parser } from '@core/parser';
```

### 跨包导入

```typescript
// 在 packages/prompt/src/processor.ts 中导入 packages/core/src/parser/index.ts
import { Parser } from '@dpml/core'; // 使用NPM包名导入其他包
```

## ESLint 规则

我们配置了 ESLint 规则来强制使用别名导入：

- `import/no-relative-parent-imports`: 禁止使用相对父级路径导入
- `no-restricted-imports`: 禁止使用 `../` 开头的相对路径导入

如果你看到以下错误：

```
请使用别名导入代替相对路径导入。例如：import { foo } from "@core/utils/helper" 替代 import { foo } from "../../utils/helper"
```

请根据本指南修改你的导入语句。

## IDE 支持

在大多数 IDE 中，配置了 `tsconfig.json` 后，别名导入会有自动完成和导航支持：

- **VS Code**: 自动支持 tsconfig.json 中的路径映射
- **WebStorm/IntelliJ IDEA**: 自动识别 tsconfig.json 中的别名配置
- **Vim/NeoVim**: 使用 typescript 语言服务器插件可获得支持

## 常见问题

### Q: 我的测试文件中使用别名导入报错怎么办？
A: 确保你的测试配置（如 vitest.config.ts）也包含了相同的别名配置。

### Q: 我需要导入非 src 目录下的文件怎么办？
A: 对于非 src 目录下的文件，可以使用相对路径导入，但应尽量保持在同级或下级目录内。 