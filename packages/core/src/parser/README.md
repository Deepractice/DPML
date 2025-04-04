# DPML Parser 模块设计

## 1. 设计理念

DPML解析器(Parser)模块负责将原始DPML文本转换为结构化的抽象语法树(AST)，是整个DPML处理流程的起点。解析器的设计遵循以下核心原则：

- **关注点分离**：明确区分XML解析、Markdown处理和AST构建
- **最小责任原则**：解析器只负责提取和识别，不执行深度语义处理
- **可扩展性**：提供钩子系统允许扩展解析行为
- **错误恢复**：提供清晰的错误提示和可能的恢复机制

## 2. 架构设计模式

Parser模块采用**接口-实现分离模式**，这种模式将接口定义与具体实现分离，有以下优势：

1. **灵活替换**：不同的实现可以互相替换，只要它们实现了同一接口
2. **测试便利**：可以使用模拟实现进行单元测试
3. **扩展性**：第三方可以提供自定义实现
4. **关注点分离**：接口定义了"做什么"，具体实现关注"怎么做"

```typescript
// 接口定义
export interface DPMLParser {
  parse(text: string, options?: ParseOptions): Promise<DPMLDocument>;
  registerHook(name: string, callback: HookCallback): void;
  setOptions(options: ParseOptions): void;
}

// 具体实现
export class DefaultDPMLParser implements DPMLParser {
  // 实现细节...
}

// 工厂函数
export function createParser(options?: CreateParserOptions): DPMLParser {
  return new DefaultDPMLParser(options);
}
```

使用这种模式，解析器可以有多种实现（如针对不同环境优化的版本），同时确保它们行为一致。

## 3. 模块结构

解析器模块组织为以下主要组件：

```
src/parser/
  ├── xml/               # XML解析相关
  │   ├── parser.ts      # XML解析器实现
  │   ├── validator.ts   # XML结构验证器
  │   └── normalizer.ts  # XML规范化处理
  ├── markdown/          # Markdown解析相关
  │   ├── parser.ts      # Markdown解析器
  │   ├── extractor.ts   # 引用提取器
  │   └── renderer.ts    # Markdown渲染器
  ├── ast/               # AST相关
  │   ├── builder.ts     # AST构建器
  │   ├── visitor.ts     # AST访问器
  │   └── transformer.ts # AST转换器
  ├── types.ts           # 解析器相关类型定义
  ├── parser.ts          # 主解析器类
  └── index.ts           # 解析器模块入口
```

## 4. 执行流程

DPML解析过程包含以下主要步骤：

```
输入 DPML 文本
    ↓
【预处理阶段】
  • 清理输入文本
  • 标准化换行符
  • 执行 beforeParse 钩子
    ↓
【XML解析阶段】
  • 解析XML标签结构
  • 提取标签属性
  • 验证基本XML结构
    ↓
【Markdown处理阶段】
  • 提取标签内Markdown内容
  • 基本Markdown解析
  • 识别并提取@引用（不解析）
    ↓
【AST构建阶段】
  • 创建统一的AST结构
  • 关联XML结构与Markdown内容
  • 建立节点间层次关系
    ↓
【后处理阶段】
  • 验证AST完整性
  • 执行 afterParse 钩子
  • 返回最终AST
```

## 5. @引用系统处理

针对DPML中的@引用系统，解析器采用"提取式"而非"解析式"的策略：

- **只提取不解析**：解析器仅负责识别和提取@引用的原始形式
- **保留完整信息**：在AST中保留引用的完整原始文本
- **延迟处理**：具体的引用解析和处理推迟到应用层执行

这种设计确保了：
1. 不同应用层可以实现自己的@引用解析逻辑
2. 解析器无需关心未来可能出现的新协议类型
3. 更好地符合DPML作为元规范的设计理念

## 6. 主要接口

解析器提供以下核心接口：

```typescript
// 主解析器接口
interface DPMLParser {
  parse(text: string, options?: ParseOptions): Promise<DPMLDocument>;
  registerHook(hookName: string, handler: HookHandler): void;
  setOptions(options: ParseOptions): void;
}

// 解析选项
interface ParseOptions {
  mode?: 'strict' | 'loose';  // 解析模式
  includePositionInfo?: boolean;  // 是否包含位置信息
  maxNestingLevel?: number;  // 最大嵌套层级
  // ...其他选项
}

// AST文档结构
interface DPMLDocument {
  type: 'document';
  version?: string;
  children: DPMLNode[];
  references?: string[];  // 原始引用列表，不解析
  // ...其他属性
}
```

## 7. 示例解析流程

输入DPML文本:
```xml
<prompt>
  <role name="user">
    如何使用**DPML**？
    请参考 @http://example.com/docs
  </role>
</prompt>
```

解析后的AST:
```javascript
{
  type: "document",
  children: [{
    type: "element",
    name: "prompt",
    attributes: {},
    children: [{
      type: "element",
      name: "role",
      attributes: { name: "user" },
      content: {
        type: "markdown",
        value: "如何使用**DPML**？\n请参考 @http://example.com/docs",
        references: ["@http://example.com/docs"]  // 仅提取原始形式
      }
    }]
  }]
}
```

## 8. 扩展点

解析器提供以下主要扩展点：

1. **解析钩子**：
   - `beforeParse`: 解析前执行
   - `afterParse`: 解析完成后执行 
   - `onTagFound`: 发现特定标签时执行
   - `onError`: 处理解析错误

2. **配置选项**：通过`ParseOptions`可以自定义解析行为，如严格/宽松模式等

3. **自定义验证器**：可以注册自定义验证规则，增强对特定结构的校验

## 9. 错误处理

解析器提供详细的错误报告机制：

- **结构化错误**：所有错误都包含类型、消息、位置信息
- **位置跟踪**：精确到行号和列号的错误定位
- **恢复策略**：在宽松模式下提供错误恢复机制
- **分类错误**：区分致命错误和警告

## 10. 性能考虑

解析器的性能优化策略：

- **懒加载**：按需加载各模块组件
- **流式处理**：支持大文档的流式解析
- **缓存机制**：缓存频繁使用的解析结果
- **可配置深度**：控制解析的深度和复杂度

---

该设计确保了DPML解析器既能高效处理各种DPML文档，同时为不同的应用层实现提供了最大的灵活性和扩展性。 