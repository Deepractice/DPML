import { Command } from 'commander';
import chalk from 'chalk';
import { CommandRegistry } from './registry';
import { Command as DpmlCommand, ExecutionContext } from '../types/command';

/**
 * 命令执行器类
 * 负责构建命令结构并执行命令
 */
export class CommandExecutor {
  private registry: CommandRegistry;
  private program: Command;
  private context: ExecutionContext;

  /**
   * 创建命令执行器实例
   * @param registry 命令注册表
   */
  constructor(registry: CommandRegistry) {
    this.registry = registry;
    this.program = new Command();
    this.context = {
      verbose: false,
      quiet: false
    };
  }

  /**
   * 构建命令行程序结构
   * @returns Commander程序对象
   */
  public buildCommandStructure(): Command {
    // 设置程序基本信息
    this.program
      .name('dpml')
      .description('DPML命令行工具')
      .version('0.1.0')
      .option('-v, --verbose', '显示详细日志')
      .option('-q, --quiet', '静默模式')
      .option('--update', '更新命令映射')
      .hook('preAction', (thisCommand, actionCommand) => {
        // 在执行命令前设置上下文
        const opts = actionCommand.opts();
        this.setContext({
          verbose: !!opts.verbose,
          quiet: !!opts.quiet
        });
      });

    // 获取所有领域
    const domains = this.registry.getAllDomains();

    // 为每个领域创建子命令
    for (const domainName of domains) {
      const domainCommand = new Command(domainName)
        .description(`${domainName}领域命令`);

      // 获取领域下的所有命令
      const commands = this.registry.getDomainCommands(domainName);

      // 为每个命令创建子命令
      for (const cmd of commands) {
        const subCommand = new Command(cmd.name)
          .description(cmd.description)
          .action(async (options, command) => {
            try {
              // 获取命令参数
              const cmdObj = command.parent;
              const args = cmdObj.args || [];

              // 执行命令
              await this.executeCommand(domainName, cmd.name, args, options);
            } catch (error: any) {
              this.handleErrors(error);
            }
          });

        // 添加命令选项
        if (cmd.options) {
          for (const opt of cmd.options) {
            subCommand.option(opt.flag, opt.description, opt.default);
          }
        }

        // 添加命令别名
        if (cmd.aliases && cmd.aliases.length > 0) {
          subCommand.aliases(cmd.aliases);
        }

        // 添加使用示例
        if (cmd.examples && cmd.examples.length > 0) {
          const examples = cmd.examples.map(ex => `  ${ex}`).join('\n');
          subCommand.addHelpText('after', `\n示例:\n${examples}`);
        }

        // 将子命令添加到领域命令
        domainCommand.addCommand(subCommand);
      }

      // 将领域命令添加到主程序
      this.program.addCommand(domainCommand);
    }

    return this.program;
  }

  /**
   * 执行命令
   * @param domainName 领域名称
   * @param commandName 命令名称
   * @param args 命令参数
   * @param options 命令选项
   * @returns 执行结果的Promise
   */
  public async executeCommand(
    domainName: string,
    commandName: string,
    args: string | string[],
    options: Record<string, any>
  ): Promise<void> {
    // 获取命令
    const command = this.registry.getCommand(domainName, commandName);
    if (!command) {
      throw new Error(`在 '${domainName}' 领域中找不到命令 '${commandName}'`);
    }

    try {
      // 在详细模式下显示执行信息
      if (this.context.verbose) {
        console.log(chalk.cyan(`执行命令: ${domainName} ${commandName}`));
        console.log(chalk.cyan(`参数: ${Array.isArray(args) ? args.join(', ') : args}`));
        console.log(chalk.cyan(`选项: ${JSON.stringify(options)}`));
      }

      // 执行命令
      await command.execute(args, options, this.context);

      // 在详细模式下显示执行完成信息
      if (this.context.verbose) {
        console.log(chalk.green(`命令 '${domainName} ${commandName}' 执行成功`));
      }
    } catch (error: any) {
      // 包装错误以提供更多上下文
      const wrappedError = new Error(
        `执行命令 '${domainName} ${commandName}' 失败: ${error.message}`
      );
      wrappedError.stack = error.stack;
      throw wrappedError;
    }
  }

  /**
   * 处理命令执行错误
   * @param error 错误对象
   */
  public handleErrors(error: Error): void {
    // 如果在静默模式下，只显示错误消息
    if (this.context.quiet) {
      console.error(chalk.red(error.message));
      process.exit(1);
      return;
    }

    // 标准错误输出
    console.error(chalk.red(`错误: ${error.message}`));

    // 根据错误类型提供建议
    if (error.message.includes('找不到命令')) {
      // 命令不存在错误
      const match = error.message.match(/\'([^']+)\' 领域/);
      if (match) {
        const domainName = match[1];
        const commands = this.registry.getDomainCommands(domainName);
        if (commands.length > 0) {
          const commandNames = commands.map(cmd => cmd.name).join(', ');
          console.error(chalk.yellow(`提示: 在 '${domainName}' 领域中可用的命令: ${commandNames}`));
          console.error(chalk.yellow(`使用 'dpml ${domainName} --help' 查看详细帮助`));
        }
      }
    } else if (error.message.includes('找不到领域')) {
      // 领域不存在错误
      const domains = this.registry.getAllDomains();
      if (domains.length > 0) {
        console.error(chalk.yellow(`提示: 可用的领域: ${domains.join(', ')}`));
        console.error(chalk.yellow(`使用 'dpml --help' 查看所有可用领域`));
      } else {
        console.error(chalk.yellow(`提示: 没有可用的领域，请使用 'dpml --update' 更新命令映射`));
      }
    } else if (error.message.includes('映射文件')) {
      // 映射文件错误
      console.error(chalk.yellow(`提示: 使用 'dpml --update' 更新命令映射`));
    } else if (error.message.includes('参数')) {
      // 参数错误
      console.error(chalk.yellow(`提示: 请检查命令参数格式是否正确`));
      console.error(chalk.yellow(`使用 'dpml <领域> <命令> --help' 查看命令用法`));
    } else if (error.message.includes('执行命令')) {
      // 命令执行错误
      console.error(chalk.yellow(`提示: 命令执行过程中出现错误`));
    }

    // 在详细模式下显示堆栈信息
    if (this.context.verbose && error.stack) {
      console.error(chalk.gray('\n堆栈信息:'));
      console.error(chalk.gray(error.stack));
    } else {
      console.error(chalk.yellow(`使用 --verbose 选项查看详细错误信息`));
    }

    process.exit(1);
  }

  /**
   * 解析命令行参数
   * @param argv 命令行参数数组
   */
  public parseArguments(argv: string[]): void {
    // 解析命令参数
    this.program.parse(argv);

    // 获取全局选项
    const globalOptions = this.program.opts();

    // 设置执行上下文
    this.setContext({
      verbose: !!globalOptions.verbose,
      quiet: !!globalOptions.quiet,
      update: !!globalOptions.update
    });

    // 在详细模式下显示解析结果
    if (this.context.verbose) {
      console.log(chalk.cyan('命令行参数:'), argv);
      console.log(chalk.cyan('解析选项:'), globalOptions);
    }
  }

  /**
   * 设置执行上下文
   * @param context 上下文对象
   */
  public setContext(context: Partial<ExecutionContext>): void {
    // 合并上下文
    this.context = { ...this.context, ...context };

    // 处理冲突的选项
    if (this.context.verbose && this.context.quiet) {
      // verbose和quiet不能同时为true，优先使用verbose
      this.context.quiet = false;

      // 在详细模式下显示警告
      console.log(chalk.yellow('警告: --verbose和--quiet选项不能同时使用，将使用--verbose'));
    }
  }
}
