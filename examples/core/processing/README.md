# DPML 文档处理示例

本目录包含DPML文档处理的示例代码，展示如何使用`@dpml/core`包进行文档处理和语义分析。

## 示例文件

- `semantic-processing.ts`: 演示如何处理文档和进行语义分析
- `custom-tag-processor.ts`: 如何实现自定义标签处理器
- `reference-resolver.ts`: 如何实现引用解析
- `sample-dpml.xml`: 示例DPML文件

## 示例说明

### 基本文档处理

```typescript
// semantic-processing.ts
import { parse, process } from '@dpml/core';

// 基本文档处理
async function basicProcessing() {
  const dpmlText = `
    <prompt id="example">
      <role name="assistant">
        我是一个AI助手，我能回答问题。
      </role>
      <context>
        当前日期是2023年5月10日。
      </context>
    </prompt>
  `;

  try {
    // 1. 解析DPML文本
    const parseResult = await parse(dpmlText);
    
    // 2. 处理AST
    const processedDoc = await process(parseResult.ast);
    
    console.log('处理后的文档:', JSON.stringify(processedDoc, null, 2));
    
    // 访问处理后的元数据
    if (processedDoc.metadata) {
      console.log('文档元数据:', processedDoc.metadata);
    }
    
    // 访问语义信息
    if (processedDoc.semantics) {
      console.log('语义信息:', processedDoc.semantics);
    }
  } catch (error) {
    console.error('处理错误:', error);
  }
}

// 使用处理选项
async function processingWithOptions() {
  const dpmlText = `
    <prompt id="example">
      <include src="./context.xml" />
      <role name="assistant">
        我是一个AI助手
      </role>
    </prompt>
  `;

  try {
    // 1. 解析DPML文本
    const parseResult = await parse(dpmlText);
    
    // 2. 使用选项处理AST
    const processedDoc = await process(parseResult.ast, {
      strictMode: false,       // 非严格模式
      errorRecovery: true,     // 出错时继续处理
      basePath: './templates'  // 解析相对路径的基础目录
    });
    
    console.log('带选项处理的文档:', JSON.stringify(processedDoc, null, 2));
  } catch (error) {
    console.error('处理错误:', error);
  }
}

// 运行示例
basicProcessing();
processingWithOptions();
```

### 自定义标签处理器

```typescript
// custom-tag-processor.ts
import { TagProcessor, Element, ProcessingContext } from '@dpml/core';

// 创建角色标签处理器
class RoleTagProcessor implements TagProcessor {
  // 判断是否可以处理该元素
  canProcess(element: Element): boolean {
    return element.tagName === 'role';
  }
  
  // 处理元素
  async process(element: Element, context: ProcessingContext): Promise<Element> {
    // 提取角色信息
    const name = element.attributes.name || 'unknown';
    
    // 提取角色描述（文本内容）
    const description = element.children
      .filter(child => child.type === 'content')
      .map(child => (child as any).value)
      .join('');
    
    // 添加到元数据
    element.metadata = element.metadata || {};
    element.metadata.roleInfo = {
      name,
      description: description.trim()
    };
    
    // 将角色信息添加到文档语义中
    const doc = context.getDocument();
    doc.semantics = doc.semantics || {};
    doc.semantics.roles = doc.semantics.roles || [];
    doc.semantics.roles.push({
      name,
      description: description.trim()
    });
    
    return element;
  }
  
  // 设置优先级（影响处理顺序）
  priority = 10;
}

// 使用自定义处理器
async function useCustomProcessor() {
  const { parse, process, ProcessingContext } = await import('@dpml/core');
  
  const dpmlText = `
    <prompt id="example">
      <role name="assistant">
        我是一个AI助手，可以帮助用户解答问题。
      </role>
      <role name="user">
        我是用户，提出问题和要求。
      </role>
    </prompt>
  `;
  
  try {
    // 1. 解析DPML文本
    const parseResult = await parse(dpmlText);
    
    // 2. 创建处理上下文
    const context = new ProcessingContext({
      processors: [new RoleTagProcessor()]  // 注册自定义处理器
    });
    
    // 3. 处理AST
    const processedDoc = await process(parseResult.ast, {}, context);
    
    // 4. 查看处理结果
    console.log('处理后的角色信息:', processedDoc.semantics?.roles);
  } catch (error) {
    console.error('处理错误:', error);
  }
}

// 运行示例
useCustomProcessor();
```

### 引用解析

```typescript
// reference-resolver.ts
import { ReferenceResolver, Reference, ProcessingContext } from '@dpml/core';
import * as fs from 'fs/promises';
import * as path from 'path';

// 创建自定义引用解析器
class FileReferenceResolver implements ReferenceResolver {
  constructor(private basePath: string) {}
  
  async resolveReference(reference: Reference, context: ProcessingContext): Promise<any> {
    // 只处理文件协议
    if (reference.protocol === 'file') {
      try {
        const filePath = path.resolve(this.basePath, reference.path);
        // 读取文件内容
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
      } catch (error) {
        throw new Error(`无法读取文件: ${reference.path}, 错误: ${error.message}`);
      }
    }
    
    // 不支持其他协议
    return null;
  }
}

// 使用引用解析器
async function useReferenceResolver() {
  const { parse, process, ProcessingContext } = await import('@dpml/core');
  
  const dpmlText = `
    <prompt id="example">
      <include src="file:./templates/context.xml" />
      <role name="assistant">
        我是一个AI助手
      </role>
    </prompt>
  `;
  
  try {
    // 1. 解析DPML文本
    const parseResult = await parse(dpmlText);
    
    // 2. 创建处理上下文
    const context = new ProcessingContext({
      referenceResolvers: [new FileReferenceResolver('./examples/core')]
    });
    
    // 3. 处理AST
    const processedDoc = await process(parseResult.ast, {}, context);
    
    // 4. 查看处理结果
    console.log('处理后的文档:', JSON.stringify(processedDoc, null, 2));
  } catch (error) {
    console.error('处理错误:', error);
  }
}

// 运行示例
useReferenceResolver();
```

## 运行示例

确保已安装依赖：

```bash
pnpm install
```

运行示例：

```bash
ts-node examples/core/processing/semantic-processing.ts
ts-node examples/core/processing/custom-tag-processor.ts
ts-node examples/core/processing/reference-resolver.ts
```

## 预期输出

基本处理示例将输出处理后的文档结构，包括元数据和语义信息。

自定义标签处理器示例将提取角色信息并显示在语义数据中。

引用解析示例将演示如何从外部文件加载内容，并合并到文档中。 