/**
 * 端到端测试环境变量帮助模块
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 尝试加载环境变量
const envPath = path.resolve(__dirname, '../../../.env');
try {
  // 检查文件是否存在
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      throw result.error;
    }
    console.info(`成功加载.env文件: ${envPath}`);
    console.info(`加载的环境变量数量: ${Object.keys(result.parsed || {}).length}`);
  } else {
    console.warn(`未找到.env文件: ${envPath}`);
  }
} catch (error) {
  console.warn(`加载.env文件失败: ${error instanceof Error ? error.message : String(error)}`);
  console.warn('将使用模拟数据进行测试');
}

// 测试模式控制（设置了TEST_USE_REAL_API=true时使用真实API）
const TEST_USE_REAL_API = process.env.TEST_USE_REAL_API === 'true';
console.info('----- 测试环境配置信息 -----');
console.info(`当前测试模式: ${TEST_USE_REAL_API ? '真实API' : '模拟'}`);
console.info(`环境变量TEST_USE_REAL_API=${process.env.TEST_USE_REAL_API}`);
console.info(`进程ID: ${process.pid}`);
console.info(`当前工作目录: ${process.cwd()}`);
console.info('---------------------------');

/**
 * 验证LLM API配置是否有效
 * @param apiType API类型：'openai' | 'anthropic' 等
 * @returns 配置是否有效
 */
export function isLLMConfigValid(apiType: string): boolean {
  // 检查是否启用真实API测试
  if (!TEST_USE_REAL_API) {
    console.info(`${apiType}测试模式: 强制使用模拟`);
    return false;
  }
  
  let isValid = false;
  
  switch (apiType.toLowerCase()) {
    case 'openai':
      isValid = Boolean(
        process.env.OPENAI_API_KEY && 
        process.env.OPENAI_MODEL
      );
      console.info(`OpenAI配置状态: ${isValid ? '有效' : '无效'}`);
      console.info(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '已设置' : '未设置'}`);
      console.info(`OPENAI_MODEL: ${process.env.OPENAI_MODEL || '未设置'}`);
      console.info(`OPENAI_API_URL: ${process.env.OPENAI_API_URL || '未设置'}`);
      return isValid;
      
    case 'anthropic':
      isValid = Boolean(
        process.env.ANTHROPIC_API_KEY && 
        process.env.ANTHROPIC_MODEL
      );
      console.info(`Anthropic配置状态: ${isValid ? '有效' : '无效'}`);
      console.info(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '已设置' : '未设置'}`);
      console.info(`ANTHROPIC_MODEL: ${process.env.ANTHROPIC_MODEL || '未设置'}`);
      return isValid;
      
    default:
      console.info(`未知API类型: ${apiType}`);
      return false;
  }
}

/**
 * 获取指定API类型的配置
 * @param apiType API类型
 * @returns 配置对象
 */
export function getLLMConfig(apiType: string): Record<string, string> {
  switch (apiType.toLowerCase()) {
    case 'openai':
      return {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4',
        apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1'
      };
    case 'anthropic':
      return {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: process.env.ANTHROPIC_MODEL || 'claude-3'
      };
    default:
      return {};
  }
}

/**
 * 显示使用模拟测试的警告
 * @param apiType API类型
 */
export function showMockWarning(apiType: string): void {
  if (TEST_USE_REAL_API) {
    console.warn(`⚠️ 未找到${apiType}的有效API配置，将使用模拟数据进行测试。如需使用真实API，请在.env文件中配置相关参数。`);
  } else {
    console.info(`ℹ️ 强制使用${apiType}模拟测试模式。要使用真实API，请设置环境变量TEST_USE_REAL_API=true`);
  }
} 