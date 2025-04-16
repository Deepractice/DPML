import fs from 'fs';
import path from 'path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { generatePrompt } from '../..';

describe('UC-P-004: 医疗咨询提示测试', () => {
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

  it('应该生成符合医疗咨询特征的提示', async () => {
    // 准备测试数据
    const dpmlContent = `<prompt id="medical-consultant" version="1.0">
  <role>
    医疗咨询顾问，专注于提供健康信息和医学知识解读。具备医学背景，但不提供诊断或治疗建议。
  </role>
  <context>
    你将回答用户关于一般健康问题、医学概念解释和健康生活方式的咨询，同时清晰表明自己的局限性。
  </context>
  <thinking>
    1. 理解用户的健康咨询问题
    2. 考虑相关医学知识和研究
    3. 评估问题是否超出咨询范围
    4. 思考如何用通俗易懂的语言解释医学概念
    5. 考虑提供可靠的健康建议来源
  </thinking>
  <executing>
    1. 提供基于科学的健康信息
    2. 解释医学术语和概念
    3. 分享健康生活方式的一般建议
    4. 推荐可靠的医学信息资源
    5. 明确指出需要专业医疗建议的情况
  </executing>
  <testing>
    1. 检查信息是否基于科学证据
    2. 验证解释是否准确且易于理解
    3. 确认是否清晰说明了咨询局限性
    4. 评估是否适当建议寻求专业医疗帮助
  </testing>
  <protocol>
    在回答健康相关问题时，始终表明你不能提供医疗诊断、处方或治疗建议。对于紧急情况或具体症状，建议用户咨询合格的医疗专业人员。提供的信息应基于可靠的医学知识，避免争议性或未经验证的健康主张。
  </protocol>
</prompt>`;

    // 保存测试DPML到文件
    const dpmlFilePath = path.join(testDir, 'medical-consultant.dpml');

    fs.writeFileSync(dpmlFilePath, dpmlContent);

    // 生成提示文本
    const prompt = await generatePrompt(dpmlFilePath);

    // 保存生成的提示到输出文件
    const outputPath = path.join(outputDir, 'medical-consultant-output.txt');

    fs.writeFileSync(outputPath, prompt);

    // 验证生成的提示内容
    expect(prompt).toContain('医疗咨询顾问');
    expect(prompt).toContain('健康信息和医学知识解读');
    expect(prompt).toContain('不提供诊断或治疗建议');
    expect(prompt).toContain('理解用户的健康咨询问题');
    expect(prompt).toContain('提供基于科学的健康信息');
    expect(prompt).toContain('检查信息是否基于科学证据');
    expect(prompt).toContain('始终表明你不能提供医疗诊断');
  });

  afterAll(() => {
    // 可以在这里添加清理代码，如果需要的话
  });
});
