/**
 * 处理器模块测试
 */
import { jest } from '@jest/globals';

import { factory } from '../../api/processorApi';
import { PROCESSOR_ERROR_CODE } from '../../constants';

import type { Document } from '../../types/node';

describe('处理器模块', () => {
  describe('工厂方法', () => {
    it('应该创建处理器实例', () => {
      const processor = factory();

      expect(processor).toBeDefined();
    });

    it('应该使用提供的选项创建处理器', () => {
      const processor = factory({
        strictMode: true,
      });

      expect(processor).toBeDefined();
    });
  });

  describe('处理器功能', () => {
    it('应该处理简单文档', async () => {
      const processor = factory();
      const document: Document = {
        type: 'document',
        children: [
          {
            type: 'element',
            name: 'root',
            attributes: {},
            children: [],
          },
        ],
      };

      const result = await processor.process(document, 'test.json');

      expect(result).toBeDefined();
      expect(result.children).toHaveLength(1);
    });
  });
});
