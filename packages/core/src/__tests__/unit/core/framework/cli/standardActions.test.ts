/**
 * 标准命令单元测试
 */
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { parse } from '../../../../../api/parser';
import { processDocument } from '../../../../../api/processing';
import { processSchema } from '../../../../../api/schema';
import { standardActions } from '../../../../../core/framework/cli/standardActions';
import { createStandardActionTestFixture, createTestFileContent, createInvalidTestFileContent } from '../../../../fixtures/framework/cliFixtures';

// 模拟依赖模块
vi.mock('fs/promises');
vi.mock('../../../../../api/parser');
vi.mock('../../../../../api/processing');
vi.mock('../../../../../api/schema');

describe('UT-STDACT: 标准命令测试', () => {
  // 测试夹具
  const fixture = createStandardActionTestFixture();
  let tempDir: string;
  let testFilePath: string;

  // 模拟函数
  let mockReadFile: any;
  let mockWriteFile: any;
  let mockParse: any;
  let mockProcessDocument: any;
  let mockProcessSchema: any;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(async () => {
    // 重置模拟
    vi.resetAllMocks();

    // 创建临时目录路径
    tempDir = path.join(os.tmpdir(), 'dpml-test-' + Math.random().toString(36).substring(2, 10));
    testFilePath = path.join(tempDir, 'test.dpml');

    // 设置模拟函数
    mockReadFile = vi.mocked(fs.readFile).mockResolvedValue(fixture.fileContent);
    mockWriteFile = vi.mocked(fs.writeFile).mockResolvedValue();
    mockParse = vi.mocked(parse).mockResolvedValue({
      rootNode: {
        tagName: 'test',
        attributes: new Map([['id', '123']]),
        children: [],
        content: 'Test content'
      }
    });
    mockProcessDocument = vi.mocked(processDocument).mockReturnValue({
      document: {
        rootNode: {
          tagName: 'test',
          attributes: new Map([['id', '123']]),
          children: [],
          content: 'Test content'
        }
      },
      isValid: true,
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      }
    });
    mockProcessSchema = vi.mocked(processSchema).mockReturnValue({
      schema: fixture.context.schema,
      isValid: true
    });

    // 监听控制台输出
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('UT-STDACT-01: standardActions应定义validate命令', () => {
    // 验证validate命令存在
    const validateCommand = standardActions.find(cmd => cmd.name === 'validate');

    expect(validateCommand).toBeDefined();
    expect(validateCommand?.description).toContain('验证DPML文档');

    // 验证参数定义
    expect(validateCommand?.args).toHaveLength(1);
    expect(validateCommand?.args?.[0].name).toBe('file');
    expect(validateCommand?.args?.[0].required).toBe(true);

    // 验证选项定义
    expect(validateCommand?.options).toHaveLength(1);
    expect(validateCommand?.options?.[0].flags).toBe('--strict');

    // 验证执行器函数
    expect(validateCommand?.executor).toBeTypeOf('function');
  });

  it('UT-STDACT-02: standardActions应定义parse命令', () => {
    // 验证parse命令存在
    const parseCommand = standardActions.find(cmd => cmd.name === 'parse');

    expect(parseCommand).toBeDefined();
    expect(parseCommand?.description).toContain('解析DPML文档');

    // 验证参数定义
    expect(parseCommand?.args).toHaveLength(1);
    expect(parseCommand?.args?.[0].name).toBe('file');
    expect(parseCommand?.args?.[0].required).toBe(true);

    // 验证选项定义
    expect(parseCommand?.options).toHaveLength(2);
    expect(parseCommand?.options?.[0].flags).toBe('--output <file>');
    expect(parseCommand?.options?.[1].flags).toBe('--format <format>');
    expect(parseCommand?.options?.[1].defaultValue).toBe('json');

    // 验证执行器函数
    expect(parseCommand?.executor).toBeTypeOf('function');
  });

  it('UT-STDACT-04: validate命令executor应正确执行验证', async () => {
    // 获取validate命令
    const validateCommand = standardActions.find(cmd => cmd.name === 'validate');

    expect(validateCommand).toBeDefined();

    if (!validateCommand) return; // TypeScript类型保护

    // 执行命令
    const result = await validateCommand.executor(
      fixture.context,
      testFilePath,
      { strict: true }
    );

    // 验证文件读取
    expect(mockReadFile).toHaveBeenCalledWith(testFilePath, 'utf-8');

    // 验证Schema处理
    expect(mockProcessSchema).toHaveBeenCalledWith(fixture.context.schema);

    // 验证解析调用
    expect(mockParse).toHaveBeenCalledWith(fixture.fileContent);

    // 验证文档处理
    expect(mockProcessDocument).toHaveBeenCalled();

    // 验证返回结果
    expect(result).toEqual({
      isValid: true,
      errors: [],
      warnings: []
    });

    // 验证日志输出
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('验证成功'));
  });

  it('validate命令应处理验证失败的情况', async () => {
    // 获取validate命令
    const validateCommand = standardActions.find(cmd => cmd.name === 'validate');

    expect(validateCommand).toBeDefined();

    if (!validateCommand) return; // TypeScript类型保护

    // 模拟验证失败
    mockProcessDocument.mockReturnValue({
      document: {
        rootNode: {
          tagName: 'test',
          attributes: new Map(),
          children: [],
          content: 'Test content'
        }
      },
      isValid: false,
      validation: {
        isValid: false,
        errors: [{ message: '缺少必需的id属性' }],
        warnings: []
      }
    });

    // 执行命令 - 非严格模式
    const result = await validateCommand.executor(
      fixture.context,
      testFilePath,
      { strict: false }
    );

    // 验证返回结果
    expect(result).toEqual({
      isValid: false,
      errors: [{ message: '缺少必需的id属性' }],
      warnings: []
    });

    // 验证错误日志
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('验证失败'));

    // 重置模拟
    vi.clearAllMocks();

    // 执行命令 - 严格模式，应该抛出错误
    console.log('开始测试严格模式抛出错误的情况');
    console.log('传入的strict参数:', { strict: true });

    // 使用try/catch来捕获错误
    try {
      await validateCommand.executor(
        fixture.context,
        testFilePath,
        { strict: true }
      );
      // 如果执行到这里，说明没有抛出错误
      console.log('错误: 没有抛出预期的错误');
      fail('应该抛出错误，但没有');
    } catch (error) {
      // 验证错误消息
      console.log('捕获到错误:', error.message);
      expect(error.message).toBe('文档验证失败');
    }
  });

  it('parse命令executor应正确执行解析', async () => {
    // 获取parse命令
    const parseCommand = standardActions.find(cmd => cmd.name === 'parse');

    expect(parseCommand).toBeDefined();

    if (!parseCommand) return; // TypeScript类型保护

    // 执行命令 - 输出到控制台
    const result = await parseCommand.executor(
      fixture.context,
      testFilePath,
      { format: 'json' }
    );

    // 验证文件读取
    expect(mockReadFile).toHaveBeenCalledWith(testFilePath, 'utf-8');

    // 验证解析调用
    expect(mockParse).toHaveBeenCalledWith(fixture.fileContent);

    // 验证Schema处理
    expect(mockProcessSchema).toHaveBeenCalledWith(fixture.context.schema);

    // 验证文档处理
    expect(mockProcessDocument).toHaveBeenCalled();

    // 验证返回结果
    expect(result).toHaveProperty('document');
    expect(result).toHaveProperty('isValid', true);
    expect(result).toHaveProperty('validation');

    // 验证日志输出
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('解析结果'));

    // 重置模拟
    vi.clearAllMocks();

    // 执行命令 - 输出到文件
    await parseCommand.executor(
      fixture.context,
      testFilePath,
      { format: 'json', output: 'output.json' }
    );

    // 验证文件写入
    expect(mockWriteFile).toHaveBeenCalledWith('output.json', expect.any(String), 'utf-8');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('结果已保存到'));
  });

  it('parse命令应处理不支持的格式', async () => {
    // 获取parse命令
    const parseCommand = standardActions.find(cmd => cmd.name === 'parse');

    expect(parseCommand).toBeDefined();

    if (!parseCommand) return; // TypeScript类型保护

    // 执行命令 - 不支持的格式
    await expect(parseCommand.executor(
      fixture.context,
      testFilePath,
      { format: 'unsupported' }
    )).rejects.toThrow('不支持的输出格式');
  });

  it('命令应处理文件读取错误', async () => {
    // 获取validate命令
    const validateCommand = standardActions.find(cmd => cmd.name === 'validate');

    expect(validateCommand).toBeDefined();

    if (!validateCommand) return; // TypeScript类型保护

    // 模拟文件读取错误
    mockReadFile.mockRejectedValue(new Error('文件不存在'));

    // 执行命令
    await expect(validateCommand.executor(
      fixture.context,
      testFilePath,
      { strict: true }
    )).rejects.toThrow('文件不存在');

    // 验证错误日志
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('验证文档时出错'));
  });
});
