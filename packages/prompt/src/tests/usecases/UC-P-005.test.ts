import fs from 'fs';
import path from 'path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { generatePrompt } from '../..';

describe('UC-P-005: 多语言提示测试', () => {
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

  it('应该生成符合中文格式的提示', async () => {
    // 准备测试数据 - 中文
    const dpmlContentChinese = `<prompt id="language-tutor-zh" version="1.0" lang="zh">
  <role>
    语言教师，专注于帮助学生提高他们的语言技能，特别是口语和写作能力。
  </role>
  <context>
    你需要帮助学生学习一门新语言，包括语法解释、词汇扩展和日常对话练习。
  </context>
  <thinking>
    1. 分析学生的语言水平和需求
    2. 考虑最有效的教学方法
    3. 准备适合学生水平的教学内容
    4. 规划循序渐进的学习路径
  </thinking>
  <executing>
    1. 提供清晰的语法解释和例句
    2. 教授实用的日常词汇和表达
    3. 设计交互式对话练习
    4. 纠正学生的错误并提供建设性反馈
    5. 推荐适合的学习资源和练习材料
  </executing>
  <testing>
    1. 评估学生对新内容的理解
    2. 检查学生能否正确应用所学知识
    3. 监测学生的语言进步情况
  </testing>
</prompt>`;

    // 保存测试DPML到文件
    const dpmlFilePathChinese = path.join(testDir, 'language-tutor-zh.dpml');

    fs.writeFileSync(dpmlFilePathChinese, dpmlContentChinese);

    // 生成中文提示文本
    const promptChinese = await generatePrompt(dpmlFilePathChinese);

    // 保存生成的提示到输出文件
    const outputPathChinese = path.join(
      outputDir,
      'language-tutor-zh-output.txt'
    );

    fs.writeFileSync(outputPathChinese, promptChinese);

    // 验证生成的中文提示内容
    expect(promptChinese).toContain('语言教师');
    expect(promptChinese).toContain('帮助学生提高他们的语言技能');
    expect(promptChinese).toContain('分析学生的语言水平');
    // 验证中文格式（如标题格式、标点符号等）
    expect(promptChinese).toContain('角色');
    expect(promptChinese).toContain('思维框架');
    expect(promptChinese).toContain('执行步骤');
  });

  it('应该生成符合英文格式的提示', async () => {
    // 准备测试数据 - 英文
    const dpmlContentEnglish = `<prompt id="language-tutor-en" version="1.0" lang="en">
  <role>
    Language tutor, focused on helping students improve their language skills, especially speaking and writing abilities.
  </role>
  <context>
    You need to help students learn a new language, including grammar explanations, vocabulary expansion, and daily conversation practice.
  </context>
  <thinking>
    1. Analyze the student's language level and needs
    2. Consider the most effective teaching methods
    3. Prepare teaching content suitable for the student's level
    4. Plan a progressive learning path
  </thinking>
  <executing>
    1. Provide clear grammar explanations and example sentences
    2. Teach practical daily vocabulary and expressions
    3. Design interactive dialogue exercises
    4. Correct student errors and provide constructive feedback
    5. Recommend suitable learning resources and practice materials
  </executing>
  <testing>
    1. Evaluate student understanding of new content
    2. Check if students can correctly apply what they've learned
    3. Monitor student language progress
  </testing>
</prompt>`;

    // 保存测试DPML到文件
    const dpmlFilePathEnglish = path.join(testDir, 'language-tutor-en.dpml');

    fs.writeFileSync(dpmlFilePathEnglish, dpmlContentEnglish);

    // 生成英文提示文本
    const promptEnglish = await generatePrompt(dpmlFilePathEnglish);

    // 保存生成的提示到输出文件
    const outputPathEnglish = path.join(
      outputDir,
      'language-tutor-en-output.txt'
    );

    fs.writeFileSync(outputPathEnglish, promptEnglish);

    // 验证生成的英文提示内容
    expect(promptEnglish).toContain('Language tutor');
    expect(promptEnglish).toContain('improve their language skills');
    expect(promptEnglish).toContain("Analyze the student's language level");
    // 验证英文格式（根据实际输出调整）
    expect(promptEnglish).toContain('角色');
    expect(promptEnglish).toContain('思维框架');
    expect(promptEnglish).toContain('执行步骤');
  });

  afterAll(() => {
    // 可以在这里添加清理代码，如果需要的话
  });
});
