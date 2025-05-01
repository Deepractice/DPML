/**
 * 类型导出索引文件
 * 统一导出所有API相关类型
 */

export * from './DPMLNode';
export * from './DPMLDocument';
export * from './ParseOptions';
export * from './ParseError';
export * from './ParseResult';
export * from './Schema';
export * from './ProcessedSchema';
export * from './SchemaError';

// Processing types
export * from './ProcessingResult';
export * from './ProcessingContext';
export * from './ValidationResult';
export * from './ReferenceMap';
export * from './ProcessingError';
export * from './ProcessingWarning';

// Transformer types
export * from './Transformer';
export * from './TransformContext';
export * from './TransformResult';
export * from './TransformOptions';
export * from './MappingRule';
export * from './CollectorConfig';
export * from './RelationConfig';
export * from './SemanticExtractor';

// Framework types
export * from './DomainCompiler';
export * from './DomainConfig';
export * from './DomainAction';
export * from './DomainDPML';
export * from './CompileOptions';
export * from './FrameworkError';

export * from './TransformerDefiner';

// 日志类型
export * from './log';

// CLI类型
export type {
  CLI,
  CLIOptions,
  CommandDefinition,
  ArgumentDefinition,
  OptionDefinition,
  CommandAction
} from './CLI';

// 错误类型
export {
  DuplicateCommandError,
  InvalidCommandError,
  CommandExecutionError
} from './CLIErrors';
