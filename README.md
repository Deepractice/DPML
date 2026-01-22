# DPML (Deepractice Prompt Markup Language)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/Deepractice/dpml/actions/workflows/ci.yml/badge.svg)](https://github.com/Deepractice/dpml/actions/workflows/ci.yml)

> A markup language for structured AI prompt engineering

## Overview

DPML is a declarative markup language designed for defining structured prompts and AI configurations. It provides a standardized way to describe AI behaviors using familiar XML-like syntax.

```xml
<prompt role="assistant">
  <context>You are a helpful travel planner</context>
  <instruction>Help users plan their trips</instruction>
</prompt>
```

## Features

- **Declarative Syntax** - Define AI prompts using intuitive XML-like markup
- **Schema Validation** - Validate documents against customizable schemas
- **Extensible** - Create custom transformers to convert DPML to any target format
- **Type Safe** - Full TypeScript support with comprehensive type definitions

## Installation

```bash
# npm
npm install dpml

# bun
bun add dpml
```

## Quick Start

```typescript
import { createDPML, defineSchema, defineTransformer } from 'dpml';

// 1. Define a schema
const schema = defineSchema({
  element: 'prompt',
  attributes: [
    { name: 'role', required: true }
  ],
  children: {
    elements: [
      { element: 'context' },
      { element: 'instruction' }
    ]
  }
});

// 2. Define a transformer
const transformer = defineTransformer({
  name: 'prompt-transformer',
  transform: (input) => {
    const doc = input.document;
    return {
      role: doc.rootNode.attributes.get('role'),
      context: doc.rootNode.children[0]?.content,
      instruction: doc.rootNode.children[1]?.content
    };
  }
});

// 3. Create DPML instance
const dpml = createDPML({
  schema,
  transformers: [transformer]
});

// 4. Compile DPML content
const result = await dpml.compile(`
  <prompt role="assistant">
    <context>You are a helpful assistant</context>
    <instruction>Answer questions clearly</instruction>
  </prompt>
`);

console.log(result);
// { role: 'assistant', context: '...', instruction: '...' }
```

## API Reference

### `createDPML(config)`

Creates a DPML instance with the specified configuration.

```typescript
const dpml = createDPML({
  schema: Schema,
  transformers: Transformer[]
});
```

**Methods:**
- `compile<T>(content: string): Promise<T>` - Parse, validate, and transform DPML content
- `parse(content: string): DPMLDocument` - Parse DPML content into a document
- `validate(content: string): ValidationResult` - Validate content against schema

### `defineSchema(definition)`

Defines a schema for validating DPML documents.

```typescript
const schema = defineSchema({
  element: 'prompt',           // Root element name
  attributes: [...],           // Attribute definitions
  children: { elements: [...] }, // Child element definitions
  content: { type: 'text' }    // Content constraints
});
```

### `defineTransformer(definition)`

Defines a transformer for converting processed documents.

```typescript
const transformer = defineTransformer({
  name: 'my-transformer',
  description: 'Optional description',
  transform: (input, context) => {
    // Transform logic
    return result;
  }
});
```

## Packages

| Package | Description |
|---------|-------------|
| [`dpml`](./packages/dpml) | Main package - public API |
| [`@dpml/core`](./packages/core) | Core library - parsing, validation, transformation |

## Development

### Prerequisites

- [Bun](https://bun.sh/) >= 1.3.0
- Node.js >= 22.0.0

### Setup

```bash
# Clone repository
git clone https://github.com/Deepractice/dpml.git
cd dpml

# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun run test
bun run test:bdd
```

### Project Structure

```
dpml/
├── packages/
│   ├── core/          # Core library
│   └── dpml/          # Public API package
├── bdd/               # BDD tests
│   ├── features/      # Gherkin feature files
│   └── steps/         # Step definitions
└── specs/             # Language specification
```

## Specification

See the [DPML Language Specification](./specs/README.md) for detailed syntax and semantics documentation.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT © [Deepractice](https://github.com/Deepractice)
