# DPML 完整工作流示例

本目录包含DPML完整工作流的示例代码，展示如何使用`@dpml/core`包实现从解析到输出的完整处理流程。

## 示例文件

- `prompt-processing.ts`: 完整的提示处理流程示例
- `error-handling.ts`: 错误处理与恢复示例
- `custom-workflow.ts`: 自定义工作流程示例
- `templates/`: 模板文件目录
  - `base-prompt.xml`: 基础提示模板
  - `context-template.xml`: 上下文模板

## 示例说明

### 完整提示处理流程

```typescript
// prompt-processing.ts
import { 
  parse, 
  process, 
  DefaultTransformer, 
  TagRegistry,
  Element, 
  Content, 
  ProcessingContext,
  TagProcessor
} from '@dpml/core';
import * as fs from 'fs/promises';
import * as path from 'path';

// 1. 定义和注册自定义标签
function setupTagRegistry() {
  const registry = new TagRegistry();
  
  // 注册prompt标签
  registry.registerTag('prompt', {
    attributes: {
      id: { type: 'string', required: true },
      model: { type: 'string', required: false },
      temperature: { type: 'number', required: false }
    },
    allowedChildren: ['role', 'context', 'thinking', 'executing']
  });
  
  // 注册role标签
  registry.registerTag('role', {
    attributes: {
      name: { type: 'string', required: true },
      expertise: { type: 'string', required: false }
    },
    allowedChildren: []
  });
  
  // 注册其他标签...
  registry.registerTag('context', {
    attributes: {
      domain: { type: 'string', required: false }
    },
    allowedChildren: []
  });
  
  registry.registerTag('thinking', {
    attributes: {},
    allowedChildren: ['code']
  });
  
  registry.registerTag('executing', {
    attributes: {
      language: { type: 'string', required: false }
    },
    allowedChildren: ['code']
  });
  
  registry.registerTag('code', {
    attributes: {
      language: { type: 'string', required: false }
    },
    allowedChildren: []
  });
  
  return registry;
}

// 2. 创建自定义标签处理器
class RoleTagProcessor implements TagProcessor {
  canProcess(element: Element): boolean {
    return element.tagName === 'role';
  }
  
  async process(element: Element, context: ProcessingContext): Promise<Element> {
    // 提取角色信息
    const name = element.attributes.name;
    const expertise = element.attributes.expertise || '通用';
    
    // 添加到元数据
    element.metadata = element.metadata || {};
    element.metadata.roleInfo = { name, expertise };
    
    // 处理文档级别语义
    const doc = context.getDocument();
    doc.semantics = doc.semantics || {};
    doc.semantics.roles = doc.semantics.roles || [];
    doc.semantics.roles.push({ name, expertise });
    
    return element;
  }
  
  priority = 10;
}

// 3. 创建引用解析器
class FileReferenceResolver {
  constructor(private basePath: string) {}
  
  async resolveReference(reference: any, context: ProcessingContext): Promise<any> {
    if (reference.protocol === 'file') {
      try {
        const filePath = path.resolve(this.basePath, reference.path);
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
      } catch (error) {
        throw new Error(`无法读取文件: ${reference.path}`);
      }
    }
    return null;
  }
}

// 4. 创建转换器
class MarkdownTransformer extends DefaultTransformer<string> {
  visitElement(element: Element): string {
    switch (element.tagName) {
      case 'prompt':
        return `# ${element.attributes.id}\n\n${this.processChildren(element).join('')}`;
      
      case 'role':
        return `## 角色: ${element.attributes.name}\n\n${this.processChildren(element).join('')}\n\n`;
      
      case 'context':
        return `## 上下文\n\n${this.processChildren(element).join('')}\n\n`;
      
      case 'thinking':
        return `## 思考过程\n\n${this.processChildren(element).join('')}\n\n`;
      
      case 'executing':
        return `## 执行\n\n${this.processChildren(element).join('')}\n\n`;
      
      case 'code':
        const language = element.attributes.language || '';
        return `\`\`\`${language}\n${this.processChildren(element).join('')}\n\`\`\`\n\n`;
      
      default:
        return this.processChildren(element).join('');
    }
  }
  
  visitContent(content: Content): string {
    return content.value;
  }
  
  transform(doc: any): string {
    return this.visit(doc);
  }
}

// 5. 完整处理流程
async function processDPML(dpmlText: string, options: any = {}): Promise<string> {
  try {
    // 设置标签注册表
    const registry = setupTagRegistry();
    
    // 创建处理上下文
    const context = new ProcessingContext({
      processors: [new RoleTagProcessor()],
      referenceResolvers: [new FileReferenceResolver(options.basePath || '.')]
    });
    
    // 解析DPML文本
    const parseResult = await parse(dpmlText, {
      tagRegistry: registry,
      allowUnknownTags: false,
      validate: true
    });
    
    // 处理AST
    const processedDoc = await process(parseResult.ast, {
      strictMode: options.strictMode !== false,
      errorRecovery: options.errorRecovery === true,
      basePath: options.basePath || '.'
    }, context);
    
    // 转换为目标格式
    const transformer = new MarkdownTransformer();
    return transformer.transform(processedDoc);
  } catch (error) {
    console.error('处理DPML时出错:', error);
    throw error;
  }
}

// 主函数
async function main() {
  try {
    // 读取DPML文件
    const dpmlText = await fs.readFile('examples/core/complete-workflow/templates/base-prompt.xml', 'utf-8');
    
    // 处理DPML
    const output = await processDPML(dpmlText, {
      basePath: 'examples/core/complete-workflow/templates',
      strictMode: true,
      errorRecovery: true
    });
    
    // 输出结果
    console.log('处理结果:');
    console.log(output);
    
    // 保存结果
    await fs.writeFile('examples/core/complete-workflow/output.md', output);
    console.log('结果已保存到 examples/core/complete-workflow/output.md');
  } catch (error) {
    console.error('执行失败:', error);
  }
}

// 运行示例
main();
```

### 错误处理流程

```typescript
// error-handling.ts
import { 
  parse, 
  process, 
  DPMLError, 
  ErrorCodes 
} from '@dpml/core';

// 错误处理示例
async function errorHandlingExample() {
  // 包含错误的DPML文本
  const invalidDpmlText = `
    <prompt id="example">
      <unknown-tag>未知标签</unknown-tag>
      <role>缺少必需的name属性</role>
      <context
        未闭合的标签属性
      </context>
    </prompt>
  `;
  
  try {
    // 尝试解析
    const parseResult = await parse(invalidDpmlText, {
      allowUnknownTags: false,  // 不允许未知标签
      validate: true,           // 启用验证
      tolerant: false           // 错误时停止解析
    });
    
    // 如果没有抛出错误但有警告
    if (parseResult.warnings.length > 0) {
      console.log('解析警告:');
      parseResult.warnings.forEach(warning => {
        console.log(`- ${warning.message} (位置: 行 ${warning.location?.line}, 列 ${warning.location?.column})`);
      });
    }
    
    // 继续处理
    const processedDoc = await process(parseResult.ast);
    console.log('处理成功:', processedDoc);
  } catch (error) {
    // 处理DPML特定错误
    if (error instanceof DPMLError) {
      console.error(`DPML错误 (${error.code}): ${error.message}`);
      
      // 根据错误类型提供特定处理
      switch (error.code) {
        case ErrorCodes.PARSE_ERROR:
          console.error('解析错误 - 请检查XML语法');
          break;
        
        case ErrorCodes.VALIDATION_ERROR:
          console.error('验证错误 - 请检查标签属性和结构');
          break;
        
        case ErrorCodes.UNKNOWN_TAG:
          console.error('未知标签 - 请检查标签名称或注册自定义标签');
          break;
        
        case ErrorCodes.REFERENCE_ERROR:
          console.error('引用错误 - 请检查引用路径或协议');
          break;
        
        default:
          console.error('其他DPML错误');
      }
      
      // 输出错误位置信息
      if (error.location) {
        console.error(`位置: 行 ${error.location.line}, 列 ${error.location.column}`);
      }
    } else {
      // 处理其他类型错误
      console.error('非DPML错误:', error);
    }
  }
}

// 运行错误处理示例
errorHandlingExample();
```

### 自定义工作流

```typescript
// custom-workflow.ts
import { parse, process, DefaultTransformer } from '@dpml/core';
import * as fs from 'fs/promises';

// 定义一个简单的配置接口
interface DPMLProcessorConfig {
  inputFile: string;
  outputFile: string;
  outputFormat: 'markdown' | 'json' | 'html';
  strictMode: boolean;
  basePath: string;
}

// 创建工作流管理类
class DPMLWorkflow {
  constructor(private config: DPMLProcessorConfig) {}
  
  // 执行完整工作流
  async execute(): Promise<void> {
    try {
      // 1. 读取输入文件
      const dpmlText = await fs.readFile(this.config.inputFile, 'utf-8');
      
      // 2. 解析DPML
      const parseResult = await parse(dpmlText, {
        allowUnknownTags: false,
        validate: true
      });
      
      // 3. 处理AST
      const processedDoc = await process(parseResult.ast, {
        strictMode: this.config.strictMode,
        basePath: this.config.basePath
      });
      
      // 4. 根据配置选择转换器
      let output: any;
      switch (this.config.outputFormat) {
        case 'markdown':
          output = await this.transformToMarkdown(processedDoc);
          break;
        
        case 'json':
          output = await this.transformToJSON(processedDoc);
          break;
        
        case 'html':
          output = await this.transformToHTML(processedDoc);
          break;
        
        default:
          throw new Error(`不支持的输出格式: ${this.config.outputFormat}`);
      }
      
      // 5. 写入输出文件
      await fs.writeFile(this.config.outputFile, output);
      
      console.log(`处理完成: ${this.config.inputFile} -> ${this.config.outputFile}`);
    } catch (error) {
      console.error('工作流执行失败:', error);
      throw error;
    }
  }
  
  // 转换为Markdown
  private async transformToMarkdown(doc: any): Promise<string> {
    const { MarkdownTransformer } = await import('./transformers/markdown-transformer');
    const transformer = new MarkdownTransformer();
    return transformer.transform(doc);
  }
  
  // 转换为JSON
  private async transformToJSON(doc: any): Promise<string> {
    const { JSONTransformer } = await import('./transformers/json-transformer');
    const transformer = new JSONTransformer();
    return JSON.stringify(transformer.transform(doc), null, 2);
  }
  
  // 转换为HTML
  private async transformToHTML(doc: any): Promise<string> {
    const { HTMLTransformer } = await import('./transformers/html-transformer');
    const transformer = new HTMLTransformer();
    return transformer.transform(doc);
  }
}

// 使用工作流
async function runWorkflow() {
  const config: DPMLProcessorConfig = {
    inputFile: 'examples/core/complete-workflow/templates/base-prompt.xml',
    outputFile: 'examples/core/complete-workflow/output.md',
    outputFormat: 'markdown',
    strictMode: true,
    basePath: 'examples/core/complete-workflow/templates'
  };
  
  const workflow = new DPMLWorkflow(config);
  await workflow.execute();
}

// 批量处理多个文件
async function batchProcess() {
  const files = [
    { input: 'template1.xml', output: 'output1.md', format: 'markdown' as const },
    { input: 'template2.xml', output: 'output2.json', format: 'json' as const },
    { input: 'template3.xml', output: 'output3.html', format: 'html' as const }
  ];
  
  const basePath = 'examples/core/complete-workflow/templates';
  
  for (const file of files) {
    const config: DPMLProcessorConfig = {
      inputFile: `${basePath}/${file.input}`,
      outputFile: `examples/core/complete-workflow/${file.output}`,
      outputFormat: file.format,
      strictMode: true,
      basePath
    };
    
    try {
      const workflow = new DPMLWorkflow(config);
      await workflow.execute();
    } catch (error) {
      console.error(`处理 ${file.input} 失败:`, error);
      // 继续处理下一个文件
    }
  }
  
  console.log('批量处理完成');
}

// 运行工作流示例
runWorkflow();
// 运行批量处理示例
// batchProcess();
```

## 运行示例

确保已安装依赖：

```bash
pnpm install
```

运行示例前，首先创建必要的模板文件：

```bash
mkdir -p examples/core/complete-workflow/templates
```

在`templates`目录中创建以下文件：

**base-prompt.xml**:
```xml
<prompt id="code-assistant">
  <role name="assistant" expertise="programming">
    我是一个代码助手，可以帮助用户编写和调试代码。
  </role>
  <context>
    用户正在使用TypeScript开发一个Web应用。
  </context>
  <thinking>
    我需要提供清晰的代码示例和解释。
    <code language="typescript">
      // 示例组件
      interface Props {
        title: string;
        content: string;
      }
      
      function ExampleComponent({ title, content }: Props) {
        return (
          <div>
            <h2>{title}</h2>
            <p>{content}</p>
          </div>
        );
      }
    </code>
  </thinking>
</prompt>
```

运行示例：

```bash
ts-node examples/core/complete-workflow/prompt-processing.ts
ts-node examples/core/complete-workflow/error-handling.ts
ts-node examples/core/complete-workflow/custom-workflow.ts
```

## 预期输出

完整处理流程示例将解析提示模板，应用处理逻辑，并生成一个格式化的Markdown文档。

错误处理示例将展示如何处理不同类型的DPML错误，并提供有用的错误信息。

自定义工作流示例将展示如何构建一个可配置的DPML处理工作流，支持不同的输入和输出格式。 