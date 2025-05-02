/**
 * @dpml/example 基本使用示例
 */
import { exampleDPML } from '@dpml/example';

// DPML工作流文档
const dpmlContent = `
<workflow name="数据处理流程" version="1.0">
  <variables>
    <variable name="inputFile" type="string">data.csv</variable>
    <variable name="outputFormat" type="string">json</variable>
  </variables>
  
  <step id="step1" type="start">
    读取输入文件
  </step>
  
  <step id="step2" type="process">
    数据清洗和转换
  </step>
  
  <step id="step3" type="end">
    保存结果
  </step>
  
  <transition from="step1" to="step2" />
  <transition from="step2" to="step3" />
</workflow>
`;

/**
 * 处理工作流
 */
async function processWorkflow() {
  try {
    // 编译DPML文档为工作流对象
    console.log('正在编译工作流...');
    const workflow = await exampleDPML.compiler.compile(dpmlContent);

    // 输出工作流信息
    console.log('\n工作流信息:');
    console.log(`名称: ${workflow.name}`);
    console.log(`版本: ${workflow.version}`);
    console.log(`变量数量: ${workflow.variables.length}`);
    console.log(`步骤数量: ${workflow.steps.length}`);
    console.log(`转换数量: ${workflow.transitions.length}`);

    // 输出变量详情
    console.log('\n变量:');
    workflow.variables.forEach(variable => {
      console.log(`  ${variable.name} (${variable.type}): ${variable.value}`);
    });

    // 输出步骤详情
    console.log('\n步骤:');
    workflow.steps.forEach(step => {
      console.log(`  [${step.type}] ${step.id}: ${step.description}`);
    });

    // 输出转换详情
    console.log('\n转换:');
    workflow.transitions.forEach(transition => {
      let arrow = `  ${transition.from} --> ${transition.to}`;

      if (transition.condition) {
        arrow += ` [条件: ${transition.condition}]`;
      }

      console.log(arrow);
    });

    console.log('\n工作流处理完成!');
  } catch (error) {
    console.error('工作流处理失败:', error instanceof Error ? error.message : String(error));
  }
}

// 执行示例
processWorkflow();
