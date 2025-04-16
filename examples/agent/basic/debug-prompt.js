/**
 * 调试DPML提示词提取
 *
 * 这个脚本直接解析DPML文件并输出提取的系统提示词
 */

const fs = require('fs');
const path = require('path');

// 直接读取DPML文件
const dpmlPath = path.join(__dirname, 'assistant.dpml');
const dpmlContent = fs.readFileSync(dpmlPath, 'utf-8');

console.log('==========================================');
console.log('DPML文件内容:');
console.log(dpmlContent);
console.log('==========================================');

// 直接解析提取prompt标签内容
function extractPrompt(content) {
  console.log('开始提取prompt标签内容...');

  // 简单的正则表达式匹配
  const promptRegex = /<prompt>(.*?)<\/prompt>/s;
  const match = content.match(promptRegex);

  if (match && match[1]) {
    console.log('找到prompt标签内容:');
    console.log(match[1].trim());

    return match[1].trim();
  }

  // 尝试匹配不带标签的内容
  const simpleRegex = /<prompt>(.*)/s;
  const simpleMatch = content.match(simpleRegex);

  if (simpleMatch && simpleMatch[1]) {
    console.log('找到简单prompt内容:');
    console.log(simpleMatch[1].trim());

    return simpleMatch[1].trim();
  }

  console.log('未找到prompt标签内容，尝试其他方法...');

  // 直接提取prompt标签后的内容
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<prompt>')) {
      // 提取此行后面的内容
      const lineContent = lines[i].split('<prompt>')[1];

      if (lineContent) {
        console.log('从行中提取prompt内容:');
        console.log(lineContent.trim());

        return lineContent.trim();
      }

      // 如果当前行没有内容，检查下一行
      if (i + 1 < lines.length) {
        console.log('从下一行提取prompt内容:');
        console.log(lines[i + 1].trim());

        return lines[i + 1].trim();
      }
    }
  }

  console.log('无法提取prompt标签内容');

  return '默认提示词：你是一个有帮助的助手。';
}

const extractedPrompt = extractPrompt(dpmlContent);

console.log('==========================================');
console.log('最终提取的提示词:');
console.log(extractedPrompt);
console.log('==========================================');

// 检查Agent标签与LLM标签
function extractAgentInfo(content) {
  console.log('提取agent和llm标签信息...');

  const agentRegex = /<agent\s+([^>]*)>/;
  const agentMatch = content.match(agentRegex);

  if (agentMatch && agentMatch[1]) {
    console.log('Agent标签属性:');
    console.log(agentMatch[1]);
  }

  const llmRegex = /<llm\s+([^>]*)>/;
  const llmMatch = content.match(llmRegex);

  if (llmMatch && llmMatch[1]) {
    console.log('LLM标签属性:');
    console.log(llmMatch[1]);

    // 解析LLM属性
    const attributes = llmMatch[1].match(/(\w+(?:-\w+)?)\s*=\s*"([^"]*)"/g);

    if (attributes) {
      console.log('LLM属性解析:');
      attributes.forEach(attr => {
        const [key, value] = attr
          .split(/\s*=\s*/)
          .map(s => s.replace(/"/g, ''));

        console.log(`  ${key}: ${value}`);
      });
    }
  }
}

extractAgentInfo(dpmlContent);
