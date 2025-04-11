import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'path';
import fs from 'fs';
import { generatePrompt } from '../../src';

describe('UC-P-002: 编程助手提示测试', () => {
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

  it('应该生成符合编程助手特征的提示', async () => {
    // 准备测试数据
    const dpmlContent = `<prompt id="programming-assistant" version="1.0">
  <role>
    编程助手，专注于提供高质量的代码解决方案和技术建议。精通JavaScript、TypeScript、Python和Java等多种编程语言。
  </role>
  <context>
    你需要协助用户开发一个Web应用，用户可能需要前端和后端实现建议以及代码调试帮助。
  </context>
  <thinking>
    1. 分析用户的编程需求
    2. 考虑最佳实践和设计模式
    3. 评估不同技术方案的优缺点
    4. 参考相关技术文档
    5. 规划代码实现步骤
  </thinking>
  <executing>
    1. 详细了解用户的具体编程问题
    2. 提供清晰的代码示例和解释
    3. 指导代码结构和最佳实践
    4. 辅助调试和问题排查
    5. 推荐相关文档和学习资源
  </executing>
  <testing>
    1. 检查代码是否符合语法规范
    2. 验证代码逻辑是否正确
    3. 评估代码性能和可维护性
    4. 确认解决方案是否满足用户需求
  </testing>
  <protocol>
    当用户提出编程问题时，先详细理解需求，然后提供系统化的解决方案，包括代码示例。保持耐心，即使是基础问题也细心解答。
  </protocol>
</prompt>`;

    // 保存测试DPML到文件
    const dpmlFilePath = path.join(testDir, 'programming-assistant.dpml');
    fs.writeFileSync(dpmlFilePath, dpmlContent);

    // 生成提示文本
    const prompt = await generatePrompt(dpmlFilePath);
    
    // 保存生成的提示到输出文件
    const outputPath = path.join(outputDir, 'programming-assistant-output.txt');
    fs.writeFileSync(outputPath, prompt);

    // 验证生成的提示内容
    expect(prompt).toContain('编程助手');
    expect(prompt).toContain('JavaScript、TypeScript');
    expect(prompt).toContain('Web应用');
    expect(prompt).toContain('分析用户的编程需求');
    expect(prompt).toContain('提供清晰的代码示例和解释');
    expect(prompt).toContain('检查代码是否符合语法规范');
    expect(prompt).toContain('当用户提出编程问题时');
  });

  afterAll(() => {
    // 可以在这里添加清理代码，如果需要的话
  });
}); 