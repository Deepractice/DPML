/**
 * MCP测试夹具入口文件
 * 提供MCP测试所需的所有工具和夹具
 */

// 导出各个组件
export * from './tools';
export * from './server';
export * from './transport-http';
export * from './transport-stdio';
export * from './llm-mock';

// 导出环境变量辅助工具
export * from '../../env-helper';

/**
 * 使用示例:
 *
 * ```typescript
 * // 创建HTTP测试服务器
 * import { TestHttpMcpServer, getMcpTestMode } from '@dpml/agent/src/__tests__/fixtures/mcp';
 *
 * describe('MCP HTTP 测试', () => {
 *   let server: TestHttpMcpServer;
 *
 *   beforeEach(async () => {
 *     server = new TestHttpMcpServer();
 *     await server.start();
 *   });
 *
 *   afterEach(async () => {
 *     await server.stop();
 *   });
 *
 *   test('应该能够调用MCP工具', async () => {
 *     // 使用服务器URL进行测试
 *     const url = server.url;
 *     // ...测试逻辑
 *     expect(server.getCallCount()).toBeGreaterThan(0);
 *   });
 * });
 *
 * // 使用模拟LLM功能
 * import { mockLLMResponse } from '@dpml/agent/src/__tests__/fixtures/mcp';
 *
 * test('应该能够模拟LLM响应', async () => {
 *   const response = await mockLLMResponse('测试提示词', {
 *     response: '预期响应',
 *     modelName: 'test-model'
 *   });
 *
 *   expect(response.text).toBe('预期响应');
 *   expect(response.model).toBe('test-model');
 * });
 *
 * // 大模型调用开关
 * import { isLLMConfigValid, requireRealApi } from '@dpml/agent/src/__tests__/fixtures/mcp';
 *
 * test('真实API调用测试', () => {
 *   requireRealApi('此测试需要真实API');
 *
 *   // 只有在TEST_USE_REAL_API=true时才会运行以下代码
 *   expect(isLLMConfigValid()).toBe(true);
 * });
 * ```
 */
