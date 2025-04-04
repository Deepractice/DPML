# Processor模块开发任务清单（基于TDD）
## 重要提示：严格遵循TDD
所有任务必须严格按照以下TDD流程开发：
1. 先编写测试用例
2. 运行测试并确认失败
3. 实现最小代码使测试通过
4. 重构代码
5. 确认测试仍然通过


## 1. 核心框架与基础设施

### 1.1. 设计核心接口与类型
- [x] 编写NodeVisitor接口测试
- [x] 编写Processor接口测试
- [x] 编写ProtocolHandler接口测试
- [x] 编写ReferenceResolver接口测试
- [x] 实现接口和类型定义

### 1.2. 实现ProcessingContext
- [x] 测试上下文创建与存取
- [x] 测试引用缓存机制
- [x] 测试变量管理功能
- [x] 实现ProcessingContext类

### 1.3. 实现DefaultProcessor框架
- [x] 测试访问者注册和排序机制
- [x] 测试处理流程骨架
- [x] 测试节点遍历逻辑
- [x] 实现DefaultProcessor基础框架

## 2. 核心访问者实现

### 2.1. 实现InheritanceVisitor
- [x] 测试基本继承场景
- [x] 测试ID引用继承
- [x] 测试相对路径继承
- [x] 测试HTTP远程继承
- [x] 测试继承属性合并规则
- [x] 测试继承内容合并规则
- [x] 测试继承错误处理
- [x] 实现InheritanceVisitor

### 2.2. 实现ReferenceVisitor
- [ ] 测试内容中引用识别功能
- [ ] 测试引用解析与替换
- [ ] 测试Reference节点处理
- [ ] 测试引用错误处理
- [] 实现ReferenceVisitor

### 2.3. 实现MarkdownContentVisitor
- [ ] 测试Markdown内容处理
- [ ] 测试Markdown格式转换
- [ ] 实现MarkdownContentVisitor

### 2.4. 实现IdValidationVisitor
- [ ] 测试ID收集功能
- [ ] 测试ID唯一性验证
- [ ] 测试ID冲突错误处理
- [] 实现IdValidationVisitor

### 2.5. 实现DocumentMetadataVisitor
- [ ] 测试文档元数据收集功能
- [ ] 测试`mode`属性处理逻辑
- [ ] 测试`lang`属性记录功能
- [ ] 测试`schema`属性处理
- [] 实现DocumentMetadataVisitor

### 2.6. 实现AttributeValidationVisitor
- [ ] 测试属性类型验证
- [ ] 测试属性值范围验证
- [ ] 测试必需属性验证
- [ ] 测试严格模式与宽松模式的验证差异
- [ ] 实现AttributeValidationVisitor

## 3. 引用系统实现

### 3.1. 实现DefaultReferenceResolver
- [ ] 测试引用解析基础功能
- [ ] 测试协议处理器集成
- [ ] 测试引用缓存机制
- [ ] 测试解析错误处理
- [] 实现DefaultReferenceResolver

### 3.2. 实现基础协议处理器
- [ ] 测试HTTP协议处理器
- [ ] 测试文件协议处理器
- [ ] 测试ID协议处理器
- [] 实现基础协议处理器

## 4. 集成测试与端到端测试

### 4.1. 基本处理流程测试
- [ ] 测试简单文档处理
- [ ] 测试完整处理流程

### 4.2. 复杂功能集成测试
- [ ] 测试继承+引用组合场景
- [ ] 测试多级嵌套处理
- [ ] 测试复杂文档处理

### 4.3. 边界条件测试
- [ ] 测试空文档处理
- [ ] 测试大型文档处理
- [ ] 测试异常情况处理

### 4.4. 特殊场景测试
- [ ] 测试特殊字符内容处理
- [ ] 测试XML转义字符处理
- [ ] 测试标签名大小写敏感性
- [ ] 测试无根元素文档处理

## 5. 扩展点测试与实现

### 5.1. 测试访问者扩展能力
- [ ] 测试自定义访问者注册与执行
- [ ] 测试访问者优先级机制
- [ ] 测试多访问者协作

### 5.2. 测试协议处理器扩展
- [ ] 测试自定义协议处理器注册
- [ ] 测试自定义协议解析

### 5.3. 测试引用解析器扩展
- [ ] 测试自定义引用解析器
- [ ] 测试引用转换功能

## 6. 性能优化与边缘场景

### 6.1. 性能测试与优化
- [ ] 测试大文档处理性能
- [ ] 测试引用缓存效果
- [ ] 优化关键路径性能

### 6.2. 内存使用优化
- [ ] 测试内存占用情况
- [ ] 优化大文档处理内存使用

### 6.3. 错误处理完善
- [ ] 测试各类错误场景
- [] 完善错误报告与恢复机制
- [ ] 测试严格模式与宽松模式的错误处理差异
- [] 实现基于`mode`属性的错误处理策略
- [ ] 测试错误信息的清晰度和可用性

### 6.4. 跨平台兼容性
- [ ] 测试Windows路径格式处理
- [ ] 测试Unix路径格式处理
- [ ] 实现平台无关的路径处理工具函数
- [ ] 测试跨平台文件引用处理

## 7. 文档与示例

### 7.1. 编写API文档
- [] 为所有公共接口编写文档
- [ ] 编写使用指南和最佳实践

### 7.2. 创建示例代码
- [ ] 编写基本使用示例
- [ ] 编写扩展开发示例
- [ ] 编写复杂场景示例

## 8. 与其他模块集成

### 8.1. 与Parser集成测试
- [ ] 测试Parser输出到Processor处理流程

### 8.2. 与Transformer集成测试
- [ ] 测试Processor输出到Transformer处理流程

### 8.3. 测试覆盖度量
- [ ] 设置测试覆盖率目标
- [ ] 实现测试覆盖报告生成
- [ ] 确保关键路径100%测试覆盖
- [ ] 监控回归测试质量

## TDD实现范例

每个任务遵循以下TDD流程:

1. **编写测试** - 先编写测试，明确功能需求
2. **运行测试** - 确认测试失败，验证测试有效性
3. **实现功能** - 编写最小化代码使测试通过
4. **优化重构** - 保持测试通过的前提下重构代码
5. **重复循环** - 继续编写下一个测试用例

### 代码示例: InheritanceVisitor测试与实现

测试代码:
```typescript
// tests/visitors/InheritanceVisitor.test.ts
describe('InheritanceVisitor', () => {
  it('should not modify elements without extends attribute', () => {
    const element = {
      type: 'element',
      tagName: 'test',
      attributes: { id: 'test1' },
      children: []
    };
    const context = new ProcessingContext();
    
    const visitor = new InheritanceVisitor();
    const result = await visitor.visitElement(element, context);
    
    expect(result).toEqual(element);
  });
  
  it('should merge attributes from base element', () => {
    // 测试继承属性合并
  });
  
  it('should inherit content when element has no content', () => {
    // 测试内容继承
  });
});
```

实现代码:
```typescript
// src/visitors/InheritanceVisitor.ts
export class InheritanceVisitor implements NodeVisitor {
  priority = 100;
  
  async visitElement(element: Element, context: ProcessingContext): Promise<Element> {
    if (!element.attributes.extends) {
      return element;
    }
    
    // 获取基础元素...
    // 合并属性和内容...
    
    return mergedElement;
  }
}
```

### 代码示例: IdValidationVisitor测试与实现

测试代码:
```typescript
// tests/visitors/IdValidationVisitor.test.ts
describe('IdValidationVisitor', () => {
  it('should collect all IDs in document', () => {
    const document = {
      type: 'document',
      children: [
        { type: 'element', tagName: 'test', attributes: { id: 'test1' }, children: [] },
        { type: 'element', tagName: 'test', attributes: { id: 'test2' }, children: [] }
      ]
    };
    const context = new ProcessingContext();
    
    const visitor = new IdValidationVisitor();
    await visitor.visitDocument(document, context);
    
    expect(context.idMap.size).toBe(2);
    expect(context.idMap.has('test1')).toBe(true);
    expect(context.idMap.has('test2')).toBe(true);
  });
  
  it('should throw error on duplicate IDs', async () => {
    const document = {
      type: 'document',
      children: [
        { type: 'element', tagName: 'test', attributes: { id: 'duplicate' }, children: [] },
        { type: 'element', tagName: 'test', attributes: { id: 'duplicate' }, children: [] }
      ]
    };
    const context = new ProcessingContext();
    
    const visitor = new IdValidationVisitor();
    
    await expect(async () => {
      await visitor.visitDocument(document, context);
    }).rejects.toThrow('Duplicate ID: duplicate');
  });
});
```

实现代码:
```typescript
// src/visitors/IdValidationVisitor.ts
export class IdValidationVisitor implements NodeVisitor {
  priority = 90; // 在继承处理后但在引用处理前
  
  async visitDocument(document: Document, context: ProcessingContext): Promise<Document> {
    // 初始化ID收集映射
    context.idMap = new Map();
    return document;
  }
  
  async visitElement(element: Element, context: ProcessingContext): Promise<Element> {
    if (element.attributes.id) {
      const id = element.attributes.id;
      
      // 检查ID是否已存在
      if (context.idMap.has(id)) {
        throw new DPMLError(`Duplicate ID: ${id}`);
      }
      
      // 存储ID与元素的映射
      context.idMap.set(id, element);
    }
    
    return element;
  }
} 