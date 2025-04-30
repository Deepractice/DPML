# DPML CLI 设计规范

## 1. 概述

DPML CLI是Deepractice Prompt Markup Language的命令行接口，提供了访问DPML核心功能的命令行工具。CLI遵循现代命令行工具的设计规范，提供一致、直观且可扩展的用户体验。

### 1.1 设计原则

- **一致性**：命令结构、参数格式和行为模式保持一致
- **简洁性**：命令简洁明了，易于记忆和使用
- **可发现性**：通过帮助系统使功能易于发现
- **可扩展性**：支持扩展新的领域命令
- **自文档化**：命令和选项的用途通过帮助文本清晰表达

### 1.2 设计标准

DPML CLI遵循以下行业标准：

- **POSIX命令行接口规范**：基本命令行规则
- **GNU命令行参数语法**：长短选项格式规范
- **子命令模式**：多级命令结构
- **多级命令层次结构**：按领域组织命令

## 2. 命令结构

### 2.1 基本命令格式

```
dpml [domain] <action> [args] [options]
```

其中：

- `dpml`：主命令
- `[domain]`：可选的领域名称，不指定时默认为core命令
- `<action>`：必需的操作动词
- `[args]`：位置参数
- `[options]`：选项参数

### 2.2 领域命令规则

领域命令遵循以下规则：

1. **默认领域**：不指定domain时，默认为`core`领域命令
2. **核心模块命令**：如`parser`、`document`、`schema`等为core内部模块命令
3. **扩展领域命令**：基于framework.ts开发的外部领域服务命令

### 2.3 操作命令规则

操作命令必须是动词或动词短语，表示要执行的操作：

1. **通用操作**：如`init`、`list`、`run`
2. **领域特定操作**：如`validate`、`transform`、`compile`

### 2.4 命令示例

```
# 基础全局命令（通过选项实现）
dpml --version                   # 显示版本信息
dpml -v                          # 显示版本信息(简写)
dpml --help                      # 显示帮助信息
dpml -h                          # 显示帮助信息(简写)

# 核心模块命令
dpml parser validate file.dpml   # 验证DPML语法
dpml document transform file.dpml --output=result.json  # 转换文档
dpml schema check file.dpml --schema=user.schema  # 检查模式合规性

# 核心通用命令（省略domain）
dpml init --template=basic       # 初始化DPML项目
dpml list domains                # 列出已安装的领域

# 扩展领域命令
dpml user compile user.dpml      # 使用user领域编译器
dpml analytics process data.dpml # 使用analytics领域处理数据
```

## 3. 参数和选项

### 3.1 位置参数

位置参数是命令的主要操作对象，通过位置识别：

1. **必需参数**：尖括号表示`<file>`
2. **可选参数**：方括号表示`[output]`
3. **参数顺序**：位置参数的顺序是固定的

### 3.2 选项格式

选项使用以下格式：

1. **长选项**：
   - `--option=value`：等号连接值
   - `--option value`：空格连接值
   - `--option`：布尔选项（存在即为true）
   - `--no-option`：布尔选项的否定形式

2. **短选项**：
   - `-o value`：带值短选项
   - `-o`：布尔短选项
   - `-abc`：短选项组合（等同于`-a -b -c`）

### 3.3 选项类型

按功能分类：

1. **配置类选项**：如`--strict`、`--format=json`
2. **输入/输出类选项**：如`--output`、`--input`
3. **行为控制类选项**：如`--verbose`、`--quiet`
4. **环境类选项**：如`--env=production`

### 3.4 通用选项

所有命令支持的标准选项：

1. **帮助选项**：`--help`, `-h`
2. **版本选项**：`--version`, `-v`
3. **详细输出**：`--verbose`
4. **静默输出**：`--quiet`

## 4. 输出规范

### 4.1 输出格式

CLI输出应遵循以下规范：

1. **人类可读输出**：默认提供格式化的、易于人类阅读的输出
2. **机器可读输出**：通过`--format=json|xml|yaml`选项提供机器可读输出
3. **错误输出**：错误信息输出到stderr，正常输出到stdout

### 4.2 输出详细程度

通过选项控制输出详细程度：

1. **正常输出**：默认输出级别
2. **详细输出**：使用`--verbose`或`-v`增加详细程度
3. **静默输出**：使用`--quiet`或`-q`减少输出
4. **调试输出**：使用`--debug`输出调试信息

### 4.3 状态码

命令执行后返回标准POSIX状态码：

- **0**: 成功
- **1**: 一般错误
- **2**: 命令行语法错误
- **3-125**: 特定错误码

## 5. 帮助系统

### 5.1 帮助命令

提供多级帮助信息：

1. **全局帮助**：`dpml --help`或`dpml -h` (作为全局选项)
2. **领域帮助**：`dpml <domain> --help`
3. **命令帮助**：`dpml <domain> <command> --help`

### 5.2 帮助内容

帮助信息应包含：

1. **命令描述**：简要描述命令功能
2. **用法示例**：提供常见用例
3. **参数说明**：详细解释每个参数
4. **选项说明**：详细解释每个选项
5. **相关命令**：列出相关命令

## 6. 实现指南

### 6.1 技术选择

推荐使用Commander.js实现CLI，因为：

1. 简洁的API设计
2. 轻量级依赖
3. 良好的子命令支持
4. 自动生成帮助信息
5. 参数验证能力

### 6.2 代码组织

CLI代码组织应遵循以下结构：

```
core/
  cli/
    cliService.ts         # CLI服务模块
    commands/             # 按领域组织命令
      core/               # 核心命令
        coreCommands.ts
      parser/             # 解析相关命令
        parserCommands.ts
      document/           # 文档相关命令
        documentCommands.ts
    utils/                # CLI工具函数
      optionParser.ts
      formatter.ts
    index.ts              # 入口文件
```

### 6.3 扩展机制

CLI应提供扩展机制，允许外部领域集成到CLI：

1. **领域注册**：允许注册新的领域命令
2. **插件系统**：支持通过插件扩展CLI功能
3. **动态发现**：自动发现已安装的领域命令

## 7. 测试策略

CLI测试应涵盖：

1. **单元测试**：测试命令解析和选项处理
2. **集成测试**：测试与core模块的集成
3. **端到端测试**：测试完整命令执行流程
4. **帮助测试**：验证帮助信息正确性
5. **错误处理测试**：验证错误场景的行为

## 8. 示例实现

### 8.1 基本命令定义

```typescript
import { program } from 'commander';

// 定义主程序，包含全局选项
program
  .name('dpml')
  .description('DPML命令行工具')
  .version('1.0.0')  // 自动添加--version/-v选项
  .helpOption('-h, --help', '显示帮助信息');  // 自定义帮助选项

// 添加核心命令（省略domain部分）
program
  .command('init')
  .description('初始化DPML项目')
  .option('--template <name>', '使用指定模板', 'basic')
  .action((options) => {
    // 实现初始化逻辑
  });

program
  .command('list')
  .argument('<type>', '列表类型：domains, templates等')
  .description('列出可用资源')
  .action((type) => {
    // 实现列表逻辑
  });

// 解析器命令
program
  .command('parser')
  .description('DPML解析器相关命令')
  .action(() => {
    console.log('请指定解析器子命令');
  });

// 解析器验证命令
program
  .command('parser validate')
  .description('验证DPML文件')
  .argument('<file>', 'DPML文件路径')
  .option('--strict', '使用严格模式验证')
  .option('--schema <file>', '使用指定模式验证')
  .action((file, options) => {
    // 实现验证逻辑
  });

// 解析命令行参数
program.parse();
```

### 8.2 领域命令注册

```typescript
// 注册外部领域命令
function registerDomainCommands(program) {
  const domains = loadDomainCommands();
  
  domains.forEach(domain => {
    const domainCommand = program
      .command(domain.name)
      .description(domain.description);
      
    domain.commands.forEach(cmd => {
      const command = domainCommand
        .command(cmd.name)
        .description(cmd.description);
        
      cmd.options.forEach(opt => {
        command.option(opt.flags, opt.description);
      });
      
      command.action(cmd.action);
    });
  });
}
```

## 9. 总结

DPML CLI设计遵循现代命令行工具的最佳实践，提供一致、直观且可扩展的用户体验。通过清晰的命令结构、标准化的参数和选项格式，以及全面的帮助系统，使用户能够高效地使用DPML的功能。

CLI设计充分考虑了扩展性，允许外部领域服务集成到统一的命令行接口中，为DPML生态系统提供了统一的入口点。 