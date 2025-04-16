# @dpml/common 集成指南

本文档提供将@dpml/common包与其他DPML包集成的详细说明和最佳实践。

## 基本集成

### 添加依赖

在你的包的`package.json`文件中添加@dpml/common依赖：

```json
{
  "dependencies": {
    "@dpml/common": "^1.0.0"
  }
}
```

然后安装依赖：

```bash
pnpm install
```

### 导入模块

@dpml/common包支持以下导入方式：

```typescript
// 导入整个包
import * as common from '@dpml/common';

// 导入特定命名空间
import { logger, utils } from '@dpml/common';

// 直接导入特定模块（推荐，减少打包体积）
import { createLogger } from '@dpml/common/logger';
import { stringUtils } from '@dpml/common/utils';
```

## 与其他DPML包集成

### 与@dpml/core集成

@dpml/core通常只需要使用@dpml/common中的类型定义，可以这样集成：

```typescript
// core/src/types.ts
import { DPMLError, Result } from '@dpml/common/types';

export interface DPMLElement {
  // 使用common中的类型
  validate(): Result<boolean, DPMLError>;
}
```

### 与@dpml/prompt集成

@dpml/prompt可以使用@dpml/common中的日志系统和工具函数：

```typescript
// prompt/src/parser.ts
import { createLogger } from '@dpml/common/logger';
import { stringUtils, pathUtils } from '@dpml/common/utils';

const logger = createLogger('prompt:parser');

export class PromptParser {
  parse(content: string) {
    logger.debug('开始解析提示词模板');
    
    // 使用工具函数
    if (stringUtils.isEmpty(content)) {
      logger.warn('提示词模板为空');
      return null;
    }
    
    // 处理路径
    const normalizedPath = pathUtils.normalize(templatePath);
    
    // 业务逻辑...
    
    logger.info('提示词模板解析完成');
    return result;
  }
}
```

### 与@dpml/agent集成

@dpml/agent可以使用@dpml/common中的HTTP客户端接口和测试工具：

```typescript
// agent/src/llm-client.ts
import { HttpClient } from '@dpml/common/types';
import { createLogger } from '@dpml/common/logger';

const logger = createLogger('agent:llm-client');

export class LLMClient {
  constructor(private httpClient: HttpClient) {}
  
  async complete(prompt: string) {
    logger.debug('发送请求到LLM API');
    
    try {
      const response = await this.httpClient.post('https://api.example.com/v1/complete', {
        prompt,
        max_tokens: 1000
      });
      
      return response.data;
    } catch (error) {
      logger.error('LLM API请求失败', { error });
      throw error;
    }
  }
}
```

### 与@dpml/cli集成

@dpml/cli可以使用@dpml/common中的文件系统接口和日志系统：

```typescript
// cli/src/commands/validate.ts
import { FileSystem } from '@dpml/common/types';
import { createLogger } from '@dpml/common/logger';

const logger = createLogger('cli:validate');

export async function validateCommand(filePath: string, fs: FileSystem) {
  logger.info(`验证文件: ${filePath}`);
  
  if (!(await fs.exists(filePath))) {
    logger.error(`文件不存在: ${filePath}`);
    return 1;
  }
  
  const content = await fs.readFile(filePath, 'utf-8');
  // 验证逻辑...
  
  logger.info('验证成功');
  return 0;
}
```

## 最佳实践

### 日志系统集成

1. **创建包专用日志记录器**：
   ```typescript
   // 为每个模块创建单独的日志记录器
   const logger = createLogger('package-name:module-name');
   ```

2. **统一日志配置**：
   ```typescript
   // 在应用入口点配置
   import { configureLogger, LogLevel } from '@dpml/common/logger';
   
   configureLogger({
     level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
   });
   ```

3. **结构化日志**：
   ```typescript
   // 添加上下文信息
   logger.info('用户操作', { 
     userId: user.id, 
     action: 'login', 
     timestamp: new Date().toISOString() 
   });
   ```

### 错误处理集成

1. **使用标准错误类型**：
   ```typescript
   import { createDPMLError, DPMLErrorCode } from '@dpml/common/types';
   
   function readConfig(path: string) {
     if (!fs.existsSync(path)) {
       throw createDPMLError(
         `配置文件不存在: ${path}`,
         DPMLErrorCode.FILE_NOT_FOUND,
         { path }
       );
     }
   }
   ```

2. **使用Result类型处理可能的错误**：
   ```typescript
   import { Result, success, failure } from '@dpml/common/types';
   
   async function processFile(path: string): Promise<Result<string, Error>> {
     try {
       const content = await fs.readFile(path, 'utf-8');
       return success(content);
     } catch (error) {
       return failure(error instanceof Error ? error : new Error(String(error)));
     }
   }
   ```

### 测试工具集成

1. **使用模拟对象**：
   ```typescript
   import { createMockFileSystem } from '@dpml/common/testing';
   
   describe('配置加载器', () => {
     it('应正确加载配置文件', async () => {
       const mockFs = createMockFileSystem({
         '/app/config.json': '{"debug": true}'
       });
       
       const loader = new ConfigLoader(mockFs);
       const config = await loader.load('/app/config.json');
       
       expect(config.debug).toBe(true);
     });
   });
   ```

2. **测试断言辅助**：
   ```typescript
   import { assertStructure } from '@dpml/common/testing';
   
   test('用户对象应有正确的结构', () => {
     const user = createUser('test@example.com');
     
     assertStructure(user, {
       id: 'string',
       email: 'string',
       created: 'object' // Date类型
     });
   });
   ```

## 常见问题

### 循环依赖问题

**问题**：在大型项目中可能出现循环依赖问题。
**解决方案**：使用接口和类型，而不是直接依赖实现：

```typescript
// 好的做法：依赖接口
import { HttpClient } from '@dpml/common/types';

// 不好的做法：直接依赖实现
import { DefaultHttpClient } from '@dpml/common/network';
```

### 浏览器兼容性

**问题**：某些功能在浏览器中不可用（如文件系统操作）。
**解决方案**：使用平台检测工具：

```typescript
import { platformUtils } from '@dpml/common/utils';

if (platformUtils.isNode()) {
  // Node.js特定代码
} else {
  // 浏览器特定代码
}
```

### 版本不匹配

**问题**：不同包使用不同版本的@dpml/common。
**解决方案**：在项目根目录的package.json中使用pnpm的重写规则：

```json
{
  "pnpm": {
    "overrides": {
      "@dpml/common": "^1.0.0"
    }
  }
}
```

## 进一步阅读

- [API参考文档](./API-Reference.md)
- [日志系统文档](./logger/README.md)
- [测试工具文档](./testing/README.md)
- [工具函数文档](./utils/README.md)
- [类型定义文档](./types/README.md) 