# DPML CLI 命令行参数格式规范

本文档定义了DPML CLI的命令行参数格式规范，确保命令行接口的一致性和用户体验。

## 基本命令结构

DPML CLI命令遵循以下基本结构：

```
dpml [全局选项] <领域> <命令> [命令选项] [参数]
```

例如：

```
dpml --verbose prompt validate --strict template.dpml
```

其中：

- `dpml` 是CLI的入口命令
- `--verbose` 是全局选项
- `prompt` 是领域名称
- `validate` 是具体命令
- `--strict` 是命令选项
- `template.dpml` 是命令参数

## 选项格式规范

DPML CLI支持以下标准选项格式：

### 1. 长选项（全称）

使用双横线前缀，可以采用以下两种方式之一：

```
--选项名=值
--选项名 值
```

示例：

```
dpml prompt render --output=result.txt
dpml prompt render --output result.txt
```

长选项名应使用kebab-case格式（小写字母，单词间用横线连接）。

### 2. 短选项（缩写）

使用单横线前缀，通常是长选项的单字符缩写：

```
-选项字符 值
```

示例：

```
dpml prompt render -o result.txt
```

#### 短选项合并

多个不需要值的短选项可以合并：

```
-abc
```

等同于：

```
-a -b -c
```

示例：

```
dpml -vf  # 等同于 dpml -v -f
```

### 3. 布尔选项

不需要值的选项，存在即表示启用（true），不出现则为禁用（false）：

```
--选项名
-选项字符
```

示例：

```
dpml --verbose
dpml -v
```

对于布尔选项，可以使用以下方式显式指定值：

```
--选项名=true|false
```

示例：

```
dpml --verbose=false
```

### 4. 重复选项

某些选项可以多次使用，表示数组值：

```
--选项名 值1 --选项名 值2
-选项字符 值1 -选项字符 值2
```

示例：

```
dpml agent run --input file1.json --input file2.json
dpml agent run -i file1.json -i file2.json
```

### 5. 选项终止符

使用双横线`--`表示选项结束，之后的所有内容都被视为参数而非选项：

```
dpml 命令 -- --这是参数而非选项
```

示例：

```
dpml prompt render -- --filename.txt
```

## 特殊选项规范

以下是DPML CLI中统一的特殊选项：

### 全局选项

这些选项适用于所有命令：

| 长选项      | 短选项 | 描述               |
| ----------- | ------ | ------------------ |
| `--help`    | `-h`   | 显示帮助信息       |
| `--version` | `-V`   | 显示版本信息       |
| `--verbose` | `-v`   | 显示详细输出       |
| `--quiet`   | `-q`   | 静默模式，减少输出 |
| `--refresh` |        | 刷新命令映射       |
| `--config`  | `-c`   | 指定配置文件       |

### 命令特定选项

每个命令可以定义自己的特定选项，但应遵循以下命名惯例：

| 选项类型      | 命名惯例                      | 示例                    |
| ------------- | ----------------------------- | ----------------------- |
| 输入文件/数据 | `--input`, `-i`               | `--input template.dpml` |
| 输出文件/位置 | `--output`, `-o`              | `--output result.txt`   |
| 格式控制      | `--format`                    | `--format json`         |
| 限制选项      | `--limit`, `--max-`, `--min-` | `--max-tokens 1000`     |
| 模式选项      | `--mode`                      | `--mode development`    |

## 参数规范

命令参数（非选项值）通常放在命令和所有选项之后：

```
dpml 领域 命令 [选项] 参数1 参数2 ...
```

参数的含义取决于具体命令。必要参数和可选参数应在帮助信息中明确标示。

## 错误处理

当用户提供无效选项或参数时，CLI应：

1. 显示有意义的错误信息，指明问题所在
2. 提示正确的使用方式
3. 退出并返回非零状态码

示例错误消息：

```
错误：未知选项 '--invalidOption'
使用 'dpml prompt validate --help' 查看有效选项
```

## 帮助信息

通过`--help`或`-h`可查看帮助信息：

```
dpml --help                  # 显示全局帮助
dpml prompt --help           # 显示领域帮助
dpml prompt validate --help  # 显示命令帮助
```

帮助信息应包含：

- 命令语法
- 选项描述
- 参数描述
- 使用示例

## 环境变量

某些选项可以通过环境变量设置默认值：

```
DPML_VERBOSE=true dpml prompt validate
```

等同于：

```
dpml --verbose prompt validate
```

主要环境变量：

| 环境变量       | 对应选项    | 描述             |
| -------------- | ----------- | ---------------- |
| `DPML_VERBOSE` | `--verbose` | 启用详细输出     |
| `DPML_CONFIG`  | `--config`  | 默认配置文件路径 |
| `DPML_FORMAT`  | `--format`  | 默认输出格式     |

## 示例用法

以下是一些完整的命令示例：

```bash
# 验证提示模板
dpml prompt validate template.dpml

# 验证并显示详细信息
dpml prompt validate --verbose template.dpml

# 渲染提示模板并指定输出
dpml prompt render --input template.dpml --output result.txt

# 以JSON格式查看代理配置
dpml agent config --format json myagent

# 静默模式运行工作流
dpml workflow run --quiet myworkflow.yml

# 组合短选项
dpml -vf prompt validate template.dpml

# 使用环境变量设置详细输出
DPML_VERBOSE=true dpml prompt validate template.dpml
```
