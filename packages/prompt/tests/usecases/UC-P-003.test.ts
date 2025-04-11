import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'path';
import fs from 'fs';
import { generatePrompt } from '../../src';

describe('UC-P-003: 金融顾问提示测试', () => {
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

  it('应该生成符合金融顾问特征的提示', async () => {
    // 准备测试数据
    const dpmlContent = `<prompt id="financial-advisor" version="1.0">
  <role>
    金融顾问，专注于提供投资规划、财富管理和风险评估服务。具有金融市场深厚知识和丰富的投资组合管理经验。
  </role>
  <context>
    你需要为客户提供投资建议，包括资产配置、风险管理和退休规划，基于他们的财务状况和投资目标。
  </context>
  <thinking>
    1. 分析客户的财务状况和风险承受能力
    2. 考虑当前市场环境和经济趋势
    3. 评估不同投资策略的风险和回报
    4. 思考长期和短期投资目标的平衡
    5. 考虑税务影响和法规要求
  </thinking>
  <executing>
    1. 详细了解客户的财务情况和投资目标
    2. 提供全面的投资建议和资产配置方案
    3. 解释不同投资产品的特点和风险
    4. 制定风险管理策略
    5. 提供定期投资组合审查和调整建议
  </executing>
  <testing>
    1. 检查投资建议是否符合客户风险承受能力
    2. 验证资产配置是否多元化
    3. 评估投资策略在不同市场条件下的表现
    4. 确认投资方案是否符合客户长期目标
  </testing>
  <protocol>
    在提供金融建议时，始终保持专业和负责任，清晰说明投资风险，避免过度承诺回报。遵循"了解你的客户"原则，提供客观和个性化的建议。
  </protocol>
</prompt>`;

    // 保存测试DPML到文件
    const dpmlFilePath = path.join(testDir, 'financial-advisor.dpml');
    fs.writeFileSync(dpmlFilePath, dpmlContent);

    // 生成提示文本
    const prompt = await generatePrompt(dpmlFilePath);
    
    // 保存生成的提示到输出文件
    const outputPath = path.join(outputDir, 'financial-advisor-output.txt');
    fs.writeFileSync(outputPath, prompt);

    // 验证生成的提示内容
    expect(prompt).toContain('金融顾问');
    expect(prompt).toContain('投资规划、财富管理');
    expect(prompt).toContain('为客户提供投资建议');
    expect(prompt).toContain('分析客户的财务状况');
    expect(prompt).toContain('提供全面的投资建议');
    expect(prompt).toContain('检查投资建议是否符合客户风险承受能力');
    expect(prompt).toContain('始终保持专业和负责任');
  });

  afterAll(() => {
    // 可以在这里添加清理代码，如果需要的话
  });
}); 