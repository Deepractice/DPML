/**
 * DPML Parser API 使用示例
 *
 * 本示例展示了@dpml/core包中解析器API的主要用法
 */

import { parse, validate, createTagRegistry, TagRegistry } from '../src';

import type { TagDefinition, ParseOptions, ParseResult } from '../src';

/**
 * 基本解析示例
 */
async function basicParsingExample() {
  console.log('--- 基本解析示例 ---');

  // 简单的DPML文本
  const dpmlText = `
    <prompt id="simple-example">
      <role>assistant</role>
      <context>你是一个有用的AI助手</context>
      <thinking>
        用户需要帮助，我应该提供简洁明了的回答
      </thinking>
    </prompt>
  `;

  // 解析DPML文本
  const result = await parse(dpmlText);

  console.log('解析结果:');
  console.log(`- AST节点数量: ${countNodes(result.ast)}`);
  console.log(`- 错误数量: ${result.errors.length}`);
  console.log(`- 警告数量: ${result.warnings.length}`);

  // 打印AST根节点信息
  if (result.ast.children.length > 0) {
    const rootElement = result.ast.children[0];
    if (rootElement.type === 'element') {
      console.log(`- 根元素: <${rootElement.tagName}>`);

      // 打印属性
      if (rootElement.attributes) {
        console.log('  属性:');
        Object.entries(rootElement.attributes).forEach(([key, value]) => {
          console.log(`    - ${key}: ${value}`);
        });
      }

      // 打印子元素
      if (rootElement.children) {
        console.log('  子元素:');
        rootElement.children
          .filter(child => child.type === 'element')
          .forEach(child => {
            if (child.type === 'element') {
              console.log(`    - <${child.tagName}>`);
            }
          });
      }
    }
  }
}

/**
 * 解析选项示例
 */
async function parsingOptionsExample() {
  console.log('\n--- 解析选项示例 ---');

  const dpmlText = `
    <prompt id="options-example">
      <!-- 这是一个注释 -->
      <unknown-tag>这是未知标签</unknown-tag>
    </prompt>
  `;

  // 默认选项
  const defaultResult = await parse(dpmlText);
  console.log('默认选项结果:');
  console.log(`- 错误数量: ${defaultResult.errors.length}`);
  console.log(`- 警告数量: ${defaultResult.warnings.length}`);
  console.log(
    `- 保留注释: ${defaultResult.ast.children.some(c => c.type === 'comment')}`
  );

  // 自定义选项
  const options: ParseOptions = {
    allowUnknownTags: false, // 不允许未知标签
    preserveComments: true, // 保留注释
    tolerant: true, // 忽略错误继续解析
    mode: 'strict', // 严格模式
  };

  const customResult = await parse(dpmlText, options);
  console.log('\n自定义选项结果:');
  console.log(`- 错误数量: ${customResult.errors.length}`);
  console.log(`- 警告数量: ${customResult.warnings.length}`);
  console.log(
    `- 保留注释: ${customResult.ast.children.some(c => c.type === 'comment')}`
  );
}

/**
 * 标签注册表示例
 */
function tagRegistryExample() {
  console.log('\n--- 标签注册表示例 ---');

  // 方式1: 使用工厂函数创建
  const registry1 = createTagRegistry();

  // 方式2: 直接实例化类
  const registry2 = new TagRegistry();

  // 定义prompt标签
  const promptTagDef: TagDefinition = {
    // 定义允许的属性
    attributes: {
      id: { type: 'string', required: true },
      version: { type: 'string', required: false },
      model: { type: 'string', required: false },
    },
    // 定义允许的子标签
    allowedChildren: ['role', 'context', 'thinking', 'executing'],
  };

  // 注册标签
  registry2.registerTagDefinition('prompt', promptTagDef);

  // 检查标签是否已注册
  console.log(`prompt标签已注册: ${registry2.isTagRegistered('prompt')}`);
  console.log(`unknown标签已注册: ${registry2.isTagRegistered('unknown')}`);

  // 获取标签定义
  const retrievedDef = registry2.getTagDefinition('prompt');
  console.log('获取到的prompt标签定义:');
  console.log(retrievedDef);

  // 使用便捷方法注册标签
  registry2.registerTag('role', {
    allowedChildren: [], // 不允许子标签
    selfClosing: false, // 不是自闭合标签
  });

  // 获取所有已注册标签
  const allTags = registry2.getAllTagNames();
  console.log(`已注册的所有标签: ${allTags.join(', ')}`);

  // 移除标签
  registry2.removeTagDefinition('role');
  console.log(`移除后，role标签已注册: ${registry2.isTagRegistered('role')}`);

  // 清空注册表
  registry2.clear();
  console.log(
    `清空后，prompt标签已注册: ${registry2.isTagRegistered('prompt')}`
  );
}

/**
 * 文档验证示例
 */
async function validationExample() {
  console.log('\n--- 文档验证示例 ---');

  // 准备一个简单的文档进行验证
  const dpmlText = `
    <prompt id="validation-example">
      <role>assistant</role>
    </prompt>
  `;

  // 解析文档
  const result = await parse(dpmlText);

  // 验证文档
  const validationResult = validate(result.ast);

  console.log('验证结果:');
  console.log(`- 是否有效: ${validationResult.valid}`);
  console.log(`- 错误数量: ${validationResult.errors.length}`);
  console.log(`- 警告数量: ${validationResult.warnings.length}`);
}

/**
 * 辅助函数: 计算AST中的节点数量
 */
function countNodes(node: any): number {
  let count = 1; // 当前节点

  if (node.children && Array.isArray(node.children)) {
    // 递归计算子节点
    node.children.forEach((child: any) => {
      count += countNodes(child);
    });
  }

  return count;
}

/**
 * 运行所有示例
 */
async function runAllExamples() {
  try {
    await basicParsingExample();
    await parsingOptionsExample();
    tagRegistryExample();
    await validationExample();
  } catch (error) {
    console.error('示例执行出错:', error);
  }
}

// 执行示例
runAllExamples();
