import { parse, process, Element, Content, Node, NodeType } from '../../../packages/core';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 基本文档处理示例
 */
async function basicProcessing(): Promise<void> {
  try {
    // 读取DPML文件
    const filePath = path.resolve(__dirname, 'sample-dpml.xml');
    const dpmlContent = await fs.readFile(filePath, 'utf-8');
    console.log('已加载DPML文件:', filePath);
    
    // 1. 解析DPML文本
    console.log('\n=== 解析DPML文档 ===');
    const parseResult = await parse(dpmlContent);
    console.log('解析完成');
    
    if (parseResult.errors && parseResult.errors.length > 0) {
      console.log('\n解析警告/错误:');
      parseResult.errors.forEach((error: any) => {
        console.log(`- ${error.message}`);
      });
      
      // 如果没有AST，则返回
      if (!parseResult.ast) {
        console.log('无法继续处理：解析失败');
        return;
      }
    }
    
    // 输出AST结构摘要
    const ast = parseResult.ast;
    console.log('\nAST结构摘要:');
    console.log(`- 文档类型: ${ast.type}`);
    
    if (ast.children && ast.children.length > 0 && ast.children[0].type === NodeType.ELEMENT) {
      const rootElement = ast.children[0] as Element;
      console.log(`- 根元素标签: ${rootElement.tagName}`);
      console.log(`- 根元素ID: ${rootElement.attributes.id || '未设置'}`);
      console.log(`- 子元素数量: ${rootElement.children.length}`);
    } else {
      console.log('- 文档结构异常：找不到根元素');
      return;
    }
    
    // 2. 处理AST
    console.log('\n=== 处理DPML文档 ===');
    try {
      const processedDoc = await process(ast);
      console.log('处理成功！');
      
      // 提取文档中的关键信息
      const promptElement = ast.children[0] as Element;
      
      // 提取元数据
      console.log('\n=== 文档元数据 ===');
      const metadataElement = promptElement.children.find(
        (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'metadata'
      ) as Element | undefined;
      
      if (metadataElement) {
        // 提取标题
        const titleElement = metadataElement.children.find(
          (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'title'
        ) as Element | undefined;
        
        if (titleElement && titleElement.children.length > 0) {
          const titleContent = titleElement.children[0] as Content;
          console.log(`标题: ${titleContent.value.trim()}`);
        }
        
        // 提取作者
        const authorElement = metadataElement.children.find(
          (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'author'
        ) as Element | undefined;
        
        if (authorElement && authorElement.children.length > 0) {
          const authorContent = authorElement.children[0] as Content;
          console.log(`作者: ${authorContent.value.trim()}`);
        }
      }
      
      // 提取角色信息
      console.log('\n=== 角色信息 ===');
      const roleElement = promptElement.children.find(
        (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'role'
      ) as Element | undefined;
      
      if (roleElement) {
        console.log(`角色名称: ${roleElement.attributes.name || '未指定'}`);
        console.log(`角色专长: ${roleElement.attributes.expertise || '未指定'}`);
        
        if (roleElement.children.length > 0) {
          const roleDescription = roleElement.children
            .filter((child: Node) => child.type === NodeType.CONTENT)
            .map((child: Node) => (child as Content).value.trim())
            .join(' ');
          
          console.log(`角色描述: ${roleDescription}`);
        }
      }
      
      // 提取上下文信息
      console.log('\n=== 上下文信息 ===');
      const contextElement = promptElement.children.find(
        (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'context'
      ) as Element | undefined;
      
      if (contextElement && contextElement.children.length > 0) {
        const contextContent = contextElement.children
          .filter((child: Node) => child.type === NodeType.CONTENT)
          .map((child: Node) => (child as Content).value.trim())
          .join('\n');
        
        console.log(contextContent);
      }
      
      // 提取思考过程
      console.log('\n=== 思考过程 ===');
      const thinkingElement = promptElement.children.find(
        (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'thinking'
      ) as Element | undefined;
      
      if (thinkingElement && thinkingElement.children.length > 0) {
        const thinkingContent = thinkingElement.children
          .filter((child: Node) => child.type === NodeType.CONTENT)
          .map((child: Node) => (child as Content).value.trim())
          .join('\n');
        
        console.log(thinkingContent);
      }
      
      // 提取执行步骤信息 (sample-dpml.xml中使用executing而不是instructions)
      console.log('\n=== 执行步骤信息 ===');
      const executingElement = promptElement.children.find(
        (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'executing'
      ) as Element | undefined;
      
      if (executingElement) {
        const stepElements = executingElement.children.filter(
          (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'step'
        ) as Element[];
        
        if (stepElements.length > 0) {
          stepElements.forEach((step: Element, index: number) => {
            const stepContent = step.children
              .filter((child: Node) => child.type === NodeType.CONTENT)
              .map((child: Node) => (child as Content).value.trim())
              .join(' ');
            
            console.log(`步骤 ${index + 1} (${step.attributes.id || '无ID'}): ${stepContent}`);
          });
        } else {
          console.log('没有找到步骤元素');
        }
      }
      
      // 提取引用信息
      console.log('\n=== 引用信息 ===');
      const referencesElement = promptElement.children.find(
        (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'references'
      ) as Element | undefined;
      
      if (referencesElement) {
        const referenceElements = referencesElement.children.filter(
          (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'reference'
        ) as Element[];
        
        if (referenceElements.length > 0) {
          referenceElements.forEach((reference: Element) => {
            console.log(`- ${reference.attributes.id || '无ID'}: ${reference.attributes.url || '无URL'}`);
          });
        } else {
          console.log('没有找到引用元素');
        }
      }
      
    } catch (processingError: any) {
      console.error('文档处理错误:', processingError.message);
    }
  } catch (error: any) {
    console.error('处理错误:', error.message);
  }
}

/**
 * 使用处理选项的进阶示例
 */
async function processingWithOptions(): Promise<void> {
  try {
    // 使用sample-dpml.xml文件
    const filePath = path.resolve(__dirname, 'sample-dpml.xml');
    const dpmlContent = await fs.readFile(filePath, 'utf-8');
    
    // 解析DPML文本
    const parseResult = await parse(dpmlContent);
    
    // 检查解析结果
    if (!parseResult.ast || (parseResult.errors && parseResult.errors.length > 0 && !parseResult.ast.children)) {
      console.log('\n=== 使用处理选项 ===');
      console.log('无法处理：解析失败');
      return;
    }
    
    console.log('\n=== 使用处理选项 ===');
    // 使用选项处理AST
    try {
      const processedDoc = await process(parseResult.ast, {
        strictMode: false,       // 非严格模式
        errorRecovery: true,     // 出错时继续处理
        basePath: __dirname      // 解析相对路径的基础目录
      });
      
      console.log('处理选项已应用');
      
      if (processedDoc && processedDoc.children && processedDoc.children.length > 0) {
        const rootElement = processedDoc.children[0] as Element;
        if (rootElement.attributes) {
          console.log('文档ID:', rootElement.attributes.id || '未指定');
          console.log('处理模式:', rootElement.attributes.mode || '未指定');
        } else {
          console.log('根元素没有属性');
        }
      } else {
        console.log('处理后的文档结构异常');
      }
    } catch (processingError: any) {
      console.error('使用处理选项时出错:', processingError.message);
    }
  } catch (error: any) {
    console.error('处理选项错误:', error.message);
  }
}

/**
 * 展示DPML继承功能的示例
 */
async function inheritanceExample(): Promise<void> {
  try {
    console.log('\n=== DPML继承功能示例 ===');
    
    // 读取基础模板文件
    const baseTemplatePath = path.resolve(__dirname, 'base-template.xml');
    const baseTemplateContent = await fs.readFile(baseTemplatePath, 'utf-8');
    console.log('已加载基础模板:', baseTemplatePath);
    
    // 解析基础模板
    const baseParseResult = await parse(baseTemplateContent);
    if (!baseParseResult.ast) {
      console.log('基础模板解析失败');
      return;
    }
    
    // 读取扩展模板文件
    const extendedSamplePath = path.resolve(__dirname, 'extended-sample.xml');
    const extendedSampleContent = await fs.readFile(extendedSamplePath, 'utf-8');
    console.log('已加载扩展示例:', extendedSamplePath);
    
    // 解析扩展模板
    const extendedParseResult = await parse(extendedSampleContent);
    if (!extendedParseResult.ast) {
      console.log('扩展示例解析失败');
      return;
    }
    
    // 处理扩展模板
    console.log('\n处理带有继承特性的DPML文档...');
    const processedDoc = await process(extendedParseResult.ast, {
      strictMode: false,
      errorRecovery: true,
      basePath: __dirname
    });
    
    console.log('处理成功！\n');
    
    // 提取和显示继承前后的信息
    const basePrompt = baseParseResult.ast.children[0] as Element;
    const extendedPrompt = processedDoc.children[0] as Element;
    
    // 1. 展示根元素继承
    console.log('=== 根元素继承 ===');
    console.log(`基础模板ID: ${basePrompt.attributes.id}`);
    console.log(`扩展模板ID: ${extendedPrompt.attributes.id}`);
    console.log(`继承关系: ${extendedPrompt.attributes.extends}`);
    
    // 2. 展示角色元素的继承
    console.log('\n=== 角色元素继承 ===');
    const baseRole = basePrompt.children.find(
      (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'role'
    ) as Element;
    
    const extendedRole = extendedPrompt.children.find(
      (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'role'
    ) as Element;
    
    if (baseRole && extendedRole) {
      console.log('基础角色:');
      console.log(`- ID: ${baseRole.attributes.id}`);
      console.log(`- 名称: ${baseRole.attributes.name}`);
      console.log(`- 专长: ${baseRole.attributes.expertise}`);
      console.log(`- 内容: ${baseRole.children[0].type === NodeType.CONTENT ? (baseRole.children[0] as Content).value.trim() : '无内容'}`);
      
      console.log('\n扩展角色:');
      console.log(`- ID: ${extendedRole.attributes.id || '继承自基础角色'}`);
      console.log(`- 名称: ${extendedRole.attributes.name}`);
      console.log(`- 专长: ${extendedRole.attributes.expertise}`);
      console.log(`- 继承自: ${extendedRole.attributes.extends}`);
      
      if (extendedRole.children && extendedRole.children.length > 0) {
        const roleContent = extendedRole.children
          .filter((child: Node) => child.type === NodeType.CONTENT)
          .map((child: Node) => (child as Content).value.trim())
          .join('\n');
        
        console.log(`- 内容: ${roleContent || '无内容（继承自基础角色）'}`);
      }
    }
    
    // 3. 展示上下文元素的继承（仅继承内容但不覆盖的情况）
    console.log('\n=== 上下文元素继承（仅继承内容） ===');
    const baseContext = basePrompt.children.find(
      (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'context'
    ) as Element;
    
    const extendedContext = extendedPrompt.children.find(
      (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'context'
    ) as Element;
    
    if (baseContext && extendedContext) {
      console.log('基础上下文:');
      console.log(`- ID: ${baseContext.attributes.id}`);
      console.log(`- 内容: ${baseContext.children[0].type === NodeType.CONTENT ? (baseContext.children[0] as Content).value.trim() : '无内容'}`);
      
      console.log('\n扩展上下文:');
      console.log(`- 继承自: ${extendedContext.attributes.extends}`);
      
      if (extendedContext.children && extendedContext.children.length > 0) {
        const contextContent = extendedContext.children
          .filter((child: Node) => child.type === NodeType.CONTENT)
          .map((child: Node) => (child as Content).value.trim())
          .join('\n');
        
        console.log(`- 内容: ${contextContent || '继承自基础上下文的内容'}`);
      }
    }
    
    // 4. 展示执行步骤元素的继承（继承并添加新内容的情况）
    console.log('\n=== 执行步骤继承（继承并扩展） ===');
    const baseExecuting = basePrompt.children.find(
      (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'executing'
    ) as Element;
    
    const extendedExecuting = extendedPrompt.children.find(
      (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'executing'
    ) as Element;
    
    if (baseExecuting && extendedExecuting) {
      console.log('基础执行步骤:');
      const baseSteps = baseExecuting.children.filter(
        (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'step'
      ) as Element[];
      
      baseSteps.forEach((step: Element, index: number) => {
        const stepContent = step.children
          .filter((child: Node) => child.type === NodeType.CONTENT)
          .map((child: Node) => (child as Content).value.trim())
          .join(' ');
        
        console.log(`- 步骤 ${index + 1} (${step.attributes.id}): ${stepContent}`);
      });
      
      console.log('\n扩展执行步骤:');
      console.log(`- 继承自: ${extendedExecuting.attributes.extends}`);
      
      const extendedSteps = extendedExecuting.children.filter(
        (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'step'
      ) as Element[];
      
      extendedSteps.forEach((step: Element, index: number) => {
        const stepContent = step.children
          .filter((child: Node) => child.type === NodeType.CONTENT)
          .map((child: Node) => (child as Content).value.trim())
          .join(' ');
        
        console.log(`- 步骤 ${index + 1} (${step.attributes.id}): ${stepContent}`);
      });
    }
    
    // 5. 展示思考过程元素（未使用继承的情况）
    console.log('\n=== 思考过程（未使用继承） ===');
    const baseThinking = basePrompt.children.find(
      (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'thinking'
    ) as Element;
    
    const extendedThinking = extendedPrompt.children.find(
      (child: Node) => child.type === NodeType.ELEMENT && (child as Element).tagName === 'thinking'
    ) as Element;
    
    if (baseThinking && extendedThinking) {
      console.log('基础思考过程:');
      const baseThinkingContent = baseThinking.children
        .filter((child: Node) => child.type === NodeType.CONTENT)
        .map((child: Node) => (child as Content).value.trim())
        .join('\n');
      
      console.log(`- 内容: ${baseThinkingContent}`);
      
      console.log('\n扩展思考过程:');
      console.log(`- 使用继承: ${extendedThinking.attributes.extends ? '是' : '否'}`);
      
      const extendedThinkingContent = extendedThinking.children
        .filter((child: Node) => child.type === NodeType.CONTENT)
        .map((child: Node) => (child as Content).value.trim())
        .join('\n');
      
      console.log(`- 内容: ${extendedThinkingContent}`);
    }
  } catch (error: any) {
    console.error('继承示例错误:', error.message);
  }
}

// 运行示例
async function main(): Promise<void> {
  console.log('=== DPML文档处理示例 ===\n');
  await basicProcessing();
  await processingWithOptions();
  await inheritanceExample();
}

main().catch(error => {
  console.error('程序执行错误:', error);
  process.exit(1);
}); 