# @dpml/core

Core library for DPML (Deepractice Prompt Markup Language). Provides parsing, validation, and transformation capabilities.

> **Note:** This is an internal package. For public API, use the [`dpml`](../dpml) package instead.

## Installation

```bash
npm install @dpml/core
```

## Overview

@dpml/core provides the foundational components for DPML:

- **Parser** - Parses DPML XML content into a document object model
- **Schema** - Validates schemas and processes schema definitions
- **Processing** - Validates documents against schemas
- **Transformer** - Transforms processed documents into target formats

## Core APIs

### Parsing

```typescript
import { parse } from '@dpml/core';

const document = parse('<prompt>Hello World</prompt>');
console.log(document.rootNode.tagName); // 'prompt'
console.log(document.rootNode.content); // 'Hello World'
```

### Schema Processing

```typescript
import { processSchema } from '@dpml/core';

const schema = {
  root: {
    element: 'prompt',
    attributes: [{ name: 'role', required: true }],
  },
};

const processedSchema = processSchema(schema);
console.log(processedSchema.isValid); // true
```

### Document Processing

```typescript
import { parse, processSchema, processDocument } from '@dpml/core';

const document = parse('<prompt role="assistant">Hello</prompt>');
const schema = processSchema({ root: { element: 'prompt' } });
const result = processDocument(document, schema);

console.log(result.isValid); // true
console.log(result.validation.errors); // []
```

### Transformation

```typescript
import { transform, registerTransformer } from '@dpml/core';

// Register a custom transformer
registerTransformer({
  name: 'my-transformer',
  transform: (input, context) => {
    return {
      content: context.getDocument().rootNode.content,
    };
  },
});

// Transform processed result
const output = transform(processingResult);
```

## Types

```typescript
import type {
  // Document types
  DPMLDocument,
  DPMLNode,

  // Schema types
  Schema,
  ElementSchema,
  DocumentSchema,
  AttributeSchema,
  ProcessedSchema,

  // Processing types
  ProcessingResult,
  ValidationResult,

  // Transformer types
  Transformer,
  TransformContext,
  TransformResult,
} from '@dpml/core';
```

## Architecture

```
@dpml/core/
├── api/           # Public API layer
│   ├── parser.ts      - parse, parseAsync
│   ├── schema.ts      - processSchema
│   ├── processing.ts  - processDocument
│   └── transformer.ts - transform, registerTransformer
│
├── core/          # Core implementations
│   ├── parsing/       - XML parser
│   ├── schema/        - Schema validation
│   ├── processing/    - Document validation
│   └── transformer/   - Transformation engine
│
└── types/         # Type definitions
```

## License

MIT
