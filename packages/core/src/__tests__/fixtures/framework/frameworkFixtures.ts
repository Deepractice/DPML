/**
 * Framework模块测试夹具
 * 提供测试数据和辅助函数
 */

import type { DomainConfig } from '../../../types/DomainConfig';
import type { ProcessedSchema } from '../../../types/ProcessedSchema';
import type { Schema } from '../../../types/Schema';
import type { Transformer } from '../../../types/Transformer';

/**
 * 测试用简单模型接口
 */
export interface SimpleModel {
  id: string;
  name: string;
  description?: string;
  tags: string[];
}

/**
 * 测试用简单模型转换器
 */
export const simpleModelTransformer: Transformer<unknown, SimpleModel> = {
  name: 'SimpleModelTransformer',
  transform: (data: unknown) => {
    const input = data as any;

    // 检查是否为处理后的DOM结构
    let id = 'default-id';
    let name = 'Default Name';
    let description = undefined;
    let tags: string[] = [];

    // 提取XML数据
    if (input && input.document && input.document.rootNode) {
      const rootNode = input.document.rootNode;

      // 从attributes中获取属性
      if (rootNode.attributes instanceof Map) {
        id = rootNode.attributes.get('id') || id;
        name = rootNode.attributes.get('name') || name;
        description = rootNode.attributes.get('description');
      }

      // 提取tags
      if (Array.isArray(rootNode.children)) {
        tags = rootNode.children
          .filter((child: any) => child.tagName === 'tag')
          .map((tag: any) => {
            if (tag.attributes instanceof Map) {
              return tag.attributes.get('name');
            }

            return null;
          })
          .filter(Boolean) as string[];
      }
    } else if (input && typeof input === 'object') {
      // 普通对象，直接读取属性
      id = input.id || id;
      name = input.name || name;
      description = input.description;
      tags = input.tags || tags;
    }

    return {
      id,
      name,
      description,
      tags
    };
  }
};

/**
 * 测试用简单模型Schema
 */
export const simpleModelSchema: Schema = {
  root: {
    element: 'model',
    attributes: [
      { name: 'id', type: 'string', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'description', type: 'string' }
    ],
    children: {
      elements: [
        {
          element: 'tag',
          attributes: [
            { name: 'name', type: 'string', required: true }
          ]
        }
      ]
    }
  }
};

/**
 * 测试用简单模型处理后的Schema
 */
export const processedSimpleModelSchema: ProcessedSchema<Schema> = {
  schema: simpleModelSchema,
  isValid: true
};

/**
 * 测试用简单模型DPML内容
 */
export const simpleModelDPML = `
<model id="test-123" name="测试模型" description="这是一个测试模型">
  <tag name="tag1" />
  <tag name="tag2" />
  <tag name="tag3" />
</model>
`;

/**
 * 测试用简单模型的配置
 */
export const simpleModelConfig: DomainConfig = {
  domain: 'simple-model',
  description: 'Simple Model Domain',
  schema: simpleModelSchema,
  transformers: [simpleModelTransformer],
  options: {
    strictMode: true
  }
};

/**
 * 测试用复杂模型接口
 */
export interface ComplexModel {
  metadata: {
    id: string;
    version: string;
    createdAt: number;
  };
  content: {
    title: string;
    sections: Array<{
      heading: string;
      paragraphs: string[];
    }>;
  };
}

/**
 * 测试用复杂模型转换器
 */
export const complexModelTransformer: Transformer<unknown, ComplexModel> = {
  name: 'ComplexModelTransformer',
  transform: (data: unknown) => {
    const input = data as any;

    // 默认值
    let docId = 'default-id';
    let version = '2.1';
    let createdAt = Date.now();
    let title = 'Default Title';
    let sections: Array<{heading: string; paragraphs: string[]}> = [];



    // 提取XML数据
    if (input && input.document && input.document.rootNode) {

      const rootNode = input.document.rootNode;

      // 从attributes中获取属性
      if (rootNode.attributes instanceof Map) {
        docId = rootNode.attributes.get('id') || docId;
        version = rootNode.attributes.get('version') || version;

        const createdAtStr = rootNode.attributes.get('createdAt');

        if (createdAtStr) {
          createdAt = parseInt(createdAtStr, 10) || createdAt;
        }


      }

      // 提取title和sections
      if (Array.isArray(rootNode.children)) {



        // 提取title
        const titleNode = rootNode.children.find((child: any) => child.tagName === 'title');

        if (titleNode) {

          title = titleNode.content || title;
        }

        // 提取sections
        const sectionNodes = rootNode.children.filter((child: any) => child.tagName === 'section');



        sections = sectionNodes.map((section: any) => {
          const heading = section.attributes instanceof Map
            ? section.attributes.get('heading') || 'Untitled Section'
            : 'Untitled Section';



          const paragraphs = Array.isArray(section.children)
            ? section.children
              .filter((child: any) => child.tagName === 'paragraph')
              .map((p: any) => {


                return p.content || '';
              })
            : [];



          return { heading, paragraphs };
        });
      }
    } else if (input && typeof input === 'object') {


      // 直接使用输入的属性
      if (input.metadata) {
        docId = input.metadata.id || docId;
        version = input.metadata.version || version;
        createdAt = input.metadata.createdAt || createdAt;
      } else {
        docId = input.id || docId;
        version = input.version || version;
        createdAt = input.createdAt || createdAt;
      }

      if (input.content) {
        title = input.content.title || title;
        sections = input.content.sections || sections;
      } else {
        title = input.title || title;
        sections = input.sections || sections;
      }
    }

    console.log('最终结果:', {
      metadata: { id: docId, version, createdAt },
      content: { title, sectionCount: sections.length }
    });

    return {
      metadata: {
        id: docId,
        version,
        createdAt
      },
      content: {
        title,
        sections
      }
    };
  }
};

/**
 * 测试用复杂模型Schema
 */
export const complexModelSchema: Schema = {
  root: {
    element: 'document',
    attributes: [
      { name: 'id', type: 'string', required: true },
      { name: 'version', type: 'string' },
      { name: 'createdAt', type: 'number' }
    ],
    children: {
      elements: [
        {
          element: 'title',
          content: { type: 'text', required: true }
        },
        {
          element: 'section',
          attributes: [
            { name: 'heading', type: 'string', required: true }
          ],
          children: {
            elements: [
              {
                element: 'paragraph',
                content: { type: 'text', required: true }
              }
            ]
          }
        }
      ]
    }
  }
};

/**
 * 测试用复杂模型处理后的Schema
 */
export const processedComplexModelSchema: ProcessedSchema<Schema> = {
  schema: complexModelSchema,
  isValid: true
};

/**
 * 测试用复杂模型DPML内容
 */
export const complexModelDPML = `
<document id="doc-456" version="2.1" createdAt="1619712000000">
  <title>复杂文档示例</title>
  <section heading="第一章">
    <paragraph>这是第一段内容。</paragraph>
    <paragraph>这是第二段内容。</paragraph>
  </section>
  <section heading="第二章">
    <paragraph>这是第三段内容。</paragraph>
  </section>
</document>
`;

/**
 * 测试用复杂模型的配置
 */
export const complexModelConfig: DomainConfig = {
  domain: 'complex-model',
  description: 'Complex Model Domain',
  schema: complexModelSchema,
  transformers: [complexModelTransformer],
  options: {
    strictMode: true,
    transformOptions: {
      resultMode: 'merged'
    }
  }
};

/**
 * 创建无效的模型配置（用于测试错误情况）
 */
export function createInvalidConfig(): DomainConfig {
  return {
    domain: 'invalid-domain',
    schema: {} as Schema, // 无效架构
    transformers: [] // 空转换器数组
  };
}

/**
 * 创建包含无效转换器的配置（用于测试错误情况）
 */
export function createInvalidTransformerConfig(): DomainConfig {
  return {
    domain: 'invalid-transformer-domain',
    schema: simpleModelSchema,
    transformers: [
      // @ts-expect-error - 故意创建无效的转换器用于测试
      { name: 'InvalidTransformer' }
    ]
  };
}

/**
 * 创建无效的DPML内容（用于测试错误情况）
 */
export const invalidDPMLContent = `
<invalid>
  <syntax>
    错误的XML语法结构
  <unclosed-tag>
</invalid>
`;

// 以下是为了支持单元测试所需的夹具函数

/**
 * 创建基本领域配置夹具
 * 用于测试领域编译器的创建和使用
 */
export function createDomainConfigFixture(): DomainConfig {
  return {
    domain: 'test-domain',
    description: 'Test Domain Description',
    schema: simpleModelSchema,
    transformers: [simpleModelTransformer],
    options: {
      strictMode: true,
      errorHandling: 'throw' as const,
      transformOptions: {
        resultMode: 'merged' as const
      }
    }
  };
}

/**
 * 创建有效DPML内容夹具
 */
export function createValidDPMLFixture(): string {
  return simpleModelDPML;
}

/**
 * 创建无效DPML内容夹具
 */
export function createInvalidDPMLFixture(): string {
  return invalidDPMLContent;
}

/**
 * 创建扩展配置夹具
 * 用于测试领域配置的扩展
 */
export function createExtensionConfigFixture(): Partial<DomainConfig> {
  return {
    options: {
      strictMode: false,
      errorHandling: 'warn' as const
    },
    transformers: [
      {
        name: 'additionalTransformer',
        transform: (input: unknown) => ({
          summary: 'This is a summary of the model'
        })
      }
    ]
  };
}

/**
 * 创建领域上下文夹具
 * 模拟domainService内部上下文
 */
export function createDomainContextFixture(): any {
  const config = createDomainConfigFixture();

  return {
    domain: 'test-domain',
    description: 'Test Domain Description',
    schema: config.schema,
    transformers: [...config.transformers],
    options: {
      strictMode: true,
      errorHandling: 'throw',
      transformOptions: {
        resultMode: 'merged'
      },
      custom: {}
    }
  };
}

/**
 * 创建领域状态夹具 (已弃用，保留为了兼容性)
 * @deprecated 请使用createDomainContextFixture替代
 */
export function createDomainStateFixture(): any {
  return createDomainContextFixture();
}

/**
 * 创建模拟解析结果
 */
export function createMockDPMLDocument(): any {
  return {
    rootNode: {
      tagName: 'model',
      attributes: new Map([['id', 'test-model']]),
      children: [
        {
          tagName: 'tag',
          attributes: new Map([
            ['name', 'tag1']
          ]),
          children: []
        }
      ]
    }
  };
}

/**
 * 创建模拟处理结果
 */
export function createMockProcessingResult(): any {
  return {
    document: createMockDPMLDocument(),
    validation: {
      isValid: true,
      errors: []
    }
  };
}
