# CLI 模块命令行解析问题

## 问题描述

在测试 DPML CLI 模块时，发现以下几个命令行解析和处理的问题：

1. **`--list` 选项不正常工作**：
   执行 `node ./dist/bin.js --list` 时出现错误 "error: missing required argument 'domain'"，而不是显示可用域列表。

2. **版本显示不正确**：
   执行 `node ./dist/bin.js -v` 或 `node ./dist/bin.js --version` 时，输出了 "[object Promise]" 而不是实际的版本号。

3. **命令解析顺序问题**：
   全局选项（如 `--list`）在处理时仍然要求提供 domain 参数，实际上应该是独立的命令。

4. **域名识别问题**：
   当使用无效的域名时，系统抛出错误但没有提供有用的上下文信息（如可用域列表）。

## 复现步骤

```bash
# 执行 --list 选项，期望列出可用域但收到缺少域参数的错误
node ./dist/bin.js --list
> error: missing required argument 'domain'

# 执行版本命令，显示 Promise 对象而非版本号
node ./dist/bin.js -v
> [object Promise]
node ./dist/bin.js --version
> [object Promise]

# 使用无效域名，错误信息不包含可用域的提示
node ./dist/bin.js domain
> DPMLError: Domain not found: domain
```

## 原因分析

1. **`--list` 选项问题**：
   在 `CommanderAdapter.setupCommands()` 中，`--list` 选项被实现为回调函数，但 Commander 仍然期望 `<domain>` 参数。

2. **版本显示问题**：
   `getVersion()` 方法返回 Promise，但在设置版本时使用 `this.getVersion().toString()` 直接调用，导致显示了 Promise 对象的字符串形式。

3. **命令解析顺序问题**：
   Commander 配置使用了 `.arguments('<domain> [args...]')` 将 domain 设为必需参数，导致全局选项也需要此参数。

4. **错误处理问题**：
   `handleDomainCommand` 中抛出的错误信息不够详细，没有提供可用域的列表。

## 修复建议

1. **修复 `--list` 选项**：
   ```typescript
   // 将 list 实现为独立命令而非选项
   this.program
     .command('list')
     .alias('l')
     .description('List all available DPML domains')
     .action(() => this.handleListOption());
   ```

2. **修复版本显示问题**：
   ```typescript
   // 方案一：使用异步 IIFE 获取版本
   (async () => {
     const version = await this.getVersion();
     this.program.version(version, '-v, --version', 'Display Version');
   })();
   
   // 方案二：改为同步方法
   private getVersionSync(): string {
     try {
       // 使用同步方式读取版本
       const packageJson = require('../../package.json');
       return packageJson.version || '0.1.0';
     } catch (error) {
       return '0.1.0';
     }
   }
   ```

3. **优化命令解析顺序**：
   重新设计命令解析流程，确保全局选项（如 `--list`、`--version`）在 domain 命令之前处理。

4. **增强错误信息**：
   ```typescript
   if (!domainInfo) {
     // 获取可用域列表
     const domains = await this.domainDiscoverer.listDomains();
     const availableDomains = domains.map(d => d.name).join(', ');
     
     throw new DPMLError(
       `Domain not found: ${domain}. Available domains: ${availableDomains || 'none'}`,
       DPMLErrorType.DISCOVERY,
       'DOMAIN_NOT_FOUND'
     );
   }
   ```

## 优先级

中等 - 这些问题影响用户体验但不阻碍核心功能运行。

## 相关模块

- `packages/cli/src/core/adapters/CommanderAdapter.ts`
- `packages/cli/src/bin.ts` 