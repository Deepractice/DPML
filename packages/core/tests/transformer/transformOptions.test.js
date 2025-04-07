import { describe, it, expect } from 'vitest';
describe('TransformOptions', () => {
    it('应该能创建具有默认格式的选项', () => {
        const options = {
            format: 'json'
        };
        expect(options.format).toBe('json');
        expect(options.mode).toBeUndefined();
        expect(options.variables).toBeUndefined();
    });
    it('应该能创建具有指定模式的选项', () => {
        const options = {
            format: 'string',
            mode: 'strict'
        };
        expect(options.format).toBe('string');
        expect(options.mode).toBe('strict');
    });
    it('应该能创建具有变量的选项', () => {
        const options = {
            variables: {
                model: 'gpt-4',
                temperature: 0.7
            }
        };
        expect(options.variables).toBeDefined();
        expect(options.variables?.model).toBe('gpt-4');
        expect(options.variables?.temperature).toBe(0.7);
    });
    it('应该能接受自定义扩展选项', () => {
        const options = {
            format: 'json',
            customOption1: 'value1',
            customOption2: 42,
            customOption3: {
                nestedValue: true
            }
        };
        expect(options.format).toBe('json');
        expect(options.customOption1).toBe('value1');
        expect(options.customOption2).toBe(42);
        expect(options.customOption3.nestedValue).toBe(true);
    });
    it('应该允许宽松模式配置', () => {
        const options = {
            mode: 'loose'
        };
        expect(options.mode).toBe('loose');
    });
});
//# sourceMappingURL=transformOptions.test.js.map