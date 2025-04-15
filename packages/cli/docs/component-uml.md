# DPML CLI 组件类图

本文档提供DPML CLI的主要组件及其关系的UML类图。

## 核心组件类图

> **注意**: 以下是Mermaid格式的类图。如果遇到渲染问题，可以使用VS Code的"Markdown Preview Mermaid Support"插件，或者访问 https://mermaid.live 粘贴代码查看。

```mermaid
classDiagram
    %% 核心类
    class CLI {
        -commandRegistry: CommandRegistry
        -commandLoader: CommandLoader
        -commandExecutor: CommandExecutor
        -configManager: ConfigManager
        +initialize()
        +run(argv: string[])
    }
    
    %% 命令注册与管理
    class CommandRegistry {
        -domains: Map~string, DomainCommandSet~
        +register(domain: string, commandSet: DomainCommandSet)
        +getDomain(domainName: string): DomainCommandSet
        +getCommand(domainName: string, commandName: string): Command
        +getAllDomains(): string[]
        +serialize(): object
        +deserialize(data: object)
    }
    
    class CommandLoader {
        -registry: CommandRegistry
        -configManager: ConfigManager
        +loadMappingFile(): boolean
        +saveMappingFile()
        +scanPackages()
        +loadDomainCommands(domainName: string)
        +refreshMappings(specific?: string)
    }
    
    class CommandExecutor {
        -registry: CommandRegistry
        -program: any
        +buildCommandStructure()
        +executeCommand(domainName: string, commandName: string, args: any)
        +handleErrors(error: Error)
    }
    
    %% 配置管理
    class ConfigManager {
        -configPath: string
        -config: object
        +load()
        +save()
        +get(key: string)
        +set(key: string, value: any)
        +ensureConfigDir()
    }
    
    %% 接口定义
    class Command {
        <<interface>>
        +name: string
        +description: string
        +options: CommandOption[]
        +examples: string[]
        +execute(args: any): Promise~void~
    }
    
    class DomainCommandSet {
        +domain: string
        +package: string
        +commandsPath: string
        +version: string
        +commands: Map~string, Command~
        +hooks: object
        +loadCommands()
    }
    
    %% 工具类
    class PathUtils {
        +getUserHome(): string
        +getDpmlConfigDir(): string
        +getMappingFilePath(): string
        +findNodeModules(): string[]
    }
    
    %% 关系定义
    CLI *-- CommandRegistry : 使用
    CLI *-- CommandLoader : 使用
    CLI *-- CommandExecutor : 使用
    CLI *-- ConfigManager : 使用
    
    CommandLoader --> CommandRegistry : 注册命令
    CommandLoader --> ConfigManager : 读取/写入配置
    CommandLoader --> PathUtils : 使用路径工具
    
    CommandExecutor --> CommandRegistry : 获取命令
    
    DomainCommandSet *-- "many" Command : 包含
    
    CommandRegistry o-- "many" DomainCommandSet : 管理
```

## 包间依赖关系与命令注册

```mermaid
classDiagram
    class DpmlCLI {
        <<package>>
        +CommandRegistry
        +CommandLoader
        +CommandExecutor
    }
    
    class DpmlPrompt {
        <<package>>
        +validateCommand: Command
        +renderCommand: Command
        +dpmlCommands.js
    }
    
    class DpmlAgent {
        <<package>>
        +runCommand: Command
        +configCommand: Command
        +dpmlCommands.js
    }
    
    class DpmlWorkflow {
        <<package>>
        +runCommand: Command
        +dpmlCommands.js
    }
    
    class DpmlCore {
        <<package>>
    }
    
    class DpmlLogger {
        <<package>>
        +log()
        +error()
        +warning()
    }
    
    DpmlCLI ..> DpmlPrompt : 发现并加载命令
    DpmlCLI ..> DpmlAgent : 发现并加载命令
    DpmlCLI ..> DpmlWorkflow : 发现并加载命令
    DpmlCLI --> DpmlLogger : 使用
    
    DpmlPrompt --> DpmlCore : 依赖
    DpmlAgent --> DpmlCore : 依赖
    DpmlAgent --> DpmlPrompt : 依赖
    DpmlWorkflow --> DpmlAgent : 依赖
    
    DpmlPrompt --> DpmlLogger : 使用
    DpmlAgent --> DpmlLogger : 使用
    DpmlWorkflow --> DpmlLogger : 使用
```

## 命令处理流程

```mermaid
stateDiagram-v2
    [*] --> CLI初始化
    CLI初始化 --> 解析参数
    解析参数 --> 加载命令映射
    加载命令映射 --> 是否需要刷新?
    
    是否需要刷新? --> 是: 扫描包
    是 --> 更新映射文件
    更新映射文件 --> 确定目标领域
    
    是否需要刷新? --> 否: 确定目标领域
    确定目标领域 --> 加载领域命令
    加载领域命令 --> 执行指定命令
    执行指定命令 --> [*]
```

## 文件结构与模块关系

```mermaid
graph TD
    A[bin.ts] --> B[index.ts]
    B --> C[core/]
    C --> C1[registry.ts]
    C --> C2[loader.ts]
    C --> C3[executor.ts]
    C --> C4[config.ts]
    
    B --> D[utils/]
    D --> D2[paths.ts]
    
    B --> E[types/]
    E --> E1[command.ts]
    E --> E2[config.ts]
    
    C1 -.-> E1
    C2 -.-> E1
    C2 -.-> E2
    C3 -.-> E1
    C4 -.-> E2
```

## 命令发现和执行序列图

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant CommandLoader
    participant CommandRegistry
    participant DomainPackage
    
    User->>CLI: 执行命令 dpml prompt validate file.dpml
    CLI->>CommandLoader: 加载领域映射
    CommandLoader->>CommandRegistry: 获取prompt领域信息
    
    alt 领域未注册或需要刷新
        CommandLoader->>CommandLoader: 扫描包
        CommandLoader->>DomainPackage: 查找@dpml/prompt
        DomainPackage-->>CommandLoader: 返回命令配置
        CommandLoader->>CommandRegistry: 注册领域命令
    end
    
    CommandRegistry-->>CLI: 返回prompt领域命令信息
    CLI->>DomainPackage: 动态导入validate命令
    DomainPackage-->>CLI: 返回命令实现
    CLI->>DomainPackage: 执行命令(调用command.execute())
    DomainPackage-->>User: 显示结果
``` 