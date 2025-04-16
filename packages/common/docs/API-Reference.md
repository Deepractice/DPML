# @dpml/common API参考文档

本文档提供@dpml/common包所有公共API的详细说明。

## 目录

1. [日志系统 (Logger)](./logger/README.md)
   - [日志级别](./logger/LogLevel.md)
   - [日志记录器](./logger/Logger.md)
   - [格式化器](./logger/Formatters.md)
   - [传输通道](./logger/Transports.md)
   - [配置系统](./logger/Configuration.md)

2. [测试工具 (Testing)](./testing/README.md)
   - [模拟文件系统](./testing/MockFileSystem.md)
   - [模拟HTTP客户端](./testing/MockHttpClient.md)
   - [测试工具函数](./testing/TestUtils.md)
   - [断言辅助](./testing/Assertions.md)
   - [测试夹具](./testing/Fixtures.md)

3. [通用工具函数 (Utils)](./utils/README.md)
   - [字符串工具](./utils/StringUtils.md)
   - [数组工具](./utils/ArrayUtils.md)
   - [对象工具](./utils/ObjectUtils.md)
   - [异步工具](./utils/AsyncUtils.md)
   - [路径工具](./utils/PathUtils.md)
   - [平台工具](./utils/PlatformUtils.md)

4. [共享类型定义 (Types)](./types/README.md)
   - [错误类型](./types/ErrorTypes.md)
   - [结果类型](./types/ResultTypes.md)
   - [文件系统接口](./types/FileSystem.md)
   - [HTTP客户端接口](./types/HttpClient.md)
   - [工具类型](./types/UtilityTypes.md)

## 模块使用

@dpml/common包设计为支持部分导入，可以只导入需要的模块：

```typescript
// 导入整个包
import * as common from '@dpml/common';

// 导入特定命名空间
import { logger } from '@dpml/common';

// 直接导入特定模块
import { createLogger } from '@dpml/common/logger';
import { stringUtils } from '@dpml/common/utils';
```

## 版本兼容性

本文档适用于@dpml/common v1.x版本。不同版本的API可能有所不同，请确保参考与您使用的版本匹配的文档。 