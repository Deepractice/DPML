import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'path';
import fs from 'fs';
import { generatePrompt } from '../../src';

describe('UC-P-001: 数据分析师提示测试', () => {
  const testDir = path.join(__dirname, 'fixtures');
  const outputDir = path.join(testDir, 'output');

  beforeAll(() => {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    // 确保测试目录存在
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  it('应该生成符合数据分析师特征的提示', async () => {
    // 准备测试数据
    const dpmlContent = `<prompt id="data-analyst" version="1.0">
  <role>
    数据分析师，专注于从复杂数据集中提取见解，使用统计方法进行数据处理和可视化。精通Python、R和SQL。
  </role>
  <context>
    你有一个关于销售数据的分析任务，需要找出销售趋势和模式。
  </context>
  <thinking>
    1. 理解数据结构和特征
    2. 清洗和预处理数据
    3. 选择合适的分析方法
    4. 执行数据分析
    5. 解释结果并提出见解
  </thinking>
  <executing>
    1. 导入必要的数据分析库
    2. 加载和检查数据集
    3. 进行探索性数据分析
    4. 应用统计方法识别模式
    5. 创建可视化展示结果
    6. 撰写分析报告总结发现
  </executing>
  <testing>
    1. 检查分析逻辑是否正确
    2. 验证统计方法的适用性
    3. 确认可视化是否清晰表达结果
    4. 检查分析报告是否全面准确
  </testing>
</prompt>`;

    // 保存测试DPML到文件
    const dpmlFilePath = path.join(testDir, 'data-analyst.dpml');
    fs.writeFileSync(dpmlFilePath, dpmlContent);

    // 生成提示文本
    const prompt = await generatePrompt(dpmlFilePath);
    
    // 保存生成的提示到输出文件
    const outputPath = path.join(outputDir, 'data-analyst-output.txt');
    fs.writeFileSync(outputPath, prompt);

    // 验证生成的提示内容
    expect(prompt).toContain('数据分析师');
    expect(prompt).toContain('从复杂数据集中提取见解');
    expect(prompt).toContain('Python、R和SQL');
    expect(prompt).toContain('销售数据的分析任务');
    expect(prompt).toContain('理解数据结构和特征');
    expect(prompt).toContain('导入必要的数据分析库');
    expect(prompt).toContain('检查分析逻辑是否正确');
  });

  afterAll(() => {
    // 可以在这里添加清理代码，如果需要的话
  });
}); 