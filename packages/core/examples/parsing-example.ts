/**
 * DPML解析模块示例
 * 演示如何使用parse和parseAsync函数解析DPML内容
 */

// 导入核心解析函数
import { formatDPMLDocument, formatDPMLNode } from '@core/types/utils';

import { parse, parseAsync } from '../src';
import type { DPMLDocument, ParseOptions, ParseResult, ParseError } from '../src/types';


// 一个简单的DPML示例内容
const simpleDPML = `
<dpml version="1.0">
  <metadata>
    <title>示例文档</title>
    <description>这是一个简单的DPML解析示例</description>
  </metadata>
  <content>
    <paragraph id="p1">
      这是一个简单的段落，用于演示DPML解析。
    </paragraph>
    <section id="section1" title="示例章节">
      <paragraph id="p2">章节内的段落内容。</paragraph>
    </section>
  </content>
</dpml>
`;

// 示例1: 基本解析 - 使用同步解析方法
function basicParsingExample() {
  console.log('===== 基本解析示例 =====');

  try {
    // 默认配置解析DPML内容
    const document = parse(simpleDPML) as DPMLDocument;

    console.log('document', formatDPMLNode(document.rootNode, 10));

    // 访问解析后的文档结构
    console.log(`解析成功! 文档标题: ${document.metadata.title}`);
    console.log(`根节点标签: ${document.rootNode.tagName}`);
    console.log(`内容节点数: ${document.rootNode.children.length}`);

    // 访问特定节点 (通过遍历)
    const content = document.rootNode.children.find(node => node.tagName === 'content');

    if (content) {
      const paragraphs = content.children.filter(node => node.tagName === 'paragraph');

      console.log(`段落数量: ${paragraphs.length}`);

      // 读取第一个段落的内容
      if (paragraphs.length > 0) {
        console.log(`第一个段落内容: ${paragraphs[0].content.trim()}`);
        console.log(`段落ID: ${paragraphs[0].attributes.get('id')}`);
      }
    }
  } catch (error) {
    console.error('解析错误:', error);
  }
}

// 示例2: 使用解析选项控制行为
function parseWithOptionsExample() {
  console.log('\n===== 使用解析选项示例 =====');

  // 定义解析选项
  const options: ParseOptions = {
    throwOnError: false,  // 不抛出错误，而是返回结果对象
    fileName: 'example.dpml',  // 提供文件名用于错误报告
    xmlParserOptions: {
      preserveWhitespace: true,  // 保留空白字符
      parseComments: true        // 解析注释
    },
    // 返回结果对象，即使成功
    postProcessorOptions: {
      returnResultObject: true
    }
  };

  // 使用选项解析DPML内容
  const result = parse(simpleDPML, options) as ParseResult<DPMLDocument>;

  // 根据成功或失败处理结果
  if (result.success && result.data) {
    console.log('解析成功!');
    console.log(`文档描述: ${result.data.metadata.description}`);

    // 处理可能的警告
    if (result.warnings && result.warnings.length > 0) {
      console.log(`有 ${result.warnings.length} 个警告`);
    }
  } else if (result.error) {
    console.error('解析失败:', result.error.formatMessage());
  }
}

// 示例3: 异步解析，适用于大文件
async function asyncParsingExample() {
  console.log('\n===== 异步解析示例 =====');

  try {
    // 创建一个大文档（为演示目的，我们复制现有内容）
    const largeContent = Array(10).fill(simpleDPML).join('\n');

    console.log(`大文档大小: ${largeContent.length} 字符`);

    // 使用内存优化选项进行异步解析
    const options: ParseOptions = {
      memoryOptimization: {
        enabled: true,           // 启用内存优化
        largeFileThreshold: 1000 // 设置更小的阈值用于演示
      }
    };

    console.log('开始异步解析...');
    const startTime = Date.now();

    // 使用异步解析方法
    const document = await parseAsync(largeContent, options) as DPMLDocument;

    const endTime = Date.now();

    console.log(`解析完成! 耗时: ${endTime - startTime}ms`);
    console.log(`文档元数据: ${document.metadata.title}`);

    // 统计节点数量（示例如何遍历文档）
    let nodeCount = 0;

    function countNodes(node: any) {
      nodeCount++;
      if (node.children && node.children.length > 0) {
        node.children.forEach(countNodes);
      }
    }

    countNodes(document.rootNode);
    console.log(`文档总节点数: ${nodeCount}`);

  } catch (error) {
    console.error('异步解析错误:', error);
  }
}

// 示例4: 错误处理
function errorHandlingExample() {
  console.log('\n===== 错误处理示例 =====');

  // 包含语法错误的DPML
  const invalidDPML = `
<dpml version="1.0">
  <metadata>
    <title>错误示例</title>
  </metadata>
  <content>
    <paragraph id="p1">
      这是一个带有错误的例子
    </paragraph>
    <!-- 缺少闭合标签 -->
    <section id="section1" title="错误章节">
      <paragraph id="p2">这个段落没有正确闭合。
  </content>
</dpml>
  `;

  // 方法1: 使用try-catch捕获错误
  try {
    console.log('尝试解析错误的DPML (使用try-catch)...');
    const document = parse(invalidDPML);

    console.log('这行不应该执行到，因为应该抛出异常');
  } catch (error: any) {
    console.log('捕获到解析错误:');
    console.log(`- 错误类型: ${error.name}`);
    console.log(`- 错误代码: ${error.code}`);
    console.log(`- 错误消息: ${error.message}`);

    // 如果有位置信息
    if (error.position) {
      console.log(`- 错误位置: 行 ${error.position.startLine}, 列 ${error.position.startColumn}`);
    }
  }

  // 方法2: 使用非抛出模式获取错误详情
  console.log('\n尝试解析错误的DPML (使用非抛出模式)...');
  const result = parse(invalidDPML, { throwOnError: false }) as ParseResult<DPMLDocument>;

  if (!result.success && result.error) {
    console.log('收到解析错误结果:');
    console.log(`- 错误类型: ${result.error.name}`);
    console.log(`- 错误详情: ${result.error.formatMessage()}`);
  }
}

// 执行所有示例
async function runAllExamples() {
  basicParsingExample();
  parseWithOptionsExample();
  await asyncParsingExample();
  errorHandlingExample();
}

// 运行示例
runAllExamples().catch(console.error);
