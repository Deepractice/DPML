# DPML 转换器示例

本目录包含DPML转换器的示例代码，展示如何使用`@dpml/core`包创建自定义转换器，将处理后的文档转换为不同格式。

## 示例文件

- `markdown-transformer.ts`: 演示将DPML转换为Markdown格式
- `json-transformer.ts`: 演示将DPML转换为JSON格式
- `custom-transformer.ts`: 创建自定义转换器
- `sample-dpml.xml`: 示例DPML文件

## 示例说明

### Markdown转换器

```typescript
// markdown-transformer.ts
import { parse, process, DefaultTransformer, Element, Content } from '@dpml/core';

// 创建Markdown转换器
class MarkdownTransformer extends DefaultTransformer<string> {
  // 处理元素节点
  visitElement(element: Element): string {
    // 根据标签名处理不同类型的元素
    switch (element.tagName) {
      case 'prompt':
        return `# ${element.attributes.id || '提示'}\n\n${this.processChildren(element).join('')}`;
      
      case 'role':
        return `## 角色: ${element.attributes.name || '未命名'}\n\n${this.processChildren(element).join('')}\n\n`;
      
      case 'context':
        return `## 上下文\n\n${this.processChildren(element).join('')}\n\n`;
      
      case 'thinking':
        return `## 思考过程\n\n${this.processChildren(element).join('')}\n\n`;
      
      case 'code':
        const language = element.attributes.language || '';
        return `\`\`\`${language}\n${this.processChildren(element).join('')}\n\`\`\`\n\n`;
      
      // 处理其他元素
      default:
        return this.processChildren(element).join('');
    }
  }
  
  // 处理文本内容
  visitContent(content: Content): string {
    // 直接返回文本内容
    return content.value;
  }
  
  // 转换方法
  transform(doc: any): string {
    return this.visit(doc);
  }
}

// 使用Markdown转换器
async function useMarkdownTransformer() {
  const dpmlText = `
    <prompt id="example-prompt">
      <role name="assistant">
        我是一个AI助手，可以回答用户的问题。
      </role>
      <context>
        当前是技术支持对话。
      </context>
      <thinking>
        我需要提供专业、友好的回答。
        <code language="javascript">
          // 示例代码
          function greeting() {
            return "Hello, world!";
          }
        </code>
      </thinking>
    </prompt>
  `;
  
  try {
    // 1. 解析DPML文本
    const { ast } = await parse(dpmlText);
    
    // 2. 处理AST
    const processedDoc = await process(ast);
    
    // 3. 使用转换器
    const transformer = new MarkdownTransformer();
    const markdown = transformer.transform(processedDoc);
    
    console.log('转换后的Markdown:');
    console.log(markdown);
  } catch (error) {
    console.error('转换错误:', error);
  }
}

// 运行示例
useMarkdownTransformer();
```

### JSON转换器

```typescript
// json-transformer.ts
import { parse, process, DefaultTransformer, Element, Content } from '@dpml/core';

// 创建JSON转换器
class JSONTransformer extends DefaultTransformer<any> {
  // 处理元素节点
  visitElement(element: Element): any {
    // 创建结果对象
    const result: any = {
      type: element.tagName,
      attributes: { ...element.attributes }
    };
    
    // 处理子元素
    const children = this.processChildren(element);
    
    // 如果只有文本内容，则直接设置为content字段
    if (children.length === 1 && typeof children[0] === 'string') {
      result.content = children[0];
    } 
    // 否则，将子元素添加到children字段
    else if (children.length > 0) {
      result.children = children;
    }
    
    // 添加元数据（如果有）
    if (element.metadata) {
      result.metadata = { ...element.metadata };
    }
    
    return result;
  }
  
  // 处理文本内容
  visitContent(content: Content): string {
    return content.value;
  }
  
  // 转换方法
  transform(doc: any): any {
    return this.visit(doc);
  }
}

// 使用JSON转换器
async function useJSONTransformer() {
  const dpmlText = `
    <prompt id="example-prompt">
      <role name="assistant">
        我是一个AI助手
      </role>
      <context>技术支持对话</context>
    </prompt>
  `;
  
  try {
    // 1. 解析DPML文本
    const { ast } = await parse(dpmlText);
    
    // 2. 处理AST
    const processedDoc = await process(ast);
    
    // 3. 使用转换器
    const transformer = new JSONTransformer();
    const json = transformer.transform(processedDoc);
    
    console.log('转换后的JSON:');
    console.log(JSON.stringify(json, null, 2));
  } catch (error) {
    console.error('转换错误:', error);
  }
}

// 运行示例
useJSONTransformer();
```

### 自定义转换器

```typescript
// custom-transformer.ts
import { parse, process, DefaultTransformer, Element, Content } from '@dpml/core';

// 创建自定义转换器 - 转换为HTML格式
class HTMLTransformer extends DefaultTransformer<string> {
  // 处理元素节点
  visitElement(element: Element): string {
    // 添加HTML属性
    const attrs = Object.entries(element.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    // 处理不同类型的标签
    switch (element.tagName) {
      case 'prompt':
        return `<div class="prompt" ${attrs}>${this.processChildren(element).join('')}</div>`;
      
      case 'role':
        return `<div class="role" ${attrs}><h3>${element.attributes.name || '未命名'}</h3>${this.processChildren(element).join('')}</div>`;
      
      case 'context':
        return `<div class="context" ${attrs}><h3>上下文</h3>${this.processChildren(element).join('')}</div>`;
      
      case 'thinking':
        return `<div class="thinking" ${attrs}><h3>思考过程</h3>${this.processChildren(element).join('')}</div>`;
      
      case 'code':
        const language = element.attributes.language || '';
        return `<pre class="code" data-language="${language}"><code>${this.escapeHTML(this.processChildren(element).join(''))}</code></pre>`;
      
      // 处理其他元素 - 创建通用div
      default:
        return `<div class="${element.tagName}" ${attrs}>${this.processChildren(element).join('')}</div>`;
    }
  }
  
  // 处理文本内容
  visitContent(content: Content): string {
    // 对普通文本内容进行HTML转义
    return this.escapeHTML(content.value);
  }
  
  // 辅助方法：HTML转义
  escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  // 转换方法
  transform(doc: any): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>DPML转HTML</title>
  <style>
    .prompt { margin: 20px; }
    .role { border: 1px solid #ccc; margin: 10px 0; padding: 10px; }
    .context { background-color: #f0f0f0; padding: 10px; }
    .thinking { background-color: #ffffcc; padding: 10px; }
    .code { background-color: #2d2d2d; color: white; padding: 15px; overflow-x: auto; }
  </style>
</head>
<body>
  ${this.visit(doc)}
</body>
</html>`;
  }
}

// 使用自定义HTML转换器
async function useHTMLTransformer() {
  const dpmlText = `
    <prompt id="example-prompt">
      <role name="assistant">
        我是一个AI助手，可以回答各种问题。
      </role>
      <context>
        用户正在询问如何使用JavaScript。
      </context>
      <thinking>
        我将提供JavaScript的基础示例。
        <code language="javascript">
          // Hello world示例
          console.log("Hello, world!");
          
          // 基础函数
          function add(a, b) {
            return a + b;
          }
        </code>
      </thinking>
    </prompt>
  `;
  
  try {
    // 1. 解析DPML文本
    const { ast } = await parse(dpmlText);
    
    // 2. 处理AST
    const processedDoc = await process(ast);
    
    // 3. 使用转换器
    const transformer = new HTMLTransformer();
    const html = transformer.transform(processedDoc);
    
    console.log('转换后的HTML:');
    console.log(html);
    
    // 保存到文件
    const fs = require('fs');
    fs.writeFileSync('examples/core/transformers/output.html', html);
    console.log('HTML已保存到 examples/core/transformers/output.html');
  } catch (error) {
    console.error('转换错误:', error);
  }
}

// 运行示例
useHTMLTransformer();
```

## 运行示例

确保已安装依赖：

```bash
pnpm install
```

运行示例：

```bash
ts-node examples/core/transformers/markdown-transformer.ts
ts-node examples/core/transformers/json-transformer.ts
ts-node examples/core/transformers/custom-transformer.ts
```

## 预期输出

Markdown转换器示例将输出格式化的Markdown文本。

JSON转换器示例将输出结构化的JSON对象，可用于进一步处理或存储。

自定义HTML转换器示例将生成完整的HTML页面，并保存到`output.html`文件，可以在浏览器中查看。 