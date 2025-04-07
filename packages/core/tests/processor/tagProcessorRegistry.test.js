describe('TagProcessorRegistry Interface', () => {
    // 创建一个模拟的TagProcessor
    class MockTagProcessor {
        constructor(tagName, priority = 0) {
            this.tagName = tagName;
            this.priority = priority;
        }
        canProcess(element) {
            return element.tagName === this.tagName;
        }
        async process(element) {
            if (!element.metadata) {
                element.metadata = {};
            }
            element.metadata.processed = true;
            return element;
        }
    }
    it('should register a processor for a tag', () => {
        // 创建Registry的实例
        const registry = new (class {
            constructor() {
                this.processors = new Map();
            }
            registerProcessor(tagName, processor) {
                const processors = this.processors.get(tagName) || [];
                processors.push(processor);
                this.processors.set(tagName, processors);
            }
            getProcessors(tagName) {
                return this.processors.get(tagName) || [];
            }
        })();
        // 注册处理器
        const processor = new MockTagProcessor('test-tag');
        registry.registerProcessor('test-tag', processor);
        // 验证处理器是否成功注册
        const retrievedProcessors = registry.getProcessors('test-tag');
        expect(retrievedProcessors.length).toBe(1);
        expect(retrievedProcessors[0]).toBe(processor);
    });
    it('should register multiple processors for the same tag', () => {
        // 创建Registry的实例
        const registry = new (class {
            constructor() {
                this.processors = new Map();
            }
            registerProcessor(tagName, processor) {
                const processors = this.processors.get(tagName) || [];
                processors.push(processor);
                this.processors.set(tagName, processors);
            }
            getProcessors(tagName) {
                return this.processors.get(tagName) || [];
            }
        })();
        // 注册多个处理器
        const processor1 = new MockTagProcessor('test-tag', 10);
        const processor2 = new MockTagProcessor('test-tag', 20);
        registry.registerProcessor('test-tag', processor1);
        registry.registerProcessor('test-tag', processor2);
        // 验证处理器是否都成功注册
        const retrievedProcessors = registry.getProcessors('test-tag');
        expect(retrievedProcessors.length).toBe(2);
        expect(retrievedProcessors).toContain(processor1);
        expect(retrievedProcessors).toContain(processor2);
    });
    it('should return empty array for unknown tag', () => {
        // 创建Registry的实例
        const registry = new (class {
            constructor() {
                this.processors = new Map();
            }
            registerProcessor(tagName, processor) {
                const processors = this.processors.get(tagName) || [];
                processors.push(processor);
                this.processors.set(tagName, processors);
            }
            getProcessors(tagName) {
                return this.processors.get(tagName) || [];
            }
        })();
        // 尝试获取未注册标签的处理器
        const retrievedProcessors = registry.getProcessors('unknown-tag');
        expect(retrievedProcessors).toEqual([]);
        expect(retrievedProcessors.length).toBe(0);
    });
});
export {};
//# sourceMappingURL=tagProcessorRegistry.test.js.map