# 集成指南

本指南介绍如何将 DPML 集成到各种应用场景中，包括与 AI 工具、构建系统和生产环境的集成。

## 概述

DPML 可以集成到多种场景：

- **AI 应用**：生成 LLM prompt 配置
- **构建工具**：预编译 DPML 文档
- **服务端应用**：动态处理 prompt 模板
- **CLI 工具**：命令行 prompt 处理

## 与 AI 工具集成

### OpenAI API 集成

将 DPML 文档转换为 OpenAI Chat Completion API 格式：

```typescript
import { createDPML, defineSchema, defineTransformer } from 'dpml';
import OpenAI from 'openai';

// 定义 prompt schema
const promptSchema = defineSchema({
  element: 'prompt',
  attributes: [
    { name: 'model', type: 'string' },
    { name: 'temperature', type: 'string' },
  ],
  children: {
    elements: [
      { element: 'system' },
      { element: 'user' },
      { element: 'assistant' },
    ],
  },
});

// OpenAI 格式转换器
interface OpenAIConfig {
  model: string;
  temperature: number;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

const openAITransformer = defineTransformer<any, OpenAIConfig>({
  name: 'openai-transformer',
  transform: (input) => {
    const rootNode = input.document.rootNode;
    const messages: OpenAIConfig['messages'] = [];

    for (const child of rootNode.children) {
      if (['system', 'user', 'assistant'].includes(child.tagName)) {
        messages.push({
          role: child.tagName as 'system' | 'user' | 'assistant',
          content: child.content.trim(),
        });
      }
    }

    return {
      model: rootNode.attributes.get('model') || 'gpt-4',
      temperature: parseFloat(rootNode.attributes.get('temperature') || '0.7'),
      messages,
    };
  },
});

// 创建 DPML 实例
const dpml = createDPML({
  schema: promptSchema,
  transformers: [openAITransformer],
});

// 使用示例
async function chat(promptContent: string, userMessage: string) {
  const config = await dpml.compile<OpenAIConfig>(promptContent);

  // 添加用户消息
  config.messages.push({ role: 'user', content: userMessage });

  const openai = new OpenAI();
  const response = await openai.chat.completions.create(config);

  return response.choices[0].message.content;
}

// DPML 文档
const prompt = `
<prompt model="gpt-4" temperature="0.7">
  <system>You are a helpful coding assistant.</system>
</prompt>
`;

const response = await chat(prompt, 'How do I write a hello world in Python?');
```

### Anthropic Claude 集成

为 Claude API 生成配置：

```typescript
import Anthropic from '@anthropic-ai/sdk';

interface ClaudeConfig {
  model: string;
  max_tokens: number;
  system: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

const claudeTransformer = defineTransformer<any, ClaudeConfig>({
  name: 'claude-transformer',
  transform: (input) => {
    const rootNode = input.document.rootNode;
    let systemPrompt = '';
    const messages: ClaudeConfig['messages'] = [];

    for (const child of rootNode.children) {
      if (child.tagName === 'system') {
        systemPrompt = child.content.trim();
      } else if (['user', 'assistant'].includes(child.tagName)) {
        messages.push({
          role: child.tagName as 'user' | 'assistant',
          content: child.content.trim(),
        });
      }
    }

    return {
      model: rootNode.attributes.get('model') || 'claude-3-opus-20240229',
      max_tokens: parseInt(rootNode.attributes.get('max-tokens') || '4096'),
      system: systemPrompt,
      messages,
    };
  },
});

async function askClaude(promptContent: string, userMessage: string) {
  const dpml = createDPML({
    schema: promptSchema,
    transformers: [claudeTransformer],
  });

  const config = await dpml.compile<ClaudeConfig>(promptContent);
  config.messages.push({ role: 'user', content: userMessage });

  const anthropic = new Anthropic();
  const response = await anthropic.messages.create(config);

  return response.content[0].text;
}
```

### 使用 Resource 引用外部 Prompt

利用 DPML 内置的 resource 功能引用外部资源：

```typescript
import { createDPML, defineSchema } from 'dpml';
import type { ResourceResult } from 'dpml';

const schema = defineSchema({
  element: 'prompt',
});

const dpml = createDPML({ schema, transformers: [] });

// 编译包含资源引用的文档
const result = await dpml.compile<ResourceResult>(`
  <prompt>
    <system>You are a helpful assistant.</system>
    <resource src="arp:text:file://./prompts/coding-rules.md"/>
    <resource src="arp:text:file://./prompts/style-guide.md"/>
  </prompt>
`);

// 处理资源引用
for (const resource of result.resources) {
  console.log(`Resource: ${resource.src}`);
  console.log(`Protocol: ${resource.protocol}`); // 'arp' 或 'rxl'

  // 根据协议加载资源内容
  if (resource.protocol === 'arp') {
    // 使用 ARP 协议加载
    // const content = await loadArpResource(resource.src);
  } else if (resource.protocol === 'rxl') {
    // 使用 ResourceX 加载
    // const content = await registry.resolve(resource.src);
  }
}
```

## 与构建工具集成

### Vite 插件

创建 Vite 插件处理 .dpml 文件：

```typescript
// vite-plugin-dpml.ts
import { createDPML, defineSchema, defineTransformer } from 'dpml';
import type { Plugin } from 'vite';

export function dpmlPlugin(options: { schema: any }): Plugin {
  const dpml = createDPML({
    schema: options.schema,
    transformers: [
      defineTransformer({
        name: 'json-exporter',
        transform: (input) => ({
          document: input.document,
          isValid: input.isValid,
        }),
      }),
    ],
  });

  return {
    name: 'vite-plugin-dpml',

    transform(code, id) {
      if (!id.endsWith('.dpml')) {
        return null;
      }

      // 同步验证
      const validation = dpml.validate(code);
      if (!validation.isValid) {
        throw new Error(
          `DPML validation failed in ${id}: ${validation.errors.map(e => e.message).join(', ')}`
        );
      }

      // 返回 JavaScript 模块
      return {
        code: `export default ${JSON.stringify(dpml.parse(code))}`,
        map: null,
      };
    },
  };
}

// vite.config.ts
import { defineConfig } from 'vite';
import { dpmlPlugin } from './vite-plugin-dpml';
import { defineSchema } from 'dpml';

export default defineConfig({
  plugins: [
    dpmlPlugin({
      schema: defineSchema({ element: 'prompt' }),
    }),
  ],
});
```

### esbuild 插件

```typescript
// esbuild-plugin-dpml.ts
import { createDPML, defineSchema } from 'dpml';
import type { Plugin } from 'esbuild';
import fs from 'fs';

export function dpmlPlugin(options: { schema: any }): Plugin {
  const dpml = createDPML({
    schema: options.schema,
    transformers: [],
  });

  return {
    name: 'dpml',
    setup(build) {
      build.onLoad({ filter: /\.dpml$/ }, async (args) => {
        const content = await fs.promises.readFile(args.path, 'utf8');

        const validation = dpml.validate(content);
        if (!validation.isValid) {
          return {
            errors: validation.errors.map(e => ({
              text: e.message,
              location: e.location ? {
                file: args.path,
                line: e.location.startLine,
                column: e.location.startColumn,
              } : undefined,
            })),
          };
        }

        const document = dpml.parse(content);

        return {
          contents: `export default ${JSON.stringify(document)}`,
          loader: 'js',
        };
      });
    },
  };
}
```

### 预编译脚本

创建构建脚本预编译所有 DPML 文件：

```typescript
// scripts/build-prompts.ts
import { createDPML, defineSchema, defineTransformer } from 'dpml';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';

const schema = defineSchema({
  element: 'prompt',
  attributes: [
    { name: 'id', required: true },
    { name: 'version', type: 'string' },
  ],
});

const dpml = createDPML({
  schema,
  transformers: [
    defineTransformer({
      name: 'prompt-extractor',
      transform: (input) => {
        const root = input.document.rootNode;
        return {
          id: root.attributes.get('id'),
          version: root.attributes.get('version') || '1.0.0',
          content: root.content.trim(),
          children: root.children.map(c => ({
            tag: c.tagName,
            content: c.content.trim(),
          })),
        };
      },
    }),
  ],
});

async function buildPrompts() {
  const files = await glob('src/prompts/**/*.dpml');
  const prompts: Record<string, any> = {};

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');

    try {
      const result = await dpml.compile(content);
      prompts[result.id] = result;
      console.log(`Compiled: ${file} -> ${result.id}`);
    } catch (error) {
      console.error(`Failed to compile ${file}:`, error.message);
      process.exit(1);
    }
  }

  // 输出为 JSON
  await fs.writeFile(
    'dist/prompts.json',
    JSON.stringify(prompts, null, 2)
  );

  // 输出为 TypeScript
  await fs.writeFile(
    'dist/prompts.ts',
    `export const prompts = ${JSON.stringify(prompts, null, 2)} as const;`
  );

  console.log(`Built ${Object.keys(prompts).length} prompts`);
}

buildPrompts();
```

## 生产环境最佳实践

### 缓存编译结果

避免重复编译相同的文档：

```typescript
import { createDPML, defineSchema } from 'dpml';
import crypto from 'crypto';

class DPMLCache {
  private cache = new Map<string, any>();
  private dpml: ReturnType<typeof createDPML>;

  constructor(schema: any, transformers: any[]) {
    this.dpml = createDPML({ schema, transformers });
  }

  private hash(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  async compile<T>(content: string): Promise<T> {
    const key = this.hash(content);

    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    const result = await this.dpml.compile<T>(content);
    this.cache.set(key, result);

    return result;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// 使用
const dpmlCache = new DPMLCache(schema, transformers);

// 相同内容只编译一次
const result1 = await dpmlCache.compile(promptContent);
const result2 = await dpmlCache.compile(promptContent); // 从缓存返回
```

### 错误监控

在生产环境中监控编译错误：

```typescript
import { createDPML, defineSchema } from 'dpml';

interface CompileError {
  timestamp: Date;
  content: string;
  errors: string[];
  stack?: string;
}

class MonitoredDPML {
  private dpml: ReturnType<typeof createDPML>;
  private errors: CompileError[] = [];
  private onError?: (error: CompileError) => void;

  constructor(
    schema: any,
    transformers: any[],
    options?: { onError?: (error: CompileError) => void }
  ) {
    this.dpml = createDPML({ schema, transformers });
    this.onError = options?.onError;
  }

  async compile<T>(content: string): Promise<T | null> {
    try {
      // 先验证
      const validation = this.dpml.validate(content);
      if (!validation.isValid) {
        const error: CompileError = {
          timestamp: new Date(),
          content: content.substring(0, 500), // 截断
          errors: validation.errors.map(e => e.message),
        };

        this.errors.push(error);
        this.onError?.(error);

        return null;
      }

      return await this.dpml.compile<T>(content);
    } catch (err) {
      const error: CompileError = {
        timestamp: new Date(),
        content: content.substring(0, 500),
        errors: [err instanceof Error ? err.message : 'Unknown error'],
        stack: err instanceof Error ? err.stack : undefined,
      };

      this.errors.push(error);
      this.onError?.(error);

      return null;
    }
  }

  getRecentErrors(count = 10): CompileError[] {
    return this.errors.slice(-count);
  }
}

// 使用
const dpml = new MonitoredDPML(schema, transformers, {
  onError: (error) => {
    // 发送到监控系统
    console.error('DPML compile error:', error);
    // metrics.increment('dpml.compile.error');
    // logger.error('DPML compile error', error);
  },
});
```

### 性能优化

```typescript
// 1. 使用单例 DPML 实例
const dpmlInstance = createDPML({ schema, transformers });

// 不要在每次调用时创建新实例
// 错误：const dpml = createDPML(...); await dpml.compile(content);

// 2. 批量处理
async function compileAll(contents: string[]): Promise<any[]> {
  return Promise.all(contents.map(c => dpmlInstance.compile(c)));
}

// 3. 预热
async function warmup() {
  // 预编译常用模板
  const commonTemplates = ['template1.dpml', 'template2.dpml'];
  for (const template of commonTemplates) {
    await dpmlInstance.compile(await loadTemplate(template));
  }
}
```

### 类型安全的 API

创建类型安全的 prompt 管理 API：

```typescript
// types.ts
export interface PromptTemplate {
  id: string;
  version: string;
  content: string;
  metadata: {
    author?: string;
    description?: string;
    tags?: string[];
  };
}

export interface CompiledPrompt {
  messages: Array<{ role: string; content: string }>;
  config: {
    model: string;
    temperature: number;
  };
}

// prompt-service.ts
import { createDPML, defineSchema, defineTransformer } from 'dpml';

export class PromptService {
  private dpml: ReturnType<typeof createDPML>;
  private templates = new Map<string, PromptTemplate>();

  constructor() {
    const schema = defineSchema({
      element: 'prompt',
      attributes: [
        { name: 'id', required: true },
        { name: 'model', type: 'string' },
        { name: 'temperature', type: 'string' },
      ],
    });

    const transformer = defineTransformer<any, CompiledPrompt>({
      name: 'prompt-compiler',
      transform: (input) => {
        const root = input.document.rootNode;
        return {
          messages: root.children
            .filter(c => ['system', 'user', 'assistant'].includes(c.tagName))
            .map(c => ({
              role: c.tagName,
              content: c.content.trim(),
            })),
          config: {
            model: root.attributes.get('model') || 'gpt-4',
            temperature: parseFloat(root.attributes.get('temperature') || '0.7'),
          },
        };
      },
    });

    this.dpml = createDPML({ schema, transformers: [transformer] });
  }

  async registerTemplate(template: PromptTemplate): Promise<void> {
    // 验证模板
    const validation = this.dpml.validate(template.content);
    if (!validation.isValid) {
      throw new Error(`Invalid template: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    this.templates.set(template.id, template);
  }

  async getPrompt(id: string, variables?: Record<string, string>): Promise<CompiledPrompt> {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }

    let content = template.content;

    // 变量替换
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    }

    return this.dpml.compile<CompiledPrompt>(content);
  }

  listTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }
}

// 使用
const promptService = new PromptService();

await promptService.registerTemplate({
  id: 'coding-assistant',
  version: '1.0.0',
  content: `
    <prompt id="coding-assistant" model="gpt-4" temperature="0.3">
      <system>You are an expert {{language}} programmer.</system>
    </prompt>
  `,
  metadata: {
    author: 'team',
    description: 'Coding assistant prompt',
    tags: ['coding', 'assistant'],
  },
});

const prompt = await promptService.getPrompt('coding-assistant', {
  language: 'TypeScript',
});
```

## 测试集成

### 单元测试

```typescript
import { describe, it, expect } from 'vitest';
import { createDPML, defineSchema, defineTransformer } from 'dpml';

describe('DPML Integration', () => {
  const schema = defineSchema({
    element: 'prompt',
    attributes: [{ name: 'role', required: true }],
  });

  const transformer = defineTransformer({
    name: 'test-transformer',
    transform: (input) => ({
      role: input.document.rootNode.attributes.get('role'),
      content: input.document.rootNode.content.trim(),
    }),
  });

  const dpml = createDPML({ schema, transformers: [transformer] });

  it('should compile valid document', async () => {
    const result = await dpml.compile(`
      <prompt role="assistant">Hello World</prompt>
    `);

    expect(result.role).toBe('assistant');
    expect(result.content).toBe('Hello World');
  });

  it('should validate required attribute', () => {
    const validation = dpml.validate(`<prompt>Hello</prompt>`);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('should parse nested elements', () => {
    const doc = dpml.parse(`
      <prompt role="user">
        <context>Background info</context>
      </prompt>
    `);

    expect(doc.rootNode.children.length).toBe(1);
    expect(doc.rootNode.children[0].tagName).toBe('context');
  });
});
```

## 最佳实践总结

1. **单例模式**：复用 DPML 实例，避免重复创建
2. **缓存结果**：缓存编译结果，避免重复编译
3. **错误处理**：优雅处理编译错误，提供有用的错误信息
4. **类型安全**：使用 TypeScript 类型确保类型安全
5. **监控日志**：在生产环境中监控编译错误
6. **预编译**：在构建时预编译静态模板
7. **测试覆盖**：为 DPML 集成编写测试用例

## 相关文档

- [Schema 定义指南](./defining-schema.md)
- [自定义变换器指南](./custom-transformer.md)
- [验证最佳实践](./validation.md)
