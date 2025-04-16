## 代码风格与规范

### 导入规范

我们强制使用别名导入替代相对路径导入，详情请参考 [别名导入指南](./eslint-别名导入指南.md)。

例如:
```typescript
// 不推荐
import { Parser } from '../../../core/parser';

// 推荐
import { Parser } from '@core/parser';
``` 