/**
 * @dpml/prompt 包性能测试
 * 
 * 测试目标：
 * - PT-P-001: 处理1MB文档内存使用<200MB
 * - PT-P-002: 100KB文档解析<500ms
 * - PT-P-003: 并发处理性能测试
 * - PT-P-004: 大型复杂结构文档处理性能
 * - PT-P-005: 多文件继承处理性能
 */
import { describe, test, expect } from 'vitest';
import { generatePrompt, processPrompt } from '../../api';
import { createWriteStream } from 'fs';
import { writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import os from 'os';

// 辅助函数：生成指定大小的DPML文档
async function generateDPMLDocument(sizeInKB: number): Promise<string> {
  const baseTemplate = `<prompt>
<role name="assistant">
I am a helpful assistant.
</role>
<context>
This is a context for testing performance with a large document.
</context>
<thinking>
Here is some thinking process:
</thinking>
<executing>
Here are the steps to execute:
</executing>
<protocol>
Here is how I'll interact:
</protocol>
<custom name="additional">
Additional custom content
</custom>
</prompt>`;

  // 计算需要添加多少内容以达到目标大小
  const targetSizeInBytes = sizeInKB * 1024;
  const baseSize = Buffer.from(baseTemplate).length;
  const contentToAdd = targetSizeInBytes - baseSize;

  if (contentToAdd <= 0) {
    return baseTemplate;
  }

  // 在thinking标签中添加足够的内容以达到目标大小
  let largeContent = '<thinking>\n';
  const loremIpsum = '这是一段用于填充的文本，目的是测试处理器对大型文档的处理能力。我们需要确保系统能够高效地处理大量文本数据，同时保持内存使用合理。这段文本将被重复多次以达到测试所需的文档大小。';
  
  const iterations = Math.ceil(contentToAdd / Buffer.from(loremIpsum).length);
  for (let i = 0; i < iterations; i++) {
    largeContent += `${loremIpsum}\n`;
  }
  largeContent += '</thinking>';

  // 替换原文档中的thinking标签
  return baseTemplate.replace(/<thinking>[\s\S]*?<\/thinking>/m, largeContent);
}

// 辅助函数：生成继承文件
async function generateInheritanceFiles(): Promise<string> {
  const testDir = join(os.tmpdir(), 'dpml-perf-test', Date.now().toString());
  await mkdir(testDir, { recursive: true });

  // 创建基础文件
  const baseFile = join(testDir, 'base.dpml');
  await writeFile(baseFile, `<prompt>
<role name="assistant">
I am a helpful assistant created by DPML.
</role>
<context>
This is the base context.
</context>
</prompt>`);

  // 创建中间继承文件
  const midFile = join(testDir, 'mid.dpml');
  await writeFile(midFile, `<prompt inherit="${baseFile}">
<thinking>
Here is my thinking process.
</thinking>
<executing>
Here are my execution steps.
</executing>
</prompt>`);

  // 创建最终继承文件
  const finalFile = join(testDir, 'final.dpml');
  await writeFile(finalFile, `<prompt inherit="${midFile}">
<protocol>
This is how I will interact.
</protocol>
<custom name="additional">
Some additional custom content.
</custom>
</prompt>`);

  return finalFile;
}

// 测试内存使用情况
describe('Memory Usage Tests (PT-P-001)', () => {
  test('should process 1MB document with less than 200MB memory', async () => {
    // 生成1MB的测试文档
    const largeDPML = await generateDPMLDocument(1024); // 1MB
    
    // 保存内存使用起始值
    const initialMemoryUsage = process.memoryUsage().heapUsed;
    
    // 处理文档
    const result = await generatePrompt(largeDPML);
    
    // 计算内存使用增量
    const finalMemoryUsage = process.memoryUsage().heapUsed;
    const memoryUsed = (finalMemoryUsage - initialMemoryUsage) / (1024 * 1024); // MB
    
    // 验证内存使用在限制范围内
    expect(result).toBeTruthy();
    expect(memoryUsed).toBeLessThan(200);
    console.log(`Memory used for 1MB document: ${memoryUsed.toFixed(2)}MB`);
  });
});

// 测试处理速度
describe('Processing Speed Tests (PT-P-002)', () => {
  test('should process 100KB document in less than 500ms', async () => {
    // 生成100KB的测试文档
    const mediumDPML = await generateDPMLDocument(100); // 100KB
    
    // 测量处理时间
    const startTime = performance.now();
    const result = await generatePrompt(mediumDPML);
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    // 验证处理时间在限制范围内
    expect(result).toBeTruthy();
    expect(processingTime).toBeLessThan(500); // 应当小于500ms
    console.log(`Time to process 100KB document: ${processingTime.toFixed(2)}ms`);
  });
});

// 测试并发处理性能
describe('Concurrent Processing Tests (PT-P-003)', () => {
  test('should handle multiple concurrent prompt processing efficiently', async () => {
    // 创建多个中等大小的文档
    const numConcurrent = 10;
    const docs = await Promise.all(
      Array(numConcurrent).fill(0).map(() => generateDPMLDocument(50)) // 每个50KB
    );
    
    // 测量并发处理时间
    const startTime = performance.now();
    const results = await Promise.all(
      docs.map(doc => generatePrompt(doc))
    );
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // 所有结果应当成功生成
    results.forEach(result => {
      expect(result).toBeTruthy();
    });
    
    // 计算平均处理时间
    const avgTimePerDoc = totalTime / numConcurrent;
    console.log(`Concurrent processing of ${numConcurrent} documents:`);
    console.log(`- Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`- Average time per document: ${avgTimePerDoc.toFixed(2)}ms`);
    
    // 验证平均处理时间是合理的（这个阈值可根据实际情况调整）
    expect(avgTimePerDoc).toBeLessThan(500);
  });
});

// 测试大型复杂结构文档处理性能
describe('Complex Document Tests (PT-P-004)', () => {
  test('should process complex nested structure document efficiently', async () => {
    // 生成具有复杂嵌套结构的文档
    const complexDoc = `<prompt>
<role name="assistant">
I am a helpful assistant.
</role>
<context>
${Array(50).fill('This is a repeated line to make the context larger.').join('\n')}
</context>
<thinking>
${Array(50).fill('This is a repeated line to make the thinking process larger.').join('\n')}
</thinking>
<executing>
${Array(50).fill('This is a repeated line to make the execution steps larger.').join('\n')}
</executing>
<protocol>
${Array(50).fill('This is a repeated line to make the protocol larger.').join('\n')}
</protocol>
<custom name="section1">
${Array(20).fill('Custom section 1 content.').join('\n')}
</custom>
<custom name="section2">
${Array(20).fill('Custom section 2 content.').join('\n')}
</custom>
<custom name="section3">
${Array(20).fill('Custom section 3 content.').join('\n')}
</custom>
</prompt>`;
    
    // 测量处理时间
    const startTime = performance.now();
    const result = await generatePrompt(complexDoc);
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    expect(result).toBeTruthy();
    console.log(`Time to process complex document: ${processingTime.toFixed(2)}ms`);
    
    // 验证处理时间在合理范围内（具体阈值可根据实际情况调整）
    expect(processingTime).toBeLessThan(1000); // 对于复杂文档，允许更长处理时间
  });
});

// 测试多文件继承处理性能
describe('Inheritance Processing Tests (PT-P-005)', () => {
  test('should process multi-level inheritance efficiently', async () => {
    // 生成继承文件树
    const finalFile = await generateInheritanceFiles();
    
    // 测量处理时间
    const startTime = performance.now();
    const result = await generatePrompt(finalFile);
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    expect(result).toBeTruthy();
    console.log(`Time to process inheritance chain: ${processingTime.toFixed(2)}ms`);
    
    // 验证处理时间在合理范围内
    expect(processingTime).toBeLessThan(1000); // 对于继承处理，允许更长处理时间
  });
}); 