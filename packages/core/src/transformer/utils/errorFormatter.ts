/**
 * 错误格式化工具
 * 
 * 提供统一的错误消息格式化、结构化和丰富错误上下文的功能
 */

import { TransformerVisitor } from '../interfaces/transformerVisitor';
import { ModeConfigOptions } from './modeConfig';

/**
 * 错误上下文信息接口
 */
export interface ErrorContextInfo {
  // 错误发生的操作
  operation?: string;
  
  // 访问者信息
  visitor?: string;
  
  // 节点类型
  nodeType?: string;
  
  // 节点位置信息
  position?: any;
  
  // 文档类型
  document?: string;
  
  // 转换模式
  mode?: string;
  
  // 时间戳
  timestamp?: string;
  
  // 其他自定义上下文信息
  [key: string]: any;
}

/**
 * 格式化错误对象
 * 增强错误信息，添加额外的上下文信息
 * 
 * @param error 原始错误对象
 * @param contextInfo 上下文信息
 * @returns 增强后的错误对象
 */
export function formatError(error: any, contextInfo: ErrorContextInfo): Error {
  let enhancedError: Error;
  
  if (error instanceof Error) {
    enhancedError = error;
  } else {
    enhancedError = new Error(error?.message || String(error));
    (enhancedError as any).originalError = error;
  }
  
  // 添加结构化的上下文信息
  (enhancedError as any).context = {
    ...contextInfo,
    timestamp: contextInfo.timestamp || new Date().toISOString()
  };
  
  // 确保错误消息包含关键上下文信息
  const originalMessage = enhancedError.message;
  let enrichedMessage = originalMessage;
  
  // 在错误消息中添加上下文信息的简短摘要
  if (contextInfo.visitor) {
    enrichedMessage = `[访问者:${contextInfo.visitor}] ${enrichedMessage}`;
  }
  
  if (contextInfo.nodeType) {
    enrichedMessage = `[节点:${contextInfo.nodeType}] ${enrichedMessage}`;
  }
  
  if (contextInfo.operation) {
    enrichedMessage = `[操作:${contextInfo.operation}] ${enrichedMessage}`;
  }
  
  if (contextInfo.mode) {
    enrichedMessage = `[模式:${contextInfo.mode}] ${enrichedMessage}`;
  }
  
  // 保存原始消息并设置增强后的消息
  (enhancedError as any).originalMessage = originalMessage;
  enhancedError.message = enrichedMessage;
  
  return enhancedError;
}

/**
 * 生成标准化的错误日志消息
 * 根据错误严重性和详细程度生成格式一致的日志消息
 * 
 * @param error 错误对象
 * @param modeConfig 模式配置
 * @returns 格式化后的日志消息
 */
export function formatErrorLogMessage(error: Error, modeConfig: ModeConfigOptions): string {
  const context = (error as any).context || {};
  const errorType = context.operation ? `${context.operation}错误` : '转换错误';
  
  // 生成基础消息
  let logMessage = `${errorType}: ${error.message}`;
  
  // 根据详细程度添加额外信息
  if (modeConfig.errorVerbosity === 'detailed' || modeConfig.errorVerbosity === 'debug') {
    if (context.position) {
      const pos = context.position;
      let posInfo = '';
      
      if (pos.start) {
        posInfo = `行:${pos.start.line},列:${pos.start.column}`;
      } else if (typeof pos === 'string') {
        posInfo = pos;
      } else {
        posInfo = JSON.stringify(pos);
      }
      
      logMessage += `\n位置: ${posInfo}`;
    }
    
    // 添加时间戳
    logMessage += `\n时间: ${context.timestamp || new Date().toISOString()}`;
  }
  
  // 调试级别包含最详细的信息
  if (modeConfig.errorVerbosity === 'debug') {
    if (context) {
      logMessage += '\n上下文: ' + JSON.stringify(context, null, 2);
    }
    
    // 添加堆栈信息
    if (error.stack) {
      logMessage += `\n堆栈: ${error.stack}`;
    }
  }
  
  return logMessage;
}

/**
 * 记录访问者错误
 * 格式化并输出访问者错误信息
 * 
 * @param error 错误对象
 * @param visitor 访问者对象
 * @param nodeType 节点类型
 * @param position 位置信息
 * @param modeConfig 模式配置
 * @returns 格式化后的错误对象
 */
export function logVisitorError(
  error: any, 
  visitor: TransformerVisitor, 
  nodeType: string, 
  position: any, 
  modeConfig: ModeConfigOptions
): Error {
  // 提取访问者名称用于错误信息
  const visitorName = visitor.name || '匿名访问者';
  
  // 格式化错误
  const formattedError = formatError(error, {
    visitor: visitorName,
    nodeType,
    position,
    operation: '访问者处理',
    timestamp: new Date().toISOString()
  });
  
  // 生成日志消息
  const logMessage = formatErrorLogMessage(formattedError, modeConfig);
  
  // 在非严格模式下总是记录错误
  if (modeConfig.errorHandling !== 'throw') {
    // 始终记录到控制台
    console.error(logMessage);
    
    // 如果配置为警告模式，额外记录警告
    if (modeConfig.errorHandling === 'warn') {
      console.warn(`警告: ${visitorName} 处理 ${nodeType} 时出错，但将继续处理`);
    }
  }
  
  return formattedError;
}

/**
 * 记录转换错误
 * 格式化并输出转换过程中的错误信息
 * 
 * @param error 错误对象
 * @param operation 操作名称
 * @param modeConfig 模式配置
 * @returns 格式化后的错误对象
 */
export function logTransformError(
  error: any, 
  operation: string, 
  modeConfig: ModeConfigOptions
): Error {
  // 格式化错误
  const formattedError = formatError(error, {
    operation,
    timestamp: new Date().toISOString()
  });
  
  // 生成日志消息
  const logMessage = formatErrorLogMessage(formattedError, modeConfig);
  
  // 在非严格模式下总是记录错误
  if (modeConfig.errorHandling !== 'throw') {
    // 始终记录到控制台
    console.error(logMessage);
    
    // 如果配置为警告模式，额外记录警告
    if (modeConfig.errorHandling === 'warn') {
      console.warn(`警告: ${operation} 时出错，但将继续处理`);
    }
  }
  
  return formattedError;
} 